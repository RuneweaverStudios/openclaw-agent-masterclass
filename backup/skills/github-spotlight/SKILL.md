---
name: github-spotlight
description: "Daily GitHub project spotlight. Use when: (1) finding trending GitHub repos, (2) showcasing cool open source projects, (3) inspiring builders with real tools, (4) building thought leadership through curation. Runs daily via cron. Integrates askvault for research, humanizer-pro for writing, and Postiz for posting + commenting."
---

# GitHub Spotlight — Daily Repo Showcase

Every day, find and spotlight an awesome GitHub project.

## What It Does

```
Daily Cron
    ↓
askvault → Find trending/repo projects
    ↓
Research → Fetch repo details
    ↓
Write → Praise builder, showcase utility
    ↓
Humanize → Make it authentic
    ↓
Post via Postiz
    ↓
Comment → Add GitHub link
```

## Usage

```bash
# Run manually
node github-spotlight/scripts/run.mjs

# Set up cron (once per day at 9am)
# 0 9 * * * /usr/bin/node ~/.openclaw/workspace/skills/github-spotlight/scripts/run.mjs
```

## Content Formula

### The Post
1. **Hook** — Eye-catching claim about the project
2. **What it does** — 1-2 sentence summary
3. **Why it matters** — The problem it solves
4. **Builder praise** — Name + work acknowledgment
5. **CTA** — "Go star it" / "Build with it"

### The Comment
- GitHub repo link
- Additional context or resources

## Example Output

```
This project just changed how I think about AI agents.

It's an open-source tool that lets you orchestrate multiple AI models working together — no API wrangling, just pure functionality.

The builder (@username) shipped something genuinely useful.

Go star it before it blows up:

[GitHub Link]

#OpenSource #AI #Builders
```

## Integration

- **askvault**: Find trending GitHub projects
- **humanizer-pro**: Authentic writing
- **Postiz**: Post + comment with GitHub link
- **charlie**: Part of content pipeline

## Cron Setup

```bash
# Add to crontab - run daily at 9am
crontab -e

# Add this line:
0 9 * * * /usr/bin/node ~/.openclaw/workspace/skills/github-spotlight/scripts/run.mjs >> ~/.openclaw/workspace/logs/github-spotlight.log 2>&1
```

## Topics to Find

- AI agents
- OpenClaw / agent tools
- Developer productivity
- Automation
- Open source utilities
- Interesting tech

## Logs

Check `~/.openclaw/workspace/logs/github-spotlight.log`
