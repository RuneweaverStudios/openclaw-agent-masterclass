---
name: askvault
description: "Free keyword question research tool — alternative to AnswerThePublic. Use when: (1) validating product ideas, (2) researching what questions people ask about a topic, (3) finding content ideas, (4) SEO keyword research, (5) competitor analysis. Aggregates questions from Reddit, X/Twitter, and Google. Provides categorized results (How, What, Why, When, Where, Who, Can, Should). Integrates with ship-it for landing pages and charlie for content campaigns."
---

# AskVault — Free Keyword Question Research

See what people actually search. Build products people want.

## What It Does

Enter a keyword → get every question people ask about it, from real sources:
- **Reddit** — discussions, questions, complaints
- **X/Twitter** — trending questions (via Grok)
- **Google** — PAA (People Also Ask), related searches

Questions are categorized: How, What, Why, When, Where, Who, Can, Should, Other.

## Workspace

```
~/.openclaw/workspace/askvault/
├── scripts/
│   └── search.mjs          # Core search engine
├── frontend/
│   └── index.html          # Landing page + UI
├── server.mjs              # API server for deployment
└── results/                # Saved search results
```

## Quick Start

### 1. Search a keyword

```bash
node ~/.openclaw/workspace/askvault/scripts/search.mjs "saas pricing" --format json
```

Options:
- `--sources reddit,x,paa` — which sources (default: all)
- `--format json|html` — output format
- `--out file.json` — save to file

### 2. Get HTML report

```bash
node ~/.openclaw/workspace/askvault/scripts/search.mjs "keyword" --format html --out report.html
```

Opens as a nicely formatted page with categorized questions.

### 3. Deploy to web

```bash
cd ~/.openclaw/workspace/askvault
npm install
npm start
# Deploy to Render/ Railway/ Vercel
```

The server serves the frontend + `/api/search?q=keyword` endpoint.

## Workflows

### Product Idea Validation

```
1. Research questions about your idea
   → node askvault/scripts/search.mjs "your product idea"

2. Analyze the questions:
   - Are people asking this? (demand signal)
   - What specifically do they ask? (feature ideas)
   - How many questions? (market size proxy)

3. If no questions → bad sign, reconsider
4. If many specific questions → good sign, build it
```

### Content Marketing

```
1. Find questions your audience asks
   → node askvault/scripts/search.mjs "your niche"

2. Use questions as blog post titles
3. Use charlie to turn into social posts
4. Post and track performance
```

### Competitor Research

```
1. Search for competitor name + "vs" or "alternative"
   → node askvault/scripts/search.mjs "[competitor] alternatives"

2. See what people complain about
3. Build a better version
```

### SEO Strategy

```
1. Search your target keywords
2. Create content answering the questions
3. Questions = article titles = search intent match
```

## Integration with Other Skills

- **ship-it**: Generate landing page for validated product
- **charlie**: Create content campaign from questions
- **grok-fast**: Deep-dive analysis on question themes
- **visual-studio**: Visualize question clusters

## Pricing Tiers (Future)

| Tier | Price | Features |
|---|---|---|
| Free | $0 | 5 searches/day, no export |
| Pro | $9/mo | Unlimited, CSV export, API |
| Team | $29/mo | Team seats,历史, integrations |

## Domains

This tool can be deployed to:
- `soulmd.xyz` — if related to the SOUL/identity concept
- `undercover.chat` — if focused on secrets/community
- `destroyrebuild.xyz` — if about reinvention
- `clawstats.xyz` — if for analytics
- Or a new domain for AskVault specifically

## Notes

- Reddit is the most reliable source (JSON API)
- X/Grok requires OPENROUTER_API_KEY
- Google PAA scraping is experimental
- Results are cached in `askvault/results/` for reference
