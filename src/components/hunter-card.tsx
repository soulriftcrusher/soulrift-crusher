import { useEffect, useState } from "react";
import { create } from "zustand";
import { Button } from "@/components/ui/button";
import { sendFriendRequest } from "@/game/friends-net";
import { muteHunter, reportHunter } from "@/game/plaza-net";
import {
  fetchHunterProfile,
  staffBan,
  staffGift,
  staffStatus,
  staffUnban,
  type HunterProfile,
} from "@/game/net";
import { HeroFace } from "@/components/hero-face";
import { formatNum } from "@/game/format";
import { heroPortrait } from "@/game/data";
import { sfx, unlockAudio } from "@/game/audio";
import { useGame } from "@/game/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type Card = { userId: string; name: string; maxFloor?: number; power?: number } | null;

const useHunter = create<{
  card: Card;
  open: (userId: string, name: string, seed?: { maxFloor?: number; power?: number }) => void;
  close: () => void;
}>((set) => ({
  card: null,
  open: (userId, name, seed) => set({ card: { userId, name, ...seed } }),
  close: () => set({ card: null }),
}));

export function openHunter(userId: string, name: string, seed?: { maxFloor?: number; power?: number }) {
  if (!userId || !name) return;
  useHunter.getState().open(userId, name, seed);
}

function errMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "The rift refused.";
}

export function HunterName({
  userId,
  name,
  npc,
  className,
}: {
  userId?: string;
  name: string;
  npc?: boolean;
  className?: string;
}) {
  if (npc || !userId) return <span className={className}>{name}</span>;
  return (
    <button
      type="button"
      className={className ?? "font-display text-gold underline-offset-2 hover:underline"}
      onClick={() => {
        unlockAudio();
        sfx.ui();
        openHunter(userId, name);
      }}
    >
      {name}
    </button>
  );
}

export function HunterCard() {
  const card = useHunter((s) => s.card);
  const close = useHunter((s) => s.close);
  const { user } = useCurrentUserState();
  const [staff, setStaff] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [profile, setProfile] = useState<HunterProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const userId = user?.id;
  const targetId = card?.userId;

  useEffect(() => {
    if (!targetId || !userId) return;
    let alive = true;
    setNote("");
    setLoading(true);
    staffStatus()
      .then((s) => {
        if (alive) setStaff(s.isStaff);
      })
      .catch(() => {
        if (alive) setStaff(false);
      });
    fetchHunterProfile({ data: { userId: targetId } })
      .then((p) => {
        if (!alive) return;
        setProfile(p);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setLoading(false);
        setNote(errMessage(e));
      });
    return () => {
      alive = false;
    };
  }, [targetId, userId]);

  if (!card) return null;
  const mine = user?.id === card.userId;

  function run(fn: () => Promise<unknown>, ok: string) {
    if (busy) return;
    setBusy(true);
    setNote("");
    fn()
      .then(() => {
        sfx.chest();
        setNote(ok);
      })
      .catch((e) => setNote(errMessage(e)))
      .finally(() => setBusy(false));
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center">
      <button type="button" className="absolute inset-0 z-0 bg-bg/80" aria-label="Close" onClick={close} />
      <div
        className="relative z-10 m-3 max-h-[88svh] w-[min(100%-1.5rem,420px)] overflow-y-auto rounded-xl border border-border bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <p className="text-xs tracking-wide text-gold uppercase">Hunter profile</p>
        <div className="mt-2 flex items-center gap-3">
          <HeroFace id={profile?.avatar} className="size-16 border-2 border-gold" />
          <div className="min-w-0">
            <h2 className="font-display text-2xl">{profile?.name ?? card.name}</h2>
            {profile?.banned ? <p className="text-sm text-accent">Banned</p> : null}
            {mine ? <p className="text-sm text-muted">This is you.</p> : null}
          </div>
        </div>
        {!profile && (card.maxFloor || card.power) ? (
          <p className="mt-1 text-sm tabular-nums text-muted">
            Floor {card.maxFloor ?? "—"} · {card.power ? formatNum(card.power) : "—"} power
          </p>
        ) : null}
        {profile ? (
          <>
            <p className="mt-2 text-sm tabular-nums text-muted">
              Floor {profile.maxFloor} · {formatNum(profile.power)} power · {profile.daysPlayed} days
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Stat label="Slain" value={formatNum(profile.kills)} />
              <Stat label="Bosses" value={formatNum(profile.bossKills)} />
              <Stat label="Hired" value={String(profile.hires)} />
              <Stat label="Crafted" value={String(profile.crafts)} />
              <Stat label="Arena" value={String(profile.arenaWins)} />
              <Stat label="Marks" value={String(profile.badges.length)} />
            </ul>
            {profile.heroes.length ? (
              <>
                <p className="mt-4 text-xs tracking-wide text-gold uppercase">Roster</p>
                <ul className="mt-2 grid grid-cols-4 gap-2">
                  {profile.heroes.map((h) => (
                    <li key={h.id} className="text-center">
                      <img
                        src={heroPortrait(h.id as never)}
                        alt=""
                        className="mx-auto size-14 rounded-md object-cover"
                        crossOrigin="anonymous"
                      />
                      <p className="mt-1 truncate text-[10px]">{h.name}</p>
                      <p className="text-[10px] tabular-nums text-muted">
                        {h.level}
                        {h.prestige ? ` P${h.prestige}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted">No crusaders hired yet.</p>
            )}
            <p className="mt-4 text-xs tracking-wide text-gold uppercase">Achievements</p>
            {profile.badges.length ? (
              <ul className="mt-2 flex flex-col gap-2">
                {profile.badges.map((b) => (
                  <li key={b.id} className="rounded-md border border-gold/40 bg-bg/40 px-3 py-2">
                    <p className="font-display text-sm">{b.name}</p>
                    <p className="text-xs text-muted">{b.blurb}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">No marks yet.</p>
            )}
          </>
        ) : loading ? (
          <p className="mt-3 text-sm text-muted">Reading the rift…</p>
        ) : (
          <p className="mt-3 text-sm text-muted">Could not load this hunter.</p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          {!mine ? (
            <Button
              className="h-12 w-full"
              disabled={busy}
              onClick={() => {
                unlockAudio();
                sfx.ui();
                useGame.getState().openMessages(card.userId, profile?.name ?? card.name);
                close();
              }}
            >
              Message
            </Button>
          ) : null}
          {!mine ? (
            <Button
              className="h-12 w-full"
              variant="secondary"
              disabled={busy}
              onClick={() => run(() => sendFriendRequest({ data: { toId: card.userId } }), "Friend request sent.")}
            >
              Add friend
            </Button>
          ) : null}
          {!mine ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="h-12"
                disabled={busy}
                onClick={() => run(() => muteHunter({ data: { userId: card.userId } }), "Muted. Their chat is hidden.")}
              >
                Mute
              </Button>
              <Button
                variant="outline"
                className="h-12"
                disabled={busy}
                onClick={() => run(() => reportHunter({ data: { userId: card.userId, reason: "report" } }), "Report sent to founders.")}
              >
                Report
              </Button>
            </div>
          ) : null}
          {staff && !mine ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  className="h-12"
                  disabled={busy}
                  onClick={() => run(() => staffGift({ data: { userId: card.userId, gems: 200 } }), "+200 gems queued.")}
                >
                  +200 gems
                </Button>
                <Button
                  variant="secondary"
                  className="h-12"
                  disabled={busy}
                  onClick={() => run(() => staffGift({ data: { userId: card.userId, gold: 50000 } }), "+50k gold queued.")}
                >
                  +50k gold
                </Button>
                <Button
                  variant="secondary"
                  className="h-12"
                  disabled={busy}
                  onClick={() => run(() => staffGift({ data: { userId: card.userId, souls: 50 } }), "+50 souls queued.")}
                >
                  +50 souls
                </Button>
                <Button
                  variant="secondary"
                  className="h-12"
                  disabled={busy}
                  onClick={() => run(() => staffGift({ data: { userId: card.userId, chests: 10 } }), "+10 chests queued.")}
                >
                  +10 chests
                </Button>
              </div>
              <Button
                className="h-12 w-full"
                disabled={busy}
                onClick={() => run(() => staffBan({ data: { userId: card.userId, reason: "Banned by founder" } }), "Banned. They cannot hunt.")}
              >
                Ban hunter
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full"
                disabled={busy}
                onClick={() => run(() => staffUnban({ data: { userId: card.userId } }), "Unbanned.")}
              >
                Unban
              </Button>
            </>
          ) : null}
          <Button variant="outline" className="h-12 w-full" onClick={close}>
            Close
          </Button>
        </div>
        {note ? <p className="mt-3 text-sm text-gold">{note}</p> : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-md bg-bg/40 px-3 py-2">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="font-display tabular-nums">{value}</p>
    </li>
  );
}
