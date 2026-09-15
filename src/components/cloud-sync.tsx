import { useEffect, useRef } from "react";
import { queueBackgroundSync, registerBackgroundHunt } from "@/game/bg-sync";
import { pullCloudSave, pullHeroRoster, pushCloudSave, pushHeroRoster } from "@/game/net";
import { readHuntName } from "@/game/name";
import { applyIncoming, applyRoster, recoverSave, rosterFromState } from "@/game/save";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isDemoHunt } from "@/game/demo-flag";

function dump(): string {
  return JSON.stringify(sim.state);
}

function queueCloud(name: string) {
  const snap = useGame.getState().snap;
  void queueBackgroundSync({
    save: dump(),
    name,
    power: snap.dps + snap.clickDmg * 0.35,
    maxFloor: snap.maxFloor,
    avatar: snap.avatarHero,
  });
}

function flushHeroes() {
  return pushHeroRoster({ data: { roster: rosterFromState(sim.state) } });
}

export function CloudSync() {
  const { user, isPending } = useCurrentUserState();
  const ready = useRef(false);
  const demoHunt = useGame((s) => s.demoHunt);

  useEffect(() => {
    if (demoHunt || isDemoHunt() || isPending || !user) {
      ready.current = false;
      return;
    }
    let alive = true;
    ready.current = false;
    const name = readHuntName(user.displayName ?? user.primaryEmail ?? "Crusader");

    async function boot() {
      try {
        const recovered = await recoverSave();
        if (!alive) return;
        if (recovered) sim.hydrate(recovered);
        await registerBackgroundHunt();
        if (navigator.storage?.persist) void navigator.storage.persist();
        const [cloud, heroes] = await Promise.all([pullCloudSave(), pullHeroRoster().catch(() => ({ roster: [] }))]);
        if (!alive) return;
        if (cloud.payload) {
          const parsed = JSON.parse(cloud.payload) as { lastSaveAt?: number };
          sim.hydrate(applyIncoming(parsed));
        }
        if (heroes.roster?.length) applyRoster(sim.state, heroes.roster);
        if (cloud.grantGems > 0) sim.grantGems(cloud.grantGems);
        sim.applyGift({
          gold: cloud.grantGold,
          souls: cloud.grantSouls,
          gems: 0,
          chests: cloud.grantChests,
        });
        sim.save();
        useGame.getState().refresh();
        queueCloud(name);
        await Promise.all([pushCloudSave({ data: { payload: dump() } }), flushHeroes().catch(() => undefined)]);
        ready.current = true;
      } catch {
        queueCloud(name);
        ready.current = true;
      }
    }

    void boot();

    const push = () => {
      if (!ready.current) return;
      sim.save();
      queueCloud(name);
      pushCloudSave({ data: { payload: dump() } }).catch(() => queueCloud(name));
      void flushHeroes().catch(() => undefined);
    };
    const onHeroes = () => {
      sim.save();
      void flushHeroes().catch(() => undefined);
      if (ready.current) pushCloudSave({ data: { payload: dump() } }).catch(() => undefined);
    };
    const id = window.setInterval(push, 20000);
    const onHide = () => {
      if (document.visibilityState === "hidden") push();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", push);
    window.addEventListener("online", push);
    window.addEventListener("soulrift-heroes", onHeroes);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", push);
      window.removeEventListener("online", push);
      window.removeEventListener("soulrift-heroes", onHeroes);
    };
  }, [user?.id, isPending, demoHunt]);

  return null;
}
