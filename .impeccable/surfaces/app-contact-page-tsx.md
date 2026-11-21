---
version: 1
slug: "app-contact-page-tsx"
primary_target: "app/contact/page.tsx"
related_targets: []
---

# Contact (`app/contact/page.tsx`)

## Scope and mode

- **Visitor mode:** Operate (find the showroom, see whether it is open, reach Kenstar).
- **Scope:** the Contact route.

## Job, audience and action

- **Who arrives:** people about to visit, call or message, mostly on phones, often already in Embu.
- **Primary action:** get directions while it is open, or start a WhatsApp chat.
- **Close second:** call, email, or send the enquiry form.
- **Content:** live open status in East Africa Time, the week's hours, the address and P.O. box, phone, WhatsApp, email, Google Maps directions, the enquiry form.
- **Constraints:** only the listed contact details and hours. The status must be computed live in Africa/Nairobi time; before it loads, the page states the hours plainly.

## Direction contract

THESIS: Contact as the sign on the showroom door: open now or closed, today's hours large, the week beneath, the address and the way in; every channel beside it as a ruled list of real actions. It refuses the generic three-tile contact page and the embedded map that loads a third party.

OWN-WORLD: The approved system: a midnight door-sign panel with the live status set large in Manrope, the olive dot for open, ruled hours in Inter with tabular figures and today marked in brass; limestone channel list with ruled rows; brass only for the one cut-corner primary action (Get directions).

STORY: At a glance the visitor knows whether Kenstar is open right now and when it closes. They pick a channel in one tap or take directions, and the enquiry form is there for anything longer. They come away certain of how to reach the showroom.

FIRST VIEWPORT: A large midnight panel across seven columns reads "Open now" (or "Closed") with "Closes 5pm today" beneath, the week's hours ruled with today marked, the address, and "Get directions". To its right, the channels as ruled rows: WhatsApp, Call, Email, Post. The enquiry form starts below.

FORM: The shop door sign, position 6 of 7 on my list; seed:fec67bc64ab35c1f.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

The door sign is live: it reads the time in Embu and changes between open and closed, with the next opening time when closed. Motion is feedback only.

## Unresolved

- Public holiday hours (not published).
