---
name: Kenstar Limited
description: Architectural editorial luxury for a hardware and home showroom on Market Road, Embu.
colors:
  midnight: "#14283B"
  midnight-deep: "#0C1A28"
  midnight-raised: "#1C3348"
  limestone: "#F2EFE8"
  stone: "#E6E1D6"
  white: "#FFFFFF"
  limestone-muted: "#DCD8D0"
  graphite: "#343A40"
  graphite-soft: "#565D63"
  mineral-light: "#AAB3B8"
  brass: "#C58B45"
  brass-light: "#D6A160"
  brass-ink: "#865826"
  olive: "#697B68"
  olive-light: "#93A691"
  error: "#A8321E"
  error-light: "#F08A73"
  logo-navy: "#0B2D52"
  star-gold: "#F59E0B"
typography:
  display-1:
    fontFamily: "Manrope, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(3.25rem, 2.23rem + 4.19vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.94
    letterSpacing: "-0.04em"
  display-2:
    fontFamily: "Manrope, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.94rem + 2.29vw, 4rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.72rem + 1.14vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Manrope, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.5625rem, 1.49rem + 0.29vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title-sm:
    fontFamily: "Manrope, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  lede:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.08rem + 0.19vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.006em"
  body:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  small:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  caption:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.08em"
    fontFeature: "tnum"
  action:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "0.9688rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.003em"
rounded:
  none: "0px"
  marker: "50%"
spacing:
  margin-phone: "20px"
  margin-tablet: "40px"
  margin-desktop: "clamp(48px, 5vw, 96px)"
  col-gap-phone: "16px"
  col-gap-tablet: "20px"
  col-gap-desktop: "24px"
  section-y: "clamp(64px, 4rem + 4vw, 144px)"
  header-phone: "60px"
  header-desktop: "72px"
  content-max: "1600px"
components:
  button-primary-midnight:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.midnight-deep}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    padding: "0 22px 0 20px"
    height: "48px"
  button-primary-midnight-hover:
    backgroundColor: "{colors.brass-light}"
  button-primary-light:
    backgroundColor: "{colors.midnight}"
    textColor: "{colors.limestone}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    padding: "0 22px 0 20px"
    height: "48px"
  button-primary-light-hover:
    backgroundColor: "{colors.midnight-deep}"
  button-secondary:
    backgroundColor: "transparent"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    padding: "0 22px 0 20px"
    height: "48px"
  button-sm:
    padding: "0 16px 0 14px"
    height: "40px"
  button-lg:
    padding: "0 28px 0 26px"
    height: "56px"
  icon-button:
    backgroundColor: "transparent"
    rounded: "{rounded.none}"
    size: "44px"
  input-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.graphite}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
    height: "48px"
  input-midnight:
    backgroundColor: "{colors.midnight-deep}"
    textColor: "{colors.limestone}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
    height: "48px"
  chip:
    backgroundColor: "transparent"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.midnight-deep}"
  header:
    backgroundColor: "{colors.midnight}"
    textColor: "{colors.limestone}"
    height: "72px"
  action-bar-whatsapp:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.midnight-deep}"
    height: "56px"
  field-note:
    backgroundColor: "{colors.midnight-deep}"
    textColor: "{colors.limestone}"
    width: "300px"
  plate-label:
    backgroundColor: "{colors.midnight-deep}"
    textColor: "{colors.limestone}"
    typography: "{typography.label}"
    padding: "6px 10px"
  visualisation-label:
    backgroundColor: "{colors.limestone}"
    textColor: "{colors.graphite-soft}"
    typography: "{typography.label}"
    padding: "4px 8px"
---

# Design System: Kenstar Limited

## Overview

**Creative North Star: "The Showroom After Dark, Set as a Drawing Sheet"**

Kenstar is architectural editorial luxury: Swiss order, contemporary architecture, the showroom's own photography and the plain honesty of construction documents. Two environments carry every page. Midnight is the hour the chandeliers are lit, and it holds the cinematic and arrival moments: the header, the homepage showroom, the visit sections, the door sign, the enquiry bands and the footer. Limestone is the showroom by day, the warm stone of its floor and walls, and it holds reading and browsing: Products, Construction, About and Contact. White serves one page, the Accommodation spread, as an interiors magazine would.

Structure comes from rules, not boxes. Sections open on a 2px rule, ledgers and schedules are ruled with hairlines, facts sit in key and value rows, and codes are set in tracked technical type. Corners are square everywhere except one cut: the 45° chamfer from the KENST★R wordmark, which marks the primary action and the midnight Field Note. Photography is evidence. It is cropped and lightly corrected, never tinted, and every stand-in or render says what it is.

Motion is construction, and only three experiences perform: the logo loader, the showroom carousel and the homepage journey. Everywhere else, motion is feedback: a 160ms colour change, a 3px arrow nudge, a 1px press.

**Key Characteristics:**
- Two environments, midnight and limestone, alternate by purpose, with white for the Accommodation spread.
- Brass marks what is selected or current and fills the one primary on midnight. Star gold lives only in the logo.
- Manrope for everything large, Inter for everything read or measured.
- A 2px rule opens each section, hairlines rule everything else, and there are no cards.
- Square corners, with a 45° cut on primary actions (10px) and Field Notes (14px).
- Only three experiences animate. Elsewhere, motion is feedback only.
- Images say what they are: "Illustrative photo" on stand-in stock, "Visualisation" on renders.

## Colors

Every colour is a material from the showroom photographs: midnight glass, limestone floor, graphite taps, brass fittings, olive from the landscape outside.

Environments are applied as classes (`env-midnight`, `env-limestone`, `env-white`, `env-deep`) that set the semantic roles: surface, surface-alt, surface-raised, text, text-strong, text-soft, line (16% or 14%), line-strong (42% or 38%), accent, accent-ink, action-bg, action-fg, focus, status-open, error and field-bg. New work uses the roles, not raw hex values.

### Primary
- **Midnight** (#14283B): the cinematic ground. The header on every page, the homepage showroom, the visit and enquiry bands, the door sign, the stage strip and the phone action bar. It is also the filled primary action on limestone and white, and the strong text colour (text-strong) on light grounds.
- **Midnight Deep** (#0C1A28): the footer (`env-deep`), the Field Note plate, the schedule note field, the image letterbox behind photographs, the phone copy plate on Construction and the text on brass. It is never a general section colour.
- **Midnight Raised** (#1C3348): the surface-raised role inside midnight.

### Secondary
- **Brass** (#C58B45): the one accent. It fills the primary action on midnight and the WhatsApp cell of the phone action bar. As a marker, it shows the current nav item (2px underline), a checked chip, a scheduled product line (filled code and a 10% wash), the active journey pin and today's row on the door sign.
- **Brass Light** (#D6A160): accent-ink and focus on midnight, the primary hover there, and Field Note numbers.
- **Brass Ink** (#865826): accent-ink on light grounds (5.3:1). Used for markers and selected states only, such as the current stage number and a scheduled line's button.

### Tertiary
- **Olive** (#697B68) and **Olive Light** (#93A691): status-open on light and on midnight. They are the open-now dot and the sent confirmation, and never text.

### Neutral
- **Limestone** (#F2EFE8): the editorial ground. Text on midnight, the journey plate, and the "Visualisation" label plate.
- **Stone** (#E6E1D6): surface-alt on limestone, behind images while they load, and on the counter-view note.
- **White** (#FFFFFF): the Accommodation ground, and form fields on light grounds.
- **Limestone Muted** (#DCD8D0): ledes and detail lines set on midnight (the Construction lede, the door sign detail, and journey text at dusk).
- **Graphite** (#343A40): all running text on light (10:1).
- **Graphite Soft** (#565D63): secondary text, keys and captions on light.
- **Mineral Light** (#AAB3B8): secondary text on midnight.
- **Error** (#A8321E) and **Error Light** (#F08A73): form errors on light and on midnight, as a 2px inset field ring and a message line.

### Brand marks
- **Logo Navy** (#0B2D52) and **Star Gold** (#F59E0B): inside the KENST★R logo only. The logo appears in full colour only on light grounds. On midnight it is reversed: white letters and panes, gold star. The header, loader and counter view follow this.

### Legacy, pending migration
`app/globals.css` still carries the old drafting-sheet palette in `:root`: `--paper` #F3F6F9, `--paper-2` #E6ECF2, `--navy` #0B2D52, `--navy-deep` #06203D, `--navy-soft` #3C5878, `--on-navy-soft` #A9BED6, `--gold` #F59E0B, `--gold-hot` #FFC24D, `--error` #B42318, the navy line tokens and `--gutter`. It also keeps the classes that go with them (`.btn-gold`, `.btn-navy`, `.btn-line`, `.display`, `.heading`, `.letter`, `.sheet`, `.textlink`, `.status-dot`, the chamfer utilities). Only the homepage sections that haven't moved yet use them (`Showroom.tsx`, `Services.tsx`, `Enquiry.tsx`, and the `OpenStatus` component that Showroom renders). They are not part of this system. Delete them when the last of those sections moves.

### Named Rules
**The Brass Marks the Choice Rule.** Brass shows what is selected, current or active, and fills the one primary action on midnight. It is never a decorative line, a background wash outside a selection, or running text. Brass at full strength is never text on limestone or white (2.6:1). Brass ink carries accent text there.

**The Logo Owns the Star Rule.** Star gold and logo navy appear only inside the logo. They are not UI colours, not a selection colour, and not a highlight.

**The Environment Changes, the Box Doesn't Rule.** A section is either midnight or limestone (white on Accommodation). Midnight deep is a ground for plates, images and the footer, never a third section colour.

## Typography

**Display Font:** Manrope (with Segoe UI, system-ui, sans-serif)
**Body Font:** Inter (with Segoe UI, system-ui, sans-serif)
**Label Font:** Inter in tracked caps with tabular figures

**Character:** Manrope's geometric build and flat terminals answer the chamfered wordmark when it is set large and heavy. Inter sets everything read or measured, compact, with true tabular figures for hours, codes and counts. The pair works through scale and weight contrast, never side by side at one size.

### Hierarchy
- **Display 1** (Manrope 600, 52–96px, 0.94, −0.04em): route openers at cinematic scale. The Accommodation headline and the door-sign state run at this scale too.
- **Display 2** (Manrope 600, 40–64px, 1.0, −0.035em): cinematic openers, such as the homepage showroom title, the Construction hero and the footer closing line.
- **Headline** (Manrope 600, 32–44px, 1.08, −0.03em): page, range and stage titles. Editorial pages set their H1s from this level to about 60px.
- **Title** (Manrope 700, 25–28px, 1.2, −0.02em): titles inside a section.
- **Title small** (Manrope 700, 20px, 1.3, −0.01em): product lines, service rows, stage-strip names and range links.
- **Lede** (Inter 400, 18–20px, 1.55, max 58ch): section introductions.
- **Body** (Inter 400, 17px, 1.65, max 66ch): running text. The page base is set by `.k-page`.
- **Small** (Inter 400, 15px, 1.55): secondary lines, fact values, footer columns, the header status.
- **Caption** (Inter 500, 13px, 1.45): source lines and short notes.
- **Label** (Inter 500, 12px, +0.08em, uppercase, tabular): product codes, table keys, footer column heads, Field Note headers and image labels.
- **Action** (Inter 600, 15.5px, sentence case): buttons and text links. Nav links are Inter 500 at 15px.

### Named Rules
**The Two Faces, Two Jobs Rule.** Manrope never goes below 20px and Inter never above 24px. Headings are 600 at display sizes and 700 at Title sizes. Text is 400, and emphasis is Inter 600, never colour or caps.

**The Caps Carry Facts Rule.** Tracked caps carry codes, table keys, captions, note headers and image labels, and nothing else. There are no eyebrows or kickers: a caps label never sits above a headline to introduce it. A block has at most one.

**The Strong Heading Rule.** On light grounds, headings take text-strong (midnight) and body takes graphite. A heading is never soft.

## Layout

The grid is 4, 8 and 12 columns, stepping at 768px and 1280px. Margins are 20px, 40px and `clamp(48px, 5vw, 96px)`. Column gaps are 16px, 20px and 24px. Content sits in `.k-wrap`, which is 1600px wide at most. Cinematic images (the showroom carousel, the Construction hero, the About photograph and the Accommodation lounge) bleed full width.

Sections breathe at `clamp(64px, 4rem + 4vw, 144px)`. Each one opens with a 2px text-strong rule over its heading, with 14px between rule and heading. Inside a section, editorial pairs are deliberately asymmetric: 5 + 7 or 7 + 5 at 1024px and up, with the gap doubled to `--col-gap × 2`. Twelve-column splits put the heading in columns 1–5 and the content in 7–12. Phones stack image above text. Their composition is designed, not squeezed.

The header is 60px on phones and 72px from 1280px. Two sticky strips sit under it: the Products range index (49px) and the Construction stage strip (64px, 76px from 1024px). Anchor targets clear both through `scroll-margin-top`. On phones a 56px action bar is fixed to the bottom. The footer and page bottoms pad for it, and the Products schedule bar takes its place once the schedule has items.

Breakpoints in use are 768, 1024, 1280 and 1440px. 1024 is where pairs go side by side and the schedule docks. 1440 is where product lines run in a single row.

## Elevation & Depth

The system is flat. Depth comes from a change of environment (limestone to midnight, midnight to midnight deep), never from lifting a box. Hairlines are drawn as 1px inset box-shadows or borders, so they stay crisp and take part in hover states.

### Shadow Vocabulary
- **Field Note lift** (`filter: drop-shadow(0 16px 32px rgb(12 26 40 / 0.32))`): only under a Field Note floating over the journey scene.
- **Dialog backdrop** (`rgb(12 26 40 / 0.6)`): behind the phone schedule sheet. The counter view uses an opaque midnight-deep backdrop.
- **Photo scrim** (midnight-deep gradients up to 0.95): only where words sit over a photograph, from the edge the words sit on (the bottom on phones, the left side on wider screens).

### Named Rules
**The Flat Ground Rule.** Nothing floats except the Field Note. A container is separated by a rule, a hairline or a change of environment, never a drop shadow, blur or glass layer.

## Shapes

Every corner is square (0px). The one silhouette is the 45° chamfer from the wordmark, cut at the top-right of primary actions (10px, drawn with a gradient so the focus ring stays visible) and the top-left of midnight plates (14px, a `clip-path`). The plates are the journey Field Note, the docked "Your schedule" panel, its index cell and the phone schedule sheet. True circles are kept for markers: the 8px status dot and the numbered journey pins.

Lines come in two weights: a 1px hairline (line at 14–16%, line-strong at 38–42%) and a 2px rule that opens a section, a range, a stage or the counter list. A 2px or 3px inset bottom marks the current tab or index cell, and a 3px inset left marks today's row.

**The One Cut Rule.** The 45° cut appears on the primary action and on midnight Field Note plates, nowhere else. No radii, no pills, no rounded photos.

## Components

### Buttons
Square, confident and few. Labels are verbs in sentence case.
- **Shape:** square, with a 10px 45° cut at the top right on the primary only.
- **Primary:** filled with action-bg. On midnight that is brass with midnight-deep text, hovering to brass light. On limestone and white it is midnight with limestone text, hovering to midnight deep. Inter 600, 48px high (40px small, 56px large). Each view has one.
- **Secondary:** transparent, with a 1px inset line-strong ring that turns full text colour on hover. Used for call, directions, email and the header's WhatsApp.
- **Icon button:** 44px square with the same 1px ring, for the menu, carousel steps and close.
- **Text link:** underlined at 35% of the current colour, solid on hover, often with a trailing arrow that nudges 3px.
- **States:** colour changes in 160ms on the ease-out curve, a press drops 1px, the focus ring is 2px in the focus colour with a 3px offset, and disabled is 40% opacity.

### Chips
- **Style:** 44px tall, 16px side padding, Inter 500 15px, with a 1px line-strong inset ring. They are real radio inputs under the label.
- **State:** checked fills brass with midnight-deep text, hover strengthens the ring, and keyboard focus draws the 2px ring.

### Inputs / Fields
- **Style:** square, 48px tall, 12px × 14px padding, Inter 16px. The field background is white on light and midnight deep on midnight, with a 1px line-strong inset ring and a brass caret. The label sits above in Inter 500 15px, with "(optional)" in soft text.
- **Focus:** a 2px focus-colour outline with a 2px offset. Hover strengthens the ring to text.
- **Error:** a 2px inset error ring and an Inter 500 14px message below, in error or error light.

### Enquiry form
One form serves every page (project, stay and general). It sends nothing itself. It checks the fields, writes the message, and opens WhatsApp (the primary) or email (the secondary) with that message filled in. A status line confirms what opened.

### Navigation
- **Header:** midnight on every page, sticky, with a 1px line at its base. The logo is reversed with its gold star, 30px tall (34px from 1280px). Nav links are Inter 500 15px in soft text, turning full text on hover. The current page takes a 2px brass underline. From 1280px the header shows the live open status (dot and line) and an outlined small "WhatsApp us" button. It stays secondary everywhere, so each page's own primary is the one filled, cut-corner control in view.
- **Phone menu:** a full-height midnight sheet of Manrope 600 28px links, ruled with hairlines and trailing arrows, followed by the status line and the address.
- **Phone action bar:** fixed, 56px, three cells (WhatsApp in brass, Call, Directions) split by hairlines. It never hides on scroll.
- **Sticky index strips:** the Products range index and the Construction stage strip. Ruled cells hold a tabular code or number, a name and a count or trade. The current cell takes a 2–3px inset brass or brass-ink base, and on phones the strip scrolls sideways with a fading right edge.

### Ruled ledgers and fact rows
Facts are set as key and value rows: a label key in soft text, a value in Inter, hairlines between rows and a 2px rule at the head. This covers the About ledger (four confirmed figures in Manrope 600 up to 64px), the visit facts (Today, Hours, Address), the Products title-block meta and the Construction facts.

### Finishes schedule (Products)
Each range opens on a 2px rule with a code and a Headline name. Its product lines are ruled rows: a code in an outlined label cell, a 4:3 photograph, a Title-small name with one soft line, and an "Add to schedule" secondary. A scheduled line fills its code brass, washes the row with brass at 10% and turns its button brass ink. From 1024px, "Your schedule" docks as a midnight Field Note with a 14px cut, holding items, a note field and the WhatsApp primary. On phones it becomes a bottom bar and a sheet. "Show at the counter" opens a full-screen limestone view with the logo, Manrope names and the note, large enough to read across a counter.

### Field Note (journey)
A 300px midnight-deep plate with a 14px top-left cut. A header row holds the note number in brass light and the range in soft label caps, followed by a 4:3 Kenstar photograph, one true sentence, its source line and a link into the range. A reticle anchors it in the scene, at 40% when at rest. Below 1280px the reticles become numbered circular pins (the active one fills brass), and one note at a time docks to the bottom of the scene.

### Image labels
- **Plate label:** a midnight-deep plate, bottom left, in limestone label caps, naming what and where ("The lighting hall").
- **Visualisation:** a limestone plate in soft label caps on every render (the journey scenes and the Construction hero).
- **Illustrative photo:** label caps on every stand-in stock image (carousel ranges and product lines). Every shipping raster carries embedded provenance.

### Live status
The status line and the door sign read the showroom hours live in Africa/Nairobi time: an 8px dot that turns olive when open, and a sentence on what happens next. On Contact the state is set at Display scale on a midnight panel. The week is a ruled table with today's row in brass ink, a 3px brass inset and a small "Today" tag.

### Footer
Midnight deep. A Display 2 closing line ("From the first line to the final light."), then four columns (Visit, Hours, Contact, Explore) under label-caps heads, and a base row under a hairline.

### Motion
- **Logo loader:** at most about 3.6s, skippable, once per session, with no loader under reduced motion. Construction lines draw, the letters fill, the window panes glance and blink, and the star opens onto the page.
- **Showroom carousel:** manual only. A new range opens as a window out of its thumbnail and grows to fill the screen (about 900ms, in-out), with its edge drawn as a hairline. The headline lines rise 12px in a 60ms stagger.
- **Journey:** scrubbed to native scroll on a sticky stage, reversing exactly. It holds at each Field Note, and the plate turns midnight at dusk over 480ms. Under reduced motion it shows each chapter's final still with its notes open.
- **Everywhere else:** feedback only. Transitions run 160ms (colour) or 240ms (arrow nudge, row wash) on `cubic-bezier(0.16, 1, 0.3, 1)`. Scroll position drives only which index cell is current.

## Do's and Don'ts

### Do:
- **Do** build every section in an environment class (`env-midnight`, `env-limestone`, `env-white`) and style through its roles (surface, text, text-strong, line, accent, action-bg).
- **Do** give each view one primary: filled, with a 10px cut. Brass on midnight, midnight on limestone and white. Keep the header's WhatsApp outlined.
- **Do** open sections, ranges and stages with a 2px text-strong rule, and rule lists and facts with 1px hairlines.
- **Do** set codes, keys, captions and image labels in 12px Inter caps at +0.08em with tabular figures.
- **Do** label stand-in stock "Illustrative photo" and every render "Visualisation", and embed provenance in every shipping raster.
- **Do** use the authored icon set (24px grid, 1.75 stroke, square caps, mitre joins) at 18–20px.
- **Do** keep touch targets at 44px or more, and the focus ring at 2px in the environment's focus colour.
- **Do** let enquiries open WhatsApp or email with the message written. The site itself sends nothing.

### Don't:
- **Don't** use star gold (#F59E0B) or logo navy (#0B2D52) outside the logo, or show the full-colour logo on midnight.
- **Don't** use brass as decoration or as running text on light grounds. It marks selection and fills the primary on midnight.
- **Don't** put a tracked-caps eyebrow or kicker above a headline.
- **Don't** round corners, add drop shadows (except under a Field Note), or use blur or glass.
- **Don't** cut a corner anywhere but the primary action and midnight Field Note plates.
- **Don't** animate outside the logo loader, the showroom carousel and the journey: no scroll fades, parallax or cursor effects.
- **Don't** tint, duotone or recolour product photography, or present stock or rendered images as Kenstar's own.
- **Don't** build new work on the legacy palette or classes (`--paper`, `--navy`, `--gold`, `.btn-gold`, `.letter`, Archivo, Barlow).
