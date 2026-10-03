import { useEffect, useRef } from "react";
import { queueBackgroundSync, registerBackgroundHunt } from "@/game/bg-sync";
import { claimStripePack, pullCloudSave, pullHeroRoster, pushCloudSave, pushHeroRoster } from "@/game/net";
import { readHuntName } from "@/game/name";
import { applyIncoming, applyRoster, mergeProgress, recoverSave, rosterFromState } from "@/game/save";
import { sim } from "@/game/sim";
import { useGame } from "@/game/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getDeviceId } from "@/game/device";
import { isDemoHunt } from "@/game/demo-flag";

function dump(): string {
  return JSON.stringify(sim.state);
}

function queueCloud(name: string) {
  if (useGame.getState().kicked) return;
  const snap = useGame.getState().snap;
  void queueBackgroundSync({
    save: dump(),
    name,
    power: snap.dps + snap.clickDmg * 0.35,
    maxFloor: snap.maxFloor,
    avatar: snap.avatarHero,
    device: getDeviceId(),
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
    let pull = 0;
    const name = readHuntName(user.displayName ?? "Crusader");
    let steal = true;
    let giveUp = window.setTimeout(() => {
      if (alive) useGame.getState().setCloudReady(true);
    }, 8000);

    async function boot() {
      const token = ++pull;
      window.clearTimeout(giveUp);
      giveUp = window.setTimeout(() => {
        if (alive) useGame.getState().setCloudReady(true);
      }, 8000);
      try {
        const recovered = await recoverSave();
        if (!alive || token !== pull) return;
        if (recovered) sim.hydrate(recovered);
        await registerBackgroundHunt();
        if (navigator.storage?.persist) void navigator.storage.persist();
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id") ?? "";
        const justPaid = params.get("paid") === "1" || sessionId.startsWith("cs_");
        if (sessionId.startsWith("cs_")) {
          await claimStripePack({ data: { sessionId } }).catch(() => undefined);
        }
        if (justPaid) {
          const url = new URL(window.location.href);
          url.searchParams.delete("paid");
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        }
        const [cloud, heroes] = await Promise.all([pullCloudSave(), pullHeroRoster().catch(() => ({ roster: [] }))]);
        if (!alive || token !== pull) return;
        if (cloud.payload) {
          try {
            const parsed = JSON.parse(cloud.payload) as { lastSaveAt?: number; maxFloor?: number; hires?: number };
            const real =
              parsed &&
              typeof parsed === "object" &&
              (Number(parsed.lastSaveAt) > 0 || Number(parsed.maxFloor) > 1 || Number(parsed.hires) > 0);
            if (real) sim.hydrate(mergeProgress(sim.state, applyIncoming(parsed)));
          } catch {
            /* keep the phone save */
          }
        }
        if (heroes.roster?.length) applyRoster(sim.state, heroes.roster);
        sim.keepOwnerGods();
        if (cloud.firstBlood) sim.claimFirstBlood();
        for (const id of cloud.paidGods ?? []) sim.unlockPaidGod(id as "auric" | "solenne" | "vael");
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
        await Promise.all([
          pushCloudSave({ data: { payload: dump(), device: getDeviceId(), steal: true } }),
          flushHeroes().catch(() => undefined),
        ]);
        if (!alive || token !== pull) return;
        steal = false;
        ready.current = true;
        useGame.getState().setCloudReady(true);
        if (justPaid) {
          window.setTimeout(() => {
            if (!alive) return;
            void pullCloudSave()
              .then((again) => {
                if (!alive) return;
                let changed = false;
                if (again.firstBlood && sim.claimFirstBlood()) changed = true;
                for (const id of again.paidGods ?? []) {
                  if (!(sim.state.paidGods ?? []).includes(id as "auric" | "solenne" | "vael")) {
                    sim.unlockPaidGod(id as "auric" | "solenne" | "vael");
                    changed = true;
                  }
                }
                if (again.grantGems > 0) {
                  sim.grantGems(again.grantGems);
                  changed = true;
                }
                if (again.grantGold > 0 || again.grantSouls > 0 || again.grantChests > 0) {
                  sim.applyGift({ gold: again.grantGold, souls: again.grantSouls, gems: 0, chests: again.grantChests });
                  changed = true;
                }
                if (!changed) return;
                sim.save();
                useGame.getState().refresh();
                queueCloud(name);
              })
              .catch(() => undefined);
          }, 4000);
        }
      } catch {
        if (!alive || token !== pull) return;
        queueCloud(name);
        ready.current = true;
        useGame.getState().setCloudReady(true);
      }
    }

    void boot();

    const push = () => {
      if (!ready.current || useGame.getState().kicked) return;
      sim.save();
      queueCloud(name);
      pushCloudSave({ data: { payload: dump(), device: getDeviceId(), steal } })
        .then((r) => {
          steal = false;
          if (r.kicked) useGame.getState().setKicked(true);
        })
        .catch(() => queueCloud(name));
      void flushHeroes().catch(() => undefined);
    };
    const onHeroes = () => {
      if (useGame.getState().kicked) return;
      sim.save();
      void flushHeroes().catch(() => undefined);
      if (ready.current) {
        pushCloudSave({ data: { payload: dump(), device: getDeviceId(), steal: false } })
          .then((r) => {
            if (r.kicked) useGame.getState().setKicked(true);
          })
          .catch(() => undefined);
      }
    };
    const id = window.setInterval(push, 20000);
    const onHide = () => {
      if (document.visibilityState === "hidden") push();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", push);
    window.addEventListener("online", push);
    window.addEventListener("soulrift-heroes", onHeroes);
    window.addEventListener("soulrift-reopen", boot);
    return () => {
      alive = false;
      window.clearTimeout(giveUp);
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", push);
      window.removeEventListener("online", push);
      window.removeEventListener("soulrift-heroes", onHeroes);
      window.removeEventListener("soulrift-reopen", boot);
    };
  }, [user?.id, isPending, demoHunt]);

  return null;
}
