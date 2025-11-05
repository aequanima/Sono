# Assets Directory

This directory contains audio and image assets for the Sono sound matching game.

## Directory Structure

```
assets/
├── sounds/           # Audio files for each subject (MP3 format)
│   ├── dog.mp3
│   ├── cat.mp3
│   └── ...
├── images/
│   ├── graphic/      # Illustrated/icon versions
│   │   ├── dog.png
│   │   ├── cat.png
│   │   └── ...
│   └── photos/       # Photographic versions
│       ├── dog.png
│       ├── cat.png
│       └── ...
```

## Adding New Assets

### Sounds
- Format: MP3
- Naming conventions:
  - Single sound: `{subject}.mp3` (e.g., `dog.mp3`, `firetruck.mp3`)
  - Multiple sounds: `{subject}.mp3`, `{subject}0.mp3`, `{subject}1.mp3`, etc.
- The subject name must match entries in `subjects.json`
- **Multiple sound variants**: The system will automatically detect and randomly select from available variants (0-9)
  - Example for "dog": `dog.mp3`, `dog0.mp3`, `dog1.mp3`, `dog2.mp3`
  - The game will randomly play one of the available files each time
  - You can have any combination (e.g., just `dog.mp3` and `dog0.mp3`)
- At least one file must exist for each subject (either `{subject}.mp3` or any numbered variant)

### Images
- Format: PNG (recommended) or JPG
- Naming conventions:
  - Single image: `{subject}.png` (e.g., `dog.png`, `firetruck.png`)
  - Multiple images: `{subject}.png`, `{subject}0.png`, `{subject}1.png`, etc.
- Two versions: graphic (illustrations) and photos (real photos)
- Recommended size: 512x512px or larger, square aspect ratio
- **Multiple image variants**: The system will randomly select ONE variant per subject at game start
  - Example for "dog" graphics: `dog.png`, `dog0.png`, `dog1.png` (different breeds)
  - Example for "dog" photos: `dog.png`, `dog0.png`, `dog1.png` (different photos)
  - **Important**: Once selected, the SAME image is used for that subject throughout the entire game
  - This prevents confusion - child never sees multiple representations of same concept simultaneously
  - New random selection occurs when a new game starts

## Current Subjects

See `subjects.json` in the root directory for the full list of supported subjects.

## Placeholder Behavior

If an asset is missing:
- **Sound**: Error will be logged, toast notification shown
- **Image**: Card will display text label instead of image
EOF < /dev/null