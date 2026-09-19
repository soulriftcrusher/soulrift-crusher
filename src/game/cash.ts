export const FIRST_PACK_GEMS = 800;
export const FIRST_PACK_USD = "$0.99";
export const WHEEL_SPIN_GEMS = 15;
export const WHEEL_JACKPOT_CHANCE = 0.02;
export const WHEEL_CHANCE_STEP = 0.005;
export const WHEEL_CHANCE_CAP = 0.2;
export const WHEEL_DAY_MS = 24 * 60 * 60 * 1000;
export const WHEEL_POT_START = 20;
export const SHIELD_GEMS = 25;
export const SHIELD_MS = 8 * 60 * 60 * 1000;
export const HYMN_SHIELD_MS = 2 * 60 * 60 * 1000;
export const PLAY_SHIELD_MS = 8 * 60 * 60 * 1000;
export const RAID_CD_MS = 4 * 60 * 60 * 1000;
export const HYMN_SKIP_GEMS = 15;

export type WheelSlice = {
  id: string;
  name: string;
  gems?: number;
  gold?: number;
  souls?: number;
  chests?: number;
  jackpot?: boolean;
  weight: number;
};

export const WHEEL_SLICES: WheelSlice[] = [
  { id: "gold", name: "Gold pinch", gold: 80, weight: 28 },
  { id: "g1", name: "1 gem", gems: 1, weight: 8 },
  { id: "soul", name: "A soul", souls: 1, weight: 18 },
  { id: "chest", name: "A chest", chests: 1, weight: 14 },
  { id: "dust", name: "Dust", gold: 40, weight: 16 },
  { id: "g6", name: "2 gems", gems: 2, weight: 3 },
  { id: "souls", name: "2 souls", souls: 2, weight: 3 },
  { id: "jack", name: "A spark", jackpot: true, weight: 2 },
];

function rng(): number {
  try {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0]! / 4294967296;
  } catch {
    return Math.random();
  }
}

export function clampChance(n: number | undefined): number {
  if (!Number.isFinite(n)) return WHEEL_JACKPOT_CHANCE;
  return Math.min(WHEEL_CHANCE_CAP, Math.max(WHEEL_JACKPOT_CHANCE, Number(n)));
}

export function rollWheel(chance: number): WheelSlice {
  const jack = WHEEL_SLICES.find((s) => s.jackpot)!;
  if (rng() < clampChance(chance)) return jack;
  const pool = WHEEL_SLICES.filter((s) => !s.jackpot);
  const total = pool.reduce((n, s) => n + s.weight, 0);
  let n = rng() * total;
  for (const s of pool) {
    n -= s.weight;
    if (n <= 0) return s;
  }
  return pool[pool.length - 1]!;
}

export type LookId = "ash" | "gilt" | "rift" | "tyrant" | "blood";

export type LookDef = {
  id: LookId;
  name: string;
  gems: number;
  pack?: boolean;
};

export const FRAMES: LookDef[] = [
  { id: "ash", name: "Ash frame", gems: 0 },
  { id: "gilt", name: "Gilded frame", gems: 80, pack: true },
  { id: "rift", name: "Rift frame", gems: 120 },
  { id: "tyrant", name: "Tyrant frame", gems: 200 },
  { id: "blood", name: "First Blood frame", gems: 0, pack: true },
];

export const NAME_HUES: LookDef[] = [
  { id: "ash", name: "Ash name", gems: 0 },
  { id: "gilt", name: "Gold name", gems: 40, pack: true },
  { id: "rift", name: "Soul name", gems: 60 },
  { id: "tyrant", name: "Cinder name", gems: 90 },
  { id: "blood", name: "Blood name", gems: 0, pack: true },
];

export const SPLASHES: LookDef[] = [
  { id: "ash", name: "Ash slash", gems: 0 },
  { id: "gilt", name: "Gold slash", gems: 40, pack: true },
  { id: "rift", name: "Soul burst", gems: 60 },
  { id: "tyrant", name: "Tyrant burst", gems: 90 },
  { id: "blood", name: "Blood splash", gems: 0, pack: true },
];

export const SPLASH_COLOR: Record<LookId, string> = {
  ash: "#e8a090",
  gilt: "#d4b483",
  rift: "#8f9bb3",
  tyrant: "#c45c4a",
  blood: "#c45c4a",
};

export const NAME_CLASS: Record<LookId, string> = {
  ash: "text-fg",
  gilt: "text-gold",
  rift: "text-soul",
  tyrant: "text-accent",
  blood: "text-accent",
};

export const FRAME_CLASS: Record<LookId, string> = {
  ash: "border-border",
  gilt: "border-gold",
  rift: "border-soul",
  tyrant: "border-accent",
  blood: "border-accent ring-1 ring-accent/40",
};

export function ownedLooks(owned: string[] | undefined, firstBuy: boolean, founder: boolean): Set<string> {
  const set = new Set(owned ?? ["ash"]);
  set.add("ash");
  if (firstBuy || founder) {
    set.add("gilt");
    set.add("blood");
  }
  if (founder) {
    for (const id of ["rift", "tyrant"] as LookId[]) set.add(id);
  }
  return set;
}

export const NPC_MARKS = [
  { id: "npc-hymn", name: "Iron Hymn scout", power: 18000 },
  { id: "npc-choir", name: "Void Choir stray", power: 24000 },
  { id: "npc-host", name: "Cinder Host blade", power: 32000 },
  { id: "npc-greed", name: "Greedy King pawn", power: 14000 },
  { id: "npc-sleep", name: "Sleeper warden", power: 9000 },
  { id: "npc-cut", name: "The Cut wanderer", power: 11000 },
];
