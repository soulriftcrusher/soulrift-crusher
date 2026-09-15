export const NAME_KEY = "soulrift-username";

export function cleanHuntName(raw: unknown): string {
  const s = String(raw ?? "")
    .replace(/[^\w \-']/g, "")
    .trim()
    .slice(0, 16);
  return s;
}

export function readHuntName(fallback = "Crusader"): string {
  try {
    const s = cleanHuntName(localStorage.getItem(NAME_KEY) ?? "");
    if (s) return s;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function writeHuntName(name: string): void {
  const s = cleanHuntName(name);
  if (!s) return;
  try {
    localStorage.setItem(NAME_KEY, s);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem(NAME_KEY, s);
  } catch {
    /* ignore */
  }
}
