#!/usr/bin/env node
/**
 * Humanizer Pro - Remove AI Writing Patterns
 * 
 * Usage:
 *   node humanize.mjs "text to humanize"
 *   node humanize.mjs --input file.txt
 *   node humanize.mjs --input file.txt --output human.txt
 *   node humanize.mjs --batch ./posts/
 * 
 * Options:
 *   --input <file>    Input file
 *   --output <file>   Output file (default: stdout)
 *   --batch <dir>     Batch process all .txt files in directory
 *   --tweet           Optimize for Twitter (shorter, punchier)
 *   --verbose         Show what patterns were fixed
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// AI patterns to detect and fix
const PATTERNS = [
  {
    name: 'em-dash-overuse',
    regex: /([^.-])---/g,
    fix: (m) => m.replace(/---/g, ' — ').replace(/ -- /g, ' — '),
    desc: 'Em-dash overuse'
  },
  {
    name: 'rule-of-three',
    regex: /\b(\w+), (\w+), (and \w+)/g,
    fix: (m) => m, // Just flag it - varies by context
    desc: 'Rule of three pattern'
  },
  {
    name: 'ai-vocabulary',
    regex: /\b(delve|leverage|utilize|transformational|revolutionary|game-changing|paradigm|unprecedented|groundbreaking)\b/gi,
    fix: (m) => {
      const map = {
        'delve': 'dig',
        'leverage': 'use',
        'utilize': 'use',
        'transformational': 'big',
        'revolutionary': 'new',
        'game-changing': 'important',
        'paradigm': 'model',
        'unprecedented': 'new',
        'groundbreaking': 'new'
      };
      return map[m.toLowerCase()] || m;
    },
    desc: 'AI vocabulary words'
  },
  {
    name: 'inflated-language',
    regex: /\b(cutting-edge|state-of-the-art|best-in-class|world-class|highly advanced|sophisticated solutions|innovative approach)\b/gi,
    fix: (m) => {
      const map = {
        'cutting-edge': 'new',
        'state-of-the-art': 'modern',
        'best-in-class': 'top',
        'world-class': 'top',
        'highly advanced': 'advanced',
        'sophisticated solutions': 'solutions',
        'innovative approach': 'new approach'
      };
      return map[m.toLowerCase()] || m;
    },
    desc: 'Inflated promotional language'
  },
  {
    name: 'vague-attributions',
    regex: /\b(experts say|research shows|studies indicate|industry leaders believe|according to sources)\b/gi,
    fix: (m) => 'research shows', // Keep vague but shorten
    desc: 'Vague attributions'
  },
  {
    name: 'superficial-ing',
    regex: /([A-Z][a-z]+ing)\s+([^,]+),\s+it\s+(becomes|is|seems)\s+/g,
    fix: (m) => m.replace(/^([A-Z][a-z]+ing)\s+([^,]+),\s+/, '$2. '),
    desc: 'Superficial -ing phrases'
  },
  {
    name: 'hedging',
    regex: /\b(it's possible that|it could potentially|there is a possibility|may potentially|could potentially|might very well)\b/gi,
    fix: (m) => {
      const map = {
        "it's possible that": 'maybe',
        'it could potentially': 'it could',
        'there is a possibility': 'maybe',
        'may potentially': 'may',
        'could potentially': 'could',
        'might very well': 'might'
      };
      return map[m.toLowerCase()] || m;
    },
    desc: 'Excessive hedging'
  },
  {
    name: 'parenthetical-asides',
    regex: /\(([^)]+)\)/g,
    fix: (m) => m.length < 30 ? m : m, // Keep short ones, flag long
    desc: 'Excessive parentheticals'
  }
];

// Words/phrases that add personality
const POWER_WORDS = [
  'honestly', 'personally', 'I think', 'I believe', 'here\'s the thing',
  'look', 'honestly', 'the thing is', 'I keep coming back to',
  'this is what gets me', 'I\'m not gonna lie', 'real talk'
];

// Add personality injectors
function injectPersonality(text, options = {}) {
  if (options.tweet) return text; // Tweets don't need injection
  if (text.length < 100) return text;
  
  // 50% chance to add a personality opener
  if (Math.random() > 0.5 && !text.match(/^(I|Here|So|Look|Now)/i)) {
    const injector = POWER_WORDS[Math.floor(Math.random() * POWER_WORDS.length)];
    text = `${injecter}, ` + text.charAt(0).toLowerCase() + text.slice(1);
  }
  
  return text;
}

// Main humanize function
function humanize(text, options = {}) {
  let result = text;
  let fixes = [];
  
  // Apply pattern fixes
  for (const pattern of PATTERNS) {
    const matches = result.match(pattern.regex);
    if (matches) {
      result = result.replace(pattern.regex, pattern.fix);
      fixes.push(`${pattern.desc}: ${matches.length} occurrences`);
    }
  }
  
  // Add personality
  result = injectPersonality(result, options);
  
  // Vary sentence length - mix short and long
  const sentences = result.split(/[.!?]+/).filter(s => s.trim());
  if (sentences.length > 2) {
    // Add a short punchy sentence occasionally
    const shortSentences = ['Simple.', 'Think about it.', 'Here\'s why.', 'True.', '实测.'];
    if (Math.random() > 0.6) {
      const insertPos = Math.floor(sentences.length / 2);
      sentences.splice(insertPos, 0, shortSentences[Math.floor(Math.random() * shortSentences.length)]);
    }
    result = sentences.join('. ') + '.';
  }
  
  // Clean up multiple spaces
  result = result.replace(/\s+/g, ' ').trim();
  
  return { text: result, fixes };
}

// CLI
function main() {
  const args = process.argv.slice(2);
  let input = '';
  let output = null;
  let options = { tweet: false, verbose: false };
  
  // Parse args
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--input' && args[i + 1]) input = readFileSync(args[++i], 'utf-8');
    else if (arg === '--output' && args[i + 1]) output = args[++i];
    else if (arg === '--batch' && args[i + 1]) {
      const dir = args[++i];
      const files = readdirSync(dir).filter(f => f.endsWith('.txt'));
      for (const file of files) {
        const content = readFileSync(join(dir, file), 'utf-8');
        const { text, fixes } = humanize(content, options);
        const outFile = join(dir, file.replace('.txt', '.human.txt'));
        writeFileSync(outFile, text);
        console.log(`✓ ${file} → ${file.replace('.txt', '.human.txt')}`);
        if (options.verbose) fixes.forEach(f => console.log(`  - ${f}`));
      }
      return;
    }
    else if (arg === '--tweet') options.tweet = true;
    else if (arg === '--verbose') options.verbose = true;
    else if (!arg.startsWith('--')) input += (input ? ' ' : '') + arg;
  }
  
  if (!input) {
    console.log('Usage: node humanize.mjs [options] "text to humanize"');
    console.log('');
    console.log('Options:');
    console.log('  --input <file>   Input file');
    console.log('  --output <file>  Output file');
    console.log('  --batch <dir>    Batch process .txt files');
    console.log('  --tweet          Optimize for Twitter');
    console.log('  --verbose        Show fixes');
    process.exit(1);
  }
  
  const { text, fixes } = humanize(input, options);
  
  if (output) {
    writeFileSync(output, text);
    console.log(`✓ Saved to ${output}`);
  } else {
    console.log(text);
  }
  
  if (options.verbose && fixes.length) {
    console.log('\n--- Fixes ---');
    fixes.forEach(f => console.log(`  - ${f}`));
  }
}

main();
