# Workflows — Tool & Skill Combinations

Practical automation pipelines for the $40K MRR journey.

---

## 1. Product Idea Validation

**When:** Testing a new product idea before building  
**Tools:** askvault, playwright-pro (reddit/x-search), grok-fast, web_search

```
1. Search questions about your idea (fastest way)
   → node askvault/scripts/search.mjs "your product idea" --format json

2. Search Reddit for discussions about the problem
   → node playwright-pro/scripts/reddit-search.mjs "problem keyword" --limit 20 --sort top

3. Search X/Twitter for complaints and demands
   → node grok-fast/scripts/grok.mjs "What are people complaining about [niche] on X?" --twitter

4. Check if products already exist, their pricing, reviews
   → web_search "alternatives to [product]"

5. Analyze findings with Grok
   → node grok-fast/scripts/grok.mjs "Summarize the market for [niche]: gaps, pricing, unmet needs"

Output: Validation report — is there demand? Can we compete?
```

---

## 2. Competitor Intelligence

**When:** Understanding what rivals are doing  
**Tools:** playwright-pro, grok-fast, visual-studio

```
1. Find competitors on X
   → node playwright-pro/scripts/x-search.mjs "[niche] app" --sort top --limit 15

2. Analyze their top-performing content (Grok)
   → node grok-fast/scripts/grok.mjs "Analyze @competitor_handle's X strategy: hooks, format, frequency, engagement"

3. Scrape their landing pages
   → node playwright-pro/scripts/scrape.mjs https://competitor.com --out competitors/

4. Visualize comparison
   → node visual-studio/scripts/visualize.mjs --type comparison --data competitors.json

Output: competitors.json with strategy breakdown, gaps to exploit
```

---

## 3. Landing Page Generator → Launch

**When:** Ready to ship a product  
**Tools:** ship-it, visual-studio, grok-fast

```
1. Generate landing page
   → node ship-it/scripts/landing.mjs --type product --name "Product Name" --out ./launch

2. Add hero visualization
   → node visual-studio/scripts/diagram.mjs --type flowchart --data flow.json --theme dark

3. Write copy with Grok help
   → node grok-fast/scripts/grok.mjs "Write 5 hero headlines for a [niche] SaaS that helps [audience] achieve [benefit]"

4. Generate social proof visuals
   → node visual-studio/scripts/visualize.mjs --type testimonial --data testimonials.json --theme startup

Output: deploy-ready landing page in ./launch/
```

---

## 4. Content Campaign (Research → Create → Post)

**When:** Running social media marketing  
**Tools:** charlie, askvault, playwright-pro, grok-fast, visual-explainer, humanizer, remotion-studio, Postiz MCP

```
Phase A: Research
1. Research what questions people ask
   → node askvault/scripts/search.mjs "[niche]" --format json

2. Research niche trends
   → node playwright-pro/scripts/reddit-search.mjs "[niche]" --limit 10 --sort top
   → node grok-fast/scripts/grok.mjs "What's viral in [niche] this week?" --twitter

2. Update hook library
   → Add new hooks to charlie/hooks.json with category

Phase B: Create Content Calendar
3. Generate campaign plan
   → node charlie/scripts/campaign.mjs --config charlie/config.json --days 7 --posts-per-day 3

4. For each post, generate content:
   - Hook from library or generate new
   - Images: use Postiz generateImageTool or OpenAI gpt-image-1.5
   - For video: node remotion-studio/scripts/scaffold.mjs --template social --text "hook"

5. ⚠️ HUMANIZE all content before posting:
   - Use humanizer-pro CLI: `node humanizer-pro/scripts/humanize.mjs "your content"`
   - AI writing has telltale signs: inflated language, em-dashes, rule of three
   - humanizer-pro removes patterns and adds personality

Phase C: Post
5. Schedule via Postiz MCP
   → mcporter call postiz.integrationSchedulePostTool --args '{"socialPost":[...]}'

6. Cross-post to all platforms
   → Add multiple integrationIds to socialPost array

Output: 7-day content calendar with all posts scheduled
```

---

## 5. Daily Performance Review

**When:** Automated daily marketing audit  
**Tools:** charlie (analyze), Postiz MCP

```
1. Run analysis script
   → node charlie/scripts/analyze.mjs --config charlie/config.json --days 3 --update-hooks

2. Output includes:
   - Top 5 performing hooks
   - Category rankings
   - Underperforming hooks (retire candidates)
   - Specific recommendations

3. Push report to memory
   → Review charlie/reports/YYYY-MM-DD.md

4. Adjust next day's content:
   - Double down on winning hook categories
   - Retire losers
   - Test new hooks in promising categories

Output: Updated hooks.json with scores, actionable recommendations
```

---

## 6. Video Content Pipeline

**When:** Creating TikTok/YouTube content  
**Tools:** remotion-studio, Postiz MCP, charlie

```
1. Choose template based on content type:
   - Product demo → product template
   - Customer story → testimonial
   - Educational → code or text-reveal
   - Launch countdown → countdown

2. Generate video
   → node remotion-studio/scripts/scaffold.mjs --template [name] --props '{"key":"value"}' --out ./video

3. Render
   → node remotion-studio/scripts/render.mjs --input ./video/index.tsx --output ./video/render.mp4

4. Post via Postiz
   → mcporter call postiz.integrationSchedulePostTool --args '{...}'

Output: Rendered video file ready for TikTok/YouTube
```

---

## 6b. Visual Content (Diagrams & Slides)

**When:** Creating shareable graphics for social media  
**Tools:** visual-explainer, charlie

```
1. Generate a slide deck for X/Twitter threads
   → Use visual-explainer skill: "Generate a slide deck for: [topic]"
   → Aesthetic options: Midnight Editorial, Warm Signal, Terminal Mono, Swiss Clean
   → Output: ~/.agent/diagrams/[name].html

2. Generate web diagrams for educational content
   → Use visual-explainer skill: "Generate an HTML diagram for: [concept]"
   → Great for: explainers, how-it-works, architecture

3. Capture and share
   → Screenshot the HTML output
   → Post as images on X/Twitter/LinkedIn
   → Or use in blog posts

Examples:
- "Generate a slide deck for: 5 AI Agent Tutorials That Changed My Life"
- "Generate an HTML diagram for: How VibeStack OS orchestrates AI agents"
```

---

## 7. Newsletter + Audience Nurture

**When:** Building email list, content repurposing  
**Tools:** gog (Gmail), charlie, visual-studio

```
1. Research topic
   → node grok-fast/scripts/grok.mjs "Write a comprehensive guide about [topic] for [audience]"

2. Create visual assets
   → node visual-studio/scripts/visualize.mjs --type data-viz --data stats.json

3. Format for newsletter (Gmail)
   → gog compose --to subscribers --subject "[Title]" --body "[content]" --attach [visuals]

4. Schedule send
   → gog schedule --time "2026-03-05T09:00" --draft-id [id]

Output: Newsletter sent to list
```

---

## 8. Multi-Platform Repurpose

**When:** One piece of content → many platforms  
**Tools:** charlie, remotion-studio, Postiz MCP

```
1. Create master content (e.g., video from remotion-studio)

2. Platform variations:
   - TikTok: 1080x1920 slideshow, hook overlay
   - YouTube Shorts: Same content, different thumbnail text
   - X: Thread format with key screenshots
   - Reddit: Text post with embedded images

3. Schedule all via Postiz (cross-post feature)
   → Single post, multiple integrationIds

4. Track per-platform performance
   → charlie/scripts/analyze.mjs breaks down by platform

Output: 4+ posts from 1 piece of content
```

---

## 9. A/B Testing Framework

**When:** Optimizing hooks, CTAs, images  
**Tools:** charlie, Postiz MCP

```
1. Create variants:
   - Hook A vs Hook B (same content)
   - Image style A vs B
   - CTA A vs B

2. Schedule as separate posts (same time, different days)
   → Use charlie campaign.mjs to generate test slots

3. Analyze after 72 hours
   → node charlie/scripts/analyze.mjs --days 3

4. Implement winner
   → Update default hook/image/CTA in config

Output: Data-driven content decisions
```

---

## 10. Market Expansion

**When:** Launching to new niche/audience  
**Tools:** All — research, create, post, analyze

```
Week 1: Research
- playwright-pro: Reddit/X search for new niche
- grok-fast: Analyze landscape, find gaps
- visual-studio: Map competitive positioning

Week 2: Strategy
- charlie: Build new hook library for niche
- ship-it: Generate niche-specific landing page

Week 3: Content
- remotion-studio: Create niche-relevant videos
- charlie: Launch 7-day campaign

Week 4: Analyze
- charlie/scripts/analyze.mjs: Full performance report
- Decide: Scale or pivot?

Output: Validated market entry with data
```

---

## Quick Reference

| Workflow | Key Tools | Time to Run |
|---|---|---|
| Idea Validation | playwright-pro, grok-fast, web_search | 30 min |
| Competitor Intel | playwright-pro, grok-fast, visual-studio | 1 hr |
| Landing Page | ship-it, visual-studio | 15 min |
| Content Campaign | charlie → remotion-studio → Postiz | 2-3 hr |
| Daily Review | charlie/analyze.mjs | 5 min |
| Video Pipeline | remotion-studio → Postiz | 30 min |
| Newsletter | gog, visual-studio | 20 min |
| Repurpose | charlie, Postiz cross-post | 30 min |
| A/B Test | charlie campaign + analyze | 1 hr |
| Market Expansion | All tools | 4 weeks |
