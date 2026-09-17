import { drawMonster } from "./draw-creatures";
import { formatNum } from "./format";
import type { HeroId, MonsterKind } from "./data";
import { HEROES } from "./data";
import type { GameSim } from "./sim";
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

type Bolt = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  life: number;
  max: number;
  color: string;
  heroId: HeroId;
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
      void loadImage(`/portraits/${h.id}.jpg`)
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
          artCache.set(h.id, { img, sheet: isWalkSheet(img) });
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
    "/bg/realms-page.jpg?v=2",
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

function boltColor(id: HeroId): string {
  const map: Partial<Record<HeroId, string>> = {
    kael: "#c45c4a",
    lyra: "#9bb7c9",
    vex: "#e8a090",
    iskra: "#d4b483",
    nyx: "#9bb7c9",
    sable: "#8a7e74",
  };
  return map[id] ?? "#d4b483";
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
  private heroLunge: Record<string, number> = {};
  private reduced = false;
  private shakeOn = true;
  private showNames = true;
  private splash = "#e8a090";
  private onHud: (() => void) | null = null;
  private hudAcc = 0;
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
            const art = { img, sheet: isWalkSheet(img) };
            this.sheets.set(h.id, art);
            artCache.set(h.id, art);
          })
          .catch(() =>
            loadImage(`/portraits/${h.id}.jpg`)
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
      ["crypt", "/bg/crypt.jpg"],
      ["frost", "/bg/frost.jpg"],
      ["ember", "/bg/ember.jpg"],
      ["void", "/bg/void.jpg"],
      ["soulwell", "/bg/soulwell.jpg"],
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
        loadImage(`/sprites/monsters/${kind}.png`)
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
    if (now - this.resizeAt < 250 && this.w > 1) return;
    this.resizeAt = now;
    const rect = this.canvas.getBoundingClientRect();
    const raw = window.devicePixelRatio || 1;
    // Phone is ~2.8x; old 1.15 cap made everyone look smeared.
    let dpr = Math.min(2, Math.max(1, raw));
    let w = Math.max(1, Math.floor(rect.width * dpr));
    let h = Math.max(1, Math.floor(rect.height * dpr));
    const maxPx = 2_200_000;
    const area = w * h;
    if (area > maxPx) {
      const s = Math.sqrt(maxPx / area);
      w = Math.max(1, Math.floor(w * s));
      h = Math.max(1, Math.floor(h * s));
    }
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.w = w;
    this.h = h;
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";
  }

  private tick(dt: number) {
    this.resize();
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      if (this.paint && document.visibilityState === "visible") this.draw();
      return;
    }
    this.acc += dt;
    const step = 1 / 60;
    while (this.acc >= step) {
      this.sim.step(step);
      this.acc -= step;
      this.time += step;
    }
    this.present(dt);
    this.hudAcc += dt;
    if (this.hudAcc >= 0.25) {
      this.hudAcc = 0;
      this.onHud?.();
    }
    if (this.paint && document.visibilityState === "visible") this.draw();
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

    for (const b of this.bolts) {
      b.life -= dt;
      const u = 1 - b.life / b.max;
      b.x += (b.tx - b.x) * Math.min(1, u * 3);
      b.y += (b.ty - b.y) * Math.min(1, u * 3);
    }
    this.bolts = this.bolts.filter((b) => b.life > 0).slice(this.reduced ? -2 : -8);

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
      this.trauma = Math.min(1, this.trauma + (e.crit ? 0.45 : 0.18));
      if (e.crit && !this.reduced) this.hitstop = 0.045;
      if (this.paint) sfx.hit(e.crit);
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
      if (this.paint) sfx.hit(true);
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
    } else if (e.type === "heroAttack" && e.heroId && this.paint && !this.reduced && this.bolts.length < 8) {
      const pos = this.heroPos(e.heroId);
      if (pos) {
        this.bolts.push({
          x: pos.x,
          y: pos.y - 40 * pos.scale,
          tx: mx,
          ty: my,
          life: 0.22,
          max: 0.22,
          color: boltColor(e.heroId),
          heroId: e.heroId,
        });
        this.heroLunge[e.heroId] = 1;
      }
    }
  }

  private hiredIds(): HeroId[] {
    return HERO_ORDER.filter(
      (h) => (this.sim.state.heroLevel[h] ?? 0) > 0 && !this.sim.isDown(h),
    ).slice(0, 10);
  }

  private heroPos(id: HeroId): { x: number; y: number; scale: number; row: number } | null {
    const hired = this.hiredIds();
    const i = hired.indexOf(id);
    if (i < 0) return null;
    const n = hired.length;
    const front = Math.min(5, n);
    const back = Math.max(0, n - front);
    const inBack = i < back;
    const row = inBack ? 1 : 0;
    const slot = inBack ? i : i - back;
    const cols = inBack ? back : front;
    const gap = cols >= 5 ? 0.085 : cols >= 4 ? 0.1 : 0.12;
    const left = 0.26 + (inBack ? 0.03 : 0);
    const x = this.w * (left + slot * gap);
    const scale = (row === 1 ? 0.9 : 1.12) * Math.min(1.36, this.h / 520);
    const lift = row === 1 ? Math.max(36, Math.min(58, this.h * 0.09)) : 0;
    const y = this.groundY - 8 - lift;
    return { x, y, scale, row };
  }

  private draw() {
    const ctx = this.ctx;
    const w = this.w;
    const h = this.h;
    this.groundY = Math.min(h * 0.78, h - 128);
    const n = this.hiredIds().length;
    const crowd = Math.max(0, Math.min(1, (n - 3) / 7));
    this.monsterX = w * (0.62 + crowd * 0.24);
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
      const lunge = this.heroLunge[id] ?? 0;
      const bob = Math.sin(t * 2.4 + id.charCodeAt(0)) * 2.4 * pos.scale;
      const dw = Math.round(118 * pos.scale);
      const dh = Math.round(118 * pos.scale);
      ctx.save();
      ctx.translate(pos.x + lunge * 16 * pos.scale, pos.y + bob);
      // Walk sheets face the beast (right). Portraits face left — flip those.
      if (!art.sheet) ctx.scale(-1, 1);
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
      const def = HEROES.find((h) => h.id === id);
      if (def && this.showNames && hired.length <= 6) {
        ctx.save();
        ctx.translate(pos.x + lunge * 16 * pos.scale, pos.y + bob);
        ctx.font = `600 ${Math.max(10, Math.floor(11 * pos.scale))}px Outfit, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const label = def.name;
        const tw = Math.max(36, ctx.measureText(label).width + 10);
        const ly = pos.row === 1 ? -dh - 4 : 6;
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
      const base = Math.min(this.w, this.h);
      const size = Math.round(base * 0.26 * (m.isBoss ? 1.12 : 0.95) * (m.artScale || 1));
      const wobble = hurt > 0 ? Math.sin(this.time * 48) * hurt * 5 : 0;
      const x = this.monsterX - size / 2 + wobble;
      const y = this.monsterY - size * 0.9 + dead * 16;
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0.35, 1 - dead);
      this.ctx.drawImage(art, x, y, size, size);
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
    for (const b of this.bolts) {
      const a = b.life / b.max;
      ctx.strokeStyle = b.color;
      ctx.globalAlpha = a;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.tx, b.ty);
      ctx.stroke();
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x + (b.tx - b.x) * (1 - a), b.y + (b.ty - b.y) * (1 - a), 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
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
