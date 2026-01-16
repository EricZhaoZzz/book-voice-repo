# Change: Add Audio Player Feature

## Why

The platform needs a fully functional audio player to enable K-12 students to listen to English learning content. This is a core feature required for the MVP as specified in the PRD.

## What Changes

- Create audio player component with Howler.js integration
- Implement basic playback controls (play/pause, progress, volume, prev/next)
- Add advanced features (variable speed playback, AB loop)
- Implement synchronized subtitle display with click-to-seek

## Impact

- Affected specs: `audio-player` (new capability)
- Affected code:
  - `src/features/player/` - New player components and hooks
  - `src/components/ui/` - Reusable UI components (slider, etc.)
