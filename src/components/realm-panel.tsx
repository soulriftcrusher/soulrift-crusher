import { Map as MapIcon } from "lucide-react";
import { ArenaDuel } from "@/components/arena-duel";
import { Button } from "@/components/ui/button";
import { REALMS } from "@/game/meta";
import { SIEGE_LAIRS } from "@/game/gear";
import { formatNum, formatTime } from "@/game/format";
import { sfx, unlockAudio } from "@/game/audio";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

export function RealmPanel() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);

  return (
    <div className="pt-3">
      <div className="overflow-hidden rounded-lg border border-border">
        <img src="/bg/realms.jpg" alt="" className="h-36 w-full object-cover" crossOrigin="anonymous" />
        <div className="bg-bg/80 p-4">
          <div className="flex items-center gap-2">
            <MapIcon className="size-4 text-muted" />
            <h3 className="font-display text-base font-semibold">Realms</h3>
          </div>
          <p className="mt-2 text-sm text-muted">
            Walk a banner you have already bled for. Highest floor {snap.maxFloor}.
          </p>
        </div>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {REALMS.map((r) => {
          const open = snap.maxFloor >= r.minFloor;
          const here = snap.realm === r.id;
          return (
            <li key={r.id} className={cn("overflow-hidden rounded-lg border border-border", here && "border-accent")}>
              <button
                type="button"
                disabled={!open}
                onClick={() => {
                  unlockAudio();
                  if (sim.travelRealm(r.id)) {
                    sfx.ui();
                    refresh();
                  }
                }}
                className="flex w-full gap-3 bg-bg/40 p-3 text-left disabled:opacity-40"
              >
                <img src={r.art} alt="" className="size-16 shrink-0 rounded-md object-cover" crossOrigin="anonymous" />
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold">
                    {r.name}
                    {here ? <span className="ml-2 text-accent">here</span> : null}
                  </p>
                  <p className="text-xs text-muted">{open ? r.blurb : `Unlocks at floor ${r.minFloor}`}</p>
                  <p className="mt-1 text-xs tabular-nums text-muted">From floor {r.minFloor}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-lg border border-border bg-bg/40 p-4">
        <h3 className="font-display text-base font-semibold">Realm sieges</h3>
        <p className="mt-2 text-sm text-muted">
          Occupy a lair. Kills there score siege points. Hold one banner at a time.
        </p>
        <p className="mt-2 text-sm tabular-nums">
          {formatNum(snap.siegePts)} siege points
          {snap.siegeReadyIn > 0 ? ` · travel ${formatTime(snap.siegeReadyIn)}` : ""}
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {SIEGE_LAIRS.map((l) => {
            const realm = REALMS.find((r) => r.id === l.id)!;
            const open = snap.maxFloor >= realm.minFloor;
            const here = snap.siegeLair === l.id;
            return (
              <li key={l.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm">
                    {l.name}
                    {here ? <span className="ml-2 text-gold">held</span> : null}
                  </p>
                  <p className="text-xs text-muted">{open ? l.bonus : `Unlocks at floor ${realm.minFloor}`}</p>
                </div>
                <Button
                  size="sm"
                  className="h-11"
                  disabled={!open || here || snap.siegeReadyIn > 0}
                  onClick={() => {
                    unlockAudio();
                    if (sim.occupyLair(l.id)) {
                      sfx.ui();
                      refresh();
                    }
                  }}
                >
                  {here ? "Held" : "March"}
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
      <ArenaDuel />
    </div>
  );
}
