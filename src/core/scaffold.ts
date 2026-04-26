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
  MEMORY_DETAIL_FILE,
  TASKS_FILE,
  AGENTS_MD,
} from "./types.ts"

// ─────────────────────────────────────────────────────────────
// Template resolution
// ─────────────────────────────────────────────────────────────

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

function readTemplate(name: string): string {
  const templatePath = join(TEMPLATES_DIR, name)
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`)
  }
  return readFileSync(templatePath, "utf-8")
}

function applyVars(content: string, vars: Record<string, string>): string {
  let result = content
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value)
  }
  return result
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ScaffoldOptions {
  projectName?: string
  force?: boolean
}

export interface ScaffoldResult {
  created: string[]
  skipped: string[]
}

// ─────────────────────────────────────────────────────────────
// Main scaffold function
// ─────────────────────────────────────────────────────────────

export function scaffold(projectDir: string, options: ScaffoldOptions = {}): ScaffoldResult {
  const result: ScaffoldResult = { created: [], skipped: [] }
  const projectName = options.projectName || guessProjectName(projectDir)
  const vars = { PROJECT_NAME: projectName }
  const force = options.force || false

  // ─────────────────────────────────────────────────────────────
  // Create directories
  // ─────────────────────────────────────────────────────────────
  
  const dirs = [
    join(projectDir, AGENTS_DIR),
    join(projectDir, SPEC_DIR),
  ]
  
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Core memory files (always created)
  // ─────────────────────────────────────────────────────────────
  
  const coreFiles: Array<{ target: string; template: string }> = [
    { target: MEMORY_FILE, template: "MEMORY.md" },
    { target: MEMORY_DETAIL_FILE, template: "MEMORY-DETAIL.md" },
    { target: TASKS_FILE, template: "TASKS.md" },
  ]

  for (const { target, template } of coreFiles) {
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

  // ─────────────────────────────────────────────────────────────
  // Router file (AGENTS.md)
  // ─────────────────────────────────────────────────────────────

  writeFileIfNeeded(
    join(projectDir, AGENTS_MD),
    applyVars(readTemplate("AGENTS.md"), vars),
    AGENTS_MD,
    result,
    force
  )

  return result
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function writeFileIfNeeded(
  targetPath: string,
  content: string,
  displayName: string,
  result: ScaffoldResult,
  force: boolean
): void {
  if (existsSync(targetPath) && !force) {
    result.skipped.push(displayName)
    return
  }
  writeFileSync(targetPath, content)
  result.created.push(displayName)
}

function guessProjectName(dir: string): string {
  const pkgPath = join(dir, "package.json")
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
      if (pkg.name) return pkg.name
    } catch {}
  }
  return dir.split("/").pop() || "Project"
}
