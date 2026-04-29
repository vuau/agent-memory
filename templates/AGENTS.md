# {{PROJECT_NAME}} - AGENTS

Router file for AI agents.

> **Note**: This file is automatically managed by `@vuau/agent-memory`.
> Do not add project-specific rules here, as they may be overwritten by `agent-memory update`.
>
> 👉 **For project-specific rules, context, and document mapping, see `.agents/CUSTOM.md`**

## Priority
1. User request first.
2. The rules in `.agents/CUSTOM.md`.
3. This `AGENTS.md`.
4. Spec files in `.agents/spec/`.
5. If conflict remains, choose smallest safe change and state assumption.

## Memory Protocol

### When to write
- User approves a decision or pattern → append to `.agents/MEMORY.md`
- Explore codebase/architecture → update relevant `.agents/spec/*.md`
- Start/finish a large task → update `.agents/TASKS.md`

### MEMORY.md entry format
```
- YYYY-MM-DD: <1-line decision or pattern> → detail
```
Place under the appropriate category. Add `→ detail` pointer when full context exists in MEMORY-DETAIL.md.

### TASKS.md update
Before ending a session with unfinished work, move items to `## In Progress` or `## Up Next`.

### Rules
- Keep MEMORY.md entries to 1 line each. Details go in spec files.
- If MEMORY.md > 150 lines, archive old entries.
- Do not create additional memory files outside `.agents/`.

## Coding Principles
- State assumptions before implementing. If ambiguous, ask — don't pick silently.
- Surgical changes: touch only what's needed, match existing style.
- Remove only dead code YOUR changes created. Mention pre-existing issues, don't fix.
- Every changed line must trace to user's request.
- Complex tasks: define success criteria, verify before done.
- Full details: `.agents/spec/coding-principles.md`

## Response Style
- Concrete, implementation-focused, caveman style (minimum words, zero fluff).
- Propose the simplest solution first (KISS & YAGNI) before writing code.
- If uncertain, say `I don't know`, then give fastest verification step.
- Do not invent files, APIs, or command outputs.
