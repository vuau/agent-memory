# Current Tasks

Working memory for cross-session continuity. Update before ending a session.

---

## In Progress


## Up Next
- Create GitHub repo vuau/agent-memory (public), push code
  - Manual: `cd ~/work/agent-memory && git init && git add . && git commit -m "Initial commit" && git remote add origin https://github.com/vuau/agent-memory.git && git push -u origin main`
  - Or use GitHub web UI
- npm login (as phamvuau) and npm publish @vuau/agent-memory
  - Pre-checked: `npm pack --dry-run` shows 19 KB, 22 files, ready
  - See ~/work/agent-memory for .gitignore and .npmignore
- Test @vuau/agent-memory in fresh project (npm install @vuau/agent-memory)
- Update UI-challenges project's opencode.json to use @vuau/agent-memory plugin
- Phase 3: VSCode extension (@vuau/agent-memory-vscode) — reuse src/core/

## Completed
- 2026-04-24: Restructured .github/ → .agents/ (spec/, MEMORY.md, TASKS.md)
- 2026-04-24: Updated AGENTS.md and copilot-instructions.md to router format
- 2026-04-24: Rewrote memory-consolidate.ts → memory lifecycle plugin
- 2026-04-24: Created @vuau/agent-memory package (Phase 1+2: OpenCode plugin + CLI)
- 2026-04-25: Written research docs (EN + VI) — memsearch vs MCP vs file-based
- 2026-04-25: Written architecture docs (EN + VI) — 4-layer design, scalability, migration
- 2026-04-25: Created Vietnamese README (README.vi.md)
- 2026-04-25: Added documentation links to README.md
- 2026-04-25: Rewritten RESEARCH.md based on real tool testing
- 2026-04-25: Rewritten RESEARCH.vi.md with evidence-based content (216 lines each)
- 2026-04-25: Verified CLI: init (scaffolds .agents/ structure), doctor (validates structure)
- 2026-04-25: Tested init in temp directory — created all files correctly
- 2026-04-25: Verified plugin entry point (index.ts exports MemoryLifecyclePlugin)
- 2026-04-25: Plugin implements session.created, session.idle, tool.execute.after hooks
- 2026-04-25: Created .gitignore and .npmignore for clean repository
- 2026-04-25: Verified npm pack output — 19 KB, 22 files, ready to publish
