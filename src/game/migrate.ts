/** Move-window: grok.me hunters bring their save to soulriftcrusher.com. */
export const MOVE_UNTIL = Date.parse("2026-10-01T23:59:59-04:00");
export const MOVE_LABEL = "October 1, 2026";
export const COM_HUNT = "https://www.soulriftcrusher.com";

export function moveOpen(now = Date.now()): boolean {
  return now <= MOVE_UNTIL;
}

export type HuntPack = {
  v: 1;
  payload: string;
  roster: { id: string; level: number; gild: number; prestige: number; craft: number; down?: number }[];
  name?: string;
};

export function encodeHuntPack(pack: HuntPack): string {
  const json = JSON.stringify({ v: 1, payload: pack.payload, roster: pack.roster ?? [], name: pack.name ?? "" });
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return `SRC1.${b64}`;
}

export function decodeHuntPack(raw: string): HuntPack {
  const text = raw.trim().replace(/\s+/g, "");
  if (!text.startsWith("SRC1.")) throw new Error("Not a hunt code.");
  const json = decodeURIComponent(escape(atob(text.slice(5))));
  const parsed = JSON.parse(json) as HuntPack;
  if (!parsed?.payload || typeof parsed.payload !== "string") throw new Error("Hunt code is empty.");
  JSON.parse(parsed.payload);
  return {
    v: 1,
    payload: parsed.payload,
    roster: Array.isArray(parsed.roster) ? parsed.roster : [],
    name: parsed.name,
  };
}
