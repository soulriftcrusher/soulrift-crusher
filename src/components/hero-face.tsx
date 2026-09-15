import { HEROES, heroPortrait, type HeroId } from "@/game/data";
import { cn } from "@/lib/utils";

export function isHeroId(id: string | undefined): id is HeroId {
  return Boolean(id && HEROES.some((h) => h.id === id));
}

export function HeroFace({
  id,
  className,
}: {
  id?: string | null;
  className?: string;
}) {
  const hid: HeroId = isHeroId(id ?? "") ? (id as HeroId) : "kael";
  return (
    <img
      src={heroPortrait(hid)}
      alt=""
      className={cn("shrink-0 rounded-full object-cover", className ?? "size-12")}
      crossOrigin="anonymous"
    />
  );
}
