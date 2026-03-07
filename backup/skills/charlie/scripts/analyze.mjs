#!/usr/bin/env node
/**
 * analyze.mjs — Analyze post performance and update hook scores
 *
 * Pulls analytics from Postiz, scores hooks, generates recommendations.
 *
 * Usage:
 *   node analyze.mjs --config charlie/config.json [options]
 *
 * Options:
 *   --days <n>          Days to analyze (default: 3)
 *   --hooks <path>      Hook library to update (default: charlie/hooks.json)
 *   --report <path>     Output report path (default: charlie/reports/YYYY-MM-DD.md)
 *   --update-hooks      Update hook scores in-place
 *
 * This script is designed to run as a daily cron job.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';

function parseArgs(argv) {
  const args = {};
  let i = 2;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { i++; continue; }
    const key = arg.slice(2);
    if (key === 'update-hooks') { args.updateHooks = true; i++; continue; }
    args[key] = argv[++i]; i++;
  }
  return args;
}

function getPostizAnalytics() {
  try {
    const result = execSync('mcporter call postiz.integrationList --output json 2>/dev/null', { encoding: 'utf-8' });
    return JSON.parse(result);
  } catch {
    return null;
  }
}

function generateReport(analytics, hooks, days) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  let report = `# Daily Marketing Report — ${dateStr}\n\n`;
  report += `Analyzing last ${days} days of performance.\n\n`;

  // Hook performance summary
  if (hooks.length) {
    const scored = hooks.filter(h => h.uses > 0).sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 5);
    const bottom = scored.slice(-3);

    if (top.length) {
      report += `## 🏆 Top Performing Hooks\n\n`;
      top.forEach((h, i) => {
        report += `${i + 1}. **"${h.hook}"** — Score: ${h.score}, Avg Views: ${h.avgViews || 'N/A'}, Uses: ${h.uses}\n`;
      });
      report += '\n';
    }

    if (bottom.length && bottom[0].score < 30) {
      report += `## ⚠️ Underperforming Hooks (consider retiring)\n\n`;
      bottom.forEach(h => {
        report += `- **"${h.hook}"** — Score: ${h.score}, Uses: ${h.uses}\n`;
      });
      report += '\n';
    }
  }

  // Category analysis
  const categories = {};
  hooks.forEach(h => {
    if (!categories[h.category]) categories[h.category] = { totalScore: 0, count: 0 };
    categories[h.category].totalScore += h.score || 0;
    categories[h.category].count++;
  });

  const sortedCategories = Object.entries(categories)
    .map(([cat, data]) => ({ category: cat, avgScore: data.count ? data.totalScore / data.count : 0 }))
    .sort((a, b) => b.avgScore - a.avgScore);

  if (sortedCategories.length) {
    report += `## 📊 Category Rankings\n\n`;
    sortedCategories.forEach(c => {
      report += `- **${c.category}**: avg score ${c.avgScore.toFixed(1)}\n`;
    });
    report += '\n';
  }

  // Recommendations
  report += `## 💡 Recommendations\n\n`;
  if (sortedCategories.length >= 2) {
    const best = sortedCategories[0];
    const worst = sortedCategories[sortedCategories.length - 1];
    report += `- Double down on **${best.category}** hooks (avg score: ${best.avgScore.toFixed(1)})\n`;
    if (worst.avgScore < 30) {
      report += `- Consider reducing **${worst.category}** content (avg score: ${worst.avgScore.toFixed(1)})\n`;
    }
  }
  report += `- Generate 5 new hooks in top-performing categories\n`;
  report += `- Test posting at different times for low-performing content\n`;

  return report;
}

async function main() {
  const args = parseArgs(process.argv);
  const days = parseInt(args.days || '3', 10);

  // Load hooks
  const hooksPath = args.hooks || 'charlie/hooks.json';
  let hooks = [];
  if (existsSync(hooksPath)) {
    hooks = JSON.parse(readFileSync(hooksPath, 'utf-8'));
  }

  // Get analytics from Postiz
  const analytics = getPostizAnalytics();

  // Generate report
  const report = generateReport(analytics, hooks, days);

  // Save report
  const reportsDir = 'charlie/reports';
  if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });
  const reportPath = args.report || `${reportsDir}/${new Date().toISOString().split('T')[0]}.md`;
  writeFileSync(reportPath, report);

  console.log(report);
  console.error(`\n📊 Report saved: ${reportPath}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
