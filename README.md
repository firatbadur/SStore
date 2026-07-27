# SStore — App Store & Google Play Screenshot Studio

Turn raw device screenshots into modern, editorial‑style **store graphics** for the App Store and Google Play. Add headlines, device frames, backgrounds, and floating badges — then export production‑ready PNGs at every required size.

**▶ Live demo: [firatbadur.github.io/SStore](https://firatbadur.github.io/SStore/)**

> Runs entirely in your browser — no backend, no sign‑up. Your screenshots never leave your device.
>
> The app interface is in Turkish.

## Highlights

- **One design → every size.** iPhone (6.9″–6.1″), Android (Google Play FHD/QHD), and Feature Graphic (1024×500) are generated from the same slides.
- **Full creative control.** Theme, font, accent color, phone tilt (0 = flat), shadow, floating cards, texture, and alignment — all with a live preview.
- **Bring your own screenshots.** Upload PNGs for any app and edit each slide's headline, layout, and floating badges.
- **Export your way.** Download a single ZIP grouped by platform, or save straight to a folder (File System Access API — Chrome/Edge).
- **No logos baked in.** App icons are never stamped onto slides — you add them yourself.
- **Local‑first.** Projects live in your browser (IndexedDB); nothing is uploaded to a server.

## Getting started

```bash
npm install       # first time
npm run dev       # http://localhost:5173
```

```bash
npm run build     # production build (type‑checked)
npm run preview   # preview the production build
```

## How it works

1. **Projects** — Create a project and upload your screenshots.
2. **Design** — Choose devices, theme, font, accent, and composition; edit each slide's text and layout with a live preview.
3. **Export** — Review the generated graphics grouped by device, click to zoom, and download them one by one, as a ZIP, or straight to a folder.

## Tech

Vite + React + TypeScript single‑page app. DOM‑to‑PNG export via [`html-to-image`](https://github.com/bubkoo/html-to-image). No server, no build‑time secrets.

## Deployment

Every push to `main` runs a GitHub Actions workflow that builds the app and deploys it to GitHub Pages.
