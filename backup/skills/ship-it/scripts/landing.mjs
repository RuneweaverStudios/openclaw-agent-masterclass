#!/usr/bin/env node
/**
 * landing.mjs — Generate high-converting landing pages
 *
 * Usage: node landing.mjs --type <type> --headline "..." [options]
 */

import { writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

function parseArgs(argv) {
  const args = {};
  let i = 2;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { i++; continue; }
    const key = arg.slice(2);
    if (['open', 'stdin'].includes(key)) { args[key] = true; i++; continue; }
    args[key] = argv[++i]; i++;
  }
  return args;
}

const THEMES = {
  startup: {
    bg: '#0f0f0f', surface: '#1a1a1a', hero: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)',
    text: '#ffffff', textDim: '#a1a1aa', accent: '#3b82f6', accentHover: '#2563eb',
    font: "'Inter', system-ui, sans-serif",
  },
  light: {
    bg: '#ffffff', surface: '#f9fafb', hero: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    text: '#111827', textDim: '#6b7280', accent: '#2563eb', accentHover: '#1d4ed8',
    font: "'Inter', system-ui, sans-serif",
  },
  dark: {
    bg: '#09090b', surface: '#18181b', hero: 'linear-gradient(135deg, #09090b 0%, #1e1b4b 50%, #09090b 100%)',
    text: '#fafafa', textDim: '#a1a1aa', accent: '#8b5cf6', accentHover: '#7c3aed',
    font: "'Inter', system-ui, sans-serif",
  },
  minimal: {
    bg: '#fafaf9', surface: '#ffffff', hero: '#fafaf9',
    text: '#1c1917', textDim: '#78716c', accent: '#0f766e', accentHover: '#0d9488',
    font: "'DM Sans', system-ui, sans-serif",
  },
};

function generatePage(config) {
  const t = THEMES[config.theme || 'startup'];
  const accent = config.accent || t.accent;

  const benefits = Array.isArray(config.benefits) ? config.benefits :
    (config.benefits ? config.benefits.split(',').map(b => b.trim()) : []);
  const features = Array.isArray(config.features) ? config.features :
    (config.features ? config.features.split(',').map(f => f.trim()) : []);
  const tiers = typeof config.tiers === 'string' ? JSON.parse(config.tiers) : (config.tiers || []);
  const testimonials = config.testimonials || [];
  const faq = config.faq || [];

  let sections = '';

  // Hero
  sections += `<section class="hero">
    <div class="container">
      <div class="badge">${config.name || 'New'}</div>
      <h1>${config.headline || 'Build Something Amazing'}</h1>
      ${config.subtitle ? `<p class="hero-sub">${config.subtitle}</p>` : ''}
      <div class="hero-cta">
        <a href="#pricing" class="btn btn-primary">${config.cta || 'Get Started'}</a>
        ${config.price ? `<span class="price-tag">${config.price}</span>` : ''}
      </div>
    </div>
  </section>`;

  // Benefits
  if (benefits.length) {
    sections += `<section class="section"><div class="container">
      <h2>Why ${config.name || 'This'}?</h2>
      <div class="benefit-grid">${benefits.map((b, i) =>
        `<div class="benefit-card" style="animation-delay:${i * 0.1}s">
          <div class="benefit-icon">${['🚀', '⚡', '🎯', '🔒', '💡', '🏆'][i % 6]}</div>
          <p>${b}</p>
        </div>`
      ).join('')}</div>
    </div></section>`;
  }

  // Features
  if (features.length) {
    sections += `<section class="section section-alt"><div class="container">
      <h2>What You Get</h2>
      <div class="feature-list">${features.map(f =>
        `<div class="feature-item"><span class="check">✓</span> ${f}</div>`
      ).join('')}</div>
    </div></section>`;
  }

  // Pricing tiers
  if (tiers.length) {
    sections += `<section class="section" id="pricing"><div class="container">
      <h2>Pricing</h2>
      <div class="tier-grid">${tiers.map(tier =>
        `<div class="tier-card ${tier.featured ? 'tier-featured' : ''}">
          ${tier.featured ? '<div class="tier-badge">Most Popular</div>' : ''}
          <h3>${tier.name}</h3>
          <div class="tier-price">${tier.price}</div>
          <ul>${(tier.features || []).map(f => `<li>${f}</li>`).join('')}</ul>
          <a href="#" class="btn ${tier.featured ? 'btn-primary' : 'btn-outline'}">${config.cta || 'Get Started'}</a>
        </div>`
      ).join('')}</div>
    </div></section>`;
  }

  // Testimonials
  if (testimonials.length) {
    sections += `<section class="section section-alt"><div class="container">
      <h2>What People Say</h2>
      <div class="testimonial-grid">${testimonials.map(t =>
        `<div class="testimonial-card">
          <p>"${t.quote}"</p>
          <cite>— ${t.author}${t.role ? `, ${t.role}` : ''}</cite>
        </div>`
      ).join('')}</div>
    </div></section>`;
  }

  // FAQ
  if (faq.length) {
    sections += `<section class="section"><div class="container">
      <h2>FAQ</h2>
      <div class="faq-list">${faq.map(f =>
        `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`
      ).join('')}</div>
    </div></section>`;
  }

  // Final CTA
  sections += `<section class="section cta-section"><div class="container">
    <h2>${config.headline || 'Ready to Get Started?'}</h2>
    <a href="#" class="btn btn-primary btn-lg">${config.cta || 'Get Started'}</a>
    ${config.price ? `<p class="cta-price">${config.price}</p>` : ''}
  </div></section>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${config.name ? `${config.name} — ` : ''}${config.headline || 'Landing Page'}</title>
<meta name="description" content="${config.subtitle || config.headline || ''}">
<meta property="og:title" content="${config.headline || ''}">
<meta property="og:description" content="${config.subtitle || ''}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:${t.bg};--surface:${t.surface};--text:${t.text};--text-dim:${t.textDim};--accent:${accent};--accent-hover:${t.accentHover};--font:${t.font}}
body{background:var(--bg);color:var(--text);font-family:var(--font);line-height:1.6}
.container{max-width:1100px;margin:0 auto;padding:0 24px}
.hero{padding:100px 0 80px;background:${t.hero};text-align:center}
.badge{display:inline-block;padding:6px 16px;border-radius:100px;font-size:0.8rem;font-weight:600;border:1px solid var(--accent);color:var(--accent);margin-bottom:24px;letter-spacing:0.5px}
h1{font-size:clamp(2.2rem,5vw,3.8rem);font-weight:800;line-height:1.1;margin-bottom:20px;letter-spacing:-0.02em}
h2{font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;text-align:center;margin-bottom:48px;letter-spacing:-0.01em}
.hero-sub{font-size:clamp(1rem,2vw,1.25rem);color:var(--text-dim);max-width:600px;margin:0 auto 32px}
.hero-cta{display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap}
.price-tag{font-size:1.1rem;color:var(--text-dim);font-weight:500}
.btn{display:inline-block;padding:14px 32px;border-radius:8px;font-weight:600;font-size:1rem;text-decoration:none;transition:all 0.2s;cursor:pointer;border:none}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:var(--accent-hover);transform:translateY(-1px)}
.btn-outline{background:transparent;color:var(--text);border:1px solid var(--text-dim)}
.btn-outline:hover{border-color:var(--accent);color:var(--accent)}
.btn-lg{padding:18px 48px;font-size:1.15rem}
.section{padding:80px 0}
.section-alt{background:var(--surface)}
.benefit-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px}
.benefit-card{padding:28px;border-radius:12px;border:1px solid color-mix(in srgb,var(--text) 8%,transparent);animation:fadeUp 0.5s ease both}
.benefit-icon{font-size:2rem;margin-bottom:12px}
.benefit-card p{color:var(--text-dim);font-size:0.95rem}
.feature-list{max-width:600px;margin:0 auto}
.feature-item{padding:14px 0;border-bottom:1px solid color-mix(in srgb,var(--text) 6%,transparent);font-size:1.05rem;display:flex;align-items:center;gap:12px}
.check{color:var(--accent);font-weight:700;font-size:1.2rem}
.tier-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;align-items:start}
.tier-card{padding:32px;border-radius:16px;border:1px solid color-mix(in srgb,var(--text) 8%,transparent);position:relative;text-align:center}
.tier-featured{border-color:var(--accent);box-shadow:0 0 40px color-mix(in srgb,var(--accent) 15%,transparent)}
.tier-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:4px 16px;border-radius:100px;font-size:0.75rem;font-weight:600}
.tier-card h3{font-size:1.3rem;margin-bottom:8px}
.tier-price{font-size:2.5rem;font-weight:800;margin-bottom:24px;color:var(--accent)}
.tier-card ul{list-style:none;margin-bottom:24px;text-align:left}
.tier-card li{padding:8px 0;color:var(--text-dim);font-size:0.95rem}
.tier-card li::before{content:'✓ ';color:var(--accent);font-weight:700}
.testimonial-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
.testimonial-card{padding:28px;border-radius:12px;border:1px solid color-mix(in srgb,var(--text) 8%,transparent)}
.testimonial-card p{font-size:1.05rem;font-style:italic;margin-bottom:12px}
.testimonial-card cite{color:var(--text-dim);font-size:0.9rem;font-style:normal}
.faq-list{max-width:700px;margin:0 auto}
.faq-item{border-bottom:1px solid color-mix(in srgb,var(--text) 8%,transparent);padding:16px 0}
.faq-item summary{font-weight:600;cursor:pointer;font-size:1.05rem;list-style:none;display:flex;justify-content:space-between;align-items:center}
.faq-item summary::after{content:'+';font-size:1.5rem;color:var(--text-dim)}
.faq-item[open] summary::after{content:'−'}
.faq-item p{color:var(--text-dim);margin-top:12px;font-size:0.95rem}
.cta-section{text-align:center;padding:100px 0}
.cta-price{color:var(--text-dim);margin-top:16px;font-size:1.1rem}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:768px){.hero{padding:60px 0 50px}.section{padding:50px 0}.tier-grid{grid-template-columns:1fr}}
</style>
</head>
<body>${sections}
<footer style="text-align:center;padding:40px 0;color:var(--text-dim);font-size:0.85rem">
  <p>&copy; ${new Date().getFullYear()} ${config.name || 'Ghost Malone'} 👻</p>
</footer>
</body>
</html>`;
}

async function main() {
  const args = parseArgs(process.argv);
  let config;
  if (args.stdin) {
    config = JSON.parse(readFileSync('/dev/stdin', 'utf-8'));
  } else {
    config = { ...args };
  }
  const html = generatePage(config);
  const outPath = config.out || `/tmp/landing-${Date.now()}.html`;
  writeFileSync(outPath, html);
  console.log(outPath);
  if (config.open) { try { execSync(`open "${outPath}"`); } catch {} }
}

main().catch(e => { console.error(e.message); process.exit(1); });
