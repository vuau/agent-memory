/**
 * Scaffold — create .agents/ directory structure in a project.
 *
 * Idempotent: skips existing files unless force=true.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, appendFileSync } from "fs"
import { join, resolve, dirname } from "path"
import { fileURLToPath } from "url"
import {
  AGENTS_DIR,
  SPEC_DIR,
  MEMORY_FILE,
  TASKS_FILE,
  AGENTS_MD,
  COPILOT_INSTRUCTIONS,
  type AgentMemoryConfig,
} from "./types.ts"

// Resolve templates dir relative to this file (works in both Bun and Node ESM)
function getTemplatesDir(): string {
  const thisDir = dirname(fileURLToPath(import.meta.url))
  
  // When running from source: src/core/scaffold.ts → ../../templates
  const fromSource = resolve(thisDir, "../../templates")
  if (existsSync(fromSource)) return fromSource
  
  // When running from dist: dist/index.js → ../templates
  const fromDist = resolve(thisDir, "../templates")
  if (existsSync(fromDist)) return fromDist
  
  throw new Error(`Cannot locate templates directory (checked ${fromSource} and ${fromDist})`)
}

const TEMPLATES_DIR = getTemplatesDir()

export interface ScaffoldResult {
  created: string[]
  skipped: string[]
}

function readTemplate(name: string): string {
  const templatePath = join(TEMPLATES_DIR, name)
  return readFileSync(templatePath, "utf-8")
}

function applyVars(content: string, vars: Record<string, string>): string {
  let result = content
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value)
  }
  return result
}

export function scaffold(
  projectDir: string,
  config: AgentMemoryConfig = {},
  force = false
): ScaffoldResult {
  const result: ScaffoldResult = { created: [], skipped: [] }
  const projectName = config.projectName || guessProjectName(projectDir)
  const vars = { PROJECT_NAME: projectName }

  // Ensure directories exist
  const dirs = [
    join(projectDir, AGENTS_DIR),
    join(projectDir, SPEC_DIR),
  ]
  if (config.copilotInstructions !== false) {
    dirs.push(join(projectDir, ".github"))
  }
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }

  // Files to scaffold
  const files: Array<{ target: string; template: string }> = [
    { target: AGENTS_MD, template: "AGENTS.md" },
    { target: MEMORY_FILE, template: "MEMORY.md" },
    { target: TASKS_FILE, template: "TASKS.md" },
  ]

  if (config.copilotInstructions !== false) {
    files.push({
      target: COPILOT_INSTRUCTIONS,
      template: "copilot-instructions.md",
    })
  }

  // Write files
  for (const { target, template } of files) {
    const targetPath = join(projectDir, target)
    if (existsSync(targetPath) && !force) {
      result.skipped.push(target)
      continue
    }
    const content = applyVars(readTemplate(template), vars)
    writeFileSync(targetPath, content)
    result.created.push(target)
  }

  // Create .gitkeep in spec/ if empty
  const specKeep = join(projectDir, SPEC_DIR, ".gitkeep")
  if (!existsSync(specKeep)) {
    writeFileSync(specKeep, "")
    result.created.push(`${SPEC_DIR}/.gitkeep`)
  }

  // Wire up OpenCode plugin if requested
  if (config.opencode) {
    scaffoldOpenCode(projectDir, result, force)
  }

  return result
}

function scaffoldOpenCode(projectDir: string, result: ScaffoldResult, force: boolean): void {
  const PACKAGE_NAME = "@vuau/agent-memory"

  // .opencode/package.json — create or merge dependency
  const opencodePkgPath = join(projectDir, ".opencode", "package.json")
  const opencodeDir = join(projectDir, ".opencode")
  if (!existsSync(opencodeDir)) {
    mkdirSync(opencodeDir, { recursive: true })
  }

  if (!existsSync(opencodePkgPath)) {
    writeFileSync(
      opencodePkgPath,
      JSON.stringify({ dependencies: { [PACKAGE_NAME]: "latest" } }, null, 2) + "\n"
    )
    result.created.push(".opencode/package.json")
  } else {
    const pkg = JSON.parse(readFileSync(opencodePkgPath, "utf-8"))
    const deps = pkg.dependencies || {}
    if (!deps[PACKAGE_NAME] || force) {
      deps[PACKAGE_NAME] = "latest"
      pkg.dependencies = deps
      writeFileSync(opencodePkgPath, JSON.stringify(pkg, null, 2) + "\n")
      if (!deps[PACKAGE_NAME]) {
        result.created.push(".opencode/package.json")
      }
    } else {
      result.skipped.push(".opencode/package.json")
    }
  }

  // opencode.json — create or merge plugin array
  const opencodeJsonPath = join(projectDir, "opencode.json")
  if (!existsSync(opencodeJsonPath)) {
    writeFileSync(
      opencodeJsonPath,
      JSON.stringify({ plugin: [PACKAGE_NAME] }, null, 2) + "\n"
    )
    result.created.push("opencode.json")
  } else {
    const config = JSON.parse(readFileSync(opencodeJsonPath, "utf-8"))
    const plugins: string[] = config.plugin || []
    if (!plugins.includes(PACKAGE_NAME)) {
      config.plugin = [...plugins, PACKAGE_NAME]
      writeFileSync(opencodeJsonPath, JSON.stringify(config, null, 2) + "\n")
      result.created.push("opencode.json (merged plugin)")
    } else {
      result.skipped.push("opencode.json")
    }
  }
}

function guessProjectName(dir: string): string {
  // Try package.json
  const pkgPath = join(dir, "package.json")
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
      if (pkg.name) return pkg.name
    } catch {}
  }
  // Fallback to directory name
  return dir.split("/").pop() || "Project"
}
