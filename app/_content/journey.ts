// The making of a space: six connected chapters, from the first line to the final light.
// The order and the six subjects come from the redesign brief (docs/redesign-brief.md).
// Every Field Note is a real Kenstar photograph, or an honest empty note where none exists yet.
// Sentences use only what the photo shows and what Kenstar publishes; nothing is invented.
import { whatsappLink } from "./site";

export type FieldNote = {
  id: string; // "01.1": chapter number and note number
  range: string; // shown in the note header
  photo?: { src: string; alt: string; position?: string };
  sentence: string;
  source?: string;
  link: { label: string; href: string; external?: boolean };
};

export type JourneyChapter = {
  slug: string;
  number: string;
  name: string;
  subject: string;
  text: string;
  action: { label: string; href: string; external?: boolean };
  notes: FieldNote[];
};

const ask = (topic: string) => whatsappLink(`Hello Kenstar, I'd like to ask about ${topic}.`);
const SHOWROOM_SHOOT = "Photographed at Kenstar, Embu · June 2026";
const PROJECT_PHOTO = "From Kenstar's project photographs";

export const JOURNEY_TITLE = "The making of a space";
export const JOURNEY_LINE = "From the first line to the final light.";

export const JOURNEY: JourneyChapter[] = [
  {
    slug: "approach",
    number: "01",
    name: "Approach",
    subject: "Roadworks and infrastructure",
    text: "Every space starts with a way in. Kenstar builds bitumen and murram roads, from main roads to small access roads.",
    action: { label: "Ask about roadworks", href: ask("roadworks"), external: true },
    notes: [
      {
        id: "01.1",
        range: "Roadworks",
        photo: { src: "/images/work-roadworks-tarmac-0143.jpg", alt: "A freshly laid bitumen road between murram verges", position: "50% 60%" },
        sentence: "A new bitumen surface, laid between murram verges.",
        source: PROJECT_PHOTO,
        link: { label: "See construction and roadworks", href: "#services" },
      },
      {
        id: "01.2",
        range: "Civil works",
        photo: { src: "/images/work-civil-bridge-0130.jpg", alt: "A yellow steel footbridge over a stream", position: "50% 55%" },
        sentence: "A steel footbridge carrying a path over a stream.",
        source: PROJECT_PHOTO,
        link: { label: "See construction and roadworks", href: "#services" },
      },
    ],
  },
  {
    slug: "structure",
    number: "02",
    name: "Structure",
    subject: "Construction and civil works",
    text: "The frame goes up: foundations, columns, beams and slabs. Kenstar takes on building and civil works for homes and commercial properties.",
    action: { label: "Talk about a building project", href: whatsappLink("Hello Kenstar, I'd like to talk about a construction project."), external: true },
    notes: [
      {
        id: "02.1",
        range: "Construction",
        photo: { src: "/images/work-construction-site-0147.webp", alt: "A two-storey house with blockwork walls between a concrete frame, under construction", position: "50% 50%" },
        sentence: "Blockwork rising between the concrete frame of a two-storey house.",
        source: PROJECT_PHOTO,
        link: { label: "See construction and roadworks", href: "#services" },
      },
      {
        id: "02.2",
        range: "Construction",
        photo: { src: "/images/work-construction-house-0169.webp", alt: "A finished two-storey house with white walls and tall windows", position: "50% 45%" },
        sentence: "A finished two-storey house, from structure to final coat.",
        source: PROJECT_PHOTO,
        link: { label: "See construction and roadworks", href: "#services" },
      },
    ],
  },
  {
    slug: "materials",
    number: "03",
    name: "Materials",
    subject: "Hardware and building supplies",
    text: "Walls close the frame and the roof goes on. Kenstar sells hardware and building supplies from its showroom on Market Road, Embu.",
    action: { label: "Ask what is in stock", href: ask("hardware and building supplies"), external: true },
    notes: [
      {
        id: "03.1",
        range: "Hardware",
        sentence: "Kenstar's own photographs of the hardware range are still to come.",
        link: { label: "See the showroom ranges", href: "#ranges" },
      },
    ],
  },
  {
    slug: "systems",
    number: "04",
    name: "Systems",
    subject: "Electricals, lighting, bathroom and toiletries",
    text: "Before the walls are finished, power and water go in: switches and sockets, light points, taps and basins.",
    action: { label: "Ask about electricals and fittings", href: ask("electricals and bathroom fittings"), external: true },
    notes: [
      {
        id: "04.1",
        range: "Electricals",
        photo: { src: "/images/range-electricals-switches-0964.webp", alt: "Rows of switch and socket plates on a display board at Kenstar", position: "50% 50%" },
        sentence: "Switch and socket plates, set out on display boards to compare.",
        source: SHOWROOM_SHOOT,
        link: { label: "See the ranges", href: "#ranges" },
      },
      {
        id: "04.2",
        range: "Lighting",
        photo: { src: "/images/showroom-ceiling-fittings-0973.webp", alt: "Ceiling fittings mounted across the showroom ceiling", position: "50% 40%" },
        sentence: "Ceiling fittings, mounted on the showroom ceiling as they would be at home.",
        source: SHOWROOM_SHOOT,
        link: { label: "See the ranges", href: "#ranges" },
      },
      {
        id: "04.3",
        range: "Bathroom",
        photo: { src: "/images/range-bathroom-mixer-taps-0686.webp", alt: "Basin mixer taps in chrome, grey, black and gold on a counter at Kenstar", position: "50% 50%" },
        sentence: "Basin mixer taps in chrome, grey, black and gold.",
        source: SHOWROOM_SHOOT,
        link: { label: "See the ranges", href: "#ranges" },
      },
    ],
  },
  {
    slug: "finish",
    number: "05",
    name: "Finish",
    subject: "Beautification, finishing and furniture",
    text: "Surfaces are finished and the room is furnished, with sofa sets, recliners and dining tables from the furniture floor.",
    action: { label: "Ask about furniture and finishing", href: ask("furniture and finishing"), external: true },
    notes: [
      {
        id: "05.1",
        range: "Furniture",
        photo: { src: "/images/range-furniture-dining-0783.webp", alt: "A dining table with gold legs and six upholstered chairs", position: "50% 55%" },
        sentence: "A dining table with gold legs and six upholstered chairs.",
        source: SHOWROOM_SHOOT,
        link: { label: "See the ranges", href: "#ranges" },
      },
      {
        id: "05.2",
        range: "Furniture",
        photo: { src: "/images/range-furniture-recliner-0995.webp", alt: "Recliner sofa sets on the Kenstar furniture floor", position: "50% 55%" },
        sentence: "Recliner sofa sets on the furniture floor.",
        source: SHOWROOM_SHOOT,
        link: { label: "See the ranges", href: "#ranges" },
      },
    ],
  },
  {
    slug: "arrival",
    number: "06",
    name: "Arrival",
    subject: "Furnished accommodation",
    text: "The final light. A finished, furnished space, ready to live in. Kenstar also offers furnished accommodation.",
    action: { label: "Visit the showroom", href: "#showroom" },
    notes: [
      {
        id: "06.1",
        range: "Lighting",
        photo: { src: "/images/range-lighting-ring-pendant-0981.webp", alt: "A gold ribbon pendant with three crystal lamps hanging in the showroom", position: "50% 45%" },
        sentence: "A gold ribbon pendant with three crystal lamps, lit in the lighting hall.",
        source: SHOWROOM_SHOOT,
        link: { label: "See the ranges", href: "#ranges" },
      },
      {
        id: "06.2",
        range: "Accommodation",
        sentence: "Photographs and details of Kenstar's furnished accommodation are still to come.",
        link: { label: "Ask about accommodation", href: ask("furnished accommodation"), external: true },
      },
    ],
  },
];
