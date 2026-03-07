---
name: vibestak-billing
description: "Handle payments, subscriptions, and billing for VibeStack products. Use when: (1) processing payments, (2) managing subscriptions, (3) creating checkout sessions, (4) viewing revenue data. Powered by Stripe."
---

# VibeStack Billing — Stripe Integration

Process payments and manage subscriptions for VibeStack products.

## Quick Start

```bash
# Create a checkout session
node vibestak-billing/scripts/checkout.mjs --price price_xxx --email customer@email.com

# List all payments
node vibestak-billing/scripts/payments.mjs

# Get revenue stats
node vibestak-billing/scripts/revenue.mjs
```

## Products

| Product | Price | ID |
|---|---|---|
| Details Course | $29 | vibestak_details_course |
| VibeStack Pro (monthly) | $29/mo | vibestak_pro_monthly |
| VibeStack Pro (yearly) | $290/yr | vibestak_pro_yearly |
| SkillFinder Pro | $9/mo | skillfinder_pro |

## Scripts

### checkout.mjs
Create a Stripe checkout session

### revenue.mjs
Get revenue stats and metrics

### webhooks.mjs
Handle Stripe webhooks (for subscription events)

## Integration

The billing system is integrated with:
- Supabase (customer records)
- Email ( receipts via Postiz or email)
- Dashboard (revenue tracking)

## Notes

- Keys stored in: ~/.config/vibestak/stripe.env
- Webhook endpoint: /api/webhooks/stripe
- All amounts in cents
