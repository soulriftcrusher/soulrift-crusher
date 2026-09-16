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
        gems are not real-money purchases in this version. Other hunters never see your email,
        password, or hunt code. Chat strips emails and hunt codes if someone tries to paste them.
      </p>
      <h2 className="font-display text-lg text-gold">One device</h2>
      <p>
        A crusade can only be live on one device at a time. Opening it on a second phone or PC
        kicks the first off. You can switch devices; you cannot play both at once.
      </p>
      <h2 className="font-display text-lg text-gold">Your login</h2>
      <p>
        Never share your email, password, or hunt code with anyone. A hunt code can steal your
        crusade and the founder seat. We will never ask you for your password in chat or by email.
        Staff will never ask you to send a hunt code.
      </p>
      <h2 className="font-display text-lg text-gold">Who can see it</h2>
      <p>
        Other players can see your crusader name, clan, power, and public chat. Staff can see the
        roster to run the hunt. The live hunt is hosted by the app publisher’s cloud. Google Play
        sees only what you give Play (your Google account, installs, reviews).
      </p>
      <h2 className="font-display text-lg text-gold">Ads</h2>
      <p>
        Ads are not on yet. When they go live they will be from a real network (AdMob or AdSense),
        with a banner and optional rewarded spins. We will not invent fake ads. Device advertising
        IDs, if used then, follow that network’s policy. You can keep hunting without watching a
        rewarded ad.
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
