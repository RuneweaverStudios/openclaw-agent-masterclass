---
name: remotion-studio
description: "Create programmatic videos with Remotion (React-based video framework). Use when: (1) creating social media videos (TikTok, Reels, YouTube), (2) generating data-driven video content, (3) building animated text/caption videos, (4) creating product demos or explainers, (5) rendering video from data/JSON, (6) building video templates for reuse. Includes project scaffolding, ready-to-use templates, and render scripts. NOT for: simple video editing (use ffmpeg), or when a static image suffices."
---

# Remotion Studio

Create programmatic videos with React. Write components, get MP4s.

## Prerequisites

```bash
npm i -g remotion @remotion/cli
```

## Quick Start

```bash
# Scaffold a new project
node scripts/scaffold.mjs --name my-video --template social

# Preview in browser
cd my-video && npm start

# Render to MP4
npx remotion render src/index.ts MainVideo out/video.mp4

# Render with custom props
npx remotion render src/index.ts MainVideo out.mp4 --props '{"title":"Hello","subtitle":"World"}'
```

## Scripts

### scaffold.mjs — Project Scaffolding

Create ready-to-render Remotion projects from templates.

```bash
# Social media post (1080x1080 or 1080x1920)
node scripts/scaffold.mjs --name promo --template social --orientation portrait

# Text animation video
node scripts/scaffold.mjs --name intro --template text-reveal

# Data visualization video
node scripts/scaffold.mjs --name stats --template data-viz

# Caption/subtitle video (TikTok style)
node scripts/scaffold.mjs --name caption --template captions
```

Templates: `social`, `text-reveal`, `data-viz`, `captions`, `minimal`
Orientations: `landscape` (1920x1080), `portrait` (1080x1920), `square` (1080x1080)

### render.mjs — Batch Render

Render videos with props from JSON.

```bash
# Single render
node scripts/render.mjs --project ./my-video --composition MainVideo --out video.mp4

# Batch render from JSON array
node scripts/render.mjs --project ./my-video --composition MainVideo \
  --batch '[{"title":"Video 1"},{"title":"Video 2"}]' --out-dir ./output

# Render as GIF
node scripts/render.mjs --project ./my-video --composition MainVideo --codec gif --out loop.gif
```

## Core Rules (Critical — Read Before Writing Remotion Code)

### 1. Frame-Driven Animation Only
ALL animation MUST use `useCurrentFrame()`. CSS transitions, CSS animations, and Tailwind animate classes are **FORBIDDEN** — they won't render correctly frame-by-frame.

```tsx
// ✅ Correct
const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

// ❌ FORBIDDEN
<div className="animate-fade-in" />
<div style={{ transition: 'opacity 0.3s' }} />
```

### 2. Interpolate + Spring
```tsx
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Linear interpolation
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

// Spring (natural motion)
const scale = spring({ frame, fps, config: { damping: 200 } }); // smooth, no bounce
const bounce = spring({ frame, fps, config: { damping: 8 } });  // bouncy
```

### 3. Sequencing
```tsx
import { Sequence, Series } from 'remotion';

// Delayed appearance
<Sequence from={30} durationInFrames={60}><Title /></Sequence>

// Back-to-back scenes
<Series>
  <Series.Sequence durationInFrames={60}><Intro /></Series.Sequence>
  <Series.Sequence durationInFrames={90}><Main /></Series.Sequence>
  <Series.Sequence durationInFrames={30}><Outro /></Series.Sequence>
</Series>
```

### 4. Transitions
```tsx
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
  <TransitionSeries.Sequence durationInFrames={60}><SceneB /></TransitionSeries.Sequence>
</TransitionSeries>
```

Available: `fade`, `slide`, `wipe`, `flip`, `clockWipe`

### 5. Composition Setup
```tsx
import { Composition } from 'remotion';

<Composition
  id="MainVideo"
  component={MyVideo}
  durationInFrames={150}  // 5 seconds at 30fps
  fps={30}
  width={1080}
  height={1920}  // Portrait for TikTok/Reels
  defaultProps={{ title: 'Hello' }}
/>
```

### 6. Render CLI
```bash
npx remotion render src/index.ts MainVideo out.mp4           # H.264 MP4
npx remotion render src/index.ts MainVideo out.mp4 --crf 15  # Higher quality
npx remotion render src/index.ts MainVideo out.gif            # GIF
npx remotion render src/index.ts MainVideo out.webm --codec vp9  # WebM
npx remotion still src/index.ts MyStill thumbnail.png         # Still image
```

## Advanced Topics

- **TikTok captions**: See `references/captions.md` — word-by-word highlighting with `@remotion/captions`
- **Data-driven videos**: Pass JSON via `--props`, use `calculateMetadata` for dynamic duration
- **Spring presets**: `{ damping: 200 }` smooth, `{ damping: 20, stiffness: 200 }` snappy, `{ damping: 8 }` bouncy
- **Fonts**: Use `@remotion/google-fonts` or `staticFile()` for local fonts
- **Batch rendering**: Use `render.mjs --batch` to render variations from JSON array
