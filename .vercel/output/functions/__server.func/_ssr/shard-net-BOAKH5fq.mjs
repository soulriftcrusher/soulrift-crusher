import { i as createServerFn } from "./ssr2.mjs";
import { t as authMiddleware } from "./middleware-CzRKijGJ.mjs";
import { a as mindPop, c as mindWill, i as mindLog, l as seasonClock, n as SHARD_CAP, o as mindPower, s as mindSouls, t as SHARDS, u as warScore } from "./shards-Btx-VvES.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shard-net-BOAKH5fq.js
async function liveCounts(sql) {
	const rows = await sql`
    select m.shard_id, count(*)::int as n, coalesce(sum(c.power), 0)::float as power
    from shard_members m
    left join crusaders c on c.user_id = m.user_id
    group by m.shard_id
  `;
	const map = /* @__PURE__ */ new Map();
	for (const r of rows) map.set(r.shard_id, {
		n: Number(r.n),
		power: Number(r.power)
	});
	return map;
}
function buildRows(clock, live) {
	const rows = SHARDS.map((def) => {
		const liveN = live.get(def.id)?.n ?? 0;
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
			cap: SHARD_CAP,
			power,
			souls,
			score: warScore(power, pop, souls),
			rank: 0
		};
	});
	rows.sort((a, b) => b.score - a.score);
	rows.forEach((r, i) => {
		r.rank = i + 1;
	});
	return rows;
}
async function recordSeasonIfNeeded(sql, clock, rows) {
	if (clock.season <= 1) return;
	const prev = clock.season - 1;
	const have = await sql`select count(*)::int as n from season_results where season = ${prev}`;
	if (Number(have[0]?.n ?? 0) > 0) return;
	const snapshot = buildRows({
		...clock,
		season: prev,
		day: 90
	}, /* @__PURE__ */ new Map());
	for (const r of snapshot) await sql`
      insert into season_results (season, shard_id, rank, score, power, pop)
      values (${prev}, ${r.id}, ${r.rank}, ${r.score}, ${r.power}, ${r.pop})
      on conflict do nothing
    `;
}
async function ensureShard(sql, userId) {
	const mine = await sql`select shard_id from shard_members where user_id = ${userId}`;
	if (mine[0]?.shard_id) return mine[0].shard_id;
	const live = await liveCounts(sql);
	const pick = SHARDS.filter((s) => s.joinable).sort((a, b) => (live.get(a.id)?.n ?? 0) - (live.get(b.id)?.n ?? 0))[0] ?? SHARDS[0];
	await sql`
    insert into shard_members (user_id, shard_id)
    values (${userId}, ${pick.id})
    on conflict (user_id) do nothing
  `;
	return pick.id;
}
async function loadSeason(sql, userId) {
	const clock = seasonClock();
	const rows = buildRows(clock, await liveCounts(sql));
	await recordSeasonIfNeeded(sql, clock, rows);
	const mineRows = await sql`
    select shard_id, switched_at from shard_members where user_id = ${userId}
  `;
	const mine = mineRows[0]?.shard_id ?? await ensureShard(sql, userId);
	const switched = mineRows[0]?.switched_at ? Date.parse(mineRows[0].switched_at) : 0;
	const canSwitch = !switched || Date.now() - switched > 864e5;
	const prev = clock.season - 1;
	const last = prev >= 1 ? await sql`
        select shard_id, rank from season_results where season = ${prev} order by rank asc limit 1
      ` : [];
	const winner = last[0] ? SHARDS.find((s) => s.id === last[0].shard_id) : null;
	const claimedRows = prev >= 1 ? await sql`
          select count(*)::int as n from season_claims where user_id = ${userId} and season = ${prev}
        ` : [{ n: 1 }];
	const myLast = prev >= 1 ? await sql`
          select rank from season_results where season = ${prev} and shard_id = ${mine} limit 1
        ` : [];
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
		lastWar: winner && last[0] ? {
			season: prev,
			rank: Number(last[0].rank),
			shardName: winner.name
		} : null,
		shards: rows
	};
}
var fetchSeason_createServerFn_handler = createServerRpc({
	id: "094af63863d2e98afd5d7f2168503cc9189eab1f510f9824a3c6fd8c89c10f57",
	name: "fetchSeason",
	filename: "src/game/shard-net.ts"
}, (opts) => fetchSeason.__executeServer(opts));
var fetchSeason = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(fetchSeason_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	await ensureShard(sql, context.userId);
	return loadSeason(sql, context.userId);
});
var joinShard_createServerFn_handler = createServerRpc({
	id: "72dda33a3201dcdccf6051f3ed39df786c0f43cf1bb7be64fe29903c64f28e11",
	name: "joinShard",
	filename: "src/game/shard-net.ts"
}, (opts) => joinShard.__executeServer(opts));
var joinShard = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(joinShard_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const def = SHARDS.find((s) => s.id === data.shardId);
	if (!def?.joinable) throw new Error("That server is NPC only. They will not take you.");
	seasonClock();
	if (((await liveCounts(sql)).get(def.id)?.n ?? 0) >= 1e3) throw new Error("That server is full. Thousand souls. No more.");
	const mine = await sql`
      select shard_id, switched_at from shard_members where user_id = ${context.userId}
    `;
	if (mine[0]?.shard_id === def.id) return loadSeason(sql, context.userId);
	const switched = mine[0]?.switched_at ? Date.parse(mine[0].switched_at) : 0;
	if (switched && Date.now() - switched < 864e5) throw new Error("Server change cools for a day.");
	await sql`
      insert into shard_members (user_id, shard_id, switched_at)
      values (${context.userId}, ${def.id}, now())
      on conflict (user_id) do update set shard_id = excluded.shard_id, switched_at = now()
    `;
	return loadSeason(sql, context.userId);
});
var claimSeason_createServerFn_handler = createServerRpc({
	id: "d2ab000d9cdaa4af07f45e0cfb9bdba72ccfb72aa7813151eb9f064b21fcf787",
	name: "claimSeason",
	filename: "src/game/shard-net.ts"
}, (opts) => claimSeason.__executeServer(opts));
var claimSeason = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(claimSeason_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const snap = await loadSeason(sql, context.userId);
	const prev = snap.season - 1;
	if (prev < 1) throw new Error("No war has finished yet.");
	if (snap.claimed) throw new Error("Already claimed.");
	const rank = snap.shards.find((s) => s.id === snap.mine)?.rank ?? 99;
	const gems = rank === 1 ? 120 : rank === 2 ? 70 : rank === 3 ? 40 : 0;
	if (gems <= 0) throw new Error("Your server did not place. No tithe.");
	await sql`
      insert into season_claims (user_id, season, gems)
      values (${context.userId}, ${prev}, ${gems})
    `;
	return {
		gems,
		snap: {
			...snap,
			claimed: true,
			claimGems: gems
		}
	};
});
//#endregion
export { claimSeason_createServerFn_handler, fetchSeason_createServerFn_handler, joinShard_createServerFn_handler };
