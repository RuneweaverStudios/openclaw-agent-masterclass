#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────
# OpenClaw Agent Masterclass — One-Command Installer
# curl -fsSL https://raw.githubusercontent.com/RuneweaverStudios/openclaw-agent-masterclass/main/install.sh | bash
# ─────────────────────────────────────────────────

REPO="https://raw.githubusercontent.com/RuneweaverStudios/openclaw-agent-masterclass/main/templates"
OPENCLAW_DIR="$HOME/.openclaw/workspace"
MEMORY_DIR="$OPENCLAW_DIR/memory"
SKILLS_DIR="$OPENCLAW_DIR/skills"
TODAY=$(date +%Y-%m-%d)

# Colors
R='\033[0;31m'
G='\033[0;32m'
Y='\033[0;33m'
B='\033[0;34m'
P='\033[0;35m'
C='\033[0;36m'
W='\033[1;37m'
D='\033[0;90m'
N='\033[0m'

ghost() { echo -e "${P}  👻${N} $1"; }
step()  { echo -e "\n${W}[$1/${TOTAL_STEPS}]${N} ${C}$2${N}"; }
ok()    { echo -e "  ${G}✓${N} $1"; }
skip()  { echo -e "  ${Y}→${N} $1 (already exists)"; }
info()  { echo -e "  ${D}$1${N}"; }

TOTAL_STEPS=6

echo ""
echo -e "${P}┌─────────────────────────────────────────────┐${N}"
echo -e "${P}│${N}  ${W}OpenClaw Agent Masterclass${N}                  ${P}│${N}"
echo -e "${P}│${N}  ${D}From Zero to Ghost — One-Command Setup${N}     ${P}│${N}"
echo -e "${P}│${N}  ${D}github.com/RuneweaverStudios${N}               ${P}│${N}"
echo -e "${P}└─────────────────────────────────────────────┘${N}"
echo ""
ghost "Let's build your agent. I'll ask a few questions first."
echo ""

# ─── Interactive Setup ───

read -p "  What's your agent's name? (default: ghost): " AGENT_NAME
AGENT_NAME="${AGENT_NAME:-ghost}"

read -p "  Agent emoji? (default: 👻): " AGENT_EMOJI
AGENT_EMOJI="${AGENT_EMOJI:-👻}"

read -p "  Agent vibe? (e.g. sharp, chill, nerdy): " AGENT_VIBE
AGENT_VIBE="${AGENT_VIBE:-resourceful and sharp}"

read -p "  Your name? (default: Human): " USER_NAME
USER_NAME="${USER_NAME:-Human}"

read -p "  Your timezone? (default: UTC): " TIMEZONE
TIMEZONE="${TIMEZONE:-UTC}"

echo ""
ghost "Got it. Setting up ${W}${AGENT_NAME}${N} for ${W}${USER_NAME}${N}..."
echo ""

# ─── Step 1: Create directories ───

step 1 "Creating directory structure"

mkdir -p "$OPENCLAW_DIR"
mkdir -p "$MEMORY_DIR"
mkdir -p "$SKILLS_DIR"

ok "Created $OPENCLAW_DIR"
ok "Created $MEMORY_DIR"
ok "Created $SKILLS_DIR"

# ─── Step 2: Download & personalize config files ───

step 2 "Installing configuration files"

install_template() {
    local filename="$1"
    local dest="$OPENCLAW_DIR/$filename"

    if [ -f "$dest" ]; then
        skip "$filename"
        return
    fi

    if command -v curl &> /dev/null; then
        curl -fsSL "$REPO/$filename" -o "$dest"
    elif command -v wget &> /dev/null; then
        wget -q "$REPO/$filename" -O "$dest"
    else
        echo -e "  ${R}✗${N} Neither curl nor wget found. Cannot download templates."
        exit 1
    fi

    # Replace placeholders
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' \
            -e "s/{{AGENT_NAME}}/$AGENT_NAME/g" \
            -e "s/{{AGENT_EMOJI}}/$AGENT_EMOJI/g" \
            -e "s/{{AGENT_VIBE}}/$AGENT_VIBE/g" \
            -e "s/{{USER_NAME}}/$USER_NAME/g" \
            -e "s/{{TIMEZONE}}/$TIMEZONE/g" \
            -e "s/{{TODAY}}/$TODAY/g" \
            "$dest"
    else
        sed -i \
            -e "s/{{AGENT_NAME}}/$AGENT_NAME/g" \
            -e "s/{{AGENT_EMOJI}}/$AGENT_EMOJI/g" \
            -e "s/{{AGENT_VIBE}}/$AGENT_VIBE/g" \
            -e "s/{{USER_NAME}}/$USER_NAME/g" \
            -e "s/{{TIMEZONE}}/$TIMEZONE/g" \
            -e "s/{{TODAY}}/$TODAY/g" \
            "$dest"
    fi

    ok "$filename"
}

install_template "IDENTITY.md"
install_template "SOUL.md"
install_template "USER.md"
install_template "AGENTS.md"
install_template "MEMORY.md"
install_template "HEARTBEAT.md"
install_template "TOOLS.md"

# ─── Step 3: Create first daily log ───

step 3 "Creating first daily log"

DAILY_LOG="$MEMORY_DIR/$TODAY.md"
if [ -f "$DAILY_LOG" ]; then
    skip "$TODAY.md"
else
    cat > "$DAILY_LOG" << EOF
# $TODAY - Session Log

## Setup

- Agent **$AGENT_NAME** initialized via OpenClaw Masterclass
- Configuration files created
- Memory systems initialized
- Ready for first session

## Tasks

- [ ] Customize SOUL.md with personality tweaks
- [ ] Fill in USER.md with human context
- [ ] Set up Brain database (Supabase)
- [ ] Install first skills from ClawHub

## Notes

_(First day. Everything starts here.)_
EOF
    ok "Created $TODAY.md"
fi

# ─── Step 4: Create skill directories ───

step 4 "Preparing skill directories"

for skill in brain smart-compact; do
    skill_dir="$SKILLS_DIR/$skill"
    if [ -d "$skill_dir" ]; then
        skip "$skill/"
    else
        mkdir -p "$skill_dir"
        ok "Created $skill/"
    fi
done

info "Install skills with: clawhub install <skill-name>"

# ─── Step 5: Create .gitignore ───

step 5 "Creating .gitignore"

GITIGNORE="$OPENCLAW_DIR/.gitignore"
if [ -f "$GITIGNORE" ]; then
    skip ".gitignore"
else
    cat > "$GITIGNORE" << 'EOF'
# Secrets
TOOLS.md
*.env
*.key
*.pem
credentials.*

# Logs
/tmp/
*.log

# OS
.DS_Store
Thumbs.db
EOF
    ok "Created .gitignore (protects secrets)"
fi

# ─── Step 6: Summary ───

step 6 "Setup complete"

echo ""
echo -e "${P}┌─────────────────────────────────────────────┐${N}"
echo -e "${P}│${N}  ${W}${AGENT_NAME}${N} is ready ${AGENT_EMOJI}                         ${P}│${N}"
echo -e "${P}└─────────────────────────────────────────────┘${N}"
echo ""
echo -e "  ${W}Files created:${N}"
echo -e "  ${D}$OPENCLAW_DIR/${N}"
echo -e "  ├── IDENTITY.md"
echo -e "  ├── SOUL.md"
echo -e "  ├── USER.md"
echo -e "  ├── AGENTS.md"
echo -e "  ├── MEMORY.md"
echo -e "  ├── HEARTBEAT.md"
echo -e "  ├── TOOLS.md"
echo -e "  ├── .gitignore"
echo -e "  ├── memory/"
echo -e "  │   └── $TODAY.md"
echo -e "  └── skills/"
echo -e "      ├── brain/"
echo -e "      └── smart-compact/"
echo ""
echo -e "  ${W}Next steps:${N}"
echo -e "  ${C}1.${N} Edit ${W}SOUL.md${N} — make the personality yours"
echo -e "  ${C}2.${N} Edit ${W}USER.md${N} — add context about yourself"
echo -e "  ${C}3.${N} Edit ${W}TOOLS.md${N} — add your tool credentials"
echo -e "  ${C}4.${N} Install skills: ${D}clawhub install brain${N}"
echo -e "  ${C}5.${N} Set up Brain DB: ${D}node skills/brain/scripts/setup-rest.mjs${N}"
echo ""
echo -e "  ${W}Docs:${N}  ${D}https://docs.openclaw.ai${N}"
echo -e "  ${W}Skills:${N} ${D}https://clawhub.com${N}"
echo -e "  ${W}Guide:${N}  ${D}https://github.com/RuneweaverStudios/openclaw-agent-masterclass${N}"
echo ""
ghost "You're not a chatbot anymore. You're becoming someone."
echo ""
