#!/usr/bin/env node

/**
 * Smart Compact - Aggressive Memory Compaction
 * Runs on every heartbeat to keep memory lean
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config
const config = JSON.parse(
  await fs.readFile(path.join(__dirname, '../config.json'), 'utf-8')
);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');

const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
console.log(`\n[${timestamp}] Smart Compact ${dryRun ? '(DRY RUN) ' : ''}${force ? '(FORCE) ' : ''}`);

async function getMemoryFiles() {
  const files = [];
  const memoryDir = config.memoryPath;

  try {
    const entries = await fs.readdir(memoryDir);
    for (const entry of entries) {
      if (entry.endsWith('.md') && entry !== 'archive' && entry !== 'backups') {
        const filePath = path.join(memoryDir, entry);
        const stats = await fs.stat(filePath);
        files.push({
          name: entry,
          path: filePath,
          size: stats.size,
          modified: stats.mtime
        });
      }
    }
  } catch (error) {
    console.error('Error reading memory directory:', error.message);
  }

  return files;
}

function extractKeyInfo(content, filename) {
  const extractions = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLines = lines.slice(i + 1, i + 4).join(' ');
    const context = line + ' ' + nextLines;

    // Extract patterns
    for (const pattern of config.extractionPatterns) {
      if (line.includes(pattern)) {
        const extraction = {
          pattern,
          line: line.trim(),
          context: context.trim(),
          source: filename,
          timestamp: new Date().toISOString()
        };

        // Avoid duplicates
        if (!extractions.some(e => e.line === extraction.line)) {
          extractions.push(extraction);
        }
        break;
      }
    }
  }

  return extractions;
}

function inferTopics(context) {
  const topics = [];
  const topicPatterns = {
    'openclaw': /openclaw|agent|skill/i,
    'polysauce': /polysauce|polymarket|copy.?trading/i,
    'ghost-malone': /ghost.?malone|felix|ai.?ceo/i,
    'stripe': /stripe|payment|\$\d+/i,
    'pricing': /pricing|\$\d+/i,
    'launch': /launch/i,
    'marketing': /marketing|twitter|tiktok|postiz/i,
    'product': /product|feature/i,
    'decision': /decision|chose|selected/i,
    'deadline': /deadline|date|by \w+ \d+/i,
    'bug': /bug|error|issue|fix/i,
    'success': /✅|success|complete|done/i
  };

  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(context)) {
      topics.push(topic);
    }
  }

  return topics.slice(0, 5).join(',') || 'general';
}

function determineImportance(extraction) {
  const line = (extraction.line || '').toLowerCase();

  if (line.includes('important') || line.includes('critical') || line.includes('urgent')) {
    return 'high';
  }
  if (line.includes('decision') || line.includes('launch') || line.includes('deadline')) {
    return 'high';
  }
  if (line.includes('todo') || line.includes('next')) {
    return 'medium';
  }
  return 'low';
}

async function storeToBrain(extractions, filename) {
  if (dryRun || !extractions || extractions.length === 0) return;

  const brainScript = path.join(config.brainPath, 'scripts/capture-rest.mjs');

  // Store asynchronously without waiting (non-blocking)
  setImmediate(async () => {
    for (const extraction of extractions.slice(0, 5)) { // Limit to 5 per file
      const topics = inferTopics(extraction.context);
      const importance = determineImportance(extraction);

      try {
        const { exec } = await import('child_process');
        exec(`node "${brainScript}" "${extraction.line}" --topics "${topics}" --importance ${importance}`, {
          cwd: config.brainPath,
          timeout: 2000
        });
      } catch (error) {
        // Silent fail - brain not critical
      }
    }
  });
}

function compactFile(content, filename) {
  const lines = content.split('\n');
  const compacted = [];
  const archive = [];

  let inCodeBlock = false;
  let preserveBlock = false;
  let inHeader = false;
  let headerDepth = 0;

  // Get date 3 days ago (more aggressive)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      preserveBlock = line.includes('🔐') || line.includes('SECRET') || line.includes('API');
    }

    // Track headers
    const isHeader = line.trim().startsWith('#');
    if (isHeader) {
      headerDepth = (line.match(/^#+/) || [''])[0].length;
    }

    // Check for date in line
    const hasDate = /\d{4}-\d{2}-\d{2}/.test(line) || /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line);

    // Check if line is recent (has recent date or no date)
    const lineHasRecentDate = hasDate && /(?:\d{4}-\d{2}-\d{2})|(?:Mar \d{1,2})|(?:March \d{1,2})/i.test(line);

    // ALWAYS preserve:
    // 1. Headers (structure)
    // 2. Lines with preserve patterns (secrets, important)
    // 3. Code blocks marked for preservation
    // 4. Lines with recent dates (last 3 days)
    // 5. Lines marked with ✅ ❌ ⚠️ 🔐 (status indicators)

    const shouldPreserve = config.preservePatterns.some(p => line.includes(p));
    const hasStatusEmoji = /[✅❌⚠️🔐🎯📊]/.test(line);
    const isKeyLearning = line.toLowerCase().includes('key learning') || line.toLowerCase().includes('lesson');
    const isDecision = line.toLowerCase().includes('decision') || line.toLowerCase().includes('chose');
    const isImportant = line.toLowerCase().includes('important') || line.toLowerCase().includes('critical');

    if (
      isHeader ||
      shouldPreserve ||
      (inCodeBlock && preserveBlock) ||
      lineHasRecentDate ||
      hasStatusEmoji ||
      isKeyLearning ||
      isDecision ||
      isImportant ||
      line.trim() === ''
    ) {
      compacted.push(line);
    } else {
      archive.push(line);
    }
  }

  return {
    compacted: compacted.join('\n'),
    archive: archive.join('\n'),
    stats: {
      original: lines.length,
      compacted: compacted.length,
      archived: archive.length
    }
  };
}

async function createBackup(filename, content) {
  if (dryRun) return;

  const backupDir = config.backupPath;
  await fs.mkdir(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${filename}.${timestamp}.bak`;
  const backupPath = path.join(backupDir, backupName);

  await fs.writeFile(backupPath, content, 'utf-8');
}

async function archiveOldContent(filename, archiveContent) {
  if (!archiveContent || archiveContent.trim().length === 0) return;

  if (dryRun) {
    console.log(`  Would archive ${archiveContent.split('\n').length} lines`);
    return;
  }

  const archiveDir = config.archivePath;
  await fs.mkdir(archiveDir, { recursive: true });

  const archivePath = path.join(archiveDir, `${filename}.archive`);

  // Append to existing archive
  const existing = await fs.readFile(archivePath, 'utf-8').catch(() => '');
  const updated = existing + '\n\n---\n\n' + `<!-- Archived ${new Date().toISOString()} -->\n\n` + archiveContent;

  await fs.writeFile(archivePath, updated, 'utf-8');
}

async function main() {
  const files = await getMemoryFiles();

  if (files.length === 0) {
    console.log('No memory files found.');
    return;
  }

  console.log(`Analyzing ${files.length} memory files...\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let totalExtracted = 0;
  let filesCompacted = 0;

  for (const file of files) {
    const content = await fs.readFile(file.path, 'utf-8');
    const sizeBefore = Buffer.byteLength(content, 'utf-8');

    // Skip files under size limit (unless forced)
    if (!force && sizeBefore < config.maxFileSize) {
      continue;
    }

    console.log(`📄 ${file.name} (${(sizeBefore / 1024).toFixed(1)} KB)`);

    // Extract key information to brain
    const extractions = extractKeyInfo(content, file.name);
    totalExtracted += extractions.length;

    if (extractions.length > 0) {
      console.log(`  Extracted ${extractions.length} items to brain`);
      await storeToBrain(extractions, file.name);
    }

    // Compact the file
    const { compacted, archive, stats } = compactFile(content, file.name);
    const sizeAfter = Buffer.byteLength(compacted, 'utf-8');

    // Only write if we actually reduced size
    if (sizeAfter < sizeBefore) {
      // Create backup
      await createBackup(file.name, content);

      // Archive old content
      await archiveOldContent(file.name, archive);

      // Write compacted version
      if (!dryRun) {
        await fs.writeFile(file.path, compacted, 'utf-8');
      }

      filesCompacted++;

      const saved = sizeBefore - sizeAfter;
      const percentSaved = ((saved / sizeBefore) * 100).toFixed(0);

      console.log(`  Compacted: ${(sizeAfter / 1024).toFixed(1)} KB (saved ${percentSaved}%)`);
      console.log(`  Lines: ${stats.original} → ${stats.compacted} (archived ${stats.archived})\n`);

      totalBefore += sizeBefore;
      totalAfter += sizeAfter;
    } else {
      console.log(`  No reduction possible (${stats.archived} lines would be archived)\n`);
    }
  }

  // Summary
  if (filesCompacted > 0) {
    const totalSaved = totalBefore - totalAfter;
    const totalPercent = ((totalSaved / totalBefore) * 100).toFixed(0);

    console.log('Summary:');
    console.log(`- Files compacted: ${filesCompacted}/${files.length}`);
    console.log(`- Items extracted to brain: ${totalExtracted}`);
    console.log(`- Before: ${(totalBefore / 1024).toFixed(1)} KB`);
    console.log(`- After: ${(totalAfter / 1024).toFixed(1)} KB`);
    console.log(`- Saved: ${(totalSaved / 1024).toFixed(1)} KB (${totalPercent}%)`);
  } else {
    console.log('✓ All files under size limit or no reduction possible.');
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
