import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ServerPanel } from "@/components/server-panel";
import { PlazaPanel } from "@/components/plaza-panel";
import { ArenaDuel } from "@/components/arena-duel";
import { HunterName, openHunter } from "@/components/hunter-card";
import { FriendsPanel } from "@/components/friends-panel";
import { queueBackgroundSync } from "@/game/bg-sync";
import { getDeviceId } from "@/game/device";
import { readHuntName } from "@/game/name";
import { formatNum, formatTime } from "@/game/format";
import { HeroFace } from "@/components/hero-face";
import { HEROES, SCIENCES, type HeroId } from "@/game/data";
import {
  challengeCrusader,
  createClan,
  heartbeat,
  joinClan,
  leaveClan,
  requestClan,
  strikeRaid,
  peekClan,
  kickMember,
  acceptJoin,
  denyJoin,
  setMemberRole,
  listClanMail,
  sendClanMail,
  updateClan,
  type ClanRole,
  type PeekClan,
  type WorldSnap,
  type BoardClan,
} from "@/game/net";
import { ClanCrest } from "@/components/clan-crest";
import { LocFlag } from "@/components/loc-flag";
import { CLAN_CAP, CRESTS, FOUNDER_CREST, crestsFor, LOCS, LOC_NAME, clanBonuses, createdLabel, lastOnline, roleName } from "@/game/clan-look";
import { sim } from "@/game/sim";
import { sfx, unlockAudio } from "@/game/audio";
import { MenuGrid, MenuTile } from "@/components/menu-tile";
import { useGame, type ClanPage } from "@/game/store";
import type { Snapshot } from "@/game/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

function errMessage(e: unknown): string {
  const m = e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "";
  if (/unauthorized/i.test(m)) return "Sign out and Sign in again, then open Clans.";
  return m || "The rift refused.";
}

export function ClanSync() {
  const { user, isPending } = useCurrentUserState();

  useEffect(() => {
    if (isPending || !user) return;
    let steal = true;
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      if (useGame.getState().kicked) return;
      const snap = useGame.getState().snap;
      const body = {
        name: readHuntName(user.displayName ?? "Crusader"),
        power: snap.dps + snap.clickDmg * 0.35,
        maxFloor: snap.maxFloor,
        avatar: snap.avatarHero || "kael",
        device: getDeviceId(),
        steal,
      };
      steal = false;
      void queueBackgroundSync(body);
      heartbeat({ data: body })
        .then((next) => {
          if (next.kicked) {
            useGame.getState().setKicked(true);
            return;
          }
          useGame.getState().setOnlineCount(next.online);
          if (next.clan) {
            const b = clanBonuses(next.clan.influence, next.clan.science, next.clan.memberCount);
            sim.setClanBuff(b.dps, b.gold, b.souls);
          } else {
            sim.setClanBuff(0, 0, 0);
          }
          useGame.getState().refresh();
        })
        .catch(() => undefined);
    };
    tick();
    const id = window.setInterval(tick, 45000);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [user, isPending]);

  return null;
}

export function ClanPanel() {
  const { user, isPending } = useCurrentUserState();
  const page = useGame((s) => s.clanPage);
  const setPage = useGame((s) => s.setClanPage);
  const [world, setWorld] = useState<WorldSnap | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [code, setCode] = useState("");
  const [peekId, setPeekId] = useState<number | null>(null);
  const snap = useGame((s) => s.snap);

  async function refreshWorld() {
    if (!user) return;
    const next = await heartbeat({
      data: {
        name: readHuntName(user.displayName ?? "Crusader"),
        power: snap.dps + snap.clickDmg * 0.35,
        maxFloor: snap.maxFloor,
        avatar: snap.avatarHero || "kael",
        device: getDeviceId(),
        steal: false,
      },
    });
    if (next.kicked) {
      useGame.getState().setKicked(true);
      return;
    }
    setWorld(next);
    useGame.getState().setOnlineCount(next.online);
    if (next.clan) {
      const b = clanBonuses(next.clan.influence, next.clan.science, next.clan.memberCount);
      sim.setClanBuff(b.dps, b.gold, b.souls);
    } else {
      sim.setClanBuff(0, 0, 0);
    }
    useGame.getState().refresh();
    try {
      if (!localStorage.getItem("soulrift-username") && next.name) {
        localStorage.setItem("soulrift-username", next.name);
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (isPending || !user) return;
    refreshWorld().catch((e) => setNote(errMessage(e)));
    const id = window.setInterval(() => {
      refreshWorld().catch(() => undefined);
    }, 8000);
    return () => window.clearInterval(id);
  }, [user, isPending]);

  if (isPending) return <div className="mt-3 h-24 animate-pulse rounded-lg border border-border bg-bg/40" />;

  if (page === "hub") {
    const items: { id: ClanPage; label: string; blurb: string }[] = [
      { id: "servers", label: "Servers", blurb: "Pick a shard. 1,000 hunters each." },
      { id: "friends", label: "Friends", blurb: "Add hunters. Send a daily gift." },
      { id: "chat", label: "World chat", blurb: "Talk to everyone on this server." },
      { id: "rating", label: "Rating", blurb: "Who is strongest right now." },
      { id: "clan", label: "My Clan", blurb: "Join, raid, and share a banner." },
      { id: "science", label: "Science", blurb: "Spend influence on the clan." },
      { id: "arena", label: "Arena", blurb: "One-on-one. Heroes can fall." },
      { id: "mail", label: "Clan mail", blurb: "Notes from your warband." },
      { id: "camp", label: "Army Camp", blurb: "See who is in your clan." },
      { id: "manage", label: "Edit Clan", blurb: "Crest, message, kick, promote." },
      { id: "profile", label: "My Profile", blurb: "Your stats and titles." },
    ];
    return (
      <div className="pt-3">
        {world?.online ? (
          <p className="mb-3 text-center font-display text-sm text-gold tabular-nums">
            {world.online} crusader{world.online === 1 ? "" : "s"} online
          </p>
        ) : null}
        <p className="mb-3 text-center text-sm text-muted">Tap a tile. Big buttons, short jobs.</p>
        <MenuGrid>
          {items.map((it) => (
            <MenuTile
              key={it.id}
              art={`/tiles/${it.id}.png`}
              label={it.label}
              blurb={it.blurb}
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

  if (page === "servers") {
    return (
      <div className="pt-3">
        <button type="button" className="mb-3 h-12 text-sm text-gold" onClick={() => setPage("hub")}>
          ← Clans
        </button>
        <ServerPanel />
      </div>
    );
  }

  if (page === "chat") {
    return (
      <div className="pt-3">
        <button type="button" className="mb-3 h-12 text-sm text-gold" onClick={() => setPage("hub")}>
          ← Clans
        </button>
        <PlazaPanel />
      </div>
    );
  }

  if (page === "friends") {
    return (
      <div className="pt-3">
        <button type="button" className="mb-3 h-12 text-sm text-gold" onClick={() => setPage("hub")}>
          ← Clans
        </button>
        <FriendsPanel />
      </div>
    );
  }

  if (isPending) {
    return <div className="mt-3 h-24 animate-pulse rounded-lg border border-border bg-bg/40" />;
  }

  if (!user) {
    return (
      <div className="pt-3">
        <button type="button" className="mb-3 h-12 text-sm text-gold" onClick={() => setPage("hub")}>
          ← Clans
        </button>
        <div className="rounded-lg border border-border bg-bg/40 p-4">
          <h3 className="font-display text-base font-semibold">Clans</h3>
          <p className="mt-2 text-sm text-muted">Sign in to found a banner, raid, and duel.</p>
          <Button asChild className="mt-4 h-12 w-full">
            <Link to="/login">Sign in to hunt together</Link>
          </Button>
        </div>
      </div>
    );
  }

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
      <button type="button" className="mb-3 h-11 text-sm text-gold" onClick={() => setPage("hub")}>
        ← Clans
      </button>
      {peekId ? (
        <ClanPeekSheet
          id={peekId}
          mineId={world?.clan?.id}
          busy={busy}
          onBack={() => setPeekId(null)}
          onJoin={(id) =>
            run(async () => {
              const next = await requestClan({ data: { clanId: id } });
              setWorld(next);
              setPeekId(null);
              if (next.clan) sfx.chest();
              else setNote("Request sent. A leader has to let you in.");
            })
          }
        />
      ) : null}
      {peekId ? null : page === "clan" ? (
        <ClanDesk
          world={world}
          snap={snap}
          busy={busy}
          name={name}
          tag={tag}
          code={code}
          setName={setName}
          setTag={setTag}
          setCode={setCode}
          onFound={() =>
            run(async () => {
              unlockAudio();
              const next = await createClan({ data: { name, tag } });
              setWorld(next);
              sfx.win();
            })
          }
          onJoin={() =>
            run(async () => {
              unlockAudio();
              const next = await joinClan({ data: { code } });
              setWorld(next);
              sfx.chest();
            })
          }
          onRequest={(id) =>
            run(async () => {
              unlockAudio();
              const next = await requestClan({ data: { clanId: id } });
              setWorld(next);
              sfx.chest();
            })
          }
          onPeek={setPeekId}
          onStrike={() =>
            run(async () => {
              unlockAudio();
              const result = await strikeRaid();
              sim.applyLoot(result);
              useGame.getState().refresh();
              if (result.killed) sfx.win();
              else sfx.hit(false);
              await refreshWorld();
            })
          }
          onLeave={() =>
            run(async () => {
              const next = await leaveClan();
              setWorld(next);
            })
          }
          onOpen={(p) => setPage(p)}
          onKick={(id) =>
            run(async () => {
              const next = await kickMember({ data: { userId: id } });
              setWorld(next);
            })
          }
          onAccept={(id) =>
            run(async () => {
              const next = await acceptJoin({ data: { userId: id } });
              setWorld(next);
              sfx.chest();
            })
          }
          onDeny={(id) =>
            run(async () => {
              const next = await denyJoin({ data: { userId: id } });
              setWorld(next);
            })
          }
          myId={user?.id}
        />
      ) : null}
      {page === "camp" ? <ArmyCamp world={world} /> : null}
      {page === "manage" ? (
        <ManageClan
          world={world}
          busy={busy}
          myId={user?.id}
          onKick={(id) =>
            run(async () => {
              const next = await kickMember({ data: { userId: id } });
              setWorld(next);
            })
          }
          onAccept={(id) =>
            run(async () => {
              const next = await acceptJoin({ data: { userId: id } });
              setWorld(next);
              sfx.chest();
            })
          }
          onDeny={(id) =>
            run(async () => {
              const next = await denyJoin({ data: { userId: id } });
              setWorld(next);
            })
          }
          onRole={(id, role) =>
            run(async () => {
              const next = await setMemberRole({ data: { userId: id, role } });
              setWorld(next);
            })
          }
          onSave={(patch) =>
            run(async () => {
              const next = await updateClan({ data: patch });
              setWorld(next);
              sfx.chest();
            })
          }
        />
      ) : null}
      {page === "arena" ? <ArenaDuel /> : null}
      {page === "rating" && !peekId ? (
        <div>
          <p className="mb-2 text-xs tracking-wide text-gold uppercase">Clans</p>
          <ul className="flex flex-col gap-2">
            {(world?.board ?? []).length === 0 ? <li className="text-sm text-muted">No banners yet.</li> : null}
            {(world?.board ?? []).map((c) => (
              <li key={c.id}>
                <ClanBannerRow clan={c} onOpen={() => setPeekId(c.id)} />
              </li>
            ))}
          </ul>
          <p className="mt-4 mb-2 text-xs tracking-wide text-gold uppercase">Hunters</p>
          <ul className="flex flex-col gap-2">
            {(world?.rivals ?? []).map((r) => (
              <li key={r.userId}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border border-gold/25 bg-[#1a120e]/85 px-3 py-2.5 text-left"
                  onClick={() => {
                    unlockAudio();
                    sfx.ui();
                    openHunter(r.userId, r.name, { maxFloor: r.maxFloor, power: r.power });
                  }}
                >
                  <HeroFace id={r.avatar} className="size-12 border border-gold/40" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm text-gold">
                      {r.clanTag ? `${r.name} [${r.clanTag}]` : r.name}
                    </p>
                    <p className="text-[11px] text-muted">Tap to view details</p>
                  </div>
                  <span className="shrink-0 text-[11px] tabular-nums text-muted">{formatNum(r.power)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {page === "science" ? (
        <div>
          <p className="text-sm text-[#f0e6d8]">Influence from raids and the arena. Buy ranks in Shop.</p>
          <p className="mt-2 font-display text-gold tabular-nums">{formatNum(snap.influence)} influence</p>
          <ul className="mt-3 flex flex-col gap-2">
            {snap.sciences.map((s) => {
              const def = SCIENCES.find((d) => d.id === s.id);
              return (
                <li key={s.id} className="flex items-center gap-3 rounded-lg border border-gold/30 bg-bg/80 px-3 py-2.5">
                  <img src={`/shop/${s.id}.jpg`} alt="" className="size-14 shrink-0 rounded-md object-cover" crossOrigin="anonymous" />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm text-fg">{def?.name ?? s.id}</p>
                    <p className="text-[11px] text-muted">{def?.blurb ?? ""}</p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-gold">Rank {s.level}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {page === "mail" ? <ClanMail /> : null}
      {page === "profile" ? (
        <ProfileBox snap={snap} worldName={world?.name} loc={world?.clan?.loc} />
      ) : null}
      {note ? <p className="mt-3 text-sm text-gold">{note}</p> : null}
    </div>
  );
}

function ProfileBox({ snap, worldName, loc }: { snap: Snapshot; worldName?: string; loc?: string }) {
  const refresh = useGame((s) => s.refresh);
  const hired = snap.heroes.filter((h) => h.level > 0);
  return (
    <div className="rounded-lg border border-gold/40 bg-wood p-4 text-fg">
      <div className="flex items-center gap-3">
        <HeroFace id={snap.avatarHero} className="size-20 border-2 border-gold" />
        <div className="min-w-0">
          <h3 className="font-display text-lg text-gold">{worldName ?? "Crusader"}</h3>
          <p className="text-sm text-gold">{snap.title}</p>
          {loc ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <LocFlag loc={loc} />
              {LOC_NAME[(loc as keyof typeof LOC_NAME)] ?? loc}
            </p>
          ) : (
            <p className="text-sm text-muted">No clan location yet</p>
          )}
          <p className="text-sm tabular-nums text-muted">
            Floor {snap.maxFloor} · {formatNum(snap.dps)} power
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs tracking-wide text-gold uppercase">Profile picture · hired heroes</p>
      <ul className="mt-2 grid grid-cols-4 gap-2">
        {hired.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              className={cn(
                "flex w-full flex-col items-center rounded-md border p-1",
                snap.avatarHero === h.id ? "border-gold" : "border-border",
              )}
              onClick={() => {
                unlockAudio();
                if (sim.setAvatar(h.id as HeroId)) {
                  sfx.ui();
                  refresh();
                }
              }}
            >
              <HeroFace id={h.id} className="size-12" />
              <span className="mt-1 truncate text-[10px]">{HEROES.find((x) => x.id === h.id)?.name ?? h.id}</span>
            </button>
          </li>
        ))}
      </ul>
      {hired.length === 0 ? <p className="mt-2 text-sm text-muted">Hire a hero to wear their face.</p> : null}
      <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <li className="rounded-md bg-bg/40 px-3 py-2">
          <p className="text-[11px] text-muted">Monsters slain</p>
          <p className="font-display tabular-nums">{formatNum(snap.kills)}</p>
        </li>
        <li className="rounded-md bg-bg/40 px-3 py-2">
          <p className="text-[11px] text-muted">Days played</p>
          <p className="font-display tabular-nums">{snap.daysPlayed}</p>
        </li>
        <li className="rounded-md bg-bg/40 px-3 py-2">
          <p className="text-[11px] text-muted">Crafted</p>
          <p className="font-display tabular-nums">{snap.crafts}</p>
        </li>
        <li className="rounded-md bg-bg/40 px-3 py-2">
          <p className="text-[11px] text-muted">Bosses</p>
          <p className="font-display tabular-nums">{snap.bossKills}</p>
        </li>
        <li className="rounded-md bg-bg/40 px-3 py-2">
          <p className="text-[11px] text-muted">Heroes hired</p>
          <p className="font-display tabular-nums">{snap.hires}</p>
        </li>
        <li className="rounded-md bg-bg/40 px-3 py-2">
          <p className="text-[11px] text-muted">Arena wins</p>
          <p className="font-display tabular-nums">{snap.arenaWins}</p>
        </li>
      </ul>
      <p className="mt-4 text-xs tracking-wide text-gold uppercase">Achievements</p>
      <ul className="mt-2 flex flex-col gap-2">
        {snap.badges.map((b) => (
          <li
            key={b.id}
            className={cn(
              "rounded-md border px-3 py-2",
              b.on ? "border-gold/50 bg-bg/40" : "border-border bg-bg/20 opacity-60",
            )}
          >
            <p className="font-display text-sm">{b.on ? b.name : "Locked"}</p>
            <p className="text-xs text-muted">{b.on ? b.blurb : b.hint}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClanDesk({
  world,
  snap,
  busy,
  name,
  tag,
  code,
  setName,
  setTag,
  setCode,
  onFound,
  onJoin,
  onRequest,
  onPeek,
  onStrike,
  onLeave,
  onOpen,
  onKick,
  onAccept,
  onDeny,
  myId,
}: {
  world: WorldSnap | null;
  snap: Snapshot;
  busy: boolean;
  name: string;
  tag: string;
  code: string;
  setName: (v: string) => void;
  setTag: (v: string) => void;
  setCode: (v: string) => void;
  onFound: () => void;
  onJoin: () => void;
  onRequest: (id: number) => void;
  onPeek: (id: number) => void;
  onStrike: () => void;
  onLeave: () => void;
  onOpen: (p: ClanPage) => void;
  onKick: (id: string) => void;
  onAccept: (id: string) => void;
  onDeny: (id: string) => void;
  myId?: string;
}) {
  const [mode, setMode] = useState<"home" | "create" | "join" | "find">("home");
  const honor = world?.clan?.influence ?? snap.influence;
  if (mode === "create") {
    return (
      <div className="rounded-lg border border-border bg-bg/40 p-4">
        <button type="button" className="mb-3 h-11 text-sm text-gold" onClick={() => setMode("home")}>
          ← Clan
        </button>
        <h3 className="font-display text-base">Create a clan</h3>
        <label className="mt-3 block text-xs text-muted">
          Clan name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={22} className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg" />
        </label>
        <label className="mt-3 block text-xs text-muted">
          Tag
          <input value={tag} onChange={(e) => setTag(e.target.value.toUpperCase())} maxLength={5} className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg" />
        </label>
        <Button className="mt-3 h-12 w-full" disabled={busy} onClick={onFound}>Create a clan</Button>
      </div>
    );
  }
  if (mode === "join") {
    return (
      <div className="rounded-lg border border-border bg-bg/40 p-4">
        <button type="button" className="mb-3 h-11 text-sm text-gold" onClick={() => setMode("home")}>
          ← Clan
        </button>
        <h3 className="font-display text-base">Join a clan</h3>
        <label className="mt-3 block text-xs text-muted">
          Invite code
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} className="mt-1 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg" />
        </label>
        <Button className="mt-3 h-12 w-full" disabled={busy} onClick={onJoin}>Join a clan</Button>
      </div>
    );
  }
  if (mode === "find") {
    return (
      <div className="rounded-lg border border-border bg-bg/40 p-4">
        <button type="button" className="mb-3 h-11 text-sm text-gold" onClick={() => setMode("home")}>
          ← Clan
        </button>
        <h3 className="font-display text-base">Find a clan</h3>
        <ul className="mt-3 flex flex-col gap-2">
          {(world?.board ?? []).length === 0 ? <li className="text-sm text-muted">No banners yet. Create one.</li> : null}
          {(world?.board ?? []).map((c) => (
            <li key={c.id}>
              <ClanBannerRow clan={c} onOpen={() => onPeek(c.id)} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (world?.clan) {
    return (
      <ClanHome
        world={world}
        busy={busy}
        myId={myId}
        onStrike={onStrike}
        onLeave={onLeave}
        onOpen={onOpen}
        onKick={onKick}
        onAccept={onAccept}
        onDeny={onDeny}
      />
    );
  }
  return (
    <div>
      <div className="rounded-lg border border-gold/40 bg-wood p-4 text-fg">
        <div className="flex items-center gap-3">
          <HeroFace id={snap.avatarHero} className="size-20 border-2 border-gold" />
          <div className="min-w-0">
            <p className="font-display text-xl text-gold">{world?.name ?? "Crusader"}</p>
            <p className="text-sm">{snap.title}</p>
            <p className="text-sm tabular-nums text-muted">Floor {snap.maxFloor}</p>
            <p className="text-sm tabular-nums">Honor {formatNum(honor)}</p>
          </div>
        </div>
        {world?.clan ? (
          <p className="mt-3 font-display text-gold">[{world.clan.tag}] {world.clan.name}</p>
        ) : (
          <Button className="mt-3 h-12 w-full" disabled={busy} onClick={() => setMode("join")}>
            Join a clan
          </Button>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          { label: "Power", value: formatNum(snap.dps), page: "rating" as ClanPage },
          { label: "Influence", value: formatNum(snap.influence), page: "science" as ClanPage },
          { label: "Science", value: String(snap.sciences.reduce((n, s) => n + s.level, 0)), page: "science" as ClanPage },
          { label: "Honor", value: formatNum(honor), page: "rating" as ClanPage },
          { label: "Rating", value: String(world?.board.length ?? 0), page: "rating" as ClanPage },
          { label: "Army Camp", value: String(world?.clan?.memberCount ?? 0), page: "camp" as ClanPage },
        ].map((it) => (
          <button
            key={it.label}
            type="button"
            className="rounded-md border border-border bg-bg/40 px-3 py-3 text-left"
            onClick={() => {
              sfx.ui();
              onOpen(it.page);
            }}
          >
            <p className="text-[11px] text-muted">{it.label}</p>
            <p className="font-display tabular-nums text-gold">{it.value}</p>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <Button className="h-12 w-full" disabled={busy} onClick={() => setMode("create")}>
          Create a clan
        </Button>
        <Button variant="secondary" className="h-12 w-full" disabled={busy} onClick={() => setMode("find")}>
          Request to join a clan
        </Button>
        <Button variant="outline" className="h-12 w-full" disabled={busy} onClick={() => setMode("find")}>
          Find a clan
        </Button>
      </div>
    </div>
  );
}

function ClanHome({
  world,
  busy,
  myId,
  onStrike,
  onLeave,
  onOpen,
  onKick,
  onAccept,
  onDeny,
}: {
  world: WorldSnap;
  busy: boolean;
  myId?: string;
  onStrike: () => void;
  onLeave: () => void;
  onOpen: (p: ClanPage) => void;
  onKick: (id: string) => void;
  onAccept: (id: string) => void;
  onDeny: (id: string) => void;
}) {
  const [tab, setTab] = useState<"influence" | "science">("influence");
  const clan = world.clan!;
  const bonus = clanBonuses(clan.influence, clan.science, clan.memberCount);
  const mine = world.members.find((m) => m.userId === myId);
  const lead = mine?.role === "founder" || mine?.role === "officer";
  const ratio = clan.raidMax > 0 ? clan.raidHp / clan.raidMax : 0;
  const rows = [...world.members].sort((a, b) => {
    if (tab === "science") return b.maxFloor - a.maxFloor;
    return b.power - a.power;
  });
  const ranked = [...world.members];
  const list = tab === "influence" || tab === "science" ? rows : ranked;
  return (
    <div>
      <p className="mb-2 text-center font-display text-lg text-gold">Clan Profile</p>
      <div className="rounded-lg border border-gold/40 bg-wood p-4 text-fg">
        <div className="flex gap-3">
          <ClanCrest id={clan.crest} className="h-24 w-[4.5rem]" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl text-gold">
              {clan.name} [{clan.tag}]
            </p>
            <p className="mt-1 text-sm tabular-nums">
              Influence: <span className="text-gold">{formatNum(clan.influence)}</span>
            </p>
            <p className="text-sm tabular-nums">
              Science: <span className="text-gold">{formatNum(clan.science)}</span>
            </p>
            <p className="text-sm tabular-nums">
              Members: {clan.memberCount} / {CLAN_CAP}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <LocFlag loc={clan.loc} />
              {LOC_NAME[(clan.loc as keyof typeof LOC_NAME)] ?? clan.loc} · Created {createdLabel(clan.createdAt)}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-border bg-bg/40 px-3 py-2 text-sm">
        <p>
          DPS Bonus: <span className="text-gold">+{bonus.dps}%</span>
        </p>
        <p>
          Gold Bonus: <span className="text-gold">+{bonus.gold}%</span>
        </p>
        <p>
          Soul Bonus: <span className="text-gold">+{bonus.souls}%</span>
        </p>
      </div>
      {clan.blurb ? (
        <p className="mt-3 text-center font-display text-sm text-gold">{clan.blurb}</p>
      ) : (
        <p className="mt-3 text-center text-sm text-muted">No message yet.</p>
      )}
      {lead && (world.requests ?? []).length > 0 ? (
        <div className="mt-3 rounded-lg border-2 border-gold/50 bg-wood p-3">
          <p className="font-display text-sm text-gold">Join requests · {(world.requests ?? []).length}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {(world.requests ?? []).map((r) => (
              <li key={r.userId} className="flex items-center gap-2 rounded-md border border-border bg-bg/40 px-2 py-2">
                <HeroFace id={r.avatar} className="size-10 border border-gold" />
                <div className="min-w-0 flex-1">
                  <HunterName userId={r.userId} name={r.name} />
                  <p className="text-[11px] text-muted">fl {r.maxFloor} · {formatNum(r.power)}</p>
                </div>
                <Button size="sm" className="h-10" disabled={busy} onClick={() => onAccept(r.userId)}>
                  Accept
                </Button>
                <Button size="sm" variant="secondary" className="h-10" disabled={busy} onClick={() => onDeny(r.userId)}>
                  Deny
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant={tab === "influence" ? "default" : "secondary"}
          className="h-11 flex-1"
          onClick={() => setTab("influence")}
        >
          Influence
        </Button>
        <Button
          size="sm"
          variant={tab === "science" ? "default" : "secondary"}
          className="h-11 flex-1"
          onClick={() => setTab("science")}
        >
          Science
        </Button>
      </div>
      <ul className="mt-2 flex flex-col gap-2">
        {list.map((m, i) => (
          <li key={m.userId} className="flex items-center gap-2 rounded-md border border-border bg-bg/40 px-2 py-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gold font-display text-sm text-gold">
              {i + 1}
            </span>
            <HeroFace id={m.avatar} className="size-12 border border-gold" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate font-display text-sm text-gold">
                {m.role === "founder" ? "♛ " : ""}
                <HunterName userId={m.userId} name={m.name} />
              </p>
              <p className="text-[11px] text-muted">{roleName(m.role)}</p>
              <p className="text-[11px] text-muted">Last online: {lastOnline(m.lastSeen)}</p>
            </div>
            <span className="shrink-0 text-[11px] tabular-nums text-muted">
              {tab === "science" ? `fl ${m.maxFloor}` : formatNum(m.power)}
            </span>
            {lead && m.userId !== myId && m.role !== "founder" && !(m.role === "officer" && mine?.role !== "founder") ? (
              <Button
                size="sm"
                variant="secondary"
                className="h-10 shrink-0 border border-accent px-3 text-accent"
                disabled={busy}
                onClick={() => onKick(m.userId)}
              >
                Kick
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm font-medium">Clan raid · wave {clan.raidWave}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full bg-accent" style={{ width: `${Math.max(2, ratio * 100)}%` }} />
      </div>
      <Button className="mt-3 h-12 w-full" disabled={busy || world.raidReadyIn > 0} onClick={onStrike}>
        {world.raidReadyIn > 0 ? `Strike in ${formatTime(world.raidReadyIn)}` : "Strike the clan tyrant"}
      </Button>
      {lead ? (
        <Button variant="secondary" className="mt-2 h-12 w-full" onClick={() => onOpen("manage")}>
          Edit clan
        </Button>
      ) : null}
      <Button variant="outline" className="mt-2 h-12 w-full" disabled={busy} onClick={onLeave}>
        Leave banner
      </Button>
    </div>
  );
}

function ArmyCamp({ world }: { world: WorldSnap | null }) {
  if (!world?.clan) {
    return <p className="text-sm text-muted">Join a clan to see the camp.</p>;
  }
  const power = world.members.reduce((s, m) => s + m.power, 0);
  return (
    <div className="rounded-lg border border-border bg-bg/40 p-4">
      <h3 className="font-display text-base text-gold">[{world.clan.tag}] Army Camp</h3>
      <p className="mt-1 flex items-center gap-1 text-sm tabular-nums text-muted">
        <LocFlag loc={world.clan.loc} />
        {LOC_NAME[(world.clan.loc as keyof typeof LOC_NAME)] ?? world.clan.loc} · {world.members.length} hunters · {formatNum(power)} power · raid wave {world.clan.raidWave}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {world.members.map((m) => (
          <li key={m.userId} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
            <span className="flex min-w-0 items-center gap-2">
              <HeroFace id={m.avatar} className="size-10" />
              <HunterName userId={m.userId} name={m.name} />
            </span>
            <span className="text-xs tabular-nums text-muted">
              {m.role} · fl {m.maxFloor} · {formatNum(m.power)} · raid {formatNum(m.raidDamage)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ManageClan({
  world,
  busy,
  myId,
  onKick,
  onAccept,
  onDeny,
  onRole,
  onSave,
}: {
  world: WorldSnap | null;
  busy: boolean;
  myId?: string;
  onKick: (id: string) => void;
  onAccept: (id: string) => void;
  onDeny: (id: string) => void;
  onRole: (id: string, role: "officer" | "elder" | "member") => void;
  onSave: (d: { name: string; tag: string; blurb: string; crest: string; loc: string; open: boolean; minFloor: number }) => void;
}) {
  const clan = world?.clan;
  const mine = world?.members.find((m) => m.userId === myId);
  const boss = mine?.role === "founder";
  const officer = boss || mine?.role === "officer";
  const [name, setName] = useState(clan?.name ?? "");
  const [tag, setTag] = useState(clan?.tag ?? "");
  const [blurb, setBlurb] = useState(clan?.blurb ?? "");
  const [crest, setCrest] = useState(clan?.crest ?? "axe");
  const [loc, setLoc] = useState(clan?.loc ?? "USA");
  const [open, setOpen] = useState(clan?.open !== false);
  const [minFloor, setMinFloor] = useState(clan?.minFloor ?? 1);
  const staff = useGame((s) => s.isStaff) || useGame((s) => s.snap.founderClaimed);
  const picks = crestsFor(staff);
  useEffect(() => {
    if (!clan) return;
    setName(clan.name);
    setTag(clan.tag);
    setBlurb(clan.blurb);
    setCrest(clan.crest);
    setLoc(clan.loc);
    setOpen(clan.open !== false);
    setMinFloor(clan.minFloor);
  }, [clan?.id, clan?.name, clan?.tag, clan?.blurb, clan?.crest, clan?.loc, clan?.open, clan?.minFloor]);
  if (!clan) return <p className="text-sm text-muted">Found a banner first.</p>;
  if (!officer) return <p className="text-sm text-muted">Only the Leader and Co-Leaders edit the clan.</p>;
  return (
    <div>
      <p className="mb-2 text-center font-display text-lg text-gold">Edit Clan</p>
      <div className="rounded-lg border border-gold/40 bg-wood p-4 text-fg">
        <label className="block text-xs text-muted">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={18} className="mt-1 h-12 w-full rounded-md border border-border bg-bg px-3 font-display text-gold" />
        </label>
        <label className="mt-3 block text-xs text-muted">
          Tag · 3 to 5 letters
          <input value={tag} onChange={(e) => setTag(e.target.value.toUpperCase())} maxLength={5} className="mt-1 h-12 w-full rounded-md border border-border bg-bg px-3 font-display text-gold" />
        </label>
        <p className="mt-3 text-xs text-muted">Crest</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {picks.map((id) => (
            <button
              key={id}
              type="button"
              className={cn(
                "relative rounded-md border p-1",
                crest === id ? "border-gold" : "border-border",
                id === FOUNDER_CREST ? "ring-1 ring-gold/70" : "",
              )}
              onClick={() => setCrest(id)}
            >
              <ClanCrest id={id} className="h-14 w-11" />
              {id === FOUNDER_CREST ? (
                <span className="absolute inset-x-0 -bottom-1 text-center text-[8px] tracking-wide text-gold uppercase">You</span>
              ) : null}
            </button>
          ))}
        </div>
        {staff ? <p className="mt-3 text-[11px] text-gold">The crown crest is yours alone. No other clan can pick it.</p> : null}
        <p className="mt-3 text-xs text-muted">Location</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {LOCS.map((id) => (
            <button
              key={id}
              type="button"
              className={cn("flex h-10 items-center gap-1 rounded-md border px-2 text-sm", loc === id ? "border-gold text-gold" : "border-border text-muted")}
              onClick={() => setLoc(id)}
            >
              <LocFlag loc={id} />
              {id}
            </button>
          ))}
        </div>
        <label className="mt-3 block text-xs text-muted">
          Description
          <textarea value={blurb} onChange={(e) => setBlurb(e.target.value)} maxLength={180} rows={3} className="mt-1 w-full rounded-md border border-border bg-bg p-3 text-sm text-gold" />
        </label>
        <p className="mt-3 text-xs text-muted">Type</p>
        <button
          type="button"
          className="mt-1 h-12 w-full rounded-md border border-border font-display text-gold"
          onClick={() => setOpen(!open)}
        >
          {open ? "Open — anyone can join" : "Invite only — they must request"}
        </button>
        <p className="mt-3 text-xs text-muted">Max floor required</p>
        <div className="mt-1 flex items-center gap-2">
          <Button variant="secondary" className="h-12 w-12" onClick={() => setMinFloor(Math.max(1, minFloor - 1))}>
            ‹
          </Button>
          <span className="flex-1 text-center font-display text-lg tabular-nums">{minFloor}</span>
          <Button variant="secondary" className="h-12 w-12" onClick={() => setMinFloor(Math.min(1000, minFloor + 1))}>
            ›
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">Invite {clan.code}</p>
        <Button
          className="mt-3 h-12 w-full"
          disabled={busy}
          onClick={() => onSave({ name, tag, blurb, crest, loc, open, minFloor })}
        >
          OK
        </Button>
      </div>
      <p className="mt-4 text-xs tracking-wide text-gold uppercase">Join requests</p>
      {(world.requests ?? []).length === 0 ? (
        <p className="mt-2 text-sm text-muted">Nobody is waiting.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {(world.requests ?? []).map((r) => (
            <li key={r.userId} className="flex items-center gap-2 rounded-md border border-gold/40 p-3">
              <HeroFace id={r.avatar} className="size-10" />
              <div className="min-w-0 flex-1">
                <HunterName userId={r.userId} name={r.name} />
                <p className="text-xs text-muted">floor {r.maxFloor}</p>
              </div>
              <Button size="sm" className="h-10" disabled={busy} onClick={() => onAccept(r.userId)}>
                Accept
              </Button>
              <Button size="sm" variant="secondary" className="h-10" disabled={busy} onClick={() => onDeny(r.userId)}>
                Deny
              </Button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs tracking-wide text-gold uppercase">Members</p>
      <ul className="mt-2 flex flex-col gap-2">
        {world.members.map((m) => (
          <li key={m.userId} className="rounded-md border border-border p-3">
            <div className="flex items-center gap-2">
              <HeroFace id={m.avatar} className="size-10" />
              <div>
                <HunterName userId={m.userId} name={m.name} />
                <p className="text-xs text-muted">{roleName(m.role)} · floor {m.maxFloor}</p>
              </div>
            </div>
            {m.userId !== myId && m.role !== "founder" ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {boss ? (
                  <>
                    <Button size="sm" variant="secondary" className="h-10" disabled={busy} onClick={() => onRole(m.userId, "officer")}>
                      Co-Leader
                    </Button>
                    <Button size="sm" variant="secondary" className="h-10" disabled={busy} onClick={() => onRole(m.userId, "elder")}>
                      Elder
                    </Button>
                    <Button size="sm" variant="secondary" className="h-10" disabled={busy} onClick={() => onRole(m.userId, "member")}>
                      Member
                    </Button>
                  </>
                ) : null}
                <Button size="sm" className="h-11 flex-1 border-2 border-accent bg-accent/20 font-display text-accent" disabled={busy} onClick={() => onKick(m.userId)}>
                  Kick from clan
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ClanMail() {
  const { user } = useCurrentUserState();
  const [rows, setRows] = useState<{ id: number; name: string; body: string; at: string }[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => {
    if (!user) return;
    listClanMail()
      .then(setRows)
      .catch((e) => setNote(errMessage(e)));
  }, [user]);
  return (
    <div>
      <h3 className="font-display text-base text-gold">Clan mail</h3>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={240}
        rows={3}
        placeholder="Write the banner"
        className="mt-2 w-full rounded-md border border-border bg-bg p-3 text-sm"
      />
      <Button
        className="mt-2 h-12 w-full"
        disabled={busy || body.trim().length < 1}
        onClick={() => {
          setBusy(true);
          sendClanMail({ data: { body, name: readHuntName(user?.displayName ?? "Crusader") } })
            .then((next) => {
              setRows(next);
              setBody("");
              sfx.ui();
            })
            .catch((e) => setNote(errMessage(e)))
            .finally(() => setBusy(false));
        }}
      >
        Send mail
      </Button>
      {note ? <p className="mt-2 text-sm text-gold">{note}</p> : null}
      <ul className="mt-3 flex flex-col gap-2">
        {rows.length === 0 ? <li className="text-sm text-muted">No mail yet.</li> : null}
        {rows.map((r) => (
          <li key={r.id} className="rounded-md border border-border bg-bg/40 px-3 py-2">
            <p className="font-display text-sm text-gold">{r.name}</p>
            <p className="text-sm">{r.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DuelList({
  rivals,
  readyIn,
  busy,
  onDuel,
}: {
  rivals: WorldSnap["rivals"];
  readyIn: number;
  busy: boolean;
  onDuel: (id: string) => void;
}) {
  const snap = useGame((s) => s.snap);
  const refresh = useGame((s) => s.refresh);
  return (
    <div>
      <div className="rounded-lg border border-border bg-bg/40 p-4">
        <h3 className="font-display text-lg">Kings' League</h3>
        <p className="mt-1 text-sm tabular-nums text-muted">Victories {snap.arenaWins}</p>
        <p className="mt-3 text-xs tracking-wide text-muted uppercase">Mystic chest</p>
        <div className="mt-1 flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-3 flex-1 rounded-sm",
                i < snap.arenaChest ? "bg-soul" : "bg-surface-2",
              )}
            />
          ))}
        </div>
        <Button
          className="mt-4 h-14 w-full text-lg"
          disabled={!snap.arenaUnlocked || snap.arenaCharges < 1}
          onClick={() => {
            unlockAudio();
            const result = sim.fightArena();
            if (result) {
              if (result.win) sfx.win();
              else sfx.fail();
              useGame.getState().setArenaResult(result);
              refresh();
            }
          }}
        >
          Attack
        </Button>
      </div>
      <p className="mt-4 mb-2 text-xs tracking-wide text-muted uppercase">Rival crusaders</p>
      {rivals.length === 0 ? (
        <p className="text-sm text-muted">No other hunters yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rivals.map((r) => (
            <li key={r.userId} className="flex items-center gap-2 rounded-md border border-border bg-bg/40 p-3">
              <HeroFace id={r.avatar} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm">
                  <HunterName userId={r.userId} name={r.name} />
                  {r.clanTag ? ` [${r.clanTag}]` : ""}
                </p>
                <p className="text-xs tabular-nums text-muted">Power {formatNum(r.power)} · Tap name to view</p>
              </div>
              <Button size="sm" className="h-11" disabled={busy || readyIn > 0} onClick={() => onDuel(r.userId)}>
                {readyIn > 0 ? formatTime(readyIn) : "Duel"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClanBannerRow({ clan, onOpen }: { clan: BoardClan; onOpen: () => void }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg border border-gold/30 bg-[#1a120e]/90 px-3 py-2.5 text-left"
      onClick={() => {
        unlockAudio();
        sfx.ui();
        onOpen();
      }}
    >
      <ClanCrest id={clan.crest} className="h-14 w-11" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm text-gold">
          {clan.name} [{clan.tag}]
        </p>
        <p className="text-[11px] text-muted">{clan.open ? "Open clan" : "Invite only"} · Tap to view</p>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-[11px] tabular-nums text-muted">
        <LocFlag loc={clan.loc} />
        {clan.members}
      </span>
    </button>
  );
}

function ClanPeekSheet({
  id,
  mineId,
  busy,
  onBack,
  onJoin,
}: {
  id: number;
  mineId?: number;
  busy: boolean;
  onBack: () => void;
  onJoin: (id: number) => void;
}) {
  const [peek, setPeek] = useState<PeekClan | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    let live = true;
    setPeek(null);
    setErr("");
    peekClan({ data: { id } })
      .then((c) => {
        if (live) setPeek(c);
      })
      .catch((e) => {
        if (live) setErr(errMessage(e));
      });
    return () => {
      live = false;
    };
  }, [id]);
  const mine = mineId === id;
  return (
    <div>
      <button type="button" className="mb-3 h-11 text-sm text-gold" onClick={onBack}>
        ← Banners
      </button>
      {err ? <p className="text-sm text-accent">{err}</p> : null}
      {!peek && !err ? <p className="text-sm text-muted">Opening the banner…</p> : null}
      {peek ? (
        <div>
          <div className="rounded-lg border border-gold/40 bg-wood p-4 text-fg">
            <div className="flex gap-3">
              <ClanCrest id={peek.crest} className="h-24 w-[4.5rem]" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl text-gold">
                  {peek.name} [{peek.tag}]
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <LocFlag loc={peek.loc} />
                  {LOC_NAME[(peek.loc as keyof typeof LOC_NAME)] ?? peek.loc}
                </p>
                <p className="text-sm tabular-nums">
                  {peek.memberCount} / {CLAN_CAP} hunters · {formatNum(peek.influence)} honor
                </p>
                <p className="text-xs text-muted">{peek.open ? "Open clan" : "Request to join"} · floor {peek.minFloor}+</p>
              </div>
            </div>
            {peek.blurb ? <p className="mt-3 font-display text-sm text-gold">{peek.blurb}</p> : null}
          </div>
          {!mine ? (
            <Button className="mt-3 h-12 w-full" disabled={busy} onClick={() => onJoin(peek.id)}>
              {peek.open ? "Join this clan" : "Request to join"}
            </Button>
          ) : (
            <p className="mt-3 text-center text-sm text-gold">This is your banner.</p>
          )}
          <p className="mt-4 mb-2 text-xs tracking-wide text-gold uppercase">Hunters</p>
          <ul className="flex flex-col gap-2">
            {peek.members.map((m) => (
              <li key={m.userId}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg border border-gold/25 bg-[#1a120e]/85 px-3 py-2 text-left"
                  onClick={() => {
                    unlockAudio();
                    sfx.ui();
                    openHunter(m.userId, m.name, { maxFloor: m.maxFloor, power: m.power });
                  }}
                >
                  <HeroFace id={m.avatar} className="size-11 border border-gold/40" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm text-gold">{m.name}</p>
                    <p className="text-[11px] text-muted">
                      {roleName(m.role)} · tap to view
                    </p>
                  </div>
                  <span className="text-[11px] tabular-nums text-muted">{formatNum(m.power)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
