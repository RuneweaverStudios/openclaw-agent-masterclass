# Cron Job Commands

## Install Smart Compact Cron Job

```bash
(echo "*/30 * * * * cd ~/.openclaw/workspace && /opt/homebrew/bin/node skills/smart-compact/scripts/compact.mjs >> /tmp/smart-compact.log 2>&1"; crontab -l) | crontab -
```

## Verify Installation

```bash
crontab -l | grep smart-compact
```

## Check Logs

```bash
tail -f /tmp/smart-compact.log
```

## Manual Run

```bash
cd ~/.openclaw/workspace
node skills/smart-compact/scripts/compact.mjs
```

## Current Crontab (as of March 6, 2026)

```
# Content Engine - Every 3 hours
0 */3 * * * /opt/homebrew/bin/node ~/.openclaw/workspace/skills/content-engine/scripts/run.mjs >> ~/.openclaw/workspace/logs/content-engine.log 2>&1

# Polysauce Leaderboard - Daily at 2pm
0 14 * * * cd ~/Projects/polysauce && /opt/homebrew/bin/node scripts/update-leaderboard.js --push >> /tmp/polysauce-leaderboard.log 2>&1

# Daily Calendar Bot - Daily at 5am
0 5 * * * /opt/homebrew/bin/python3 ~/.openclaw/workspace/scripts/daily-calendar.py >> ~/.openclaw/workspace/logs/daily-calendar.log 2>&1

# Smart Compact - Every 30 minutes (TO BE INSTALLED)
*/30 * * * * cd ~/.openclaw/workspace && /opt/homebrew/bin/node skills/smart-compact/scripts/compact.mjs >> /tmp/smart-compact.log 2>&1
```

## All Cron Jobs

```bash
# List all cron jobs
crontab -l

# Edit crontab
crontab -e

# Remove all cron jobs (CAREFUL!)
crontab -r
```
