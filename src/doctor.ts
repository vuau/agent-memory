/**
 * Doctor — validate .agents/ structure integrity.
 */

import { existsSync, readFileSync, lstatSync } from "fs"
import { join } from "path"
import { platform } from "os"
import {
  AGENTS_DIR,
  SPEC_DIR,
  MEMORY_FILE,
  TASKS_FILE,
  AGENTS_MD,
  CLAUDE_MD,
  CUSTOM_FILE,
  type DoctorResult,
  type DoctorIssue,
} from "./types.js"

export function doctor(projectDir: string): DoctorResult {
  const issues: DoctorIssue[] = []

  // Check required files
  const required = [
    { file: AGENTS_MD, desc: "Root router file (OpenCode)" },
    { file: CLAUDE_MD, desc: "Root router file (Claude Code)" },
    { file: CUSTOM_FILE, desc: "Project specific rules" },
    { file: MEMORY_FILE, desc: "Long-term memory" },
    { file: TASKS_FILE, desc: "Working memory" },
    { file: `${SPEC_DIR}/coding-principles.md`, desc: "Coding principles (run `agent-memory update` to create)" },
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

  // Validate router files have documentation map
  const routerFiles = [AGENTS_MD, CLAUDE_MD]
  for (const rf of routerFiles) {
    const rfPath = join(projectDir, rf)
    if (existsSync(rfPath)) {
      // Check symlink status for CLAUDE.md on non-Windows
      if (rf === CLAUDE_MD && platform() !== "win32") {
        try {
          if (!lstatSync(rfPath).isSymbolicLink()) {
            issues.push({
              level: "warning",
              file: CLAUDE_MD,
              message: "Plain file — should be a symlink to AGENTS.md. Run 'agent-memory update' to fix",
            })
          }
        } catch {}
      }

      const content = readFileSync(rfPath, "utf-8")
      if (!content.includes(".agents/")) {
        issues.push({
          level: "warning",
          file: rf,
          message: "No references to .agents/ — agents may not find memory files",
        })
      }
      if (content.split("\n").length > 150) {
        issues.push({
          level: "warning",
          file: rf,
          message: "Over 150 lines — consider keeping it concise as a router",
        })
      }
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
