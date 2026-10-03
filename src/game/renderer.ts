import { drawMonster } from "./draw-creatures";
import { formatNum } from "./format";
import type { HeroId, MonsterKind } from "./data";
import { HEROES, heroPortrait } from "./data";
import type { GameSim } from "./sim";
import { huntClockRunning } from "./hunt-clock";
import type { SimEvent } from "./types";
import { sfx } from "./audio";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  kind: "spark" | "coin" | "soul" | "ash";
};

type Floater = {
  x: number;
  y: number;
  vy: number;
  life: number;
  max: number;
  text: string;
  crit: boolean;
  color: string;
};

type AttackStyle =
  | "slash"
  | "bash"
  | "arrow"
  | "fire"
  | "hammer"
  | "knife"
  | "soul"
  | "lightning"
  | "ember"
  | "maw"
  | "rift"
  | "glass"
  | "gold"
  | "void"
  | "moon"
  | "coin"
  | "axe"
  | "vine"
  | "frost"
  | "spear"
  | "beam"
  | "well"
  | "cut"
  | "gem";

type Bolt = {
  ox: number;
  oy: number;
  tx: number;
  ty: number;
  life: number;
  max: number;
  color: string;
  accent: string;
  heroId: HeroId;
  style: AttackStyle;
  struck?: boolean;
};

type HeroArt = { img: HTMLImageElement; sheet: boolean };

const HERO_ORDER: HeroId[] = [
  "kael",
  "rook",
  "lyra",
  "vex",
  "thane",
  "sable",
  "morr",
  "iskra",
  "brann",
  "devourer",
  "nyx",
  "kira",
  "orin",
  "vorr",
  "selene",
  "ashur",
  "dax",
  "wren",
  "jora",
  "pike",
  "auric",
  "solenne",
  "vael",
  "morvax",
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

const artCache = new Map<string, HeroArt>();

/** Warm portraits + walk sprites on the title so the fight never flashes dots. */
export function preloadHuntArt() {
  if (typeof window === "undefined") return;
  for (const h of HEROES) {
    if (!artCache.has(h.id)) {
      void loadImage(heroPortrait(h.id))
        .then((img) => {
          if (!artCache.has(h.id) || !artCache.get(h.id)?.sheet) {
            artCache.set(h.id, { img, sheet: false });
          }
        })
        .catch(() => undefined);
    }
    if (h.sprite) {
      void loadImage(h.sprite)
        .then((img) => {
          artCache.set(h.id, { img, sheet: false });
        })
        .catch(() => undefined);
    }
  }
  for (const src of [
    "/bg/hunt.jpg?v=2",
    "/bg/heroes.jpg?v=2",
    "/bg/craft.jpg?v=2",
    "/bg/clans.jpg?v=2",
    "/bg/founder.jpg?v=2",
    "/bg/realms-page.jpg?v=3",
    "/bg/shop-page.jpg?v=2",
    "/bg/wheel-1.jpg?v=2",
    "/bg/wheel-2.jpg?v=2",
    "/tiles/loot-chest.png",
    "/tiles/loot-ember.png",
    "/tiles/loot-rune.png",
    "/tiles/loot-rift.png",
    "/tiles/loot-gems.png",
  ]) {
    void loadImage(src).catch(() => undefined);
  }
}

function isWalkSheet(img: HTMLImageElement): boolean {
  try {
    const c = document.createElement("canvas");
    c.width = 8;
    c.height = 8;
    const x = c.getContext("2d");
    if (!x) return false;
    x.drawImage(img, img.width / 2 - 4, img.height / 2 - 4, 8, 8, 0, 0, 8, 8);
    const d = x.getImageData(0, 0, 8, 8).data;
    let a = 0;
    for (let i = 3; i < d.length; i += 4) a += d[i];
    return a / 64 < 48;
  } catch {
    return false;
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function attackOf(id: HeroId): { style: AttackStyle; color: string; accent: string; dur: number } {
  const table: Record<HeroId, { style: AttackStyle; color: string; accent: string; dur: number }> = {
    kael: { style: "slash", color: "#f2f2f4", accent: "#7eb6ff", dur: 0.28 },
    rook: { style: "bash", color: "#c5ccd6", accent: "#8a93a3", dur: 0.34 },
    lyra: { style: "arrow", color: "#e8dcc8", accent: "#6fa86a", dur: 0.36 },
    vex: { style: "fire", color: "#ff7a2a", accent: "#ffd27a", dur: 0.4 },
    thane: { style: "hammer", color: "#d7dde6", accent: "#8d6a45", dur: 0.42 },
    sable: { style: "knife", color: "#2a2428", accent: "#e23b4a", dur: 0.26 },
    morr: { style: "soul", color: "#b388ff", accent: "#efe6ff", dur: 0.46 },
    iskra: { style: "lightning", color: "#e8f4ff", accent: "#7ec8ff", dur: 0.22 },
    brann: { style: "ember", color: "#ff9a3c", accent: "#ffe1a8", dur: 0.38 },
    devourer: { style: "maw", color: "#6b1020", accent: "#ff4d4d", dur: 0.36 },
    nyx: { style: "rift", color: "#c084fc", accent: "#f5d0fe", dur: 0.3 },
    kira: { style: "glass", color: "#d8fff8", accent: "#7ee0ff", dur: 0.3 },
    orin: { style: "gold", color: "#ffd56a", accent: "#fff1c2", dur: 0.34 },
    vorr: { style: "void", color: "#1a1028", accent: "#a78bfa", dur: 0.34 },
    selene: { style: "moon", color: "#f4f7ff", accent: "#9bb7ff", dur: 0.4 },
    ashur: { style: "coin", color: "#f0c14a", accent: "#fff6d0", dur: 0.36 },
    dax: { style: "axe", color: "#d0d4dc", accent: "#6b3a2a", dur: 0.38 },
    wren: { style: "vine", color: "#7dce6a", accent: "#e7ffc8", dur: 0.4 },
    jora: { style: "frost", color: "#d7f4ff", accent: "#7ecbff", dur: 0.36 },
    pike: { style: "spear", color: "#e4e0d4", accent: "#8d7348", dur: 0.3 },
    auric: { style: "beam", color: "#ffd56a", accent: "#fff6c8", dur: 0.28 },
    solenne: { style: "well", color: "#7ee0ff", accent: "#f3fbff", dur: 0.32 },
    vael: { style: "cut", color: "#ff4d6a", accent: "#ffe0ea", dur: 0.26 },
    morvax: { style: "gem", color: "#ff4fa3", accent: "#7cf0ff", dur: 0.34 },
  };
  return table[id];
}

function flight(b: Bolt, arc = 0) {
  const p = 1 - b.life / Math.max(0.001, b.max);
  const u = Math.min(1, p / 0.84);
  const ease = u * u * (3 - 2 * u);
  const dx = b.tx - b.ox;
  const dy = b.ty - b.oy;
  return {
    x: b.ox + dx * ease,
    y: b.oy + dy * ease - Math.sin(ease * Math.PI) * arc,
    ang: Math.atan2(dy, dx),
    p,
  };
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sim: GameSim;
  private raf = 0;
  private running = false;
  private last = 0;
  private acc = 0;
  private time = 0;
  private sheets = new Map<string, HeroArt>();
  private bgs = new Map<string, HTMLImageElement>();
  private monsters = new Map<string, HTMLImageElement>();
  private particles: Particle[] = [];
  private floaters: Floater[] = [];
  private bolts: Bolt[] = [];
  private trauma = 0;
  private hitstop = 0;
  private monsterHurt = 0;
  private monsterDead = 0;
  private strikeColor = "#fff6e0";
  private heroLunge: Record<string, number> = {};
  private reduced = false;
  private shakeOn = true;
  private showNames = true;
  private splash = "#e8a090";
  private onHud: (() => void) | null = null;
  private hudAcc = 0;
  private drawAcc = 0;
  private resizeAcc = 0;
  private lastSfx = 0;
  private phone = false;
  private groundY = 0;
  private monsterX = 0;
  private monsterY = 0;
  private w = 1;
  private h = 1;
  private resizeAt = 0;
  private paint = true;

  constructor(canvas: HTMLCanvasElement, sim: GameSim) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");
    this.ctx = ctx;
    this.sim = sim;
    for (const h of HEROES) this.heroLunge[h.id] = 0;
  }

  setShake(on: boolean) {
    this.shakeOn = on;
  }

  setNames(on: boolean) {
    this.showNames = on;
  }

  setReduce(on: boolean) {
    this.reduced = on;
    if (on) {
      this.particles = this.particles.slice(-6);
      this.floaters = this.floaters.slice(-3);
      this.bolts = [];
    }
  }

  setSplash(color: string) {
    this.splash = color || "#e8a090";
  }

  setPaint(on: boolean) {
    this.paint = on;
  }

  setHud(fn: () => void) {
    this.onHud = fn;
  }

  async load() {
    for (const [id, art] of artCache) this.sheets.set(id, art);
    const jobs: Promise<void>[] = [];
    for (const h of HEROES) {
      if (!h.sprite) continue;
      jobs.push(
        loadImage(h.sprite)
          .then((img) => {
            const art = { img, sheet: false };
            this.sheets.set(h.id, art);
            artCache.set(h.id, art);
          })
          .catch(() =>
            loadImage(heroPortrait(h.id))
              .then((img) => {
                const art = { img, sheet: false };
                if (!this.sheets.has(h.id)) this.sheets.set(h.id, art);
                artCache.set(h.id, art);
              })
              .catch(() => undefined),
          ),
      );
    }
    for (const [k, src] of [
      ["crypt", "/bg/crypt.jpg?v=3"],
      ["frost", "/bg/frost.jpg?v=3"],
      ["ember", "/bg/ember.jpg?v=3"],
      ["void", "/bg/void.jpg?v=3"],
      ["soulwell", "/bg/soulwell.jpg?v=3"],
    ] as const) {
      jobs.push(
        loadImage(src)
          .then((img) => {
            this.bgs.set(k, img);
          })
          .catch(() => undefined),
      );
    }
    for (const kind of [
      "rat",
      "skeleton",
      "slime",
      "spider",
      "bat",
      "wraith",
      "brute",
      "golem",
      "tyrant",
      "wyrm",
      "riftmaw",
      "ghoul",
      "beetle",
      "serpent",
      "rimeknight",
      "harpy",
      "lich",
      "hound",
    ]) {
      jobs.push(
        loadImage(`/sprites/monsters/${kind}.png?v=8`)
          .then((img) => {
            this.monsters.set(kind, img);
          })
          .catch(() => undefined),
      );
    }
    await Promise.all(jobs);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || this.reduced;
    this.phone = window.matchMedia("(pointer: coarse)").matches;
    const loop = (t: number) => {
      if (!this.running) return;
      if (document.visibilityState !== "visible") {
        this.last = t;
        this.raf = requestAnimationFrame(loop);
        return;
      }
      const raw = Math.min(0.1, (t - this.last) / 1000);
      this.last = t;
      this.tick(raw);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  resize() {
    const now = performance.now();
    const rect = this.canvas.getBoundingClientRect();
    const raw = window.devicePixelRatio || 1;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
    let dpr = Math.min(coarse || mem <= 4 ? 1.5 : 2, Math.max(1, raw));
    let w = Math.max(1, Math.floor(rect.width * dpr));
    let h = Math.max(1, Math.floor(rect.height * dpr));
    const maxPx = 2_200_000;
    const area = w * h;
    if (area > maxPx) {
      const s = Math.sqrt(maxPx / area);
      w = Math.max(1, Math.floor(w * s));
      h = Math.max(1, Math.floor(h * s));
    }
    const jumped = Math.abs(h - this.h) > 32 || Math.abs(w - this.w) > 32;
    if (!jumped && now - this.resizeAt < 250 && this.w > 1) return;
    this.resizeAt = now;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.w = w;
    this.h = h;
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "low";
  }

  private tick(dt: number) {
    this.resizeAcc += dt;
    if (this.resizeAcc >= 0.5 || this.w < 2) {
      this.resizeAcc = 0;
      this.resize();
    }
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }
    this.acc += dt;
    const step = 1 / 60;
    if (!huntClockRunning()) {
      while (this.acc >= step) {
        this.sim.step(step);
        this.acc -= step;
        this.time += step;
      }
    } else {
      this.acc = 0;
      this.time += dt;
    }
    this.present(dt);
    this.drawAcc += dt;
    const drawEvery = this.phone ? 1 / 30 : 1 / 50;
    if (this.paint && document.visibilityState === "visible" && this.drawAcc >= drawEvery) {
      this.drawAcc = 0;
      this.draw();
    }
  }

  private present(dt: number) {
    const events = this.sim.drain();
    for (const e of events) this.handle(e);

    this.trauma = Math.max(0, this.trauma - dt * 2.4);
    this.monsterHurt = Math.max(0, this.monsterHurt - dt * 6);
    this.monsterDead = Math.max(0, this.monsterDead - dt * 2.2);
    for (const id of HERO_ORDER) {
      this.heroLunge[id] = Math.max(0, (this.heroLunge[id] ?? 0) - dt * 4);
    }

    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.kind === "coin" || p.kind === "soul" ? 420 : 80) * dt;
      if (p.kind === "ash") p.vy -= 120 * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0).slice(this.reduced ? -6 : -28);

    for (const f of this.floaters) {
      f.life -= dt;
      f.y += f.vy * dt;
      f.vy *= 0.98;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0).slice(this.reduced ? -3 : -10);

    for (const b of this.bolts) b.life -= dt;
    this.bolts = this.bolts.filter((b) => b.life > 0).slice(this.reduced ? -6 : -16);

    if (!this.reduced && this.particles.length < 20 && Math.random() < dt * 0.6) {
      this.particles.push({
        x: Math.random() * this.w,
        y: this.h * 0.2 + Math.random() * this.h * 0.4,
        vx: (Math.random() - 0.5) * 20,
        vy: 12 + Math.random() * 20,
        life: 2.4,
        max: 2.4,
        size: 1 + Math.random() * 2,
        color: "rgba(240,230,216,0.35)",
        kind: "ash",
      });
    }
  }

  private handle(e: SimEvent) {
    const mx = this.monsterX;
    const my = this.monsterY - 40;
    if (e.type === "hit") {
      this.monsterHurt = 1;
      this.trauma = Math.min(1, this.trauma + (e.crit ? 0.28 : 0.08));
      if (e.crit && !this.reduced) this.hitstop = 0.02;
      const now = performance.now();
      if (this.paint && now - this.lastSfx > 90) {
        this.lastSfx = now;
        sfx.hit(e.crit);
      }
      if (!this.reduced) {
        this.floaters.push({
          x: mx + (Math.random() - 0.5) * 40,
          y: my - 20,
          vy: -70,
          life: 0.7,
          max: 0.7,
          text: formatNum(e.amount),
          crit: e.crit,
          color: e.crit ? "#f0e6d8" : this.splash,
        });
      }
      const sparks = this.reduced ? (e.crit ? 1 : 0) : e.crit ? 5 : 2;
      for (let i = 0; i < sparks; i++) {
        this.particles.push({
          x: mx,
          y: my,
          vx: (Math.random() - 0.5) * 260,
          vy: -40 - Math.random() * 180,
          life: 0.35 + Math.random() * 0.25,
          max: 0.5,
          size: 2 + Math.random() * 3,
          color: e.crit ? "#f0e6d8" : this.splash,
          kind: "spark",
        });
      }
      if (e.heroId) this.heroLunge[e.heroId] = 1;
    } else if (e.type === "kill") {
      this.monsterDead = 1;
      const now = performance.now();
      if (this.paint && now - this.lastSfx > 90) {
        this.lastSfx = now;
        sfx.hit(true);
      }
      const burst = this.reduced ? 2 : 8;
      for (let i = 0; i < burst; i++) {
        this.particles.push({
          x: mx,
          y: my,
          vx: (Math.random() - 0.5) * 220,
          vy: -80 - Math.random() * 160,
          life: 0.7,
          max: 0.7,
          size: 3,
          color: e.chest ? "#d4b483" : "#c45c4a",
          kind: e.chest ? "coin" : "spark",
        });
      }
    } else if (e.type === "heroAttack" && e.heroId && this.paint && this.bolts.length < (this.reduced ? 6 : 16)) {
      const pos = this.heroPos(e.heroId);
      if (pos) {
        const spec = attackOf(e.heroId);
        this.bolts.push({
          ox: pos.x + 8,
          oy: pos.y - 46 * pos.scale,
          tx: mx + (Math.random() - 0.5) * 22,
          ty: my + (Math.random() - 0.5) * 18,
          life: spec.dur + 0.1,
          max: spec.dur + 0.1,
          color: spec.color,
          accent: spec.accent,
          heroId: e.heroId,
          style: spec.style,
        });
        this.heroLunge[e.heroId] = 1;
      }
    }
  }

  private hiredIds(): HeroId[] {
    return this.sim.lineupIds();
  }

  /** iPad and other big touch screens. Phones stay on the small layout. */
  private padScreen(): boolean {
    return Math.min(this.w, this.h) >= 640;
  }

  private monsterSize(): number {
    const m = this.sim.monster;
    const base = Math.min(this.w, this.h);
    const fill = Math.min(1.55, Math.max(1, this.h / 700));
    return Math.round(base * 0.26 * fill * (m.isBoss ? 1.08 : 0.92) * (m.artScale || 1));
  }

  private heroPos(id: HeroId): { x: number; y: number; scale: number; row: number } | null {
    const hired = this.hiredIds();
    const i = hired.indexOf(id);
    if (i < 0) return null;
    const n = hired.length;
    const rows = n <= 6 ? 1 : n <= 14 ? 2 : 3;
    const cols = Math.ceil(n / rows);
    const rowFromBack = Math.floor(i / cols);
    const slot = i % cols;
    const inThis = rowFromBack === rows - 1 ? n - rowFromBack * cols : cols;
    const depth = rows - 1 - rowFromBack;
    const shrink = n > 16 ? 0.74 : n > 10 ? 0.86 : 1;
    const fill = Math.min(1.7, Math.max(1, this.h / 620));
    const pad = this.padScreen();
    const scale = (depth === 0 ? 1 : depth === 1 ? 0.8 : 0.66) * shrink * fill * (pad ? 1.22 : 1);
    const lift = depth === 0 ? 0 : Math.max(28, this.h * 0.055) * depth;
    const y = this.groundY - 8 - lift;
    let x: number;
    if (pad) {
      const size = this.monsterSize();
      const heroHalf = 78 * scale;
      const left = this.w * 0.09;
      const right = Math.max(left + 48, this.monsterX - size / 2 - heroHalf - 28);
      const gap = inThis <= 1 ? 0 : (right - left) / (inThis - 1);
      x = left + slot * gap;
    } else {
      const span = 0.34;
      const gap = inThis <= 1 ? 0 : span / (inThis - 1);
      x = this.w * (0.08 + slot * gap);
    }
    return { x, y, scale, row: depth };
  }

  private draw() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;
    this.groundY = Math.min(h * 0.72, h - Math.round(118 * Math.min(1.35, Math.max(1, h / 780))));
    const n = this.hiredIds().length;
    const crowd = Math.max(0, Math.min(1, (n - 3) / 7));
    const size = this.monsterSize();
    this.monsterX = this.padScreen()
      ? Math.min(this.w - size * 0.4, this.w * 0.84)
      : Math.min(this.w - size * 0.38, this.w * (0.8 + crowd * 0.06));
    this.monsterY = this.groundY;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    let sx = 0;
    let sy = 0;
    if (this.shakeOn && !this.reduced && this.trauma > 0) {
      const mag = this.trauma * this.trauma * 14;
      sx = (Math.random() * 2 - 1) * mag;
      sy = (Math.random() * 2 - 1) * mag;
    }
    ctx.translate(sx, sy);

    this.drawBg();
    this.drawGround();
    this.drawHeroes();
    this.drawMonster();
    this.drawBolts();
    this.drawParticles();
    this.drawFloaters();
  }

  private drawBg() {
    const ctx = this.ctx;
    const img = this.bgs.get(this.sim.biome());
    if (img) {
      const iw = img.width;
      const ih = img.height;
      const scale = Math.max(this.w / iw, this.h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (this.w - dw) / 2, (this.h - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = "#0c0a0b";
      ctx.fillRect(0, 0, this.w, this.h);
    }
    const g = ctx.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, "rgba(12,10,11,0.15)");
    g.addColorStop(1, "rgba(12,10,11,0.45)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);
  }

  private drawGround() {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(12,10,11,0.45)";
    ctx.beginPath();
    ctx.ellipse(this.w * 0.5, this.groundY + 18, this.w * 0.46, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHeroes() {
    const ctx = this.ctx;
    const t = this.time;
    const hired = this.hiredIds();
    const order = [...hired].sort((a, b) => (this.heroPos(b)?.row ?? 0) - (this.heroPos(a)?.row ?? 0));
    for (const id of order) {
      if ((this.sim.state.heroLevel[id] ?? 0) <= 0) continue;
      const pos = this.heroPos(id);
      if (!pos) continue;
      const art = this.sheets.get(id);
      if (!art) continue;
      const def = HEROES.find((h) => h.id === id);
      const lunge = this.heroLunge[id] ?? 0;
      const melee = attackOf(id).style;
      const heavy = melee === "slash" || melee === "bash" || melee === "hammer" || melee === "axe" || melee === "cut" || melee === "knife" || melee === "maw";
      const bob = Math.sin(t * 2.4 + id.charCodeAt(0)) * 2.4 * pos.scale;
      const ratio = art.img.width / Math.max(1, art.img.height);
      const tall = !art.sheet && ratio < 0.85;
      const dh = Math.round((tall ? 168 : 118) * pos.scale);
      const dw = Math.round((tall ? 168 * ratio : 118) * pos.scale);
      ctx.save();
      ctx.translate(pos.x + lunge * (heavy ? 34 : 12) * pos.scale, pos.y + bob - lunge * 6);
      // Walk sheets and the gods already face the beast. Portraits face left.
      if (!art.sheet && !def?.facesRight) ctx.scale(-1, 1);
      ctx.rotate(lunge * (heavy ? -0.16 : -0.05));
      if (art.sheet) {
        const frame = Math.floor(t * 6 + id.charCodeAt(0)) % 4;
        const col = frame % 2;
        const row = Math.floor(frame / 2);
        const cw = art.img.width / 2;
        const ch = art.img.height / 2;
        ctx.drawImage(art.img, col * cw, row * ch, cw, ch, -dw / 2, -dh + 8, dw, dh);
      } else {
        ctx.drawImage(art.img, -dw / 2, -dh + 8, dw, dh);
      }
      ctx.restore();
      if (def && this.showNames && hired.length <= 8) {
        ctx.save();
        ctx.translate(pos.x + lunge * 16 * pos.scale, pos.y + bob);
        ctx.font = `600 ${Math.max(10, Math.floor(11 * pos.scale))}px Outfit, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const label = def.name;
        const tw = Math.max(36, ctx.measureText(label).width + 10);
        const ly = 6;
        ctx.fillStyle = "rgba(12,10,11,0.75)";
        ctx.fillRect(-tw / 2, ly, tw, 14);
        ctx.fillStyle = "#f0e6d8";
        ctx.fillText(label, 0, ly + 1);
        ctx.restore();
      }
    }
  }

  private drawMonster() {
    const m = this.sim.monster;
    const art = this.monsters.get(m.kind);
    if (art) {
      const hurt = this.monsterHurt;
      const dead = this.monsterDead;
      const size = this.monsterSize();
      const wobble = hurt > 0 ? Math.sin(this.time * 48) * hurt * 5 : 0;
      const x = this.monsterX - size / 2 + wobble;
      const y = this.monsterY - size * 0.9 + dead * 16;
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0.35, 1 - dead);
      this.ctx.drawImage(art, x, y, size, size);
      if (hurt > 0.4) {
        const flash = (hurt - 0.4) / 0.6;
        this.ctx.globalAlpha = flash * 0.42;
        this.ctx.fillStyle = this.strikeColor;
        this.ctx.beginPath();
        this.ctx.ellipse(x + size * 0.5, y + size * 0.46, size * 0.26, size * 0.32, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
      return;
    }
    const scale = (m.isBoss ? 0.92 : 0.8) * (this.h / 520);
    drawMonster(
      this.ctx,
      m.kind as MonsterKind,
      this.time,
      this.monsterX,
      this.monsterY,
      scale,
      this.monsterHurt,
      this.monsterDead,
    );
  }

  private drawBolts() {
    const ctx = this.ctx;
    for (const b of this.bolts) this.drawAttack(ctx, b);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  private drawAttack(ctx: CanvasRenderingContext2D, b: Bolt) {
    const arc = b.style === "arrow" || b.style === "frost" || b.style === "axe" ? 26 : b.style === "coin" || b.style === "gem" ? 14 : 0;
    const f = flight(b, arc);
    const traveling = b.style !== "lightning" && b.style !== "beam" && b.style !== "slash" && b.style !== "cut" && b.style !== "rift";
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (traveling && f.p < 0.86) {
      for (let i = 3; i >= 1; i--) {
        const ghost = flight({ ...b, life: Math.min(b.max * 0.98, b.life + b.max * 0.07 * i) }, arc);
        ctx.save();
        ctx.globalAlpha = 0.14;
        this.paintBody(ctx, b, ghost.x, ghost.y, ghost.ang, ghost.p);
        ctx.restore();
      }
    }
    ctx.globalAlpha = f.p > 0.92 ? Math.max(0, (1 - f.p) / 0.08) : 1;
    this.paintBody(ctx, b, f.x, f.y, f.ang, f.p);
    if (f.p > 0.84) {
      if (!b.struck) {
        b.struck = true;
        this.monsterHurt = 1;
        this.strikeColor = b.accent;
      }
      this.paintHit(ctx, b, (f.p - 0.84) / 0.16);
    }
    ctx.restore();
  }

  private paintBody(ctx: CanvasRenderingContext2D, b: Bolt, x: number, y: number, ang: number, p: number) {
    switch (b.style) {
      case "arrow":
      case "frost":
        this.paintArrow(ctx, x, y, ang, b.style === "frost");
        break;
      case "spear":
      case "gold":
        this.paintSpear(ctx, x, y, ang, b.color, b.accent);
        break;
      case "knife":
        this.paintKnife(ctx, x, y, ang);
        break;
      case "slash":
      case "cut":
      case "rift":
        this.paintSlash(ctx, p > 0.4 ? b.tx : x, p > 0.4 ? b.ty : y, p, b.color, b.accent);
        break;
      case "bash":
        this.paintBash(ctx, x, y, p, b.tx, b.ty);
        break;
      case "hammer":
      case "axe":
        this.paintHammer(ctx, x, y, ang, p, b.style === "axe");
        break;
      case "fire":
      case "ember":
        this.paintFire(ctx, b, x, y, b.style === "ember");
        break;
      case "soul":
      case "well":
        this.paintOrb(ctx, x, y, p, b.color, b.accent);
        break;
      case "lightning":
      case "beam":
        this.paintBolt(ctx, b.ox, b.oy, b.tx, b.ty, p, b.color, b.style === "beam");
        break;
      case "moon":
        this.paintMoon(ctx, x, y, ang);
        break;
      case "coin":
        this.paintCoin(ctx, x, y, p);
        break;
      case "glass":
      case "gem":
        this.paintShards(ctx, x, y, ang, p, b.style === "gem");
        break;
      case "vine":
        this.paintVine(ctx, x, y, ang);
        break;
      case "void":
      case "maw":
        this.paintMaw(ctx, p > 0.5 ? b.tx : x, p > 0.5 ? b.ty : y, p, b.style === "void");
        break;
      default:
        break;
    }
  }

  private paintHit(ctx: CanvasRenderingContext2D, b: Bolt, k: number) {
    ctx.save();
    ctx.translate(b.tx, b.ty);
    ctx.globalAlpha = (1 - k) * 0.9;
    if (b.style === "slash" || b.style === "cut" || b.style === "rift" || b.style === "knife" || b.style === "axe") {
      ctx.strokeStyle = b.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-18, -14);
      ctx.lineTo(20, 16);
      ctx.stroke();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (b.style === "hammer" || b.style === "bash") {
      ctx.strokeStyle = "#e7e2d6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 10, 10 + k * 28, 4 + k * 6, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (b.style === "fire" || b.style === "ember") {
      ctx.fillStyle = k < 0.4 ? "#fff1c2" : "#ff7a2a";
      ctx.beginPath();
      ctx.arc(0, 0, 8 + k * 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.style === "lightning" || b.style === "beam") {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * (10 + k * 18), Math.sin(a) * (10 + k * 18));
        ctx.stroke();
      }
    } else if (b.style === "frost" || b.style === "arrow" || b.style === "spear" || b.style === "gold") {
      ctx.strokeStyle = b.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 4 + k * 12, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = b.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 6 + k * 18, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private paintArrow(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, ice: boolean) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.scale(1.35, 1.35);
    ctx.fillStyle = ice ? "#d7f6ff" : "#c4a574";
    ctx.fillRect(-18, -1.4, 26, 2.8);
    ctx.fillStyle = ice ? "#7ecbff" : "#e8e4dc";
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(6, -5);
    ctx.lineTo(6, 5);
    ctx.fill();
    ctx.fillStyle = ice ? "#ffffff" : "#6fa86a";
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-10, -5);
    ctx.lineTo(-10, 5);
    ctx.fill();
    ctx.restore();
  }

  private paintSpear(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, head: string, wood: string) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.scale(1.3, 1.3);
    ctx.fillStyle = wood;
    ctx.fillRect(-22, -1.6, 30, 3.2);
    ctx.fillStyle = head;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(4, -6);
    ctx.lineTo(4, 6);
    ctx.fill();
    ctx.restore();
  }

  private paintKnife(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.scale(1.35, 1.35);
    ctx.fillStyle = "#1a1214";
    ctx.fillRect(-8, -1.2, 8, 2.4);
    ctx.fillStyle = "#f2f2f2";
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-2, -3.5);
    ctx.lineTo(-2, 3.5);
    ctx.fill();
    ctx.fillStyle = "#e23b4a";
    ctx.fillRect(-2, -1, 3, 2);
    ctx.restore();
  }

  private paintSlash(ctx: CanvasRenderingContext2D, x: number, y: number, p: number, color: string, accent: string) {
    const sweep = -0.9 + Math.min(1, p) * 1.8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sweep);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 7;
    ctx.globalAlpha *= 0.35;
    ctx.beginPath();
    ctx.arc(0, 0, 22, -0.9, 0.7);
    ctx.stroke();
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 22, -0.9, 0.7);
    ctx.stroke();
    ctx.restore();
  }

  private paintBash(ctx: CanvasRenderingContext2D, x: number, y: number, p: number, tx: number, ty: number) {
    const hit = p > 0.7;
    const px = hit ? tx : x;
    const py = hit ? ty : y;
    ctx.save();
    ctx.translate(px, py);
    ctx.fillStyle = "#9aa3b2";
    ctx.beginPath();
    ctx.arc(0, 0, hit ? 16 : 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f4f7fb";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  private paintHammer(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, p: number, axe: boolean) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang + p * (axe ? 14 : 10));
    ctx.scale(1.25, 1.25);
    ctx.fillStyle = "#8d6a45";
    ctx.fillRect(-3, -16, 6, 22);
    ctx.fillStyle = axe ? "#d7dde6" : "#c5ccd4";
    if (axe) {
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(16, -6);
      ctx.lineTo(0, 2);
      ctx.lineTo(-4, -6);
      ctx.fill();
    } else {
      ctx.fillRect(-12, -20, 24, 10);
    }
    ctx.restore();
  }

  private paintFire(ctx: CanvasRenderingContext2D, b: Bolt, x: number, y: number, ember: boolean) {
    const dx = b.tx - b.ox;
    const dy = b.ty - b.oy;
    for (let i = 3; i >= 1; i--) {
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = ember ? "#ffd27a" : "#ff5a1f";
      ctx.beginPath();
      ctx.arc(x - dx * i * 0.06, y - dy * i * 0.06, 7 - i, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = ember ? "#ff9a3c" : "#ff7a2a";
    ctx.beginPath();
    ctx.arc(x, y, ember ? 7 : 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff1c2";
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private paintOrb(ctx: CanvasRenderingContext2D, x: number, y: number, p: number, color: string, accent: string) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 12, p * 6, p * 6 + 1.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 12, p * 6 + Math.PI, p * 6 + Math.PI + 1.2);
    ctx.stroke();
  }

  private paintBolt(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, p: number, color: string, beam: boolean) {
    if (beam) {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + (x1 - x0) * p, y0 + (y1 - y0) * p);
      ctx.stroke();
      ctx.strokeStyle = "#fff6c8";
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }
    const segs = 7;
    ctx.strokeStyle = "#7ec8ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    for (let i = 1; i <= segs; i++) {
      const t = (i / segs) * p;
      const wob = i === segs || t >= p ? 0 : Math.sin(this.time * 40 + i * 2.2) * 12;
      ctx.lineTo(x0 + (x1 - x0) * t + wob, y0 + (y1 - y0) * t + wob * 0.4);
    }
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  private paintMoon(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = "#f7f8ff";
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0.5, Math.PI * 2 - 0.5);
    ctx.arc(4, 0, 7, Math.PI * 2 - 0.6, 0.6, true);
    ctx.fill();
    ctx.restore();
  }

  private paintCoin(ctx: CanvasRenderingContext2D, x: number, y: number, p: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(Math.cos(p * 16), 1);
    ctx.fillStyle = "#f0c14a";
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff1c2";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  private paintShards(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, p: number, gem: boolean) {
    const colors = gem ? ["#ff4fa3", "#7cf0ff", "#b388ff"] : ["#e8fffb", "#9aefff", "#ffffff"];
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(x, y + (i - 1) * 10);
      ctx.rotate(ang + (i - 1) * 0.25 + p);
      ctx.fillStyle = colors[i]!;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-6, -4);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-6, 4);
      ctx.fill();
      ctx.restore();
    }
  }

  private paintVine(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.strokeStyle = "#3f8f45";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-14, 2);
    ctx.quadraticCurveTo(-4, -6, 8, 0);
    ctx.stroke();
    ctx.fillStyle = "#8fe07a";
    ctx.beginPath();
    ctx.ellipse(10, 0, 6, 3.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private paintMaw(ctx: CanvasRenderingContext2D, x: number, y: number, p: number, voidBite: boolean) {
    const open = Math.sin(Math.min(1, p) * Math.PI) * 10;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = voidBite ? "#120818" : "#4a0c16";
    ctx.beginPath();
    ctx.ellipse(0, -open * 0.15, 12, 7 + open * 0.2, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, open * 0.35, 12, 6 + open * 0.15, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = voidBite ? "#c4b5fd" : "#ff6b6b";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 4, -2);
      ctx.lineTo(i * 4 + 1.5, 3);
      ctx.lineTo(i * 4 - 1.5, 3);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.max);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      if (p.kind === "coin") {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }

  private drawFloaters() {
    const ctx = this.ctx;
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.max(0, f.life / f.max);
      ctx.fillStyle = f.color;
      ctx.font = f.crit ? "700 16px Outfit, sans-serif" : "600 13px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }
}
