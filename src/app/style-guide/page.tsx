"use client";

import { useState, type ReactNode } from "react";
import { ShopCardSkeleton } from "@/components/ui/ShopCardSkeleton";
import { DataTableSkeleton } from "@/components/ui/DataTableSkeleton";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";
import { ProductDetailSkeleton } from "@/components/ui/ProductDetailSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { Modal } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/ErrorState";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { SystemMessage } from "@/components/ui/SystemMessage";
import { Check, Sparkle, X } from "@/components/ui/icons";
import { notify } from "@/lib/notify";
import { routes } from "@/lib/routes";

function Section({
  n,
  title,
  note,
  children,
}: {
  n: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex items-baseline gap-3.5 border-b border-ink/15 pb-3">
        <span className="font-serif text-[15px] text-accent">{n}</span>
        <h2 className="font-serif text-[clamp(24px,3vw,32px)] font-normal">{title}</h2>
        {note ? <span className="ml-auto text-[13px] text-ink/50">{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/50">
      {children}
    </div>
  );
}

const grid = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5";

export default function StyleGuidePage() {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmAdmit, setConfirmAdmit] = useState(false);
  const [holdBed, setHoldBed] = useState(true);
  const [orderModal, setOrderModal] = useState(false);

  return (
    <div className="min-h-screen bg-cream pb-32 text-ink">
      <header className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] pb-[clamp(28px,4vw,44px)] pt-[clamp(48px,7vw,80px)]">
        <p className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.22em] text-accent">
          Khady&rsquo;s Kitchen · Design specification
        </p>
        <h1 className="mb-3.5 font-serif text-[clamp(36px,5vw,60px)] font-normal">
          UI states &amp; components
        </h1>
        <p className="max-w-[62ch] text-[16.5px] leading-[1.65] text-ink/70">
          The production states for the site and admin console - loading skeletons,
          empty states, modals, toasts, errors, and system pages. Every specimen is
          a reusable component from <code className="text-accent">@/components/ui</code>.
        </p>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-[clamp(44px,6vw,64px)] px-[clamp(20px,5vw,48px)]">
        {/* 1 · Skeletons */}
        <Section n="01" title="Loading skeletons" note="Shimmer sweeps left → right · 1.8s loop">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-5">
            <div>
              <Caption>Shop · product card</Caption>
              <ShopCardSkeleton />
            </div>
            <div>
              <Caption>Admin · data table</Caption>
              <DataTableSkeleton rowCount={4} />
            </div>
            <div>
              <Caption>Admin · dashboard stats + chart</Caption>
              <DashboardSkeleton />
            </div>
            <div>
              <Caption>Shop · product detail</Caption>
              <ProductDetailSkeleton />
            </div>
          </div>
        </Section>

        {/* 2 · Empty states */}
        <Section n="02" title="Empty states" note="Glyph · title · hint · one action">
          <div className={grid}>
            <div>
              <EmptyState
                title="Nothing here yet."
                description="New classes are announced here first - check back soon."
                action={{ label: "Browse all trainings", href: routes.trainings }}
              />
              <div className="mt-2"><Caption>Site · empty state</Caption></div>
            </div>
            <div>
              <EmptyState
                title="Nothing matches “kelewele”."
                description="Try another word, or clear the filters to see all 14 bakes."
                action={{ label: "Clear search & filters", variant: "dark" }}
              />
              <div className="mt-2"><Caption>Site · no search results</Caption></div>
            </div>
            <div>
              <EmptyState
                title="No applications yet."
                description="When students apply to the Bake School, they'll appear here for review."
                action={{ label: "Share the application link" }}
              />
              <div className="mt-2"><Caption>Admin · no applications</Caption></div>
            </div>
            <div>
              <EmptyState
                title="The queue is clear."
                description="Every order is baked and collected. Enjoy the quiet - it never lasts."
                action={{ label: "View all items", variant: "dark" }}
              />
              <div className="mt-2"><Caption>Admin · no orders today</Caption></div>
            </div>
          </div>
        </Section>

        {/* 3 · Modals */}
        <Section n="03" title="Modals" note="Scrim · radius 22px · max-width 440px · focus-trapped">
          <div className="flex flex-wrap gap-3">
            <Button variant="danger" onClick={() => setConfirmRemove(true)}>
              Destructive confirm
            </Button>
            <Button onClick={() => setConfirmAdmit(true)}>Action confirm</Button>
            <Button variant="dark" onClick={() => setOrderModal(true)}>
              Success confirmation
            </Button>
          </div>

          <ConfirmationDialog
            open={confirmRemove}
            onOpenChange={setConfirmRemove}
            isDestructive
            title="Remove “Vanilla Cupcakes”?"
            description="The item comes off the shop immediately. Its 2 open orders stay in the queue and must still be baked."
            confirmText="Remove item"
            cancelText="Keep it"
            onConfirm={() => notify.success("Vanilla Cupcakes removed", { description: "Open orders stay in the queue" })}
          />

          <ConfirmationDialog
            open={confirmAdmit}
            onOpenChange={setConfirmAdmit}
            title="Admit Akosua Mensah?"
            description={
              <>
                She joins Cohort Three (Jul - Aug) and a hostel place will be held -{" "}
                <strong>5 of 12 remain</strong>. She&rsquo;ll be notified on WhatsApp.
              </>
            }
            confirmText="Admit student"
            cancelText="Not yet"
            onConfirm={() =>
              notify.success("Akosua Mensah admitted", { tone: "admin", description: "Hostel place held · 5 of 12 remain" })
            }
          >
            <label className="flex items-center gap-2.5 text-[14px] text-ink/75">
              <input
                type="checkbox"
                checked={holdBed}
                onChange={(e) => setHoldBed(e.target.checked)}
                className="h-5 w-5 accent-[color:var(--color-accent)]"
              />
              Hold a hostel place
            </label>
          </ConfirmationDialog>

          <Modal open={orderModal} onClose={() => setOrderModal(false)} centered>
            <span className="mx-auto mb-4 grid h-[58px] w-[58px] place-items-center rounded-full bg-accent text-[24px] text-card" aria-hidden="true">
              <Check className="h-[24px] w-[24px]" />
            </span>
            <h3 className="mb-2 font-serif text-[22px] font-normal">Your order is in the queue</h3>
            <p className="mb-[22px] text-[14.5px] leading-[1.6] text-ink/65">
              Scheduled for <strong>Friday, 10 July</strong>. We&rsquo;ll confirm on
              WhatsApp before we bake - pay online or send it directly within 24 hours.
            </p>
            <div className="grid gap-2.5">
              <Button variant="dark" onClick={() => setOrderModal(false)}>
                Keep browsing
              </Button>
              <button
                type="button"
                onClick={() => setOrderModal(false)}
                className="cursor-pointer text-[13.5px] font-semibold text-ink/65 underline"
              >
                View my order
              </button>
            </div>
          </Modal>
        </Section>

        {/* 4 · Toasts */}
        <Section n="04" title="Toasts" note="Bottom-right · slide up · auto-dismiss 5s with progress">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => notify.success("Added to your order", { description: "Butter Croissant ×2 · review anytime" })}>
              Site · success
            </Button>
            <Button variant="outline" onClick={() => notify.error("Couldn't place the order", { description: "Check your connection and try again" })}>
              Site · error
            </Button>
            <Button variant="outline" onClick={() => notify.success("Akosua Mensah admitted", { tone: "admin", description: "Hostel place held · 5 of 12 remain" })}>
              Admin · success
            </Button>
            <Button variant="outline" onClick={() => notify.info("New order #1042", { tone: "admin", description: "Celebration Cake · needed 15 Jul" })}>
              Admin · info
            </Button>
          </div>
        </Section>

        {/* 5 · Errors, validation & button states */}
        <Section n="05" title="Errors, validation & button states">
          <div className={grid}>
            <div>
              <ErrorState
                title="Couldn't load the bakes"
                description="Something went wrong on our side. Your cart is safe."
                onRetry={() => notify.info("Retrying…")}
              />
              <div className="mt-2"><Caption>Fetch failed · retry</Caption></div>
            </div>

            <div className="grid content-start gap-3.5">
              <OfflineBanner forceVisible />
              <div className="grid gap-4 rounded-[16px] border border-ink/10 bg-card p-5">
                <TextField label="Phone - error" defaultValue="024 11" error="Enter a full 10-digit number, e.g. 024 111 2233." />
                <TextField label="Phone - valid" defaultValue="024 111 2233" valid readOnly />
              </div>
              <Caption>Offline banner · inline validation</Caption>
            </div>

            <div className="grid content-start gap-3.5 rounded-[20px] border border-ink/10 bg-card p-[clamp(24px,3.5vw,32px)]">
              <Button className="w-full">Place custom order →</Button>
              <Button className="w-full" isLoading loadingText="Placing order…">
                Place custom order →
              </Button>
              <Button className="w-full" disabled>
                Place custom order →
              </Button>
              <Button className="w-full" variant="success">
                Order placed
                <Check className="h-[14px] w-[14px]" aria-hidden="true" />
              </Button>
              <Caption>Default · loading · disabled · success</Caption>
            </div>
          </div>
        </Section>

        {/* 6 · System pages */}
        <Section n="06" title="System pages">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-5">
            <div>
              <SystemMessage
                code="404"
                title="This shelf is empty."
                description="The page you're after was either eaten or never baked. The good stuff is back at the counter."
                actions={[{ label: "← Back to home", href: routes.home, variant: "dark" }]}
              />
              <div className="mt-2"><Caption>404 · not found</Caption></div>
            </div>
            <div>
              <SystemMessage
                tone="dark"
                glyph={<Sparkle className="h-[24px] w-[24px]" />}
                title="Resting the ovens."
                description="We're doing a little kitchen maintenance. Orders reopen shortly - WhatsApp us if it's urgent."
                actions={[{ label: "Message us on WhatsApp", variant: "primary" }]}
              />
              <div className="mt-2"><Caption>Maintenance mode</Caption></div>
            </div>
            <div>
              <SystemMessage
                glyph={<X className="h-[24px] w-[24px]" />}
                title="Admins only past this door."
                description="Your account doesn't have access to the console. Sign in with an admin account or head back to the shop."
                actions={[
                  { label: "Sign in", variant: "primary" },
                  { label: "Back to site", href: routes.home, variant: "outline" },
                ]}
              />
              <div className="mt-2"><Caption>403 · access denied</Caption></div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
