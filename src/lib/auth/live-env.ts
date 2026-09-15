/** Read Vercel/Node env without Vite inlining `process.env.FOO` to empty at build. */
export function liveEnv(name: string): string {
  try {
    const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
    const v = proc?.env?.[name];
    return typeof v === "string" ? v.trim() : "";
  } catch {
    return "";
  }
}
