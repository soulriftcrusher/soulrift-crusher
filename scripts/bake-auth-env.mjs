/**
 * Stamp Vercel env into a server module at build so Google/auth secrets
 * survive the Vite bundle (process.env.GOOGLE_* was coming through empty).
 */
import { writeFileSync } from "node:fs";

const googleId = (process.env.GOOGLE_CLIENT_ID || "").trim();
const googleSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim();
const authSecret = (process.env.BETTER_AUTH_SECRET || "").trim();
const authUrl = (process.env.BETTER_AUTH_URL || "https://www.soulriftcrusher.com").trim();

writeFileSync(
  new URL("../src/lib/auth/baked-env.ts", import.meta.url),
  `/** Generated at build. Do not edit. */
export const BAKED_GOOGLE_CLIENT_ID = ${JSON.stringify(googleId)};
export const BAKED_GOOGLE_CLIENT_SECRET = ${JSON.stringify(googleSecret)};
export const BAKED_BETTER_AUTH_SECRET = ${JSON.stringify(authSecret)};
export const BAKED_BETTER_AUTH_URL = ${JSON.stringify(authUrl)};
`,
);

console.log(
  "[bake-auth] googleId",
  googleId ? "yes" : "NO",
  "googleSecret",
  googleSecret.length,
  "authSecret",
  authSecret.length,
);
