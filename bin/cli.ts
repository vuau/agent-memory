/**
 * CLI entry point for @vuau/agent-memory
 *
 * Usage:
 *   npx @vuau/agent-memory init              Interactive mode
 *   npx @vuau/agent-memory init --opencode   Non-interactive for OpenCode
 *   npx @vuau/agent-memory init --copilot    Non-interactive for Copilot
 *   npx @vuau/agent-memory doctor            Validate structure
 */

import * as readline from "readline"
import { existsSync } from "fs"
import { join } from "path"
import { scaffold, type ScaffoldOptions } from "../src/core/scaffold.ts"
import { doctor } from "../src/core/doctor.ts"
import { AGENTS_MD, MEMORY_FILE, TASKS_FILE, COPILOT_INSTRUCTIONS } from "../src/core/types.ts"

const args = process.argv.slice(2)
const command = args[0]

// ─────────────────────────────────────────────────────────────
// Interactive prompts using readline
// ─────────────────────────────────────────────────────────────

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()))
  })
}

function askYesNo(question: string, defaultYes = true): Promise<boolean> {
  const hint = defaultYes ? "(Y/n)" : "(y/N)"
  return ask(`${question} ${hint} `).then((answer) => {
    if (!answer) return defaultYes
    return answer.toLowerCase().startsWith("y")
  })
}

async function askMultiSelect(question: string, options: { key: string; label: string }[]): Promise<string[]> {
  console.log(`\n${question}`)
  for (const opt of options) {
    console.log(`  [${opt.key}] ${opt.label}`)
  }
  const answer = await ask("Enter choices (e.g., 1,2 or 1 2): ")
  const selected = answer.split(/[,\s]+/).filter(Boolean)
  return selected
}

// ─────────────────────────────────────────────────────────────
// Help
// ─────────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
@vuau/agent-memory — Structured AI memory for codebases

Usage:
  agent-memory init [options]    Scaffold .agents/ structure
  agent-memory doctor            Validate .agents/ structure
  agent-memory help              Show this help

Options (init):
  --opencode                     Create AGENTS.md for OpenCode
  --copilot                      Create .github/copilot-instructions.md for GitHub Copilot
  --cursor                       Create .cursorrules for Cursor
  --windsurf                     Create .windsurfrules for Windsurf
  --all                          Create config for all IDEs
  --force                        Overwrite existing files without asking
  --name <name>                  Project name (default: from package.json)

Examples:
  npx @vuau/agent-memory init                    # Interactive mode
  npx @vuau/agent-memory init --opencode         # OpenCode only
  npx @vuau/agent-memory init --copilot --cursor # Copilot + Cursor
  npx @vuau/agent-memory init --all              # All IDEs
`)
}

// ─────────────────────────────────────────────────────────────
// Init command
// ─────────────────────────────────────────────────────────────

async function runInit() {
  const cwd = process.cwd()
  const force = args.includes("--force")
  
  // Parse IDE flags
  const hasOpencode = args.includes("--opencode")
  const hasCopilot = args.includes("--copilot")
  const hasCursor = args.includes("--cursor")
  const hasWindsurf = args.includes("--windsurf")
  const hasAll = args.includes("--all")
  
  // Parse --name
  const nameIdx = args.indexOf("--name")
  const projectName = nameIdx !== -1 ? args[nameIdx + 1] : undefined
  
  // Determine selected IDEs
  let selectedIdes: string[] = []
  
  if (hasAll) {
    selectedIdes = ["1", "2", "3", "4"]
  } else if (hasOpencode || hasCopilot || hasCursor || hasWindsurf) {
    if (hasOpencode) selectedIdes.push("1")
    if (hasCopilot) selectedIdes.push("2")
    if (hasCursor) selectedIdes.push("3")
    if (hasWindsurf) selectedIdes.push("4")
  } else {
    // Interactive mode
    console.log("\n@vuau/agent-memory — Structured AI memory for codebases\n")
    
    selectedIdes = await askMultiSelect("What are your coding tools?", [
      { key: "1", label: "OpenCode (AGENTS.md)" },
      { key: "2", label: "GitHub Copilot (.github/copilot-instructions.md)" },
      { key: "3", label: "Cursor (.cursorrules)" },
      { key: "4", label: "Windsurf (.windsurfrules)" },
    ])
    
    if (selectedIdes.length === 0) {
      console.log("\nNo tools selected. Defaulting to OpenCode.\n")
      selectedIdes = ["1"]
    }
  }
  
  // Build scaffold options
  const options: ScaffoldOptions = {
    projectName,
    opencode: selectedIdes.includes("1"),
    copilot: selectedIdes.includes("2"),
    cursor: selectedIdes.includes("3"),
    windsurf: selectedIdes.includes("4"),
  }
  
  // Check for existing files and confirm overwrite
  if (!force) {
    const filesToCheck: { path: string; name: string }[] = [
      { path: MEMORY_FILE, name: ".agents/MEMORY.md" },
      { path: TASKS_FILE, name: ".agents/TASKS.md" },
    ]
    
    if (options.opencode) {
      filesToCheck.push({ path: AGENTS_MD, name: "AGENTS.md" })
    }
    if (options.copilot) {
      filesToCheck.push({ path: COPILOT_INSTRUCTIONS, name: ".github/copilot-instructions.md" })
    }
    if (options.cursor) {
      filesToCheck.push({ path: ".cursorrules", name: ".cursorrules" })
    }
    if (options.windsurf) {
      filesToCheck.push({ path: ".windsurfrules", name: ".windsurfrules" })
    }
    
    const existingFiles = filesToCheck.filter(f => existsSync(join(cwd, f.path)))
    
    if (existingFiles.length > 0) {
      console.log("\nExisting files found:")
      for (const f of existingFiles) {
        console.log(`  - ${f.name}`)
      }
      
      const overwrite = await askYesNo("\nOverwrite these files?", false)
      if (!overwrite) {
        console.log("\nAborted. Use --force to overwrite without asking.\n")
        rl.close()
        return
      }
      options.force = true
    }
  } else {
    options.force = true
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
  }
  
  // Next steps
  console.log("\nNext steps:")
  console.log("  1. Edit your IDE config file — add project-specific rules")
  console.log("  2. Add spec files to .agents/spec/ for detailed documentation")
  console.log("  3. Agent will read rules and write to .agents/MEMORY.md automatically")
  console.log("")
  
  rl.close()
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
      rl.close()
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
    // No command = interactive init
    runInit().catch((err) => {
      console.error("Error:", err.message)
      rl.close()
      process.exit(1)
    })
    break
  default:
    console.error(`Unknown command: ${command}`)
    printUsage()
    process.exit(1)
}
