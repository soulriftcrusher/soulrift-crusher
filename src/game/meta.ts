export type RealmId = "crypt" | "frost" | "ember" | "void" | "soulwell";
export type WeaponId = "ash-blade" | "moon-string" | "iron-maul" | "cinder-rod" | "rift-fang";
export type SocketId = "ruby" | "sapphire" | "emerald";
export type PackId = "firstblood" | "purse" | "coffer" | "vault" | "hoard" | "god-auric" | "god-solenne" | "god-vael";

export type RealmDef = {
  id: RealmId;
  name: string;
  title: string;
  blurb: string;
  minFloor: number;
  art: string;
  biome: RealmId;
};

export type WeaponDef = {
  id: WeaponId;
  name: string;
  blurb: string;
  goldCost: number;
  gemCost: number;
  costScale: number;
};

export function rankCost(base: number, scale: number, lv: number): number {
  if (base <= 0 || lv < 0) return 0;
  const v = base * Math.pow(Math.max(1.01, scale), lv);
  if (!Number.isFinite(v)) return 1e72;
  return Math.max(1, Math.floor(Math.min(v, 1e72)));
}

export function gemRankCost(base: number, lv: number): number {
  if (base <= 0 || lv < 0) return 0;
  const v = base * Math.pow(1.06, lv);
  if (!Number.isFinite(v)) return 250000;
  return Math.max(1, Math.floor(Math.min(v, 250000)));
}

export type SocketDef = {
  id: SocketId;
  name: string;
  blurb: string;
  gemCost: number;
};

export type PackDef = {
  id: PackId;
  name: string;
  gems: number;
  usd: string;
  tag: string;
};

export const REALMS: RealmDef[] = [
  {
    id: "crypt",
    name: "Ashen Crypt",
    title: "The first dark",
    blurb: "Bone and silence. Every crusade starts in the vaults.",
    minFloor: 1,
    art: "/bg/crypt.jpg",
    biome: "crypt",
  },
  {
    id: "frost",
    name: "Rime Vaults",
    title: "Black ice",
    blurb: "The dead keep their shape in the cold.",
    minFloor: 12,
    art: "/bg/frost.jpg",
    biome: "frost",
  },
  {
    id: "ember",
    name: "Ember Forge",
    title: "Cinder halls",
    blurb: "Gold runs liquid. The walls remember fire.",
    minFloor: 30,
    art: "/bg/ember.jpg",
    biome: "ember",
  },
  {
    id: "void",
    name: "Void Rift",
    title: "The cut",
    blurb: "A wound in the world. Heroes come back thinner.",
    minFloor: 70,
    art: "/bg/void.jpg",
    biome: "void",
  },
  {
    id: "soulwell",
    name: "Soul Well",
    title: "The harvest",
    blurb: "Where names go when the ritual ends.",
    minFloor: 100,
    art: "/bg/soulwell.jpg",
    biome: "soulwell",
  },
];

export const WEAPONS: WeaponDef[] = [
  {
    id: "ash-blade",
    name: "Ash Blade",
    blurb: "Click damage +14% per rank.",
    goldCost: 180,
    gemCost: 0,
    costScale: 1.18,
  },
  {
    id: "moon-string",
    name: "Moon String",
    blurb: "Critical chance +3% per rank.",
    goldCost: 900,
    gemCost: 0,
    costScale: 1.2,
  },
  {
    id: "iron-maul",
    name: "Iron Maul",
    blurb: "Boss damage +12% per rank.",
    goldCost: 4200,
    gemCost: 0,
    costScale: 1.22,
  },
  {
    id: "cinder-rod",
    name: "Cinder Rod",
    blurb: "Gold finds +12% per rank.",
    goldCost: 16000,
    gemCost: 0,
    costScale: 1.22,
  },
  {
    id: "rift-fang",
    name: "Rift Fang",
    blurb: "Party damage +16% per rank. Bought with gems.",
    goldCost: 0,
    gemCost: 180,
    costScale: 1.25,
  },
];

export const SOCKETS: SocketDef[] = [
  { id: "ruby", name: "Blood Ruby", blurb: "+18% party damage while socketed.", gemCost: 120 },
  { id: "sapphire", name: "Gilt Sapphire", blurb: "+18% gold while socketed.", gemCost: 120 },
  { id: "emerald", name: "Rift Emerald", blurb: "+8% critical chance while socketed.", gemCost: 150 },
];

export const GEM_PACKS: PackDef[] = [
  { id: "firstblood", name: "First Blood", gems: 800, usd: "$0.99", tag: "10× · once" },
  { id: "purse", name: "Rift Purse", gems: 80, usd: "$0.99", tag: "" },
  { id: "coffer", name: "Cinder Coffer", gems: 500, usd: "$4.99", tag: "Best" },
  { id: "vault", name: "Void Vault", gems: 1200, usd: "$9.99", tag: "" },
  { id: "hoard", name: "Tyrant Hoard", gems: 2800, usd: "$19.99", tag: "" },
  { id: "god-auric", name: "Auric, God of the Hoard", gems: 0, usd: "$19.99", tag: "God" },
  { id: "god-solenne", name: "Solenne, God of the Well", gems: 0, usd: "$29.99", tag: "God" },
  { id: "god-vael", name: "Vael, God of the Cut", gems: 0, usd: "$49.99", tag: "God" },
];

export const SUMMON_COST = 80;
export const FOUNDER_GEMS = 500;

export function realmByFloor(floor: number): RealmId {
  if (floor >= 100) return "soulwell";
  if (floor >= 70) return "void";
  if (floor >= 30) return "ember";
  if (floor >= 12) return "frost";
  return "crypt";
}

export function realmRange(id: RealmId): { min: number; max: number } {
  const i = REALMS.findIndex((r) => r.id === id);
  const min = REALMS[i]?.minFloor ?? 1;
  const max = REALMS[i + 1] ? REALMS[i + 1]!.minFloor - 1 : 9999;
  return { min, max };
}
