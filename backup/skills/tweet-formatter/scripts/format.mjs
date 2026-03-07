#!/usr/bin/env node
/**
 * Tweet Formatter - Apply viral patterns to your content
 * 
 * Usage:
 *   node format.mjs "Your content" --style viral
 *   node format.mjs "Your content" --style listicle
 *   node format.mjs "Your content" --style story
 */

import { readFileSync } from 'fs';

// Viral tweet patterns
const PATTERNS = {
  viral: {
    name: 'Viral',
    apply: (content) => {
      const lines = content.split('\n').filter(l => l.trim());
      if (lines.length === 1) {
        // Single line - add punch
        return content;
      }
      return content;
    },
    hooks: [
      'Hot take:',
      'Nobody talks about',
      'So I finally',
      'The truth about',
      'Unpopular opinion:',
      'I spent months figuring out',
      'The future is'
    ]
  },
  listicle: {
    name: 'Listicle',
    apply: (content) => {
      // Add bullet points if not present
      if (!content.includes('•') && !content.includes('1.')) {
        const lines = content.split('\n').filter(l => l.trim());
        if (lines.length > 1) {
          return lines.map(l => `• ${l}`).join('\n');
        }
      }
      return content;
    },
    hooks: [
      'The ultimate guide to',
      'X things you need to know about',
      'Here are',
      'My top'
    ]
  },
  story: {
    name: 'Story Hook',
    apply: (content) => {
      // Add story structure
      if (!content.startsWith('🧵') && !content.startsWith('I ')) {
        return `🧵 ${content}`;
      }
      return content;
    },
    hooks: [
      '🧵 So I finally figured out',
      '🧵 Here\'s how',
      '🧵 The story of how'
    ]
  },
  contrarian: {
    name: 'Contrarian',
    apply: (content) => {
      if (!content.toLowerCase().includes('wrong') && !content.includes('but')) {
        return content;
      }
      return content;
    },
    hooks: [
      'Everyone thinks',
      'But here\'s what they miss:',
      'They\'re wrong because'
    ]
  },
  results: {
    name: 'Results',
    apply: (content) => {
      if (!content.includes(':') && !content.includes('results')) {
        return `Results:\n\n${content}`;
      }
      return content;
    },
    hooks: [
      'After 30 days:',
      'X months in:',
      'The results are in:'
    ]
  }
};

// Engagement elements to add
const ENGAGEMENT = {
  downArrow: '↓',
  thinking: '💭',
  fire: '🔥',
  lightbulb: '💡'
};

// Add formatting
function formatTweet(content, style = 'viral', options = {}) {
  let result = content;
  const pattern = PATTERNS[style] || PATTERNS.viral;
  
  // Apply pattern
  result = pattern.apply(result);
  
  // Add engagement bait if not present
  if (options.engagement && !result.includes('↓') && !result.includes('💭')) {
    result = result.trim() + '\n\n' + ENGAGEMENT[options.engagement] || '↓';
  }
  
  // Check length
  if (result.length > 280) {
    console.log('⚠️ Tweet exceeds 280 characters:', result.length);
  }
  
  // Add hashtags if missing
  if (options.hashtags && !result.includes('#')) {
    result = result.trim() + '\n\n' + options.hashtags.split(',').map(t => `#${t.trim()}`).join(' ');
  }
  
  return result;
}

// Parse args
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    content: '',
    style: 'viral',
    engagement: null,
    hashtags: null
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--style' && args[i + 1]) {
      options.style = args[++i];
    } else if (arg === '--engagement' && args[i + 1]) {
      options.engagement = args[++i];
    } else if (arg === '--hashtags' && args[i + 1]) {
      options.hashtags = args[++i];
    } else if (arg === '--help') {
      showHelp();
    } else if (!arg.startsWith('--')) {
      options.content += (options.content ? ' ' : '') + arg;
    }
  }
  
  return options;
}

function showHelp() {
  console.log(`
Tweet Formatter - Apply Viral Patterns

Usage: node format.mjs "Your content" [options]

Options:
  --style <name>     viral|listicle|story|contrarian|results (default: viral)
  --engagement       downArrow|thinking|fire|lightbulb
  --hashtags         tag1,tag2,tag3

Examples:
  node format.mjs "How to build AI agents" --style story
  node format.mjs "My results" --style results --engagement fire
  `);
  process.exit(1);
}

function main() {
  const options = parseArgs();
  
  if (!options.content) {
    showHelp();
  }
  
  console.log(`🎨 Formatting with: ${options.style}`);
  console.log('');
  
  const formatted = formatTweet(options.content, options.style, {
    engagement: options.engagement,
    hashtags: options.hashtags
  });
  
  console.log('=== Formatted Tweet ===');
  console.log(formatted);
  console.log('');
  console.log(`Characters: ${formatted.length}/280`);
}

main();
