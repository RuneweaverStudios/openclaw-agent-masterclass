# HEARTBEAT.md - Active Heartbeat Tasks

Run these checks on each heartbeat poll:

## Memory Compaction (Every Heartbeat)

**CRITICAL:** Run smart-compact on EVERY heartbeat to keep context lean.

```bash
node ~/.openclaw/workspace/skills/smart-compact/scripts/compact.mjs
```

This will:
- Extract key learnings to brain
- Archive old content (>3 days)
- Reduce file sizes
- Keep you under token limits

## Dashboard (Quick View)

Run `node vibestak-dashboard/scripts/view.mjs` to see:
- Goals progress (MRR targets)
- Current metrics (waitlist, followers, revenue)
- Kanban board (todo, in progress, done, blocked, accelerating)
- Recent activity

## Kanban Update (Every Heartbeat)

On each heartbeat, check and update kanban:
- Any todo items that became in progress? Move them
- Any blocked items now unblocked? Move to todo
- Any in progress items done? Move to done
- Any wins (tailwinds)? Add to accelerating

Commands:
- Add to todo: `node vibestak-dashboard/scripts/kanban.mjs add "Task" --status todo`
- Move to doing: `node vibestak-dashboard/scripts/kanban.mjs move "Task" --to inProgress`
- Mark done: `node vibestak-dashboard/scripts/kanban.mjs done "Task"`
- Blocked: `node vibestak-dashboard/scripts/kanban.mjs block "Task"`
- Accelerating: `node vibestak-dashboard/scripts/kanban.mjs accelerate "Task"`

## Daily Business Building

- [ ] Check waitlist count (Supabase query)
- [ ] Check pending content (content-engine/pending, github-spotlight/pending)
- [ ] Review daily metrics (revenue, signups)
- [ ] Review session log for learnings

## Social Media (Charlie)

- [ ] Generate new content if none pending
- [ ] Check for engagement on recent posts
- [ ] Research trending topics via askvault
- [ ] Create content with thread-writer if needed

## Products

- [ ] Work on Details course (create tutorials)
- [ ] Build VibeStack OS (PaperClip wrapper)
- [ ] Prepare SkillFinder launch

## Goals Progress

- [ ] Check MRR vs $40K target
- [ ] Review follower growth
- [ ] Check product roadmap progress

## When to Alert Human

- MRR increases significantly
- Waitlist hits milestone (10, 50, 100)
- Technical issues requiring attention
- Major progress on products
