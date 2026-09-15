import { c as __exportAll } from "./ssr.mjs";
import { i as createServerFn, o as getServerFnById, t as TSS_SERVER_FUNCTION } from "./ssr2.mjs";
import { t as authMiddleware } from "./middleware-CzRKijGJ.mjs";
import { t as SHARDS } from "./shards-Btx-VvES.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shard-net-HCcb23p0.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var shard_net_exports = /* @__PURE__ */ __exportAll({
	claimSeason: () => claimSeason,
	ensureShard: () => ensureShard,
	fetchSeason: () => fetchSeason,
	joinShard: () => joinShard
});
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
var fetchSeason = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("094af63863d2e98afd5d7f2168503cc9189eab1f510f9824a3c6fd8c89c10f57"));
var joinShard = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("72dda33a3201dcdccf6051f3ed39df786c0f43cf1bb7be64fe29903c64f28e11"));
var claimSeason = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("d2ab000d9cdaa4af07f45e0cfb9bdba72ccfb72aa7813151eb9f064b21fcf787"));
//#endregion
export { createSsrRpc as a, shard_net_exports as i, fetchSeason as n, joinShard as r, claimSeason as t };
