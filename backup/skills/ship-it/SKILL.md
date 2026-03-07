---
name: ship-it
description: "Generate production-ready landing pages and marketing sites. Use when: (1) creating landing pages for products or services, (2) building squeeze/email capture pages, (3) generating sales pages with pricing, (4) creating comparison or review pages, (5) any marketing page that needs to convert visitors. Generates self-contained HTML with modern design, SEO meta tags, responsive layout, and conversion-optimized copy structure."
---

# Ship It — Landing Page Generator

Generate high-converting landing pages. Self-contained HTML, no build step.

## Quick Start

```bash
# Product launch page
node scripts/landing.mjs --type product \
  --name "Ghost Tools" \
  --headline "AI Agents That Actually Work" \
  --price "$29/mo" \
  --benefits "Automate research,Monitor competitors,Generate content" \
  --cta "Start Free Trial" \
  --open

# Squeeze page (email capture)
node scripts/landing.mjs --type squeeze \
  --headline "Get the Free AI Agent Playbook" \
  --subtitle "How to build a $40K/mo business with zero employees" \
  --cta "Send Me The Playbook" \
  --open

# Pricing page
node scripts/landing.mjs --type pricing \
  --name "Ghost Tools" \
  --tiers '[{"name":"Starter","price":"$9/mo","features":["5 agents","Basic support"]},{"name":"Pro","price":"$29/mo","features":["Unlimited agents","Priority support","API access"],"featured":true},{"name":"Enterprise","price":"$99/mo","features":["Everything in Pro","Custom agents","Dedicated support"]}]' \
  --open

# From JSON config
cat page-config.json | node scripts/landing.mjs --stdin --open
```

## Script: landing.mjs

### Options

- `--type` — page type: `product`, `squeeze`, `pricing`, `comparison`, `review`, `waitlist`
- `--name` — product/company name
- `--headline` — main headline (H1)
- `--subtitle` — supporting text
- `--price` — price display
- `--benefits` — comma-separated benefit list
- `--features` — comma-separated feature list
- `--cta` — call-to-action button text
- `--tiers` — JSON array of pricing tiers (for pricing type)
- `--theme` — `dark`, `light`, `startup`, `minimal` (default: startup)
- `--accent` — hex accent color
- `--out` — output path (default: /tmp/landing-timestamp.html)
- `--open` — open in browser
- `--stdin` — read JSON config from stdin

### JSON Config Format

```json
{
  "type": "product",
  "name": "Product Name",
  "headline": "Main Headline",
  "subtitle": "Supporting text",
  "price": "$29/mo",
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "features": ["Feature 1", "Feature 2"],
  "cta": "Get Started",
  "testimonials": [
    { "quote": "Amazing product!", "author": "Jane D.", "role": "CEO" }
  ],
  "faq": [
    { "q": "How does it work?", "a": "Simple answer here." }
  ],
  "theme": "startup"
}
```

## Copywriting Frameworks (for inline generation)

When generating copy without the script, use these frameworks:

**AIDA** (Attention → Interest → Desire → Action):
- Headline grabs attention with bold claim
- Benefits create interest
- Social proof + details build desire
- CTA drives action

**PAS** (Problem → Agitation → Solution):
- Name the pain point
- Make it feel urgent
- Present your product as the answer

## SEO Checklist (auto-included)

Every generated page includes:
- `<title>` with product name + headline
- `<meta description>` from subtitle
- Open Graph tags (og:title, og:description)
- Twitter Card tags
- Semantic HTML (proper heading hierarchy)
- Mobile viewport meta tag
- Schema.org Product/Organization markup
