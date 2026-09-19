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
        "relative flex flex-col rounded-xl border border-gold/35 bg-wood hover:border-gold",
        compact ? "min-h-[5.5rem] items-center justify-center gap-1 p-2 text-center" : "min-h-[7.25rem] items-start p-3 text-left",
        ping ? "border-accent" : "",
      )}
    >
      {ping ? <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-accent" /> : null}
      {art ? (
        <img
          src={art}
          alt=""
          className={cn("object-contain drop-shadow", compact ? "size-9" : "size-14")}
          crossOrigin="anonymous"
        />
      ) : Icon ? (
        <span className={cn("grid place-items-center rounded-xl bg-surface text-gold", compact ? "size-9" : "size-12")}>
          <Icon className={compact ? "size-5" : "size-7"} strokeWidth={1.75} />
        </span>
      ) : null}
      <span className={cn("font-display leading-tight text-gold", compact ? "text-[12px]" : "mt-2 text-[15px]")}>
        {label}
      </span>
      {compact ? null : <span className="mt-0.5 text-[11px] leading-snug text-fg/75">{blurb}</span>}
    </button>
  );
}

export function MenuGrid({ children, compact }: { children: ReactNode; compact?: boolean }) {
  return <div className={cn("grid gap-2 pb-2", compact ? "grid-cols-3" : "grid-cols-2")}>{children}</div>;
}
