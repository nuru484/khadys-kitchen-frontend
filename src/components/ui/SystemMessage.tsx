import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SystemMessageAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "dark" | "outline";
}

export interface SystemMessageProps {
  /** Big display number, e.g. "404". Mutually exclusive with `glyph`. */
  code?: string;
  /** Icon inside a circle, e.g. a sparkle or a cross. */
  glyph?: ReactNode;
  title: string;
  description?: string;
  actions?: SystemMessageAction[];
  tone?: "light" | "dark";
  className?: string;
}

/** Full-bleed system state - 404, maintenance, access denied, etc. */
export function SystemMessage({
  code,
  glyph,
  title,
  description,
  actions = [],
  tone = "light",
  className,
}: SystemMessageProps) {
  const dark = tone === "dark";

  const actionClass = (variant: SystemMessageAction["variant"] = "primary") => {
    const map = {
      primary: "bg-accent text-card hover:bg-ink",
      dark: dark ? "bg-cream text-ink hover:bg-accent hover:text-cream" : "bg-ink text-cream hover:bg-accent",
      outline: dark
        ? "border-[1.5px] border-cream/30 text-cream hover:border-cream"
        : "border-[1.5px] border-ink/25 text-ink hover:border-accent hover:text-accent",
    };
    return cn(
      "cursor-pointer rounded-full px-[26px] py-3 text-[14px] font-semibold no-underline transition-colors",
      map[variant],
    );
  };

  return (
    <div
      className={cn(
        "rounded-[20px] p-[clamp(36px,5vw,56px)_clamp(24px,4vw,40px)] text-center",
        dark ? "bg-ink text-cream" : "border border-ink/10 bg-card text-ink",
        className,
      )}
    >
      {code ? (
        <div className="font-serif text-[clamp(56px,8vw,84px)] leading-none text-accent">{code}</div>
      ) : glyph ? (
        <span
          className={cn(
            "inline-grid h-[62px] w-[62px] place-items-center rounded-full font-serif text-[24px]",
            dark ? "border-[1.5px] border-cream/30 text-accent-2" : "bg-ink/[0.07] text-ink",
          )}
          aria-hidden="true"
        >
          {glyph}
        </span>
      ) : null}

      <div className="mt-4 font-serif text-[clamp(22px,3vw,24px)]">{title}</div>
      {description ? (
        <p
          className={cn(
            "mx-auto mb-[22px] mt-2.5 max-w-[36ch] text-[14.5px] leading-[1.6]",
            dark ? "text-cream/70" : "text-ink/60",
          )}
        >
          {description}
        </p>
      ) : null}

      {actions.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2.5">
          {actions.map((a) =>
            a.href ? (
              <Link key={a.label} href={a.href} className={actionClass(a.variant)}>
                {a.label}
              </Link>
            ) : (
              <button key={a.label} type="button" onClick={a.onClick} className={actionClass(a.variant)}>
                {a.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
