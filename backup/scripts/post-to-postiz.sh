#!/bin/bash
# Post to Postiz via AI Agent (Nevo)
# Usage: post-to-postiz.sh "<content>" <platform>
#
# Example:
#   post-to-postiz.sh "Hello world! #test" x

set -e

CONTENT="$1"
PLATFORM="${2:-x}"
INTEGRATION_ID=""

# Map platform to integration ID
case "$PLATFORM" in
  x|twitter)
    INTEGRATION_ID="YOUR_POSTIZ_ID"
    ;;
  youtube)
    INTEGRATION_ID="YOUR_POSTIZ_ID"
    ;;
  reddit)
    INTEGRATION_ID="YOUR_POSTIZ_ID"
    ;;
  tiktok)
    INTEGRATION_ID="YOUR_POSTIZ_ID"
    ;;
  *)
    echo "Unknown platform: $PLATFORM"
    echo "Valid platforms: x, twitter, youtube, reddit, tiktok"
    exit 1
    ;;
esac

# Escape content for JSON
ESCAPED_CONTENT=$(echo "$CONTENT" | jq -Rs '.')

# Build message for Nevo
MESSAGE="POST TO @YOUR_HANDLE NOW:

$CONTENT

Integration: $INTEGRATION_ID
No attachments. Everyone can reply. POST NOW.

CONFIRM AND POST."

# Step 1: Send request to Nevo
echo "📤 Sending post request to Nevo..."
RESPONSE1=$(mcporter call "postiz.ask_postiz(message: $(echo "$MESSAGE" | jq -Rs '.'))" --timeout 120000 2>&1)

# Step 2: Confirm the post
if echo "$RESPONSE1" | grep -q "Ready to post\|CONFIRM POST NOW"; then
  echo "✅ Confirming post..."
  RESPONSE2=$(mcporter call 'postiz.ask_postiz(message: "CONFIRM POST NOW")' --timeout 120000 2>&1)
  
  # Extract URL
  URL=$(echo "$RESPONSE2" | grep -o 'https\?://[^"]*twitter\.com[^"]*\|https\?://[^"]*x\.com[^"]*' | head -1)
  
  if [ -n "$URL" ]; then
    echo "✅ Posted successfully!"
    echo "URL: $URL"
    exit 0
  else
    echo "⚠️  Post may have succeeded, but no URL returned"
    exit 0
  fi
else
  echo "❌ Failed to initiate posting"
  echo "Response: $RESPONSE1"
  exit 1
fi
