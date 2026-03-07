#!/usr/bin/env node
/**
 * Postiz Posting Script - Uses AI Agent (Nevo)
 * 
 * IMPORTANT: This script interacts with the Postiz AI agent (Nevo)
 * via conversational flow, NOT the CLI tool directly.
 * 
 * Usage: node post-to-postiz.mjs "<content>" <integrationId> [options]
 * 
 * Example:
 *   node post-to-postiz.mjs "Hello world! #test" YOUR_POSTIZ_ID
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const LOG_DIR = '~/.openclaw/workspace/logs';

// Ensure log directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  // Could append to log file if needed
}

// Integration IDs
const INTEGRATIONS = {
  x: 'YOUR_POSTIZ_ID',
  twitter: 'YOUR_POSTIZ_ID',
  youtube: 'YOUR_POSTIZ_ID',
  reddit: 'YOUR_POSTIZ_ID',
  tiktok: 'YOUR_POSTIZ_ID'
};

/**
 * Post content using Postiz AI agent (Nevo)
 * 
 * @param {string} content - The content to post
 * @param {string} integrationId - The integration ID (e.g., YOUR_POSTIZ_ID)
 * @param {object} options - Additional options
 * @returns {object} - Result with success status and URL
 */
async function postToPostiz(content, integrationId, options = {}) {
  const {
    platform = 'x',
    whoCanReply = 'everyone',
    attachments = [],
    thread = false
  } = options;

  log('📤 Posting to Postiz via AI agent (Nevo)...');
  log(`   Platform: ${platform}`);
  log(`   Integration: ${integrationId}`);
  log(`   Content: ${content.slice(0, 50)}...`);

  // Build the message for Nevo
  const message = `POST TO @YOUR_HANDLE NOW:

${content}

Integration: ${integrationId}
No attachments. Everyone can reply. POST NOW.

CONFIRM AND POST.`;

  try {
    // Step 1: Send posting request to Nevo
    log('   Step 1: Sending request to Nevo...');
    const requestCmd = `mcporter call 'postiz.ask_postiz(message: "${message.replace(/\n/g, '\\n').replace(/"/g, '\\"')}")' --timeout 120000`;
    
    const response1 = execSync(requestCmd, {
      encoding: 'utf-8',
      timeout: 120000,
      cwd: '~/.openclaw/workspace'
    });

    log('   Step 2: Parsing Nevo response...');
    
    // Check if Nevo is asking for confirmation
    if (response1.includes('CONFIRM POST NOW') || response1.includes('Ready to post')) {
      log('   Step 3: Confirming post...');
      
      // Send confirmation
      const confirmCmd = `mcporter call 'postiz.ask_postiz(message: "CONFIRM POST NOW")' --timeout 120000`;
      const response2 = execSync(confirmCmd, {
        encoding: 'utf-8',
        timeout: 120000,
        cwd: '~/.openclaw/workspace'
      });

      // Extract URL from response
      const urlMatch = response2.match(/https?:\/\/(twitter\.com|x\.com)\/[\w]+\/status\/[\d]+/);
      if (urlMatch) {
        log('   ✅ Posted successfully!');
        log(`   URL: ${urlMatch[0]}`);
        return { success: true, url: urlMatch[0] };
      }

      // Check for success indicators
      if (response2.includes('Posted') || response2.includes('published') || response2.includes('scheduled')) {
        log('   ✅ Posted successfully!');
        return { success: true, url: null };
      }

      log('   ⚠️  Post may have succeeded, but no URL returned');
      return { success: true, url: null, response: response2 };
    }

    // If Nevo posted immediately without confirmation
    const urlMatch = response1.match(/https?:\/\/(twitter\.com|x\.com)\/[\w]+\/status\/[\d]+/);
    if (urlMatch) {
      log('   ✅ Posted successfully!');
      log(`   URL: ${urlMatch[0]}`);
      return { success: true, url: urlMatch[0] };
    }

    log('   ⚠️  Unexpected response from Nevo');
    return { success: false, error: 'Unexpected response', response: response1 };

  } catch (error) {
    log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Save failed post for manual review
 */
function saveFailedPost(content, integrationId, error) {
  const failedDir = '~/.openclaw/workspace/charlie/posts/failed';
  if (!existsSync(failedDir)) {
    mkdirSync(failedDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `failed-${timestamp}.txt`;
  const filepath = join(failedDir, filename);

  const fileContent = `# Failed Post
## Timestamp: ${new Date().toISOString()}
## Integration: ${integrationId}
## Error: ${error}

## Content:
${content}
`;

  writeFileSync(filepath, fileContent);
  log(`   📝 Saved failed post to: ${filepath}`);
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Usage: node post-to-postiz.mjs "<content>" <integrationId> [options]

Arguments:
  content       - The content to post (required)
  integrationId - Integration ID or platform name (required)

Options (via environment variables):
  PLATFORM      - Platform name (x, twitter, youtube, reddit, tiktok)
  WHO_CAN_REPLY - Who can reply (everyone, following, mentionedUsers, subscribers, verified)
  THREAD        - Is this a thread? (true/false)

Integration IDs:
  x/twitter: ${INTEGRATIONS.x}
  youtube:   ${INTEGRATIONS.youtube}
  reddit:    ${INTEGRATIONS.reddit}
  tiktok:    ${INTEGRATIONS.tiktok}

Examples:
  node post-to-postiz.mjs "Hello world! #test" YOUR_POSTIZ_ID
  node post-to-postiz.mjs "Hello world! #test" x
  PLATFORM=x node post-to-postiz.mjs "Hello world! #test" x
`);
    process.exit(1);
  }

  const [content, integrationArg] = args;
  
  // Resolve integration ID
  const integrationId = INTEGRATIONS[integrationArg.toLowerCase()] || integrationArg;
  
  // Get options from environment
  const options = {
    platform: process.env.PLATFORM || 'x',
    whoCanReply: process.env.WHO_CAN_REPLY || 'everyone',
    thread: process.env.THREAD === 'true'
  };

  const result = await postToPostiz(content, integrationId, options);

  if (result.success) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } else {
    saveFailedPost(content, integrationId, result.error);
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
}

// Export for use as module
export { postToPostiz, INTEGRATIONS };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
