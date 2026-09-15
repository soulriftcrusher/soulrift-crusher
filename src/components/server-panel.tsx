import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNum } from "@/game/format";
import { claimSeason, challengeKing, fetchSeason, joinShard, type SeasonSnap, type ShardRow } from "@/game/shard-net";
import {
  SHARDS,
  formatSeasonLeft,
  mindLog,
  mindPop,
  mindPower,
  mindSouls,
  mindWill,
  seasonClock,
  warScore,
} from "@/game/shards";
import { sim } from "@/game/sim";
import { sfx, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

function errMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    const m = String((e as { message: string }).message);
    if (m.includes("setCookie") || m.includes("destructure") || m.toLowerCase().includes("failed to fetch"))
      return "";
    return m;
  }
  return "The rift refused.";
}

export function ServerPanel() {
  const { user, isPending } = useCurrentUserState();
  const [snap, setSnap] = useState<SeasonSnap | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const clock = seasonClock();

  useEffect(() => {
    if (!user || isPending) return;
    fetchSeason()
      .then((s) => {
        setSnap(s);
        setNote("");
        try {
          localStorage.setItem("soulrift-kings", JSON.stringify(s.shards.map((x) => ({ id: x.id, king: x.king }))));
        } catch {
          /* ignore */
        }
      })
      .catch((e) => {
        const m = errMessage(e);
        if (m) setNote(m);
        try {
          const raw = localStorage.getItem("soulrift-kings");
          if (raw && !snap) {
            /* keep last board if we already have one */
          }
        } catch {
          /* ignore */
        }
      });
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      fetchSeason()
        .then(setSnap)
        .catch(() => undefined);
    }, 45000);
    return () => window.clearInterval(id);
  }, [user, isPending]);

  if (isPending) return <div className="mt-3 h-24 animate-pulse rounded-lg border border-border bg-bg/40" />;

  if (!user) {
    return (
      <div className="pt-3">
        <SeasonHead clock={clock} />
        <p className="mt-3 text-sm text-muted">
          Sign in to pick a 1,000-soul server. NPC banners already grow on their own.
        </p>
        <Button asChild className="mt-4 h-12 w-full">
          <Link to="/login">Sign in to join a server</Link>
        </Button>
        <GhostBoard />
      </div>
    );
  }

  const rows = snap?.shards ?? [];
  const mine = snap?.mine;

  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setNote("");
    try {
      await fn();
    } catch (e) {
      setNote(errMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pt-3">
      <SeasonHead clock={clock} season={snap?.season} day={snap?.day} />
      {snap ? (
        <p className="mt-2 text-xs tabular-nums text-gold">
          Real hunters {snap.hunters} · online now {snap.online}
        </p>
      ) : null}
      {snap?.lastWar ? (
        <p className="mt-2 text-xs text-gold">
          Last war · Season {snap.lastWar.season} · {snap.lastWar.shardName} took the field
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted">Season 1 is still walking. First war at day 90.</p>
      )}
      {snap && snap.claimGems > 0 && !snap.claimed ? (
        <Button
          className="mt-3 h-12 w-full"
          disabled={busy}
          onClick={() =>
            run(async () => {
              unlockAudio();
              const result = await claimSeason();
              sim.state.gems += result.gems;
              useGame.getState().refresh();
              setSnap(result.snap);
              sfx.chest();
            })
          }
        >
          Claim war tithe · {snap.claimGems} gems
        </Button>
      ) : null}
      {note ? <p className="mt-2 text-sm text-danger">{note}</p> : null}
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r.id}>
            <ShardCard
              row={r}
              mine={mine === r.id}
              open={open === r.id}
              busy={busy}
              onToggle={() => setOpen(open === r.id ? null : r.id)}
              onJoin={() =>
                run(async () => {
                  unlockAudio();
                  const next = await joinShard({ data: { shardId: r.id } });
                  setSnap(next);
                  sfx.hire();
                })
              }
              onChallenge={() =>
                run(async () => {
                  unlockAudio();
                  const result = await challengeKing();
                  if (result.gems) {
                    sim.state.gems += result.gems;
                    useGame.getState().refresh();
                  }
                  setSnap(result.snap);
                  setNote(result.win ? `You took the throne from ${result.foe}.` : `${result.foe} held.`);
                  if (result.win) sfx.win();
                  else sfx.fail();
                })
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function GhostBoard() {
  const clock = seasonClock();
  const [open, setOpen] = useState<string | null>(null);
  const rows: ShardRow[] = SHARDS.map((def) => {
    const pop = mindPop(def, clock.day);
    const power = mindPower(def, clock.day, clock.season);
    const souls = mindSouls(def, clock.day);
    return {
      id: def.id,
      name: def.name,
      tag: def.tag,
      joinable: def.joinable,
      npc: !def.joinable,
      mind: def.mind,
      blurb: def.blurb,
      will: mindWill(def, clock.day),
      log: mindLog(def, clock.day),
      pop,
      hunters: def.joinable ? 0 : 0,
      online: 0,
      cap: 1000,
      power,
      souls,
      score: warScore(power, pop, souls),
      rank: 0,
      king: null,
    };
  }).sort((a, b) => b.score - a.score);
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {rows.map((r) => (
        <li key={r.id}>
          <ShardCard
            row={r}
            mine={false}
            open={open === r.id}
            busy
            onToggle={() => setOpen(open === r.id ? null : r.id)}
            onJoin={() => undefined}
          />
        </li>
      ))}
    </ul>
  );
}

function SeasonHead({
  clock,
  season,
  day,
}: {
  clock: ReturnType<typeof seasonClock>;
  season?: number;
  day?: number;
}) {
  const s = season ?? clock.season;
  const d = day ?? clock.day;
  return (
    <div className="rounded-lg border border-gold/40 bg-wood p-4 text-fg">
      <div className="flex items-center gap-2">
        <Swords className="size-4 text-gold" />
        <h3 className="font-display text-lg font-semibold">Season {s} · Server war</h3>
      </div>
      <p className="mt-2 text-sm text-fg/80">
        Day {d} of 90. Every three months the shards collide. NPC servers grow while you sleep. Cap
        1,000 living souls each.
      </p>
      <p className="mt-2 font-display text-sm tabular-nums text-gold">
        {clock.warToday ? "War horn is up" : `War in ${formatSeasonLeft(clock.msLeft)}`}
      </p>
    </div>
  );
}

function ShardCard({
  row,
  mine,
  open,
  busy,
  onToggle,
  onJoin,
  onChallenge,
}: {
  row: ShardRow;
  mine: boolean;
  open: boolean;
  busy: boolean;
  onToggle: () => void;
  onJoin: () => void;
  onChallenge?: () => void;
}) {
  return (
    <div className={cn("rounded-lg border bg-bg/40 p-3", mine ? "border-gold" : "border-border")}>
      <button type="button" className="flex w-full items-start gap-3 text-left" onClick={onToggle}>
        <span className="font-display w-6 text-sm text-gold">{row.rank}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-display text-sm">
              [{row.tag}] {row.name}
            </span>
            {row.npc ? <span className="text-[10px] tracking-wide text-soul uppercase">NPC</span> : null}
            {mine ? <span className="text-[10px] tracking-wide text-gold uppercase">You</span> : null}
          </span>
          <span className="mt-1 block text-xs tabular-nums text-muted">
            {row.npc
              ? `${row.pop}/${row.cap} NPC · ${formatNum(row.power)} power`
              : `${row.pop}/${row.cap} · ${row.hunters} hunter${row.hunters === 1 ? "" : "s"} · ${row.online} online`}
          </span>
          {row.king ? (
            <span className="mt-1 block text-[11px] text-gold">
              King {row.king.name}
              {row.king.kind === "npc" ? " · NPC" : ""} · {formatNum(row.king.power)}
            </span>
          ) : null}
        </span>
      </button>
      {open ? (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-sm text-fg/85">{row.blurb}</p>
          <p className="mt-2 text-sm text-gold">{row.will}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {row.log.map((line) => (
              <li key={line} className="text-xs text-muted">
                {line}
              </li>
            ))}
          </ul>
          {row.king ? (
            <div className="mt-3 rounded-md border border-gold/40 bg-wood p-3 text-fg">
              <p className="font-display text-gold">
                King of the server · {row.king.name}
                {row.king.you ? " (you)" : row.king.kind === "npc" ? " · NPC" : ""}
              </p>
              <p className="mt-1 text-xs tabular-nums text-muted">
                {formatNum(row.king.power)} power · held {row.king.heldHours}h · {row.king.defenses} defenses
              </p>
              {row.king.thought ? <p className="mt-2 text-sm text-gold">{row.king.thought}</p> : null}
              {row.king.log.length ? (
                <ul className="mt-2 flex flex-col gap-1">
                  {row.king.log.map((line) => (
                    <li key={line} className="text-xs text-muted">
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}
              {mine && onChallenge && !row.king.you ? (
                <Button className="mt-3 h-12 w-full" disabled={busy} onClick={onChallenge}>
                  Challenge the king
                </Button>
              ) : null}
              {row.king.you ? <p className="mt-2 text-xs text-gold">You sit the throne. NPCs will compute a coup.</p> : null}
            </div>
          ) : null}
          {row.joinable && !mine ? (
            <Button className="mt-3 h-12 w-full" disabled={busy || row.pop >= row.cap} onClick={onJoin}>
              {row.pop >= row.cap ? "Full · 1000" : `Move to ${row.name}`}
            </Button>
          ) : null}
          {row.npc ? (
            <p className="mt-3 text-xs text-muted">NPC only. They will not take a living crusader.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
