export type HeroId =
  | "kael"
  | "rook"
  | "lyra"
  | "vex"
  | "thane"
  | "sable"
  | "morr"
  | "iskra"
  | "brann"
  | "devourer"
  | "nyx"
  | "kira"
  | "orin"
  | "vorr"
  | "selene"
  | "ashur"
  | "dax"
  | "wren"
  | "jora"
  | "pike"
  | "auric"
  | "solenne"
  | "vael"
  | "morvax";
export type RelicId =
  | "blood-sigil"
  | "gilded-chalice"
  | "soul-lamp"
  | "click-relic"
  | "boss-bane"
  | "world-anchor"
  | "hourglass"
  | "fortune-fang"
  | "silent-bell"
  | "coffer-key";
export type SkillId = "strike" | "goldrush" | "rage" | "harvest";
export type MonsterKind =
  | "rat"
  | "skeleton"
  | "slime"
  | "spider"
  | "bat"
  | "wraith"
  | "brute"
  | "golem"
  | "tyrant"
  | "wyrm"
  | "riftmaw"
  | "ghoul"
  | "beetle"
  | "serpent"
  | "harpy"
  | "lich"
  | "hound"
  | "rimeknight";
export type ScienceId = "war" | "greed" | "hunger" | "tempo" | "fortune" | "depth";
export type ContractKind = "slay" | "depth" | "tyrants" | "hire" | "crits" | "arena" | "gold" | "ritual";

export type HeroDef = {
  id: HeroId;
  name: string;
  title: string;
  blurb: string;
  role: "click" | "dps";
  baseCost: number;
  costScale: number;
  baseDps: number;
  baseClick: number;
  sprite: string | null;
  passive: string;
  unlockFloor: number;
  mark: string;
  acquire: "gold" | "gems" | "summon" | "cash";
  gemCost: number;
  usd?: string;
  facesRight?: boolean;
};

export type RelicDef = {
  id: RelicId;
  name: string;
  blurb: string;
  baseCost: number;
  costScale: number;
};

export type SkillDef = {
  id: SkillId;
  name: string;
  blurb: string;
  cooldown: number;
  duration: number;
};

export type ScienceDef = {
  id: ScienceId;
  name: string;
  blurb: string;
  baseCost: number;
  costScale: number;
};

export type ContractState = {
  kind: ContractKind;
  title: string;
  goal: number;
  progress: number;
  claimed: boolean;
  gold: number;
  souls: number;
  chests: number;
  influence: number;
};

export const HEROES: HeroDef[] = [
  {
    id: "kael",
    name: "Kael",
    title: "The Initiate",
    blurb: "A soul-forged blade and a stubborn will. Your tap is his strike.",
    role: "click",
    baseCost: 10,
    costScale: 1.07,
    baseDps: 1.4,
    baseClick: 3,
    sprite: "/sprites/kael.png?v=5",
    passive: "Click damage",
    unlockFloor: 1,
    mark: "K",
    acquire: "gold",
    gemCost: 0,
  },
  {
    id: "rook",
    name: "Rook",
    title: "Ashen Guard",
    blurb: "The wall that does not yield. The line holds because he does.",
    role: "dps",
    baseCost: 40,
    costScale: 1.07,
    baseDps: 6,
    baseClick: 0,
    sprite: "/sprites/rook.png?v=5",
    passive: "+8% party damage",
    unlockFloor: 1,
    mark: "R",
    acquire: "gold",
    gemCost: 0,
  },
  {
    id: "lyra",
    name: "Lyra",
    title: "Moonbow Scout",
    blurb: "Every arrow finds a heart. She never wastes a shot.",
    role: "dps",
    baseCost: 280,
    costScale: 1.07,
    baseDps: 28,
    baseClick: 0,
    sprite: "/sprites/lyra.png?v=5",
    passive: "+12% critical chance",
    unlockFloor: 1,
    mark: "L",
    acquire: "gold",
    gemCost: 0,
  },
  {
    id: "vex",
    name: "Vex",
    title: "Cinder Witch",
    blurb: "She speaks in sparks and endings. Gold runs like molten wax.",
    role: "dps",
    baseCost: 1400,
    costScale: 1.07,
    baseDps: 96,
    baseClick: 0,
    sprite: "/sprites/vex.png?v=5",
    passive: "+18% gold",
    unlockFloor: 1,
    mark: "V",
    acquire: "gold",
    gemCost: 0,
  },
  {
    id: "thane",
    name: "Thane",
    title: "Iron Vow",
    blurb: "A hammer for every heresy. Bosses learn his name last.",
    role: "dps",
    baseCost: 8200,
    costScale: 1.07,
    baseDps: 340,
    baseClick: 0,
    sprite: "/sprites/thane.png?v=5",
    passive: "+25% boss damage",
    unlockFloor: 1,
    mark: "T",
    acquire: "gold",
    gemCost: 0,
  },
  {
    id: "sable",
    name: "Sable",
    title: "Nightfang",
    blurb: "She opens throats in the dark and never needs a second cut.",
    role: "dps",
    baseCost: 22000,
    costScale: 1.07,
    baseDps: 720,
    baseClick: 0,
    sprite: "/sprites/sable.png?v=5",
    passive: "+40% critical damage",
    unlockFloor: 8,
    mark: "S",
    acquire: "gold",
    gemCost: 80,
  },
  {
    id: "morr",
    name: "Morr",
    title: "Grave Chanter",
    blurb: "The dead keep his tempo. Souls rise when the hymn ends.",
    role: "dps",
    baseCost: 48000,
    costScale: 1.07,
    baseDps: 1280,
    baseClick: 0,
    sprite: "/sprites/morr.png?v=5",
    passive: "+20% souls",
    unlockFloor: 1,
    mark: "M",
    acquire: "gold",
    gemCost: 0,
  },
  {
    id: "iskra",
    name: "Iskra",
    title: "Stormcaller",
    blurb: "Lightning learns her name. Every tap becomes a thunderhead.",
    role: "dps",
    baseCost: 1.2e5,
    costScale: 1.07,
    baseDps: 3100,
    baseClick: 0,
    sprite: "/sprites/iskra.png?v=5",
    passive: "+22% click damage",
    unlockFloor: 12,
    mark: "I",
    acquire: "gold",
    gemCost: 120,
  },
  {
    id: "brann",
    name: "Brann",
    title: "Ember Smith",
    blurb: "He forges coin from cinder. The dungeon pays in melted gold.",
    role: "dps",
    baseCost: 2.6e5,
    costScale: 1.07,
    baseDps: 6400,
    baseClick: 0,
    sprite: "/sprites/brann.png?v=5",
    passive: "+24% gold",
    unlockFloor: 16,
    mark: "B",
    acquire: "gold",
    gemCost: 140,
  },
  {
    id: "devourer",
    name: "The Devourer",
    title: "Riftborn",
    blurb: "It does not hunt. It harvests. The dungeon learned to fear hunger.",
    role: "dps",
    baseCost: 4e5,
    costScale: 1.07,
    baseDps: 9800,
    baseClick: 0,
    sprite: "/sprites/devourer.png?v=5",
    passive: "+30% all damage, soul steal",
    unlockFloor: 22,
    mark: "D",
    acquire: "summon",
    gemCost: 400,
  },
  {
    id: "nyx",
    name: "Nyx",
    title: "Rift Dancer",
    blurb: "She steps between seconds. Skills return before the blood dries.",
    role: "dps",
    baseCost: 1.1e6,
    costScale: 1.07,
    baseDps: 22000,
    baseClick: 0,
    sprite: "/sprites/nyx.png?v=5",
    passive: "+18% skill haste",
    unlockFloor: 30,
    mark: "N",
    acquire: "summon",
    gemCost: 280,
  },
  {
    id: "kira",
    name: "Kira",
    title: "Glass Knife",
    blurb: "She is paid in gems and silence. The well spat her out hungry.",
    role: "dps",
    baseCost: 2.4e6,
    costScale: 1.07,
    baseDps: 41000,
    baseClick: 0,
    sprite: "/sprites/kira.png?v=5",
    passive: "+10% click and crit",
    unlockFloor: 1,
    mark: "J",
    acquire: "summon",
    gemCost: 220,
  },
  {
    id: "orin",
    name: "Orin",
    title: "Gilded King",
    blurb: "He does not fight for gold. He is the price.",
    role: "dps",
    baseCost: 5e6,
    costScale: 1.07,
    baseDps: 88000,
    baseClick: 0,
    sprite: "/sprites/orin.png?v=5",
    passive: "+28% gold",
    unlockFloor: 1,
    mark: "O",
    acquire: "gems",
    gemCost: 450,
  },
  {
    id: "vorr",
    name: "Vorr",
    title: "The Unmade",
    blurb: "A name the rift still owes. Gold cannot really buy this.",
    role: "dps",
    baseCost: 1e16,
    costScale: 1.07,
    baseDps: 4.2e5,
    baseClick: 0,
    sprite: "/sprites/vorr.png?v=5",
    passive: "+40% all damage",
    unlockFloor: 1,
    mark: "V",
    acquire: "gold",
    gemCost: 0,
  },
  {
    id: "selene",
    name: "Selene",
    title: "Nightwell",
    blurb: "She drinks the moon and invoices the world.",
    role: "dps",
    baseCost: 1e22,
    costScale: 1.07,
    baseDps: 8e6,
    baseClick: 0,
    sprite: "/sprites/selene.png?v=5",
    passive: "+35% souls and gold",
    unlockFloor: 1,
    mark: "E",
    acquire: "gold",
    gemCost: 0,
  },
  {
    id: "ashur",
    name: "Ashur",
    title: "The Last Coin",
    blurb: "The final price. Empires die trying to hire him.",
    role: "dps",
    baseCost: 1e30,
    costScale: 1.07,
    baseDps: 3e8,
    baseClick: 0,
    sprite: "/sprites/ashur.png?v=5",
    passive: "+50% gold",
    unlockFloor: 1,
    mark: "A",
    acquire: "gold",
    gemCost: 0,
  },
  {
    id: "dax",
    name: "Dax",
    title: "Ash Cleaver",
    blurb: "The axe remembers every vault door it opened.",
    role: "dps",
    baseCost: 7.4e6,
    costScale: 1.07,
    baseDps: 1.2e5,
    baseClick: 0,
    sprite: "/sprites/dax.png?v=5",
    passive: "+16% boss damage",
    unlockFloor: 18,
    mark: "X",
    acquire: "gold",
    gemCost: 160,
  },
  {
    id: "wren",
    name: "Wren",
    title: "Well Shepherd",
    blurb: "She knits wounds from moss and hymn.",
    role: "dps",
    baseCost: 1.6e7,
    costScale: 1.07,
    baseDps: 1.8e5,
    baseClick: 0,
    sprite: "/sprites/wren.png?v=5",
    passive: "+12% party damage",
    unlockFloor: 20,
    mark: "W",
    acquire: "gold",
    gemCost: 180,
  },
  {
    id: "jora",
    name: "Jora",
    title: "Rime Bow",
    blurb: "Frost learns the shape of her arrows.",
    role: "dps",
    baseCost: 3.8e7,
    costScale: 1.07,
    baseDps: 2.6e5,
    baseClick: 0,
    sprite: "/sprites/jora.png?v=5",
    passive: "+10% critical chance",
    unlockFloor: 24,
    mark: "J",
    acquire: "summon",
    gemCost: 300,
  },
  {
    id: "pike",
    name: "Pike",
    title: "Long Debt",
    blurb: "A spear paid for in other men's names.",
    role: "dps",
    baseCost: 9e7,
    costScale: 1.07,
    baseDps: 4.1e5,
    baseClick: 0,
    sprite: "/sprites/pike.png?v=5",
    passive: "+14% click damage",
    unlockFloor: 28,
    mark: "P",
    acquire: "gold",
    gemCost: 200,
  },
  {
    id: "auric",
    name: "Auric",
    title: "God of the Hoard",
    blurb: "A god. Gold bends when he stands up. Real money only.",
    role: "dps",
    baseCost: 1e40,
    costScale: 1.07,
    baseDps: 2e9,
    baseClick: 0,
    sprite: "/sprites/auric.png?v=1",
    passive: "Gold finds x2.5",
    unlockFloor: 1,
    mark: "Au",
    acquire: "cash",
    gemCost: 0,
    usd: "$19.99",
    facesRight: true,
  },
  {
    id: "solenne",
    name: "Solenne",
    title: "God of the Well",
    blurb: "A god. Souls answer her. Real money only.",
    role: "dps",
    baseCost: 1e40,
    costScale: 1.07,
    baseDps: 4e9,
    baseClick: 0,
    sprite: "/sprites/solenne.png?v=1",
    passive: "Souls x2.5",
    unlockFloor: 1,
    mark: "So",
    acquire: "cash",
    gemCost: 0,
    usd: "$29.99",
    facesRight: true,
  },
  {
    id: "vael",
    name: "Vael",
    title: "God of the Cut",
    blurb: "A god. The rift opens where he points. Real money only.",
    role: "dps",
    baseCost: 1e40,
    costScale: 1.07,
    baseDps: 8e9,
    baseClick: 0,
    sprite: "/sprites/vael.png?v=1",
    passive: "All damage x2",
    unlockFloor: 1,
    mark: "Va",
    acquire: "cash",
    gemCost: 0,
    usd: "$49.99",
    facesRight: true,
  },
  {
    id: "morvax",
    name: "Morvax",
    title: "The Gem God",
    blurb: "A god priced in gems. One million. Nothing else buys him.",
    role: "dps",
    baseCost: 1e40,
    costScale: 1.07,
    baseDps: 1.5e10,
    baseClick: 0,
    sprite: "/sprites/morvax.png?v=1",
    passive: "All damage x2.5",
    unlockFloor: 1,
    mark: "Mx",
    acquire: "gems",
    gemCost: 1_000_000,
    facesRight: true,
  },
];

export const RELICS: RelicDef[] = [
  { id: "blood-sigil", name: "Blood Sigil", blurb: "Party damage +12% per rank.", baseCost: 3, costScale: 1.55 },
  { id: "gilded-chalice", name: "Gilded Chalice", blurb: "Gold finds +14% per rank.", baseCost: 4, costScale: 1.55 },
  { id: "soul-lamp", name: "Soul Lamp", blurb: "Ritual souls +16% per rank.", baseCost: 5, costScale: 1.6 },
  { id: "click-relic", name: "Ashen Gauntlet", blurb: "Click damage +18% per rank.", baseCost: 3, costScale: 1.5 },
  { id: "boss-bane", name: "Boss Bane", blurb: "Boss damage +15% per rank.", baseCost: 6, costScale: 1.6 },
  { id: "world-anchor", name: "World Anchor", blurb: "Start +4 floors after ritual.", baseCost: 8, costScale: 1.65 },
  { id: "hourglass", name: "Rift Hourglass", blurb: "Skill duration +10% per rank.", baseCost: 5, costScale: 1.55 },
  { id: "fortune-fang", name: "Fortune Fang", blurb: "Critical chance +4% per rank.", baseCost: 6, costScale: 1.55 },
  { id: "silent-bell", name: "Silent Bell", blurb: "Skill haste +7% per rank.", baseCost: 7, costScale: 1.6 },
  { id: "coffer-key", name: "Coffer Key", blurb: "Chests and offline gold.", baseCost: 4, costScale: 1.5 },
];

export const SKILLS: SkillDef[] = [
  { id: "strike", name: "Soul Strike", blurb: "Instant smash. Always crits. You start with this.", cooldown: 8, duration: 0 },
  { id: "goldrush", name: "Gold Rush", blurb: "Gold drops x2 for 12s. Party skill — no hire needed.", cooldown: 28, duration: 12 },
  { id: "rage", name: "Bloodrage", blurb: "Everyone's damage x2 for 10s. Party skill — no hire needed.", cooldown: 30, duration: 10 },
  { id: "harvest", name: "Dark Harvest", blurb: "Carve 22% of a trash pack's remaining HP. 8% of a boss's remaining HP — cannot finish a boss.", cooldown: 32, duration: 0 },
];

export const SCIENCES: ScienceDef[] = [
  { id: "war", name: "War", blurb: "Party damage +10% per rank.", baseCost: 12, costScale: 1.45 },
  { id: "greed", name: "Greed", blurb: "Gold finds +12% per rank.", baseCost: 12, costScale: 1.45 },
  { id: "hunger", name: "Hunger", blurb: "Souls +12% per rank.", baseCost: 14, costScale: 1.5 },
  { id: "tempo", name: "Tempo", blurb: "Skill haste +8% per rank.", baseCost: 16, costScale: 1.5 },
  { id: "fortune", name: "Fortune", blurb: "Critical chance +3% per rank.", baseCost: 18, costScale: 1.5 },
  { id: "depth", name: "Depth", blurb: "Start +3 floors after ritual.", baseCost: 20, costScale: 1.55 },
];

export const HERO_LEVEL_CAP = 100;
export const HERO_PRESTIGE_MAX = 100;
export const RELIC_RANK_CAP = 500;
export const SCIENCE_RANK_CAP = 500;
export const WEAPON_RANK_CAP = 2000;
export const MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2500];
export const ARENA_CHARGE_MAX = 5;
export const ARENA_CHARGE_TIME = 90;
export const ARENA_REVIVE_MS = 24 * 60 * 60 * 1000;
export const ARENA_REVIVE_GEMS = 40;
export const ARENA_FOES = [
  "Ashen Pact",
  "Rime Banner",
  "Cinder Host",
  "Void Choir",
  "Gilded Teeth",
  "Nightwell",
  "Iron Hymn",
  "Last Coin",
];

const TRASH: MonsterKind[] = ["rat", "skeleton", "slime", "spider", "bat", "wraith", "brute", "golem", "ghoul", "beetle", "hound"];
const BOSSES: MonsterKind[] = ["tyrant", "wyrm", "riftmaw", "golem", "brute", "lich", "harpy", "rimeknight"];

const MONSTER_NAMES: Record<MonsterKind, string[]> = {
  rat: ["Crypt Rat", "Bone Gnawer", "Sewer King"],
  skeleton: ["Ash Skeleton", "Rattle Guard", "Vault Bones"],
  slime: ["Cinder Slime", "Gold Jelly", "Well Pudding"],
  spider: ["Vault Spider", "Widow of the Crypt", "Rift Spinner"],
  bat: ["Tomb Bat", "Screech", "Night Fang"],
  wraith: ["Ash Wraith", "Name-Eater", "Pale Hymn"],
  brute: ["Crypt Brute", "Iron Thug", "Oathbreaker"],
  golem: ["Vault Golem", "Ember Statue", "Rune Hulk"],
  tyrant: ["Floor Tyrant", "Crown of Bone", "The Warden"],
  wyrm: ["Ash Wyrm", "Cinder Serpent", "Rift Drake"],
  riftmaw: ["Riftmaw", "The Cut", "Hunger Given Shape"],
  ghoul: ["Crypt Ghoul", "Name Chewer", "Pale Hunger"],
  beetle: ["Tomb Beetle", "Vault Shell", "Rune Tick"],
  serpent: ["Rime Gargoyle", "Ice Warden", "Frost Hulk"],
  harpy: ["Ash Harpy", "Screech Queen", "Rift Wing"],
  lich: ["Floor Lich", "Last Chanter", "Bone Crown"],
  hound: ["Grave Hound", "Ash Wolf", "Night Pack"],
  rimeknight: ["Rime Knight", "Ice Warden", "Frost Paladin"],
};

export function monsterKindFor(floor: number, boss: boolean, avoid?: MonsterKind): MonsterKind {
  const pool: MonsterKind[] = boss
    ? floor >= 40
      ? ["tyrant", "wyrm", "riftmaw", "lich", "harpy"]
      : ["tyrant", "brute", "golem", "wraith", "rimeknight", "hound"]
    : floor >= 25
      ? [...TRASH, "wyrm", "harpy", "rimeknight"]
      : [...TRASH];
  const opts = avoid ? pool.filter((k) => k !== avoid) : pool;
  const use = opts.length ? opts : pool;
  return use[Math.floor(Math.random() * use.length)]!;
}

export function monsterName(kind: MonsterKind, floor: number): string {
  const list = MONSTER_NAMES[kind];
  if (!list?.length) return "Rift Beast";
  return list[Math.abs(floor) % list.length]!;
}

export function biomeFor(floor: number): "crypt" | "frost" | "ember" | "void" | "soulwell" {
  if (floor >= 100) return "soulwell";
  if (floor >= 70) return "void";
  if (floor >= 30) return "ember";
  if (floor >= 12) return "frost";
  return "crypt";
}

export function heroPortrait(id: HeroId): string {
  return `/portraits/${id}.jpg?v=4`;
}

export function arenaFoeArt(name: string): string {
  switch (name) {
    case "Ashen Pact":
      return "/sprites/monsters/wraith.png?v=8";
    case "Rime Banner":
      return "/sprites/monsters/rimeknight.png?v=8";
    case "Cinder Host":
      return "/sprites/monsters/harpy.png?v=8";
    case "Void Choir":
      return "/sprites/monsters/lich.png?v=8";
    case "Gilded Teeth":
      return "/sprites/monsters/hound.png?v=8";
    case "Nightwell":
      return "/portraits/selene.jpg?v=4";
    case "Iron Hymn":
      return "/sprites/monsters/golem.png?v=8";
    case "Last Coin":
      return "/portraits/ashur.jpg?v=4";
    default:
      return "/tiles/crest-axe.png";
  }
}

export function heroStars(hero: HeroDef, gilds: number): number {
  let s = 1;
  if (hero.unlockFloor >= 8) s = 2;
  if (hero.unlockFloor >= 16) s = 3;
  if (hero.acquire === "summon") s = 4;
  if (hero.acquire === "gems" || hero.acquire === "cash") s = 5;
  if (hero.baseCost >= 1e12) s = 5;
  return Math.min(5, s + Math.max(0, gilds));
}

type Progress = {
  kills: number;
  maxFloor: number;
  bossKills: number;
  hires: number;
  crits: number;
  arenaWins: number;
  lootGold: number;
  rituals: number;
};

const CONTRACTS: Record<
  ContractKind,
  { title: (n: number) => string; next: (p: Progress) => number }
> = {
  slay: { title: (n) => `Slay ${n} beasts`, next: (p) => Math.max(20, p.kills + 25) },
  depth: { title: (n) => `Reach floor ${n}`, next: (p) => p.maxFloor + 8 },
  tyrants: { title: (n) => `Fell ${n} tyrants`, next: (p) => Math.max(2, p.bossKills + 2) },
  hire: { title: (n) => `Hire ${n} crusaders`, next: (p) => Math.min(HEROES.length, p.hires + 2) },
  crits: { title: (n) => `Land ${n} crits`, next: (p) => Math.max(8, p.crits + 12) },
  arena: { title: (n) => `Win ${n} arena bouts`, next: (p) => Math.max(1, p.arenaWins + 2) },
  gold: { title: (n) => `Loot ${n} gold`, next: (p) => Math.max(200, Math.floor(p.lootGold * 1.4) || 400) },
  ritual: { title: (n) => `Complete ${n} rituals`, next: (p) => p.rituals + 1 },
};

export function contractProgress(kind: ContractKind, p: Progress): number {
  switch (kind) {
    case "slay":
      return p.kills;
    case "depth":
      return p.maxFloor;
    case "tyrants":
      return p.bossKills;
    case "hire":
      return p.hires;
    case "crits":
      return p.crits;
    case "arena":
      return p.arenaWins;
    case "gold":
      return Math.floor(p.lootGold);
    case "ritual":
      return p.rituals;
  }
}

export function rollContracts(p: Progress, avoid: ContractKind[] = []): ContractState[] {
  const kinds: ContractKind[] = [];
  const push = (k: ContractKind) => {
    if (contractProgress(k, p) >= CONTRACTS[k].next(p) && k === "hire" && p.hires >= HEROES.length) return;
    if (k === "hire" && p.hires >= HEROES.length) return;
    kinds.push(k);
  };
  push("slay");
  push("depth");
  push("tyrants");
  push("crits");
  push("gold");
  if (p.hires < HEROES.length) push("hire");
  if (p.maxFloor >= 5) push("arena");
  if (p.maxFloor >= 12) push("ritual");
  const fresh = kinds.filter((k) => !avoid.includes(k));
  const pool = (fresh.length >= 3 ? fresh : kinds).slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = t;
  }
  return pool.slice(0, 3).map((kind, i) => {
    const def = CONTRACTS[kind];
    let goal = Math.max(1, def.next(p));
    const now = contractProgress(kind, p);
    if (goal <= now) goal = now + (kind === "depth" ? 8 : kind === "hire" ? 1 : 25);
    if (kind === "hire") goal = Math.min(HEROES.length, goal);
    return {
      kind,
      title: def.title(goal),
      goal,
      progress: 0,
      claimed: false,
      gold: Math.floor(40 * Math.pow(1.35, Math.max(0, p.maxFloor / 8)) * (i + 1)),
      souls: i === 0 ? 1 : 0,
      chests: i === 2 ? 1 : 0,
      influence: 4 + i * 2,
    };
  });
}
