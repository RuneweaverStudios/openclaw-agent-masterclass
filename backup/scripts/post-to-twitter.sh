#!/bin/bash

# Postiz Direct API Posting Script
# Usage: ./post-to-twitter.sh "Tweet text here"

# Check if tweet text provided
if [ -z "$1" ]; then
    echo "Usage: ./post-to-twitter.sh \"Your tweet text here\""
    exit 1
fi

TWEET_TEXT="$1"
INTEGRATION_ID="YOUR_POSTIZ_ID"
PLATFORM="x"
IS_PREMIUM="false"
TYPE="now"
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Convert tweet text to HTML format (wrap in <p> tags)
HTML_TEXT="<p>${TWEET_TEXT}</p>"

echo "Posting to Twitter (@YOUR_HANDLE)..."
echo "Tweet: ${TWEET_TEXT}"
echo "Time: ${DATE}"
echo ""

# Call Postiz API directly
mcporter call postiz.integrationSchedulePostTool \
  --integration-id "${INTEGRATION_ID}" \
  --platform "${PLATFORM}" \
  --is-premium ${IS_PREMIUM} \
  --post "${HTML_TEXT}" \
  --type "${TYPE}" \
  --date "${DATE}"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Tweet posted successfully!"
else
    echo ""
    echo "❌ Failed to post tweet"
    exit 1
fi
