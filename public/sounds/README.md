# Sound Effects

This directory contains sound effects for the application.

## Required Files

- `success.mp3` - Played when a submission is accepted (AC)
  - Should be a pleasant, short sound (0.5-1 second)
  - Recommended: A gentle "ding" or "success chime"
  - Example sources:
    - https://freesound.org/
    - https://mixkit.co/free-sound-effects/success/
    - https://pixabay.com/sound-effects/

## File Specifications

- Format: MP3
- Duration: 0.5-1.5 seconds
- Volume: Normalized to -18dB (will be played at 30% volume in code)
- Sample Rate: 44.1kHz or 48kHz

## Usage

Sound effects can be played in the application when needed.

```typescript
const audio = new Audio('/sounds/success.mp3');
audio.volume = 0.3;
audio.play();
```
