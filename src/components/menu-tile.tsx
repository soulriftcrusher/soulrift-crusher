import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MenuTile({
  icon: Icon,
  label,
  blurb,
  ping,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  blurb: string;
  ping?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex min-h-[7.25rem] flex-col items-start rounded-xl border border-gold/35 bg-wood p-3 text-left hover:border-gold",
        ping ? "border-accent" : "",
      )}
    >
      {ping ? <span className="absolute top-2 right-2 size-2.5 rounded-full bg-accent" /> : null}
      <span className="grid size-12 place-items-center rounded-xl bg-surface text-gold">
        <Icon className="size-7" strokeWidth={1.75} />
      </span>
      <span className="font-display mt-2 text-[15px] leading-tight text-gold">{label}</span>
      <span className="mt-0.5 text-[11px] leading-snug text-fg/75">{blurb}</span>
    </button>
  );
}

export function MenuGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 pb-4">{children}</div>;
}
