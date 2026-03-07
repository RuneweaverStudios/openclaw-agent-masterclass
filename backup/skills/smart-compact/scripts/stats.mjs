#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(
  await fs.readFile(path.join(__dirname, '../config.json'), 'utf-8')
);

console.log('\n📊 Memory Stats\n');

async function getStats() {
  const stats = {
    memoryFiles: 0,
    totalSize: 0,
    largestFile: { name: '', size: 0 },
    oldestFile: { name: '', date: Date.now() },
    newestFile: { name: '', date: 0 },
    filesToCompact: 0,
    brainEntries: 0,
    lastCompaction: null
  };

  // Check memory files
  try {
    const entries = await fs.readdir(config.memoryPath);
    for (const entry of entries) {
      if (entry.endsWith('.md') && entry !== 'archive' && entry !== 'backups') {
        const filePath = path.join(config.memoryPath, entry);
        const fileStats = await fs.stat(filePath);
        const size = fileStats.size;

        stats.memoryFiles++;
        stats.totalSize += size;

        if (size > stats.largestFile.size) {
          stats.largestFile = { name: entry, size };
        }

        if (fileStats.mtime.getTime() < stats.oldestFile.date) {
          stats.oldestFile = { name: entry, date: fileStats.mtime.getTime() };
        }

        if (fileStats.mtime.getTime() > stats.newestFile.date) {
          stats.newestFile = { name: entry, date: fileStats.mtime.getTime() };
        }

        if (size >= config.maxFileSize) {
          stats.filesToCompact++;
        }
      }
    }
  } catch (error) {
    console.error('Error reading memory files:', error.message);
  }

  // Check brain entries (if brain exists)
  try {
    const brainDb = path.join(config.brainPath, 'data/memories.json');
    const brainData = await fs.readFile(brainDb, 'utf-8');
    const memories = JSON.parse(brainData);
    stats.brainEntries = memories.length;
  } catch {
    // Brain not set up yet
  }

  // Check last compaction
  try {
    const logFile = '/tmp/smart-compact.log';
    const log = await fs.readFile(logFile, 'utf-8');
    const lastRun = log.split('\n').filter(l => l.includes('Smart Compact')).pop();
    if (lastRun) {
      const match = lastRun.match(/\[(\d+:\d+ [AP]M)\]/);
      if (match) {
        stats.lastCompaction = match[1];
      }
    }
  } catch {
    // No log file yet
  }

  return stats;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const stats = await getStats();

console.log('Memory Files:');
console.log(`- Total files: ${stats.memoryFiles}`);
console.log(`- Total size: ${formatBytes(stats.totalSize)}`);
console.log(`- Largest: ${stats.largestFile.name} (${formatBytes(stats.largestFile.size)})`);
console.log(`- Oldest: ${stats.oldestFile.name} (${formatDate(stats.oldestFile.date)})`);
console.log(`- Newest: ${stats.newestFile.name} (${formatDate(stats.newestFile.date)})`);

console.log('\nCompaction:');
console.log(`- Files over limit: ${stats.filesToCompact}`);
console.log(`- Max file size: ${formatBytes(config.maxFileSize)}`);
console.log(`- Keep recent: ${config.keepRecentDays} days`);

console.log('\nBrain:');
console.log(`- Entries: ${stats.brainEntries || 'Not set up'}`);

if (stats.lastCompaction) {
  console.log(`\nLast compaction: ${stats.lastCompaction}`);
}

// Health check
console.log('\nHealth:');
if (stats.filesToCompact > 0) {
  console.log(`⚠️  ${stats.filesToCompact} files need compaction`);
} else {
  console.log('✅ All files under size limit');
}

if (stats.totalSize > 100000) {
  console.log(`⚠️  Total memory size > 100 KB (current: ${formatBytes(stats.totalSize)})`);
} else {
  console.log(`✅ Total size healthy (${formatBytes(stats.totalSize)})`);
}

console.log('');
