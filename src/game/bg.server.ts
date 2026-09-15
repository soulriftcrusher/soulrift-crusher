import type { Sql } from "@/lib/db";
import { pgReal } from "@/lib/pg-num";

const PAYLOAD_MAX = 400_000;

function cleanName(raw: unknown): string {
  const s = String(raw ?? "")
    .replace(/[^\w \-']/g, "")
    .trim()
    .slice(0, 24);
  return s || "Crusader";
}

function clampPower(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.min(v, 1e100);
}

function clampFloor(n: unknown): number {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v) || v < 1) return 1;
  return Math.min(v, 20000);
}

async function touchCrusader(
  sql: Sql,
  userId: string,
  patch: { name?: string; power?: number; maxFloor?: number; avatar?: string },
) {
  const name = cleanName(patch.name);
  const power = clampPower(patch.power ?? 0);
  const maxFloor = clampFloor(patch.maxFloor ?? 1);
  const avatar = String(patch.avatar ?? "").slice(0, 24);
  await sql`alter table crusaders add column if not exists avatar text not null default 'kael'`.catch(() => undefined);
  await sql`
    insert into crusaders (user_id, name, power, max_floor, avatar, last_seen)
    values (${userId}, ${name}, ${pgReal(power)}::float8, ${maxFloor}, ${avatar || "kael"}, now())
    on conflict (user_id) do update set
      name = case when ${name} = 'Crusader' then crusaders.name else excluded.name end,
      power = greatest(crusaders.power, excluded.power),
      max_floor = greatest(crusaders.max_floor, excluded.max_floor),
      avatar = case when ${avatar} = '' then crusaders.avatar else excluded.avatar end,
      last_seen = now()
  `;
}

export async function applyBackgroundSync(
  userId: string,
  body: { save?: string; name?: string; power?: number; maxFloor?: number; avatar?: string },
): Promise<{ ok: true; saved: boolean }> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  let saved = false;
  const raw = typeof body.save === "string" ? body.save : "";
  if (raw) {
    if (raw.length > PAYLOAD_MAX) throw new Error("Save is too large.");
    JSON.parse(raw);
    const { applyIncoming, mergeProgress } = await import("./save");
    const incoming = applyIncoming(JSON.parse(raw));
    const have = await sql<{ payload: string }>`select payload from game_saves where user_id = ${userId}`;
    const merged = have[0]?.payload
      ? mergeProgress(applyIncoming(JSON.parse(have[0].payload)), incoming)
      : incoming;
    const payload = JSON.stringify(merged);
    await sql`
      insert into game_saves (user_id, payload, updated_at)
      values (${userId}, ${payload}, now())
      on conflict (user_id) do update set payload = excluded.payload, updated_at = now()
    `;
    saved = true;
  }
  await touchCrusader(sql, userId, body);
  const { ensureShard } = await import("./shard-net");
  await ensureShard(sql, userId);
  return { ok: true, saved };
}
