# Smart Compact - Setup Guide

## What It Does

Prevents "model_context_window_exceeded" errors by:
1. Extracting key info from memory files
2. Storing to brain (vector DB) for semantic retrieval
3. Compacting files to keep them lean
4. Running automatically every 30 minutes

## Installation

The skill is already created at:
`~/.openclaw/workspace/skills/smart-compact/`

## Cron Job Setup

Add to your crontab (runs every 30 minutes):

```bash
*/30 * * * * cd ~/.openclaw/workspace && /opt/homebrew/bin/node skills/smart-compact/scripts/compact.mjs >> /tmp/smart-compact.log 2>&1
```

**To install:**

```bash
# Edit crontab
crontab -e

# Add this line at the bottom:
*/30 * * * * cd ~/.openclaw/workspace && /opt/homebrew/bin/node skills/smart-compact/scripts/compact.mjs >> /tmp/smart-compact.log 2>&1

# Save and exit
```

Or run this command:
```bash
(echo "*/30 * * * * cd ~/.openclaw/workspace && /opt/homebrew/bin/node skills/smart-compact/scripts/compact.mjs >> /tmp/smart-compact.log 2>&1"; crontab -l) | crontab -
```

## Manual Usage

```bash
# Check memory stats
node skills/smart-compact/scripts/stats.mjs

# Preview compaction (dry run)
node skills/smart-compact/scripts/compact.mjs --dry-run

# Run compaction now
node skills/smart-compact/scripts/compact.mjs

# View logs
tail -f /tmp/smart-compact.log
```

## Current Status

```
📊 Memory Stats

Memory Files:
- Total files: 4
- Total size: 31.1 KB
- Largest: 2026-03-05.md (15.0 KB)
- Files needing compaction: 2

Next Steps:
1. Install cron job (see above)
2. Let it run automatically
3. Never see "model_context_window_exceeded" again!
```

## How It Works

### Extraction Patterns

The script automatically extracts:
- **Decision:** - Important decisions
- **TODO:** - Tasks
- **IMPORTANT:** - Critical info
- **Goal:** - Objectives
- **Deadline:** - Dates
- **Payment Link:** - URLs
- **Status:** - Current state
- **Next Steps:** - Action items

All extracted to brain (vector DB) for semantic search.

### What Gets Kept

- Headers and structure
- Recent content (< 7 days)
- Lines marked with 🔐 or SECRET
- Empty lines (formatting)

### What Gets Archived

- Old completed tasks (> 7 days)
- Detailed logs
- Transient information

Archived files saved to:
`/memory/archive/YYYY-MM-DD.md.archive`

## Testing

```bash
# Run a test
cd ~/.openclaw/workspace
node skills/smart-compact/scripts/compact.mjs --dry-run --verbose

# Expected output:
# - Extracted X items to brain
# - Compacted: Y KB (saved Z%)
# - No errors
```

## Monitoring

Check the log file to see compaction history:

```bash
tail -f /tmp/smart-compact.log
```

Example output:
```
[5:30 AM] Smart Compact
Analyzing 4 memory files...
📄 2026-03-05.md (15.0 KB)
  Extracted 7 items to brain
  Compacted: 5.2 KB (saved 65%)

Next run: 6:00 AM
```

## Benefits

✅ **Prevents context overflow** - Keeps files under 10 KB
✅ **Preserves important info** - Extracted to brain
✅ **Semantic search** - Find anything via meaning
✅ **Automatic** - Runs every 30 minutes
✅ **Safe** - Creates backups before compacting
✅ **Reversible** - Archived files can be restored

## Troubleshooting

**"Brain not responding"**
- Normal if brain isn't set up yet
- Compaction still works, just skips brain storage
- To set up brain: `cd skills/brain && npm install`

**"No files to compact"**
- All files are under size limit (good!)
- Will compact when they grow

**"Crontab not running"**
- Check: `crontab -l`
- Verify path to node: `which node`
- Check logs: `tail /tmp/smart-compact.log`

---

**Status:** ✅ Ready to use
**Next:** Install cron job and let it run automatically
