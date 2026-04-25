# @vuau/agent-memory

Bộ nhớ AI có cấu trúc cho các codebase. Hoạt động với OpenCode, GitHub Copilot, Cursor, Windsurf, và bất kỳ AI coding assistant nào đọc markdown files.

## Bài toán

AI coding assistants mất bối cảnh giữa các phiên. Họ không thể nhớ:
- Các quyết định kiến trúc bạn đã đưa ra tuần trước
- Các mẫu thiết kế cụ thể của dự án
- Task bạn đang làm hôm qua

**agent-memory** giải quyết bằng hệ thống bộ nhớ đơn giản dựa trên file mà bất kỳ AI nào cũng có thể đọc.

## Kiến trúc: 4 Lớp

```
/ (Project Root)
├── AGENTS.md                    # Lớp 1: Router — rules + pointers (~100 dòng)
├── .github/
│   └── copilot-instructions.md  # Router cho GitHub Copilot
├── .agents/
│   ├── MEMORY.md                # Lớp 2: Long-term memory — curated decisions
│   ├── TASKS.md                 # Lớp 3: Working memory — current plans
│   └── spec/
│       ├── architecture.md      # Lớp 4: Specs — detailed documentation
│       └── ...
```

### Lớp 1: Router (AGENTS.md)
- Root file mọi IDE đọc đầu tiên
- Max 150 dòng — rules + pointers đến spec files
- **Không phải** knowledge dump — table of contents

### Lớp 2: Long-term Memory (.agents/MEMORY.md)
- Curated decisions và patterns (1-line entries)
- Category headers với pointers đến spec files
- Agents ghi khi user approves decision

### Lớp 3: Working Memory (.agents/TASKS.md)
- Current tasks, in-progress work, next steps
- Updated khi session start/end
- Enable cross-session continuity

### Lớp 4: Specs (.agents/spec/)
- Detailed documentation per domain
- Referenced bởi MEMORY.md pointers
- Agents đọc on-demand, không every session

## Cài đặt

### Như OpenCode Plugin

```json
// opencode.json
{
  "plugin": ["@vuau/agent-memory"]
}
```

Plugin auto-scaffolds `.agents/` khi session đầu tiên và cung cấp lifecycle hooks.

### Standalone (any project)

```bash
npx @vuau/agent-memory init
```

### Tùy chọn

```bash
npx @vuau/agent-memory init --force          # Overwrite existing files
npx @vuau/agent-memory init --name "My App"  # Custom project name
npx @vuau/agent-memory init --no-copilot     # Skip copilot-instructions.md
npx @vuau/agent-memory doctor                # Validate structure
```

## Cách hoạt động

### Cho AI Agents
1. Agent đọc `AGENTS.md` → tìm documentation map
2. Trước khi implement → đọc `MEMORY.md` cho decisions trong quá khứ
3. Cần details → follow pointer đến spec file
4. User approves decision → agent append vào `MEMORY.md`
5. End of session → agent update `TASKS.md`

### Cho Developers
- `MEMORY.md` = curated knowledge (bạn kiểm soát gì còn lại)
- `TASKS.md` = resume từ nơi dừng lại
- `spec/` = detailed docs agents update khi explore
- Tất cả markdown — readable bởi humans, agents, và any IDE

## Memory Protocol

Agents follow protocol này (defined trong AGENTS.md):

```markdown
## Khi nào ghi
- User approves decision → append vào .agents/MEMORY.md
- Explore codebase/architecture → update .agents/spec/*.md
- Start/finish large task → update .agents/TASKS.md

## Entry format
- YYYY-MM-DD: <1-line decision hoặc pattern>
```

### MEMORY.md Ví dụ

```markdown
## Storybook Prototypes
→ Full spec: `.agents/spec/storybook.md`
- 2026-04-24: State files = 3 layers (interfaces → defaults → variants via spread)
- 2026-04-24: Dumb components: initialState prop + optional callbacks. No services.

## Responsive Design
- 2026-04-06: Use useMediaQuery over CSS display:none cho heavy components
```

## Cross-IDE Compatibility

| IDE | Reads | Writes |
|-----|-------|--------|
| OpenCode | AGENTS.md + .agents/* (auto via plugin) | MEMORY.md, TASKS.md, spec/* |
| GitHub Copilot | copilot-instructions.md → .agents/* | MEMORY.md (via rules) |
| Cursor | .cursorrules → .agents/* | MEMORY.md (via rules) |
| Windsurf | .windsurfrules → .agents/* | MEMORY.md (via rules) |

## Roadmap

- [x] OpenCode plugin với lifecycle hooks
- [x] CLI scaffolding (`npx init`, `doctor`)
- [ ] VSCode extension (sidebar, Copilot Chat integration)
- [ ] Memory archiving và compression
- [ ] Multi-project memory sharing

## Tài liệu

- **[RESEARCH.md](./docs/RESEARCH.md)** — Vấn đề, thử nghiệm, so sánh, giải pháp
- **[RESEARCH.vi.md](./docs/RESEARCH.vi.md)** — Bản tiếng Việt của RESEARCH
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — 4-layer architecture & scalability
- **[ARCHITECTURE.vi.md](./docs/ARCHITECTURE.vi.md)** — Bản tiếng Việt của ARCHITECTURE
- **[README.md](./README.md)** — English version

## License

MIT
