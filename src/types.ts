/**
 * Core constants and types shared across all entry points.
 */

// ─────────────────────────────────────────────────────────────
// File paths
// ─────────────────────────────────────────────────────────────

export const AGENTS_DIR = ".agents"
export const SPEC_DIR = ".agents/spec"
export const MEMORY_FILE = ".agents/MEMORY.md"
export const MEMORY_DETAIL_FILE = ".agents/MEMORY-DETAIL.md"
export const TASKS_FILE = ".agents/TASKS.md"
export const CUSTOM_FILE = ".agents/CUSTOM.md"

// Router config file
export const AGENTS_MD = "AGENTS.md"

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
