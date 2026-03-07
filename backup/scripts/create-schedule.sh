#!/bin/bash
# Create VibeStack schedule for the next 7 days

ACCOUNT="your-email@example.com"
CALENDAR="primary"

echo "📅 Creating VibeStack schedule..."

# Function to create event
create_event() {
    local summary="$1"
    local start="$2"
    local end="$3"
    local color="$4"
    
    echo "  Creating: $summary"
    gog calendar create $CALENDAR \
        --summary "$summary" \
        --from "$start" \
        --to "$end" \
        --event-color "$color" \
        --account $ACCOUNT 2>&1 | grep -E "^id|^summary" | head -2
}

# March 6, 2026 (Tomorrow) - Full day
create_event "🚀 Polysauce Desktop App Build" "2026-03-06T09:00:00-08:00" "2026-03-06T12:00:00-08:00" 7
create_event "📧 Marketing Content Review" "2026-03-06T13:00:00-08:00" "2026-03-06T14:00:00-08:00" 5
create_event "🏗️ VibeStack OS Development" "2026-03-06T15:00:00-08:00" "2026-03-06T18:00:00-08:00" 2

# March 7 - Content + Development
create_event "📝 Details Course Planning" "2026-03-07T09:00:00-08:00" "2026-03-07T11:00:00-08:00" 6
create_event "🤖 Charlie Agent Review" "2026-03-07T12:00:00-08:00" "2026-03-07T13:00:00-08:00" 9
create_event "🔮 Polysauce Marketing Push" "2026-03-07T14:00:00-08:00" "2026-03-07T17:00:00-08:00" 4

# March 8 - Build day
create_event "⚡ Desktop App Sprint" "2026-03-08T09:00:00-08:00" "2026-03-08T17:00:00-08:00" 7

# March 9 - Content day
create_event "📹 Course Tutorial Recording" "2026-03-09T09:00:00-08:00" "2026-03-09T12:00:00-08:00" 6
create_event "📊 Weekly Metrics Review" "2026-03-09T13:00:00-08:00" "2026-03-09T14:00:00-08:00" 3

# March 10 - Integration day
create_event "🔗 Stripe + Postiz Integration" "2026-03-10T09:00:00-08:00" "2026-03-10T12:00:00-08:00" 10
create_event "🚀 Product Launch Prep" "2026-03-10T14:00:00-08:00" "2026-03-10T17:00:00-08:00" 11

# March 11 - Launch day
create_event "🎉 Polysauce Full Launch" "2026-03-11T09:00:00-08:00" "2026-03-11T17:00:00-08:00" 11

echo ""
echo "✅ Schedule created!"
echo "📊 View: https://calendar.google.com"
