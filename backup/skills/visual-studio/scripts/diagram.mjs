#!/usr/bin/env node
/**
 * diagram.mjs — Generate Mermaid diagram HTML pages
 *
 * Usage:
 *   node diagram.mjs --code '<mermaid code>' [options]
 *   cat diagram.mmd | node diagram.mjs --stdin [options]
 *
 * Options:
 *   --title <text>       Page title
 *   --theme <name>       dark|light|blueprint|editorial|terminal (default: dark)
 *   --out <path>         Output file
 *   --open               Open in browser
 *   --stdin              Read Mermaid code from stdin
 *   --elk                Use ELK layout engine (better for complex graphs)
 *   --zoom               Enable zoom controls (default: true)
 *
 * Examples:
 *   node diagram.mjs --code 'flowchart TD; A-->B; B-->C' --open
 *   echo 'sequenceDiagram; Alice->>Bob: Hello' | node diagram.mjs --stdin --theme blueprint --open
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
    if (['open', 'stdin', 'elk', 'zoom'].includes(key)) { args[key] = true; i++; continue; }
    args[key] = argv[++i]; i++;
  }
  return args;
}

const THEMES = {
  dark: {
    bg: '#0d1117', surface: '#161b22', border: 'rgba(255,255,255,0.06)',
    text: '#e6edf3', textDim: '#8b949e', accent: '#22d3ee',
    mermaid: { primaryColor: '#134e4a', primaryBorderColor: '#14b8a6', primaryTextColor: '#f0fdfa',
      secondaryColor: '#1e293b', secondaryBorderColor: '#059669', lineColor: '#64748b' }
  },
  light: {
    bg: '#f8f9fa', surface: '#ffffff', border: 'rgba(0,0,0,0.08)',
    text: '#1a1a2e', textDim: '#6b7280', accent: '#0891b2',
    mermaid: { primaryColor: '#ccfbf1', primaryBorderColor: '#0d9488', primaryTextColor: '#134e4a',
      secondaryColor: '#f0fdf4', secondaryBorderColor: '#16a34a', lineColor: '#94a3b8' }
  },
  blueprint: {
    bg: '#0a1628', surface: '#0f1d32', border: 'rgba(100,180,255,0.12)',
    text: '#c8ddf0', textDim: '#6b8db5', accent: '#4da6ff',
    mermaid: { primaryColor: '#0f1d32', primaryBorderColor: '#4da6ff', primaryTextColor: '#c8ddf0',
      secondaryColor: '#142440', secondaryBorderColor: '#34d399', lineColor: '#3d6694' }
  },
  editorial: {
    bg: '#faf7f5', surface: '#ffffff', border: 'rgba(0,0,0,0.06)',
    text: '#2c2a25', textDim: '#8a8578', accent: '#be123c',
    mermaid: { primaryColor: '#fff5f7', primaryBorderColor: '#be123c', primaryTextColor: '#2c2a25',
      secondaryColor: '#f0f9ff', secondaryBorderColor: '#1e3a5f', lineColor: '#c4bfb6' }
  },
  terminal: {
    bg: '#0a0a0a', surface: '#111111', border: 'rgba(0,255,65,0.15)',
    text: '#00ff41', textDim: '#00aa2b', accent: '#00ff41',
    mermaid: { primaryColor: '#0a1a0a', primaryBorderColor: '#00ff41', primaryTextColor: '#00ff41',
      secondaryColor: '#1a1a00', secondaryBorderColor: '#ffff00', lineColor: '#00aa2b' }
  },
};

function main() {
  const args = parseArgs(process.argv);
  let code = args.code || '';
  if (args.stdin) code = readFileSync('/dev/stdin', 'utf-8').trim();
  if (!code) { console.error('Provide --code or --stdin'); process.exit(1); }

  const theme = args.theme || 'dark';
  const t = THEMES[theme] || THEMES.dark;
  const useElk = args.elk;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${args.title || 'Diagram'}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root { --bg:${t.bg}; --surface:${t.surface}; --border:${t.border}; --text:${t.text}; --text-dim:${t.textDim}; --accent:${t.accent}; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:'DM Sans',system-ui,sans-serif; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 24px; }
  h1 { font-size:1.8rem; margin-bottom:24px; text-align:center; }
  .diagram-wrap { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:32px; position:relative; overflow:auto; max-width:95vw; }
  .controls { position:absolute; top:12px; right:12px; display:flex; gap:4px; z-index:10; }
  .controls button { background:var(--surface); border:1px solid var(--border); border-radius:6px; color:var(--text-dim); width:28px; height:28px; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; }
  .controls button:hover { color:var(--accent); border-color:var(--accent); }
  .mermaid { display:flex; justify-content:center; transform-origin:center center; transition:transform 0.2s; }
  .mermaid .nodeLabel { color:var(--text) !important; }
  .mermaid .edgeLabel { color:var(--text-dim) !important; }
  .footer { text-align:center; color:var(--text-dim); font-size:0.75rem; margin-top:24px; }
</style>
</head>
<body>
${args.title ? `<h1>${args.title}</h1>` : ''}
<div class="diagram-wrap">
  <div class="controls">
    <button onclick="zoom(1.2)" title="Zoom in">+</button>
    <button onclick="zoom(0.8)" title="Zoom out">−</button>
    <button onclick="resetZoom()" title="Reset">⟲</button>
  </div>
  <pre class="mermaid">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</div>
<div class="footer">Generated by ghost malone 👻</div>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  ${useElk ? `import elkLayouts from 'https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk/dist/mermaid-layout-elk.esm.min.mjs';
  mermaid.registerLayoutLoaders(elkLayouts);` : ''}
  mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    ${useElk ? "layout: 'elk'," : ''}
    themeVariables: ${JSON.stringify({ ...t.mermaid, fontSize: '16px' })},
  });
</script>
<script>
  let scale = 1;
  function zoom(factor) { scale *= factor; document.querySelector('.mermaid').style.transform = 'scale('+scale+')'; }
  function resetZoom() { scale = 1; document.querySelector('.mermaid').style.transform = 'scale(1)'; }
</script>
</body>
</html>`;

  const outPath = args.out || `/tmp/diagram-${Date.now()}.html`;
  writeFileSync(outPath, html);
  console.log(outPath);
  if (args.open) { try { execSync(`open "${outPath}"`); } catch {} }
}

main();
