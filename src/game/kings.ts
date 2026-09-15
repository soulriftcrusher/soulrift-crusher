import { mindPower, type ShardDef, type ShardMind } from "./shards";

export type Pretender = {
  id: string;
  name: string;
  seed: number;
};

export const THRONES: Record<string, Pretender[]> = {
  "ashen-1": [
    { id: "ashen-regent", name: "Ashen Regent", seed: 11 },
    { id: "hollow-marshal", name: "Hollow Marshal", seed: 23 },
    { id: "rift-widow", name: "Rift Widow", seed: 41 },
  ],
  "ember-2": [
    { id: "cinder-crown", name: "Cinder Crown", seed: 13 },
    { id: "brand-warden", name: "Brand Warden", seed: 29 },
  ],
  "cut-3": [
    { id: "cut-king", name: "The Cut King", seed: 17 },
    { id: "silent-edge", name: "Silent Edge", seed: 31 },
  ],
  "iron-hymn": [
    { id: "hymn-iron", name: "Hymn Iron", seed: 19 },
    { id: "gate-cantor", name: "Gate Cantor", seed: 37 },
  ],
  "void-choir": [
    { id: "split-crown", name: "Split Crown", seed: 7 },
    { id: "howl-twin", name: "Howl Twin", seed: 43 },
  ],
  "cinder-host": [
    { id: "host-prime", name: "Host Prime", seed: 3 },
    { id: "lair-eater", name: "Lair Eater", seed: 47 },
  ],
  nightwell: [
    { id: "coin-regent", name: "Coin Regent", seed: 5 },
    { id: "ledger-king", name: "Ledger King", seed: 53 },
  ],
  "rime-banner": [
    { id: "frost-sleeper", name: "Frost Sleeper", seed: 2 },
    { id: "thaw-tyrant", name: "Thaw Tyrant", seed: 59 },
  ],
};

function hash(id: string, n: number): number {
  let h = n * 1103515245 + 12345;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return h / 4294967296;
}

export function pretenderPower(def: ShardDef, pretender: Pretender, day: number, season: number): number {
  const base = mindPower(def, day, season);
  const bias = 1.55 + pretender.seed * 0.012 + hash(pretender.id, day) * 0.22;
  return Math.floor(base * bias);
}

export type KingThink = {
  challenge: boolean;
  thought: string;
};

/** NPC throne brain. Looks at win chance, war clock, and that server's mind. */
export function kingThink(
  mind: ShardMind,
  pWin: number,
  warToday: boolean,
  isKing: boolean,
  day: number,
  defenses: number,
): KingThink {
  const holdValue = warToday ? 0.22 : 0;
  const tired = Math.min(0.18, defenses * 0.03);
  const edge = pWin - 0.5 - holdValue + tired * (isKing ? -1 : 1);

  if (isKing) {
    if (warToday) {
      return { challenge: false, thought: "War window. Hold the chair. Do not bleed power." };
    }
    if (pWin < 0.42) {
      return { challenge: false, thought: `Threat ratio ${pWin.toFixed(2)}. Fortify. No duel today.` };
    }
    return { challenge: false, thought: `Throne stable. Edge ${edge.toFixed(2)}. Let the pretenders come.` };
  }

  let bar = 0.58;
  if (mind === "hunter") bar = 0.52;
  if (mind === "greedy") bar = 0.68;
  if (mind === "steady") bar = 0.6;
  if (mind === "sleeper") bar = day < 42 ? 0.92 : 0.48;
  if (mind === "volatile") bar = 0.4 + hash("vol", day) * 0.35;
  if (mind === "player") bar = 0.56;

  const challenge = pWin >= bar && !(warToday && pWin < 0.72);
  const thought = challenge
    ? `EV+ duel. pWin ${pWin.toFixed(2)} vs bar ${bar.toFixed(2)}. Take the chair.`
    : `Wait. pWin ${pWin.toFixed(2)} under ${bar.toFixed(2)}. Grow. Strike later.`;
  return { challenge, thought };
}

export function duelOutcome(you: number, them: number, salt = Date.now()): boolean {
  const ratio = you / Math.max(1, them);
  const need = 0.88 + hash("duel", Math.floor(you + them + (salt % 99991))) * 0.22;
  return ratio >= need;
}

export type KingSnap = {
  shardId: string;
  kind: "npc" | "player";
  name: string;
  power: number;
  heldHours: number;
  defenses: number;
  thought: string;
  you: boolean;
  log: string[];
};
