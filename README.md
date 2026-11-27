
# LyricLens AI

> Don't just listen to music. Become the music.

An open-source, local-first creative music studio combining artificial intelligence, computer vision, touchless interaction, music visualization, karaoke, audio remixing, and personalized artwork.

## Project Status

Under active development.

The current implementation includes local music playback, authorized PC audio capture, webcam integration, AI hand tracking, and fingertip-based gesture controls.

## Preview

<!-- Add a screenshot of the application here. -->

## Implemented Features

### Live Studio

- Maximized webcam workspace
- Soft Silver spatial interface
- Transparent music playback overlay
- Integrated audio-source controls
- Camera fullscreen mode
- Responsive studio layout

### Music Playback

- Local audio file playback
- Play and pause
- Playback progress and seeking
- Volume adjustment
- Automatic playback when replacing an existing track
- Authorized browser-based PC audio capture

### AI Gesture Control

- Real-time MediaPipe hand landmark detection
- Single green fingertip cursor
- Direct fingertip-based button targeting
- Thumb and index finger pinch interaction
- Pinch locking to prevent unintended cursor movement
- Hand-loss detection
- Mirrored and cropped webcam coordinate mapping
- Local model inference

## Getting Started

### Prerequisites

- Node.js 22.12+ or a compatible newer release
- npm
- A modern web browser
- Webcam for gesture controls
- Internet connection for initial dependency and model installation

Microsoft Edge or Google Chrome is recommended for PC audio sharing.

### Installation

Clone the repository:

```bash
git clone https://github.com/I-amManish/LyricLens-AI.git
cd LyricLens-AI/frontend
```

Install dependencies:

```bash
npm ci
```

Provision local AI assets:

```bash
npm run setup:ai
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite.

## How to Use

### Local Music

1. Click Add Music.
2. Select an audio file.
3. Press Play.
4. Adjust playback position and volume as needed.

### Gesture Controls

1. Enable the webcam.
2. Enable Gestures in the application header.
3. Raise your hand in front of the camera.
4. Move your index fingertip over a supported button.
5. Pinch your thumb and index finger together to activate it.
6. Release the pinch before performing another action.

The green dot represents the actual interaction position.

### PC Audio

1. Click PC Audio.
2. Select an audio-supported source.
3. Enable audio sharing in the browser permission dialog.
4. Control external playback in the original application.

LyricLens AI does not bypass browser permissions or directly control external music applications.

## Local AI Assets

The MediaPipe runtime and Hand Landmarker model are provisioned using:

```bash
npm run setup:ai
```

The setup script:

- Copies the runtime from the installed MediaPipe dependency.
- Downloads a versioned Hand Landmarker model.
- Verifies the model using SHA-256.
- Reuses an existing valid model.

Generated AI assets are excluded from Git.

Hand tracking runs locally after the assets are installed.

Official documentation:

https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker

## Technology Stack

| Technology | Purpose |
|------------|---------|
| React | Frontend |
| TypeScript | Type safety |
| Vite | Development and build tooling |
| Tailwind CSS | Styling |
| MediaPipe | Computer vision |
| Lucide React | Interface icons |
| HTML Media APIs | Audio and webcam |
| Vitest | Automated testing |
| React Testing Library | Integration testing |
| ESLint | Code quality |

## Project Structure

```text
LyricLens-AI/
├── frontend/
│   ├── public/
│   │   ├── mediapipe/
│   │   └── models/
│   ├── scripts/
│   │   └── setup-ai.mjs
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── audio/
│   │   │   ├── camera/
│   │   │   └── gestures/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
├── LICENSE
└── README.md
```

## Testing and Verification

From the frontend directory:

```bash
npm run test
npm run lint
npm run build
```

For continuous testing:

```bash
npm run test:watch
```

## Current Limitations

- Previous and next track controls are not implemented.
- Volume and timeline sliders require mouse, keyboard, or touch interaction.
- Camera activation, file selection, and initial PC audio capture require genuine user interaction.
- Gesture tracking pauses in camera fullscreen mode.
- Filling the camera workspace may crop the webcam image.
- PC audio capture availability depends on the browser and operating system.
- Advanced creative AI features are not yet implemented.

## Development Roadmap

- [x] Project initialization
- [x] Studio interface
- [x] Webcam integration
- [x] Local music playback
- [x] PC audio capture
- [x] AI hand tracking
- [x] Gesture-based playback controls
- [x] Direct fingertip cursor
- [x] Transparent playback overlay
- [x] Maximized camera workspace
- [ ] Music library and playlists
- [ ] Audio analysis
- [ ] Beat-reactive visualization
- [ ] Mood detection
- [ ] Body tracking and segmentation
- [ ] Music-synchronized lyrics
- [ ] AI artwork generation
- [ ] Karaoke and vocal separation
- [ ] Audio remixing
- [ ] Image and video export
- [ ] Advanced voice processing

## Project Principles

- Free and open-source core
- Local-first processing
- Privacy-focused architecture
- Explicit browser permissions
- No mandatory paid API dependencies
- Modular and testable implementation

## License

Licensed under the Apache License, Version 2.0.

Third-party libraries and AI models retain their respective licenses and usage terms.
