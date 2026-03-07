# TOOLS.md - Local Notes

## Google / gog CLI

- Account: your-email@example.com
- OAuth Client Project: YOUR_OAUTH_PROJECT_ID
- `GOG_ACCOUNT=your-email@example.com`
- Services: gmail, calendar, drive, contacts, docs, sheets

## Google APIs

- Maps/Places API Key: AIzaSyAHx1Pc0C1Ari9-KkULbiL2arjun2CFeM4

## Postiz (Social Media Management)

Connected via MCP: `mcporter call postiz.<tool>`
- **X/Twitter:** @YOUR_HANDLE (id: YOUR_POSTIZ_ID)
- **Reddit:** Rich-Field6287 (id: YOUR_POSTIZ_ID)
- **TikTok:** YOUR_HANDLE (id: YOUR_POSTIZ_ID)
- **YouTube:** CAMEO Finance (id: YOUR_POSTIZ_ID)

Key tools:
- `postiz.integrationList` — list connected accounts
- `postiz.integrationSchema --platform x --is-premium false` — get posting rules
- `postiz.integrationSchedulePostTool` — schedule/post content
- `postiz.generateImageTool --prompt "..."` — generate images for posts
- `postiz.ask_postiz --message "..."` — ask the Postiz agent

Post content format: HTML with `<p>` tags. Supported: h1,h2,h3,u,strong,li,ul,p

## Stripe (Payments)

- Public Key: YOUR_STRIPE_PK...
- Secret Key: YOUR_STRIPE_SK...
- Keys stored: ~/.config/vibestak/stripe.env (chmod 600)

## Supabase (Database)

- Host: db.YOUR_PROJECT.supabase.co
- Port: 5432
- Database: postgres
- User: postgres
- Credentials: stored in ~/.supabase.env

## Accounts

- Ghost email: your-project-email@example.com (project/agent email, OAuth issues — use other project)
- Primary: your-email@example.com
- X/Twitter: @YOUR_HANDLE
- Reddit: Rich-Field6287
- TikTok: YOUR_HANDLE
- YouTube: CAMEO Finance
