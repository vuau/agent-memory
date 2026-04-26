/**
 * Doctor — validate .agents/ structure integrity.
 */

import { existsSync, readFileSync } from "fs"
import { join } from "path"
import {
  AGENTS_DIR,
  SPEC_DIR,
  MEMORY_FILE,
  TASKS_FILE,
  AGENTS_MD,
  CUSTOM_FILE,
  type DoctorResult,
  type DoctorIssue,
} from "./types.js"

export function doctor(projectDir: string): DoctorResult {
  const issues: DoctorIssue[] = []

  // Check required files
  const required = [
    { file: AGENTS_MD, desc: "Root router file" },
    { file: CUSTOM_FILE, desc: "Project specific rules" },
    { file: MEMORY_FILE, desc: "Long-term memory" },
    { file: TASKS_FILE, desc: "Working memory" },
  ]

  for (const { file, desc } of required) {
    const filePath = join(projectDir, file)
    if (!existsSync(filePath)) {
      issues.push({ level: "error", file, message: `Missing ${desc}` })
    }
  }

  // Check directories
  for (const dir of [AGENTS_DIR, SPEC_DIR]) {
    if (!existsSync(join(projectDir, dir))) {
      issues.push({ level: "error", file: dir, message: "Directory missing" })
    }
  }

  // Validate AGENTS.md has documentation map
  const agentsPath = join(projectDir, AGENTS_MD)
  if (existsSync(agentsPath)) {
    const content = readFileSync(agentsPath, "utf-8")
    if (!content.includes(".agents/")) {
      issues.push({
        level: "warning",
        file: AGENTS_MD,
        message: "No references to .agents/ — agents may not find memory files",
      })
    }
    if (content.split("\n").length > 150) {
      issues.push({
        level: "warning",
        file: AGENTS_MD,
        message: "Over 150 lines — consider keeping it concise as a router",
      })
    }
  }

  // Validate MEMORY.md line count
  const memoryPath = join(projectDir, MEMORY_FILE)
  if (existsSync(memoryPath)) {
    const lines = readFileSync(memoryPath, "utf-8").split("\n").length
    if (lines > 150) {
      issues.push({
        level: "warning",
        file: MEMORY_FILE,
        message: `${lines} lines — consider compressing or archiving old entries`,
      })
    }
  }

  return { ok: issues.filter((i) => i.level === "error").length === 0, issues }
}
