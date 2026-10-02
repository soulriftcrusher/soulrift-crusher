import { useEffect, useState, type ComponentType } from "react";

async function dropWorkers(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((reg) => reg.unregister()));
}

export function GameBoot() {
  const [App, setApp] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    const open = () => {
      void import("./game-app")
        .then((mod) => {
          if (!live) return;
          setApp(() => mod.GameApp);
          if ("serviceWorker" in navigator) {
            void navigator.serviceWorker.register("/sw.js").then(() => {
              void import("@/game/bg-sync").then((m) => m.registerBackgroundHunt());
            }).catch(() => undefined);
          }
        })
        .catch(() => {
          if (!live) return;
          const once = sessionStorage.getItem("soulrift-boot-retry");
          if (!once) {
            sessionStorage.setItem("soulrift-boot-retry", "1");
            void dropWorkers().finally(() => window.location.reload());
            return;
          }
          setFailed(true);
        });
    };
    open();
    const slow = window.setTimeout(() => {
      if (live) setFailed(true);
    }, 12000);
    return () => {
      live = false;
      window.clearTimeout(slow);
    };
  }, []);

  if (!App) {
    return (
      <button
        type="button"
        className="grid min-h-dvh w-full place-items-center bg-[#0c0a0b] px-6 text-[#f0e6d8]"
        onClick={() => {
          if (!failed) return;
          sessionStorage.removeItem("soulrift-boot-retry");
          void dropWorkers().finally(() => window.location.reload());
        }}
      >
        <span className="text-center">
          <span className="font-display block text-2xl tracking-wide">Soulrift Crusher</span>
          <span className="mt-3 block text-sm text-gold">{failed ? "Tap to enter" : "Opening the hunt…"}</span>
        </span>
      </button>
    );
  }

  return <App />;
}
