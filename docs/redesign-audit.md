# Redesign audit

An audit of the current build against the client's redesign brief (`docs/redesign-brief.md`), written on 2026-11-19 before any redesign work.

**Status:** approved by the client on 2026-11-19, covering the findings, the implementation sequence and the preserve, refactor or replace plan. Implementation has not started and waits for the client's go-ahead. The open decisions at the end are still unanswered.

## 1. Application architecture

- **Stack:** Next.js 16.4 App Router, React 19.3, Tailwind 4.3, pnpm. `cacheComponents` and `partialPrefetching` are on.
- **One route.** `app/page.tsx` renders everything: the intro, header, every section, the footer and the phone action bar. The header, footer and action bar are not in `app/layout.tsx`, so every new route would have to repeat them.
- **Content is hard-coded** in `app/_content/site.ts`: contact facts, hours, the six ranges, chapter photos and three services. There is no content model for products, projects or accommodation.
- **Static text ships as JavaScript.** Six of the 14 components are client components (Intro, GatewayCarousel, Chapters, Enquiry, SiteHeader, OpenStatus). Chapters sends all its static copy to the browser because the copy and the animation share one component.
- **Unused packages:** `three`, `@react-three/fiber`, `@react-three/drei` and `@types/three` are installed, but nothing imports them.
- **Photo provenance files would go public.** The `public/images/*.webp.json` files would be served on the live site.
- **Unused photo:** `public/images/work-civil-bridge-0130.jpg` is not used anywhere yet.
- **Launch basics missing:** no 404 page, sitemap, robots file, social share image or LocalBusiness structured data.

## 2. Homepage structure

Intro → header → hero (photo, navy headline panel, showroom title block) → range carousel → six chapters → showroom visit → beyond the showroom (construction, roadworks, delivery) → enquiry form → footer → phone action bar.

- **What works:** retail comes first and construction is secondary, which matches the brief's priorities.
- **The six ranges appear twice,** once in the carousel and again in the chapters. The brief settles this: the carousel covers the retail categories and the journey covers the whole business.
- **Too much dark:** five navy blocks (the hero panel, the carousel, the last chapter, the showroom section and the footer), plus the phone action bar. The brief warns against using dark backgrounds everywhere.
- **The hero is not one of the brief's three animated experiences.** What the star opens onto needs deciding.

## 3. Logo animation (`app/_components/Intro.tsx`, `app/_components/brand.tsx`)

**What works**

- It uses the real logo shapes from `brand.tsx`: letters, star and the four window panes.
- It draws the strokes, fills them, zooms into the star, then opens the star as a CSS mask onto the showroom photo.
- It plays once per browser session. Visitors can skip it with a button or Esc.
- It is skipped for reduced-motion visitors and when the script arrives after 3 seconds. A CSS failsafe uncovers the page if the script never runs.

**Gaps**

- **Thin construction.** The "wireframe" is four guide lines (two horizontals, one vertical, one circle), then the letter outlines are traced. Nothing constructs the mark's own geometry: roof pitch, window grid, star points.
- **The eyes never vary.** One fixed 0.8-second script runs every time: glance left, glance right, one blink. The brief asks for varied, natural expressions in randomised but controlled sequences.
- **Tied to the hero photo.** The reveal waits up to 1.2 seconds for `#hero-photo` to decode. If the hero changes, the reveal target must change too.
- **Keyboard focus.** While the overlay is up, the page underneath is not inert, so keyboard focus can land on hidden header links. The overlay has no accessible name.
- **Colours are hard-coded** to the current navy and gold.

**Verdict:** refactor. Keep the timeline, skip handling and star reveal; rebuild the construction phase and replace the eye script with an expression system.

## 4. Carousel (`app/_components/GatewayCarousel.tsx`)

**What it is:** an Embla slider showing between 1.2 and 3.5 cards at once depending on width. Each card has a gable-shaped photo opening, a number, a name, its sub-categories and two text links. It has previous and next buttons, arrow-key support and a counter that reads "01–04 of 06". There is no autoplay.

**Gaps**

- **No active category.** Several cards show at once and nothing on the page updates as you move. The brief needs one active portal driving the main image, headline, description, primary and secondary calls to action, and the category index. Structurally this is the generic multi-card slider the brief rules out.
- **No descriptions.** Cards list sub-category names only.
- **Unfinished cards.** Hardware and Finishing show a line drawing tagged "Photo to come".
- **Dead links ahead.** "Explore" links jump to chapter anchors that the redesign removes.

**Verdict:** replace the component. Embla can stay as the drag and swipe engine underneath.

## 5. Six-chapter journey (`app/_components/Chapters.tsx`, `app/_components/drawings.tsx`)

**What it is:** six retail-range chapters (First line, Power, Water, Surface, Living, Final light). Each is a 165vh article with a sticky stage: copy on the left, a framed drawing sheet on the right. Scrolling draws an SVG line drawing traced from the photo, then wipes the photo in behind a gold rule. The last chapter turns the section navy and switches the lamp on. A sticky chapter index sits beside the chapters on desktop, with a chip bar on phones. Scrolling up reverses it. Reduced motion shows the finished state.

**Gaps**

- **Wrong chapters.** It covers the six retail ranges, not Approach → Arrival across roadworks, construction, materials, systems, finish and accommodation.
- **Unrelated sections.** Six identical blocks, each with a small framed picture, are the "series of unrelated image sections" the brief forbids. It is not first-person and has no camera.
- **Two stages, not three.** Each chapter goes from line drawing to photo. There is no photoreal environment, and the drawings are traced from the photos, so there is no space to move through.
- **Photos are the main image,** not field notes attached to a scene. Two chapters (First line and Surface) have no photo at all.
- **Fragile code.** Colours are repeated in the component instead of using the shared tokens. The navy background of the last chapter is a 300vw-wide layer held in by `overflow-x: clip`.

**Worth keeping:** the scroll-scrubbed and reversible playback pattern, the reduced-motion handling, and the chapter navigator idea.

**Verdict:** replace with a canvas image-sequence player and a field-notes layer.

## 6. Design inconsistencies

**The logo and the candidate palette clash.** The logo is final in navy `#0B2D52` and gold `#F59E0B`. The candidates add a second navy (Midnight `#14283B`) and a second gold (Burnt amber `#C58B45`). The logo's navy on Midnight is 1.08:1, so the full-colour logo disappears on Midnight surfaces, and near-identical navies and golds side by side read as a mismatch.

**Some candidate colours can't carry text.** Body text needs 4.5:1 against its background (WCAG AA).

| Colour pair | Contrast | Safe use |
|---|---|---|
| Burnt amber on Limestone | 2.56:1 | Not for text or outlines. Fine as a fill with Midnight text (5.12:1) |
| Burnt amber on White | 2.94:1 | Not for text |
| Mineral on Limestone | 2.70:1 | Hairlines and decoration only |
| Muted olive on Limestone | 3.95:1 | Large text only |
| Graphite on Limestone | 10.02:1 | Body text |
| Midnight on Limestone | 13.10:1 | Body text |

**Type candidates**

- **Inter** is the stronger of the two for body text, forms and figures such as hours and product counts. It is also the web's most common default and won't carry an identity on its own.
- **Manrope** has more character at display sizes, but it is another neutral sans-serif.
- **Together** they are two similar sans-serifs with little contrast between them, and neither echoes the chamfered geometry of the wordmark.
- **Recommendation:** test both against the logo before choosing. The answer is probably one family with a strict size scale.

**Other inconsistencies**

- **Drafting style everywhere.** Corner-ticked sheet frames, "Sheet 01 of 06" labels and spaced capitals appear on every section, including the enquiry form. The brief reserves technical surfaces for the homepage.
- **Old chapter names.** "First line … Final light" conflicts with the brief's "Approach … Arrival". "Final light" now ends at accommodation, not at lighting.
- **Outdated design records.** `DESIGN.md`, `.impeccable/design.json` and the homepage brief in `.impeccable/surfaces/` describe the old look. They will be replaced, not patched.

## 7. Missing relative to the brief

- **Pages:** `/products`, `/construction`, `/accommodation`, `/about` and `/contact`; templates for product categories, project details and enquiries; a shared layout; a 404 page.
- **Content:**
  - a description and two calls to action for each carousel category;
  - project records for construction and roadworks;
  - accommodation details and photos (17 exist on the current site, none downloaded, details unconfirmed);
  - About page facts (the confirmed claims are now usable: 100+ clients, 50+ projects, 200+ products, wholesale prices);
  - photos for Hardware and Finishing.
- **Logo:** a geometric construction phase and an eye-expression system.
- **Carousel:** one active category driving the image, text, calls to action and index.
- **Journey:**
  - a storyboard and camera paths for the six chapters;
  - the Blender scenes and renders (none exist, and Blender is not installed on this machine);
  - the canvas image-sequence player and the field notes;
  - portrait renders for phones;
  - fallbacks for reduced motion and low data.
- **Launch basics:** sitemap, robots file, per-route titles and descriptions, social share images and LocalBusiness structured data. Whether the form also sends straight to Kenstar is still undecided.

## 8. Performance concerns

**Current build**

- **Intro:** the star opening changes the full-screen mask size every frame for about 0.75 seconds, which repaints the whole screen. Test on low-end Android phones.
- **Chapters:**
  - scrolling animates `filter: brightness()` on a large photo;
  - it tweens CSS custom properties on the section root, which restyles everything inside the section on every scroll frame;
  - a `mix-blend-mode: screen` glow sits on top;
  - the section takes about 10 screen heights of scrolling (six chapters at 165vh).
- **Images are fine:** `next/image` serves resized versions of 140–430 KB WebP sources, and the hero photo is preloaded.

**The image sequences are the real risk**

- **Download size.** Done naively, six chapters × 120 frames × about 100 KB is about 72 MB, and double that with a separate wireframe pass.
  - **Budget:** about 1.5–2 MB per chapter on desktop and about 1 MB on phones, which means 60–90 frames per chapter at 1280–1600 px in AVIF or WebP.
  - **One sequence per chapter:** Blender animates the wireframe into finished materials within a single sequence. One camera guarantees the matching geometry the brief requires and halves the frame count.
- **Memory.** A decoded 1920 × 1080 frame takes about 8 MB, so 120 decoded frames take about 1 GB. The player must keep only a small window of frames decoded at a time.
- **Loading order.** Load every 8th frame of chapter 1 first, then fill in. Fetch the next chapter as each chapter arrives, and download nothing until the intro has finished.
- **Phones.** Phones need portrait renders or a camera composed for a centre-safe crop. Cropping 16:9 frames to 9:16 loses the composition.
- **Reduced motion and Save-Data.** Show key stills and the field notes, and skip the sequence download.

## 9. Recommended implementation sequence

0. **Commit the current build as a baseline,** so the redesign can be reviewed and undone. Settle the open decisions below.
1. **Set the design system:** study the references, reconcile the palette with the logo, test the type, set the grid, and replace `DESIGN.md`.
2. **Build the site shell:** move the header, footer and action bar into the layout, stub the routes, set up the content model, add the 404 page and metadata, and remove the three.js packages.
3. **Write the journey production spec early, because the renders take longest:** storyboard, camera paths, frame budget, file naming and portrait versions. Settle who renders in Blender.
4. **Logo animation v2.**
5. **Showroom gateway carousel v2.**
6. **Journey player and field notes,** built against stand-in frames, then the real renders swapped in.
7. **Inner pages,** built from the templates.
8. **Final pass:** performance, accessibility, reduced motion and search, then a finish review and `DESIGN.md`.

Steps 4, 5 and 7 can run alongside step 6 once steps 1 and 2 are done.

## 10. Preserve, refactor or replace

| Action | Files |
|---|---|
| **Preserve** | `site.ts` facts and `whatsappLink`, `brand.tsx` logo shapes, `icons.tsx`, `OpenStatus.tsx`, the validation and send logic in `Enquiry.tsx`, the `MobileActionBar` concept, `manifest.ts`, the favicon set, `public/brand/`, `public/images/` (move the provenance files out of `public/`), the intro gate and font loading in `layout.tsx`, `docs/` |
| **Refactor** | `Intro.tsx` (construction phase, eye expressions, new reveal target), `SiteHeader.tsx` and `SiteFooter.tsx` (routes, moved into the layout), `Showroom.tsx` (to `/contact`, plus a visit block on home), `Services.tsx` (to `/construction`), `globals.css` (new colours and type; drafting utilities limited to the homepage), `Hero.tsx` (probably absorbed by the carousel) |
| **Replace** | `GatewayCarousel.tsx` (keep Embla), `Chapters.tsx`, `drawings.tsx`, `DESIGN.md`, `.impeccable/design.json`, `.impeccable/surfaces/app-page-tsx.md` |
| **Remove** | `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` |

## Open decisions before step 1

1. **Carousel categories:** which six? The brief merges electricals with lighting; the six ranges confirmed on 2026-11-18 keep them apart.
2. **Renders:** who builds the Blender scenes? A 3D artist can deliver true photoreal. Claude can script Blender if it is installed, but those scenes would be clean architectural renders, not photoreal copies of Kenstar's actual spaces.
3. **Palette:** align its darks and accent to the logo's navy and gold, or always show the logo reversed on Midnight?
4. **Accommodation:** the details (location, units, rates, booking), and approval to download the 17 accommodation photos from the current site.
5. **After the star opens:** should it open onto the carousel, making the carousel the first thing visitors see?
