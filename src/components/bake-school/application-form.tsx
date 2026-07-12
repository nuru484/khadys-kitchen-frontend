"use client";

import { useId, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicationSchema,
  type ApplicationValues,
} from "@/validations/application-schema";
import { Button } from "@/components/ui/Button";
import { ChoiceButton } from "@/components/ui/ChoiceButton";
import { FieldError } from "@/components/ui/FieldError";
import {
  TurnstileWidget,
  TURNSTILE_ENABLED,
} from "@/components/ui/TurnstileWidget";
import {
  itemPriceLabel,
  splitFeeItems,
} from "@/components/trainings/training-price";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { useCreateApplicationMutation } from "@/redux/applications/applications-api";
import type { IFeeItem, ITraining } from "@/types/training.types";

const inputClass =
  "w-full rounded-[12px] border border-ink/20 bg-cream px-4 py-3.5 font-sans text-[16px] text-ink outline-none transition-colors focus:border-accent";

const labelClass =
  "grid gap-2 text-[13.5px] font-semibold uppercase tracking-[0.06em] text-ink/70";

/** Where the code is stashed before a Paystack redirect, read back on /trainings/verify. */
export const APPLY_CODE_KEY = "kk_apply_code";

/** "course-fee" → "Course fee" — a choice group's slug as a human heading. */
const groupHeading = (key: string) => {
  const words = key.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** One selectable fee option — name + note on the left, price on the right. */
function FeeOption({
  currency,
  item,
  onClick,
  selected,
}: {
  currency: string;
  item: IFeeItem;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        // Phones stack title/note above the amount — side-by-side columns
        // starve long titles of width while the amount floats in dead space.
        "flex w-full cursor-pointer flex-col gap-1.5 rounded-[14px] border-[1.5px] px-4 py-3.5 text-left transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        selected
          ? "border-accent bg-accent/[0.07]"
          : "border-ink/20 bg-cream hover:border-ink/45",
      )}
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-ink">
          {item.name}
        </span>
        {item.note ? (
          <span className="mt-0.5 block text-[13.5px] leading-[1.5] text-ink/60">
            {item.note}
          </span>
        ) : null}
      </span>
      <span className="shrink-0 sm:text-right">
        <span className="block whitespace-nowrap font-serif text-[17px] text-ink">
          {itemPriceLabel(item, currency)}
        </span>
        {item.suffix ? (
          <span className="block text-[12px] text-ink/55">{item.suffix}</span>
        ) : null}
      </span>
    </button>
  );
}

export function ApplicationForm({ training }: { training: ITraining }) {
  const fieldId = useId();
  const { choiceGroups, optionalItems, requiredItems } = useMemo(
    () => splitFeeItems(training),
    [training],
  );
  // Every fee item by id, for price totals and hostel detection.
  const itemsById = useMemo(
    () => new Map((training.feeItems ?? []).map((item) => [item.id, item])),
    [training],
  );
  // A mandatory group starts on its first-listed option, so the form is always
  // in a valid, fully-priced state.
  const defaultSelection = useMemo(
    () =>
      choiceGroups
        .filter((group) => group.mandatory)
        .map((group) => group.items[0].id),
    [choiceGroups],
  );

  const [submitted, setSubmitted] = useState(false);
  const [applicantName, setApplicantName] = useState("friend");
  const [receiptCode, setReceiptCode] = useState("");
  const [askedHostel, setAskedHostel] = useState(false);
  // Cloudflare Turnstile: the token gates submit only when a site key is set.
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState(false);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [createApplication, { isLoading: submitting }] =
    useCreateApplicationMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      location: "",
      selectedFeeItemIds: defaultSelection,
      message: "",
      payMode: "full",
      partAmount: "",
    },
  });

  const selected = useWatch({ control, name: "selectedFeeItemIds" });
  const payMode = useWatch({ control, name: "payMode" });

  const isHostelItem = (id: string) => itemsById.get(id)?.kind === "HOSTEL";

  // Variants replace each other; add-ons toggle.
  const pickVariant = (groupItems: IFeeItem[], id: string, mandatory: boolean) => {
    const others = selected.filter(
      (s) => !groupItems.some((item) => item.id === s),
    );
    const keep = mandatory || !selected.includes(id);
    setValue("selectedFeeItemIds", keep ? [...others, id] : others);
  };
  const toggleAddOn = (id: string) => {
    setValue(
      "selectedFeeItemIds",
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  const total =
    requiredItems.reduce((sum, item) => sum + item.amount, 0) +
    selected.reduce((sum, id) => sum + (itemsById.get(id)?.amount ?? 0), 0);
  const hasFeeChoices = choiceGroups.length > 0 || optionalItems.length > 0;
  const showFees = hasFeeChoices || total > 0;

  const onSubmit = async (data: ApplicationValues) => {
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setTurnstileError(true);
      return;
    }
    const needsHostel = data.selectedFeeItemIds.some(isHostelItem);

    // Payment is part of applying now — part or full, never nothing. The
    // amount bounds depend on the live fee total, so they're checked here
    // rather than in the static schema.
    let payAmount: number | undefined;
    if (total > 0) {
      if (data.payMode === "part") {
        const part = Number(data.partAmount);
        if (!data.partAmount || Number.isNaN(part) || part <= 0) {
          setError("partAmount", {
            message: "Enter the amount you're paying now.",
          });
          return;
        }
        payAmount = Math.round(part * 100);
        if (payAmount > total) {
          setError("partAmount", {
            message: "That's more than your fee — pay in full instead.",
          });
          return;
        }
      } else {
        payAmount = total;
      }
      if (!data.email) {
        setError("email", {
          message: "Add an email so we can send your payment receipt.",
        });
        return;
      }
    }

    try {
      const res = await createApplication({
        trainingId: training.id,
        fullName: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email || undefined,
        location: data.location || undefined,
        needsHostel,
        selectedFeeItemIds: data.selectedFeeItemIds,
        message: data.message || undefined,
        payAmount,
        turnstileToken: turnstileToken || undefined,
      }).unwrap();

      // Hand off to Paystack, remembering the code for the return trip.
      if (res.data.authorizationUrl) {
        sessionStorage.setItem(APPLY_CODE_KEY, res.data.code);
        window.location.assign(res.data.authorizationUrl);
        return;
      }

      setReceiptCode(res.data.code);
      setApplicantName(data.name.trim().split(" ")[0] || "friend");
      setAskedHostel(needsHostel);
      setSubmitted(true);
    } catch (err) {
      const { message, fieldErrors, hasFieldErrors } = extractApiError(err);
      if (hasFieldErrors && fieldErrors) {
        for (const [field, msg] of Object.entries(fieldErrors)) {
          const target =
            field === "fullName"
              ? "name"
              : field === "payAmount"
                ? "partAmount"
                : field;
          if (
            target === "name" ||
            target === "phone" ||
            target === "email" ||
            target === "location" ||
            target === "message" ||
            target === "partAmount"
          ) {
            setError(target, { message: msg });
          }
        }
      }
      notify.error("Couldn't submit your application", { description: message });
      // A Turnstile token is single-use — reset so a retry gets a fresh one.
      setTurnstileReset((n) => n + 1);
    }
  };

  return (
    <section
      id="apply"
      className="mx-auto max-w-[760px] px-[clamp(20px,5vw,48px)] py-[clamp(56px,8vw,100px)]"
    >
      <p className="mb-4 text-center text-[13px] font-semibold uppercase tracking-[0.22em] text-accent">
        Applications open
      </p>
      <h2 className="mb-3.5 text-center font-serif text-[clamp(32px,4vw,52px)] font-normal">
        Apply for this class
      </h2>
      <p className="mx-auto mb-[clamp(32px,4vw,44px)] max-w-[48ch] text-center text-[16px] leading-[1.65] text-ink/65">
        Fill this in and Khady&rsquo;s team will reach you on WhatsApp within two
        working days.
      </p>

      {submitted ? (
        <div className="rounded-[22px] border border-ink/10 bg-card p-[clamp(36px,5vw,56px)] text-center">
          <div className="mx-auto mb-[22px] grid h-16 w-16 place-items-center rounded-full bg-accent text-[28px] text-[#FDFAF3]">
            ✓
          </div>
          <h3 className="mb-3 font-serif text-[28px] font-normal">
            Application received
          </h3>
          <p className="mb-4 text-[16px] leading-[1.65] text-ink/70">
            Thank you, {applicantName}. We&rsquo;ll contact you on WhatsApp within
            two working days.
          </p>
          <div className="mx-auto mb-4 inline-block rounded-[12px] border border-ink/10 bg-oat px-6 py-3">
            <div className="text-[12px] uppercase tracking-[0.12em] text-ink/50">
              Your receipt code
            </div>
            <div className="font-serif text-[24px] tracking-[0.1em] text-accent">
              {receiptCode}
            </div>
          </div>
          <p className="text-[14.5px] leading-[1.6] text-ink/55">
            Keep this code safe — quote it to pay in person, or to check your
            status.
            {askedHostel
              ? " Asked for a hostel place? We'll confirm availability first."
              : ""}
          </p>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-[22px] rounded-[22px] border border-ink/10 bg-card p-[clamp(24px,4vw,44px)]"
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-[22px]">
            <label className={labelClass}>
              Full name
              <input
                {...register("name")}
                placeholder="e.g. Ama Mensah"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? `${fieldId}-name` : undefined}
                className={inputClass}
              />
              <FieldError id={`${fieldId}-name`} message={errors.name?.message} />
            </label>
            <label className={labelClass}>
              Phone / WhatsApp
              <input
                {...register("phone")}
                placeholder="e.g. 024 000 0000"
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? `${fieldId}-phone` : undefined}
                className={inputClass}
              />
              <FieldError id={`${fieldId}-phone`} message={errors.phone?.message} />
            </label>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-[22px]">
            <label className={labelClass}>
              Email {total > 0 ? "(required — payment receipt)" : "(optional)"}
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? `${fieldId}-email` : undefined}
                className={inputClass}
              />
              <FieldError id={`${fieldId}-email`} message={errors.email?.message} />
            </label>
            <label className={labelClass}>
              Where are you based?
              <input
                {...register("location")}
                placeholder="e.g. Kumasi, Asokwa"
                aria-invalid={errors.location ? true : undefined}
                aria-describedby={
                  errors.location ? `${fieldId}-location` : undefined
                }
                className={inputClass}
              />
              <FieldError
                id={`${fieldId}-location`}
                message={errors.location?.message}
              />
            </label>
          </div>

          {showFees ? (
            <div className="grid gap-4 rounded-[16px] border border-ink/10 bg-oat/50 p-4 sm:p-5">
              {choiceGroups.map((group) => (
                <div key={group.key} className="grid gap-2.5">
                  <span className="text-[13.5px] font-semibold uppercase tracking-[0.06em] text-ink/70">
                    {groupHeading(group.key)}
                    <span className="font-normal normal-case tracking-normal text-ink/55">
                      {" "}
                      — pick one
                    </span>
                  </span>
                  {group.items.map((item) => (
                    <FeeOption
                      key={item.id}
                      item={item}
                      currency={training.currency}
                      selected={selected.includes(item.id)}
                      onClick={() =>
                        pickVariant(group.items, item.id, group.mandatory)
                      }
                    />
                  ))}
                </div>
              ))}

              {optionalItems.length > 0 ? (
                <div className="grid gap-2.5">
                  <span className="text-[13.5px] font-semibold uppercase tracking-[0.06em] text-ink/70">
                    Optional extras
                    <span className="font-normal normal-case tracking-normal text-ink/55">
                      {" "}
                      — tap to add
                    </span>
                  </span>
                  {optionalItems.map((item) => (
                    <FeeOption
                      key={item.id}
                      item={item}
                      currency={training.currency}
                      selected={selected.includes(item.id)}
                      onClick={() => toggleAddOn(item.id)}
                    />
                  ))}
                </div>
              ) : null}

              {requiredItems.some((item) => item.amount > 0) ? (
                <div className="grid gap-1.5">
                  {requiredItems
                    .filter((item) => item.amount > 0)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-baseline justify-between gap-4 px-1 text-[14px] text-ink/70"
                      >
                        <span>{item.name}</span>
                        <span className="whitespace-nowrap">
                          {itemPriceLabel(item, training.currency)}
                        </span>
                      </div>
                    ))}
                </div>
              ) : null}

              <div className="flex items-baseline justify-between gap-4 border-t border-ink/10 pt-3.5">
                <span className="text-[13.5px] font-semibold uppercase tracking-[0.06em] text-ink/70">
                  Your fee
                </span>
                <span className="whitespace-nowrap font-serif text-[22px] leading-tight text-accent">
                  {formatMoney(total, training.currency)}
                </span>
              </div>
            </div>
          ) : null}

          {total > 0 ? (
            <div className="grid gap-2.5">
              <span className="text-[13.5px] font-semibold uppercase tracking-[0.06em] text-ink/70">
                How much are you paying now?
              </span>
              <div className="flex flex-wrap gap-2.5">
                <ChoiceButton
                  selected={payMode === "full"}
                  onClick={() => setValue("payMode", "full")}
                >
                  Full — {formatMoney(total, training.currency)}
                </ChoiceButton>
                <ChoiceButton
                  selected={payMode === "part"}
                  onClick={() => setValue("payMode", "part")}
                >
                  Part payment
                </ChoiceButton>
              </div>
              {payMode === "part" ? (
                <label className={labelClass}>
                  Amount to pay now ({training.currency})
                  <input
                    {...register("partAmount")}
                    type="number"
                    inputMode="decimal"
                    min={1}
                    step="0.01"
                    placeholder="e.g. 500"
                    aria-invalid={errors.partAmount ? true : undefined}
                    aria-describedby={
                      errors.partAmount ? `${fieldId}-part` : undefined
                    }
                    className={inputClass}
                  />
                  <FieldError
                    id={`${fieldId}-part`}
                    message={errors.partAmount?.message}
                  />
                  <span className="text-[13px] font-normal normal-case tracking-normal text-ink/55">
                    Pay any amount now — the balance stays on your receipt code
                    and you can complete it anytime.
                  </span>
                </label>
              ) : null}
            </div>
          ) : null}

          <label className={labelClass}>
            Anything we should know? (optional)
            <textarea
              {...register("message")}
              rows={4}
              placeholder="Your baking experience, questions about fees, preferred start date…"
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? `${fieldId}-message` : undefined}
              className={cn(inputClass, "resize-y")}
            />
            <FieldError
              id={`${fieldId}-message`}
              message={errors.message?.message}
            />
          </label>

          <TurnstileWidget
            onVerify={(token) => {
              setTurnstileToken(token);
              if (token) setTurnstileError(false);
            }}
            resetSignal={turnstileReset}
          />
          {turnstileError ? (
            <FieldError
              id={`${fieldId}-turnstile`}
              message="Please complete the verification to submit your application."
            />
          ) : null}

          <Button
            type="submit"
            size="lg"
            isLoading={submitting}
            loadingText="Submitting…"
            className="w-full rounded-full"
          >
            {total > 0 ? "Continue to payment" : "Submit application"}
          </Button>
          <p className="text-center text-[13px] text-ink/50">
            By applying you agree to be contacted by Khady&rsquo;s Kitchen about
            enrolment.{" "}
            {total > 0
              ? "You'll pay securely via Paystack — part or full, your choice."
              : "We'll confirm your place on WhatsApp."}
          </p>
        </form>
      )}
    </section>
  );
}
