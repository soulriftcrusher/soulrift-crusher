import { ARENA_CHARGE_MAX, HEROES, RELICS, SCIENCES, SKILLS, rollContracts } from "./data";
import type { HeroId } from "./data";
import { LOOT } from "./loot";
import { SOCKETS, WEAPONS } from "./meta";
import type { GameState } from "./types";
import { DEMO_SAVE, isDemoHunt } from "./demo-flag";

export const SAVE_VERSION = 21;
const SAVE_KEY = "soulrift.save.v1";
const HERO_KEY = "soulrift.heroes.v1";
const IDB_NAME = "soulrift-vault";
const IDB_STORE = "saves";

function emptyLevels<T extends string>(ids: readonly T[]): Record<T, number> {
  return Object.fromEntries(ids.map((id) => [id, 0])) as Record<T, number>;
}

function heroIds(): HeroId[] {
  return HEROES.map((h) => h.id);
}

export function defaultState(now = Date.now()): GameState {
  const heroes = heroIds();
  return {
    version: SAVE_VERSION,
    gold: 6,
    souls: 0,
    gems: 3,
    influence: 0,
    chests: 0,
    floor: 1,
    maxFloor: 1,
    farm: false,
    heroLevel: emptyLevels(heroes),
    heroGild: emptyLevels(heroes),
    relicLevel: emptyLevels(RELICS.map((r) => r.id)),
    scienceLevel: emptyLevels(SCIENCES.map((s) => s.id)),
    skillCd: emptyLevels(SKILLS.map((s) => s.id)),
    skillActive: emptyLevels(SKILLS.map((s) => s.id)),
    weaponLevel: emptyLevels(WEAPONS.map((w) => w.id)),
    socket: null,
    socketsOwned: Object.fromEntries(SOCKETS.map((s) => [s.id, false])) as GameState["socketsOwned"],
    founderClaimed: false,
    founderKit: 0,
    lastFreeWell: "",
    kills: 0,
    clicks: 0,
    rituals: 0,
    crits: 0,
    bossKills: 0,
    hires: 0,
    lootGold: 0,
    arenaWins: 0,
    arenaLosses: 0,
    arenaCharges: ARENA_CHARGE_MAX,
    arenaRegen: 0,
    contracts: rollContracts({
      kills: 0,
      maxFloor: 1,
      bossKills: 0,
      hires: 0,
      crits: 0,
      arenaWins: 0,
      lootGold: 0,
      rituals: 0,
    }),
    quests: {},
    lastSaveAt: now,
    startedAt: now,
    ember: 0,
    bone: 0,
    riftDust: 0,
    runes: [],
    heroRunes: Object.fromEntries(heroes.map((id) => [id, [null, null, null]])) as GameState["heroRunes"],
    heroCraft: emptyLevels(heroes),
    heroPrestige: emptyLevels(heroes),
    heroDown: emptyLevels(heroes),
    eventDay: "",
    eventPts: 0,
    siegeLair: null,
    siegePts: 0,
    siegeReadyAt: 0,
    arenaChest: 0,
    bag: Object.fromEntries(LOOT.map((l) => [l.id, 0])) as GameState["bag"],
    crafts: 0,
    badges: {},
    loginDay: "",
    loginStreak: 0,
    loginClaimed: "",
    chapterClaim: 0,
    pity: 0,
    expeditionHero: null,
    expeditionAt: 0,
    marketDay: "",
    marketBought: [],
    vipSpent: 0,
    title: "",
    autoSkill: false,
    monthKey: "",
    monthHits: [],
    watchDay: "",
    wheelDay: "",
    wheelFreeAt: 0,
    wheelBoostAt: 0,
    wheelChance: 0.02,
    bpPts: 0,
    bpPremium: false,
    bpFree: 0,
    bpPrem: 0,
    codex: {},
    cardUntil: 0,
    firstBuy: false,
    looks: ["ash"],
    frame: "ash",
    nameHue: "ash",
    splash: "ash",
    shieldUntil: 0,
    playMs: 0,
    wellToken: 0,
    wellHymnDay: "",
    shieldHymnDay: "",
    wheelPot: 50,
    lastPlunderAt: 0,
    avatarHero: "kael",
  };
}

function migrate(raw: GameState): GameState {
  const base = defaultState(raw.lastSaveAt ?? Date.now());
  const merged: GameState = { ...base, ...raw };
  merged.heroLevel = { ...base.heroLevel, ...(raw.heroLevel ?? {}) };
  merged.heroGild = { ...base.heroGild, ...(raw.heroGild ?? {}) };
  merged.relicLevel = { ...base.relicLevel, ...(raw.relicLevel ?? {}) };
  merged.scienceLevel = { ...base.scienceLevel, ...(raw.scienceLevel ?? {}) };
  merged.skillCd = { ...base.skillCd, ...(raw.skillCd ?? {}) };
  merged.skillActive = { ...base.skillActive, ...(raw.skillActive ?? {}) };
  merged.weaponLevel = { ...base.weaponLevel, ...(raw.weaponLevel ?? {}) };
  merged.heroCraft = { ...base.heroCraft, ...(raw.heroCraft ?? {}) };
  merged.heroPrestige = { ...base.heroPrestige, ...(raw.heroPrestige ?? {}) };
  merged.heroDown = { ...base.heroDown, ...(raw.heroDown ?? {}) };
  merged.socketsOwned = { ...base.socketsOwned, ...(raw.socketsOwned ?? {}) };
  merged.heroRunes = { ...base.heroRunes, ...(raw.heroRunes ?? {}) };
  merged.bag = { ...base.bag, ...(raw.bag ?? {}) };
  merged.badges = { ...(raw.badges ?? {}) };
  merged.runes = Array.isArray(raw.runes) ? raw.runes : [];
  if (!Array.isArray(merged.monthHits)) merged.monthHits = [];
  if (!merged.codex || typeof merged.codex !== "object") merged.codex = {};
  if (!Number.isFinite(merged.chests)) merged.chests = 0;
  if (!Number.isFinite(merged.ember)) merged.ember = 0;
  if (!Number.isFinite(merged.bone)) merged.bone = 0;
  if (!Number.isFinite(merged.gold)) merged.gold = 0;
  if (!Number.isFinite(merged.souls)) merged.souls = 0;
  if (!Number.isFinite(merged.gems)) merged.gems = 0;
  if (!Number.isFinite(merged.founderKit)) merged.founderKit = 0;
  if (!merged.contracts?.length) {
    merged.contracts = rollContracts({
      kills: merged.kills,
      maxFloor: merged.maxFloor,
      bossKills: merged.bossKills,
      hires: merged.hires,
      crits: merged.crits,
      arenaWins: merged.arenaWins,
      lootGold: merged.lootGold,
      rituals: merged.rituals,
    });
  }
  merged.version = SAVE_VERSION;
  if (!Number.isFinite(merged.wheelChance)) merged.wheelChance = 0.02;
  if (!Number.isFinite(merged.wheelPot)) merged.wheelPot = 50;
  if (!Number.isFinite(merged.wheelFreeAt)) merged.wheelFreeAt = 0;
  if (!Number.isFinite(merged.wheelBoostAt)) merged.wheelBoostAt = 0;
  if (!Array.isArray(merged.looks)) merged.looks = ["ash"];
  if (typeof merged.avatarHero !== "string") merged.avatarHero = "";
  return merged;
}

function parseSave(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as GameState;
    if (!data || typeof data !== "object") return null;
    return migrate(data);
  } catch {
    return null;
  }
}

function newer(a: GameState | null, b: GameState | null): GameState | null {
  if (!a) return b;
  if (!b) return a;
  return (b.lastSaveAt ?? 0) > (a.lastSaveAt ?? 0) ? b : a;
}

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbPut(state: GameState): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(state, "main");
      tx.objectStore(IDB_STORE).put(rosterFromState(state), "roster");
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function idbWipe(): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete("main");
      tx.objectStore(IDB_STORE).delete("roster");
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function idbGet(): Promise<GameState | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get("main");
      req.onsuccess = () => {
        const raw = req.result;
        if (raw && typeof raw === "object") resolve(migrate(raw as GameState));
        else resolve(null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function vaultGet(): Promise<HeroRoster | null> {
  const db = await openDb();
  if (!db) return parseHeroBlob();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get("roster");
      req.onsuccess = () => {
        const raw = req.result;
        if (Array.isArray(raw)) resolve(raw as HeroRoster);
        else if (raw && typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw) as { roster?: HeroRoster } | HeroRoster;
            const roster = Array.isArray(parsed) ? parsed : parsed.roster;
            resolve(Array.isArray(roster) ? roster : parseHeroBlob());
          } catch {
            resolve(parseHeroBlob());
          }
        } else resolve(parseHeroBlob());
      };
      req.onerror = () => resolve(parseHeroBlob());
    } catch {
      resolve(parseHeroBlob());
    }
  });
}

function parseHeroBlob(): HeroRoster | null {
  try {
    const raw = localStorage.getItem(HERO_KEY) ?? sessionStorage.getItem(HERO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { roster?: HeroRoster } | HeroRoster;
    const roster = Array.isArray(parsed) ? parsed : parsed.roster;
    return Array.isArray(roster) ? roster : null;
  } catch {
    return null;
  }
}

function writeHeroBlob(state: GameState): void {
  const json = JSON.stringify({ at: Date.now(), roster: rosterFromState(state) });
  try {
    localStorage.setItem(HERO_KEY, json);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem(HERO_KEY, json);
  } catch {
    /* ignore */
  }
}

export type HeroRoster = {
  id: string;
  level: number;
  gild: number;
  prestige: number;
  craft: number;
  down: number;
}[];

export function rosterFromState(state: GameState): HeroRoster {
  return HEROES.map((h) => ({
    id: h.id,
    level: Number(state.heroLevel[h.id] ?? 0),
    gild: Number(state.heroGild[h.id] ?? 0),
    prestige: Number(state.heroPrestige?.[h.id] ?? 0),
    craft: Number(state.heroCraft[h.id] ?? 0),
    down: Number(state.heroDown?.[h.id] ?? 0),
  }));
}

export function applyRoster(state: GameState, roster: HeroRoster): GameState {
  if (!Array.isArray(roster)) return state;
  for (const row of roster) {
    const id = row.id as HeroId;
    if (!id) continue;
    if (!state.heroPrestige) state.heroPrestige = {} as GameState["heroPrestige"];
    const pIn = Math.max(0, Number(row.prestige ?? 0));
    const pNow = Math.max(0, Number(state.heroPrestige[id] ?? 0));
    const lvIn = Math.max(0, Number(row.level ?? 0));
    const lvNow = Math.max(0, Number(state.heroLevel[id] ?? 0));
    if (pIn > pNow) {
      state.heroPrestige[id] = pIn;
      state.heroLevel[id] = lvIn;
    } else if (pNow > pIn) {
      /* keep prestiged local level */
    } else {
      state.heroLevel[id] = Math.max(lvNow, lvIn);
    }
    state.heroGild[id] = Math.max(Number(state.heroGild[id] ?? 0), Number(row.gild ?? 0));
    state.heroCraft[id] = Math.max(Number(state.heroCraft[id] ?? 0), Number(row.craft ?? 0));
    const down = Number(row.down ?? -1);
    if (down >= 0) {
      if (!state.heroDown) state.heroDown = {} as GameState["heroDown"];
      if (down <= 0) state.heroDown[id] = 0;
      else if ((state.heroDown[id] ?? 0) > Date.now()) {
        state.heroDown[id] = Math.min(state.heroDown[id] ?? down, down);
      }
    }
  }
  let hires = 0;
  for (const h of HEROES) if ((state.heroLevel[h.id] ?? 0) > 0) hires += 1;
  state.hires = Math.max(state.hires ?? 0, hires);
  return state;
}

export function lockRoster(state: GameState, extra?: HeroRoster | null): GameState {
  applyRoster(state, parseHeroBlob() ?? []);
  if (extra?.length) applyRoster(state, extra);
  return state;
}

export function loadState(): { state: GameState; offlineSeconds: number } {
  const fallback = defaultState();
  try {
    if (isDemoHunt()) {
      const demo = parseSave(sessionStorage.getItem(DEMO_SAVE));
      if (demo) return { state: lockRoster(demo), offlineSeconds: 0 };
      fallback.lastSaveAt = 0;
      return { state: lockRoster(fallback), offlineSeconds: 0 };
    }
    const main = parseSave(localStorage.getItem(SAVE_KEY));
    const bak = parseSave(localStorage.getItem(SAVE_KEY + ":bak"));
    const ses = parseSave(sessionStorage.getItem(SAVE_KEY));
    const picked = newer(newer(main, bak), ses);
    if (!picked) {
      fallback.lastSaveAt = 0;
      return { state: lockRoster(fallback), offlineSeconds: 0 };
    }
    const state = lockRoster(picked);
    const offlineSeconds = Math.max(0, (Date.now() - (state.lastSaveAt || Date.now())) / 1000);
    return { state, offlineSeconds };
  } catch {
    return { state: lockRoster(fallback), offlineSeconds: 0 };
  }
}

export function persistState(state: GameState): void {
  try {
    if (!Number.isFinite(state.gold) || state.gold < 0) state.gold = 0;
    if (!Number.isFinite(state.souls) || state.souls < 0) state.souls = 0;
    if (!Number.isFinite(state.gems) || state.gems < 0) state.gems = 0;
    state.lastSaveAt = Date.now();
    state.version = SAVE_VERSION;
    if (isDemoHunt()) {
      sessionStorage.setItem(DEMO_SAVE, JSON.stringify(state));
      return;
    }
    writeHeroBlob(state);
    lockRoster(state);
    const json = JSON.stringify(state);
    const prev = localStorage.getItem(SAVE_KEY);
    if (prev) localStorage.setItem(SAVE_KEY + ":bak", prev);
    localStorage.setItem(SAVE_KEY, json);
    sessionStorage.setItem(SAVE_KEY, json);
    void idbPut(state);
  } catch {
    try {
      if (isDemoHunt()) {
        sessionStorage.setItem(DEMO_SAVE, JSON.stringify(state));
        return;
      }
      sessionStorage.setItem(SAVE_KEY, JSON.stringify(state));
      writeHeroBlob(state);
    } catch {
      /* ignore */
    }
  }
}

export function hasSave(): boolean {
  try {
    return Boolean(localStorage.getItem(SAVE_KEY) || sessionStorage.getItem(SAVE_KEY));
  } catch {
    return false;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SAVE_KEY + ":bak");
    localStorage.removeItem(HERO_KEY);
    sessionStorage.removeItem(SAVE_KEY);
    sessionStorage.removeItem(HERO_KEY);
  } catch {
    /* ignore */
  }
  void idbWipe();
}

export async function recoverSave(): Promise<GameState | null> {
  try {
    const idb = await idbGet();
    const vault = await vaultGet();
    const disk = parseSave(localStorage.getItem(SAVE_KEY));
    const picked = newer(newer(idb, disk), parseSave(sessionStorage.getItem(SAVE_KEY)));
    if (!picked) return vault?.length ? lockRoster(defaultState(), vault) : null;
    return lockRoster(picked, vault);
  } catch {
    return null;
  }
}

export function applyIncoming(raw: unknown): GameState {
  if (!raw || typeof raw !== "object") return defaultState(0);
  const o = raw as GameState;
  const at = Number(o.lastSaveAt);
  const floor = Number(o.maxFloor);
  const hires = Number(o.hires);
  if (!(Number.isFinite(at) && at > 0) && !(floor > 1) && !(hires > 0)) return defaultState(0);
  return migrate(o);
}

function mergeDown(a: Record<string, number> | undefined, b: Record<string, number> | undefined): Record<HeroId, number> {
  const o = { ...(a ?? {}), ...(b ?? {}) } as Record<HeroId, number>;
  const now = Date.now();
  for (const h of HEROES) {
    const x = Number(a?.[h.id] ?? 0);
    const y = Number(b?.[h.id] ?? 0);
    o[h.id] = x <= now || y <= now ? 0 : Math.min(x, y);
  }
  return o;
}

function maxRec<T extends string>(a: Record<T, number>, b: Record<T, number>): Record<T, number> {
  const o = { ...a };
  for (const k of Object.keys(b) as T[]) o[k] = Math.max(Number(a[k] ?? 0), Number(b[k] ?? 0));
  return o;
}

function mergeRunes(a: GameState["runes"] = [], b: GameState["runes"] = []): GameState["runes"] {
  const map = new Map<string, GameState["runes"][number]>();
  for (const r of [...a, ...b]) {
    if (!r?.id) continue;
    const prev = map.get(r.id);
    if (!prev || Number(r.value) > Number(prev.value)) map.set(r.id, r);
  }
  return [...map.values()];
}

function mergeHeroRunes(
  a: GameState["heroRunes"] | undefined,
  b: GameState["heroRunes"] | undefined,
): GameState["heroRunes"] {
  const out = { ...(a ?? {}) } as GameState["heroRunes"];
  const ids = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  for (const id of ids) {
    const hid = id as HeroId;
    const la = a?.[hid] ?? [null, null, null];
    const lb = b?.[hid] ?? [null, null, null];
    const n = Math.max(3, la.length, lb.length);
    out[hid] = Array.from({ length: n }, (_, i) => lb[i] || la[i] || null);
  }
  return out;
}

function mergeSockets(
  a: GameState["socketsOwned"] | undefined,
  b: GameState["socketsOwned"] | undefined,
): GameState["socketsOwned"] {
  const o = { ...(a ?? {}) } as GameState["socketsOwned"];
  for (const k of Object.keys(b ?? {}) as (keyof GameState["socketsOwned"])[]) {
    o[k] = Boolean(a?.[k] || b?.[k]);
  }
  return o;
}

/** Newer save wins spends. Hires, relics, and depth still only go up. */
export function mergeProgress(local: GameState, incoming: GameState): GameState {
  const localNewer = (local.lastSaveAt ?? 0) >= (incoming.lastSaveAt ?? 0);
  const newerSave = localNewer ? local : incoming;
  const older = localNewer ? incoming : local;
  const heroLevel = { ...older.heroLevel };
  for (const h of HEROES) {
    const pN = Number((newerSave.heroPrestige ?? {})[h.id] ?? 0);
    const pO = Number((older.heroPrestige ?? {})[h.id] ?? 0);
    const lN = Number(newerSave.heroLevel[h.id] ?? 0);
    const lO = Number(older.heroLevel[h.id] ?? 0);
    if (pN > pO) heroLevel[h.id] = lN;
    else if (pO > pN) heroLevel[h.id] = lO;
    else heroLevel[h.id] = Math.max(lN, lO);
  }
  const kitL = local.founderKit ?? 0;
  const kitI = incoming.founderKit ?? 0;
  const kitGrant = kitL !== kitI;
  return migrate({
    ...older,
    ...newerSave,
    gold: kitGrant ? Math.max(local.gold, incoming.gold) : newerSave.gold,
    souls: kitGrant ? Math.max(local.souls, incoming.souls) : newerSave.souls,
    gems: kitGrant ? Math.max(local.gems, incoming.gems) : newerSave.gems,
    influence: newerSave.influence,
    chests: newerSave.chests,
    ember: newerSave.ember ?? 0,
    bone: newerSave.bone ?? 0,
    riftDust: newerSave.riftDust ?? 0,
    eventPts: newerSave.eventPts ?? 0,
    siegePts: newerSave.siegePts ?? 0,
    arenaCharges: newerSave.arenaCharges ?? older.arenaCharges,
    floor: newerSave.floor,
    farm: newerSave.farm,
    maxFloor: Math.max(local.maxFloor, incoming.maxFloor),
    kills: Math.max(local.kills, incoming.kills),
    hires: Math.max(local.hires, incoming.hires),
    rituals: Math.max(local.rituals, incoming.rituals),
    bossKills: Math.max(local.bossKills, incoming.bossKills),
    crafts: Math.max(local.crafts ?? 0, incoming.crafts ?? 0),
    heroLevel,
    heroGild: maxRec(local.heroGild, incoming.heroGild),
    heroCraft: maxRec(local.heroCraft, incoming.heroCraft),
    heroPrestige: maxRec(local.heroPrestige ?? incoming.heroPrestige, incoming.heroPrestige ?? local.heroPrestige),
    heroDown: mergeDown(local.heroDown, incoming.heroDown),
    relicLevel: maxRec(local.relicLevel, incoming.relicLevel),
    scienceLevel: maxRec(local.scienceLevel, incoming.scienceLevel),
    weaponLevel: maxRec(local.weaponLevel, incoming.weaponLevel),
    runes: mergeRunes(local.runes, incoming.runes),
    heroRunes: mergeHeroRunes(local.heroRunes, incoming.heroRunes),
    bag: maxRec(local.bag ?? incoming.bag, incoming.bag ?? local.bag),
    socketsOwned: mergeSockets(local.socketsOwned, incoming.socketsOwned),
    founderClaimed: Boolean(local.founderClaimed || incoming.founderClaimed),
    founderKit: Math.max(local.founderKit ?? 0, incoming.founderKit ?? 0),
    lastSaveAt: Math.max(local.lastSaveAt ?? 0, incoming.lastSaveAt ?? 0),
    badges: maxRec((local.badges ?? {}) as Record<string, number>, (incoming.badges ?? {}) as Record<string, number>),
    loginStreak: Math.max(local.loginStreak ?? 0, incoming.loginStreak ?? 0),
    loginDay: newerSave.loginDay || older.loginDay || "",
    loginClaimed: newerSave.loginClaimed || older.loginClaimed || "",
    chapterClaim: Math.max(local.chapterClaim ?? 0, incoming.chapterClaim ?? 0),
    pity: Math.max(local.pity ?? 0, incoming.pity ?? 0),
    vipSpent: Math.max(local.vipSpent ?? 0, incoming.vipSpent ?? 0),
    title: newerSave.title || older.title || "",
    marketBought: newerSave.marketBought ?? older.marketBought ?? [],
    marketDay: newerSave.marketDay || older.marketDay || "",
    expeditionHero: newerSave.expeditionHero ?? null,
    expeditionAt: newerSave.expeditionHero ? newerSave.expeditionAt ?? 0 : 0,
    autoSkill: Boolean(newerSave.autoSkill ?? older.autoSkill),
    monthHits: (newerSave.monthHits?.length ?? 0) >= (older.monthHits?.length ?? 0) ? newerSave.monthHits ?? [] : older.monthHits ?? [],
    monthKey: newerSave.monthKey || older.monthKey || "",
    watchDay: newerSave.watchDay || older.watchDay || "",
    wheelDay: newerSave.wheelDay || older.wheelDay || "",
    wheelFreeAt: Math.max(local.wheelFreeAt ?? 0, incoming.wheelFreeAt ?? 0),
    wheelBoostAt: newerSave.wheelBoostAt ?? older.wheelBoostAt ?? 0,
    wheelChance: Number.isFinite(newerSave.wheelChance) ? newerSave.wheelChance : older.wheelChance ?? 0.02,
    bpPts: Math.max(local.bpPts ?? 0, incoming.bpPts ?? 0),
    bpPremium: Boolean(local.bpPremium || incoming.bpPremium),
    bpFree: Math.max(local.bpFree ?? 0, incoming.bpFree ?? 0),
    bpPrem: Math.max(local.bpPrem ?? 0, incoming.bpPrem ?? 0),
    cardUntil: Math.max(local.cardUntil ?? 0, incoming.cardUntil ?? 0),
    firstBuy: Boolean(local.firstBuy || incoming.firstBuy),
    looks: Array.from(new Set([...(local.looks ?? []), ...(incoming.looks ?? []), "ash"])),
    frame: newerSave.frame || older.frame || "ash",
    nameHue: newerSave.nameHue || older.nameHue || "ash",
    splash: newerSave.splash || older.splash || "ash",
    shieldUntil: Math.max(local.shieldUntil ?? 0, incoming.shieldUntil ?? 0),
    playMs: Math.max(local.playMs ?? 0, incoming.playMs ?? 0),
    wellToken: Math.max(local.wellToken ?? 0, incoming.wellToken ?? 0),
    wellHymnDay: newerSave.wellHymnDay || older.wellHymnDay || "",
    shieldHymnDay: newerSave.shieldHymnDay || older.shieldHymnDay || "",
    wheelPot: Number.isFinite(newerSave.wheelPot) ? newerSave.wheelPot : older.wheelPot ?? 50,
    lastPlunderAt: Math.max(local.lastPlunderAt ?? 0, incoming.lastPlunderAt ?? 0),
    avatarHero: newerSave.avatarHero || older.avatarHero || "kael",
    codex: maxRec((local.codex ?? {}) as Record<string, number>, (incoming.codex ?? {}) as Record<string, number>),
  });
}
