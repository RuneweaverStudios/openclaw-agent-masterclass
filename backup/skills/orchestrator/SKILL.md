---
name: orchestrator
description: "Agent orchestration skill for tracking, spawning, nudging, and managing subagents. Provides templates, health monitoring, and centralized control. Use when managing multiple parallel tasks, coordinating agent teams, or needing visibility into subagent status."
---

# Orchestrator

Central command for all subagent operations. Track, spawn, nudge, kill, and coordinate agents.

## Quick Commands

### List All Agents
```bash
node orchestrator/scripts/status.mjs
```

### Spawn Agent from Template
```bash
node orchestrator/scripts/spawn.mjs coding --task "Build feature X" --label "my-agent"
node orchestrator/scripts/spawn.mjs research --task "Research topic Y" --label "research-1"
node orchestrator/scripts/spawn.mjs marketing --task "Create content for Z"
```

### Nudge Running Agent
```bash
node orchestrator/scripts/nudge.mjs <sessionKey> "Additional instructions here"
```

### Kill Agent
```bash
node orchestrator/scripts/kill.mjs <sessionKey>
```

### Health Check
```bash
node orchestrator/scripts/health.mjs
```

### Restart Stuck Agents
```bash
node orchestrator/scripts/restart-stuck.mjs
```

## Agent Templates

### coding
- **Runtime:** subagent
- **Model:** glm-5 (orchestrates) → spawns Claude Code
- **Timeout:** 600s (10 min)
- **Use for:** Any coding task, file creation, refactoring

### research
- **Runtime:** subagent
- **Model:** glm-5
- **Timeout:** 300s (5 min)
- **Use for:** Web search, summarization, data gathering

### marketing
- **Runtime:** subagent
- **Model:** glm-5
- **Timeout:** 600s (10 min)
- **Use for:** Content creation, social media, copywriting

### visual
- **Runtime:** subagent
- **Model:** glm-5
- **Timeout:** 600s (10 min)
- **Use for:** Diagrams, videos, visual explainers

## Architecture

```
orchestrator/
├── SKILL.md                    # This file
├── scripts/
│   ├── status.mjs              # List all agents
│   ├── spawn.mjs               # Spawn from template
│   ├── nudge.mjs               # Send message to running agent
│   ├── kill.mjs                # Terminate agent
│   ├── health.mjs              # Check health, detect stuck
│   └── restart-stuck.mjs       # Auto-restart failed agents
├── templates/
│   ├── coding.json
│   ├── research.json
│   ├── marketing.json
│   └── visual.json
└── registry.json               # Tracks all spawned agents
```

## Registry Format

`registry.json` tracks all agents:
```json
{
  "agents": [
    {
      "sessionKey": "agent:main:subagent:xxx",
      "runId": "abc-123",
      "label": "my-agent",
      "template": "coding",
      "task": "Build feature X",
      "status": "running",
      "startedAt": "2026-03-05T19:00:00Z",
      "lastCheck": "2026-03-05T19:05:00Z",
      "restarts": 0
    }
  ]
}
```

## Usage from Main Agent

When orchestrating from the main session:

```javascript
// Check status
const status = await tools.subagents({ action: 'list' });

// Spawn new agent
const result = await tools.sessions_spawn({
  runtime: 'subagent',
  task: '...',
  label: 'my-agent',
  timeoutSeconds: 600
});

// Nudge running agent
await tools.subagents({
  action: 'steer',
  target: 'sessionKey',
  message: 'New instructions'
});

// Kill agent
await tools.subagents({
  action: 'kill',
  target: 'sessionKey'
});
```

## Health Monitoring

The `health.mjs` script checks:
- Runtime exceeds expected (stuck detection)
- No status update in 5+ minutes
- Failed status

Auto-restart logic in `restart-stuck.mjs`:
- Detect stuck/failed agents
- Respawn with same task
- Increment restart counter
- Alert after 3 restarts

## Best Practices

1. **Always use labels** — Makes tracking easier
2. **Set appropriate timeouts** — Coding needs 10-20min, research needs 5min
3. **Check health regularly** — Run health.mjs every few minutes
4. **Nudge before killing** — Sometimes agents just need direction
5. **Use templates** — Ensures consistent configuration

## Integration with Pixel Agents

The orchestrator feeds data to the pixel-agents dashboard via the bridge API. Each spawned agent appears as a pixel character in the visualization.
