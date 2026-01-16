## ADDED Requirements

### Requirement: Audio Playback Core

The system SHALL provide audio playback functionality using Howler.js that supports play, pause, seek, and volume control.

#### Scenario: User plays audio

- **WHEN** user clicks the play button
- **THEN** the audio starts playing from the current position
- **AND** the play button changes to a pause button

#### Scenario: User pauses audio

- **WHEN** user clicks the pause button while audio is playing
- **THEN** the audio pauses at the current position
- **AND** the pause button changes to a play button

#### Scenario: User seeks to position

- **WHEN** user drags the progress bar to a new position
- **THEN** the audio playback position updates to the selected time
- **AND** the current time display updates accordingly

#### Scenario: User adjusts volume

- **WHEN** user adjusts the volume slider
- **THEN** the audio volume changes to the selected level

### Requirement: Track Navigation

The system SHALL allow users to navigate between lessons within the same unit.

#### Scenario: User plays next track

- **WHEN** user clicks the next button
- **AND** there is a next lesson in the unit
- **THEN** the player loads and plays the next lesson

#### Scenario: User plays previous track

- **WHEN** user clicks the previous button
- **AND** there is a previous lesson in the unit
- **THEN** the player loads and plays the previous lesson

#### Scenario: No next track available

- **WHEN** user is on the last lesson of a unit
- **THEN** the next button is disabled

### Requirement: Variable Speed Playback

The system SHALL support playback speed adjustment from 0.5x to 2.0x while maintaining audio pitch.

#### Scenario: User changes playback speed

- **WHEN** user selects a speed option (0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x)
- **THEN** the audio playback speed changes to the selected rate
- **AND** the audio pitch remains unchanged

#### Scenario: Speed preference persists

- **WHEN** user sets a playback speed
- **AND** user navigates to another lesson
- **THEN** the selected speed preference is maintained

### Requirement: AB Loop

The system SHALL provide AB loop functionality for repeating a specific section of audio.

#### Scenario: User sets A point

- **WHEN** user clicks the "Set A" button during playback
- **THEN** the current playback position is saved as point A
- **AND** a visual indicator shows point A on the progress bar

#### Scenario: User sets B point

- **WHEN** user clicks the "Set B" button after setting point A
- **THEN** the current playback position is saved as point B
- **AND** the audio loops between point A and point B

#### Scenario: User clears AB loop

- **WHEN** user clicks the "Clear" button while AB loop is active
- **THEN** both A and B points are cleared
- **AND** normal playback resumes

#### Scenario: AB loop playback

- **WHEN** AB loop is active
- **AND** playback reaches point B
- **THEN** playback automatically jumps back to point A

### Requirement: Subtitle Display

The system SHALL display synchronized subtitles with the audio playback.

#### Scenario: Subtitle synchronization

- **WHEN** audio is playing
- **AND** the lesson has subtitle data
- **THEN** the current subtitle is highlighted based on playback time

#### Scenario: Click to seek on subtitle

- **WHEN** user clicks on a subtitle line
- **THEN** the audio seeks to the start time of that subtitle

#### Scenario: Font size adjustment

- **WHEN** user adjusts the subtitle font size control
- **THEN** the subtitle text size changes accordingly

#### Scenario: No subtitles available

- **WHEN** the lesson has no subtitle data
- **THEN** the subtitle display area shows a "No subtitles available" message
