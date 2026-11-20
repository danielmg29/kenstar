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

export type DrawingId = "first-line" | "power" | "water" | "surface" | "living" | "final-light";

export type Range = {
  slug: string;
  number: string;
  name: string;
  chapter: string;
  drawing: DrawingId;
  items: string[];
  line: string;
};

// The six ranges in the order a space is built. Sub-categories come from the
// current site; hardware and finishing have no published list or photos yet.
export const RANGES: Range[] = [
  {
    slug: "hardware",
    number: "01",
    name: "Hardware & building supplies",
    chapter: "First line",
    drawing: "first-line",
    items: ["Cement", "Steel", "Roofing", "Timber", "Tools"],
    line: "Every space starts as a line on a drawing, then a foundation. The materials and tools a build starts with.",
  },
  {
    slug: "electricals",
    number: "02",
    name: "Electricals",
    chapter: "Power",
    drawing: "power",
    items: ["Switches & sockets", "General electricals"],
    line: "Before the walls close, the wiring goes in. Switches, sockets and the fittings behind them.",
  },
  {
    slug: "bathroom",
    number: "03",
    name: "Bathroom & toiletries",
    chapter: "Water",
    drawing: "water",
    items: ["Water taps", "Hand basins", "Bathroom & toilet", "Wall mirrors", "Soap dispensers"],
    line: "Taps, basins and fittings for the rooms that carry water.",
  },
  {
    slug: "finishing",
    number: "04",
    name: "Finishing",
    chapter: "Surface",
    drawing: "surface",
    items: [],
    line: "The surfaces a room is seen in, and the final touches. Ask us what is in stock.",
  },
  {
    slug: "furniture",
    number: "05",
    name: "Furniture",
    chapter: "Living",
    drawing: "living",
    items: ["Sofa sets", "Dining tables", "Beds", "Recliner seats", "Office furniture", "TV stands", "Tables", "Dressing mirrors"],
    line: "Furniture for homes and workplaces, from sofa sets and dining to beds and office.",
  },
  {
    slug: "lighting",
    number: "06",
    name: "Lighting",
    chapter: "Final light",
    drawing: "final-light",
    items: ["Chandeliers", "Ceiling fittings", "Wall brackets", "Flood lights", "Gate lights", "Home decor"],
    line: "The last thing a space needs. Indoor and outdoor lighting, from chandeliers to gate lights.",
  },
];

// Photo used by each chapter's drawing-to-photograph transformation.
export const CHAPTER_PHOTOS: Partial<Record<DrawingId, { src: string; alt: string }>> = {
  power: {
    src: "/images/range-electricals-switches-0964.webp",
    alt: "Rows of switch and socket faceplates on a display board",
  },
  water: {
    src: "/images/range-bathroom-mixer-taps-0686.webp",
    alt: "Basin mixer taps in chrome, grey, black and gold on a bathroom counter",
  },
  living: {
    src: "/images/range-furniture-dining-0783.webp",
    alt: "A dining table with gold legs and six upholstered chairs",
  },
  "final-light": {
    src: "/images/range-lighting-ring-pendant-0981.webp",
    alt: "A gold ribbon pendant with three crystal lamps hanging in the showroom",
  },
};

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
