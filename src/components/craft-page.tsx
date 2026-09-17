import { useMemo, useState, type ReactNode } from "react";
import { Coins, Gem, Ghost, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopPanel } from "@/components/shop-panel";
import { formatNum } from "@/game/format";
import {
  LOOT,
  RECIPES,
  craftChance,
  lootIcon,
  matchRecipe,
  type LootId,
} from "@/game/loot";
import { sfx, unlockAudio } from "@/game/audio";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

type Page = "bench" | "recipes" | "catalyst" | "market";
type Filter = "all" | "loot" | "shard";

export function CraftPage({ onClose }: { onClose: () => void }) {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const [page, setPage] = useState<Page>("bench");
  const [filter, setFilter] = useState<Filter>("all");
  const [slots, setSlots] = useState<(LootId | null)[]>([null, null, null, null, null, null]);
  const [catalyst, setCatalyst] = useState<LootId | null>(null);
  const [picking, setPicking] = useState<"slot" | "catalyst" | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const recipe = matchRecipe(slots, catalyst);
  const chance = craftChance(recipe, catalyst);
  const filled = slots.filter(Boolean).length;

  const bag = useMemo(() => {
    const placed: Record<string, number> = {};
    for (const id of slots) if (id) placed[id] = (placed[id] ?? 0) + 1;
    if (catalyst) placed[catalyst] = (placed[catalyst] ?? 0) + 1;
    return snap.bag.map((b) => ({ ...b, count: Math.max(0, b.count - (placed[b.id] ?? 0)) }));
  }, [snap.bag, slots, catalyst]);

  function put(id: LootId) {
    const row = bag.find((b) => b.id === id);
    if (!row || row.count <= 0) return;
    if (picking === "catalyst" || page === "catalyst") {
      setCatalyst(id);
      setPicking(null);
      setPage("bench");
      return;
    }
    const i = slots.findIndex((s) => s == null);
    if (i < 0) return;
    const next = [...slots];
    next[i] = id;
    setSlots(next);
    setPicking(null);
  }

  function clearSlot(i: number) {
    const next = [...slots];
    next[i] = null;
    setSlots(next);
  }

  function create() {
    if (busy || filled === 0) return;
    unlockAudio();
    setBusy(true);
    setNote("");
    sfx.hammer();
    window.setTimeout(() => {
      const result = sim.tryCraft(slots.filter((s): s is LootId => !!s), catalyst);
      refresh();
      if (!result.ok) {
        setNote(result.blurb);
        setBusy(false);
        return;
      }
      setSlots([null, null, null, null, null, null]);
      setCatalyst(null);
      setNote(result.fail ? result.blurb : `${result.name}. ${result.blurb}`);
      if (result.fail) sfx.fail();
      else sfx.chest();
      setBusy(false);
    }, 720);
  }

  const shown = bag.filter((b) => {
    if (b.count <= 0 && filter !== "all") return false;
    if (filter === "all") return true;
    return b.kind === filter;
  });

  if (page === "market") {
    return (
      <FullShell title="Shop" onClose={onClose} onBack={() => setPage("bench")} snap={snap}>
        <ShopPanel />
      </FullShell>
    );
  }

  if (page === "recipes") {
    return (
      <FullShell title="Recipes" onClose={onClose} onBack={() => setPage("bench")} snap={snap}>
        <ul className="flex flex-col gap-2">
          {RECIPES.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-bg/40 p-3">
              <h3 className="font-display text-sm font-semibold">{r.name}</h3>
              <p className="mt-1 text-xs text-muted">{r.blurb}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.inputs.map((id) => (
                  <img key={id + r.id} src={lootIcon(id)} alt="" className="size-10 rounded-md object-cover" />
                ))}
                {r.catalyst ? (
                  <span className="grid size-10 place-items-center rounded-md border border-gold/40 text-[10px] text-gold">
                    +
                  </span>
                ) : null}
                {r.catalyst ? <img src={lootIcon(r.catalyst)} alt="" className="size-10 rounded-md object-cover" /> : null}
              </div>
              <p className="mt-2 text-xs tabular-nums text-gold">Base chance {Math.round(r.chance * 100)}%</p>
            </li>
          ))}
        </ul>
      </FullShell>
    );
  }

  if (page === "catalyst") {
    return (
      <FullShell title="Catalyst" onClose={onClose} onBack={() => setPage("bench")} snap={snap}>
        <p className="mb-3 text-sm text-muted">A flask in the side slot raises the hammer's chance.</p>
        <ItemGrid
          items={bag.filter((b) => b.id === "flask" || b.kind === "shard")}
          onPick={(id) => put(id)}
        />
      </FullShell>
    );
  }

  return (
    <FullShell title="Craft" onClose={onClose} snap={snap}>
      <Button className="mb-3 h-12 w-full" onClick={() => setPage("market")}>
        Shop · Soul Well · gems
      </Button>
      <div className="relative mx-auto flex max-w-sm items-start gap-2">
        <button
          type="button"
          className="grid size-16 shrink-0 place-items-center rounded-lg border border-gold/50 bg-surface"
          onClick={() => setPage("recipes")}
        >
          <img src={lootIcon("ticket")} alt="" className="size-10 rounded object-cover" />
          <span className="text-[10px] tracking-wide text-gold uppercase">Recipes</span>
        </button>
        <div className={cn("relative grid flex-1 grid-cols-3 gap-1 rounded-lg bg-bg p-1", busy && "bench-flash")}>
          {slots.map((id, i) => (
            <button
              key={i}
              type="button"
              className="aspect-square rounded-md border border-border bg-bg"
              onClick={() => (id ? clearSlot(i) : setPicking("slot"))}
            >
              {id ? <img src={lootIcon(id)} alt="" className="size-full rounded-md object-cover" /> : null}
            </button>
          ))}
          {busy ? <img src="/sprites/hammer.png" alt="" className="hammer-strike pointer-events-none absolute inset-0 m-auto size-28" /> : null}
        </div>
        <button
          type="button"
          className="grid size-16 shrink-0 place-items-center rounded-lg border border-gold/50 bg-surface"
          onClick={() => setPage("catalyst")}
        >
          {catalyst ? (
            <img src={lootIcon(catalyst)} alt="" className="size-10 rounded object-cover" />
          ) : (
            <img src={lootIcon("flask")} alt="" className="size-10 rounded object-cover opacity-50" />
          )}
          <span className="text-[10px] tracking-wide text-gold uppercase">Catalyst</span>
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-bg/40 p-3">
        <img src={lootIcon("ticket")} alt="" className="size-12 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">Base chance: {filled ? `${Math.round(chance * 100)}%` : "—"}</p>
          <p className="text-xs text-muted">Catalysts: {catalyst ? LOOT.find((l) => l.id === catalyst)?.name : "—"}</p>
          <p className="mt-1 font-display text-sm text-gold">{recipe ? recipe.name : filled ? "Random smash" : "Empty bench"}</p>
        </div>
        <Button className="h-14 w-24 shrink-0" disabled={busy || filled === 0} onClick={create}>
          {busy ? "…" : "Create"}
        </Button>
      </div>
      {note ? <p className="mt-2 text-sm text-gold">{note}</p> : null}

      <div className="mt-3 grid grid-cols-5 gap-1.5">
        <ItemGrid items={shown} onPick={put} />
      </div>

      <div className="mt-3 flex gap-2">
        {(["all", "loot", "shard"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "h-11 flex-1 rounded-md border font-display text-sm capitalize",
              filter === f ? "border-gold bg-wood text-gold" : "border-border bg-surface text-muted",
            )}
          >
            {f === "all" ? "All" : f === "loot" ? "Loot" : "Shards"}
          </button>
        ))}
      </div>
      <Button variant="secondary" className="mt-3 h-12 w-full" onClick={() => setPage("market")}>
        Shop
      </Button>
    </FullShell>
  );
}

function FullShell({
  title,
  onClose,
  onBack,
  snap,
  children,
}: {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  snap: { gold: number; souls: number; gems: number };
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <img src="/bg/craft.jpg?v=2" alt="" className="absolute inset-0 size-full object-cover" crossOrigin="anonymous" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/92 via-bg/60 to-bg/35" />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 bg-wood/90 px-3 py-2 text-xs tabular-nums text-gold">
        <span className="flex items-center gap-1">
          <Ghost className="size-3" /> {formatNum(snap.souls)}
        </span>
        <span className="flex items-center gap-1">
          <Gem className="size-3" /> {formatNum(snap.gems)}
        </span>
        <span className="flex items-center gap-1">
          <Coins className="size-3" /> {formatNum(snap.gold)}
        </span>
      </div>
      <div className="flex shrink-0 items-center px-3 py-2">
        {onBack ? (
          <button type="button" className="h-11 pr-3 text-sm text-gold" onClick={onBack}>
            ← Bench
          </button>
        ) : (
          <span className="w-11" />
        )}
        <h2 className="font-display flex-1 text-center text-xl text-gold">{title}</h2>
        <button type="button" aria-label="Close" className="grid size-11 place-items-center text-gold" onClick={onClose}>
          <X className="size-6" />
        </button>
      </div>
      <div className="scroll-pane min-h-0 flex-1 px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}

function ItemGrid({
  items,
  onPick,
}: {
  items: { id: LootId; name: string; count: number }[];
  onPick: (id: LootId) => void;
}) {
  return (
    <>
      {items.map((b) => (
        <button
          key={b.id}
          type="button"
          disabled={b.count <= 0}
          onClick={() => {
            unlockAudio();
            sfx.ui();
            onPick(b.id);
          }}
          className="relative aspect-square overflow-hidden rounded-md border border-border bg-bg disabled:opacity-40"
        >
          <img src={lootIcon(b.id)} alt={b.name} className="size-full object-cover" />
          <span className="absolute right-0.5 bottom-0.5 rounded-sm bg-bg/80 px-1 text-[10px] tabular-nums text-fg">
            {formatNum(b.count)}
          </span>
        </button>
      ))}
    </>
  );
}
