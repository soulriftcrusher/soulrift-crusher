import type { ClanRole } from "./net";

export const CLAN_CAP = 30;

export const CRESTS = ["axe", "wolf", "rift", "skull", "flame", "moon"] as const;
export const FOUNDER_CREST = "crown" as const;
export type CrestId = (typeof CRESTS)[number] | typeof FOUNDER_CREST;

export function isCrestId(id: string | undefined): id is CrestId {
  return id === FOUNDER_CREST || (CRESTS as readonly string[]).includes(id ?? "");
}

export function crestsFor(staff: boolean): CrestId[] {
  return staff ? [...CRESTS, FOUNDER_CREST] : [...CRESTS];
}

export const LOCS = ["USA", "UK", "EU", "KR", "JP", "AU", "CA", "BR", "WW"] as const;
export type LocId = (typeof LOCS)[number];

export const LOC_NAME: Record<LocId, string> = {
  USA: "USA",
  UK: "UK",
  EU: "EU",
  KR: "Korea",
  JP: "Japan",
  AU: "Australia",
  CA: "Canada",
  BR: "Brazil",
  WW: "World",
};

export function roleName(role: ClanRole | string): string {
  if (role === "founder") return "Leader";
  if (role === "officer") return "Co-Leader";
  if (role === "elder") return "Elder";
  return "Member";
}

export function clanBonuses(influence: number, science: number, members: number) {
  const dps = Math.min(8000, Math.floor(members * 80 + influence / 400));
  const gold = Math.min(400, Math.floor(members * 4 + science / 800));
  const souls = Math.min(400, Math.floor(members * 3 + science / 1200));
  return { dps, gold, souls };
}

export function lastOnline(at: string | number | null | undefined): string {
  if (!at) return "offline";
  const t = typeof at === "number" ? at : Date.parse(String(at));
  if (!Number.isFinite(t)) return "offline";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 120) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 7200) return "an hour ago";
  if (s < 86400) return "a few hours ago";
  if (s < 172800) return "yesterday";
  return `${Math.floor(s / 86400)} days ago`;
}

export function createdLabel(at: string | null | undefined): string {
  if (!at) return "—";
  const d = new Date(at);
  if (!Number.isFinite(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}
