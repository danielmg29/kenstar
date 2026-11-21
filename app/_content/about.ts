// About Kenstar: only confirmed facts (PRODUCT.md). The four figures were confirmed by the user on
// 2026-11-19; years in business, staff, awards and client names are not published, so none appear.
import { RANGES } from "./products";

export const FACTS = [
  { value: "200+", label: "Products in the showroom" },
  { value: "100+", label: "Satisfied clients" },
  { value: "50+", label: "Completed projects" },
  { value: "Wholesale", label: "Prices" },
] as const;

export type IndexLine = { name: string; href: string; group: "Showroom" | "Building" | "Services" | "Stay" };

// Everything Kenstar does, retail first: the showroom is the business people know.
export const EVERYTHING: IndexLine[] = [
  ...RANGES.map((r) => ({ name: r.name, href: `/products#${r.slug}`, group: "Showroom" as const })),
  { name: "Building & civil works", href: "/construction#structure", group: "Building" },
  { name: "Roadworks", href: "/construction#approach", group: "Building" },
  { name: "Delivery & equipment hire", href: "/construction#materials", group: "Services" },
  { name: "Furnished accommodation", href: "/accommodation", group: "Stay" },
];
