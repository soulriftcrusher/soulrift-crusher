import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { pgInt, pgReal } from "@/lib/pg-num";
import {
  SHARD_CAP,
  SHARDS,
  mindLog,
  mindPop,
  mindPower,
  mindSouls,
  mindWill,
  seasonClock,
  warScore,
  type ShardDef,
} from "./shards";
import { THRONES, duelOutcome, kingThink, pretenderPower, type KingSnap } from "./kings";

export type ShardRow = {
  id: string;
  name: string;
  tag: string;
  joinable: boolean;
  npc: boolean;
  mind: string;
  blurb: string;
  will: string;
  log: string[];
  pop: number;
  hunters: number;
  online: number;
  cap: number;
  power: number;
  souls: number;
  score: number;
  rank: number;
  king: KingSnap | null;
};

export type SeasonSnap = {
  season: number;
  day: number;
  msLeft: number;
  warToday: boolean;
  mine: string | null;
  canSwitch: boolean;
  claimed: boolean;
  claimGems: number;
  lastWar: { season: number; rank: number; shardName: string } | null;
  shards: ShardRow[];
  hunters: number;
  online: number;
};

type Sql = Awaited<ReturnType<(typeof import("@/lib/db"))["getSql"]>>;

function defOf(id: string): ShardDef {
  return SHARDS.find((s) => s.id === id) ?? SHARDS[0]!;
}

async function liveCounts(sql: Sql) {
  const rows = await sql<{ shard_id: string; n: number; online: number; power: number }>`
    select m.shard_id,
      count(*)::int as n,
      count(*) filter (where c.last_seen > now() - interval '3 minutes')::int as online,
      coalesce(sum(c.power), 0)::float as power
    from shard_members m
    left join crusaders c on c.user_id = m.user_id
    group by m.shard_id
  `;
  const map = new Map<string, { n: number; online: number; power: number }>();
  for (const r of rows) map.set(r.shard_id, { n: Number(r.n), online: Number(r.online), power: Number(r.power) });
  return map;
}

function buildRows(
  clock: ReturnType<typeof seasonClock>,
  live: Map<string, { n: number; online: number; power: number }>,
): ShardRow[] {
  const rows: ShardRow[] = SHARDS.map((def) => {
    const liveN = live.get(def.id)?.n ?? 0;
    const liveOn = live.get(def.id)?.online ?? 0;
    const liveP = live.get(def.id)?.power ?? 0;
    const npcPop = mindPop(def, clock.day);
    const npcPower = mindPower(def, clock.day, clock.season);
    const pop = def.joinable ? Math.min(SHARD_CAP, npcPop + liveN) : npcPop;
    const power = def.joinable ? npcPower + liveP : npcPower;
    const souls = mindSouls(def, clock.day);
    return {
      id: def.id,
      name: def.name,
      tag: def.tag,
      joinable: def.joinable,
      npc: !def.joinable,
      mind: def.mind,
      blurb: def.blurb,
      will: mindWill(def, clock.day),
      log: mindLog(def, clock.day),
      pop,
      hunters: def.joinable ? liveN : 0,
      online: def.joinable ? liveOn : 0,
      cap: SHARD_CAP,
      power,
      souls,
      score: warScore(power, pop, souls),
      rank: 0,
      king: null,
    };
  });
  rows.sort((a, b) => b.score - a.score);
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });
  return rows;
}

async function recordSeasonIfNeeded(sql: Sql, clock: ReturnType<typeof seasonClock>, rows: ShardRow[]) {
  if (clock.season <= 1) return;
  const prev = clock.season - 1;
  const have = await sql<{ n: number }>`select count(*)::int as n from season_results where season = ${prev}`;
  if (Number(have[0]?.n ?? 0) > 0) return;
  const prevClock = { ...clock, season: prev, day: 90 };
  const snapshot = buildRows(prevClock, new Map());
  for (const r of snapshot) {
    await sql`
      insert into season_results (season, shard_id, rank, score, power, pop)
      values (${prev}, ${r.id}, ${r.rank}, ${pgReal(r.score)}::float8, ${pgReal(r.power)}::float8, ${r.pop})
      on conflict do nothing
    `;
  }
  void rows;
}

async function logKing(sql: Sql, shardId: string, body: string) {
  await sql`insert into king_log (shard_id, body) values (${shardId}, ${body.slice(0, 180)})`;
}

async function seatKing(
  sql: Sql,
  shardId: string,
  season: number,
  seat: { kind: "npc" | "player"; userId?: string | null; npcId?: string | null; name: string; power: number; thought: string },
) {
  await sql`
    insert into server_kings (shard_id, season, kind, user_id, npc_id, name, power, held_at, defenses, thought, updated_at)
    values (${shardId}, ${season}, ${seat.kind}, ${seat.userId ?? null}, ${seat.npcId ?? null}, ${seat.name}, ${pgReal(seat.power)}::float8, now(), 0, ${seat.thought}, now())
    on conflict (shard_id) do update set
      season = excluded.season,
      kind = excluded.kind,
      user_id = excluded.user_id,
      npc_id = excluded.npc_id,
      name = excluded.name,
      power = excluded.power,
      held_at = now(),
      defenses = 0,
      thought = excluded.thought,
      updated_at = now()
  `;
}

async function tickKings(sql: Sql) {
  const clock = seasonClock();
  const live = await liveCounts(sql);
  for (const def of SHARDS) {
    const court = THRONES[def.id] ?? [{ id: `${def.id}-regent`, name: `${def.name} Regent`, seed: 9 }];
    const powers = court.map((p) => ({ ...p, power: pretenderPower(def, p, clock.day, clock.season) }));
    powers.sort((a, b) => b.power - a.power);
    const top = powers[0]!;
    const have = await sql<{
      kind: string;
      user_id: string | null;
      npc_id: string | null;
      name: string;
      power: number;
      defenses: number;
      last_coup_at: string | null;
    }>`
      select kind, user_id, npc_id, name, power, defenses, last_coup_at from server_kings where shard_id = ${def.id}
    `;
    if (!have[0]) {
      await seatKing(sql, def.id, clock.season, {
        kind: "npc",
        npcId: top.id,
        name: top.name,
        power: top.power,
        thought: "First dawn. The chair was empty. I sat.",
      });
      await logKing(sql, def.id, `${top.name} took the empty throne.`);
      continue;
    }
    const king = have[0];
    let kingPower = Number(king.power);
    if (king.kind === "npc") {
      const match = powers.find((p) => p.id === king.npc_id) ?? top;
      kingPower = match.power;
      await sql`update server_kings set power = ${pgReal(kingPower)}::float8, season = ${clock.season} where shard_id = ${def.id}`;
    } else if (king.user_id) {
      const cr = await sql<{ power: number }>`select power from crusaders where user_id = ${king.user_id}`;
      kingPower = Math.max(kingPower, Number(cr[0]?.power ?? kingPower));
      await sql`update server_kings set power = ${pgReal(kingPower)}::float8 where shard_id = ${def.id}`;
    }

    const lastCoup = king.last_coup_at ? Date.parse(String(king.last_coup_at)) : 0;
    const coupReady = !lastCoup || Date.now() - lastCoup > 3 * 3600000;
    if (coupReady) {
      for (const pret of powers) {
        if (king.kind === "npc" && pret.id === king.npc_id) continue;
        const pWin = pret.power / Math.max(1, pret.power + kingPower);
        const think = kingThink(def.mind, pWin, clock.warToday, false, clock.day, Number(king.defenses));
        if (!think.challenge) continue;
        await sql`update server_kings set last_coup_at = now() where shard_id = ${def.id}`;
        if (!duelOutcome(pret.power, kingPower)) {
          await sql`update server_kings set defenses = defenses + 1, thought = ${think.thought} where shard_id = ${def.id}`;
          await logKing(sql, def.id, `${pret.name} tested the throne and broke.`);
          break;
        }
        await seatKing(sql, def.id, clock.season, {
          kind: "npc",
          npcId: pret.id,
          name: pret.name,
          power: pret.power,
          thought: think.thought,
        });
        await sql`update server_kings set last_coup_at = now() where shard_id = ${def.id}`;
        await logKing(sql, def.id, `${pret.name} took the throne from ${king.name}.`);
        break;
      }
    }

    const hold = kingThink(def.mind, 0.7, clock.warToday, true, clock.day, Number(king.defenses));
    await sql`update server_kings set thought = ${hold.thought} where shard_id = ${def.id} and kind = 'npc'`;
    void live;
  }
}

async function loadKings(sql: Sql, userId: string): Promise<Map<string, KingSnap>> {
  const rows = await sql<{
    shard_id: string;
    kind: string;
    user_id: string | null;
    name: string;
    power: number;
    held_at: string;
    defenses: number;
    thought: string;
  }>`select shard_id, kind, user_id, name, power, held_at, defenses, thought from server_kings`;
  const logs = await sql<{ shard_id: string; body: string }>`
    select shard_id, body from king_log order by created_at desc limit 40
  `;
  const logMap = new Map<string, string[]>();
  for (const line of logs) {
    const arr = logMap.get(line.shard_id) ?? [];
    if (arr.length < 4) arr.push(line.body);
    logMap.set(line.shard_id, arr);
  }
  const map = new Map<string, KingSnap>();
  for (const r of rows) {
    const held = Date.parse(String(r.held_at));
    map.set(r.shard_id, {
      shardId: r.shard_id,
      kind: r.kind === "player" ? "player" : "npc",
      name: r.name,
      power: Number(r.power),
      heldHours: Number.isFinite(held) ? Math.max(0, Math.floor((Date.now() - held) / 3600000)) : 0,
      defenses: Number(r.defenses),
      thought: r.thought,
      you: r.user_id === userId,
      log: logMap.get(r.shard_id) ?? [],
    });
  }
  return map;
}

export async function ensureShard(sql: Sql, userId: string): Promise<string> {
  const mine = await sql<{ shard_id: string }>`select shard_id from shard_members where user_id = ${userId}`;
  if (mine[0]?.shard_id) return mine[0].shard_id;
  const live = await liveCounts(sql);
  const open = SHARDS.filter((s) => s.joinable).sort((a, b) => (live.get(a.id)?.n ?? 0) - (live.get(b.id)?.n ?? 0));
  const pick = open[0] ?? SHARDS[0]!;
  await sql`
    insert into shard_members (user_id, shard_id)
    values (${userId}, ${pick.id})
    on conflict (user_id) do nothing
  `;
  return pick.id;
}

async function loadSeason(sql: Sql, userId: string): Promise<SeasonSnap> {
  const clock = seasonClock();
  const live = await liveCounts(sql);
  await tickKings(sql);
  const rows = buildRows(clock, live);
  const thrones = await loadKings(sql, userId);
  for (const r of rows) r.king = thrones.get(r.id) ?? null;
  await recordSeasonIfNeeded(sql, clock, rows);
  const mineRows = await sql<{ shard_id: string; switched_at: string | null }>`
    select shard_id, switched_at from shard_members where user_id = ${userId}
  `;
  const mine = mineRows[0]?.shard_id ?? (await ensureShard(sql, userId));
  const switched = mineRows[0]?.switched_at ? Date.parse(mineRows[0].switched_at) : 0;
  const canSwitch = !switched || Date.now() - switched > 24 * 3600000;
  const prev = clock.season - 1;
  const last = prev >= 1
    ? await sql<{ shard_id: string; rank: number }>`
        select shard_id, rank from season_results where season = ${prev} order by rank asc limit 1
      `
    : [];
  const winner = last[0] ? SHARDS.find((s) => s.id === last[0]!.shard_id) : null;
  const claimedRows =
    prev >= 1
      ? await sql<{ n: number }>`
          select count(*)::int as n from season_claims where user_id = ${userId} and season = ${prev}
        `
      : [{ n: 1 }];
  const myLast =
    prev >= 1
      ? await sql<{ rank: number }>`
          select rank from season_results where season = ${prev} and shard_id = ${mine} limit 1
        `
      : [];
  const lastRank = Number(myLast[0]?.rank ?? 99);
  const claimGems = lastRank === 1 ? 120 : lastRank === 2 ? 70 : lastRank === 3 ? 40 : 0;
  return {
    season: clock.season,
    day: clock.day,
    msLeft: clock.msLeft,
    warToday: clock.warToday,
    mine,
    canSwitch,
    claimed: Number(claimedRows[0]?.n ?? 0) > 0,
    claimGems,
    lastWar: winner && last[0] ? { season: prev, rank: Number(last[0].rank), shardName: winner.name } : null,
    shards: rows,
    hunters: rows.reduce((n, r) => n + r.hunters, 0),
    online: rows.reduce((n, r) => n + r.online, 0),
  };
}

export const fetchSeason = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SeasonSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await ensureShard(sql, context.userId);
    return loadSeason(sql, context.userId);
  });

export const joinShard = createServerFn({ method: "POST" })
  .validator((d: { shardId: string }) => d)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<SeasonSnap> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const def = SHARDS.find((s) => s.id === data.shardId);
    if (!def?.joinable) throw new Error("That server is NPC only. They will not take you.");
    const clock = seasonClock();
    const live = await liveCounts(sql);
    const n = live.get(def.id)?.n ?? 0;
    if (n >= SHARD_CAP) throw new Error("That server is full. Thousand souls. No more.");
    const mine = await sql<{ shard_id: string; switched_at: string | null }>`
      select shard_id, switched_at from shard_members where user_id = ${context.userId}
    `;
    if (mine[0]?.shard_id === def.id) return loadSeason(sql, context.userId);
    const switched = mine[0]?.switched_at ? Date.parse(mine[0].switched_at) : 0;
    if (switched && Date.now() - switched < 24 * 3600000) {
      throw new Error("Server change cools for a day.");
    }
    await sql`
      insert into shard_members (user_id, shard_id, switched_at)
      values (${context.userId}, ${def.id}, now())
      on conflict (user_id) do update set shard_id = excluded.shard_id, switched_at = now()
    `;
    void clock;
    return loadSeason(sql, context.userId);
  });

export const claimSeason = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ gems: number; snap: SeasonSnap }> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const snap = await loadSeason(sql, context.userId);
    const prev = snap.season - 1;
    if (prev < 1) throw new Error("No war has finished yet.");
    if (snap.claimed) throw new Error("Already claimed.");
    const mine = snap.shards.find((s) => s.id === snap.mine);
    const rank = mine?.rank ?? 99;
    const gems = rank === 1 ? 120 : rank === 2 ? 70 : rank === 3 ? 40 : 0;
    if (gems <= 0) throw new Error("Your server did not place. No tithe.");
    await sql`
      insert into season_claims (user_id, season, gems)
      values (${context.userId}, ${prev}, ${gems})
    `;
    return { gems, snap: { ...snap, claimed: true, claimGems: gems } };
  });

export const challengeKing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ win: boolean; foe: string; gems: number; snap: SeasonSnap }> => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await tickKings(sql);
    const clock = seasonClock();
    const shardId = await ensureShard(sql, context.userId);
    const cool = await sql<{ at: string }>`select at from king_challenges where user_id = ${context.userId}`;
    if (cool[0] && Date.now() - Date.parse(String(cool[0].at)) < 6 * 3600000) {
      throw new Error("The throne cools for 6 hours.");
    }
    const king = await sql<{ kind: string; user_id: string | null; name: string; power: number }>`
      select kind, user_id, name, power from server_kings where shard_id = ${shardId}
    `;
    if (!king[0]) throw new Error("No king sits yet.");
    if (king[0].user_id === context.userId) throw new Error("You already sit the throne.");
    const me = await sql<{ name: string; power: number }>`select name, power from crusaders where user_id = ${context.userId}`;
    const myPower = Number(me[0]?.power ?? 0);
    const myName = me[0]?.name || "Crusader";
    if (myPower < 50) throw new Error("Too weak. Grow first.");
    const win = duelOutcome(myPower, Number(king[0].power));
    await sql`
      insert into king_challenges (user_id, at) values (${context.userId}, now())
      on conflict (user_id) do update set at = now()
    `;
    if (!win) {
      await sql`update server_kings set defenses = defenses + 1, updated_at = now() where shard_id = ${shardId}`;
      await logKing(sql, shardId, `${myName} challenged ${king[0].name} and fell.`);
      return { win: false, foe: king[0].name, gems: 0, snap: await loadSeason(sql, context.userId) };
    }
    await seatKing(sql, shardId, clock.season, {
      kind: "player",
      userId: context.userId,
      name: myName,
      power: myPower,
      thought: "The chair is mine. Let the NPCs compute their grief.",
    });
    await logKing(sql, shardId, `${myName} took the throne from ${king[0].name}.`);
    return { win: true, foe: king[0].name, gems: 40, snap: await loadSeason(sql, context.userId) };
  });
