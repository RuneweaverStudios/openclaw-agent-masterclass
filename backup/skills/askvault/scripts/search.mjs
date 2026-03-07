#!/usr/bin/env node
/**
 * AskVault - Keyword Question Research Tool
 * Aggregates questions from Google PAA, Reddit, and X
 * 
 * Usage:
 *   node search.mjs "keyword" [options]
 * 
 * Options:
 *   --format json|html  Output format (default: json)
 *   --sources paa,reddit,x  Sources to query (default: all)
 *   --out <path>        Save output file
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Source: Google People Also Ask
async function fetchGooglePAA(keyword) {
  try {
    const result = execSync(
      `node ~/.openclaw/workspace/skills/playwright-pro/scripts/scrape.mjs "https://www.google.com/search?q=${encodeURIComponent(keyword)}+questions" --wait-selector ".related-question-pair" --timeout 30000 2>/dev/null`,
      { encoding: 'utf-8', timeout: 35000 }
    );
    
    // Parse PAA questions from HTML
    const questionRegex = /"([^"]*\?[^"]*?)"/g;
    const questions = [];
    let match;
    while ((match = questionRegex.exec(result)) && questions.length < 20) {
      const q = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      if (q.length > 10 && q.length < 200 && q.includes('?')) {
        questions.push({ text: q, source: 'google-paa' });
      }
    }
    return questions;
  } catch (e) {
    return [];
  }
}

// Source: Google Related Searches  
async function fetchGoogleRelated(keyword) {
  try {
    const result = execSync(
      `node ~/.openclaw/workspace/skills/playwright-pro/scripts/scrape.mjs "https://www.google.com/search?q=${encodeURIComponent(keyword)}" --wait-selector ".related-question-pair" --timeout 30000 2>/dev/null`,
      { encoding: 'utf-8', timeout: 35000 }
    );
    
    // Extract related searches from the "Related searches" section
    const relatedRegex = /<div[^>]*class="[^"]*related[^"]*"[^>]*>([^<]+)/gi;
    const searches = [];
    const lines = result.split('\n');
    for (const line of lines) {
      if (line.includes('related') || line.includes('searches')) {
        const q = line.replace(/<[^>]+>/g, '').trim();
        if (q.length > 5 && q.length < 100) {
          searches.push({ text: q, source: 'google-related' });
        }
      }
    }
    return searches.slice(0, 15);
  } catch (e) {
    return [];
  }
}

// Source: Reddit
async function fetchReddit(keyword) {
  try {
    const result = execSync(
      `node ~/.openclaw/workspace/skills/playwright-pro/scripts/reddit-search.mjs "${keyword}" --limit 15 --sort new 2>&1`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    
    const data = JSON.parse(result);
    const questions = [];
    
    if (!Array.isArray(data)) return [];
    
    for (const post of data.slice(0, 10)) {
      // Extract question-like titles
      if (post.title && (post.title.startsWith('How') || post.title.startsWith('What') || 
          post.title.startsWith('Why') || post.title.startsWith('Can') || 
          post.title.startsWith('Should') || post.title.startsWith('Is') ||
          post.title.includes('?'))) {
        questions.push({ text: post.title, source: 'reddit', url: post.url, votes: post.score });
      }
      // Also capture preview text with questions
      if (post.preview && post.preview.includes('?')) {
        const qMatch = post.preview.match(/[^.]*\?[^.]*\./);
        if (qMatch) {
          questions.push({ text: qMatch[0].slice(0, 200), source: 'reddit-preview', url: post.url });
        }
      }
    }
    return questions;
  } catch (e) {
    console.error('Reddit fetch error:', e.message);
    return [];
  }
}

// Source: X/Twitter
async function fetchTwitter(keyword) {
  try {
    const result = execSync(
      `node ~/.openclaw/workspace/skills/grok-fast/scripts/grok.mjs "What questions are people asking about ${keyword} on X/Twitter? List 10 specific questions." --twitter 2>/dev/null`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    
    // Parse questions from Grok response
    const lines = result.split('\n').filter(l => l.trim());
    const questions = [];
    for (const line of lines) {
      const cleaned = line.replace(/^\d+[\.\)]\s*/, '').trim();
      if (cleaned.length > 15 && cleaned.length < 200 && cleaned.includes('?')) {
        questions.push({ text: cleaned, source: 'x' });
      }
    }
    return questions;
  } catch (e) {
    return [];
  }
}

// Categorize questions by type
function categorize(questions) {
  const categories = {
    how: [],
    what: [],
    why: [],
    when: [],
    where: [],
    who: [],
    can: [],
    should: [],
    is: [],
    other: []
  };
  
  for (const q of questions) {
    const lower = q.text.toLowerCase();
    if (lower.startsWith('how')) categories.how.push(q);
    else if (lower.startsWith('what')) categories.what.push(q);
    else if (lower.startsWith('why')) categories.why.push(q);
    else if (lower.startsWith('when')) categories.when.push(q);
    else if (lower.startsWith('where')) categories.where.push(q);
    else if (lower.startsWith('who')) categories.who.push(q);
    else if (lower.startsWith('can')) categories.can.push(q);
    else if (lower.startsWith('should')) categories.should.push(q);
    else if (lower.startsWith('is')) categories.is.push(q);
    else categories.other.push(q);
  }
  
  return categories;
}

function formatHTML(keyword, results) {
  const { questions, related } = results;
  const cats = categorize(questions);
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AskVault - ${keyword} Questions</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
           background: #0f0f0f; color: #e5e5e5; line-height: 1.6; padding: 40px 20px; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { font-size: 2.5rem; margin-bottom: 8px; color: #fff; }
    .subtitle { color: #888; margin-bottom: 40px; }
    .source-badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 4px; 
                    margin-left: 8px; text-transform: uppercase; font-weight: 600; }
    .source-google-paa { background: #4285f4; }
    .source-reddit { background: #ff4500; }
    .source-x { background: #1da1f2; }
    .source-google-related { background: #34a853; }
    .category { margin-bottom: 40px; }
    .category h2 { font-size: 1.3rem; margin-bottom: 16px; padding-bottom: 8px; 
                   border-bottom: 2px solid #333; }
    .question-list { list-style: none; }
    .question-list li { padding: 12px 0; border-bottom: 1px solid #222; 
                       display: flex; align-items: flex-start; gap: 12px; }
    .question-list li:last-child { border: none; }
    .q-mark { color: #f97316; font-size: 1.2rem; font-weight: bold; }
    .stats { display: flex; gap: 20px; margin-bottom: 40px; color: #888; font-size: 14px; }
    .stat { background: #1a1a1a; padding: 12px 20px; border-radius: 8px; }
    .stat strong { color: #fff; font-size: 1.5rem; display: block; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #222; 
              text-align: center; color: #666; }
    .footer a { color: #f97316; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 ${keyword}</h1>
    <p class="subtitle">Questions people actually ask</p>
    
    <div class="stats">
      <div class="stat"><strong>${questions.length}</strong> Questions</div>
      <div class="stat"><strong>${Object.keys(cats).length}</strong> Categories</div>
      <div class="stat"><strong>${related.length}</strong> Related</div>
    </div>`;
  
  const catLabels = { how: 'How...', what: 'What...', why: 'Why...', when: 'When...', 
                      where: 'Where...', who: 'Who...', can: 'Can...', should: 'Should...', 
                      is: 'Is...', other: 'Other Questions' };
  
  for (const [cat, items] of Object.entries(cats)) {
    if (items.length === 0) continue;
    html += `
    <div class="category">
      <h2>${catLabels[cat]} (${items.length})</h2>
      <ul class="question-list">
        ${items.map(q => `
          <li>
            <span class="q-mark">Q</span>
            <div>
              ${q.text}
              <span class="source-badge source-${q.source}">${q.source}</span>
            </div>
          </li>
        `).join('')}
      </ul>
    </div>`;
  }
  
  if (related.length > 0) {
    html += `
    <div class="category">
      <h2>Related Searches (${related.length})</h2>
      <ul class="question-list">
        ${related.slice(0, 15).map(r => `
          <li><span class="q-mark">→</span> ${r.text}</li>
        `).join('')}
      </ul>
    </div>`;
  }
  
  html += `
    <div class="footer">
      <p>Built with 🤖 by <a href="#">AskVault</a> — Free Keyword Research</p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

async function main() {
  const args = process.argv.slice(2);
  const keyword = args[0];
  
  if (!keyword) {
    console.error('Usage: node search.mjs "keyword" [--format json|html] [--sources paa,reddit,x] [--out file]');
    process.exit(1);
  }
  
  const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'json';
  const sourcesArg = args.includes('--sources') ? args[args.indexOf('--sources') + 1] : 'paa,reddit,x';
  const sources = sourcesArg.split(',');
  const outPath = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
  
  console.error(`🔍 Searching for: "${keyword}"`);
  console.error(`📡 Sources: ${sources.join(', ')}`);
  
  const results = { keyword, timestamp: new Date().toISOString(), questions: [], related: [] };
  
  if (sources.includes('paa')) {
    console.error('  ↳ Fetching Google PAA...');
    results.questions.push(...await fetchGooglePAA(keyword));
  }
  
  if (sources.includes('reddit')) {
    console.error('  ↳ Fetching Reddit...');
    results.questions.push(...await fetchReddit(keyword));
  }
  
  if (sources.includes('x')) {
    console.error('  ↳ Fetching X/Twitter...');
    results.questions.push(...await fetchTwitter(keyword));
  }
  
  if (sources.includes('related')) {
    console.error('  ↳ Fetching Related Searches...');
    results.related.push(...await fetchGoogleRelated(keyword));
  }
  
  // Deduplicate
  const seen = new Set();
  results.questions = results.questions.filter(q => {
    const key = q.text.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  console.error(`✅ Found ${results.questions.length} questions, ${results.related.length} related searches`);
  
  // Output
  if (format === 'html') {
    const html = formatHTML(keyword, results);
    if (outPath) {
      writeFileSync(outPath, html);
      console.error(`📄 Saved to: ${outPath}`);
    }
    console.log(html);
  } else {
    const json = JSON.stringify(results, null, 2);
    if (outPath) {
      writeFileSync(outPath, json);
      console.error(`📄 Saved to: ${outPath}`);
    }
    console.log(json);
  }
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
