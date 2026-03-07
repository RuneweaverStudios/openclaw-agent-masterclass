---
name: humanizer-pro
description: "Remove AI writing patterns and make text sound authentically human. Use when: (1) editing tweets/social posts before publishing, (2) cleaning up AI-generated content, (3) adding personality to bland text, (4) removing telltale AI signs (em-dash overuse, rule of three, inflated language). Includes CLI tool for batch processing."
---

# Humanizer Pro — Remove AI Patterns

The ultimate tool to make AI-generated text sound authentically human.

## Quick Start

```bash
# Humanize a tweet
node humanizer-pro/scripts/humanize.mjs "Your AI-generated text here"

# Humanize from file
node humanizer-pro/scripts/humanize.mjs --input tweet.txt --output human_tweet.txt

# Batch process
node humanizer-pro/scripts/humanize.mjs --batch ./posts/
```

## The Scripts

### humanize.mjs

Main CLI tool that:
1. Detects AI patterns
2. Rewrites to remove patterns
3. Adds personality
4. Outputs human text

## AI Patterns It Removes

| Pattern | Example | Fix |
|---|---|---|
| Em-dash overuse | "The future — it's coming — ready or not" | Use commas or periods |
| Rule of three | "Fast, cheap, and reliable" | Vary the rhythm |
| Inflated language | "revolutionary game-changing paradigm" | Use simple words |
| Vague attributions | "experts say", "research shows" | Be specific |
| AI vocabulary | "delve", "leverage", "transformational" | Use plain English |
| Superficial -ing | "Analyzing the data, it becomes clear..." | Get to the point |
| Hedging | "it's possible that", "could potentially" | Be direct |
| Perfect structure | Every sentence same length | Vary rhythm |

## How to Add Soul

Beyond removing patterns, real human writing has:

- **Opinions** — react to facts, don't just report them
- **Varying rhythm** — short punches, then long flowing sentences
- **Acknowledgment** — "I'm not sure" or "this bothers me"
- **First person** — "I think", "I've noticed"
- **Humor/edge** — not everything needs to be safe
- **Mess** — tangents and asides are human

## Integration with Charlie

Charlie ALWAYS runs content through humanizer-pro before posting:

```
Generate tweet → humanize → Post via Postiz
```

## For Social Media

When humanizing tweets/posts:
- Keep it short
- Add personality
- Don't over-correct (some AI patterns are fine)
- Read aloud — does it sound like a person would say this?

## Output

Humanized text maintains:
- Original message/meaning
- Intended tone
- Key points
But loses:
- AI tells
- Robotic patterns
- Sterile voice
