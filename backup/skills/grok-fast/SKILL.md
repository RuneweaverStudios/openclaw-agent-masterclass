---
name: grok-fast
description: "Route Twitter/X analysis and general prompts through Grok (x-ai) via OpenRouter. Use when: (1) user asks about Twitter/X trends, tweets, or social media analysis, (2) user explicitly requests Grok, (3) tasks benefit from Grok's real-time X/Twitter knowledge, (4) need a fast/cheap second opinion from a different model. Requires OPENROUTER_API_KEY env var."
---

# Grok Fast

Route prompts through Grok models via OpenRouter. Optimized for X/Twitter analysis but works for any task.

## Setup

Requires `OPENROUTER_API_KEY` env var. Never hardcode API keys.

### Option 1: OpenClaw config (recommended)

Add to `~/.openclaw/openclaw.json` under `env`:

```json
{
  "env": {
    "OPENROUTER_API_KEY": "sk-or-..."
  }
}
```

### Option 2: Shell export

```bash
export OPENROUTER_API_KEY="sk-or-..."
```

### Option 3: Skill-level config

Add to skills config in `openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "grok-fast": {
        "env": { "OPENROUTER_API_KEY": "sk-or-..." }
      }
    }
  }
}
```

## Available Models

| Model | Speed | Cost | Best For |
|-------|-------|------|----------|
| `x-ai/grok-4.1-fast` | ⚡ Fastest | $0.20/$0.50/M | Default. Twitter analysis, quick tasks |
| `x-ai/grok-4-fast` | ⚡ Fast | $0.20/$0.50/M | General fast tasks |
| `x-ai/grok-4` | 🧠 Smart | $3/$15/M | Complex analysis, reasoning |
| `x-ai/grok-3-mini` | ⚡ Fast | $0.30/$0.50/M | Budget alternative |

## Script: grok.mjs

```bash
# Quick question
node grok.mjs "What's trending on X right now?" --raw

# Twitter analysis mode (optimized system prompt)
node grok.mjs "Analyze engagement patterns for @username" --twitter --raw

# With context file
node grok.mjs "Summarize the key points" --context data.txt --raw

# JSON output
node grok.mjs "List top 5 AI companies as JSON" --json --raw

# Stream long responses
node grok.mjs "Write a thread about AI agents" --stream

# Use smarter model for complex tasks
node grok.mjs "Deep analysis of crypto market" --model x-ai/grok-4 --raw

# Pipe content in
cat article.md | node grok.mjs "Summarize this" --stdin --raw

# Custom system prompt
node grok.mjs "Draft a tweet" --system "You are a viral tweet writer. Be punchy and engaging." --raw
```

## Agent Integration Patterns

### Quick Grok Call (from agent context)

```bash
# One-liner for agent use
node scripts/grok.mjs "What are people saying about OpenClaw on X?" --twitter --raw
```

### Twitter Research Pipeline

```bash
# 1. Search Reddit for sentiment
node playwright-pro/scripts/reddit-search.mjs "OpenClaw review" --limit 5 > /tmp/reddit.json

# 2. Feed to Grok for analysis
node grok-fast/scripts/grok.mjs "Analyze this Reddit sentiment about OpenClaw and suggest content angles for X/Twitter" --context /tmp/reddit.json --twitter --raw
```

### Override Default Model

Set `GROK_MODEL` env var to change the default without passing `--model` every time:

```bash
export GROK_MODEL=x-ai/grok-4
```
