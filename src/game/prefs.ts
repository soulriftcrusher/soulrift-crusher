import { APP_VERSION } from "./patch-notes";

const KEY = "soulrift.prefs.v1";

export type FightPrefs = {
  names: boolean;
  skillSfx: boolean;
  reduceFx: boolean;
  seenPatch: string;
};

const DEFAULTS: FightPrefs = {
  names: true,
  skillSfx: true,
  reduceFx: false,
  seenPatch: "",
};

function readRaw(): Partial<FightPrefs> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Partial<FightPrefs>;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export function readPrefs(): FightPrefs {
  const raw = readRaw();
  return {
    names: raw.names !== false,
    skillSfx: raw.skillSfx !== false,
    reduceFx: Boolean(raw.reduceFx),
    seenPatch: typeof raw.seenPatch === "string" ? raw.seenPatch : "",
  };
}

export function writePrefs(patch: Partial<FightPrefs>): FightPrefs {
  const next = { ...readPrefs(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function patchIsNew(): boolean {
  return readPrefs().seenPatch !== APP_VERSION;
}

export function markPatchSeen(): void {
  writePrefs({ seenPatch: APP_VERSION });
}
