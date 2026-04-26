/**
 * CLI entry point for @vuau/agent-memory
 *
 * Usage:
 *   npx @vuau/agent-memory init              Scaffold .agents/ structure and AGENTS.md
 *   npx @vuau/agent-memory doctor            Validate structure
 */

import { existsSync } from "fs"
import { join } from "path"
import { scaffold, updateRouter, type ScaffoldOptions } from "../src/scaffold.js"
import { doctor } from "../src/doctor.js"
import { AGENTS_MD } from "../src/types.js"

const args = process.argv.slice(2)
const command = args[0]

// ─────────────────────────────────────────────────────────────
// Help
// ─────────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
@vuau/agent-memory — Structured AI memory for codebases

Usage:
  agent-memory init [options]    Scaffold .agents/ structure and AGENTS.md
  agent-memory update            Update AGENTS.md router to latest version
  agent-memory doctor            Validate .agents/ structure
  agent-memory help              Show this help

Options (init):
  --force                        Overwrite existing files without asking
  --name <name>                  Project name (default: from package.json)

Examples:
  npx @vuau/agent-memory init
  npx @vuau/agent-memory init --force
`)
}

// ─────────────────────────────────────────────────────────────
// Init command
// ─────────────────────────────────────────────────────────────

async function runInit() {
  const cwd = process.cwd()
  const force = args.includes("--force")
  
  // Parse --name
  const nameIdx = args.indexOf("--name")
  const projectName = nameIdx !== -1 ? args[nameIdx + 1] : undefined
  
  // Build scaffold options
  const options: ScaffoldOptions = {
    projectName,
    force,
  }
  
  // Run scaffold
  console.log(`\nInitializing agent memory in ${cwd}...\n`)
  
  const result = scaffold(cwd, options)
  
  if (result.created.length > 0) {
    console.log("Created:")
    for (const f of result.created) {
      console.log(`  ✓ ${f}`)
    }
  }
  
  if (result.skipped.length > 0) {
    console.log("\nSkipped (already exist):")
    for (const f of result.skipped) {
      console.log(`  - ${f}`)
    }
    if (!force) {
      console.log("\nTip: Use --force to overwrite existing files.")
    }
  }
  
  // Next steps
  console.log("\nNext steps:")
  console.log("  1. Edit AGENTS.md — add project-specific rules")
  console.log("  2. Add spec files to .agents/spec/ for detailed documentation")
  console.log("  3. Agent will read rules and write to .agents/MEMORY.md automatically")
  console.log("")
}

// ─────────────────────────────────────────────────────────────
// Update command
// ─────────────────────────────────────────────────────────────

async function runUpdate() {
  const cwd = process.cwd()
  const agentsMdPath = join(cwd, AGENTS_MD)
  
  if (!existsSync(agentsMdPath)) {
    console.error("✗ AGENTS.md not found. Please run 'agent-memory init' first.")
    process.exit(1)
  }

  console.log(`\nUpdating ${AGENTS_MD} in ${cwd}...\n`)
  
  const updated = updateRouter(cwd)
  if (updated) {
    console.log(`  ✓ ${AGENTS_MD} updated to the latest template.`)
    console.log(`  (Note: Your custom rules in .agents/CUSTOM.md were not affected)`)
  } else {
    console.error("✗ Failed to update AGENTS.md")
    process.exit(1)
  }
  console.log("")
}

// ─────────────────────────────────────────────────────────────
// Doctor command
// ─────────────────────────────────────────────────────────────

function runDoctor() {
  const cwd = process.cwd()
  const result = doctor(cwd)

  if (result.issues.length === 0) {
    console.log("✓ All checks passed!")
    return
  }

  for (const issue of result.issues) {
    const icon = issue.level === "error" ? "✗" : issue.level === "warning" ? "⚠" : "ℹ"
    console.log(`  ${icon} [${issue.level}] ${issue.file}: ${issue.message}`)
  }

  console.log("")
  if (result.ok) {
    console.log("⚠ Passed with warnings. Run 'agent-memory init' to fix missing files.")
  } else {
    console.log("✗ Failed. Run 'agent-memory init' to create missing files.")
    process.exit(1)
  }
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

switch (command) {
  case "init":
    runInit().catch((err) => {
      console.error("Error:", err.message)
      process.exit(1)
    })
    break
  case "update":
    runUpdate().catch((err) => {
      console.error("Error:", err.message)
      process.exit(1)
    })
    break
  case "doctor":
    runDoctor()
    break
  case "help":
  case "--help":
  case "-h":
    printUsage()
    break
  case undefined:
    // No command = init
    runInit().catch((err) => {
      console.error("Error:", err.message)
      process.exit(1)
    })
    break
  default:
    console.error(`Unknown command: ${command}`)
    printUsage()
    process.exit(1)
}
