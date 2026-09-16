import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/game/format";
import { WHEEL_SLICES, type WheelSlice } from "@/game/cash";
import { adsRewardedOn, showRewardedAd } from "@/game/ads";
import { sfx, unlockAudio } from "@/game/audio";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";

const N = WHEEL_SLICES.length;
const SLICE = 360 / N;
const FILLS = [
  "var(--color-gold)",
  "var(--color-accent)",
  "var(--color-hp)",
  "var(--color-soul)",
  "var(--color-wood)",
  "var(--color-parchment)",
  "var(--color-ember)",
  "var(--color-frame)",
];
const INK = ["#2a1a10", "#fff6ee", "#102010", "#102028", "#fff6ee", "#2a1a10", "#fff6ee", "#1a1208"];

export function WheelPage({ onClose }: { onClose: () => void }) {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [hit, setHit] = useState<WheelSlice | null>(null);
  const [watchBusy, setWatchBusy] = useState(false);
  const rot = useRef(0);
  const live = useRef(true);
  const tickRef = useRef(0);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      window.clearInterval(tickRef.current);
    };
  }, []);

  function spinTo(out: WheelSlice) {
    const idx = Math.max(0, WHEEL_SLICES.findIndex((s) => s.id === out.id));
    const mid = idx * SLICE + SLICE / 2;
    const cur = ((rot.current % 360) + 360) % 360;
    const need = (360 - mid - cur + 360) % 360;
    rot.current += 360 * 6 + need;
    setSpinning(true);
    setHit(null);
    setAngle(rot.current);
    window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => sfx.tick(), 90);
    window.setTimeout(() => {
      window.clearInterval(tickRef.current);
      if (!live.current) return;
      setSpinning(false);
      setHit(out);
      if (out.jackpot) sfx.win();
      else sfx.chest();
      refresh();
    }, 4200);
  }

  function spin(paid: boolean) {
    if (spinning) return;
    unlockAudio();
    const out = sim.spinWheel(paid);
    if (!out) {
      sfx.fail();
      refresh();
      return;
    }
    sfx.ui();
    spinTo(out);
  }

  async function watchSpin() {
    if (spinning || watchBusy || !adsRewardedOn()) return;
    setWatchBusy(true);
    unlockAudio();
    try {
      const ok = await showRewardedAd();
      if (!ok) {
        sfx.fail();
        return;
      }
      const out = sim.spinWheel(false) ?? sim.spinWheel(true);
      if (out) spinTo(out);
    } finally {
      setWatchBusy(false);
    }
  }

  return (
    <div className="pt-1">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg text-gold">Fortune wheel</p>
        <button type="button" className="h-11 px-3 text-sm text-gold" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="mt-1 text-sm text-muted">One free spin a day. Extra spins cost gems. Watch it go.</p>
      <div className="relative mx-auto mt-3 size-72">
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="h-0 w-0 border-x-[10px] border-t-[22px] border-x-transparent border-t-gold drop-shadow" />
        </div>
        <svg viewBox="0 0 200 200" className="size-72 drop-shadow-[0_0_18px_rgba(201,162,39,0.35)]">
          <circle cx="100" cy="100" r="98" fill="var(--color-frame)" />
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: "100px 100px",
              transition: spinning ? "transform 4s cubic-bezier(0.12, 0.75, 0.08, 1)" : "none",
            }}
          >
            {WHEEL_SLICES.map((s, i) => (
              <g key={s.id}>
                <path d={slicePath(i)} fill={FILLS[i % FILLS.length]} stroke="rgba(20,12,8,0.55)" strokeWidth="0.8" />
                <text
                  x="100"
                  y="42"
                  textAnchor="middle"
                  fill={INK[i % INK.length]}
                  fontSize="7.5"
                  fontFamily="Cinzel, serif"
                  fontWeight="700"
                  transform={`rotate(${i * SLICE + SLICE / 2} 100 100)`}
                >
                  {shortName(s.name)}
                </text>
              </g>
            ))}
            {Array.from({ length: 16 }, (_, i) => {
              const a = ((i + 0.5) / 16) * Math.PI * 2 - Math.PI / 2;
              return <circle key={i} cx={100 + Math.cos(a) * 94} cy={100 + Math.sin(a) * 94} r="2.2" fill="#f3e2a8" />;
            })}
          </g>
          <circle cx="100" cy="100" r="22" fill="var(--color-surface)" stroke="var(--color-gold)" strokeWidth="3" />
          <text x="100" y="104" textAnchor="middle" fill="var(--color-gold)" fontSize="8" fontFamily="Cinzel, serif">
            SPIN
          </text>
        </svg>
      </div>
      {hit ? (
        <p className="mt-2 text-center font-display text-lg text-gold">Landed · {hit.name}</p>
      ) : (
        <p className="mt-2 text-center text-xs text-muted">{spinning ? "The wheel is turning…" : "Tap a spin. The pointer at the top is the prize."}</p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button className="h-12" disabled={spinning || !snap.wheelReady} onClick={() => spin(false)}>
          {snap.wheelReady ? "Free spin" : `Free in ${formatTime(snap.wheelFreeIn / 1000)}`}
        </Button>
        <Button
          variant="secondary"
          className="h-12"
          disabled={spinning || snap.gems < snap.wheelCost}
          onClick={() => spin(true)}
        >
          Spin · {snap.wheelCost} gems
        </Button>
      </div>
      {adsRewardedOn() ? (
        <Button className="mt-2 h-12 w-full" disabled={spinning || watchBusy} onClick={() => void watchSpin()}>
          {watchBusy ? "Loading ad…" : "Watch for a spin"}
        </Button>
      ) : (
        <p className="mt-2 text-center text-[11px] text-muted">Rewarded spins turn on when ads go live. No fake ads.</p>
      )}
    </div>
  );
}

function shortName(name: string): string {
  return name.replace(" pinch", "").replace("A ", "");
}

function slicePath(i: number): string {
  const r = 92;
  const a0 = (i / N) * Math.PI * 2 - Math.PI / 2;
  const a1 = ((i + 1) / N) * Math.PI * 2 - Math.PI / 2;
  const x0 = 100 + Math.cos(a0) * r;
  const y0 = 100 + Math.sin(a0) * r;
  const x1 = 100 + Math.cos(a1) * r;
  const y1 = 100 + Math.sin(a1) * r;
  return `M 100 100 L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`;
}
