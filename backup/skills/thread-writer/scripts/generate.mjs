#!/usr/bin/env node
/**
 * Thread Writer - Generate X/Twitter Threads
 * 
 * Usage:
 *   node generate.mjs "Your topic"
 *   node generate.mjs --topic file.txt
 *   node generate.mjs "topic" --tweets 10 --tone casual
 *   node generate.mjs "topic" --humanize --output ./threads/
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Generate hook options
function generateHook(topic, tone = 'casual') {
  const hooks = {
    casual: [
      `So I finally figured out how to ${topic.toLowerCase()}...`,
      `Here's the truth about ${topic}:`,
      `Nobody talks about ${topic} like this.`,
      `I spent months figuring out ${topic}. Here's what I learned.`,
      `${topic} changed everything for me.`
    ],
    professional: [
      `A breakdown of ${topic}:`,
      `Everything you need to know about ${topic}:`,
      `The complete guide to ${topic}:`,
      `How to approach ${topic}:`,
      `Let's discuss ${topic}.`
    ],
    edgy: [
      `${topic} is overrated. Here's why.`,
      `Hot take: ${topic} isn't what you think.`,
      `Everyone gets ${topic} wrong.`,
      `The uncomfortable truth about ${topic}:`,
      `I'm going to say what everyone thinks about ${topic}:`
    ]
  };
  
  const toneHooks = hooks[tone] || hooks.casual;
  return toneHooks[Math.floor(Math.random() * toneHooks.length)];
}

// Generate a tweet based on position
function generateTweet(topic, position, total, type, tone) {
  const templates = {
    0: { // Hook
      content: `🧵 ${generateHook(topic, tone)}\n\nHere's the full breakdown ↓`,
      format: 'thread'
    },
    1: { // Context/Step 1
      content: `THE OLD WAY:\n• Hire employees\n• Pay salaries\n• Manage humans\n• Hope they don't quit\n\nSound familiar?`,
      format: 'list'
    },
    2: { // Challenge/Step 2  
      content: `THE NEW WAY:\n• Configure AI agents\n• Set goals\n• Watch them work\n• Scale infinitely\n\nThis changes everything.`,
      format: 'list'
    },
    3: { // Solution/Step 3
      content: `What I've learned:\n\n1. AI as a tool = limited\n2. AI as an employee = unlimited\n3. The switch is everything\n\n`,
      format: 'numbered'
    },
    4: { // Results/Insight
      content: `Results after 30 days:\n• 0 human employees\n• Content: publishing daily\n• Analytics: tracking\n• Growth: ongoing\n\nThe future belongs to builders.`,
      format: 'list'
    },
    5: { // CTA
      content: `This is just the beginning.\n\nWe're building @VibeStack to make this accessible to everyone.\n\nAre you ready?\n\n↓\n\n#AIAgents #Startup #FutureOfWork`,
      format: 'cta'
    }
  };
  
  // Fallback for more tweets
  if (!templates[position]) {
    return {
      content: `Here's what else you need to know about ${topic}...`,
      format: 'body'
    };
  }
  
  return templates[position];
}

// Humanize text
function humanize(text) {
  try {
    const result = execSync(
      `node ~/.openclaw/workspace/skills/humanizer-pro/scripts/humanize.mjs "${text.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" 2>/dev/null`,
      { encoding: 'utf-8', timeout: 5000 }
    );
    return result.trim();
  } catch (e) {
    return text;
  }
}

// Parse arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    topic: '',
    tweets: 6,
    tone: 'casual',
    type: 'story',
    humanize: false,
    output: null,
    visual: null
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--topic' && args[i + 1]) {
      options.topic = readFileSync(args[++i], 'utf-8').trim();
    } else if (arg === '--tweets' && args[i + 1]) {
      options.tweets = parseInt(args[++i], 10);
    } else if (arg === '--tone' && args[i + 1]) {
      options.tone = args[++i];
    } else if (arg === '--type' && args[i + 1]) {
      options.type = args[++i];
    } else if (arg === '--humanize') {
      options.humanize = true;
    } else if (arg === '--output' && args[i + 1]) {
      options.output = args[++i];
    } else if (arg === '--visual' && args[i + 1]) {
      options.visual = args[++i];
    } else if (!arg.startsWith('--')) {
      options.topic = arg;
    }
  }
  
  return options;
}

// Main
function main() {
  const options = parseArgs();
  
  if (!options.topic) {
    console.log('Usage: node generate.mjs "Your topic" [options]');
    console.log('');
    console.log('Options:');
    console.log('  --topic <file>    Read topic from file');
    console.log('  --tweets <n>      Number of tweets (default: 6)');
    console.log('  --tone <tone>     casual|professional|edgy');
    console.log('  --type <type>     story|howto|listicle|announcement');
    console.log('  --humanize         Run each tweet through humanizer-pro');
    console.log('  --output <dir>     Save threads to directory');
    console.log('  --visual <n>       Generate image for tweet n');
    console.log('');
    console.log('Example:');
    console.log('  node generate.mjs "How to build AI agents" --tweets 10 --tone casual');
    process.exit(1);
  }
  
  console.log(`🧵 Generating thread: "${options.topic}"`);
  console.log(`   Type: ${options.type}, Tweets: ${options.tweets}, Tone: ${options.tone}`);
  console.log('');
  
  const thread = [];
  
  for (let i = 0; i < options.tweets; i++) {
    let tweet = generateTweet(options.topic, i, options.tweets, options.type, options.tone);
    let content = tweet.content;
    
    // Humanize if requested
    if (options.humanize) {
      content = humanize(content);
    }
    
    thread.push({
      number: i + 1,
      content,
      format: tweet.format
    });
    
    console.log(`Tweet ${i + 1}:`);
    console.log(content);
    console.log('');
  }
  
  // Save if output specified
  if (options.output) {
    if (!existsSync(options.output)) {
      mkdirSync(options.output, { recursive: true });
    }
    
    const filename = join(options.output, `thread-${Date.now()}.json`);
    writeFileSync(filename, JSON.stringify({ topic: options.topic, tweets: thread }, null, 2));
    console.log(`💾 Saved to: ${filename}`);
  }
  
  console.log(`✅ Thread generated: ${options.tweets} tweets`);
  
  if (options.visual) {
    console.log(`🎨 To add visual to tweet ${options.visual}, use visual-explainer skill`);
  }
}

main();
