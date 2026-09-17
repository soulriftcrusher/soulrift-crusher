import { createFileRoute, Link } from "@tanstack/react-router";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/guide")({ component: Guide });

function H({ children }: { children: string }) {
  return <h2 className="font-display mt-8 text-xl text-gold">{children}</h2>;
}

export function Guide({ onBack }: { onBack?: () => void } = {}) {
  return (
    <main className={onBack ? "min-h-full overflow-x-hidden bg-bg text-fg" : "h-dvh overflow-y-auto bg-bg text-fg"}>
      <div className="relative mx-auto max-w-lg px-5 pb-20 pt-10">
        {onBack ? (
          <button type="button" onClick={onBack} className="font-display text-xs tracking-[0.22em] text-gold uppercase">
            ← Back to the hunt
          </button>
        ) : (
          <Link to="/" className="font-display text-xs tracking-[0.22em] text-gold uppercase">
            ← Back to the hunt
          </Link>
        )}
        <p className="font-display mt-8 text-xs tracking-[0.28em] text-muted uppercase">Field manual</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-gold">How to hunt</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Soulrift Crusher is an idle dungeon RPG. Your warband fights while you are gone. Tap when
          you are here. Climb floors, craft loot, and war with clans.
        </p>

        <H>Start</H>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>Tap Begin the hunt (or Enter the rift if you already have a save).</li>
          <li>Sign in first. The hunt will not start without an account — that is how cloud save and clans stay on your name.</li>
          <li>Install on Home Screen so the hunt feels like a real app.</li>
        </ol>

        <H>The screen</H>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            <strong className="text-gold">Top bar.</strong> Souls (ghost), gems (crystal), gold
            (coins).
          </li>
          <li>
            <strong className="text-gold">Battle.</strong> Tap the monster. Heroes also hit on their
            own.
          </li>
          <li>
            <strong className="text-gold">Level / 10.</strong> Ten packs a floor. Floor bosses hit
            harder and drop better loot.
          </li>
          <li>
            <strong className="text-gold">Bottom tabs.</strong> Fight · Heroes · Craft · Hunt · Clans
          </li>
          <li>
            <strong className="text-gold">Side buttons.</strong> Hunt, Clans, Realms on the left.
            Shop (craft) on the right.
          </li>
        </ul>

        <H>Fight</H>
        <p className="mt-3 text-sm leading-relaxed">
          Tap the beast. Crits splash extra gold. Skills sit under the fight:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            <strong className="text-gold">Soul Strike</strong> — a heavy tap that always crits
          </li>
          <li>
            <strong className="text-gold">Gold Rush</strong> — double gold for a short hunt
          </li>
          <li>
            <strong className="text-gold">Bloodrage</strong> — double party damage
          </li>
          <li>
            <strong className="text-gold">Dark Harvest</strong> — cut a slice of the beast’s life
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Leave the hunt open or locked. Heroes keep killing. Come back for idle gold.
        </p>

        <H>Heroes</H>
        <p className="mt-3 text-sm leading-relaxed">
          Heroes tab. Hire with gold (cheap), gems (rare), or the summon well (gamble). Level them
          with gold. x1 / x10 / x100 / MAX at the top of the list.
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
          <li>Kael is your tap. Hire him first and keep him close.</li>
          <li>Rook, Lyra, and the rest add DPS so the floor dies without you.</li>
          <li>Some heroes are almost impossible to buy on purpose. That is the long hunt.</li>
          <li>
            Level cap is <strong className="text-gold">100</strong>. Then Prestige. They reset to 1
            and come back stronger. Prestige goes to 100.
          </li>
          <li>Open a hero for runes, craft gear, and legendary abilities.</li>
        </ul>

        <H>Craft</H>
        <p className="mt-3 text-sm leading-relaxed">
          Every monster drops a crafting piece. Craft tab is the workbench — its own full page.
        </p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
          <li>Tap bag items into the 6 slots.</li>
          <li>Optional catalyst in the extra slot.</li>
          <li>If the recipe matches, tap Craft. The hammer hits the bench.</li>
          <li>Recipes page shows what you can forge. Market stalls trade extras.</li>
        </ol>
        <p className="mt-3 text-sm text-muted">
          Turn gems into ember at the shop if you need forge fuel.
        </p>

        <H>Hunt tab</H>
        <p className="mt-3 text-sm leading-relaxed">
          Relics, science, contracts, mystic chest, and the Dark Ritual live here.
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
          <li>
            <strong className="text-gold">Relics</strong> — spend souls. They survive a ritual.
          </li>
          <li>
            <strong className="text-gold">Science</strong> — war, greed, hunger, tempo, fortune,
            depth.
          </li>
          <li>
            <strong className="text-gold">Dark Ritual</strong> — unlocks around floor 12. Resets
            gold, heroes, and floor. Keeps relics, gems, influence. You start a few floors higher
            and bank a pile of souls.
          </li>
          <li>
            <strong className="text-gold">Summon well</strong> — spend gems, tap the mini-game, pull
            a hero, weapon, or gem refund.
          </li>
        </ul>

        <H>Clans, arena, chat</H>
        <p className="mt-3 text-sm leading-relaxed">Sign in first. Then Clans tab.</p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
          <li>
            <strong className="text-gold">Clan</strong> — found or join with a tag. Raid the shared
            boss. Everyone’s damage counts. Boss down → next wave.
          </li>
          <li>
            <strong className="text-gold">Arena</strong> — 1v1 other crusaders. Power vs power.
          </li>
          <li>
            <strong className="text-gold">World chat</strong> — talk. Online count is on the plaza.
          </li>
          <li>
            <strong className="text-gold">Trade</strong> — open a window, put loot in, both accept.
          </li>
        </ul>

        <H>Realms and servers</H>
        <p className="mt-3 text-sm leading-relaxed">
          Realms (map button) picks a shard. Each live server holds about 1000 hunters. NPC servers
          grow on their own every day. About every 3 months, servers war and score season points.
        </p>

        <H>Alerts</H>
        <p className="mt-3 text-sm leading-relaxed">
          Gear → Hunt alerts on. You’ll ping on trades, arena hits, raid bosses, and idle gold.
          Works best after Install.
        </p>

        <H>Don’t do this</H>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
          <li>Don’t tap Reset crusade unless you mean to wipe the phone save.</li>
          <li>Don’t skip sign-in if you want to play with friends. Local save stays on one device.</li>
          <li>Don’t play the same hunter on two devices at once — the new one kicks the old one off.</li>
          <li>Don’t share your email, password, or hunt code. Staff will never ask for them in chat.</li>
        </ul>

        <p className="mt-8 text-sm text-muted">
          Send friends this page. Then tell them to Begin the hunt.
        </p>
        <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gold">
          {onBack ? (
            <>
              <button type="button" className="grid h-11 min-w-[6.5rem] place-items-center rounded-md border border-gold/40 px-3" onClick={onBack}>
                Back to fight
              </button>
              <button type="button" className="grid h-11 min-w-[6.5rem] place-items-center rounded-md border border-gold/40 px-3" onClick={() => useGame.getState().setLegalPage("privacy")}>
                Privacy
              </button>
              <button type="button" className="grid h-11 min-w-[6.5rem] place-items-center rounded-md border border-gold/40 px-3" onClick={() => useGame.getState().setLegalPage("support")}>
                Support
              </button>
            </>
          ) : (
            <>
              <Link to="/">Hunt</Link>
              <Link to="/login">Sign in</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/support">Support</Link>
            </>
          )}
        </nav>
      </div>
    </main>
  );
}
