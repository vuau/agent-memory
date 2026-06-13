# @vuau/agent-memory

Structured AI memory for codebases. Works with GitHub Copilot, Cursor, Windsurf, Claude Code, OpenCode, and any AI coding assistant that reads markdown files.

**[Tiếng Việt →](./README.vi.md)**

## Problem

AI coding assistants lose context between sessions. They can't remember architecture decisions, specific code patterns, or current tasks. **agent-memory** solves this with a simple file-based memory system that any AI can read and update.

## Quick Start

```bash
npx @vuau/agent-memory init
```

## What It Creates

```
/ (Project Root)
├── AGENTS.md                    # Copilot, Cursor, Windsurf, OpenCode …
├── CLAUDE.md                    # Claude Code (symlink → AGENTS.md on macOS/Linux)
└── .agents/
    ├── CUSTOM.md                # Project-specific rules & spec mapping
    ├── MEMORY.md                # Long-term memory (decisions, patterns)
    ├── TASKS.md                 # Working memory (current tasks)
    └── spec/                    # Detailed specs (on-demand)
```

## How It Works

1. **You run `init`** → Creates the structure. `AGENTS.md` points to `.agents/CUSTOM.md`.
2. **Agent reads rules** → Follows the priority: CUSTOM.md > AGENTS/CLAUDE.md > spec files.
3. **Agent works** → Updates MEMORY.md for decisions and TASKS.md for progress.
4. **Update package** → Run `agent-memory update` to get the latest router files without losing your custom rules.

## CLI Commands

```bash
npx @vuau/agent-memory init      # Scaffold .agents/ structure
npx @vuau/agent-memory update    # Update router files (AGENTS.md, CLAUDE.md) to latest version
npx @vuau/agent-memory doctor    # Validate structure integrity
npx @vuau/agent-memory help      # Show help
```

## Architecture

### The Router Split

- **`AGENTS.md`** — For GitHub Copilot, Cursor, Windsurf, OpenCode, and general AI coding assistants.
  Read by: Copilot (`.github/copilot-instructions.md` instructions point here), Cursor (`@AGENTS.md`), Windsurf (`.windsurfrules` references).
- **`CLAUDE.md`** — For Claude Code exclusively.
  On macOS/Linux it's a **symlink to `AGENTS.md`** so content is always in sync.
  On Windows it's a **hook file** that tells Claude Code to read `AGENTS.md`.
- **`.agents/CUSTOM.md`** — Your project's home for custom rules, architectural decisions, and documentation mapping.

### Memory Files

| File | Purpose |
|------|---------|
| .agents/MEMORY.md | Curated decisions (1-line each) |
| .agents/TASKS.md | Current work, next steps |
| .agents/spec/*.md | Detailed technical documentation |

## Why File-Based?

- **Context Precision**: AI writes when they understand context (quality > automation).
- **Portable**: Plain markdown is portable, git-versionable, and human-readable.
- **Minimalist**: No dependencies, no background processes, no API keys.

## License

MIT
