#!/usr/bin/env node
/**
 * grok.mjs — Route prompts through Grok via OpenRouter
 *
 * Uses OPENROUTER_API_KEY env var. Never hardcode keys.
 *
 * Usage:
 *   node grok.mjs "your prompt" [options]
 *   echo "your prompt" | node grok.mjs --stdin [options]
 *
 * Options:
 *   --model <id>           Grok model (default: x-ai/grok-4.1-fast)
 *   --system <text>        System prompt
 *   --max-tokens <n>       Max output tokens (default: 4096)
 *   --temperature <n>      Temperature 0-2 (default: 0.7)
 *   --json                 Request JSON output
 *   --stdin                Read prompt from stdin
 *   --stream               Stream output
 *   --context <file>       Load context from file and prepend to prompt
 *   --twitter              System prompt optimized for X/Twitter analysis
 *   --raw                  Output only the response text, no metadata
 *
 * Environment:
 *   OPENROUTER_API_KEY     Required. Your OpenRouter API key.
 *   GROK_MODEL             Override default model (optional).
 *
 * Examples:
 *   node grok.mjs "What's trending on X right now?"
 *   node grok.mjs "Analyze this tweet thread" --context thread.txt --twitter
 *   node grok.mjs "Summarize this" --stdin < article.txt
 *   GROK_MODEL=x-ai/grok-4 node grok.mjs "Complex analysis" --max-tokens 8192
 */

import { readFileSync } from 'fs';

function parseArgs(argv) {
  const args = {};
  let i = 2;
  while (i < argv.length) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      if (!args.prompt) args.prompt = arg;
      i++; continue;
    }
    const key = arg.slice(2);
    if (['stdin', 'json', 'stream', 'twitter', 'raw'].includes(key)) {
      args[key] = true; i++; continue;
    }
    args[key] = argv[++i]; i++;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('Error: OPENROUTER_API_KEY environment variable is required.');
    console.error('Set it: export OPENROUTER_API_KEY="sk-or-..."');
    process.exit(1);
  }

  let prompt = args.prompt || '';
  if (args.stdin) {
    prompt = readFileSync('/dev/stdin', 'utf-8').trim();
  }
  if (!prompt) {
    console.error('Usage: node grok.mjs "your prompt" [options]');
    process.exit(1);
  }

  // Prepend context file if provided
  if (args.context) {
    const ctx = readFileSync(args.context, 'utf-8');
    prompt = `Context:\n${ctx}\n\n${prompt}`;
  }

  const model = args.model || process.env.GROK_MODEL || 'x-ai/grok-4.1-fast';
  const maxTokens = parseInt(args['max-tokens'] || '4096', 10);
  const temperature = parseFloat(args.temperature || '0.7');

  let systemPrompt = args.system || '';
  if (args.twitter) {
    systemPrompt = 'You are an expert X/Twitter analyst with deep knowledge of social media trends, engagement patterns, and viral content. You have real-time awareness of what is happening on X. Provide sharp, actionable insights. Be concise and direct.';
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const body = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    ...(args.json ? { response_format: { type: 'json_object' } } : {}),
  };

  if (args.stream) {
    body.stream = true;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://openclaw.ai',
        'X-Title': 'OpenClaw Grok Skill',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`API error (${response.status}): ${err}`);
      process.exit(1);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const chunk = JSON.parse(data);
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) process.stdout.write(content);
        } catch { /* skip */ }
      }
    }
    console.log(''); // trailing newline
  } else {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://openclaw.ai',
        'X-Title': 'OpenClaw Grok Skill',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`API error (${response.status}): ${err}`);
      process.exit(1);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';

    if (args.raw) {
      console.log(content);
    } else {
      console.log(JSON.stringify({
        model: result.model || model,
        content,
        usage: result.usage || {},
        finishReason: result.choices?.[0]?.finish_reason || '',
      }, null, 2));
    }
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
