---
name: charlie
description: "Autonomous multi-platform marketing agent. Use when: (1) creating social media content for X/TikTok/Reddit/YouTube, (2) scheduling posts across platforms, (3) researching competitors and trends, (4) analyzing post performance and optimizing, (5) generating marketing images or slideshows, (6) building content calendars, (7) A/B testing hooks and CTAs, (8) any marketing automation task. Integrates with Postiz (posting + analytics), Playwright (research), Grok (X analysis), and image generation. Self-optimizing: tracks what works, doubles down on winners, kills losers."
---

# Charlie — Autonomous Marketing Agent

Multi-platform content marketing that self-optimizes. Research → Create → Post → Analyze → Iterate.

## Architecture

Charlie uses your existing tools as a pipeline:

```
Research (Playwright + Grok) → Strategy → Create Content → Post (Postiz MCP)
     ↑                                                           ↓
     └──────────── Analyze (Postiz Analytics) ←──────────────────┘
```

## Prerequisites

- **Postiz MCP** connected (for posting + analytics)
- **OpenAI API key** or image generation capability (for slideshows)
- **Playwright-pro** skill (for competitor research)
- **Grok-fast** skill (for X/Twitter trend analysis)
- **visual-explainer** skill (for diagrams & slide decks)
- **humanizer-pro** skill (CLI tool to remove AI patterns)
- **thread-writer** skill (generate complete X/Twitter threads)
- **tweet-formatter** skill (apply viral patterns, optimize for engagement)
- **content-engine** skill (automated content pipeline, runs on cron)

## Workspace

```
~/.openclaw/workspace/charlie/
├── config.json           # Master config (platforms, audience, brand)
├── strategy.json         # Current content strategy
├── hooks.json            # Hook library with performance scores
├── competitors.json      # Competitor research data
├── posts/                # Generated post content
│   └── YYYY-MM-DD-HHMM/
├── reports/              # Daily performance reports
│   └── YYYY-MM-DD.md
└── assets/               # Generated images, templates
```

## First Run — Setup

On first load, gather context conversationally (don't dump a checklist):

1. **What are we promoting?** Product/app/service name, what it does, who it's for
2. **What platforms?** Which Postiz integrations to use (check via `mcporter call postiz.integrationList`)
3. **What's the goal?** Followers, revenue, signups, brand awareness
4. **Brand voice?** Casual, professional, edgy, funny — or "figure it out"
5. **Image style?** Photo-realistic, graphic, illustrated, meme-style

Save to `charlie/config.json`:

```json
{
  "product": { "name": "", "description": "", "audience": "", "url": "" },
  "platforms": { "tiktok": "integration-id", "x": "integration-id", "reddit": "integration-id" },
  "goal": "revenue",
  "voice": "casual-professional",
  "imageStyle": "photorealistic",
  "posting": { "schedule": ["08:00", "12:30", "18:00"], "timezone": "America/Los_Angeles" },
  "tracking": { "conversionUrl": "", "revenueSource": "" }
}
```

## Content Creation Pipeline

### 1. Research Phase

```bash
# Competitor research via Playwright
node playwright-pro/scripts/reddit-search.mjs "competitor keyword" --limit 10 --sort top
node playwright-pro/scripts/x-search.mjs "niche keyword" --auth x-auth.json --sort latest --min-likes 50

# Trend analysis via Grok
node grok-fast/scripts/grok.mjs "What content is going viral in [niche] on X right now?" --twitter --raw
```

Save findings to `charlie/competitors.json`.

### 2. Hook Generation

Hooks are everything. Maintain a scored library in `charlie/hooks.json`:

```json
[
  { "hook": "I built a $40K/mo business with zero employees", "category": "achievement", "score": 0, "uses": 0, "avgViews": 0 },
  { "hook": "This AI tool replaced my entire marketing team", "category": "ai-tools", "score": 0, "uses": 0, "avgViews": 0 }
]
```

**Hook categories (rotate through these):**
- `achievement` — results, milestones, revenue numbers
- `curiosity` — "I tried X and this happened..."
- `controversy` — hot takes, unpopular opinions
- `tutorial` — "How to X in 5 steps"
- `story` — personal narrative, journey
- `trend` — riding current trends/news

**Score formula:** `score = (views * 0.4) + (engagement_rate * 0.3) + (conversions * 0.3)`

### 3. Content Creation

**For TikTok Slideshows (highest ROI):**
- 6 slides exactly (TikTok sweet spot)
- Hook text overlay on slide 1
- Story-style caption mentioning product naturally
- Max 5 hashtags
- Portrait orientation (1080x1920)
- Post as draft → user adds trending sound → publish

**For X/Twitter:**
- Thread format: hook tweet + 3-5 value tweets + CTA
- Single tweet: hook + image/screenshot
- Quote-tweet trending topics with relevant take

**For Reddit:**
- Value-first posts in relevant subreddits
- Never lead with promotion — contribute genuinely
- Mention product only in context, naturally

**For Visual Content (Diagrams & Slides):**
- Use **visual-explainer** skill to create:
  - **Slide decks** for Twitter/X threads: `Generate a slide deck for: [topic]`
  - **Web diagrams** for educational content: `Generate an HTML diagram for: [concept]`
  - **Aesthetics**: Midnight Editorial, Warm Signal, Terminal Mono, Swiss Clean
  - Outputs to `~/.agent/diagrams/` — share as screenshots
- Perfect for: thread graphics, explainer posts, carousels, educational content

**⚠️ ALWAYS Humanize Before Posting:**
- Use **humanizer-pro** CLI BEFORE posting any content:
  ```bash
  node humanizer-pro/scripts/humanize.mjs "your tweet text"
  ```
- AI-generated text has telltale signs: inflated language, too many em-dashes, rule of three, generic phrases
- Humanizer-pro removes these patterns and adds personality
- After generating any tweet/post/caption, run through humanizer

**For Threads, Use thread-writer:**
- Generate complete threads with:
  ```bash
  node thread-writer/scripts/generate.mjs "your topic" --tweets 7 --humanize
  ```
- Options: `--tweets n`, `--tone casual|professional|edgy`, `--humanize`, `--output dir`
- Integrates with humanizer-pro automatically

**For Single Tweets, Use tweet-formatter:**
- Optimize any tweet for virality:
  ```bash
  # Get format recommendations
  node tweet-formatter/scripts/recommend.mjs "your topic"
  
  # Format with viral patterns
  node tweet-formatter/scripts/format.mjs "Your content" --style viral --engagement downArrow
  ```
- Styles: viral, listicle, story, contrarian, results
- Engagement: downArrow, thinking, fire, lightbulb
- Charlie learns from engagement and optimizes

### 4. Posting via Postiz MCP

```bash
# Schedule a post
mcporter call postiz.integrationSchedulePostTool --args '{
  "socialPost": [{
    "integrationId": "YOUR_TIKTOK_ID",
    "isPremium": false,
    "date": "2026-03-05T08:00:00Z",
    "shortLink": false,
    "type": "draft",
    "postsAndComments": [{
      "content": "<p>Your caption here with #hashtags</p>",
      "attachments": ["https://image-url-1.png", "https://image-url-2.png"]
    }],
    "settings": []
  }]
}'

# Cross-post to multiple platforms simultaneously
# Just add more items to the socialPost array with different integrationIds
```

### 5. Generate Images

For slideshows, use Postiz's built-in image generation or OpenAI:

```bash
# Via Postiz
mcporter call postiz.generateImageTool --args '{"prompt": "iPhone photo of a modern workspace..."}'

# Or use OpenAI directly (set OPENAI_API_KEY env)
# Generate 6 slides with consistent base prompt + varying styles
```

**Image prompt rules (from Larry's lessons):**
- "iPhone photo" + "realistic lighting" = looks real
- Lock architecture/layout across all slides (same room, different styles)
- Include everyday objects (mugs, remotes) for lived-in feel
- Portrait orientation always for TikTok
- Be obsessively specific > generic

## Self-Optimization Loop

### Daily Content (content-engine)

Use **content-engine** skill to automate daily content:

```bash
# Run content engine (or let cron handle it)
node content-engine/scripts/run.mjs
```

The content-engine runs every 3 hours automatically via cron and:
1. Researches trending topics via askvault
2. Generates content with thread-writer
3. Formats with tweet-formatter
4. Humanizes with humanizer-pro
5. Creates visual notes for remotion-studio
6. Saves to pending/ for review/posting

### Daily Analytics Cron

Set up via OpenClaw cron — runs every morning:

1. Run content-engine to generate new content
2. Pull last 3 days of post analytics from Postiz
3. Score each hook based on performance
4. Update `hooks.json` with new scores
5. Identify patterns (which categories, times, platforms perform best)
6. Generate report with specific recommendations
7. Message user with summary

### Optimization Rules

| Signal | Action |
|---|---|
| Hook score > 80 | Create 3 variations, test on different platforms |
| Hook score < 20 after 3 uses | Retire it, analyze why it failed |
| Platform consistently underperforms | Reduce posting frequency there |
| Specific posting time outperforms | Shift more content to that slot |
| Caption style A > B | Adopt style A as default |
| Image style change improves engagement | Update base prompt |

### Weekly Strategy Review

Every 7 days, generate a comprehensive review:

1. Top 5 performing posts (with links)
2. Worst 5 performing posts (with analysis)
3. Hook category rankings
4. Platform performance comparison
5. Recommended strategy changes
6. New hook ideas based on trending content

Save to `charlie/reports/weekly-YYYY-MM-DD.md`.

## Platform-Specific Playbooks

### TikTok (Slideshows)
- 6 slides, hook on slide 1, CTA on slide 6
- Post as draft → user adds trending sound → publish
- Best times: 7:30am, 4:30pm, 9pm (local timezone)
- Carousels get 2.9x more comments than video

### X/Twitter
- Threads outperform single tweets for engagement
- Hook tweet determines 80% of thread performance
- Quote-tweeting with sharp takes builds audience fast
- Best times: 8am, 12pm, 5pm

### Reddit
- Value posts > promotional posts (10:1 ratio)
- Find 3-5 subreddits where audience lives
- Comment on others' posts before self-promoting
- "I built this" posts work if genuinely useful

### YouTube Shorts
- Repurpose TikTok content (same slideshows work)
- First 3 seconds determine everything
- Include text hooks in thumbnail frame

## Integration with Other Skills

- **ship-it**: Generate landing pages for products being promoted
- **remotion-studio**: Create video content for TikTok/YouTube
- **visual-explainer**: Create slide decks & web diagrams for social posts (thread graphics, explainers)
- **visual-studio**: Create charts, dashboards, data visualizations
- **playwright-pro**: Research competitors, scrape trending content
- **grok-fast**: Analyze X trends, generate X-optimized content
- **askvault**: Research what content topics resonate with audience
