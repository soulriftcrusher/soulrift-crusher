import { adsBannerOn } from "@/game/ads";

/** Empty until a banner ID is set. Sits above the tab bar without shifting layout when off. */
export function AdBanner() {
  if (!adsBannerOn()) return null;
  return (
    <div
      className="grid h-14 shrink-0 place-items-center border-t border-gold/20 bg-surface text-[10px] text-muted"
      data-ad-slot="banner"
    >
      Ad
    </div>
  );
}
