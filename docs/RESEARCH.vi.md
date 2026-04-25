# Nghiên cứu: Giải pháp AI Memory — Các Tool Đã Thử & Tại Sao File-Based Thắng

## Bài toán

AI assistants (OpenCode, Copilot, Cursor, Windsurf) mất context giữa sessions. Chúng cần:
- ✅ Local-first (không API key)
- ✅ Cross-IDE (OpenCode, VS Code, Windsurf, Antigravity)
- ✅ Cross-platform (Host + VM, Windows 11 + Linux)
- ✅ Persistent memory cho decisions
- ✅ Token overhead thấp
- ✅ Retrieval đáng tin cậy

## Các Tool Đánh giá

| Tool | Auto-capture | VM compatible | Blocker | Trạng thái |
|------|--------------|---------------|---------|-----------|
| **qmd** | ❌ (search only) | ❌ | better-sqlite3 cần Visual Studio Build Tools; HuggingFace blocked | ❌ Failed |
| **memsearch** | ✅ (daemon) | ❌ | milvus-lite không có Windows wheels; HuggingFace blocked | ❌ Failed |
| **mem0** | ✅ (hooks) | ❌ | Cần OpenAI API key hoặc HuggingFace models | ❌ Failed |
| **memories.sh** | ✅ (MCP) | ✅ | Auto-generate 10+ IDE config files (bloat repo) | ⚠️ Rejected |
| **codemem** | ❌ | ❌ | Flaky (unreliable save/recall) | ⚠️ Rejected |
| **File-based + rules** | Manual (via rules) | ✅ | None | ✅ **CHOSEN** |

---

## Tại Sao Mỗi Cái Failed

### qmd
**Blocker**: `better-sqlite3` native module cần Visual Studio Build Tools để compile trên Windows. HuggingFace cũng bị blocked.
**Impact**: Không chạy được trên VM Windows 11 → phá vỡ cross-platform requirement.

### memsearch
**Blockers**:
1. `milvus-lite` không có pre-built wheels cho Windows → phải compile từ source
2. HuggingFace bị blocked trong isolated environments
3. **Context Blindness**: Auto-capture không thể liên kết lệnh user ("remember this info") với 10-line analysis từ turn trước → ghi "No context provided" error
4. **Context Bloat**: Fallback sang `memory_transcript`, kéo 19 old tool calls vào context = **47,389 tokens (24% of context budget)**

**Impact**: Unreliable trên Windows + VM. Token cost làm nó unusable.

### mem0
**Blocker**: Cần OpenAI API key hoặc HuggingFace (cả hai violate "local-first, no API key").
**Impact**: Không phù hợp với local-first requirement.

### memories.sh
**Đánh giá lại**:
- ✅ CLI tool (tốt)
- ✅ Local-first (tốt)
- ✅ MCP support (cross-IDE capable)
- ✅ Clear memory fragmentation (Session, Semantic, Episodic, Procedural)
- ❌ **Auto-generate 10+ config files per IDE** (`.memories.sh` cho Zsh, Bash, Fish, Zed, Helix, Neovim, etc.)
- ❌ Conflict với "lightweight, centralized control" goal

**Decision**: Violate architecture principle của keeping configuration minimal. Repo bị clutter.

### codemem
**Issue**: Flaky (thỉnh thoảng save được, thỉnh thoảng không). Retrieval không consistent.
**Impact**: Không thể rely on cho critical decisions.

---

## Tại Sao File-Based Thắng

### 1. **Không Environmental Blockers**
- Plain text files hoạt động everywhere (Host, VM, Windows 11, Linux)
- Không native modules, không HuggingFace, không build tools
- ✅ Cross-platform by default

### 2. **Xử lý Context Blindness**
- **Vấn đề với auto-capture**: System không thể reliably link user intent ("remember this") tới prior technical analysis
- **Solution**: Agents ghi memory **khi họ hiểu context**
  - Agent vừa explore xong codebase → ghi 1-line decision
  - User approved decision → agent append vào MEMORY.md
  - Agent read MEMORY.md trước implement → follow pointer tới spec file
- Result: Context always linked vì agent đang trong session khi ghi

### 3. **Giải quyết Context Bloat**
- Auto-capture tools fail gracefully → pull raw transcripts (~47k tokens)
- File-based store curated 1-liners (~200 tokens)
- **66x cheaper per session**

### 4. **IDE Portability**
| IDE | Integration | Works Now |
|-----|-------------|-----------|
| OpenCode | Reads `AGENTS.md` | ✅ Yes |
| GitHub Copilot | Reads `.github/copilot-instructions.md` | ✅ Yes |
| Cursor | Reads `.cursorrules` | ✅ Yes |
| Windsurf | Reads `.windsurfrules` | ✅ Yes |

Không cần custom plugin per IDE. Markdown portable.

### 5. **Sharing & Sync**
- Live trong git repo → auto-shared via Git/Rsync/Dropbox
- Developers thấy decision history trong commits
- Có thể backup, version, audit
- Không external database để sync qua machines

### 6. **Transparent & Auditable**
- Human-readable: có thể review MEMORY.md trực tiếp
- Không "locked in SQLite/Vector DB" problem
- Không cần export/import
- Git history show ai decided what và khi nào

---

## Kiến trúc: Thiết kế 4 Lớp

### Tại Sao 4 Lớp?

**Vấn đề**: Automatic memory systems fail khi:
1. Không thể link user intent tới prior context (blindness)
2. Generate massive output khi fallback fails (bloat)
3. Không portable qua environments

**Solution**: Explicit layers tách concerns:

```
Lớp 1: Router (AGENTS.md, ~100 dòng)
├─ Critical rules + pointers only
└─ Mọi IDE đọc first

Lớp 2: Memory (MEMORY.md, ~150 dòng)
├─ Curated 1-line decisions
├─ Category headers với spec pointers
└─ Agent đọc trước implement

Lớp 3: Tasks (TASKS.md)
├─ Current work, in-progress, next steps
└─ Enable session continuity

Lớp 4: Specs (spec/*.md, on-demand)
├─ Detailed patterns, examples
├─ Referenced bởi Lớp 2
└─ Agent load chỉ khi cần
```

**Progressive Disclosure**: Agents đọc ~200 tokens initially, follow pointers on-demand. Same token cost regardless of project size.

---

## So sánh Token Cost

### Session 1: Tìm Storybook Rules (memsearch)
```
memory_search query:           100 tokens
memory_get fails              (file lock)
↓ fallback to memory_transcript
memory_transcript (19 calls): 47,389 tokens
TOTAL:                        47,489 tokens
```

### Session 2: Tìm Storybook Rules (file-based)
```
Read MEMORY.md:                 200 tokens
Follow pointer → spec file:     500 tokens
TOTAL:                          700 tokens
```

**Ratio**: 66x cheaper với file-based approach.

---

## Tại Sao "Manual" (Agent Rules) > "Automatic"

### Automatic Capture (memsearch, qmd, mem0)
- ❌ Context Blindness: Không thể link decision tới prior context
- ❌ Context Bloat: Fallback kéo massive raw data
- ❌ Platform Bloat: Cần dependencies (sqlite, milvus, HF)
- ✅ Zero manual effort

### Agent Rules (File-based)
- ✅ Context aware: Agent ghi khi họ hiểu
- ✅ Curated: Chỉ important decisions sống sót
- ✅ Portable: Hoạt động everywhere (no dependencies)
- ✅ Không cần maintain plugin

**Verdict**: Quality + Portability > Automation cho teams 1-10.

---

## Cross-IDE Reality Check

### ✅ Gì hoạt động ngay
- OpenCode: Read `AGENTS.md` natively
- Copilot: Read `.github/copilot-instructions.md` natively
- Cursor: Read `.cursorrules`
- Windsurf: Read `.windsurfrules`

Tất cả IDEs follow rules trong config file → agent ghi vào `.agents/MEMORY.md` khi appropriate.

---

## Kết luận

**Cho teams 1-10 làm việc trên focused projects:**

File-based memory + agent rules thắng mọi alternative vì nó:
1. Hoạt động trên VM Windows 11 (no build tools, no native modules)
2. Không bloat token budget (700 vs 47k tokens)
3. Hoạt động với all IDEs mà không cần custom drivers
4. Share naturally via git (Host ↔ VM ↔ Team)
5. Transparent và auditable

**Automated memory capture fails** vì:
- Context Blindness: Không thể reliably link user intent tới prior analysis
- Context Bloat: Fallback sang raw transcripts cost 47k+ tokens
- Platform bloat: Cần dependencies không compile trên Windows/VM

**Trade-off đúng**: Hy sinh full automation cho reliability, portability, và cost.
