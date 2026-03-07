---
name: vibestak-dashboard
description: "Business dashboard tracking goals, metrics, kanban, calendar, and history."
---

# VibeStack Dashboard

Track all business metrics in one place.

## Usage

```bash
# View dashboard
node vibestak-dashboard/scripts/view.mjs

# Update a metric
node vibestak-dashboard/scripts/update.mjs --type followers --platform x --count 100

# Add kanban item
node vibestak-dashboard/scripts/kanban.mjs add "Launch Details Course" --status todo

# View calendar
node vibestak-dashboard/scripts/calendar.mjs
```

## Data Tracked

### Goals
- Long-term (2026: $40K MRR)
- Short-term (monthly targets)
- Weekly objectives

### Metrics (Daily)
- Followers (X, TikTok, YouTube, Reddit)
- Revenue (MRR, daily sales)
- Waitlist signups
- Website traffic

### Kanban
- To Do
- In Progress  
- Done
- Blocked (headwinds)
- Accelerating (tailwinds)

### Calendar
- Scheduled content
- Product launches
- Cron jobs history
- Events

### History
- Daily summaries
- Major milestones
- Learnings
