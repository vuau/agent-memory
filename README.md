# @vuau/agent-memory

Structured AI memory for codebases. Works with OpenCode, GitHub Copilot, Cursor, Windsurf, and any AI coding assistant that reads markdown files.

**[Tiếng Việt →](./README.vi.md)**

## Problem

AI coding assistants lose context between sessions. They can't remember:
- Architecture decisions you made last week
- Code patterns specific to your project  
- What task you were working on yesterday

**agent-memory** solves this with a simple file-based memory system that any AI can read.

## Research & Architecture

Want to understand the reasoning behind this approach?

- **[RESEARCH.md](./docs/RESEARCH.md)** — Problem, experiments with memsearch/MCP, comparison matrix, why file-based wins
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — 4-layer design, scalability, IDE integration, migration guide

Read these if you're evaluating solutions or migrating from other systems.

## Architecture: 4 Layers

```
/ (Project Root)
├── AGENTS.md                    # Layer 1: Router — rules + pointers (~100 lines)
├── .github/
│   └── copilot-instructions.md  # Router for GitHub Copilot
├── .agents/
│   ├── MEMORY.md                # Layer 2: Long-term memory — curated decisions
│   ├── TASKS.md                 # Layer 3: Working memory — current plans
│   └── spec/
│       ├── architecture.md      # Layer 4: Specs — detailed documentation
│       └── ...
```

### Layer 1: Router (AGENTS.md)
- Root file every AI IDE reads first
- Max 150 lines — rules + pointers to spec files
- **Not** a knowledge dump — a table of contents

### Layer 2: Long-term Memory (.agents/MEMORY.md)
- Curated decisions and patterns (1-line entries)
- Category headers with pointers to spec files
- Agents write here when user approves a decision

### Layer 3: Working Memory (.agents/TASKS.md)
- Current tasks, in-progress work, next steps
- Updated at start/end of sessions
- Enables cross-session continuity

### Layer 4: Specs (.agents/spec/)
- Detailed documentation per domain
- Referenced by MEMORY.md pointers
- Agents read on-demand, not every session

## Install

### As OpenCode Plugin

```json
// opencode.json
{
  "plugin": ["@vuau/agent-memory"]
}
```

The plugin auto-scaffolds `.agents/` on first session and provides lifecycle hooks.

### Standalone (any project)

```bash
npx @vuau/agent-memory init
```

### Options

```bash
npx @vuau/agent-memory init --force          # Overwrite existing files
npx @vuau/agent-memory init --name "My App"  # Custom project name
npx @vuau/agent-memory init --no-copilot     # Skip copilot-instructions.md
npx @vuau/agent-memory doctor                # Validate structure
```

## How It Works

### For AI Agents
1. Agent reads `AGENTS.md` → finds documentation map
2. Before implementing → reads `MEMORY.md` for past decisions
3. Needs details → follows pointer to spec file
4. User approves decision → agent appends to `MEMORY.md`
5. End of session → agent updates `TASKS.md`

### For Developers
- `MEMORY.md` = curated knowledge (you control what stays)
- `TASKS.md` = resume where you left off
- `spec/` = detailed docs agents update as they explore
- All markdown — readable by humans, agents, and any IDE

## Memory Protocol

Agents follow this protocol (defined in AGENTS.md):

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
## Storybook Prototypes
→ Full spec: `.agents/spec/storybook.md`
- 2026-04-24: State files = 3 layers (interfaces → defaults → variants via spread)
- 2026-04-24: Dumb components: initialState prop + optional callbacks. No services.

## Responsive Design
- 2026-04-06: Use useMediaQuery over CSS display:none for heavy components
```

## Cross-IDE Compatibility

| IDE | Reads | Writes |
|-----|-------|--------|
| OpenCode | AGENTS.md + .agents/* (auto via plugin) | MEMORY.md, TASKS.md, spec/* |
| GitHub Copilot | copilot-instructions.md → .agents/* | MEMORY.md (via rules) |
| Cursor | .cursorrules → .agents/* | MEMORY.md (via rules) |
| Windsurf | .windsurfrules → .agents/* | MEMORY.md (via rules) |

## Roadmap

- [x] OpenCode plugin with lifecycle hooks
- [x] CLI scaffolding (`npx init`, `doctor`)
- [ ] VSCode extension (sidebar, Copilot Chat integration)
- [ ] Memory archiving and compression
- [ ] Multi-project memory sharing

## Documentation

- **[RESEARCH.md](./docs/RESEARCH.md)** — Problem, experiments, comparison, solution
- **[RESEARCH.vi.md](./docs/RESEARCH.vi.md)** — Vietnamese version
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — 4-layer architecture & scalability
- **[ARCHITECTURE.vi.md](./docs/ARCHITECTURE.vi.md)** — Vietnamese version
- **[README.vi.md](./README.vi.md)** — Vietnamese README

## License

MIT
