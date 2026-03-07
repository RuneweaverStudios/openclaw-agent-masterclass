#!/usr/bin/env node
/**
 * render.mjs — Render Remotion videos (single or batch)
 *
 * Usage:
 *   node render.mjs --project <dir> --composition <id> --out <path> [options]
 *   node render.mjs --project <dir> --composition <id> --batch '<json>' --out-dir <dir>
 *
 * Options:
 *   --project <dir>        Remotion project directory
 *   --composition <id>     Composition ID to render
 *   --out <path>           Output file path
 *   --props <json>         JSON props to pass
 *   --codec <codec>        h264|h265|vp8|vp9|gif|prores (default: h264)
 *   --crf <n>              Quality (lower = better, default: 18)
 *   --concurrency <n>      Parallel frame count
 *   --batch <json>         JSON array of props for batch rendering
 *   --out-dir <dir>        Output directory for batch renders
 *   --width <n>            Override width
 *   --height <n>           Override height
 *
 * Examples:
 *   node render.mjs --project ./my-video --composition MainVideo --out video.mp4
 *   node render.mjs --project ./my-video --composition MainVideo \
 *     --batch '[{"title":"V1"},{"title":"V2"}]' --out-dir ./output
 */

import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

function parseArgs(argv) {
  const args = {};
  let i = 2;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { i++; continue; }
    args[arg.slice(2)] = argv[++i]; i++;
  }
  return args;
}

function renderOne(project, composition, outputPath, props, options = {}) {
  const entryPoint = join(resolve(project), 'src/index.ts');
  let cmd = `npx remotion render "${entryPoint}" ${composition} "${outputPath}"`;

  if (props) cmd += ` --props '${JSON.stringify(props)}'`;
  if (options.codec) cmd += ` --codec ${options.codec}`;
  if (options.crf) cmd += ` --crf ${options.crf}`;
  if (options.concurrency) cmd += ` --concurrency ${options.concurrency}`;
  if (options.width) cmd += ` --width ${options.width}`;
  if (options.height) cmd += ` --height ${options.height}`;

  console.error(`Rendering: ${outputPath}`);
  execSync(cmd, { stdio: 'inherit', cwd: resolve(project) });
  console.error(`✅ Done: ${outputPath}`);
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.project) {
    console.error('Usage: node render.mjs --project <dir> --composition <id> --out <path>');
    process.exit(1);
  }

  const composition = args.composition || 'MainVideo';
  const options = {
    codec: args.codec,
    crf: args.crf,
    concurrency: args.concurrency,
    width: args.width,
    height: args.height,
  };

  if (args.batch) {
    // Batch render
    const items = JSON.parse(args.batch);
    const outDir = args['out-dir'] || './output';
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    const ext = args.codec === 'gif' ? 'gif' : args.codec === 'vp8' || args.codec === 'vp9' ? 'webm' : 'mp4';

    for (let i = 0; i < items.length; i++) {
      const outputPath = join(outDir, `video-${String(i + 1).padStart(3, '0')}.${ext}`);
      renderOne(args.project, composition, outputPath, items[i], options);
    }

    console.log(JSON.stringify({
      rendered: items.length,
      outputDir: resolve(outDir),
    }));
  } else {
    // Single render
    const outputPath = args.out || 'out/video.mp4';
    const props = args.props ? JSON.parse(args.props) : undefined;
    renderOne(args.project, composition, outputPath, props, options);
    console.log(resolve(outputPath));
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
