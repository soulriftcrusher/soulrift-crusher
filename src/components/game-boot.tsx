import { useEffect, useState, type ComponentType } from "react";

export function GameBoot() {
  const [App, setApp] = useState<ComponentType | null>(null);

  useEffect(() => {
    let live = true;
    void import("./game-app").then((mod) => {
      if (live) setApp(() => mod.GameApp);
    });
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").then(() => {
        void import("@/game/bg-sync").then((m) => m.registerBackgroundHunt());
      }).catch(() => undefined);
    }
    return () => {
      live = false;
    };
  }, []);

  if (!App) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#0c0a0b] text-[#f0e6d8]">
        <p className="font-display text-2xl tracking-wide">Soulrift Crusher</p>
      </div>
    );
  }

  return <App />;
}