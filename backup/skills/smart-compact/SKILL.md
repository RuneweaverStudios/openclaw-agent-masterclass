---
name: smart-compact
description: "Intelligent memory compaction. Extracts key info, stores to brain, keeps context lean. Prevents context overflow errors."
---

# Smart Compact — Intelligent Memory Compaction

Automatically extracts key information from memory files, stores to brain (vector DB), and keeps conversation context minimal.

## Problem

- Context windows fill up → "model_context_window_exceeded" errors
- Long conversations become expensive
- Important info gets lost in noise

## Solution

1. **Extract** - Parse memory files for key information
2. **Store** - Save to brain (vector DB) for semantic retrieval
3. **Compact** - Keep only essential info in files
4. **Archive** - Move old content to archive

## Usage

```bash
# Run compaction manually
node smart-compact/scripts/compact.mjs

# Check what would be compacted (dry run)
node smart-compact/scripts/compact.mjs --dry-run

# View stats
node smart-compact/scripts/stats.mjs
```

## Automated (Cron)

Runs every 30 minutes:

```bash
# Add to crontab
*/30 * * * * cd ~/.openclaw/workspace && node smart-compact/scripts/compact.mjs >> /tmp/smart-compact.log 2>&1
```

## What Gets Compacted

### Extracted to Brain:
- ✅ Decisions and rationale
- ✅ Key learnings
- ✅ Important dates/deadlines
- ✅ Product requirements
- ✅ Customer feedback
- ✅ Meeting notes
- ✅ Technical decisions
- ✅ Preferences

### Kept in Files:
- 📝 Current session context
- 📝 Active projects
- 📝 Recent items (< 7 days)
- 📝 Unfinished tasks
- 📝 Critical info (passwords, keys - marked with 🔐)

### Archived:
- 📦 Old completed tasks
- 📦 Detailed logs > 7 days
- 📦 Transient information

## File Structure

```
smart-compact/
├── scripts/
│   ├── compact.mjs      # Main compaction script
│   ├── extract.mjs      # Extract key info
│   ├── stats.mjs        # Show memory stats
│   └── archive.mjs      # Archive old content
├── config.json          # Compaction rules
└── SKILL.md            # This file
```

## Configuration (config.json)

```json
{
  "memoryPath": "~/.openclaw/workspace/memory",
  "brainPath": "~/.openclaw/workspace/skills/brain",
  "archivePath": "~/.openclaw/workspace/memory/archive",
  "maxFileSize": 10000,
  "keepRecentDays": 7,
  "extractionPatterns": [
    "Decision:",
    "TODO:",
    "IMPORTANT:",
    "Key Learning:",
    "Deadline:",
    "Launch Date:",
    "Product:"
  ]
}
```

## Integration with Brain

All extracted information is stored to brain using:

```bash
node brain/scripts/capture.mjs "Decision: Use Stripe for payments" --topics "polysauce,payments" --importance "high"
```

This makes information searchable via semantic search:
```bash
node brain/scripts/search.mjs "payment decisions"
```

## Stats

```bash
$ node smart-compact/scripts/stats.mjs

Memory Stats:
- Total files: 12
- Total size: 45.2 KB
- Files to compact: 3
- Brain entries: 127
- Last compaction: 30 min ago
```

## Safety

- **Dry run mode** - Preview changes before applying
- **Backups** - Creates backup before compaction
- **Selective** - Never compacts files marked 🔐 or in .compactignore
- **Reversible** - Archived files can be restored

## .compactignore

Files/patterns to never compact:

```
MEMORY.md
.env*
*.key
*.pem
secrets/
```

## Example Output

```
[5:30 AM] Smart Compact Running...

Analyzing memory files...
- 2026-03-06.md (12.4 KB) - Compacting
- 2026-03-05.md (8.2 KB) - Archiving
- MEMORY.md (3.1 KB) - Keeping

Extracted 15 items to brain:
✓ Decision: Use production Stripe keys
✓ Key Learning: TweetDeck → X Pro
✓ Launch Date: March 11, 2026
✓ Product: Polysauce pricing tiers
✓ Payment Link: https://buy.stripe.com/...

Compacted:
- Before: 23.7 KB
- After: 8.2 KB
- Saved: 15.5 KB (65%)

Next run: 6:00 AM
```

## Best Practices

1. **Run frequently** - Every 30 min prevents overflow
2. **Mark important** - Use tags like IMPORTANT:, DECISION:
3. **Review archives** - Check archive/ weekly for retrieval
4. **Search brain** - Use semantic search instead of scrolling files

## Troubleshooting

**Error: "Brain not responding"**
- Check Supabase connection
- Verify OPENAI_API_KEY is set

**Error: "No files to compact"**
- Normal if files are already compact
- Check config.json paths

**Memory still too large?**
- Reduce maxFileSize in config
- Increase compaction frequency
- Archive older files manually
