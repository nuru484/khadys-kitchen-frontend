export function ContactHero() {
  return (
    <section className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] pb-[clamp(24px,3vw,40px)] pt-[clamp(56px,8vw,96px)] lg:pl-6">
      <p
        className="mb-4 text-[13px] font-semibold uppercase tracking-[0.22em] text-accent"
        style={{ animation: "kk-fadein .8s .1s both" }}
      >
        Contact us
      </p>
      <h1 className="mb-[18px] max-w-[20ch] text-balance font-serif text-[clamp(38px,5.5vw,72px)] font-normal leading-[1.05]">
        <span className="block overflow-hidden">
          <span
            className="inline-block"
            style={{ animation: "kk-lineup .9s .15s cubic-bezier(.16,.84,.28,1) both" }}
          >
            Talk to us - we answer
          </span>
        </span>
        <span className="block overflow-hidden">
          <span
            className="inline-block"
            style={{ animation: "kk-lineup .9s .3s cubic-bezier(.16,.84,.28,1) both" }}
          >
            faster than the oven{" "}
            <em className="font-serif not-italic text-accent">preheats.</em>
          </span>
        </span>
      </h1>
      <p
        className="max-w-[52ch] text-[clamp(16px,1.4vw,18px)] leading-[1.65] text-ink/80"
        style={{ animation: "kk-fadein .8s .5s both" }}
      >
        Orders, custom cakes, class enrolment or anything else - WhatsApp is
        quickest, but every channel below reaches a human.
      </p>
    </section>
  );
}
