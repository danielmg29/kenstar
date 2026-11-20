// Line drawings for the six chapters, in the photos' own coordinate space
// (viewBox 2000 × 1334, the 3:2 frame of the 2560 × 1707 showroom photos), so a
// drawing registers over its photograph. Traced by hand from Kenstar's photos.
//
// Labels sit on solid plates (--plate / --plate-ink) so they hold over photographs.
// Below 768px the labels are too small to read, so the drawing shows numbered
// markers instead and the figure caption carries the key (see CALLOUTS).
import type { DrawingId } from "../_content/site";

const T = 40; // annotation text size in drawing units (≈12px at desktop figure width)
const CHAR = 0.64; // average advance of the tracked caps, in ems

function Tag({ x, y, label, anchor = "middle", size = T }: { x: number; y: number; label: string; anchor?: "start" | "middle" | "end"; size?: number }) {
  const w = label.length * size * CHAR;
  const left = anchor === "start" ? x - 10 : anchor === "end" ? x - w - 10 : x - w / 2 - 10;
  return (
    <g className="d-text">
      <rect x={left} y={y - size * 0.86} width={w + 20} height={size * 1.18} fill="var(--plate, #f3f6f9)" />
      <text className="dim-text" x={x} y={y} textAnchor={anchor} fontSize={size} fill="var(--plate-ink, #0b2d52)" style={{ fill: "var(--plate-ink, #0b2d52)" }}>
        {label}
      </text>
    </g>
  );
}

function DimH({ x1, x2, y, label, up = true }: { x1: number; x2: number; y: number; label: string; up?: boolean }) {
  const e = up ? 26 : -26;
  return (
    <g className="d-note">
      <path
        className="draw-line"
        d={`M${x1} ${y + e} V${y - 10} M${x2} ${y + e} V${y - 10} M${x1} ${y} H${x2} M${x1 - 11} ${y + 11} L${x1 + 11} ${y - 11} M${x2 - 11} ${y + 11} L${x2 + 11} ${y - 11}`}
      />
      <Tag x={(x1 + x2) / 2} y={y - 22} label={label} />
    </g>
  );
}

function DimV({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  return (
    <g className="d-note">
      <path
        className="draw-line"
        d={`M${x - 26} ${y1} H${x + 10} M${x - 26} ${y2} H${x + 10} M${x} ${y1} V${y2} M${x - 11} ${y1 + 11} L${x + 11} ${y1 - 11} M${x - 11} ${y2 + 11} L${x + 11} ${y2 - 11}`}
      />
      <g transform={`translate(${x + 46} ${(y1 + y2) / 2}) rotate(90)`}>
        <Tag x={0} y={14} label={label} />
      </g>
    </g>
  );
}

function Leader({ n, from, to, label, anchor = "start" }: { n: number; from: [number, number]; to: [number, number]; label: string; anchor?: "start" | "end" }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const tx = anchor === "start" ? x2 + 18 : x2 - 18;
  return (
    <>
      <g className="d-note">
        <circle cx={x1} cy={y1} r={7} fill="currentColor" />
        <path className="draw-line" d={`M${x1} ${y1} L${x2} ${y2} H${anchor === "start" ? x2 + 8 : x2 - 8}`} />
        <Tag x={tx} y={y2 + 14} label={label} anchor={anchor} />
      </g>
      {/* Phone view: a numbered marker on the object; the caption carries the key. */}
      <g className="d-marker" aria-hidden="true">
        <circle cx={x1} cy={y1} r={62} fill="var(--plate, #f3f6f9)" stroke="currentColor" strokeWidth={6} />
        <text x={x1} y={y1 + 23} textAnchor="middle" fontSize={68} className="dim-text" style={{ fill: "var(--plate-ink, #0b2d52)" }}>
          {n}
        </text>
      </g>
    </>
  );
}

/** Phone-only numbered marker for a note that has no leader line. */
function Marker({ n, at }: { n: number; at: [number, number] }) {
  const [x, y] = at;
  return (
    <g className="d-marker" aria-hidden="true">
      <circle cx={x} cy={y} r={62} fill="var(--plate, #f3f6f9)" stroke="currentColor" strokeWidth={6} />
      <text x={x} y={y + 23} textAnchor="middle" fontSize={68} className="dim-text" style={{ fill: "var(--plate-ink, #0b2d52)" }}>
        {n}
      </text>
    </g>
  );
}

/** Labels that only appear at desktop size, listed for the phone caption key (numbered = marker on the drawing). */
export const CALLOUTS: Record<DrawingId, string[]> = {
  "first-line": ["Cement, 50 kg bag", "Roofing sheet, profile", "Steel bar, deformed"],
  power: ["Switches & sockets", "Standard plate"],
  water: ["Tall basin mixer", "Basin mixer"],
  surface: ["Cut line", "Skirting", "Floor tiles, setting out", "Wall finish"],
  living: ["Dining set", "Table leg, gold finish"],
  "final-light": ["Crystal lamp", "Gold ribbon pendant"],
};

const rect = (x1: number, y1: number, x2: number, y2: number) => `M${x1} ${y1} H${x2} V${y2} H${x1} Z`;

function L({ d }: { d: string }) {
  return <path className="draw-line d-line" pathLength={1} d={d} />;
}

/* 02 Power — the switch & socket board (IMG_0964) */
function Power() {
  const plates = [
    [205, 243, 365, 395], [405, 240, 555, 390], [603, 245, 750, 393], [793, 247, 940, 392], [973, 255, 1110, 390], [1158, 250, 1295, 390], [1313, 262, 1450, 405],
    [203, 467, 355, 617], [413, 470, 563, 620], [610, 462, 757, 612], [797, 467, 943, 612], [975, 462, 1113, 605], [1155, 458, 1300, 600], [1323, 467, 1470, 612],
    [210, 683, 365, 833], [413, 685, 563, 833], [613, 678, 760, 826], [800, 672, 945, 820], [990, 673, 1130, 815], [1170, 665, 1315, 812],
    [220, 897, 377, 1050], [420, 893, 570, 1040], [615, 888, 763, 1037], [797, 882, 943, 1030], [993, 878, 1133, 1020], [1160, 868, 1290, 1008],
  ];
  return (
    <>
      <L d="M130 168 L1912 236 L1915 1110 L150 1157 Z" />
      {plates.map(([a, b, c, d]) => (
        <L key={`${a}-${b}`} d={rect(a, b, c, d)} />
      ))}
      <DimH x1={205} x2={365} y={205} label="Standard plate" />
      <Marker n={2} at={[285, 320]} />
      <Leader n={1} from={[1450, 520]} to={[1500, 120]} label="Switches & sockets" anchor="end" />
    </>
  );
}

/* 03 Water — basin mixers on the counter (IMG_0686) */
function Water() {
  return (
    <>
      <L d="M0 1195 H2000" />
      <L d="M392 1040 V330 C392 300 410 288 440 282 L600 242 C622 240 626 252 608 262 L520 322 C508 332 500 345 500 362 V1040 Z" />
      <L d="M800 1050 V340 H925 V1050 Z M800 340 L700 312 L705 300 H870 M686 194 L905 250 V340" />
      <L d="M490 1150 V718 H635 V1150 Z M490 762 H362 C346 762 346 792 362 796 V900 H490 M482 628 H645 V655 H482 Z" />
      <L d="M985 1145 V700 H1110 V1145 Z M962 642 L1110 632 L1115 700 H985 Z M1110 790 L1240 820 L1245 930 L1110 902" />
      <L d="M1228 1045 V400 C1228 362 1250 346 1280 340 L1340 346 V1045 Z M1236 345 L1496 286 C1505 292 1495 302 1480 306 L1340 346" />
      <L d="M1465 1140 V720 H1612 V1140 Z M1485 660 L1675 670 V700 L1612 720 H1485 Z M1612 800 L1830 842 L1855 900 L1612 882" />
      <DimV x={1395} y1={290} y2={1045} label="Tall basin mixer" />
      <DimV x={1690} y1={660} y2={1140} label="Basin mixer" />
      <Marker n={1} at={[1285, 700]} />
      <Marker n={2} at={[1540, 930]} />
    </>
  );
}

/* 05 Living — dining table and chairs (IMG_0783) */
function Living() {
  return (
    <>
      <L d="M590 470 L1015 318 L1500 338 L1190 650 Z M600 505 L1188 692" />
      <L d="M975 720 C988 820 1000 905 1010 1000 L1025 1235 H1080 L1086 1000 C1098 905 1112 820 1130 720" />
      <L d="M318 478 C318 440 380 432 440 436 L640 452 C668 456 680 490 665 520 L690 700 L940 800 L955 830 L480 905 L455 880 L330 500 Z M478 905 L505 1150 M690 985 L715 1255 M920 830 L950 1045" />
      <L d="M1215 520 C1225 470 1270 440 1330 420 L1440 380 C1475 372 1490 400 1475 430 L1360 790 L1180 890 L1150 870 L1215 520 Z M1180 890 L1205 1150 M1345 800 L1350 1035" />
      <Leader n={1} from={[1030, 450]} to={[1180, 150]} label="Dining set" />
      <Leader n={2} from={[1060, 1100]} to={[1360, 1250]} label="Table leg, gold finish" />
    </>
  );
}

/* 06 Final light — gold ribbon pendant (IMG_0981) */
function FinalLight() {
  return (
    <>
      <L d="M960 30 C1000 4 1170 4 1210 30 C1170 56 1000 56 960 30" />
      <L d="M1030 0 L1005 530 M1140 60 L1132 902 M1320 120 L1352 658" />
      <L d="M840 585 A160 55 0 1 0 1160 585 A160 55 0 1 0 840 585 M945 610 V790 H1045 V610" />
      <L d="M1222 700 A128 42 0 1 0 1478 700 A128 42 0 1 0 1222 700 M1318 722 V885 H1413 V722" />
      <L d="M976 950 A152 48 0 1 0 1280 950 A152 48 0 1 0 976 950 M1078 975 V1145 H1173 V975" />
      <L d="M600 470 C700 360 860 300 990 300 M640 470 C560 560 560 760 640 800 C700 830 770 800 790 700" />
      <L d="M920 340 C900 470 960 640 1040 660 C1150 680 1250 640 1300 470 C1320 420 1300 340 1240 320" />
      <L d="M1240 320 C1360 360 1480 380 1560 440 C1640 500 1670 640 1600 760 C1560 840 1490 900 1440 920 M660 820 C700 900 820 930 900 900" />
      <Leader n={1} from={[1180, 1080]} to={[1500, 1210]} label="Crystal lamp" />
      <Leader n={2} from={[1560, 440]} to={[1700, 200]} label="Gold ribbon pendant" anchor="end" />
    </>
  );
}

/* 01 First line — no photo yet: cement bag, roofing profile, steel bar */
function FirstLine() {
  const wave = Array.from({ length: 13 }, (_, i) => {
    const x = 760 + i * 76;
    return `${i === 0 ? `M${x} 520 ` : ""}C${x + 19} 470 ${x + 57} 470 ${x + 76} 520`;
  }).join(" ");
  const ribs = Array.from({ length: 30 }, (_, i) => `M${780 + i * 31} 834 L${798 + i * 31} 866`).join(" ");
  return (
    <>
      <L d="M260 430 L600 410 L630 980 L240 1000 Z M268 520 L604 500 M262 470 C380 456 480 452 600 440" />
      <L d="M760 520 H1748" />
      <L d={wave} />
      <L d="M770 834 H1720 V866 H770 Z" />
      <L d={ribs} />
      <Leader n={1} from={[430, 720]} to={[300, 1120]} label="Cement, 50 kg bag" />
      <DimH x1={760} x2={836} y={420} label="Pitch" />
      <g className="d-note">
        <Tag x={1254} y={610} label="Roofing sheet, profile" />
        <Tag x={1245} y={940} label="Steel bar, deformed" />
      </g>
      <DimH x1={770} x2={1720} y={1030} label="Length" up={false} />
      <Marker n={2} at={[1254, 520]} />
      <Marker n={3} at={[1245, 850]} />
    </>
  );
}

/* 04 Surface — no photo yet: floor tile setting-out and wall finish */
function Surface() {
  const cols = Array.from({ length: 6 }, (_, i) => `M${300 + i * 160} 300 V1000`).join(" ");
  const rows = Array.from({ length: 4 }, (_, i) => `M300 ${300 + i * 175} H1260`).join(" ");
  return (
    <>
      <L d={`${rect(300, 300, 1260, 1000)} ${cols} ${rows}`} />
      <L d="M1220 300 L1300 1000" />
      <L d="M1460 260 H1820 V1000 H1460 Z M1460 930 H1820 M1460 945 H1820" />
      <DimH x1={300} x2={460} y={250} label="Tile" />
      <Leader n={1} from={[1262, 640]} to={[1340, 1120]} label="Cut line" anchor="end" />
      <Leader n={2} from={[1640, 937]} to={[1700, 1200]} label="Skirting" />
      <g className="d-note">
        <Tag x={780} y={1090} label="Floor tiles, setting out" />
        <Tag x={1640} y={1090} label="Wall finish" />
      </g>
      <Marker n={3} at={[620, 560]} />
      <Marker n={4} at={[1640, 600]} />
    </>
  );
}

const MAP: Record<DrawingId, () => React.ReactElement> = {
  "first-line": FirstLine,
  power: Power,
  water: Water,
  surface: Surface,
  living: Living,
  "final-light": FinalLight,
};

export function Drawing({ id, className }: { id: DrawingId; className?: string }) {
  const Body = MAP[id];
  return (
    <svg viewBox="0 0 2000 1334" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" strokeWidth={1.4}>
      <Body />
    </svg>
  );
}
