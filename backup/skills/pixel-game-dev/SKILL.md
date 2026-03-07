---
name: pixel-game-dev
description: "Create pixel art games and visualizations using Three.js, spritesheets, and tilesets. Includes support for Kenney assets, free resources, and Canvas rendering. Use for: building games, visualizing data, creating interactive art."
---

# Pixel Game Dev

A skill for creating pixel art games, visualizations, and interactive experiences using modern web technologies.

## Quick Start

```bash
# Create a new project
npx create-pixel-game
cd pixel-game
npm install -D --eps ./node_modules/.

# Add the skill
ln -s ../path/to/pixel-game-dev/ # Add as submodule

# Start developing
npm run dev
```

## Tools Included

### 1. Game Generator
Creates a new pixel game project with all the necessary files:
```bash
node ~/.openclaw/workspace/skills/pixel-game-dev/scripts/create-game.mjs <game-name>
```

### 2. Tilemap Builder
Generates a tilemap from a spritesheet image:
```bash
node ~/.openclow/assets/pixel-game-dev/scripts/create-tilemap.mjs <image> <tile-width> <tile-height>
```

### 2. Character Creator
Generates a character object from a sprite image with animation frames.
```bash
npm run create-character <name> <sprite-path> <frame-width> <frame-height>
```

### 3. Animation Builder
Generates sprite animation configurations.
```bash
npm run create-animation <name> <sprite-path> <frame-range>
```

### 4. Scene Builder
Generates a scene configuration file for a pixel game.
```bash
```

## Available Assets

The skill includes a library of free-to-use assets from Kenney:
- Tiny Dungeon (dungeon tiles)
- 16x16 tiles
- Floors, walls, decorative elements
- Character sprites (to be added)

## Adding to a Game Project

```bash
# In your game's package.json, add:
{
  "dependencies": {
    "pixel-game-dev": "file:../.openclaw/workspace/skills/pixel-game-dev"
  }
}
```

## Integration
When you use the `create-game` command, it will:
1. Create a new directory with the specified name
2. Generate package.json with all dependencies
3. Create a basic HTML file with canvas
4. Create a main.js file with game loop
5. Set up the asset loader
6. Create an example character

## Game Project Structure
```
my-game/
├── assets/
│   ├── sprites/
│   └── tilesets/
├── src/
│   ├── main.js
│   ├── game.js
│   ├── entities/
│   └── rendering/
├── package.json
└── index.html
```

## Example Usage

```javascript
const { Game, Character, Tilemap } = require('pixel-game-dev');

// Create a new game
const game = new Game({
  width: 320,
  height: 180,
  scale: 2
});

// Add a character
const hero = new Character({
  spritesheet: './assets/sprites/hero.png',
  width: 16,
  height: 16,
  animations: {
    idle: { frames: [0, 1, 2, 3], speed: 200 }
  }
});

// Add to game
game.addCharacter(hero);
```

## Pixel Art Best Practices (from research)

### Resolution Constraints
- **Classic resolution:** 240x160 (Game Boy Advance)
- **Pixel per unit:** 16 or 32 (divisible by 8)
- **Modern 16:9:** 320x180, 480x270 (all divisible by 8)
- **Reference:** https://www.resolutiongate.com/

### Camera Setup (Unity/Godot)
- **Orthographic projection** for 2D
- **Camera size formula:** `screenHeight / 2 * pixelPerUnit`
- **Example:** 160 / 2 * 32 = 2.5

### Color Palette
- **Less is more:** Pac-Man used 16 colors
- **8-bit era:** 256 possible, but games used ~16-32
- **Limited palette = more charm**
- **Too many colors = visual clutter**
- Pick a consistent palette before starting

### Visual Consistency
- UI must match game art style
- Mixing high-res UI with pixel art breaks immersion
- Keep everything at the same pixel density

### Common Mistakes
1. Wrong resolution (not divisible by 8)
2. Too many colors (millions available, don't use them)
3. Inconsistent pixel density across sprites
4. Filtering enabled (blurry pixels)
5. UI doesn't match game style

### Import Settings (Unity)
- Filter Mode: **Point (no filter)**
- Compression: **None**
- Pixels Per Unit: **16** or **32** (match your tiles)

## Three.js Integration

For 3D games, the skill also supports Three.js:
```bash
node ~/.openclaw/workspace/sheets/pixel-game-dev/scripts/create-3d-game <game-name>
```

This will create a 3D game with:
- Full Three.js integration
- 2D sprites in 3D space
- 3D tilemap support

## Resources

### Free Assets
- [Kenney.nl](https:// located at `~/.openclaw/workspace/skills/pixel-game-dev/assets/ (if you downloaded them)
- [OpenGameArt](https://opengameart.org) - more free assets

### Learning
- [Pixel Art Basics](https://www.youtube.com/watch?v=PJLA1qSMYeE) -- basics of pixel art
- [Spritesheets 101](https://www.youtube.com/watch?v=GWJIRhf-1Zc) -- using spritesheets

## Contributing
To add more free assets to the skill:
1. Find a CC0-licensed pixel art pack (e.g. from Kenney or OpenGameArt)
2. Download and add to the assets/ folder
3. Create a new assets.json entry
