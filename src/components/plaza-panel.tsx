import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNum } from "@/game/format";
import { HunterName } from "@/components/hunter-card";
import { sendFriendRequest } from "@/game/friends-net";
import { readHuntName } from "@/game/name";
import { lootIcon, LOOT, type LootId } from "@/game/loot";
import {
  acceptTrade,
  cancelTrade,
  loadPlaza,
  openTrade,
  sendWorldChat,
  setTradeOffer,
  stallTrade,
  loadClanChat,
  sendClanChat,
  type PlazaSnap,
  type ClanChatSnap,
} from "@/game/plaza-net";
import { sim } from "@/game/sim";
import { sfx, unlockAudio } from "@/game/audio";
import { readClanChatCache, writeClanChatCache } from "@/game/clan-chat-cache";
import { useGame } from "@/game/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

function errMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "The rift refused.";
}

const STALLS = [
  { id: "bone", name: "Bonewright", take: "4 Rat Skulls", give: "1 Bone Shard" },
  { id: "soul", name: "Choir Fence", take: "2 Soul Plumes", give: "1 Soul Shard" },
  { id: "rift", name: "Nightwell Hawker", take: "2 Rift Fish + leaf", give: "1 Flask" },
];

export function PlazaPanel() {
  const { user } = useCurrentUserState();
  const refresh = useGame((s) => s.refresh);
  const setOnline = useGame((s) => s.setOnlineCount);
  const [plaza, setPlaza] = useState<PlazaSnap | null>(null);
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<"chat" | "trade">("chat");
  const [offer, setOffer] = useState<Record<string, number>>({});

  async function pull(write = false) {
    const next = await loadPlaza({ data: write ? { bag: sim.dumpBag() } : {} });
    setPlaza(next);
    setOnline(next.online);
  }

  useEffect(() => {
    if (!user) return;
    pull(true).catch((e) => setNote(errMessage(e)));
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      pull(false).catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(id);
  }, [user]);

  if (!user) {
    return (
      <div className="pt-1">
        <p className="font-display text-center text-sm text-gold">World chat</p>
        <ul className="mt-3 flex flex-col gap-2 rounded-lg border border-border bg-bg/40 p-3 text-sm">
          <li>
            <span className="font-display text-muted">Cinder Host</span>
            <span> · Ashen Pact, your lair reeks of fear.</span>
          </li>
          <li>
            <span className="font-display text-muted">Void Choir</span>
            <span> · Anyone selling soul plumes?</span>
          </li>
          <li>
            <span className="font-display text-muted">Nightwell</span>
            <span> · Fish ran the well. Flasks for sale.</span>
          </li>
        </ul>
        <p className="mt-3 text-sm text-muted">Sign in to talk, see who is online, and trade parts.</p>
      </div>
    );
  }

  const me = user.id;
  const others = (plaza?.souls ?? []).filter((s) => s.userId !== me);

  return (
    <div className="pt-1">
      <p className="font-display text-center text-sm text-gold tabular-nums">
        {plaza?.online ?? 0} crusader{(plaza?.online ?? 0) === 1 ? "" : "s"} online
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className={cn("h-11 flex-1 rounded-md border font-display text-sm", view === "chat" ? "border-gold bg-wood text-gold" : "border-border")}
          onClick={() => setView("chat")}
        >
          World chat
        </button>
        <button
          type="button"
          className={cn("h-11 flex-1 rounded-md border font-display text-sm", view === "trade" ? "border-gold bg-wood text-gold" : "border-border")}
          onClick={() => setView("trade")}
        >
          Trade
        </button>
      </div>

      {view === "chat" ? (
        <>
          <ul className="mt-3 flex max-h-[46vh] min-h-[12rem] flex-col gap-2 overflow-y-auto rounded-lg border border-border bg-bg/40 p-2">
            {(plaza?.chat ?? []).map((m) => (
              <li key={m.id} className="text-sm">
                <HunterName userId={m.userId} name={m.name} npc={m.npc} className={m.npc ? "font-display text-muted" : "font-display text-gold underline-offset-2 hover:underline"} />
                <span className="text-fg"> · {m.body}</span>
              </li>
            ))}
          </ul>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!body.trim() || busy) return;
              unlockAudio();
              setBusy(true);
              sendWorldChat({ data: { body, name: readHuntName(user.displayName ?? "Crusader") } })
                .then(() => {
                  setBody("");
                  sfx.ui();
                  return pull(true);
                })
                .catch((err) => setNote(errMessage(err)))
                .finally(() => setBusy(false));
            }}
          >
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={120}
              placeholder="Say it to the rift…"
              className="h-12 min-w-0 flex-1 rounded-md border border-border bg-bg px-3 text-sm"
            />
            <Button className="h-12" disabled={busy || !body.trim()}>
              Send
            </Button>
          </form>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-muted">Online hunters. Tap trade to open a window. Stalls buy when no one else is on.</p>
          <ul className="mt-2 flex flex-col gap-2">
            {others.length === 0 ? <li className="text-sm text-muted">No other signed-in hunters yet. Use a stall.</li> : null}
            {others.map((s) => (
              <li key={s.userId} className="flex items-center gap-2 rounded-md border border-border bg-bg/40 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm">
                    <HunterName userId={s.userId} name={s.name} />
                  </p>
                  <p className="text-xs tabular-nums text-muted">
                    Floor {s.maxFloor} · {formatNum(s.power)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-11"
                  disabled={busy}
                  onClick={() => {
                    unlockAudio();
                    setBusy(true);
                    sendFriendRequest({ data: { toId: s.userId } })
                      .then(() => setNote(`Request sent to ${s.name}.`))
                      .catch((err) => setNote(errMessage(err)))
                      .finally(() => setBusy(false));
                  }}
                >
                  Friend
                </Button>
                <Button
                  size="sm"
                  className="h-11"
                  disabled={busy}
                  onClick={() => {
                    unlockAudio();
                    setBusy(true);
                    openTrade({ data: { toId: s.userId } })
                      .then(() => pull(true))
                      .catch((err) => setNote(errMessage(err)))
                      .finally(() => setBusy(false));
                  }}
                >
                  Trade
                </Button>
              </li>
            ))}
          </ul>

          {(plaza?.trades ?? []).map((t) => {
            const mineItems = t.mine === "from" ? t.fromItems : t.toItems;
            const theirs = t.mine === "from" ? t.toItems : t.fromItems;
            const theirName = t.mine === "from" ? t.toName : t.fromName;
            return (
              <div key={t.id} className="mt-3 rounded-lg border border-gold/40 bg-wood p-3">
                <h3 className="font-display text-sm text-gold">Window with {theirName}</h3>
                <p className="mt-1 text-xs text-muted">You {t.mine === "from" ? (t.fromOk ? "ready" : "open") : t.toOk ? "ready" : "open"} · they {t.mine === "from" ? (t.toOk ? "ready" : "open") : t.fromOk ? "ready" : "open"}</p>
                <p className="mt-2 text-xs text-gold">Your offer</p>
                <OfferGrid
                  current={Object.keys(offer).length ? offer : mineItems}
                  onChange={setOffer}
                />
                <Button
                  variant="secondary"
                  className="mt-2 h-11 w-full"
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    setTradeOffer({ data: { id: t.id, items: offer } })
                      .then(() => pull(true))
                      .catch((err) => setNote(errMessage(err)))
                      .finally(() => setBusy(false));
                  }}
                >
                  Put on table
                </Button>
                <p className="mt-2 text-xs text-muted">They offer: {summarize(theirs) || "nothing yet"}</p>
                <div className="mt-2 flex gap-2">
                  <Button
                    className="h-11 flex-1"
                    disabled={busy}
                    onClick={() => {
                      setBusy(true);
                      acceptTrade({ data: { id: t.id } })
                        .then((res) => {
                          sim.applyBag(res.bag);
                          refresh();
                          if (res.done) sfx.chest();
                          return pull(true);
                        })
                        .catch((err) => setNote(errMessage(err)))
                        .finally(() => setBusy(false));
                    }}
                  >
                    Ready
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 flex-1"
                    disabled={busy}
                    onClick={() => {
                      setBusy(true);
                      cancelTrade({ data: { id: t.id } })
                        .then(() => pull(true))
                        .catch((err) => setNote(errMessage(err)))
                        .finally(() => setBusy(false));
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            );
          })}

          <h3 className="font-display mt-4 text-sm text-gold">Stalls</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {STALLS.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-md border border-border bg-bg/40 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm">{s.name}</p>
                  <p className="text-xs text-muted">
                    {s.take} → {s.give}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-11"
                  disabled={busy}
                  onClick={() => {
                    unlockAudio();
                    setBusy(true);
                    stallTrade({ data: { stall: s.id, bag: sim.dumpBag() } })
                      .then((res) => {
                        sim.applyBag(res.bag);
                        refresh();
                        sfx.gold();
                        setNote(`${s.name} took the deal.`);
                        return pull(true);
                      })
                      .catch((err) => setNote(errMessage(err)))
                      .finally(() => setBusy(false));
                  }}
                >
                  Deal
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
      {note ? <p className="mt-3 text-sm text-gold">{note}</p> : null}
    </div>
  );
}

function lastChatSeq(chat: { id: string }[]): number {
  let max = 0;
  for (const m of chat) {
    const n = Number(String(m.id).replace(/^cc-/, ""));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max;
}

function mergeClanChat(prev: ClanChatSnap, next: ClanChatSnap): ClanChatSnap {
  if (prev.clanId !== next.clanId) return next;
  if (next.chat.length === 0) return { ...prev, online: next.online, tag: next.tag, name: next.name };
  const seen = new Set(prev.chat.map((m) => m.id));
  const extra = next.chat.filter((m) => !seen.has(m.id));
  return {
    ...next,
    chat: extra.length ? [...prev.chat, ...extra].slice(-80) : prev.chat,
  };
}

export function ClanChatPanel() {
  const { user } = useCurrentUserState();
  const [snap, setSnap] = useState<ClanChatSnap | null>(() =>
    user ? readClanChatCache(user.id) : null,
  );
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(() => Boolean(user && readClanChatCache(user.id)));
  const snapRef = useRef(snap);
  snapRef.current = snap;

  function keep(next: ClanChatSnap | null) {
    setSnap(next);
    setReady(true);
    if (user) writeClanChatCache(user.id, next);
  }

  async function pull(full = false) {
    const cur = snapRef.current;
    const since = !full && cur ? lastChatSeq(cur.chat) : 0;
    const next = await loadClanChat({ data: { since } });
    if (!next) {
      keep(null);
      return;
    }
    keep(cur && since > 0 ? mergeClanChat(cur, next) : next);
  }

  useEffect(() => {
    if (!user) return;
    const cached = readClanChatCache(user.id);
    if (cached) {
      setSnap(cached);
      setReady(true);
    }
    pull(true).catch((e) => {
      setNote(errMessage(e));
      setReady(true);
    });
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      pull(false).catch(() => undefined);
    }, 1200);
    const onVis = () => {
      if (document.visibilityState === "visible") pull(false).catch(() => undefined);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [user]);

  if (!user) {
    return <p className="text-sm text-muted">Sign in to talk with your warband.</p>;
  }
  if (!ready) return <div className="mt-3 h-24 animate-pulse rounded-lg border border-border bg-bg/40" />;
  if (!snap) {
    return (
      <div className="rounded-lg border border-border bg-bg/40 p-4">
        <h3 className="font-display text-base text-gold">Clan chat</h3>
        <p className="mt-2 text-sm text-muted">Join a clan first. Then this hall is yours.</p>
      </div>
    );
  }

  return (
    <div className="pt-1">
      <p className="font-display text-center text-sm text-gold">
        [{snap.tag}] {snap.name}
      </p>
      <p className="text-center text-xs tabular-nums text-muted">
        {snap.online} in hall
      </p>
      <ul className="mt-3 flex max-h-[46vh] min-h-[12rem] flex-col gap-2 overflow-y-auto rounded-lg border border-border bg-bg/40 p-2">
        {snap.chat.length === 0 ? <li className="text-sm text-muted">No warband talk yet.</li> : null}
        {snap.chat.map((m) => (
          <li key={m.id} className="text-sm">
            <HunterName
              userId={m.userId}
              name={m.name}
              className="font-display text-gold underline-offset-2 hover:underline"
            />
            <span className="text-fg"> · {m.body}</span>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim() || busy) return;
          unlockAudio();
          setBusy(true);
          sendClanChat({ data: { body, name: readHuntName(user.displayName ?? "Crusader") } })
            .then((next) => {
              setBody("");
              sfx.ui();
              keep(next);
            })
            .catch((err) => setNote(errMessage(err)))
            .finally(() => setBusy(false));
        }}
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={120}
          placeholder="Talk to the banner…"
          className="h-12 min-w-0 flex-1 rounded-md border border-border bg-bg px-3 text-sm"
        />
        <Button className="h-12" disabled={busy || !body.trim()}>
          Send
        </Button>
      </form>
      {note ? <p className="mt-3 text-sm text-gold">{note}</p> : null}
    </div>
  );
}

function summarize(items: Record<string, number>): string {
  return Object.entries(items)
    .filter(([, n]) => n > 0)
    .map(([id, n]) => `${n} ${LOOT.find((l) => l.id === id)?.name ?? id}`)
    .join(", ");
}

function OfferGrid({
  current,
  onChange,
}: {
  current: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
}) {
  const bag = sim.dumpBag();
  const held = LOOT.filter((l) => (bag[l.id] ?? 0) > 0 || (current[l.id] ?? 0) > 0);
  return (
    <div className="mt-1 grid grid-cols-5 gap-1">
      {held.map((l) => {
        const n = current[l.id] ?? 0;
        return (
          <button
            key={l.id}
            type="button"
            className={cn("relative aspect-square overflow-hidden rounded-md border", n > 0 ? "border-gold" : "border-border")}
            onClick={() => {
              const next = { ...current };
              const max = bag[l.id] ?? 0;
              next[l.id] = n >= max ? 0 : n + 1;
              onChange(next);
            }}
          >
            <img src={lootIcon(l.id as LootId)} alt="" className="size-full object-cover" />
            <span className="absolute right-0.5 bottom-0.5 rounded-sm bg-bg/80 px-1 text-[10px] tabular-nums">{n}</span>
          </button>
        );
      })}
    </div>
  );
}
