# Research: AI Memory Solutions — Tools Tried & Why File-Based Won

## The Problem

AI assistants (OpenCode, Copilot, Cursor, Windsurf) lose context between sessions. They need:
- ✅ Local-first (no API keys)
- ✅ Cross-IDE (OpenCode, VS Code, Windsurf, Antigravity)
- ✅ Cross-platform (Host + VM, Windows 11 + Linux)
- ✅ Persistent memory for decisions
- ✅ Low token overhead
- ✅ Reliable retrieval

## Tools Evaluated

| Tool | Auto-capture | VM compatible | Blocker | Status |
|------|--------------|---------------|---------|--------|
| **qmd** | ❌ (search only) | ❌ | better-sqlite3 needs Visual Studio Build Tools; HuggingFace blocked | ❌ Failed |
| **memsearch** | ✅ (daemon hooks) | ❌ | milvus-lite has no Windows wheels; HuggingFace blocked | ❌ Failed |
| **mem0** | ✅ (hooks) | ❌ | Requires OpenAI API key or HuggingFace models | ❌ Failed |
| **memories.sh** | ✅ (MCP) | ✅ | Auto-generates 10+ IDE config files (bloats repo) | ⚠️ Rejected |
| **codemem** | ❌ | ❌ | Flaky (unreliable save/recall) | ⚠️ Rejected |
| **File-based + rules** | Manual (via rules) | ✅ | None | ✅ **CHOSEN** |

---

## Why Each Failed

### qmd
**Blocker**: `better-sqlite3` native module requires Visual Studio Build Tools to compile on Windows. HuggingFace is also blocked in many environments.
**Impact**: Cannot run on VM Windows 11 → breaks cross-platform requirement.

### memsearch
**Blockers**:
1. `milvus-lite` has no pre-built wheels for Windows → must compile from source
2. HuggingFace models blocked in isolated environments
3. **Context Blindness**: Auto-capture can't link user command ("remember this info") to 10-line analysis from previous turn → writes "No context provided" error
4. **Context Bloat**: Falls back to `memory_transcript`, pulling 19 old tool calls into context = **47,389 tokens (24% of context budget)**

**Impact**: Unreliable on Windows + VM. Token cost makes it unusable for real work.

### mem0
**Blocker**: Requires OpenAI API key or HuggingFace (both violate "local-first, no API key" requirement).
**Impact**: Not viable for local-first requirement.

### memories.sh
**Reevaluation**:
- ✅ CLI tool (good)
- ✅ Local-first (good)
- ✅ MCP support (cross-IDE capable)
- ✅ Clear memory fragmentation (Session, Semantic, Episodic, Procedural)
- ❌ **Auto-generates 10+ config files per IDE** (`.memories.sh` configs for Zsh, Bash, Fish, Zed, Helix, Neovim, etc.)
- ❌ Conflicts with "lightweight, centralized control" goal

**Decision**: Violates architecture principle of keeping configuration minimal and in one place. Repository becomes cluttered.

### codemem
**Issue**: Flaky (sometimes saves, sometimes doesn't). No consistent retrieval.
**Impact**: Cannot be relied upon for critical decisions.

---

## Why File-Based Won

### 1. **No Environmental Blockers**
- Plain text files work everywhere (Host, VM, Windows 11, Linux)
- No native modules, no HuggingFace, no build tools required
- ✅ Cross-platform by default

### 2. **Handles Context Blindness**
- **Problem with auto-capture**: System can't reliably link user intent ("remember this") to prior technical analysis
- **Solution**: Agents write memory **when they understand context**
  - Agent just finished exploring codebase → writes 1-line decision
  - User approved decision → agent appends to MEMORY.md
  - Agent reads MEMORY.md before implementing → follows pointer to spec file
- Result: Context is always linked because agent is in session when writing

### 3. **Solves Context Bloat**
- Auto-capture tools fail gracefully → pull raw transcripts (~47k tokens)
- File-based stores curated 1-liners (~200 tokens)
- **66x cheaper per session**

### 4. **IDE Portability**
| IDE | Integration | Works Now |
|-----|-------------|-----------|
| OpenCode | Reads `AGENTS.md` | ✅ Yes |
| GitHub Copilot | Reads `.github/copilot-instructions.md` | ✅ Yes |
| Cursor | Reads `.cursorrules` | ✅ Yes |
| Windsurf | Reads `.windsurfrules` | ✅ Yes |

No custom plugin needed per IDE. Markdown is portable.

### 5. **Sharing & Sync**
- Lives in git repo → automatically shared via Git/Rsync/Dropbox
- Developers see decision history in commits
- Can be backed up, versioned, audited
- No external database to sync across machines

### 6. **Transparent & Auditable**
- Human-readable: can review MEMORY.md directly
- No "locked in SQLite/Vector DB" problem
- No export/import needed
- Git history shows who decided what and when

---

## Architecture: 4-Layer Design

### Why 4 Layers?

**Problem**: Automatic memory systems fail when:
1. They can't link user intent to prior context (blindness)
2. They generate massive output when fallback fails (bloat)
3. They aren't portable across environments

**Solution**: Explicit layers that separate concerns:

```
Layer 1: Router (AGENTS.md, ~100 lines)
├─ Critical rules + pointers only
└─ Every IDE reads this first

Layer 2: Memory (MEMORY.md, ~150 lines)
├─ Curated 1-line decisions
├─ Category headers with spec pointers
└─ Agent reads before implementing

Layer 3: Tasks (TASKS.md)
├─ Current work, in-progress, next steps
└─ Enables session continuity

Layer 4: Specs (spec/*.md, on-demand)
├─ Detailed patterns, examples
├─ Referenced by Layer 2
└─ Agent loads only when needed
```

**Progressive Disclosure**: Agents read ~200 tokens initially, follow pointers on-demand. Same token cost regardless of project size.

---

## Token Cost Comparison

### Session 1: Find Storybook Rules (memsearch)
```
memory_search query:           100 tokens
memory_get fails              (file lock)
↓ fallback to memory_transcript
memory_transcript (19 calls): 47,389 tokens
TOTAL:                        47,489 tokens
```

### Session 2: Find Storybook Rules (file-based)
```
Read MEMORY.md:                 200 tokens
Follow pointer → spec file:     500 tokens
TOTAL:                          700 tokens
```

**Ratio**: 66x cheaper with file-based approach.

---

## Why "Manual" (Agent Rules) > "Automatic"

### Automatic Capture (memsearch, qmd, mem0)
- ❌ Context Blindness: Can't link decision to prior context
- ❌ Context Bloat: Fallback pulls massive raw data
- ❌ Platform Bloat: Needs dependencies (sqlite, milvus, HF)
- ✅ Zero manual effort

### Agent Rules (File-based)
- ✅ Context aware: Agent writes when they understand
- ✅ Curated: Only important decisions survive
- ✅ Portable: Works everywhere (no dependencies)
- ✅ No plugin maintenance burden

**Verdict**: Quality + Portability > Automation for teams of 1-10.

---

## Cross-IDE Reality Check

### ✅ What Works Now
- OpenCode: Reads `AGENTS.md` natively
- Copilot: Reads `.github/copilot-instructions.md` natively
- Cursor: Reads `.cursorrules`
- Windsurf: Reads `.windsurfrules`

All IDEs follow rules in their config file → agent writes to `.agents/MEMORY.md` when appropriate.

---

## Conclusion

**For teams 1-10 working on focused projects:**

File-based memory + agent rules beats every alternative because it:
1. Works on VM Windows 11 (no build tools, no native modules)
2. Doesn't bloat token budget (700 vs 47k tokens)
3. Works with all IDEs without custom drivers
4. Shares naturally via git (Host ↔ VM ↔ Team)
5. Is transparent and auditable

**Automated memory capture fails** because:
- Context Blindness: Can't reliably link user intent to prior analysis
- Context Bloat: Fallback to raw transcripts costs 47k+ tokens
- Platform bloat: Requires dependencies that don't compile on Windows/VM

**The right trade-off**: Sacrifice full automation for reliability, portability, and cost.
