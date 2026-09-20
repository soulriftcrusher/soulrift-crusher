import {
  ARENA_CHARGE_MAX,
  ARENA_CHARGE_TIME,
  ARENA_FOES,
  ARENA_REVIVE_GEMS,
  ARENA_REVIVE_MS,
  HEROES,
  HERO_LEVEL_CAP,
  HERO_PRESTIGE_MAX,
  RELIC_RANK_CAP,
  SCIENCE_RANK_CAP,
  WEAPON_RANK_CAP,
  MILESTONES,
  RELICS,
  SCIENCES,
  SKILLS,
  biomeFor,
  contractProgress,
  heroStars,
  monsterKindFor,
  monsterName,
  rollContracts,
  type ContractKind,
  type HeroId,
  type RelicId,
  type ScienceId,
  type SkillId,
} from "./data";
import { ACHIEVEMENTS } from "./achievements";
import {
  EVENT_SHOP,
  GEM_TO_EMBER,
  EMBER_FROM_GEMS,
  HERO_CRAFTS,
  LEGENDS,
  SIEGE_TRAVEL,
  craftCost,
  dayKey,
  eventForDay,
  mintRune,
  runeSlots,
  RUNE_STATS,
  RUNE_NAMES,
} from "./gear";
import {
  EXPEDITION_MS,
  PITY_AT,
  TITLES,
  collectionBonus,
  marketForDay,
  monthDay,
  monthKey,
  monthReward,
  nextChapter,
  vipNext,
  vipRank,
  bpFreeLoot,
  bpPremLoot,
  bpRank,
  BP_MAX,
  BP_PREMIUM,
  BP_STEP,
  CARD_GEMS,
  CARD_MS,
  WATCH_GEMS,
  WEEKLY_LOGIN,
} from "./liveops";
import { dropFor, matchRecipe, craftChance, LOOT, type LootId } from "./loot";
import { REALMS, SOCKETS, WEAPONS, gemRankCost, rankCost, type RealmId, type SocketId, type WeaponId } from "./meta";
import {
  FIRST_PACK_GEMS,
  FRAMES,
  HYMN_SHIELD_MS,
  HYMN_SKIP_GEMS,
  NAME_HUES,
  PLAY_SHIELD_MS,
  RAID_CD_MS,
  SHIELD_GEMS,
  SHIELD_MS,
  SPLASHES,
  WHEEL_CHANCE_STEP,
  WHEEL_DAY_MS,
  WHEEL_JACKPOT_CHANCE,
  WHEEL_POT_START,
  WHEEL_SPIN_GEMS,
  clampChance,
  ownedLooks,
  rollWheel,
  type LookId,
  type WheelSlice,
} from "./cash";
import { defaultState, loadState, lockRoster, mergeProgress, persistState } from "./save";
import type { ArenaResult, Bulk, GameState, MonsterState, SimEvent, Snapshot } from "./types";

function geometricSum(base: number, scale: number, from: number, n: number): number {
  if (n <= 0) return 0;
  return base * Math.pow(scale, from) * ((Math.pow(scale, n) - 1) / (scale - 1));
}

function milestoneMult(level: number): number {
  let m = 1;
  for (const t of MILESTONES) if (level >= t) m *= 2;
  return m;
}

export class GameSim {
  state: GameState;
  monster: MonsterState;
  combo = 0;
  comboTimer = 0;
  events: SimEvent[] = [];
  attackCd: Record<HeroId, number>;
  lastArena: ArenaResult | null = null;
  private saveAcc = 0;
  private offlineGold = 0;
  private clanDps = 0;
  private clanGold = 0;
  private clanSouls = 0;

  constructor() {
    const { state } = loadState();
    this.state = state;
    this.attackCd = {} as Record<HeroId, number>;
    for (const h of HEROES) this.attackCd[h.id] = 0.2 + Math.random() * 0.6;
    this.monster = this.makeMonster(state.floor, this.isBossFloor(state.floor) && !state.farm);
    this.banishCoil();
    this.ensureEvent();
    this.ensureContracts();
    this.ensureFounderKit();
    const huntAt = state.lastHuntAt || state.lastSaveAt || Date.now();
    const huntGap = Math.max(0, (Date.now() - huntAt) / 1000);
    if (huntGap > 8) this.offlineGold = this.catchUp(huntGap);
  }

  takeOfflineGold(): number {
    const g = this.offlineGold;
    this.offlineGold = 0;
    return g;
  }

  emit(e: SimEvent) {
    this.events.push(e);
    if (this.events.length > 80) this.events.splice(0, this.events.length - 80);
  }

  drain(): SimEvent[] {
    const e = this.events;
    this.events = [];
    return e;
  }

  progress() {
    return {
      kills: this.state.kills,
      maxFloor: this.state.maxFloor,
      bossKills: this.state.bossKills,
      hires: this.state.hires,
      crits: this.state.crits,
      arenaWins: this.state.arenaWins,
      lootGold: this.state.lootGold,
      rituals: this.state.rituals,
    };
  }

  isBossFloor(floor: number): boolean {
    return floor > 1 && floor % 10 === 0;
  }

  makeMonster(floor: number, boss: boolean): MonsterState {
    let kind = monsterKindFor(floor, boss, this.monster?.kind);
    if (kind === "serpent") kind = "rimeknight";
    const hp = this.monsterHp(floor, boss);
    const timerMax = boss ? 55 + Math.min(40, Math.floor(floor / 20)) : 0;
    return {
      hp,
      max: hp,
      kind,
      name: monsterName(kind, floor),
      isBoss: boss,
      timer: timerMax,
      timerMax,
      artScale: (boss ? 0.9 : 0.72) + Math.random() * 0.18,
    };
  }

  private banishCoil() {
    if (this.monster.kind !== "serpent" && this.monster.name !== "Coil of Frost") return;
    const hp = this.monster.hp;
    const max = this.monster.max;
    const boss = this.monster.isBoss;
    this.monster = this.makeMonster(this.state.floor, boss);
    this.monster.kind = "rimeknight";
    this.monster.name = "Rime Knight";
    this.monster.isBoss = boss;
    this.monster.max = max;
    this.monster.hp = hp;
  }

  monsterHp(floor: number, boss: boolean): number {
    const n = Math.max(1, floor);
    const base = 16 * Math.pow(1.26, n - 1);
    const band = Math.pow(1.08, Math.floor((n - 1) / 25));
    const hp = base * band * (boss ? 5 : 1);
    if (!Number.isFinite(hp)) return 1e15 * (boss ? 5 : 1);
    return Math.max(8, Math.floor(hp));
  }

  monsterGold(floor: number, boss: boolean): number {
    const hp = this.monsterHp(floor, false);
    const raw = (hp / 4.2) * (boss ? 3.4 : 1) * 0.028;
    return Math.max(1, Math.floor(raw));
  }

  relicRank(id: RelicId): number {
    return this.state.relicLevel[id] ?? 0;
  }
  scienceRank(id: ScienceId): number {
    return this.state.scienceLevel[id] ?? 0;
  }
  weaponRank(id: WeaponId): number {
    return this.state.weaponLevel[id] ?? 0;
  }

  goldMult(): number {
    let m = 1 + this.relicRank("gilded-chalice") * 0.14;
    m *= 1 + this.scienceRank("greed") * 0.12;
    m *= 1 + this.runeBonus("gold");
    if ((this.state.heroLevel.vex ?? 0) > 0) m *= 1.16;
    if (this.legendOn("vex")) m *= 1.12;
    if (this.state.skillActive.goldrush > 0) m *= 2;
    if (this.state.siegeLair === "crypt") m *= 1.08;
    m *= 1 + vipRank(this.state.vipSpent ?? 0) * 0.025;
    m *= 1 + this.clanGold / 100;
    return m;
  }

  dpsMult(): number {
    let m = 1 + this.relicRank("blood-sigil") * 0.12;
    m *= 1 + this.scienceRank("war") * 0.1;
    m *= 1 + this.weaponRank("rift-fang") * 0.16;
    m *= 1 + this.runeBonus("dps");
    if (this.state.socket === "ruby") m *= 1.18;
    if ((this.state.heroLevel.rook ?? 0) > 0) m *= 1.08;
    if ((this.state.heroLevel.wren ?? 0) > 0) m *= 1.12;
    if ((this.state.heroLevel.devourer ?? 0) > 0) m *= 1.3;
    if ((this.state.heroLevel.vorr ?? 0) > 0) m *= 1.4;
    if (this.legendOn("rook")) m *= 1.14;
    if (this.legendOn("devourer")) m *= 1.16;
    if (this.state.skillActive.rage > 0) m *= 2;
    if (this.state.siegeLair === "ember") m *= 1.08;
    m *= collectionBonus(this.state.heroLevel);
    m *= 1 + vipRank(this.state.vipSpent ?? 0) * 0.02;
    const seen = Object.keys(this.state.codex ?? {}).length;
    m *= 1 + seen * 0.008;
    m *= 1 + this.clanDps / 100;
    return m;
  }

  clickMult(): number {
    let m = 1 + this.relicRank("click-relic") * 0.18;
    m *= 1 + this.weaponRank("ash-blade") * 0.14;
    m *= 1 + this.runeBonus("click");
    if ((this.state.heroLevel.iskra ?? 0) > 0) m *= 1.22;
    if ((this.state.heroLevel.pike ?? 0) > 0) m *= 1.14;
    if ((this.state.heroLevel.kira ?? 0) > 0) m *= 1.1;
    if (this.legendOn("kael")) m *= 1.28;
    if (this.legendOn("iskra")) m *= 1.2;
    if (this.legendOn("kira")) m *= 1.08;
    if (this.state.siegeLair === "frost") m *= 1.08;
    m *= 1 + this.combo * 0.12;
    return m;
  }

  critChance(): number {
    let c = 0.08;
    if ((this.state.heroLevel.lyra ?? 0) > 0) c += 0.12;
    if ((this.state.heroLevel.jora ?? 0) > 0) c += 0.1;
    if ((this.state.heroLevel.kira ?? 0) > 0) c += 0.05;
    if (this.legendOn("lyra")) c += 0.1;
    if (this.legendOn("kira")) c += 0.06;
    c += this.relicRank("fortune-fang") * 0.04;
    c += this.scienceRank("fortune") * 0.03;
    c += this.weaponRank("moon-string") * 0.03;
    c += this.runeBonus("crit");
    if (this.state.socket === "emerald") c += 0.08;
    return Math.min(0.7, c);
  }

  critMult(): number {
    let m = 3.2;
    if ((this.state.heroLevel.sable ?? 0) > 0) m *= 1.4;
    if (this.legendOn("sable")) m *= 1.3;
    return m;
  }

  bossMult(): number {
    let m = 1 + this.relicRank("boss-bane") * 0.15;
    m *= 1 + this.weaponRank("iron-maul") * 0.12;
    m *= 1 + this.runeBonus("boss");
    if ((this.state.heroLevel.thane ?? 0) > 0) m *= 1.25;
    if ((this.state.heroLevel.dax ?? 0) > 0) m *= 1.16;
    if (this.legendOn("thane")) m *= 1.32;
    return m;
  }

  soulMult(): number {
    let m = 1 + this.relicRank("soul-lamp") * 0.16;
    m *= 1 + this.scienceRank("hunger") * 0.12;
    m *= 1 + this.runeBonus("soul");
    if ((this.state.heroLevel.morr ?? 0) > 0) m *= 1.2;
    if (this.legendOn("morr")) m *= 1.18;
    if (this.legendOn("selene") || (this.state.heroLevel.selene ?? 0) > 0) m *= 1.35;
    if (this.state.siegeLair === "void") m *= 1.08;
    m *= 1 + this.clanSouls / 100;
    return m;
  }

  skillHaste(): number {
    let h = 0;
    if ((this.state.heroLevel.nyx ?? 0) > 0) h += 0.18;
    if (this.legendOn("nyx")) h += 0.14;
    h += this.relicRank("silent-bell") * 0.07;
    h += this.scienceRank("tempo") * 0.08;
    h += this.runeBonus("haste");
    return h;
  }

  skillDurationMult(): number {
    return 1 + this.relicRank("hourglass") * 0.1;
  }

  offlineMult(): number {
    let m = 1 + this.relicRank("coffer-key") * 0.12;
    m *= 1 + this.runeBonus("idle");
    if ((this.state.cardUntil ?? 0) > Date.now()) m *= 2;
    return m;
  }

  startFloorAfterRitual(): number {
    return 1 + this.relicRank("world-anchor") * 4 + this.scienceRank("depth") * 3;
  }

  legendOn(id: HeroId): boolean {
    return (this.state.heroLevel[id] ?? 0) >= 50;
  }

  runeBonus(stat: import("./gear").RuneStat): number {
    let v = 0;
    for (const h of HEROES) {
      const slots = this.state.heroRunes[h.id] ?? [];
      for (const rid of slots) {
        if (!rid) continue;
        const r = this.state.runes.find((x) => x.id === rid);
        if (r && r.stat === stat) v += r.value;
      }
    }
    return v;
  }

  grantRune(rune: import("./gear").OwnedRune) {
    this.state.runes = [...(this.state.runes ?? []), rune].slice(-96);
  }

  isDown(id: HeroId): boolean {
    if (this.state.expeditionHero === id && (this.state.expeditionAt ?? 0) > Date.now()) return true;
    const until = this.state.heroDown?.[id] ?? 0;
    return until > Date.now();
  }

  heroDps(id: HeroId): number {
    const def = HEROES.find((h) => h.id === id)!;
    const level = this.state.heroLevel[id] ?? 0;
    if (level <= 0) return 0;
    if (this.isDown(id)) return 0;
    const gilds = this.state.heroGild[id] ?? 0;
    const craft = 1 + 0.1 * (this.state.heroCraft[id] ?? 0);
    const pres = 1 + 0.12 * (this.state.heroPrestige?.[id] ?? 0);
    return def.baseDps * level * milestoneMult(level) * (1 + 0.5 * gilds) * craft * pres;
  }

  heroClick(id: HeroId): number {
    const def = HEROES.find((h) => h.id === id)!;
    const level = this.state.heroLevel[id] ?? 0;
    if (level <= 0 || def.baseClick <= 0) return 0;
    if (this.isDown(id)) return 0;
    return def.baseClick * level * milestoneMult(level);
  }

  dps(): number {
    let sum = 0;
    for (const h of HEROES) sum += this.heroDps(h.id);
    return sum * this.dpsMult();
  }

  clickDamage(): number {
    let sum = 0;
    for (const h of HEROES) sum += this.heroClick(h.id);
    if (sum <= 0) sum = 3;
    return sum * this.clickMult() * this.dpsMult();
  }

  heroCost(id: HeroId, fromLevel: number, n: number): number {
    const def = HEROES.find((h) => h.id === id)!;
    const scale = def.costScale + 0.06;
    if (fromLevel === 0) {
      if (n <= 1) return def.baseCost;
      return def.baseCost + geometricSum(def.baseCost, scale, 1, n - 1);
    }
    return geometricSum(def.baseCost, scale, fromLevel, n);
  }

  bulkLevels(id: HeroId, bulk: Bulk): number {
    const level = this.state.heroLevel[id] ?? 0;
    const room = Math.max(0, HERO_LEVEL_CAP - level);
    if (bulk === -1) {
      let n = 0;
      let gold = this.state.gold;
      while (n < room) {
        const c = this.heroCost(id, level + n, 1);
        if (gold < c) break;
        gold -= c;
        n += 1;
        if (n > 400) break;
      }
      return Math.max(1, n);
    }
    return Math.min(room || 1, bulk);
  }

  hireOrUpgrade(id: HeroId, bulk: Bulk, quiet = false): boolean {
    const def = HEROES.find((h) => h.id === id);
    if (!def) return false;
    const level = this.state.heroLevel[id] ?? 0;
    if (this.state.maxFloor < def.unlockFloor && level <= 0) return false;
    if (def.acquire !== "gold" && level <= 0) return false;
    if (level >= HERO_LEVEL_CAP) return false;
    const n = this.bulkLevels(id, bulk);
    const cost = this.heroCost(id, level, Math.max(1, n));
    if (this.state.gold < cost) return false;
    this.state.gold -= cost;
    const next = Math.min(HERO_LEVEL_CAP, level + Math.max(1, n));
    this.state.heroLevel[id] = next;
    if (level <= 0) this.state.hires += 1;
    if (!quiet) {
      this.save();
      this.pingHeroes();
    }
    return true;
  }

  hireOrUpgradeAll(bulk: Bulk): boolean {
    let any = false;
    for (const h of HEROES) {
      if ((this.state.heroLevel[h.id] ?? 0) <= 0 && h.acquire === "gold") {
        if (this.hireOrUpgrade(h.id, 1, true)) any = true;
      }
    }
    for (const h of HEROES) {
      if ((this.state.heroLevel[h.id] ?? 0) > 0) {
        if (this.hireOrUpgrade(h.id, bulk, true)) any = true;
      }
    }
    if (any) {
      this.save();
      this.pingHeroes();
    }
    return any;
  }

  buyHeroGems(id: HeroId): boolean {
    const def = HEROES.find((h) => h.id === id);
    if (!def || def.acquire !== "gems") return false;
    if ((this.state.heroLevel[id] ?? 0) > 0) return false;
    if (this.state.gems < def.gemCost) return false;
    if (!this.spendGems(def.gemCost)) return false;
    this.state.heroLevel[id] = 1;
    this.state.hires += 1;
    this.save();
    this.pingHeroes();
    return true;
  }

  prestigeHero(id: HeroId): boolean {
    const level = this.state.heroLevel[id] ?? 0;
    if (level < HERO_LEVEL_CAP) return false;
    const p = this.state.heroPrestige?.[id] ?? 0;
    if (p >= HERO_PRESTIGE_MAX) return false;
    const cost = 40 + p * 20;
    if (this.state.souls < cost) return false;
    this.state.souls -= cost;
    if (!this.state.heroPrestige) this.state.heroPrestige = {} as GameState["heroPrestige"];
    this.state.heroPrestige[id] = p + 1;
    this.state.heroLevel[id] = 1;
    this.save();
    this.pingHeroes();
    return true;
  }

  gildCount(gilds: number, souls: number, bulk: Bulk): number {
    if (souls < 1 + gilds) return 0;
    if (bulk === -1) {
      const a = 2 * gilds + 1;
      const disc = a * a + 8 * souls;
      if (!Number.isFinite(disc)) return 20000;
      const n = Math.floor((-a + Math.sqrt(Math.max(0, disc))) / 2);
      return Math.max(0, Math.min(20000, n));
    }
    let n = 0;
    let left = souls;
    while (n < bulk) {
      const c = 1 + gilds + n;
      if (left < c) break;
      left -= c;
      n += 1;
    }
    return n;
  }

  gildSpend(gilds: number, n: number): number {
    if (n <= 0) return 0;
    return n * (1 + gilds) + (n * (n - 1)) / 2;
  }

  gildHero(id: HeroId, bulk: Bulk = 1): boolean {
    if ((this.state.heroLevel[id] ?? 0) <= 0) return false;
    const gilds = this.state.heroGild[id] ?? 0;
    const n = this.gildCount(gilds, this.state.souls, bulk);
    if (n <= 0) return false;
    const cost = this.gildSpend(gilds, n);
    if (this.state.souls < cost) return false;
    this.state.souls -= cost;
    this.state.heroGild[id] = gilds + n;
    this.save();
    this.pingHeroes();
    return true;
  }

  craftHero(id: HeroId): boolean {
    const rank = this.state.heroCraft[id] ?? 0;
    if (rank >= 8 || (this.state.heroLevel[id] ?? 0) <= 0) return false;
    const c = craftCost(rank);
    if ((this.state.ember ?? 0) < c.ember || (this.state.bone ?? 0) < c.bone) return false;
    this.state.ember -= c.ember;
    this.state.bone -= c.bone;
    this.state.heroCraft[id] = rank + 1;
    this.state.crafts = (this.state.crafts ?? 0) + 1;
    this.save();
    this.pingHeroes();
    return true;
  }

  craftHeroMax(id: HeroId): boolean {
    let n = 0;
    while (this.craftHero(id)) n += 1;
    return n > 0;
  }

  convertGems(): boolean {
    if (!this.spendGems(GEM_TO_EMBER)) return false;
    this.state.ember = (this.state.ember ?? 0) + EMBER_FROM_GEMS;
    this.save();
    return true;
  }

  convertAllGems(): boolean {
    const packs = Math.floor(this.state.gems / GEM_TO_EMBER);
    if (packs <= 0) return false;
    if (!this.spendGems(packs * GEM_TO_EMBER)) return false;
    this.state.ember = (this.state.ember ?? 0) + packs * EMBER_FROM_GEMS;
    this.save();
    return true;
  }

  buyGemPouch(): boolean {
    this.rollPouchDay();
    if ((this.state.pouchHits ?? 0) >= 1) return false;
    const cost = this.pouchCost();
    if (this.state.gold < cost) return false;
    this.state.gold -= cost;
    this.state.gems += 1;
    this.state.pouchHits = (this.state.pouchHits ?? 0) + 1;
    this.state.pouchesBought = (this.state.pouchesBought ?? 0) + 1;
    this.save();
    return true;
  }

  buyGemPouchMax(): boolean {
    return this.buyGemPouch();
  }

  pouchCost(): number {
    const floor = Math.max(1, this.state.maxFloor);
    const bought = Math.max(0, Math.floor(this.state.pouchesBought ?? 0));
    return Math.max(
      80000,
      Math.floor(50000 * Math.pow(2.6, bought) * Math.pow(1.55, (floor - 1) / 3)),
    );
  }

  pouchLeft(): number {
    this.rollPouchDay();
    return Math.max(0, 1 - (this.state.pouchHits ?? 0));
  }

  private rollPouchDay() {
    const d = dayKey();
    if (this.state.pouchDay !== d) {
      this.state.pouchDay = d;
      this.state.pouchHits = 0;
    }
  }

  buyRelic(id: RelicId): boolean {
    const def = RELICS.find((r) => r.id === id);
    if (!def) return false;
    const lv = this.state.relicLevel[id] ?? 0;
    if (lv >= RELIC_RANK_CAP) return false;
    const cost = Math.floor(def.baseCost * Math.pow(def.costScale, lv));
    if (this.state.souls < cost) return false;
    this.state.souls -= cost;
    this.state.relicLevel[id] = lv + 1;
    this.save();
    return true;
  }

  buyRelicMax(id: RelicId): boolean {
    const def = RELICS.find((r) => r.id === id);
    if (!def) return false;
    let n = 0;
    while (n < RELIC_RANK_CAP) {
      const lv = this.state.relicLevel[id] ?? 0;
      if (lv >= RELIC_RANK_CAP) break;
      const cost = Math.floor(def.baseCost * Math.pow(def.costScale, lv));
      if (!Number.isFinite(cost) || this.state.souls < cost) break;
      this.state.souls -= cost;
      this.state.relicLevel[id] = lv + 1;
      n += 1;
    }
    if (n > 0) this.save();
    return n > 0;
  }

  buyRelicAll(): boolean {
    let any = false;
    for (const r of RELICS) if (this.buyRelicMax(r.id)) any = true;
    return any;
  }

  buyScience(id: ScienceId): boolean {
    const def = SCIENCES.find((s) => s.id === id);
    if (!def) return false;
    const lv = this.state.scienceLevel[id] ?? 0;
    if (lv >= SCIENCE_RANK_CAP) return false;
    const cost = Math.floor(def.baseCost * Math.pow(def.costScale, lv));
    if (this.state.souls < cost) return false;
    this.state.souls -= cost;
    this.state.scienceLevel[id] = lv + 1;
    this.save();
    return true;
  }

  buyScienceMax(id: ScienceId): boolean {
    const def = SCIENCES.find((s) => s.id === id);
    if (!def) return false;
    let n = 0;
    while (n < SCIENCE_RANK_CAP) {
      const lv = this.state.scienceLevel[id] ?? 0;
      if (lv >= SCIENCE_RANK_CAP) break;
      const cost = Math.floor(def.baseCost * Math.pow(def.costScale, lv));
      if (!Number.isFinite(cost) || this.state.souls < cost) break;
      this.state.souls -= cost;
      this.state.scienceLevel[id] = lv + 1;
      n += 1;
    }
    if (n > 0) this.save();
    return n > 0;
  }

  buyScienceAll(): boolean {
    let any = false;
    for (const s of SCIENCES) if (this.buyScienceMax(s.id)) any = true;
    return any;
  }

  buyWeapon(id: WeaponId): boolean {
    const def = WEAPONS.find((w) => w.id === id);
    if (!def) return false;
    const lv = this.state.weaponLevel[id] ?? 0;
    if (lv >= WEAPON_RANK_CAP) return false;
    const goldNeed = rankCost(def.goldCost > 0 ? def.goldCost : 0, def.costScale, lv);
    if (goldNeed > 0 && this.state.gold >= goldNeed) {
      this.state.gold -= goldNeed;
      this.state.weaponLevel[id] = lv + 1;
      this.save();
      return true;
    }
    const gemNeed = gemRankCost(def.gemCost, lv);
    if (gemNeed > 0 && this.state.gems >= gemNeed && this.spendGems(gemNeed)) {
      this.state.weaponLevel[id] = lv + 1;
      this.save();
      return true;
    }
    if (def.goldCost <= 0) {
      const goldFallback = rankCost(Math.max(400, def.gemCost * 400), def.costScale, lv);
      if (goldFallback > 0 && this.state.gold >= goldFallback) {
        this.state.gold -= goldFallback;
        this.state.weaponLevel[id] = lv + 1;
        this.save();
        return true;
      }
    }
    return false;
  }

  buyWeaponMax(id: WeaponId): boolean {
    const def = WEAPONS.find((w) => w.id === id);
    if (!def) return false;
    let n = 0;
    while (n < WEAPON_RANK_CAP) {
      const lv = this.state.weaponLevel[id] ?? 0;
      if (lv >= WEAPON_RANK_CAP) break;
      const goldNeed = rankCost(def.goldCost > 0 ? def.goldCost : 0, def.costScale, lv);
      const gemNeed = gemRankCost(def.gemCost, lv);
      const goldFallback = def.goldCost <= 0 ? rankCost(Math.max(400, def.gemCost * 400), def.costScale, lv) : 0;
      if (goldNeed > 0 && this.state.gold >= goldNeed) {
        this.state.gold -= goldNeed;
        this.state.weaponLevel[id] = lv + 1;
      } else if (gemNeed > 0 && this.state.gems >= gemNeed && this.spendGems(gemNeed)) {
        this.state.weaponLevel[id] = lv + 1;
      } else if (goldFallback > 0 && this.state.gold >= goldFallback) {
        this.state.gold -= goldFallback;
        this.state.weaponLevel[id] = lv + 1;
      } else break;
      n += 1;
    }
    if (n > 0) this.save();
    return n > 0;
  }

  buyWeaponAll(): boolean {
    let any = false;
    for (const w of WEAPONS) if (this.buyWeaponMax(w.id)) any = true;
    return any;
  }

  buySocket(id: SocketId): boolean {
    const def = SOCKETS.find((s) => s.id === id);
    if (!def) return false;
    if (!this.state.socketsOwned[id]) {
      if (this.state.gems < def.gemCost) return false;
      if (!this.spendGems(def.gemCost)) return false;
      this.state.socketsOwned[id] = true;
    }
    this.state.socket = id;
    this.save();
    return true;
  }

  attachRune(heroId: HeroId, slot: number, runeId: string): boolean {
    if (!this.state.heroRunes[heroId]) this.state.heroRunes[heroId] = [null, null, null];
    const cap = runeSlots(this.state.heroLevel[heroId] ?? 0);
    if (slot < 0 || slot >= cap) return false;
    if (!this.state.runes.some((r) => r.id === runeId)) return false;
    for (const hid of HEROES.map((h) => h.id)) {
      const row = this.state.heroRunes[hid];
      if (!row) continue;
      if (row.includes(runeId)) return false;
    }
    this.state.heroRunes[heroId][slot] = runeId;
    this.save();
    return true;
  }

  detachRune(heroId: HeroId, slot: number): boolean {
    const row = this.state.heroRunes[heroId];
    if (!row || slot < 0 || slot >= row.length) return false;
    row[slot] = null;
    this.save();
    return true;
  }

  claimAllContracts(): boolean {
    const kinds = this.state.contracts.filter((c) => !c.claimed).map((c) => c.kind);
    let n = 0;
    for (const kind of kinds) if (this.claimContract(kind)) n += 1;
    return n > 0;
  }

  claimContract(kind: ContractKind): boolean {
    const c = this.state.contracts.find((x) => x.kind === kind);
    if (!c || c.claimed) return false;
    const progress = contractProgress(kind, this.progress());
    if (progress < c.goal) return false;
    c.claimed = true;
    this.state.gold += c.gold;
    this.state.lootGold += c.gold;
    this.state.souls += c.souls;
    this.state.chests += c.chests;
    this.state.influence += c.influence;
    if (this.state.contracts.every((x) => x.claimed)) {
      this.state.contracts = rollContracts(
        this.progress(),
        this.state.contracts.map((x) => x.kind),
      );
    }
    this.save();
    return true;
  }

  ensureContracts() {
    const p = this.progress();
    const list = this.state.contracts ?? [];
    if (!list.length) {
      this.state.contracts = rollContracts(p);
      return;
    }
    const ready = list.filter((c) => !c.claimed && contractProgress(c.kind, p) >= c.goal).length;
    if (ready === list.length && list.length > 0) {
      this.state.contracts = rollContracts(
        p,
        list.map((c) => c.kind),
      );
    }
  }

  openChest(): { gold: number; souls: number; influence: number } | null {
    return this.openChests(1);
  }

  openChests(count: number): { gold: number; souls: number; influence: number } | null {
    const n = Math.min(Math.max(0, Math.floor(count)), this.state.chests);
    if (n <= 0) return null;
    this.state.chests -= n;
    const f = Math.max(1, this.state.maxFloor);
    let gold = 0;
    let souls = 0;
    let influence = 0;
    for (let i = 0; i < n; i++) {
      gold += Math.floor((2 + Math.random() * 4) * f * this.goldMult() * 0.04);
      souls += Math.random() < 0.55 ? 1 + Math.floor(f / 25) : 0;
      influence += 4 + Math.floor(f / 8);
    }
    this.state.gold += gold;
    this.state.lootGold += gold;
    this.state.souls += souls;
    this.state.influence += influence;
    this.save();
    return { gold, souls, influence };
  }

  useSkill(id: SkillId, persist = true): boolean {
    const def = SKILLS.find((s) => s.id === id);
    if (!def) return false;
    if ((this.state.skillCd[id] ?? 0) > 0) return false;
    const haste = this.skillHaste();
    this.state.skillCd[id] = def.cooldown / (1 + haste);
    this.state.skillActive[id] = def.duration * this.skillDurationMult();
    this.emit({ type: "skill", id });
    if (id === "strike") this.applyDamage(this.clickDamage() * 8, "skill", undefined, true);
    if (id === "harvest") {
      const pct = this.monster.isBoss ? 0.08 : 0.22;
      const cut = this.monster.hp * pct;
      this.monster.hp = this.monster.isBoss
        ? Math.max(1, this.monster.hp - cut)
        : Math.max(0, this.monster.hp - cut);
      this.emit({ type: "hit", amount: cut, crit: false, source: "skill" });
      if (this.monster.hp <= 0) this.onKill();
    }
    if (persist) this.save();
    return true;
  }

  click() {
    this.state.clicks += 1;
    this.combo = Math.min(12, this.combo + 1);
    this.comboTimer = 1.8;
    const crit = Math.random() < this.critChance();
    if (crit) this.state.crits += 1;
    let dmg = this.clickDamage();
    if (crit) dmg *= this.critMult();
    this.applyDamage(dmg, "click", undefined, crit);
  }

  applyDamage(amount: number, source: "click" | "hero" | "skill", heroId?: HeroId, crit = false, silent = false) {
    if (amount <= 0 || this.monster.hp <= 0) return;
    let dmg = amount;
    if (this.monster.isBoss) dmg *= this.bossMult();
    this.monster.hp = Math.max(0, this.monster.hp - dmg);
    if (!silent) this.emit({ type: "hit", amount: dmg, crit, source, heroId });
    if (this.monster.hp <= 0) this.onKill();
  }

  onKill() {
    const floor = this.state.floor;
    const isBoss = this.monster.isBoss;
    const gold = this.monsterGold(floor, isBoss) * this.goldMult();
    this.state.gold += gold;
    this.state.lootGold += gold;
    this.state.kills += 1;
    this.state.climbKills = (this.state.climbKills ?? 0) + 1;
    if (!this.state.codex) this.state.codex = {};
    this.state.codex[this.monster.kind] = (this.state.codex[this.monster.kind] ?? 0) + 1;
    this.state.bpPts = (this.state.bpPts ?? 0) + (isBoss ? 6 : 1);
    if (isBoss) {
      this.state.bossKills += 1;
      this.state.gems += Math.random() < 0.012 ? 1 : 0;
    }
    const souls = Math.random() < (isBoss ? 0.55 : 0.12) ? 1 : 0;
    this.state.souls += souls;
    this.state.bone = (this.state.bone ?? 0) + (isBoss ? 3 : 1);
    const drops = dropFor(this.monster.kind, isBoss);
    if (!this.state.bag) this.state.bag = {} as GameState["bag"];
    for (const d of drops) this.state.bag[d.id] = (this.state.bag[d.id] ?? 0) + d.n;
    let pts = isBoss ? 4 : 1;
    if (this.state.siegeLair === "soulwell") pts = Math.floor(pts * 1.1);
    this.state.eventPts += pts;
    let siege = isBoss ? 3 : 0.4;
    if (this.state.siegeLair) this.state.siegePts += Math.max(1, Math.floor(siege * (1 + this.runeBonus("siege"))));
    const chest = isBoss && Math.random() < 0.22 + this.relicRank("coffer-key") * 0.03 + this.runeBonus("luck");
    if (chest) this.state.chests += 1;
    if (isBoss || Math.random() < 0.08) this.grantRune(mintRune(this.state.kills + floor, floor, isBoss));
    this.emit({ type: "kill", gold, souls, isBoss, kind: this.monster.kind, chest });
    if (this.state.farm && this.isBossFloor(floor)) {
      this.monster = this.makeMonster(floor, false);
      return;
    }
    if (isBoss || !this.isBossFloor(floor + 1) || this.state.farm) {
      const next = isBoss || !this.isBossFloor(floor + 1) ? floor + 1 : floor;
      const target = this.state.farm && this.isBossFloor(floor + 1) ? floor : next;
      this.state.floor = Math.max(1, target);
      this.state.maxFloor = Math.max(this.state.maxFloor, this.state.floor);
      const boss = this.isBossFloor(this.state.floor) && !this.state.farm;
      this.monster = this.makeMonster(this.state.floor, boss);
      if (boss) this.emit({ type: "bossStart" });
    } else {
      this.state.floor = floor + 1;
      this.state.maxFloor = Math.max(this.state.maxFloor, this.state.floor);
      this.monster = this.makeMonster(this.state.floor, true);
      this.emit({ type: "bossStart" });
    }
  }

  ritual(): boolean {
    if (!this.canRitual()) return false;
    const souls = this.ritualSouls();
    if (souls <= 0) return false;
    this.state.souls += souls;
    this.state.rituals += 1;
    this.state.gold = 0;
    this.state.climbKills = 0;
    this.state.ritualReadyAt = Date.now() + 24 * 60 * 60 * 1000;
    this.state.floor = this.startFloorAfterRitual();
    for (const h of HEROES) this.state.heroLevel[h.id] = h.id === "kael" ? 1 : 0;
    this.state.hires = 1;
    for (const s of SKILLS) {
      this.state.skillCd[s.id] = 0;
      this.state.skillActive[s.id] = 0;
    }
    this.combo = 0;
    this.state.contracts = rollContracts(this.progress());
    this.monster = this.makeMonster(this.state.floor, this.isBossFloor(this.state.floor) && !this.state.farm);
    this.emit({ type: "ritual", souls });
    this.save();
    this.pingHeroes();
    return true;
  }

  ritualSouls(): number {
    const f = this.state.floor;
    const raw = 2 + f * 0.35 + (this.state.climbKills ?? 0) * 0.002;
    return Math.max(0, Math.floor(raw * this.soulMult()));
  }

  canRitual(): boolean {
    if ((this.state.ritualReadyAt ?? 0) > Date.now()) return false;
    if (this.state.floor < 12) return false;
    if (this.state.floor <= this.startFloorAfterRitual()) return false;
    return this.ritualSouls() > 0;
  }

  ritualReadyIn(): number {
    return Math.max(0, (this.state.ritualReadyAt ?? 0) - Date.now());
  }

  setFarm(farm: boolean) {
    this.state.farm = farm;
    if (farm && this.monster.isBoss) {
      this.state.floor = Math.max(1, this.state.floor - 1);
      this.monster = this.makeMonster(this.state.floor, false);
    }
    this.save();
  }

  travelRealm(id: RealmId): boolean {
    const realm = REALMS.find((r) => r.id === id);
    if (!realm || this.state.maxFloor < realm.minFloor) return false;
    const dest = Math.min(Math.max(this.state.maxFloor, realm.minFloor), this.state.maxFloor);
    this.state.floor = Math.max(realm.minFloor, Math.min(dest, this.state.maxFloor));
    this.monster = this.makeMonster(this.state.floor, this.isBossFloor(this.state.floor) && !this.state.farm);
    this.save();
    return true;
  }

  occupyLair(id: RealmId): boolean {
    if (this.state.maxFloor < (REALMS.find((r) => r.id === id)?.minFloor ?? 999)) return false;
    if ((this.state.siegeReadyAt ?? 0) > Date.now()) return false;
    this.state.siegeLair = id;
    this.state.siegeReadyAt = Date.now() + SIEGE_TRAVEL * 3600 * 1000;
    this.save();
    return true;
  }

  fillRunes(): boolean {
    const used = new Set<string>();
    for (const h of HEROES) {
      const row = this.state.heroRunes[h.id] ?? [];
      for (const id of row) if (id) used.add(id);
    }
    const free = (this.state.runes ?? []).filter((r) => !used.has(r.id));
    let i = 0;
    let any = false;
    for (const h of HEROES) {
      if ((this.state.heroLevel[h.id] ?? 0) <= 0) continue;
      const cap = runeSlots(this.state.heroLevel[h.id] ?? 0);
      if (!this.state.heroRunes[h.id]) this.state.heroRunes[h.id] = [null, null, null];
      for (let s = 0; s < cap; s++) {
        if (this.state.heroRunes[h.id]![s]) continue;
        const rune = free[i++];
        if (!rune) break;
        this.state.heroRunes[h.id]![s] = rune.id;
        any = true;
      }
    }
    if (any) {
      this.save();
      this.pingHeroes();
    }
    return any;
  }

  buyEvent(id: string): boolean {
    const item = EVENT_SHOP.find((x) => x.id === id);
    if (!item || this.state.eventPts < item.cost) return false;
    this.state.eventPts -= item.cost;
    if (item.kind === "ember") this.state.ember = (this.state.ember ?? 0) + 8;
    if (item.kind === "rift") this.state.riftDust = (this.state.riftDust ?? 0) + 6;
    if (item.kind === "chest") this.state.chests += 1;
    if (item.kind === "rune") this.grantRune(mintRune(this.state.eventPts + 3, this.state.maxFloor, true));
    this.save();
    return true;
  }

  buyEventMax(id: string): boolean {
    let n = 0;
    while (n < 200 && this.buyEvent(id)) n += 1;
    return n > 0;
  }

  ensureEvent() {
    const day = dayKey();
    if (this.state.eventDay !== day) {
      this.state.eventDay = day;
      this.state.eventPts = 0;
    }
  }

  claimFounder(): boolean {
    if (this.state.founderClaimed && (this.state.founderKit ?? 0) >= 6) return false;
    this.state.founderClaimed = true;
    this.applyFounderMax();
    this.state.founderKit = 6;
    this.save();
    this.pingHeroes();
    return true;
  }

  ensureFounderKit() {
    if (!this.state.founderClaimed) return;
    const kit = this.state.founderKit ?? 0;
    if (kit >= 6) return;
    if (kit < 2) this.applyFounderMax();
    this.state.souls = Math.max(this.state.souls, 1e100);
    this.state.gems = Math.max(this.state.gems, 1e12);
    this.state.gold = Math.max(this.state.gold, 1e70);
    this.state.founderKit = 6;
    this.save();
    this.pingHeroes();
  }

  applyFounderMax() {
    this.state.gold = 1e70;
    this.state.souls = 1e100;
    this.state.gems = 1e12;
    this.state.influence = 50000;
    this.state.chests = 200;
    this.state.ember = 20000;
    this.state.bone = 20000;
    this.state.riftDust = 4000;
    this.state.eventPts = 20000;
    this.state.siegePts = 8000;
    this.state.arenaChest = 40;
    this.state.arenaCharges = ARENA_CHARGE_MAX;
    this.state.floor = Math.max(this.state.floor, 80);
    this.state.maxFloor = Math.max(this.state.maxFloor, 80);
    this.state.hires = HEROES.length;
    this.state.kills = Math.max(this.state.kills, 400);
    this.state.bossKills = Math.max(this.state.bossKills, 40);
    this.state.socket = "ruby";
    for (const h of HEROES) {
      this.state.heroLevel[h.id] = HERO_LEVEL_CAP;
      this.state.heroGild[h.id] = 8;
      this.state.heroCraft[h.id] = 8;
      if (!this.state.heroPrestige) this.state.heroPrestige = {} as GameState["heroPrestige"];
      this.state.heroPrestige[h.id] = HERO_PRESTIGE_MAX;
      if (!this.state.heroDown) this.state.heroDown = {} as GameState["heroDown"];
      this.state.heroDown[h.id] = 0;
    }
    for (const r of RELICS) this.state.relicLevel[r.id] = 15;
    for (const s of SCIENCES) this.state.scienceLevel[s.id] = 12;
    for (const w of WEAPONS) this.state.weaponLevel[w.id] = 10;
    for (const s of SOCKETS) this.state.socketsOwned[s.id] = true;
    const runes: import("./gear").OwnedRune[] = [];
    let n = 0;
    for (const stat of RUNE_STATS) {
      for (let k = 0; k < 9; k++) {
        const r = mintRune(12000 + n * 19, 400, true);
        r.stat = stat;
        const names = RUNE_NAMES[stat];
        r.name = names[names.length - 1] ?? names[0]!;
        r.rarity = 4;
        r.value = 0.28;
        runes.push(r);
        n += 1;
      }
    }
    this.state.runes = runes;
    this.state.firstBuy = true;
    this.state.looks = ["ash", "gilt", "rift", "tyrant", "blood"];
    this.state.frame = "tyrant";
    this.state.nameHue = "gilt";
    this.state.splash = "tyrant";
    this.state.shieldUntil = Math.max(this.state.shieldUntil ?? 0, Date.now() + SHIELD_MS);
    this.state.wellToken = Math.max(this.state.wellToken ?? 0, 20);
    this.state.wheelPot = Math.max(this.state.wheelPot ?? 0, 500);
    this.state.avatarHero = this.state.avatarHero || "kael";
    this.state.badges = { ...(this.state.badges ?? {}), patron: Date.now() };
    for (let i = 0; i < HEROES.length; i++) {
      const hid = HEROES[i]!.id;
      this.state.heroRunes[hid] = [
        runes[i * 3]?.id ?? null,
        runes[i * 3 + 1]?.id ?? null,
        runes[i * 3 + 2]?.id ?? null,
      ];
    }
    if (!this.state.bag) this.state.bag = {} as GameState["bag"];
    for (const l of LOOT) this.state.bag[l.id] = 200;
    this.state.bpPremium = true;
    this.state.bpPts = Math.max(this.state.bpPts ?? 0, 2000);
    this.state.vipSpent = Math.max(this.state.vipSpent ?? 0, 9000);
    this.monster = this.makeMonster(this.state.floor, this.isBossFloor(this.state.floor));
  }

  tryCraft(inputs: LootId[], catalyst: LootId | null): { ok: boolean; fail: boolean; name: string; blurb: string } {
    if (!this.state.bag) this.state.bag = {} as GameState["bag"];
    const need = [...inputs];
    if (catalyst) need.push(catalyst);
    for (const id of need) {
      if ((this.state.bag[id] ?? 0) < 1) return { ok: false, fail: false, name: "", blurb: "Missing parts." };
    }
    for (const id of need) this.state.bag[id] = Math.max(0, (this.state.bag[id] ?? 0) - 1);
    const recipe = matchRecipe(inputs, catalyst);
    const chance = craftChance(recipe, catalyst);
    if (Math.random() > chance) {
      this.state.crafts = (this.state.crafts ?? 0) + 1;
      this.save();
      return { ok: false, fail: true, name: recipe?.name ?? "Scrap", blurb: "The hammer rang false." };
    }
    this.state.crafts = (this.state.crafts ?? 0) + 1;
    if (!recipe) {
      this.state.ember += 4;
      this.save();
      return { ok: true, fail: false, name: "Ash", blurb: "A little ember from scrap." };
    }
    const r = recipe.result;
    if (r.kind === "item" && r.id) this.state.bag[r.id] = (this.state.bag[r.id] ?? 0) + (r.n ?? 1);
    if (r.kind === "ember") this.state.ember += r.n ?? 8;
    if (r.kind === "gems") this.state.gems += r.n ?? 1;
    if (r.kind === "souls") this.state.souls += r.n ?? 4;
    if (r.kind === "chest") this.state.chests += r.n ?? 1;
    if (r.kind === "rune") this.grantRune(mintRune(this.state.kills + 3, this.state.floor, true));
    if (r.kind === "craft") {
      const hired = HEROES.find((h) => (this.state.heroLevel[h.id] ?? 0) > 0);
      if (hired) this.state.heroCraft[hired.id] = Math.min(8, (this.state.heroCraft[hired.id] ?? 0) + 1);
    }
    this.save();
    return { ok: true, fail: false, name: recipe.name, blurb: recipe.blurb };
  }

  summon(hits: number): { name: string; kind: "hero" | "gems" } | null {
    const cost = hits >= 3 ? 0 : 40;
    const day = dayKey();
    const free = this.state.lastFreeWell !== day;
    const token = (this.state.wellToken ?? 0) > 0;
    if (!free && !token && cost > 0 && !this.spendGems(cost)) return null;
    if (token && !free) this.state.wellToken = Math.max(0, (this.state.wellToken ?? 0) - 1);
    if (free) this.state.lastFreeWell = day;
    const pool = HEROES.filter((h) => h.acquire === "summon" && (this.state.heroLevel[h.id] ?? 0) <= 0);
    if (!pool.length) {
      this.state.gems += 3;
      this.save();
      return { name: "3 gems (all summoned)", kind: "gems" };
    }
    this.state.pity = (this.state.pity ?? 0) + 1;
    const pity = this.state.pity >= PITY_AT || hits >= 3;
    let pick = pool[Math.floor(Math.random() * pool.length)]!;
    if (hits >= 2 && pool.length > 1) pick = pool[Math.floor(Math.random() * pool.length)]!;
    if (pity) pick = pool[0]!;
    this.state.pity = pity ? 0 : this.state.pity;
    this.state.heroLevel[pick.id] = 1;
    this.state.hires += 1;
    this.save();
    this.pingHeroes();
    this.emit({ type: "summon", name: pick.name });
    return { name: pick.name, kind: "hero" };
  }

  fightArena(): ArenaResult | null {
    if (this.state.maxFloor < 5) return null;
    if (this.state.arenaCharges < 1) return null;
    if (HEROES.every((h) => (this.state.heroLevel[h.id] ?? 0) <= 0 || this.isDown(h.id))) return null;
    this.state.arenaCharges -= 1;
    const yourPower = this.dps() + this.clickDamage() * 0.35;
    const theirPower = this.monsterHp(this.state.maxFloor, false) * (1.6 + Math.random() * 0.7);
    const win = yourPower * (0.85 + Math.random() * 0.3) >= theirPower;
    const foe = ARENA_FOES[Math.floor(Math.random() * ARENA_FOES.length)]!;
    const influence = win ? 10 + Math.floor(this.state.maxFloor / 4) : 2;
    const souls = win ? 2 : 0;
    const gold = win ? 0 : Math.floor(20 * this.state.maxFloor);
    const chests = win && Math.random() < 0.2 ? 1 : 0;
    this.state.influence += influence;
    this.state.souls += souls;
    this.state.gold += gold;
    this.state.chests += chests;
    if (win) this.state.arenaWins += 1;
    else this.state.arenaLosses += 1;
    const fallen: { id: HeroId; name: string }[] = [];
    if (!win) {
      const living = HEROES.filter((h) => (this.state.heroLevel[h.id] ?? 0) > 0 && !this.isDown(h.id));
      const victim = living[Math.floor(Math.random() * living.length)];
      if (victim) {
        if (!this.state.heroDown) this.state.heroDown = {} as GameState["heroDown"];
        this.state.heroDown[victim.id] = Date.now() + ARENA_REVIVE_MS;
        fallen.push({ id: victim.id, name: victim.name });
      }
    } else if (Math.random() < 0.22) this.grantRune(mintRune(this.state.arenaWins + 9, this.state.maxFloor, true));
    const result: ArenaResult = { win, foe, influence, souls, gold, chests, yourPower, theirPower, fallen };
    this.lastArena = result;
    this.emit({ type: "arena", win, foe });
    this.save();
    this.pingHeroes();
    return result;
  }

  fellInArena(): { id: HeroId; name: string }[] {
    return this.lastArena?.fallen ?? [];
  }

  reviveHero(id: HeroId): boolean {
    if (!this.isDown(id)) return false;
    if (this.state.gems < ARENA_REVIVE_GEMS) return false;
    if (!this.spendGems(ARENA_REVIVE_GEMS)) return false;
    this.state.heroDown[id] = 0;
    this.save();
    this.pingHeroes();
    return true;
  }

  reviveAll(): boolean {
    let n = 0;
    for (const h of HEROES) if (this.isDown(h.id) && this.reviveHero(h.id)) n += 1;
    return n > 0;
  }

  dumpBag(): Record<string, number> {
    return { ...(this.state.bag ?? {}) };
  }

  applyBag(bag: Record<string, number>) {
    if (!this.state.bag) this.state.bag = {} as GameState["bag"];
    for (const l of LOOT) {
      const n = Math.floor(Number(bag[l.id] ?? 0));
      if (n >= 0) this.state.bag[l.id] = n;
    }
    this.save();
  }

  applyLoot(loot: { gold?: number; souls?: number; influence?: number; chests?: number }) {
    if (loot.gold) this.state.gold += loot.gold;
    if (loot.souls) this.state.souls += loot.souls;
    if (loot.influence) this.state.influence += loot.influence;
    if (loot.chests) this.state.chests += loot.chests;
    this.save();
  }

  hydrate(next: GameState) {
    this.state = lockRoster(mergeProgress(this.state, next));
    this.combo = 0;
    this.lastArena = null;
    this.ensureContracts();
    this.ensureFounderKit();
    this.monster = this.makeMonster(this.state.floor, this.isBossFloor(this.state.floor) && !this.state.farm);
    this.save();
  }

  loadExact(next: GameState) {
    this.state = lockRoster(next);
    this.combo = 0;
    this.lastArena = null;
    this.monster = this.makeMonster(this.state.floor, this.isBossFloor(this.state.floor) && !this.state.farm);
    this.save();
  }

  spendGems(n: number): boolean {
    const cost = Math.max(0, Math.floor(n));
    if (cost <= 0) return true;
    if (this.state.gems < cost) return false;
    this.state.gems -= cost;
    this.state.vipSpent = (this.state.vipSpent ?? 0) + cost;
    return true;
  }

  grantGems(n: number) {
    if (n > 0) this.state.gems += n;
  }

  applyGift(g: { gold?: number; souls?: number; gems?: number; chests?: number }) {
    if ((g.gold ?? 0) > 0) this.state.gold += g.gold!;
    if ((g.souls ?? 0) > 0) this.state.souls += g.souls!;
    if ((g.gems ?? 0) > 0) this.state.gems += g.gems!;
    if ((g.chests ?? 0) > 0) this.state.chests += g.chests!;
    if ((g.gold ?? 0) + (g.souls ?? 0) + (g.gems ?? 0) + (g.chests ?? 0) > 0) this.save();
  }

  dailyReady(): boolean {
    return (this.state.loginClaimed ?? "") !== dayKey();
  }

  dailyReward(): number {
    const streak = Math.max(1, this.state.loginStreak ?? 1);
    const idx = (this.dailyReady() ? streak : Math.max(1, streak) - 1) % 7;
    return WEEKLY_LOGIN[idx] ?? 1;
  }

  claimDaily(): boolean {
    const today = dayKey();
    if (this.state.loginClaimed === today) return false;
    const yest = dayKey(Date.now() - 86400000);
    const streak = this.state.loginDay === yest ? (this.state.loginStreak ?? 0) + 1 : 1;
    this.state.loginStreak = streak;
    this.state.loginDay = today;
    this.state.loginClaimed = today;
    const gems = WEEKLY_LOGIN[(streak - 1) % 7] ?? 1;
    this.state.gems += gems;
    if (streak % 7 === 0) this.state.chests += 2;
    this.save();
    return true;
  }

  skipFloor(): boolean {
    if (this.monster.isBoss) return false;
    this.rollSkipDay();
    if ((this.state.skipHits ?? 0) >= 3) return false;
    const cost = this.skipCost();
    if (!this.spendGems(cost)) return false;
    this.state.skipHits = (this.state.skipHits ?? 0) + 1;
    this.state.floor += 1;
    this.monster = this.makeMonster(this.state.floor, this.isBossFloor(this.state.floor) && !this.state.farm);
    this.save();
    return true;
  }

  skipCost(): number {
    this.rollSkipDay();
    return Math.floor(25 * Math.pow(3, this.state.skipHits ?? 0));
  }

  skipLeft(): number {
    this.rollSkipDay();
    return Math.max(0, 3 - (this.state.skipHits ?? 0));
  }

  private rollSkipDay() {
    const d = dayKey();
    if (this.state.skipDay !== d) {
      this.state.skipDay = d;
      this.state.skipHits = 0;
    }
  }

  markTutorial() {
    if (!this.state.quests) this.state.quests = {};
    this.state.quests.tutorial = true;
    this.save();
  }

  claimChapter(): boolean {
    const next = nextChapter(this.state.chapterClaim ?? 0, this.state.maxFloor);
    if (!next) return false;
    this.state.chapterClaim = next;
    this.state.gold += Math.floor(80 * next * this.goldMult());
    this.state.chests += next % 50 === 0 ? 3 : 1;
    this.state.souls += Math.floor(next / 20);
    this.save();
    return true;
  }

  startExpedition(id: HeroId): boolean {
    if ((this.state.heroLevel[id] ?? 0) <= 0 || this.isDown(id)) return false;
    if (this.state.expeditionHero && (this.state.expeditionAt ?? 0) > Date.now()) return false;
    this.state.expeditionHero = id;
    this.state.expeditionAt = Date.now() + EXPEDITION_MS;
    this.save();
    this.pingHeroes();
    return true;
  }

  collectExpedition(): boolean {
    if (!this.state.expeditionHero) return false;
    if ((this.state.expeditionAt ?? 0) > Date.now()) return false;
    const lv = this.state.heroLevel[this.state.expeditionHero] ?? 1;
    const gold = Math.floor((3 + lv * 0.4) * this.state.maxFloor * 0.05 * this.goldMult());
    this.state.gold += gold;
    this.state.lootGold += gold;
    this.state.souls += 1;
    if (Math.random() < 0.35) this.state.chests += 1;
    this.state.expeditionHero = null;
    this.state.expeditionAt = 0;
    this.save();
    this.pingHeroes();
    return true;
  }

  buyMarket(id: string): boolean {
    const day = dayKey();
    if (this.state.marketDay !== day) {
      this.state.marketDay = day;
      this.state.marketBought = [];
    }
    if ((this.state.marketBought ?? []).includes(id)) return false;
    const deal = marketForDay(day).find((d) => d.id === id);
    if (!deal) return false;
    if (deal.gold && this.state.gold < deal.gold) return false;
    if (deal.gems && !this.spendGems(deal.gems)) return false;
    if (deal.gold) this.state.gold -= deal.gold;
    if (deal.giveGold) this.state.gold += deal.giveGold;
    if (deal.giveGems) this.state.gems += deal.giveGems;
    if (deal.giveChests) this.state.chests += deal.giveChests;
    if (deal.giveEmber) this.state.ember = (this.state.ember ?? 0) + deal.giveEmber;
    if (deal.giveSouls) this.state.souls += deal.giveSouls;
    this.state.marketBought = [...(this.state.marketBought ?? []), id];
    this.save();
    return true;
  }

  setTitle(id: string): boolean {
    const def = TITLES.find((t) => t.id === id);
    if (!def) return false;
    if (def.badge && !this.state.badges?.[def.badge]) return false;
    this.state.title = def.id;
    this.save();
    return true;
  }

  setAvatar(id: HeroId): boolean {
    if ((this.state.heroLevel[id] ?? 0) <= 0 && !this.state.founderClaimed) return false;
    this.state.avatarHero = id;
    this.save();
    return true;
  }

  setClanBuff(dps: number, gold: number, souls: number) {
    this.clanDps = Math.max(0, dps);
    this.clanGold = Math.max(0, gold);
    this.clanSouls = Math.max(0, souls);
  }

  setAutoSkill(on: boolean) {
    this.state.autoSkill = on;
    this.save();
  }

  claimMonth(): boolean {
    const key = monthKey();
    const day = monthDay();
    if (this.state.monthKey !== key) {
      this.state.monthKey = key;
      this.state.monthHits = [];
    }
    if ((this.state.monthHits ?? []).includes(day)) return false;
    this.state.monthHits = [...(this.state.monthHits ?? []), day];
    const r = monthReward(day);
    this.state.gems += r.gems;
    this.state.chests += r.chests;
    if ((this.state.cardUntil ?? 0) > Date.now()) this.state.gems += 1;
    this.save();
    return true;
  }

  claimWatch(): boolean {
    const day = dayKey();
    if (this.state.watchDay === day) return false;
    this.state.watchDay = day;
    this.state.gems += WATCH_GEMS;
    this.save();
    return true;
  }

  decayWheel() {
    const now = Date.now();
    if ((this.state.wheelFreeAt ?? 0) > now + 60_000) this.state.wheelFreeAt = now;
    if ((this.state.wheelBoostAt ?? 0) > now + 60_000) this.state.wheelBoostAt = now;
    if (!(this.state.wheelFreeAt > 0) && this.state.wheelDay === dayKey()) {
      this.state.wheelFreeAt = now;
    }
    const boost = this.state.wheelBoostAt ?? 0;
    if (boost > 0 && now - boost >= WHEEL_DAY_MS) {
      this.state.wheelChance = WHEEL_JACKPOT_CHANCE;
      this.state.wheelBoostAt = 0;
    }
    this.state.wheelChance = clampChance(this.state.wheelChance ?? WHEEL_JACKPOT_CHANCE);
  }

  spinWheel(paid = false): WheelSlice | null {
    this.decayWheel();
    const now = Date.now();
    if (!paid) {
      if ((this.state.wheelFreeAt ?? 0) + WHEEL_DAY_MS > now && (this.state.wheelFreeAt ?? 0) > 0) return null;
      this.state.wheelFreeAt = now;
      this.state.wheelDay = dayKey();
    } else {
      if (!this.spendGems(WHEEL_SPIN_GEMS)) return null;
      this.state.wheelPot = (this.state.wheelPot ?? WHEEL_POT_START) + Math.floor(WHEEL_SPIN_GEMS * 0.8);
      this.state.wheelChance = clampChance((this.state.wheelChance ?? WHEEL_JACKPOT_CHANCE) + WHEEL_CHANCE_STEP);
      this.state.wheelBoostAt = now;
      this.save();
    }
    const hit = rollWheel(this.state.wheelChance ?? WHEEL_JACKPOT_CHANCE);
    if (hit.jackpot) {
      const pot = Math.max(WHEEL_POT_START, Math.floor(this.state.wheelPot ?? WHEEL_POT_START));
      this.state.gems += pot;
      this.state.wheelPot = WHEEL_POT_START;
      this.state.wheelChance = WHEEL_JACKPOT_CHANCE;
      this.state.wheelBoostAt = now;
      this.save();
      return { ...hit, name: `${pot} gems`, gems: pot };
    }
    if (hit.gems) this.state.gems += hit.gems;
    if (hit.gold) this.state.gold += hit.gold * this.goldMult();
    if (hit.souls) this.state.souls += hit.souls;
    if (hit.chests) this.state.chests += hit.chests;
    this.save();
    return hit;
  }

  claimFirstBlood(): boolean {
    if (this.state.firstBuy) return false;
    this.state.firstBuy = true;
    this.state.gems += FIRST_PACK_GEMS;
    this.state.vipSpent = (this.state.vipSpent ?? 0) + 1;
    this.state.badges = { ...(this.state.badges ?? {}), patron: Date.now() };
    const looks = ownedLooks(this.state.looks, true, this.state.founderClaimed);
    this.state.looks = Array.from(looks);
    this.state.frame = "blood";
    this.state.nameHue = "gilt";
    this.state.splash = "blood";
    if (!this.state.title) this.state.title = "patron";
    this.save();
    return true;
  }

  buyLook(kind: "frame" | "name" | "splash", id: LookId): boolean {
    const list = kind === "frame" ? FRAMES : kind === "name" ? NAME_HUES : SPLASHES;
    const def = list.find((l) => l.id === id);
    if (!def) return false;
    const owned = ownedLooks(this.state.looks, this.state.firstBuy, this.state.founderClaimed);
    if (!owned.has(id)) {
      if (def.pack && !this.state.firstBuy) return false;
      if (def.gems > 0 && !this.spendGems(def.gems)) return false;
      owned.add(id);
      this.state.looks = Array.from(owned);
    }
    if (kind === "frame") this.state.frame = id;
    if (kind === "name") this.state.nameHue = id;
    if (kind === "splash") this.state.splash = id;
    this.save();
    return true;
  }

  buyShield(): boolean {
    if (!this.spendGems(SHIELD_GEMS)) return false;
    this.addShield(SHIELD_MS);
    this.save();
    return true;
  }

  addShield(ms: number) {
    const now = Date.now();
    this.state.shieldUntil = Math.max(this.state.shieldUntil ?? 0, now) + ms;
  }

  claimWellHymn(skip: boolean): boolean {
    const day = dayKey();
    if (!skip && this.state.wellHymnDay === day) return false;
    if (skip && !this.spendGems(HYMN_SKIP_GEMS)) return false;
    if (!skip) this.state.wellHymnDay = day;
    this.state.wellToken = (this.state.wellToken ?? 0) + 1;
    this.save();
    return true;
  }

  claimShieldHymn(skip: boolean): boolean {
    const day = dayKey();
    if (!skip && this.state.shieldHymnDay === day) return false;
    if (skip && !this.spendGems(HYMN_SKIP_GEMS)) return false;
    if (!skip) this.state.shieldHymnDay = day;
    this.addShield(HYMN_SHIELD_MS);
    this.save();
    return true;
  }

  takePlunder(gold: number, souls: number): boolean {
    const wait = RAID_CD_MS - (Date.now() - (this.state.lastPlunderAt ?? 0));
    if (wait > 0) return false;
    this.state.lastPlunderAt = Date.now();
    this.state.gold += Math.max(0, gold);
    this.state.souls += Math.max(0, souls);
    this.addShield(30 * 60 * 1000);
    this.save();
    return true;
  }

  buyPremium(): boolean {
    if (this.state.bpPremium) return false;
    if (!this.spendGems(BP_PREMIUM)) return false;
    this.state.bpPremium = true;
    this.save();
    return true;
  }

  claimPass(): boolean {
    const rank = bpRank(this.state.bpPts ?? 0);
    let got = false;
    while ((this.state.bpFree ?? 0) < rank) {
      this.state.bpFree = (this.state.bpFree ?? 0) + 1;
      const loot = bpFreeLoot(this.state.bpFree);
      this.state.gold += loot.gold;
      this.state.chests += loot.chests;
      got = true;
    }
    if (this.state.bpPremium) {
      while ((this.state.bpPrem ?? 0) < rank) {
        this.state.bpPrem = (this.state.bpPrem ?? 0) + 1;
        const loot = bpPremLoot(this.state.bpPrem);
        this.state.gems += loot.gems;
        this.state.souls += loot.souls;
        got = true;
      }
    }
    if (got) this.save();
    return got;
  }

  buyCard(): boolean {
    if ((this.state.cardUntil ?? 0) > Date.now() + CARD_MS * 0.5) return false;
    if (!this.spendGems(CARD_GEMS)) return false;
    this.state.cardUntil = Math.max(Date.now(), this.state.cardUntil ?? 0) + CARD_MS;
    this.save();
    return true;
  }

  jumpMax(): boolean {
    if (this.state.floor >= this.state.maxFloor) return false;
    this.state.floor = this.state.maxFloor;
    this.monster = this.makeMonster(this.state.floor, this.isBossFloor(this.state.floor) && !this.state.farm);
    this.save();
    return true;
  }

  reset() {
    this.state = defaultState();
    this.combo = 0;
    this.lastArena = null;
    this.monster = this.makeMonster(1, false);
    this.save();
  }

  save() {
    persistState(this.state);
  }

  pingHeroes() {
    this.save();
    if (typeof window !== "undefined") window.dispatchEvent(new Event("soulrift-heroes"));
  }

  biome() {
    return biomeFor(this.state.floor);
  }

  private daysPlayed(): number {
    return Math.max(1, Math.floor((Date.now() - (this.state.startedAt || Date.now())) / 86400000) + 1);
  }

  private badgeSnap() {
    if (!this.state.badges) this.state.badges = {};
    const days = this.daysPlayed();
    const hired = HEROES.filter((h) => (this.state.heroLevel[h.id] ?? 0) > 0).length;
    const have: Record<string, boolean> = {
      blood: this.state.kills >= 1,
      sweeper: this.state.kills >= 100,
      tide: this.state.kills >= 1000,
      dawn: days >= 2,
      week: days >= 7,
      hammer: (this.state.crafts ?? 0) >= 10,
      forge: (this.state.crafts ?? 0) >= 50,
      depth: this.state.maxFloor >= 10,
      vault: this.state.maxFloor >= 50,
      warband: hired >= 5,
      pit: this.state.arenaWins >= 1,
      tyrant: this.state.bossKills >= 10,
    };
    const now = Date.now();
    for (const [id, on] of Object.entries(have)) {
      if (on && !this.state.badges[id]) this.state.badges[id] = now;
    }
    return ACHIEVEMENTS.map((a) => ({
      id: a.id,
      name: a.name,
      blurb: a.blurb,
      hint: a.hint,
      on: Boolean(this.state.badges[a.id]),
      at: this.state.badges[a.id] ?? 0,
    }));
  }

  snapshot(bulk: Bulk): Snapshot {
    this.ensureEvent();
    this.ensureContracts();
    const p = this.progress();
    const haste = this.skillHaste();
    const durM = this.skillDurationMult();
    const event = eventForDay(this.state.eventDay || dayKey());
    const realm = REALMS.find((r) => r.biome === this.biome()) ?? REALMS[0]!;
    const heroes = HEROES.map((h) => {
      const level = this.state.heroLevel[h.id] ?? 0;
      const n = this.bulkLevels(h.id, bulk);
      const cost = this.heroCost(h.id, level, Math.max(1, n));
      const gilds = this.state.heroGild[h.id] ?? 0;
      const gildN = this.gildCount(gilds, this.state.souls, bulk);
      const gildCost = gildN > 0 ? this.gildSpend(gilds, gildN) : 1 + gilds;
      const craft = this.state.heroCraft[h.id] ?? 0;
      const cc = craftCost(craft);
      const prestige = this.state.heroPrestige?.[h.id] ?? 0;
      const downUntil = this.state.heroDown?.[h.id] ?? 0;
      const down = downUntil > Date.now();
      const slots = runeSlots(level);
      const attachedIds = this.state.heroRunes[h.id] ?? [];
      const attached = [0, 1, 2].slice(0, Math.max(3, slots)).map((i) => this.state.runes.find((r) => r.id === attachedIds[i]) ?? null);
      const legend = LEGENDS[h.id];
      const craftDef = HERO_CRAFTS[h.id];
      return {
        id: h.id,
        level,
        gilds,
        dps: this.heroDps(h.id),
        click: this.heroClick(h.id),
        cost,
        levels: n,
        canAfford: this.state.gold >= cost && level < HERO_LEVEL_CAP && (level > 0 || (h.acquire === "gold" && this.state.maxFloor >= h.unlockFloor)),
        unlocked: level > 0 || (h.acquire === "gold" && this.state.maxFloor >= h.unlockFloor),
        gildCost,
        gildCount: Math.max(1, gildN),
        canGild: gildN > 0,
        acquire: h.acquire,
        gemCost: h.gemCost,
        canGemHire: h.acquire === "gems" && level <= 0 && this.state.gems >= h.gemCost,
        stars: heroStars(h, gilds),
        legendName: legend?.name ?? "",
        legendBlurb: legend?.blurb ?? "",
        legendOn: this.legendOn(h.id),
        craftRank: craft,
        craftName: craftDef?.name ?? "Arm",
        craftEmber: cc.ember,
        craftBone: cc.bone,
        canCraft: level > 0 && craft < 8 && (this.state.ember ?? 0) >= cc.ember && (this.state.bone ?? 0) >= cc.bone,
        runeSlots: slots,
        attached,
        prestige,
        prestigeMax: HERO_PRESTIGE_MAX,
        prestigeCost: 40 + prestige * 20,
        canPrestige: level >= HERO_LEVEL_CAP && prestige < HERO_PRESTIGE_MAX && this.state.souls >= 40 + prestige * 20,
        atCap: level >= HERO_LEVEL_CAP,
        down,
        downLeft: Math.max(0, downUntil - Date.now()),
        reviveGems: ARENA_REVIVE_GEMS,
        canRevive: down && this.state.gems >= ARENA_REVIVE_GEMS,
      };
    });
    const relics = RELICS.map((r) => {
      const level = this.state.relicLevel[r.id] ?? 0;
      const cost = Math.floor(r.baseCost * Math.pow(r.costScale, level));
      return { id: r.id, level, cost, canAfford: level < RELIC_RANK_CAP && this.state.souls >= cost };
    });
    const sciences = SCIENCES.map((s) => {
      const level = this.state.scienceLevel[s.id] ?? 0;
      const cost = Math.floor(s.baseCost * Math.pow(s.costScale, level));
      return { id: s.id, level, cost, canAfford: level < SCIENCE_RANK_CAP && this.state.souls >= cost };
    });
    const weapons = WEAPONS.map((w) => {
      const level = this.state.weaponLevel[w.id] ?? 0;
      const cost = rankCost(w.goldCost > 0 ? w.goldCost : Math.max(400, w.gemCost * 400), w.costScale, level);
      const gemCost = gemRankCost(w.gemCost, level);
      return {
        id: w.id,
        level,
        cost,
        gemCost,
        canAfford: level < WEAPON_RANK_CAP && cost > 0 && this.state.gold >= cost,
        canGem: level < WEAPON_RANK_CAP && gemCost > 0 && this.state.gems >= gemCost,
      };
    });
    const sockets = SOCKETS.map((s) => ({
      id: s.id,
      owned: Boolean(this.state.socketsOwned[s.id]),
      equipped: this.state.socket === s.id,
      gemCost: s.gemCost,
      canAfford: this.state.socketsOwned[s.id] || this.state.gems >= s.gemCost,
    }));
    const skills = SKILLS.map((s) => {
      const maxCd = s.cooldown / (1 + haste);
      return {
        id: s.id,
        cd: this.state.skillCd[s.id] ?? 0,
        maxCd,
        active: this.state.skillActive[s.id] ?? 0,
        maxActive: s.duration * durM,
        ready: (this.state.skillCd[s.id] ?? 0) <= 0,
      };
    });
    const contracts = this.state.contracts.map((c) => {
      const progress = contractProgress(c.kind, p);
      return { ...c, progress, ready: !c.claimed && progress >= c.goal };
    });
    return {
      gold: this.state.gold,
      souls: this.state.souls,
      gems: this.state.gems,
      influence: this.state.influence,
      chests: this.state.chests,
      floor: this.state.floor,
      maxFloor: this.state.maxFloor,
      wave: this.monster.isBoss ? 10 : ((this.state.floor - 1) % 10) + 1,
      dps: this.dps(),
      clickDmg: this.clickDamage(),
      monsterHp: this.monster.hp,
      monsterMax: this.monster.max,
      monsterName: this.monster.name,
      monsterKind: this.monster.kind,
      isBoss: this.monster.isBoss,
      bossTime: this.monster.timer,
      bossMaxTime: this.monster.timerMax,
      farm: this.state.farm,
      combo: this.combo,
      heroes,
      relics,
      sciences,
      weapons,
      sockets,
      skills,
      contracts,
      ritualSouls: this.ritualSouls(),
      ritualUnlocked: this.state.maxFloor >= 12,
      ritualReadyIn: this.ritualReadyIn(),
      canRitual: this.canRitual(),
      startFloor: this.startFloorAfterRitual(),
      kills: this.state.kills,
      rituals: this.state.rituals,
      goldMult: this.goldMult(),
      dpsMult: this.dpsMult(),
      arenaCharges: this.state.arenaCharges,
      arenaChargeMax: ARENA_CHARGE_MAX,
      arenaRegen: this.state.arenaRegen,
      arenaWins: this.state.arenaWins,
      arenaUnlocked: this.state.maxFloor >= 5,
      critChance: this.critChance(),
      founderClaimed: this.state.founderClaimed,
      freeWell: this.state.lastFreeWell !== dayKey(),
      summonCost: 40,
      pouchCost: this.pouchCost(),
      canPouch: this.pouchLeft() > 0 && this.state.gold >= this.pouchCost(),
      pouchLeft: this.pouchLeft(),
      skipCost: this.skipCost(),
      skipLeft: this.skipLeft(),
      socket: this.state.socket,
      realm: realm.id,
      realmName: realm.name,
      ember: this.state.ember ?? 0,
      bone: this.state.bone ?? 0,
      riftDust: this.state.riftDust ?? 0,
      runeBag: this.state.runes ?? [],
      eventId: event.id,
      eventName: event.name,
      eventBlurb: event.blurb,
      eventPts: this.state.eventPts ?? 0,
      siegeLair: this.state.siegeLair,
      siegePts: this.state.siegePts ?? 0,
      siegeReadyIn: Math.max(0, (this.state.siegeReadyAt ?? 0) - Date.now()),
      arenaChest: this.state.arenaChest ?? 0,
      bag: LOOT.map((l) => ({
        id: l.id,
        name: l.name,
        kind: l.kind,
        count: Number(this.state.bag?.[l.id] ?? 0),
      })),
      daysPlayed: this.daysPlayed(),
      crafts: this.state.crafts ?? 0,
      bossKills: this.state.bossKills,
      hires: this.state.hires,
      badges: this.badgeSnap(),
      dailyReady: this.dailyReady(),
      dailyStreak: this.state.loginStreak ?? 0,
      dailyGems: this.dailyReward(),
      dailyIndex: Math.max(0, ((this.state.loginStreak ?? 1) - 1) % 7),
      chapterFloor: nextChapter(this.state.chapterClaim ?? 0, this.state.maxFloor),
      chapterGold: (() => {
        const n = nextChapter(this.state.chapterClaim ?? 0, this.state.maxFloor);
        return n ? Math.floor(80 * n * this.goldMult()) : 0;
      })(),
      pity: this.state.pity ?? 0,
      pityAt: PITY_AT,
      expeditionHero: this.state.expeditionHero,
      expeditionName: HEROES.find((h) => h.id === this.state.expeditionHero)?.name ?? "",
      expeditionLeft: Math.max(0, (this.state.expeditionAt ?? 0) - Date.now()),
      expeditionReady: Boolean(this.state.expeditionHero) && (this.state.expeditionAt ?? 0) <= Date.now(),
      market: (() => {
        const day = dayKey();
        if (this.state.marketDay !== day) {
          this.state.marketDay = day;
          this.state.marketBought = [];
        }
        const bought = this.state.marketBought ?? [];
        return marketForDay(day).map((d) => ({
          id: d.id,
          name: d.name,
          blurb: d.blurb,
          gold: d.gold ?? 0,
          gems: d.gems ?? 0,
          bought: bought.includes(d.id),
        }));
      })(),
      vip: vipRank(this.state.vipSpent ?? 0),
      vipSpent: this.state.vipSpent ?? 0,
      vipNext: vipNext(this.state.vipSpent ?? 0),
      title: TITLES.find((t) => t.id === (this.state.title ?? ""))?.name ?? "Crusader",
      titles: TITLES.map((t) => ({
        id: t.id,
        name: t.name,
        on: !t.badge || Boolean(this.state.badges?.[t.badge]) || (t.id === "patron" && this.state.firstBuy),
      })),
      huntPing:
        this.dailyReady() ||
        this.state.contracts.some((c) => !c.claimed && contractProgress(c.kind, p) >= c.goal) ||
        Boolean(nextChapter(this.state.chapterClaim ?? 0, this.state.maxFloor)) ||
        (Boolean(this.state.expeditionHero) && (this.state.expeditionAt ?? 0) <= Date.now()) ||
        !(this.state.monthHits ?? []).includes(monthDay()) ||
        this.state.watchDay !== dayKey() ||
        (this.state.wheelFreeAt ?? 0) + WHEEL_DAY_MS <= Date.now() ||
        !(this.state.shieldUntil > Date.now()) ||
        bpRank(this.state.bpPts ?? 0) > (this.state.bpFree ?? 0),
      autoSkill: Boolean(this.state.autoSkill),
      monthDay: monthDay(),
      monthHits: this.state.monthHits ?? [],
      monthGems: monthReward(monthDay()).gems,
      monthReady: (this.state.monthKey !== monthKey() || !(this.state.monthHits ?? []).includes(monthDay())),
      watchReady: this.state.watchDay !== dayKey(),
      wheelReady: (() => {
        this.decayWheel();
        const at = this.state.wheelFreeAt ?? 0;
        return at <= 0 || Date.now() - at >= WHEEL_DAY_MS;
      })(),
      wheelPot: Math.max(WHEEL_POT_START, Math.floor(this.state.wheelPot ?? WHEEL_POT_START)),
      wheelCost: WHEEL_SPIN_GEMS,
      wheelChance: this.state.wheelChance ?? WHEEL_JACKPOT_CHANCE,
      wheelFreeIn: Math.max(0, (this.state.wheelFreeAt ?? 0) + WHEEL_DAY_MS - Date.now()),
      wheelDecayIn: (this.state.wheelBoostAt ?? 0) > 0
        ? Math.max(0, (this.state.wheelBoostAt ?? 0) + WHEEL_DAY_MS - Date.now())
        : 0,
      firstBuy: Boolean(this.state.firstBuy),
      firstPackGems: FIRST_PACK_GEMS,
      looks: Array.from(ownedLooks(this.state.looks, this.state.firstBuy, this.state.founderClaimed)),
      frame: this.state.frame || "ash",
      nameHue: this.state.nameHue || "ash",
      splash: this.state.splash || "ash",
      shieldLeft: Math.max(0, (this.state.shieldUntil ?? 0) - Date.now()),
      shieldOn: (this.state.shieldUntil ?? 0) > Date.now(),
      wellToken: this.state.wellToken ?? 0,
      wellHymnReady: this.state.wellHymnDay !== dayKey(),
      shieldHymnReady: this.state.shieldHymnDay !== dayKey(),
      playLeft: Math.max(0, PLAY_SHIELD_MS - (this.state.playMs ?? 0)),
      plunderReadyIn: Math.max(0, RAID_CD_MS - (Date.now() - (this.state.lastPlunderAt ?? 0))),
      avatarHero: this.state.avatarHero || "kael",
      bpPts: this.state.bpPts ?? 0,
      bpRank: bpRank(this.state.bpPts ?? 0),
      bpMax: BP_MAX,
      bpPremium: Boolean(this.state.bpPremium),
      bpNeed: BP_STEP - ((this.state.bpPts ?? 0) % BP_STEP),
      bpFreeReady: Math.max(0, bpRank(this.state.bpPts ?? 0) - (this.state.bpFree ?? 0)),
      bpPremReady: this.state.bpPremium ? Math.max(0, bpRank(this.state.bpPts ?? 0) - (this.state.bpPrem ?? 0)) : 0,
      cardLeft: Math.max(0, (this.state.cardUntil ?? 0) - Date.now()),
      cardOn: (this.state.cardUntil ?? 0) > Date.now(),
      cardCost: CARD_GEMS,
      codex: Object.entries(this.state.codex ?? {}).map(([id, n]) => ({ id, n: Number(n) })),
      codexSeen: Object.keys(this.state.codex ?? {}).length,
    };
  }

  step(dt: number) {
    this.banishCoil();
    const t = Math.min(dt, 0.1);
    this.comboTimer -= t;
    if (this.comboTimer <= 0) this.combo = 0;
    for (const s of SKILLS) {
      if (this.state.skillCd[s.id] > 0) this.state.skillCd[s.id] = Math.max(0, this.state.skillCd[s.id] - t);
      if (this.state.skillActive[s.id] > 0) this.state.skillActive[s.id] = Math.max(0, this.state.skillActive[s.id] - t);
    }
    if (this.state.autoSkill) {
      for (const s of SKILLS) {
        if ((this.state.skillCd[s.id] ?? 0) <= 0) this.useSkill(s.id, false);
      }
    }
    if (this.state.arenaCharges < ARENA_CHARGE_MAX) {
      this.state.arenaRegen += t;
      if (this.state.arenaRegen >= ARENA_CHARGE_TIME) {
        this.state.arenaRegen = 0;
        this.state.arenaCharges += 1;
      }
    } else this.state.arenaRegen = 0;
    if (this.monster.isBoss) {
      this.monster.timer -= t;
      if (this.monster.timer <= 0 && this.monster.hp > 0) {
        this.emit({ type: "bossFail" });
        this.state.floor = Math.max(1, this.state.floor - 1);
        this.monster = this.makeMonster(this.state.floor, false);
      }
    }
    const dps = this.dps();
    if (dps > 0 && this.monster.hp > 0) this.applyDamage(dps * t, "hero", undefined, false, true);
    for (const h of HEROES) {
      const level = this.state.heroLevel[h.id] ?? 0;
      if (level <= 0) continue;
      this.attackCd[h.id] -= t;
      if (this.attackCd[h.id] <= 0) {
        this.attackCd[h.id] = 0.85 + (h.id.charCodeAt(0) % 5) * 0.12;
        this.emit({ type: "heroAttack", heroId: h.id });
      }
    }
    this.saveAcc += t;
    this.state.playMs = (this.state.playMs ?? 0) + t * 1000;
    if ((this.state.playMs ?? 0) >= PLAY_SHIELD_MS) {
      this.state.playMs -= PLAY_SHIELD_MS;
      this.addShield(SHIELD_MS);
    }
    if (this.saveAcc >= 4) {
      this.saveAcc = 0;
      this.state.lastHuntAt = Date.now();
      this.save();
    }
  }

  catchUp(seconds: number): number {
    const t = Math.min(Math.max(0, seconds), 8 * 3600);
    if (t < 2) {
      this.state.lastHuntAt = Date.now();
      return 0;
    }
    const gold0 = this.state.gold;
    const dps = this.dps();
    if (dps <= 0) {
      this.state.lastHuntAt = Date.now();
      return 0;
    }
    if (this.monster.isBoss) {
      const extra = dps * 0.12 * t * this.goldMult() * this.offlineMult();
      this.state.gold += extra;
      this.state.lootGold += extra;
      this.state.lastHuntAt = Date.now();
      this.save();
      this.drain();
      return extra;
    }
    let left = t;
    let guard = 0;
    while (left > 0.05 && guard++ < 800) {
      if (this.monster.isBoss) break;
      const hp = Math.max(1, this.monster.hp);
      const tta = hp / dps;
      if (tta > left) {
        this.applyDamage(dps * left, "hero", undefined, false, true);
        left = 0;
        break;
      }
      this.applyDamage(hp, "hero", undefined, false, true);
      left -= Math.max(0.05, tta);
    }
    this.drain();
    this.state.lastHuntAt = Date.now();
    this.save();
    return Math.max(0, this.state.gold - gold0);
  }
}

export const sim = new GameSim();
