import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { pgInt, pgReal } from "@/lib/pg-num";

export type ClanRole = "founder" | "officer" | "elder" | "member";

export type ClanMemberSnap = {
  userId: string;
  name: string;
  role: ClanRole;
  power: number;
  maxFloor: number;
  raidDamage: number;
  avatar: string;
  lastSeen: string | null;
};

export type ClanSnap = {
  id: number;
  name: string;
  tag: string;
  code: string;
  influence: number;
  science: number;
  raidWave: number;
  raidHp: number;
  raidMax: number;
  memberCount: number;
  blurb: string;
  crest: string;
  loc: string;
  open: boolean;
  minFloor: number;
  createdAt: string | null;
};

export type RivalSnap = {
  userId: string;
  name: string;
  power: number;
  maxFloor: number;
  clanTag: string | null;
  avatar: string;
};

export type BoardClan = {
  id: number;
  name: string;
  tag: string;
  influence: number;
  members: number;
};

export type WorldSnap = {
  name: string;
  power: number;
  maxFloor: number;
  online: number;
  avatar: string;
  raidReadyIn: number;
  duelReadyIn: number;
  clan: ClanSnap | null;
  members: ClanMemberSnap[];
  rivals: RivalSnap[];
  board: BoardClan[];
  kicked?: boolean;
};

const PAYLOAD_MAX = 400_000;
const RAID_CD = 90;
const DUEL_CD = 45;

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

function raidHpFor(members: number, wave: number): number {
  const n = Math.max(1, members);
  return Math.max(80, Math.floor(420 * n * Math.pow(1.42, Math.max(0, wave - 1))));
}

function cooldownLeft(at: string | Date | null | undefined, cd: number): number {
  if (!at) return 0;
  const t = typeof at === "string" ? Date.parse(at) : at.getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, cd - (Date.now() - t) / 1000);
}

type Sql = Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>;

let worldSchema = false;
async function ensureWorldSchema(sql: Sql) {
  if (worldSchema) return;
  await sql`alter table crusaders add column if not exists avatar text not null default 'kael'`.catch(() => undefined);
  await sql`alter table clans add column if not exists blurb text not null default ''`.catch(() => undefined);
  await sql`alter table clans add column if not exists crest text not null default 'axe'`.catch(() => undefined);
  await sql`alter table clans add column if not exists loc text not null default 'USA'`.catch(() => undefined);
  await sql`alter table clans add column if not exists open boolean not null default true`.catch(() => undefined);
  await sql`alter table clans add column if not exists min_floor integer not null default 1`.catch(() => undefined);
  await sql`alter table clans add column if not exists science double precision not null default 0`.catch(() => undefined);
  worldSchema = true;
}

export async function assertNotBanned(sql: Sql, userId: string) {
  const row = await sql<{ user_id: string }>`select user_id from bans where user_id = ${userId} limit 1`;
  if (row[0]) throw new Error("This hunter is banned.");
}

async function ensureCrusader(
  sql: Sql,
  userId: string,
  patch?: { name?: string; power?: number; maxFloor?: number; avatar?: string },
) {
  await assertNotBanned(sql, userId);
  const name = cleanName(patch?.name);
  const power = clampPower(patch?.power ?? 0);
  const maxFloor = clampFloor(patch?.maxFloor ?? 1);
  const avatar = String(patch?.avatar ?? "").slice(0, 24);
  await ensureWorldSchema(sql);
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

function asStaff(sql: Sql, userId: string) {
  return sql<{ user_id: string }>`select user_id from staff where user_id = ${userId} limit 1`;
}

async function loadWorld(sql: Sql, userId: string): Promise<WorldSnap> {
  await ensureWorldSchema(sql);
  const meRows = await sql<{
    name: string;
    power: number;
    max_floor: number;
    clan_id: number | null;
    last_raid_at: string | null;
    last_duel_at: string | null;
    avatar: string | null;
  }>`
    select name, power, max_floor, clan_id, last_raid_at, last_duel_at, avatar
    from crusaders where user_id = ${userId}
  `;
  const me = meRows[0];
  const online = await sql<{ n: number }>`
    select count(*)::int as n from crusaders where last_seen > now() - interval '2 minutes'
  `;
  const rivals = await sql<{
    user_id: string;
    name: string;
    power: number;
    max_floor: number;
    tag: string | null;
    avatar: string | null;
  }>`
    select c.user_id, c.name, c.power, c.max_floor, cl.tag, c.avatar
    from crusaders c
    left join clans cl on cl.id = c.clan_id
    where c.user_id <> ${userId} and c.last_seen > now() - interval '30 minutes'
    order by c.power desc
    limit 12
  `;
  const board = await sql<{ id: number; name: string; tag: string; influence: number; members: number }>`
    select cl.id, cl.name, cl.tag, cl.influence, count(m.user_id)::int as members
    from clans cl
    left join clan_members m on m.clan_id = cl.id
    group by cl.id
    order by cl.influence desc
    limit 8
  `;
  let clan: ClanSnap | null = null;
  let members: ClanMemberSnap[] = [];
  if (me?.clan_id) {
    const rows = await sql<{
      id: number;
      name: string;
      tag: string;
      code: string;
      influence: number;
      raid_wave: number;
      raid_hp: number;
      raid_max: number;
      blurb: string | null;
      crest: string | null;
      loc: string | null;
      open: boolean | null;
      min_floor: number | null;
      science: number | null;
      created_at: string | null;
    }>`
      select id, name, tag, code, influence, raid_wave, raid_hp, raid_max,
        blurb, crest, loc, open, min_floor, science, created_at
      from clans where id = ${me.clan_id}
    `;
    const c = rows[0];
    if (c) {
      const mem = await sql<{
        user_id: string;
        name: string;
        role: string;
        power: number;
        max_floor: number;
        raid_damage: number;
        avatar: string | null;
        last_seen: string | null;
      }>`
        select m.user_id, c.name, m.role, c.power, c.max_floor, m.raid_damage, c.avatar, c.last_seen
        from clan_members m
        join crusaders c on c.user_id = m.user_id
        where m.clan_id = ${c.id}
        order by
          case m.role when 'founder' then 0 when 'officer' then 1 when 'elder' then 2 else 3 end,
          c.power desc
      `;
      members = mem.map((m) => ({
        userId: m.user_id,
        name: m.name,
        role: (m.role as ClanRole) || "member",
        power: Number(m.power),
        maxFloor: Number(m.max_floor),
        raidDamage: Number(m.raid_damage),
        avatar: m.avatar || "kael",
        lastSeen: m.last_seen,
      }));
      clan = {
        id: Number(c.id),
        name: c.name,
        tag: c.tag,
        code: c.code,
        influence: Number(c.influence),
        science: Number(c.science ?? 0),
        raidWave: Number(c.raid_wave),
        raidHp: Number(c.raid_hp),
        raidMax: Number(c.raid_max),
        memberCount: members.length,
        blurb: c.blurb ?? "",
        crest: c.crest || "axe",
        loc: c.loc || "USA",
        open: c.open !== false,
        minFloor: Math.max(1, Number(c.min_floor ?? 1)),
        createdAt: c.created_at,
      };
    }
  }
  return {
    name: me?.name ?? "Crusader",
    power: Number(me?.power ?? 0),
    maxFloor: Number(me?.max_floor ?? 1),
    online: Number(online[0]?.n ?? 1),
    avatar: me?.avatar || "kael",
    raidReadyIn: cooldownLeft(me?.last_raid_at, RAID_CD),
    duelReadyIn: cooldownLeft(me?.last_duel_at, DUEL_CD),
    clan,
    members,
    rivals: rivals.map((r) => ({
      userId: r.user_id,
      name: r.name,
      power: Number(r.power),
      maxFloor: Number(r.max_floor),
      clanTag: r.tag,
      avatar: r.avatar || "kael",
    })),
    board: board.map((b) => ({
      id: Number(b.id),
      name: b.name,
      tag: b.tag,
      influence: Number(b.influence),
      members: Number(b.members),
    })),
  };
}

export const heartbeat = createServerFn({ method: "POST" })
  .validator((d: { name: string; power: number; maxFloor: number; avatar?: string; device?: string; steal?: boolean }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<WorldSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureCrusader(sql, context.userId, data);
    const { takeSeat } = await import("./seat.server");
    const seat = await takeSeat(sql, context.userId, data.device ?? "", Boolean(data.steal));
    if (seat === "kicked") {
      return {
        kicked: true,
        name: "",
        power: 0,
        maxFloor: 1,
        online: 0,
        avatar: "kael",
        raidReadyIn: 0,
        duelReadyIn: 0,
        clan: null,
        members: [],
        rivals: [],
        board: [],
      };
    }
    const { ensureShard } = await import("./shard-net");
    await ensureShard(sql, context.userId);
    return loadWorld(sql, context.userId);
  });

export const pulse = createServerFn({ method: "POST" })
  .validator((d: { name: string; power: number; maxFloor: number; avatar?: string; device?: string; steal?: boolean }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureCrusader(sql, context.userId, data);
    const { takeSeat } = await import("./seat.server");
    const seat = await takeSeat(sql, context.userId, data.device ?? "", Boolean(data.steal));
    if (seat === "kicked") return { online: 0, kicked: true as const };
    const online = await sql<{ n: number }>`
      select count(*)::int as n from crusaders where last_seen > now() - interval '2 minutes'
    `;
    return { online: Number(online[0]?.n ?? 1), kicked: false as const };
  });

export const setHuntName = createServerFn({ method: "POST" })
  .validator((d: { name: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const name = cleanName(data.name);
    if (name.length < 2) throw new Error("Name is too short.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await assertNotBanned(sql, context.userId);
    const taken = await sql<{ user_id: string }>`
      select user_id from crusaders where lower(name) = ${name.toLowerCase()} and user_id <> ${context.userId} limit 1
    `;
    if (taken[0]) throw new Error("That name is taken.");
    await sql`
      insert into crusaders (user_id, name, last_seen)
      values (${context.userId}, ${name}, now())
      on conflict (user_id) do update set name = excluded.name, last_seen = now()
    `;
    return { name };
  });

function clanCode(): string {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

export const createClan = createServerFn({ method: "POST" })
  .validator((d: { name: string; tag: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<WorldSnap> => {
    const name = String(data.name ?? "")
      .replace(/[^\w \-']/g, "")
      .trim()
      .slice(0, 18);
    const tag = String(data.tag ?? "")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 5);
    if (name.length < 3) throw new Error("Name the banner.");
    if (tag.length < 3) throw new Error("Need a 3–5 letter tag.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureCrusader(sql, context.userId);
    const mine = await sql<{ clan_id: number | null }>`select clan_id from crusaders where user_id = ${context.userId}`;
    if (mine[0]?.clan_id) throw new Error("Leave your banner first.");
    const code = clanCode();
    const made = await sql<{ id: number }>`
      insert into clans (name, tag, code, founder_id, raid_wave, raid_hp, raid_max)
      values (${name}, ${tag}, ${code}, ${context.userId}, 1, ${raidHpFor(1, 1)}, ${raidHpFor(1, 1)})
      returning id
    `.catch(() => [] as { id: number }[]);
    if (!made[0]) throw new Error("Name or tag is taken.");
    const clanId = Number(made[0]!.id);
    await sql`insert into clan_members (clan_id, user_id, role) values (${clanId}, ${context.userId}, ${"founder"})`;
    await sql`update crusaders set clan_id = ${clanId} where user_id = ${context.userId}`;
    return loadWorld(sql, context.userId);
  });

export const joinClan = createServerFn({ method: "POST" })
  .validator((d: { code: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<WorldSnap> => {
    const code = String(data.code ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureCrusader(sql, context.userId);
    const mine = await sql<{ clan_id: number | null }>`select clan_id from crusaders where user_id = ${context.userId}`;
    if (mine[0]?.clan_id) throw new Error("Leave your banner first.");
    const hit = await sql<{ id: number; open: boolean | null; min_floor: number | null }>`
      select id, open, min_floor from clans where code = ${code} limit 1
    `;
    if (!hit[0]) throw new Error("No clan with that code.");
    if (hit[0].open === false) throw new Error("That clan is closed. Request from Find a clan.");
    const mineFloor = await sql<{ max_floor: number }>`select max_floor from crusaders where user_id = ${context.userId}`;
    if (Number(mineFloor[0]?.max_floor ?? 1) < Number(hit[0].min_floor ?? 1)) {
      throw new Error(`Need floor ${hit[0].min_floor} to join.`);
    }
    const clanId = Number(hit[0].id);
    const n = await sql<{ n: number }>`select count(*)::int as n from clan_members where clan_id = ${clanId}`;
    if (Number(n[0]?.n ?? 0) >= 30) throw new Error("That clan is full.");
    await sql`insert into clan_members (clan_id, user_id, role) values (${clanId}, ${context.userId}, ${"member"}) on conflict do nothing`;
    await sql`update crusaders set clan_id = ${clanId} where user_id = ${context.userId}`;
    return loadWorld(sql, context.userId);
  });

export const requestClan = createServerFn({ method: "POST" })
  .validator((d: { clanId: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<WorldSnap> => {
    const clanId = Math.floor(Number(data.clanId) || 0);
    if (clanId < 1) throw new Error("Pick a clan.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureCrusader(sql, context.userId);
    const mine = await sql<{ clan_id: number | null }>`select clan_id from crusaders where user_id = ${context.userId}`;
    if (mine[0]?.clan_id) throw new Error("Leave your banner first.");
    const hit = await sql<{ id: number; open: boolean | null; min_floor: number | null }>`
      select id, open, min_floor from clans where id = ${clanId} limit 1
    `;
    if (!hit[0]) throw new Error("That clan is gone.");
    const mineFloor = await sql<{ max_floor: number }>`select max_floor from crusaders where user_id = ${context.userId}`;
    if (Number(mineFloor[0]?.max_floor ?? 1) < Number(hit[0].min_floor ?? 1)) {
      throw new Error(`Need floor ${hit[0].min_floor} to join.`);
    }
    const n = await sql<{ n: number }>`select count(*)::int as n from clan_members where clan_id = ${clanId}`;
    if (Number(n[0]?.n ?? 0) >= 30) throw new Error("That clan is full.");
    await sql`insert into clan_members (clan_id, user_id, role) values (${clanId}, ${context.userId}, ${"member"}) on conflict do nothing`;
    await sql`update crusaders set clan_id = ${clanId} where user_id = ${context.userId}`;
    return loadWorld(sql, context.userId);
  });

export const leaveClan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<WorldSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mem = await sql<{ clan_id: number; role: string }>`
      select clan_id, role from clan_members where user_id = ${context.userId}
    `;
    if (mem[0]?.role === "founder") {
      const others = await sql<{ n: number }>`
        select count(*)::int as n from clan_members where clan_id = ${mem[0].clan_id} and user_id <> ${context.userId}
      `;
      if (Number(others[0]?.n ?? 0) > 0) {
        throw new Error("Hand the banner off first — founders cannot abandon a living clan.");
      }
      await sql`delete from clans where id = ${mem[0].clan_id}`;
    } else if (mem[0]) {
      await sql`delete from clan_members where clan_id = ${mem[0].clan_id} and user_id = ${context.userId}`;
    }
    await sql`update crusaders set clan_id = null where user_id = ${context.userId}`;
    return loadWorld(sql, context.userId);
  });

export const strikeRaid = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const me = await sql<{ clan_id: number | null; last_raid_at: string | null; power: number; max_floor: number }>`
      select clan_id, last_raid_at, power, max_floor from crusaders where user_id = ${context.userId}
    `;
    if (!me[0]?.clan_id) throw new Error("Join a clan first.");
    if (cooldownLeft(me[0].last_raid_at, RAID_CD) > 0) throw new Error("The raid is still cooling.");
    const clan = await sql<{ id: number; raid_wave: number; raid_hp: number; raid_max: number; influence: number }>`
      select id, raid_wave, raid_hp, raid_max, influence from clans where id = ${me[0].clan_id}
    `;
    if (!clan[0]) throw new Error("Banner is gone.");
    let hp = Number(clan[0].raid_hp);
    let max = Number(clan[0].raid_max);
    let wave = Number(clan[0].raid_wave);
    if (hp <= 0 || max <= 0) {
      const count = await sql<{ n: number }>`select count(*)::int as n from clan_members where clan_id = ${clan[0].id}`;
      max = raidHpFor(Number(count[0]?.n ?? 1), wave);
      hp = max;
    }
    const power = Math.max(0, Number(me[0].power) || 0);
    const dealt = Math.max(
      8,
      Math.floor((Math.log10(1 + power) * 220 + Number(me[0].max_floor) * 8) * (0.85 + Math.random() * 0.3)),
    );
    hp = Math.max(0, hp - dealt);
    const killed = hp <= 0;
    let influence = 2 + Math.min(40, Math.floor(dealt / 80));
    let gold = Math.floor(8 * Number(me[0].max_floor) * (0.3 + Math.random() * 0.4));
    let souls = killed ? 1 : Math.random() < 0.25 ? 1 : 0;
    let chests = killed && Math.random() < 0.2 ? 1 : 0;
    if (killed) {
      wave += 1;
      const count = await sql<{ n: number }>`select count(*)::int as n from clan_members where clan_id = ${clan[0].id}`;
      max = raidHpFor(Number(count[0]?.n ?? 1), wave);
      hp = max;
      influence += 8;
    }
    await sql`
      update clans set raid_hp = ${pgReal(hp)}::float8, raid_max = ${pgReal(max)}::float8, raid_wave = ${wave},
        influence = influence + ${pgInt(influence)}::bigint,
        science = science + ${pgInt(Math.max(1, Math.floor(influence * 0.6)))}::float8
      where id = ${clan[0].id}
    `;
    await sql`
      update clan_members set raid_damage = raid_damage + ${pgReal(dealt)}::float8
      where clan_id = ${clan[0].id} and user_id = ${context.userId}
    `;
    await sql`update crusaders set last_raid_at = now() where user_id = ${context.userId}`;
    return { damage: dealt, killed, gold, souls, influence, chests, raidHp: hp, raidMax: max };
  });

export const challengeCrusader = createServerFn({ method: "POST" })
  .validator((d: { defenderId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const defenderId = String(data.defenderId ?? "");
    if (!defenderId || defenderId === context.userId) throw new Error("Pick a hunter.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await assertNotBanned(sql, context.userId);
    const you = await sql<{ power: number; max_floor: number; last_duel_at: string | null; name: string }>`
      select power, max_floor, last_duel_at, name from crusaders where user_id = ${context.userId}
    `;
    const them = await sql<{ power: number; max_floor: number; name: string }>`
      select power, max_floor, name from crusaders where user_id = ${defenderId}
    `;
    if (!you[0] || !them[0]) throw new Error("They left the rift.");
    if (cooldownLeft(you[0].last_duel_at, DUEL_CD) > 0) throw new Error("The pit is still cooling.");
    const yourPower = Number(you[0].power) * (0.9 + Math.random() * 0.2);
    const theirPower = Number(them[0].power) * (0.9 + Math.random() * 0.2);
    const win = yourPower >= theirPower;
    const influence = win ? 10 + Math.floor(Number(you[0].max_floor) / 4) : 2;
    const souls = win ? 2 : 0;
    const gold = win ? Math.floor(30 * Number(you[0].max_floor)) : Math.floor(12 * Number(you[0].max_floor));
    const chests = win && Math.random() < 0.18 ? 1 : 0;
    await sql`insert into duels (attacker_id, defender_id, win) values (${context.userId}, ${defenderId}, ${win})`;
    await sql`update crusaders set last_duel_at = now() where user_id = ${context.userId}`;
    return {
      win,
      foe: them[0].name,
      yourPower,
      theirPower,
      gold,
      souls,
      influence,
      chests,
    };
  });

export const pullCloudSave = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await assertNotBanned(sql, context.userId);
    const rows = await sql<{ payload: string; updated_at: string }>`
      select payload, updated_at from game_saves where user_id = ${context.userId}
    `;
    const grants = await sql<{ gems: number }>`
      select gems from gem_grants where user_id = ${context.userId}
    `;
    const gifts = await sql<{ gold: number; souls: number; gems: number; chests: number }>`
      select gold, souls, gems, chests from staff_gifts where user_id = ${context.userId}
    `.catch(() => [] as { gold: number; souls: number; gems: number; chests: number }[]);
    const gems = Math.max(0, Number(grants[0]?.gems ?? 0) + Number(gifts[0]?.gems ?? 0));
    const gold = Math.max(0, Number(gifts[0]?.gold ?? 0));
    const souls = Math.max(0, Number(gifts[0]?.souls ?? 0));
    const chests = Math.max(0, Number(gifts[0]?.chests ?? 0));
    if (gems > 0) await sql`update gem_grants set gems = 0 where user_id = ${context.userId}`;
    if (gifts[0]) {
      await sql`update staff_gifts set gold = 0, souls = 0, gems = 0, chests = 0 where user_id = ${context.userId}`.catch(
        () => undefined,
      );
    }
    return {
      payload: rows[0]?.payload ?? null,
      updatedAt: rows[0]?.updated_at ?? null,
      grantGems: gems,
      grantGold: gold,
      grantSouls: souls,
      grantChests: chests,
    };
  });

export const pushCloudSave = createServerFn({ method: "POST" })
  .validator((d: { payload: string; device?: string; steal?: boolean }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const raw = String(data.payload ?? "");
    if (!raw || raw.length > PAYLOAD_MAX) throw new Error("Save is too large.");
    JSON.parse(raw);
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await assertNotBanned(sql, context.userId);
    const { takeSeat } = await import("./seat.server");
    const seat = await takeSeat(sql, context.userId, data.device ?? "", Boolean(data.steal));
    if (seat === "kicked") return { ok: false as const, kicked: true as const };
    const { applyIncoming, mergeProgress } = await import("./save");
    const incoming = applyIncoming(JSON.parse(raw));
    const have = await sql<{ payload: string }>`select payload from game_saves where user_id = ${context.userId}`;
    const merged = have[0]?.payload
      ? mergeProgress(applyIncoming(JSON.parse(have[0].payload)), incoming)
      : incoming;
    const payload = JSON.stringify(merged);
    await sql`
      insert into game_saves (user_id, payload, updated_at)
      values (${context.userId}, ${payload}, now())
      on conflict (user_id) do update set payload = excluded.payload, updated_at = now()
    `;
    return { ok: true as const, kicked: false as const };
  });

export const pullHeroRoster = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ hero_id: string; level: number; gild: number; prestige: number; craft: number; down_until: number }>`
      select hero_id, level, gild, prestige, craft, coalesce(down_until, 0) as down_until from hero_progress where user_id = ${context.userId}
    `;
    return {
      roster: rows.map((r) => ({
        id: r.hero_id,
        level: Number(r.level),
        gild: Number(r.gild),
        prestige: Number(r.prestige),
        craft: Number(r.craft),
        down: Number(r.down_until ?? 0),
      })),
    };
  });

export const pushHeroRoster = createServerFn({ method: "POST" })
  .validator((d: { roster: { id: string; level: number; gild: number; prestige: number; craft: number; down?: number }[] }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const roster = Array.isArray(data.roster) ? data.roster : [];
    for (const row of roster) {
      const id = String(row.id ?? "").slice(0, 24);
      if (!id) continue;
      const level = Math.max(0, Math.min(10000, Math.floor(Number(row.level) || 0)));
      const gild = Math.max(0, Math.min(1e9, Math.floor(Number(row.gild) || 0)));
      const prestige = Math.max(0, Math.min(1000, Math.floor(Number(row.prestige) || 0)));
      const craft = Math.max(0, Math.min(20, Math.floor(Number(row.craft) || 0)));
      const down = Math.max(0, Math.floor(Number(row.down) || 0));
      await sql`
        insert into hero_progress (user_id, hero_id, level, gild, prestige, craft, down_until, updated_at)
        values (${context.userId}, ${id}, ${level}, ${gild}, ${prestige}, ${craft}, ${down}, now())
        on conflict (user_id, hero_id) do update set
          level = greatest(hero_progress.level, excluded.level),
          gild = greatest(hero_progress.gild, excluded.gild),
          prestige = greatest(hero_progress.prestige, excluded.prestige),
          craft = greatest(hero_progress.craft, excluded.craft),
          down_until = excluded.down_until,
          updated_at = now()
      `;
    }
    return { ok: true as const };
  });

export const importHuntPack = createServerFn({ method: "POST" })
  .validator((d: { payload: string; roster?: { id: string; level: number; gild: number; prestige: number; craft: number; down?: number }[] }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const raw = String(data.payload ?? "");
    if (!raw || raw.length > PAYLOAD_MAX) throw new Error("Hunt code is too large.");
    let founder = false;
    try {
      const parsed = JSON.parse(raw) as { founderClaimed?: boolean };
      founder = Boolean(parsed.founderClaimed);
    } catch {
      throw new Error("Hunt code is broken.");
    }
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await assertNotBanned(sql, context.userId);
    await sql`
      insert into game_saves (user_id, payload, updated_at)
      values (${context.userId}, ${raw}, now())
      on conflict (user_id) do update set payload = excluded.payload, updated_at = now()
    `;
    const roster = Array.isArray(data.roster) ? data.roster : [];
    for (const row of roster) {
      const id = String(row.id ?? "").slice(0, 24);
      if (!id) continue;
      const level = Math.max(0, Math.min(10000, Math.floor(Number(row.level) || 0)));
      const gild = Math.max(0, Math.min(1e9, Math.floor(Number(row.gild) || 0)));
      const prestige = Math.max(0, Math.min(1000, Math.floor(Number(row.prestige) || 0)));
      const craft = Math.max(0, Math.min(20, Math.floor(Number(row.craft) || 0)));
      const down = Math.max(0, Math.floor(Number(row.down) || 0));
      await sql`
        insert into hero_progress (user_id, hero_id, level, gild, prestige, craft, down_until, updated_at)
        values (${context.userId}, ${id}, ${level}, ${gild}, ${prestige}, ${craft}, ${down}, now())
        on conflict (user_id, hero_id) do update set
          level = greatest(hero_progress.level, excluded.level),
          gild = greatest(hero_progress.gild, excluded.gild),
          prestige = greatest(hero_progress.prestige, excluded.prestige),
          craft = greatest(hero_progress.craft, excluded.craft),
          down_until = excluded.down_until,
          updated_at = now()
      `;
    }
    if (founder) {
      await sql`delete from staff`;
      await sql`insert into staff (user_id, role) values (${context.userId}, 'admin')`;
    }
    return { ok: true as const };
  });

export const staffStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await asStaff(sql, context.userId);
    const living = await sql<{ n: number }>`
      select count(*)::int as n from staff s
      inner join "user" u on u.id = s.user_id
    `;
    const live = Number(living[0]?.n ?? 0);
    return {
      isStaff: Boolean(mine[0]),
      canClaim: live === 0,
    };
  });

export const claimStaff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await asStaff(sql, context.userId);
    if (mine[0]) return { ok: true as const, isStaff: true };
    const living = await sql<{ n: number }>`
      select count(*)::int as n from staff s
      inner join "user" u on u.id = s.user_id
    `;
    if (Number(living[0]?.n ?? 0) > 0) throw new Error("Staff seat is already taken.");
    await sql`delete from staff`;
    await sql`insert into staff (user_id, role) values (${context.userId}, 'admin')`;
    return { ok: true as const, isStaff: true };
  });

export const staffRoster = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await asStaff(sql, context.userId);
    if (!mine[0]) throw new Error("Staff only.");
    const rows = await sql<{
      user_id: string;
      name: string;
      power: number;
      max_floor: number;
      last_seen: string;
      banned: boolean;
      shard_id: string | null;
    }>`
      select c.user_id, c.name, c.power, c.max_floor, c.last_seen,
        (b.user_id is not null) as banned,
        m.shard_id
      from crusaders c
      left join bans b on b.user_id = c.user_id
      left join shard_members m on m.user_id = c.user_id
      order by c.last_seen desc
      limit 5000
    `;
    const { SHARDS } = await import("./shards");
    return rows.map((r) => {
      const shard = SHARDS.find((s) => s.id === r.shard_id);
      return {
        userId: r.user_id,
        name: r.name,
        power: Number(r.power),
        maxFloor: Number(r.max_floor),
        lastSeen: r.last_seen,
        banned: Boolean(r.banned),
        shardId: r.shard_id ?? "",
        shardName: shard?.name ?? "No server",
        shardTag: shard?.tag ?? "—",
      };
    });
  });

export const staffGrantGems = createServerFn({ method: "POST" })
  .validator((d: { userId: string; gems: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await asStaff(sql, context.userId);
    if (!mine[0]) throw new Error("Staff only.");
    const target = String(data.userId ?? "").slice(0, 80);
    const gems = Math.max(1, Math.min(5000, Math.floor(Number(data.gems) || 0)));
    if (!target) throw new Error("Pick a crusader.");
    await sql`
      insert into gem_grants (user_id, gems)
      values (${target}, ${gems})
      on conflict (user_id) do update set gems = gem_grants.gems + excluded.gems
    `;
    const { notifyUser } = await import("./push.server");
    void notifyUser(target, {
      title: "Staff gift",
      body: `${gems} gems landed in your coffer.`,
      url: "/",
    }).catch(() => undefined);
    return { ok: true as const, gems };
  });

export const staffBan = createServerFn({ method: "POST" })
  .validator((d: { userId: string; reason?: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await asStaff(sql, context.userId);
    if (!mine[0]) throw new Error("Staff only.");
    const target = String(data.userId ?? "").slice(0, 80);
    if (!target || target === context.userId) throw new Error("You cannot ban yourself.");
    const reason = String(data.reason ?? "Banned").slice(0, 80);
    await sql`
      insert into bans (user_id, reason, by_id) values (${target}, ${reason}, ${context.userId})
      on conflict (user_id) do update set reason = excluded.reason, by_id = excluded.by_id, created_at = now()
    `;
    return { ok: true as const };
  });

export const staffUnban = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await asStaff(sql, context.userId);
    if (!mine[0]) throw new Error("Staff only.");
    await sql`delete from bans where user_id = ${String(data.userId ?? "").slice(0, 80)}`;
    return { ok: true as const };
  });

export const staffSetPassword = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await asStaff(sql, context.userId);
    if (!mine[0]) throw new Error("Staff only.");
    const email = String(data.email ?? "").trim().toLowerCase();
    const password = String(data.password ?? "");
    if (!email.includes("@")) throw new Error("Hunter email.");
    if (password.length < 8) throw new Error("New password needs 8+ letters.");
    const { auth } = await import("@/lib/auth/server");
    const ctx = await auth.$context;
    const hash = await ctx.password.hash(password);
    const users = await sql<{ id: string }>`
      select id from "user" where lower(email) = ${email} limit 1
    `;
    if (!users[0]) throw new Error("No hunter with that email.");
    const id = users[0].id;
    const have = await sql<{ id: string }>`
      select id from account where "userId" = ${id} and "providerId" = 'credential' limit 1
    `;
    if (have[0]) {
      await sql`update account set password = ${hash}, "updatedAt" = now() where id = ${have[0].id}`;
    } else {
      const accId = `cred_${id.slice(0, 18)}`;
      await sql`
        insert into account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
        values (${accId}, ${id}, 'credential', ${id}, ${hash}, now(), now())
      `;
    }
    return { ok: true as const, email };
  });

export const staffGift = createServerFn({ method: "POST" })
  .validator((d: { userId: string; gold?: number; souls?: number; gems?: number; chests?: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await asStaff(sql, context.userId);
    if (!mine[0]) throw new Error("Staff only.");
    const target = String(data.userId ?? "").slice(0, 80);
    if (!target) throw new Error("Pick a crusader.");
    const gold = Math.max(0, Math.min(1e12, Math.floor(Number(data.gold) || 0)));
    const souls = Math.max(0, Math.min(50000, Math.floor(Number(data.souls) || 0)));
    const gems = Math.max(0, Math.min(5000, Math.floor(Number(data.gems) || 0)));
    const chests = Math.max(0, Math.min(200, Math.floor(Number(data.chests) || 0)));
    if (gold + souls + gems + chests <= 0) throw new Error("Pick a gift.");
    await sql`
      insert into staff_gifts (user_id, gold, souls, gems, chests)
      values (${target}, ${gold}, ${souls}, ${gems}, ${chests})
      on conflict (user_id) do update set
        gold = staff_gifts.gold + excluded.gold,
        souls = staff_gifts.souls + excluded.souls,
        gems = staff_gifts.gems + excluded.gems,
        chests = staff_gifts.chests + excluded.chests
    `;
    if (gems > 0) {
      await sql`
        insert into gem_grants (user_id, gems) values (${target}, ${gems})
        on conflict (user_id) do update set gems = gem_grants.gems + excluded.gems
      `;
    }
    return { ok: true as const, gold, souls, gems, chests };
  });

export type HunterProfile = {
  userId: string;
  name: string;
  power: number;
  maxFloor: number;
  kills: number;
  hires: number;
  crafts: number;
  daysPlayed: number;
  arenaWins: number;
  bossKills: number;
  avatar: string;
  heroes: { id: string; name: string; level: number; prestige: number }[];
  badges: { id: string; name: string; blurb: string }[];
  banned: boolean;
};

export const fetchHunterProfile = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ data }): Promise<HunterProfile> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const userId = String(data.userId ?? "").slice(0, 80);
    if (!userId) throw new Error("No hunter.");
    const row = await sql<{ name: string; power: number; max_floor: number; avatar: string | null }>`
      select name, power, max_floor, avatar from crusaders where user_id = ${userId} limit 1
    `;
    if (!row[0]) throw new Error("They left the rift.");
    const banned = await sql<{ user_id: string }>`select user_id from bans where user_id = ${userId} limit 1`.catch(
      () => [] as { user_id: string }[],
    );
    const heroes = await sql<{ hero_id: string; level: number; prestige: number }>`
      select hero_id, level, prestige from hero_progress
      where user_id = ${userId} and level > 0
      order by level desc
    `.catch(() => [] as { hero_id: string; level: number; prestige: number }[]);
    const save = await sql<{ payload: string }>`select payload from game_saves where user_id = ${userId}`;
    let kills = 0;
    let hires = heroes.length;
    let crafts = 0;
    let daysPlayed = 1;
    let arenaWins = 0;
    let bossKills = 0;
    const earned = new Set<string>();
    const raw = save[0]?.payload ?? "";
    if (raw) {
      const num = (key: string) => {
        const m = raw.match(new RegExp(`"${key}"\\s*:\\s*([0-9.eE+-]+)`));
        return m ? Number(m[1]) : 0;
      };
      kills = Math.max(0, num("kills"));
      hires = Math.max(hires, num("hires"));
      crafts = Math.max(0, num("crafts"));
      arenaWins = Math.max(0, num("arenaWins"));
      bossKills = Math.max(0, num("bossKills"));
      const started = num("startedAt") || Date.now();
      daysPlayed = Math.max(1, Math.floor((Date.now() - started) / 86400000) + 1);
    }
    if (kills >= 1) earned.add("blood");
    if (kills >= 100) earned.add("sweeper");
    if (kills >= 1000) earned.add("tide");
    if (daysPlayed >= 2) earned.add("dawn");
    if (daysPlayed >= 7) earned.add("week");
    if (crafts >= 10) earned.add("hammer");
    if (crafts >= 50) earned.add("forge");
    if (Number(row[0].max_floor) >= 10) earned.add("depth");
    if (Number(row[0].max_floor) >= 50) earned.add("vault");
    if (hires >= 5) earned.add("warband");
    if (arenaWins >= 1) earned.add("pit");
    if (bossKills >= 10) earned.add("tyrant");
    const { ACHIEVEMENTS } = await import("./achievements");
    const { HEROES } = await import("./data");
    return {
      userId,
      name: row[0].name,
      power: Number(row[0].power),
      maxFloor: Number(row[0].max_floor),
      kills,
      hires,
      crafts,
      daysPlayed,
      arenaWins,
      bossKills,
      avatar: row[0].avatar || heroes[0]?.hero_id || "kael",
      banned: Boolean(banned[0]),
      heroes: heroes.slice(0, 20).map((h) => ({
        id: h.hero_id,
        name: HEROES.find((x) => x.id === h.hero_id)?.name ?? h.hero_id,
        level: Number(h.level),
        prestige: Number(h.prestige),
      })),
      badges: ACHIEVEMENTS.filter((a) => earned.has(a.id)).map((a) => ({
        id: a.id,
        name: a.name,
        blurb: a.blurb,
      })),
    };
  });

export const listClanMail = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const me = await sql<{ clan_id: number | null }>`select clan_id from crusaders where user_id = ${context.userId}`;
    if (!me[0]?.clan_id) return [] as { id: number; name: string; body: string; at: string }[];
    const rows = await sql<{ id: number; name: string; body: string; created_at: string }>`
      select id, name, body, created_at from clan_mail where clan_id = ${me[0].clan_id} order by id desc limit 40
    `;
    return rows.map((r) => ({ id: Number(r.id), name: r.name, body: r.body, at: r.created_at }));
  });

export const sendClanMail = createServerFn({ method: "POST" })
  .validator((d: { body: string; name: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const body = String(data.body ?? "")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, 240);
    if (body.length < 1) throw new Error("Write the mail.");
    const name = String(data.name ?? "Crusader")
      .replace(/[^\w \-']/g, "")
      .trim()
      .slice(0, 24) || "Crusader";
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const me = await sql<{ clan_id: number | null }>`select clan_id from crusaders where user_id = ${context.userId}`;
    if (!me[0]?.clan_id) throw new Error("Join a clan first.");
    await sql`
      insert into clan_mail (clan_id, user_id, name, body)
      values (${me[0].clan_id}, ${context.userId}, ${name}, ${body})
    `;
    const rows = await sql<{ id: number; name: string; body: string; created_at: string }>`
      select id, name, body, created_at from clan_mail where clan_id = ${me[0].clan_id} order by id desc limit 40
    `;
    return rows.map((r) => ({ id: Number(r.id), name: r.name, body: r.body, at: r.created_at }));
  });

export const kickMember = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<WorldSnap> => {
    const target = String(data.userId ?? "");
    if (!target || target === context.userId) throw new Error("Pick a member.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const me = await sql<{ clan_id: number; role: string }>`
      select clan_id, role from clan_members where user_id = ${context.userId}
    `;
    if (!me[0] || (me[0].role !== "founder" && me[0].role !== "officer")) throw new Error("Officers only.");
    const them = await sql<{ role: string }>`
      select role from clan_members where clan_id = ${me[0].clan_id} and user_id = ${target}
    `;
    if (!them[0]) throw new Error("They aren't in the banner.");
    if (them[0].role === "founder") throw new Error("You cannot kick the founder.");
    if (them[0].role === "officer" && me[0].role !== "founder") throw new Error("Only the founder can kick officers.");
    await sql`delete from clan_members where clan_id = ${me[0].clan_id} and user_id = ${target}`;
    await sql`update crusaders set clan_id = null where user_id = ${target}`;
    return loadWorld(sql, context.userId);
  });

export const setMemberRole = createServerFn({ method: "POST" })
  .validator((d: { userId: string; role: "officer" | "elder" | "member" }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<WorldSnap> => {
    const target = String(data.userId ?? "");
    const role = data.role === "officer" || data.role === "elder" ? data.role : "member";
    if (!target) throw new Error("Pick a member.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const me = await sql<{ clan_id: number; role: string }>`
      select clan_id, role from clan_members where user_id = ${context.userId}
    `;
    if (me[0]?.role !== "founder") throw new Error("Founder only.");
    const them = await sql<{ role: string }>`
      select role from clan_members where clan_id = ${me[0].clan_id} and user_id = ${target}
    `;
    if (!them[0] || them[0].role === "founder") throw new Error("Can't change the founder.");
    await sql`update clan_members set role = ${role} where clan_id = ${me[0].clan_id} and user_id = ${target}`;
    return loadWorld(sql, context.userId);
  });

export const updateClan = createServerFn({ method: "POST" })
  .validator((d: { name?: string; tag?: string; blurb?: string; crest?: string; loc?: string; open?: boolean; minFloor?: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<WorldSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const me = await sql<{ clan_id: number; role: string }>`
      select clan_id, role from clan_members where user_id = ${context.userId}
    `;
    if (me[0]?.role !== "founder" && me[0]?.role !== "officer") throw new Error("Leaders only.");
    const clanId = me[0].clan_id;
    const name = String(data.name ?? "")
      .replace(/[^\w \-']/g, "")
      .trim()
      .slice(0, 18);
    const tag = String(data.tag ?? "")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 5);
    const blurb = String(data.blurb ?? "").slice(0, 180);
    const crest = ["axe", "wolf", "rift", "skull", "flame", "moon"].includes(String(data.crest))
      ? String(data.crest)
      : "axe";
    const loc = ["USA", "UK", "EU", "KR", "JP", "AU", "CA", "BR", "WW"].includes(String(data.loc))
      ? String(data.loc)
      : "USA";
    const open = data.open !== false;
    const minFloor = Math.max(1, Math.min(1000, Math.floor(Number(data.minFloor) || 1)));
    if (name.length < 3) throw new Error("Name the banner.");
    if (tag.length < 3) throw new Error("Tag needs 3–5 letters.");
    await sql`
      update clans set name = ${name}, tag = ${tag}, blurb = ${blurb}, crest = ${crest}, loc = ${loc},
        open = ${open}, min_floor = ${minFloor}
      where id = ${clanId}
    `.catch(() => {
      throw new Error("Name or tag is taken.");
    });
    return loadWorld(sql, context.userId);
  });

export const listReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const mine = await asStaff(sql, context.userId);
    if (!mine[0]) throw new Error("Staff only.");
    const rows = await sql<{ id: number; from_id: string; about_id: string; reason: string; created_at: string }>`
      select id, from_id, about_id, reason, created_at from reports order by id desc limit 40
    `;
    const names = await sql<{ user_id: string; name: string }>`select user_id, name from crusaders`;
    const map = new Map(names.map((n) => [n.user_id, n.name]));
    return rows.map((r) => ({
      id: Number(r.id),
      fromId: r.from_id,
      fromName: map.get(r.from_id) ?? r.from_id,
      aboutId: r.about_id,
      aboutName: map.get(r.about_id) ?? r.about_id,
      reason: r.reason,
      at: r.created_at,
    }));
  });

export const queueIap = createServerFn({ method: "POST" })
  .validator((d: { packId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { GEM_PACKS } = await import("./meta");
    const pack = GEM_PACKS.find((p) => p.id === data.packId);
    if (!pack) throw new Error("Unknown pack.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into iap_orders (user_id, pack_id, gems, status)
      values (${context.userId}, ${pack.id}, ${pack.gems}, ${"pending"})
    `;
    return { ok: true as const, pending: true, pack: pack.name, usd: pack.usd };
  });

export type PlunderMark = {
  userId: string;
  name: string;
  power: number;
  maxFloor: number;
  gold: number;
  souls: number;
  shield: boolean;
  npc?: boolean;
};

export const syncStash = createServerFn({ method: "POST" })
  .validator((d: { gold: number; souls: number; shieldUntil: number }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await assertNotBanned(sql, context.userId);
    const gold = Math.max(0, Number(data.gold) || 0);
    const souls = Math.max(0, Number(data.souls) || 0);
    const stashGold = Math.min(gold * 0.02, 1e12);
    const stashSouls = Math.min(souls * 0.02, 1e9);
    const until = Number(data.shieldUntil) || 0;
    await sql`
      insert into crusaders (user_id, name, last_seen, stash_gold, stash_souls, shield_until)
      values (${context.userId}, ${"Crusader"}, now(), ${pgReal(stashGold)}::float8, ${pgReal(stashSouls)}::float8,
        case when ${until} > 0 then to_timestamp(${until / 1000}) else null end)
      on conflict (user_id) do update set
        stash_gold = excluded.stash_gold,
        stash_souls = excluded.stash_souls,
        shield_until = excluded.shield_until,
        last_seen = now()
    `;
    return { ok: true as const };
  });

export const listPlunder = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<PlunderMark[]> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await assertNotBanned(sql, context.userId);
    const rows = await sql<{
      user_id: string;
      name: string;
      power: number;
      max_floor: number;
      stash_gold: number;
      stash_souls: number;
      shield_until: string | null;
    }>`
      select user_id, name, power, max_floor, stash_gold, stash_souls, shield_until
      from crusaders
      where user_id <> ${context.userId}
        and last_seen < now() - interval '2 minutes'
        and (shield_until is null or shield_until < now())
        and (last_plunder_at is null or last_plunder_at < now() - interval '4 hours')
      order by power desc
      limit 12
    `;
    return rows.map((r) => ({
      userId: r.user_id,
      name: r.name,
      power: Number(r.power) || 0,
      maxFloor: Number(r.max_floor) || 1,
      gold: Number(r.stash_gold) || 0,
      souls: Number(r.stash_souls) || 0,
      shield: false,
    }));
  });

export const plunderHunter = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ gold: number; souls: number; name: string }> => {
    const target = String(data.userId ?? "");
    if (!target || target === context.userId) throw new Error("Pick someone else.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await assertNotBanned(sql, context.userId);
    const me = await sql<{ last_plunder_at: string | null }>`
      select last_plunder_at from crusaders where user_id = ${context.userId}
    `;
    if (me[0]?.last_plunder_at) {
      const t = Date.parse(String(me[0].last_plunder_at));
      if (Number.isFinite(t) && Date.now() - t < 4 * 60 * 60 * 1000) throw new Error("Raid is still cooling.");
    }
    const them = await sql<{
      name: string;
      stash_gold: number;
      stash_souls: number;
      shield_until: string | null;
    }>`
      select name, stash_gold, stash_souls, shield_until from crusaders where user_id = ${target}
    `;
    const row = them[0];
    if (!row) throw new Error("They're gone.");
    if (row.shield_until && Date.parse(String(row.shield_until)) > Date.now()) throw new Error("Shielded.");
    const gold = Math.max(12, Math.floor((Number(row.stash_gold) || 0) * 0.35));
    const souls = Math.max(0, Math.floor((Number(row.stash_souls) || 0) * 0.25));
    await sql`
      update crusaders set
        stash_gold = greatest(0, stash_gold - ${pgReal(gold)}::float8),
        stash_souls = greatest(0, stash_souls - ${pgReal(souls)}::float8),
        last_plunder_at = now(),
        shield_until = now() + interval '30 minutes'
      where user_id = ${target}
    `;
    await sql`
      update crusaders set last_plunder_at = now(), shield_until = now() + interval '30 minutes'
      where user_id = ${context.userId}
    `;
    const fromName = await sql<{ name: string }>`select name from crusaders where user_id = ${context.userId}`;
    await sql`
      insert into inbox (user_id, title, body, gold, souls, gems, chests)
      values (
        ${target},
        ${"Raid"},
        ${`${fromName[0]?.name ?? "A hunter"} hit your unshielded camp.`},
        ${0}, ${0}, ${0}, ${0}
      )
    `;
    await sql`
      insert into plunder_log (attacker_id, defender_id, gold, souls)
      values (${context.userId}, ${target}, ${pgReal(gold)}::float8, ${pgReal(souls)}::float8)
    `;
    return { gold, souls, name: row.name };
  });

