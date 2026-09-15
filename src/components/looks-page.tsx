import { Button } from "@/components/ui/button";
import { FRAMES, NAME_HUES, SPLASHES, type LookId } from "@/game/cash";
import { sfx, unlockAudio } from "@/game/audio";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

export function LooksPage() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const owned = new Set(snap.looks);

  function pick(kind: "frame" | "name" | "splash", id: LookId, gems: number, pack?: boolean) {
    unlockAudio();
    if (sim.buyLook(kind, id)) {
      sfx.ui();
      refresh();
    } else sfx.fail();
    void gems;
    void pack;
  }

  return (
    <div>
      <p className="text-sm text-muted">Looks only. No damage. First Blood pack unlocks gilt and blood.</p>
      <LookRow
        label="Frame"
        current={snap.frame}
        items={FRAMES}
        owned={owned}
        firstBuy={snap.firstBuy}
        onPick={(id) => pick("frame", id, 0)}
      />
      <LookRow
        label="Name"
        current={snap.nameHue}
        items={NAME_HUES}
        owned={owned}
        firstBuy={snap.firstBuy}
        onPick={(id) => pick("name", id, 0)}
      />
      <LookRow
        label="Kill splash"
        current={snap.splash}
        items={SPLASHES}
        owned={owned}
        firstBuy={snap.firstBuy}
        onPick={(id) => pick("splash", id, 0)}
      />
    </div>
  );
}

function LookRow({
  label,
  current,
  items,
  owned,
  firstBuy,
  onPick,
}: {
  label: string;
  current: string;
  items: { id: LookId; name: string; gems: number; pack?: boolean }[];
  owned: Set<string>;
  firstBuy: boolean;
  onPick: (id: LookId) => void;
}) {
  return (
    <div className="mt-3">
      <p className="text-xs tracking-wide text-gold uppercase">{label}</p>
      <ul className="mt-1 flex flex-col gap-1">
        {items.map((it) => {
          const have = owned.has(it.id);
          const locked = Boolean(it.pack && !firstBuy && !have);
          const on = current === it.id;
          return (
            <li key={it.id}>
              <Button
                variant={on ? "default" : "secondary"}
                className={cn("h-12 w-full justify-between", on && "border-gold")}
                disabled={locked}
                onClick={() => onPick(it.id)}
              >
                <span>{it.name}</span>
                <span className="text-[11px] text-muted">
                  {on ? "on" : have ? "wear" : locked ? "First Blood pack" : it.gems ? `${it.gems} gems` : "free"}
                </span>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
