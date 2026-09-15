import { defaultState, loadState } from "@/game/save";
import { DEMO_FLAG, DEMO_HOLD, DEMO_SAVE, isDemoHunt } from "@/game/demo-flag";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import { authClient } from "@/lib/auth/client";
import { ensureReviewer } from "@/game/reviewer-net";
import { REVIEWER_EMAIL, REVIEWER_PASSWORD } from "@/lib/auth/reviewer";
import type { GameState } from "@/game/types";

export function seedDemoState(): GameState {
  const s = defaultState();
  s.gold = 4000;
  s.souls = 80;
  s.gems = 40;
  s.floor = 12;
  s.maxFloor = 12;
  s.heroLevel.kael = 18;
  s.heroLevel.rook = 14;
  s.heroLevel.lyra = 10;
  s.hires = 3;
  s.kills = 90;
  s.clicks = 160;
  s.chests = 3;
  s.ember = 12;
  return s;
}

/** Local demo on this phone. Does not touch the founder cloud save. */
export function enterLocalDemo(): void {
  if (!isDemoHunt()) {
    try {
      sessionStorage.setItem(DEMO_HOLD, JSON.stringify(sim.state));
      sessionStorage.setItem(DEMO_FLAG, "1");
    } catch {
      /* ignore */
    }
    sim.loadExact(seedDemoState());
  }
  useGame.getState().setDemoHunt(true);
  useGame.getState().refresh();
  useGame.getState().setScreen("play");
}

export function restartLocalDemo(): void {
  if (!isDemoHunt()) {
    enterLocalDemo();
    return;
  }
  sim.loadExact(seedDemoState());
  useGame.getState().refresh();
}

export function exitLocalDemo(): void {
  let held: GameState | null = null;
  try {
    const raw = sessionStorage.getItem(DEMO_HOLD);
    if (raw) held = JSON.parse(raw) as GameState;
    sessionStorage.removeItem(DEMO_FLAG);
    sessionStorage.removeItem(DEMO_HOLD);
    sessionStorage.removeItem(DEMO_SAVE);
  } catch {
    /* ignore */
  }
  useGame.getState().setDemoHunt(false);
  if (held) sim.loadExact(held);
  else sim.loadExact(loadState().state);
  useGame.getState().refresh();
  useGame.getState().setScreen("title");
}

/** Cloud demo hunter for Google Play reviewers (signed out). */
export async function playDemoHunt(): Promise<void> {
  await ensureReviewer();
  const { error } = await authClient.signIn.email({
    email: REVIEWER_EMAIL,
    password: REVIEWER_PASSWORD,
    callbackURL: "/",
  });
  if (error) throw new Error(error.message ?? "Demo sign-in failed");
  window.location.assign("/");
}
