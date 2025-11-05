#Sono

An auditory discrimination game for early intervention therapy, designed to help toddlers build positive associations with sounds through controlled, predictable matching activities.

*sono* (Latin) - "I sound"

## Overview

Sono is a web-based matching game where children hear sounds and identify corresponding pictures. Originally designed for a sound-sensitive toddler to practice sound identification in a safe, controlled environment with predictable outcomes.

## Therapeutic Goals

- Build positive associations with unexpected sounds
- Practice sound identification in a controlled environment
- Reduce anxiety through mastery and anticipation
- Support auditory processing development
- Provide customizable feedback for different sensory needs

## Features

### Core Gameplay
- Grid-based picture card matching (4, 6, or 9 cards)
- Audio playback with visual indicator
- Configurable success/error feedback
- Optional visual cueing system
- Card removal or cross-out on success

### Accessibility Options
- **Dual Image Modes**: Toggle between graphic illustrations and photographs for children who struggle with abstract representations
- **Configurable Feedback**: Adjust audio and visual feedback intensity
- **Visual Cueing**: Optional gentle animations to guide attention (wiggle, glow, bounce)
- **Volume Controls**: Independent volume for gameplay audio and feedback sounds

### Therapist/Parent Features
- Create and save custom sound sets
- Share sets via passphrase system
- Curated starter sound library
- Progress tracking (planned)
- Difficulty scaling (planned)

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Animation**: GSAP (GreenSock Animation Platform)
- **Audio**: Web Audio API
- **Storage**: LocalStorage + optional cloud sync
- **UI Framework**: Neumorphic design system (adapted from Sign Share)

## Project Structure

```
sono/
├── index.html              # Main application shell
├── app.js                  # Core application logic
├── styles.css              # Neumorphic styling
├── audio.js                # Audio playback and generation
├── cards.js                # Card grid and interaction logic
├── settings.js             # Configuration management
├── localization.js         # Multi-language support
├── toast.js                # Toast notification system
├── assets/
│   ├── sounds/            # Audio files
│   │   ├── graphics/      # Sound effects for UI
│   │   └── content/       # Content sounds (animals, vehicles, etc.)
│   └── images/
│       ├── graphics/      # Illustrated/icon versions
│       └── photos/        # Photographic versions
└── data/
    └── sound_sets.json    # Predefined sound sets
```

## Configuration Options

### Visual Settings
- **Visual Mode**: Graphic illustrations vs. photographs
- **Card Behavior**: Remove cards on success vs. cross out
- **Grid Size**: 4, 6, or 9 cards per game

### Audio Settings
- **Playback Volume**: Main sound volume (0-100%)
- **Feedback Volume**: Success/error sound volume (0-100%)
- **Audio Indicator**: Pulsing speaker icon, waveform, or none

### Cueing Settings
- **Cueing Enabled**: Toggle visual cues on/off
- **Cue Delay**: Time before cue appears (0-5000ms)
- **Cue Intensity**: Subtle, gentle, or obvious
- **Cue Type**: Wiggle, glow, or bounce animation

### Feedback Settings
- **Success Sound**: Two or three smooth higher tones
- **Error Sound**: Two smooth low tones
- **Visual Feedback**: Animations on correct/incorrect selections

## Data Format

### Sound Set Structure
```json
{
  "name": "Common Sounds",
  "description": "Everyday sounds for sound identification",
  "cards": [
    {
      "id": "firetruck",
      "label": "Fire Truck",
      "sound": "firetruck.mp3",
      "imageGraphic": "firetruck_graphic.png",
      "imagePhoto": "firetruck_photo.jpg",
      "category": "vehicles"
    }
  ]
}
```

## Usage

### For Therapists/Parents

1. **Create a New Set**
   - Click "Create New List"
   - Add sounds and corresponding images
   - Configure settings for the child's needs
   - Save and share via passphrase

2. **Retrieve Existing Set**
   - Click "Retrieve List"
   - Enter passphrase
   - Adjust settings if needed
   - Start playing

3. **Customize Settings**
   - Access settings via gear icon
   - Adjust visual and audio preferences
   - Enable/disable cueing based on child's skill level
   - Save configuration

### For Children

1. Look at the picture cards on screen
2. Listen to the sound that plays
3. Touch the picture that matches the sound
4. Celebrate success! 🎉

## Development Roadmap

### Phase 1 - MVP (Current)
- [x] Core architecture adapted from Sign Share
- [ ] Card grid layout (2x3, 2x2, 3x3)
- [ ] Basic audio playback framework
- [ ] Text placeholders for images
- [ ] Procedural success/error tones
- [ ] Settings panel structure
- [ ] Visual cueing system

### Phase 2 - Polish
- [ ] Image upload/management
- [ ] Audio indicator animations
- [ ] Card removal/cross-out animations
- [ ] Enhanced feedback system
- [ ] Responsive design optimization

### Phase 3 - Content
- [ ] Starter sound library (15-20 sounds)
  - Animals (dog, cat, cow, horse)
  - Vehicles (car, truck, train, airplane)
  - Common sounds (doorbell, phone, water, music)
  - Nature (rain, wind, thunder, birds)
- [ ] Multiple pre-made sets by category
- [ ] Image library (both graphic and photo)

### Phase 4 - Advanced Features
- [ ] Progress tracking and analytics
- [ ] Difficulty scaling
- [ ] Multi-round gameplay
- [ ] Export/import functionality
- [ ] PWA for offline use

## Related Projects

This project builds upon the architecture of **Sign Share**, an AAC vocabulary sharing tool for teaching sign language to toddlers. Both projects share:
- Neumorphic UI design system
- Passphrase-based content sharing
- Vocabulary list management
- Settings panel architecture
- GSAP animation framework

## Target Audience

- **Primary**: Toddlers (18-36 months) in Early Intervention
- **Secondary**: Preschoolers with auditory processing needs
- **Users**: ECSE teachers, speech therapists, parents, caregivers

## Design Philosophy

- **Gentle by default**: All feedback and cueing should be supportive, never punitive
- **Highly configurable**: Every child is different; provide maximum flexibility
- **Simple interaction model**: Large touch targets, clear visual hierarchy
- **Predictable patterns**: Consistency builds confidence and reduces anxiety
- **Accessible first**: Support multiple representation modes and sensory preferences

## Contributing

This is a therapeutic tool built for specific Early Intervention needs. If you're working in EI/ECSE and have suggestions or use cases, please open an issue or reach out.

## License

TBD - Intended for therapeutic/educational use

## Credits

Developed by an assistive technology professional working with toddlers in Early Intervention, in collaboration with ECSE colleagues.

Built with the generous support of:
- GSAP animation library
- Web Audio API
- The AAC and Early Intervention communities

---

**Note**: This application is designed as a therapeutic tool to be used under the guidance of qualified professionals. It is not a substitute for comprehensive speech-language therapy or behavioral intervention.
