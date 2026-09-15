import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({ component: Privacy });

export function PrivacyDoc({ onBack, onGo }: { onBack?: () => void; onGo?: (id: "privacy" | "copyright" | "support" | "guide") => void }) {
  return (
    <LegalPage kicker="Soulrift Crusher" title="Privacy" onBack={onBack} onGo={onGo}>
      <p>Last updated September 12, 2026.</p>
      <p>
        Soulrift Crusher is an idle dungeon hunt. This page tells you what we keep, why, and how to
        turn it off. We do not sell your data.
      </p>
      <h2 className="font-display text-lg text-gold">What we collect</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="text-gold">Account.</strong> If you sign in: name and email from your
          sign-in provider, so clans, trades, and cloud save can find you.
        </li>
        <li>
          <strong className="text-gold">Crusade save.</strong> Gold, heroes, floors, bag, and similar
          progress. Stored on this device and, if you sign in, on the hunt’s cloud.
        </li>
        <li>
          <strong className="text-gold">Multiplayer.</strong> Clan, chat, trades, arena fights, last
          seen, power, and floor so other crusaders can play with you.
        </li>
        <li>
          <strong className="text-gold">Hunt alerts.</strong> If you turn alerts on, a push
          subscription for this device so we can ping trades, arena hits, and idle gold.
        </li>
      </ul>
      <h2 className="font-display text-lg text-gold">What we do not collect</h2>
      <p>
        We do not ask for your phone number, address, payment card, or precise location. In-hunt
        gems are not real-money purchases in this version.
      </p>
      <h2 className="font-display text-lg text-gold">Who can see it</h2>
      <p>
        Other players can see your crusader name, clan, power, and public chat. Staff can see the
        roster to run the hunt. The live hunt is hosted by the app publisher’s cloud. Google Play
        sees only what you give Play (your Google account, installs, reviews).
      </p>
      <h2 className="font-display text-lg text-gold">Kids</h2>
      <p>Soulrift Crusher is for ages 13 and up. Do not make an account for a younger child.</p>
      <h2 className="font-display text-lg text-gold">Your choices</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Hunt without signing in. Progress stays on that phone only.</li>
        <li>Turn Hunt alerts off in Settings.</li>
        <li>Reset crusade in Settings to wipe the local save.</li>
        <li>
          Uninstall the app or clear site data to drop this device’s save and push subscription.
        </li>
      </ul>
      <h2 className="font-display text-lg text-gold">Contact</h2>
      <p>
        Questions:{" "}
        <a href="mailto:soulriftcrusher@gmail.com" className="text-gold underline">
          soulriftcrusher@gmail.com
        </a>
        , in-hunt world chat, or the support page.
      </p>
    </LegalPage>
  );
}

function Privacy() {
  return <PrivacyDoc />;
}
