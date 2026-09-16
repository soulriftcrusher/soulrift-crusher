import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarDays,
  Flag,
  Gem,
  Inbox,
  ScrollText,
  ShoppingBag,
  Sparkles,
  Swords,
  TimerReset,
  CircleDot,
  Shield,
  Trophy,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopPanel } from "@/components/shop-panel";
import { ArenaDuel } from "@/components/arena-duel";
import { HuntCalendar, HuntPass, HuntPlay, HuntCard, HuntCodex } from "@/components/hunt-live";
import { WheelPage } from "@/components/wheel-page";
import { RaidPage } from "@/components/raid-page";
import { WEEKLY_LOGIN } from "@/game/liveops";
import { HEROES } from "@/game/data";
import { EVENT_SHOP } from "@/game/gear";
import { formatNum, formatTime } from "@/game/format";
import { claimInbox, listInbox } from "@/game/live-net";
import { sim } from "@/game/sim";
import { sfx, unlockAudio } from "@/game/audio";
import { useGame, type HuntPage } from "@/game/store";
import { MenuGrid, MenuTile } from "@/components/menu-tile";
import type { ContractSnap } from "@/game/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

function Back({ children }: { children: ReactNode }) {
  const setPage = useGame((s) => s.setHuntPage);
  return (
    <div className="pt-3">
      <button type="button" className="mb-3 h-12 px-1 text-sm text-gold" onClick={() => setPage("hub")}>
        ← Hunt
      </button>
      {children}
    </div>
  );
}

export function HuntPanel() {
  const page = useGame((s) => s.huntPage);
  const setPage = useGame((s) => s.setHuntPage);
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);

  if (page === "hub") {
    const items: { id: HuntPage; label: string; blurb: string; icon: typeof Trophy; ping?: boolean }[] = [
      { id: "inbox", label: "Inbox", blurb: "Mail and free gifts.", icon: Inbox },
      { id: "shop", label: "Shop", blurb: "Gems, Soul Well, relics, weapons.", icon: ShoppingBag },
      { id: "wheel", label: "Fortune wheel", blurb: "Daily spin. Gold, souls, chests, gems.", icon: CircleDot, ping: snap.wheelReady },
      { id: "raid", label: "Raids", blurb: "Shield up. Hit unshielded camps.", icon: Shield, ping: !snap.shieldOn },
      { id: "daily", label: "Daily login", blurb: "Free gems every day.", icon: Sparkles, ping: snap.dailyReady },
      { id: "calendar", label: "30-day stamp", blurb: "Bigger gems all month.", icon: CalendarDays, ping: snap.monthReady },
      { id: "pass", label: "Battle pass", blurb: "Kill monsters, climb ranks.", icon: Trophy, ping: snap.bpFreeReady + snap.bpPremReady > 0 },
      { id: "market", label: "Black market", blurb: "Today's cheap deals.", icon: ShoppingBag },
      { id: "jobs", label: "Contracts", blurb: "Jobs for gold and chests.", icon: ScrollText, ping: snap.contracts.some((c) => c.ready && !c.claimed) },
      { id: "chests", label: "Chests", blurb: "Open loot you earned.", icon: Gem, ping: snap.chests > 0 },
      { id: "expedition", label: "Expedition", blurb: "Send one hero away 2 hours. Gold, a soul, maybe a chest.", icon: Flag, ping: snap.expeditionReady },
      { id: "arena", label: "Arena", blurb: "Duel. Fallen heroes need revive.", icon: Swords },
      { id: "event", label: "Event shop", blurb: "Spend today's event points.", icon: Sparkles },
      { id: "codex", label: "Beast codex", blurb: "Each kind slain adds damage.", icon: BookOpen },
      { id: "ritual", label: "Dark ritual", blurb: "Reset the hunt for souls.", icon: TimerReset },
    ];
    return (
      <div className="pt-3">
        <p className="mb-3 text-center text-sm text-muted">Tap a tile. Red dot means something to claim.</p>
        <MenuGrid>
          {items.map((it) => (
            <MenuTile
              key={it.id}
              icon={it.icon}
              label={it.label}
              blurb={it.blurb}
              ping={it.ping}
              onClick={() => {
                sfx.ui();
                setPage(it.id);
              }}
            />
          ))}
        </MenuGrid>
      </div>
    );
  }

  if (page === "shop") {
    return (
      <Back>
        <ShopPanel />
      </Back>
    );
  }

  if (page === "wheel") {
    return (
      <Back>
        <WheelPage onClose={() => setPage("hub")} />
      </Back>
    );
  }

  if (page === "raid") {
    return (
      <Back>
        <RaidPage />
      </Back>
    );
  }

  if (page === "daily") {
    const idx = snap.dailyReady ? snap.dailyStreak % 7 : Math.max(0, (snap.dailyStreak - 1) % 7);
    return (
      <Back>
        <div className="rounded-lg border border-gold/40 bg-wood p-4">
          <p className="text-xs tracking-wide text-gold uppercase">7-day login · streak {snap.dailyStreak}</p>
          <ul className="mt-3 flex flex-col gap-1">
            {WEEKLY_LOGIN.map((g, i) => {
              const taken = i < idx || (!snap.dailyReady && i === idx);
              const today = snap.dailyReady && i === idx;
              const extra = i === 6 ? " + 2 chests" : "";
              return (
                <li
                  key={g}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                    today ? "border-gold bg-gold/10 text-gold" : "border-border",
                    taken ? "opacity-50" : "",
                  )}
                >
                  <span>Day {i + 1}</span>
                  <span className="tabular-nums">
                    {g} gems{extra}
                    {taken ? " · taken" : today ? " · claim" : ""}
                  </span>
                </li>
              );
            })}
          </ul>
          <Button
            className="mt-3 h-12 w-full"
            disabled={!snap.dailyReady}
            onClick={() => {
              unlockAudio();
              if (sim.claimDaily()) {
                sfx.chest();
                refresh();
              }
            }}
          >
            {snap.dailyReady ? `Claim ${snap.dailyGems} gems` : "Come back tomorrow"}
          </Button>
        </div>
        <div className="mt-3">
          <HuntPlay />
        </div>
      </Back>
    );
  }

  if (page === "calendar") {
    return (
      <Back>
        <HuntCalendar />
      </Back>
    );
  }

  if (page === "pass") {
    return (
      <Back>
        <HuntPass />
        <div className="mt-3">
          <HuntCard />
        </div>
      </Back>
    );
  }

  if (page === "market") {
    return (
      <Back>
        <div className="rounded-lg border border-border bg-bg/40 p-4">
          <p className="text-xs tracking-wide text-gold uppercase">Black market · today</p>
          <ul className="mt-2 flex flex-col gap-2">
            {snap.market.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm">{d.name}</p>
                  <p className="text-[11px] text-muted">{d.blurb}</p>
                </div>
                <Button
                  size="sm"
                  className="h-10"
                  disabled={d.bought || (d.gems > 0 ? snap.gems < d.gems : snap.gold < d.gold)}
                  onClick={() => {
                    unlockAudio();
                    if (sim.buyMarket(d.id)) {
                      sfx.gold();
                      refresh();
                    }
                  }}
                >
                  {d.bought ? "Sold" : d.gems ? `${d.gems} gems` : formatNum(d.gold)}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </Back>
    );
  }

  if (page === "jobs") {
    return (
      <Back>
        {snap.chapterFloor ? (
          <div className="mb-3 rounded-lg border border-gold/40 bg-wood p-4">
            <p className="text-xs tracking-wide text-gold uppercase">Chapter {snap.chapterFloor}</p>
            <p className="mt-1 text-sm">First clear. {formatNum(snap.chapterGold)} gold + a chest.</p>
            <Button
              className="mt-3 h-12 w-full"
              onClick={() => {
                unlockAudio();
                if (sim.claimChapter()) {
                  sfx.chest();
                  refresh();
                }
              }}
            >
              Claim chapter
            </Button>
          </div>
        ) : null}
        {snap.contracts.some((c) => c.ready && !c.claimed) ? (
          <Button
            className="mb-2 h-11 w-full"
            onClick={() => {
              unlockAudio();
              if (sim.claimAllContracts()) {
                sfx.chest();
                refresh();
              }
            }}
          >
            Claim all ready
          </Button>
        ) : null}
        <ul className="flex flex-col gap-2">
          {snap.contracts.filter((c) => !c.claimed).map((c) => (
            <ContractRow
              key={c.kind}
              contract={c}
              onClaim={() => {
                unlockAudio();
                if (sim.claimContract(c.kind)) {
                  sfx.chest();
                  refresh();
                }
              }}
            />
          ))}
        </ul>
      </Back>
    );
  }

  if (page === "chests") {
    return (
      <Back>
        <p className="font-display text-lg text-gold">{snap.chests} chests</p>
        <div className="mt-3 flex gap-2">
          <Button
            className="h-12 flex-1"
            variant="secondary"
            disabled={snap.chests <= 0}
            onClick={() => {
              unlockAudio();
              const loot = sim.openChest();
              if (loot) {
                sfx.chest();
                useGame.getState().setChestLoot(loot);
                refresh();
              }
            }}
          >
            Open one
          </Button>
          <Button
            className="h-12 flex-1"
            disabled={snap.chests <= 1}
            onClick={() => {
              unlockAudio();
              const loot = sim.openChests(snap.chests);
              if (loot) {
                sfx.chest();
                useGame.getState().setChestLoot(loot);
                refresh();
              }
            }}
          >
            Open all
          </Button>
        </div>
        <Button
          variant="secondary"
          className="mt-3 h-12 w-full"
          disabled={snap.isBoss || snap.gems < 15}
          onClick={() => {
            unlockAudio();
            if (sim.skipFloor()) {
              sfx.ui();
              refresh();
            }
          }}
        >
          Skip this floor · 15 gems
        </Button>
      </Back>
    );
  }

  if (page === "expedition") {
    return (
      <Back>
        <ExpeditionBox />
      </Back>
    );
  }

  if (page === "arena") {
    return (
      <Back>
        <ArenaDuel />
      </Back>
    );
  }

  if (page === "event") {
    return (
      <Back>
        <div className="rounded-lg border border-gold/30 bg-wood p-4 text-fg">
          <p className="text-xs tracking-wide text-gold uppercase">Today's event</p>
          <h3 className="font-display mt-1 text-lg">{snap.eventName}</h3>
          <p className="mt-1 text-sm text-fg/80">{snap.eventBlurb}</p>
          <p className="mt-2 text-sm tabular-nums">{snap.eventPts} event points</p>
          <ul className="mt-3 flex flex-col gap-2">
            {EVENT_SHOP.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-2">
                <span className="text-sm">{it.name}</span>
                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  <Button
                    size="sm"
                    className="h-10"
                    disabled={snap.eventPts < it.cost}
                    onClick={() => {
                      unlockAudio();
                      if (sim.buyEvent(it.id)) {
                        sfx.chest();
                        refresh();
                      }
                    }}
                  >
                    {it.cost} pts
                  </Button>
                  <button
                    type="button"
                    className="text-[10px] text-gold"
                    disabled={snap.eventPts < it.cost}
                    onClick={() => {
                      unlockAudio();
                      if (sim.buyEventMax(it.id)) {
                        sfx.chest();
                        refresh();
                      }
                    }}
                  >
                    MAX
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Back>
    );
  }

  if (page === "inbox") {
    return (
      <Back>
        <InboxBox always />
      </Back>
    );
  }

  if (page === "codex") {
    return (
      <Back>
        <HuntCodex />
      </Back>
    );
  }

  if (page === "ritual") {
    return (
      <Back>
        <div className="rounded-lg border border-border bg-bg/40 p-4">
          <h3 className="font-display text-base font-semibold">Dark Ritual</h3>
          <p className="mt-2 text-sm text-muted">Reset the hunt for souls. Unlocks at floor 12. You keep relics, gems, and influence.</p>
          <p className="mt-2 text-sm tabular-nums">{snap.ritualUnlocked ? `${formatNum(snap.ritualSouls)} souls` : "Reach floor 12"}</p>
          <Button
            className="mt-3 h-12 w-full"
            disabled={!snap.ritualUnlocked || snap.ritualSouls <= 0}
            onClick={() => useGame.getState().setRitualOpen(true)}
          >
            Begin ritual
          </Button>
          <label className="mt-3 flex h-11 items-center justify-between text-sm">
            <span>Farm this floor</span>
            <input
              type="checkbox"
              checked={snap.farm}
              onChange={(e) => {
                sim.setFarm(e.target.checked);
                refresh();
              }}
              className="size-5 accent-accent"
            />
          </label>
        </div>
      </Back>
    );
  }

  return null;
}

function ContractRow({ contract, onClaim }: { contract: ContractSnap; onClaim: () => void }) {
  const ratio = Math.min(1, contract.progress / Math.max(1, contract.goal));
  return (
    <li className="rounded-lg border border-border bg-bg/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-sm">{contract.title}</p>
        <span className="text-xs tabular-nums text-muted">
          {formatNum(contract.progress)}/{formatNum(contract.goal)}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-gold" style={{ width: `${ratio * 100}%` }} />
      </div>
      <Button className="mt-2 h-11 w-full" disabled={!contract.ready} onClick={onClaim}>
        {contract.ready ? "Claim" : "In progress"}
      </Button>
    </li>
  );
}

function InboxBox({ always }: { always?: boolean }) {
  const refresh = useGame((s) => s.refresh);
  const { user } = useCurrentUserState();
  const [mail, setMail] = useState<{ id: number; title: string; body: string; gold: number; souls: number; gems: number; chests: number; claimed: boolean }[]>([]);
  useEffect(() => {
    if (!user) return;
    listInbox()
      .then((r) => setMail(r.mail))
      .catch(() => undefined);
  }, [user]);
  const open = mail.filter((m) => !m.claimed);
  if (!always && !open.length) return <p className="text-sm text-muted">Inbox is empty.</p>;
  if (!open.length) return <p className="text-sm text-muted">No mail waiting.</p>;
  return (
    <div className="rounded-lg border border-gold/40 bg-wood p-4">
      <p className="text-xs tracking-wide text-gold uppercase">Inbox · {open.length}</p>
      <ul className="mt-2 flex flex-col gap-2">
        {open.slice(0, 8).map((m) => (
          <li key={m.id}>
            <p className="font-display text-sm">{m.title}</p>
            {m.body ? <p className="text-[11px] text-muted">{m.body}</p> : null}
          </li>
        ))}
      </ul>
      <Button
        className="mt-3 h-12 w-full"
        onClick={() => {
          unlockAudio();
          claimInbox({ data: {} })
            .then((loot) => {
              sim.applyGift(loot);
              refresh();
              sfx.chest();
              setMail((prev) => prev.map((m) => ({ ...m, claimed: true })));
            })
            .catch(() => undefined);
        }}
      >
        Claim all mail
      </Button>
    </div>
  );
}

function ExpeditionBox() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const ready = snap.heroes.filter((h) => h.level > 0 && !h.down);
  const sample = ready[0];
  const previewGold = sample
    ? Math.floor((40 + sample.level * 8) * snap.maxFloor * 0.35)
    : Math.floor(48 * snap.maxFloor * 0.35);
  return (
    <div className="rounded-lg border border-border bg-bg/40 p-4">
      <p className="text-xs tracking-wide text-gold uppercase">Expedition · 2 hours</p>
      <h3 className="font-display mt-1 text-lg text-gold">Send a crusader out</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg/85">
        Pick one hired hero. They leave the fight for two hours and walk the rift alone. When they
        come back, Collect for gold (about {previewGold.toLocaleString()} right now — it grows with
        their level and your deepest floor), one soul, and a 35% shot at a chest.
      </p>
      <p className="mt-2 text-xs text-muted">
        Only one expedition at a time. A fallen hero cannot go. They do not deal damage while they
        are out. You can keep fighting with everyone else.
      </p>
      {snap.expeditionHero ? (
        <>
          <p className="mt-3 text-sm">
            {snap.expeditionName} {snap.expeditionReady ? "is back with loot." : `returns in ${formatTime(snap.expeditionLeft / 1000)}`}
          </p>
          {snap.expeditionReady ? (
            <Button
              className="mt-2 h-12 w-full"
              onClick={() => {
                unlockAudio();
                if (sim.collectExpedition()) {
                  sfx.chest();
                  refresh();
                }
              }}
            >
              Collect loot
            </Button>
          ) : (
            <p className="mt-2 text-xs text-muted">They are still out. Come back when the timer hits zero.</p>
          )}
        </>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1">
          {ready.slice(0, 8).map((h) => (
            <button
              key={h.id}
              type="button"
              className="h-11 rounded-md border border-gold/40 px-3 text-sm text-gold"
              onClick={() => {
                unlockAudio();
                if (sim.startExpedition(h.id)) {
                  sfx.ui();
                  refresh();
                }
              }}
            >
              Send {HEROES.find((x) => x.id === h.id)?.name ?? h.id}
            </button>
          ))}
          {ready.length === 0 ? <p className="text-xs text-muted">Hire someone first, then send them out.</p> : null}
        </div>
      )}
    </div>
  );
}
