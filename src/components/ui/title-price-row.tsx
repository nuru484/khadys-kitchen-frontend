import { cn } from "@/lib/utils";

interface TitlePriceRowProps {
  name: string;
  price: string;
  /** Font classes for the title (must match the card's title styling). */
  nameClassName: string;
  /** Font classes for the price. */
  priceClassName: string;
}

/**
 * Title + price on one row when they fit, with the price dropping onto its own
 * line beneath the title when they don't — without ever forcing a title that
 * would otherwise fit on one line to wrap just to keep the price beside it.
 *
 * Pure CSS (no measuring, so it's immune to web-font load timing):
 * - `flex-wrap` lets the price fall to the next line when it can't fit.
 * - The title `shrink-0`, so flex wraps the price to a new line instead of
 *   squeezing (and wrapping) the title to make room for it.
 * - The title `max-w-full`, so a title that is genuinely wider than the row
 *   still wraps on its own (with the price beneath it) rather than overflowing.
 */
export function TitlePriceRow({
  name,
  price,
  nameClassName,
  priceClassName,
}: TitlePriceRowProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h3 title={name} className={cn(nameClassName, "max-w-full shrink-0 break-words")}>
        {name}
      </h3>
      <span className={cn("whitespace-nowrap", priceClassName)}>{price}</span>
    </div>
  );
}
