import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { HunterName } from "@/components/hunter-card";
import { loadWhispers, sendWhisper, type WhisperMsg, type WhisperSnap } from "@/game/dm-net";
import { readHuntName } from "@/game/name";
import { sfx, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

function errMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "The rift refused.";
}

export function MessagesPanel() {
  const { user } = useCurrentUserState();
  const peer = useGame((s) => s.dmPeer);
  const setPeer = useGame((s) => s.setDmPeer);
  const [snap, setSnap] = useState<WhisperSnap | null>(null);
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const snapRef = useRef(snap);
  snapRef.current = snap;
  const peerRef = useRef(peer);
  peerRef.current = peer;

  function keep(next: WhisperSnap, mergeChat: boolean) {
    const cur = snapRef.current;
    if (mergeChat && cur && cur.withId === next.withId) {
      const seen = new Set(cur.chat.map((m) => m.id));
      const extra = next.chat.filter((m) => !seen.has(m.id));
      next = { ...next, chat: extra.length ? [...cur.chat, ...extra].slice(-80) : cur.chat };
    }
    setSnap(next);
  }

  async function pull(full = false) {
    const withId = peerRef.current?.userId ?? "";
    const cur = snapRef.current;
    const since = !full && withId && cur?.withId === withId ? lastId(cur.chat) : 0;
    const next = await loadWhispers({ data: { withId, since } });
    keep(next, since > 0);
  }

  useEffect(() => {
    if (!user) return;
    pull(true).catch((e) => setNote(errMessage(e)));
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      pull(false).catch(() => undefined);
    }, 1200);
    return () => window.clearInterval(id);
  }, [user, peer?.userId]);

  if (!user) {
    return <p className="text-sm text-muted">Sign in to whisper hunters.</p>;
  }

  if (peer) {
    return (
      <div className="pt-1">
        <button type="button" className="mb-2 h-11 text-sm text-gold" onClick={() => setPeer(null)}>
          ← Inbox
        </button>
        <p className="font-display text-center text-sm text-gold">
          <HunterName userId={peer.userId} name={snap?.withName || peer.name} />
        </p>
        <ul className="mt-3 flex max-h-[42vh] min-h-[12rem] flex-col gap-2 overflow-y-auto rounded-lg border border-border bg-bg/40 p-2">
          {(snap?.chat ?? []).length === 0 ? <li className="text-sm text-muted">No whispers yet. Send one.</li> : null}
          {(snap?.chat ?? []).map((m) => (
            <Line key={m.id} m={m} />
          ))}
        </ul>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim() || busy) return;
            unlockAudio();
            setBusy(true);
            sendWhisper({
              data: { toId: peer.userId, name: readHuntName(user.displayName ?? "Crusader"), body },
            })
              .then((next) => {
                setBody("");
                sfx.ui();
                keep(next, false);
              })
              .catch((err) => setNote(errMessage(err)))
              .finally(() => setBusy(false));
          }}
        >
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={120}
            placeholder="Whisper…"
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

  return (
    <div className="pt-1">
      <p className="font-display text-center text-sm text-gold">Messages</p>
      <p className="mt-1 text-center text-xs text-muted">Tap a hunter’s name anywhere, then Message.</p>
      <ul className="mt-3 flex flex-col gap-2">
        {(snap?.threads.length ?? 0) === 0 ? <li className="text-sm text-muted">No whispers yet.</li> : null}
        {(snap?.threads ?? []).map((t) => (
          <li key={t.userId}>
            <button
              type="button"
              className="flex w-full flex-col rounded-md border border-border bg-bg/40 px-3 py-2 text-left hover:border-gold"
              onClick={() => {
                sfx.ui();
                setPeer({ userId: t.userId, name: t.name });
              }}
            >
              <span className="font-display text-sm text-gold">{t.name}</span>
              <span className="truncate text-xs text-muted">{t.last}</span>
            </button>
          </li>
        ))}
      </ul>
      {note ? <p className="mt-3 text-sm text-gold">{note}</p> : null}
    </div>
  );
}

function lastId(chat: WhisperMsg[]): number {
  let max = 0;
  for (const m of chat) if (m.id > max) max = m.id;
  return max;
}

function Line({ m }: { m: WhisperMsg }) {
  return (
    <li className={cn("text-sm", m.mine ? "text-right" : "text-left")}>
      <span className={cn("inline-block max-w-[90%] rounded-md px-2 py-1", m.mine ? "bg-wood text-gold" : "bg-bg text-fg")}>
        {m.mine ? null : <span className="font-display">{m.name} · </span>}
        {m.body}
      </span>
    </li>
  );
}
