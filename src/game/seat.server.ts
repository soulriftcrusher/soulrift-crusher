import type { Sql } from "@/lib/db";

const STALE_MS = 2 * 60 * 1000;

/** Last device to claim the seat plays. A live other device is kicked on its next pulse. */
export async function takeSeat(
  sql: Sql,
  userId: string,
  deviceId: string,
  steal: boolean,
): Promise<"ok" | "kicked"> {
  const id = String(deviceId ?? "").slice(0, 80);
  await sql`alter table crusaders add column if not exists device_id text`.catch(() => undefined);
  await sql`alter table crusaders add column if not exists device_at timestamptz`.catch(() => undefined);
  const row = await sql<{ device_id: string | null; device_at: Date | string | null }>`
    select device_id, device_at from crusaders where user_id = ${userId}
  `;
  const hold = String(row[0]?.device_id ?? "");
  const rawAt = row[0]?.device_at;
  const at = rawAt instanceof Date ? rawAt.getTime() : rawAt ? Date.parse(String(rawAt)) : 0;
  const stale = !hold || !Number.isFinite(at) || Date.now() - at > STALE_MS;
  if (id.length < 8) return hold && !stale ? "kicked" : "ok";
  const mine = hold === id;
  if (!mine && !stale && !steal) return "kicked";
  await sql`
    update crusaders set device_id = ${id}, device_at = now() where user_id = ${userId}
  `;
  return "ok";
}
