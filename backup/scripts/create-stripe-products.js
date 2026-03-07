require('dotenv').config({ path: '~/.openclaw/workspace/.env.stripe' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function createProducts() {
  console.log('Creating Stripe products...\n');

  try {
    // 1. Guide Only - $29.99
    console.log('Creating Guide product...');
    const guideProduct = await stripe.products.create({
      name: 'Polysauce Guide',
      description: 'Complete PDF guide with copy trading strategies, risk management, and setup instructions',
      metadata: { type: 'guide' },
    });
    
    const guidePrice = await stripe.prices.create({
      product: guideProduct.id,
      unit_amount: 2999,
      currency: 'usd',
      metadata: { tier: 'guide' },
    });
    
    console.log(`✅ Guide Product: ${guideProduct.id}`);
    console.log(`   Price: ${guidePrice.id}`);
    console.log(`   Payment Link: https://buy.stripe.com/${guidePrice.id}\n`);

    // 2. Bot Only - $49.99
    console.log('Creating Bot product...');
    const botProduct = await stripe.products.create({
      name: 'Polysauce Bot',
      description: 'Desktop app (Mac/Windows) for auto-copying top traders',
      metadata: { type: 'bot' },
    });
    
    const botPrice = await stripe.prices.create({
      product: botProduct.id,
      unit_amount: 4999,
      currency: 'usd',
      metadata: { tier: 'bot' },
    });
    
    console.log(`✅ Bot Product: ${botProduct.id}`);
    console.log(`   Price: ${botPrice.id}`);
    console.log(`   Payment Link: https://buy.stripe.com/${botPrice.id}\n`);

    // 3. Winrate Leaderboard - $8.99/month
    console.log('Creating Leaderboard subscription...');
    const leaderboardProduct = await stripe.products.create({
      name: 'Winrate Leaderboard Pro',
      description: 'Monthly access to top 100 traders with one-click copy buttons',
      metadata: { type: 'subscription' },
    });
    
    const leaderboardPrice = await stripe.prices.create({
      product: leaderboardProduct.id,
      unit_amount: 899,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'leaderboard' },
    });
    
    console.log(`✅ Leaderboard Product: ${leaderboardProduct.id}`);
    console.log(`   Price: ${leaderboardPrice.id}`);
    console.log(`   Payment Link: https://buy.stripe.com/${leaderboardPrice.id}\n`);

    // Create payment links
    console.log('Creating payment links...');
    
    const guideLink = await stripe.paymentLinks.create({
      line_items: [{ price: guidePrice.id, quantity: 1 }],
      after_completion: { type: 'redirect', redirect: { url: 'https://polysauce.xyz/thanks.html' } },
    });
    
    const botLink = await stripe.paymentLinks.create({
      line_items: [{ price: botPrice.id, quantity: 1 }],
      after_completion: { type: 'redirect', redirect: { url: 'https://polysauce.xyz/thanks.html' } },
    });
    
    const leaderboardLink = await stripe.paymentLinks.create({
      line_items: [{ price: leaderboardPrice.id, quantity: 1 }],
      after_completion: { type: 'redirect', redirect: { url: 'https://polysauce.xyz/thanks.html' } },
    });
    
    console.log('✅ Payment Links:');
    console.log(`   Guide: ${guideLink.url}`);
    console.log(`   Bot: ${botLink.url}`);
    console.log(`   Leaderboard: ${leaderboardLink.url}\n`);

    // Save to file
    const fs = require('fs');
    const products = {
      guide: {
        productId: guideProduct.id,
        priceId: guidePrice.id,
        paymentLink: guideLink.url,
      },
      bot: {
        productId: botProduct.id,
        priceId: botPrice.id,
        paymentLink: botLink.url,
      },
      leaderboard: {
        productId: leaderboardProduct.id,
        priceId: leaderboardPrice.id,
        paymentLink: leaderboardLink.url,
      },
    };
    
    fs.writeFileSync(
      '~/.openclaw/workspace/polysauce-products.json',
      JSON.stringify(products, null, 2)
    );
    
    console.log('✅ Products saved to: /workspace/polysauce-products.json');
    console.log('\n📝 Next: Update website buttons with these payment links');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Make sure STRIPE_SECRET_KEY is set in .env.stripe');
    }
    process.exit(1);
  }
}

createProducts();
