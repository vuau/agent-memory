/**
 * OpenCode Plugin — Memory Lifecycle
 *
 * Hooks into session events to manage .agents/ structure:
 * - session.created → auto-scaffold if missing, log status
 * - session.idle → remind to update TASKS.md
 * - tool.execute.after → track file edits
 */

import type { Plugin } from "@opencode-ai/plugin"
import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { scaffold } from "../core/scaffold.ts"
import { MEMORY_FILE, TASKS_FILE, AGENTS_MD, SPEC_DIR } from "../core/types.ts"

export const MemoryLifecyclePlugin: Plugin = async ({ client, directory }) => {
  const memoryFile = resolve(directory, MEMORY_FILE)
  const tasksFile = resolve(directory, TASKS_FILE)
  const agentsFile = resolve(directory, AGENTS_MD)

  let editCount = 0
  let specFilesEdited: string[] = []

  return {
    event: async ({ event }) => {
      if (event.type === "session.created") {
        // Auto-scaffold .agents/ if AGENTS.md exists but .agents/ doesn't
        const hasAgentsMd = existsSync(agentsFile)
        const hasMemory = existsSync(memoryFile)

        if (!hasMemory && hasAgentsMd) {
          // Project has AGENTS.md but no .agents/ — scaffold memory files only
          try {
            const result = scaffold(directory, { copilotInstructions: false })
            if (result.created.length > 0) {
              await client.tui.showToast({
                body: {
                  message: `Agent memory initialized: ${result.created.join(", ")}`,
                  variant: "success",
                },
              })
            }
          } catch (err) {
            await client.app.log({
              body: {
                service: "agent-memory",
                level: "warn",
                message: `Auto-scaffold failed: ${err}`,
              },
            })
          }
        }

        // Reset session counters
        editCount = 0
        specFilesEdited = []

        await client.app.log({
          body: {
            service: "agent-memory",
            level: "info",
            message: `Memory: ${hasMemory}, Tasks: ${existsSync(tasksFile)}`,
          },
        })
      }

      // Remind about TASKS.md on session idle if significant work was done
      if (event.type === "session.idle" && editCount >= 3) {
        if (existsSync(tasksFile)) {
          const content = readFileSync(tasksFile, "utf-8")
          const inProgressSection = content.split("## In Progress")[1]
          if (inProgressSection?.trim()) {
            await client.tui.showToast({
              body: {
                message: `${editCount} edits this session. Update .agents/TASKS.md before ending.`,
                variant: "info",
              },
            })
          }
        }
      }
    },

    "tool.execute.after": async (input) => {
      if (input.tool === "edit" || input.tool === "write") {
        editCount++
        const filePath = (input as any).args?.filePath || ""
        if (filePath.includes(SPEC_DIR)) {
          const shortPath = filePath.split(SPEC_DIR + "/").pop() || filePath
          if (!specFilesEdited.includes(shortPath)) {
            specFilesEdited.push(shortPath)
          }
        }
      }
    },
  }
}
