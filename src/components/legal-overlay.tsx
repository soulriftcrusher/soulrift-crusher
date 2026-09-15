import { PrivacyDoc } from "@/routes/privacy";
import { CopyrightDoc } from "@/routes/copyright";
import { SupportDoc } from "@/routes/support";
import { Guide } from "@/routes/guide";
import { useGame } from "@/game/store";

export function LegalOverlay() {
  const page = useGame((s) => s.legalPage);
  const close = () => useGame.getState().setLegalPage(null);
  const go = (id: "privacy" | "copyright" | "support" | "guide") => useGame.getState().setLegalPage(id);
  if (!page) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-bg">
      <div className="mx-auto h-full w-full max-w-2xl">
      {page === "privacy" ? <PrivacyDoc onBack={close} onGo={go} /> : null}
      {page === "copyright" ? <CopyrightDoc onBack={close} onGo={go} /> : null}
      {page === "support" ? <SupportDoc onBack={close} onGo={go} /> : null}
      {page === "guide" ? <Guide onBack={close} /> : null}
      </div>
    </div>
  );
}
