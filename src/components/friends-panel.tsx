import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatNum } from "@/game/format";
import {
  acceptAllFriends,
  acceptFriend,
  declineFriend,
  fetchFriends,
  removeFriend,
  sendFriendRequest,
  type FriendsSnap,
} from "@/game/friends-net";
import { sendFriendGift } from "@/game/live-net";
import { HunterName } from "@/components/hunter-card";
import { sfx, unlockAudio } from "@/game/audio";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Link } from "@tanstack/react-router";

function errMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "The rift refused.";
}

export function FriendsPanel() {
  const { user, isPending } = useCurrentUserState();
  const [snap, setSnap] = useState<FriendsSnap | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  function pull() {
    return fetchFriends().then(setSnap);
  }

  useEffect(() => {
    if (!user) return;
    pull().catch((e) => setNote(errMessage(e)));
  }, [user]);

  if (isPending) return <div className="mt-3 h-24 animate-pulse rounded-lg border border-border bg-bg/40" />;
  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-bg/40 p-4">
        <p className="font-display text-sm">Friends</p>
        <p className="mt-2 text-sm text-muted">Sign in once to send requests. Hiring heroes does not need an account.</p>
        <Button asChild className="mt-4 h-12 w-full">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  function run(fn: () => Promise<FriendsSnap>) {
    if (busy) return;
    unlockAudio();
    setBusy(true);
    setNote("");
    fn()
      .then((next) => {
        setSnap(next);
        sfx.ui();
      })
      .catch((e) => setNote(errMessage(e)))
      .finally(() => setBusy(false));
  }

  return (
    <div className="pt-1">
      <p className="font-display text-center text-sm text-gold">Friends</p>
      <p className="mt-1 text-center text-xs text-muted">Requests live on the server. Login cannot eat them.</p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length < 2) return;
          run(() => sendFriendRequest({ data: { name: name.trim() } }).then((s) => {
            setName("");
            return s;
          }));
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          placeholder="Hunter name"
          className="h-12 min-w-0 flex-1 rounded-md border border-border bg-bg px-3 text-sm"
        />
        <Button className="h-12" disabled={busy || name.trim().length < 2}>
          Add
        </Button>
      </form>
      {note ? <p className="mt-2 text-sm text-gold">{note}</p> : null}

      {(snap?.incoming.length ?? 0) > 0 ? (
        <div className="mt-4">
          <p className="text-xs tracking-wide text-gold uppercase">Requests</p>
          {(snap?.incoming.length ?? 0) > 1 ? (
            <Button
              className="mt-2 h-11 w-full"
              disabled={busy}
              onClick={() => run(() => acceptAllFriends())}
            >
              Accept all
            </Button>
          ) : null}
          <ul className="mt-2 flex flex-col gap-2">
            {snap!.incoming.map((a) => (
              <li key={a.id} className="flex items-center gap-2 rounded-md border border-gold/40 bg-bg/40 px-3 py-2">
                <p className="min-w-0 flex-1 font-display text-sm">{a.name}</p>
                <Button size="sm" className="h-11" disabled={busy} onClick={() => run(() => acceptFriend({ data: { id: a.id } }))}>
                  Accept
                </Button>
                <Button size="sm" variant="secondary" className="h-11" disabled={busy} onClick={() => run(() => declineFriend({ data: { id: a.id } }))}>
                  No
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {(snap?.outgoing.length ?? 0) > 0 ? (
        <div className="mt-4">
          <p className="text-xs tracking-wide text-muted uppercase">Sent</p>
          <ul className="mt-2 flex flex-col gap-2">
            {snap!.outgoing.map((a) => (
              <li key={a.id} className="flex items-center gap-2 rounded-md border border-border bg-bg/40 px-3 py-2">
                <p className="min-w-0 flex-1 text-sm">{a.name} · waiting</p>
                <Button size="sm" variant="secondary" className="h-11" disabled={busy} onClick={() => run(() => declineFriend({ data: { id: a.id } }))}>
                  Cancel
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4">
        <p className="text-xs tracking-wide text-gold uppercase">
          Circle · {snap?.friends.length ?? 0}
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {(snap?.friends.length ?? 0) === 0 ? <li className="text-sm text-muted">No friends yet. Send a name.</li> : null}
          {(snap?.friends ?? []).map((f) => (
            <li key={f.userId} className="flex items-center gap-2 rounded-md border border-border bg-bg/40 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm">
                  <HunterName userId={f.userId} name={f.name} /> {f.online ? <span className="text-[10px] text-gold">ONLINE</span> : null}
                </p>
                <p className="text-xs tabular-nums text-muted">
                  Floor {f.maxFloor} · {formatNum(f.power)}
                </p>
              </div>
              <Button
                size="sm"
                className="h-11"
                disabled={busy}
                onClick={() => {
                  if (busy) return;
                  unlockAudio();
                  setBusy(true);
                  sendFriendGift({ data: { userId: f.userId } })
                    .then(() => {
                      sfx.chest();
                      setNote(`Gifted ${f.name} 15 gems.`);
                    })
                    .catch((e) => setNote(errMessage(e)))
                    .finally(() => setBusy(false));
                }}
              >
                Gift
              </Button>
              <Button size="sm" variant="secondary" className="h-11" disabled={busy} onClick={() => run(() => removeFriend({ data: { userId: f.userId } }))}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
