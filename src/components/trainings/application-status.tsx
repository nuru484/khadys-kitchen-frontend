import Link from "next/link";
import { PayBalanceButton } from "@/components/trainings/pay-balance-button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format-money";
import { routes } from "@/lib/routes";
import type { PublicApplication } from "@/lib/public-api";

const STATUS_COPY: Record<
  PublicApplication["status"],
  { label: string; tone: "open" | "muted" | "closed" }
> = {
  PENDING: { label: "Under review", tone: "muted" },
  WAITLISTED: { label: "Waitlisted", tone: "muted" },
  RECRUITED: { label: "Admitted", tone: "open" },
  REJECTED: { label: "Not admitted", tone: "closed" },
  WITHDRAWN: { label: "Withdrawn", tone: "closed" },
};

const TONE_CLASS = {
  open: "bg-[#2E6B3F]/10 text-[#2E6B3F]",
  muted: "bg-accent/10 text-accent",
  closed: "bg-ink/[0.07] text-ink/55",
};

/**
 * The application-status panel a receipt-code link (`/trainings/KK-A…`, as sent
 * in the confirmation email/SMS) renders: status, training, the money ledger,
 * and — while a balance is owed — the online payment handoff.
 */
export function ApplicationStatus({
  application,
}: {
  application: PublicApplication;
}) {
  const status = STATUS_COPY[application.status];
  const firstName = application.fullName.split(" ")[0] || "friend";
  const canPay =
    application.balance > 0 &&
    application.status !== "REJECTED" &&
    application.status !== "WITHDRAWN";

  const ledger = [
    { label: "Amount due", value: application.amountDue },
    { label: "Paid so far", value: application.amountPaid },
    { label: "Balance", value: application.balance, strong: true },
  ];

  return (
    <section className="mx-auto max-w-[680px] px-[clamp(20px,5vw,48px)] py-[clamp(48px,7vw,96px)]">
      <p className="mb-4 text-center text-[13px] font-semibold uppercase tracking-[0.22em] text-accent">
        Application status
      </p>
      <h1 className="mb-3 text-center font-serif text-[clamp(30px,4vw,46px)] font-normal leading-[1.1]">
        Hello, {firstName}.
      </h1>
      {application.training ? (
        <p className="mx-auto mb-[clamp(28px,4vw,40px)] max-w-[48ch] text-center text-[16px] leading-[1.65] text-ink/65">
          Here&rsquo;s where your application for{" "}
          <Link
            href={`/trainings/${application.training.slug}`}
            className="font-semibold text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:text-accent"
          >
            {application.training.name}
          </Link>{" "}
          stands.
        </p>
      ) : (
        <p className="mx-auto mb-[clamp(28px,4vw,40px)] max-w-[48ch] text-center text-[16px] leading-[1.65] text-ink/65">
          Here&rsquo;s where your application stands.
        </p>
      )}

      <div className="overflow-hidden rounded-[22px] border border-ink/10 bg-card">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-ink/[0.09] px-[clamp(22px,3.5vw,36px)] py-[20px]">
          <div>
            <div className="text-[12px] uppercase tracking-[0.12em] text-ink/50">
              Receipt code
            </div>
            <div className="font-serif text-[22px] tracking-[0.08em] text-accent">
              {application.code}
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.1em]",
              TONE_CLASS[status.tone],
            )}
          >
            {status.label}
          </span>
        </div>

        {ledger.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 border-b border-ink/[0.09] px-[clamp(22px,3.5vw,36px)] py-[16px] sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          >
            <span className="text-[15px] font-semibold text-ink/70">
              {row.label}
            </span>
            <span
              className={cn(
                "whitespace-nowrap font-serif text-[19px]",
                row.strong && row.value > 0 && "text-accent",
              )}
            >
              {formatMoney(row.value, application.currency)}
            </span>
          </div>
        ))}

        <div className="px-[clamp(22px,3.5vw,36px)] py-[clamp(22px,3vw,30px)] text-center">
          {canPay ? (
            <PayBalanceButton
              code={application.code}
              hasEmail={Boolean(application.email)}
            />
          ) : application.balance === 0 ? (
            <p className="text-[15px] font-semibold text-[#2E6B3F]">
              ✓ Fully paid — nothing left to settle.
            </p>
          ) : (
            <p className="text-[14.5px] leading-[1.6] text-ink/60">
              Online payment isn&rsquo;t available for this application.
            </p>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-[14px] leading-[1.65] text-ink/55">
        Prefer to pay in person, or have a question? Quote your code{" "}
        <span className="font-semibold text-ink/75">{application.code}</span>{" "}
        and{" "}
        <Link
          href={routes.contact}
          className="font-semibold text-accent no-underline"
        >
          message us →
        </Link>
      </p>
    </section>
  );
}
