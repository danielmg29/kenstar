# The journey: how its frames are made

The homepage journey, "The making of a space", plays **pre-rendered Blender frames**. The site never runs 3D. It shows:
- photographs-like stills;
- short walking sequences between the stops;
- a vector line drawing of each chapter's new work, traced from the same camera.

Everything is built by script, so it can be rebuilt and re-rendered at will.

## Pipeline

1. **Assets.** Run `node render/fetch-assets.mjs`. It downloads the CC0 textures, models and skies from Poly Haven (polyhaven.com) into `render/assets/`, which git ignores. The client approved this on 2026-11-20.
2. **Scene and renders.** `render/journey/` holds the scene:
   - `world.py`: the geometry, chapter by chapter;
   - `materials.py`: the materials;
   - `run.py`: cameras, light and render jobs.

   `bash render/render-all.sh` renders everything. On the current laptop it took about three hours on the CPU (the GTX 1050's 2023 driver is too old for Blender 5.3's GPU rendering; after a driver update, set `KS_DEVICE=OPTIX` and `KS_PORTALS=1`). Single jobs can be re-run, for example:

   ```bash
   "/c/Program Files/Blender Foundation/Blender 5.3/blender.exe" -b --factory-startup -P render/journey/run.py -- still 4 4 day c4-after
   ```
3. **Encode.** `node render/encode.mjs` writes the site's assets:
   - WebP frames to `public/journey/`;
   - simplified stroke files to `public/journey/lines-c*.json`;
   - the manifest of anchors and cameras to `app/_components/journey/frames.json`.

## What is rendered

| Per chapter | Size | Notes |
|---|---|---|
| `c{n}-before` | 1600 × 1200 | The site as it stood, at the chapter's stop |
| `c{n}-after` | 1600 × 1200 | The same camera, with the chapter's work built |
| `c{n}-walk-000…011` | 800 × 600 | The walk from the previous stop |
| `lines-c{n}.json` | vector | Freestyle silhouettes, borders and creases of the chapter's new objects, grouped in build order |
| `c5-dusk`, `c5-night` | 1600 × 1200 | Arrival at dusk, then with every fitting lit |

- **Frame shape:** frames are 4:3 masters with a 78° horizontal field. Wide screens crop top and bottom. Phones crop to the middle, centred on the chapter's Field Notes.
- **Optical centre:** a lens shift puts it at 56% of the width, leaving room for the title block on the left.

## The world

Coordinates are metres: x right, y up, z away from the first camera. Blender's Z is the site's y.

| Chapter | Built |
|---|---|
| 01 Approach | Green Embu ground with scattered grass and shrubs, hills, a bitumen road with murram verges, a stream crossing on a culvert, a yellow steel truss footbridge (after `work-civil-bridge-0130`), street lights, a power line on timber poles, trees |
| 02 Structure | A stone plinth, concrete frame and slabs, eucalyptus props and pole scaffolding, sand and ballast heaps |
| 03 Materials | Machine-cut stone walls (450 × 225 courses), aluminium windows and sliding doors, a hipped maroon box-profile roof with fascia and gutters, cement on a pallet, stone blocks, steel bars |
| 04 Systems | Conduits, switches and sockets, ceiling roses with drops, a wash-hand basin with a gold mixer and oval mirror, a ladder |
| 05 Finish | See the room below |
| 06 Arrival | A gold ribbon pendant with three crystal lamps over the table (after Kenstar's 0981), a tiered crystal chandelier over the living area, wall brackets; dusk, then the final light |

### The room

A luxurious, modern living and dining room, furnished for the middle and upper-middle-class families Kenstar's showroom serves:

- **Floor and walls:** marble-look porcelain floor (1200 × 600), painted plaster and skirting.
- **Ceiling:** gypsum, with two lit coffers and downlights.
- **Living area:**
  - an L-shaped velvet sectional with throw pillows and a leather recliner;
  - two round marble coffee tables on gold rings, with vases and books;
  - a layered rug, a side table and lamp, and an arc floor lamp;
  - large abstract art.
- **Dining area:**
  - an eight-seater marble dining table on a gold base, with velvet chairs on gold legs;
  - a fluted walnut sideboard with a marble top and a mirror.
- **Openings and finishing touches:** velvet drapes and sheers at the sliding doors, plants, and a walnut double front door.

## Field Note anchors

Anchors are defined in `world.py`. `run.py anchors` projects them into each stop's frame, and the site places reticles and notes from `frames.json`.

## Light

| Shot | Light |
|---|---|
| Day | A partly cloudy sky (CC0 HDRI) turned so the sun comes from the front left |
| Dusk | A procedural twilight sky |
| Night | Every fitting on in warm white: coves, downlights, the chandelier, the pendant, brackets and lamps |

The glazing is thin architectural glass, so daylight reaches the room. Crystal lets lamplight through.

## Still open

- **Resolution.** Stills are 1600 × 1200 at 20 samples and walking frames 800 × 600 at 6 samples, sized for CPU rendering. They look soft on large high-density screens. With GPU rendering, re-render at 2400 × 1800 and about 24 walking frames per chapter.

- Kenstar's own photographs for Field Notes 03.1 (hardware) and 06.2 (accommodation).
- If the client wants it, a professional Blender artist can take over these scene files. Asset choices and detail can then go further.
