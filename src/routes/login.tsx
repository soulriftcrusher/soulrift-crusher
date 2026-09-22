import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { REVIEWER_EMAIL } from "@/lib/auth/reviewer";
import { ensureReviewer } from "@/game/reviewer-net";
import { Button } from "@/components/ui/button";
import { DiscordBtn } from "@/components/discord-btn";
import { MOVE_LABEL, moveOpen, COM_HUNT } from "@/game/migrate";

export const Route = createFileRoute("/login")({ component: Login });

/** Grok Google/X only works on grok.me — the broker rejects soulriftcrusher.com. */
function grokSocialOk() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return (
    h === "localhost" ||
    h.endsWith(".grok.me") ||
    h.endsWith(".grok-sandbox.com") ||
    h.endsWith(".grok-preview.com")
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [forgot, setForgot] = useState(false);
  const [onCom, setOnCom] = useState(false);
  const social = grokSocialOk();
  const afterLogin = "/?tab=fight";

  useEffect(() => {
    setOnCom(window.location.hostname.replace(/^www\./, "") === "soulriftcrusher.com");
    const q = new URLSearchParams(window.location.search);
    if (q.get("err") === "google" || q.get("error")) {
      const extra = q.get("error") || q.get("error_description") || "";
      const linked = /account.?not.?linked|unable to link/i.test(extra);
      setErr(
        linked
          ? "That Gmail already has a hunter. Sign in with email and that password."
          : extra
            ? `Google allowed it, but the hunt dropped the login (${extra}). Sign in with email.`
            : "Google allowed it, but the hunt didn’t keep you. Sign in with email.",
      );
    }
  }, []);

  async function googleSignIn() {
    setErr("");
    setBusy(true);
    try {
      if (grokSocialOk()) {
        await signIn("grok-google", { callbackURL: afterLogin, errorCallbackURL: "/login?err=google" });
        return;
      }
      const { data, error } = await authClient.signIn.oauth2({
        providerId: "google",
        callbackURL: afterLogin,
        errorCallbackURL: "/login?err=google",
      });
      if (error) throw new Error(error.message ?? "Google sign-in failed");
      if (!data?.url) throw new Error("Google didn’t open. Sign in with email.");
      window.location.assign(data.url);
    } catch (e) {
      const m = e instanceof Error ? e.message : "Google sign-in failed";
      setErr(
        /provider not found/i.test(m)
          ? "Google isn’t live on this build yet. Use email."
          : m,
      );
      setBusy(false);
    }
  }

  async function emailAuth(mode: "in" | "up") {
    setErr("");
    setBusy(true);
    try {
      const em = email.trim().toLowerCase();
      if (!em || password.length < 8) throw new Error("Email and a password of at least 8 characters.");
      if (em === REVIEWER_EMAIL) await ensureReviewer();
      if (mode === "up") {
        const { error } = await authClient.signUp.email({
          email: em,
          password,
          name: em.split("@")[0] || "Hunter",
          callbackURL: afterLogin,
        });
        if (error) {
          const already = /exist|already/i.test(error.message ?? "");
          if (!already) throw new Error(error.message ?? "Could not create hunter");
          const again = await authClient.signIn.email({ email: em, password, callbackURL: "/" });
          if (again.error) throw new Error(again.error.message ?? "Hunter exists — Sign in instead.");
        }
      } else {
        const { error } = await authClient.signIn.email({
          email: em,
          password,
          callbackURL: afterLogin,
        });
        if (error) {
          const missing = /not found|invalid|credentials/i.test(error.message ?? "");
          throw new Error(
            missing
              ? "No hunter with that email, or the password is wrong. Tap Create hunter the first time."
              : (error.message ?? "Sign-in failed"),
          );
        }
      }
      window.location.assign(afterLogin);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-bg text-fg">
      <img
        src="/bg/title.jpg"
        alt=""
        className="absolute inset-0 size-full object-cover"
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/40" />
      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-sm flex-1 flex-col overflow-y-auto px-5 pt-12">
        <p className="font-display text-xs tracking-[0.28em] text-muted uppercase">Required to hunt</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">Sign in to hunt</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Continue with Google, or use email so your hunter stays on this name. Never share your
          email, password, or hunt code with anyone.
        </p>
        {moveOpen() && !onCom ? (
          <div className="mt-3 flex flex-col gap-2">
            <a
              href={COM_HUNT}
              className="grid h-12 place-items-center rounded-md border border-gold/40 bg-bg/50 font-display text-sm text-gold"
            >
              Open soulriftcrusher.com
            </a>
            <p className="text-xs leading-relaxed text-muted">
              Before {MOVE_LABEL}: Create hunter below, then tap Move hunt → Bring hunt I copied.
            </p>
          </div>
        ) : null}
        <div className="mt-5 flex flex-col gap-3 pb-3">
          {authEnabled ? (
            <Button
              size="lg"
              className="h-12 w-full font-display tracking-wide"
              disabled={busy}
              onClick={() => void googleSignIn()}
            >
              {busy ? "Opening Google…" : "Continue with Google"}
            </Button>
          ) : null}
          {authEnabled && social
            ? GROK_PROVIDERS.filter((p) => p.providerId !== "grok-google").map((p) => (
                <Button
                  key={p.providerId}
                  size="lg"
                  variant="outline"
                  className="h-12 w-full font-display tracking-wide"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                >
                  Continue with {p.label}
                </Button>
              ))
            : null}
          <div className="rounded-md border border-gold/40 bg-bg/50 p-3">
            <input
              type="email"
              autoComplete="username"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
            />
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password (8+ letters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
            />
            {err ? <p className="mt-2 text-xs text-red-300">{err}</p> : null}
            <Button
              size="lg"
              className="mt-3 h-11 w-full font-display tracking-wide"
              disabled={busy || !email || !password}
              onClick={() => void emailAuth("in")}
            >
              {busy ? "Signing in…" : "Sign in"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="mt-2 h-11 w-full"
              disabled={busy || !email || !password}
              onClick={() => void emailAuth("up")}
            >
              Create hunter
            </Button>
            <button
              type="button"
              className="mt-2 h-10 w-full text-xs text-gold"
              onClick={() => setForgot((v) => !v)}
            >
              Forgot password?
            </button>
            {forgot ? (
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Email{" "}
                <a className="text-gold underline" href="mailto:soulriftcrusher@gmail.com?subject=Reset%20my%20Soulrift%20password">
                  soulriftcrusher@gmail.com
                </a>{" "}
                from the same inbox. A founder will set a new password. Use that new password on Sign in — don’t tap Create hunter again.
              </p>
            ) : null}
          </div>
          <DiscordBtn />
        </div>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-sm shrink-0 bg-gradient-to-t from-bg via-bg/95 to-transparent px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="grid grid-cols-2 gap-2">
          <a href="/guide" className="grid h-11 place-items-center rounded-md border border-gold/40 bg-bg/70 text-sm text-gold">
            How to hunt
          </a>
          <a href="/privacy" className="grid h-11 place-items-center rounded-md border border-gold/40 bg-bg/70 text-sm text-gold">
            Privacy Policy
          </a>
          <a href="/support" className="grid h-11 place-items-center rounded-md border border-gold/40 bg-bg/70 text-sm text-gold">
            Support
          </a>
          <a href="/copyright" className="grid h-11 place-items-center rounded-md border border-gold/40 bg-bg/70 text-sm text-gold">
            Copyright
          </a>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted">© 2026 Soulrift Crusher. All rights reserved.</p>
      </div>
    </main>
  );
}
