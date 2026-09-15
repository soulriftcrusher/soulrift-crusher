const SUFFIXES = [
  "",
  "K",
  "M",
  "B",
  "T",
  "Qa",
  "Qi",
  "Sx",
  "Sp",
  "Oc",
  "No",
  "Dc",
  "Ud",
  "Dd",
  "Td",
  "Qad",
  "Qid",
  "Sxd",
  "Spd",
  "Ocd",
  "Nod",
];

export function formatNum(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  const sign = n < 0 ? "-" : "";
  let v = Math.abs(n);
  if (v < 1000) {
    if (v === 0) return "0";
    if (v < 10 && v % 1 !== 0) return sign + v.toFixed(1);
    return sign + Math.floor(v).toLocaleString("en-US");
  }
  const exp = Math.floor(Math.log10(v) / 3);
  if (exp >= SUFFIXES.length) {
    const e = Math.floor(Math.log10(v));
    return sign + (v / Math.pow(10, e)).toFixed(2) + "e" + e;
  }
  v = v / Math.pow(10, exp * 3);
  const digits = v >= 100 ? 0 : v >= 10 ? 1 : 2;
  return sign + v.toFixed(digits) + SUFFIXES[exp];
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  if (m <= 0) return `${r}s`;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
