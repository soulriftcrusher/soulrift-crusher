import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MenuTile({
  icon: Icon,
  art,
  label,
  blurb,
  ping,
  compact,
  onClick,
}: {
  icon?: LucideIcon;
  art?: string;
  label: string;
  blurb: string;
  ping?: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col rounded-xl border hover:border-gold",
        compact
          ? "min-h-[5.6rem] items-center justify-center gap-1.5 border-2 border-gold/45 bg-[#1a100c]/88 p-2 text-center shadow-[0_4px_0_#3a1c10]"
          : "min-h-[7.25rem] items-start border-gold/35 bg-wood p-3 text-left",
        ping ? "border-accent shadow-[0_0_12px_rgba(196,92,74,0.45)]" : "",
      )}
    >
      {ping ? <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-accent" /> : null}
      {art ? (
        compact ? (
          <span className={cn("grid size-12 place-items-center overflow-hidden rounded-full border-2 bg-[#0c0908] shadow-[inset_0_2px_8px_rgba(0,0,0,0.75)]", ping ? "border-accent" : "border-gold/70")}>
            <img src={art} alt="" className="size-10 object-contain drop-shadow" crossOrigin="anonymous" />
          </span>
        ) : (
          <img src={art} alt="" className="size-14 object-contain drop-shadow" crossOrigin="anonymous" />
        )
      ) : Icon ? (
        <span className={cn("grid place-items-center rounded-xl bg-surface text-gold", compact ? "size-9" : "size-12")}>
          <Icon className={compact ? "size-5" : "size-7"} strokeWidth={1.75} />
        </span>
      ) : null}
      <span className={cn("font-display leading-tight text-gold", compact ? "text-[11px] tracking-wide uppercase" : "mt-2 text-[15px]")}>
        {label}
      </span>
      {compact ? null : <span className="mt-0.5 text-[11px] leading-snug text-fg/75">{blurb}</span>}
    </button>
  );
}

export function MenuGrid({ children, compact }: { children: ReactNode; compact?: boolean }) {
  return (
    <div
      className={cn(
        "grid",
        compact
          ? "grid-cols-3 gap-1.5 rounded-xl border-2 border-gold/40 bg-[#120c0a]/75 p-2 shadow-[0_6px_0_#3a1c10]"
          : "grid-cols-2 gap-2 pb-2",
      )}
    >
      {children}
    </div>
  );
}
