# Navya Gupta — kinetic title-sequence intro

Canvas-2D, vanilla JS, no raster assets. Open `index.html` directly, or it is served at `/intro/` and embedded
(`/intro/index.html?embed`) by `components/IntroOverlay.tsx`.

Site flow: J.A.R.V.I.S. boot (3 domains) → this sequence → the portfolio, camera already on the chosen domain.

## Files
| file | what |
|---|---|
| `index.html` | canvas, `CONFIG`, band + mirror-reflection compositor, SKIP / ENTER / project-tile controls, loop clock |
| `scenes.js`, `scenes2.js`, `scenes3.js` | the 14 scenes + loop wipe, each a pure `(g, W, H, u, T) => void` in a 1920×436 space |
| `fx.js` | RGB split, bloom, grain, scanlines, vignette, decaying shake, shutter + flash |
| `util.js` | easing, stateless `rnd`, cached text bitmaps, `circText`, `sliceDraw` |
| `fonts.css` | Anton, Archivo Black, Noto Sans Devanagari as base64 `@font-face` |
| `export.mjs` | frame-perfect exporter (see below) |

## Change the words
Edit `CONFIG.words`, `CONFIG.tunnel`, `CONFIG.domains`, `CONFIG.projects` at the top of `index.html`. Scene code never needs touching.
Project tiles in the final card are clickable (they enter the site); rename them in `CONFIG.projects`.

## Swap the palette
`CONFIG.pal` (`ink, orange, lime, bone, amber, steel`). A few one-off accents (hologram gradient in S11, hot pink in S12,
the cube shades in S13) are inline in their scene.

## Re-time scenes
`CONFIG.starts` holds each scene's start time in seconds; the last value is the loop length. Scenes read their own local
time `u`, so moving a boundary re-times a scene without edits (scenes at 120 BPM land on 0.5 s multiples).

## Determinism
A frame depends only on `t`: `window.renderFrame(t)`. No `Math.random()` anywhere, per-frame noise is `rnd(n)` seeded with
`floor(t*30)`. `window.setRenderSize(w, h)` sets the backing-store size (band scale capped at 2× = 3840 wide).

## Export
```
node export.mjs 3840 2160 30 44 ./out     # 4K  → navya_intro_2160p.mp4, navya_intro_1080p.mp4, navya_intro_loop.webm
node export.mjs 1920 1080 30 44 ./out     # 1080p
```
Needs `playwright` (local or global) and `ffmpeg`. Set `CHROMIUM_PATH` if Playwright's bundled Chromium isn't installed.

## Behaviour
Plays once per session (`sessionStorage`), REPLAY INTRO link on the site, SKIP / ENTER (also Esc / Enter), pauses when the tab is
hidden, `prefers-reduced-motion` shows a static frame of the final card. No audio yet: `CONFIG.audioSrc` is a reserved slot.
