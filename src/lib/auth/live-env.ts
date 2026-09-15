import { env as nodeEnv } from "node:process";

/** Force Nitro to attach these to the Vercel function. Do not remove. */
void process.env.GOOGLE_CLIENT_SECRET;
void process.env.GOOGLE_CLIENT_ID;
void process.env.BETTER_AUTH_SECRET;
void process.env.BETTER_AUTH_URL;
void process.env.DATABASE_URL;

/** Read Vercel/Node env. Vite inlines `process.env.FOO`; `node:process`.env stays live. */
export function liveEnv(name: string): string {
  try {
    const a = nodeEnv?.[name];
    if (typeof a === "string" && a.trim()) return a.trim();
  } catch {
    /* ignore */
  }
  try {
    const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
    const v = proc?.env?.[name];
    return typeof v === "string" ? v.trim() : "";
  } catch {
    return "";
  }
}
