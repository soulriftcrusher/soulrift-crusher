import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { parseSetCookieHeader } from "better-auth/cookies";

type CookieSetter = (
  name: string,
  value: string,
  opts?: Record<string, unknown>,
) => void;

async function startSetCookie(): Promise<CookieSetter | null> {
  try {
    const mod = (await import("@tanstack/react-start/server")) as {
      setCookie?: CookieSetter;
    };
    return typeof mod.setCookie === "function" ? mod.setCookie : null;
  } catch {
    return null;
  }
}

/** Like better-auth's tanstackStartCookies, but won't crash if setCookie is missing. */
export function safeStartCookies(): BetterAuthPlugin {
  return {
    id: "tanstack-start-cookies",
    hooks: {
      after: [
        {
          matcher: () => true,
          handler: createAuthMiddleware(async (ctx) => {
            const returned = ctx.context.responseHeaders;
            if ("_flag" in ctx && ctx._flag === "router") return;
            if (!(returned instanceof Headers)) return;
            const raw = returned.get("set-cookie");
            if (!raw) return;
            const setCookie = await startSetCookie();
            if (!setCookie) return;
            const parsed = parseSetCookieHeader(raw);
            parsed.forEach((value, key) => {
              if (!key) return;
              try {
                setCookie(key, value.value, {
                  sameSite: value.samesite,
                  secure: value.secure,
                  maxAge: value["max-age"],
                  httpOnly: value.httponly,
                  domain: value.domain,
                  path: value.path,
                });
              } catch {
                /* no request cookie store on this call */
              }
            });
          }),
        },
      ],
    },
  };
}
