import { cn } from "@/lib/utils";
import type { LocId } from "@/game/clan-look";

const BOX = "h-4 w-6 shrink-0 overflow-hidden rounded-[2px] border border-gold/30";

export function LocFlag({ loc, className }: { loc?: string; className?: string }) {
  const id = (["USA", "UK", "EU", "KR", "JP", "AU", "CA", "BR", "WW"] as LocId[]).includes(loc as LocId)
    ? (loc as LocId)
    : "WW";
  return (
    <svg viewBox="0 0 24 16" className={cn(BOX, className)} aria-hidden>
      {id === "USA" ? (
        <>
          <rect width="24" height="16" fill="#bf0a30" />
          <rect y="2" width="24" height="2" fill="#fff" />
          <rect y="6" width="24" height="2" fill="#fff" />
          <rect y="10" width="24" height="2" fill="#fff" />
          <rect y="14" width="24" height="2" fill="#fff" />
          <rect width="10" height="9" fill="#002868" />
        </>
      ) : null}
      {id === "UK" ? (
        <>
          <rect width="24" height="16" fill="#012169" />
          <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="3.2" />
          <path d="M0 0 L24 16 M24 0 L0 16" stroke="#c8102e" strokeWidth="1.4" />
          <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="5" />
          <path d="M12 0 V16 M0 8 H24" stroke="#c8102e" strokeWidth="2.4" />
        </>
      ) : null}
      {id === "EU" ? (
        <>
          <rect width="24" height="16" fill="#003399" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            return <circle key={i} cx={12 + Math.cos(a) * 4.4} cy={8 + Math.sin(a) * 4.4} r="0.7" fill="#ffcc00" />;
          })}
        </>
      ) : null}
      {id === "KR" ? (
        <>
          <rect width="24" height="16" fill="#fff" />
          <circle cx="12" cy="8" r="3.4" fill="#cd2e3a" />
          <path d="M8.6 8 A3.4 3.4 0 0 0 15.4 8 A3.4 3.4 0 0 1 8.6 8" fill="#0047a0" />
        </>
      ) : null}
      {id === "JP" ? (
        <>
          <rect width="24" height="16" fill="#fff" />
          <circle cx="12" cy="8" r="4.2" fill="#bc002d" />
        </>
      ) : null}
      {id === "AU" ? (
        <>
          <rect width="24" height="16" fill="#012169" />
          <rect width="11" height="8" fill="#012169" />
          <path d="M0 0 L11 8 M11 0 L0 8" stroke="#fff" strokeWidth="1.4" />
          <path d="M5.5 0 V8 M0 4 H11" stroke="#fff" strokeWidth="2.2" />
          <path d="M5.5 0 V8 M0 4 H11" stroke="#c8102e" strokeWidth="1.1" />
          <circle cx="17.5" cy="10" r="1.1" fill="#fff" />
          <circle cx="20.5" cy="6.5" r="0.7" fill="#fff" />
          <circle cx="14.5" cy="6" r="0.6" fill="#fff" />
        </>
      ) : null}
      {id === "CA" ? (
        <>
          <rect width="24" height="16" fill="#ff0000" />
          <rect x="6" width="12" height="16" fill="#fff" />
          <path d="M12 3 L13.2 7 H17 L14 9.2 L15.2 13 L12 10.8 L8.8 13 L10 9.2 L7 7 H10.8 Z" fill="#ff0000" />
        </>
      ) : null}
      {id === "BR" ? (
        <>
          <rect width="24" height="16" fill="#009c3b" />
          <path d="M12 2 L22 8 L12 14 L2 8 Z" fill="#ffdf00" />
          <circle cx="12" cy="8" r="3" fill="#002776" />
        </>
      ) : null}
      {id === "WW" ? (
        <>
          <rect width="24" height="16" fill="#0b3d4a" />
          <circle cx="12" cy="8" r="5.4" fill="#1d8a7a" />
          <ellipse cx="12" cy="8" rx="2.2" ry="5.4" fill="none" stroke="#d4f5ee" strokeWidth="0.7" />
          <path d="M6.6 8 H17.4 M8 5.2 H16 M8 10.8 H16" stroke="#d4f5ee" strokeWidth="0.7" fill="none" />
        </>
      ) : null}
    </svg>
  );
}
