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
  COPILOT_INSTRUCTIONS,
  type DoctorResult,
  type DoctorIssue,
} from "./types.ts"

export function doctor(projectDir: string): DoctorResult {
  const issues: DoctorIssue[] = []

  // Check required files
  const required = [
    { file: AGENTS_MD, desc: "Root router file" },
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

  // Check optional files
  const copilotPath = join(projectDir, COPILOT_INSTRUCTIONS)
  if (!existsSync(copilotPath)) {
    issues.push({
      level: "warning",
      file: COPILOT_INSTRUCTIONS,
      message: "Copilot instructions missing — VSCode/GitHub Copilot won't have context",
    })
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

  // Check OpenCode wiring (only if .opencode/ directory exists)
  const opencodePkgPath = join(projectDir, ".opencode", "package.json")
  const opencodeJsonPath = join(projectDir, "opencode.json")
  const opencodeExists = existsSync(join(projectDir, ".opencode"))

  if (opencodeExists) {
    if (!existsSync(opencodePkgPath)) {
      issues.push({
        level: "warning",
        file: ".opencode/package.json",
        message: "Missing — run 'agent-memory init --opencode' to wire up the plugin",
      })
    } else {
      try {
        const pkg = JSON.parse(readFileSync(opencodePkgPath, "utf-8"))
        const deps = { ...pkg.dependencies, ...pkg.devDependencies }
        if (!deps["@vuau/agent-memory"]) {
          issues.push({
            level: "warning",
            file: ".opencode/package.json",
            message: "@vuau/agent-memory not in dependencies — run 'agent-memory init --opencode'",
          })
        }
      } catch {
        issues.push({ level: "warning", file: ".opencode/package.json", message: "Invalid JSON" })
      }
    }

    if (!existsSync(opencodeJsonPath)) {
      issues.push({
        level: "warning",
        file: "opencode.json",
        message: "Missing — run 'agent-memory init --opencode' to wire up the plugin",
      })
    } else {
      try {
        const config = JSON.parse(readFileSync(opencodeJsonPath, "utf-8"))
        const plugins: string[] = config.plugin || []
        if (!plugins.includes("@vuau/agent-memory")) {
          issues.push({
            level: "warning",
            file: "opencode.json",
            message: "@vuau/agent-memory not in plugin array — run 'agent-memory init --opencode'",
          })
        }
      } catch {
        issues.push({ level: "warning", file: "opencode.json", message: "Invalid JSON" })
      }
    }
  }

  return { ok: issues.filter((i) => i.level === "error").length === 0, issues }
}
