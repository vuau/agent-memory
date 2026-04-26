# @vuau/agent-memory

Structured AI memory for codebases. Uses `AGENTS.md` to work with OpenCode, GitHub Copilot, Cursor, Windsurf, and any AI coding assistant that reads markdown files.

**[Tiếng Việt →](./README.vi.md)**

## Problem

AI coding assistants lose context between sessions. They can't remember:
- Architecture decisions you made last week
- Code patterns specific to your project  
- What task you were working on yesterday

**agent-memory** solves this with a simple file-based memory system that any AI can read.

## Quick Start

```bash
npx @vuau/agent-memory init
```

## What It Creates

```
/ (Project Root)
├── AGENTS.md                    # Root agent rules
└── .agents/
    ├── MEMORY.md                # Long-term memory (decisions, patterns)
    ├── TASKS.md                 # Working memory (current tasks)
    └── spec/                    # Detailed specs (on-demand)
```

## How It Works

1. **You run `init`** → Creates `AGENTS.md` + `.agents/` structure
2. **Agent reads rules** → Finds documentation map pointing to `.agents/`
3. **Agent works** → Reads MEMORY.md before implementing, updates TASKS.md
4. **You approve decision** → Agent writes 1-line entry to MEMORY.md
5. **Next session** → Agent reads memory, continues where you left off

**No plugin required.** The rules in `AGENTS.md` instruct the agent what to do.

## CLI Options

```bash
npx @vuau/agent-memory init [options]

Options:
  --force       Overwrite existing files without asking
  --name <n>    Project name (default: from package.json)

npx @vuau/agent-memory doctor   # Validate structure
npx @vuau/agent-memory help     # Show help
```

## Memory Protocol

Agents follow this protocol (defined in config files):

```markdown
## When to write
- User approves a decision → append to .agents/MEMORY.md
- Explore codebase/architecture → update .agents/spec/*.md
- Start/finish a large task → update .agents/TASKS.md

## Entry format
- YYYY-MM-DD: <1-line decision or pattern>
```

### MEMORY.md Example

```markdown
## Patterns
- 2026-04-24: State files = 3 layers (interfaces → defaults → variants)
- 2026-04-24: Dumb components: initialState prop + optional callbacks

## Decisions
- 2026-04-06: Use useMediaQuery over CSS display:none for heavy components
```

## Architecture

### 4-Layer Design

| Layer | File | Purpose |
|-------|------|---------|
| Router | AGENTS.md | Rules + pointers (~100 lines) |
| Memory | .agents/MEMORY.md | Curated decisions (1-line each) |
| Tasks | .agents/TASKS.md | Current work, next steps |
| Specs | .agents/spec/*.md | Detailed docs (on-demand) |

### Why File-Based?

We tested memsearch, qmd, mem0, memories.sh — all failed for various reasons (see [RESEARCH.md](./docs/RESEARCH.md)):

- **Context Blindness**: Auto-capture can't link user intent to prior analysis
- **Context Bloat**: Fallback to transcripts costs 47k+ tokens
- **Platform issues**: Dependencies don't work on Windows/VM

File-based solution:
- Agent writes when they understand context (quality > automation)
- Plain markdown (portable, git-versionable, human-readable)
- No dependencies (works everywhere)

## Cross-IDE Compatibility

By default, we only scaffold `AGENTS.md`, which is an emerging standard router file.

If your tool requires a specific file (e.g. Cursor requires `.cursorrules`, GitHub Copilot requires `.github/copilot-instructions.md`), you can simply symlink or copy `AGENTS.md`:

```bash
# For Cursor
ln -s AGENTS.md .cursorrules

# For GitHub Copilot
mkdir -p .github && ln -s ../AGENTS.md .github/copilot-instructions.md
```

All tools will read from the same underlying `.agents/` memory structure.

## Documentation

- **[RESEARCH.md](./docs/RESEARCH.md)** — Problem, experiments, comparison, why file-based wins
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — 4-layer design, scalability, migration

## License

MIT
