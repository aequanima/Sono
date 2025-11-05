# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sono** is an auditory discrimination game designed for Early Intervention therapy with toddlers. The application helps children build positive associations with sounds through controlled matching activities. The name *sono* is Latin for "I sound."

This is a web-based therapeutic tool built with vanilla JavaScript, GSAP animations, and Web Audio API, with no build step required.

## Architecture

### Current Implementation
- **app.js**: Core application logic for managing subject sets and passphrase system
- **audio.js**: Web Audio API manager for sound playback and procedural tones
- **cards.js**: Card grid game logic with matching mechanics
- **settings.js**: Settings manager for game configuration
- **index.html**: Application shell with three screens (start, entry, game)
- **localization.js**: Multi-language support system (29 languages)
- **toast.js**: Toast notification system using GSAP
- **styles.css**: Neumorphic design system with card game styles
- **subjects.json**: List of 40 subjects (animals, vehicles, household sounds)

### Current Functionality
1. **Passphrase-based sharing**: Encodes subject lists using BigInt arithmetic (base-2048) - inherited from Sign Share
2. **Subject selection**: Autocomplete search from subjects.json
3. **Card matching game**: Grid-based sound-to-image matching
4. **Audio playback**: Web Audio API with procedural success/error tones
5. **Multi-language UI**: 29 language translations
6. **Neumorphic design**: Soft UI with shadows and depth
7. **Configurable settings**: Grid size, visual mode, volumes, cueing, feedback

### File Organization
```
sono/
├── index.html              # Main application shell
├── app.js                  # Core app logic, passphrase system
├── audio.js                # Audio manager (Web Audio API)
├── cards.js                # Card game mechanics
├── settings.js             # Settings management
├── localization.js         # Multi-language support
├── toast.js                # Toast notifications
├── styles.css              # Neumorphic styling + game UI
├── subjects.json           # Subject vocabulary (40 items)
├── assets/
│   ├── sounds/            # Audio files (*.mp3)
│   └── images/
│       ├── graphic/       # Illustrated versions (*.png)
│       └── photos/        # Photographic versions (*.png)
└── legacy files:
    ├── words.json         # (Legacy from Sign Share)
    └── spreadthesign_words.json  # (Legacy from Sign Share)
```

## Development Commands

**No build system**: This is a static site with no package.json. Development is done by:
- Opening index.html directly in a browser, OR
- Running a local server: `python -m http.server 8000` or `npx http-server`

**No tests**: No testing framework is currently configured.

**No linting**: No ESLint or other linting tools configured.

## Key Technical Patterns

### Passphrase Encoding System
- Uses BigInt to encode arrays of vocabulary indices into memorable word sequences
- Base-2048 encoding for word indices → Base-270 for passphrase words
- Supports URL parameter (`?passphrase=`) and path-based retrieval (`/signs/passphrase`)
- Can be decoded to reconstruct full word lists

### Screen Navigation
- Single-page app with screen-based views using `showScreen(screenId)`
- Screens: `start-screen`, `entry-screen`, `list-view-screen`
- Managed via `.active` class with opacity transitions

### Localization System
- Function `t(key)` retrieves translated strings
- RTL support for Arabic, Farsi, Urdu, Hebrew
- Stores language preference in localStorage
- Updates all `[data-i18n]`, `[data-i18n-title]`, `[data-i18n-aria]` attributes

### GSAP Animation Library
- Loaded from CDN (v3.12.5): gsap.min.js, Flip.min.js
- Used for: autocomplete animations, word addition/removal, modal transitions, toast notifications
- Look for `gsap.to()`, `gsap.fromTo()`, `gsap.set()` patterns

## Important Constraints

1. **No Framework**: Pure vanilla JavaScript, no React/Vue/etc.

2. **External Dependencies**:
   - GSAP from CDN for animations (v3.12.5)
   - Web Audio API for sound playback (built-in browser API)

3. **Accessibility Features**:
   - High-contrast mode toggle (vision-btn)
   - Multi-language support (29 languages)
   - Configurable visual cueing for attention support
   - Adjustable volumes for sounds and feedback

4. **Data Storage**: LocalStorage for:
   - Language preference
   - High-contrast mode
   - Game settings (sono-settings key)

5. **Asset Requirements**: Application requires audio and image files in `assets/` directory to function properly

## Design Philosophy (From README)

- **Gentle by default**: Supportive, never punitive feedback
- **Highly configurable**: Maximum flexibility for different children
- **Simple interaction**: Large touch targets, clear hierarchy
- **Predictable patterns**: Consistency builds confidence
- **Accessible first**: Multiple representation modes

## Related Context

This project is adapted from **Sign Share**, an AAC vocabulary sharing tool. Inherited features:
- Neumorphic UI design system
- Passphrase-based content sharing (BigInt encoding)
- Vocabulary list management with autocomplete
- Multi-language localization system
- GSAP animation framework
- Toast notification system

## Game Flow

1. **Start Screen**: User creates new set or retrieves via passphrase
2. **Entry Screen**: User builds subject list (autocomplete from subjects.json)
3. **Save**: Generates shareable passphrase
4. **Game Screen**: Card grid matching game
   - Random sound plays from selected subjects
   - Audio indicator shows when sound is playing
   - Child taps matching card
   - Correct: success tone, card removed/crossed out, next sound
   - Incorrect: error tone, card shakes
   - Optional visual cueing after delay
   - Game complete when all cards removed

## Adding New Subjects

1. Add subject name to `subjects.json`
2. Add audio file(s): 
   - Single variant: `assets/sounds/{subject}.mp3`
   - Multiple variants: `{subject}.mp3`, `{subject}0.mp3`, `{subject}1.mp3`, etc. (up to 9)
   - System will randomly select from available variants each time
3. Add graphic: `assets/images/graphic/{subject}.png`
4. Add photo: `assets/images/photos/{subject}.png`
5. (Optional) Add translations to localization.js if subject needs translation

### Multiple Sound Variants

The audio system supports multiple sound files per subject for variety:
- Example: `dog.mp3`, `dog0.mp3`, `dog1.mp3`, `dog2.mp3`
- System checks for up to 10 variants (base + 0-9)
- Randomly selects an available file **each time** the subject is played
- Uses HEAD requests to efficiently detect available files
- Fallback: If no files found, error is thrown and logged

### Multiple Image Variants

The image system supports multiple images per subject with consistent selection:
- Example: `dog.png`, `dog0.png`, `dog1.png` (different breeds/photos)
- System checks for up to 10 variants (base + 0-9) per visual mode
- Randomly selects ONE variant per subject **at game initialization**
- **Important**: Same image is used throughout entire game session for that subject
- Prevents confusion: child never sees multiple representations of same concept simultaneously
- New random selection occurs when starting a new game
- Selection happens during `CardGame.init()` via `selectImageVariants()` method

## Development Notes

- Web Audio API requires user interaction before playback (browser autoplay policy)
- Audio context initialized on first interaction in `audio.js`
- Passphrase system uses base-2048 encoding (max 2048 subjects in subjects.json)
- Settings persist in localStorage under `sono-settings` key
- Legacy files (words.json, spreadthesign_words.json) can be removed eventually
