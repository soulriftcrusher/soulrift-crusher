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
const FILLS = ["#f4c44a", "#e4453a", "#3ec8d4", "#ef7a32", "#e8b84a", "#2fba6e", "#3d7fd6", "#f0b429"];

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

      <div className="relative mx-auto mt-1 aspect-square w-full max-w-[21rem]">
        <svg viewBox="0 0 200 200" className="absolute inset-[14%] size-auto">
          <defs>
            <radialGradient id="wheelGloss" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fff6ee" stopOpacity="0.4" />
              <stop offset="55%" stopColor="#fff6ee" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hubGem" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff1c8" />
              <stop offset="40%" stopColor="#e4453a" />
              <stop offset="100%" stopColor="#7a1810" />
            </radialGradient>
          </defs>
          <g
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: "100px 100px",
              transition: spinning ? "transform 4s cubic-bezier(0.12, 0.75, 0.08, 1)" : "none",
            }}
          >
            {WHEEL_SLICES.map((s, i) => (
              <g key={s.id}>
                <path d={slicePath(i)} fill={FILLS[i % FILLS.length]} stroke="#5a2010" strokeWidth="1.4" />
                <path d={slicePath(i)} fill="url(#wheelGloss)" />
                <g transform={`rotate(${i * SLICE + SLICE / 2} 100 100)`}>
                  <image href={`/wheel/${s.id}.png`} x="88" y="28" width="24" height="24" />
                </g>
              </g>
            ))}
          </g>
          <circle cx="100" cy="100" r="22" fill="#f4c44a" />
          <circle cx="100" cy="100" r="18" fill="url(#hubGem)" stroke="#5a2010" strokeWidth="2" />
        </svg>
        <img
          src="/wheel/rim.png"
          alt=""
          className="pointer-events-none absolute inset-0 z-10 size-full object-contain"
          crossOrigin="anonymous"
        />
        <div className="pointer-events-none absolute top-[7%] left-1/2 z-20 -translate-x-1/2 drop-shadow">
          <svg width="36" height="40" viewBox="0 0 36 40" aria-hidden>
            <polygon points="18,40 2,4 34,4" fill="#7a1810" />
            <polygon points="18,36 6,6 30,6" fill="#f4c44a" />
            <polygon points="18,28 12,8 24,8" fill="#e4453a" />
            <circle cx="18" cy="14" r="3.5" fill="#fff6ee" />
          </svg>
        </div>
      </div>

      {hit ? (
        <p className="mt-2 text-center font-display text-lg text-gold">Landed · {hit.name}</p>
      ) : (
        <p className="mt-2 text-center text-xs text-muted">
          {spinning ? "The wheel is turning…" : "Tap a spin. The pointer at the top is the prize."}
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button
          className="h-12 rounded-xl border-2 border-gold bg-accent font-display text-base shadow-[0_4px_0_#7a1810]"
          disabled={spinning || !snap.wheelReady}
          onClick={() => spin(false)}
        >
          {snap.wheelReady ? "Free spin" : `Free in ${formatTime(snap.wheelFreeIn / 1000)}`}
        </Button>
        <Button
          variant="secondary"
          className="h-12 rounded-xl border-2 border-gold bg-gold text-parchment-ink font-display text-base shadow-[0_4px_0_#5a3018]"
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

function slicePath(i: number): string {
  const r = 98;
  const a0 = (i / N) * Math.PI * 2 - Math.PI / 2;
  const a1 = ((i + 1) / N) * Math.PI * 2 - Math.PI / 2;
  const x0 = 100 + Math.cos(a0) * r;
  const y0 = 100 + Math.sin(a0) * r;
  const x1 = 100 + Math.cos(a1) * r;
  const y1 = 100 + Math.sin(a1) * r;
  return `M 100 100 L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`;
}
