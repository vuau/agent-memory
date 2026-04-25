# {{PROJECT_NAME}} - Copilot Instructions (VSCode)

Router file for GitHub Copilot. Points to shared agent documentation.

## Priority
1. Follow direct user request.
2. Follow this file.
3. Follow spec files in `.agents/spec/`.
4. If conflict remains, choose smallest safe change and state assumptions.

## Documentation Map

| Task | Spec File |
|------|-----------|
| Past decisions & patterns | `.agents/MEMORY.md` |
| Current work in progress | `.agents/TASKS.md` |

> Add your own spec files to `.agents/spec/` and reference them here.

## Response Style
- Concise, concrete, implementation-focused.
- If uncertain, say "I don't know" and give fastest verification step.
- Do not invent files, APIs, or command results.
- Keep diffs minimal, aligned with existing conventions.

## Memory Protocol
- When user approves a decision → append 1-line entry to `.agents/MEMORY.md` under appropriate category.
- Format: `- YYYY-MM-DD: <decision>`.
- Read `.agents/MEMORY.md` before implementing; follow spec file pointers for details.
- Do not create additional memory files.
