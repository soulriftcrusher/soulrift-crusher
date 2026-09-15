import { i as createServerFn } from "./ssr2.mjs";
import { t as authMiddleware } from "./middleware-CzRKijGJ.mjs";
import { t as LOOT } from "./loot-BoxoOkJm.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plaza-net-C-UoGz6I.js
var LOOT_IDS = new Set(LOOT.map((l) => l.id));
var NPC_CHAT = [
	{
		name: "Cinder Host",
		body: "Ashen Pact, your lair reeks of fear."
	},
	{
		name: "Void Choir",
		body: "The cut widened. We took three scouts."
	},
	{
		name: "Iron Hymn",
		body: "Trade bone. We overforged again."
	},
	{
		name: "Rime Banner",
		body: "Frost holds. Bring fang cords if you hunt."
	},
	{
		name: "Nightwell",
		body: "Fish ran the well. Flasks for sale."
	},
	{
		name: "Cinder Host",
		body: "Season war in weeks. Stack shards."
	},
	{
		name: "Void Choir",
		body: "Anyone selling soul plumes?"
	},
	{
		name: "Iron Hymn",
		body: "Hammer's hot. Random smash ate my jaw."
	}
];
function cleanChat(raw) {
	return String(raw ?? "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
}
function cleanItems(raw) {
	const out = {};
	if (!raw || typeof raw !== "object") return out;
	for (const [k, v] of Object.entries(raw)) {
		if (!LOOT_IDS.has(k)) continue;
		const n = Math.floor(Number(v));
		if (n > 0) out[k] = Math.min(9999, n);
	}
	return out;
}
function parseItems(s) {
	try {
		return cleanItems(JSON.parse(s));
	} catch {
		return {};
	}
}
function npcChat(now = Date.now()) {
	const slot = Math.floor(now / 18e4);
	return [
		0,
		1,
		2
	].map((i) => {
		const row = NPC_CHAT[(slot + i * 3) % NPC_CHAT.length];
		return {
			id: `npc-${slot}-${i}`,
			name: row.name,
			body: row.body,
			at: now - (3 - i) * 4e4,
			npc: true
		};
	});
}
async function writeBag(sql, userId, bag) {
	const items = cleanItems(bag);
	for (const l of LOOT) {
		const qty = items[l.id] ?? 0;
		await sql`
      insert into inventories (user_id, loot_id, qty)
      values (${userId}, ${l.id}, ${qty})
      on conflict (user_id, loot_id) do update set qty = excluded.qty
    `;
	}
}
async function readBag(sql, userId) {
	const rows = await sql`
    select loot_id, qty from inventories where user_id = ${userId}
  `;
	const bag = {};
	for (const r of rows) bag[r.loot_id] = Number(r.qty);
	return bag;
}
async function takeItems(sql, userId, items) {
	for (const [id, n] of Object.entries(items)) {
		if (n <= 0) continue;
		if (((await sql`
      select qty from inventories where user_id = ${userId} and loot_id = ${id}
    `)[0]?.qty ?? 0) < n) throw new Error("Not enough parts for that trade.");
		await sql`
      update inventories set qty = qty - ${n} where user_id = ${userId} and loot_id = ${id}
    `;
	}
}
async function giveItems(sql, userId, items) {
	for (const [id, n] of Object.entries(items)) {
		if (n <= 0) continue;
		await sql`
      insert into inventories (user_id, loot_id, qty)
      values (${userId}, ${id}, ${n})
      on conflict (user_id, loot_id) do update set qty = inventories.qty + excluded.qty
    `;
	}
}
var loadPlaza_createServerFn_handler = createServerRpc({
	id: "f46c32aa5316eae54286e7cd0fb33948598cabb7d1ab2d0dc1da501429c211ad",
	name: "loadPlaza",
	filename: "src/game/plaza-net.ts"
}, (opts) => loadPlaza.__executeServer(opts));
var loadPlaza = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(loadPlaza_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	await writeBag(sql, context.userId, data.bag);
	return gatherPlaza(sql, context.userId);
});
async function gatherPlaza(sql, userId) {
	const online = await sql`
    select count(*)::int as n from crusaders where last_seen > now() - interval '2 minutes'
  `;
	const souls = await sql`
    select user_id, name, power, max_floor from crusaders
    where last_seen > now() - interval '2 minutes'
    order by power desc
    limit 24
  `;
	const chatRows = await sql`
    select id, name, body, created_at from world_chat order by id desc limit 40
  `;
	const tradeRows = await sql`
    select t.id, t.from_id, t.to_id, t.from_items, t.to_items, t.from_ok, t.to_ok, t.status,
      a.name as from_name, b.name as to_name
    from trades t
    join crusaders a on a.user_id = t.from_id
    join crusaders b on b.user_id = t.to_id
    where t.status = 'open' and (t.from_id = ${userId} or t.to_id = ${userId})
    order by t.id desc
    limit 8
  `;
	const chat = [...chatRows.map((r) => ({
		id: `c-${r.id}`,
		name: r.name,
		body: r.body,
		at: Date.parse(r.created_at) || Date.now(),
		npc: false
	})), ...npcChat()].sort((a, b) => a.at - b.at).slice(-50);
	return {
		online: Number(online[0]?.n ?? 1),
		chat,
		souls: souls.map((s) => ({
			userId: s.user_id,
			name: s.name,
			power: Number(s.power),
			maxFloor: Number(s.max_floor)
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
			mine: t.from_id === userId ? "from" : "to"
		})),
		bag: await readBag(sql, userId)
	};
}
var sendWorldChat_createServerFn_handler = createServerRpc({
	id: "b2bce63edd53949a722cdaae135326f18565a59dc32234ab31726a1b08cf9b1e",
	name: "sendWorldChat",
	filename: "src/game/plaza-net.ts"
}, (opts) => sendWorldChat.__executeServer(opts));
var sendWorldChat = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(sendWorldChat_createServerFn_handler, async ({ context, data }) => {
	const body = cleanChat(data.body);
	if (body.length < 1) throw new Error("Say something.");
	const name = String(data.name ?? "Crusader").replace(/[^\w \-']/g, "").trim().slice(0, 24) || "Crusader";
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const last = await sql`
      select created_at from world_chat where user_id = ${context.userId} order by id desc limit 1
    `;
	if (last[0]) {
		const t = Date.parse(last[0].created_at);
		if (Number.isFinite(t) && Date.now() - t < 2e3) throw new Error("Slow the hymn.");
	}
	await sql`
      insert into world_chat (user_id, name, body) values (${context.userId}, ${name}, ${body})
    `;
	return { ok: true };
});
var openTrade_createServerFn_handler = createServerRpc({
	id: "f4a09553d4a088f5bbc6de8e476a15ebfb773ecb8beb4b6d0c410bad951d3706",
	name: "openTrade",
	filename: "src/game/plaza-net.ts"
}, (opts) => openTrade.__executeServer(opts));
var openTrade = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(openTrade_createServerFn_handler, async ({ context, data }) => {
	const toId = String(data.toId ?? "");
	if (!toId || toId === context.userId) throw new Error("Pick another crusader.");
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	if (!(await sql`select user_id from crusaders where user_id = ${toId}`)[0]) throw new Error("They left the rift.");
	const open = await sql`
      select id from trades
      where status = 'open' and (
        (from_id = ${context.userId} and to_id = ${toId}) or
        (from_id = ${toId} and to_id = ${context.userId})
      )
      limit 1
    `;
	if (open[0]) return { id: Number(open[0].id) };
	const rows = await sql`
      insert into trades (from_id, to_id) values (${context.userId}, ${toId}) returning id
    `;
	return { id: Number(rows[0].id) };
});
var setTradeOffer_createServerFn_handler = createServerRpc({
	id: "0b0406966de2b2072a2f640acfae4e30d01da2011d5e218caf02b9070a81dfb7",
	name: "setTradeOffer",
	filename: "src/game/plaza-net.ts"
}, (opts) => setTradeOffer.__executeServer(opts));
var setTradeOffer = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(setTradeOffer_createServerFn_handler, async ({ context, data }) => {
	const items = JSON.stringify(cleanItems(data.items));
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const t = (await sql`
      select from_id, to_id, status from trades where id = ${data.id}
    `)[0];
	if (!t || t.status !== "open") throw new Error("Trade is gone.");
	if (t.from_id === context.userId) await sql`update trades set from_items = ${items}, from_ok = false, to_ok = false where id = ${data.id}`;
	else if (t.to_id === context.userId) await sql`update trades set to_items = ${items}, from_ok = false, to_ok = false where id = ${data.id}`;
	else throw new Error("Not your window.");
	return { ok: true };
});
var acceptTrade_createServerFn_handler = createServerRpc({
	id: "04b509b625cea963a33b0f4b5d2a33397cd50c4b5d9ec3911ce708fbb515289b",
	name: "acceptTrade",
	filename: "src/game/plaza-net.ts"
}, (opts) => acceptTrade.__executeServer(opts));
var acceptTrade = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(acceptTrade_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const t = (await sql`select from_id, to_id, from_items, to_items, from_ok, to_ok, status from trades where id = ${data.id}`)[0];
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
	}
	return {
		bag: await readBag(sql, context.userId),
		done: t.from_ok && t.to_ok
	};
});
var cancelTrade_createServerFn_handler = createServerRpc({
	id: "73bca6e9c3bd2965f2103de7b830d45d674e5b28855a7b320bd92d2c90cd493b",
	name: "cancelTrade",
	filename: "src/game/plaza-net.ts"
}, (opts) => cancelTrade.__executeServer(opts));
var cancelTrade = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(cancelTrade_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	await (await getSql())`
      update trades set status = 'cancelled'
      where id = ${data.id} and status = 'open' and (from_id = ${context.userId} or to_id = ${context.userId})
    `;
	return { ok: true };
});
var stallTrade_createServerFn_handler = createServerRpc({
	id: "089be8c55244dfd50d159f3be5bdd7205f831679499453778f901e52c41c17b5",
	name: "stallTrade",
	filename: "src/game/plaza-net.ts"
}, (opts) => stallTrade.__executeServer(opts));
var stallTrade = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(stallTrade_createServerFn_handler, async ({ context, data }) => {
	const stall = {
		bone: {
			take: { skull: 4 },
			give: { "bone-shard": 1 }
		},
		soul: {
			take: { "soul-plume": 2 },
			give: { "soul-shard": 1 }
		},
		rift: {
			take: {
				"rift-fish": 2,
				"ember-leaf": 1
			},
			give: { flask: 1 }
		}
	}[data.stall];
	if (!stall) throw new Error("Stall packed up.");
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	await writeBag(sql, context.userId, data.bag);
	await takeItems(sql, context.userId, stall.take);
	await giveItems(sql, context.userId, stall.give);
	return { bag: await readBag(sql, context.userId) };
});
//#endregion
export { acceptTrade_createServerFn_handler, cancelTrade_createServerFn_handler, loadPlaza_createServerFn_handler, openTrade_createServerFn_handler, sendWorldChat_createServerFn_handler, setTradeOffer_createServerFn_handler, stallTrade_createServerFn_handler };
