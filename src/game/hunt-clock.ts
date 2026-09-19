import { sim } from "./sim";

let raf = 0;
let last = 0;
let running = false;
let hiddenAt = 0;
let hudAcc = 0;
let onHud: (() => void) | null = null;
let onIdle: ((gold: number) => void) | null = null;

export function huntClockRunning(): boolean {
  return running;
}

export function startHuntClock(opts?: { onHud?: () => void; onIdle?: (gold: number) => void }) {
  if (opts?.onHud) onHud = opts.onHud;
  if (opts?.onIdle) onIdle = opts.onIdle;
  if (running) return;
  running = true;
  last = performance.now();
  hudAcc = 0;
  const loop = (t: number) => {
    if (!running) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      last = t;
      raf = requestAnimationFrame(loop);
      return;
    }
    const dt = Math.min(0.1, (t - last) / 1000);
    last = t;
    sim.step(dt);
    hudAcc += dt;
    if (hudAcc >= 0.4) {
      hudAcc = 0;
      onHud?.();
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onHide);
  }
}

export function stopHuntClock() {
  running = false;
  cancelAnimationFrame(raf);
  raf = 0;
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pagehide", onHide);
  }
}

function onHide() {
  hiddenAt = Date.now();
  sim.state.lastHuntAt = hiddenAt;
  sim.save();
}

function onVis() {
  if (typeof document === "undefined") return;
  if (document.visibilityState === "hidden") {
    onHide();
    return;
  }
  const start = hiddenAt || sim.state.lastHuntAt || 0;
  hiddenAt = 0;
  if (!start) return;
  const sec = (Date.now() - start) / 1000;
  if (sec < 2) return;
  const gold = sim.catchUp(sec);
  onHud?.();
  if (gold > 0) onIdle?.(gold);
}
