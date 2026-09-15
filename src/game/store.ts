import { create } from "zustand";
import type { ArenaResult, Bulk, Snapshot } from "./types";
import { sim } from "./sim";
import { isDemoHunt } from "./demo-flag";
import { patchIsNew, readPrefs, writePrefs } from "./prefs";

export type Tab = "fight" | "heroes" | "hunt" | "shop" | "realm" | "clan" | "founders";
export type ClanPage =
  | "hub"
  | "clan"
  | "arena"
  | "science"
  | "mail"
  | "camp"
  | "manage"
  | "profile"
  | "chat"
  | "rating"
  | "servers"
  | "friends";

export type HuntPage =
  | "hub"
  | "daily"
  | "calendar"
  | "pass"
  | "market"
  | "jobs"
  | "chests"
  | "expedition"
  | "arena"
  | "event"
  | "inbox"
  | "codex"
  | "ritual"
  | "shop"
  | "wheel"
  | "raid"
  | "looks";

export type LegalPageId = "privacy" | "copyright" | "support" | "guide" | null;

type GameUI = {
  screen: "title" | "play";
  tab: Tab;
  clanPage: ClanPage;
  huntPage: HuntPage;
  legalPage: LegalPageId;
  selectedHero: string | null;
  bulk: Bulk;
  muted: boolean;
  shake: boolean;
  showNames: boolean;
  skillSfx: boolean;
  reduceFx: boolean;
  settingsOpen: boolean;
  moveHuntOpen: boolean;
  ritualOpen: boolean;
  summonOpen: boolean;
  patchOpen: boolean;
  shopNote: string;
  arenaResult: ArenaResult | null;
  chestLoot: { gold: number; souls: number; influence: number } | null;
  offlineGold: number;
  onlineCount: number;
  isStaff: boolean;
  demoHunt: boolean;
  snap: Snapshot;
  setScreen: (s: GameUI["screen"]) => void;
  setTab: (t: Tab) => void;
  setClanPage: (p: ClanPage) => void;
  setHuntPage: (p: HuntPage) => void;
  openHunt: (p: HuntPage) => void;
  setLegalPage: (p: LegalPageId) => void;
  setSelectedHero: (id: string | null) => void;
  setBulk: (b: Bulk) => void;
  setMuted: (m: boolean) => void;
  setShake: (s: boolean) => void;
  setShowNames: (v: boolean) => void;
  setSkillSfx: (v: boolean) => void;
  setReduceFx: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  setMoveHuntOpen: (v: boolean) => void;
  setRitualOpen: (v: boolean) => void;
  setSummonOpen: (v: boolean) => void;
  setPatchOpen: (v: boolean) => void;
  setShopNote: (v: string) => void;
  setArenaResult: (r: ArenaResult | null) => void;
  setChestLoot: (c: GameUI["chestLoot"]) => void;
  clearOffline: () => void;
  setOnlineCount: (n: number) => void;
  setIsStaff: (v: boolean) => void;
  setDemoHunt: (v: boolean) => void;
  refresh: () => void;
};

export const HUNT_FLAG = "soulrift-in-hunt";
const STAFF_FLAG = "soulrift.staff";

function wasHunting(): boolean {
  try {
    return sessionStorage.getItem(HUNT_FLAG) === "1";
  } catch {
    return false;
  }
}

function markHunting(on: boolean) {
  try {
    if (on) sessionStorage.setItem(HUNT_FLAG, "1");
    else sessionStorage.removeItem(HUNT_FLAG);
  } catch {
    /* ignore */
  }
}

function readStaffFlag(): boolean {
  try {
    return localStorage.getItem(STAFF_FLAG) === "1" || sim.state.founderClaimed;
  } catch {
    return Boolean(sim.state.founderClaimed);
  }
}

function writeStaffFlag(on: boolean) {
  try {
    if (on) localStorage.setItem(STAFF_FLAG, "1");
  } catch {
    /* ignore */
  }
}

export const useGame = create<GameUI>((set, get) => {
  const prefs = readPrefs();
  return {
  screen: wasHunting() ? "play" : "title",
  tab: "fight",
  clanPage: "hub",
  huntPage: "hub",
  legalPage: null,
  selectedHero: null,
  bulk: 1,
  muted: false,
  shake: true,
  showNames: prefs.names,
  skillSfx: prefs.skillSfx,
  reduceFx: prefs.reduceFx,
  settingsOpen: false,
  moveHuntOpen: false,
  ritualOpen: false,
  summonOpen: false,
  patchOpen: patchIsNew(),
  shopNote: "",
  arenaResult: null,
  chestLoot: null,
  offlineGold: 0,
  onlineCount: 0,
  isStaff: readStaffFlag(),
  demoHunt: isDemoHunt(),
  snap: sim.snapshot(1),
  setScreen: (screen) => {
    markHunting(screen === "play");
    set({ screen });
  },
  setTab: (tab) => set({ tab, huntPage: tab === "hunt" ? "hub" : get().huntPage }),
  setClanPage: (clanPage) => set({ clanPage }),
  setHuntPage: (huntPage) => set({ huntPage }),
  openHunt: (huntPage) => set({ tab: "hunt", huntPage }),
  setLegalPage: (legalPage) => set({ legalPage }),
  setSelectedHero: (selectedHero) => set({ selectedHero }),
  setBulk: (bulk) => {
    set({ bulk, snap: sim.snapshot(bulk) });
  },
  setMuted: (muted) => set({ muted }),
  setShake: (shake) => set({ shake }),
  setShowNames: (showNames) => {
    writePrefs({ names: showNames });
    set({ showNames });
  },
  setSkillSfx: (skillSfx) => {
    writePrefs({ skillSfx });
    set({ skillSfx });
  },
  setReduceFx: (reduceFx) => {
    writePrefs({ reduceFx });
    set({ reduceFx });
  },
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setMoveHuntOpen: (moveHuntOpen) => set({ moveHuntOpen }),
  setRitualOpen: (ritualOpen) => set({ ritualOpen }),
  setSummonOpen: (summonOpen) => set({ summonOpen }),
  setPatchOpen: (patchOpen) => set({ patchOpen }),
  setShopNote: (shopNote) => set({ shopNote }),
  setArenaResult: (arenaResult) => set({ arenaResult }),
  setChestLoot: (chestLoot) => set({ chestLoot }),
  clearOffline: () => set({ offlineGold: 0 }),
  setOnlineCount: (onlineCount) => set({ onlineCount }),
  setIsStaff: (isStaff) => {
    if (isStaff) writeStaffFlag(true);
    set({ isStaff });
  },
  setDemoHunt: (demoHunt) => set({ demoHunt }),
  refresh: () => set({ snap: sim.snapshot(get().bulk) }),
  };
});
