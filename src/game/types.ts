import type {
  ContractState,
  HeroId,
  MonsterKind,
  RelicId,
  ScienceId,
  SkillId,
} from "./data";
import type { RealmId, SocketId, WeaponId } from "./meta";
import type { EventId, OwnedRune, RuneStat } from "./gear";
import type { LootId } from "./loot";

export type Bulk = 1 | 10 | 25 | 100 | -1;

export type GameState = {
  version: number;
  gold: number;
  souls: number;
  gems: number;
  influence: number;
  chests: number;
  floor: number;
  maxFloor: number;
  farm: boolean;
  heroLevel: Record<HeroId, number>;
  heroGild: Record<HeroId, number>;
  relicLevel: Record<RelicId, number>;
  scienceLevel: Record<ScienceId, number>;
  skillCd: Record<SkillId, number>;
  skillActive: Record<SkillId, number>;
  weaponLevel: Record<WeaponId, number>;
  socket: SocketId | null;
  socketsOwned: Record<SocketId, boolean>;
  founderClaimed: boolean;
  founderKit: number;
  lastFreeWell: string;
  kills: number;
  clicks: number;
  rituals: number;
  crits: number;
  bossKills: number;
  hires: number;
  lootGold: number;
  arenaWins: number;
  arenaLosses: number;
  arenaCharges: number;
  arenaRegen: number;
  contracts: ContractState[];
  quests: Record<string, boolean>;
  lastSaveAt: number;
  startedAt: number;
  ember: number;
  bone: number;
  riftDust: number;
  runes: OwnedRune[];
  heroRunes: Record<HeroId, (string | null)[]>;
  heroCraft: Record<HeroId, number>;
  heroPrestige: Record<HeroId, number>;
  heroDown: Record<HeroId, number>;
  eventDay: string;
  eventPts: number;
  siegeLair: RealmId | null;
  siegePts: number;
  siegeReadyAt: number;
  arenaChest: number;
  bag: Record<LootId, number>;
  crafts: number;
  badges: Record<string, number>;
  loginDay: string;
  loginStreak: number;
  loginClaimed: string;
  chapterClaim: number;
  pity: number;
  expeditionHero: HeroId | null;
  expeditionAt: number;
  marketDay: string;
  marketBought: string[];
  vipSpent: number;
  title: string;
  autoSkill: boolean;
  monthKey: string;
  monthHits: number[];
  watchDay: string;
  wheelDay: string;
  wheelFreeAt: number;
  wheelBoostAt: number;
  wheelChance: number;
  wheelPot: number;
  bpPts: number;
  bpPremium: boolean;
  bpFree: number;
  bpPrem: number;
  codex: Record<string, number>;
  cardUntil: number;
  firstBuy: boolean;
  looks: string[];
  frame: string;
  nameHue: string;
  splash: string;
  shieldUntil: number;
  playMs: number;
  wellToken: number;
  wellHymnDay: string;
  shieldHymnDay: string;
  lastPlunderAt: number;
  avatarHero: string;
};

export type MonsterState = {
  hp: number;
  max: number;
  kind: MonsterKind;
  name: string;
  isBoss: boolean;
  timer: number;
  timerMax: number;
  artScale: number;
};

export type SimEvent =
  | { type: "hit"; amount: number; crit: boolean; source: "click" | "hero" | "skill"; heroId?: HeroId }
  | { type: "kill"; gold: number; souls: number; isBoss: boolean; kind: MonsterKind; chest: boolean }
  | { type: "bossStart" }
  | { type: "bossFail" }
  | { type: "heroAttack"; heroId: HeroId }
  | { type: "ritual"; souls: number }
  | { type: "skill"; id: SkillId }
  | { type: "arena"; win: boolean; foe: string }
  | { type: "summon"; name: string };

export type HeroSnap = {
  id: HeroId;
  level: number;
  gilds: number;
  dps: number;
  click: number;
  cost: number;
  levels: number;
  canAfford: boolean;
  unlocked: boolean;
  gildCost: number;
  gildCount: number;
  canGild: boolean;
  acquire: "gold" | "gems" | "summon";
  gemCost: number;
  canGemHire: boolean;
  stars: number;
  legendName: string;
  legendBlurb: string;
  legendOn: boolean;
  craftRank: number;
  craftName: string;
  craftEmber: number;
  craftBone: number;
  canCraft: boolean;
  runeSlots: number;
  attached: (OwnedRune | null)[];
  prestige: number;
  prestigeMax: number;
  prestigeCost: number;
  canPrestige: boolean;
  atCap: boolean;
  down: boolean;
  downLeft: number;
  reviveGems: number;
  canRevive: boolean;
};

export type RelicSnap = {
  id: RelicId;
  level: number;
  cost: number;
  canAfford: boolean;
};

export type ScienceSnap = {
  id: ScienceId;
  level: number;
  cost: number;
  canAfford: boolean;
};

export type WeaponSnap = {
  id: WeaponId;
  level: number;
  cost: number;
  gemCost: number;
  canAfford: boolean;
  canGem: boolean;
};

export type SocketSnap = {
  id: SocketId;
  owned: boolean;
  equipped: boolean;
  gemCost: number;
  canAfford: boolean;
};

export type SkillSnap = {
  id: SkillId;
  cd: number;
  maxCd: number;
  active: number;
  maxActive: number;
  ready: boolean;
};

export type ContractSnap = ContractState & {
  progress: number;
  ready: boolean;
};

export type ArenaResult = {
  win: boolean;
  foe: string;
  influence: number;
  souls: number;
  gold: number;
  chests: number;
  yourPower: number;
  theirPower: number;
  fallen: { id: HeroId; name: string }[];
};

export type Snapshot = {
  gold: number;
  souls: number;
  gems: number;
  influence: number;
  chests: number;
  floor: number;
  maxFloor: number;
  wave: number;
  dps: number;
  clickDmg: number;
  monsterHp: number;
  monsterMax: number;
  monsterName: string;
  monsterKind: MonsterKind;
  isBoss: boolean;
  bossTime: number;
  bossMaxTime: number;
  farm: boolean;
  combo: number;
  heroes: HeroSnap[];
  relics: RelicSnap[];
  sciences: ScienceSnap[];
  weapons: WeaponSnap[];
  sockets: SocketSnap[];
  skills: SkillSnap[];
  contracts: ContractSnap[];
  ritualSouls: number;
  ritualUnlocked: boolean;
  startFloor: number;
  kills: number;
  rituals: number;
  goldMult: number;
  dpsMult: number;
  arenaCharges: number;
  arenaChargeMax: number;
  arenaRegen: number;
  arenaWins: number;
  arenaUnlocked: boolean;
  critChance: number;
  founderClaimed: boolean;
  freeWell: boolean;
  summonCost: number;
  pouchCost: number;
  canPouch: boolean;
  socket: SocketId | null;
  realm: RealmId;
  realmName: string;
  ember: number;
  bone: number;
  riftDust: number;
  runeBag: OwnedRune[];
  eventId: EventId;
  eventName: string;
  eventBlurb: string;
  eventPts: number;
  siegeLair: RealmId | null;
  siegePts: number;
  siegeReadyIn: number;
  arenaChest: number;
  bag: { id: LootId; name: string; kind: "loot" | "shard"; count: number }[];
  daysPlayed: number;
  crafts: number;
  bossKills: number;
  hires: number;
  badges: { id: string; name: string; blurb: string; hint: string; on: boolean; at: number }[];
  dailyReady: boolean;
  dailyStreak: number;
  dailyGems: number;
  dailyIndex: number;
  chapterFloor: number | null;
  chapterGold: number;
  pity: number;
  pityAt: number;
  expeditionHero: HeroId | null;
  expeditionName: string;
  expeditionLeft: number;
  expeditionReady: boolean;
  market: { id: string; name: string; blurb: string; gold: number; gems: number; bought: boolean }[];
  vip: number;
  vipSpent: number;
  vipNext: number;
  title: string;
  titles: { id: string; name: string; on: boolean }[];
  huntPing: boolean;
  autoSkill: boolean;
  monthDay: number;
  monthHits: number[];
  monthGems: number;
  monthReady: boolean;
  watchReady: boolean;
  wheelReady: boolean;
  wheelPot: number;
  wheelCost: number;
  wheelChance: number;
  wheelFreeIn: number;
  wheelDecayIn: number;
  firstBuy: boolean;
  firstPackGems: number;
  looks: string[];
  frame: string;
  nameHue: string;
  splash: string;
  shieldLeft: number;
  shieldOn: boolean;
  wellToken: number;
  wellHymnReady: boolean;
  shieldHymnReady: boolean;
  playLeft: number;
  plunderReadyIn: number;
  avatarHero: string;
  bpPts: number;
  bpRank: number;
  bpMax: number;
  bpPremium: boolean;
  bpNeed: number;
  bpFreeReady: number;
  bpPremReady: number;
  cardLeft: number;
  cardOn: boolean;
  cardCost: number;
  codex: { id: string; n: number }[];
  codexSeen: number;
};
