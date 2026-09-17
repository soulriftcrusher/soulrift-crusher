import { useEffect } from "react";
import { PrivacyDoc } from "@/routes/privacy";
import { CopyrightDoc } from "@/routes/copyright";
import { SupportDoc } from "@/routes/support";
import { Guide } from "@/routes/guide";
import { useGame } from "@/game/store";

export function LegalOverlay() {
  const page = useGame((s) => s.legalPage);
  const close = () => useGame.getState().setLegalPage(null);
  const go = (id: "privacy" | "copyright" | "support" | "guide") => useGame.getState().setLegalPage(id);

  useEffect(() => {
    if (!page) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      window.scrollTo(0, 0);
      window.setTimeout(() => {
        window.scrollTo(0, 0);
        window.dispatchEvent(new Event("resize"));
      }, 50);
    };
  }, [page]);

  if (!page) return null;
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-bg">
      <div className="mx-auto min-h-full w-full max-w-2xl">
        {page === "privacy" ? <PrivacyDoc onBack={close} onGo={go} /> : null}
        {page === "copyright" ? <CopyrightDoc onBack={close} onGo={go} /> : null}
        {page === "support" ? <SupportDoc onBack={close} onGo={go} /> : null}
        {page === "guide" ? <Guide onBack={close} /> : null}
      </div>
    </div>
  );
}
