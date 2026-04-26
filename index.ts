/**
 * @vuau/agent-memory
 *
 * Structured AI memory for codebases.
 * CLI scaffolding tool + core utilities.
 */

// Re-export core utilities for programmatic use
export { scaffold, updateRouter, type ScaffoldResult, type ScaffoldOptions } from "./src/scaffold.js"
export { doctor } from "./src/doctor.js"
export * from "./src/types.js"
