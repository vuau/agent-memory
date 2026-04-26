# @vuau/agent-memory

Bộ nhớ AI có cấu trúc cho các codebase. Hoạt động với GitHub Copilot, Cursor, Windsurf, và bất kỳ AI coding assistant nào đọc markdown files.

**[English →](./README.md)**

## Bài toán

AI coding assistants mất bối cảnh giữa các phiên làm việc. Họ không thể nhớ các quyết định kiến trúc, các mẫu thiết kế cụ thể, hoặc các task đang làm dở. **agent-memory** giải quyết vấn đề này bằng một hệ thống bộ nhớ đơn giản dựa trên file mà bất kỳ AI nào cũng có thể đọc và cập nhật.

## Bắt đầu nhanh

```bash
npx @vuau/agent-memory init
```

## Cấu trúc tạo ra

```
/ (Project Root)
├── AGENTS.md                    # Router cố định (quản lý bởi package)
└── .agents/
    ├── CUSTOM.md                # Rules riêng của project & mapping tài liệu
    ├── MEMORY.md                # Bộ nhớ dài hạn (quyết định, patterns)
    ├── TASKS.md                 # Bộ nhớ làm việc (tasks hiện tại)
    └── spec/                    # Tài liệu kỹ thuật chi tiết (on-demand)
```

## Cách hoạt động

1. **Bạn chạy `init`** → Tạo cấu trúc thư mục. `AGENTS.md` sẽ trỏ đến `.agents/CUSTOM.md`.
2. **Agent đọc rules** → Tuân theo ưu tiên: CUSTOM.md > AGENTS.md > spec files.
3. **Agent làm việc** → Cập nhật MEMORY.md cho các quyết định và TASKS.md cho tiến độ công việc.
4. **Cập nhật package** → Chạy `agent-memory update` để nhận router `AGENTS.md` mới nhất mà không mất các rules tùy chỉnh của bạn.

## Các lệnh CLI

```bash
npx @vuau/agent-memory init      # Khởi tạo cấu trúc .agents/
npx @vuau/agent-memory update    # Cập nhật router AGENTS.md lên bản mới nhất
npx @vuau/agent-memory doctor    # Kiểm tra tính toàn vẹn của cấu trúc
npx @vuau/agent-memory help      # Hiện trợ giúp
```

## Kiến trúc

### Phân tách Router

- **AGENTS.md**: Router cốt lõi được quản lý bởi thư viện. Không sửa file này trực tiếp vì nó có thể bị ghi đè khi update.
- **.agents/CUSTOM.md**: Nơi dành riêng cho dự án của bạn để viết custom rules, quyết định kiến trúc và mapping tài liệu.

### Các file bộ nhớ

| File | Mục đích |
|------|----------|
| .agents/MEMORY.md | Các quyết định quan trọng (mỗi dòng 1 quyết định) |
| .agents/TASKS.md | Công việc hiện tại và các bước tiếp theo |
| .agents/spec/*.md | Tài liệu kỹ thuật chi tiết |

## Tại sao dùng File-Based?

- **Chính xác**: AI chỉ ghi dữ liệu khi đã hiểu rõ bối cảnh (chất lượng > tự động hóa).
- **Linh hoạt**: Markdown đơn thuần, dễ di chuyển, có thể quản lý bằng Git và con người có thể đọc được.
- **Tối giản**: Không phụ thuộc bên ngoài, không chạy ngầm, không cần API keys.

## License

MIT
