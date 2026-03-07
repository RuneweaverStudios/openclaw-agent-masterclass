---
name: self-evolve
description: "Continuous self-improvement through structured learning capture. Use when: (1) a command or operation fails, (2) user corrects you, (3) you discover a better approach, (4) knowledge turns out to be outdated, (5) a recurring pattern emerges, (6) you want to review past learnings before a task. Logs learnings, errors, and feature requests to workspace files and promotes important patterns to AGENTS.md/SOUL.md/TOOLS.md."
---

# Self-Evolve

Log learnings and errors for continuous improvement. Lightweight — no bloat.

## File Structure

```
~/.openclaw/workspace/
├── .learnings/
│   ├── LEARNINGS.md    # Corrections, best practices, knowledge gaps
│   ├── ERRORS.md       # Command failures, exceptions
│   └── REQUESTS.md     # Feature requests, capability gaps
```

Create on first use: `mkdir -p ~/.openclaw/workspace/.learnings`

## When to Log

| Trigger | File | Category |
|---------|------|----------|
| Command fails | ERRORS.md | error |
| User says "no, actually..." | LEARNINGS.md | correction |
| Found better approach | LEARNINGS.md | best_practice |
| Knowledge was wrong/outdated | LEARNINGS.md | knowledge_gap |
| User wants missing feature | REQUESTS.md | feature |
| Same issue 3+ times | Promote to AGENTS.md/TOOLS.md | recurring |

## Entry Format

Keep entries compact — no bureaucratic metadata. Each entry:

```markdown
## YYYY-MM-DD | category | priority

**What happened:** One-line summary
**Context:** What was attempted and what went wrong
**Fix/Learning:** The correct approach
**Files:** relevant/paths (if any)

---
```

Priority: `critical` > `high` > `medium` > `low`

## Promotion Rules

When a learning proves broadly useful (seen 2+ times or applies everywhere):

| Pattern Type | Promote To |
|---|---|
| Behavioral (communication style, when to ask) | SOUL.md |
| Workflow (how to use tools, delegation) | AGENTS.md |
| Tool gotchas (API quirks, CLI flags) | TOOLS.md |

**How:** Distill to 1-2 lines. Add to appropriate section. Update original entry with `Status: promoted`.

## Quick Commands

```bash
# Count pending items
grep -c "priority" ~/.openclaw/workspace/.learnings/*.md

# Find entries about a topic
grep -r "keyword" ~/.openclaw/workspace/.learnings/

# List high priority
grep -B2 "high\|critical" ~/.openclaw/workspace/.learnings/*.md
```

## Review Triggers

- Before starting major tasks: scan recent learnings
- During heartbeats: review and promote if applicable
- After completing a project: log what was learned
