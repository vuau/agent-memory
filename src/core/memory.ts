/**
 * Memory — read/append operations for MEMORY.md
 */

import { existsSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { MEMORY_FILE } from "./types.ts"

export interface MemoryEntry {
  date: string
  content: string
  category?: string
}

/**
 * Append a 1-line entry to MEMORY.md under a category.
 * Creates category header if it doesn't exist.
 */
export function appendMemory(
  projectDir: string,
  entry: MemoryEntry
): void {
  const filePath = join(projectDir, MEMORY_FILE)
  if (!existsSync(filePath)) {
    throw new Error(`${MEMORY_FILE} not found. Run 'agent-memory init' first.`)
  }

  const content = readFileSync(filePath, "utf-8")
  const category = entry.category || "Decisions"
  const line = `- ${entry.date}: ${entry.content}`

  // Find category header
  const categoryHeader = `## ${category}`
  const headerIndex = content.indexOf(categoryHeader)

  let updated: string
  if (headerIndex === -1) {
    // Append new category at end
    updated = content.trimEnd() + `\n\n${categoryHeader}\n${line}\n`
  } else {
    // Find next ## header or end of file
    const afterHeader = headerIndex + categoryHeader.length
    const nextHeaderIndex = content.indexOf("\n## ", afterHeader)
    const insertAt = nextHeaderIndex === -1 ? content.length : nextHeaderIndex

    // Find last non-empty line in category
    const categoryContent = content.slice(afterHeader, insertAt)
    const lastLineEnd = afterHeader + categoryContent.trimEnd().length

    updated =
      content.slice(0, lastLineEnd) +
      "\n" + line +
      content.slice(lastLineEnd)
  }

  writeFileSync(filePath, updated)
}

/**
 * Read all entries from MEMORY.md, parsed by category.
 */
export function readMemory(
  projectDir: string
): Record<string, string[]> {
  const filePath = join(projectDir, MEMORY_FILE)
  if (!existsSync(filePath)) return {}

  const content = readFileSync(filePath, "utf-8")
  const categories: Record<string, string[]> = {}
  let currentCategory = "_uncategorized"

  for (const line of content.split("\n")) {
    const headerMatch = line.match(/^## (.+)/)
    if (headerMatch) {
      currentCategory = headerMatch[1]
      categories[currentCategory] = categories[currentCategory] || []
      continue
    }
    if (line.startsWith("- ") && currentCategory) {
      categories[currentCategory] = categories[currentCategory] || []
      categories[currentCategory].push(line.slice(2))
    }
  }

  return categories
}
