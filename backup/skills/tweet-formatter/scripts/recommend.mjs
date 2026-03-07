#!/usr/bin/env node
/**
 * Tweet Recommender - Get format recommendations for your topic
 * 
 * Usage:
 *   node recommend.mjs "AI agents"
 *   node recommend.mjs --topic file.txt
 */

import { readFileSync } from 'fs';

// Topic to format mapping
const TOPIC_FORMATS = {
  'ai': ['story', 'results', 'viral'],
  'agent': ['story', 'listicle'],
  'automation': ['listicle', 'results'],
  'startup': ['contrarian', 'viral'],
  'build': ['story', 'results'],
  'tutorial': ['story', 'listicle'],
  'opinion': ['contrarian', 'viral'],
  'news': ['viral', 'story'],
  'results': ['results'],
  'how': ['listicle', 'story'],
  'why': ['contrarian', 'viral']
};

// Best hashtags by topic
const TOPIC_HASHTAGS = {
  'ai': 'AI,MachineLearning,Tech',
  'agents': 'AIAgents,Automation,Tech',
  'startup': 'Startup,Entrepreneur,BuildInPublic',
  'automation': 'Automation,Productivity,NoCode',
  'coding': 'Coding,DevLife,Programming',
  'saas': 'SaaS,Startup,B2B'
};

function analyzeTopic(topic) {
  const topicLower = topic.toLowerCase();
  const words = topicLower.split(/\s+/);
  
  // Find matching formats
  let formats = [];
  for (const word of words) {
    for (const [key, value] of Object.entries(TOPIC_FORMATS)) {
      if (topicLower.includes(key)) {
        formats = [...new Set([...formats, ...value])];
      }
    }
  }
  
  // Default to viral if no match
  if (formats.length === 0) {
    formats = ['viral', 'story'];
  }
  
  // Find hashtags
  let hashtags = '';
  for (const word of words) {
    if (TOPIC_HASHTAGS[word]) {
      hashtags = TOPIC_HASHTAGS[word];
      break;
    }
  }
  
  if (!hashtags) {
    hashtags = 'Tech,AI,Innovation';
  }
  
  return { formats, hashtags };
}

function showHelp() {
  console.log(`
Tweet Recommender - Get Format Recommendations

Usage: node recommend.mjs "Your topic"

Example:
  node recommend.mjs "building AI agents"
  node recommend.mjs "startup advice"
  `);
  process.exit(1);
}

function main() {
  const args = process.argv.slice(2);
  let topic = '';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      topic = readFileSync(args[++i], 'utf-8').trim();
    } else if (args[i] === '--help') {
      showHelp();
    } else if (!args[i].startsWith('--')) {
      topic += (topic ? ' ' : '') + args[i];
    }
  }
  
  if (!topic) {
    showHelp();
  }
  
  console.log(`📊 Recommendations for: "${topic}"`);
  console.log('');
  
  const { formats, hashtags } = analyzeTopic(topic);
  
  console.log('=== Recommended Formats ===');
  formats.forEach((f, i) => {
    console.log(`  ${i + 1}. ${f.charAt(0).toUpperCase() + f.slice(1)}`);
  });
  
  console.log('');
  console.log('=== Recommended Hashtags ===');
  console.log(`  ${hashtags}`);
  
  console.log('');
  console.log('=== Example Hooks ===');
  if (formats.includes('story')) {
    console.log('  🧵 So I finally figured out how to ' + topic.toLowerCase() + '...');
  }
  if (formats.includes('viral')) {
    console.log('  Hot take: The truth about ' + topic.toLowerCase());
  }
  if (formats.includes('contrarian')) {
    console.log('  Everyone thinks they know about ' + topic.toLowerCase() + '. They\'re wrong.');
  }
  if (formats.includes('results')) {
    console.log('  After 30 days of ' + topic.toLowerCase() + ':');
  }
}

main();
