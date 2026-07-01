# Canada Day Instagram Reel — Shabahat Realtor

An animated, fully code-generated vertical reel (1080×1920, ~15s, 30fps) celebrating
Canada Day for **Shabahat Realtor**.

## What it looks like

Three animated scenes:

1. **Title** — navy background with `HAPPY / CANADA / CANADA DAY`, a Canadian-flag
   panel with a red maple leaf set into the middle of the word (styled after the
   reference design).
2. **Date** — a big red maple leaf with a paint-splatter burst and a `1 JULY` badge,
   plus `happy CANADA day`.
3. **Branding** — `SHABAHAT REALTOR`, the tagline *Your Trusted Real Estate Partner*,
   and a `Wishing you & your family a Happy Canada Day 🍁` message.

Subtle floating maple leaves and animated red accent bars run throughout.

The video is rendered **silent** — add music inside Instagram (its in-app licensed
audio is the safest choice for reels).

## Files

| File | Purpose |
|------|---------|
| `index.html` | The reel itself — a self-contained, deterministic HTML/CSS/JS animation. `window.__seek(t)` renders the exact frame at time `t` (seconds); `window.__DURATION` is the length. |
| `render.mjs` | Headless-Chromium frame capture + ffmpeg H.264 encode. |
| `canada_day_shabahat_realtor.mp4` | The rendered reel (final deliverable). |
| `thumbnail.png` | A still from the reel. |

## Regenerate

```bash
cd reel
npm install                      # playwright + ffmpeg (browser download is skipped)
node render.mjs preview 3 8 13.5 # write sample frames to ./preview for quick checks
node render.mjs video            # render all frames -> canada_day_shabahat_realtor.mp4
```

The maple leaf is generated from a small editable list of half-outline points in
`buildLeaf()` inside `index.html`. Colours, copy, scene timings and durations are
all editable at the top of the `<style>` block and in the `seek()` timeline.

> Rendering uses the Chromium binary at `/opt/pw-browsers/chromium` (override with
> `CHROME_BIN`) because the bundled Playwright browser version differs from the
> preinstalled one.
