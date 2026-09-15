import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNum, formatTime } from "@/game/format";
import { monthReward, WATCH_GEMS, BP_PREMIUM } from "@/game/liveops";
import { sim } from "@/game/sim";
import { sfx, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

export function HuntCalendar() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const today = monthReward(snap.monthDay);
  return (
    <div>
      <div className="rounded-lg border border-gold/40 bg-wood p-4">
        <p className="text-xs tracking-wide text-gold uppercase">Today · day {snap.monthDay}</p>
        <p className="font-display mt-1 text-lg text-gold">
          {today.gems} gems{today.chests ? ` · ${today.chests} chest${today.chests > 1 ? "s" : ""}` : ""}
        </p>
        <Button
          className="mt-3 h-12 w-full"
          disabled={!snap.monthReady}
          onClick={() => {
            unlockAudio();
            if (sim.claimMonth()) {
              sfx.chest();
              refresh();
            }
          }}
        >
          {snap.monthReady ? "Claim today's stamp" : "Already claimed today"}
        </Button>
      </div>
      <ul className="mt-3 flex flex-col gap-1">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
          const r = monthReward(d);
          const hit = snap.monthHits.includes(d);
          const now = d === snap.monthDay;
          return (
            <li
              key={d}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                now ? "border-gold bg-wood" : "border-border bg-bg/40",
                hit ? "opacity-50" : "",
              )}
            >
              <span className={now ? "text-gold" : "text-fg"}>Day {d}</span>
              <span className="tabular-nums text-muted">
                {r.gems} gems{r.chests ? ` + ${r.chests} chest` : ""}
                {hit ? " · taken" : now ? " · today" : ""}
              </span>
            </li>
          );
        })}
      </ul>
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
