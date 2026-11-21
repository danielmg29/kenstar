// One authored icon set: 24px grid, 1.75 stroke, square caps to match the drafting world.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export const ArrowRight = (p: P) => (
  <Base {...p}><path d="M4 12h15M13 6l6 6-6 6" /></Base>
);
export const ArrowDown = (p: P) => (
  <Base {...p}><path d="M12 4v15M6 13l6 6 6-6" /></Base>
);
export const ChevronLeft = (p: P) => (
  <Base {...p}><path d="M15 5l-7 7 7 7" /></Base>
);
export const ChevronRight = (p: P) => (
  <Base {...p}><path d="M9 5l7 7-7 7" /></Base>
);
export const Phone = (p: P) => (
  <Base {...p}><path d="M5 3.5h3.5l1.8 4.6-2.3 1.5a11 11 0 0 0 6.4 6.4l1.5-2.3 4.6 1.8V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5Z" /></Base>
);
export const Chat = (p: P) => (
  <Base {...p}>
    <path d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.4-1.1A8.5 8.5 0 1 0 12 3.5Z" />
    <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9a4.5 4.5 0 0 1-2.4-2.4l.9-1-1-2Z" strokeWidth={1.4} />
  </Base>
);
export const Pin = (p: P) => (
  <Base {...p}><path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z" /><path d="M12 12.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" /></Base>
);
export const Mail = (p: P) => (
  <Base {...p}><path d="M3.5 5.5h17v13h-17z" /><path d="M3.5 6l8.5 7 8.5-7" /></Base>
);
export const Menu = (p: P) => (
  <Base {...p}><path d="M3.5 7h17M3.5 12h17M3.5 17h11" /></Base>
);
export const Close = (p: P) => (
  <Base {...p}><path d="M5.5 5.5l13 13M18.5 5.5l-13 13" /></Base>
);
export const Clock = (p: P) => (
  <Base {...p}><path d="M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z" /><path d="M12 7.5V12l3 2" /></Base>
);
export const Plus = (p: P) => (
  <Base {...p}><path d="M12 5v14M5 12h14" /></Base>
);
export const Check = (p: P) => (
  <Base {...p}><path d="M4.5 12.5l5 5 10-11" /></Base>
);
export const Expand = (p: P) => (
  <Base {...p}><path d="M14 4.5h5.5V10M10 19.5H4.5V14M19.5 4.5l-6 6M4.5 19.5l6-6" /></Base>
);
