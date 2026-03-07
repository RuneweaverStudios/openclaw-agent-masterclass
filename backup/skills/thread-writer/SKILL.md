---
name: thread-writer
description: "Generate complete Twitter/X threads for content marketing. Use when: (1) creating thread content for X/Twitter, (2) turning blog posts into threads, (3) repurposing content across platforms, (4) building thought leadership. Integrates with humanizer-pro for natural writing and visual-explainer for images."
---

# Thread Writer — Generate X/Twitter Threads

Create compelling Twitter threads that hook, educate, and convert.

## Quick Start

```bash
# Generate a thread
node thread-writer/scripts/generate.mjs "Your topic"

# Generate from topic file
node thread-writer/scripts/generate.mjs --topic file.txt

# With customization
node thread-writer/scripts/generate.mjs "How to build AI agents" --tweets 10 --tone casual
```

## What It Does

1. **Research** — Use askvault to find what resonates
2. **Outline** — Build thread structure
3. **Write** — Generate each tweet
4. **Humanize** — Run through humanizer-pro
5. **Visualize** — Create images for key tweets

## Thread Structure

### The Hook (Tweet 1)
- Grabs attention in first 3 words
- Sets up the story
- Ends with "↓" to encourage threadtap

### The Body (Tweets 2-6)
- Build the narrative
- Mix: lessons, steps, results, insights
- Use formatting: bullet points, bold, lists

### The CTA (Final Tweet)
- Soft ask: follow, retweet, or link
- Mention your product/service naturally
- Hashtag strategically (2-4 max)

## Thread Types

| Type | Structure | Best For |
|---|---|---|
| **Story** | Hook → Context → Challenge → Solution → CTA | Personal brand |
| **How-To** | Hook → Step 1 → Step 2 → Step 3 → CTA | Education |
| **Listicle** | Hook → Item 1 → Item 2 → ... → CTA | Engagement |
| **Announcement** | Hook → What → Why → When → CTA | Launches |
| **Threadtap** | Hook → Deep dive 1 → Deep dive 2 → CTA | Thought leadership |

## Usage

```bash
# Basic
node thread-writer/scripts/generate.mjs "topic"

# Full pipeline (generate + humanize + save)
node thread-writer/scripts/generate.mjs "topic" --humanize --output ./threads/

# With visual
node thread-writer/scripts/generate.mjs "topic" --visual tweet3
```

## Integration

- **humanizer-pro**: Run each tweet through before using
- **visual-explainer**: Generate images for stack/product tweets
- **charlie**: Use as source for content campaign
- **askvault**: Research topic first for better hooks

## Tips

- Tweet 1 determines 80% of thread performance
- Use formatting (• bullet, **bold**) for scannability
- End each tweet with engagement bait (↓ → 💭 🔥)
- Threadtap > quote-tweets for reach
- Post thread at 8am or 12pm for max engagement
