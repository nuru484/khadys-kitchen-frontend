import type { ReactNode } from "react";
import { Sparkle } from "@/components/ui/icons";

/**
 * The same-day announcement, split into phrases so the star separators land
 * between them and the band keeps its ticker look (uppercase serif, accent
 * highlights) instead of reading as a running sentence.
 */
const SEGMENTS: { key: string; content: ReactNode }[] = [
  { key: "hook", content: <>Need a cake on the same day?</> },
  {
    key: "call",
    content: (
      <>
        Call Khady&rsquo;s Kitchen on{" "}
        <span className="text-accent-2">0540546469 | 0502187856</span>
      </>
    ),
  },
  { key: "where", content: <>Kumasi, Santasi</> },
  {
    key: "cakes",
    content: <>Bowl cakes and Loaf cakes are all available</>,
  },
];

export function Marquee() {
  // Two identical sequences so the -50% translate loops seamlessly.
  const sequence = (
    <>
      {SEGMENTS.map((item) => (
        <span key={item.key}>
          <span className="px-7">{item.content}</span>
          <Sparkle className="inline h-[13px] w-[13px] align-[-0.05em] text-accent" />
        </span>
      ))}
    </>
  );

  return (
    <div
      className="group overflow-hidden whitespace-nowrap bg-ink py-4 text-cream"
      aria-hidden="true"
    >
      <div className="inline-block font-serif text-[20px] uppercase tracking-[0.12em] [animation:kk-marquee_26s_linear_infinite] group-hover:[animation-play-state:paused]">
        {sequence}
        {sequence}
      </div>
    </div>
  );
}
