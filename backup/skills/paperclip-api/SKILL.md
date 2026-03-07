---
name: paperclip-api
description: "Control PaperClip via API - create agents, issues, goals, manage company. Use when: (1) creating agents programmatically, (2) assigning tasks, (3) checking agent status, (4) managing the company. API runs at localhost:3100."
---

# PaperClip API

Control your AI company orchestration directly via API.

## Quick Start

```bash
# List companies
node paperclip-api/scripts/companies.mjs list

# Create an agent
node paperclip-api/scripts/agents.mjs create --name "Charlie" --role "Marketing" --adapter openclaw

# Create a task/issue
node paperclip-api/scripts/issues.mjs create --title "Create tweet about AI agents" --agent-id

# Check status
node paperclip-api/scripts/status.mjs
```

## Configuration

- **API URL:** http://localhost:3100
- **Company ID:** Use `companies.mjs list` to find
- **Auth:** Local trusted (no auth needed for localhost)

## Scripts

### companies.mjs
- list - List all companies
- create - Create new company
- info - Get company details

### agents.mjs
- list - List agents in company
- create - Create new agent
- pause/resume - Toggle agent
- delete - Remove agent

### issues.mjs
- list - List issues/tasks
- create - Create new issue
- assign - Assign to agent
- complete - Mark done

### goals.mjs
- list - List goals
- create - Create goal

### status.mjs
- Full dashboard status

## Integration

This connects our agents (Charlie, etc.) to PaperClip for orchestration. When agents do work, it gets tracked in PaperClip with cost tracking, activity logs, and goal alignment.
