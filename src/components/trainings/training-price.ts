import { formatMoney } from "@/lib/format-money";
import type { IFeeItem, ITraining } from "@/types/training.types";

/**
 * How a fee item is charged (mirrors the backend `computeApplicableFees`):
 * - standalone + required (non-hostel): always part of the bill;
 * - standalone + optional (or HOSTEL kind): an add-on the applicant ticks;
 * - items sharing a `choiceGroup`: mutually exclusive price variants — the
 *   applicant picks exactly one, the amounts are NEVER summed.
 */
export interface FeeChoiceGroup {
  key: string;
  items: IFeeItem[];
  /** True when the group must have a pick (it contains a required item). */
  mandatory: boolean;
}

export interface SplitFees {
  /** Always charged, in position order. */
  requiredItems: IFeeItem[];
  /** Pick-one variant groups, ordered by their first item's position. */
  choiceGroups: FeeChoiceGroup[];
  /** Tick-to-add extras (incl. hostel), in position order. */
  optionalItems: IFeeItem[];
}

export const isAddOn = (item: IFeeItem): boolean =>
  !item.required || item.kind === "HOSTEL";

export function splitFeeItems(training: ITraining): SplitFees {
  const items = [...(training.feeItems ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  const grouped = new Map<string, IFeeItem[]>();
  const requiredItems: IFeeItem[] = [];
  const optionalItems: IFeeItem[] = [];
  for (const item of items) {
    const group = item.choiceGroup ?? null;
    if (group) {
      grouped.set(group, [...(grouped.get(group) ?? []), item]);
    } else if (isAddOn(item)) {
      optionalItems.push(item);
    } else {
      requiredItems.push(item);
    }
  }
  const choiceGroups = [...grouped.entries()].map(([key, members]) => ({
    items: members,
    key,
    mandatory: members.some((m) => m.required),
  }));
  return { choiceGroups, optionalItems, requiredItems };
}

/** The formatted price of one item — priceLabel wins over the amount. */
export function itemPriceLabel(item: IFeeItem, currency: string): string {
  return item.priceLabel ?? formatMoney(item.amount, currency);
}

/**
 * True when a fee's name/note is long enough to wrap beside its price. Such
 * rows keep the amount BELOW the text at every breakpoint — the text spreads
 * the full row instead of running down a starved column — matching the
 * stacking phones always use. CSS can't branch on "did the text wrap", so
 * this length heuristic decides deterministically; pair it with flex-wrap so
 * borderline widths degrade the same way.
 */
export function feeRowStacks(name: string, note?: string | null): boolean {
  return name.length > 42 || (note?.length ?? 0) > 56;
}

/**
 * "From GHS X" entry price for a class — the smallest possible bill: every
 * always-charged item plus the cheapest variant of each mandatory choice
 * group (add-ons are the applicant's call). A fee-less class (e.g. a free
 * taster) has no price to show. Cards, the detail hero, and the sticky apply
 * bar all share it.
 */
export function fromPriceLabel(training: ITraining): string | null {
  const { choiceGroups, requiredItems } = splitFeeItems(training);
  const base = requiredItems.reduce((sum, item) => sum + item.amount, 0);
  const variants = choiceGroups
    .filter((group) => group.mandatory)
    .reduce(
      (sum, group) => sum + Math.min(...group.items.map((i) => i.amount)),
      0,
    );
  const minimum = base + variants;
  if (minimum <= 0) return null;
  return `From ${formatMoney(minimum, training.currency)}`;
}

/** duration · mode, e.g. "2 months · In-person · Kumasi studio". */
export function metaLine(training: ITraining): string | null {
  const parts = [training.duration, training.mode].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}
