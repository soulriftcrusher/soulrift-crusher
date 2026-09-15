/** Postgres int4 max is 2,147,483,647. Bind big stats as text + float8/bigint. */
/** Postgres float8 tops out around 1e308. Keep a little headroom. */
export function pgReal(n: unknown): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return "0";
  return String(Math.min(1e100, Math.max(-1e100, v)));
}

export function pgInt(n: unknown): string {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return "0";
  return String(Math.min(9e15, Math.max(-9e15, v)));
}
