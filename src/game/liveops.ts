import { HEROES, type HeroId } from "./data";
import type { PrizeKind } from "./prize-art";

export const VIP_THRESH = [0, 80, 250, 700, 1800, 4000, 9000, 20000, 45000];

export function vipRank(spent: number): number {
  let r = 0;
  for (let i = 0; i < VIP_THRESH.length; i++) if (spent >= VIP_THRESH[i]!) r = i;
  return r;
}

export function vipNext(spent: number): number {
  const r = vipRank(spent);
  return VIP_THRESH[r + 1] ?? VIP_THRESH[VIP_THRESH.length - 1]!;
}

export const CHAPTERS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150, 200];

export function nextChapter(claimed: number, maxFloor: number): number | null {
  return CHAPTERS.find((n) => n > claimed && maxFloor >= n) ?? null;
}

export type MarketDeal = {
  id: string;
  name: string;
  blurb: string;
  gold?: number;
  gems?: number;
  giveGold?: number;
  giveGems?: number;
  giveChests?: number;
  giveEmber?: number;
  giveSouls?: number;
};

const MARKET_POOL: MarketDeal[] = [
  { id: "scrap", name: "Scrap crate", blurb: "Cheap gold for a chest.", gold: 400, giveChests: 1 },
  { id: "ember-cup", name: "Ember cup", blurb: "10 gems → 12 ember.", gems: 10, giveEmber: 12 },
  { id: "soul-sip", name: "Soul sip", blurb: "A swallow of names.", gold: 800, giveSouls: 3 },
  { id: "soul-crumb", name: "Soul crumb", blurb: "A fortune in gold for a handful of souls.", gold: 80000, giveSouls: 4 },
  { id: "war-bag", name: "War bag", blurb: "Two chests, no questions.", gems: 25, giveChests: 2 },
  { id: "bone-pot", name: "Bone pot", blurb: "Ember for the bench.", gold: 1200, giveEmber: 18 },
  { id: "rift-pinch", name: "Rift pinch", blurb: "Souls on the cheap.", gems: 18, giveSouls: 6 },
];

export function marketForDay(day: string): MarketDeal[] {
  let n = 0;
  for (let i = 0; i < day.length; i++) n += day.charCodeAt(i) * (i + 3);
  const out: MarketDeal[] = [];
  const used = new Set<string>();
  for (let k = 0; k < 3; k++) {
    const hit = MARKET_POOL[(n + k * 5) % MARKET_POOL.length]!;
    if (used.has(hit.id)) continue;
    used.add(hit.id);
    out.push(hit);
  }
  while (out.length < 3) {
    const hit = MARKET_POOL[out.length]!;
    if (!used.has(hit.id)) out.push(hit);
    else break;
  }
  return out;
}

export function marketPrize(id: string): PrizeKind {
  const d = MARKET_POOL.find((x) => x.id === id);
  if (d?.giveChests) return "chest";
  if (d?.giveEmber) return "ember";
  if (d?.giveSouls) return "souls";
  if (d?.giveGems) return "gems";
  return "gold";
}

export const TITLES: { id: string; name: string; badge?: string }[] = [
  { id: "", name: "Crusader" },
  { id: "blood", name: "First Blood", badge: "blood" },
  { id: "sweeper", name: "Crypt Sweeper", badge: "sweeper" },
  { id: "tide", name: "Bone Tide", badge: "tide" },
  { id: "depth", name: "Ten Deep", badge: "depth" },
  { id: "vault", name: "Vault Walker", badge: "vault" },
  { id: "warband", name: "Warband", badge: "warband" },
  { id: "pit", name: "Pit Winner", badge: "pit" },
  { id: "tyrant", name: "Tyrant Eater", badge: "tyrant" },
  { id: "forge", name: "Forge Lord", badge: "forge" },
  { id: "week", name: "Rift Veteran", badge: "week" },
  { id: "patron", name: "First Coin", badge: "patron" },
];

export function collectionBonus(levels: Record<HeroId, number>): number {
  const n = HEROES.filter((h) => (levels[h.id] ?? 0) > 0).length;
  return 1 + n * 0.012;
}

export const EXPEDITION_MS = 2 * 60 * 60 * 1000;
export const PITY_AT = 10;

export const SUPPORT_EMAIL = "soulriftcrusher@gmail.com";
export const SUPPORT_MAIL = `mailto:${SUPPORT_EMAIL}`;

export function monthKey(now = Date.now()): string {
  const d = new Date(now);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthDay(now = Date.now()): number {
  return new Date(now).getUTCDate();
}

export function monthReward(day: number): { gems: number; chests: number } {
  const gems = day === 30 ? 2 : day % 7 === 0 ? 1 : 0;
  const chests = day % 10 === 0 ? 1 : 0;
  return { gems, chests };
}

export const WEEKLY_LOGIN = [1, 1, 1, 1, 1, 1, 2];

export const BP_STEP = 80;
export const BP_MAX = 25;
export const BP_PREMIUM = 400;

export function bpRank(pts: number): number {
  return Math.min(BP_MAX, Math.floor(Math.max(0, pts) / BP_STEP));
}

export function bpFreeLoot(rank: number): { gold: number; chests: number } {
  return { gold: 12 * rank, chests: rank % 5 === 0 ? 1 : 0 };
}

export function bpPremLoot(rank: number): { gems: number; souls: number } {
  return { gems: rank % 8 === 0 ? 1 : 0, souls: rank % 4 === 0 ? 1 : 0 };
}

export const WHEEL: { name: string; gems?: number; gold?: number; souls?: number; chests?: number }[] = [
  { name: "3 gems", gems: 3 },
  { name: "Gold pinch", gold: 80 },
  { name: "1 gem", gems: 1 },
  { name: "A chest", chests: 1 },
  { name: "6 gems", gems: 6 },
  { name: "A soul", souls: 1 },
  { name: "2 gems", gems: 2 },
  { name: "Dust", gold: 40 },
];

export const CARD_GEMS = 40;
export const CARD_MS = 30 * 24 * 60 * 60 * 1000;
export const WATCH_GEMS = 1;

