// Price details render every fee independently: variants sharing a choiceGroup
// are alternatives joined by "or" (never summed into a total), optional items
// are badged, and the old "Total (required)" row is gone for good.
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { FeesTable } from "@/components/trainings/fees-table";
import { fromPriceLabel } from "@/components/trainings/training-price";
import type { IFeeItem, ITraining } from "@/types/training.types";

vi.mock("@/components/reveal", () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const fee = (over: Partial<IFeeItem> & { id: string }): IFeeItem => ({
  name: over.id,
  amount: 0,
  kind: "OTHER",
  required: true,
  choiceGroup: null,
  note: null,
  suffix: null,
  priceLabel: null,
  position: 0,
  ...over,
});

// Mirrors the real "Two Months" class: two course-fee variants + add-ons.
const training = (feeItems: IFeeItem[]) =>
  ({ currency: "GHS", feeItems }) as ITraining;

const VARIANTS = [
  fee({
    id: "reg",
    name: "Registration & school fees",
    amount: 200_000,
    kind: "REGISTRATION",
    choiceGroup: "course-fee",
    position: 0,
  }),
  fee({
    id: "ing",
    name: "95% ingredients provided",
    amount: 290_000,
    kind: "INGREDIENTS",
    choiceGroup: "course-fee",
    required: false,
    position: 1,
  }),
  fee({ id: "uniform", name: "School uniform", amount: 25_000, required: false, position: 2 }),
];

afterEach(() => cleanup());

describe("FeesTable", () => {
  it("never sums the prices — no total row", () => {
    render(<FeesTable training={training(VARIANTS)} />);
    expect(screen.queryByText(/total/i)).not.toBeInTheDocument();
    // 2,000 + 2,900 must never appear combined.
    expect(screen.queryByText(/4,900/)).not.toBeInTheDocument();
  });

  it("joins choice-group variants with an OR divider and badges them", () => {
    render(<FeesTable training={training(VARIANTS)} />);
    expect(screen.getByText("or")).toBeInTheDocument();
    expect(screen.getAllByText("Pick one")).toHaveLength(2);
    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getByText("GHS 2,000.00")).toBeInTheDocument();
    expect(screen.getByText("GHS 2,900.00")).toBeInTheDocument();
  });

  it("renders nothing without fee items", () => {
    const { container } = render(<FeesTable training={training([])} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("fromPriceLabel", () => {
  it("is the cheapest possible bill: required items + cheapest variant", () => {
    expect(fromPriceLabel(training(VARIANTS))).toBe("From GHS 2,000.00");
  });

  it("adds always-charged items to the floor and skips add-ons", () => {
    const items = [
      ...VARIANTS,
      fee({ id: "kit", name: "Starter kit", amount: 10_000, position: 3 }),
      fee({ id: "hostel", name: "Hostel", amount: 70_000, kind: "HOSTEL", position: 4 }),
    ];
    expect(fromPriceLabel(training(items))).toBe("From GHS 2,100.00");
  });

  it("is null for a fee-less class", () => {
    expect(fromPriceLabel(training([fee({ id: "tools", amount: 0 })]))).toBeNull();
  });
});
