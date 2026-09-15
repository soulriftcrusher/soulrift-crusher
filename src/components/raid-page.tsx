import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NPC_MARKS, SHIELD_GEMS, HYMN_SKIP_GEMS } from "@/game/cash";
import { formatNum, formatTime } from "@/game/format";
import { listPlunder, plunderHunter, syncStash, type PlunderMark } from "@/game/net";
import { sfx, unlockAudio } from "@/game/audio";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { HunterName } from "@/components/hunter-card";

export function RaidPage() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const { user } = useCurrentUserState();
  const [marks, setMarks] = useState<PlunderMark[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [hymn, setHymn] = useState(false);

  useEffect(() => {
    let alive = true;
    void syncStash({
      data: { gold: sim.state.gold, souls: sim.state.souls, shieldUntil: sim.state.shieldUntil ?? 0 },
    }).catch(() => undefined);
    void listPlunder()
      .then((rows) => {
        if (!alive) return;
        setMarks(rows.length ? rows : npcMarks());
      })
      .catch(() => {
        if (alive) setMarks(npcMarks());
      });
    return () => {
      alive = false;
    };
  }, [user?.id, snap.plunderReadyIn]);

  function hymnShield(skip: boolean) {
    unlockAudio();
    if (skip) {
      if (sim.claimShieldHymn(true)) {
        sfx.chest();
        refresh();
      } else sfx.fail();
      return;
    }
    if (!snap.shieldHymnReady) return;
    setHymn(true);
    window.setTimeout(() => {
      if (sim.claimShieldHymn(false)) sfx.chest();
      refresh();
      setHymn(false);
    }, 2800);
  }

  async function hit(mark: PlunderMark) {
    if (snap.plunderReadyIn > 0) return;
    unlockAudio();
    setBusy(mark.userId);
    setNote("");
    try {
      if (mark.npc) {
        const gold = Math.max(20, Math.floor(mark.gold || mark.power * 0.4));
        const souls = Math.max(0, Math.floor(mark.souls || 1));
        if (sim.takePlunder(gold, souls)) {
          sfx.win();
          setNote(`Took ${formatNum(gold)} gold from ${mark.name}.`);
        } else sfx.fail();
      } else {
        const out = await plunderHunter({ data: { userId: mark.userId } });
        if (sim.takePlunder(out.gold, out.souls)) {
          sfx.win();
          setNote(`Took ${formatNum(out.gold)} gold from ${out.name}.`);
        }
      }
      refresh();
      setMarks((rows) => rows.filter((r) => r.userId !== mark.userId));
    } catch (e) {
      sfx.fail();
      setNote(e instanceof Error ? e.message : "Shielded, or the rift refused.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <div className="rounded-lg border border-gold/40 bg-wood p-4">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-gold" />
          <p className="font-display text-gold">Camp shield</p>
        </div>
        <p className="mt-1 text-sm text-muted">
          {snap.shieldOn
            ? `Up · ${formatTime(snap.shieldLeft / 1000)} left. Offline hunters with no shield can be raided.`
            : "Down. Buy 8h, watch a hymn for 2h, or play 8h in the app."}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          Play-time to a free 8h shield: {formatTime(snap.playLeft / 1000)}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            className="h-12"
            disabled={snap.gems < SHIELD_GEMS}
            onClick={() => {
              unlockAudio();
              if (sim.buyShield()) {
                sfx.chest();
                refresh();
              } else sfx.fail();
            }}
          >
            8h shield · {SHIELD_GEMS} gems
          </Button>
          <Button variant="secondary" className="h-12" disabled={hymn || !snap.shieldHymnReady} onClick={() => hymnShield(false)}>
            {hymn ? "Hymn…" : snap.shieldHymnReady ? "Hymn · 2h shield" : "Hymn used"}
          </Button>
        </div>
        <button
          type="button"
          className="mt-2 h-11 w-full text-sm text-gold"
          disabled={snap.gems < HYMN_SKIP_GEMS}
          onClick={() => hymnShield(true)}
        >
          Skip hymn · {HYMN_SKIP_GEMS} gems · 2h
        </button>
      </div>
      <p className="mt-4 text-xs tracking-wide text-gold uppercase">Unshielded camps</p>
      {snap.plunderReadyIn > 0 ? (
        <p className="mt-1 text-sm text-muted">Next raid in {formatTime(snap.plunderReadyIn / 1000)}</p>
      ) : null}
      <ul className="mt-2 flex flex-col gap-2">
        {marks.map((m) => (
          <li key={m.userId} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-bg/40 px-3 py-3">
            <div className="min-w-0">
              {m.npc ? (
                <p className="font-display text-sm text-gold">{m.name}</p>
              ) : (
                <HunterName userId={m.userId} name={m.name} className="font-display text-sm text-gold" />
              )}
              <p className="text-[11px] text-muted">
                Floor {m.maxFloor} · stash {formatNum(m.gold || m.power * 0.4)} gold
                {m.npc ? " · NPC" : ""}
              </p>
            </div>
            <Button
              size="sm"
              className="h-11"
              disabled={snap.plunderReadyIn > 0 || busy === m.userId}
              onClick={() => void hit(m)}
            >
              Raid
            </Button>
          </li>
        ))}
      </ul>
      {marks.length === 0 ? <p className="mt-2 text-sm text-muted">No open camps. Shields are up.</p> : null}
      {note ? <p className="mt-2 text-sm text-gold">{note}</p> : null}
    </div>
  );
}

function npcMarks(): PlunderMark[] {
  return NPC_MARKS.map((n) => ({
    userId: n.id,
    name: n.name,
    power: n.power,
    maxFloor: Math.max(8, Math.floor(n.power / 400)),
    gold: Math.floor(n.power * 0.5),
    souls: n.power > 20000 ? 2 : 1,
    shield: false,
    npc: true,
  }));
}
