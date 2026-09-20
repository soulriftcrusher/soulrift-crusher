import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ShopPanel } from "@/components/shop-panel";
import { ArenaDuel } from "@/components/arena-duel";
import { HuntCalendar, HuntPass, HuntPlay, HuntCard, HuntCodex } from "@/components/hunt-live";
import { WheelPage } from "@/components/wheel-page";
import { RaidPage } from "@/components/raid-page";
import { WEEKLY_LOGIN, marketPrize } from "@/game/liveops";
import { HEROES, heroPortrait } from "@/game/data";
import { EVENT_SHOP } from "@/game/gear";
import { prizeArt } from "@/game/prize-art";
import { formatNum, formatTime } from "@/game/format";
import { claimInbox, listInbox } from "@/game/live-net";
import { MessagesPanel } from "@/components/messages-panel";
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

const WHEEL_BACKS = ["/bg/wheel-1.jpg?v=2", "/bg/wheel-2.jpg?v=2"];

export function HuntPanel() {
  const page = useGame((s) => s.huntPage);
  const setPage = useGame((s) => s.setHuntPage);
  const [wheelBack, setWheelBack] = useState(WHEEL_BACKS[0]!);
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);

  useEffect(() => {
    if (page !== "wheel") return;
    setWheelBack(WHEEL_BACKS[Math.floor(Math.random() * WHEEL_BACKS.length)]!);
  }, [page]);

  if (page === "hub") {
    const items: { id: HuntPage; label: string; blurb: string; ping?: boolean }[] = [
      { id: "inbox", label: "Inbox", blurb: "Mail, gifts, and whispers." },
      { id: "shop", label: "Shop", blurb: "Gems, Soul Well, relics, weapons." },
      { id: "wheel", label: "Fortune wheel", blurb: "Daily spin. Gold, souls, chests, gems.", ping: snap.wheelReady },
      { id: "raid", label: "Raids", blurb: "Shield up. Hit unshielded camps.", ping: !snap.shieldOn },
      { id: "daily", label: "Daily login", blurb: "Free gems every day.", ping: snap.dailyReady },
      { id: "calendar", label: "30-day stamp", blurb: "Bigger gems all month.", ping: snap.monthReady },
      { id: "pass", label: "Battle pass", blurb: "Kill monsters, climb ranks.", ping: snap.bpFreeReady + snap.bpPremReady > 0 },
      { id: "market", label: "Black market", blurb: "Today's cheap deals." },
      { id: "jobs", label: "Contracts", blurb: "Jobs for gold and chests.", ping: snap.contracts?.some((c) => c.ready && !c.claimed) },
      { id: "chests", label: "Chests", blurb: "Open loot you earned.", ping: snap.chests > 0 },
      { id: "expedition", label: "Expedition", blurb: "Send one hero away 2 hours. Gold, a soul, maybe a chest.", ping: snap.expeditionReady },
      { id: "arena", label: "Arena", blurb: "Duel. Fallen heroes need revive." },
      { id: "event", label: "Event shop", blurb: "Spend today's event points." },
      { id: "codex", label: "Beast codex", blurb: "Each kind slain adds damage." },
      { id: "ritual", label: "Dark ritual", blurb: "Reset the hunt for souls." },
    ];
    return (
      <div className="hunt-hub flex min-h-0 flex-1 flex-col pt-1">
        <MenuGrid compact>
          {items.map((it) => (
            <MenuTile
              key={it.id}
              art={`/tiles/${it.id}.png`}
              label={it.label}
              blurb={it.blurb}
              ping={it.ping}
              compact
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
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl">
        <img
          src={wheelBack}
          alt=""
          className="absolute inset-0 size-full object-cover"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/60 to-bg/45" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col px-1 pt-1">
          <button type="button" className="mb-1 h-9 shrink-0 self-start px-1 text-sm text-gold" onClick={() => setPage("hub")}>
            ← Hunt
          </button>
          <div className="min-h-0 flex-1">
            <WheelPage onClose={() => setPage("hub")} />
          </div>
        </div>
      </div>
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
        <div className="overflow-hidden rounded-xl border-2 border-gold/50 bg-[#1a100c]/92 p-3 shadow-[0_6px_0_#3a1c10]">
          <div className="flex items-center gap-3">
            <img src="/shop/login-flame.jpg" alt="" className="size-14 rounded-lg object-cover" crossOrigin="anonymous" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg text-gold">Weekly rite</p>
              <p className="text-xs text-[#f0e6d8]">
                Streak {snap.dailyStreak}. Miss a day and it starts at 1.
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {WEEKLY_LOGIN.map((g, i) => {
              const taken = i < idx || (!snap.dailyReady && i === idx);
              const today = snap.dailyReady && i === idx;
              const week = i === 6;
              return (
                <div
                  key={i}
                  className={cn(
                    "relative overflow-hidden rounded-xl border-2 p-2",
                    week ? "col-span-2 min-h-[7.5rem]" : "min-h-[6.5rem]",
                    today ? "login-today border-gold bg-gold/15" : "border-gold/25 bg-bg/50",
                    taken ? "opacity-70" : "",
                  )}
                >
                  <p className="font-display text-[11px] tracking-wide text-gold uppercase">Day {i + 1}</p>
                  <div className="mt-1 flex items-center justify-center">
                    <img
                      src={week ? "/shop/login-chest.jpg" : prizeArt("gems")}
                      alt=""
                      className={cn("object-contain", week ? "size-16" : "size-12")}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <p className="mt-1 text-center text-xs tabular-nums text-[#fff6e0]">
                    {g} gem{g === 1 ? "" : "s"}
                    {week ? " · 2 chests" : ""}
                  </p>
                  {today ? <p className="text-center text-[10px] text-gold">Claim</p> : null}
                  {taken ? (
                    <img
                      src="/shop/login-seal.jpg"
                      alt=""
                      className="pointer-events-none absolute inset-0 size-full object-cover opacity-80"
                      crossOrigin="anonymous"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
          <Button
            className="mt-3 h-12 w-full font-display text-base"
            disabled={!snap.dailyReady}
            onClick={() => {
              unlockAudio();
              if (sim.claimDaily()) {
                sfx.chest();
                refresh();
              }
            }}
          >
            {snap.dailyReady ? `Claim day ${idx + 1}` : "Come back tomorrow"}
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
            {snap.market.map((d) => {
              const art = prizeArt(marketPrize(d.id));
              return (
              <li key={d.id} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <img src={art} alt="" className="size-12 shrink-0 object-contain" crossOrigin="anonymous" />
                  <div>
                  <p className="text-sm">{d.name}</p>
                  <p className="text-[11px] text-muted">{d.blurb}</p>
                  </div>
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
              );
            })}
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
        {snap.contracts?.some((c) => c.ready && !c.claimed) ? (
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
          {(snap.contracts ?? []).filter((c) => !c.claimed).map((c) => (
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
        <p className="text-center font-display text-lg text-gold">{snap.chests} chest{snap.chests === 1 ? "" : "s"}</p>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            disabled={snap.chests <= 0}
            className="disabled:opacity-40"
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
            <img src={prizeArt("chest")} alt="" className="size-28 object-contain drop-shadow" crossOrigin="anonymous" />
          </button>
        </div>
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
          disabled={snap.isBoss || snap.skipLeft <= 0 || snap.gems < snap.skipCost}
          onClick={() => {
            unlockAudio();
            if (sim.skipFloor()) {
              sfx.ui();
              refresh();
            }
          }}
        >
          {snap.skipLeft <= 0
            ? "Skip · none left today"
            : snap.isBoss
              ? "Can't skip a boss"
              : `Skip this floor · ${snap.skipCost} gems · ${snap.skipLeft} left`}
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
                <span className="flex min-w-0 items-center gap-2">
                  <img src={prizeArt(it.kind)} alt="" className="size-12 shrink-0 object-contain" crossOrigin="anonymous" />
                  <span className="text-sm">{it.name}</span>
                </span>
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
        <div className="mt-4">
          <MessagesPanel />
        </div>
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
  if (!open.length) {
    if (always) return null;
    return <p className="text-sm text-muted">Inbox is empty.</p>;
  }
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
          <div className="mt-3 flex items-center gap-3">
            <img
              src={heroPortrait(snap.expeditionHero)}
              alt=""
              className="size-16 rounded-lg border-2 border-gold object-cover"
              crossOrigin="anonymous"
            />
            <p className="text-sm">
              {snap.expeditionName} {snap.expeditionReady ? "is back with loot." : `returns in ${formatTime(snap.expeditionLeft / 1000)}`}
            </p>
          </div>
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
        <div className="mt-3 grid grid-cols-4 gap-2">
          {ready.slice(0, 8).map((h) => (
            <button
              key={h.id}
              type="button"
              className="flex flex-col items-center gap-1 rounded-lg border border-gold/40 bg-bg/50 p-1.5 text-gold"
              onClick={() => {
                unlockAudio();
                if (sim.startExpedition(h.id)) {
                  sfx.ui();
                  refresh();
                }
              }}
            >
              <img
                src={heroPortrait(h.id)}
                alt=""
                className="size-14 rounded-md object-cover"
                crossOrigin="anonymous"
              />
              <span className="font-display text-[11px] leading-tight">{HEROES.find((x) => x.id === h.id)?.name ?? h.id}</span>
            </button>
          ))}
          {ready.length === 0 ? <p className="text-xs text-muted">Hire someone first, then send them out.</p> : null}
        </div>
      )}
    </div>
  );
}
