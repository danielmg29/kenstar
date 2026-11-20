# Kenstar redesign brief

Supplied by the client on 2026-11-19, kept here word for word. It replaces the homepage direction in `.impeccable/surfaces/app-page-tsx.md` and the visual system recorded in `DESIGN.md`. The product facts it changes are also recorded in `PRODUCT.md`.

---

# KENSTAR REDESIGN — DESIGN AND IMPLEMENTATION RESET

We are continuing an existing Next.js project. This is a redesign and correction of the current implementation, NOT a new project.

Before making any code changes, inspect the existing codebase, installed dependencies, current homepage, existing components, routing, assets and animation implementation.

## 1. Revised strategic direction

Kenstar is an Embu-based business best known locally for its physical hardware and home-products showroom.

The website must communicate this retail identity prominently while also representing its other business activities:

- Hardware and building supplies
- Electricals and lighting
- Bathroom products and toiletries
- Furniture and home products
- Beautification and finishing
- Construction and civil works
- Roadworks
- Furnished accommodation
- Automotive and garage, subject to verification

Do not position construction contracting as Kenstar's primary identity.

The creative concept is:

THE MAKING OF A SPACE

Supporting message:
FROM THE FIRST LINE TO THE FINAL LIGHT.

Construction is the visual storytelling language that connects the different business activities.

## 2. Mandatory interaction constraints

There must be exactly THREE primary animated experiences:

1. The Kenstar logo animation.
2. The showroom category gateway carousel.
3. The six-chapter first-person architectural journey.

Do not introduce additional decorative animation systems or unnecessary interactive experiences.

### Logo animation

Preserve the established concept:

- Geometric wireframe logo construction.
- Two upper window shapes behaving like expressive eyes.
- Varied, natural-looking eye movements and expressions.
- Randomised but controlled eye animation sequences.
- Logo resolves into its finished identity.
- The star expands to reveal the homepage.

### Showroom carousel

Create six category-driven architectural portals.

The active category must dynamically update:
- Main image
- Headline
- Description
- Primary CTA
- Secondary CTA
- Category index

The carousel must feel like entering a premium showroom, not using a generic slider.

No forced autoplay.

### First-person journey

The journey must contain SIX connected chapters:

01. Approach — Roadworks and infrastructure.
02. Structure — Construction and civil works.
03. Materials — Hardware and building supplies.
04. Systems — Electricals, lighting, bathroom and toiletries.
05. Finish — Beautification, finishing and furniture.
06. Arrival — Furnished accommodation.

Automotive and garage must be represented in the wider site architecture if verified, but do not force it into the six-stage journey.

The tour must be scroll-driven.

Each chapter must progress through:

WIREFRAME → PHOTOREALISTIC ENVIRONMENT → ACTUAL KENSTAR PHOTOGRAPHIC EVIDENCE.

The wireframe and realistic scenes must use matching geometry, camera perspective and composition.

Real Kenstar photographs must appear as contextual AR-inspired Field Notes connected to the relevant environment.

The tour must be reversible when scrolling upwards.

Do not replace this concept with a conventional video slideshow or a series of unrelated image sections.

Prefer Blender-produced, pre-rendered image sequences and a 2D Canvas/GSAP implementation where appropriate. Do not introduce Three.js unless a specific requirement justifies it.

## 3. Visual design direction

Establish a distinctive visual identity combining:

- Swiss editorial precision.
- Contemporary architectural luxury.
- Technical construction documentation.
- Premium interior and showroom photography.
- Industrial design restraint.
- Strong typographic hierarchy.
- Mathematical grid systems.

Use these initial colour candidates:

Midnight: #14283B
Limestone: #F2EFE8
Graphite: #343A40
Mineral: #89949B
Burnt amber: #C58B45
Muted olive: #697B68
White: #FFFFFF

Evaluate Manrope and Inter as typography candidates.

Do not blindly apply dark backgrounds and blueprint graphics to every page.

The homepage may use dramatic architectural imagery and technical surfaces. Other pages should use sophisticated editorial compositions with generous whitespace, photography and restrained architectural details.

## 4. Inspiration references

Study these references for specific principles:

- Ferrow Interiors: architectural environments developing through scroll.
  https://codethatmoves.com/motion/

- Illoca: architectural editorial direction and the relationship between sketches and finished work.
  https://rickcreates.com/

- Pearl Towers: pre-rendered architectural sequences controlled by scrolling.
  https://contra.com/p/6Flmm6RF-pearl-towers-3-d-building-on-scroll

- GSAP Scroll Image Sequence:
  https://gsapvault.com/effects/scroll-image-sequence/

- Archon image-sequence demonstration:
  https://dev.viseni.com/demos/archon-videoscroll-demo

- GSAP website inspiration collection:
  https://www.landing.love/collection/gsap/

These are sources of inspiration, not templates to clone.

## 5. Website architecture

The proposed primary routes are:

/ — Home
/products — Products and showroom catalogue
/construction — Construction and roadworks
/accommodation — Furnished accommodation
/about — About Kenstar
/contact — Visit and contact

Automotive and garage may receive a dedicated route after company verification.

Create reusable templates for product categories, project details and enquiry experiences.

## 6. Other pages

The homepage establishes the visual design system.

The other pages must inherit its:
- Typography.
- Colours.
- Grid.
- Spacing.
- Component language.
- Image treatment.
- Architectural graphic vocabulary.
- Motion principles.

However, do not duplicate the homepage's cinematic first-person journey across every page.

Allow each page to have an independently considered editorial layout and content hierarchy.

## 7. Current task

For now, DO NOT implement the redesign.

Inspect the current project and report:

1. Existing application architecture.
2. Existing homepage structure.
3. Existing logo animation implementation.
4. Existing carousel implementation.
5. Existing six-category journey implementation.
6. Current design inconsistencies.
7. Missing features relative to this brief.
8. Performance concerns.
9. Recommended implementation sequence.
10. Files and components that should be preserved, refactored or replaced.

Be critical. Do not assume the existing implementation is correct simply because it already exists.

Present the audit and wait for approval before beginning implementation.
