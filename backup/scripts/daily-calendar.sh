#!/bin/bash
# Daily Calendar Link Sender
# Sends Google Calendar link at 5am PST daily

ACCOUNT="your-email@example.com"
CALENDAR="primary"
DATE=$(date +%Y-%m-%d)
TELEGRAM_BOT_TOKEN=$(cat ~/.openclaw/secrets/telegram-bot-token.txt 2>/dev/null || echo "")
TELEGRAM_CHAT_ID="YOUR_TELEGRAM_ID"

# Get today's events
EVENTS=$(gog calendar events $CALENDAR --from "${DATE}T00:00:00-08:00" --to "${DATE}T23:59:59-08:00" --account $ACCOUNT 2>/dev/null)

# Create calendar link for today
CALENDAR_LINK="https://www.google.com/calendar/render?mode=day&date=$(date +%Y%m%d)"

# Build message
MESSAGE="📅 *Daily Schedule* - $(date '+%A, %B %d, %Y')

🔗 [Open Today's Calendar]($CALENDAR_LINK)

$EVENTS

---
_Ghost Malone 👻 | VibeStack Bot_"

# Send via OpenClaw message tool (works with Telegram)
echo "$MESSAGE" | openclaw message send --to YOUR_TELEGRAM_ID --from-file - 2>&1 || echo "$MESSAGE"
