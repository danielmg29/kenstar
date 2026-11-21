# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Product explorers:** customers browsing hardware, electricals, lighting, furniture, bathroom and finishing products before they buy.
- **Homeowners:** people furnishing, upgrading or maintaining their home.
- **Builders and renovators:** people taking on a construction or renovation project, from the structure through to the finishes.
- **Showroom visitors:** people deciding whether to visit, and planning a trip to, the physical showroom in Embu.

## Product Purpose

The brand and marketing website for **Kenstar Limited**, a Kenyan business based in Embu. It is best known for its physical hardware and home-products showroom. The new site replaces Kenstar's current web presence with a new brand.

Success means three things:

1. **Product discovery:** visitors find the ranges they need.
2. **Showroom visits:** visitors come to Embu to see the products in person.
3. **Relevant enquiries:** enquiries arrive through WhatsApp, phone or the quote form.

This is a brand and marketing site. It is not a SaaS application, a dashboard or an online shop.

## Positioning

*Derived from the confirmed offering. Not a tagline.*

Kenstar can serve a space from its structure to its finish under one business:

- building supplies and hardware;
- electricals and lighting;
- bathroom products, finishing and furniture;
- its own construction, civil works and roadworks capability;
- delivery of materials and equipment hire;
- furnished accommodation.

The physical showroom in Embu lets people see and handle products before they commit.

## Operating Context

- **Online first, then offline:** visitors research online and act offline. They visit the showroom, chat on WhatsApp, call, or send an enquiry or quote request.
- **Buying model:** catalogue plus enquiry. Visitors browse products, then get in touch. There is no cart, checkout or online payment.
- **Enquiry channels:**
  - WhatsApp click-to-chat, which can be pre-filled with the product or range;
  - tap-to-call;
  - an enquiry or quote form. On the homepage it opens the visitor's WhatsApp or email app with the message filled in; the visitor presses send there;
  - showroom directions through Google Maps, alongside the opening hours.

## Capabilities and Constraints

**Confirmed offerings**

- **Retail (the primary commercial focus):**
  - hardware and building supplies;
  - electricals;
  - lighting;
  - furniture and home products;
  - bathroom products and toiletries;
  - beautification and finishing.
- **Construction:** construction, civil works and roadworks.
- **Services:** delivery of materials, and equipment and tool hire.
- **Furnished accommodation:** part of the new site (redesign brief, 2026-11-19). **Its details must be confirmed** before they are published: location, units, rates and how to book.
- **Automotive and garage:** listed on the current site. It joins the new site **only after Kenstar verifies it** (redesign brief, 2026-11-19).

**Site scope:** a multi-page site. The routes proposed in the redesign brief are:

- `/`: home;
- `/products`: products and showroom catalogue;
- `/construction`: construction and roadworks;
- `/accommodation`: furnished accommodation;
- `/about`: about Kenstar;
- `/contact`: visit and contact.

Automotive and garage may get its own route once verified. The site needs reusable templates for product categories, project details and enquiries.

**Out of scope:** online payment, cart and checkout, and customer accounts.

**Language:** English only.

**Existing technical base:**

- Next.js 16 (App Router), React 19, Tailwind CSS 4 and pnpm.
- GSAP, three.js with React Three Fiber and drei, and Embla Carousel are installed.
- The homepage is built (`app/page.tsx`, components in `app/_components/`, facts in `app/_content/site.ts`).
- The brand assets are in `public/brand/logo/` and `public/brand/favicon/`, listed in `docs/brand-assets.md`.

**Undecided:**

- whether the catalogue shows prices;
- how product data is stored and maintained (static files or a CMS);
- whether the enquiry form should also send straight to the Kenstar team (it currently hands off to WhatsApp or the visitor's email app);
- the delivery coverage area and its terms;
- the equipment hire range and terms.

## Brand Commitments

- **Name:** Kenstar Limited, shortened to "Kenstar" in running copy.
- **Central creative concept (binding):** **THE MAKING OF A SPACE: From the first line to the final light.**
- **Hierarchy:**
  - Construction is the visual storytelling language that connects the business activities.
  - The showroom and the retail products remain the primary commercial focus, and the site communicates this retail identity prominently.
  - Construction contracting is never positioned as Kenstar's primary identity.
- **Redesign brief (binding, 2026-11-19):** `docs/redesign-brief.md` holds the client's interaction, journey, visual-direction and architecture constraints word for word. Design work applies it; this record doesn't restate it.
- **Logo (final, confirmed by the user):** the Home Builder logo. A gold star, navy roof strokes and a four-pane window whose upper panes become eyes, with the KENST★R wordmark.
  - `public/brand/logo/logo.svg` for light surfaces and `logo-white.svg` for dark surfaces.
  - `logo-icon-light.svg` and `logo-icon-dark.svg` for the mark alone.
  - The app icon is `public/brand/favicon/kenstar-c01-app-icon.svg`; the favicon set is generated from it.
- **Voice:** no established voice yet. To be defined.

## Evidence on Hand

- **Sources:**
  - Current website: https://kenstarlimited.co.ke/ (WordPress). Read on 2026-11-18.
  - TikTok: https://www.tiktok.com/@kenstarlimited. Mostly vertical videos; no usable stills.

  Confirm anything that looks out of date before reusing it.
- **Facts published on the current site (to be confirmed as current):**
  - **Address:**
    - P.O. Box 778 – 60100, Embu.
    - "Located along Market Road Opposite Former KPLC Offices".
    - The TikTok bio says "Opposite Kenya Power Offices".
  - **Phone:** +254 713 643 643. The user confirmed it is also the WhatsApp number.
  - **Email:** Kenstarhardware@gmail.com
  - **Hours:** Monday to Friday 8am – 5pm; weekend 10am – 5pm.
  - **Google Maps listing:** "Kenstar Electricals & Hardware Limited". Coordinates are about −0.5356, 37.4442.
  - **Range sub-categories:**
    - *Lighting & Electricals:* chandeliers, ceiling fittings, flood lights, gate lights, general electricals, home decor, switches, wall brackets.
    - *Furniture:* beds, dining tables, dressing mirrors, office furniture, recliner seats, sofa sets, tables, TV stands.
    - *Bathroom & Toiletries:* bathroom & toilet, hand basins, soap dispensers, wall mirrors, water taps.
  - **Construction services:** building works, civil works, beautification & finishing.
  - **Roadworks:** bitumen, murram, and access roads.
- **Differences from the current site:**
  - **Six retail ranges (user decision, 2026-11-18; reconfirmed 2026-11-20 for the showroom carousel):** hardware & building supplies, electricals, lighting, bathroom & toiletries, furniture & home, and beautification & finishing. Electricals and lighting stay separate. Hardware and finishing are retail ranges, even though the current site has no page for hardware and lists finishing as a construction service. **Neither range has Kenstar photography yet:** free Unsplash stand-ins, labelled "Illustrative photo" on the site, hold their place until Kenstar's own arrive (`docs/image-sources.md`).
  - **Diversified business:** the current site calls Kenstar a diversified "investment company" and lists **Automotive & Garage**. Automotive stays off the new site until Kenstar verifies it.
- **Claims the user confirmed as still true (2026-11-19):**
  - "100+ satisfied clients", "50+ completed projects" and "200+ products";
  - wholesale prices (from the TikTok profile).
- **Claim still unconfirmed:** "years of experience" on the current site gives no figure. Don't use it until there is one.
- **Imagery on the current site:**
  - **Kenstar's own photos, 2560 px, from a June 2026 showroom shoot:** about 129 photos, covering Lighting & Electricals (46), Furniture (42) and Bathroom (41). These are in-situ showroom shots, not isolated product shots.
  - **Construction:** 28 photos, 1600 px at most.
  - **Roadworks:** 11 photos, 1156 px at most.
  - **AirBNB:** 17 photos at 2560 px, the only accommodation imagery found. None are in the repository yet.
  - **Stock images:** the site also uses Vecteezy, Pngtree and Unsplash stock images. **Never reuse these.**
  - **Logo:** the current site's logo is an older raster lockup (building blocks, "Kenstar Electricals Hardware Limited"), not the new Home Builder logo.
  - **In the repository:** 17 of the showroom, construction and roadworks photos, downloaded with the user's approval, are in `public/images/`. Each one's source URL is in `docs/image-sources.md`.
  - **Rights:** the user confirmed on 2026-11-19 that Kenstar may reuse the June 2026 showroom photos on the new site.
- **The repository:** has the homepage, the real contact details, the logo and favicon set, and the 17 photos. It has no product data yet, and no photos for hardware & building supplies or finishing.
- **Must not be fabricated:**
  - prices, stock levels and product names;
  - testimonials and customer, project or client names;
  - years in business, staff, certifications and awards;
  - the delivery area and hire rates;
  - accommodation details;
  - any contact detail or opening hours not listed above.

  Use clearly marked placeholders until the real facts arrive.

## Product Principles

1. **Products first, story second.** The construction narrative frames product discovery. It never stands between a visitor and a product range, the showroom or an enquiry.
2. **Every path ends in a real action.** Each page leads to a showroom visit, a WhatsApp chat, a call or a quote request.
3. **Make the showroom tangible.** The location, directions and opening hours are always within easy reach, because the physical showroom is Kenstar's best-known asset.
4. **Present the whole space.** Show Kenstar as serving a project from structure to finish, not as a single-category shop.
5. **Truth over polish.** Use only real Kenstar facts, products and photography. Leave unknowns marked as absent rather than inventing them.
