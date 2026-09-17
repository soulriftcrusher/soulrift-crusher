import { cn } from "@/lib/utils";
import type { CrestId } from "@/game/clan-look";

export function ClanCrest({ id, className }: { id?: string; className?: string }) {
  const crest: CrestId = (["axe", "wolf", "rift", "skull", "flame", "moon"] as CrestId[]).includes(id as CrestId)
    ? (id as CrestId)
    : "axe";
  return (
    <img
      src={`/tiles/crest-${crest}.png`}
      alt=""
      className={cn("shrink-0 object-contain", className ?? "h-20 w-16")}
      crossOrigin="anonymous"
    />
  );
}
