import type { ReactNode } from "react";
import type { LegalPageId } from "@/game/store";

export function LegalPage({
  kicker,
  title,
  children,
  onBack,
  onGo,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
  onBack?: () => void;
  onGo?: (id: NonNullable<LegalPageId>) => void;
}) {
  function Nav({ id, href, label }: { id: NonNullable<LegalPageId> | "hunt"; href: string; label: string }) {
    if (onBack) {
      return (
        <button
          type="button"
          className="grid h-11 min-w-[6.5rem] place-items-center rounded-md border border-gold/40 px-3"
          onClick={() => (id === "hunt" ? onBack() : onGo?.(id))}
        >
          {label}
        </button>
      );
    }
    return (
      <a href={href} className="grid h-11 min-w-[6.5rem] place-items-center rounded-md border border-gold/40 px-3">
        {label}
      </a>
    );
  }
  return (
    <main className="h-dvh overflow-y-auto bg-bg text-fg">
      <div className="relative mx-auto max-w-lg px-5 pb-16 pt-10">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="font-display min-h-11 text-xs tracking-[0.22em] text-gold uppercase"
          >
            ← Back to the hunt
          </button>
        ) : (
          <a href="/" className="font-display text-xs tracking-[0.22em] text-gold uppercase">
            ← Back to the hunt
          </a>
        )}
        <p className="font-display mt-8 text-xs tracking-[0.28em] text-muted uppercase">{kicker}</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-gold">{title}</h1>
        <div className="mt-6 space-y-5 text-sm leading-relaxed text-fg/90">{children}</div>
        <nav className="mt-10 flex flex-wrap gap-x-4 gap-y-3 text-sm text-gold">
          <Nav id="guide" href="/guide" label="How to hunt" />
          <Nav id="privacy" href="/privacy" label="Privacy" />
          <Nav id="copyright" href="/copyright" label="Copyright" />
          <Nav id="support" href="/support" label="Support" />
          <Nav id="hunt" href="/" label="Hunt" />
        </nav>
        <p className="mt-6 text-xs text-muted">
          © 2026 Soulrift Crusher. All rights reserved.{" "}
          <a href="mailto:soulriftcrusher@gmail.com" className="text-gold">
            soulriftcrusher@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
