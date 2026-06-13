/**
 * Scaffold — create .agents/ directory structure in a project.
 *
 * Idempotent: skips existing files unless force=true.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, symlinkSync, lstatSync, unlinkSync } from "fs"
import { join, resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { platform } from "os"
import {
  AGENTS_DIR,
  SPEC_DIR,
  MEMORY_FILE,
  MEMORY_DETAIL_FILE,
  TASKS_FILE,
  AGENTS_MD,
  CLAUDE_MD,
  CUSTOM_FILE,
} from "./types.js"

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
    { target: CUSTOM_FILE, template: "CUSTOM.md" },
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

  // ─────────────────────────────────────────────────────────────
  // Managed spec files (always written/updated)
  // ─────────────────────────────────────────────────────────────

  const managedSpecs: Array<{ target: string; template: string }> = [
    { target: `${SPEC_DIR}/coding-principles.md`, template: "spec/coding-principles.md" },
  ]

  for (const { target, template } of managedSpecs) {
    const targetPath = join(projectDir, target)
    const content = applyVars(readTemplate(template), vars)
    writeFileSync(targetPath, content)
    result.created.push(target)
  }

  // Create .gitkeep in spec/ if empty (skip if spec already has files)
  const specKeep = join(projectDir, SPEC_DIR, ".gitkeep")
  if (!existsSync(specKeep) && !managedSpecs.length) {
    writeFileSync(specKeep, "")
    result.created.push(`${SPEC_DIR}/.gitkeep`)
  }

  // ─────────────────────────────────────────────────────────────
  // Router files (AGENTS.md + CLAUDE.md)
  // ─────────────────────────────────────────────────────────────

  // AGENTS.md — plain file from template
  writeFileIfNeeded(
    join(projectDir, AGENTS_MD),
    applyVars(readTemplate("AGENTS.md"), vars),
    AGENTS_MD,
    result,
    force
  )

  // CLAUDE.md — OS-dependent: symlink on macOS/Linux, hook file on Windows
  writeClaudeMd(projectDir, vars, result, force)

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

// ─────────────────────────────────────────────────────────────
// Update Router
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// CLAUDE.md: OS-aware write logic
// ─────────────────────────────────────────────────────────────

const IS_WIN = platform() === "win32"

function writeClaudeMd(
  projectDir: string,
  vars: Record<string, string>,
  result: ScaffoldResult,
  force: boolean
): void {
  const targetPath = join(projectDir, CLAUDE_MD)

  if (IS_WIN) {
    // Windows: hook file referencing AGENTS.md
    writeFileIfNeeded(
      targetPath,
      applyVars(readTemplate("CLAUDE.md"), vars),
      CLAUDE_MD,
      result,
      force
    )
    return
  }

  // macOS / Linux: symlink → AGENTS.md
  const linkTarget = AGENTS_MD  // relative symlink

  if (existsSync(targetPath)) {
    if (!force) {
      result.skipped.push(CLAUDE_MD)
      return
    }
    // Remove existing file/symlink before recreating
    unlinkSync(targetPath)
  }

  try {
    symlinkSync(linkTarget, targetPath)
    result.created.push(`${CLAUDE_MD} → ${AGENTS_MD}`)
  } catch (err) {
    // Fallback: write hook file if symlink fails (e.g. permission, unsupported FS)
    writeFileSync(targetPath, applyVars(readTemplate("CLAUDE.md"), vars))
    result.created.push(`${CLAUDE_MD} (symlink failed, wrote file)`)
  }
}

// ─────────────────────────────────────────────────────────────
// Update Router
// ─────────────────────────────────────────────────────────────

export function updateRouter(projectDir: string): boolean {
  const projectName = guessProjectName(projectDir)
  const vars = { PROJECT_NAME: projectName }

  // AGENTS.md — always rewrite from template
  const agentsPath = join(projectDir, AGENTS_MD)
  if (!existsSync(agentsPath)) return false
  writeFileSync(agentsPath, applyVars(readTemplate("AGENTS.md"), vars))

  // CLAUDE.md — ensure it exists in correct form
  const claudePath = join(projectDir, CLAUDE_MD)

  if (IS_WIN) {
    writeFileSync(claudePath, applyVars(readTemplate("CLAUDE.md"), vars))
  } else {
    // macOS / Linux: ensure symlink exists
    let needsRecreate = false

    if (!existsSync(claudePath)) {
      needsRecreate = true
    } else {
      try {
        const stat = lstatSync(claudePath)
        if (!stat.isSymbolicLink()) {
          // Was a plain file (e.g. from old version), replace with symlink
          needsRecreate = true
        }
      } catch {
        needsRecreate = true
      }
    }

    if (needsRecreate) {
      try {
        if (existsSync(claudePath)) unlinkSync(claudePath)
        symlinkSync(AGENTS_MD, claudePath)
      } catch {
        // Fallback
        writeFileSync(claudePath, applyVars(readTemplate("CLAUDE.md"), vars))
      }
    }
  }

  // Update managed spec files
  const managedSpecs = [
    { target: `${SPEC_DIR}/coding-principles.md`, template: "spec/coding-principles.md" },
  ]
  for (const { target, template } of managedSpecs) {
    const specPath = join(projectDir, target)
    const specDir = dirname(specPath)
    if (!existsSync(specDir)) mkdirSync(specDir, { recursive: true })
    writeFileSync(specPath, applyVars(readTemplate(template), vars))
  }

  return true
}
