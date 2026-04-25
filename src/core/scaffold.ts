/**
 * Scaffold — create .agents/ directory structure in a project.
 *
 * Idempotent: skips existing files unless force=true.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs"
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

// Resolve templates dir relative to this file (works in both Bun and Node)
function getTemplatesDir(): string {
  // Try import.meta based resolution
  try {
    const thisDir = dirname(fileURLToPath(import.meta.url))
    const candidate = resolve(thisDir, "../../templates")
    if (existsSync(candidate)) return candidate
  } catch {}
  // Fallback: walk up from __dirname if available
  const candidate2 = resolve(__dirname, "../../templates")
  if (existsSync(candidate2)) return candidate2
  throw new Error("Cannot locate templates directory")
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

  return result
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
