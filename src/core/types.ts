/**
 * Core constants and types shared across all entry points.
 */

// ─────────────────────────────────────────────────────────────
// File paths
// ─────────────────────────────────────────────────────────────

export const AGENTS_DIR = ".agents"
export const SPEC_DIR = ".agents/spec"
export const MEMORY_FILE = ".agents/MEMORY.md"
export const TASKS_FILE = ".agents/TASKS.md"

// IDE-specific config files
export const AGENTS_MD = "AGENTS.md"                              // OpenCode
export const COPILOT_INSTRUCTIONS = ".github/copilot-instructions.md"  // GitHub Copilot
export const CURSOR_RULES = ".cursorrules"                        // Cursor
export const WINDSURF_RULES = ".windsurfrules"                    // Windsurf

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface DoctorResult {
  ok: boolean
  issues: DoctorIssue[]
}

export interface DoctorIssue {
  level: "error" | "warning" | "info"
  file: string
  message: string
}
