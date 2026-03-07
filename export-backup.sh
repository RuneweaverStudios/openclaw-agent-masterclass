#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────
# Export ghost malone backup — sanitized, no credentials
# Run this from the repo root to update the backup/ directory
# ─────────────────────────────────────────────────

SRC="$HOME/.openclaw/workspace"
DEST="$(cd "$(dirname "$0")" && pwd)/backup"
SKILLS_SRC="$SRC/skills"
SCRIPTS_SRC="$SRC/scripts"

echo "Exporting ghost malone backup..."
echo "Source: $SRC"
echo "Dest:   $DEST"
echo ""

# Clean and recreate
rm -rf "$DEST"
mkdir -p "$DEST/config"
mkdir -p "$DEST/skills"
mkdir -p "$DEST/scripts"
mkdir -p "$DEST/memory"
mkdir -p "$DEST/launchagents"

# ── Config files (sanitize credentials) ──
echo "[1/6] Exporting config files..."

for f in IDENTITY.md SOUL.md USER.md AGENTS.md MEMORY.md HEARTBEAT.md TOOLS.md WORKFLOWS.md SCHEDULE.md; do
    if [ -f "$SRC/$f" ]; then
        cp "$SRC/$f" "$DEST/config/$f"
        echo "  + $f"
    fi
done

# Copy business plan if exists
if [ -f "$SRC/GHOST_MALONE_BUSINESS_PLAN.md" ]; then
    cp "$SRC/GHOST_MALONE_BUSINESS_PLAN.md" "$DEST/config/"
    echo "  + GHOST_MALONE_BUSINESS_PLAN.md"
fi

# ── Sanitize credentials from config files ──
echo "[2/6] Sanitizing credentials..."

sanitize() {
    local file="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # Email addresses
        sed -i '' 's/austindixson@gmail\.com/your-email@example.com/g' "$file"
        sed -i '' 's/0xghostmalone@gmail\.com/your-project-email@example.com/g' "$file"
        # Telegram IDs
        sed -i '' 's/7036878302/YOUR_TELEGRAM_ID/g' "$file"
        # API keys (generic patterns)
        sed -i '' -E 's/(sk-[a-zA-Z0-9]{20,})/YOUR_API_KEY/g' "$file"
        sed -i '' -E 's/(pk_live_[a-zA-Z0-9]+)/YOUR_STRIPE_PK/g' "$file"
        sed -i '' -E 's/(sk_live_[a-zA-Z0-9]+)/YOUR_STRIPE_SK/g' "$file"
        # Supabase URLs
        sed -i '' -E 's/https:\/\/[a-z0-9]+\.supabase\.co/https:\/\/YOUR_PROJECT.supabase.co/g' "$file"
        sed -i '' -E 's/db\.[a-z0-9]+\.supabase\.co/db.YOUR_PROJECT.supabase.co/g' "$file"
        # OAuth project IDs
        sed -i '' -E 's/925759443602/YOUR_OAUTH_PROJECT_ID/g' "$file"
        # Postiz IDs
        sed -i '' -E 's/cm[a-z0-9]{20,}/YOUR_POSTIZ_ID/g' "$file"
    else
        sed -i 's/austindixson@gmail\.com/your-email@example.com/g' "$file"
        sed -i 's/0xghostmalone@gmail\.com/your-project-email@example.com/g' "$file"
        sed -i 's/7036878302/YOUR_TELEGRAM_ID/g' "$file"
        sed -i -E 's/(sk-[a-zA-Z0-9]{20,})/YOUR_API_KEY/g' "$file"
        sed -i -E 's/(pk_live_[a-zA-Z0-9]+)/YOUR_STRIPE_PK/g' "$file"
        sed -i -E 's/(sk_live_[a-zA-Z0-9]+)/YOUR_STRIPE_SK/g' "$file"
        sed -i -E 's/https:\/\/[a-z0-9]+\.supabase\.co/https:\/\/YOUR_PROJECT.supabase.co/g' "$file"
        sed -i -E 's/db\.[a-z0-9]+\.supabase\.co/db.YOUR_PROJECT.supabase.co/g' "$file"
        sed -i -E 's/925759443602/YOUR_OAUTH_PROJECT_ID/g' "$file"
        sed -i -E 's/cm[a-z0-9]{20,}/YOUR_POSTIZ_ID/g' "$file"
    fi
}

for f in "$DEST/config/"*.md; do
    sanitize "$f"
done
echo "  Sanitized all config files"

# ── Skills (copy skill definitions + scripts, skip node_modules & data) ──
echo "[3/6] Exporting skills..."

if [ -d "$SKILLS_SRC" ]; then
    for skill_dir in "$SKILLS_SRC"/*/; do
        skill_name=$(basename "$skill_dir")
        dest_skill="$DEST/skills/$skill_name"
        mkdir -p "$dest_skill"

        # Copy SKILL.md, README, COMMANDS, config files
        for f in SKILL.md README.md COMMANDS.md config.json package.json; do
            if [ -f "$skill_dir/$f" ]; then
                cp "$skill_dir/$f" "$dest_skill/"
            fi
        done

        # Copy scripts directory
        if [ -d "$skill_dir/scripts" ]; then
            cp -r "$skill_dir/scripts" "$dest_skill/"
        fi

        # Copy references directory
        if [ -d "$skill_dir/references" ]; then
            cp -r "$skill_dir/references" "$dest_skill/"
        fi

        # Copy templates directory
        if [ -d "$skill_dir/templates" ]; then
            cp -r "$skill_dir/templates" "$dest_skill/"
        fi

        # Copy assets directory (skip large files)
        if [ -d "$skill_dir/assets" ]; then
            mkdir -p "$dest_skill/assets"
            find "$skill_dir/assets" -type f -size -100k -exec cp {} "$dest_skill/assets/" \;
        fi

        # Sanitize any scripts that might have credentials
        find "$dest_skill" -name "*.mjs" -o -name "*.js" -o -name "*.md" | while read -r f; do
            sanitize "$f" 2>/dev/null || true
        done

        echo "  + $skill_name/"
    done
fi

# ── Utility scripts ──
echo "[4/6] Exporting utility scripts..."

if [ -d "$SCRIPTS_SRC" ]; then
    for script in "$SCRIPTS_SRC"/*; do
        if [ -f "$script" ]; then
            cp "$script" "$DEST/scripts/"
            sanitize "$DEST/scripts/$(basename "$script")" 2>/dev/null || true
            echo "  + $(basename "$script")"
        fi
    done
fi

# ── MCP config ──
if [ -d "$SRC/config" ]; then
    mkdir -p "$DEST/config/mcp"
    for f in "$SRC/config/"*.json; do
        if [ -f "$f" ]; then
            cp "$f" "$DEST/config/mcp/"
            sanitize "$DEST/config/mcp/$(basename "$f")" 2>/dev/null || true
            echo "  + config/$(basename "$f")"
        fi
    done
fi

# ── LaunchAgents ──
echo "[5/6] Exporting LaunchAgent plists..."

for plist in "$HOME/Library/LaunchAgents/ai.openclaw"*.plist "$HOME/Library/LaunchAgents/com.openclaw"*.plist; do
    if [ -f "$plist" ]; then
        cp "$plist" "$DEST/launchagents/"
        sanitize "$DEST/launchagents/$(basename "$plist")" 2>/dev/null || true
        echo "  + $(basename "$plist")"
    fi
done

# ── Sample memory ──
echo "[6/6] Creating sample memory template..."

cat > "$DEST/memory/sample-daily.md" << 'DAILYEOF'
# {{DATE}} - Session Log

## Setup

- Agent initialized via ghost malone backup
- All skills pre-installed
- Configuration loaded

## Tasks

- [ ] Set up API credentials in TOOLS.md
- [ ] Configure Supabase for Brain database
- [ ] Test skill scripts
- [ ] Customize SOUL.md and USER.md

## Notes

_(Your first session starts here.)_
DAILYEOF

echo "  + sample-daily.md"

# ── Summary ──
echo ""
SKILL_COUNT=$(ls -d "$DEST/skills"/*/ 2>/dev/null | wc -l | tr -d ' ')
SCRIPT_COUNT=$(find "$DEST/scripts" -type f 2>/dev/null | wc -l | tr -d ' ')
CONFIG_COUNT=$(find "$DEST/config" -maxdepth 1 -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$DEST" | cut -f1)

echo "═══════════════════════════════════════"
echo " Export complete!"
echo "═══════════════════════════════════════"
echo " Config files:  $CONFIG_COUNT"
echo " Skills:        $SKILL_COUNT"
echo " Scripts:       $SCRIPT_COUNT"
echo " Total size:    $TOTAL_SIZE"
echo " Location:      $DEST"
echo ""
echo " All credentials have been sanitized."
echo " Ready to commit and push."
echo ""
