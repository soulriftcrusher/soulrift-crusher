/** Pin the hunt to the visible screen — phone Chrome bar, Android nav, PC window, laptop dock. */
export function applyHuntFit() {
  const root = document.documentElement;
  const vv = window.visualViewport;
  const h = Math.max(320, Math.round(vv?.height ?? window.innerHeight));
  const w = Math.max(280, Math.round(vv?.width ?? window.innerWidth));
  root.style.setProperty("--app-h", `${h}px`);
  root.style.setProperty("--app-w", `${w}px`);
  root.classList.toggle("hunt-short", h < 720);
  root.classList.toggle("hunt-tiny", h < 600);
  root.classList.toggle("hunt-laptop", w >= 820 && h < 860);
  root.classList.toggle("hunt-wide", w >= 1400);
}

export function startHuntFit(): () => void {
  applyHuntFit();
  const go = () => applyHuntFit();
  window.addEventListener("resize", go);
  window.addEventListener("orientationchange", go);
  window.visualViewport?.addEventListener("resize", go);
  window.visualViewport?.addEventListener("scroll", go);
  document.addEventListener("visibilitychange", go);
  return () => {
    window.removeEventListener("resize", go);
    window.removeEventListener("orientationchange", go);
    window.visualViewport?.removeEventListener("resize", go);
    window.visualViewport?.removeEventListener("scroll", go);
    document.removeEventListener("visibilitychange", go);
  };
}
