#!/bin/bash
# Scheduled Post Publisher
# Runs via cron to post content from Charlie's queue
#
# Usage: scheduled-post-publisher.sh
#
# This script:
# 1. Gets the next scheduled post from Charlie's queue
# 2. Posts it via Postiz AI agent (Nevo)
# 3. Marks it as posted
# 4. Logs the result

set -e

SCRIPTS_DIR="~/.openclaw/workspace/scripts"
CHARLIE_DIR="~/.openclaw/workspace/charlie"
QUEUE_DIR="$CHARLIE_DIR/posts/ready-to-post"
POSTED_DIR="$CHARLIE_DIR/posts/posted"
LOG_DIR="~/.openclaw/workspace/logs"

# Ensure directories exist
mkdir -p "$POSTED_DIR" "$LOG_DIR"

LOG_FILE="$LOG_DIR/scheduled-posts.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if we should post now (based on schedule)
CURRENT_HOUR=$(date +%H)
CURRENT_MINUTE=$(date +%M)

# Posting times: 8:00, 12:30, 18:00, 21:00 (PST)
SHOULD_POST=false

# Check if current time matches a posting slot (within 30 min window)
if [[ $CURRENT_HOUR -eq 8 && $CURRENT_MINUTE -lt 30 ]]; then
  SHOULD_POST=true
  SLOT="8:00 AM"
elif [[ $CURRENT_HOUR -eq 12 && $CURRENT_MINUTE -ge 30 ]]; then
  SHOULD_POST=true
  SLOT="12:30 PM"
elif [[ $CURRENT_HOUR -eq 18 && $CURRENT_MINUTE -lt 30 ]]; then
  SHOULD_POST=true
  SLOT="6:00 PM"
elif [[ $CURRENT_HOUR -eq 21 && $CURRENT_MINUTE -lt 30 ]]; then
  SHOULD_POST=true
  SLOT="9:00 PM"
fi

if [[ "$SHOULD_POST" == "false" ]]; then
  log "Not a posting time slot. Skipping."
  exit 0
fi

log "📅 Posting time slot: $SLOT"

# Get the next post from queue
# Skip threads (files with "Post 1" or "thread" in name)
NEXT_POST=$(ls -t "$QUEUE_DIR"/*.txt 2>/dev/null | grep -v "thread\|Post 1" | head -1)

if [[ -z "$NEXT_POST" ]]; then
  log "⚠️  No single posts in queue (threads require manual posting)..."
  
  # Generate new content using content engine
  cd ~/.openclaw/workspace/skills/content-engine
  node scripts/run.mjs >> "$LOG_FILE" 2>&1
  
  # Check again for posts (still skip threads)
  NEXT_POST=$(ls -t "$QUEUE_DIR"/*.txt 2>/dev/null | grep -v "thread\|Post 1" | head -1)
  
  if [[ -z "$NEXT_POST" ]]; then
    log "❌ No single posts available. Threads must be posted manually."
    exit 0  # Not an error, just skip
  fi
fi

log "📝 Posting: $(basename "$NEXT_POST")"

# Read content
CONTENT=$(cat "$NEXT_POST")

# Extract first 200 chars for X/Twitter
CONTENT_SHORT=$(echo "$CONTENT" | head -c 200)

# Post to X/Twitter using Postiz AI agent
log "📤 Posting to X/Twitter via Nevo..."

RESPONSE=$(mcporter call "postiz.ask_postiz(message: \"POST TO @YOUR_HANDLE NOW:

$CONTENT_SHORT

Integration: YOUR_POSTIZ_ID
No attachments. Everyone can reply. POST NOW.

CONFIRM AND POST.\")" --timeout 120000 2>&1)

# Check for success
if echo "$RESPONSE" | grep -q "Posted\|published\|scheduled"; then
  log "✅ Post successful!"
  
  # Extract URL if available
  URL=$(echo "$RESPONSE" | grep -o 'https\?://[^"]*twitter\.com[^"]*\|https\?://[^"]*x\.com[^"]*' | head -1)
  
  if [[ -n "$URL" ]]; then
    log "🔗 URL: $URL"
  fi
  
  # Move to posted folder
  mv "$NEXT_POST" "$POSTED_DIR/$(date +%Y-%m-%d-%H%M)-$(basename "$NEXT_POST")"
  
  log "📁 Moved to posted folder"
  exit 0
else
  log "❌ Failed to post"
  log "Response: $RESPONSE"
  
  # Save error for review
  echo "$(date): Failed to post $NEXT_POST" >> "$LOG_DIR/posting-errors.log"
  echo "$RESPONSE" >> "$LOG_DIR/posting-errors.log"
  echo "---" >> "$LOG_DIR/posting-errors.log"
  
  exit 1
fi
