# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Atomic Chess Pro is a modular chess game with support for multiple chess variants. It uses a dependency injection architecture allowing easy addition of new chess variants without modifying existing code. The game supports both local two-player mode and online mode via Firebase.

## Commands

### Development
```bash
# Start local development server
npm run dev
# Alternative
npm run serve

# Deploy to Firebase
firebase deploy --only hosting

# Serve locally with Firebase
firebase serve --only hosting
```

### Architecture

The codebase follows a modular architecture with these key components:

#### Core Components (`public/js/core/`)
- **Game.js**: Orchestrates game flow, manages turns, timer, and callbacks
- **Board.js**: Chess board utilities and piece manipulation functions
- **Timer.js**: Game timer management with start/stop/pause/resume functionality

#### Variants (`public/js/variants/`)
- **BaseVariant.js**: Abstract base class defining the common interface for all chess variants
- **AtomicVariant.js**: Implements atomic chess rules (3×3 explosions, pions immunisés)
- **PortalVariant.js**: Implements portal chess with lateral wrapping
- **KingOfTheHillVariant.js**: King of the Hill variant rules
- **StandardVariant.js**: Standard chess rules

#### UI Components (`public/js/ui/`)
- **Renderer.js**: Handles board rendering, game display, and animations
- **MenuUI.js**: Main menu interface for game mode selection

#### Network (`public/js/network/`)
- **FirebaseSync.js**: Online multiplayer synchronization via Firebase

### Adding New Variants

To add a new chess variant:

1. Create a class extending `BaseVariant.js` in `public/js/variants/`
2. Override necessary methods from BaseVariant
3. Update `main.js` to include and instantiate your variant
4. Add UI selection option in `MenuUI.js` if needed

Key methods to override in variants:
- `getInitialBoard()`: Initial board setup
- `getSimulatedBoard()`: Board state after a move (with variant-specific rules)
- `applyMove()`: Apply move with variant-specific logic
- `checkGameOver()`: Variant-specific win conditions

### Firebase Configuration

The project uses Firebase for online multiplayer:
- Firestore for game state synchronization
- Firebase Authentication for user management
- Firebase Hosting for deployment

Configuration is in `firebase.json` with `public` directory as the hosting source.

### UI Styling

The project uses Tailwind CSS for styling. Main styling is inline in `index.html`. Board colors:
- Light squares: bg-[#eeeed2]
- Dark squares: bg-[#769656]

### Architecture Pattern

The codebase uses dependency injection where Game accepts a Variant object, enabling flexible variant swapping without modifying core game logic. This pattern isolates variant rules while maintaining shared game mechanics.

### Variant Implementation Examples

- **AtomicVariant**: Exploding captures that destroy adjacent 3×3 pieces (pions immunisés)
- **PortalVariant**: Lateral wrapping for bishops, rooks, queens, and knights
- **KingOfTheHillVariant**: Win by moving king to center squares (d4, e4, d5, e5)
