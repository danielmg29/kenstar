// Kenstar facts, taken from https://kenstarlimited.co.ke/ (read 2026-11-18) and
// confirmed in PRODUCT.md. Nothing here is invented: unknowns stay out.

export const PHONE_DISPLAY = "+254 713 643 643";
export const PHONE_TEL = "tel:+254713643643";
export const EMAIL = "Kenstarhardware@gmail.com";
export const WHATSAPP_NUMBER = "254713643643";
export const TIKTOK_URL = "https://www.tiktok.com/@kenstarlimited";

export const ADDRESS_LINE = "Market Road, opposite the former KPLC offices";
export const TOWN = "Embu";
export const PO_BOX = "P.O. Box 778 – 60100, Embu";

// Google Maps listing: "Kenstar Electricals & Hardware Limited".
export const MAPS_PLACE_URL = "https://www.google.com/maps?cid=3011751867728648143";
export const MAPS_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent("Kenstar Electricals & Hardware Limited, Market Road, Embu");

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Opening hours in East Africa Time. 0 = Sunday.
export const HOURS: Record<number, { open: number; close: number }> = {
  0: { open: 10, close: 17 },
  1: { open: 8, close: 17 },
  2: { open: 8, close: 17 },
  3: { open: 8, close: 17 },
  4: { open: 8, close: 17 },
  5: { open: 8, close: 17 },
  6: { open: 10, close: 17 },
};
export const HOURS_SUMMARY = [
  { days: "Monday – Friday", time: "8am – 5pm" },
  { days: "Saturday – Sunday", time: "10am – 5pm" },
];

export const SERVICES = [
  {
    ref: "S-01",
    name: "Construction & civil works",
    scope: "Building works, civil works, and beautification & finishing for residential and commercial properties.",
    photo: { src: "/images/work-construction-house-0169.webp", alt: "A finished two-storey house built by Kenstar" },
    enquiry: "Hello Kenstar, I'd like to talk about a construction project.",
  },
  {
    ref: "S-02",
    name: "Roadworks",
    scope: "Bitumen and murram roads, from major roads to small access roads, with supporting road-building services.",
    photo: { src: "/images/work-roadworks-tarmac-0143.jpg", alt: "A freshly surfaced road laid by Kenstar" },
    enquiry: "Hello Kenstar, I'd like to ask about roadworks.",
  },
  {
    ref: "S-03",
    name: "Delivery & equipment hire",
    scope: "Delivery of materials to your site, and equipment hire. Ask us for the area and terms.",
    photo: undefined,
    enquiry: "Hello Kenstar, I'd like to ask about delivery and equipment hire.",
  },
] as const;
