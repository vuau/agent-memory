/**
 * Core constants and types shared across all entry points.
 */

export const AGENTS_DIR = ".agents"
export const SPEC_DIR = ".agents/spec"
export const MEMORY_FILE = ".agents/MEMORY.md"
export const TASKS_FILE = ".agents/TASKS.md"
export const AGENTS_MD = "AGENTS.md"
export const COPILOT_INSTRUCTIONS = ".github/copilot-instructions.md"

export interface AgentMemoryConfig {
  /** Project name used in templates */
  projectName?: string
  /** Custom spec categories to scaffold */
  specFiles?: string[]
  /** Whether to create .github/copilot-instructions.md */
  copilotInstructions?: boolean
}

export interface DoctorResult {
  ok: boolean
  issues: DoctorIssue[]
}

export interface DoctorIssue {
  level: "error" | "warning" | "info"
  file: string
  message: string
}
