import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/copyright")({ component: Copyright });

export function CopyrightDoc({ onBack, onGo }: { onBack?: () => void; onGo?: (id: "privacy" | "copyright" | "support" | "guide") => void }) {
  return (
    <LegalPage kicker="Soulrift Crusher" title="Copyright" onBack={onBack} onGo={onGo}>
      <p>© 2026 Soulrift Crusher. All rights reserved.</p>
      <p>
        The name Soulrift Crusher, the crusade, heroes, realms, monsters, UI, code, audio, and art
        in this hunt are original works. You may play the game. You may not copy, sell, scrape, or
        republish it as your own.
      </p>
      <h2 className="font-display text-lg text-gold">What this covers</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Game title, logo, and writing</li>
        <li>Characters, clans, servers, and story names</li>
        <li>Code, saves, and server logic</li>
        <li>Art, portraits, and sound in the hunt</li>
      </ul>
      <h2 className="font-display text-lg text-gold">What you can do</h2>
      <p>
        Play, share a link to the official hunt, clip your own runs, and talk about it. Fan art is
        fine if you do not sell the hunt itself or pretend you made it.
      </p>
      <h2 className="font-display text-lg text-gold">What you cannot do</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Clone or reskin this hunt and publish it</li>
        <li>Sell accounts, gems, or items outside the official shop</li>
        <li>Rip sprites, portraits, or code</li>
        <li>Use Soulrift Crusher in another product’s name</li>
      </ul>
      <h2 className="font-display text-lg text-gold">Not affiliated</h2>
      <p>
        Soulrift Crusher is an original idle dungeon hunt. It is not made by, licensed by, or tied
        to any other dungeon-crusher title. Other companies keep their own marks.
      </p>
      <h2 className="font-display text-lg text-gold">Terms of use</h2>
      <p>
        Sign-in is required. Be decent in chat. Founders may mute, ban, and remove saves that break
        the hunt. Progress is licensed to you to play — we can suspend cheaters. Real-money packs,
        when Play Store billing is live, are sold by the publisher listed on Google Play.
      </p>
      <p className="text-xs text-muted">
        To license the hunt or report a copy:{" "}
        <a href="mailto:soulriftcrusher@gmail.com" className="text-gold underline">
          soulriftcrusher@gmail.com
        </a>
        .
      </p>
    </LegalPage>
  );
}

function Copyright() {
  return <CopyrightDoc />;
}
