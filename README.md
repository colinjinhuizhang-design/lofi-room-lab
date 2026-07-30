# Lo-Fi Room Lab

An interactive 2D lo-fi room and browser-based music mixer. Choose a royalty-free
music preset, control the room objects, blend ambience and generated layers, and
export a processed mix without uploading audio to a server.

**Live app:** [colinjinhuizhang-design.github.io/lofi-room-lab](https://colinjinhuizhang-design.github.io/lofi-room-lab/)

## Features

- Five local royalty-free lo-fi music presets
- Interactive canvas room with rain, vinyl, drums, cafe ambience, light, and keyboard controls
- Lo-Fi and Remix processing modes
- Live Web Audio mixing with smooth layer fades
- Native mobile lock-screen playback with rain, drums, dust, and cafe effects mixed in
- Responsive desktop and mobile layout
- Waveform playback controls and MP3/WAV export
- Local preference persistence
- No backend or external API required

## Run locally

```powershell
npm install
npm run serve
```

Open `http://127.0.0.1:4174/`.

## GitHub Pages

The application is fully static and can be hosted directly from the repository
root with GitHub Pages. No build step is required.

## Project structure

- `index.html` - application markup
- `styles.css` - responsive game-style interface
- `app.js` - player state, controls, live audio graph, and room rendering
- `engine.js` - offline Web Audio processing and export
- `assets/tracks/` - royalty-free music presets
- `assets/vendor/` - browser-side MP3 encoder
- `app.R` and `app.py` - optional Shiny hosting wrappers

## Audio note

The 30-minute presets currently loop their selected source track during playback.
On mobile, the current song and selected effects are rendered into a short
bar-aligned native loop so playback can retain those effects while the browser is
backgrounded or the screen is locked.
Built-in export renders a shorter processed scene rather than a complete 30-minute
file. See [ASSET_CREDITS.md](ASSET_CREDITS.md) for the supplied music files.
