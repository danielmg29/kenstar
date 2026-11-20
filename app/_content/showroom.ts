// The six showroom ranges behind the homepage portals, in the order a space is made.
// Descriptions use only the sub-categories published on Kenstar's site and what the photos show.
// Range pages do not exist yet, so each portal leads to a WhatsApp enquiry and to the visit section.
import { whatsappLink } from "./site";

export type ShowroomRange = {
  slug: string;
  number: string;
  name: string;
  description: string;
  photo: {
    src: string;
    alt: string;
    position: string; // object-position for the 3:4 portal crop
    // A free stock photo standing in until Kenstar's own arrives (see docs/image-sources.md).
    standIn: boolean;
  };
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

const ask = (topic: string) => whatsappLink(`Hello Kenstar, I'd like to ask about ${topic}.`);

export const SHOWROOM: ShowroomRange[] = [
  {
    slug: "hardware",
    number: "01",
    name: "Hardware & building supplies",
    description: "Materials and tools for the structure of a space, from the foundations to the roof. Ask what is in stock before you set out.",
    photo: {
      src: "/images/standin-hardware-store-unsplash.webp",
      alt: "Shelves of boxed hardware and building supplies, with a ladder against the stock",
      position: "50% 45%",
      standIn: true,
    },
    primary: { label: "Ask about hardware", href: ask("hardware and building supplies") },
    secondary: { label: "Visit the showroom", href: "#showroom" },
  },
  {
    slug: "electricals",
    number: "02",
    name: "Electricals",
    description: "Switches, sockets and general electricals, laid out on display boards so plates and finishes can be compared side by side.",
    photo: {
      src: "/images/range-electricals-switches-0964.webp",
      alt: "Rows of switch and socket plates on a display board at Kenstar",
      position: "32% 50%",
      standIn: false,
    },
    primary: { label: "Ask about electricals", href: ask("electricals") },
    secondary: { label: "See the display boards", href: "#showroom" },
  },
  {
    slug: "bathroom",
    number: "03",
    name: "Bathroom & toiletries",
    description: "Water taps, hand basins, wall mirrors and soap dispensers, with fittings for the whole bathroom and toilet.",
    photo: {
      src: "/images/range-bathroom-mixer-taps-0686.webp",
      alt: "Basin mixer taps in chrome, grey, black and gold on a counter at Kenstar",
      position: "40% 50%",
      standIn: false,
    },
    primary: { label: "Ask about bathroom fittings", href: ask("bathroom fittings") },
    secondary: { label: "See the bathroom displays", href: "#showroom" },
  },
  {
    slug: "finishing",
    number: "04",
    name: "Beautification & finishing",
    description: "The surfaces and final touches that finish a room. Tell us what you are working on and we will show you what is in stock.",
    photo: {
      src: "/images/standin-finishing-paint-unsplash.webp",
      alt: "A painter rolling white paint onto a wall",
      position: "42% 50%",
      standIn: true,
    },
    primary: { label: "Ask about finishing", href: ask("beautification and finishing") },
    secondary: { label: "Visit the showroom", href: "#showroom" },
  },
  {
    slug: "furniture",
    number: "05",
    name: "Furniture & home",
    description: "Sofa sets, recliners, dining tables, beds, TV stands and office furniture, set out on the showroom floor.",
    photo: {
      src: "/images/range-furniture-dining-0783.webp",
      alt: "A dining table with gold legs and six upholstered chairs at Kenstar",
      position: "50% 55%",
      standIn: false,
    },
    primary: { label: "Ask about furniture", href: ask("furniture") },
    secondary: { label: "See the furniture floor", href: "#showroom" },
  },
  {
    slug: "lighting",
    number: "06",
    name: "Lighting",
    description: "Chandeliers, ceiling fittings and wall brackets hang lit in the showroom, with flood and gate lights for outside.",
    photo: {
      src: "/images/range-lighting-chandelier-0774.webp",
      alt: "A cascading crystal and gold chandelier, lit, in the Kenstar showroom",
      position: "50% 40%",
      standIn: false,
    },
    primary: { label: "Ask about lighting", href: ask("lighting") },
    secondary: { label: "See the chandeliers lit", href: "#showroom" },
  },
];

// The page opens on Lighting: the logo's star opens onto the showroom's chandeliers.
export const SHOWROOM_START = SHOWROOM.length - 1;
