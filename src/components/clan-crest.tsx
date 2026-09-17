import { cn } from "@/lib/utils";
import { FOUNDER_CREST, isCrestId, type CrestId } from "@/game/clan-look";

export function ClanCrest({ id, className }: { id?: string; className?: string }) {
  const crest: CrestId = isCrestId(id) ? id : "axe";
  return (
    <img
      src={`/tiles/crest-${crest}.png`}
      alt={crest === FOUNDER_CREST ? "Founder crest" : ""}
      className={cn("shrink-0 object-contain", className ?? "h-20 w-16")}
      crossOrigin="anonymous"
    />
  );
}
