MoodMelody — Auto Layout UI

This is a small demo UI focused on using Auto Layout patterns (flexbox & grid) for tidy spacing, alignment, and responsiveness.

Files added in this demo:
- `mood.html` — main demo page
- `mood.css` — styles using Auto Layout helpers and variables
- `mood.js` — small interactions (play/pause, mood filter)

Run locally:

1. Open a terminal in this project folder.
2. Start a simple HTTP server (Python 3 recommended):

```powershell
python -m http.server 8000
```

3. Open `http://localhost:8000/mood.html` in your browser.

What to test:
- Resize the window — layouts should reflow and maintain even gaps and alignment.
- Use keyboard (Tab/Enter/Space) to navigate mood cards and playlists.
- Tap/click mood cards to filter playlists; click play to toggle play state.
- Check that touch targets are at least 48px and hover/focus states are visible for cards.

Next steps you might ask for:
- Swap placeholders with your artwork or local album images.
- Export components as React/Vue with the same Auto Layout utility classes.
- Add persistence or real playback integration.
