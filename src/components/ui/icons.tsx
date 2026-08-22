import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

/**
 * Shared geometry for every icon: a 24-unit box that draws in `currentColor`
 * and takes its size from the `className` the caller passes, so an icon sits
 * in a sized wrapper exactly where a text glyph used to.
 */
const OUTLINE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const SOLID = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  stroke: "none",
} as const;

/** Tick - confirmations, completed steps, valid fields. */
export function Check(props: IconProps) {
  return (
    <svg {...OUTLINE} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Cross - close, dismiss, clear, remove. */
export function X(props: IconProps) {
  return (
    <svg {...OUTLINE} {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/** Five-pointed star - ratings and featured marks. */
export function Star(props: IconProps) {
  return (
    <svg {...OUTLINE} {...props}>
      <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9z" />
    </svg>
  );
}

/** Four-pointed star, drawn solid so it reads as a decorative accent mark. */
export function Sparkle(props: IconProps) {
  return (
    <svg {...SOLID} {...props}>
      <path d="M12 2q1 9 10 10-9 1-10 10-1-9-10-10 9-1 10-10Z" />
    </svg>
  );
}

/** Loaf - stands in for an item that has no photo yet. */
export function Bread(props: IconProps) {
  return (
    <svg {...OUTLINE} {...props}>
      <path d="M3 16a9 6 0 0 1 18 0v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M9 10.6 7.5 19.5" />
      <path d="M14 10.2 12.5 19.5" />
    </svg>
  );
}
