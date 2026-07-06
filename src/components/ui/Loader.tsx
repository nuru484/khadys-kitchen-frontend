import { cn } from "@/lib/utils";

/**
 * Pulsing ripple loader — a static halo (accent at 20% opacity) around a solid
 * accent core, with an accent copy that expands into the halo and dissolves,
 * looping forever.
 *
 * Colors come from the `accent` token (the site's primary), so the loader tracks
 * the theme rather than hardcoding a colour. The pulse is driven by the inline
 * `kk-ripple` animation, which globals.css disables under
 * `prefers-reduced-motion` (via its `[style*="kk-"]` rule).
 */
export function RippleLoader({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("relative grid h-16 w-16 place-items-center", className)}
    >
      {/* Halo — static, ~2.5× the core (core is 40% of the box). */}
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 h-full w-full rounded-full bg-accent/20"
      />
      {/* Ripple — a core copy that grows toward the halo and fades out. */}
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 h-2/5 w-2/5 rounded-full bg-accent"
        style={{ animation: "kk-ripple 1.8s cubic-bezier(0, 0, 0.2, 1) infinite" }}
      />
      {/* Core — solid, always visible. */}
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 h-2/5 w-2/5 rounded-full bg-accent"
      />
    </span>
  );
}

/**
 * Full-viewport centered loading state — the app's general loading screen (the
 * ripple over the cream surface with a caption), mirroring how dms shows its
 * LoadingScreen in the route guard.
 */
export function LoadingScreen({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-6",
        className,
      )}
    >
      <RippleLoader />
      <p className="text-[13.5px] font-medium tracking-[0.02em] text-ink/55">
        Loading, please wait…
      </p>
    </div>
  );
}
