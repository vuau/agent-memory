/**
 * @vuau/agent-memory
 *
 * Structured AI memory for codebases.
 * OpenCode plugin entry point.
 */

export { MemoryLifecyclePlugin as AgentMemoryPlugin } from "./src/opencode/plugin.ts"

// Re-export core for programmatic use
export * from "./src/core/index.ts"
