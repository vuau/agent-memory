/**
 * Tasks — read/update operations for TASKS.md
 */

import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { TASKS_FILE } from "./types.ts"

export type TaskStatus = "in_progress" | "up_next" | "completed"

export interface TaskItem {
  content: string
  status: TaskStatus
}

/**
 * Read tasks grouped by status section.
 */
export function readTasks(projectDir: string): Record<TaskStatus, string[]> {
  const filePath = join(projectDir, TASKS_FILE)
  const result: Record<TaskStatus, string[]> = {
    in_progress: [],
    up_next: [],
    completed: [],
  }

  if (!existsSync(filePath)) return result

  const content = readFileSync(filePath, "utf-8")
  let currentSection: TaskStatus | null = null

  for (const line of content.split("\n")) {
    if (line.startsWith("## In Progress")) {
      currentSection = "in_progress"
      continue
    }
    if (line.startsWith("## Up Next")) {
      currentSection = "up_next"
      continue
    }
    if (line.startsWith("## Completed")) {
      currentSection = "completed"
      continue
    }
    if (currentSection && line.startsWith("- ")) {
      result[currentSection].push(line.slice(2))
    }
  }

  return result
}

/**
 * Write tasks back to TASKS.md, preserving header structure.
 */
export function writeTasks(
  projectDir: string,
  tasks: Record<TaskStatus, string[]>
): void {
  const filePath = join(projectDir, TASKS_FILE)
  const content = `# Current Tasks

Working memory for cross-session continuity. Update before ending a session.

---

## In Progress
${tasks.in_progress.map((t) => `- ${t}`).join("\n") || ""}

## Up Next
${tasks.up_next.map((t) => `- ${t}`).join("\n") || ""}

## Completed
${tasks.completed.map((t) => `- ${t}`).join("\n") || ""}
`
  writeFileSync(filePath, content)
}
