import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { sfx, unlockAudio } from "@/game/audio";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";

const CUTS = 5;
const SPEED = 1.15;
/** Half-width of the top ember. ~25% of the ring — hittable on a phone. */
const WIN = 0.8;

function wrapPi(a: number): number {
  let d = a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function SummonGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hits, setHits] = useState(0);
  const [cuts, setCuts] = useState(0);
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [result, setResult] = useState("");
  const [flashText, setFlashText] = useState("Cut when the needle hits the glow");
  const angle = useRef(Math.PI); // start opposite the window so they see it coming
  const raf = useRef(0);
  const hitsRef = useRef(0);
  const cutsRef = useRef(0);
  const hot = useRef(false);
  const flash = useRef(0);
  const playing = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playing.current) angle.current += dt * SPEED;
      const a = wrapPi(angle.current);
      hot.current = Math.abs(a) <= WIN;
      flash.current = Math.max(0, flash.current - dt * 3);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2 + 6);
      const glow = ctx.createRadialGradient(0, 0, 8, 0, 0, 130);
      glow.addColorStop(0, `rgba(196,92,74,${hot.current ? 0.35 : 0.12 + flash.current * 0.4})`);
      glow.addColorStop(1, "rgba(12,10,11,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(240,230,216,0.2)";
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = hot.current ? "#f0e6d8" : "#e8a090";
      ctx.lineWidth = hot.current ? 24 : 18;
      ctx.beginPath();
      ctx.arc(0, 0, 90, -Math.PI / 2 - WIN, -Math.PI / 2 + WIN);
      ctx.stroke();
      ctx.rotate(a);
      ctx.strokeStyle = "#f0e6d8";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.lineTo(0, -72);
      ctx.stroke();
      ctx.fillStyle = hot.current ? "#f0e6d8" : "#c45c4a";
      ctx.beginPath();
      ctx.arc(0, -78, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  function tap() {
    if (!playing.current) return;
    unlockAudio();
    const good = hot.current;
    if (good) {
      hitsRef.current += 1;
      flash.current = 1;
      sfx.hit(true);
      setFlashText("TRUE CUT");
    } else {
      sfx.fail();
      setFlashText("Miss — wait for the top glow");
    }
    cutsRef.current += 1;
    setHits(hitsRef.current);
    setCuts(cutsRef.current);
    if (cutsRef.current >= CUTS) {
      playing.current = false;
      const out = sim.summon(hitsRef.current);
      useGame.getState().refresh();
      setPhase("done");
      setResult(out ? out.name : "The well was silent — need gems.");
      setFlashText(hitsRef.current ? `${hitsRef.current} true cut${hitsRef.current === 1 ? "" : "s"}` : "No true cuts");
      if (out?.kind === "hero") sfx.win();
      else sfx.chest();
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center">
      <button type="button" className="absolute inset-0 z-0 bg-bg/80" aria-label="Close" onClick={onClose} />
      <div
        className="relative z-10 m-3 w-[min(100%-1.5rem,420px)] overflow-hidden rounded-xl border border-border bg-surface"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <img src="/bg/well.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-40" crossOrigin="anonymous" />
        <div className="relative p-5">
          <h2 className="font-display text-lg font-semibold">Soul Well</h2>
          <p className="mt-1 text-sm text-[#f0e6d8]/85">
            Wait until the needle is in the glowing arc at the <strong>top</strong>, then hit Cut. Five swings. Hits summon rarer heroes. Pity {useGame.getState().snap.pity}/{useGame.getState().snap.pityAt} — a hero is guaranteed at {useGame.getState().snap.pityAt}.
          </p>
          <button type="button" className="relative mt-3 block w-full" onClick={tap}>
            <canvas ref={canvasRef} width={320} height={220} className="mx-auto block w-full" />
            <span className="pointer-events-none absolute inset-x-0 top-2 text-center font-display text-sm text-gold">
              {flashText}
            </span>
          </button>
          <p className="text-center text-sm tabular-nums text-[#f0e6d8]">
            True cuts {hits} / {CUTS} · swings left {Math.max(0, CUTS - cuts)}
          </p>
          {phase === "play" ? (
            <Button className="mt-3 h-12 w-full" onClick={tap}>
              Cut
            </Button>
          ) : (
            <>
              <p className="mt-3 text-center font-display text-lg">{result}</p>
              <Button className="mt-3 h-12 w-full" onClick={onClose}>
                Stay
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
