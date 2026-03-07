# TOOLS.md - Tool Configuration

Store tool configuration and credential locations here.
**Never commit actual secrets — only reference where they're stored.**

## Google / gog CLI

- Account: _(your email)_
- Services: gmail, calendar, drive, contacts
- Auth: OAuth — run `gog auth` to set up

## Social Media (Postiz MCP)

- X/Twitter: _(your handle)_
- Reddit: _(your username)_
- TikTok: _(your handle)_

## Database (Supabase)

- Host: _(your supabase host)_
- Credentials: stored in `~/.supabase.env`

## Payments (Stripe)

- Keys stored: _(path to stripe env file)_

## AI (OpenAI)

- Key: `OPENAI_API_KEY` in environment
- Model: text-embedding-ada-002 (for brain embeddings)
- Optional: Brain works without it (text search only)

## Browser Automation (Playwright)

- Installed via: `clawhub install playwright-pro`
- Browsers: Chromium, Firefox, WebKit
