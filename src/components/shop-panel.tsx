import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GEM_PACKS, SOCKETS, WEAPONS } from "@/game/meta";
import { FIRST_PACK_GEMS, FIRST_PACK_USD, HYMN_SKIP_GEMS } from "@/game/cash";
import { RELICS, SCIENCES, HEROES, WEAPON_RANK_CAP, heroPortrait } from "@/game/data";
import { queueIap } from "@/game/net";
import { HERO_CRAFTS } from "@/game/gear";
import { formatNum } from "@/game/format";
import { sfx, unlockAudio } from "@/game/audio";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import type { RelicSnap, ScienceSnap } from "@/game/types";

export function ShopPanel() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const note = useGame((s) => s.shopNote);
  const [hymn, setHymn] = useState(false);

  return (
    <div className="pt-3">
      <div className="rounded-lg border border-gold/40 bg-wood p-4 text-fg">
        <h3 className="font-display text-lg font-semibold">Crafting</h3>
        <p className="mt-2 text-sm text-fg/80">
          Turn gems into ember. Bone drops from every kill. Each crusader has a unique weapon to
          rank up.
        </p>
        <p className="mt-2 text-sm tabular-nums">
          <span className="text-gold">{snap.ember} ember</span>
          {" · "}
          {snap.bone} bone · {snap.riftDust} rift dust · {formatNum(snap.gems)} gems
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            className="h-12 flex-1"
            disabled={snap.gems < 10}
            onClick={() => {
              unlockAudio();
              if (sim.convertGems()) {
                sfx.gold();
                refresh();
              }
            }}
          >
            10 gems → 8 ember
          </Button>
          <Button
            className="h-12 flex-1"
            variant="secondary"
            disabled={snap.gems < 10}
            onClick={() => {
              unlockAudio();
              if (sim.convertAllGems()) {
                sfx.gold();
                refresh();
              }
            }}
          >
            Convert all
          </Button>
        </div>
      </div>

      <p className="mt-4 mb-2 text-xs tracking-wide text-muted uppercase">Craft for each hero</p>
      <ul className="flex flex-col gap-2">
        {snap.heroes.map((h) => {
          const def = HEROES.find((x) => x.id === h.id)!;
          const craft = HERO_CRAFTS[h.id];
          return (
            <li key={h.id} className="flex items-center gap-3 rounded-lg border border-border bg-bg/40 p-3">
              <img
                src={heroPortrait(h.id)}
                alt=""
                className="size-14 shrink-0 rounded-md object-cover"
                crossOrigin="anonymous"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-semibold">{craft.name}</h3>
                <p className="text-xs text-muted">
                  {def.name} · rank {h.craftRank}/8 · {craft.blurb}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  size="sm"
                  className="h-11"
                  disabled={!h.canCraft}
                  onClick={() => {
                    unlockAudio();
                    if (sim.craftHero(h.id)) {
                      sfx.hire();
                      refresh();
                    }
                  }}
                >
                  {h.level <= 0 ? "Hire first" : `${h.craftEmber} ember`}
                </Button>
                {h.level > 0 && h.craftRank < 8 ? (
                  <button
                    type="button"
                    className="text-[10px] text-gold"
                    onClick={() => {
                      unlockAudio();
                      if (sim.craftHeroMax(h.id)) {
                        sfx.hire();
                        refresh();
                      }
                    }}
                  >
                    MAX
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-lg border border-border bg-bg/40 p-4">
        <div className="flex items-center gap-2">
          <img src="/tiles/ritual.png" alt="" className="size-6 object-contain" crossOrigin="anonymous" />
          <h3 className="font-display text-base font-semibold">Soul Well</h3>
        </div>
        <p className="mt-2 text-sm text-muted">
          A short cutting rite. Free once a day, then {snap.summonCost} gems. Hymn once a day for a free pull. New heroes climb out.
        </p>
        {snap.wellToken > 0 ? <p className="mt-1 text-xs text-gold">{snap.wellToken} well token{snap.wellToken === 1 ? "" : "s"} ready</p> : null}
        <Button
          className="mt-3 h-12 w-full"
          disabled={!snap.freeWell && snap.wellToken <= 0 && snap.gems < snap.summonCost}
          onClick={() => {
            unlockAudio();
            sfx.ui();
            useGame.getState().setSummonOpen(true);
          }}
        >
          {snap.freeWell ? "Enter the well · free today" : snap.wellToken > 0 ? `Enter the well · token` : `Enter the well · ${snap.summonCost} gems`}
        </Button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            className="h-12"
            disabled={hymn || !snap.wellHymnReady}
            onClick={() => {
              unlockAudio();
              setHymn(true);
              window.setTimeout(() => {
                if (sim.claimWellHymn(false)) sfx.chest();
                refresh();
                setHymn(false);
              }, 2800);
            }}
          >
            {hymn ? "Hymn…" : snap.wellHymnReady ? "Hymn · 1 pull" : "Hymn used"}
          </Button>
          <Button
            variant="secondary"
            className="h-12"
            disabled={snap.gems < HYMN_SKIP_GEMS}
            onClick={() => {
              unlockAudio();
              if (sim.claimWellHymn(true)) {
                sfx.chest();
                refresh();
              } else sfx.fail();
            }}
          >
            Skip · {HYMN_SKIP_GEMS} gems
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-bg/40 p-4">
        <div className="flex items-center gap-2">
          <img src="/tiles/hud-gem.png" alt="" className="size-6 object-contain" crossOrigin="anonymous" />
          <h3 className="font-display text-base font-semibold">Gem shop</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Apple and Google only take card money inside their stores. First Blood is $0.99 once — 10× the purse.
        </p>
        {!snap.firstBuy ? (
          <div className="mt-3 flex items-center gap-3 rounded-md border border-gold/50 bg-gold/10 px-3 py-3">
            <img src="/shop/firstblood.jpg" alt="" className="size-14 shrink-0 rounded-md object-cover" crossOrigin="anonymous" />
            <div className="min-w-0 flex-1">
            <p className="font-display text-sm text-gold">First Blood · {FIRST_PACK_USD}</p>
            <p className="text-xs text-muted">{FIRST_PACK_GEMS} gems. Once.</p>
            <Button
              className="mt-2 h-12 w-full"
              onClick={() => {
                unlockAudio();
                if (sim.claimFirstBlood()) {
                  sfx.win();
                  refresh();
                }
                queueIap({ data: { packId: "firstblood" } })
                  .then((r) => {
                    useGame.getState().setShopNote(
                      `${r.pack} (${r.usd}) queued for Play. Gems are on you now.`,
                    );
                  })
                  .catch(() => {
                    useGame.getState().setShopNote("Gems are yours. Play charges $0.99 when the listing is live.");
                  });
              }}
            >
              Claim First Blood · {FIRST_PACK_USD}
            </Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-gold">First Blood claimed. 10× purse is yours.</p>
        )}
        <Button
          variant="secondary"
          className="mt-2 flex h-12 w-full items-center justify-center gap-2"
          disabled={!snap.canPouch}
          onClick={() => {
            unlockAudio();
            if (sim.buyGemPouch()) {
              sfx.gold();
              refresh();
            }
          }}
        >
          <img src="/shop/pouch.jpg" alt="" className="size-8 rounded object-cover" crossOrigin="anonymous" />
          {snap.pouchLeft > 0
            ? `Gold pouch · ${formatNum(snap.pouchCost)} gold → 1 gem · 1 today`
            : "Gold pouch · already bought today"}
        </Button>
        <ul className="mt-3 flex flex-col gap-2">
          {GEM_PACKS.filter((p) => p.id !== "firstblood").map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-lg border border-gold/30 bg-bg/80 px-3 py-3">
              <img src={`/shop/${p.id}.jpg`} alt="" className="size-14 shrink-0 rounded-md object-cover" crossOrigin="anonymous" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm text-fg">
                  {p.name} {p.tag ? <span className="text-gold">· {p.tag}</span> : null}
                </p>
                <p className="text-xs text-muted">{p.gems} gems</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-11 min-w-[4.5rem]"
                onClick={() => {
                  unlockAudio();
                  queueIap({ data: { packId: p.id } })
                    .then((r) => {
                      useGame.getState().setShopNote(
                        `${r.pack} (${r.usd}) is queued. Google Play charges it when the listing is live. Daily login gems are live now.`,
                      );
                    })
                    .catch(() => {
                      useGame.getState().setShopNote(`${p.usd} packs go through Play Store when this hunt is listed.`);
                    });
                }}
              >
                {p.usd}
              </Button>
            </li>
          ))}
        </ul>
        {note ? <p className="mt-3 text-sm text-gold">{note}</p> : null}
      </div>

      <p className="mt-5 mb-2 text-xs tracking-wide text-muted uppercase">Weapons</p>
      <Button
        variant="secondary"
        className="mb-2 flex h-11 w-full items-center justify-center gap-2"
        onClick={() => {
          unlockAudio();
          if (sim.buyWeaponAll()) {
            sfx.hire();
            refresh();
          }
        }}
      >
        <img src="/shop/ash-blade.jpg" alt="" className="size-7 rounded object-cover" crossOrigin="anonymous" />
        Max all weapons
      </Button>
      <ul className="flex flex-col gap-2">
        {snap.weapons.map((w) => {
          const def = WEAPONS.find((x) => x.id === w.id)!;
          const levelMaxed = w.level >= WEAPON_RANK_CAP;
          return (
            <li key={w.id} className="flex items-center gap-3 rounded-lg border border-gold/30 bg-bg/80 p-3">
              <img src={`/shop/${w.id}.jpg`} alt="" className="size-14 shrink-0 rounded-md object-cover" crossOrigin="anonymous" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-sm font-semibold">{def.name}</h3>
                  <span className="text-[11px] text-muted">Rank {w.level}</span>
                </div>
                <p className="text-xs text-muted">{def.blurb}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  size="sm"
                  className="h-11 min-w-[6.5rem] max-w-[9rem] px-2 text-[11px] tabular-nums"
                  disabled={levelMaxed || (!w.canAfford && !w.canGem)}
                  onClick={() => {
                    unlockAudio();
                    if (sim.buyWeapon(w.id)) {
                      sfx.hire();
                      refresh();
                    }
                  }}
                >
                  {levelMaxed ? "Maxed" : w.canAfford ? formatNum(w.cost) : w.gemCost > 0 ? `${formatNum(w.gemCost)} gems` : formatNum(w.cost)}
                </Button>
                <button
                  type="button"
                  className="text-[10px] text-gold"
                  disabled={levelMaxed}
                  onClick={() => {
                    unlockAudio();
                    if (sim.buyWeaponMax(w.id)) {
                      sfx.hire();
                      refresh();
                    }
                  }}
                >
                  MAX
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 mb-2 text-xs tracking-wide text-muted uppercase">Gems to socket</p>
      <ul className="flex flex-col gap-2">
        {snap.sockets.map((s) => {
          const def = SOCKETS.find((x) => x.id === s.id)!;
          return (
            <li key={s.id} className="flex items-center gap-3 rounded-lg border border-gold/30 bg-bg/80 p-3">
              <img src={`/shop/${s.id}.jpg`} alt="" className="size-14 shrink-0 rounded-md object-cover" crossOrigin="anonymous" />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-sm font-semibold">
                  {def.name}
                  {s.equipped ? <span className="ml-2 text-gold">in</span> : null}
                </h3>
                <p className="text-xs text-muted">{def.blurb}</p>
              </div>
              <Button
                size="sm"
                variant={s.owned ? "secondary" : "default"}
                className="h-11"
                disabled={!s.canAfford}
                onClick={() => {
                  unlockAudio();
                  if (sim.buySocket(s.id)) {
                    sfx.ui();
                    refresh();
                  }
                }}
              >
                {s.owned ? (s.equipped ? "Unequip" : "Socket") : `${s.gemCost} gems`}
              </Button>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 mb-2 text-xs tracking-wide text-gold uppercase">Forge with souls</p>
      <Button
        variant="secondary"
        className="mb-2 flex h-11 w-full items-center justify-center gap-2"
        onClick={() => {
          unlockAudio();
          if (sim.buyRelicAll()) {
            sfx.hire();
            refresh();
          }
        }}
      >
        <img src="/shop/blood-sigil.jpg" alt="" className="size-7 rounded object-cover" crossOrigin="anonymous" />
        Max all relics
      </Button>
      <ul className="flex flex-col gap-2">
        {snap.relics.map((r) => (
          <RelicRow
            key={r.id}
            relic={r}
            onBuy={() => {
              unlockAudio();
              if (sim.buyRelic(r.id)) {
                sfx.hire();
                refresh();
              }
            }}
            onMax={() => {
              unlockAudio();
              if (sim.buyRelicMax(r.id)) {
                sfx.hire();
                refresh();
              }
            }}
          />
        ))}
      </ul>
      <p className="mt-6 mb-2 text-xs tracking-wide text-gold uppercase">Rift sciences · influence</p>
      <Button
        variant="secondary"
        className="mb-2 flex h-11 w-full items-center justify-center gap-2"
        onClick={() => {
          unlockAudio();
          if (sim.buyScienceAll()) {
            sfx.hire();
            refresh();
          }
        }}
      >
        <img src="/shop/war.jpg" alt="" className="size-7 rounded object-cover" crossOrigin="anonymous" />
        Max all sciences
      </Button>
      <ul className="flex flex-col gap-2">
        {snap.sciences.map((s) => (
          <ScienceRow
            key={s.id}
            science={s}
            onBuy={() => {
              unlockAudio();
              if (sim.buyScience(s.id)) {
                sfx.hire();
                refresh();
              }
            }}
            onMax={() => {
              unlockAudio();
              if (sim.buyScienceMax(s.id)) {
                sfx.hire();
                refresh();
              }
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function RelicRow({ relic, onBuy, onMax }: { relic: RelicSnap; onBuy: () => void; onMax: () => void }) {
  const def = RELICS.find((r) => r.id === relic.id)!;
  return (
    <li className="flex items-center gap-3 rounded-lg border border-gold/30 bg-bg/80 p-3">
      <img src={`/shop/${relic.id}.jpg`} alt="" className="size-14 shrink-0 rounded-md object-cover" crossOrigin="anonymous" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-fg">{def.name}</h3>
          <span className="shrink-0 text-[11px] text-muted">Rank {relic.level}</span>
        </div>
        <p className="text-xs text-muted">{def.blurb}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <Button size="sm" className="h-11" disabled={!relic.canAfford} onClick={onBuy}>
          {formatNum(relic.cost)}
        </Button>
        <button type="button" className="text-[10px] text-gold" disabled={!relic.canAfford} onClick={onMax}>
          MAX
        </button>
      </div>
    </li>
  );
}

function ScienceRow({ science, onBuy, onMax }: { science: ScienceSnap; onBuy: () => void; onMax: () => void }) {
  const def = SCIENCES.find((s) => s.id === science.id)!;
  return (
    <li className="flex items-center gap-3 rounded-lg border border-gold/30 bg-bg/80 p-3">
      <img src={`/shop/${science.id}.jpg`} alt="" className="size-14 shrink-0 rounded-md object-cover" crossOrigin="anonymous" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-fg">{def.name}</h3>
          <span className="shrink-0 text-[11px] text-muted">Rank {science.level}</span>
        </div>
        <p className="text-xs text-muted">{def.blurb}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <Button size="sm" variant="secondary" className="h-11" disabled={!science.canAfford} onClick={onBuy}>
          {formatNum(science.cost)}
        </Button>
        <button type="button" className="text-[10px] text-gold" disabled={!science.canAfford} onClick={onMax}>
          MAX
        </button>
      </div>
    </li>
  );
}