import { useEffect, useState, type ComponentType } from "react";

export function GameBoot() {
  const [App, setApp] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    const load = () => {
      void import("./game-app")
        .then((mod) => {
          if (live) setApp(() => mod.GameApp);
        })
        .catch(() => {
          if (live) setFailed(true);
        });
    };
    load();
    const slow = window.setTimeout(() => {
      if (live) setFailed(true);
    }, 7000);
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          void reg.update().catch(() => undefined);
          void import("@/game/bg-sync").then((m) => m.registerBackgroundHunt());
        })
        .catch(() => undefined);
    }
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
          if (failed) window.location.reload();
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
