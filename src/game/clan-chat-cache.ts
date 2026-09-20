import type { ClanChatSnap } from "./plaza-net";

const KEY = "soulrift.clanchat.v1";
const VERSION = 1;

type Pack = { version: number; userId: string; snap: ClanChatSnap };

function packKey(userId: string): string {
  return `${KEY}.${userId.slice(0, 80)}`;
}

export function readClanChatCache(userId: string): ClanChatSnap | null {
  try {
    const raw = localStorage.getItem(packKey(userId));
    if (!raw) return null;
    const pack = JSON.parse(raw) as Pack;
    if (pack?.version !== VERSION || pack.userId !== userId || !pack.snap?.clanId) return null;
    if (!Array.isArray(pack.snap.chat)) return null;
    return pack.snap;
  } catch {
    return null;
  }
}

export function writeClanChatCache(userId: string, snap: ClanChatSnap | null): void {
  try {
    const key = packKey(userId);
    if (!snap) {
      localStorage.removeItem(key);
      return;
    }
    const json = JSON.stringify({ version: VERSION, userId, snap } satisfies Pack);
    localStorage.setItem(key, json);
  } catch {
    /* quota / private mode */
  }
}
