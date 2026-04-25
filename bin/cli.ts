#!/usr/bin/env node --experimental-strip-types --no-warnings
/**
 * CLI entry point for @vuau/agent-memory
 *
 * Usage:
 *   npx @vuau/agent-memory init [--force] [--name <project-name>]
 *   npx @vuau/agent-memory doctor
 */

import { scaffold } from "../src/core/scaffold.ts"
import { doctor } from "../src/core/doctor.ts"

const args = process.argv.slice(2)
const command = args[0]

function printUsage() {
  console.log(`
@vuau/agent-memory — Structured AI memory for codebases

Usage:
  agent-memory init [options]    Scaffold .agents/ structure
  agent-memory doctor            Validate .agents/ structure
  agent-memory help              Show this help

Options (init):
  --force                        Overwrite existing files
  --name <name>                  Project name (default: from package.json)
  --no-copilot                   Skip .github/copilot-instructions.md
`)
}

function runInit() {
  const force = args.includes("--force")
  const noCopilot = args.includes("--no-copilot")
  const nameIdx = args.indexOf("--name")
  const projectName = nameIdx !== -1 ? args[nameIdx + 1] : undefined

  const cwd = process.cwd()
  console.log(`Initializing agent memory in ${cwd}...`)

  const result = scaffold(cwd, {
    projectName,
    copilotInstructions: !noCopilot,
  }, force)

  if (result.created.length > 0) {
    console.log("\nCreated:")
    for (const f of result.created) {
      console.log(`  ✓ ${f}`)
    }
  }

  if (result.skipped.length > 0) {
    console.log("\nSkipped (already exist):")
    for (const f of result.skipped) {
      console.log(`  - ${f}`)
    }
  }

  if (result.created.length === 0 && result.skipped.length > 0) {
    console.log("\nAll files already exist. Use --force to overwrite.")
  }

  console.log("\nNext steps:")
  console.log("  1. Edit AGENTS.md — add your project-specific rules")
  console.log("  2. Add spec files to .agents/spec/ for detailed documentation")
  console.log("  3. For OpenCode: add to opencode.json → { \"plugin\": [\"@vuau/agent-memory\"] }")
  console.log("")
}

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

switch (command) {
  case "init":
    runInit()
    break
  case "doctor":
    runDoctor()
    break
  case "help":
  case "--help":
  case "-h":
  case undefined:
    printUsage()
    break
  default:
    console.error(`Unknown command: ${command}`)
    printUsage()
    process.exit(1)
}
