# @vuau/agent-memory v0.1.0 — Release Notes

## What's New

Structured AI memory system designed for codebases that work across sessions, IDEs, and computers without API keys, dependencies, or complexity.

### Core Features

1. **4-Layer Architecture**
   - Layer 1: Router (AGENTS.md) — critical rules + pointers
   - Layer 2: Memory (MEMORY.md) — curated 1-line decisions
   - Layer 3: Tasks (TASKS.md) — session continuation
   - Layer 4: Specs (spec/*.md) — detailed patterns on-demand

2. **OpenCode Plugin (Lifecycle Hooks)**
   - `session.created` → auto-scaffold .agents/ structure
   - `session.idle` → remind to update TASKS.md if significant work
   - `tool.execute.after` → track file edits, spec file usage

3. **CLI Scaffolding**
   ```bash
   agent-memory init [--force] [--name <name>] [--no-copilot]
   agent-memory doctor
   agent-memory help
   ```

4. **Cross-IDE Compatibility**
   - OpenCode: plugin hooks + session lifecycle
   - GitHub Copilot: reads `.github/copilot-instructions.md`
   - Cursor: reads `.cursorrules`
   - Windsurf: reads `.windsurfrules`
   - VS Code: reads markdown files

5. **No External Dependencies**
   - Works on Host + VM (Windows 11, Linux)
   - No build tools required
   - Plain text files (git-friendly, human-readable)
   - ~500 tokens/session overhead (vs 47k with auto-capture)

### Why This Approach

Evaluated tools: qmd, memsearch, mem0, memories.sh, codemem, OpenCode native, Copilot native.

**Problems with automatic capture:**
- Context Blindness: Can't link user intent to prior analysis
- Context Bloat: Fallback to raw transcripts costs 47k+ tokens
- Platform bloat: Requires dependencies that don't compile on Windows/VM

**File-based solution:**
- Agent writes memory when they understand context
- Only important decisions survive (manually curated)
- Portable everywhere (no compilation, no dependencies)
- Transparent (human-readable, git-auditable)

See `docs/RESEARCH.md` for detailed analysis.

## Installation

### Global CLI
```bash
npm install -g @vuau/agent-memory
agent-memory init
```

### OpenCode Plugin
```json
{
  "plugins": ["@vuau/agent-memory"]
}
```

### Programmatic
```typescript
import { AgentMemoryPlugin, scaffold, readMemory } from "@vuau/agent-memory";

// Use as OpenCode plugin
// Or import core utilities for custom integration
```

## Quick Start

1. Initialize structure:
   ```bash
   agent-memory init --name "my-project"
   ```

2. Edit `AGENTS.md` — add project-specific rules (max 150 lines)

3. Agents follow these rules:
   - Before implementing: read AGENTS.md + MEMORY.md
   - After key decision: append 1-line entry to MEMORY.md
   - On session end: update TASKS.md with continuation plan

4. OpenCode plugin handles reminders via lifecycle hooks

## Architecture

```
.agents/
├── MEMORY.md          (Agents read before implementing)
├── TASKS.md           (Session continuity: In Progress, Up Next, Completed)
├── spec/              (On-demand: detailed patterns, examples)
│   ├── production.md
│   ├── storybook.md
│   └── mui.md
└── .gitkeep

AGENTS.md             (Router: critical rules, pointers to specs)
.github/
└── copilot-instructions.md  (Copilot integration)
```

## Design Principles

1. **Progressive Disclosure**: Read ~200 tokens initially, follow pointers on-demand
2. **Curated Not Automatic**: Agent writes when they understand context
3. **Portable**: Works everywhere (no native modules, no API keys, no build tools)
4. **Transparent**: Human-readable, git-versionable, auditable
5. **Scalable**: Same token cost from 1-person to 50-person teams

## Token Cost

| Operation | Tokens | Notes |
|-----------|--------|-------|
| Read AGENTS.md + MEMORY.md | 200-300 | Session start |
| Follow spec pointer | 500-1000 | On-demand detail |
| Auto-capture fallback (memsearch) | 47,000+ | Why we avoid it |
| **Total per session** | **700-1300** | 66x cheaper than memsearch |

## Known Limitations

- Requires agent discipline (no "set and forget" automation)
- Works best for teams 1-50 (not enterprise-scale sync)
- Manual memory updates (no AI-driven capture)

## Roadmap

- **Phase 1**: ✅ OpenCode plugin + CLI scaffolding
- **Phase 2**: ✅ Documentation (EN + VI)
- **Phase 3**: 🚧 VSCode extension (unified sidebar + quick-reference)
- **Phase 4**: ? Sharing API (GitHub sync, Notion integration)

## Support

- GitHub: https://github.com/vuau/agent-memory
- Docs: ./docs/RESEARCH.md, ./docs/ARCHITECTURE.md
- Issues: https://github.com/vuau/agent-memory/issues

## License

MIT
