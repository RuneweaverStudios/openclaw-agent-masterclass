---
name: visual-studio
description: "Generate beautiful self-contained HTML visualizations: charts, dashboards, data tables, timelines, comparisons, kanban boards, and Mermaid diagrams. Use when: (1) presenting data as charts or dashboards, (2) creating architecture/flow diagrams, (3) building comparison views, (4) rendering complex tables that would be ugly as ASCII, (5) creating timelines or kanban boards, (6) any visual output that benefits from HTML rendering. Includes ready-to-run scripts with 5 themes and Chart.js/Mermaid support."
---

# Visual Studio

Generate self-contained HTML visualizations with ready-to-run scripts. Open in browser or render via Canvas.

## Scripts

All scripts output the file path to stdout. Use `--open` to open in browser.

### visualize.mjs — Charts, Tables, Dashboards, Timelines, Comparisons, Kanban

```bash
# Bar chart
node visualize.mjs --type chart --data '{"labels":["Jan","Feb","Mar"],"datasets":[{"label":"Revenue","data":[1000,2500,4200]}]}' --title "MRR Growth" --open

# Dashboard with KPIs
node visualize.mjs --type dashboard --data '{"kpis":[{"label":"MRR","value":"$4.2K","change":"+68%"},{"label":"Users","value":"142","change":"+23%"}],"charts":[{"title":"Growth","type":"line","labels":["Jan","Feb","Mar"],"datasets":[{"label":"Revenue","data":[1000,2500,4200]}]}]}' --open

# Sortable data table
node visualize.mjs --type table --data '[{"name":"Acme","revenue":"$10K","growth":"+15%"},{"name":"Beta","revenue":"$8K","growth":"+22%"}]' --open

# Timeline
node visualize.mjs --type timeline --data '[{"date":"2026-01","title":"Launch","desc":"MVP shipped"},{"date":"2026-03","title":"$40K MRR","desc":"Target hit"}]' --open

# Comparison
node visualize.mjs --type comparison --data '[{"name":"Plan A","pros":["Fast","Cheap"],"cons":["Limited"],"metrics":{"cost":"$10/mo"}},{"name":"Plan B","pros":["Full featured"],"cons":["Expensive"],"metrics":{"cost":"$50/mo"}}]' --open

# Kanban
node visualize.mjs --type kanban --data '{"columns":[{"title":"Todo","items":["Research","Design"]},{"title":"In Progress","items":["Build MVP"]},{"title":"Done","items":["Setup"]}]}' --open

# Pipe data in
cat data.json | node visualize.mjs --type chart --stdin --theme blueprint --open
```

Types: `chart`, `table`, `dashboard`, `timeline`, `comparison`, `kanban`
Chart types (via `--chart-type`): `bar`, `line`, `pie`, `doughnut`, `radar`, `polar`
Themes: `dark`, `light`, `blueprint`, `editorial`, `terminal`

### diagram.mjs — Mermaid Diagrams

```bash
# Flowchart
node diagram.mjs --code 'flowchart TD; A[User] --> B[API]; B --> C[Database]; B --> D[Cache]' --title "System Architecture" --open

# Sequence diagram
node diagram.mjs --code 'sequenceDiagram; Client->>API: Request; API->>DB: Query; DB-->>API: Results; API-->>Client: Response' --open

# From file
cat architecture.mmd | node diagram.mjs --stdin --theme blueprint --elk --open
```

Use `--elk` for complex graphs (10+ nodes). Themes match visualize.mjs.

## Inline Generation

For custom visualizations not covered by scripts, generate self-contained HTML. Key rules:

1. **Always self-contained** — inline CSS, load fonts/libs via CDN
2. **Always use CSS custom properties** — define `--bg`, `--surface`, `--text`, `--accent` at minimum
3. **Support dark/light** — use `@media (prefers-color-scheme: dark)`
4. **Chart.js via CDN**: `https://cdn.jsdelivr.net/npm/chart.js@4`
5. **Mermaid via CDN**: `import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'`
6. **Save to `/tmp/` and open** — `open /tmp/my-viz.html`

### Good Font Pairings

- DM Sans + Fira Code (technical)
- IBM Plex Sans + IBM Plex Mono (reliable)
- Instrument Serif + JetBrains Mono (editorial)

### Good Color Palettes

- Teal + slate: `#0891b2`, `#0369a1`
- Terracotta + sage: `#c2410c`, `#65a30d`
- Deep blue + gold: `#1e3a5f`, `#d4a73a`

## Canvas Integration

Use the canvas tool to render visualizations directly in chat:

```bash
# Generate HTML, then present via canvas
node visualize.mjs --type dashboard --data '...' --out /tmp/dash.html
# Then use canvas tool: canvas(action="present", url="file:///tmp/dash.html")
```
