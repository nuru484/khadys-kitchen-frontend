import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

export type ButtonVariant =
  | "primary"
  | "dark"
  | "outline"
  | "ghost"
  | "danger"
  | "success";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-card hover:bg-ink",
  dark: "bg-ink text-cream hover:bg-accent",
  outline: "border-[1.5px] border-ink/25 bg-transparent text-ink hover:border-accent hover:text-accent",
  ghost: "bg-transparent text-ink hover:bg-ink/[0.06]",
  danger: "bg-danger text-card hover:opacity-90",
  success: "bg-success text-card",
};

// Steady, shadcn-like sizing that stays consistent across breakpoints instead
// of ballooning on desktop. `sm` for tables/toolbars, `md` for forms & dialogs,
// `lg` reserved for prominent marketing/checkout CTAs.
const SIZES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-[12.5px] lg:px-4 lg:text-[13px]",
  md: "px-5 py-2.5 text-[13.5px] md:text-[14px]",
  lg: "px-6 py-3 text-[14px] md:px-7 md:py-3.5 lg:px-8 lg:py-4 lg:text-[15px]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button. */
  isLoading?: boolean;
  /** Label to show while loading (defaults to the normal children). */
  loadingText?: string;
}

/**
 * Brand button with its full set of states - default, loading (spinner),
 * disabled, and a `success` variant. Loading forces `disabled` so it can't
 * double-submit.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    loadingText,
    disabled,
    className,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  const onDarkFill = variant === "primary" || variant === "dark" || variant === "danger" || variant === "success";
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full font-sans font-semibold tracking-[0.02em] transition-colors disabled:cursor-not-allowed",
        !isLoading && "disabled:bg-ink/[0.12] disabled:text-ink/45 disabled:border-transparent",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner onAccent={onDarkFill} /> : null}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
});

/**
 * Link styled identically to Button - same variants/sizes - so navigation
 * actions ("+ New item") match click actions ("+ Add member") pixel for pixel
 * instead of each page hand-rolling its own pill.
 */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full font-sans font-semibold tracking-[0.02em] no-underline transition-colors",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}
