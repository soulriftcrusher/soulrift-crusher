import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { claimStaff, listReports, staffBan, staffCopySave, staffGift, staffRoster, staffSetPassword, staffStatus, staffUnban } from "@/game/net";
import { formatNum } from "@/game/format";
import { sfx, unlockAudio } from "@/game/audio";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import { createGiftCode } from "@/game/live-net";
import { openHunter } from "@/components/hunter-card";
import { SHARDS } from "@/game/shards";
import { cn } from "@/lib/utils";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type Row = {
  userId: string;
  name: string;
  power: number;
  maxFloor: number;
  lastSeen?: string;
  banned?: boolean;
  shardId?: string;
  shardName?: string;
  shardTag?: string;
};

function errMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "The rift refused.";
}

function seenAgo(iso?: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 120) return "online";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function StaffPanel() {
  const { user, isPending } = useCurrentUserState();
  const founderClaimed = useGame((s) => s.snap.founderClaimed);
  const [isStaff, setIsStaff] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("RIFT");
  const [resetEmail, setResetEmail] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [q, setQ] = useState("");
  const [fromId, setFromId] = useState("");
  const [ontoId, setOntoId] = useState("");
  const [server, setServer] = useState("all");
  const [roster, setRoster] = useState<Row[]>([]);
  const [reports, setReports] = useState<{ id: number; fromName: string; aboutName: string; aboutId: string; reason: string }[]>([]);

  function load() {
    return Promise.all([
      staffRoster().then(setRoster),
      listReports()
        .then(setReports)
        .catch(() => setReports([])),
    ]);
  }

  useEffect(() => {
    if (isPending || !user) return;
    staffStatus()
      .then((s) => {
        setIsStaff(s.isStaff);
        setCanClaim(s.canClaim);
        if (s.isStaff) return load();
      })
      .catch(() => undefined);
  }, [user, isPending]);

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return roster
      .filter((r) => {
        if (server !== "all" && (r.shardId || "") !== server) return false;
        if (!n) return true;
        return (
          r.name.toLowerCase().includes(n) ||
          r.userId.toLowerCase().includes(n) ||
          (r.shardName ?? "").toLowerCase().includes(n) ||
          (r.shardTag ?? "").toLowerCase().includes(n)
        );
      })
      .sort((a, b) => b.maxFloor - a.maxFloor || b.power - a.power);
  }, [roster, q, server]);

  const serverCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of roster) m.set(r.shardId || "", (m.get(r.shardId || "") ?? 0) + 1);
    return m;
  }, [roster]);

  if (isPending || !user) {
    return <p className="mt-4 text-sm text-muted">Sign in to run the rift.</p>;
  }

  function run(fn: () => Promise<unknown>, ok: string) {
    if (busy) return;
    setBusy(true);
    setNote("");
    fn()
      .then(() => {
        sfx.chest();
        setNote(ok);
        return load();
      })
      .catch((e) => setNote(errMessage(e)))
      .finally(() => setBusy(false));
  }

  return (
    <div className="pt-1">
      <h3 className="font-display text-lg text-gold">Founders desk</h3>
      <p className="mt-1 text-sm text-muted">Every signed-in hunter. Tap a name for their page. Ban, unban, and send gifts from here.</p>
      {canClaim && !isStaff ? (
        <Button
          className="mt-3 h-12 w-full"
          disabled={busy}
          onClick={() => {
            unlockAudio();
            setBusy(true);
            claimStaff()
              .then(() => {
                sfx.win();
                setIsStaff(true);
                setCanClaim(false);
                useGame.getState().setIsStaff(true);
                setNote("You hold the staff seat.");
                return load();
              })
              .catch((e) => setNote(errMessage(e)))
              .finally(() => setBusy(false));
          }}
        >
          Claim founder admin
        </Button>
      ) : null}
      {isStaff ? (
        <>
          {!founderClaimed ? (
            <Button
              className="mt-3 h-12 w-full"
              onClick={() => {
                unlockAudio();
                if (sim.claimFounder()) {
                  sfx.chest();
                  useGame.getState().refresh();
                  setNote("Tithe taken. Once.");
                }
              }}
            >
              Founder's Tithe · take everything once
            </Button>
          ) : (
            <p className="mt-2 text-xs text-muted">Tithe already taken on this hunt.</p>
          )}
          <div className="mt-3 rounded-md border border-gold/40 p-3">
            <p className="text-xs tracking-wide text-gold uppercase">Gift code</p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={12}
              className="mt-2 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm"
              placeholder="CODE"
            />
            <Button
              className="mt-2 h-11 w-full"
              disabled={busy || code.trim().length < 4}
              onClick={() =>
                run(
                  () => createGiftCode({ data: { code, gems: 80, chests: 2, maxUses: 500 } }),
                  `Code ${code} live · 80 gems + 2 chests.`,
                )
              }
            >
              Mint 80-gem code
            </Button>
          </div>
          <div className="mt-3 rounded-md border border-gold/40 p-3">
            <p className="text-xs tracking-wide text-gold uppercase">Forgot password</p>
            <input
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Hunter email"
              className="mt-2 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm"
            />
            <input
              type="text"
              value={resetPass}
              onChange={(e) => setResetPass(e.target.value)}
              placeholder="New password (8+)"
              className="mt-2 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm"
            />
            <Button
              className="mt-2 h-11 w-full"
              disabled={busy || !resetEmail || resetPass.length < 8}
              onClick={() =>
                run(
                  () => staffSetPassword({ data: { email: resetEmail.trim(), password: resetPass } }),
                  `Password set for ${resetEmail.trim().toLowerCase()}. Tell them to Sign in.`,
                )
              }
            >
              Set password
            </Button>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search hunters"
            className="mt-3 h-12 w-full rounded-md border border-border bg-bg px-3 text-sm"
          />
          <div className="mt-3 rounded-md border border-gold/40 bg-bg/50 p-3">
            <p className="text-xs tracking-wide text-gold uppercase">Restore a lost hunt</p>
            <p className="mt-1 text-[11px] text-muted">
              Google and email can make two hunters. Copy the high-floor hunt onto the one stuck at 20.
            </p>
            <input
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              placeholder="From (the 450 floor hunter id)"
              className="mt-2 h-10 w-full rounded-md border border-border bg-bg px-3 text-xs"
            />
            <input
              value={ontoId}
              onChange={(e) => setOntoId(e.target.value)}
              placeholder="Onto (the hunter stuck low)"
              className="mt-2 h-10 w-full rounded-md border border-border bg-bg px-3 text-xs"
            />
            <Button
              size="sm"
              className="mt-2 h-10 w-full"
              disabled={busy || !fromId || !ontoId}
              onClick={() =>
                run(
                  () => staffCopySave({ data: { fromId: fromId.trim(), ontoId: ontoId.trim() } }),
                  "Hunt copied. Tell them to close the app and sign in again.",
                )
              }
            >
              Copy hunt
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              className={cn(
                "h-9 rounded-md border px-3 text-xs",
                server === "all" ? "border-gold bg-wood text-gold" : "border-border",
              )}
              onClick={() => setServer("all")}
            >
              All · {roster.length}
            </button>
            {SHARDS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={cn(
                  "h-9 rounded-md border px-3 text-xs",
                  server === s.id ? "border-gold bg-wood text-gold" : "border-border",
                )}
                onClick={() => setServer(s.id)}
              >
                {s.tag} · {serverCounts.get(s.id) ?? 0}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs tabular-nums text-muted">{shown.length} hunters on this list</p>
          {reports.length ? (
            <div className="mt-3 rounded-md border border-accent/40 p-3">
              <p className="text-xs tracking-wide text-accent uppercase">Reports</p>
              <ul className="mt-2 flex flex-col gap-1">
                {reports.map((r) => (
                  <li key={r.id} className="text-xs">
                    {r.fromName} reported{" "}
                    <button
                      type="button"
                      className="text-gold underline"
                      onClick={() => openHunter(r.aboutId, r.aboutName)}
                    >
                      {r.aboutName}
                    </button>{" "}
                    · {r.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <ul className="mt-2 flex flex-col gap-2">
            {shown.length === 0 ? <li className="text-sm text-muted">No hunters yet.</li> : null}
            {shown.map((r) => (
              <li key={r.userId} className="rounded-lg border border-border bg-bg/40 p-3">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    unlockAudio();
                    sfx.ui();
                    openHunter(r.userId, r.name, { maxFloor: r.maxFloor, power: r.power });
                  }}
                >
                  <p className="font-display text-sm text-gold">
                    {r.name} {r.banned ? <span className="text-accent">BANNED</span> : null}
                  </p>
                  <p className="text-xs tabular-nums text-muted">
                    [{r.shardTag ?? "—"}] {r.shardName ?? "No server"} · Floor {r.maxFloor} · {formatNum(r.power)} · {seenAgo(r.lastSeen)}
                  </p>
                </button>
                {r.userId !== user.id ? (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-10"
                      disabled={busy}
                      onClick={() => run(() => staffGift({ data: { userId: r.userId, gems: 200 } }), `+200 gems → ${r.name}`)}
                    >
                      +200 gems
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-10"
                      disabled={busy}
                      onClick={() => run(() => staffGift({ data: { userId: r.userId, gold: 50000 } }), `+50k gold → ${r.name}`)}
                    >
                      +50k gold
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-10"
                      disabled={busy}
                      onClick={() => setFromId(r.userId)}
                    >
                      From
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-10"
                      disabled={busy}
                      onClick={() => setOntoId(r.userId)}
                    >
                      Onto
                    </Button>
                    {r.banned ? (
                      <Button
                        size="sm"
                        className="h-10"
                        disabled={busy}
                        onClick={() => run(() => staffUnban({ data: { userId: r.userId } }), `${r.name} unbanned.`)}
                      >
                        Unban
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="h-10"
                        disabled={busy}
                        onClick={() => run(() => staffBan({ data: { userId: r.userId, reason: "Banned by founder" } }), `${r.name} banned.`)}
                      >
                        Ban
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-[11px] text-muted">That's you.</p>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : !canClaim ? (
        <p className="mt-2 text-sm text-muted">Staff seat is held. Sign in with the founder account.</p>
      ) : null}
      {note ? <p className="mt-2 text-sm text-gold">{note}</p> : null}
    </div>
  );
}
