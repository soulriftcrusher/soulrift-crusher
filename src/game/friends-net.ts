import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type FriendRow = {
  userId: string;
  name: string;
  power: number;
  maxFloor: number;
  online: boolean;
};

export type FriendAsk = {
  id: number;
  userId: string;
  name: string;
  mine: boolean;
};

export type FriendsSnap = {
  friends: FriendRow[];
  incoming: FriendAsk[];
  outgoing: FriendAsk[];
};

function pair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

type Sql = Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>;

async function loadFriends(sql: Sql, userId: string): Promise<FriendsSnap> {
  const rows = await sql<{ user_id: string; name: string; power: number; max_floor: number; last_seen: string }>`
    select c.user_id, c.name, c.power, c.max_floor, c.last_seen
    from crusaders c
    join friendships f on (f.user_a = c.user_id or f.user_b = c.user_id)
    where (f.user_a = ${userId} or f.user_b = ${userId}) and c.user_id <> ${userId}
  `;
  const seen = Date.now() - 3 * 60 * 1000;
  const friends: FriendRow[] = rows.map((r) => ({
    userId: r.user_id,
    name: r.name,
    power: Number(r.power),
    maxFloor: Number(r.max_floor),
    online: Date.parse(String(r.last_seen)) > seen,
  }));
  friends.sort((a, b) => Number(b.online) - Number(a.online) || b.power - a.power);

  const asks = await sql<{ id: number; from_id: string; to_id: string; fname: string; tname: string }>`
    select r.id, r.from_id, r.to_id,
      coalesce(a.name, 'Hunter') as fname,
      coalesce(b.name, 'Hunter') as tname
    from friend_requests r
    left join crusaders a on a.user_id = r.from_id
    left join crusaders b on b.user_id = r.to_id
    where r.status = 'pending' and (r.from_id = ${userId} or r.to_id = ${userId})
    order by r.created_at desc
  `;
  const incoming: FriendAsk[] = [];
  const outgoing: FriendAsk[] = [];
  for (const r of asks) {
    if (r.to_id === userId) incoming.push({ id: Number(r.id), userId: r.from_id, name: r.fname, mine: false });
    else outgoing.push({ id: Number(r.id), userId: r.to_id, name: r.tname, mine: true });
  }
  return { friends, incoming, outgoing };
}

async function becomeFriends(sql: Sql, a: string, b: string) {
  const [x, y] = pair(a, b);
  await sql`
    insert into friendships (user_a, user_b) values (${x}, ${y})
    on conflict do nothing
  `;
  await sql`
    update friend_requests set status = 'accepted'
    where status = 'pending'
      and ((from_id = ${a} and to_id = ${b}) or (from_id = ${b} and to_id = ${a}))
  `;
}

export const fetchFriends = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<FriendsSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    return loadFriends(sql, context.userId);
  });

export const sendFriendRequest = createServerFn({ method: "POST" })
  .validator((d: { toId?: string; name?: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<FriendsSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const { assertNotBanned } = await import("./net");
    await assertNotBanned(sql, context.userId);
    let toId = String(data.toId ?? "").trim();
    const name = String(data.name ?? "")
      .trim()
      .slice(0, 24);
    if (!toId && name) {
      const hit = await sql<{ user_id: string }>`
        select user_id from crusaders where lower(name) = ${name.toLowerCase()} limit 1
      `;
      toId = hit[0]?.user_id ?? "";
      if (!toId) throw new Error("No hunter by that name.");
    }
    if (!toId) throw new Error("Pick a hunter.");
    if (toId === context.userId) throw new Error("You already have you.");
    const [x, y] = pair(context.userId, toId);
    const already = await sql<{ n: number }>`
      select count(*)::int as n from friendships where user_a = ${x} and user_b = ${y}
    `;
    if (Number(already[0]?.n ?? 0) > 0) throw new Error("Already friends.");
    const back = await sql<{ id: number }>`
      select id from friend_requests
      where from_id = ${toId} and to_id = ${context.userId} and status = 'pending'
      limit 1
    `;
    if (back[0]) {
      await becomeFriends(sql, context.userId, toId);
      return loadFriends(sql, context.userId);
    }
    await sql`
      insert into friend_requests (from_id, to_id, status)
      values (${context.userId}, ${toId}, 'pending')
      on conflict (from_id, to_id) do update set status = 'pending', created_at = now()
    `;
    return loadFriends(sql, context.userId);
  });

export const acceptFriend = createServerFn({ method: "POST" })
  .validator((d: { id: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<FriendsSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const row = await sql<{ from_id: string; to_id: string }>`
      select from_id, to_id from friend_requests
      where id = ${data.id} and to_id = ${context.userId} and status = 'pending'
    `;
    if (!row[0]) throw new Error("No request.");
    await becomeFriends(sql, row[0].from_id, row[0].to_id);
    return loadFriends(sql, context.userId);
  });

export const acceptAllFriends = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<FriendsSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ from_id: string; to_id: string }>`
      select from_id, to_id from friend_requests
      where to_id = ${context.userId} and status = 'pending'
    `;
    for (const r of rows) await becomeFriends(sql, r.from_id, r.to_id);
    return loadFriends(sql, context.userId);
  });

export const declineFriend = createServerFn({ method: "POST" })
  .validator((d: { id: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<FriendsSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      update friend_requests set status = 'declined'
      where id = ${data.id} and (to_id = ${context.userId} or from_id = ${context.userId}) and status = 'pending'
    `;
    return loadFriends(sql, context.userId);
  });

export const removeFriend = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<FriendsSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const [x, y] = pair(context.userId, data.userId);
    await sql`delete from friendships where user_a = ${x} and user_b = ${y}`;
    return loadFriends(sql, context.userId);
  });
