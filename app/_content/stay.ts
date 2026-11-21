// Furnished accommodation: Kenstar's own photographs from the AirBNB page of its current site.
// Location, number of units, rates and how to book are NOT confirmed (PRODUCT.md), so the page
// shows the rooms and asks about availability. Notes describe only what the photographs show.
import { whatsappLink } from "./site";

export type StayPhoto = { src: string; alt: string; caption: string; width: number; height: number; position?: string };

const p = (file: string, caption: string, alt: string, portrait = false, position?: string): StayPhoto => ({
  src: `/images/${file}.webp`,
  alt,
  caption,
  width: portrait ? 1333 : 2000,
  height: portrait ? 2000 : 1333,
  position,
});

export const STAY = {
  lounge: p("stay-lounge-0548", "The lounge", "The lounge: an L-shaped upholstered sofa around two round nested tables on a patterned rug"),
  loungeCorner: p("stay-lounge-corner-0542", "The sofa corner", "The corner of the lounge sofa, with the nested tables and a wall shelf"),
  loungeTv: p("stay-lounge-tv-0572", "The TV wall", "The lounge TV wall with a wall-mounted TV, a low unit and a water dispenser"),
  hallway: p("stay-hallway-0546", "The hallway", "The hallway from the lounge, with a tiled floor and wooden doors"),
  bedroom: p("stay-bedroom-0595", "The bedroom", "A bedroom with a double bed, an upholstered headboard and bedside cabinets"),
  kitchen: p("stay-kitchen-0609", "The kitchen", "The kitchen with fitted wood-finish cabinets and a window over the sink"),
  kitchenCounter: p("stay-kitchen-counter-0552", "The counter", "The kitchen counter with a fridge, an oven and cookware"),
  appliances: p("stay-kitchen-appliances-0557", "Fridge and microwave", "A fridge, a microwave and a set of cooking pots on the kitchen counter"),
  cooker: p("stay-cooker-0625", "The cooker", "A four-burner gas cooker with an oven", true, "50% 55%"),
  light: p("stay-ceiling-light-0635", "A ceiling light", "A gold ceiling light, lit"),
};

export type Room = { slug: string; name: string; photo: StayPhoto; more: StayPhoto[]; notes: string[] };

export const ROOMS: Room[] = [
  {
    slug: "lounge",
    name: "Lounge",
    photo: STAY.lounge,
    more: [STAY.loungeCorner, STAY.hallway],
    notes: ["L-shaped upholstered sofa", "Round nested tables on a patterned rug", "Wall-mounted TV and a water dispenser"],
  },
  {
    slug: "kitchen",
    name: "Kitchen",
    photo: STAY.kitchen,
    more: [STAY.appliances, STAY.cooker],
    notes: ["Fitted cabinets in a wood finish", "Fridge and microwave", "Gas cooker with an oven, and cookware"],
  },
  {
    slug: "bedroom",
    name: "Bedroom",
    photo: STAY.bedroom,
    more: [STAY.light],
    notes: ["Double bed with an upholstered headboard", "Bedside cabinets", "Tiled floor"],
  },
];

export const STAY_UNCONFIRMED = [
  { label: "Location", ask: "where the accommodation is" },
  { label: "Number of units", ask: "how many units there are" },
  { label: "Rates", ask: "the rates" },
  { label: "How to book", ask: "how to book" },
];

export const askStay = (body: string) => whatsappLink(body);
