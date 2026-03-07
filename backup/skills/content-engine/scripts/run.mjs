#!/usr/bin/env node
/**
 * Content Engine - Automated Content Pipeline
 * Runs every 3 hours to research, create, and publish content
 * 
 * Usage: node run.mjs
 */

import { writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

const LOG_DIR = '~/.openclaw/workspace/logs';
const SKILLS_DIR = '~/.openclaw/workspace/skills';

// Ensure log directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  appendFileSync(join(LOG_DIR, 'content-engine.log'), logMessage);
  console.log(message);
}

function runCommand(cmd, timeout = 30000) {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout, cwd: SKILLS_DIR }).trim();
  } catch (e) {
    log(`Command failed: ${cmd}`);
    log(`Error: ${e.message}`);
    return null;
  }
}

// Content templates by type
const CONTENT_TYPES = [
  {
    type: 'tip',
    templates: [
      "I spent weeks figuring this out about OpenClaw... so you don't have to.",
      "This OpenClaw trick changed everything for me.",
      "Nobody talks about this OpenClaw feature but it's a game-changer.",
      "3 OpenClaw tips I wish I knew earlier:",
      "The one OpenClaw skill that saves me hours every week:"
    ]
  },
  {
    type: 'tutorial',
    templates: [
      "How to automate X with OpenClaw in 3 steps:",
      "A simple guide to OpenClaw automation:",
      "Let me show you how I built X with OpenClaw:",
      "OpenClaw tutorial nobody asked for but everyone needs:"
    ]
  },
  {
    type: 'hot_take',
    templates: [
      "Hot take: The best OpenClaw skill isn't what you think.",
      "Unpopular opinion: You're using OpenClaw wrong.",
      "Everyone overlooks this but it matters most."
    ]
  },
  {
    type: 'underrated',
    templates: [
      "This OpenClaw skill is underrated and barely used.",
      "Why does nobody talk about this OpenClaw feature?",
      "The most useful OpenClaw skill nobody knows about:"
    ]
  },
  {
    type: 'lesson',
    templates: [
      "The biggest lesson I learned building with OpenClaw:",
      "After 30 days with OpenClaw, here's what I know:",
      "What I wish I knew before starting with OpenClaw:"
    ]
  }
];

// Topics to cover
const TOPICS = [
  'OpenClaw skills',
  'AI agent automation',
  'Prompt engineering',
  'Agent orchestration',
  'Build in public',
  'Autonomous companies'
];

// Get random item from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Research using askvault
function research() {
  log('🔍 Running research with askvault...');
  
  const topic = randomItem(TOPICS);
  log(`   Topic: ${topic}`);
  
  try {
    const result = execSync(
      `node ${SKILLS_DIR}/askvault/scripts/search.mjs "${topic}" --sources reddit --format json 2>/dev/null`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    const data = JSON.parse(result);
    log(`   Found ${data.questions?.length || 0} questions`);
    return { topic, questions: data.questions || [] };
  } catch (e) {
    log(`   Research error: ${e.message}`);
    return { topic, questions: [] };
  }
}

// Generate content
function generateContent(research) {
  log('✍️ Generating content...');
  
  const contentType = randomItem(CONTENT_TYPES);
  const template = randomItem(contentType.templates);
  
  let content = template;
  
  // Add research-backed insight if available
  if (research.questions.length > 0) {
    const question = randomItem(research.questions.slice(0, 5));
    content += `\n\n${question.text?.slice(0, 100)}...`;
  } else {
    // Use fallback content based on type
    const fallbacks = {
      tip: '\n\nAutomate your workflow. Let agents do the work.',
      tutorial: '\n\n1. Set up the skill\n2. Configure the automation\n3. Watch it run',
      hot_take: '\n\nThe future is autonomous. Accept it.',
      underrated: '\n\nIt handles X so you can focus on Y.',
      lesson: '\n\nAutomation is a mindset, not a tool.'
    };
    content += fallbacks[contentType.type];
  }
  
  log(`   Type: ${contentType.type}`);
  return { content, type: contentType.type };
}

// Format with tweet-formatter
function formatContent(content) {
  log('🎨 Formatting with tweet-formatter...');
  
  try {
    const result = execSync(
      `node ${SKILLS_DIR}/tweet-formatter/scripts/format.mjs "${content.replace(/"/g, '\\"')}" --style viral --engagement downArrow --hashtags OpenClaw,AIAgents 2>/dev/null`,
      { encoding: 'utf-8', timeout: 10000 }
    );
    return result.trim();
  } catch (e) {
    return content;
  }
}

// Humanize
function humanizeContent(content) {
  log('🧑 Humanizing with humanizer-pro...');
  
  try {
    const result = execSync(
      `node ${SKILLS_DIR}/humanizer-pro/scripts/humanize.mjs "${content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" 2>/dev/null`,
      { encoding: 'utf-8', timeout: 10000 }
    );
    return result.trim();
  } catch (e) {
    return content;
  }
}

// Create visual (simplified - just note what to create)
function createVisual(content, type) {
  log('🎬 Creating visual...');
  
  // For now, we'll generate a reminder to create visual
  // In production, this would call remotion-studio or visual-explainer
  const visualNote = `\n\n[🎨 Visual: ${type === 'tip' ? 'Numbered list with icons' : type === 'tutorial' ? 'Step-by-step visual' : 'Bold statement graphic'}]`;
  
  log(`   Visual type: ${type}`);
  return visualNote;
}

// Main run
async function main() {
  log('🚀 Content Engine starting...');
  
  try {
    // Step 1: Research
    const researchData = research();
    
    // Step 2: Generate
    const { content, type } = generateContent(researchData);
    
    // Step 3: Format
    const formatted = formatContent(content);
    
    // Step 4: Humanize
    const humanized = humanizeContent(formatted);
    
    // Step 5: Visual note
    const visual = createVisual(humanized, type);
    
    // Final content
    const finalContent = humanized + visual;
    
    // Output
    log('');
    log('=== FINAL CONTENT ===');
    console.log(finalContent);
    log('');
    
    // Save to pending
    const pendingDir = join(SKILLS_DIR, 'content-engine', 'pending');
    if (!existsSync(pendingDir)) {
      mkdirSync(pendingDir, { recursive: true });
    }
    
    const filename = join(pendingDir, `post-${Date.now()}.txt`);
    writeFileSync(filename, finalContent);
    log(`💾 Saved to: ${filename}`);
    
    // TODO: Post via Postiz
    log('⏭️ Ready to post - connect Postiz to automate');
    
    log('✅ Content Engine complete!');
    
  } catch (e) {
    log(`❌ Error: ${e.message}`);
  }
}

main();
