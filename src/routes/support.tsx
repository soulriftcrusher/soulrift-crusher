import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/support")({ component: Support });

export function SupportDoc({ onBack, onGo }: { onBack?: () => void; onGo?: (id: "privacy" | "copyright" | "support" | "guide") => void }) {
  return (
    <LegalPage kicker="Soulrift Crusher" title="Support" onBack={onBack} onGo={onGo}>
      <p>
        Stuck in the rift? Read{" "}
        <Link to="/guide" className="text-gold underline">
          How to hunt
        </Link>{" "}
        first. If you still need a person, email{" "}
        <a href="mailto:soulriftcrusher@gmail.com" className="text-gold underline">
          soulriftcrusher@gmail.com
        </a>
        . World chat works for in-hunt questions.
      </p>
      <h2 className="font-display text-lg text-gold">The hunt is blank or crashed</h2>
      <p>Force-close the app and open it again. If that fails, open the hunt in Chrome, then come back.</p>
      <h2 className="font-display text-lg text-gold">Progress vanished</h2>
      <p>
        Sign in, then open the hunt. Cloud save loads for that account. A reset crusade or a new
        phone without sign-in starts a fresh warband.
      </p>
      <h2 className="font-display text-lg text-gold">No hunt alerts</h2>
      <p>
        Settings → Hunt alerts on, then allow the phone prompt. Alerts work best after Install on
        Home Screen, not inside a tiny preview window.
      </p>
      <h2 className="font-display text-lg text-gold">Cannot sign in</h2>
      <p>
        Use the same Google / sign-in you picked the first time.{" "}
        <Link to="/login" className="text-gold underline">
          Open sign-in
        </Link>
        .
      </p>
      <h2 className="font-display text-lg text-gold">Age</h2>
      <p>13+. Not for younger kids.</p>
      <p className="text-muted">
        Privacy details live on the{" "}
        {onGo ? (
          <button type="button" className="text-gold underline" onClick={() => onGo("privacy")}>
            privacy page
          </button>
        ) : (
          <Link to="/privacy" className="text-gold underline">
            privacy page
          </Link>
        )}
        .
      </p>
    </LegalPage>
  );
}

function Support() {
  return <SupportDoc />;
}
