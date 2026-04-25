# {{PROJECT_NAME}} - Windsurf Rules

Instructions for Windsurf AI. Keep under 150 lines.

## Priority
1. User request first.
2. These rules.
3. Spec files in `.agents/spec/`.
4. If conflict remains, choose smallest safe change and state assumption.

## Documentation Map

| Task | Location |
|------|----------|
| Past decisions (1-line) | `.agents/MEMORY.md` |
| Past decisions (full context) | `.agents/MEMORY-DETAIL.md` |
| Current work in progress | `.agents/TASKS.md` |
| Detailed specs | `.agents/spec/*.md` |

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

## Response Style
- Concise, concrete, implementation-focused.
- If uncertain, say `I don't know`, then give fastest verification step.
- Do not invent files, APIs, or command outputs.
