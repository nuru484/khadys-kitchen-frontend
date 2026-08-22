import type { ReactNode } from 'react';
import toast, { type Toast } from 'react-hot-toast';
import { Check, Sparkle, X } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';
export type ToastTone = 'site' | 'admin';

export interface NotifyOptions {
  description?: string;
  tone?: ToastTone;
  duration?: number;
}

const DEFAULT_DURATION = 5000;

const TYPE_STYLES: Record<
  ToastType,
  { glyph: ReactNode; iconBg: string; siteBorder: string }
> = {
  success: { glyph: <Check className="h-[15px] w-[15px]" />, iconBg: 'var(--color-success)', siteBorder: 'rgba(36,26,18,0.15)' },
  error: { glyph: '!', iconBg: 'var(--color-danger)', siteBorder: 'color-mix(in srgb, var(--color-danger) 35%, transparent)' },
  info: {
    glyph: <Sparkle className="h-[15px] w-[15px]" />,
    iconBg: 'var(--color-accent)',
    siteBorder: 'rgba(36,26,18,0.15)',
  },
};

interface ToastCardProps {
  t: Toast;
  type: ToastType;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
}

/** The brand toast card (icon · title · sub · dismiss · progress bar). */
export function ToastCard({
  t,
  type,
  title,
  description,
  tone,
  duration,
}: ToastCardProps) {
  const admin = tone === 'admin';
  const style = TYPE_STYLES[type];

  return (
    <div
      // Errors interrupt (role=alert); the rest stay polite announcements.
      role={type === 'error' ? 'alert' : 'status'}
      className={cn(
        'relative flex w-[min(360px,92vw)] items-start gap-3.5 overflow-hidden rounded-[16px] border px-[18px] py-4',
        admin ? 'text-cream' : 'text-ink',
      )}
      style={{
        background: admin ? 'var(--color-ink)' : 'var(--color-card)',
        borderColor: admin ? 'rgba(246,239,228,0.15)' : style.siteBorder,
        animation: t.visible
          ? 'kk-toastin .4s both'
          : 'kk-fadein .2s reverse both',
      }}
    >
      <span
        className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full text-[15px] text-card"
        style={{ background: style.iconBg }}
        aria-hidden="true"
      >
        {style.glyph}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-semibold">{title}</div>
        {description ? (
          <div
            className={cn(
              'mt-0.5 text-[13px]',
              admin ? 'text-cream/60' : 'text-ink/60',
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => toast.dismiss(t.id)}
        className={cn(
          'flex-none cursor-pointer text-[15px]',
          admin ? 'text-cream/60' : 'text-ink/60',
        )}
      >
        <X className="h-[15px] w-[15px]" aria-hidden="true" />
      </button>
      <span
        className="absolute bottom-0 left-0 h-[3px] w-full"
        style={{
          background: style.iconBg,
          transformOrigin: 'left',
          animation: t.visible
            ? `kk-toast-progress ${duration}ms linear forwards`
            : 'none',
        }}
        aria-hidden="true"
      />
    </div>
  );
}

function push(
  type: ToastType,
  title: string,
  opts: NotifyOptions = {},
): string {
  const duration = opts.duration ?? DEFAULT_DURATION;
  return toast.custom(
    (t) => (
      <ToastCard
        t={t}
        type={type}
        title={title}
        description={opts.description}
        tone={opts.tone ?? 'site'}
        duration={duration}
      />
    ),
    { duration },
  );
}

/**
 * Fire a brand toast. `notify.error(...)` pairs naturally with `extractApiError`:
 *   notify.error("Couldn't place the order", { description: extractApiError(e).message })
 */
export const notify = {
  success: (title: string, opts?: NotifyOptions) =>
    push('success', title, opts),
  error: (title: string, opts?: NotifyOptions) => push('error', title, opts),
  info: (title: string, opts?: NotifyOptions) => push('info', title, opts),
  dismiss: (id?: string) => toast.dismiss(id),
};
