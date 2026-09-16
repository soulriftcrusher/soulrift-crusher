import { Button } from "@/components/ui/button";
import { getDeviceId } from "@/game/device";
import { heartbeat } from "@/game/net";
import { readHuntName } from "@/game/name";
import { useGame } from "@/game/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function DeviceGate() {
  const kicked = useGame((s) => s.kicked);
  const snap = useGame((s) => s.snap);
  const { user } = useCurrentUserState();
  if (!kicked) return null;

  async function playHere() {
    if (!user) return;
    try {
      const next = await heartbeat({
        data: {
          name: readHuntName(user.displayName ?? "Crusader"),
          power: snap.dps + snap.clickDmg * 0.35,
          maxFloor: snap.maxFloor,
          avatar: snap.avatarHero || "kael",
          device: getDeviceId(),
          steal: true,
        },
      });
      if (next.kicked) return;
      useGame.getState().setKicked(false);
      useGame.getState().setOnlineCount(next.online);
    } catch {
      /* keep overlay */
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-bg/95 px-6">
      <div className="w-full max-w-sm rounded-md border border-gold/40 bg-surface p-5 text-center">
        <p className="font-display text-lg text-gold">Hunt open elsewhere</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This crusade is live on another device. One hunt at a time. Play here to kick the other
          one off.
        </p>
        <Button className="mt-4 h-12 w-full" onClick={() => void playHere()}>
          Play on this device
        </Button>
      </div>
    </div>
  );
}
