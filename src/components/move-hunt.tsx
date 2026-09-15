import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pullCloudSave, pullHeroRoster, importHuntPack } from "@/game/net";
import { encodeHuntPack, decodeHuntPack, MOVE_LABEL, COM_HUNT } from "@/game/migrate";
import { applyIncoming, applyRoster, rosterFromState } from "@/game/save";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import { readHuntName } from "@/game/name";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

function onCom(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.replace(/^www\./, "") === "soulriftcrusher.com";
}

export function MoveHunt() {
  const close = () => useGame.getState().setMoveHuntOpen(false);
  const { user } = useCurrentUserState();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const com = onCom();

  async function copyHunt() {
    setBusy(true);
    setNote("");
    try {
      const [cloud, heroes] = await Promise.all([
        pullCloudSave(),
        pullHeroRoster().catch(() => ({ roster: [] })),
      ]);
      const payload = cloud.payload || JSON.stringify(sim.state);
      const roster = heroes.roster?.length ? heroes.roster : rosterFromState(sim.state);
      const pack = encodeHuntPack({
        v: 1,
        payload,
        roster,
        name: readHuntName(user?.displayName ?? "Crusader"),
      });
      await navigator.clipboard.writeText(pack);
      setNote("Hunt copied. Next tap Open the .com");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Could not copy hunt.");
    } finally {
      setBusy(false);
    }
  }

  async function bringClipboard() {
    setBusy(true);
    setNote("");
    try {
      const raw = await navigator.clipboard.readText();
      const pack = decodeHuntPack(raw);
      await importHuntPack({ data: { payload: pack.payload, roster: pack.roster } });
      sim.hydrate(applyIncoming(JSON.parse(pack.payload)));
      if (pack.roster.length) applyRoster(sim.state, pack.roster);
      sim.save();
      useGame.getState().refresh();
      setNote("Hunt is on this login. Keep using this email.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Could not bring hunt. Copy it first, then tap again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[85] flex flex-col bg-bg text-fg">
      <header className="flex items-center justify-between border-b border-border px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <h1 className="font-display text-lg text-gold">Move my hunt</h1>
        <button type="button" aria-label="Close" className="grid size-11 place-items-center" onClick={close}>
          <X className="size-5" />
        </button>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p className="text-sm leading-relaxed text-muted">
          Before {MOVE_LABEL}, tap through these. After that date only soulriftcrusher.com keeps saves.
        </p>
        {com ? (
          <>
            <p className="font-display text-sm text-gold">You’re on the new site</p>
            <Button size="lg" className="h-12 w-full" disabled={busy} onClick={() => void bringClipboard()}>
              {busy ? "Bringing…" : "Bring hunt I copied"}
            </Button>
            <p className="text-xs text-muted">Must already have copied the hunt on grok.me. Same phone is easiest.</p>
          </>
        ) : (
          <>
            <p className="font-display text-sm text-gold">1. Copy this hunter</p>
            <Button size="lg" className="h-12 w-full" disabled={busy} onClick={() => void copyHunt()}>
              {busy ? "Copying…" : "Copy hunt code"}
            </Button>
            <p className="font-display text-sm text-gold">2. Open the new site</p>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full"
              onClick={() => {
                window.open(COM_HUNT, "_blank", "noopener");
              }}
            >
              Open soulriftcrusher.com
            </Button>
            <p className="text-xs text-muted">
              There: Create hunter with email + password, then Settings → Move my hunt → Bring hunt I copied.
            </p>
          </>
        )}
        {note ? <p className="text-sm text-gold">{note}</p> : null}
        <button type="button" className="h-11 text-sm text-muted" onClick={close}>
          Close
        </button>
      </div>
    </div>
  );
}
