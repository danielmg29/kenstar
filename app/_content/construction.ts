// Construction and roadworks: what Kenstar's current site lists (read 2026-11-18), proved by its own
// project photographs. No project names, clients, dates or locations are published, so none appear.
import { whatsappLink } from "./site";

export type WorkPhoto = { src: string; alt: string; position?: string; caption: string; width: number; height: number };

export const WORK_PHOTOS = {
  house: {
    src: "/images/work-construction-house-0169.webp",
    alt: "A finished two-storey house in white render with wide glazing and a paved drive",
    caption: "A finished house",
    position: "50% 45%",
    width: 1156,
    height: 867,
  },
  site: {
    src: "/images/work-construction-site-0147.webp",
    alt: "A two-storey stone building under construction, with timber stacked on the site",
    caption: "Walls up, roof on",
    position: "50% 55%",
    width: 1156,
    height: 867,
  },
  bridge: {
    src: "/images/work-civil-bridge-0130.jpg",
    alt: "A yellow steel footbridge over a stream, with green banks on both sides",
    caption: "Civil works: a footbridge",
    position: "50% 50%",
    width: 1080,
    height: 720,
  },
  road: {
    src: "/images/work-roadworks-tarmac-0143.jpg",
    alt: "A new road being surfaced, with a paving machine at work ahead",
    caption: "Roadworks: a new surface",
    position: "50% 60%",
    width: 867,
    height: 1156,
  },
} satisfies Record<string, WorkPhoto>;

export type Service = { code: string; name: string; line: string; ask: string };

export const BUILDING: Service[] = [
  { code: "B-01", name: "Building works", line: "Houses and commercial buildings, from the foundations to the roof.", ask: "building works" },
  { code: "B-02", name: "Civil works", line: "Structures beyond the building itself, such as the footbridge shown here.", ask: "civil works" },
  { code: "B-03", name: "Beautification & finishing", line: "The finishes that complete a building, with the showroom's ranges to choose from.", ask: "beautification and finishing" },
];

export const ROADS: Service[] = [
  { code: "R-01", name: "Bitumen roads", line: "Bitumen-surfaced roads, from major roads to small access roads.", ask: "bitumen roads" },
  { code: "R-02", name: "Murram roads", line: "Murram roads, where a sealed surface is not needed.", ask: "murram roads" },
  { code: "R-03", name: "Access roads", line: "Small access roads and drives, with supporting road-building services.", ask: "access roads" },
];

export const SUPPORT: Service[] = [
  { code: "S-01", name: "Delivery of materials", line: "Materials from the showroom delivered to your site. Ask about the area.", ask: "delivery of materials" },
  { code: "S-02", name: "Equipment & tool hire", line: "Equipment and tools for the job. Ask what is available and the terms.", ask: "equipment and tool hire" },
];

export const askAbout = (topic: string) => whatsappLink(`Hello Kenstar, I'd like to talk about ${topic}.`);

// The journey's stages as the service list: who carries each one, and where it leads.
export type Stage = {
  slug: string;
  number: string;
  name: string;
  who: string;
  text: string;
  services: Service[];
  links: { label: string; href: string }[];
  photos: { src: string; alt: string; caption: string; position?: string; portrait?: boolean }[];
};

export const STAGES: Stage[] = [
  {
    slug: "approach",
    number: "01",
    name: "Approach",
    who: "Roadworks",
    text: "Every space starts with a way in. Kenstar builds bitumen and murram roads, from main roads to small access roads.",
    services: ROADS,
    links: [],
    photos: [{ ...WORK_PHOTOS.road, portrait: true }, WORK_PHOTOS.bridge],
  },
  {
    slug: "structure",
    number: "02",
    name: "Structure",
    who: "Building & civil works",
    text: "Building works and civil works for homes and commercial properties.",
    services: BUILDING.slice(0, 2),
    links: [],
    photos: [WORK_PHOTOS.site],
  },
  {
    slug: "materials",
    number: "03",
    name: "Materials",
    who: "From the showroom",
    text: "Hardware and building supplies come from the Kenstar showroom on Market Road at wholesale prices, delivered to the site, with equipment to hire for the job.",
    services: SUPPORT,
    links: [{ label: "Hardware & building supplies", href: "/products#hardware" }],
    photos: [],
  },
  {
    slug: "systems",
    number: "04",
    name: "Systems",
    who: "Showroom ranges",
    text: "Switches, sockets, consumer units, taps and basins: what runs through the walls is on display at the showroom.",
    services: [],
    links: [
      { label: "Electricals", href: "/products#electricals" },
      { label: "Bathroom & toiletries", href: "/products#bathroom" },
    ],
    photos: [
      { src: "/images/prod-general-electricals-0969.webp", alt: "Consumer units and sockets on a display board at Kenstar", caption: "The electricals boards", position: "50% 35%" },
      { src: "/images/range-bathroom-mixer-taps-0686.webp", alt: "Basin mixer taps in chrome, grey, black and gold on a counter at Kenstar", caption: "Basin mixers" },
    ],
  },
  {
    slug: "finish",
    number: "05",
    name: "Finish",
    who: "Finishing & furniture",
    text: "Beautification and finishing for the building, then the showroom's furniture and lighting for the rooms inside.",
    services: BUILDING.slice(2),
    links: [
      { label: "Furniture & home", href: "/products#furniture" },
      { label: "Lighting", href: "/products#lighting" },
      { label: "Beautification & finishing", href: "/products#finishing" },
    ],
    photos: [
      WORK_PHOTOS.house,
      { src: "/images/range-furniture-dining-0783.webp", alt: "A dining set with a mirrored table and gold legs in the Kenstar showroom", caption: "Dining sets, in the showroom", position: "50% 55%" },
    ],
  },
];
