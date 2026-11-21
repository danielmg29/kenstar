---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/layout.tsx"]
---

# Homepage (`app/page.tsx`)

Confirmed by the user on 2026-11-17 via `/impeccable shape homepage`. The Direction contract is still to be written at build time.

## Scope and mode

- **Visitor mode:** Persuade.
- **Scope:** a production homepage only. Range pages are a separate surface, not yet shaped.

## Job, audience and action

- **Who arrives:** product explorers, homeowners, and builders or renovators, mostly on phones. They are deciding whether Kenstar has what they need and whether the showroom is worth a trip.
- **Primary action:** explore the ranges, through the gateway carousel.
- **Close second:** visit the showroom, with today's hours and a working Directions link.
- **Third:** enquire by WhatsApp, call or quote form.
- **Product truth to dramatize:** the six ranges follow the order a building is made in, so the story ends on Lighting, the "final light".

## Direction (pinned whole by the user, no roll)

Quoted pin:

- **World:** "contemporary architectural editorial, combining precise geometric layouts, construction drawings, technical annotations and authentic showroom/product photography".
- **Opening:** "a flat 2D SVG animation: the logo is constructed as a wireframe, its details resolve, the upper window panes animate with subtle eye movements, the logo settles, and the star expands into a photograph reveal of the showroom".
- **Carousel:** a "manually controlled architectural gateway carousel for the major retail categories".
- **Story:** "vertical scrolling, with a sticky chapter navigator and precise blueprint-to-photorealistic product transformations".

For the build's Direction contract, write `seed: none (pinned)`.

**Colour**

- Architectural navy owns whole fields: drawing sheets, the title block and the footer.
- Gold appears only where there is a star or light.
- Drawing sheets sit on cool drafting white, never cream.
- Photography carries all other colour.

**Annotations**

- Use real drafting conventions: dimension lines, section markers, grid references, title blocks, scale bars, door-swing arcs.
- Every annotation states a fact or is a working link.
- Guard against the generic editorial-hairline and tracked-mono look.

**Signature moments**

1. The star reveals the showroom photo.
2. **Final light:** the pendant lamp's drawing resolves into its photo, the light switches on, and the light carries into the showroom section through its lit lead photograph.

**3D:** none on the homepage.

## Sequence

1. **Opening:**
   - Runs about 3.5 seconds at most.
   - A skip button is shown from the first frame.
   - Plays once per session.
   - The eyes are one glance and one blink.
2. **First viewport:**
   - A full-bleed showroom photo.
   - Headline: "The making of a space. From the first line to the final light."
   - An "Explore the ranges" action.
   - A title block holding the address, open/closed status today, and Directions.
   - WhatsApp in the header.
   - The top of the carousel is visible at the bottom edge.
3. **Gateway carousel:**
   - Ranges in this order: Hardware & building supplies → Electricals → Bathroom → Finishing → Furniture → Lighting.
   - Each slide shows a drawn doorway with the range photo seen through it.
   - Each slide has "View range" and a range-prefilled WhatsApp link.
   - Manual only: buttons, swipe and keyboard, with a "03 / 06" counter. It never autoplays.
4. **The making of a space:**
   - Six chapters with a sticky sheet-index navigator.
   - Each chapter is one drawing-to-photo product transformation, with 0–4 supporting product links, a range link and an enquiry link.
   - Chapter names: 01 First line, 02 Power, 03 Water, 04 Surface, 05 Living, 06 Final light.
5. **Visit the showroom:**
   - Real photos, the address, hours with open-now status, and Google Maps directions.
   - A floor-plan drawing only if the real layout is supplied.
6. **Also from Kenstar:** construction, civil works and roadworks, delivery, and equipment hire, at deliberately lower priority.
7. **Close:** WhatsApp, call and a short quote form, then the footer (address, hours, range links, social links).

## States and ranges

**Opening**

- Skipped on repeat visits in the same session.
- Reduced motion: a static logo, then a fade to the photo.
- No JavaScript: the first viewport shows immediately.
- Slow photo: hold on the settled logo for a bounded time.

**Content**

- The carousel handles 4–10 ranges.
- A missing product photo shows the drawing alone, labelled "photo to come".
- Unknown hours show "Call to confirm hours" and are never invented.

**Quote form**

- States: idle, invalid, sending, sent, failed.
- On failure, offer WhatsApp or a call.

## Interaction and layout

**Scroll and motion**

- Native scrolling is never hijacked.
- Chapter transformations are scrubbed with ScrollTrigger, with only short pins.
- The motion vocabulary is drafting: lines draw, fills resolve, wipes travel along construction lines. Nothing bounces.

**Mobile**

- The chapter navigator becomes a compact bar ("03/06 Water").
- A persistent WhatsApp / Call / Directions bar sits at the bottom (proposed).

**Accessibility**

- Text is navy; gold is for graphics and large elements only.
- The carousel is keyboard-operable and labelled.

## Constraints and open decisions

**Assets needed**

- A logo SVG with separate named layers: the star, the roof strokes, the window frame, and each of the four panes. The two upper panes animate as eyes.
- Photos from the current site and social accounts:
  - URLs not yet provided;
  - usage rights to be confirmed.
- A hero showroom photo at least 2400px wide.
- Six clean, consistently angled product photos. The line drawings are traced from them so drawing and photo register.

**Candidate photos from https://kenstarlimited.co.ke/** (`wp-content/uploads/2026/06/`, all 2560×1707 unless noted)

- **Hero:**
  - `IMG_0914` (chandelier floor with the balcony giving depth)
  - `IMG_0980` (chandelier hall)
  - `IMG_0821` (furniture floor)
- **Product transformations** (in-situ shots, so tracing is harder than with isolated shots):
  - *Final light:* `IMG_0774` (chandelier, portrait 1707×2560) or `IMG_0981` (ring pendant)
  - *Water:* `IMG_0686` (mixer taps)
  - *Living:* `IMG_0783` (dining set) or `IMG_0995` (sofa set)
- **Gaps:**
  - No photos for *01 First line* (hardware & building supplies) or *04 Surface* (finishing). These need new photos, or the chapters change.
  - Construction and roadworks photos are 1600 px at most, so they suit small cards only.

**Six ranges confirmed (user decision, 2026-11-18):** the carousel and the chapters keep all six ranges. Hardware & building supplies and finishing have no photos yet. Until new photos arrive, their carousel slides and chapters (*01 First line*, *04 Surface*) use the drawing-only "photo to come" state.

**Facts:** the address, hours and phone number now come from the current site (see PRODUCT.md). The WhatsApp number is still needed.

**Undecided**

- Whether prices are shown. The homepage shows none.
- How the quote form delivers email. The site can launch with WhatsApp and calls only.
- The range pages that carousel links point to.

**Other constraints**

- Accommodation is excluded until confirmed.
- No new dependencies: GSAP with ScrollTrigger, Embla and `next/image`.

**Anti-goals**

- Any generic corporate, construction-company, luxury-retail or architectural-portfolio template.
- Any story that stands between visitors and the products.

## Direction contract

THESIS: The homepage is a drawing set being built into a lit room. Each section is a drawing sheet whose lines resolve into Kenstar's real showroom photographs, and the page ends when the final light switches on. It refuses the category default the current site ships: a stock-interior hero slider over a row of service cards.

OWN-WORLD:
- Sheets are cool drafting white (#F3F6F9) with architectural-navy (#0B2D52) linework and type.
- Navy owns whole fields: the gateway band, the title block, the Final light chapter, the showroom and the footer.
- Gold (#F59E0B) is only for the star, light, and the primary action.
- Deep navy (#06203D) is a deliberate second field tone, used only for openings and figure grounds: the gateway doorways and the Final light figure.
- Drafting conventions carry the parts: sheet frames, dimension lines with tick terminators, title blocks, schedules, section markers.
- Corners are chamfered at 45°, taken from the KENST★R wordmark. Range gateways have a gable top, taken from the logo's house.
- Headlines are set in heavy, expanded Archivo. Annotation lettering is Barlow Semi Condensed with tabular figures.
- Photography supplies every other colour.

STORY: The visitor sees the real showroom revealed through the star. They understand the six ranges in the order a space is built. They either step through a range gateway or follow the chapters, and they leave with directions, today's hours, or a WhatsApp chat.

FIRST VIEWPORT:
- **Intro:** a skippable SVG intro of 3.5 seconds or less. The KENST★R lockup draws as a wireframe and fills, the upper panes glance and blink, the letters drop away, and the star opens as a mask.
- **Photo:** the full-bleed showroom chandelier photo (IMG_0914) sits inside a drawing-sheet frame.
- **Bottom left:** a chamfered navy panel. It holds "The making of a space." (expanded Archivo, about 5.5rem), "From the first line to the final light.", a one-line range summary, a gold "Explore the ranges" button and "WhatsApp us".
- **Bottom right:** a drafting-white title block with the location, today's open status, the hours, Directions and Call.
- **Header:** the wordmark, the nav and WhatsApp. The top edge of the navy gateway band shows at the fold.

FORM:
- Pinned by the user, so there was no list position: seed: none (pinned). In the user's words: "contemporary architectural editorial, combining precise geometric layouts, construction drawings, technical annotations and authentic showroom/product photography". The first-surface experience is pinned in the user's words too: "a flat 2D SVG animation: the logo is constructed as a wireframe, its details resolve, the upper window panes animate with subtle eye movements, the logo settles, and the star expands into a photograph reveal of the showroom", with a "manually controlled architectural gateway carousel for the major retail categories" and "vertical scrolling, with a sticky chapter navigator and precise blueprint-to-photorealistic product transformations".
- **Signature interaction (Final light):** the drawing of chapter 06's pendant resolves into its photograph, the sheet darkens to navy, and the lamp switches on in gold. The light carries into the showroom: its lit lighting-hall photograph starts at the seam under Final light (a gold haze over navy reads as mud, so none is used).
- **Motion grammar:** drafting. Strokes draw, fills resolve, and wipes travel behind a gold construction line, with exponential ease-out and no bounce. Motion is scroll-scrubbed on native scroll, and pins are sticky and short.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
