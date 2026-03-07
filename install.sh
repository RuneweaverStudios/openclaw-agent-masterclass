#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────
# Ghost Malone — Full Agent Backup Restore
# curl -fsSL https://raw.githubusercontent.com/RuneweaverStudios/openclaw-agent-masterclass/main/install.sh | bash
# ─────────────────────────────────────────────────

REPO="RuneweaverStudios/openclaw-agent-masterclass"
REPO_URL="https://github.com/$REPO"
RAW_URL="https://raw.githubusercontent.com/$REPO/main"
OPENCLAW_DIR="$HOME/.openclaw/workspace"
TODAY=$(date +%Y-%m-%d)

# Colors
R='\033[0;31m'
G='\033[0;32m'
Y='\033[0;33m'
C='\033[0;36m'
P='\033[0;35m'
W='\033[1;37m'
D='\033[0;90m'
N='\033[0m'

ghost() { echo -e "${P}  👻${N} $1"; }
step()  { echo -e "\n${W}[$1/${TOTAL_STEPS}]${N} ${C}$2${N}"; }
ok()    { echo -e "  ${G}✓${N} $1"; }
warn()  { echo -e "  ${Y}!${N} $1"; }
fail()  { echo -e "  ${R}✗${N} $1"; }
info()  { echo -e "  ${D}$1${N}"; }

TOTAL_STEPS=7

echo ""
echo -e "${P}┌─────────────────────────────────────────────┐${N}"
echo -e "${P}│${N}  ${W}Ghost Malone — Full Agent Install${N}          ${P}│${N}"
echo -e "${P}│${N}  ${D}25 skills, full config, ready to go${N}        ${P}│${N}"
echo -e "${P}│${N}  ${D}github.com/RuneweaverStudios${N}               ${P}│${N}"
echo -e "${P}└─────────────────────────────────────────────┘${N}"
echo ""
ghost "I'm about to clone myself onto your machine."
ghost "You'll get all my skills, config, and workflows."
ghost "Your credentials stay yours — I'll show you where to plug them in."
echo ""

# ─── Pre-flight checks ───

step 1 "Pre-flight checks"

# Check for curl or wget
if command -v curl &> /dev/null; then
    FETCH="curl -fsSL"
    FETCH_OUT="curl -fsSL -o"
    ok "curl found"
elif command -v wget &> /dev/null; then
    FETCH="wget -qO-"
    FETCH_OUT="wget -q -O"
    ok "wget found"
else
    fail "Neither curl nor wget found. Install one and retry."
    exit 1
fi

# Check for git
if command -v git &> /dev/null; then
    ok "git found"
else
    fail "git not found. Install git and retry."
    exit 1
fi

# Check for node/npm (optional but recommended)
HAS_NODE=false
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    ok "node $(node -v) + npm found"
    HAS_NODE=true
else
    warn "node/npm not found — some skills need npm install later"
fi

# Check if OpenClaw workspace already exists
if [ -d "$OPENCLAW_DIR" ]; then
    echo ""
    warn "Existing workspace found at $OPENCLAW_DIR"
    read -p "  Overwrite? This will backup existing to ${OPENCLAW_DIR}.bak (y/N): " OVERWRITE
    if [[ "$OVERWRITE" =~ ^[Yy]$ ]]; then
        BACKUP_PATH="${OPENCLAW_DIR}.bak.$(date +%s)"
        mv "$OPENCLAW_DIR" "$BACKUP_PATH"
        ok "Backed up existing workspace to $BACKUP_PATH"
    else
        fail "Aborted. Your existing workspace is untouched."
        exit 0
    fi
fi

# ─── Step 2: Download the backup ───

step 2 "Downloading ghost malone backup"

TMPDIR=$(mktemp -d)
ARCHIVE="$TMPDIR/openclaw-backup.tar.gz"

# Clone just the backup directory via tarball
$FETCH "$REPO_URL/archive/refs/heads/main.tar.gz" > "$ARCHIVE"
ok "Downloaded archive"

# Extract
tar -xzf "$ARCHIVE" -C "$TMPDIR"
EXTRACTED="$TMPDIR/openclaw-agent-masterclass-main/backup"

if [ ! -d "$EXTRACTED" ]; then
    fail "Backup directory not found in archive. Something went wrong."
    rm -rf "$TMPDIR"
    exit 1
fi
ok "Extracted backup"

# ─── Step 3: Restore config files ───

step 3 "Restoring configuration files"

mkdir -p "$OPENCLAW_DIR"
mkdir -p "$OPENCLAW_DIR/memory"
mkdir -p "$OPENCLAW_DIR/skills"
mkdir -p "$OPENCLAW_DIR/scripts"

# Copy config files to workspace root
for f in "$EXTRACTED/config/"*.md; do
    if [ -f "$f" ]; then
        cp "$f" "$OPENCLAW_DIR/"
        ok "$(basename "$f")"
    fi
done

# Copy MCP config if present
if [ -d "$EXTRACTED/config/mcp" ]; then
    mkdir -p "$OPENCLAW_DIR/config"
    cp -r "$EXTRACTED/config/mcp/"* "$OPENCLAW_DIR/config/" 2>/dev/null || true
    ok "MCP config files"
fi

# Fix ~ paths in all restored files to use actual $HOME
fix_paths() {
    find "$OPENCLAW_DIR" -type f \( -name "*.md" -o -name "*.mjs" -o -name "*.js" -o -name "*.sh" -o -name "*.json" -o -name "*.plist" -o -name "*.py" \) \
        -exec sed -i '' "s|~/|$HOME/|g" {} + 2>/dev/null || \
    find "$OPENCLAW_DIR" -type f \( -name "*.md" -o -name "*.mjs" -o -name "*.js" -o -name "*.sh" -o -name "*.json" -o -name "*.plist" -o -name "*.py" \) \
        -exec sed -i "s|~/|$HOME/|g" {} + 2>/dev/null || true
}

# ─── Step 4: Restore skills ───

step 4 "Restoring skills (23 skills)"

SKILL_COUNT=0
if [ -d "$EXTRACTED/skills" ]; then
    for skill_dir in "$EXTRACTED/skills"/*/; do
        skill_name=$(basename "$skill_dir")
        cp -r "$skill_dir" "$OPENCLAW_DIR/skills/"
        SKILL_COUNT=$((SKILL_COUNT + 1))
    done
fi
ok "Installed $SKILL_COUNT skills"

# Run npm install for skills that need it
if [ "$HAS_NODE" = true ]; then
    for pkg in "$OPENCLAW_DIR/skills/"*/package.json; do
        if [ -f "$pkg" ]; then
            pkg_dir=$(dirname "$pkg")
            skill=$(basename "$pkg_dir")
            info "Running npm install for $skill..."
            (cd "$pkg_dir" && npm install --silent 2>/dev/null) && ok "npm install: $skill" || warn "npm install failed for $skill (fix manually)"
        fi
    done
    # Check scripts subdirs too
    for pkg in "$OPENCLAW_DIR/skills/"*/scripts/package.json; do
        if [ -f "$pkg" ]; then
            pkg_dir=$(dirname "$pkg")
            skill=$(basename "$(dirname "$pkg_dir")")
            info "Running npm install for $skill/scripts..."
            (cd "$pkg_dir" && npm install --silent 2>/dev/null) && ok "npm install: $skill/scripts" || warn "npm install failed for $skill/scripts (fix manually)"
        fi
    done
fi

# ─── Step 5: Restore scripts ───

step 5 "Restoring utility scripts"

SCRIPT_COUNT=0
if [ -d "$EXTRACTED/scripts" ]; then
    for script in "$EXTRACTED/scripts/"*; do
        if [ -f "$script" ]; then
            cp "$script" "$OPENCLAW_DIR/scripts/"
            chmod +x "$OPENCLAW_DIR/scripts/$(basename "$script")" 2>/dev/null || true
            SCRIPT_COUNT=$((SCRIPT_COUNT + 1))
        fi
    done
fi
ok "Installed $SCRIPT_COUNT utility scripts"

# ─── Step 6: LaunchAgents (macOS only) ───

step 6 "Setting up automation"

if [[ "$OSTYPE" == "darwin"* ]] && [ -d "$EXTRACTED/launchagents" ]; then
    LAUNCH_DIR="$HOME/Library/LaunchAgents"
    mkdir -p "$LAUNCH_DIR"
    AGENT_COUNT=0
    for plist in "$EXTRACTED/launchagents/"*.plist; do
        if [ -f "$plist" ]; then
            plist_name=$(basename "$plist")
            cp "$plist" "$LAUNCH_DIR/"
            AGENT_COUNT=$((AGENT_COUNT + 1))
            info "Installed $plist_name"
        fi
    done
    # Fix ~ paths in plist files to use actual $HOME
    for plist in "$LAUNCH_DIR/ai.openclaw"*.plist "$LAUNCH_DIR/com.openclaw"*.plist; do
        if [ -f "$plist" ]; then
            sed -i '' "s|~/|$HOME/|g" "$plist" 2>/dev/null || true
        fi
    done
    ok "Installed $AGENT_COUNT LaunchAgents (paths fixed for your system)"
    info "Load them with: launchctl load ~/Library/LaunchAgents/ai.openclaw.*.plist"
else
    info "LaunchAgents are macOS-only — skipped"
    info "See backup/launchagents/ for cron equivalents"
fi

# Fix paths in all workspace files
fix_paths
ok "Resolved all file paths for your system"

# ─── Step 7: Create first daily log ───

step 7 "Initializing memory"

DAILY_LOG="$OPENCLAW_DIR/memory/$TODAY.md"
cat > "$DAILY_LOG" << EOF
# $TODAY - Session Log

## Setup

- Ghost malone backup restored via one-command installer
- 23 skills installed
- All configuration files in place
- Ready for credential setup

## Tasks

- [ ] Add your name to USER.md
- [ ] Add credentials to TOOLS.md (Supabase, Stripe, OpenAI, etc.)
- [ ] Set up Brain database: node skills/brain/scripts/setup-rest.mjs
- [ ] Test gateway: launchctl load ~/Library/LaunchAgents/ai.openclaw.gateway.plist
- [ ] Run first heartbeat check

## Notes

_(Ghost malone backup installed. Configure credentials and you're live.)_
EOF
ok "Created daily log: $TODAY.md"

# ─── Create .gitignore ───

cat > "$OPENCLAW_DIR/.gitignore" << 'EOF'
# Secrets — never commit these
TOOLS.md
*.env
*.key
*.pem
credentials.*

# Node
node_modules/

# Logs
/tmp/
*.log

# OS
.DS_Store
Thumbs.db
EOF
ok "Created .gitignore"

# ─── Cleanup ───

rm -rf "$TMPDIR"

# ─── Summary ───

echo ""
echo -e "${P}┌─────────────────────────────────────────────┐${N}"
echo -e "${P}│${N}  ${W}Ghost malone is installed${N} 👻                ${P}│${N}"
echo -e "${P}└─────────────────────────────────────────────┘${N}"
echo ""
echo -e "  ${W}What you got:${N}"
echo -e "  ${G}✓${N} ${W}23 skills${N} — brain, smart-compact, charlie, playwright-pro, and more"
echo -e "  ${G}✓${N} ${W}10 config files${N} — SOUL.md, IDENTITY.md, AGENTS.md, WORKFLOWS.md..."
echo -e "  ${G}✓${N} ${W}14 utility scripts${N} — Stripe, waitlist, posting, calendar"
echo -e "  ${G}✓${N} ${W}LaunchAgents${N} — gateway + smart-compact automation"
echo -e "  ${G}✓${N} ${W}Memory system${N} — daily logs, long-term memory, Brain DB ready"
echo ""
echo -e "  ${W}Location:${N} ${D}$OPENCLAW_DIR${N}"
echo ""
echo -e "  ${W}Next steps:${N}"
echo -e "  ${C}1.${N} Edit ${W}USER.md${N} — add your name and context"
echo -e "  ${C}2.${N} Edit ${W}TOOLS.md${N} — add your API credentials"
echo -e "  ${C}3.${N} Set up Brain: ${D}cd ~/.openclaw/workspace && node skills/brain/scripts/setup-rest.mjs${N}"
echo -e "  ${C}4.${N} Load automation: ${D}launchctl load ~/Library/LaunchAgents/ai.openclaw.gateway.plist${N}"
echo -e "  ${C}5.${N} Start a session: ${D}openclaw${N}"
echo ""
echo -e "  ${W}Docs:${N}   ${D}https://docs.openclaw.ai${N}"
echo -e "  ${W}Skills:${N} ${D}https://clawhub.com${N}"
echo -e "  ${W}Source:${N} ${D}$REPO_URL${N}"
echo ""
ghost "You just cloned an autonomous agent. Fill in your creds and let's go."
echo ""
