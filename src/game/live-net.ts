import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type InboxRow = {
  id: number;
  title: string;
  body: string;
  gold: number;
  souls: number;
  gems: number;
  chests: number;
  claimed: boolean;
};

function asStaff(sql: Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>, userId: string) {
  return sql<{ user_id: string }>`select user_id from staff where user_id = ${userId} limit 1`;
}

export const listInbox = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ mail: InboxRow[]; unread: number }> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      title: string;
      body: string;
      gold: number;
      souls: number;
      gems: number;
      chests: number;
      claimed: boolean;
    }>`
      select id, title, body, gold, souls, gems, chests, claimed
      from inbox where user_id = ${context.userId}
      order by claimed asc, id desc
      limit 30
    `;
    const mail = rows.map((r) => ({
      id: Number(r.id),
      title: r.title,
      body: r.body,
      gold: Number(r.gold),
      souls: Number(r.souls),
      gems: Number(r.gems),
      chests: Number(r.chests),
      claimed: Boolean(r.claimed),
    }));
    return { mail, unread: mail.filter((m) => !m.claimed).length };
  });

export const claimInbox = createServerFn({ method: "POST" })
  .validator((d: { id?: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const id = data.id ? Math.floor(Number(data.id)) : 0;
    const rows = id
      ? await sql<{ gold: number; souls: number; gems: number; chests: number; claimed: boolean }>`
          select gold, souls, gems, chests, claimed from inbox where id = ${id} and user_id = ${context.userId}
        `
      : await sql<{ gold: number; souls: number; gems: number; chests: number; claimed: boolean }>`
          select gold, souls, gems, chests, claimed from inbox where user_id = ${context.userId} and claimed = false
        `;
    let gold = 0;
    let souls = 0;
    let gems = 0;
    let chests = 0;
    for (const r of rows) {
      if (r.claimed) continue;
      gold += Number(r.gold);
      souls += Number(r.souls);
      gems += Number(r.gems);
      chests += Number(r.chests);
    }
    if (id) {
      await sql`update inbox set claimed = true where id = ${id} and user_id = ${context.userId}`;
    } else {
      await sql`update inbox set claimed = true where user_id = ${context.userId} and claimed = false`;
    }
    return { gold, souls, gems, chests };
  });

export const sendInbox = createServerFn({ method: "POST" })
  .validator((d: { userId: string; title: string; body?: string; gold?: number; souls?: number; gems?: number; chests?: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await asStaff(sql, context.userId);
    if (!mine[0]) throw new Error("Staff only.");
    const userId = String(data.userId ?? "").slice(0, 80);
    if (!userId) throw new Error("Pick a hunter.");
    const title = String(data.title ?? "Mail").slice(0, 40);
    const body = String(data.body ?? "").slice(0, 200);
    const gold = Math.max(0, Math.min(1e12, Number(data.gold) || 0));
    const souls = Math.max(0, Math.min(50000, Math.floor(Number(data.souls) || 0)));
    const gems = Math.max(0, Math.min(5000, Math.floor(Number(data.gems) || 0)));
    const chests = Math.max(0, Math.min(50, Math.floor(Number(data.chests) || 0)));
    await sql`
      insert into inbox (user_id, title, body, gold, souls, gems, chests)
      values (${userId}, ${title}, ${body}, ${gold}, ${souls}, ${gems}, ${chests})
    `;
    return { ok: true as const };
  });

export const createGiftCode = createServerFn({ method: "POST" })
  .validator((d: { code: string; gems?: number; gold?: number; souls?: number; chests?: number; maxUses?: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await asStaff(sql, context.userId);
    if (!mine[0]) throw new Error("Staff only.");
    const code = String(data.code ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 16);
    if (code.length < 4) throw new Error("Code needs 4+ letters.");
    const gems = Math.max(0, Math.min(5000, Math.floor(Number(data.gems) || 0)));
    const gold = Math.max(0, Math.min(1e12, Number(data.gold) || 0));
    const souls = Math.max(0, Math.min(5000, Math.floor(Number(data.souls) || 0)));
    const chests = Math.max(0, Math.min(20, Math.floor(Number(data.chests) || 0)));
    const maxUses = Math.max(1, Math.min(10000, Math.floor(Number(data.maxUses) || 100)));
    await sql`
      insert into gift_codes (code, gems, gold, souls, chests, max_uses, by_id)
      values (${code}, ${gems}, ${gold}, ${souls}, ${chests}, ${maxUses}, ${context.userId})
      on conflict (code) do update set gems = excluded.gems, gold = excluded.gold, souls = excluded.souls, chests = excluded.chests, max_uses = excluded.max_uses
    `;
    return { ok: true as const, code };
  });

export const redeemCode = createServerFn({ method: "POST" })
  .validator((d: { code: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const code = String(data.code ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 16);
    if (code.length < 4) throw new Error("That code is empty.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const row = await sql<{ gems: number; gold: number; souls: number; chests: number; uses: number; max_uses: number }>`
      select gems, gold, souls, chests, uses, max_uses from gift_codes where code = ${code}
    `;
    if (!row[0]) throw new Error("Unknown code.");
    if (Number(row[0].uses) >= Number(row[0].max_uses)) throw new Error("Code is spent.");
    const had = await sql<{ user_id: string }>`
      select user_id from code_redemptions where code = ${code} and user_id = ${context.userId}
    `;
    if (had[0]) throw new Error("You already used that code.");
    await sql`insert into code_redemptions (code, user_id) values (${code}, ${context.userId})`;
    await sql`update gift_codes set uses = uses + 1 where code = ${code}`;
    return {
      gold: Number(row[0].gold),
      souls: Number(row[0].souls),
      gems: Number(row[0].gems),
      chests: Number(row[0].chests),
    };
  });

export const sendFriendGift = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const toId = String(data.userId ?? "").slice(0, 80);
    if (!toId || toId === context.userId) throw new Error("Pick a friend.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const pal = await sql<{ user_a: string }>`
      select user_a from friendships
      where (user_a = ${context.userId} and user_b = ${toId}) or (user_b = ${context.userId} and user_a = ${toId})
      limit 1
    `;
    if (!pal[0]) throw new Error("Not friends.");
    const day = new Date().toISOString().slice(0, 10);
    const had = await sql<{ to_id: string }>`
      select to_id from friend_gifts where from_id = ${context.userId} and to_id = ${toId} and day = ${day}
    `;
    if (had[0]) throw new Error("Already gifted them today.");
    await sql`insert into friend_gifts (from_id, to_id, day) values (${context.userId}, ${toId}, ${day})`;
    await sql`
      insert into inbox (user_id, title, body, gems)
      values (${toId}, ${"Friend gift"}, ${"A hunter sent you 15 gems."}, ${15})
    `;
    return { ok: true as const };
  });
