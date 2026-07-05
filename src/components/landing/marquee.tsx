import { marqueeItems } from "@/lib/bake-school-data";

export function Marquee() {
  // Two identical sequences so the -50% translate loops seamlessly.
  const sequence = (
    <>
      {marqueeItems.map((item) => (
        <span key={item}>
          <span className="px-7">{item}</span>
          <span className="text-accent">✦</span>
        </span>
      ))}
    </>
  );

  return (
    <div
      className="overflow-hidden whitespace-nowrap bg-ink py-4 text-cream"
      aria-hidden="true"
    >
      <div
        className="inline-block font-serif text-[20px] tracking-[0.12em]"
        style={{ animation: "kk-marquee 26s linear infinite" }}
      >
        {sequence}
        {sequence}
      </div>
    </div>
  );
}
