import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { cleanChat } from "@/game/guard";

export type WhisperMsg = {
  id: number;
  fromId: string;
  toId: string;
  name: string;
  body: string;
  at: number;
  mine: boolean;
};

export type WhisperThread = {
  userId: string;
  name: string;
  last: string;
  at: number;
};

export type WhisperSnap = {
  threads: WhisperThread[];
  withId: string | null;
  withName: string;
  chat: WhisperMsg[];
};

async function gatherWhispers(
  sql: Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>,
  me: string,
  withId: string,
  since: number,
): Promise<WhisperSnap> {
  await sql`delete from whispers where created_at < now() - interval '7 days'`;
  const muted = await sql<{ muted_id: string }>`
    select muted_id from mutes where user_id = ${me}
  `.catch(() => [] as { muted_id: string }[]);
  const hide = new Set(muted.map((m) => m.muted_id));
  const recent = await sql<{
    id: number;
    from_id: string;
    to_id: string;
    from_name: string;
    body: string;
    created_at: string;
  }>`
    select id, from_id, to_id, from_name, body, created_at
    from whispers
    where (from_id = ${me} or to_id = ${me})
      and created_at > now() - interval '7 days'
    order by id desc
    limit 200
  `;
  const threads = new Map<string, WhisperThread>();
  for (const r of recent) {
    const other = r.from_id === me ? r.to_id : r.from_id;
    if (!other || hide.has(other) || threads.has(other)) continue;
    const fromThem = recent.find((x) => x.from_id === other);
    threads.set(other, {
      userId: other,
      name: (r.from_id === me ? fromThem?.from_name : r.from_name) || "",
      last: r.body,
      at: Date.parse(r.created_at) || Date.now(),
    });
  }
  for (const t of threads.values()) {
    if (t.name) continue;
    const row = await sql<{ name: string }>`select name from crusaders where user_id = ${t.userId}`;
    t.name = row[0]?.name || "Crusader";
  }
  let withName = "Crusader";
  let chat: WhisperMsg[] = [];
  if (withId) {
    const them = await sql<{ name: string }>`select name from crusaders where user_id = ${withId}`;
    withName = them[0]?.name || threads.get(withId)?.name || "Crusader";
    const rows =
      since > 0
        ? await sql<{ id: number; from_id: string; to_id: string; from_name: string; body: string; created_at: string }>`
            select id, from_id, to_id, from_name, body, created_at from whispers
            where ((from_id = ${me} and to_id = ${withId}) or (from_id = ${withId} and to_id = ${me}))
              and created_at > now() - interval '7 days'
              and id > ${since}
            order by id asc
            limit 80
          `
        : await sql<{ id: number; from_id: string; to_id: string; from_name: string; body: string; created_at: string }>`
            select id, from_id, to_id, from_name, body, created_at from whispers
            where ((from_id = ${me} and to_id = ${withId}) or (from_id = ${withId} and to_id = ${me}))
              and created_at > now() - interval '7 days'
            order by id desc
            limit 80
          `;
    const mapped = rows.map((r) => ({
      id: Number(r.id),
      fromId: r.from_id,
      toId: r.to_id,
      name: r.from_name,
      body: r.body,
      at: Date.parse(r.created_at) || Date.now(),
      mine: r.from_id === me,
    }));
    chat = since > 0 ? mapped : mapped.reverse();
  }

  return {
    threads: [...threads.values()].sort((a, b) => b.at - a.at).slice(0, 40),
    withId: withId || null,
    withName,
    chat,
  };
}

export const loadWhispers = createServerFn({ method: "POST" })
  .validator((d: { withId?: string; since?: number } | undefined) => ({
    withId: String(d?.withId ?? "").slice(0, 80),
    since: Math.max(0, Math.floor(Number(d?.since ?? 0)) || 0),
  }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<WhisperSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    return gatherWhispers(sql, context.userId, data.withId, data.since);
  });

export const sendWhisper = createServerFn({ method: "POST" })
  .validator((d: { toId: string; name: string; body: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<WhisperSnap> => {
    const toId = String(data.toId ?? "").slice(0, 80);
    if (!toId || toId === context.userId) throw new Error("Pick another crusader.");
    const body = cleanChat(data.body);
    if (body.length < 1) throw new Error("Say something.");
    const name =
      String(data.name ?? "Crusader")
        .replace(/[^\w \-']/g, "")
        .trim()
        .slice(0, 24) || "Crusader";
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const { assertNotBanned } = await import("./net");
    await assertNotBanned(sql, context.userId);
    const them = await sql<{ user_id: string }>`select user_id from crusaders where user_id = ${toId}`;
    if (!them[0]) throw new Error("They left the rift.");
    const last = await sql<{ created_at: string }>`
      select created_at from whispers where from_id = ${context.userId} order by id desc limit 1
    `;
    if (last[0]) {
      const t = Date.parse(last[0].created_at);
      if (Number.isFinite(t) && Date.now() - t < 1500) throw new Error("Slow the hymn.");
    }
    await sql`
      insert into whispers (from_id, to_id, from_name, body)
      values (${context.userId}, ${toId}, ${name}, ${body})
    `;
    return gatherWhispers(sql, context.userId, toId, 0);
  });
