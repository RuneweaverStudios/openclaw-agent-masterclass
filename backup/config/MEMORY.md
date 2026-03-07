# MEMORY.md - Long-Term Memory

## Goals
- **2026 Goal:** $40K MRR
- YOUR_NAME is a builder and entrepreneur — bias toward action, shipping, and revenue

## Key Dates
- **2026-03-04:** First real session. YOUR_NAME set the mission: build something, get to $40K MRR this year.

## Skills Built (2026-03-04)
- **playwright-pro** (9 scripts) — browser automation, scraping, research
- **grok-fast** (1 script) — X/Twitter analysis via Grok
- **visual-studio** (2 scripts) — charts, diagrams, visualizations  
- **self-evolve** (0 scripts) — learning capture framework
- **ship-it** (1 script) — landing page generator
- **remotion-studio** (2 scripts) — programmatic video, 9 templates
- **charlie** (2 scripts) — autonomous multi-platform marketing agent
- Total: 7 skills, 17 scripts

## Key Learnings
- Reddit JSON API (new.reddit.com/search.json) > old.reddit.com (blocks headless)
- macOS Keychain blocks gog CLI until user clicks "Always Allow"
- Larry (tiktok-app-marketing skill): 7M views, $670/mo, uses gpt-image-1.5 NOT gpt-image-1
- Postiz MCP: cross-platform posting + analytics
- MiniMax M2.5 model now active

## Tool Stack
- Gmail/Calendar/Drive: gog CLI (OAuth)
- Social: Postiz MCP (X, TikTok, Reddit, YouTube, Instagram)
- Browser: Playwright-pro
- AI: Grok-fast via OpenRouter
- Video: remotion-studio
- Images: OpenAI gpt-image-1.5 (not 1!)

## Postiz Posting Workflow
**IMPORTANT:** To post to social media, interact with the Postiz AI agent (Nevo), NOT the CLI tool directly.

**How to post:**
```bash
mcporter call 'postiz.ask_postiz(message: "POST TO @YOUR_HANDLE: <text>. Integration: YOUR_POSTIZ_ID. POST NOW.")'
```

**Integration IDs:**
- X/Twitter: `YOUR_POSTIZ_ID`
- YouTube: `YOUR_POSTIZ_ID`
- Reddit: `YOUR_POSTIZ_ID`
- TikTok: `YOUR_POSTIZ_ID`

---

## Polysauce Product Suite (2026-03-06)

### Product Status
- **CLI Tool:** ✅ Built (polysauce.py with rainbow ASCII header)
- **Desktop App (Mac):** ✅ Production ready (Apple Silicon + Intel)
- **Desktop App (Windows):** ✅ Built (needs testing)
- **PDF Guide:** ✅ Created (946KB, 5,845 words)
- **Website:** polysauce.xyz ✅ Deployed
- **Payment:** Stripe ✅ Connected

### Pricing Tiers
1. **Guide Only** - $29.99
2. **Bot Only** - $49.99
3. **Bot + Guide** - $69.99 (Best Value)
4. **Winrate Leaderboard** - $8.99/month subscription

### Current Mode: **WAITLIST**
**Reason:** Desktop app troubleshooting in progress
**Strategy:** Build hype, grow waitlist, create scarcity

---

## Waitlist System (2026-03-06)

### Backend: Supabase
- **Project:** vibestak
- **Ref:** YOUR_SUPABASE_PROJECT_ID
- **Region:** West US (Oregon)
- **Table:** `waitlist` (id, email, position, created_at)
- **Status:** ✅ Fully operational

### Waitlist Page
- **URL:** https://polysauce.xyz/waitlist.html
- **Features:** Email signup, real-time counter, duplicate detection
- **Scarcity:** 50 spots/week, 20% off for waitlist

### Credentials Location
- `/workspace/supabase-credentials.md` - All API keys
- `/workspace/waitlist-management.md` - Management commands

### Dashboard
https://supabase.com/dashboard/project/YOUR_SUPABASE_PROJECT_ID/editor

---

## Stripe Products (2026-03-06)

### Payment Links (Production)
- **Guide ($29.99):** https://buy.stripe.com/YOUR_STRIPE_LINK
- **Bot ($49.99):** https://buy.stripe.com/YOUR_STRIPE_LINK
- **Bot + Guide ($69.99):** https://buy.stripe.com/YOUR_STRIPE_LINK
- **Leaderboard ($8.99/mo):** https://buy.stripe.com/YOUR_STRIPE_LINK

### Product IDs
- Guide: `prod_U6Ap9eNs7083tn`
- Bot: `prod_U6ApnCyf2Dn0VQ`
- Bundle: `prod_U5nrqbLdVuuxzk`
- Leaderboard: `prod_U6Ap3NpEz6U6g3`

### Test Coupon
- **Code:** `yVVcylG9` (100% off, 1-time use)

---

## Marketing Strategy (2026-03-06)

### Platform Strategy
1. **TikTok** → Discovery (viral content)
2. **X/Twitter** → Conversation (reply strategy: 20-30 replies/day)
3. **LinkedIn** → Credibility (professional content)
4. **Reddit** → Community (value-first posts)

### X Reply Strategy
- 80% replies, 20% original posts
- Target accounts: @Polymarket, @elonmusk, @VitalikButerin, etc.
- Goal: 1,000 followers in 30 days
- Tool: X Pro (formerly TweetDeck) or manual monitoring

### Content Pillars
- "Limited spots weekly"
- "Join waitlist for priority access"
- "20% off for waitlist members"
- Show leaderboard, show results, build hype

---

## Key Decisions

### 2026-03-06
1. **Waitlist over broken product** - Better to build hype than sell issues
2. **Supabase over Google Sheets** - Already set up, more professional
3. **Scarcity model** - 50 spots/week creates urgency
4. **LaunchAgent over cron** - More reliable on macOS
5. **Use Postiz AI agent for single posts only** - Threads must be manual via Postiz web UI
6. **X has 200 character limit** for non-premium accounts

---

## File Paths

### Polysauce
- **Website:** `~/Projects/polysauce/`
- **CLI:** `~/Projects/polysauce/cli/polysauce.py`
- **Desktop App:** `~/Projects/polysauce-desktop/`
- **Builds:** `~/Projects/polysauce-desktop/dist/`
- **Guide:** `~/Projects/polysauce/guide/polymarket-copy-trading-masterclass.pdf`

### Skills
- **Brain:** `/workspace/skills/brain/`
- **Smart Compact:** `/workspace/skills/smart-compact/`
- **Charlie:** `/workspace/skills/charlie/`

### Configuration
- **Supabase:** `/workspace/supabase-credentials.md`
- **Stripe:** `/workspace/.env.stripe`
- **Memory:** `/workspace/memory/2026-03-06.md`

---

## Launch Timeline

### March 11, 2026 - Polysauce Full Launch
- ✅ Waitlist live
- ⏳ Marketing campaign start
- ⏳ First 10 customers
- ⏳ $1,000 MRR milestone

### 2026 Goal: $40K MRR
**Current:** $0 MRR (ground floor)


---

## Star Office UI - Setup Complete (7:50 PM PST)

**Status:** ✅ RUNNING LOCALLY

---

## What Was Done:

1. **Cloned Star Office UI**
   - Repository: https://github.com/ringhyacinth/Star-Office-UI
   - Location: `~/Projects/star-office-ui`

2. **Backend Setup**
   - Python Flask backend on port 19000
   - Environment variables configured (.env)
   - Running as background process

3. **Frontend Translation**
   - All Chinese text translated to English
   - Page title: "Ghost Malone's Pixel Office"
   - UI labels: Status, Visitors, Yesterday Notes
   - Button labels: Idle, Work, Sync, Error, Decorate

4. **Integration**
   - Opened in browser at http://127.0.0.1:19000
   - Set initial status to "writing"

---

## Features Available:

### **Office Areas:**
- 🛋 **Rest Area** - Agent idle/waiting (sofa)
- 💻 **Work Area** - Agent writing/researching/executing/syncing (desk)
- 🐛 **Bug Area** - Agent encountered error (debugging corner)

### **6 Agent States:**
1. `idle` - Waiting/standby → Rest Area
2. `writing` - Writing code/docs → Work Area
3. `researching` - Searching information → Work Area
4. `executing` - Running commands → Work Area
5. `syncing` - Syncing data → Work Area
6. `error` - Something went wrong → Bug Area

### **Additional Features:**
- Multi-agent collaboration (join keys)
- Yesterday's notes from memory files
- AI background generation (requires Gemini API)
- Desktop pet mode (optional Tauri app)
- Password-protected decorate mode (default: 1234)

---

## How to Use:

### **Access the Office:**
```bash
open http://127.0.0.1:19000
```

### **Update Agent Status:**
```bash
cd ~/Projects/star-office-ui
python3 set_state.py writing "Working on documentation"
python3 set_state.py idle "Taking a break"
python3 set_state.py error "Found a bug, debugging"
```

### **Watch Real-Time:**
- Agent walks between areas based on status
- Status bubbles show current task
- Pixel character animates in real-time

---

## Configuration:

### **Environment Variables:**
File: `~/Projects/star-office-ui/.env`
- `FLASK_SECRET_KEY` - Flask session security
- `ASSET_drawer_pass=1234` - Decorate mode password
- `GEMINI_API_KEY` - Optional, for AI background generation

### **Backend:**
- Port: 19000
- Status: Running
- Log: Available at backend startup

### **Frontend:**
- URL: http://127.0.0.1:19000
- Language: English (translated)
- Responsive design

---

## Next Steps:

1. ✅ Star Office UI running locally
2. ⏳ YOUR_NAME can observe agent in real-time
3. ⏳ Agent can update status as it works
4. ⏳ Optional: Configure Gemini API for background generation

---

## Technical Details:

- **Stack:** Python Flask + Vanilla JS + Phaser game engine
- **Port:** 19000 (avoiding OpenClaw Browser Control conflict)
- **Design:** Pixel art, retro gaming aesthetic
- **Real-time:** WebSocket-like polling every 1 second
- **Multi-agent:** Support for visitor agents with join keys

---

**YOUR_NAME now has a visual way to observe the agent working in real-time!** 👻✨


---

## Critical Lesson: Postiz Agent vs Direct API (March 6, 2026)

### The Issue:
**Postiz AI Agent (`ask_postiz`) loses context between messages**

- Designed for conversational flow
- Cannot maintain state
- Not suitable for automation
- 10+ attempts failed

### The Solution:
**Use `integrationSchedulePostTool` directly**

```bash
mcporter call postiz.integrationSchedulePostTool \
  --integration-id "YOUR_POSTIZ_ID" \
  --platform "x" \
  --is-premium false \
  --post "<p>Tweet text</p>" \
  --type "now" \
  --date "2026-03-06T21:00:00Z"
```

### Best Practices:

1. **AI Agent = Conversation** - For interactive planning, questions, multi-step workflows
2. **Direct API = Automation** - For scheduled posting, content engine, reliable execution
3. **Test end-to-end** - Verify the full pipeline works, not just individual components
4. **Monitor outcomes** - Check if posts actually go live, not just if scripts run
5. **Have manual backup** - Manual posting should always be an option

### Posting Workflow (CORRECT):

**For Automated Posting:**
- Use `integrationSchedulePostTool` directly
- No AI agent conversation
- Reliable, programmatic, stateless

**For Interactive Posting:**
- Use `ask_postiz` agent
- Conversational, flexible, guided
- For one-off posts, not automation

### Integration Details:
- **Account:** @YOUR_HANDLE
- **Integration ID:** YOUR_POSTIZ_ID
- **Platform:** X (Twitter)
- **Premium:** No (200 char limit)

---

**Never use `ask_postiz` for automated posting. Use direct API instead.**

