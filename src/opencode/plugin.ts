/**
 * OpenCode Plugin — Memory Lifecycle
 *
 * Hooks into session events to manage .agents/ structure:
 * - session.created → auto-scaffold if missing, log status
 * - session.idle → remind to update TASKS.md after significant edits
 * - tool.execute.after → track file edits for session summary
 *
 * @see https://opencode.ai/docs/plugins
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

  // Session-scoped counters
  let editCount = 0
  let specFilesEdited: string[] = []
  let sessionStartTime: number | null = null

  // Helper: safely show toast (graceful fallback if TUI unavailable)
  const showToast = async (message: string, variant: "info" | "success" | "warning" | "error" = "info") => {
    try {
      await client.tui.showToast({
        body: { message, variant },
      })
    } catch {
      // TUI may not be available in headless/CI mode — log instead
      await log("info", message)
    }
  }

  // Helper: structured logging
  const log = async (level: "debug" | "info" | "warn" | "error", message: string, extra?: Record<string, unknown>) => {
    try {
      await client.app.log({
        body: {
          service: "agent-memory",
          level,
          message,
          extra,
        },
      })
    } catch {
      // Logging failed — silent fail
    }
  }

  return {
    event: async ({ event }) => {
      // ─────────────────────────────────────────────────────────────
      // SESSION CREATED
      // ─────────────────────────────────────────────────────────────
      if (event.type === "session.created") {
        sessionStartTime = Date.now()
        editCount = 0
        specFilesEdited = []

        const hasAgentsMd = existsSync(agentsFile)
        const hasMemory = existsSync(memoryFile)
        const hasTasks = existsSync(tasksFile)

        // Auto-scaffold .agents/ if AGENTS.md exists but .agents/ doesn't
        if (!hasMemory && hasAgentsMd) {
          try {
            const result = scaffold(directory, { copilotInstructions: false })
            if (result.created.length > 0) {
              await showToast(`Agent memory initialized: ${result.created.join(", ")}`, "success")
              await log("info", "Auto-scaffolded .agents/ structure", { created: result.created })
            }
          } catch (err) {
            await log("warn", `Auto-scaffold failed: ${err}`)
          }
        }

        await log("debug", "Session started", {
          hasAgentsMd,
          hasMemory,
          hasTasks,
          directory,
        })
      }

      // ─────────────────────────────────────────────────────────────
      // SESSION IDLE (after response complete)
      // ─────────────────────────────────────────────────────────────
      if (event.type === "session.idle") {
        // Only remind if significant work was done (3+ edits)
        if (editCount >= 3 && existsSync(tasksFile)) {
          const sessionDuration = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000 / 60) : 0

          await showToast(
            `${editCount} file edits (${sessionDuration}m). Consider updating .agents/TASKS.md`,
            "info"
          )

          await log("info", "Session idle with significant edits", {
            editCount,
            specFilesEdited,
            sessionDurationMinutes: sessionDuration,
          })
        }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // TOOL EXECUTE AFTER — track edits
    // ─────────────────────────────────────────────────────────────
    "tool.execute.after": async (input, _output) => {
      const toolName = input.tool
      const filePath: string = input.args?.filePath || ""

      if (toolName === "edit" || toolName === "write") {
        editCount++

        // Track spec file edits separately
        if (filePath.includes(SPEC_DIR)) {
          const shortPath = filePath.split(SPEC_DIR + "/").pop() || filePath
          if (!specFilesEdited.includes(shortPath)) {
            specFilesEdited.push(shortPath)
          }
        }

        // Log every 5 edits for visibility
        if (editCount % 5 === 0) {
          await log("debug", `Edit milestone: ${editCount} files modified`, {
            latestFile: filePath,
            specFilesEdited,
          })
        }
      }
    },
  }
}
