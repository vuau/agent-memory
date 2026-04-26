# @vuau/agent-memory

Bộ nhớ AI có cấu trúc cho các codebase. Sử dụng `AGENTS.md` để hoạt động với OpenCode, GitHub Copilot, Cursor, Windsurf, và bất kỳ AI coding assistant nào đọc markdown files.

## Bài toán

AI coding assistants mất bối cảnh giữa các phiên. Họ không thể nhớ:
- Các quyết định kiến trúc bạn đã đưa ra tuần trước
- Các mẫu thiết kế cụ thể của dự án
- Task bạn đang làm hôm qua

**agent-memory** giải quyết bằng hệ thống bộ nhớ đơn giản dựa trên file mà bất kỳ AI nào cũng có thể đọc.

## Bắt đầu nhanh

```bash
npx @vuau/agent-memory init
```

## Cấu trúc tạo ra

```
/ (Project Root)
├── AGENTS.md                    # Root agent rules
└── .agents/
    ├── MEMORY.md                # Long-term memory (decisions, patterns)
    ├── TASKS.md                 # Working memory (current tasks)
    └── spec/                    # Detailed specs (on-demand)
```

## Cách hoạt động

1. **Bạn chạy `init`** → Tạo `AGENTS.md` + `.agents/` structure
2. **Agent đọc rules** → Tìm documentation map trỏ đến `.agents/`
3. **Agent làm việc** → Đọc MEMORY.md trước khi implement, update TASKS.md
4. **Bạn approve decision** → Agent ghi 1-line entry vào MEMORY.md
5. **Phiên tiếp theo** → Agent đọc memory, tiếp tục từ nơi dừng lại

**Không cần plugin.** Rules trong `AGENTS.md` hướng dẫn agent phải làm gì.

## CLI Options

```bash
npx @vuau/agent-memory init [options]

Options:
  --force       Ghi đè files có sẵn mà không hỏi
  --name <n>    Tên project (mặc định: từ package.json)

npx @vuau/agent-memory doctor   # Validate structure
npx @vuau/agent-memory help     # Hiện help
```

## Memory Protocol

Agents follow protocol này (defined trong config files):

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
## Patterns
- 2026-04-24: State files = 3 layers (interfaces → defaults → variants)
- 2026-04-24: Dumb components: initialState prop + optional callbacks

## Decisions
- 2026-04-06: Use useMediaQuery over CSS display:none cho heavy components
```

## Kiến trúc

### Thiết kế 4-Layer

| Layer | File | Mục đích |
|-------|------|----------|
| Router | AGENTS.md | Rules + pointers (~100 dòng) |
| Memory | .agents/MEMORY.md | Curated decisions (1-line each) |
| Tasks | .agents/TASKS.md | Current work, next steps |
| Specs | .agents/spec/*.md | Detailed docs (on-demand) |

### Tại sao File-Based?

Chúng tôi đã test memsearch, qmd, mem0, memories.sh — tất cả failed vì nhiều lý do (xem [RESEARCH.md](./docs/RESEARCH.md)):

- **Context Blindness**: Auto-capture không thể link user intent với prior analysis
- **Context Bloat**: Fallback sang transcripts tốn 47k+ tokens
- **Platform issues**: Dependencies không work trên Windows/VM

File-based solution:
- Agent ghi khi họ hiểu context (quality > automation)
- Plain markdown (portable, git-versionable, human-readable)
- Không dependencies (works everywhere)

## Cross-IDE Compatibility

Mặc định, công cụ chỉ scaffold `AGENTS.md`, một chuẩn router file đang phổ biến.

Nếu công cụ của bạn yêu cầu một file cụ thể (vd: Cursor yêu cầu `.cursorrules`, GitHub Copilot yêu cầu `.github/copilot-instructions.md`), bạn có thể đơn giản dùng symlink hoặc copy `AGENTS.md`:

```bash
# Cho Cursor
ln -s AGENTS.md .cursorrules

# Cho GitHub Copilot
mkdir -p .github && ln -s ../AGENTS.md .github/copilot-instructions.md
```

Tất cả các công cụ sẽ cùng đọc chung cấu trúc bộ nhớ bên trong thư mục `.agents/`.

## Tài liệu

- **[RESEARCH.md](./docs/RESEARCH.md)** — Vấn đề, thử nghiệm, so sánh, tại sao file-based thắng
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — 4-layer design, scalability, migration

## License

MIT
