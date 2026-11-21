// The Products page as a finishes schedule: the six showroom ranges and the sub-categories Kenstar
// publishes on kenstarlimited.co.ke (read 2026-11-18). Each line says only what its photograph shows.
// Codes are this schedule's own references, so a visitor can quote "LT-03" and staff see the name too.
// Hardware and finishing have no published sub-categories, so each is one enquiry line.

export type Photo = {
  src: string;
  alt: string;
  position?: string;
  // A free stock photo standing in until Kenstar's own arrives (see docs/image-sources.md).
  standIn?: boolean;
};

export type Entry = {
  code: string;
  name: string;
  line: string;
  photo: Photo;
};

export type Range = {
  code: string;
  slug: string;
  name: string;
  short: string; // the index cell
  intro: string;
  // The range's large photograph. Lighting has none: the lighting hall opens the page above it.
  plate?: Photo & { caption: string };
  entries: Entry[];
};

export const RANGES: Range[] = [
  {
    code: "LT",
    slug: "lighting",
    short: "Lighting",
    name: "Lighting",
    intro: "Chandeliers, ceiling fittings and wall brackets hang lit in the lighting hall, with flood and gate lights for outside.",
    entries: [
      {
        code: "LT-01",
        name: "Chandeliers",
        line: "Crystal and gold, from single rings to tall cascades, hung lit.",
        photo: { src: "/images/range-lighting-chandelier-0774.webp", alt: "A tall cascading crystal chandelier with a gold frame", position: "50% 30%" },
      },
      {
        code: "LT-02",
        name: "Ceiling fittings",
        line: "Round flush fittings in white, gold and coloured rims, with multi-arm fittings overhead.",
        photo: { src: "/images/prod-ceiling-fittings-0857.webp", alt: "A wall of round flush ceiling fittings in white, gold and blue" },
      },
      {
        code: "LT-03",
        name: "Wall brackets",
        line: "A full wall of brackets, lit, from crystal and gold to coloured glass.",
        photo: { src: "/images/prod-wall-brackets-0812.webp", alt: "A display wall of lit wall brackets in many finishes" },
      },
      {
        code: "LT-04",
        name: "Flood lights",
        line: "LED flood lights in a range of sizes, mounted on a display wall.",
        photo: { src: "/images/prod-flood-lights-0806.webp", alt: "LED flood lights of several sizes mounted on a display wall" },
      },
      {
        code: "LT-05",
        name: "Gate lights",
        line: "Lanterns, globe lights and bollards, set out on a garden display.",
        photo: { src: "/images/prod-gate-lights-0906.webp", alt: "Globe lights and bollard lights standing on artificial grass" },
      },
    ],
  },
  {
    code: "FU",
    slug: "furniture",
    short: "Furniture",
    name: "Furniture & home",
    intro: "Sofa sets, recliners, dining tables and beds set out on the showroom floor, with decor for the walls.",
    plate: {
      src: "/images/showroom-furniture-floor-0821.webp",
      alt: "Round dining tables with carved chairs set out on the Kenstar furniture floor",
      position: "50% 55%",
      caption: "The furniture floor",
    },
    entries: [
      {
        code: "FU-01",
        name: "Sofa sets",
        line: "Carved-frame sets in deep red and silver-grey, with matching cushions.",
        photo: { src: "/images/prod-sofa-sets-0990.webp", alt: "A carved sofa set in deep red upholstery with patterned cushions" },
      },
      {
        code: "FU-02",
        name: "Recliner seats",
        line: "Grey upholstered recliners, including corner sectionals.",
        photo: { src: "/images/range-furniture-recliner-0995.webp", alt: "Grey upholstered recliner seats arranged around a corner", position: "40% 60%" },
      },
      {
        code: "FU-03",
        name: "Dining tables",
        line: "Long and round tables with matching chairs, from white and gold to carved wood.",
        photo: { src: "/images/prod-dining-tables-0817.webp", alt: "A long white dining table with carved chairs and gold details" },
      },
      {
        code: "FU-04",
        name: "Beds",
        line: "Tufted headboards in white and gold, shown with bedside tables.",
        photo: { src: "/images/prod-beds-1018.webp", alt: "A bed with a gold tufted headboard and matching gold bedside tables" },
      },
      {
        code: "FU-05",
        name: "Dressing mirrors",
        line: "Carved dressing tables with mirror and stool.",
        photo: { src: "/images/prod-dressing-mirrors-1003.webp", alt: "A white carved dressing table with an arched mirror and a stool" },
      },
      {
        code: "FU-06",
        name: "Tables",
        line: "Glass-topped coffee and side tables, some with printed tops.",
        photo: { src: "/images/prod-tables-0834.webp", alt: "Glass-topped coffee tables with a printed red floral design" },
      },
      {
        code: "FU-07",
        name: "TV stands",
        line: "Stands in wood and glass, some with a column for mounting the TV.",
        photo: { src: "/images/prod-tv-stands-0988.webp", alt: "A wood and glass TV stand with a mounting column" },
      },
      {
        code: "FU-08",
        name: "Office furniture",
        line: "Swivel office chairs and linked waiting-room seating.",
        photo: { src: "/images/prod-office-furniture-0940.webp", alt: "Rows of linked black waiting-room seats" },
      },
      {
        code: "FU-09",
        name: "Home decor",
        line: "Framed pictures and decorative glass pieces for walls and shelves.",
        photo: { src: "/images/prod-home-decor-0970.webp", alt: "Framed pictures of the Eiffel Tower, a city and an autumn tree" },
      },
    ],
  },
  {
    code: "BA",
    slug: "bathroom",
    short: "Bathroom",
    name: "Bathroom & toiletries",
    intro: "Taps, basins, mirrors and dispensers, with fittings for the whole bathroom and toilet.",
    plate: {
      src: "/images/range-bathroom-taps-wall-0693.webp",
      alt: "Shelves of dispensers, taps and fittings beside a gold wall panel in the Kenstar bathroom section",
      position: "50% 50%",
      caption: "The bathroom section",
    },
    entries: [
      {
        code: "BA-01",
        name: "Water taps",
        line: "Taps and basin mixers in chrome, gold and black.",
        photo: { src: "/images/range-bathroom-mixer-taps-0686.webp", alt: "Basin mixer taps in chrome, grey, black and gold on a counter" },
      },
      {
        code: "BA-02",
        name: "Hand basins",
        line: "Pedestal basins in white, black and orange, some with painted patterns.",
        photo: { src: "/images/prod-hand-basins-0683.webp", alt: "Pedestal basins in black, white and orange with painted patterns" },
      },
      {
        code: "BA-03",
        name: "Bathroom & toilet",
        line: "Toilets and matching basin sets, including floral painted designs.",
        photo: { src: "/images/prod-bathroom-toilet-0681.webp", alt: "A toilet and basin set with painted floral designs" },
      },
      {
        code: "BA-04",
        name: "Wall mirrors",
        line: "Framed mirrors, from ornate gold to patterned frames.",
        photo: { src: "/images/prod-wall-mirrors-0707.webp", alt: "A wall mirror in an ornate gold frame", position: "50% 40%" },
      },
      {
        code: "BA-05",
        name: "Soap dispensers",
        line: "Wall-mounted dispensers in white, chrome, gold and clear.",
        photo: { src: "/images/prod-soap-dispensers-0731.webp", alt: "Wall-mounted soap dispensers in white, chrome and gold" },
      },
    ],
  },
  {
    code: "EL",
    slug: "electricals",
    short: "Electricals",
    name: "Electricals",
    intro: "Switches, sockets and general electricals on display boards, so plates and finishes can be compared side by side.",
    plate: {
      src: "/images/range-electricals-switches-0964.webp",
      alt: "Rows of switch and socket plates on a display board at Kenstar",
      position: "50% 50%",
      caption: "The electricals boards",
    },
    entries: [
      {
        code: "EL-01",
        name: "Switches",
        line: "Switch and socket plates in white and metallic finishes, side by side.",
        photo: { src: "/images/prod-switches-0963.webp", alt: "A display board of switch and socket plates in white, gold and bronze" },
      },
      {
        code: "EL-02",
        name: "General electricals",
        line: "Consumer units, sockets and fittings on the electricals boards.",
        photo: { src: "/images/prod-general-electricals-0969.webp", alt: "Consumer units and sockets mounted on a white display board", position: "50% 35%" },
      },
    ],
  },
  {
    code: "FN",
    slug: "finishing",
    short: "Finishing",
    name: "Beautification & finishing",
    intro: "The surfaces and final touches that finish a room. No list is published yet, so tell us the job.",
    entries: [
      {
        code: "FN-01",
        name: "Finishing for a room",
        line: "Say the room and the surface in your note, and staff will tell you what is in stock.",
        photo: { src: "/images/standin-finishing-paint-unsplash.webp", alt: "A paint roller on a white wall", position: "45% 55%", standIn: true },
      },
    ],
  },
  {
    code: "HW",
    slug: "hardware",
    short: "Hardware",
    name: "Hardware & building supplies",
    intro: "Materials and tools for the structure of a space, from the foundations to the roof.",
    entries: [
      {
        code: "HW-01",
        name: "Hardware for a build",
        line: "List the materials and quantities in your note, and staff will confirm what is in stock.",
        photo: { src: "/images/standin-hardware-store-unsplash.webp", alt: "Shelves of boxed hardware", position: "50% 40%", standIn: true },
      },
    ],
  },
];

export const ENTRIES = RANGES.flatMap((r) => r.entries);
export const ENTRY_BY_CODE = new Map(ENTRIES.map((e) => [e.code, e]));
