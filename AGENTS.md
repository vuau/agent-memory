# agent-memory - AGENTS

Router file for AI agents working on the @vuau/agent-memory package.

## What this project is
npm package `@vuau/agent-memory` — structured AI memory for codebases.
- OpenCode plugin (lifecycle hooks, auto-scaffold)
- CLI (`npx @vuau/agent-memory init|doctor`)
- Shared core logic in `src/core/` (prepared for future VSCode extension reuse)

## Documentation Map

| Task | File |
|------|------|
| Current tasks & next steps | `.agents/TASKS.md` |
| Package config | `package.json` |
| Architecture & usage | `README.md` |

## Project Structure
```
index.ts              # OpenCode plugin entry (exports AgentMemoryPlugin)
src/core/             # Shared logic — scaffold, memory, tasks, doctor
src/opencode/         # OpenCode-specific plugin hooks
bin/cli.ts            # CLI entry — init, doctor commands
templates/            # Scaffold templates with {{PROJECT_NAME}} vars
```

## Key Decisions
- `.ts` imports everywhere (Bun resolves natively, Node uses --experimental-strip-types)
- `src/core/` kept separate for future VSCode extension to reuse
- Templates use simple `{{VAR}}` replacement, no template engine
- Plugin auto-scaffolds .agents/ on session.created if AGENTS.md exists but .agents/ doesn't
- npm scope: `@vuau`
- GitHub repo: `vuau/agent-memory` (public)

## Publish workflow
```bash
npm login  # as phamvuau
npm publish --access public
```
