import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Coins,
  Crown,
  Gem,
  Ghost,
  Hammer,
  Map as MapIcon,
  Settings,
  Share2,
  Shield,
  ShoppingBag,
  Skull,
  Swords,
  TimerReset,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClanPanel, ClanSync } from "@/components/clan-panel";
import { CloudSync } from "@/components/cloud-sync";
import { CraftPage } from "@/components/craft-page";
import { HuntPanel } from "@/components/hunt-panel";
import { HeroFace } from "@/components/hero-face";
import { HunterCard } from "@/components/hunter-card";
import { AdBanner } from "@/components/ad-banner";
import { LegalOverlay } from "@/components/legal-overlay";
import { adsReady } from "@/game/ads";
import { MoveHunt } from "@/components/move-hunt";
import { RealmPanel } from "@/components/realm-panel";
import { StaffPanel } from "@/components/staff-panel";
import { SummonGame } from "@/components/summon-game";
import { exitLocalDemo } from "@/game/demo";
import { isDemoHunt } from "@/game/demo-flag";
import { HEROES, SKILLS, heroPortrait, type HeroId, type SkillId } from "@/game/data";
import { formatNum, formatTime } from "@/game/format";
import { setHuntName, staffStatus, claimStaff } from "@/game/net";
import { redeemCode } from "@/game/live-net";
import { readHuntName, writeHuntName } from "@/game/name";
import { stackRunes, describeRune, runeArt, RARITY_NAME, RARITY_RING, RUNE_BLURB, RUNE_JOB, type OwnedRune } from "@/game/gear";
import { NAME_CLASS, SPLASH_COLOR, type LookId } from "@/game/cash";
import { APP_VERSION, PATCHES } from "@/game/patch-notes";
import { markPatchSeen } from "@/game/prefs";
import { alertsPermission, alertsWanted, sendTestAlert } from "@/game/push-client";
import { Renderer, preloadHuntArt } from "@/game/renderer";
import { clearSave, hasSave } from "@/game/save";
import { moveOpen } from "@/game/migrate";
import { seasonClock, formatSeasonLeft } from "@/game/shards";
import { sim } from "@/game/sim";
import { sfx, setMuted, unlockAudio } from "@/game/audio";
import { useGame, type Tab } from "@/game/store";
import type { ArenaResult, HeroSnap } from "@/game/types";
import { authEnabled, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { readBoardPref, writeBoardPref, useDesk, type BoardPref } from "@/lib/desk";
import { cn } from "@/lib/utils";

function huntUrl(): string {
  if (typeof window === "undefined") return "https://grok.me";
  return `${window.location.origin}/`;
}

export function GameApp() {
  const screen = useGame((s) => s.screen);
  const moveHuntOpen = useGame((s) => s.moveHuntOpen);
  const desk = useDesk();
  const { user, isPending } = useCurrentUserState();
  const demoHunt = useGame((s) => s.demoHunt);
  useEffect(() => {
    if (isDemoHunt()) exitLocalDemo();
  }, []);
  const shell = cn(
    "flex h-full min-h-0 w-full flex-col overflow-hidden bg-bg text-fg select-none",
    desk && "mx-auto max-w-[1280px] border-x border-gold/20",
  );
  if (authEnabled && isPending && !demoHunt) {
    return (
      <div className="grid h-svh place-items-center bg-bg text-gold">
        <p className="font-display text-sm">Checking your hunt…</p>
      </div>
    );
  }
  if (authEnabled && !user && !demoHunt) {
    return (
      <div className={cn("h-svh max-h-svh", desk && "bg-[#070506]")}>
        <div className={shell}>
          <TitleScreen />
          <LegalOverlay />
          {moveHuntOpen ? <MoveHunt /> : null}
        </div>
      </div>
    );
  }
  return (
    <div className={cn("h-svh max-h-svh", desk && "bg-[#070506]")}>
      <CloudSync />
      <ClanSync />
      <div className={shell}>
        {screen === "title" ? <TitleScreen /> : <PlayScreen />}
        <LegalOverlay />
        {moveHuntOpen ? <MoveHunt /> : null}
      </div>
    </div>
  );
}

function TitleScreen() {
  const setScreen = useGame((s) => s.setScreen);
  const refresh = useGame((s) => s.refresh);
  const { user, isPending } = useCurrentUserState();
  const desk = useDesk();
  const [continueAvailable, setContinueAvailable] = useState(false);
  const [load, setLoad] = useState(18);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    preloadHuntArt();
    setContinueAvailable(hasSave() && sim.state.kills + sim.state.clicks > 0);
    const id = window.setInterval(() => {
      setLoad((n) => (n >= 100 ? 100 : n + 9));
    }, 70);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (load < 100 || isPending || !user) return;
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab) enter(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, user, isPending]);

  function enter(fresh: boolean) {
    if (authEnabled && !user) return;
    unlockAudio();
    sfx.ui();
    if (fresh) {
      clearSave();
      sim.reset();
    }
    useGame.getState().offlineGold = sim.takeOfflineGold();
    refresh();
    setScreen("play");
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <img
        src="/bg/splash.jpg?v=fight"
        alt=""
        className="absolute inset-0 size-full object-cover"
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-transparent" />
      <div className="relative z-10 flex h-full flex-col items-center overflow-y-auto px-5 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <p className="font-display text-xs tracking-[0.32em] text-gold uppercase">Idle dungeon RPG</p>
        <h1 className="font-display mt-2 text-center text-5xl leading-none font-semibold text-gold drop-shadow">
          Soulrift
          <span className="mt-1 block text-4xl text-fg">Crusher</span>
        </h1>
        <p className="mt-3 text-center text-xs text-gold/90">
          Season {seasonClock().season} · server war in {formatSeasonLeft(seasonClock().msLeft)}
        </p>
        {desk ? (
          <p className="mt-2 text-center text-xs text-muted">PC board · Space strikes · 1–4 skills</p>
        ) : null}
        <div className={cn("mt-auto w-full", desk ? "max-w-md" : "max-w-sm")}>
          {load < 100 ? (
            <div className="mb-4">
              <div className="h-3 overflow-hidden rounded-full border border-gold/50 bg-bg/80">
                <div className="h-full bg-accent" style={{ width: `${load}%` }} />
              </div>
              <p className="mt-2 text-center font-display text-sm text-gold">Starting up… {load}%</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <p className="text-center text-sm text-gold">Signed in as {user.displayName ?? "hunter"}</p>
                  <Button size="lg" className="h-12 w-full font-display tracking-wide" onClick={() => enter(!continueAvailable)}>
                    {continueAvailable ? "Enter the rift" : "Begin the hunt"}
                  </Button>
                  {user && moveOpen() ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 w-full font-display tracking-wide"
                      onClick={() => useGame.getState().setMoveHuntOpen(true)}
                    >
                      Move my hunt
                    </Button>
                  ) : null}
                  {continueAvailable ? (
                    <Button size="lg" variant="secondary" className="h-12 w-full" onClick={() => enter(true)}>
                      New crusade
                    </Button>
                  ) : null}
                </>
              ) : isPending ? (
                <p className="text-center text-sm text-gold">Checking your hunt…</p>
              ) : (
                <Button asChild size="lg" className="h-12 w-full font-display tracking-wide">
                  <Link to="/login">Sign in to hunt</Link>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full"
                onClick={() => {
                  unlockAudio();
                  sfx.ui();
                  setShareOpen(true);
                }}
              >
                <Share2 className="size-4" />
                Share this hunt
              </Button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => useGame.getState().setLegalPage("guide")} className="grid h-11 place-items-center rounded-md border border-gold/40 bg-bg/60 text-sm text-gold">
                  How to hunt
                </button>
                <button type="button" onClick={() => useGame.getState().setLegalPage("privacy")} className="grid h-11 place-items-center rounded-md border border-gold/40 bg-bg/60 text-sm text-gold">
                  Privacy Policy
                </button>
                <button type="button" onClick={() => useGame.getState().setLegalPage("support")} className="grid h-11 place-items-center rounded-md border border-gold/40 bg-bg/60 text-sm text-gold">
                  Support
                </button>
                <button type="button" onClick={() => useGame.getState().setLegalPage("copyright")} className="grid h-11 place-items-center rounded-md border border-gold/40 bg-bg/60 text-sm text-gold">
                  Copyright
                </button>
              </div>
              <p className="text-center text-[10px] text-muted">© 2026 Soulrift Crusher. All rights reserved.</p>
            </div>
          )}
        </div>
      </div>
      {shareOpen ? <ShareSheet onClose={() => setShareOpen(false)} /> : null}
    </div>
  );
}

function PlayScreen() {
  const tab = useGame((s) => s.tab);
  const setTab = useGame((s) => s.setTab);
  const desk = useDesk();
  const offlineGold = useGame((s) => s.offlineGold);
  const settingsOpen = useGame((s) => s.settingsOpen);
  const ritualOpen = useGame((s) => s.ritualOpen);
  const arenaResult = useGame((s) => s.arenaResult);
  const chestLoot = useGame((s) => s.chestLoot);
  const summonOpen = useGame((s) => s.summonOpen);
  const patchOpen = useGame((s) => s.patchOpen);
  const isStaff = useGame((s) => s.isStaff);
  const huntPage = useGame((s) => s.huntPage);
  const demoHunt = useGame((s) => s.demoHunt);
  const founderClaimed = useGame((s) => s.snap.founderClaimed);
  const showFounder = isStaff || founderClaimed;

  useEffect(() => {
    if (demoHunt) return;
    if (founderClaimed) useGame.getState().setIsStaff(true);
    void staffStatus()
      .then(async (s) => {
        if (s.isStaff) {
          useGame.getState().setIsStaff(true);
          return;
        }
        if (founderClaimed && s.canClaim) {
          try {
            await claimStaff();
            useGame.getState().setIsStaff(true);
            return;
          } catch {
            /* seat taken */
          }
        }
        if (!founderClaimed) useGame.getState().setIsStaff(false);
      })
      .catch(() => {
        if (founderClaimed) useGame.getState().setIsStaff(true);
      });
    const raw = new URLSearchParams(window.location.search).get("tab");
    const allowed = ["fight", "heroes", "shop", "hunt", "clan", "realm", "founders"] as const;
    if (raw && (allowed as readonly string[]).includes(raw)) {
      useGame.getState().setTab(raw as (typeof allowed)[number]);
    }
    if (navigator.storage?.persist) void navigator.storage.persist();
  }, [demoHunt, founderClaimed]);

  useEffect(() => {
    if (tab === "founders" && !showFounder) setTab("fight");
  }, [tab, showFounder, setTab]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <Hud />
      <div className="flex min-h-0 flex-1">
        {desk ? (
          <aside className="flex w-16 shrink-0 flex-col border-r border-gold/20 bg-wood">
            <DeskRail />
          </aside>
        ) : null}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {tab === "shop" ? (
            <CraftPage onClose={() => setTab("fight")} />
          ) : tab === "heroes" ? (
            <MenuPage title="Heroes" parchment>
              <HeroPanel />
            </MenuPage>
          ) : tab === "realm" ? (
            <MenuPage title="Realms">
              <RealmPanel />
            </MenuPage>
          ) : tab === "hunt" ? (
            <MenuPage title={huntPage === "shop" ? "Shop" : "Hunt"}>
              <HuntPanel />
            </MenuPage>
          ) : tab === "clan" ? (
            <MenuPage title="Clans">
              <ClanPanel />
            </MenuPage>
          ) : tab === "founders" && showFounder ? (
            <MenuPage title="Founders">
              <StaffPanel />
            </MenuPage>
          ) : (
            <Battle />
          )}
          {desk ? null : (
            <>
              <AdBanner />
              <TabBar />
            </>
          )}
        </div>
      </div>
      {offlineGold > 0 ? <OfflineModal gold={offlineGold} /> : null}
      {patchOpen ? <PatchModal /> : null}
      {settingsOpen ? <SettingsModal /> : null}
      {ritualOpen ? <RitualModal /> : null}
      {arenaResult ? <ArenaModal result={arenaResult} /> : null}
      {chestLoot ? <ChestModal loot={chestLoot} /> : null}
      <HunterCard />
      {summonOpen ? <SummonGame onClose={() => useGame.getState().setSummonOpen(false)} /> : null}
    </div>
  );
}

function Hud() {
  const snap = useGame((s) => s.snap);
  const onlineCount = useGame((s) => s.onlineCount);
  const setSettingsOpen = useGame((s) => s.setSettingsOpen);
  const muted = useGame((s) => s.muted);
  return (
    <header className="grid shrink-0 grid-cols-3 gap-1 border-b border-border bg-bg px-2 py-1.5 pt-[max(0.4rem,env(safe-area-inset-top))]">
      <HudStat icon={<Swords className="size-3.5 text-accent" />} value={formatNum(snap.clickDmg)} />
      <HudStat icon={<Ghost className="size-3.5 text-soul" />} value={formatNum(snap.souls)} />
      <HudStat icon={<Coins className="size-3.5 text-gold" />} value={formatNum(snap.gold)} />
      <div className="col-span-3 mt-0.5 flex items-center gap-2 text-[11px] tabular-nums text-muted">
        <Gem className="size-3 text-gold" />
        {formatNum(snap.gems)} gems
        {snap.shieldOn ? <span className="text-gold">· shield {formatTime(snap.shieldLeft / 1000)}</span> : <span>· no shield</span>}
        {onlineCount > 0 ? <span className="text-gold">· {onlineCount} online</span> : null}
        {moveOpen() ? (
          <button
            type="button"
            className="rounded-md border border-gold/40 px-2 py-0.5 text-[10px] text-gold"
            onClick={() => useGame.getState().setMoveHuntOpen(true)}
          >
            Move hunt
          </button>
        ) : null}
        <span className="ml-auto flex items-center gap-1">
          <AuthChip />
          <button
            type="button"
            aria-label={muted ? "Unmute" : "Mute"}
            className="grid size-9 place-items-center rounded-md"
            onClick={() => {
              const next = !useGame.getState().muted;
              useGame.getState().setMuted(next);
              setMuted(next);
              unlockAudio();
            }}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <button type="button" aria-label="Settings" className="grid size-9 place-items-center rounded-md" onClick={() => setSettingsOpen(true)}>
            <Settings className="size-4" />
          </button>
        </span>
      </div>
    </header>
  );
}

function HudStat({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1 font-display text-sm tabular-nums text-gold">
      {icon}
      {value}
    </div>
  );
}

function AuthChip() {
  const { user, isPending } = useCurrentUserState();
  const avatar = useGame((s) => s.snap.avatarHero);
  if (isPending) return <div className="size-9 shrink-0 animate-pulse rounded-md bg-surface-2" />;
  if (!user) {
    return (
      <Link to="/login" aria-label="Sign in" className="grid size-9 shrink-0 place-items-center rounded-md text-muted hover:text-fg">
        <Users className="size-4" />
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-label="Profile"
      className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md"
      onClick={() => {
        unlockAudio();
        sfx.ui();
        useGame.getState().setTab("clan");
        useGame.getState().setClanPage("profile");
      }}
    >
      <HeroFace id={avatar} className="size-7 border border-gold" />
    </button>
  );
}

function Battle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const shake = useGame((s) => s.shake);
  const refresh = useGame((s) => s.refresh);
  const snap = useGame((s) => s.snap);
  const desk = useDesk();
  const isStaff = useGame((s) => s.isStaff);
  const showFounder = isStaff || snap.founderClaimed;
  const showNames = useGame((s) => s.showNames);
  const reduceFx = useGame((s) => s.reduceFx);
  const skillSfx = useGame((s) => s.skillSfx);
  const splash = useGame((s) => s.snap.splash);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new Renderer(canvas, sim);
    rendererRef.current = renderer;
    renderer.setShake(shake);
    renderer.setNames(showNames);
    renderer.setReduce(reduceFx);
    renderer.setSplash(SPLASH_COLOR[(splash as LookId) ?? "ash"] ?? "#e8a090");
    renderer.setHud(() => useGame.getState().refresh());
    void renderer.load().then(() => renderer.start());
    return () => {
      renderer.stop();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.setShake(shake);
  }, [shake]);

  useEffect(() => {
    rendererRef.current?.setNames(showNames);
  }, [showNames]);

  useEffect(() => {
    rendererRef.current?.setReduce(reduceFx);
  }, [reduceFx]);

  useEffect(() => {
    rendererRef.current?.setSplash(SPLASH_COLOR[(splash as LookId) ?? "ash"] ?? "#e8a090");
  }, [splash]);

  function strike(e: PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    unlockAudio();
    sim.click();
    refresh();
  }

  return (
    <div className="relative min-h-0 flex-1">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full touch-none"
        onPointerDown={strike}
      />
      <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex flex-col items-center gap-1 px-3">
        <p className="rounded-md border border-gold/40 bg-bg/70 px-3 py-0.5 font-display text-sm tracking-wide text-gold uppercase">
          Level {snap.floor}
        </p>
        <p className="flex items-center gap-1 text-[11px] text-muted">
          <Ghost className="size-3 text-soul" />
          {(snap.floor % 10) || 10} / 10
        </p>
        <div className="h-2.5 w-44 overflow-hidden rounded-full border border-gold/40 bg-bg/80">
          <div
            className={cn(
              "h-full",
              snap.monsterHp / Math.max(1, snap.monsterMax) > 0.5
                ? "bg-hp"
                : snap.monsterHp / Math.max(1, snap.monsterMax) > 0.2
                  ? "bg-gold"
                  : "bg-danger",
            )}
            style={{ width: `${Math.max(2, (snap.monsterHp / Math.max(1, snap.monsterMax)) * 100)}%` }}
          />
        </div>
        <p className="font-display text-sm tracking-wide text-[#f0e6d8] uppercase">
          {snap.monsterName}
          {snap.isBoss ? " · Boss" : ""}
        </p>
        <p className="text-[11px] text-gold">
          {formatNum(snap.monsterHp)} / {formatNum(snap.monsterMax)}
        </p>
        {snap.isBoss && snap.bossMaxTime > 0 ? (
          <div className="h-1.5 w-40 overflow-hidden rounded-full border border-gold/30 bg-bg/70">
            <div className="h-full bg-accent" style={{ width: `${Math.max(2, (snap.bossTime / snap.bossMaxTime) * 100)}%` }} />
          </div>
        ) : null}
      </div>
      {!desk ? (
        <>
          <div className="absolute top-16 left-2 z-10 flex flex-col gap-2">
            <SideBtn icon={<Trophy className="size-5" />} label="Hunt" onClick={() => useGame.getState().setTab("hunt")} />
            <SideBtn icon={<Shield className="size-5" />} label="Clans" onClick={() => useGame.getState().setTab("clan")} />
            <SideBtn icon={<MapIcon className="size-5" />} label="Realms" onClick={() => useGame.getState().setTab("realm")} />
            {showFounder ? (
              <SideBtn icon={<Crown className="size-5" />} label="Founder" onClick={() => useGame.getState().setTab("founders")} />
            ) : null}
          </div>
          <div className="absolute top-16 right-2 z-10 flex flex-col gap-2">
            <SideBtn icon={<Users className="size-5" />} label="Heroes" onClick={() => useGame.getState().setTab("heroes")} />
            <SideBtn icon={<Gem className="size-5" />} label="Shop" onClick={() => useGame.getState().openHunt("shop")} />
          </div>
        </>
      ) : null}
      <div className={cn("pointer-events-none absolute inset-x-0 bottom-[max(0.35rem,env(safe-area-inset-bottom))] px-2", desk && "px-4")}>
        <div className="grid grid-cols-4 gap-1">
          {snap.skills.map((sk) => {
            const def = SKILLS.find((s) => s.id === sk.id);
            return (
              <button
                key={sk.id}
                type="button"
                className={cn(
                  "pointer-events-auto flex h-16 flex-col items-center justify-center rounded-xl border bg-bg/75 px-1 font-display text-[11px] leading-tight",
                  sk.ready ? "border-gold text-gold" : "border-border text-muted",
                )}
                onClick={() => {
                  unlockAudio();
                  if (sim.useSkill(sk.id as SkillId)) {
                    if (skillSfx) sfx.skill();
                    refresh();
                  }
                }}
              >
                <span>{def?.name ?? sk.id}</span>
                {!sk.ready ? <span className="text-[10px] text-muted">{Math.ceil(sk.cd)}s</span> : null}
              </button>
            );
          })}
        </div>
        <p className="pointer-events-none mt-1 text-center text-[10px] text-muted">
          Party skills. Yours from the start — no hire needed. Tap one.
        </p>
      </div>
    </div>
  );
}

function SideBtn({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        sfx.ui();
        onClick();
      }}
      className="flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-xl border border-gold/50 bg-bg/75 text-gold"
    >
      {icon}
      <span className="-mt-0.5 text-[9px] leading-none">{label}</span>
    </button>
  );
}

function TabBar() {
  const tab = useGame((s) => s.tab);
  const setTab = useGame((s) => s.setTab);
  const isStaff = useGame((s) => s.isStaff);
  const founderClaimed = useGame((s) => s.snap.founderClaimed);
  const showFounder = isStaff || founderClaimed;
  const items: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "fight", label: "Fight", icon: <Skull className="size-5" /> },
    { id: "heroes", label: "Heroes", icon: <Users className="size-5" /> },
    { id: "shop", label: "Craft", icon: <Hammer className="size-5" /> },
    { id: "hunt", label: "Hunt", icon: <Swords className="size-5" /> },
    { id: "clan", label: "Clans", icon: <Users className="size-5" /> },
  ];
  items.push(showFounder ? { id: "founders", label: "Founder", icon: <Crown className="size-5" /> } : { id: "realm", label: "Realms", icon: <MapIcon className="size-5" /> });
  return (
    <nav className="grid shrink-0 grid-cols-6 gap-0.5 border-t border-border bg-wood px-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => {
            sfx.ui();
            setTab(it.id);
          }}
          className={cn("grid h-12 place-items-center rounded-md text-[10px]", tab === it.id ? "bg-gold/20 text-gold" : "text-muted")}
        >
          <span className="grid place-items-center">{it.icon}</span>
          {it.label}
        </button>
      ))}
    </nav>
  );
}

function DeskRail() {
  const setTab = useGame((s) => s.setTab);
  const tab = useGame((s) => s.tab);
  const isStaff = useGame((s) => s.isStaff);
  const founderClaimed = useGame((s) => s.snap.founderClaimed);
  const items: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "fight", label: "Fight", icon: <Skull className="size-5" /> },
    { id: "heroes", label: "Heroes", icon: <Users className="size-5" /> },
    { id: "shop", label: "Craft", icon: <Hammer className="size-5" /> },
    { id: "hunt", label: "Hunt", icon: <ShoppingBag className="size-5" /> },
    { id: "clan", label: "Clans", icon: <Users className="size-5" /> },
    { id: "realm", label: "Realms", icon: <MapIcon className="size-5" /> },
  ];
  if (isStaff || founderClaimed) items.push({ id: "founders", label: "Founder", icon: <Crown className="size-5" /> });
  return (
    <div className="flex flex-1 flex-col items-center gap-1 py-2">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          title={it.label}
          onClick={() => {
            sfx.ui();
            setTab(it.id);
          }}
          className={cn("grid size-12 place-items-center rounded-md", tab === it.id ? "bg-surface text-gold" : "text-muted")}
        >
          {it.icon}
        </button>
      ))}
    </div>
  );
}

function MenuPage({ title, parchment, children }: { title: string; parchment?: boolean; children: ReactNode }) {
  const setTab = useGame((s) => s.setTab);
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", parchment && "bg-[#1a1410]")}>
      <div className="flex shrink-0 items-center bg-wood px-3 py-1">
        <span className="w-11" />
        <h2 className="font-display flex-1 text-center text-xl text-[#f0e6d8]">{title}</h2>
        <button type="button" aria-label="Close" className="grid size-11 place-items-center text-[#f0e6d8]" onClick={() => setTab("fight")}>
          <X className="size-6" />
        </button>
      </div>
      <div className="scroll-pane min-h-0 flex-1 px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
    </div>
  );
}

function HeroPanel() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  const bulk = useGame((s) => s.bulk);
  const selected = useGame((s) => s.selectedHero);
  const [runesOpen, setRunesOpen] = useState(false);
  const [peek, setPeek] = useState<RunePeek | null>(null);
  const target = (selected as HeroId) || (snap.heroes.find((h) => h.level > 0)?.id as HeroId | undefined) || "kael";
  return (
    <div className="pt-3">
      <div className="mb-2 flex gap-1">
        {([1, 10, 25, 100, -1] as const).map((n) => (
          <button
            key={n}
            type="button"
            className={cn("h-9 flex-1 rounded-md border text-xs", bulk === n ? "border-gold text-gold" : "border-border text-muted")}
            onClick={() => useGame.getState().setBulk(n)}
          >
            {n === -1 ? "MAX" : `x${n}`}
          </button>
        ))}
      </div>
      <Button className="mb-2 h-11 w-full" onClick={() => { if (sim.hireOrUpgradeAll(bulk)) { sfx.ui(); refresh(); } }}>
        Hire / upgrade all
      </Button>
      <Button variant="secondary" className="mb-3 h-11 w-full" onClick={() => { sfx.ui(); setRunesOpen(true); }}>
        Runes
      </Button>
      <ul className="flex flex-col gap-2">
        {snap.heroes.map((hero) => (
          <HeroRow key={hero.id} hero={hero} open={selected === hero.id} onPeek={setPeek} />
        ))}
      </ul>
      {runesOpen && !peek ? <RuneBagModal target={target} onPeek={setPeek} onClose={() => setRunesOpen(false)} /> : null}
      {peek ? (
        <RuneSheet
          peek={peek}
          onClose={() => setPeek(null)}
          onChange={() => {
            refresh();
            setPeek(null);
          }}
        />
      ) : null}
    </div>
  );
}

type RunePeek = {
  rune: OwnedRune;
  count: number;
  ids: string[];
  worn?: { heroId: HeroId; slot: number };
  target: HeroId;
};

function HeroRow({ hero, open, onPeek }: { hero: HeroSnap; open: boolean; onPeek: (p: RunePeek) => void }) {
  const refresh = useGame((s) => s.refresh);
  const bulk = useGame((s) => s.bulk);
  const snap = useGame((s) => s.snap);
  const def = HEROES.find((h) => h.id === hero.id);
  const worn = new Set(snap.heroes.flatMap((h) => h.attached.map((a) => a?.id).filter(Boolean) as string[]));
  const bag = stackRunes(snap.runeBag.filter((r) => !worn.has(r.id)));
  return (
    <li className="rounded-md border border-gold/30 bg-wood p-3">
      <button
        type="button"
        className="flex w-full items-center gap-3 text-left"
        onClick={() => useGame.getState().setSelectedHero(open ? null : hero.id)}
      >
        <img src={heroPortrait(hero.id as HeroId)} alt="" className="size-12 rounded object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-gold">{def?.name ?? hero.id}</p>
          <p className="text-[11px] text-muted">
            Lv {hero.level}
            {hero.prestige ? ` P${hero.prestige}` : ""} · {formatNum(hero.dps)} dps
            {hero.down ? " · DOWN" : ""}
          </p>
        </div>
      </button>
      {open ? (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs text-fg/80">{def?.blurb}</p>
          {hero.legendName ? (
            <p className="text-[11px] text-gold">
              {hero.legendName}
              {hero.legendOn ? " · live" : " · unlocks at 25"} — {hero.legendBlurb}
            </p>
          ) : null}
          {hero.down ? (
            <Button
              disabled={!hero.canRevive}
              onClick={() => {
                if (sim.reviveHero(hero.id as HeroId)) {
                  sfx.ui();
                  refresh();
                }
              }}
            >
              Revive {hero.reviveGems} gems
            </Button>
          ) : hero.level > 0 || def?.acquire === "gold" ? (
            <Button
              disabled={!hero.canAfford}
              onClick={() => {
                if (sim.hireOrUpgrade(hero.id as HeroId, bulk)) {
                  sfx.ui();
                  refresh();
                }
              }}
            >
              {hero.level <= 0 ? "Hire" : "Upgrade"} {formatNum(hero.cost)} gold
            </Button>
          ) : null}
          {hero.canGemHire ? (
            <Button
              variant="secondary"
              onClick={() => {
                if (sim.buyHeroGems(hero.id as HeroId)) {
                  sfx.ui();
                  refresh();
                }
              }}
            >
              Hire {hero.gemCost} gems
            </Button>
          ) : null}
          {hero.canGild ? (
            <Button
              variant="secondary"
              onClick={() => {
                if (sim.gildHero(hero.id as HeroId, bulk)) {
                  sfx.ui();
                  refresh();
                }
              }}
            >
              {bulk === -1
                ? `Gild MAX · ${formatNum(hero.gildCost)} souls`
                : bulk > 1
                  ? `Gild x${hero.gildCount} · ${formatNum(hero.gildCost)} souls`
                  : `Gild ${formatNum(hero.gildCost)} souls · ★${hero.stars}`}
            </Button>
          ) : null}
          {hero.level > 0 ? (
            <p className="text-[11px] text-muted">
              Gild stamps this hero with souls. Each stamp +50% their damage forever. Stars stop at 5. Stamped {hero.gilds} times. The x10 / x25 / x100 / MAX row applies here too.
            </p>
          ) : null}
          {hero.canCraft ? (
            <Button
              variant="secondary"
              onClick={() => {
                if (sim.craftHero(hero.id as HeroId)) {
                  sfx.ui();
                  refresh();
                }
              }}
            >
              Craft {hero.craftName} · {hero.craftEmber} ember · {hero.craftBone} bone · R{hero.craftRank}
            </Button>
          ) : hero.level > 0 ? (
            <p className="text-[11px] text-muted">
              {hero.craftName} R{hero.craftRank}
            </p>
          ) : null}
          {hero.canPrestige ? (
            <Button
              variant="secondary"
              onClick={() => {
                if (sim.prestigeHero(hero.id as HeroId)) {
                  sfx.ui();
                  refresh();
                }
              }}
            >
              Prestige {hero.prestige + 1} · {hero.prestigeCost} souls
            </Button>
          ) : null}
          {hero.level > 0 ? (
            <div>
              <p className="text-[11px] tracking-wide text-gold uppercase">Runes {hero.runeSlots} slots</p>
              <div className="mt-1 flex gap-1">
                {(hero.attached.length ? hero.attached : [null, null, null]).slice(0, Math.max(hero.runeSlots, 1)).map((rune, i) => (
                  <button
                    key={`${hero.id}-slot-${i}`}
                    type="button"
                    className={cn(
                      "flex h-16 min-w-0 flex-1 items-center gap-1 rounded-md border px-1 text-left text-[10px] text-gold",
                      rune ? RARITY_RING[rune.rarity] : "border-gold/40",
                    )}
                    onClick={() => {
                      if (!rune) return;
                      sfx.ui();
                      onPeek({
                        rune,
                        count: 1,
                        ids: [rune.id],
                        worn: { heroId: hero.id as HeroId, slot: i },
                        target: hero.id as HeroId,
                      });
                    }}
                  >
                    {rune ? (
                      <>
                        <img src={runeArt(rune.stat)} alt="" className="size-10 shrink-0 rounded object-cover" />
                        <span className="min-w-0">
                          {rune.name}
                          <span className="block text-muted">{describeRune(rune)}</span>
                        </span>
                      </>
                    ) : (
                      "Empty"
                    )}
                  </button>
                ))}
              </div>
              {bag.length ? (
                <ul className="mt-2 flex flex-col gap-1">
                  {bag.map((row) => (
                    <li key={row.sample.id} className="flex items-center gap-2 rounded-md border border-border px-2 py-1">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        onClick={() => {
                          sfx.ui();
                          onPeek({
                            rune: row.sample,
                            count: row.count,
                            ids: row.ids,
                            target: hero.id as HeroId,
                          });
                        }}
                      >
                        <img src={runeArt(row.sample.stat)} alt="" className="size-10 shrink-0 rounded object-cover" />
                        <p className="min-w-0 flex-1 text-[11px] text-fg">
                          {row.sample.name}
                          {row.count > 1 ? ` ×${row.count}` : ""}
                          <span className="block text-muted">
                            {RARITY_NAME[row.sample.rarity]} · {describeRune(row.sample)}
                          </span>
                        </p>
                      </button>
                      <button
                        type="button"
                        className="h-9 shrink-0 rounded-md bg-surface-2 px-3 text-xs text-gold"
                        onClick={() => {
                          const slot = hero.attached.findIndex((a, i) => i < hero.runeSlots && !a);
                          const id = row.ids.find((rid) => !worn.has(rid)) ?? row.ids[0];
                          if (slot >= 0 && id && sim.attachRune(hero.id as HeroId, slot, id)) {
                            sfx.ui();
                            refresh();
                          }
                        }}
                      >
                        Socket
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[11px] text-fg/70">Bosses, chests, and the event shop drop runes. Tap a rune for its picture and what it does. Socket from there.</p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function RuneBagModal({
  target,
  onPeek,
  onClose,
}: {
  target: HeroId;
  onPeek: (p: RunePeek) => void;
  onClose: () => void;
}) {
  const snap = useGame((s) => s.snap);
  const wornIds = new Set(snap.heroes.flatMap((h) => h.attached.map((a) => a?.id).filter(Boolean) as string[]));
  const bag = stackRunes(snap.runeBag.filter((r) => !wornIds.has(r.id)));
  const worn = snap.heroes.flatMap((h) =>
    h.attached
      .map((rune, slot) => (rune ? { rune, heroId: h.id as HeroId, slot, heroName: HEROES.find((x) => x.id === h.id)?.name ?? h.id } : null))
      .filter(Boolean) as { rune: OwnedRune; heroId: HeroId; slot: number; heroName: string }[],
  );
  return (
    <Modal onClose={onClose} title="Runes">
      {worn.length ? (
        <>
          <p className="text-[11px] tracking-wide text-gold uppercase">Socketed</p>
          <ul className="mt-1 flex flex-col gap-1">
            {worn.map((row) => (
              <li key={row.rune.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md border border-gold/40 bg-wood px-2 py-2 text-left"
                  onClick={() =>
                    onPeek({
                      rune: row.rune,
                      count: 1,
                      ids: [row.rune.id],
                      worn: { heroId: row.heroId, slot: row.slot },
                      target: row.heroId,
                    })
                  }
                >
                  <img src={runeArt(row.rune.stat)} alt="" className="size-14 rounded object-cover" />
                  <span className="min-w-0">
                    <span className="font-display text-gold">{row.rune.name}</span>
                    <span className="block text-[11px] text-muted">
                      On {row.heroName} · {describeRune(row.rune)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <p className="mt-3 text-[11px] tracking-wide text-gold uppercase">In bag</p>
      {bag.length ? (
        <ul className="mt-1 flex flex-col gap-1">
          {bag.map((row) => (
            <li key={row.sample.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md border border-border bg-surface px-2 py-2 text-left"
                onClick={() =>
                  onPeek({
                    rune: row.sample,
                    count: row.count,
                    ids: row.ids,
                    target,
                  })
                }
              >
                <img src={runeArt(row.sample.stat)} alt="" className="size-14 rounded object-cover" />
                <span className="min-w-0">
                  <span className="font-display text-gold">
                    {row.sample.name}
                    {row.count > 1 ? ` ×${row.count}` : ""}
                  </span>
                  <span className="block text-[11px] text-muted">
                    {RARITY_NAME[row.sample.rarity]} · {describeRune(row.sample)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-muted">Bag is empty. Bosses, chests, and the event shop drop runes.</p>
      )}
    </Modal>
  );
}

function RuneSheet({ peek, onClose, onChange }: { peek: RunePeek; onClose: () => void; onChange: () => void }) {
  const snap = useGame((s) => s.snap);
  const hero = HEROES.find((h) => h.id === peek.target);
  const wornHero = peek.worn ? HEROES.find((h) => h.id === peek.worn!.heroId) : null;
  const openHero = snap.heroes.find((h) => h.id === peek.target);
  const empty = openHero ? openHero.attached.findIndex((a, i) => i < openHero.runeSlots && !a) : -1;
  const wornId = peek.ids.find((id) => snap.heroes.some((h) => h.attached.some((a) => a?.id === id))) ?? peek.ids[0];
  return (
    <Modal onClose={onClose} title={peek.rune.name}>
      <img
        src={runeArt(peek.rune.stat)}
        alt=""
        className="mx-auto aspect-square w-40 rounded-lg border border-gold/40 object-cover"
      />
      <p className="mt-3 text-center text-sm text-gold">
        {RARITY_NAME[peek.rune.rarity]}
        {peek.count > 1 ? ` · ×${peek.count}` : ""}
      </p>
      <p className="mt-2 text-center font-display text-lg text-fg">{describeRune(peek.rune)}</p>
      <p className="mt-2 text-center text-sm text-muted">{RUNE_BLURB[peek.rune.stat] ?? RUNE_JOB[peek.rune.stat]}</p>
      {wornHero ? (
        <p className="mt-2 text-center text-[11px] text-gold">Socketed on {wornHero.name}</p>
      ) : (
        <p className="mt-2 text-center text-[11px] text-muted">In your bag{hero ? ` · socket on ${hero.name}` : ""}</p>
      )}
      {peek.worn ? (
        <Button
          className="mt-4 h-12 w-full"
          onClick={() => {
            if (sim.detachRune(peek.worn!.heroId, peek.worn!.slot)) {
              sfx.ui();
              onChange();
            }
          }}
        >
          Pull off
        </Button>
      ) : (
        <Button
          className="mt-4 h-12 w-full"
          disabled={empty < 0 || !wornId}
          onClick={() => {
            if (empty >= 0 && wornId && sim.attachRune(peek.target, empty, wornId)) {
              sfx.ui();
              onChange();
            }
          }}
        >
          {empty < 0 ? "No empty slot" : `Socket on ${hero?.name ?? "hero"}`}
        </Button>
      )}
    </Modal>
  );
}

function SettingsModal() {
  const close = () => useGame.getState().setSettingsOpen(false);
  const shake = useGame((s) => s.shake);
  const muted = useGame((s) => s.muted);
  const autoSkill = useGame((s) => s.snap.autoSkill);
  const showNames = useGame((s) => s.showNames);
  const skillSfx = useGame((s) => s.skillSfx);
  const reduceFx = useGame((s) => s.reduceFx);
  const setScreen = useGame((s) => s.setScreen);
  const [shareOpen, setShareOpen] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [alertNote, setAlertNote] = useState("");
  const [alertBusy, setAlertBusy] = useState(false);
  const [huntName, setNameField] = useState("");
  const [nameNote, setNameNote] = useState("");
  const [nameBusy, setNameBusy] = useState(false);
  const [board, setBoard] = useState<BoardPref>("auto");
  const [out, setOut] = useState(false);
  const { user } = useCurrentUserState();

  useEffect(() => {
    setAlerts(alertsWanted() && alertsPermission() === "granted");
    setNameField(readHuntName(user?.displayName ?? "Crusader"));
    setBoard(readBoardPref());
  }, [user?.displayName]);

  return (
    <>
      <Modal onClose={close} title="Settings">
        <label className="flex h-12 items-center justify-between text-sm">
          <span>Screen shake</span>
          <input type="checkbox" checked={shake} onChange={(e) => useGame.getState().setShake(e.target.checked)} className="size-5 accent-accent" />
        </label>
        <label className="flex h-12 items-center justify-between text-sm">
          <span>Mute</span>
          <input
            type="checkbox"
            checked={muted}
            onChange={(e) => {
              useGame.getState().setMuted(e.target.checked);
              setMuted(e.target.checked);
            }}
            className="size-5 accent-accent"
          />
        </label>
        <label className="flex h-12 items-center justify-between text-sm">
          <span>Auto skills</span>
          <input type="checkbox" checked={Boolean(autoSkill)} onChange={(e) => { sim.setAutoSkill(e.target.checked); useGame.getState().refresh(); }} className="size-5 accent-accent" />
        </label>
        <label className="flex h-12 items-center justify-between text-sm">
          <span>Hero names</span>
          <input type="checkbox" checked={showNames} onChange={(e) => useGame.getState().setShowNames(e.target.checked)} className="size-5 accent-accent" />
        </label>
        <label className="flex h-12 items-center justify-between text-sm">
          <span>Skill sounds</span>
          <input type="checkbox" checked={skillSfx} onChange={(e) => useGame.getState().setSkillSfx(e.target.checked)} className="size-5 accent-accent" />
        </label>
        <label className="flex h-12 items-center justify-between text-sm">
          <span>Reduce particles</span>
          <input type="checkbox" checked={reduceFx} onChange={(e) => useGame.getState().setReduceFx(e.target.checked)} className="size-5 accent-accent" />
        </label>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Ads: {adsReady() ? "live on this hunt." : "wired, waiting on a network ID. No fake ads, no extra gem buttons until then."}
        </p>
        <div className="mt-2">
          <p className="text-xs text-gold">Board</p>
          <div className="mt-1 flex gap-1">
            {(["auto", "phone", "desk"] as BoardPref[]).map((p) => (
              <button
                key={p}
                type="button"
                className={cn("h-9 flex-1 rounded-md border text-xs capitalize", board === p ? "border-gold text-gold" : "border-border text-muted")}
                onClick={() => {
                  setBoard(p);
                  writeBoardPref(p);
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        {user ? (
          <div className="mt-3">
            <p className="text-xs text-gold">Hunter name</p>
            <input value={huntName} maxLength={16} onChange={(e) => setNameField(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm" />
            <Button
              className="mt-2 h-11 w-full"
              disabled={nameBusy || huntName.trim().length < 2}
              onClick={() => {
                setNameBusy(true);
                setNameNote("");
                setHuntName({ data: { name: huntName } })
                  .then((r) => {
                    writeHuntName(r.name);
                    setNameField(r.name);
                    setNameNote("Name locked in. It stays.");
                  })
                  .catch((e) => setNameNote(e instanceof Error ? e.message : "Could not save name."))
                  .finally(() => setNameBusy(false));
              }}
            >
              {nameBusy ? "Saving…" : "Save name"}
            </Button>
            {nameNote ? <p className="mt-1 text-xs text-muted">{nameNote}</p> : null}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted">Sign in to set a hunter name that stays.</p>
        )}
        {user && moveOpen() ? (
          <Button
            className="mt-3 h-12 w-full font-display"
            onClick={() => {
              close();
              useGame.getState().setMoveHuntOpen(true);
            }}
          >
            Move my hunt
          </Button>
        ) : null}
        <TitlePicker />
        <RedeemBox />
        <div className="mt-3 rounded-md border border-gold/40 bg-wood p-3 text-fg">
          <p className="font-display text-gold">Update {APP_VERSION}</p>
          <p className="text-[11px] text-muted">
            {PATCHES[0]?.date} · {PATCHES[0]?.title}
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {(PATCHES[0]?.lines ?? []).map((line) => (
              <li key={line} className="text-sm text-fg/85">
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted">
            You and Grok share this number. If Update 3 crashes, say “go back to Update 2” (or 1). Player saves are not wiped when we roll back the app.
          </p>
        </div>
        <p className="mt-2 text-xs text-muted">
          Background hunt saves to the cloud and keeps you on the server list while the phone sleeps.
        </p>
        {alerts ? (
          <Button
            variant="secondary"
            className="mt-2 h-12 w-full"
            disabled={alertBusy}
            onClick={() => {
              setAlertBusy(true);
              void sendTestAlert()
                .then(() => setAlertNote("Test ping sent. Check your shade."))
                .catch((err) => setAlertNote(err instanceof Error ? err.message : "Ping failed."))
                .finally(() => setAlertBusy(false));
            }}
          >
            <Bell className="size-4" />
            Send test alert
          </Button>
        ) : null}
        {alertNote ? <p className="mt-1 text-xs text-muted">{alertNote}</p> : null}
        <Button
          variant="secondary"
          className="mt-2 h-12 w-full"
          onClick={() => {
            unlockAudio();
            sfx.ui();
            setShareOpen(true);
          }}
        >
          <Share2 className="size-4" />
          Share this hunt
        </Button>
        <Button
          variant="secondary"
          className="mt-2 h-12 w-full"
          onClick={() => {
            close();
            useGame.getState().setLegalPage("guide");
          }}
        >
          How to hunt
        </Button>
        <Button
          variant="secondary"
          className="mt-2 h-12 w-full"
          onClick={() => {
            close();
            useGame.getState().setLegalPage("privacy");
          }}
        >
          Privacy
        </Button>
        <Button
          variant="secondary"
          className="mt-2 h-12 w-full"
          onClick={() => {
            close();
            useGame.getState().setLegalPage("copyright");
          }}
        >
          Copyright
        </Button>
        <Button asChild variant="secondary" className="mt-2 h-12 w-full">
          <a href="mailto:soulriftcrusher@gmail.com">Email support</a>
        </Button>
        <Button
          variant="secondary"
          className="mt-2 h-12 w-full"
          onClick={() => {
            close();
            useGame.getState().setLegalPage("support");
          }}
        >
          Support
        </Button>
        <Button
          variant="secondary"
          className="mt-2 h-12 w-full"
          onClick={() => {
            sim.save();
            close();
            setScreen("title");
          }}
        >
          Return to title
        </Button>
        {user ? (
          <Button
            variant="secondary"
            className="mt-2 h-12 w-full"
            disabled={out}
            onClick={() => {
              setOut(true);
              sim.save();
              try {
                localStorage.removeItem("soulrift-in-hunt");
              } catch {
                /* ignore */
              }
              void signOut().catch(() => setOut(false));
            }}
          >
            Sign out
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="mt-2 h-12 w-full text-danger"
          onClick={() => {
            clearSave();
            sim.reset();
            useGame.getState().refresh();
            close();
          }}
        >
          <TimerReset className="size-4" />
          Reset crusade
        </Button>
      </Modal>
      {shareOpen ? <ShareSheet onClose={() => setShareOpen(false)} /> : null}
    </>
  );
}

function RedeemBox() {
  const refresh = useGame((s) => s.refresh);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useCurrentUserState();
  if (!user) return null;
  return (
    <div className="mt-3 rounded-md border border-border bg-bg/40 p-3">
      <p className="text-xs tracking-wide text-gold uppercase">Gift code</p>
      <input
        value={code}
        maxLength={16}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="mt-2 h-12 w-full rounded-md border border-border bg-bg px-3 text-sm"
        placeholder="CODE"
      />
      <Button
        className="mt-2 h-12 w-full"
        disabled={busy || code.trim().length < 4}
        onClick={() => {
          setBusy(true);
          setNote("");
          redeemCode({ data: { code } })
            .then((loot) => {
              sim.applyGift(loot);
              refresh();
              setCode("");
              setNote("Code claimed.");
            })
            .catch((e) => setNote(e instanceof Error ? e.message : "Code failed."))
            .finally(() => setBusy(false));
        }}
      >
        {busy ? "Claiming…" : "Redeem"}
      </Button>
      {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
    </div>
  );
}

function TitlePicker() {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  if (!snap.titles.length) return null;
  return (
    <div className="mt-3 rounded-md border border-border bg-bg/40 p-3">
      <p className="text-xs tracking-wide text-gold uppercase">Title</p>
      <p className={cn("mt-1 text-[11px] text-muted", NAME_CLASS[(snap.nameHue as LookId) ?? "ash"])}>Showing as {snap.title}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {snap.titles.map((t) => (
          <button
            key={t.id || "none"}
            type="button"
            disabled={!t.on}
            className={cn(
              "h-9 rounded-md border px-2 text-xs",
              snap.title === t.name ? "border-gold text-gold" : "border-border text-muted",
              !t.on && "opacity-40",
            )}
            onClick={() => {
              if (sim.setTitle(t.id)) {
                sfx.ui();
                refresh();
              }
            }}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function PatchModal() {
  const close = () => {
    markPatchSeen();
    useGame.getState().setPatchOpen(false);
  };
  const patch = PATCHES[0];
  return (
    <Modal onClose={close} title={`Update ${APP_VERSION}`}>
      <p className="font-display text-gold">{patch?.title}</p>
      <p className="mt-1 text-[11px] text-muted">{patch?.date}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {(patch?.lines ?? []).map((line) => (
          <li key={line} className="text-sm text-fg/85">
            {line}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted">This note shows once per update. Fight stays open under it.</p>
      <Button className="mt-4 h-12 w-full" onClick={close}>
        Got it — hunt
      </Button>
    </Modal>
  );
}

function RitualModal() {
  const snap = useGame((s) => s.snap);
  const close = () => useGame.getState().setRitualOpen(false);
  return (
    <Modal onClose={close} title="Dark Ritual">
      <p className="text-sm text-muted">
        The warband is unmade. Relics, gems, and influence stay. You climb again from floor {snap.startFloor} and harvest {formatNum(snap.ritualSouls)} souls.
      </p>
      <Button
        className="mt-4 h-12 w-full"
        onClick={() => {
          unlockAudio();
          if (sim.ritual()) {
            sfx.win();
            useGame.getState().refresh();
            close();
          }
        }}
      >
        Harvest {formatNum(snap.ritualSouls)} souls
      </Button>
    </Modal>
  );
}

function ArenaModal({ result }: { result: ArenaResult }) {
  return (
    <Modal onClose={() => useGame.getState().setArenaResult(null)} title={result.win ? "Victory" : "Defeat"}>
      <p className="font-display text-lg">{result.foe}</p>
      <p className="mt-1 text-sm text-muted">
        {result.win ? "You hold the pit." : "They held the pit."} {formatNum(result.gold)} gold · {formatNum(result.souls)} souls
      </p>
      {result.fallen.length ? (
        <p className="mt-2 text-xs text-accent">Down: {result.fallen.map((f) => f.name).join(", ")}</p>
      ) : null}
    </Modal>
  );
}

function ChestModal({ loot }: { loot: { gold: number; souls: number; influence: number } }) {
  return (
    <Modal onClose={() => useGame.getState().setChestLoot(null)} title="Chest">
      <p className="text-sm">
        {formatNum(loot.gold)} gold · {formatNum(loot.souls)} souls
        {loot.influence ? ` · ${formatNum(loot.influence)} influence` : ""}
      </p>
    </Modal>
  );
}

function OfflineModal({ gold }: { gold: number }) {
  return (
    <Modal onClose={() => useGame.getState().clearOffline()} title="While you were away">
      <p className="text-sm">{formatNum(gold)} gold waited in the rift.</p>
      <Button className="mt-4 h-12 w-full" onClick={() => useGame.getState().clearOffline()}>
        Collect
      </Button>
    </Modal>
  );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-3 sm:place-items-center" onClick={onClose}>
      <div
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-xl border border-gold/40 bg-bg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-xl text-gold">{title}</h3>
          <button type="button" className="grid size-11 place-items-center rounded-md text-muted" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ShareSheet({ onClose }: { onClose: () => void }) {
  const url = huntUrl();
  const [copied, setCopied] = useState(false);
  return (
    <Modal onClose={onClose} title="Share this hunt">
      <p className="break-all text-sm text-muted">{url}</p>
      <Button
        className="mt-3 h-12 w-full"
        onClick={() => {
          void navigator.clipboard?.writeText(url).then(() => setCopied(true)).catch(() => undefined);
        }}
      >
        {copied ? "Copied" : "Copy link"}
      </Button>
    </Modal>
  );
}
