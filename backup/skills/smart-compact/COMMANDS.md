# Smart Compact - Quick Commands

## Status

```bash
# Check if running
launchctl list | grep smart-compact

# Expected output:
# -	0	com.openclaw.smart-compact
```

## Logs

```bash
# View recent logs
tail -20 /tmp/smart-compact.log

# Follow logs in real-time
tail -f /tmp/smart-compact.log
```

## Manual Control

```bash
# Run manually now
launchctl start com.openclaw.smart-compact

# Stop the agent
launchctl stop com.openclaw.smart-compact

# Start the agent
launchctl start com.openclaw.smart-compact

# Unload (disable completely)
launchctl unload ~/Library/LaunchAgents/com.openclaw.smart-compact.plist

# Load (re-enable)
launchctl load ~/Library/LaunchAgents/com.openclaw.smart-compact.plist
```

## Stats

```bash
# Check memory stats
cd ~/.openclaw/workspace
node skills/smart-compact/scripts/stats.mjs
```

## Manual Compaction

```bash
# Dry run (preview)
node skills/smart-compact/scripts/compact.mjs --dry-run

# Run now
node skills/smart-compact/scripts/compact.mjs
```

## Files

- **LaunchAgent:** `~/Library/LaunchAgents/com.openclaw.smart-compact.plist`
- **Script:** `/workspace/skills/smart-compact/scripts/compact.mjs`
- **Config:** `/workspace/skills/smart-compact/config.json`
- **Log:** `/tmp/smart-compact.log`
- **Archive:** `/workspace/memory/archive/`
- **Backups:** `/workspace/memory/backups/`

## Schedule

- **Frequency:** Every 30 minutes (1800 seconds)
- **Next run:** Check with `launchctl list | grep smart-compact`

## Troubleshooting

**Not running?**
```bash
launchctl load ~/Library/LaunchAgents/com.openclaw.smart-compact.plist
```

**Errors in log?**
```bash
tail -50 /tmp/smart-compact.log
```

**Want to change frequency?**
Edit `~/Library/LaunchAgents/com.openclaw.smart-compact.plist`
Change `<integer>1800</integer>` to desired seconds (e.g., 900 = 15 min)
Then reload:
```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.smart-compact.plist
launchctl load ~/Library/LaunchAgents/com.openclaw.smart-compact.plist
```
