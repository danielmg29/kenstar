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

## After the files are added

These still need wiring up in code:

- Remove the default Next.js `app/favicon.ico`, which would otherwise override these icons.
- Point `metadata.icons` in `app/layout.tsx` at `/brand/favicon/*`.
- Add `app/manifest.ts` for the 192 / 512 icons.
- Use the logos in the header and footer.
