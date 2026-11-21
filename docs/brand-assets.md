# Brand assets checklist

Drop the files below into the folders shown, using these exact file names.
Everything in `public/` is served from the site root, so
`public/brand/logo/logo.svg` becomes `/brand/logo/logo.svg`.

## Logo: `public/brand/logo/` (3 required, 1 optional)

| # | File name | Format | Size | Used for |
|---|-----------|--------|------|----------|
| 1 | `logo.svg` | SVG | Vector | Full horizontal logo (symbol + "Kenstar" text) in full colour. Site header on light backgrounds. |
| 2 | `logo-white.svg` | SVG | Vector | The same logo in white or light colours. Footer, dark sections, and text over hero images. |
| 3 | `logo-mark.svg` | SVG | Vector, square artboard | Symbol only, with no text. Mobile header and loading screen. It is also the source for the favicons. |
| 4 | `logo-stacked.svg` *(optional)* | SVG | Vector | Vertical layout with the symbol above the text, for narrow spaces. |

**If you can't get SVG:** use a **PNG with a transparent background**, at least
**1000 px wide** (`logo.png`, `logo-white.png`, `logo-mark.png`).
Don't use JPG for logos, because it can't be transparent and shows a white box.

## Favicon: `public/brand/favicon/` (5 required, 1 optional)

Build every favicon from the **symbol only** (`logo-mark`). The full logo with
text can't be read at 16 px.

| # | File name | Format | Size (px) | Notes |
|---|-----------|--------|-----------|-------|
| 1 | `favicon.ico` | ICO | 32 × 32 (16 + 32 + 48 inside one file is best) | Browser tab. Older browsers use this one. |
| 2 | `icon.svg` | SVG | Vector, square | Browser tab in modern browsers. Stays sharp at any size. |
| 3 | `apple-touch-icon.png` | PNG | 180 × 180 | iPhone and iPad home screen. **Use a solid background, not transparent** (iOS fills transparency with black). |
| 4 | `icon-192.png` | PNG | 192 × 192 | Android home screen. |
| 5 | `icon-512.png` | PNG | 512 × 512 | Android splash screen and app install. |
| 6 | `icon-maskable-512.png` *(optional)* | PNG | 512 × 512 | Android adaptive icon. Use a full-bleed solid background and keep the symbol inside the centre 80% (about 410 px), because Android crops the corners into circles or squircles. |

## Totals

- **Required:** 8 files (3 logo + 5 favicon)
- **Optional:** 2 files (stacked logo, maskable icon)

Shortcut: you can supply only the 3 logo SVGs. The favicon set can be generated from `logo-mark.svg`.

## What was supplied, and how it is wired (2026-11-18)

**Supplied**

- Logo lockups `logo.svg` (navy) and `logo-white.svg`. These were renamed from the two "…surface preview only" files, which the user confirmed are final.
- Marks `logo-icon-light.svg` and `logo-icon-dark.svg`.
- Favicon `kenstar-c01-app-icon.svg`, plus 36–96 px PNGs.

**Generated from the supplied mark**

- `favicon.ico` (16 / 32 / 48 px).
- `icon.svg`, with navy panes on light browser tabs and white panes on dark tabs. The supplied favicon's white panes vanished on light tabs.
- `apple-touch-icon.png` (180 px, navy ground).
- `icon-192.png` and `icon-512.png`.
- `icon-maskable-512.png`.

**Wired using Next.js file conventions**

- In `app/`: `app/favicon.ico`, `app/icon.svg` and `app/apple-icon.png` replace the Next.js defaults.
- `app/manifest.ts` points at the 192 / 512 / maskable icons in `public/brand/favicon/`.
- The header, footer and intro draw the logo inline, from the same path data, in `app/_components/brand.tsx`.

**Logo shape**

- The star doubles as the "A" in KENST★R.
- The house is the notch cut out of the star.
- The four window panes are separate paths in the code, so the two upper panes can animate as eyes in the intro.
