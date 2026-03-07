# TikTok-Style Captions

## Setup

```bash
npx remotion add @remotion/captions
```

## Create Pages from Captions

```tsx
import { createTikTokStyleCaptions } from '@remotion/captions';

const { pages } = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 1200, // words per page timing
});
```

## Render with Word Highlighting

```tsx
import { Sequence, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

// Map pages to sequences
{pages.map((page, i) => {
  const next = pages[i + 1];
  const startFrame = (page.startMs / 1000) * fps;
  const endFrame = next ? (next.startMs / 1000) * fps : startFrame + 60;
  return (
    <Sequence key={i} from={startFrame} durationInFrames={endFrame - startFrame}>
      <CaptionPage page={page} />
    </Sequence>
  );
})}

// Word highlighting component
const CaptionPage = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absoluteTimeMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: 80, fontWeight: 'bold' }}>
        {page.tokens.map(token => (
          <span key={token.fromMs} style={{
            color: token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs
              ? '#39E508' : 'white'
          }}>
            {token.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
```

## Transcription Sources

- `@remotion/install-whisper-cpp` — local, free, fast (needs server)
- `@remotion/whisper-web` — browser WASM, free, slower
- `@remotion/openai-whisper` — cloud API, fast, paid
