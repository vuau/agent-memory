# Research: Why the Team Chose File-Based Agent Memory

> Decision memo based on the team's operating constraints.
> External research source: [spikelab/memory-systems-ai-agents-research.md](https://gist.github.com/spikelab/7551c6368e23caa06a4056350f6b2db3) — researched 2025-12-02, updated 2026-02-06, 60+ sources.

---

## Decision

The team chose **file-based memory coordinated by `AGENTS.md`**.

Reason: best fit for the team's constraints, not because it is universally best.

---

## Constraints

The team needs a memory system that is:

- Local-first
- Cross-platform: Host + VM, Windows 11 + Linux
- Usable across editors via one control file: `AGENTS.md`
- Cheap in token overhead
- Reliable in retrieval
- Transparent and auditable

---

## Alternatives Considered

| Tool | Good at | Why not chosen |
|------|---------|----------------|
| **qmd** | Local search | `better-sqlite3` and HuggingFace requirements break Windows/VM portability |
| **memsearch** | Auto-capture | Windows packaging issues plus context blindness and transcript bloat |
| **mem0** | Managed long-term memory | Requires OpenAI API or HuggingFace, violates local-first constraint |
| **memories.sh** | MCP-based memory | Generates many tool/editor config files, conflicts with minimal centralized control |
| **codemem** | Lightweight idea | Retrieval/save behavior too flaky for decision memory |
| **File-based + rules** | Simplicity, portability, auditability | Chosen |

---

## Why This Approach Fits the Team

### 1. Portability First

Plain text works everywhere. No native modules, no vector DB, no model downloads, no build tool chain.

### 2. Better Context Linking

Automatic capture often stores events without enough surrounding intent. File-based memory shifts write time to the moment when the agent already understands the decision.

That matters more than raw capture volume.

### 3. Low Overhead

Team experience: curated notes plus spec pointers are dramatically cheaper than replaying raw transcripts.

External research points same direction:

- Letta reports plain filesystem memory reached **74% on LoCoMo**, outperforming specialized memory tool libraries in that benchmark.
- Mem0 claims large token savings versus replaying full conversation history.

Takeaway: curated memory can be good enough long before sophisticated infrastructure pays off.

### 4. Single Control Surface

The team now standardizes on `AGENTS.md`.

That keeps instruction routing centralized instead of scattering behavior across per-tool memory systems and generated config files.

### 5. Auditability

Markdown in git is easy to inspect, diff, review, sync, and repair. That is operationally simpler than SQLite, graph stores, or opaque hosted systems.

---

## Evidence

### Personal Observations

- Windows/VM compatibility is a real blocker for native-module and model-heavy tools.
- Auto-capture systems can fail to connect a later command like "remember this" with the earlier analysis that gave it meaning.
- When fallback retrieval pulls transcripts instead of distilled memory, token cost becomes unreasonable.
- Repo clutter matters. A memory system that spreads configuration across many files raises maintenance cost.

### External Research

- **Filesystem is stronger than expected**: Letta benchmarked file-backed memory at **74% on LoCoMo**.
- **Reflect pattern is emerging**: Claude Diary, fsck.com's episodic memory, and claude-mem all use some form of observation plus reflection loop.
- **Sophisticated systems do help**: Mem0 and Zep show better retrieval and richer memory operations when infrastructure is acceptable.
- **Field still fragmented**: surveys from 2025-2026 show no single architecture has clearly won.

---

## Current Architecture

```
Layer 1: AGENTS.md
- Critical rules
- Routing pointers
- Single entrypoint

Layer 2: .agents/MEMORY.md
- Curated one-line decisions
- Fast scan

Layer 3: .agents/TASKS.md
- In-progress work
- Session continuity

Layer 4: .agents/spec/*.md
- Detailed patterns
- Loaded only on demand
```

Design principle: **progressive disclosure**. Read a small amount first, then follow pointers only when needed.

---

## Trade-offs

This choice is pragmatic, not free.

1. **Manual discipline required**
Agents must write useful memory entries. If they do not, memory quality degrades.

2. **No semantic retrieval layer**
Keyword scan and file pointers are simpler, but weaker than graph or vector retrieval once memory grows.

3. **No temporal weighting or decay**
We do not rank memories by freshness, importance, or confidence.

4. **Lower ceiling**
Specialized systems can outperform file-based memory on harder multi-session retrieval problems.

---

## When To Reconsider

Revisit this choice if any of these become true:

- Team grows beyond roughly 10 people
- Memory store grows beyond a few hundred important entries
- We need semantic retrieval across many related projects
- We need automatic capture with less reliance on agent discipline
- We need temporal ranking, decay, or confidence scoring

At that point, a hybrid design may make more sense: file-based decision memory plus indexed search over archived sessions.

---

## Non-Goals

- Not trying to build a universal memory layer for every agent platform
- Not trying to maximize benchmark accuracy at any infrastructure cost
- Not replacing knowledge graphs or vector search for large-scale organizational memory
- Not solving long-term security hardening for persistent agent memory yet

---

## Conclusion

For the team's needs, file-based memory coordinated by `AGENTS.md` is the best current fit.

It wins on portability, simplicity, auditability, and cost. It loses on automation and retrieval sophistication. That is an acceptable trade for a small team working in constrained environments.

---

## Sources

- [spikelab/memory-systems-ai-agents-research.md](https://gist.github.com/spikelab/7551c6368e23caa06a4056350f6b2db3)
- Letta benchmark discussion and filesystem results, as cited in the source above
- Mem0 architecture and performance claims, as cited in the source above
- Claude Diary, fsck.com episodic memory, and claude-mem examples, as cited in the source above
