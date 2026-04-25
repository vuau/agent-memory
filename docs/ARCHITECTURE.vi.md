# Kiến trúc: Cấu trúc 4 Lớp Được Đề xuất cho AI Memory

## Tổng quan

Tài liệu này đề xuất kiến trúc khả năng skalabiliti cho AI memory qua các codebases mọi kích cỡ. Nó giải quyết vấn đề scalability, maintainability, và IDE compatibility phát hiện trong quá trình nghiên cứu.

---

## Lớp 1: Router (Project Root AGENTS.md)

**Mục đích**: Single point of truth cho AI agents vào project.

**Ràng buộc**:
- Max 150 dòng
- Thuần routing/reference, không documentation
- Không project-specific decisions (chỉ pointers đến layers dưới)

**Chứa**:
- Project setup commands (`npm install`, `make dev`, etc.)
- Quy tắc code style quan trọng (type safety, lint settings)
- Documentation map — file nào để đọc cho task type nào
- Memory protocol — agents ghi MEMORY.md thế nào

**Ví dụ**:
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

**Tại sao 150 dòng max**:
- Vừa trên một screen → agents đọc full context
- Khuyến khích ruthless curation — chỉ critical rules
- Prevent AGENTS.md thành dumping ground

---

## Lớp 2: Long-term Memory (.agents/MEMORY.md)

**Mục đích**: Curated decisions và patterns agents nên biết trước khi implement.

**Format**:
```markdown
## Category Name
→ Full details: `.agents/spec/category.md`

- YYYY-MM-DD: <1-line decision hoặc pattern>
- YYYY-MM-DD: <another decision>

## Another Category
→ Pointer to spec file

- YYYY-MM-DD: <decision>
```

**Ràng buộc**:
- 1 line per entry (decision đủ nhỏ để fit)
- Category headers point đến spec files
- Max 150-200 lines cho entire file
- Append-only — không bao giờ delete old entries

**Lý do thiết kế**:
- Agents có thể scan 150 lines nhanh (~200 token)
- Follow pointers chỉ khi cần (on-demand spec files)
- Category headers = progressive disclosure
- 1-line format force curation — chỉ truly important decisions sống sót

**Khi thêm entries**:
- User explicitly approves decision ("ok", "yes", "apply")
- Agent hiểu decision là reusable qua sessions
- Not: every thought, every experiment, every debug session

---

## Lớp 3: Working Memory (.agents/TASKS.md)

**Mục đích**: Enable session continuity — agents resume từ nơi dừng.

**Format**:
```markdown
## In Progress
- Task 1 description — agent đang làm gì
- Task 2 description

## Up Next
- Next task để work on
- Task after that

## Completed
- Gì được finish trong recent sessions
```

**Ràng buộc**:
- 3 simple sections: In Progress, Up Next, Completed
- Free-form text per task (1-3 lines mỗi)
- Updated khi session start và end

**Agent behavior**:
- Read khi session start → hiểu context, resume work
- Update trước session end → gì done, gì next
- Rules trong AGENTS.md nhắc agent update tasks

---

## Lớp 4: Spec Files (.agents/spec/*.md)

**Mục đích**: Detailed documentation agents đọc on-demand, referenced bởi MEMORY.md.

**Naming**:
- `architecture.md` — codebase structure, file organization
- `components.md` — reusable component patterns
- `deployment.md` — release process, environments
- `domain.md` — business logic, core concepts
- `{feature}.md` — bất kỳ major feature nào với complex patterns

**Contents**:
- Code examples showing pattern
- When to use / when not to use
- Common pitfalls
- Links đến related files trong codebase

**Design**:
- Agents read từ MEMORY.md pointers, không all specs
- Specs có thể large (1000+ lines) → loaded on-demand
- Better cho screenshots, diagrams, detailed explanations

---

## Skalabiliti: Xử lý khác nhau Project Sizes

### Small Project (1-2 agents, 1 dev)
- AGENTS.md: ~50 dòng
- MEMORY.md: ~30 dòng (3-5 categories)
- spec/: 1-2 files
- Total footprint: <500 dòng

### Medium Project (3-5 agents, team 2-4)
- AGENTS.md: ~100 dòng
- MEMORY.md: ~150 dòng (8-10 categories)
- spec/: 4-6 files
- Total footprint: <1500 dòng

### Large Project (10+ agents, team 5+)
- AGENTS.md: ~150 dòng (hard cap)
- MEMORY.md: ~200 dòng, archive old entries annually
- spec/: 10+ files, organized by domain
- Total footprint: <3000 dòng
- Archive: Move completed decisions to `spec/archive/decisions-2025-H1.md`

**Progressive Disclosure in Action**:
- Large projects không bloat MEMORY.md
- Agents đọc full MEMORY.md once per session (~500 token)
- Follow pointers chỉ đến relevant specs
- Result: Cùng token cost như small project cho core memory

---

## IDE Integration Points

### OpenCode
- Reads: `AGENTS.md` (native)
- Agents follow rules trong AGENTS.md
- Writes: Agent appends đến MEMORY.md/TASKS.md/spec/

### GitHub Copilot (VSCode)
- Reads: `.github/copilot-instructions.md` (GitHub convention)
- copilot-instructions.md = cùng router format với AGENTS.md
- Points đến `.agents/MEMORY.md` + spec files
- Writes: Agent follows rules → appends khi appropriate

### Cursor / Windsurf
- Reads: `.cursorrules` / `.windsurfrules` (IDE convention)
- Cùng router format, points đến `.agents/`
- Writes: Agent rules instruct direct append

### CLI / Non-IDE Workflows
- Humans có thể read/edit `.agents/` files trực tiếp
- Không cần special IDE integration

---

## Migration từ Other Systems

### Từ memsearch → File-Based

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
   - Cho mỗi category có multiple entries, tạo `spec/category.md`
   - Add pointer trong MEMORY.md đến new spec file
   - Move detailed explanations đến spec file, để 1-line pointer trong MEMORY

4. **Disable memsearch**:
   - Remove `@zilliz/memsearch-opencode` từ `opencode.json`
   - Keep `.memsearch/memory/` như archive (1 year retention)
   - Delete milvus.db

### Từ .github/copilot-instructions.md (monolithic)

1. **Extract decisions** → `.agents/MEMORY.md`
2. **Extract patterns** → `.agents/spec/patterns.md`
3. **Extract commands** → `AGENTS.md`
4. **Keep router** → update `.github/copilot-instructions.md` để point đến `.agents/`

---

## Tiêu chuẩn Chất lượng

### AGENTS.md
- ✓ Mỗi rule là actionable (không vague)
- ✓ Mỗi pointer resolves đến real file
- ✓ Vừa trên một screen (150 dòng)
- ✓ Không project-specific context (generic template work với substitution)

### MEMORY.md
- ✓ Mỗi entry là complete thought (không partial)
- ✓ Mỗi category có 3+ entries hoặc should be archived
- ✓ Entries sorted by date (newest first trong category)
- ✓ Không duplicate ideas qua entries
- ✓ Tất cả entries là decisions/patterns (không TODOs)

### spec/*.md
- ✓ Ít nhất 1 code example per concept
- ✓ Clear "when to use / when not to use" section
- ✓ Links đến related files trong codebase
- ✓ Referenced từ ít nhất 1 MEMORY.md entry

---

## Công cụ Support

### CLI
- ✓ `npx @vuau/agent-memory init` — scaffold structure (interactive hoặc với flags)
- ✓ `npx @vuau/agent-memory init --opencode` — chỉ OpenCode
- ✓ `npx @vuau/agent-memory init --copilot --cursor` — nhiều IDEs
- ✓ `npx @vuau/agent-memory init --all` — tất cả IDEs
- ✓ `npx @vuau/agent-memory doctor` — validate structure
- Planned: ✗ `report` — generate memory stats, archival suggestions

### VSCode Extension (Planned)
- Sidebar showing MEMORY.md categories
- Copilot Chat integration → inject relevant spec file trên user request
- Quick commands: "Add decision", "Update task"

---

## Tóm lại

Kiến trúc 4-layer này cung cấp:

1. **Skalabiliti**: Làm việc cho 1-person projects và 50-person teams
2. **Portability**: Plain markdown files hoạt động với bất kỳ IDE nào
3. **Simplicity**: Không daemon, không database, không special infrastructure
4. **Quality**: Agents ghi chỉ khi họ hiểu context (vs. automatic capture)
5. **Sustainability**: Plain text + git version control
6. **Token efficiency**: Curated entries + on-demand specs = consistent ~500 token/session overhead

Đó là natural fit cho teams migrate từ heavyweight solutions (memsearch, MCP servers) đến simpler, sustainable approach.
