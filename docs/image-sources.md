# Image sources

The user approved downloading these photos on 2026-11-18. Every file in `public/images/` is one of **Kenstar's own photos**, taken from the current website, **except the two stand-ins listed at the end**, which are free stock photos to be replaced.

**Source folder:** `https://kenstarlimited.co.ke/wp-content/uploads/2026/06/`

**Rights:** the user has said the photos can be reused. Still confirm with the photographer that the licence covers the new site.

## Showroom

| File in `public/images/` | Original | Size (px) |
|---|---|---|
| `showroom-chandelier-floor-0914.webp` | `IMG_0914.webp` | 2560 × 1707 |
| `showroom-chandelier-hall-0980.webp` | `IMG_0980.webp` | 2560 × 1707 |
| `showroom-furniture-floor-0821.webp` | `IMG_0821.webp` | 2560 × 1707 |
| `showroom-chandeliers-0916.webp` | `IMG_0916.webp` | 2560 × 1707 |
| `showroom-ceiling-fittings-0973.webp` | `IMG_0973.webp` | 2560 × 1707 |
| `showroom-bathroom-mirrors-0715.webp` | `IMG_0715.webp` | 2560 × 1707 |

## Product ranges

| File in `public/images/` | Original | Size (px) |
|---|---|---|
| `range-electricals-switches-0964.webp` | `IMG_0964.webp` | 2560 × 1707 |
| `range-bathroom-taps-wall-0693.webp` | `IMG_0693.webp` | 2560 × 1707 |
| `range-bathroom-mixer-taps-0686.webp` | `IMG_0686.webp` | 2560 × 1707 |
| `range-furniture-recliner-0995.webp` | `IMG_0995.webp` | 2560 × 1707 |
| `range-furniture-dining-0783.webp` | `IMG_0783.webp` | 2560 × 1707 |
| `range-lighting-ring-pendant-0981.webp` | `IMG_0981.webp` | 2560 × 1707 |
| `range-lighting-chandelier-0774.webp` | `IMG_0774.webp` | 1707 × 2560 |

## Construction and roadworks

These are WhatsApp photos from 2022, at lower resolution. Use them small.

| File in `public/images/` | Original | Size (px) |
|---|---|---|
| `work-construction-house-0169.webp` | `IMG-20221115-WA0169.webp` | 1156 × 867 |
| `work-construction-site-0147.webp` | `IMG-20221115-WA0147.webp` | 1156 × 867 |
| `work-roadworks-tarmac-0143.jpg` | `IMG-20221115-WA0143.jpg` | 867 × 1156 |
| `work-civil-bridge-0130.jpg` | `IMG-20221115-WA0130.jpg` | 1080 × 720 |

## Stand-ins to replace

Kenstar has no photos of these two ranges yet. On 2026-11-20 the user asked for photos from the internet as stand-ins, to be swapped for Kenstar's own once the site is up. Both are free under the [Unsplash License](https://unsplash.com/license) (commercial use allowed, no attribution required). On the site each carries an "Illustrative photo" label.

| File in `public/images/` | Range | Source | Photographer | Size (px) |
|---|---|---|---|---|
| `standin-hardware-store-unsplash.webp` | Hardware & building supplies | [unsplash.com/photos/UHXBNCK7Hu4](https://unsplash.com/photos/UHXBNCK7Hu4) | Artem Korolev | 2000 × 2667 |
| `standin-finishing-paint-unsplash.webp` | Beautification & finishing | [unsplash.com/photos/rMVjOX8nm2U](https://unsplash.com/photos/rMVjOX8nm2U) | Andrew Itaga | 2000 × 1500 |

**To replace one:** add Kenstar's photo to `public/images/`, point the range's `photo` in `app/_content/showroom.ts` at it, set `standIn` to `false`, and delete the stand-in file.
