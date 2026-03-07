---
name: brain
description: "Your second brain. Semantic memory for autonomous agent. Stores and retrieves learnings, decisions, and context using pgvector embeddings."
---

# Brain — Your Owned Memory

Semantic memory stored in your own database. Not in ChatGPT. Not in Claude. Yours.

## What It Does

1. **Capture** — Store any thought, learning, decision
2. **Embed** — Convert to vector using OpenAI
3. **Search** — Find by meaning, not keywords
4. **Retrieve** — Get relevant context for any task

## Database (Supabase + pgvector)

- Table: `memories` with vector(1536) embeddings
- Semantic search via cosine similarity
- Metadata: topics, people, action items

## Usage

```bash
cd ~/.openclaw/workspace/skills/brain

# Capture a thought
node scripts/capture-rest.mjs "Decision: chose PaperClip over custom agent framework because it's battle-tested" --topics "agents,architecture" --importance high

# Search your brain
node scripts/search-rest.mjs "what decisions did we make about pricing"

# View recent memories
node scripts/recent-rest.mjs [limit]
```

## Setup Guide

See `/workspace/skills/brain/SETUP.md` for complete setup instructions.

**Current Status:** ✅ Operational (Supabase REST API)

## MCP Server (Future)

Connect via MCP to give any AI access to your brain.

## Example Captures

- Decisions and why
- Meeting learnings
- Product ideas
- Customer feedback
- Code patterns
- Business learnings

## Cost

~$0.10-0.30/month on Supabase
