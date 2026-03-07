---
name: youtube-analyzer
description: "Analyze and transcribe YouTube videos using Gemini. Extracts transcripts, generates summaries, key insights, timestamps, and actionable takeaways. Use when a user shares a YouTube link or asks to analyze/transcribe/summarize a video."
---

# YouTube Analyzer

Transcribe and deeply analyze YouTube videos using `summarize` CLI + Gemini.

## When to Use

Trigger on any of:
- User shares a YouTube URL (youtube.com, youtu.be)
- "analyze this video"
- "transcribe this"
- "what's this video about?"
- "summarize this video"
- "break down this video"

## Quick Usage

### 1. Get Transcript
```bash
summarize "YOUTUBE_URL" --youtube auto --extract-only > /tmp/yt_transcript.txt
```

### 2. Analyze with Gemini
```bash
gemini --model gemini-2.5-flash "Analyze this YouTube video transcript. Provide:
1. **TL;DR** (2-3 sentences)
2. **Key Insights** (bullet points with timestamps if available)
3. **Actionable Takeaways** (what the viewer should DO)
4. **Notable Quotes** (exact quotes with approximate timestamps)
5. **Business/Revenue Details** (if discussed: numbers, strategies, tools)

Transcript:
$(cat /tmp/yt_transcript.txt)"
```

### 3. Full Summary (alternative — lets summarize handle the AI call)
```bash
summarize "YOUTUBE_URL" --youtube auto --length xl --model google/gemini-3-flash-preview
```

## Analysis Modes

### Quick Summary
```bash
summarize "URL" --youtube auto --length medium
```

### Deep Analysis (recommended for business/tutorial videos)
Extract transcript first, then send to Gemini with a detailed analysis prompt.

### Transcript Only
```bash
summarize "URL" --youtube auto --extract-only
```

### Specific Question About Video
Extract transcript, then ask Gemini a targeted question about it.

## Tips

- For long videos (>1hr), extract transcript and chunk it before sending to Gemini
- Use `--length xl` or `--length xxl` for detailed summaries
- Transcripts include approximate timestamps — reference them in analysis
- If `summarize` fails on a video, try with `APIFY_API_TOKEN` set for fallback
- Save transcripts to `memory/` if the content is worth referencing later

## Output Format

Always structure analysis as:
1. **Video Info**: Title, channel, duration (if available)
2. **TL;DR**: 2-3 sentence summary
3. **Key Points**: Numbered list with timestamps
4. **Actionable Insights**: What to do with this information
5. **Relevant to Us**: How it applies to our goals/projects (if applicable)
