/** Ads stay off until you drop in a network ID. No fake ads, no free gems. */
export const ADS = {
  enabled: false,
  network: "none" as "none" | "admob" | "adsense",
  bannerId: "",
  rewardedId: "",
};

export function adsReady(): boolean {
  return ADS.enabled && Boolean(ADS.bannerId || ADS.rewardedId);
}

export function adsBannerOn(): boolean {
  return adsReady() && Boolean(ADS.bannerId);
}

export function adsRewardedOn(): boolean {
  return adsReady() && Boolean(ADS.rewardedId);
}

/** Returns true only after a real rewarded ad finishes. Stub until IDs are set. */
export async function showRewardedAd(): Promise<boolean> {
  if (!adsRewardedOn()) return false;
  return false;
}
