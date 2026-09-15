import type { HeroId } from "./data";
import type { RealmId } from "./meta";

export type RuneStat =
  | "dps"
  | "gold"
  | "crit"
  | "click"
  | "soul"
  | "siege"
  | "boss"
  | "haste"
  | "idle"
  | "luck";
export type RuneRarity = 1 | 2 | 3 | 4;
export type EventId = "gold" | "tyrant" | "siege";

export type OwnedRune = {
  id: string;
  name: string;
  stat: RuneStat;
  value: number;
  rarity: RuneRarity;
};

export type EventDef = {
  id: EventId;
  name: string;
  blurb: string;
};

export type LegendDef = {
  name: string;
  blurb: string;
  unlock: number;
};

export type HeroCraftDef = {
  name: string;
  blurb: string;
};

export const EVENTS: EventDef[] = [
  { id: "gold", name: "Gold Fever", blurb: "Gold finds +50%. Event points on every kill." },
  { id: "tyrant", name: "Tyrant Night", blurb: "Bosses drop runes more often. Points per tyrant." },
  { id: "siege", name: "Siege Rally", blurb: "Siege points doubled while you hold a lair." },
];

export const RUNE_NAMES: Record<RuneStat, string[]> = {
  dps: ["War Mark", "Blood Rune", "Ash Brand"],
  gold: ["Gilt Rune", "Coin Brand", "Hoard Mark"],
  crit: ["Fang Rune", "Lucky Cut", "Eye Brand"],
  click: ["Tap Brand", "Gauntlet Rune", "Strike Mark"],
  soul: ["Hymn Rune", "Grave Brand", "Well Mark"],
  siege: ["Banner Rune", "Lair Brand", "Camp Mark"],
  boss: ["Tyrant Seal", "King Breaker", "Oath Brand"],
  haste: ["Second Bell", "Swift Hymn", "Tempo Mark"],
  idle: ["Coffer Rune", "Sleep Tithe", "Idle Brand"],
  luck: ["Chest Eye", "Plume Luck", "Fortune Mark"],
};

export const RUNE_JOB: Record<RuneStat, string> = {
  dps: "Party damage",
  gold: "Gold from kills",
  crit: "Critical chance",
  click: "Tap damage",
  soul: "Souls",
  siege: "Siege points",
  boss: "Boss damage",
  haste: "Skills ready faster",
  idle: "Idle gold while you're away",
  luck: "Chest drops",
};

export const RUNE_STATS: RuneStat[] = [
  "dps",
  "gold",
  "crit",
  "click",
  "soul",
  "siege",
  "boss",
  "haste",
  "idle",
  "luck",
];

export function stackRunes(runes: OwnedRune[]): { sample: OwnedRune; count: number; ids: string[] }[] {
  const map = new Map<string, { sample: OwnedRune; count: number; ids: string[] }>();
  for (const r of runes) {
    const key = `${r.stat}|${r.rarity}|${r.name}`;
    const row = map.get(key);
    if (row) {
      row.count += 1;
      row.ids.push(r.id);
      if (r.value > row.sample.value) row.sample = r;
    } else {
      map.set(key, { sample: r, count: 1, ids: [r.id] });
    }
  }
  return [...map.values()].sort((a, b) => b.sample.rarity - a.sample.rarity || a.sample.name.localeCompare(b.sample.name));
}

export function describeRune(r: Pick<OwnedRune, "stat" | "value">): string {
  const pct = Math.max(1, Math.round((r.value || 0) * 100));
  const job = RUNE_JOB[r.stat] ?? "Power";
  return `${job} +${pct}%`;
}

export const RARITY_NAME = ["", "Common", "Rare", "Epic", "Legend"] as const;
export const RARITY_VALUE: Record<RuneRarity, number> = { 1: 0.04, 2: 0.08, 3: 0.14, 4: 0.22 };

export const LEGENDS: Record<HeroId, LegendDef> = {
  kael: { name: "First Cut", blurb: "Click damage +28%.", unlock: 25 },
  rook: { name: "Unbroken Line", blurb: "Party damage +14%.", unlock: 25 },
  lyra: { name: "Moonseeker", blurb: "Critical chance +10%.", unlock: 25 },
  vex: { name: "Molten Tithe", blurb: "Gold finds +22%.", unlock: 25 },
  thane: { name: "Oathbreaker", blurb: "Boss damage +32%.", unlock: 25 },
  sable: { name: "Night Vein", blurb: "Critical damage +30%.", unlock: 25 },
  morr: { name: "Last Hymn", blurb: "Souls +18%.", unlock: 25 },
  iskra: { name: "Thunderhead", blurb: "Click damage +20%.", unlock: 25 },
  brann: { name: "Cinder Purse", blurb: "Gold finds +16%.", unlock: 25 },
  devourer: { name: "Harvest Maw", blurb: "Party damage +16%. Soul steal more often.", unlock: 25 },
  nyx: { name: "Between Seconds", blurb: "Skill haste +14%.", unlock: 25 },
  kira: { name: "Glass Edge", blurb: "Click +8% and crit +6%.", unlock: 25 },
  orin: { name: "King's Due", blurb: "Gold finds +20%.", unlock: 25 },
  vorr: { name: "Unmade Name", blurb: "Party damage +40%.", unlock: 25 },
  selene: { name: "Moon Invoice", blurb: "Gold and souls +35%.", unlock: 25 },
  ashur: { name: "Final Price", blurb: "Gold finds +50%.", unlock: 25 },
  dax: { name: "Vault Split", blurb: "Boss damage +20%.", unlock: 25 },
  wren: { name: "Well Stitch", blurb: "Party damage +12%.", unlock: 25 },
  jora: { name: "Rime Nock", blurb: "Critical chance +8%.", unlock: 25 },
  pike: { name: "Named Point", blurb: "Click damage +16%.", unlock: 25 },
};

export const HERO_CRAFTS: Record<HeroId, HeroCraftDef> = {
  kael: { name: "Soulforged Blade", blurb: "Kael's damage +10% per rank." },
  rook: { name: "Ashen Wall", blurb: "Rook's damage +10% per rank." },
  lyra: { name: "Moonlimb Bow", blurb: "Lyra's damage +10% per rank." },
  vex: { name: "Cinder Staff", blurb: "Vex's damage +10% per rank." },
  thane: { name: "Vow Hammer", blurb: "Thane's damage +10% per rank." },
  sable: { name: "Nightfangs", blurb: "Sable's damage +10% per rank." },
  morr: { name: "Grave Bell", blurb: "Morr's damage +10% per rank." },
  iskra: { name: "Storm Rod", blurb: "Iskra's damage +10% per rank." },
  brann: { name: "Ember Tongs", blurb: "Brann's damage +10% per rank." },
  devourer: { name: "Rift Jaw", blurb: "Devourer's damage +10% per rank." },
  nyx: { name: "Second Step", blurb: "Nyx's damage +10% per rank." },
  kira: { name: "Glass Knife", blurb: "Kira's damage +10% per rank." },
  orin: { name: "Gilded Scepter", blurb: "Orin's damage +10% per rank." },
  vorr: { name: "Unmade Core", blurb: "Vorr's damage +10% per rank." },
  selene: { name: "Nightwell Chalice", blurb: "Selene's damage +10% per rank." },
  ashur: { name: "Last Coin", blurb: "Ashur's damage +10% per rank." },
  dax: { name: "Ash Cleaver", blurb: "Dax's damage +10% per rank." },
  wren: { name: "Moss Crook", blurb: "Wren's damage +10% per rank." },
  jora: { name: "Rime Limb", blurb: "Jora's damage +10% per rank." },
  pike: { name: "Long Debt", blurb: "Pike's damage +10% per rank." },
};

export const SIEGE_LAIRS: { id: RealmId; name: string; bonus: string }[] = [
  { id: "crypt", name: "Bone Keep", bonus: "+8% gold" },
  { id: "frost", name: "Rime Spire", bonus: "+8% click" },
  { id: "ember", name: "Cinder Hold", bonus: "+8% party damage" },
  { id: "void", name: "Cut Gate", bonus: "+8% souls" },
  { id: "soulwell", name: "Well Crown", bonus: "+10% event points" },
];

export const GEM_TO_EMBER = 10;
export const EMBER_FROM_GEMS = 8;
export const SIEGE_TRAVEL = 12;

export function dayKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function eventForDay(day: string): EventDef {
  let n = 0;
  for (let i = 0; i < day.length; i++) n += day.charCodeAt(i);
  return EVENTS[n % EVENTS.length]!;
}

export function craftCost(rank: number): { ember: number; bone: number } {
  return { ember: 6 + rank * 8, bone: 10 + rank * 10 };
}

export function runeSlots(level: number): number {
  if (level <= 0) return 0;
  if (level >= 75) return 3;
  if (level >= 25) return 2;
  return 1;
}

export function mintRune(seed: number, floor: number, boss: boolean): OwnedRune {
  const stat = RUNE_STATS[Math.abs(seed) % RUNE_STATS.length]!;
  let rarity: RuneRarity = 1;
  const roll = (Math.abs(seed * 17 + floor) % 100) / 100;
  if (boss) {
    if (roll > 0.92) rarity = 4;
    else if (roll > 0.72) rarity = 3;
    else if (roll > 0.4) rarity = 2;
  } else if (roll > 0.97) rarity = 3;
  else if (roll > 0.82) rarity = 2;
  const names = RUNE_NAMES[stat];
  const name = names[Math.min(names.length, rarity) - 1] ?? names[0]!;
  return {
    id: `rn-${seed.toString(36)}-${Date.now().toString(36).slice(-4)}`,
    name,
    stat,
    value: RARITY_VALUE[rarity] * (1 + Math.min(0.4, floor / 200)),
    rarity,
  };
}

export type EventShopItem = {
  id: string;
  name: string;
  cost: number;
  kind: "ember" | "rune" | "chest" | "rift";
};

export const EVENT_SHOP: EventShopItem[] = [
  { id: "ember-pack", name: "8 ember", cost: 40, kind: "ember" },
  { id: "rune-bag", name: "Random rune", cost: 70, kind: "rune" },
  { id: "chest", name: "Event chest", cost: 55, kind: "chest" },
  { id: "rift", name: "6 rift dust", cost: 50, kind: "rift" },
];
