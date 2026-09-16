import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNum, formatTime } from "@/game/format";
import { HunterName } from "@/components/hunter-card";
import { getDeviceId } from "@/game/device";
import { readHuntName } from "@/game/name";
import { ARENA_REVIVE_GEMS, HEROES, heroPortrait } from "@/game/data";
import { challengeCrusader, heartbeat, type RivalSnap } from "@/game/net";
import { sim } from "@/game/sim";
import { sfx, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

type Bout = {
  foe: string;
  you: number;
  them: number;
  win?: boolean;
};

export function ArenaDuel() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const { user } = useCurrentUserState();
  const [rivals, setRivals] = useState<RivalSnap[]>([]);
  const [bout, setBout] = useState<Bout | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!user) return;
    heartbeat({
      data: {
        name: readHuntName(user.displayName ?? "Crusader"),
        power: snap.dps + snap.clickDmg * 0.35,
        maxFloor: snap.maxFloor,
        device: getDeviceId(),
        steal: false,
      },
    })
      .then((w) => {
        if (w.kicked) {
          useGame.getState().setKicked(true);
          return;
        }
        setRivals(w.rivals);
      })
      .catch(() => undefined);
  }, [user, snap.dps, snap.maxFloor]);

  function playBars(foe: string, win: boolean) {
    setBout({ foe, you: 100, them: 100 });
    let you = 100;
    let them = 100;
    const id = window.setInterval(() => {
      if (win) them = Math.max(0, them - 14 - Math.random() * 10);
      else you = Math.max(0, you - 14 - Math.random() * 10);
      if (!win) them = Math.max(8, them - 4);
      else you = Math.max(8, you - 4);
      setBout({ foe, you, them });
      if (you <= 0 || them <= 0) {
        window.clearInterval(id);
        setBout({ foe, you, them, win });
      }
    }, 120);
  }

  function npcFight() {
    if (busy || snap.arenaCharges < 1) return;
    if (snap.heroes.every((h) => h.level <= 0 || h.down)) return;
    unlockAudio();
    const result = sim.fightArena();
    if (!result) return;
    setBusy(true);
    playBars(result.foe, result.win);
    window.setTimeout(() => {
      if (result.win) sfx.win();
      else sfx.fail();
      useGame.getState().setArenaResult(result);
      refresh();
      setBusy(false);
    }, 1400);
  }

  function peopleFight(id: string, name: string) {
    if (busy) return;
    unlockAudio();
    setBusy(true);
    challengeCrusader({ data: { defenderId: id } })
      .then((r) => {
        sim.applyLoot({ gold: r.gold, souls: r.souls, influence: r.influence, chests: r.chests });
        playBars(name, r.win);
        window.setTimeout(() => {
          if (r.win) sfx.win();
          else sfx.fail();
          useGame.getState().setArenaResult({
            win: r.win,
            foe: r.foe,
            yourPower: r.yourPower,
            theirPower: r.theirPower,
            gold: r.gold,
            souls: r.souls,
            influence: r.influence,
            chests: r.chests,
            fallen: r.win ? [] : sim.fellInArena(),
          });
          refresh();
          setBusy(false);
        }, 1400);
      })
      .catch((e) => {
        setNote(e instanceof Error ? e.message : "The pit refused.");
        setBusy(false);
      });
  }

  const youFaces = snap.heroes.filter((h) => h.level > 0 && !h.down).slice(0, 4);
  const downed = snap.heroes.filter((h) => h.level > 0 && h.down);
  const living = snap.heroes.filter((h) => h.level > 0 && !h.down).length;

  return (
    <div className="rounded-lg border border-gold/40 bg-wood p-4 text-fg">
      <h3 className="font-display text-lg text-gold">One-on-one</h3>
      <p className="mt-1 text-sm text-fg/80">
        Send your living heroes. If they fall, revive with {ARENA_REVIVE_GEMS} gems or wait 24 hours.
        Charges {snap.arenaCharges}/{snap.arenaChargeMax}.
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex -space-x-2">
          {youFaces.map((h) => (
            <img key={h.id} src={heroPortrait(h.id)} alt="" className="size-10 rounded-full border border-gold object-cover" />
          ))}
        </div>
        <span className="font-display text-gold">VS</span>
        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-bg font-display text-xs">
          {bout?.foe.slice(0, 1) ?? "?"}
        </div>
      </div>
      {bout ? (
        <div className="mt-3 space-y-2">
          <Bar label="You" value={bout.you} good />
          <Bar label={bout.foe} value={bout.them} />
        </div>
      ) : null}
      <Button
        className="mt-3 h-12 w-full"
        disabled={!snap.arenaUnlocked || snap.arenaCharges < 1 || busy || living < 1}
        onClick={npcFight}
      >
        {!snap.arenaUnlocked ? "Reach floor 5" : living < 1 ? "All heroes are down" : "Fight a banner"}
      </Button>
      {downed.length ? (
        <div className="mt-4">
          <p className="text-xs tracking-wide text-gold uppercase">Fallen</p>
          {downed.length > 1 ? (
            <Button
              className="mt-2 h-11 w-full"
              disabled={!downed.some((h) => h.canRevive)}
              onClick={() => {
                unlockAudio();
                if (sim.reviveAll()) {
                  sfx.hire();
                  refresh();
                }
              }}
            >
              Revive all · {downed.length * (downed[0]?.reviveGems ?? 40)} gems
            </Button>
          ) : null}
          <ul className="mt-2 flex flex-col gap-2">
            {downed.map((h) => (
              <li key={h.id} className="flex items-center gap-2 rounded-md border border-border bg-bg/40 px-3 py-2">
                <img src={heroPortrait(h.id)} alt="" className="size-10 rounded-full object-cover grayscale" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm">{HEROES.find((x) => x.id === h.id)?.name ?? h.id}</p>
                  <p className="text-xs tabular-nums text-muted">{formatTime(h.downLeft / 1000)} without gems</p>
                </div>
                <Button
                  size="sm"
                  className="h-11"
                  disabled={!h.canRevive}
                  onClick={() => {
                    unlockAudio();
                    if (sim.reviveHero(h.id)) {
                      sfx.hire();
                      refresh();
                    }
                  }}
                >
                  {h.reviveGems} gems
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-4 text-xs tracking-wide text-gold uppercase">People</p>
      <ul className="mt-2 flex flex-col gap-2">
        {rivals.length === 0 ? <li className="text-sm text-muted">Sign in to duel other hunters. Banners still fight.</li> : null}
        {rivals.map((r) => (
          <li key={r.userId} className="flex items-center gap-2 rounded-md border border-border bg-bg/40 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm">
                {r.clanTag ? `[${r.clanTag}] ` : ""}
                <HunterName userId={r.userId} name={r.name} />
              </p>
              <p className="text-xs tabular-nums text-muted">
                Floor {r.maxFloor} · {formatNum(r.power)}
              </p>
            </div>
            <Button size="sm" className="h-11" disabled={busy || living < 1} onClick={() => peopleFight(r.userId, r.name)}>
              Duel
            </Button>
          </li>
        ))}
      </ul>
      {note ? <p className="mt-2 text-sm text-gold">{note}</p> : null}
    </div>
  );
}

function Bar({ label, value, good }: { label: string; value: number; good?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-[11px]">{label}</p>
      <div className="h-3 overflow-hidden rounded-full bg-bg">
        <div
          className={cn("h-full", good ? "bg-gold" : "bg-accent")}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
