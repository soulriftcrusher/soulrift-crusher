import { useEffect, useState } from "react";

const KEY = "soulrift-board";
const QUERY = "(min-width: 820px) and (pointer: fine), (min-width: 900px) and (hover: hover)";

export type BoardPref = "auto" | "desk" | "phone";

export function readBoardPref(): BoardPref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "desk" || v === "phone" || v === "auto") return v;
  } catch {
    /* ignore */
  }
  return "auto";
}

export function writeBoardPref(pref: BoardPref) {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event("soulrift-board"));
}

export function detectDesk(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(pointer: coarse)").matches) return false;
    if (window.matchMedia("(hover: none)").matches) return false;
    if (window.matchMedia(QUERY).matches) return true;
  } catch {
    /* ignore */
  }
  return window.innerWidth >= 960 && !("ontouchstart" in window);
}

/** Mouse + wide screen = PC board. Phones stay on the phone layout unless forced. */
export function isDesk(): boolean {
  const pref = readBoardPref();
  if (pref === "desk") return true;
  if (pref === "phone") return false;
  return detectDesk();
}

export function useDesk(): boolean {
  const [desk, setDesk] = useState(() => (typeof window === "undefined" ? false : isDesk()));
  useEffect(() => {
    const go = () => setDesk(isDesk());
    go();
    const mq = window.matchMedia("(min-width: 820px)");
    mq.addEventListener("change", go);
    window.addEventListener("resize", go);
    window.addEventListener("soulrift-board", go);
    return () => {
      mq.removeEventListener("change", go);
      window.removeEventListener("resize", go);
      window.removeEventListener("soulrift-board", go);
    };
  }, []);
  return desk;
}
