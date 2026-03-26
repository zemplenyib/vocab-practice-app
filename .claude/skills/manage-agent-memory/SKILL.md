---
name: manage-agent-memory
description: Shared memory management protocol for agents. Defines how to read, write, and prune project-scoped agent memory files.
---

## Memory location

Each agent has its own memory file at:
```
.claude/agent-memory/<agent-name>/memory.md
```

Examples:
- `.claude/agent-memory/feature-architect/memory.md`
- `.claude/agent-memory/feature-implementer/memory.md`
- `.claude/agent-memory/test-engineer/memory.md`

## Memory file format

```markdown
# <Agent Name> Memory

| # | Gotcha | Why it matters | Hits |
|---|--------|----------------|------|
| 1 | <short description of the surprise or mistake> | <why this caused a problem and what to do instead> | 0 |
```

- **Gotcha**: one concise sentence describing what went wrong or what was surprising
- **Why it matters**: one sentence on the consequence and the correct action
- **Hits**: incremented each time consulting this entry prevented a mistake

## When to read

At the **start** of every run, before doing any work:
1. Check if your memory file exists (`Glob` for it)
2. If it exists, read it and internalize all entries
3. Apply relevant entries to your current task

## When to write

Only write a new entry if **something unexpected happened** during this run:
- A tool call failed in a surprising way
- An assumption turned out to be wrong
- You had to retry or change approach mid-task
- You discovered a repo quirk not documented in CLAUDE.md

Do **not** write an entry for:
- Things that went smoothly
- Things already covered in CLAUDE.md or your agent instructions
- Generic advice not specific to this repo

## When to increment hits

Each time you read an entry and it actively influenced a decision you made, increment its `Hits` counter before finishing.

## Pruning rules

Keep the file lean — **max 15 entries**. When adding a new entry would exceed 15:
1. Consider only the 12 oldest entries (the 3 most recent are protected from pruning)
2. Remove the one with the lowest `Hits` among those 12
3. If tied, remove the oldest (lowest `#`)

If an entry has 5+ hits, consider whether it should be promoted to `CLAUDE.md` as a permanent rule — then remove it from memory (it's no longer a surprise).
