---
name: daily-review
description: "Daily review at midnight. Extracts key learnings from logs and saves to memory."
---

# Daily Review

Runs at 12am to review the day's activity and save learnings to MEMORY.md.

## What It Does

1. Read all log files from ~/.openclaw/workspace/logs/
2. Extract key events and learnings
3. Update MEMORY.md with daily summary

## Cron

0 0 * * * (midnight)

## Output

Saved to MEMORY.md under "Daily Logs"
