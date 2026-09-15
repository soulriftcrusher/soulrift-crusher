/** Server-only Google OAuth creds. Static `process.env.GOOGLE_*` so Vercel inlines them at build. */
export const GOOGLE_OAUTH_CLIENT_ID = (
  process.env.GOOGLE_CLIENT_ID ||
  "131281609025-ud94jb6kllp0qgedo9oi0rb4lcgqjfjp.apps.googleusercontent.com"
).trim();

export const GOOGLE_OAUTH_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || "").trim();
