---
name: tweet-formatter
description: "Analyze viral tweets and replicate their formatting, prose, and delivery patterns. Use when: (1) optimizing tweets for engagement, (2) learning from top performers in niche, (3) A/B testing different formats, (4) building a personal tweet style. Integrates with askvault for research and charlie for posting/optimization."
---

# Tweet Formatter — Viral Tweet Patterns

Analyze what makes tweets go viral and replicate those patterns.

## Quick Start

```bash
# Analyze a tweet
node tweet-formatter/scripts/analyze.mjs "https://twitter.com/user/status/123"

# Format your tweet using patterns
node tweet-formatter/scripts/format.mjs "Your content" --style viral

# Get best format for your topic
node tweet-formatter/scripts/recommend.mjs "AI agents"
```

## What It Does

1. **Analyze** — Break down viral tweets into components
2. **Extract** — Identify patterns in formatting, prose, delivery
3. **Replicate** — Apply winning patterns to your content
4. **Learn** — Monitor engagement and optimize

## Viral Tweet Anatomy

### The Hook (First 3 words)
- Must grab attention immediately
- Question, bold claim, or curiosity gap
- Examples: "Hot take:", "Nobody talks about", "So I finally"

### The Body
- Short sentences (easy to read)
- Use formatting: **bold**, bullet points, numbers
- One idea per tweet (for threads, spread across tweets)
- End with engagement bait: "↓", "💭", "🔥"

### The CTA
- Soft ask: "follow for more"
- Or none at all (let content speak)
- Hashtags: 2-4 max, relevant

## Popular Tweet Formulas

### The Listicle
```
[TITLE]:
• Point 1
• Point 2
• Point 3

[CTA or nothing]
#Hashtag
```

### The Story Hook
```
🧵 [Hook that promises value]

[Context - 1 sentence]
[Challenge - 1 sentence]
[Solution - 1 sentence]

↓ for the full breakdown
```

### The Hot Take
```
Hot take: [Controversial statement]

[Support your claim - 1-2 sentences]

[Counter-point or leave hanging]
```

### The Contrarian
```
Everyone thinks [common belief].
But [your take].

Here's why they're wrong:
1. [Reason 1]
2. [Reason 2]
3. [Reason 3]

[CTA]
```

### The Results Post
```
[N timeframe] results:

[Metric 1]: [Result]
[Metric 2]: [Result]
[Metric 3]: [Result]

[What you learned / takeaway]
```

### The Thread Hook
```
🧵 [Promise specific outcome]

I'll show you [X] in [Y] steps.

↓ Let's go
```

## Formatting Rules

| Element | Do | Don't |
|---|---|---|
| Length | 100-280 chars | Over 280 |
| Emojis | 1-3 max | Emoji spam |
| Hashtags | 2-4 | 5+ (looks spammy) |
| Links | 1 max | Multiple |
| Formatting | **bold**, • bullets | ALL CAPS |
| Line breaks | 1-2 max | 5+ (too much white space) |

## Learning from Engagement

Charlie tracks what works:

```bash
# After posting, Charlie logs:
- Hook used
- Format type
- Engagement metrics (likes, RTs, replies)
- Time posted

# Then analyzes weekly:
- Which hooks perform best?
- Which formats get more RTs?
- Best posting times?
- Adjusts strategy accordingly
```

## Usage with Charlie

```
1. Generate tweet content
2. Run through tweet-formatter for optimization
3. Humanize with humanizer-pro
4. Post via Postiz
5. Track engagement
6. Learn and optimize
```

## Scripts

### analyze.mjs
Analyze a tweet URL and extract its pattern

### format.mjs
Format your content using viral patterns

### recommend.mjs
Get format recommendations for your topic

### learn.mjs
Process engagement data and update recommendations
