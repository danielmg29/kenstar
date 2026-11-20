---
name: Kenstar Limited
description: A drawing set being built into a lit room, for a hardware and home showroom in Embu.
colors:
  drafting-white: "#F3F6F9"
  drafting-white-2: "#E6ECF2"
  architectural-navy: "#0B2D52"
  opening-navy: "#06203D"
  navy-soft: "#3C5878"
  on-navy-soft: "#A9BED6"
  star-gold: "#F59E0B"
  star-gold-hot: "#FFC24D"
  line: "rgb(11 45 82 / 0.22)"
  line-strong: "rgb(11 45 82 / 0.55)"
  line-on-navy: "rgb(243 246 249 / 0.22)"
  error: "#B42318"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2.4rem, 5.4vw, 4.75rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.025em"
    fontVariation: "\"wdth\" 120"
  headline:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 3.6rem)"
    fontWeight: 750
    lineHeight: 1.02
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 112"
  title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "1.65rem"
    fontWeight: 750
    lineHeight: 1.02
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 112"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    fontVariation: "\"wdth\" 100"
  lede:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.09em"
    fontFeature: "\"tnum\" 1"
  action:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    letterSpacing: "0.02em"
rounded:
  none: "0px"
  round: "999px"
spacing:
  gutter: "clamp(1rem, 3vw, 2.5rem)"
  header: "4rem"
  section: "5rem"
  section-md: "7rem"
  chamfer-button: "0.75rem"
  chamfer-panel: "2.25rem"
  container: "1600px"
components:
  button-primary:
    backgroundColor: "{colors.star-gold}"
    textColor: "{colors.opening-navy}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.35rem 0.75rem 1.2rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.star-gold-hot}"
    textColor: "{colors.opening-navy}"
  button-navy:
    backgroundColor: "{colors.architectural-navy}"
    textColor: "{colors.drafting-white}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.35rem 0.75rem 1.2rem"
    height: "3rem"
  button-navy-hover:
    backgroundColor: "{colors.opening-navy}"
    textColor: "{colors.drafting-white}"
  button-line:
    textColor: "{colors.architectural-navy}"
    typography: "{typography.action}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.35rem 0.75rem 1.2rem"
    height: "3rem"
  input-field:
    backgroundColor: "{colors.drafting-white}"
    textColor: "{colors.architectural-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
  title-block:
    backgroundColor: "{colors.drafting-white}"
    textColor: "{colors.architectural-navy}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
  headline-panel:
    backgroundColor: "{colors.architectural-navy}"
    textColor: "{colors.drafting-white}"
    rounded: "{rounded.none}"
    padding: "2.75rem 3rem"
  status-dot:
    backgroundColor: "{colors.star-gold}"
    rounded: "{rounded.round}"
    size: "0.55rem"
---

# Design System: Kenstar Limited

## Overview

**Creative North Star: "The Drawing Set That Switches On"**

Every surface is a sheet from an architect's drawing set: cool drafting white, architectural-navy linework, real drafting conventions (sheet frames with registration ticks, dimension lines with 45° tick terminators, title blocks, schedules, grid bubbles, numbered sheets). The lines then resolve into Kenstar's own showroom photographs, and the set ends when the final light switches on in gold. The drawing is never decoration: every annotation states a fact or is a working link.

The palette comes straight from the KENST★R lockup: navy letters, a gold star that doubles as the A. Navy is used as whole fields, not accents; gold is used as light, not colour. Photography carries every other colour. Type pairs a heavy, expanded Archivo for headlines with Barlow Semi Condensed lettering for annotations and actions, so headlines read like a sheet title and labels read like a draughtsman's hand.

Density is generous and structured: hairline-ruled tables and schedules instead of cards, square corners cut at 45° instead of radii, and depth from tonal fields instead of shadows. Motion is drafting: lines draw, fills resolve, wipes travel behind a gold construction line, nothing bounces.

**Key Characteristics:**
- Cool drafting white sheets with navy linework; navy owns whole fields.
- Gold only for the star, light, and the primary action.
- 45° chamfers from the wordmark; gable-topped openings from the logo's house.
- Expanded heavy Archivo headlines; tracked Barlow Semi Condensed lettering with tabular figures.
- Hairline sheet frames, ruled title blocks and schedules; no cards, no shadows, no radii.
- Drafting motion: draw, resolve, wipe. Scroll-scrubbed on native scroll, with a still resting state.

## Colors

A two-tone architectural palette (drafting white and navy) lit by a single gold, with photography supplying everything else.

### Primary
- **Architectural Navy** (architectural-navy): the ink of the system. All text and linework on paper, and the whole-field colour for the gateway band, the hero headline panel, the Final light chapter, the showroom section and the footer. Also the theme colour and the default focus ring.
- **Opening Navy** (opening-navy): a deliberate second field tone, used only for openings and figure grounds: the gable-topped gateway doorways, the Final light figure, and text on gold buttons. Also the hover state of navy buttons.

### Secondary
- **Star Gold** (star-gold): light. The star in the lockup, the open-now status dot, the Final light lamp glow, the phone action bar's WhatsApp cell, and the primary action button. The focus ring on navy fields. Text selection highlight.
- **Hot Gold** (star-gold-hot): hover state of the primary button only.

### Neutral
- **Drafting White** (drafting-white): the sheet. Page background, title blocks, form surfaces, light-ground figures, and text on navy.
- **Drafting White 2** (drafting-white-2): the enquiry band only, plus hover fills on title-block cells and the scrollbar track.
- **Navy Soft** (navy-soft): secondary text and label lettering on paper (title-block keys, ledes, schedule scope lines).
- **On-Navy Soft** (on-navy-soft): secondary text and label lettering on navy fields.
- **Line / Line Strong / Line on Navy** (line, line-strong, line-on-navy): hairlines at 22% navy for rules and frames, 55% navy for registration ticks and input borders, 22% white for rules on navy.
- **Error** (error): field borders and messages for invalid form input only.

### Named Rules
**The Gold Is Light Rule.** Gold appears only where there is a star, a light, or the primary action. There is no gold text on paper, and no gold haze or glow laid over a navy field (it reads as mud); the light lives inside photographs and marks.

**The Whole Field Rule.** Navy is applied as entire sections or panels, never as tinted cards or accent stripes. A section is either a paper sheet or a navy field.

**The Opening Rule.** Opening navy is reserved for openings and figure grounds. It is not a general dark surface.

## Typography

**Display Font:** Archivo variable, width axis (with Arial Narrow, sans-serif)
**Body Font:** Archivo at normal width (with system-ui)
**Label/Mono Font:** Barlow Semi Condensed 400/500/600 (with Arial Narrow)

**Character:** Archivo pushed wide and heavy reads like the title on a drawing sheet; Barlow Semi Condensed in tracked caps with tabular figures reads like hand-lettered annotation. Together they are technical without becoming monospace.

### Hierarchy
- **Display** (800, width 120, clamp(2.4rem, 5.4vw, 4.75rem); hero rises to clamp(2.7rem, 6.2vw, 5.6rem); line-height 0.94, -0.025em, balanced): section titles and chapter names.
- **Headline** (750, width 112, clamp(2rem, 4.2vw, 3.6rem), 1.02, -0.02em): secondary section titles (ranges, services) and the hero subline.
- **Title** (750, width 112, 1.45 to 1.65rem): range names, chapter range names, service rows, mobile nav items.
- **Body** (400, 1.0625rem, 1.55): running text. Ledes at 1.125rem, capped at 62ch, wrapped pretty.
- **Label** (Barlow 500, 0.75rem default, scalable to about 0.95rem, 0.09em tracking, uppercase, tabular figures): title-block keys, sheet headers ("Detail 03", "Sheet 03 of 06"), counters, figure captions, drawing annotations, grid-bubble numbers.
- **Action** (Barlow 600, 1rem, 0.02em, sentence case): buttons, text links, title-block actions, nav.

### Named Rules
**The Lettering States Facts Rule.** Tracked caps are for annotations that carry a fact: a key, a sheet number, a dimension, a counter, a caption. They never sit above a headline as a decorative kicker.

**The Sentence-Case Action Rule.** Actions are set in sentence case Barlow semibold, never tracked caps.

## Layout

A 1600px maximum container with a fluid gutter (clamp(1rem, 3vw, 2.5rem)) and a 4rem sticky header. Sections breathe at 5rem vertical padding, 7rem from 768px. Two-column sections split 5:7 (text left, figure right) from 1024px; the chapter story adds a 14rem sheet-index column on the left.

The first viewport is one framed sheet: a full-bleed showroom photograph inside a sheet frame, a chamfered navy headline panel bottom left, a ruled drafting-white title block bottom right, and the top of the navy gateway band at the fold. On phones these stack: photo, navy panel, title block.

The chapter story uses CSS-sticky stages (each chapter 165vh tall, its stage pinned for one viewport) so native scroll is never hijacked. Below 1024px the sheet index becomes a sticky horizontal chip bar under the header, and stages run in normal flow. Below 768px a fixed bottom action bar (WhatsApp, Call, Directions) is always present, and drawing labels become numbered markers keyed in the figure caption.

Structure comes from rules, not boxes: title blocks are ruled definition grids, services are a schedule of ruled rows under a 2px navy top rule, lists are hairline-separated.

## Elevation & Depth

Flat. There are no shadows anywhere. Depth comes from tonal fields (paper sheet, navy field, opening navy figure ground), from photographs seen through drawn openings, and from hairline frames with registration ticks. The only inset "shadow" is the 1px outline of the line button, which is a stroke, not elevation.

### Named Rules
**The Drawn, Not Lifted Rule.** Nothing floats. Separation is a ruled line, a sheet frame, or a change of field; never a drop shadow, blur, or glass layer.

## Shapes

Square corners throughout (0 radius). The one recurring corner is the 45° chamfer taken from the KENST★R wordmark: 0.75rem on buttons (cut with a gradient so focus outlines stay visible), about 2.25rem on the hero headline panel (cut with clip-path from 1024px). Range gateways are gable-topped openings (clip path rising from 18% at the sides to a ridge at centre) taken from the logo's house, with an architrave line drawn 10px outside. Only true circles are round: the status dot and the grid bubble that carries each chapter number.

Sheet frames are a 1px hairline with 14px registration ticks overhanging the top-left and bottom-right corners by 4px.

## Components

### Buttons
Chamfered, sentence-case, and confident.
- **Shape:** square with the top-right corner cut at 45° (0.75rem), minimum 3rem tall.
- **Primary (gold):** star gold with opening-navy text. One per view: the main action of that field (Explore the ranges, Directions, the Final light enquiry). Hover warms to hot gold.
- **Navy:** architectural navy with drafting-white text; the default action on paper (WhatsApp in the header, chapter enquiries, form submit). Hover deepens to opening navy.
- **Line:** a 1px inset stroke in the current colour; hover adds a 6% navy (on paper) or 10% white (on navy) wash. Secondary actions.
- **Motion:** colour transitions over 0.25s on the expo ease-out; trailing arrows nudge 3px on hover; press drops 1px.

### Text links
Barlow semibold with a 40% current-colour underline that goes solid on hover, usually with a trailing arrow or a leading channel icon.

### Title block
The showroom's facts set like a drawing's title block: a ruled definition grid with Barlow label keys in navy soft (Showroom, Today, Hours), values in body text, and a two-cell action row (Directions, Call) that fills with drafting white 2 on hover. On navy fields the same grid uses on-navy rules and keys.

### Sheet frame and chapter figure
A hairline frame with registration ticks. The chapter figure adds a ruled sheet header in lettering ("Detail 03: Bathroom" / "Sheet 03 of 06"), a 3:2 drawing-and-photo stage, and a ruled caption. The Final light figure sits on opening navy.

### Drawing annotations
Line drawings traced in the photograph's own coordinate space so drawing and photo register. Dimension lines carry 45° tick terminators; leaders end in a dot. Annotation lettering always sits on a solid plate (drafting white with navy ink on paper; opening navy with white ink on the Final light figure) so it holds over photographs. Below 768px the labels give way to numbered circular markers and the caption carries the key.

### Gateway carousel
On the navy band: gable-topped openings on opening navy with the range photograph seen through them, a range number in lettering, the range name as a title, the items, and two text links. Manual only: square 3rem prev/next buttons on on-navy hairlines, a tabular "01–03 of 06" counter, swipe and arrow keys. A range without a photo shows its drawing with a "Photo to come" plate.

### Inputs / Fields
- **Style:** drafting-white field, 1px line-strong border, square, 0.75rem by 1rem padding, Barlow semibold labels above.
- **Focus:** border and a 2px outline in architectural navy; the caret is gold.
- **Error:** border and message in the error red, with the first invalid field focused.

### Navigation
A sticky drafting-white header (95% opacity) under a hairline: wordmark left, Barlow medium links that take a 2px gold underline on hover, a navy WhatsApp button. Below 1024px a full-height drafting-white menu with title-size ruled rows. The chapter sheet index is a ruled ordered list with a square marker that fills navy for the active sheet.

### Status dot
A 0.55rem circle: gold when the showroom is open now, navy soft (on-navy soft on navy) when closed. The text beside it always states the hours.

### Motion
Drafting grammar. Strokes draw (dash offset), notes and fills resolve, and the photograph wipes in left to right behind a 2px gold construction line, on exponential ease-out (cubic-bezier(0.16, 1, 0.3, 1)) or power in-out, never with bounce or overshoot. Chapter transformations are scrubbed to native scroll inside CSS-sticky stages; Final light darkens the sheet to navy and switches the lamp on. The opening intro draws the lockup as a wireframe, fills it, glances and blinks the upper panes, and opens the star as a mask onto the showroom photo in about 3.5 seconds, skippable, once per session. Reduced motion shows the resting state: photo present, drawing as a faint 38% overlay, Final light already navy, no intro.

## Do's and Don'ts

### Do:
- **Do** set every surface as either a drafting-white sheet or a whole navy field.
- **Do** keep gold to the star, light, and one primary action per view, with opening-navy text on gold.
- **Do** cut corners at 45° (0.75rem on controls, about 2.25rem on panels) and keep everything else square.
- **Do** carry structure with hairline rules, sheet frames, ruled title blocks and schedules.
- **Do** make every annotation a fact or a working link, lettered in tracked Barlow caps on a solid plate.
- **Do** switch drawing labels to numbered markers with a caption key below 768px.
- **Do** move with the drafting grammar (draw, resolve, wipe behind a gold line) on expo ease-out, scrubbed to native scroll, with a still reduced-motion state.
- **Do** let photography carry all colour beyond navy, white and gold.

### Don't:
- **Don't** set gold text on paper, or lay a gold haze or glow over a navy field.
- **Don't** use opening navy as a general dark surface; it is for openings and figure grounds.
- **Don't** add drop shadows, blur, glass, or rounded corners (true circles are kept for the status dot and grid bubbles only).
- **Don't** put tracked-caps kickers or eyebrows above headlines; lettering is for annotations only.
- **Don't** use cream or warm off-white for sheets; the paper is cool drafting white.
- **Don't** autoplay the gateway carousel or hijack native scroll.
- **Don't** use bounce, spring or overshoot easing.
