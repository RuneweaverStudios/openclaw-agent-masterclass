---
name: content-engine
description: "Automated content creation engine. Use when: (1) scheduling automated posts, (2) generating daily content about AI agents, (3) creating tutorials from research, (4) building a content calendar. Runs on cron: every 3 hours. Integrates askvault (research), thread-writer (create), humanizer-pro (polish), tweet-formatter (optimize), visual-explainer/remotion-studio (visuals), Postiz (post)."
---

# Content Engine — Automated Content Pipeline

Runs every 3 hours to research, create, and publish content.

## What It Does

```
Cron (every 3 hours)
    ↓
askvault → Research trending topics
    ↓
tweet-formatter → Pick best format
    ↓
thread-writer → Generate content
    ↓
humanizer-pro → Make it human
    ↓
remotion-studio → Create visual
    ↓
Postiz → Schedule post
```

## Usage

```bash
# Run once
node content-engine/scripts/run.mjs

# Schedule via cron (every 3 hours)
# Add to crontab:
# 0 */3 * * * cd ~/.openclaw/workspace && node skills/content-engine/scripts/run.mjs
```

## Content Types (Rotates)

1. **Tips & Tricks** — "I spent months figuring this out..."
2. **Underrated Skills** — "This OpenClaw skill nobody uses..."
3. **Tutorials** — "How to X in Y steps"
4. **Hot Takes** — "Unpopular opinion about..."
5. **Results** — "After 30 days of..."
6. **Tool Deep-dives** — "Complete guide to..."

## Topics (Rotates)

- OpenClaw skills
- AI agent automation
- Productivity hacks
- Build in public
- Lessons learned
- Tool comparisons

## Visuals

Every tweet includes:
- Remotion-generated video/animation
- Or visual-explainer diagram
- Optimized for X/Twitter (1080x1920 for slideshows)

## Integration

- **askvault**: Find what resonates
- **tweet-formatter**: Apply viral patterns
- **thread-writer**: Generate content
- **humanizer-pro**: Remove AI patterns
- **remotion-studio**: Create visuals
- **visual-explainer**: Create diagrams
- **Postiz**: Schedule posts

## Setup Cron

```bash
# Edit crontab
crontab -e

# Add this line (every 3 hours)
0 */3 * * * /usr/bin/node ~/.openclaw/workspace/skills/content-engine/scripts/run.mjs >> ~/.openclaw/workspace/logs/content-engine.log 2>&1
```

## Logs

Check `~/.openclaw/workspace/logs/content-engine.log` for execution history.
