#!/usr/bin/env python3
"""
Daily Calendar Link Sender
Sends Google Calendar link at 5am PST daily via Telegram
"""

import os
import sys
import json
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

# Add workspace to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def get_todays_events():
    """Get today's calendar events using gog CLI"""
    date = datetime.now().strftime('%Y-%m-%d')
    
    try:
        result = subprocess.run([
            'gog', 'calendar', 'events', 'primary',
            '--from', f'{date}T00:00:00-08:00',
            '--to', f'{date}T23:59:59-08:00',
            '--account', 'your-email@example.com'
        ], capture_output=True, text=True, timeout=30)
        
        return result.stdout if result.returncode == 0 else "No events today"
    except Exception as e:
        return f"Error fetching events: {e}"

def send_to_telegram(message):
    """Send message via OpenClaw (which routes to Telegram)"""
    try:
        # Use message tool via subprocess
        result = subprocess.run([
            'openclaw', 'message', 'send',
            '--to', 'YOUR_TELEGRAM_ID',
            '--message', message
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ Calendar link sent to Telegram")
        else:
            print(f"❌ Error: {result.stderr}")
            # Fallback: print to stdout
            print(message)
    except Exception as e:
        print(f"❌ Error sending: {e}")
        print(message)

def main():
    # Get today's date
    today = datetime.now()
    date_str = today.strftime('%A, %B %d, %Y')
    date_link = today.strftime('%Y%m%d')
    
    # Get calendar events
    events = get_todays_events()
    
    # Create calendar link
    calendar_link = f"https://www.google.com/calendar/render?mode=day&date={date_link}"
    
    # Build message
    message = f"""📅 *Daily Schedule* - {date_str}

🔗 [Open Today's Calendar]({calendar_link})

{events}

---
_Ghost Malone 👻 | VibeStack Bot_"""
    
    # Send
    send_to_telegram(message)

if __name__ == "__main__":
    main()
