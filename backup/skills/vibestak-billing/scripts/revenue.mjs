#!/usr/bin/env node
/**
 * Revenue Tracker - Get billing stats
 * Usage: node revenue.mjs
 */

import Stripe from 'stripe';
import { readFileSync } from 'fs';

// Load Stripe key
const envContent = readFileSync(process.env.HOME + '/.config/vibestak/stripe.env', 'utf-8');
const secretKey = envContent.match(/STRIPE_SECRET_KEY=(.*)/)?.[1];

if (!secretKey) {
  console.log('Stripe not configured. Run: source ~/.config/vibestak/stripe.env');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

async function getRevenue() {
  console.log('💰 Fetching revenue data...\n');
  
  try {
    // Get all successful charges
    const charges = await stripe.charges.list({
      limit: 100,
      expand: ['data.payment_intent']
    });
    
    let totalRevenue = 0;
    let thisMonth = 0;
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    for (const charge of charges.data) {
      if (charge.paid && !charge.refunded) {
        totalRevenue += charge.amount;
        
        const created = new Date(charge.created * 1000);
        if (created >= thisMonthStart) {
          thisMonth += charge.amount;
        }
      }
    }
    
    // Get subscriptions
    const subs = await stripe.subscriptions.list({ limit: 100 });
    const mrr = subs.data.reduce((acc, sub) => {
      if (sub.status === 'active') {
        return acc + (sub.items.data[0]?.price?.unit_amount || 0);
      }
      return acc;
    }, 0);
    
    console.log('=== 💰 VibeStack Revenue ===\n');
    console.log(`Total Revenue:   $${(totalRevenue / 100).toFixed(2)}`);
    console.log(`This Month:      $${(thisMonth / 100).toFixed(2)}`);
    console.log(`MRR:             $${(mrr / 100).toFixed(2)}/mo`);
    console.log(`Active Subs:     ${subs.data.filter(s => s.status === 'active').length}`);
    console.log('');
    
    // Recent charges
    console.log('=== Recent Charges ===\n');
    charges.data.slice(0, 5).forEach(c => {
      const date = new Date(c.created * 1000).toLocaleDateString();
      console.log(`$${(c.amount / 100).toFixed(2)} - ${c.description || 'Payment'} - ${date}`);
    });
    
  } catch (e) {
    console.log('Error:', e.message);
  }
}

getRevenue();
