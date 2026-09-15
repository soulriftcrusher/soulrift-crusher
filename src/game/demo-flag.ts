export const DEMO_FLAG = "soulrift.demo.on";
export const DEMO_SAVE = "soulrift.save.demo";
export const DEMO_HOLD = "soulrift.demo.hold";

export function isDemoHunt(): boolean {
  try {
    return sessionStorage.getItem(DEMO_FLAG) === "1";
  } catch {
    return false;
  }
}
