import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Error message - turns the field red and is announced to screen readers. */
  error?: string;
  /** Marks the field valid (green border + check). */
  valid?: boolean;
  /** Helper text shown when there is no error. */
  hint?: string;
  /** For password fields: shows an eye toggle to reveal/hide the value. */
  revealable?: boolean;
}

/**
 * Labelled text input with inline validation states (error / valid)
 * and an optional password reveal toggle. Ref-forwarding so it drops into
 * react-hook-form via `{...register("field")}`.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, error, valid, hint, revealable, className, id, type, onChange, ...props },
    ref,
  ) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    const msgId = `${fieldId}-msg`;
    const [revealed, setRevealed] = useState(false);

    const canReveal = revealable && type === "password";
    const inputType = canReveal && revealed ? "text" : type;

    // Date fields: mobile browsers render an empty <input type="date"> as a
    // bare box, so while empty the native text is hidden and the placeholder
    // prop is overlaid instead. Emptiness is read off the DOM node after every
    // render - react-hook-form's reset() writes values without an event.
    // The deliberately dependency-less effect re-checks each render (the
    // same-value setState bails out, so this can't loop).
    const isDate = type === "date";
    const innerRef = useRef<HTMLInputElement | null>(null);
    const [dateEmpty, setDateEmpty] = useState(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      if (isDate) setDateEmpty(!innerRef.current?.value);
    });
    const showDateHint = isDate && dateEmpty && Boolean(props.placeholder);

    return (
      <div className="grid gap-[7px]">
        <label
          htmlFor={fieldId}
          className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60"
        >
          {label}
        </label>
        <div className="group relative">
          <input
            ref={(node) => {
              innerRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            id={fieldId}
            type={inputType}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || hint ? msgId : undefined}
            onChange={(e) => {
              if (isDate) setDateEmpty(!e.target.value);
              onChange?.(e);
            }}
            onClick={
              isDate
                ? (e) => {
                    try {
                      e.currentTarget.showPicker?.();
                    } catch {
                      // Unsupported - the native tap behaviour still opens it.
                    }
                  }
                : undefined
            }
            className={cn(
              "w-full rounded-[12px] border-[1.5px] bg-cream px-[15px] py-3 font-sans text-[15px] text-ink outline-none transition-colors",
              canReveal && "pr-11",
              isDate && "cursor-pointer",
              showDateHint && "text-transparent focus:text-ink",
              error
                ? "border-danger bg-danger/[0.04]"
                : valid
                  ? "border-success bg-success/[0.04] pr-9"
                  : "border-ink/20 focus:border-accent",
              className,
            )}
            {...props}
          />
          {showDateHint ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-[15px] z-[1] flex items-center text-[15px] text-ink/45 group-focus-within:hidden"
            >
              {props.placeholder}
            </span>
          ) : null}
          {canReveal ? (
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              aria-label={revealed ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/45 transition-colors hover:text-ink"
            >
              {revealed ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.39-1.61" />
                  <path d="m2 2 20 20" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          ) : valid && !error ? (
            <span
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-success"
              aria-hidden="true"
            >
              ✓
            </span>
          ) : null}
        </div>
        {error ? (
          <span id={msgId} className="text-[12.5px] font-semibold text-danger">
            {error}
          </span>
        ) : hint ? (
          <span id={msgId} className="text-[12.5px] text-ink/55">
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);
