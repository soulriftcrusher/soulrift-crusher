import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNum, formatTime } from "@/game/format";
import { monthReward, WATCH_GEMS, BP_PREMIUM } from "@/game/liveops";
import { sim } from "@/game/sim";
import { sfx, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import { prizeArt } from "@/game/prize-art";
import { cn } from "@/lib/utils";

export function HuntCalendar() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const today = monthReward(snap.monthDay);
  const prize = today.gems || today.chests;
  let next = 0;
  for (let d = snap.monthDay; d <= 31; d++) {
    const r = monthReward(d);
    if (r.gems || r.chests) {
      next = d;
      break;
    }
  }
  return (
    <div>
      <div className="overflow-hidden rounded-xl border-2 border-gold/50 bg-[#1a100c]/92 p-3 shadow-[0_6px_0_#3a1c10]">
        <div className="flex items-center gap-3">
          <img src="/shop/login-flame.jpg" alt="" className="size-14 rounded-lg object-cover" crossOrigin="anonymous" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg text-gold">Month stamps · day {snap.monthDay}</p>
            <p className="text-xs text-[#f0e6d8]">
              {prize
                ? `${today.gems ? `${today.gems} gem${today.gems === 1 ? "" : "s"}` : ""}${today.chests ? `${today.gems ? " · " : ""}${today.chests} chest${today.chests > 1 ? "s" : ""}` : ""}`
                : next
                  ? `Rest day. Next prize is day ${next}.`
                  : "Rest day."}
            </p>
          </div>
        </div>
        <Button
          className="mt-3 h-12 w-full font-display"
          disabled={!snap.monthReady}
          onClick={() => {
            unlockAudio();
            if (sim.claimMonth()) {
              sfx.chest();
              refresh();
            }
          }}
        >
          {snap.monthReady ? "Stamp today" : "Already stamped"}
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
          const r = monthReward(d);
          const hit = snap.monthHits.includes(d);
          const now = d === snap.monthDay;
          const loot = r.gems > 0 || r.chests > 0;
          return (
            <div
              key={d}
              className={cn(
                "relative min-h-[3.6rem] overflow-hidden rounded-lg border p-1 text-center",
                now ? "login-today border-gold bg-gold/15" : "border-gold/20 bg-bg/70",
                hit ? "opacity-70" : "",
              )}
            >
              <p className="text-[10px] tabular-nums text-gold">{d}</p>
              {loot ? (
                <img
                  src={r.chests ? prizeArt("chest") : prizeArt("gems")}
                  alt=""
                  className="mx-auto size-7 object-contain"
                  crossOrigin="anonymous"
                />
              ) : (
                <p className="mt-1 text-[9px] text-muted">—</p>
              )}
              {hit ? (
                <img
                  src="/shop/login-seal.jpg"
                  alt=""
                  className="pointer-events-none absolute inset-0 size-full object-cover opacity-75"
                  crossOrigin="anonymous"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HuntPass() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  return (
    <div className="rounded-lg border border-border bg-bg/40 p-4">
      <p className="text-xs tracking-wide text-gold uppercase">
        Battle pass · rank {snap.bpRank}/{snap.bpMax}
      </p>
      <p className="mt-1 text-xs tabular-nums text-muted">
        {formatNum(snap.bpPts)} pts · {snap.bpNeed} to next
        {snap.bpPremium ? " · premium on" : ""}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-gold" style={{ width: `${(snap.bpRank / snap.bpMax) * 100}%` }} />
      </div>
      {!snap.bpPremium ? (
        <Button
          variant="secondary"
          className="mt-2 h-11 w-full"
          disabled={snap.gems < BP_PREMIUM}
          onClick={() => {
            unlockAudio();
            if (sim.buyPremium()) {
              sfx.chest();
              refresh();
            }
          }}
        >
          Unlock premium · {BP_PREMIUM} gems
        </Button>
      ) : null}
      <Button
        className="mt-2 h-12 w-full"
        disabled={snap.bpFreeReady + snap.bpPremReady <= 0}
        onClick={() => {
          unlockAudio();
          if (sim.claimPass()) {
            sfx.chest();
            refresh();
          }
        }}
      >
        Claim pass loot
      </Button>
    </div>
  );
}

export function HuntPlay() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const [watchWait, setWatchWait] = useState(false);
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          className="h-12"
          disabled={!snap.watchReady || watchWait}
          onClick={() => {
            unlockAudio();
            setWatchWait(true);
            window.setTimeout(() => {
              if (sim.claimWatch()) sfx.chest();
              refresh();
              setWatchWait(false);
            }, 2800);
          }}
        >
          {watchWait ? "Hymn…" : snap.watchReady ? `Broadcast · ${WATCH_GEMS} gems` : `Broadcast · ${WATCH_GEMS} gems taken`}
        </Button>
        <Button
          variant="secondary"
          className="h-12"
          onClick={() => {
            unlockAudio();
            sfx.ui();
            useGame.getState().openHunt("wheel");
          }}
        >
          {snap.wheelReady ? "Fortune wheel · free spin" : "Fortune wheel"}
        </Button>
      </div>
    </div>
  );
}

export function HuntCard() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  return (
    <div className="rounded-lg border border-border bg-bg/40 p-4">
      <p className="text-xs tracking-wide text-gold uppercase">Monthly card</p>
      <p className="mt-1 text-sm text-muted">
        {snap.cardOn
          ? `Active · 2× idle gold · ${formatTime(snap.cardLeft / 1000)} left`
          : `2× idle gold for 30 days. ${snap.cardCost} gems.`}
      </p>
      <Button
        className="mt-2 h-12 w-full"
        disabled={snap.cardOn || snap.gems < snap.cardCost}
        onClick={() => {
          unlockAudio();
          if (sim.buyCard()) {
            sfx.chest();
            refresh();
          }
        }}
      >
        {snap.cardOn ? "Card running" : `Buy card · ${snap.cardCost} gems`}
      </Button>
    </div>
  );
}

export function HuntCodex() {
  const snap = useGame((s) => s.snap);
  return (
    <div className="rounded-lg border border-border bg-bg/40 p-4">
      <p className="text-xs tracking-wide text-gold uppercase">Codex · {snap.codexSeen} beasts</p>
      <p className="mt-1 text-xs text-muted">Each kind you slay adds party damage.</p>
      <p className="mt-2 text-xs tabular-nums text-muted">
        {snap.codex.length ? snap.codex.map((c) => `${c.id} ${formatNum(c.n)}`).join(" · ") : "Kill something to open the book."}
      </p>
      <p className="mt-2 text-[11px] text-muted">Today’s stamp would be {monthReward(snap.monthDay).gems} gems.</p>
    </div>
  );
}
