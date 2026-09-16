const KEY = "soulrift-device";

/** Stable id for this browser/app. Used so only one live hunt runs at a time. */
export function getDeviceId(): string {
  try {
    const have = localStorage.getItem(KEY);
    if (have && have.length >= 12) return have;
    const id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    return `tmp-${Math.random().toString(36).slice(2, 12)}`;
  }
}
