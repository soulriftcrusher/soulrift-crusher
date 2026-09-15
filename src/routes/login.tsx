import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { ensureReviewer } from "@/game/reviewer-net";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function reviewerSignIn() {
    setErr("");
    setBusy(true);
    try {
      await ensureReviewer();
      const { error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        callbackURL: "/",
      });
      if (error) throw new Error(error.message ?? "Sign-in failed");
      window.location.assign("/");
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
      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col justify-end px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16">
        <p className="font-display text-xs tracking-[0.28em] text-muted uppercase">Required to hunt</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">Sign in to hunt</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Every hunter needs an account. Sign in so your heroes, gold, clans, and cloud save stay
          on this name — on every phone.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                size="lg"
                className="h-12 w-full font-display tracking-wide"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href="/guide" className="grid h-11 place-items-center rounded-md border border-gold/40 text-sm text-gold">
              How to hunt
            </a>
            <a href="/privacy" className="grid h-11 place-items-center rounded-md border border-gold/40 text-sm text-gold">
              Privacy Policy
            </a>
            <a href="/support" className="grid h-11 place-items-center rounded-md border border-gold/40 text-sm text-gold">
              Support
            </a>
            <a href="/copyright" className="grid h-11 place-items-center rounded-md border border-gold/40 text-sm text-gold">
              Copyright
            </a>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted">© 2026 Soulrift Crusher. All rights reserved.</p>
          {open ? (
            <div className="rounded-md border border-border bg-bg/50 p-3">
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
              />
              {err ? <p className="mt-2 text-xs text-red-300">{err}</p> : null}
              <Button
                size="lg"
                variant="outline"
                className="mt-2 h-11 w-full"
                disabled={busy || !email || !password}
                onClick={() => void reviewerSignIn()}
              >
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className="h-11 w-full text-center text-sm text-muted"
              onClick={() => setOpen(true)}
            >
              Reviewer
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
