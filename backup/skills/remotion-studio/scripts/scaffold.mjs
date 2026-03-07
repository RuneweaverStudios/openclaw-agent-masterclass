#!/usr/bin/env node
/**
 * scaffold.mjs — Scaffold Remotion video projects from templates
 *
 * Usage:
 *   node scaffold.mjs --name <project-name> --template <template> [options]
 *
 * Templates:
 *   social       — Social media post with animated text + background
 *   text-reveal  — Cinematic text reveal with spring animations
 *   data-viz     — Animated bar chart from JSON data
 *   captions     — TikTok-style caption video
 *   minimal      — Bare minimum Remotion project
 *
 * Options:
 *   --orientation <type>   landscape|portrait|square (default: square)
 *   --fps <n>              Frames per second (default: 30)
 *   --duration <s>         Duration in seconds (default: 5)
 *   --out <dir>            Output directory (default: ./<name>)
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

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

const ORIENTATIONS = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
};

function socialTemplate(props) {
  return `import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';

type Props = { title: string; subtitle: string; accent: string };

export const MainVideo: React.FC<Props> = ({ title, subtitle, accent = '#3b82f6' }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });
  const subtitleSpring = spring({ frame: frame - 15, fps, config: { damping: 200 } });
  const bgScale = interpolate(frame, [0, 90], [1.05, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: \`radial-gradient(circle at 30% 40%, \${accent}22, #0a0a0a 70%)\`,
      justifyContent: 'center', alignItems: 'center', transform: \`scale(\${bgScale})\`,
    }}>
      <div style={{ textAlign: 'center', padding: '0 60px' }}>
        <Sequence from={0}>
          <h1 style={{
            fontSize: ${props.width > 1200 ? 72 : 56}, fontWeight: 800, color: 'white',
            fontFamily: 'Inter, sans-serif', lineHeight: 1.1, letterSpacing: '-0.02em',
            opacity: titleSpring, transform: \`translateY(\${interpolate(titleSpring, [0, 1], [40, 0])}px)\`,
          }}>{title}</h1>
        </Sequence>
        <Sequence from={15}>
          <p style={{
            fontSize: ${props.width > 1200 ? 28 : 22}, color: '#a1a1aa', marginTop: 16,
            fontFamily: 'Inter, sans-serif', fontWeight: 400,
            opacity: subtitleSpring, transform: \`translateY(\${interpolate(subtitleSpring, [0, 1], [20, 0])}px)\`,
          }}>{subtitle}</p>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};`;
}

function textRevealTemplate(props) {
  return `import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';

type Props = { lines: string[]; accent: string };

export const MainVideo: React.FC<Props> = ({ lines = ['Build.', 'Ship.', 'Profit.'], accent = '#22d3ee' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        {lines.map((line, i) => {
          const delay = i * 25;
          const s = spring({ frame, fps, delay, config: { damping: 12 } });
          const opacity = interpolate(s, [0, 1], [0, 1]);
          const y = interpolate(s, [0, 1], [60, 0]);
          const scale = interpolate(s, [0, 1], [0.8, 1]);
          return (
            <Sequence key={i} from={delay}>
              <div style={{
                fontSize: ${props.width > 1200 ? 96 : 72}, fontWeight: 900, color: i === lines.length - 1 ? accent : 'white',
                fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em',
                opacity, transform: \`translateY(\${y}px) scale(\${scale})\`,
              }}>{line}</div>
            </Sequence>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};`;
}

function dataVizTemplate(props) {
  return `import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';

type DataItem = { label: string; value: number; color?: string };
type Props = { title: string; data: DataItem[] };

const COLORS = ['#3b82f6', '#22d3ee', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

export const MainVideo: React.FC<Props> = ({
  title = 'Monthly Revenue',
  data = [
    { label: 'Jan', value: 1000 },
    { label: 'Feb', value: 2500 },
    { label: 'Mar', value: 4200 },
    { label: 'Apr', value: 3800 },
    { label: 'May', value: 6100 },
  ],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxVal = Math.max(...data.map(d => d.value));

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ background: '#0a0a0a', padding: 60, justifyContent: 'center' }}>
      <Sequence from={0}>
        <h1 style={{
          fontSize: 48, fontWeight: 700, color: 'white', fontFamily: 'Inter, sans-serif',
          marginBottom: 40, opacity: titleSpring,
          transform: \`translateY(\${interpolate(titleSpring, [0,1], [20,0])}px)\`,
        }}>{title}</h1>
      </Sequence>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: ${props.height > 1200 ? 600 : 400} }}>
        {data.map((item, i) => {
          const barSpring = spring({ frame, fps, delay: 15 + i * 8, config: { damping: 200 } });
          const barHeight = interpolate(barSpring, [0, 1], [0, (item.value / maxVal) * ${props.height > 1200 ? 500 : 300}]);
          const color = item.color || COLORS[i % COLORS.length];
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 8,
                opacity: barSpring, fontFamily: 'Inter, sans-serif',
              }}>${'$'}{item.value.toLocaleString()}</span>
              <div style={{
                width: '100%', height: barHeight, background: color,
                borderRadius: '8px 8px 0 0',
              }} />
              <span style={{ color: '#a1a1aa', fontSize: 14, marginTop: 8,
                fontFamily: 'Inter, sans-serif',
              }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};`;
}

function audiogramTemplate(props) {
  return `import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Audio, Sequence } from 'remotion';

type Props = { title: string; waveformColor: string; bgColor: string; audioSrc?: string };

export const MainVideo: React.FC<Props> = ({ title, waveformColor = '#3b82f6', bgColor = '#0a0a0a', audioSrc }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Simulated waveform bars
  const bars = Array.from({ length: 40 }, (_, i) => {
    const phase = (frame + i * 3) / 10;
    const height = 20 + Math.abs(Math.sin(phase) * 80) + Math.abs(Math.cos(phase * 1.3) * 40);
    return height;
  });

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: bgColor, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      {audioSrc && <Audio src={audioSrc} />}
      <h1 style={{ color: 'white', fontSize: 36, fontWeight: 700, fontFamily: 'Inter, sans-serif',
        marginBottom: 40, opacity: titleOpacity, textAlign: 'center' }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 120 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ width: ${props.width > 1200 ? 12 : 8}, height: h, background: waveformColor,
            borderRadius: 4, transition: 'height 0.1s' }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};`;
}

function productTemplate(props) {
  return `import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';

type Props = { name: string; tagline: string; price: string; features: string[]; accent: string };

export const MainVideo: React.FC<Props> = ({ name, tagline, price, features = [], accent = '#3b82f6' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const taglineSpring = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  const priceSpring = spring({ frame: frame - 40, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ background: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
      <Sequence from={0}>
        <h1 style={{ fontSize: ${props.width > 1200 ? 72 : 56}, fontWeight: 900, color: 'white',
          fontFamily: 'Inter, sans-serif', transform: \`scale(\${logoScale})\`, textAlign: 'center' }}>{name}</h1>
      </Sequence>
      <Sequence from={20}>
        <p style={{ fontSize: 24, color: '#a1a1aa', fontFamily: 'Inter, sans-serif', marginTop: 12,
          opacity: taglineSpring, textAlign: 'center' }}>{tagline}</p>
      </Sequence>
      <Sequence from={40}>
        <div style={{ marginTop: 32, opacity: priceSpring }}>
          <span style={{ fontSize: 48, fontWeight: 800, color: accent, fontFamily: 'Inter, sans-serif' }}>{price}</span>
        </div>
      </Sequence>
      <Sequence from={60}>
        <div style={{ marginTop: 32 }}>
          {features.map((f, i) => {
            const s = spring({ frame: frame - 60 - i * 10, fps, config: { damping: 200 } });
            return <div key={i} style={{ color: '#d4d4d8', fontSize: 20, padding: '8px 0',
              fontFamily: 'Inter, sans-serif', opacity: s,
              transform: \`translateX(\${interpolate(s, [0,1], [-20,0])}px)\` }}>✓ {f}</div>;
          })}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};`;
}

function countdownTemplate(props) {
  return `import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

type Props = { title: string; days: number; accent: string };

export const MainVideo: React.FC<Props> = ({ title, days = 7, accent = '#f87171' }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [days, 0], { extrapolateRight: 'clamp' });
  const displayDays = Math.ceil(progress);
  const pulseScale = 1 + Math.sin(frame / 5) * 0.03;

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ background: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      <h2 style={{ color: '#a1a1aa', fontSize: 28, fontWeight: 500, fontFamily: 'Inter, sans-serif',
        marginBottom: 20, opacity: titleSpring }}>{title}</h2>
      <div style={{ fontSize: ${props.width > 1200 ? 160 : 120}, fontWeight: 900, color: accent,
        fontFamily: 'Inter, sans-serif', transform: \`scale(\${pulseScale})\` }}>{displayDays}</div>
      <p style={{ color: '#71717a', fontSize: 24, fontFamily: 'Inter, sans-serif', marginTop: 8 }}>
        {displayDays === 1 ? 'day left' : 'days left'}
      </p>
    </AbsoluteFill>
  );
};`;
}

function testimonialTemplate(props) {
  return `import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';

type Props = { quote: string; author: string; role: string; accent: string };

export const MainVideo: React.FC<Props> = ({ quote, author, role, accent = '#22d3ee' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const quoteSpring = spring({ frame, fps, config: { damping: 200 } });
  const authorSpring = spring({ frame: frame - 30, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ background: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
      <div style={{ fontSize: 120, color: accent, fontFamily: 'Georgia, serif', opacity: 0.3, marginBottom: -40 }}>"</div>
      <Sequence from={0}>
        <p style={{ fontSize: ${props.width > 1200 ? 36 : 28}, color: 'white', fontFamily: 'Georgia, serif',
          fontStyle: 'italic', lineHeight: 1.5, textAlign: 'center', maxWidth: 800,
          opacity: quoteSpring, transform: \`translateY(\${interpolate(quoteSpring, [0,1], [20,0])}px)\` }}>{quote}</p>
      </Sequence>
      <Sequence from={30}>
        <div style={{ marginTop: 32, textAlign: 'center', opacity: authorSpring }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'Inter, sans-serif' }}>{author}</p>
          <p style={{ fontSize: 16, color: accent, fontFamily: 'Inter, sans-serif' }}>{role}</p>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};`;
}

function codeTemplate(props) {
  return `import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';

type Props = { code: string; language: string; theme: string };

export const MainVideo: React.FC<Props> = ({ code, language = 'typescript', theme = 'dark' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = code.split('\\n');
  const charsPerFrame = 2;
  const totalChars = frame * charsPerFrame;

  let remaining = totalChars;
  const visibleLines = lines.map(line => {
    if (remaining <= 0) return '';
    const visible = line.slice(0, remaining);
    remaining -= line.length;
    return visible;
  });

  return (
    <AbsoluteFill style={{ background: '#1e1e2e', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
      <div style={{ background: '#11111b', borderRadius: 16, padding: 32, width: '90%', maxWidth: 900,
        border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f38ba8' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#a6e3a1' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f9e2af' }} />
        </div>
        <pre style={{ fontFamily: "'Fira Code', monospace", fontSize: ${props.width > 1200 ? 22 : 18}, color: '#cdd6f4',
          lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {visibleLines.map((line, i) => (
            <div key={i}>{line}<span style={{ opacity: i === visibleLines.findIndex(l => l.length < lines[visibleLines.indexOf(l)]?.length) ? 1 : 0 }}>▊</span></div>
          ))}
        </pre>
      </div>
    </AbsoluteFill>
  );
};`;
}

function minimalTemplate() {
  return `import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

type Props = { text: string };

export const MainVideo: React.FC<Props> = ({ text = 'Hello World' }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ color: 'white', fontSize: 72, fontWeight: 700, opacity }}>{text}</h1>
    </AbsoluteFill>
  );
};`;
}

function rootTemplate(compId, width, height, fps, duration, defaultProps) {
  return `import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';

export const RemotionRoot = () => {
  return (
    <Composition
      id="${compId}"
      component={MainVideo}
      durationInFrames={${fps * duration}}
      fps={${fps}}
      width={${width}}
      height={${height}}
      defaultProps={${JSON.stringify(defaultProps, null, 6)}}
    />
  );
};`;
}

function indexTemplate() {
  return `import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);`;
}

function packageJson(name) {
  return JSON.stringify({
    name,
    version: '1.0.0',
    private: true,
    scripts: {
      start: 'remotion studio',
      build: 'remotion render src/index.ts MainVideo out/video.mp4',
      preview: 'remotion preview src/index.ts',
    },
    dependencies: {
      remotion: '^4.0.0',
      '@remotion/cli': '^4.0.0',
      '@remotion/transitions': '^4.0.0',
      react: '^18.0.0',
      'react-dom': '^18.0.0',
    },
    devDependencies: {
      '@types/react': '^18.0.0',
      typescript: '^5.0.0',
    },
  }, null, 2);
}

function tsconfig() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2022', module: 'ES2022', moduleResolution: 'bundler',
      jsx: 'react-jsx', strict: true, esModuleInterop: true,
      skipLibCheck: true, forceConsistentCasingInFileNames: true,
    },
    include: ['src'],
  }, null, 2);
}

async function main() {
  const args = parseArgs(process.argv);
  const name = args.name || 'my-remotion-video';
  const template = args.template || 'minimal';
  const orientation = args.orientation || 'square';
  const fps = parseInt(args.fps || '30', 10);
  const duration = parseInt(args.duration || '5', 10);
  const outDir = args.out || `./${name}`;

  const { width, height } = ORIENTATIONS[orientation] || ORIENTATIONS.square;

  if (existsSync(outDir)) {
    console.error(`Directory ${outDir} already exists`);
    process.exit(1);
  }

  mkdirSync(join(outDir, 'src'), { recursive: true });
  mkdirSync(join(outDir, 'public'), { recursive: true });
  mkdirSync(join(outDir, 'out'), { recursive: true });

  // Generate component based on template
  let component, defaultProps;
  const props = { width, height };
  switch (template) {
    case 'social':
      component = socialTemplate(props);
      defaultProps = { title: 'Your Title Here', subtitle: 'Your subtitle goes here', accent: '#3b82f6' };
      break;
    case 'text-reveal':
      component = textRevealTemplate(props);
      defaultProps = { lines: ['Build.', 'Ship.', 'Profit.'], accent: '#22d3ee' };
      break;
    case 'data-viz':
      component = dataVizTemplate(props);
      defaultProps = { title: 'Monthly Revenue', data: [
        { label: 'Jan', value: 1000 }, { label: 'Feb', value: 2500 },
        { label: 'Mar', value: 4200 }, { label: 'Apr', value: 3800 },
        { label: 'May', value: 6100 },
      ]};
      break;
    case 'captions':
      component = minimalTemplate(); // captions need audio + @remotion/captions setup
      defaultProps = { text: 'Add captions — see references/captions.md' };
      break;
    case 'audiogram':
      component = audiogramTemplate(props);
      defaultProps = { title: 'Podcast Name', waveformColor: '#3b82f6', bgColor: '#0a0a0a' };
      break;
    case 'product':
      component = productTemplate(props);
      defaultProps = { name: 'Product Name', tagline: 'Your tagline here', price: '$29', features: ['Feature 1', 'Feature 2', 'Feature 3'], accent: '#3b82f6' };
      break;
    case 'countdown':
      component = countdownTemplate(props);
      defaultProps = { title: 'Launching Soon', days: 7, accent: '#f87171' };
      break;
    case 'testimonial':
      component = testimonialTemplate(props);
      defaultProps = { quote: 'This changed everything for my business.', author: 'Jane Smith', role: 'CEO, Startup', accent: '#22d3ee' };
      break;
    case 'code':
      component = codeTemplate(props);
      defaultProps = { code: 'const ghost = new Agent();\nghost.build();\nghost.ship();\nghost.profit();', language: 'typescript', theme: 'dark' };
      break;
    default:
      component = minimalTemplate();
      defaultProps = { text: 'Hello World' };
  }

  writeFileSync(join(outDir, 'src/MainVideo.tsx'), component);
  writeFileSync(join(outDir, 'src/Root.tsx'), rootTemplate('MainVideo', width, height, fps, duration, defaultProps));
  writeFileSync(join(outDir, 'src/index.ts'), indexTemplate());
  writeFileSync(join(outDir, 'package.json'), packageJson(name));
  writeFileSync(join(outDir, 'tsconfig.json'), tsconfig());

  console.log(`✅ Scaffolded Remotion project: ${outDir}`);
  console.log(`   Template: ${template} | ${width}x${height} @ ${fps}fps | ${duration}s`);
  console.log(`\nNext steps:`);
  console.log(`   cd ${name} && npm install && npm start`);
  console.log(`   npx remotion render src/index.ts MainVideo out/video.mp4`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
