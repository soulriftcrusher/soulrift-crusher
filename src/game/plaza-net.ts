import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { cleanChat } from "@/game/guard";
import { LOOT, type LootId } from "./loot";

export type ChatMsg = {
  id: string;
  userId?: string;
  name: string;
  body: string;
  at: number;
  npc: boolean;
};

export type OnlineSoul = {
  userId: string;
  name: string;
  power: number;
  maxFloor: number;
};

export type TradeSnap = {
  id: number;
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  fromItems: Record<string, number>;
  toItems: Record<string, number>;
  fromOk: boolean;
  toOk: boolean;
  status: string;
  mine: "from" | "to";
};

export type PlazaSnap = {
  online: number;
  chat: ChatMsg[];
  souls: OnlineSoul[];
  trades: TradeSnap[];
  bag: Record<string, number>;
};

const LOOT_IDS = new Set(LOOT.map((l) => l.id));

const NPC_CHAT: { name: string; body: string }[] = [
  { name: "Cinder Host", body: "Ashen Pact, your lair reeks of fear." },
  { name: "Void Choir", body: "The cut widened. We took three scouts." },
  { name: "Iron Hymn", body: "Trade bone. We overforged again." },
  { name: "Rime Banner", body: "Frost holds. Bring fang cords if you hunt." },
  { name: "Nightwell", body: "Fish ran the well. Flasks for sale." },
  { name: "Cinder Host", body: "Season war in weeks. Stack shards." },
  { name: "Void Choir", body: "Anyone selling soul plumes?" },
  { name: "Iron Hymn", body: "Hammer's hot. Random smash ate my jaw." },
];

function cleanItems(raw: unknown): Record<LootId, number> {
  const out = {} as Record<LootId, number>;
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!LOOT_IDS.has(k as LootId)) continue;
    const n = Math.floor(Number(v));
    if (n > 0) out[k as LootId] = Math.min(9999, n);
  }
  return out;
}

function parseItems(s: string): Record<string, number> {
  try {
    const o = JSON.parse(s) as unknown;
    return cleanItems(o);
  } catch {
    return {};
  }
}

function npcChat(now = Date.now()): ChatMsg[] {
  const slot = Math.floor(now / 180000);
  return [0, 1, 2].map((i) => {
    const row = NPC_CHAT[(slot + i * 3) % NPC_CHAT.length]!;
    return {
      id: `npc-${slot}-${i}`,
      name: row.name,
      body: row.body,
      at: now - (3 - i) * 40000,
      npc: true,
    };
  });
}

async function writeBag(
  sql: Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>,
  userId: string,
  bag: Record<string, number>,
) {
  const items = cleanItems(bag);
  await sql`delete from inventories where user_id = ${userId}`;
  for (const [id, qty] of Object.entries(items)) {
    if (qty <= 0) continue;
    await sql`
      insert into inventories (user_id, loot_id, qty)
      values (${userId}, ${id}, ${qty})
    `;
  }
}

async function readBag(
  sql: Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>,
  userId: string,
): Promise<Record<string, number>> {
  const rows = await sql<{ loot_id: string; qty: number }>`
    select loot_id, qty from inventories where user_id = ${userId}
  `;
  const bag: Record<string, number> = {};
  for (const r of rows) bag[r.loot_id] = Number(r.qty);
  return bag;
}

async function takeItems(
  sql: Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>,
  userId: string,
  items: Record<string, number>,
) {
  for (const [id, n] of Object.entries(items)) {
    if (n <= 0) continue;
    const row = await sql<{ qty: number }>`
      select qty from inventories where user_id = ${userId} and loot_id = ${id}
    `;
    if ((row[0]?.qty ?? 0) < n) throw new Error("Not enough parts for that trade.");
    await sql`
      update inventories set qty = qty - ${n} where user_id = ${userId} and loot_id = ${id}
    `;
  }
}

async function giveItems(
  sql: Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>,
  userId: string,
  items: Record<string, number>,
) {
  for (const [id, n] of Object.entries(items)) {
    if (n <= 0) continue;
    await sql`
      insert into inventories (user_id, loot_id, qty)
      values (${userId}, ${id}, ${n})
      on conflict (user_id, loot_id) do update set qty = inventories.qty + excluded.qty
    `;
  }
}

export const loadPlaza = createServerFn({ method: "POST" })
  .validator((d: { bag?: Record<string, number> }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    if (data.bag) await writeBag(sql, context.userId, data.bag);
    return gatherPlaza(sql, context.userId);
  });

async function gatherPlaza(
  sql: Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>,
  userId: string,
): Promise<PlazaSnap> {
  const online = await sql<{ n: number }>`
    select count(*)::int as n from crusaders where last_seen > now() - interval '2 minutes'
  `;
  const souls = await sql<{ user_id: string; name: string; power: number; max_floor: number }>`
    select user_id, name, power, max_floor from crusaders
    where last_seen > now() - interval '2 minutes'
    order by power desc
    limit 24
  `;
  const chatRows = await sql<{ id: number; user_id: string; name: string; body: string; created_at: string }>`
    select id, user_id, name, body, created_at from world_chat order by id desc limit 40
  `;
  const muted = await sql<{ muted_id: string }>`
    select muted_id from mutes where user_id = ${userId}
  `.catch(() => [] as { muted_id: string }[]);
  const hide = new Set(muted.map((m) => m.muted_id));
  const tradeRows = await sql<{
    id: number;
    from_id: string;
    to_id: string;
    from_items: string;
    to_items: string;
    from_ok: boolean;
    to_ok: boolean;
    status: string;
    from_name: string;
    to_name: string;
  }>`
    select t.id, t.from_id, t.to_id, t.from_items, t.to_items, t.from_ok, t.to_ok, t.status,
      a.name as from_name, b.name as to_name
    from trades t
    join crusaders a on a.user_id = t.from_id
    join crusaders b on b.user_id = t.to_id
    where t.status = 'open' and (t.from_id = ${userId} or t.to_id = ${userId})
    order by t.id desc
    limit 8
  `;
  const live: ChatMsg[] = chatRows
    .filter((r) => !hide.has(r.user_id))
    .map((r) => ({
    id: `c-${r.id}`,
    userId: r.user_id,
    name: r.name,
    body: r.body,
    at: Date.parse(r.created_at) || Date.now(),
    npc: false,
  }));
  const chat = [...live, ...npcChat()].sort((a, b) => a.at - b.at).slice(-50);
  return {
    online: Number(online[0]?.n ?? 1),
    chat,
    souls: souls.map((s) => ({
      userId: s.user_id,
      name: s.name,
      power: Number(s.power),
      maxFloor: Number(s.max_floor),
    })),
    trades: tradeRows.map((t) => ({
      id: Number(t.id),
      fromId: t.from_id,
      toId: t.to_id,
      fromName: t.from_name,
      toName: t.to_name,
      fromItems: parseItems(t.from_items),
      toItems: parseItems(t.to_items),
      fromOk: Boolean(t.from_ok),
      toOk: Boolean(t.to_ok),
      status: t.status,
      mine: t.from_id === userId ? "from" : "to",
    })),
    bag: await readBag(sql, userId),
  };
}

export const sendWorldChat = createServerFn({ method: "POST" })
  .validator((d: { body: string; name: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const body = cleanChat(data.body);
    if (body.length < 1) throw new Error("Say something.");
    const name = String(data.name ?? "Crusader")
      .replace(/[^\w \-']/g, "")
      .trim()
      .slice(0, 24) || "Crusader";
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const { assertNotBanned } = await import("./net");
    await assertNotBanned(sql, context.userId);
    const last = await sql<{ created_at: string }>`
      select created_at from world_chat where user_id = ${context.userId} order by id desc limit 1
    `;
    if (last[0]) {
      const t = Date.parse(last[0].created_at);
      if (Number.isFinite(t) && Date.now() - t < 2000) throw new Error("Slow the hymn.");
    }
    await sql`
      insert into world_chat (user_id, name, body) values (${context.userId}, ${name}, ${body})
    `;
    return { ok: true };
  });

export const muteHunter = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const id = String(data.userId ?? "").slice(0, 80);
    if (!id || id === context.userId) throw new Error("Can't mute yourself.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into mutes (user_id, muted_id) values (${context.userId}, ${id})
      on conflict do nothing
    `;
    return { ok: true as const };
  });

export const unmuteHunter = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`delete from mutes where user_id = ${context.userId} and muted_id = ${String(data.userId ?? "")}`;
    return { ok: true as const };
  });

export const reportHunter = createServerFn({ method: "POST" })
  .validator((d: { userId: string; reason?: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const about = String(data.userId ?? "").slice(0, 80);
    if (!about || about === context.userId) throw new Error("Pick someone else.");
    const reason = String(data.reason ?? "report").slice(0, 80);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`insert into reports (from_id, about_id, reason) values (${context.userId}, ${about}, ${reason})`;
    return { ok: true as const };
  });

export const openTrade = createServerFn({ method: "POST" })
  .validator((d: { toId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const toId = String(data.toId ?? "");
    if (!toId || toId === context.userId) throw new Error("Pick another crusader.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const them = await sql<{ user_id: string }>`select user_id from crusaders where user_id = ${toId}`;
    if (!them[0]) throw new Error("They left the rift.");
    const open = await sql<{ id: number }>`
      select id from trades
      where status = 'open' and (
        (from_id = ${context.userId} and to_id = ${toId}) or
        (from_id = ${toId} and to_id = ${context.userId})
      )
      limit 1
    `;
    if (open[0]) return { id: Number(open[0].id) };
    const rows = await sql<{ id: number }>`
      insert into trades (from_id, to_id) values (${context.userId}, ${toId}) returning id
    `;
    const fromName = await sql<{ name: string }>`select name from crusaders where user_id = ${context.userId}`;
    const { notifyUser } = await import("./push.server");
    void notifyUser(toId, {
      title: "Trade window",
      body: `${fromName[0]?.name ?? "A crusader"} wants to trade.`,
      url: "/?tab=clan",
    }).catch(() => undefined);
    return { id: Number(rows[0]!.id) };
  });

export const setTradeOffer = createServerFn({ method: "POST" })
  .validator((d: { id: number; items: Record<string, number> }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const items = JSON.stringify(cleanItems(data.items));
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const row = await sql<{ from_id: string; to_id: string; status: string }>`
      select from_id, to_id, status from trades where id = ${data.id}
    `;
    const t = row[0];
    if (!t || t.status !== "open") throw new Error("Trade is gone.");
    if (t.from_id === context.userId) {
      await sql`update trades set from_items = ${items}, from_ok = false, to_ok = false where id = ${data.id}`;
    } else if (t.to_id === context.userId) {
      await sql`update trades set to_items = ${items}, from_ok = false, to_ok = false where id = ${data.id}`;
    } else throw new Error("Not your window.");
    return { ok: true };
  });

export const acceptTrade = createServerFn({ method: "POST" })
  .validator((d: { id: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const row = await sql<{
      from_id: string;
      to_id: string;
      from_items: string;
      to_items: string;
      from_ok: boolean;
      to_ok: boolean;
      status: string;
    }>`select from_id, to_id, from_items, to_items, from_ok, to_ok, status from trades where id = ${data.id}`;
    const t = row[0];
    if (!t || t.status !== "open") throw new Error("Trade is gone.");
    if (t.from_id === context.userId) {
      await sql`update trades set from_ok = true where id = ${data.id}`;
      t.from_ok = true;
    } else if (t.to_id === context.userId) {
      await sql`update trades set to_ok = true where id = ${data.id}`;
      t.to_ok = true;
    } else throw new Error("Not your window.");
    if (t.from_ok && t.to_ok) {
      const a = parseItems(t.from_items);
      const b = parseItems(t.to_items);
      await takeItems(sql, t.from_id, a);
      await takeItems(sql, t.to_id, b);
      await giveItems(sql, t.to_id, a);
      await giveItems(sql, t.from_id, b);
      await sql`update trades set status = 'done' where id = ${data.id}`;
      const { notifyUser } = await import("./push.server");
      const other = t.from_id === context.userId ? t.to_id : t.from_id;
      void notifyUser(other, {
        title: "Trade complete",
        body: "Loot swapped. Check your bag.",
        url: "/?tab=shop",
      }).catch(() => undefined);
    }
    return { bag: await readBag(sql, context.userId), done: t.from_ok && t.to_ok };
  });

export const cancelTrade = createServerFn({ method: "POST" })
  .validator((d: { id: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      update trades set status = 'cancelled'
      where id = ${data.id} and status = 'open' and (from_id = ${context.userId} or to_id = ${context.userId})
    `;
    return { ok: true };
  });

export const stallTrade = createServerFn({ method: "POST" })
  .validator((d: { stall: string; bag: Record<string, number> }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const stalls: Record<string, { take: Record<string, number>; give: Record<string, number> }> = {
      bone: { take: { skull: 4 }, give: { "bone-shard": 1 } },
      soul: { take: { "soul-plume": 2 }, give: { "soul-shard": 1 } },
      rift: { take: { "rift-fish": 2, "ember-leaf": 1 }, give: { flask: 1 } },
    };
    const stall = stalls[data.stall];
    if (!stall) throw new Error("Stall packed up.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await writeBag(sql, context.userId, data.bag);
    await takeItems(sql, context.userId, stall.take);
    await giveItems(sql, context.userId, stall.give);
    return { bag: await readBag(sql, context.userId) };
  });
