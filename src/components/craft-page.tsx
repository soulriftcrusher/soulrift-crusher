import { useMemo, useState, type ReactNode } from "react";
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
  type RecipeDef,
  type RecipeResult,
} from "@/game/loot";
import { sfx, unlockAudio } from "@/game/audio";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import { prizeArt } from "@/game/prize-art";
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
  const [verdict, setVerdict] = useState<"ok" | "fail" | null>(null);

  const recipe = matchRecipe(slots, catalyst);
  const chance = craftChance(recipe, catalyst);
  const filled = slots.filter(Boolean).length;

  const bag = useMemo(() => {
    const placed: Record<string, number> = {};
    for (const id of slots) if (id) placed[id] = (placed[id] ?? 0) + 1;
    if (catalyst) placed[catalyst] = (placed[catalyst] ?? 0) + 1;
    return snap.bag.map((b) => ({ ...b, count: Math.max(0, b.count - (placed[b.id] ?? 0)) }));
  }, [snap.bag, slots, catalyst]);

  function owned(): Record<string, number> {
    const c: Record<string, number> = {};
    for (const b of snap.bag) c[b.id] = b.count;
    return c;
  }

  function canLoad(r: RecipeDef, bag = owned()): boolean {
    const need: Record<string, number> = {};
    for (const id of r.inputs) need[id] = (need[id] ?? 0) + 1;
    if (r.catalyst) need[r.catalyst] = (need[r.catalyst] ?? 0) + 1;
    return Object.entries(need).every(([id, n]) => (bag[id] ?? 0) >= n);
  }

  function loadRecipe(r: RecipeDef) {
    unlockAudio();
    sfx.ui();
    if (!canLoad(r)) {
      setVerdict("fail");
      setNote(`Missing parts for ${r.name}.`);
      return;
    }
    const next: (LootId | null)[] = [null, null, null, null, null, null];
    r.inputs.forEach((id, i) => {
      if (i < next.length) next[i] = id;
    });
    setSlots(next);
    setCatalyst(r.catalyst ?? null);
    setVerdict(null);
    setNote(`${r.name} is on the bench. Tap Strike.`);
    setPage("bench");
  }

  function stillStocked(ids: (LootId | null)[], cat: LootId | null): boolean {
    const bag = sim.state.bag ?? {};
    const need: Record<string, number> = {};
    for (const id of ids) if (id) need[id] = (need[id] ?? 0) + 1;
    if (cat) need[cat] = (need[cat] ?? 0) + 1;
    return Object.entries(need).every(([id, n]) => (bag[id as LootId] ?? 0) >= n);
  }

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
    setVerdict(null);
    sfx.hammer();
    window.setTimeout(() => {
      const result = sim.tryCraft(slots.filter((s): s is LootId => !!s), catalyst);
      refresh();
      const keep = stillStocked(slots, catalyst);
      if (!keep) {
        setSlots([null, null, null, null, null, null]);
        setCatalyst(null);
      }
      if (result.fail || !result.ok) {
        setVerdict("fail");
        setNote(result.fail ? `Failed. ${result.name || "That craft"} burned the parts.` : result.blurb);
        sfx.fail();
      } else {
        setVerdict("ok");
        setNote(keep ? `Success. You made ${result.name}. Tap Strike for another.` : `Success. You made ${result.name}. Out of parts.`);
        sfx.chest();
      }
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
          {RECIPES.map((r) => {
            const ready = canLoad(r);
            return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => loadRecipe(r)}
                className="flex w-full items-center gap-3 rounded-lg border border-gold/30 bg-bg/80 p-3 text-left"
              >
              <img src={recipeArt(r.result)} alt="" className="size-14 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-semibold text-fg">{r.name}</h3>
                <p className="mt-0.5 text-xs text-muted">{r.blurb}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.inputs.map((id) => (
                    <img key={id + r.id} src={lootIcon(id)} alt="" className="size-9 rounded-md object-cover" />
                  ))}
                  {r.catalyst ? (
                    <>
                      <span className="grid size-9 place-items-center text-gold">+</span>
                      <img src={lootIcon(r.catalyst)} alt="" className="size-9 rounded-md object-cover" />
                    </>
                  ) : null}
                </div>
                <p className={cn("mt-1 text-xs font-semibold", ready ? "text-gold" : "text-accent")}>
                  {ready ? "Tap to load the bench" : "Missing parts"} · {Math.round(r.chance * 100)}%
                </p>
              </div>
              </button>
            </li>
            );
          })}
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
      <div className="mx-auto flex max-w-sm items-start gap-2">
        <button
          type="button"
          className="grid w-16 shrink-0 place-items-center gap-1"
          onClick={() => setPage("recipes")}
        >
          <img src="/shop/forge-book.jpg" alt="" className="size-16 rounded-xl border-2 border-gold/50 object-cover" crossOrigin="anonymous" />
          <span className="text-[10px] tracking-wide text-gold uppercase">Recipes</span>
        </button>
        <div className={cn("relative min-w-0 flex-1 overflow-hidden rounded-xl border-2 border-gold/50", busy && "bench-flash")}>
          <img src="/shop/forge-anvil.jpg" alt="" className="absolute inset-0 size-full object-cover" crossOrigin="anonymous" />
          <div className="relative grid grid-cols-3 gap-1.5 p-2.5">
            {slots.map((id, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "forge-slot aspect-square overflow-hidden rounded-lg border-2 border-gold/40 bg-[#0a0706]/70",
                  id && "forge-slot-filled border-gold",
                )}
                onClick={() => (id ? clearSlot(i) : setPicking("slot"))}
              >
                {id ? (
                  <img src={lootIcon(id)} alt="" className="size-full object-cover" />
                ) : (
                  <span className="font-display text-lg text-gold/35">+</span>
                )}
              </button>
            ))}
          </div>
          {busy ? (
            <>
              <div className="forge-sparks pointer-events-none absolute inset-0" />
              <img src="/sprites/hammer.png" alt="" className="hammer-strike pointer-events-none absolute inset-0 m-auto size-28" />
            </>
          ) : null}
        </div>
        <button
          type="button"
          className="grid w-16 shrink-0 place-items-center gap-1"
          onClick={() => setPage("catalyst")}
        >
          <span className="grid size-16 place-items-center overflow-hidden rounded-xl border-2 border-gold/50 bg-[#1a100c]">
            {catalyst ? (
              <img src={lootIcon(catalyst)} alt="" className="size-full object-cover" />
            ) : (
              <img src={lootIcon("flask")} alt="" className="size-10 object-cover opacity-70" />
            )}
          </span>
          <span className="text-[10px] tracking-wide text-gold uppercase">Flask</span>
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-xl border-2 border-gold/40 bg-[#1a100c]/90 p-3">
        <img
          src={recipe ? recipeArt(recipe.result) : "/shop/forge-hammer.jpg"}
          alt=""
          className="size-16 shrink-0 rounded-lg object-cover"
          crossOrigin="anonymous"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base text-gold">{recipe ? recipe.name : filled ? "Random smash" : "Empty anvil"}</p>
          <p className="text-xs text-[#f0e6d8]">
            {filled ? `${Math.round(chance * 100)}% strike` : "Put loot in the wells."}
            {catalyst ? ` · ${LOOT.find((l) => l.id === catalyst)?.name}` : ""}
          </p>
          {filled ? (
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg">
              <div className="h-full rounded-full bg-gold" style={{ width: `${Math.round(chance * 100)}%` }} />
            </div>
          ) : null}
        </div>
        <Button className="h-16 w-20 shrink-0 flex-col gap-0 px-1" disabled={busy || filled === 0} onClick={create}>
          <img src="/shop/forge-hammer.jpg" alt="" className="size-8 rounded object-cover" crossOrigin="anonymous" />
          <span className="text-[11px]">{busy ? "…" : "Strike"}</span>
        </Button>
      </div>
      {verdict ? (
        <p
          className={cn(
            "mt-3 rounded-lg border-2 px-3 py-3 text-center font-display text-base",
            verdict === "ok" ? "border-[#7dff9a] bg-[#12301c] text-[#d8ffd8]" : "border-[#ff6b6b] bg-[#3a1212] text-[#ffd0d0]",
          )}
        >
          {verdict === "ok" ? "SUCCESS" : "FAILED"}
          {note ? <span className="mt-1 block text-sm font-normal">{note}</span> : null}
        </p>
      ) : note ? (
        <p className="mt-2 text-sm text-gold">{note}</p>
      ) : null}

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

function recipeArt(r: RecipeResult): string {
  if (r.kind === "item") return lootIcon(r.id);
  if (r.kind === "ember") return prizeArt("ember");
  if (r.kind === "gems") return prizeArt("gems");
  if (r.kind === "souls") return prizeArt("souls");
  if (r.kind === "chest") return prizeArt("chest");
  if (r.kind === "rune") return prizeArt("rune");
  return "/shop/forge-hammer.jpg";
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
          <img src="/tiles/hud-soul.png" alt="" className="size-4 object-contain" crossOrigin="anonymous" /> {formatNum(snap.souls)}
        </span>
        <span className="flex items-center gap-1">
          <img src="/tiles/hud-gem.png" alt="" className="size-4 object-contain" crossOrigin="anonymous" /> {formatNum(snap.gems)}
        </span>
        <span className="flex items-center gap-1">
          <img src="/tiles/hud-gold.png" alt="" className="size-4 object-contain" crossOrigin="anonymous" /> {formatNum(snap.gold)}
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
          <img src="/tiles/hud-close.png" alt="" className="size-7 object-contain" crossOrigin="anonymous" />
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
          className="relative aspect-square overflow-hidden rounded-md border border-gold/30 bg-[#0a0706] disabled:opacity-40"
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
