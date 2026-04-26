# Architecture: Recommended 4-Layer Structure for AI Memory

## Overview

This document proposes a generalizable architecture for AI memory across codebases of any size. It addresses the scalability, maintainability, and IDE compatibility issues discovered during research.

---

## Layer 1: Router (Project Root AGENTS.md)

**Purpose**: Single point of truth for AI agents entering the project.

**Constraints**:
- Max 150 lines
- Purely routing/reference, not documentation
- No project-specific decisions (only pointers to layers below)

**Contains**:
- Project setup commands (`npm install`, `make dev`, etc.)
- Critical code style rules (type safety, lint settings)
- Documentation map — which file to read for which task type
- Memory protocol — how agents should write MEMORY.md

**Example**:
```markdown
# My Project - AGENTS

## Commands
- `npm dev` — start dev server
- `npm test` — run tests

## Key Rules
- TypeScript strict: true required
- All components must have JSDoc comments

## Documentation Map
| Task | Read |
|------|------|
| Architecture decisions | `.agents/MEMORY.md` |
| Component patterns | `.agents/spec/components.md` |
| Production deployment | `.agents/spec/deployment.md` |
```

**Why 150 lines max**:
- Fits in single screen → agents read entire context
- Encourages ruthless curation — only critical rules
- Prevents AGENTS.md from becoming a dumping ground

---

## Layer 2: Long-term Memory (.agents/MEMORY.md)

**Purpose**: Curated decisions and patterns agents should know before implementing.

**Format**:
```markdown
## Category Name
→ Full details: `.agents/spec/category.md`

- YYYY-MM-DD: <1-line decision or pattern>
- YYYY-MM-DD: <another decision>

## Another Category
→ Pointer to spec file

- YYYY-MM-DD: <decision>
```

**Constraints**:
- 1 line per entry (decision is small enough to fit)
- Category headers point to spec files
- Max 150-200 lines for entire file
- Append-only — never delete old entries

**Design rationale**:
- Agents can scan 150 lines quickly (~200 tokens)
- Follow pointers only when needed (on-demand spec files)
- Category headers = progressive disclosure
- 1-line format forces curation — only truly important decisions survive

**When to add entries**:
- User explicitly approves a decision ("ok", "yes", "apply")
- Agent understands decision is reusable across sessions
- Not: every thought, every experiment, every debug session

---

## Layer 3: Working Memory (.agents/TASKS.md)

**Purpose**: Enable session continuity — agents resume where they left off.

**Format**:
```markdown
## In Progress
- Task 1 description — what agent is actively doing
- Task 2 description

## Up Next
- Next task to work on
- Task after that

## Completed
- What was finished in recent sessions
```

**Constraints**:
- 3 simple sections: In Progress, Up Next, Completed
- Free-form text per task (1-3 lines each)
- Updated at session start and end

**Agent behavior**:
- Read at session start → understand context, resume work
- Update before session end → what's done, what's next
- Plugin reminds if tasks exist but not updated

---

## Layer 4: Spec Files (.agents/spec/*.md)

**Purpose**: Detailed documentation agents read on-demand, referenced by MEMORY.md.

**Naming**:
- `architecture.md` — codebase structure, file organization
- `components.md` — reusable component patterns
- `deployment.md` — release process, environments
- `domain.md` — business logic, core concepts
- `{feature}.md` — any major feature with complex patterns

**Contents**:
- Code examples showing the pattern
- When to use / when not to use
- Common pitfalls
- Links to related files in codebase

**Design**:
- Agents read from MEMORY.md pointers, not all specs
- Specs can be large (1000+ lines) → loaded on-demand
- Better for screenshots, diagrams, detailed explanations

---

## Scalability: Handling Different Project Sizes

### Small Project (1-2 agents, 1 dev)
- AGENTS.md: ~50 lines
- MEMORY.md: ~30 lines (3-5 categories)
- spec/: 1-2 files
- Total footprint: <500 lines

### Medium Project (3-5 agents, team of 2-4)
- AGENTS.md: ~100 lines
- MEMORY.md: ~150 lines (8-10 categories)
- spec/: 4-6 files
- Total footprint: <1500 lines

### Large Project (10+ agents, team of 5+)
- AGENTS.md: ~150 lines (hard cap)
- MEMORY.md: ~200 lines, archive old entries annually
- spec/: 10+ files, organized by domain
- Total footprint: <3000 lines
- Archive: Move completed decisions to `spec/archive/decisions-2025-H1.md`

**Progressive Disclosure in Action**:
- Large projects don't bloat MEMORY.md
- Agents read full MEMORY.md once per session (~500 tokens)
- Follow pointers only to relevant specs
- Result: Same token cost as small project for core memory

---

## Integration Points

By default, we scaffold `AGENTS.md` which acts as the root router for your AI coding assistant. This file contains rules and documentation maps that point to the `.agents/` folder.

If your specific AI tool requires a different file name, you can simply symlink the `AGENTS.md` file:

```bash
# Example: For Cursor
ln -s AGENTS.md .cursorrules

# Example: For GitHub Copilot
mkdir -p .github && ln -s ../AGENTS.md .github/copilot-instructions.md
```

This ensures a single source of truth (`AGENTS.md`) is maintained while providing backward compatibility with any tool.

---

## Migration from Other Systems

### From memsearch → File-Based

1. **Export memsearch data**:
   ```bash
   # Read .memsearch/memory/2026-*.md files
   # Manually extract high-quality summaries
   ```

2. **Create initial MEMORY.md**:
   - Go through each date file
   - Extract 2-3 truly important decisions per week
   - Format as `- YYYY-MM-DD: <1-line summary>`
   - Discard debug logs, failed experiments, noise

3. **Create spec files**:
   - For each category with multiple entries, create `spec/category.md`
   - Add pointer in MEMORY.md to new spec file
   - Move detailed explanations to spec file, leave 1-line pointer in MEMORY

4. **Disable memsearch**:
   - Remove `@zilliz/memsearch-opencode` from `opencode.json`
   - Keep `.memsearch/memory/` as archive (1 year retention)
   - Delete milvus.db

### From Monolithic Config Files (e.g. .cursorrules)

1. **Extract decisions** → `.agents/MEMORY.md`
2. **Extract patterns** → `.agents/spec/patterns.md`
3. **Extract commands** → `AGENTS.md`
4. **Keep router** → Create symlink from your old config file to `AGENTS.md`

---

## Quality Standards

### AGENTS.md
- ✓ Every rule is actionable (not vague)
- ✓ Every pointer resolves to a real file
- ✓ Fits on one screen (150 lines)
- ✓ No project-specific context (generic template works with substitution)

### MEMORY.md
- ✓ Each entry is a complete thought (not partial)
- ✓ Each category has 3+ entries or should be archived
- ✓ Entries sorted by date (newest first within category)
- ✓ No duplicate ideas across entries
- ✓ All entries are decisions/patterns (not TODOs)

### spec/*.md
- ✓ At least 1 code example per concept
- ✓ Clear "when to use / when not to use" section
- ✓ Links to related files in codebase
- ✓ Referenced from at least 1 MEMORY.md entry

---

## Tooling Support

### CLI
- ✓ `npx @vuau/agent-memory init` — scaffold structure (`AGENTS.md` + `.agents/`)
- ✓ `npx @vuau/agent-memory init --force` — overwrite existing files
- ✓ `npx @vuau/agent-memory doctor` — validate structure
- Planned: ✗ `report` — generate memory stats, archival suggestions

### VSCode Extension (Planned)
- Sidebar showing MEMORY.md categories
- Copilot Chat integration → inject relevant spec file on user request
- Quick commands: "Add decision", "Update task"

---

## Summary

This 4-layer architecture provides:

1. **Scalability**: Works for 1-person projects and 50-person teams
2. **Portability**: Plain markdown files work with any IDE
3. **Simplicity**: No daemon, no database, no special infrastructure
4. **Quality**: Agents write only when they understand context (vs. automatic capture)
5. **Sustainability**: Plain text + git version control
6. **Token efficiency**: Curated entries + on-demand specs = consistent ~500 token/session overhead

It's a natural fit for teams migrating from heavyweight solutions (memsearch, MCP servers) to a simpler, more sustainable approach.
