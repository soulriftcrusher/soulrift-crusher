type Bus = {
  ctx: AudioContext;
  master: GainNode;
  sfx: GainNode;
  music: GainNode;
};

let bus: Bus | null = null;
let muted = false;
let drone: { stop: () => void } | null = null;

function now(): number {
  return bus?.ctx.currentTime ?? 0;
}

function envGain(duration: number, peak: number, attack = 0.008): GainNode {
  if (!bus) throw new Error("audio locked");
  const g = bus.ctx.createGain();
  const t = now();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  g.connect(bus.sfx);
  return g;
}

function tone(freq: number, type: OscillatorType, duration: number, peak: number, detune = 0) {
  if (!bus) return;
  const osc = bus.ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now());
  if (detune) osc.detune.setValueAtTime(detune, now());
  const g = envGain(duration, peak);
  osc.connect(g);
  osc.start();
  osc.stop(now() + duration + 0.02);
  osc.onended = () => {
    osc.disconnect();
    g.disconnect();
  };
}

function noise(duration: number, peak: number, hp = 400) {
  if (!bus) return;
  const n = Math.floor(bus.ctx.sampleRate * duration);
  const buf = bus.ctx.createBuffer(1, n, bus.ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
  const src = bus.ctx.createBufferSource();
  src.buffer = buf;
  const filter = bus.ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = hp;
  const g = envGain(duration, peak, 0.004);
  src.connect(filter);
  filter.connect(g);
  src.start();
  src.stop(now() + duration + 0.02);
  src.onended = () => {
    src.disconnect();
    filter.disconnect();
    g.disconnect();
  };
}

export function unlockAudio(): void {
  if (!bus) {
    const ctx = new AudioContext({ latencyHint: "interactive" });
    const master = ctx.createGain();
    const sfx = ctx.createGain();
    const music = ctx.createGain();
    sfx.gain.value = 0.7;
    music.gain.value = 0.22;
    master.gain.value = muted ? 0 : 0.9;
    sfx.connect(master);
    music.connect(master);
    master.connect(ctx.destination);
    bus = { ctx, master, sfx, music };
  }
  if (bus.ctx.state === "suspended") void bus.ctx.resume();
  startDrone();
}

export function setMuted(next: boolean): void {
  muted = next;
  if (bus) bus.master.gain.setTargetAtTime(next ? 0 : 0.9, now(), 0.04);
}

export function isMuted(): boolean {
  return muted;
}

function startDrone() {
  if (!bus || drone) return;
  const ctx = bus.ctx;
  const oscA = ctx.createOscillator();
  const oscB = ctx.createOscillator();
  oscA.type = "sine";
  oscB.type = "sine";
  oscA.frequency.value = 55;
  oscB.frequency.value = 82.4;
  const g = ctx.createGain();
  g.gain.value = 0.07;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 240;
  oscA.connect(g);
  oscB.connect(g);
  g.connect(filter);
  filter.connect(bus.music);
  oscA.start();
  oscB.start();
  drone = {
    stop: () => {
      oscA.stop();
      oscB.stop();
      oscA.disconnect();
      oscB.disconnect();
      g.disconnect();
      filter.disconnect();
    },
  };
}

export function resumeAudio(): void {
  if (bus?.ctx.state === "suspended") void bus.ctx.resume();
}

export const sfx = {
  hit(crit: boolean) {
    const rate = 1 + (Math.random() * 2 - 1) * 0.08;
    noise(0.05, crit ? 0.18 : 0.1, crit ? 900 : 500);
    tone((crit ? 420 : 220) * rate, "square", 0.07, crit ? 0.08 : 0.045);
    if (crit) tone(840 * rate, "triangle", 0.09, 0.04);
  },
  hammer() {
    noise(0.08, 0.22, 120);
    tone(90, "sawtooth", 0.12, 0.12);
    tone(180, "square", 0.07, 0.05);
  },
  gold() {
    const rate = 1 + (Math.random() * 2 - 1) * 0.06;
    tone(880 * rate, "sine", 0.08, 0.05);
    tone(1320 * rate, "sine", 0.1, 0.03);
  },
  kill(boss: boolean) {
    tone(boss ? 90 : 160, "sawtooth", 0.18, boss ? 0.12 : 0.06);
    noise(0.12, boss ? 0.16 : 0.08, 200);
  },
  skill() {
    tone(196, "triangle", 0.16, 0.07);
    tone(392, "sine", 0.2, 0.05);
  },
  ritual() {
    tone(65, "sawtooth", 0.4, 0.1);
    tone(98, "triangle", 0.5, 0.08);
    tone(130, "sine", 0.55, 0.05);
  },
  ui() {
    tone(520, "sine", 0.05, 0.03);
  },
  fail() {
    tone(110, "square", 0.2, 0.07);
    tone(82, "sawtooth", 0.28, 0.05);
  },
  hire() {
    tone(330, "triangle", 0.1, 0.05);
    tone(495, "sine", 0.14, 0.04);
  },
  chest() {
    tone(262, "triangle", 0.12, 0.06);
    tone(392, "sine", 0.16, 0.05);
    tone(523, "sine", 0.18, 0.03);
  },
  win() {
    tone(330, "triangle", 0.12, 0.07);
    tone(440, "sine", 0.16, 0.05);
    tone(660, "sine", 0.22, 0.04);
  },
  claim() {
    tone(494, "sine", 0.1, 0.05);
    tone(740, "triangle", 0.14, 0.04);
  },
};
