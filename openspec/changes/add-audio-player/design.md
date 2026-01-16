## Context

The audio player is a core feature for the English listening platform. It needs to support K-12 students with features like variable speed playback for learning at their own pace, AB loop for practicing difficult sections, and synchronized subtitles for reading along.

## Goals

- Provide a reliable, cross-browser audio playback experience using Howler.js
- Support learning-focused features (speed control, AB loop, subtitles)
- Maintain simple, maintainable code structure
- Optimize for mobile devices (K-12 students often use phones/tablets)

## Non-Goals

- Waveform visualization (WaveSurfer.js) - not needed for MVP
- Offline playback (PWA) - future enhancement
- Playlist management beyond prev/next within a unit

## Decisions

### Audio Library: Howler.js

- Already specified in project tech stack
- Cross-browser compatibility
- Built-in support for playback rate changes
- Event-driven API fits React patterns well

### State Management: Custom Hook + Zustand

- `useAudioPlayer` hook encapsulates Howler.js logic
- Zustand store for global player state (current lesson, playlist)
- Keeps component logic simple and testable

### Component Structure

```
src/features/player/
├── components/
│   ├── AudioPlayer.tsx       # Main player component
│   ├── PlaybackControls.tsx  # Play/pause, prev/next buttons
│   ├── ProgressBar.tsx       # Seekable progress bar
│   ├── VolumeControl.tsx     # Volume slider
│   ├── SpeedControl.tsx      # Speed selection dropdown
│   ├── ABLoopControl.tsx     # AB loop buttons and indicator
│   └── SubtitleDisplay.tsx   # Synchronized subtitle view
├── hooks/
│   ├── useAudioPlayer.ts     # Howler.js integration
│   └── useSubtitleSync.ts    # Subtitle time synchronization
├── stores/
│   └── playerStore.ts        # Zustand store for player state
└── index.ts                  # Public exports
```

## Risks / Trade-offs

### Risk: Mobile browser audio restrictions

- Mitigation: Require user interaction before first play (standard pattern)
- Howler.js handles most browser quirks automatically

### Risk: Subtitle sync accuracy

- Mitigation: Use requestAnimationFrame for smooth updates
- Allow small tolerance (100ms) for highlighting

## Open Questions

- None - requirements are clear from PRD
