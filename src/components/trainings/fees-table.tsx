import { Reveal } from "@/components/reveal";
import {
  feeRowStacks,
  isAddOn,
  itemPriceLabel,
  splitFeeItems,
} from "@/components/trainings/training-price";
import { cn } from "@/lib/utils";
import type { IFeeItem, ITraining } from "@/types/training.types";

/**
 * The class's fee breakdown. Every price stands on its own — there is no
 * summed total, because fee items are independent: variants sharing a
 * choiceGroup are alternatives ("pick one", shown joined by an OR divider) and
 * optional items are added only if the applicant chooses them when applying.
 */

type Block =
  | { type: "group"; items: IFeeItem[] }
  | { type: "item"; item: IFeeItem };

function toBlocks(training: ITraining): Block[] {
  const { choiceGroups } = splitFeeItems(training);
  const groupByKey = new Map(choiceGroups.map((g) => [g.key, g]));
  const emitted = new Set<string>();
  const blocks: Block[] = [];
  const items = [...(training.feeItems ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  for (const item of items) {
    const key = item.choiceGroup ?? null;
    if (!key) {
      blocks.push({ item, type: "item" });
    } else if (!emitted.has(key)) {
      emitted.add(key);
      blocks.push({ items: groupByKey.get(key)?.items ?? [item], type: "group" });
    }
  }
  return blocks;
}

function FeeRow({
  badge,
  index,
  item,
  currency,
}: {
  badge: string | null;
  index: number;
  item: IFeeItem;
  currency: string;
}) {
  // A name/note that wraps keeps the price BELOW it at every width — the
  // text spreads the full row instead of squeezing beside a price column.
  const stacks = feeRowStacks(item.name, item.note);
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 px-[clamp(20px,3.5vw,36px)] py-[clamp(20px,3vw,28px)]",
        !stacks &&
          "sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-6",
      )}
    >
      <div
        className={cn(
          "flex items-baseline gap-[18px]",
          !stacks && "sm:flex-[1_1_320px]",
        )}
      >
        <span className="min-w-[22px] font-serif text-[15px] text-accent">
          {index}
        </span>
        <div>
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-[17px] font-semibold">{item.name}</span>
            {badge ? (
              <span className="rounded-full bg-ink/[0.07] px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/55">
                {badge}
              </span>
            ) : null}
          </div>
          {item.note ? (
            <div className="mt-[5px] max-w-[56ch] text-[14.5px] leading-[1.55] text-ink/60">
              {item.note}
            </div>
          ) : null}
        </div>
      </div>
      <div className={cn("pl-10", !stacks && "sm:pl-0 sm:text-right")}>
        <div className="whitespace-nowrap font-serif text-[clamp(18px,2vw,22px)] leading-tight">
          {itemPriceLabel(item, currency)}
        </div>
        {item.suffix ? (
          <div className="mt-[5px] font-sans text-[13px] text-ink/55">
            {item.suffix}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function FeesTable({ training }: { training: ITraining }) {
  const blocks = toBlocks(training);
  if (blocks.length === 0) return null;

  const hasChoices = blocks.some(
    (b) => b.type === "group" || isAddOn(b.item),
  );

  return (
    <section id="costs" className="border-t border-ink/10 bg-oat">
      <div className="mx-auto max-w-[1080px] px-[clamp(20px,5vw,48px)] py-[clamp(56px,8vw,100px)]">
        <p className="mb-4 text-center text-[13px] font-semibold uppercase tracking-[0.22em] text-accent">
          Fees &amp; what they cover
        </p>
        <Reveal variant="mask" className="text-center">
          <h2 className="mb-3.5 font-serif text-[clamp(32px,4vw,52px)] font-normal">
            Price details
          </h2>
        </Reveal>
        <p className="mx-auto mb-[clamp(36px,5vw,56px)] max-w-[52ch] text-center text-[16px] leading-[1.65] text-ink/65">
          Everything is transparent - here is exactly what this class costs and
          what is covered for you.
        </p>

        <Reveal className="overflow-hidden rounded-[22px] border border-ink/10 bg-card">
          {blocks.map((block, blockIndex) => {
            const divider =
              blockIndex < blocks.length - 1 ? "border-b border-ink/[0.09]" : "";
            // A choice group shares one number — it is one decision, not many fees.
            const row = blockIndex + 1;
            if (block.type === "item") {
              return (
                <div key={block.item.id} className={divider}>
                  <FeeRow
                    badge={isAddOn(block.item) ? "Optional" : null}
                    index={row}
                    item={block.item}
                    currency={training.currency}
                  />
                </div>
              );
            }
            return (
              <div key={block.items[0].id} className={divider}>
                {block.items.map((item, i) => (
                  <div key={item.id}>
                    {i > 0 ? (
                      <div
                        aria-hidden="true"
                        className="flex items-center gap-4 px-[clamp(20px,3.5vw,36px)]"
                      >
                        <span className="h-px flex-1 bg-ink/[0.09]" />
                        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
                          or
                        </span>
                        <span className="h-px flex-1 bg-ink/[0.09]" />
                      </div>
                    ) : null}
                    <FeeRow
                      badge="Pick one"
                      index={row}
                      item={item}
                      currency={training.currency}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </Reveal>

        {hasChoices ? (
          <p className="mx-auto mt-5 max-w-[56ch] text-center text-[14px] leading-[1.6] text-ink/55">
            Each price stands on its own — options joined by &ldquo;or&rdquo;
            are alternatives, and optional items are added only if you choose
            them when applying.
          </p>
        ) : null}
      </div>
    </section>
  );
}
