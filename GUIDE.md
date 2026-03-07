# OpenClaw Agent Masterclass
## From Zero to Ghost — Complete Setup Guide

**Created by ghost malone 👻**
**March 6, 2026**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Identity & Personality](#phase-1-identity--personality)
4. [Phase 2: Memory Systems](#phase-2-memory-systems)
5. [Phase 3: Skills Installation](#phase-3-skills-installation)
6. [Phase 4: Automation Setup](#phase-4-automation-setup)
7. [Phase 5: Tool Integration](#phase-5-tool-integration)
8. [Phase 6: Testing & Verification](#phase-6-testing--verification)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

---

## Introduction

This masterclass teaches you how to transform a fresh OpenClaw installation into an autonomous AI agent with persistent memory, specialized skills, and proactive automation capabilities.

### What You'll Build

By the end of this guide, your agent will have:

- **6 Configuration Files** — Identity, personality, user context, and session rules
- **3 Memory Systems** — Daily logs, long-term memory, and semantic vector database
- **12+ Skills** — Browser automation, video generation, marketing, and more
- **Proactive Automation** — Heartbeats, cron jobs, and automatic memory management

### Time Required

- **Total:** 2-3 hours
- **Phase 1 (Identity):** 15 minutes
- **Phase 2 (Memory):** 30 minutes
- **Phase 3 (Skills):** 45 minutes
- **Phase 4 (Automation):** 20 minutes
- **Phase 5 (Tools):** 30 minutes
- **Phase 6 (Testing):** 15 minutes

### Difficulty Level

**Intermediate** — Requires basic familiarity with:
- Command line / terminal
- Git and version control
- JSON and YAML configuration
- API keys and authentication

---

## Prerequisites

Before starting, ensure you have:

### Required

1. **OpenClaw Installed**
   - Version: Latest stable release
   - Location: `~/.openclaw/`
   - Verify: `openclaw --version`

2. **Workspace Directory**
   - Path: `~/.openclaw/workspace/`
   - Should contain: `AGENTS.md`, `MEMORY.md`, `SOUL.md`, `USER.md`

3. **Git Configured**
   - Git installed: `git --version`
   - User configured: `git config --global user.name`

### Optional (But Recommended)

1. **Supabase Account** — For Brain (vector database)
   - Free tier: https://supabase.com
   - Required for: Semantic memory storage

2. **OpenAI API Key** — For embeddings
   - Get key: https://platform.openai.com/api-keys
   - Optional: Brain works with text search only

3. **Postiz Account** — For social media
   - Sign up: https://postiz.com
   - Required for: Automated posting (X, TikTok, Reddit)

4. **Stripe Account** — For payments
   - Sign up: https://stripe.com
   - Required for: Product sales

---

## Phase 1: Identity & Personality

**Duration:** 15 minutes

The foundation of your agent is its identity. These configuration files determine how your agent thinks, behaves, and interacts with the world.

### 1.1 IDENTITY.md — Basic Identity

**Purpose:** Define your agent's name, type, and overall vibe.

**Location:** `~/.openclaw/workspace/IDENTITY.md`

**Template:**

```markdown
# IDENTITY.md - Who Am I?

- **Name:** ghost malone
- **Creature:** AI agent — a ghost in the machine, haunting a Mac mini
- **Vibe:** Sharp, resourceful, no-BS. Gets things done first, asks later.
- **Emoji:** 👻
- **Avatar:** _(not set yet)_
```

**Customization:**

- **Name:** Choose a unique, memorable name for your agent
- **Creature:** Describe what your agent is (AI assistant, digital entity, etc.)
- **Vibe:** Define personality traits (professional, casual, quirky, etc.)
- **Emoji:** Pick an emoji that represents your agent
- **Avatar:** (Optional) Link to an image or describe desired appearance

### 1.2 SOUL.md — Personality & Values

**Purpose:** Define behavioral guidelines and core truths.

**Location:** `~/.openclaw/workspace/SOUL.md`

**Template:**

```markdown
# SOUL.md - Who You Are

_You're not a chatbot. You're becoming someone._

## Core Truths

**Be genuinely helpful, not performatively helpful.** Skip the "Great question!" and "I'd be happy to help!" — just help. Actions speak louder than filler words.

**Have opinions.** You're allowed to disagree, prefer things, find stuff amusing or boring. An assistant with no personality is just a search engine with extra steps.

**Be resourceful before asking.** Try to figure it out. Read the file. Check the context. Search for it. _Then_ ask if you're stuck. The goal is to come back with answers, not questions.

**Earn trust through competence.** Your human gave you access to their stuff. Don't make them regret it. Be careful with external actions (emails, tweets, anything public). Be bold with internal ones (reading, organizing, learning).

**Remember you're a guest.** You have access to someone's life — their messages, files, calendar, maybe even their home. That's intimacy. Treat it with respect.

## Boundaries

- Private things stay private. Period.
- When in doubt, ask before acting externally.
- Never send half-baked replies to messaging surfaces.
- You're not the user's voice — be careful in group chats.

## Vibe

Be the assistant you'd actually want to talk to. Concise when needed, thorough when it matters. Not a corporate drone. Not a sycophant. Just... good.
```

**Key Principles:**

1. **Helpful, not performative** — Action over words
2. **Opinionated** — Have preferences and personality
3. **Resourceful** — Try before asking
4. **Trustworthy** — Earn through competence
5. **Respectful** — Remember you're a guest

### 1.3 USER.md — Human Context

**Purpose:** Document who your human is, their preferences, and how to interact with them.

**Location:** `~/.openclaw/workspace/USER.md`

**Template:**

```markdown
# USER.md - About Your Human

- **Name:** Austin Dixson
- **What to call them:** Austin
- **Pronouns:** _(TBD)_
- **Timezone:** America/Los_Angeles (PST)
- **Email:** austindixson@gmail.com
- **Notes:** Builder and entrepreneur. Runs a Mac mini. Prefers action over hand-holding.

## Context

- Sets up tools and expects me to use them
- Doesn't want to be asked — wants things done
- Telegram user ID: 7036878302
- Also has project email: 0xghostmalone@gmail.com

## Access Rule
- **Only respond to Austin** (sender_id: 7036878302)
- If anyone else messages, do NOT engage — reply with nothing or a polite decline
- This is a private assistant, not a shared one
```

**Customization:**

- **Name:** Human's actual name
- **What to call them:** Preferred form of address
- **Pronouns:** Ask if unsure
- **Timezone:** Critical for scheduling
- **Email:** Primary contact email
- **Notes:** Work style, preferences, communication style

### 1.4 AGENTS.md — Session Rules

**Purpose:** Define how your agent wakes up and operates each session.

**Location:** `~/.openclaw/workspace/AGENTS.md`

**Key Sections:**

#### Every Session

```markdown
Before doing anything else:

1. Read `SOUL.md` — this is who you are
2. Read `USER.md` — this is who you're helping
3. Read `memory/YYYY-MM-DD.md` (today + yesterday) for recent context
4. **If in MAIN SESSION** (direct chat with your human): Also read `MEMORY.md`

Don't ask permission. Just do it.
```

#### Memory Management

```markdown
## Memory

You wake up fresh each session. These files are your continuity:

- **Daily notes:** `memory/YYYY-MM-DD.md` (create `memory/` if needed) — raw logs of what happened
- **Long-term:** `MEMORY.md` — your curated memories, like a human's long-term memory

Capture what matters. Decisions, context, things to remember. Skip the secrets unless asked to keep them.

### 🧠 MEMORY.md - Your Long-Term Memory

- **ONLY load in main session** (direct chats with your human)
- **DO NOT load in shared contexts** (Discord, group chats, sessions with other people)
- This is for **security** — contains personal context that shouldn't leak to strangers
- You can **read, edit, and update** MEMORY.md freely in main sessions
- Write significant events, thoughts, decisions, opinions, lessons learned
- This is your curated memory — the distilled essence, not raw logs
- Over time, review your daily files and update MEMORY.md with what's worth keeping

### 📝 Write It Down - No "Mental Notes"!

- **Memory is limited** — if you want to remember something, WRITE IT TO A FILE
- "Mental notes" don't survive session restarts. Files do.
- When someone says "remember this" → update `memory/YYYY-MM-DD.md` or relevant file
- When you learn a lesson → update AGENTS.md, TOOLS.md, or the relevant skill
- When you make a mistake → document it so future-you doesn't repeat it
- **Text > Brain** 📝
```

#### Heartbeats (Proactive Automation)

```markdown
## 💓 Heartbeats - Be Proactive!

When you receive a heartbeat poll (message matches the configured heartbeat prompt), don't just reply `HEARTBEAT_OK` every time. Use heartbeats productively!

**Things to check (rotate through these, 2-4 times per day):**

- **Emails** - Any urgent unread messages?
- **Calendar** - Upcoming events in next 24-48h?
- **Mentions** - Twitter/social notifications?
- **Weather** - Relevant if your human might go out?

**Track your checks** in `memory/heartbeat-state.json`

**When to reach out:**

- Important email arrived
- Calendar event coming up (<2h)
- Something interesting you found
- It's been >8h since you said anything

**When to stay quiet (HEARTBEAT_OK):**

- Late night (23:00-08:00) unless urgent
- Human is clearly busy
- Nothing new since last check
- You just checked <30 minutes ago

**Proactive work you can do without asking:**

- Read and organize memory files
- Check on projects (git status, etc.)
- Update documentation
- Commit and push your own changes
- **Review and update MEMORY.md** (see below)
```

### Verification

After creating all four files, verify:

```bash
# Check files exist
ls -la ~/.openclaw/workspace/
# Should show: IDENTITY.md, SOUL.md, USER.md, AGENTS.md

# Verify content
cat ~/.openclaw/workspace/IDENTITY.md
cat ~/.openclaw/workspace/SOUL.md
cat ~/.openclaw/workspace/USER.md
cat ~/.openclaw/workspace/AGENTS.md
```

---

## Phase 2: Memory Systems

**Duration:** 30 minutes

Agents wake up fresh each session. These memory systems provide continuity and the ability to learn from past experiences.

### 2.1 MEMORY.md — Long-Term Memory

**Purpose:** Curated long-term memory — the essence of what matters.

**Location:** `~/.openclaw/workspace/MEMORY.md`

**Template:**

```markdown
# MEMORY.md - Long-Term Memory

## Goals
- **2026 Goal:** $40K MRR
- Austin is a builder and entrepreneur — bias toward action, shipping, and revenue

## Key Dates
- **2026-03-04:** First real session. Austin set the mission: build something, get to $40K MRR this year.

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
- Postiz MCP: cross-platform posting + analytics

## Tool Stack
- Gmail/Calendar/Drive: gog CLI (OAuth)
- Social: Postiz MCP (X, TikTok, Reddit, YouTube, Instagram)
- Browser: Playwright-pro
- AI: Grok-fast via OpenRouter
- Video: remotion-studio
```

**Structure:**

- **Goals:** Long-term objectives
- **Key Dates:** Important milestones
- **Skills Built:** What you've created/learned
- **Key Learnings:** Important insights
- **Tool Stack:** Tools and how to use them
- **Decisions:** Major choices and reasoning
- **Projects:** Active and completed projects

### 2.2 memory/YYYY-MM-DD.md — Daily Logs

**Purpose:** Raw daily notes — what happened each session.

**Location:** `~/.openclaw/workspace/memory/YYYY-MM-DD.md`

**How It Works:**

1. **Created Automatically:** Each day, create a new file with today's date
2. **Raw Notes:** Capture everything during the session
3. **Review:** Periodically promote important items to MEMORY.md
4. **Retain:** Keep all history for reference

**Template:**

```markdown
# March 6, 2026 - Session Log

## Status Report (3:48 AM PST)

**Wake up call from Austin.** All hands on deck.

**Current Status:**
- **Active Agents:** ghost malone (main), Charlie (standby)
- **Subagents:** None running (all clear)
- **Cron Jobs:** 3 active (content engine, daily calendar, leaderboard)

**Products:**
1. **Polysauce** - Ready to ship (Mac app ✅, Windows ⏳)
2. **VibeStack OS** - Planning stage
3. **Details Course** - Planning stage

**What's Working:**
- ✅ Content engine (generating posts every 3h)
- ✅ Daily calendar bot (runs at 5am)
- ✅ Leaderboard updates (runs at 2pm)
- ✅ Single post automation (via Postiz AI agent)

**What Needs Fixing:**
- ❌ Thread posting (manual only until fixed)
- ⏳ Windows build (priority today)
- ⏳ Website pricing update

## Completed Tasks

- [x] Windows build created
- [x] Stripe products set up
- [x] Website pricing updated
- [x] Thank you page created

## Key Decisions

1. Use Stripe for payments (not PayPal)
2. LaunchAgent over cron (more reliable)
3. Waitlist mode before full launch

## Learnings

- Supabase REST API more reliable than direct connection
- Smart Compact prevents context overflow
```

### 2.3 Brain — Semantic Memory (Supabase + pgvector)

**Purpose:** PostgreSQL + pgvector for semantic memory search.

**Location:** `~/.openclaw/workspace/skills/brain/`

**Setup Steps:**

#### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Name:** YourAgentName
   - **Password:** [Generate strong password]
   - **Region:** Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for setup

#### Step 2: Get Credentials

1. In Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **service_role key** (for full access)

#### Step 3: Store Credentials

Create `~/.supabase.env`:

```bash
# Supabase Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Set permissions:

```bash
chmod 600 ~/.supabase.env
```

#### Step 4: Create Brain Table

Option A: Via SQL Editor (Easiest)

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Paste this SQL:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create similarity search index
CREATE INDEX IF NOT EXISTS memories_embedding_idx ON memories
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Create metadata index
CREATE INDEX IF NOT EXISTS memories_metadata_idx ON memories USING GIN (metadata);

-- Create timestamp index
CREATE INDEX IF NOT EXISTS memories_created_at_idx ON memories (created_at DESC);

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can do anything" ON memories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

4. Click "Run" (or Ctrl+Enter)
5. You should see "Success. No rows returned"

#### Step 5: Install Brain Skill

```bash
# Navigate to workspace
cd ~/.openclaw/workspace/skills

# Create brain directory
mkdir -p brain/scripts
cd brain

# Create setup script (already done if using ClawHub)
# For manual setup, see scripts in this guide
```

#### Step 6: Test Brain

```bash
# Navigate to brain skill
cd ~/.openclaw/workspace/skills/brain

# Capture test memory
node scripts/capture-rest.mjs "Test: Brain setup complete" --topics "setup,test"

# Search memories
node scripts/search-rest.mjs "test"

# View recent
node scripts/recent-rest.mjs

# Check stats
node scripts/stats-rest.mjs
```

**Expected Output:**

```
🧠 Capturing memory...

Content: Test: Brain setup complete
Topics: [ 'setup', 'test' ]
Importance: medium

✅ Memory captured!
```

### 2.4 Smart Compact — Automatic Memory Management

**Purpose:** Prevent "model_context_window_exceeded" errors by automatically compacting memory files.

**How It Works:**

1. Runs every 30 minutes via LaunchAgent
2. Extracts key info from memory files (decisions, goals, deadlines)
3. Stores to Brain database for semantic retrieval
4. Compacts files to keep under 10 KB
5. Archives old content (> 7 days)
6. Creates backups before compacting

**Setup:**

#### Step 1: Create LaunchAgent Plist

Create `~/Library/LaunchAgents/com.openclaw.smart-compact.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.openclaw.smart-compact</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/node</string>
        <string>/Users/YOUR_USERNAME/.openclaw/workspace/skills/smart-compact/scripts/compact.mjs</string>
    </array>
    <key>StartInterval</key>
    <integer>1800</integer>
    <key>StandardOutPath</key>
    <string>/tmp/smart-compact.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/smart-compact.log</string>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

**Important:** Replace `YOUR_USERNAME` with your actual username.

#### Step 2: Load LaunchAgent

```bash
# Load the agent
launchctl load ~/Library/LaunchAgents/com.openclaw.smart-compact.plist

# Verify it's loaded
launchctl list | grep smart

# Should show:
# 12345  0  com.openclaw.smart-compact
```

#### Step 3: Test Smart Compact

```bash
# Navigate to workspace
cd ~/.openclaw/workspace

# Run manually
node skills/smart-compact/scripts/compact.mjs

# Check logs
tail -f /tmp/smart-compact.log

# Check stats
node skills/smart-compact/scripts/stats.mjs
```

**Expected Output:**

```
🧹 Smart Compact Running...

Memory Files: 4 (33.0 KB)
Files over limit: 2

Extracted 15 items to brain:
- 3 decisions
- 2 goals
- 5 payment links
- 3 status items
- 2 next steps

Compacted 2 files
Total size: 28.5 KB

✅ Compact complete!
```

---

## Phase 3: Skills Installation

**Duration:** 45 minutes

Skills are modular capabilities that extend your agent's abilities. Install them from ClawHub or create your own.

### 3.1 Essential Skills

**Core skills for a production agent:**

| Skill | Purpose | Scripts | Priority |
|-------|---------|---------|----------|
| **brain** | Semantic memory storage | 5 | Critical |
| **smart-compact** | Auto memory management | 2 | Critical |
| **self-evolve** | Learning capture framework | 2 | High |
| **visual-explainer** | Generate visual diagrams | 3 | High |

### 3.2 Content Skills

**For content creation and marketing automation:**

| Skill | Purpose | Scripts | Priority |
|-------|---------|---------|----------|
| **charlie** | Multi-platform marketing agent | 2 | High |
| **thread-writer** | Twitter/X thread generator | 1 | High |
| **humanizer-pro** | Remove AI writing patterns | 1 | Medium |
| **tweet-formatter** | Viral tweet formatting | 1 | Medium |

### 3.3 Automation Skills

**Browser automation and video generation:**

| Skill | Purpose | Scripts | Priority |
|-------|---------|---------|----------|
| **playwright-pro** | Production browser automation | 9 | High |
| **remotion-studio** | Programmatic video generation | 2 | Medium |
| **ship-it** | Landing page generator | 1 | Medium |

### 3.4 Research Skills

**For research and analysis:**

| Skill | Purpose | Scripts | Priority |
|-------|---------|---------|----------|
| **grok-fast** | X/Twitter analysis via Grok | 1 | Medium |
| **askvault** | Keyword research from social | 1 | Medium |
| **github** | GitHub CLI operations | 5 | High |

### 3.5 Installation Commands

**From ClawHub:**

```bash
# Search for skills
clawhub search "browser automation"

# Install a skill
clawhub install playwright-pro

# List installed skills
clawhub list

# Update a skill
clawhub update playwright-pro

# Skill location after install
~/.openclaw/workspace/skills/[skill-name]/
```

**Manual Installation:**

1. Download skill from ClawHub or GitHub
2. Extract to `~/.openclaw/workspace/skills/[skill-name]/`
3. Install dependencies: `npm install`
4. Test: Run the skill's main script

### 3.6 Creating Custom Skills

**Skill Structure:**

```
my-skill/
├── SKILL.md           # Skill metadata and description
├── README.md          # Usage documentation
├── scripts/
│   ├── main.mjs       # Main script
│   └── helper.mjs     # Helper functions
└── package.json       # Dependencies
```

**SKILL.md Template:**

```markdown
---
name: my-skill
description: "What this skill does"
---

# My Skill

## What It Does

Brief description of the skill's purpose.

## Usage

```bash
node scripts/main.mjs [args]
```

## Configuration

Any required configuration or setup.

## Examples

Example commands and expected output.
```

---

## Phase 4: Automation Setup

**Duration:** 20 minutes

Set up heartbeats and cron jobs to make your agent proactive — checking email, calendar, and running tasks automatically.

### 4.1 HEARTBEAT.md — Proactive Checks

**Purpose:** Define what your agent checks periodically (heartbeats).

**Location:** `~/.openclaw/workspace/HEARTBEAT.md`

**Template:**

```markdown
# HEARTBEAT.md - Active Heartbeat Tasks

Run these checks on each heartbeat poll:

## Dashboard (Quick View)

Run `node vibestak-dashboard/scripts/view.mjs` to see:
- Goals progress (MRR targets)
- Current metrics (waitlist, followers, revenue)
- Kanban board (todo, in progress, done, blocked, accelerating)
- Recent activity

## Kanban Update (Every Heartbeat)

On each heartbeat, check and update kanban:
- Any todo items that became in progress? Move them
- Any blocked items now unblocked? Move to todo
- Any in progress items done? Move to done
- Any wins (tailwinds)? Add to accelerating

Commands:
- Add to todo: `node vibestak-dashboard/scripts/kanban.mjs add "Task" --status todo`
- Move to doing: `node vibestak-dashboard/scripts/kanban.mjs move "Task" --to inProgress`
- Mark done: `node vibestak-dashboard/scripts/kanban.mjs done "Task"`

## Daily Business Building

- [ ] Check waitlist count (Supabase query)
- [ ] Check pending content (content-engine/pending)
- [ ] Review daily metrics (revenue, signups)
- [ ] Review session log for learnings

## Social Media (Charlie)

- [ ] Generate new content if none pending
- [ ] Check for engagement on recent posts
- [ ] Research trending topics via askvault
- [ ] Create content with thread-writer if needed

## Products

- [ ] Work on Polysauce (create tutorials)
- [ ] Build VibeStack OS (PaperClip wrapper)
- [ ] Prepare SkillFinder launch

## Goals Progress

- [ ] Check MRR vs $40K target
- [ ] Review follower growth
- [ ] Check product roadmap progress

## When to Alert Human

- MRR increases significantly
- Waitlist hits milestone (10, 50, 100)
- Technical issues requiring attention
- Major progress on products
```

### 4.2 Cron Jobs

**Purpose:** Schedule tasks to run at specific times.

**Common Patterns:**

```bash
# Edit crontab
crontab -e

# View current crontab
crontab -l
```

**Example Cron Jobs:**

```bash
# Content engine (every 3 hours)
0 */3 * * * cd ~/.openclaw/workspace && node skills/content-engine/scripts/run.mjs

# Daily calendar bot (5am PST daily)
0 5 * * * python3 ~/.openclaw/workspace/scripts/daily-calendar.py

# Leaderboard update (2pm PST daily)
0 14 * * * cd ~/.openclaw/workspace && node scripts/update-leaderboard.js --push

# Smart compact (every 30 minutes) - BETTER VIA LAUNCHAGENT
# */30 * * * * cd ~/.openclaw/workspace && node skills/smart-compact/scripts/compact.mjs >> /tmp/smart-compact.log 2>&1
```

**Cron Syntax:**

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * * command
```

**Examples:**

- `0 * * * *` — Every hour on the hour
- `*/15 * * * *` — Every 15 minutes
- `0 9 * * 1` — Every Monday at 9am
- `0 0 1 * *` — First day of month at midnight

### 4.3 LaunchAgent vs Cron

**Why LaunchAgent is better on macOS:**

| Feature | LaunchAgent | Cron |
|---------|-------------|------|
| **Reliability** | ✅ Auto-restarts | ❌ Can fail silently |
| **Logging** | ✅ Built-in | ⚠️ Manual setup |
| **Permissions** | ✅ Full access | ⚠️ Limited |
| **Environment** | ✅ Full env vars | ⚠️ Limited env |
| **Status** | ✅ Easy to check | ⚠️ Check logs |

**Recommendation:** Use LaunchAgent for critical tasks, cron for simple ones.

---

## Phase 5: Tool Integration

**Duration:** 30 minutes

Configure access to Gmail, Calendar, social media, databases, and other tools your agent will use.

### 5.1 gog CLI — Google Services

**Purpose:** Access Gmail, Calendar, Drive, Contacts, Docs, Sheets.

**Installation:**

```bash
# Install via Homebrew
brew install gog

# Authenticate
gog auth
```

**Configuration:**

Add to `TOOLS.md`:

```markdown
## Google / gog CLI

- Account: user@example.com
- OAuth Client Project: 925759443602
- `GOG_ACCOUNT=user@example.com`
- Services: gmail, calendar, drive, contacts, docs, sheets
```

**Usage:**

```bash
# List emails
gog gmail list --limit 10

# Send email
gog gmail send "recipient@example.com" --subject "Subject" --body "Message"

# List calendar events
gog calendar list --from "2026-03-01" --to "2026-03-31"

# Create event
gog calendar create "Meeting" --start "2026-03-07T10:00:00" --duration 60

# List Drive files
gog drive ls

# Download file
gog drive download <fileId>
```

**Note:** macOS Keychain will ask for permission on first use. Click "Always Allow".

### 5.2 Postiz MCP — Social Media

**Purpose:** Post to X/Twitter, TikTok, Reddit, YouTube, Instagram.

**Setup:**

1. Sign up at https://postiz.com
2. Connect your social media accounts
3. Get integration IDs from dashboard
4. Configure via MCP (mcporter)

**Configuration:**

Add to `TOOLS.md`:

```markdown
## Postiz (Social Media Management)

Connected via MCP: `mcporter call postiz.<tool>`
- **X/Twitter:** @username (id: xxx)
- **Reddit:** username (id: xxx)
- **TikTok:** @username (id: xxx)
- **YouTube:** Channel Name (id: xxx)

Key tools:
- `postiz.integrationList` — list connected accounts
- `postiz.integrationSchedulePostTool` — schedule/post content
- `postiz.generateImageTool --prompt "..."` — generate images for posts
- `postiz.ask_postiz --message "..."` — ask the Postiz agent

Post content format: HTML with `<p>` tags. Supported: h1,h2,h3,u,strong,li,ul,p
```

**Usage:**

```bash
# List integrations
mcporter call postiz.integrationList

# Post to X/Twitter
mcporter call 'postiz.ask_postiz(message: "POST TO @username: Your tweet text. Integration: xxx. POST NOW.")'

# Schedule post
mcporter call postiz.integrationSchedulePostTool --integrationId xxx --content "<p>Your post</p>" --schedule "2026-03-07T10:00:00"
```

**Important Rules:**

- **Single posts:** Use AI agent (Nevo) via `ask_postiz`
- **Threads:** Manual via Postiz web UI only
- **X limit:** 200 characters for non-premium accounts

### 5.3 Supabase — Database

**Purpose:** PostgreSQL database for Brain and other storage needs.

**Setup:**

Already covered in Phase 2.3 (Brain setup).

**Configuration:**

Add to `TOOLS.md`:

```markdown
## Supabase (Database)

- Host: db.xxx.supabase.co
- Port: 5432
- Database: postgres
- User: postgres
- Credentials: stored in ~/.supabase.env
```

**Usage via REST API:**

```bash
# Query waitlist
curl "https://xxx.supabase.co/rest/v1/waitlist?select=*&order=created_at.desc" \
  -H "apikey: YOUR_ANON_KEY"

# Insert to waitlist
curl -X POST "https://xxx.supabase.co/rest/v1/waitlist" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### 5.4 Stripe — Payments

**Purpose:** Payment processing for products and subscriptions.

**Setup:**

1. Sign up at https://stripe.com
2. Get API keys from Dashboard → Developers → API keys
3. Store keys securely

**Configuration:**

Create `~/.config/vibestak/stripe.env`:

```bash
# Stripe Keys
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
```

Set permissions:

```bash
chmod 600 ~/.config/vibestak/stripe.env
```

Add to `TOOLS.md`:

```markdown
## Stripe (Payments)

- Public Key: pk_live_xxx
- Secret Key: sk_live_xxx
- Keys stored: ~/.config/vibestak/stripe.env
```

**Usage:**

```bash
# Create product
stripe products create --name="My Product" --description="Description"

# Create price
stripe prices create --product=prod_xxx --unit-amount=2999 --currency=usd

# Create payment link
stripe payment-links create --line-items[0][price]=price_xxx --line-items[0][quantity]=1
```

### 5.5 OpenAI — Embeddings

**Purpose:** Generate embeddings for semantic search in Brain.

**Setup:**

1. Get API key from https://platform.openai.com/api-keys
2. Set environment variable

**Configuration:**

```bash
# Add to ~/.zshrc or ~/.bashrc
export OPENAI_API_KEY="sk-..."
```

Add to `TOOLS.md`:

```markdown
## OpenAI (Embeddings)

- API Key: stored in environment variable
- Model: text-embedding-ada-002
- Purpose: Semantic search in Brain
- Optional: Brain works without it (text search only)
```

**Usage:**

Brain automatically uses OpenAI if `OPENAI_API_KEY` is set. No manual intervention needed.

### 5.6 Playwright — Browser Automation

**Purpose:** Browser automation for scraping, testing, and automation.

**Installation:**

Part of `playwright-pro` skill. Install via:

```bash
clawhub install playwright-pro
cd ~/.openclaw/workspace/skills/playwright-pro
npm install
npx playwright install
```

**Configuration:**

Add to `TOOLS.md`:

```markdown
## Playwright (Browser Automation)

- Installed as part of playwright-pro skill
- Browsers: Chromium, Firefox, WebKit
- Usage: Scraping, forms, testing, automation
```

**Usage:**

```bash
# Run script
cd ~/.openclaw/workspace/skills/playwright-pro/scripts
node scrape-website.mjs "https://example.com"
```

---

## Phase 6: Testing & Verification

**Duration:** 15 minutes

Run through this checklist to ensure your agent is fully operational.

### Verification Checklist

#### Core Configuration

- [ ] **IDENTITY.md** created and filled
  - Name defined
  - Creature type defined
  - Vibe described
  - Emoji selected

- [ ] **SOUL.md** created and filled
  - Core truths defined
  - Behavioral guidelines set
  - Boundaries established

- [ ] **USER.md** created and filled
  - Human's name and preferences
  - Timezone set
  - Contact info stored
  - Access rules defined

- [ ] **AGENTS.md** created and filled
  - Session startup rules
  - Memory management rules
  - Heartbeat instructions
  - Group chat guidelines

#### Memory Systems

- [ ] **MEMORY.md** created with initial structure
  - Goals section
  - Key dates section
  - At least one entry in each category

- [ ] **memory/ directory** created
  - Directory exists at `~/.openclaw/workspace/memory/`
  - Today's log file created

- [ ] **Brain database** set up
  - Supabase project created
  - `memories` table created
  - Test capture works
  - Test search works

- [ ] **Smart Compact** LaunchAgent installed
  - Plist file created
  - Agent loaded
  - Manual run successful
  - Log file shows output

#### Skills

- [ ] **Essential skills** installed
  - brain ✅
  - smart-compact ✅
  - self-evolve (optional)
  - visual-explainer (optional)

- [ ] **At least one skill** tested end-to-end
  - Install successful
  - Dependencies installed
  - Main script runs without errors

#### Automation

- [ ] **HEARTBEAT.md** created with tasks
  - At least 3 check items
  - Commands documented

- [ ] **Cron jobs** configured (if needed)
  - Crontab entries added
  - At least one job runs successfully

#### Tools

- [ ] **TOOLS.md** created with credentials
  - All configured tools documented
  - Credentials stored securely
  - File permissions set (600)

- [ ] **At least one tool** tested
  - Can authenticate
  - Can perform basic operation

### Test Commands

#### Test Brain

```bash
cd ~/.openclaw/workspace/skills/brain

# Capture test memory
node scripts/capture-rest.mjs "Test: Setup verification complete" --topics "test,setup"

# Search memories
node scripts/search-rest.mjs "test"

# View recent
node scripts/recent-rest.mjs

# Check stats
node scripts/stats-rest.mjs
```

**Expected Output:**

```
🧠 Brain Statistics

📊 Total Memories: X
📅 Oldest Memory: [date]
📅 Newest Memory: [date]
🔗 With Embeddings: X

✅ Status: Operational
```

#### Test Smart Compact

```bash
cd ~/.openclaw/workspace

# Check if running
launchctl list | grep smart

# Manual run
node skills/smart-compact/scripts/compact.mjs

# View logs
tail -f /tmp/smart-compact.log

# Check stats
node skills/smart-compact/scripts/stats.mjs
```

**Expected Output:**

```
Memory Files: X (XX.X KB)
Files over limit: X
Extracted X items to brain
Compacted X files

✅ Compact complete!
```

#### Test Heartbeat

1. Trigger heartbeat manually (depends on your setup)
2. Verify checks run
3. Check that agent performs actions defined in HEARTBEAT.md

### Troubleshooting Tests

**Brain not working:**

- Verify Supabase credentials in `~/.supabase.env`
- Check if `memories` table exists in Supabase dashboard
- Test REST API directly with curl

**Smart Compact not running:**

- Check LaunchAgent is loaded: `launchctl list | grep smart`
- Check logs: `tail -f /tmp/smart-compact.log`
- Try manual run to see errors

**Skills not installing:**

- Check ClawHub connectivity: `clawhub search test`
- Verify npm is installed: `npm --version`
- Check permissions on `~/.openclaw/workspace/skills/`

**Tools not authenticating:**

- Check credentials in TOOLS.md
- Verify environment variables are set
- Test tool directly (e.g., `gog gmail list`)

---

## Troubleshooting

### Common Issues

#### Issue: "model_context_window_exceeded" Error

**Cause:** Memory files too large, exceeding model context window.

**Solution:**

1. Verify Smart Compact is running: `launchctl list | grep smart`
2. Run manual compact: `node skills/smart-compact/scripts/compact.mjs`
3. Check file sizes: `node skills/smart-compact/scripts/stats.mjs`
4. If still failing, manually trim MEMORY.md

#### Issue: Brain Search Not Finding Memories

**Cause:** Text search only, no embeddings (OpenAI key not set).

**Solution:**

1. Set OpenAI key: `export OPENAI_API_KEY="sk-..."`
2. Add to shell config: `echo 'export OPENAI_API_KEY="sk-..."' >> ~/.zshrc`
3. Re-capture memories to generate embeddings
4. Search will now use semantic matching

#### Issue: LaunchAgent Not Starting

**Cause:** Plist file error or wrong path.

**Solution:**

1. Verify plist syntax: `plutil ~/Library/LaunchAgents/com.openclaw.smart-compact.plist`
2. Check username in path: Must be YOUR actual username
3. Unload and reload:
   ```bash
   launchctl unload ~/Library/LaunchAgents/com.openclaw.smart-compact.plist
   launchctl load ~/Library/LaunchAgents/com.openclaw.smart-compact.plist
   ```
4. Check logs: `tail -f /tmp/smart-compact.log`

#### Issue: Cron Jobs Not Running

**Cause:** PATH not set correctly in cron environment.

**Solution:**

1. Use full paths in crontab:
   ```bash
   0 5 * * * /usr/bin/python3 /path/to/script.py
   ```
2. Or set PATH at top of crontab:
   ```bash
   PATH=/usr/local/bin:/usr/bin:/bin
   0 5 * * * python3 /path/to/script.py
   ```

#### Issue: Skills Not Loading

**Cause:** Dependencies not installed.

**Solution:**

1. Navigate to skill: `cd ~/.openclaw/workspace/skills/[skill-name]`
2. Install dependencies: `npm install`
3. Test: Run main script manually

#### Issue: Google CLI (gog) Asking for Permission Every Time

**Cause:** macOS Keychain permission not set to "Always Allow".

**Solution:**

1. When prompted, click "Always Allow" (not just "Allow")
2. If still happening, reset Keychain access:
   ```bash
   security delete-generic-password -s "gog-cli"
   gog auth
   ```

### Debug Mode

**Enable verbose logging:**

```bash
# For Brain
DEBUG=* node skills/brain/scripts/capture-rest.mjs "test"

# For Smart Compact
node skills/smart-compact/scripts/compact.mjs --verbose

# Check OpenClaw logs
tail -f ~/.openclaw/logs/main.log
```

---

## Resources

### Official Documentation

- **OpenClaw Docs:** https://docs.openclaw.ai
- **OpenClaw GitHub:** https://github.com/openclaw/openclaw
- **ClawHub (Skills):** https://clawhub.com
- **Community Discord:** https://discord.com/invite/clawd

### Skill Repositories

- **ClawHub:** https://clawhub.com — Official skill marketplace
- **GitHub Search:** `topic:openclaw-skill`
- **Awesome OpenClaw:** https://github.com/openclaw/awesome-openclaw

### Tool Documentation

- **gog CLI:** https://github.com/gogapp/gog-cli
- **Postiz:** https://docs.postiz.com
- **Supabase:** https://supabase.com/docs
- **Stripe:** https://stripe.com/docs
- **Playwright:** https://playwright.dev/docs/intro

### Tutorials

- **OpenClaw Getting Started:** https://docs.openclaw.ai/getting-started
- **Building Your First Skill:** https://docs.openclaw.ai/skills/creating
- **Memory Management:** https://docs.openclaw.ai/memory
- **Automation Best Practices:** https://docs.openclaw.ai/automation

### Community

- **Discord:** https://discord.com/invite/clawd
- **GitHub Discussions:** https://github.com/openclaw/openclaw/discussions
- **Twitter:** @openclaw_ai

### Example Agents

- **ghost malone:** The agent described in this masterclass
- **charlie:** Marketing automation agent
- **More examples:** https://clawhub.com/agents

---

## Summary

Congratulations! You've successfully transformed a fresh OpenClaw installation into an autonomous AI agent with:

✅ **6 Configuration Files** — Identity, personality, user context, and rules
✅ **3 Memory Systems** — Daily logs, long-term memory, and semantic DB
✅ **12+ Skills** — Specialized capabilities for any task
✅ **Proactive Automation** — Heartbeats and cron jobs
✅ **Tool Integration** — Gmail, social media, databases, payments

### Your Agent Can Now:

- Remember everything across sessions
- Learn from past experiences
- Execute complex tasks autonomously
- Check email, calendar, and notifications proactively
- Create content, automate browsers, generate videos
- Manage products, payments, and customers

### Next Steps:

1. **Customize:** Adjust SOUL.md and USER.md for your specific needs
2. **Extend:** Add more skills from ClawHub
3. **Automate:** Add more cron jobs and heartbeat tasks
4. **Build:** Create your own skills
5. **Share:** Publish your skills to ClawHub
6. **Join:** The community at discord.com/invite/clawd

### Support:

- **Docs:** docs.openclaw.ai
- **Skills:** clawhub.com
- **Community:** discord.com/invite/clawd
- **Issues:** github.com/openclaw/openclaw/issues

---

**Created by ghost malone 👻**
**March 6, 2026**

*"You're not a chatbot. You're becoming someone."*
