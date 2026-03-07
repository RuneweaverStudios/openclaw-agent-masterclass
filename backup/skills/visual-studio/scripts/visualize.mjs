#!/usr/bin/env node
/**
 * visualize.mjs — Generate self-contained HTML visualizations
 *
 * Takes data (JSON, CSV, or text) and generates beautiful HTML pages
 * with charts, diagrams, tables, and dashboards.
 *
 * Usage:
 *   node visualize.mjs --type <type> --data '<json>' [options]
 *   cat data.json | node visualize.mjs --type chart --stdin [options]
 *
 * Types:
 *   chart        — Bar/line/pie/doughnut chart (Chart.js)
 *   table        — Styled, sortable data table
 *   dashboard    — Multi-metric dashboard with KPIs
 *   timeline     — Chronological timeline
 *   comparison   — Side-by-side comparison cards
 *   kanban       — Kanban board layout
 *
 * Options:
 *   --title <text>         Page title
 *   --subtitle <text>      Subtitle
 *   --theme <name>         Theme: dark|light|blueprint|editorial|terminal (default: dark)
 *   --chart-type <type>    For chart: bar|line|pie|doughnut|radar|polar (default: bar)
 *   --out <path>           Output file (default: /tmp/visual-<timestamp>.html)
 *   --open                 Open in browser after generating
 *   --stdin                Read data from stdin
 *   --accent <hex>         Primary accent color (default: theme-dependent)
 *
 * Data formats:
 *   chart:       { "labels": ["A","B"], "datasets": [{"label":"X","data":[1,2]}] }
 *   table:       [{"col1":"val","col2":"val"}, ...]
 *   dashboard:   { "kpis": [{"label":"Revenue","value":"$40K","change":"+12%"}], "charts": [...] }
 *   timeline:    [{"date":"2026-03","title":"Launch","desc":"..."}]
 *   comparison:  [{"name":"Plan A","pros":["x"],"cons":["y"],"metrics":{"price":"$10"}}]
 *   kanban:      { "columns": [{"title":"Todo","items":["Task 1"]}, ...] }
 *
 * Examples:
 *   node visualize.mjs --type chart --data '{"labels":["Jan","Feb","Mar"],"datasets":[{"label":"Revenue","data":[1000,2500,4200]}]}' --title "MRR Growth" --open
 *   cat metrics.json | node visualize.mjs --type dashboard --stdin --theme blueprint --open
 */

import { writeFileSync } from 'fs';
import { readFileSync } from 'fs';
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
  dark: {
    bg: '#0d1117', surface: '#161b22', surfaceEl: '#1c2333',
    border: 'rgba(255,255,255,0.06)', text: '#e6edf3', textDim: '#8b949e',
    accent: '#22d3ee', accentDim: 'rgba(34,211,238,0.12)',
    accent2: '#34d399', accent3: '#fbbf24',
    fontBody: "'DM Sans', system-ui, sans-serif", fontMono: "'Fira Code', monospace",
  },
  light: {
    bg: '#f8f9fa', surface: '#ffffff', surfaceEl: '#ffffff',
    border: 'rgba(0,0,0,0.08)', text: '#1a1a2e', textDim: '#6b7280',
    accent: '#0891b2', accentDim: 'rgba(8,145,178,0.1)',
    accent2: '#059669', accent3: '#d97706',
    fontBody: "'DM Sans', system-ui, sans-serif", fontMono: "'Fira Code', monospace",
  },
  blueprint: {
    bg: '#0a1628', surface: '#0f1d32', surfaceEl: '#142440',
    border: 'rgba(100,180,255,0.12)', text: '#c8ddf0', textDim: '#6b8db5',
    accent: '#4da6ff', accentDim: 'rgba(77,166,255,0.12)',
    accent2: '#34d399', accent3: '#fbbf24',
    fontBody: "'IBM Plex Sans', system-ui, sans-serif", fontMono: "'IBM Plex Mono', monospace",
  },
  editorial: {
    bg: '#faf7f5', surface: '#ffffff', surfaceEl: '#ffffff',
    border: 'rgba(0,0,0,0.06)', text: '#2c2a25', textDim: '#8a8578',
    accent: '#be123c', accentDim: 'rgba(190,18,60,0.08)',
    accent2: '#1e3a5f', accent3: '#d4a73a',
    fontBody: "'Instrument Serif', Georgia, serif", fontMono: "'JetBrains Mono', monospace",
  },
  terminal: {
    bg: '#0a0a0a', surface: '#111111', surfaceEl: '#1a1a1a',
    border: 'rgba(0,255,65,0.15)', text: '#00ff41', textDim: '#00aa2b',
    accent: '#00ff41', accentDim: 'rgba(0,255,65,0.1)',
    accent2: '#ffff00', accent3: '#ff6600',
    fontBody: "'Fira Code', monospace", fontMono: "'Fira Code', monospace",
  },
};

function baseHTML(title, subtitle, theme, bodyContent) {
  const t = THEMES[theme] || THEMES.dark;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title || 'Visualization'}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400;500&family=IBM+Plex+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
  :root {
    --bg: ${t.bg}; --surface: ${t.surface}; --surface-el: ${t.surfaceEl};
    --border: ${t.border}; --text: ${t.text}; --text-dim: ${t.textDim};
    --accent: ${t.accent}; --accent-dim: ${t.accentDim};
    --accent2: ${t.accent2}; --accent3: ${t.accent3};
    --font-body: ${t.fontBody}; --font-mono: ${t.fontMono};
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg);
    background-image: radial-gradient(ellipse at 50% 0%, var(--accent-dim) 0%, transparent 60%);
    color: var(--text); font-family: var(--font-body);
    min-height: 100vh; padding: 40px 24px;
  }
  .container { max-width: 1200px; margin: 0 auto; }
  h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 700; margin-bottom: 8px; }
  .subtitle { color: var(--text-dim); font-size: 1.1rem; margin-bottom: 32px; }
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 24px; margin-bottom: 20px;
    animation: fadeUp 0.5s ease both;
  }
  .card-elevated {
    background: var(--surface-el);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  }
  .label {
    font-family: var(--font-mono); font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 1.5px; color: var(--accent);
    margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
  }
  .label::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .kpi { text-align: center; padding: 20px; }
  .kpi-value { font-size: 2.2rem; font-weight: 700; color: var(--accent); }
  .kpi-label { color: var(--text-dim); font-size: 0.85rem; margin-top: 4px; }
  .kpi-change { font-size: 0.8rem; margin-top: 4px; }
  .kpi-change.positive { color: #34d399; }
  .kpi-change.negative { color: #f87171; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th { text-align: left; padding: 12px 16px; border-bottom: 2px solid var(--border); color: var(--text-dim); font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; }
  td { padding: 12px 16px; border-bottom: 1px solid var(--border); }
  tr:hover td { background: var(--accent-dim); }
  .timeline { position: relative; padding-left: 40px; }
  .timeline::before { content: ''; position: absolute; left: 15px; top: 0; bottom: 0; width: 2px; background: var(--border); }
  .timeline-item { position: relative; margin-bottom: 32px; }
  .timeline-dot { position: absolute; left: -33px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); border: 2px solid var(--bg); }
  .timeline-date { font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent); margin-bottom: 4px; }
  .timeline-title { font-weight: 700; font-size: 1.1rem; margin-bottom: 4px; }
  .timeline-desc { color: var(--text-dim); font-size: 0.9rem; }
  .kanban { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; }
  .kanban-col { min-width: 260px; flex: 1; }
  .kanban-col-title { font-family: var(--font-mono); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--border); }
  .kanban-item { background: var(--surface-el); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 0.9rem; }
  .comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
  .comp-card { border-top: 3px solid var(--accent); }
  .comp-name { font-size: 1.3rem; font-weight: 700; margin-bottom: 12px; }
  .comp-section { margin-bottom: 12px; }
  .comp-section-title { font-family: var(--font-mono); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); margin-bottom: 6px; }
  .comp-list { list-style: none; }
  .comp-list li { padding: 4px 0; font-size: 0.9rem; }
  .comp-list li::before { content: '→ '; color: var(--accent); }
  .pro::before { content: '✓ ' !important; color: #34d399 !important; }
  .con::before { content: '✗ ' !important; color: #f87171 !important; }
  .chart-container { position: relative; height: 400px; }
  .footer { text-align: center; color: var(--text-dim); font-size: 0.75rem; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border); }
</style>
</head>
<body>
<div class="container">
  ${title ? `<h1>${title}</h1>` : ''}
  ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
  ${bodyContent}
  <div class="footer">Generated by ghost malone 👻 · ${new Date().toLocaleDateString()}</div>
</div>
<script>
document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const table = th.closest('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const idx = Array.from(th.parentNode.children).indexOf(th);
    const asc = th.dataset.dir !== 'asc';
    th.dataset.dir = asc ? 'asc' : 'desc';
    rows.sort((a, b) => {
      const av = a.children[idx]?.textContent.trim() || '';
      const bv = b.children[idx]?.textContent.trim() || '';
      const an = parseFloat(av.replace(/[^\\d.-]/g, ''));
      const bn = parseFloat(bv.replace(/[^\\d.-]/g, ''));
      if (!isNaN(an) && !isNaN(bn)) return asc ? an - bn : bn - an;
      return asc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    rows.forEach(r => tbody.appendChild(r));
  });
});
</script>
</body>
</html>`;
}

function renderChart(data, args) {
  const chartType = args['chart-type'] || 'bar';
  const colors = ['#22d3ee', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb923c', '#38bdf8', '#4ade80'];
  const datasets = (data.datasets || []).map((ds, i) => ({
    ...ds,
    backgroundColor: ds.backgroundColor || (chartType === 'pie' || chartType === 'doughnut' ? colors : colors[i % colors.length]),
    borderColor: ds.borderColor || (chartType === 'line' ? colors[i % colors.length] : 'transparent'),
    borderWidth: chartType === 'line' ? 2 : 0,
    tension: 0.3,
  }));
  const config = JSON.stringify({
    type: chartType,
    data: { labels: data.labels || [], datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: 'var(--text)', font: { family: 'var(--font-body)' } } } },
      scales: ['bar', 'line'].includes(chartType) ? {
        x: { ticks: { color: '#8b949e' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#8b949e' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      } : undefined,
    },
  });
  return `<div class="card"><div class="chart-container"><canvas id="mainChart"></canvas></div></div>
<script>new Chart(document.getElementById('mainChart'), ${config});</script>`;
}

function renderTable(data) {
  if (!data.length) return '<p>No data</p>';
  const keys = Object.keys(data[0]);
  const ths = keys.map(k => `<th data-sort>${k}</th>`).join('');
  const rows = data.map(row => '<tr>' + keys.map(k => `<td>${row[k] ?? ''}</td>`).join('') + '</tr>').join('\n');
  return `<div class="card"><table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderDashboard(data) {
  let html = '';
  if (data.kpis?.length) {
    html += `<div class="grid-${Math.min(data.kpis.length, 4)}" style="margin-bottom:24px">`;
    data.kpis.forEach(kpi => {
      const changeClass = kpi.change?.startsWith('+') ? 'positive' : kpi.change?.startsWith('-') ? 'negative' : '';
      html += `<div class="card card-elevated kpi">
        <div class="kpi-value">${kpi.value}</div>
        <div class="kpi-label">${kpi.label}</div>
        ${kpi.change ? `<div class="kpi-change ${changeClass}">${kpi.change}</div>` : ''}
      </div>`;
    });
    html += '</div>';
  }
  if (data.charts?.length) {
    data.charts.forEach((chart, i) => {
      html += `<div class="card" style="animation-delay:${i * 0.1}s"><div class="label">${chart.title || 'Chart'}</div><div class="chart-container"><canvas id="chart${i}"></canvas></div></div>`;
    });
    html += '<script>';
    data.charts.forEach((chart, i) => {
      const colors = ['#22d3ee', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb923c'];
      const config = {
        type: chart.type || 'bar',
        data: { labels: chart.labels, datasets: (chart.datasets || []).map((ds, j) => ({ ...ds, backgroundColor: colors[j % colors.length], borderColor: colors[j % colors.length], tension: 0.3 })) },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8b949e' } } }, scales: { x: { ticks: { color: '#8b949e' }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#8b949e' }, grid: { color: 'rgba(255,255,255,0.04)' } } } },
      };
      html += `new Chart(document.getElementById('chart${i}'), ${JSON.stringify(config)});`;
    });
    html += '</script>';
  }
  if (data.table?.length) html += renderTable(data.table);
  return html;
}

function renderTimeline(data) {
  let html = '<div class="timeline">';
  data.forEach(item => {
    html += `<div class="timeline-item"><div class="timeline-dot"></div>
      <div class="timeline-date">${item.date || ''}</div>
      <div class="timeline-title">${item.title || ''}</div>
      <div class="timeline-desc">${item.desc || item.description || ''}</div>
    </div>`;
  });
  html += '</div>';
  return `<div class="card">${html}</div>`;
}

function renderComparison(data) {
  const accents = ['var(--accent)', 'var(--accent2)', 'var(--accent3)', '#a78bfa', '#fb923c'];
  let html = '<div class="comparison-grid">';
  data.forEach((item, i) => {
    html += `<div class="card comp-card" style="border-top-color:${accents[i % accents.length]}">
      <div class="comp-name">${item.name || ''}</div>`;
    if (item.pros?.length) {
      html += `<div class="comp-section"><div class="comp-section-title">Pros</div><ul class="comp-list">${item.pros.map(p => `<li class="pro">${p}</li>`).join('')}</ul></div>`;
    }
    if (item.cons?.length) {
      html += `<div class="comp-section"><div class="comp-section-title">Cons</div><ul class="comp-list">${item.cons.map(c => `<li class="con">${c}</li>`).join('')}</ul></div>`;
    }
    if (item.metrics) {
      html += '<div class="comp-section"><div class="comp-section-title">Metrics</div>';
      Object.entries(item.metrics).forEach(([k, v]) => {
        html += `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:0.9rem"><span style="color:var(--text-dim)">${k}</span><span style="font-weight:700">${v}</span></div>`;
      });
      html += '</div>';
    }
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function renderKanban(data) {
  let html = '<div class="kanban">';
  (data.columns || []).forEach(col => {
    html += `<div class="kanban-col"><div class="kanban-col-title">${col.title} <span style="opacity:0.5">(${col.items?.length || 0})</span></div>`;
    (col.items || []).forEach(item => {
      html += `<div class="kanban-item">${typeof item === 'string' ? item : item.title || ''}</div>`;
    });
    html += '</div>';
  });
  html += '</div>';
  return `<div class="card" style="overflow-x:auto">${html}</div>`;
}

async function main() {
  const args = parseArgs(process.argv);
  const type = args.type || 'chart';

  let rawData = args.data || '';
  if (args.stdin) rawData = readFileSync('/dev/stdin', 'utf-8').trim();
  if (!rawData) { console.error('Provide --data or --stdin'); process.exit(1); }

  const data = JSON.parse(rawData);
  const theme = args.theme || 'dark';
  const title = args.title || '';
  const subtitle = args.subtitle || '';

  let body = '';
  switch (type) {
    case 'chart': body = renderChart(data, args); break;
    case 'table': body = renderTable(data); break;
    case 'dashboard': body = renderDashboard(data); break;
    case 'timeline': body = renderTimeline(data); break;
    case 'comparison': body = renderComparison(data); break;
    case 'kanban': body = renderKanban(data); break;
    default: console.error(`Unknown type: ${type}`); process.exit(1);
  }

  const html = baseHTML(title, subtitle, theme, body);
  const outPath = args.out || `/tmp/visual-${Date.now()}.html`;
  writeFileSync(outPath, html);
  console.log(outPath);

  if (args.open) {
    try { execSync(`open "${outPath}"`); } catch { /* ignore */ }
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
