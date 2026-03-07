#!/usr/bin/env node
/**
 * GitHub Spotlight - Daily Repo Showcase
 * Finds cool GitHub projects and posts about them
 * 
 * Usage: node run.mjs
 */

import { writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const LOG_DIR = '~/.openclaw/workspace/logs';
const SKILLS_DIR = '~/.openclaw/workspace/skills';

// Ensure log directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  appendFileSync(join(LOG_DIR, 'github-spotlight.log'), logMessage);
  console.log(message);
}

// Cool GitHub projects to potentially feature (fallback)
const PROJECT_IDEAS = [
  { topic: 'openclaw', name: 'OpenClaw' },
  { topic: 'paperclip AI', name: 'PaperClip' },
  { topic: 'claude code', name: 'Claude Code' },
  { topic: 'ai agents', name: 'AI Agents' },
  { topic: 'automation', name: 'Automation' },
  { topic: 'cursor AI', name: 'Cursor' },
  { topic: 'dev tools', name: 'Dev Tools' },
  { topic: 'productivity', name: 'Productivity' }
];

// Content templates
const TEMPLATES = [
  {
    hook: "This project changed how I think about {}",
    body: "It's an open-source tool that {}. No fluff, just real utility.",
    why: "The problem it solves: {}",
    cta: "Go star it before it blows up."
  },
  {
    hook: "I can't stop thinking about this {} project.",
    body: "Built by {}, this tool lets you {}. Simple but powerful.",
    why: "Why it matters: {}",
    cta: "If you build with AI, you need this."
  },
  {
    hook: "Most GitHub repos are noise. This one is signal.",
    body: "{} does one thing and does it well: {}. The kind of tool that makes you think 'why didn't I build this?'",
    why: "What makes it special: {}",
    cta: "Bookmark this. You'll need it."
  },
  {
    hook: "Hot take: The best tools aren't on Product Hunt. They're on GitHub.",
    body: "Case in point: {}. A {} that {}. Built by {}.",
    why: "Why I care: {}",
    cta: "Go star. Thank me later."
  }
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Find trending project using askvault
async function findProject() {
  log('🔍 Finding a project to spotlight...');
  
  const topic = randomItem(PROJECT_IDEAS);
  log(`   Topic: ${topic.topic}`);
  
  try {
    // Use askvault to find related projects
    const result = execSync(
      `node ${SKILLS_DIR}/askvault/scripts/search.mjs "${topic.topic}" --sources reddit --format json 2>/dev/null`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    
    const data = JSON.parse(result);
    if (data.questions && data.questions.length > 0) {
      const q = randomItem(data.questions.slice(0, 3));
      log(`   Found: ${q.text?.slice(0, 50)}...`);
    }
  } catch (e) {
    log(`   Using fallback project`);
  }
  
  // Return a sample project (in production, would fetch from GitHub API)
  return {
    name: topic.name,
    topic: topic.topic,
    description: `An amazing ${topic.topic} tool that helps developers build faster.`,
    builder: '@builder',
    github: `https://github.com/search?q=${encodeURIComponent(topic.topic)}`,
    stars: '1K+'
  };
}

// Generate spotlight content
function generateContent(project) {
  log('✍️ Generating spotlight content...');
  
  const template = randomItem(TEMPLATES);
  
  // Keep it under 280 chars
  const content = `${template.hook.replace('{}', project.topic)}

${project.description}

${template.cta}

#OpenSource #Tech

👇 GitHub link in comments`;

  return content;
}

// Format with tweet-formatter
function formatContent(content) {
  log('🎨 Formatting...');
  try {
    const result = execSync(
      `node ${SKILLS_DIR}/tweet-formatter/scripts/format.mjs "${content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" --style viral --engagement downArrow 2>/dev/null`,
      { encoding: 'utf-8', timeout: 10000 }
    );
    return result.trim();
  } catch (e) {
    return content;
  }
}

// Humanize
function humanizeContent(content) {
  log('🧑 Humanizing...');
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

// Add GitHub link as comment
function getComment(project) {
  return `🔗 GitHub: ${project.github}

This is the kind of open source that keeps the dev community alive.`;

}

// Main
async function main() {
  log('🚀 GitHub Spotlight starting...');
  
  try {
    // 1. Find project
    const project = await findProject();
    
    // 2. Generate content
    let content = generateContent(project);
    
    // 3. Format
    content = formatContent(content);
    
    // 4. Humanize
    content = humanizeContent(content);
    
    // 5. Get comment with link
    const comment = getComment(project);
    
    log('');
    log('=== MAIN POST ===');
    console.log(content);
    log('');
    log('=== COMMENT ===');
    console.log(comment);
    log('');
    
    // Save to pending
    const pendingDir = join(SKILLS_DIR, 'github-spotlight', 'pending');
    if (!existsSync(pendingDir)) {
      mkdirSync(pendingDir, { recursive: true });
    }
    
    const filename = join(pendingDir, `spotlight-${Date.now()}.json`);
    writeFileSync(filename, JSON.stringify({ project, post: content, comment }, null, 2));
    log(`💾 Saved to: ${filename}`);
    
    // TODO: Post via Postiz + add comment
    log('⏭️ Ready to post - connect Postiz to automate');
    
    log('✅ GitHub Spotlight complete!');
    
  } catch (e) {
    log(`❌ Error: ${e.message}`);
  }
}

main();
