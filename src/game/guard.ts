/** Strip emails, hunt packs, and tokens so they never land in chat or names. */
export function scrubSecrets(raw: unknown): string {
  return String(raw ?? "")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[hidden]")
    .replace(/\bSRC1\.[A-Za-z0-9_-]+/g, "[hidden]")
    .replace(/\bghp_[A-Za-z0-9]{20,}/g, "[hidden]")
    .replace(/\bGOCSPX-[A-Za-z0-9_-]+/g, "[hidden]")
    .replace(/\bsk_live_[A-Za-z0-9]+/g, "[hidden]");
}

export function cleanChat(raw: unknown): string {
  return scrubSecrets(raw)
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}
