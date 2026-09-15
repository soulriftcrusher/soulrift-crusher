import { cn } from "@/lib/utils";
import type { CrestId } from "@/game/clan-look";

const FILL: Record<CrestId, string> = {
  axe: "#6b1d3a",
  wolf: "#2a3a5c",
  rift: "#3a2a4c",
  skull: "#3a2a22",
  flame: "#5c2a14",
  moon: "#1d2a3a",
};

export function ClanCrest({ id, className }: { id?: string; className?: string }) {
  const crest: CrestId = (["axe", "wolf", "rift", "skull", "flame", "moon"] as CrestId[]).includes(id as CrestId)
    ? (id as CrestId)
    : "axe";
  return (
    <svg viewBox="0 0 64 80" className={cn("shrink-0", className ?? "h-20 w-16")} aria-hidden>
      <path
        d="M32 4 L56 14 V42 C56 58 44 72 32 76 C20 72 8 58 8 42 V14 Z"
        fill={FILL[crest]}
        stroke="#d4b483"
        strokeWidth="3"
      />
      {crest === "axe" ? (
        <>
          <path d="M22 28 L42 28 L38 50 L26 50 Z" fill="#c9b48a" />
          <rect x="30" y="22" width="4" height="32" fill="#8a6a3a" />
        </>
      ) : null}
      {crest === "wolf" ? <circle cx="32" cy="40" r="10" fill="#d4b483" /> : null}
      {crest === "rift" ? <path d="M32 22 L40 50 L24 50 Z" fill="#8f9bb3" /> : null}
      {crest === "skull" ? (
        <>
          <circle cx="32" cy="36" r="11" fill="#e8dcc8" />
          <rect x="26" y="44" width="12" height="8" fill="#e8dcc8" />
        </>
      ) : null}
      {crest === "flame" ? <path d="M32 22 C40 34 40 46 32 54 C24 46 24 34 32 22 Z" fill="#c45c4a" /> : null}
      {crest === "moon" ? <circle cx="34" cy="40" r="11" fill="#d4b483" /> : null}
    </svg>
  );
}
