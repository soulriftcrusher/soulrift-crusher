import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNum, formatTime } from "@/game/format";
import { WHEEL_SLICES, type WheelSlice } from "@/game/cash";
import { sfx, unlockAudio } from "@/game/audio";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

const SLICE = 360 / WHEEL_SLICES.length;

export function WheelPage({ onClose }: { onClose: () => void }) {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [hit, setHit] = useState<WheelSlice | null>(null);
  const rot = useRef(0);
  const live = useRef(true);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  function spin(paid: boolean) {
    if (spinning) return;
    unlockAudio();
    const out = sim.spinWheel(paid);
    if (!out) {
      sfx.fail();
      refresh();
      return;
    }
    const idx = Math.max(0, WHEEL_SLICES.findIndex((s) => s.id === out.id));
    const target = 360 * 6 + (360 - (idx * SLICE + SLICE / 2));
    rot.current = target;
    setSpinning(true);
    setHit(null);
    setAngle(target);
    sfx.ui();
    window.setTimeout(() => {
      if (!live.current) return;
      setSpinning(false);
      setHit(out);
      if (out.jackpot) sfx.win();
      else sfx.chest();
      refresh();
    }, 3200);
  }

  return (
    <div className="pt-1">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg text-gold">Fortune wheel</p>
        <button type="button" className="h-11 px-3 text-sm text-gold" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="mt-1 text-sm text-muted">
        Jackpot {((snap.wheelChance ?? 0.02) * 100).toFixed(1)}%. Gem spins raise it. Hit it, or wait 24h, and it drops back to 2%.
      </p>
      <p className="text-[11px] text-muted">
        Pot {formatNum(snap.wheelPot)} gems
        {snap.wheelDecayIn > 0 ? ` · chance drops in ${formatTime(snap.wheelDecayIn / 1000)}` : ""}
      </p>
      <div className="relative mx-auto mt-4 size-64">
        <div className="absolute left-1/2 top-0 z-10 h-4 w-3 -translate-x-1/2 rounded-b-sm bg-gold" />
        <div
          className="size-64 rounded-full border-4 border-gold shadow-[0_0_24px_rgba(212,180,131,0.25)]"
          style={{
            background: conic(),
            transform: `rotate(${angle}deg)`,
            transition: spinning ? "transform 3.1s cubic-bezier(0.12, 0.7, 0.08, 1)" : "none",
          }}
        />
        <div className="pointer-events-none absolute inset-8 grid place-items-center rounded-full border border-gold/40 bg-bg/80">
          <p className="font-display text-center text-sm text-gold">{formatNum(snap.wheelPot)}</p>
          <p className="text-[10px] text-muted">JACKPOT</p>
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-1 text-[11px] text-muted">
        {WHEEL_SLICES.map((s) => (
          <li key={s.id} className={cn(s.jackpot && "text-gold")}>
            {s.name}
            {s.jackpot ? ` · ${((snap.wheelChance ?? 0.02) * 100).toFixed(1)}%` : ""}
          </li>
        ))}
      </ul>
      {hit ? (
        <p className="mt-3 text-center font-display text-gold">
          {hit.jackpot ? hit.name : `Landed · ${hit.name}`}
        </p>
      ) : null}
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
      <p className="mt-2 text-center text-[11px] text-muted">
        80% of gems spent go into the pot. Chance +0.5% per gem spin, cap 20%. Resets to 2% on jackpot or after 24h.
      </p>
    </div>
  );
}

function conic(): string {
  const n = WHEEL_SLICES.length;
  const bits = WHEEL_SLICES.map((s, i) => {
    const a = (i / n) * 360;
    const b = ((i + 1) / n) * 360;
    const c = s.jackpot ? "#d4b483" : i % 2 === 0 ? "#2a1f1c" : "#1a1413";
    return `${c} ${a}deg ${b}deg`;
  });
  return `conic-gradient(from -90deg, ${bits.join(", ")})`;
}
