import { i as createServerFn } from "./ssr2.mjs";
import { t as authMiddleware } from "./middleware-CzRKijGJ.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/net-rNRa_4kF.js
var RAID_CD = 40;
var DUEL_CD = 25;
var CLAN_CAP = 20;
var CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function clampPower(n) {
	const v = Number(n);
	if (!Number.isFinite(v) || v < 0) return 0;
	return Math.min(v, 0xe8d4a51000);
}
function clampFloor(n) {
	const v = Math.floor(Number(n));
	if (!Number.isFinite(v) || v < 1) return 1;
	return Math.min(v, 2e4);
}
function cleanName(raw) {
	return String(raw ?? "").replace(/[^\w \-']/g, "").trim().slice(0, 24) || "Crusader";
}
function cleanClanName(raw) {
	return String(raw ?? "").replace(/[^\w \-']/g, "").trim().slice(0, 22);
}
function cleanTag(raw) {
	return String(raw ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}
function cleanCode(raw) {
	return String(raw ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}
function makeCode() {
	let out = "";
	for (let i = 0; i < 6; i++) out += CODE_CHARS[Math.floor(Math.random() * 32)];
	return out;
}
function raidHpFor(members, wave) {
	return Math.max(80, Math.floor(420 * Math.max(1, members) * Math.pow(1.42, Math.max(0, wave - 1))));
}
function cooldownLeft(at, cd) {
	if (!at) return 0;
	const t = typeof at === "string" ? Date.parse(at) : at.getTime();
	if (!Number.isFinite(t)) return 0;
	return Math.max(0, cd - (Date.now() - t) / 1e3);
}
async function ensureCrusader(sql, userId, patch) {
	const name = cleanName(patch?.name);
	await sql`
    insert into crusaders (user_id, name, power, max_floor, last_seen)
    values (${userId}, ${name}, ${clampPower(patch?.power ?? 0)}, ${clampFloor(patch?.maxFloor ?? 1)}, now())
    on conflict (user_id) do update set
      name = case when ${name} = 'Crusader' then crusaders.name else excluded.name end,
      power = greatest(crusaders.power, excluded.power),
      max_floor = greatest(crusaders.max_floor, excluded.max_floor),
      last_seen = now()
  `;
}
async function loadWorld(sql, userId) {
	const me = (await sql`
    select name, power, max_floor, clan_id, last_raid_at, last_duel_at
    from crusaders where user_id = ${userId}
  `)[0];
	const board = await sql`
    select c.id, c.name, c.tag, c.influence,
      (select count(*)::int from clan_members m where m.clan_id = c.id) as members
    from clans c
    order by c.influence desc, c.id asc
    limit 8
  `;
	const rivals = await sql`
    select r.user_id, r.name, r.power, r.max_floor, cl.tag
    from crusaders r
    left join clans cl on cl.id = r.clan_id
    where r.user_id <> ${userId}
    order by r.power desc, r.last_seen desc
    limit 12
  `;
	if (!me) return {
		name: "Crusader",
		power: 0,
		maxFloor: 1,
		raidReadyIn: 0,
		duelReadyIn: 0,
		clan: null,
		members: [],
		rivals: rivals.map((r) => ({
			userId: r.user_id,
			name: r.name,
			power: Number(r.power),
			maxFloor: Number(r.max_floor),
			clanTag: r.tag
		})),
		board: board.map((c) => ({
			id: Number(c.id),
			name: c.name,
			tag: c.tag,
			influence: Number(c.influence),
			members: Number(c.members)
		})),
		role: null,
		online: 0
	};
	let clan = null;
	let members = [];
	let role = null;
	if (me.clan_id) {
		const row = (await sql`select id, name, tag, code, influence, raid_wave, raid_hp, raid_max from clans where id = ${me.clan_id}`)[0];
		members = (await sql`
      select m.user_id, c.name, m.role, c.power, c.max_floor, m.raid_damage
      from clan_members m
      join crusaders c on c.user_id = m.user_id
      where m.clan_id = ${me.clan_id}
      order by m.raid_damage desc, c.power desc
    `).map((p) => ({
			userId: p.user_id,
			name: p.name,
			role: p.role,
			power: Number(p.power),
			maxFloor: Number(p.max_floor),
			raidDamage: Number(p.raid_damage)
		}));
		role = members.find((m) => m.userId === userId)?.role ?? "member";
		if (row) clan = {
			id: Number(row.id),
			name: row.name,
			tag: row.tag,
			code: row.code,
			influence: Number(row.influence),
			raidWave: Number(row.raid_wave),
			raidHp: Number(row.raid_hp),
			raidMax: Number(row.raid_max),
			memberCount: members.length
		};
	}
	const online = await sql`
    select count(*)::int as n from crusaders where last_seen > now() - interval '2 minutes'
  `;
	return {
		name: me.name,
		power: Number(me.power),
		maxFloor: Number(me.max_floor),
		raidReadyIn: cooldownLeft(me.last_raid_at, RAID_CD),
		duelReadyIn: cooldownLeft(me.last_duel_at, DUEL_CD),
		clan,
		members,
		rivals: rivals.map((r) => ({
			userId: r.user_id,
			name: r.name,
			power: Number(r.power),
			maxFloor: Number(r.max_floor),
			clanTag: r.tag
		})),
		board: board.map((c) => ({
			id: Number(c.id),
			name: c.name,
			tag: c.tag,
			influence: Number(c.influence),
			members: Number(c.members)
		})),
		role,
		online: Number(online[0]?.n ?? 1)
	};
}
var heartbeat_createServerFn_handler = createServerRpc({
	id: "46e384e2c63569a54fc1b0f0b06fa175fe615f7792438e3045f2dfa668486c13",
	name: "heartbeat",
	filename: "src/game/net.ts"
}, (opts) => heartbeat.__executeServer(opts));
var heartbeat = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(heartbeat_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	await ensureCrusader(sql, context.userId, data);
	const { ensureShard } = await import("./shard-net-HCcb23p0.mjs").then((n) => n.i);
	await ensureShard(sql, context.userId);
	return loadWorld(sql, context.userId);
});
var createClan_createServerFn_handler = createServerRpc({
	id: "a86f966b94718debf4f9515b7936c9ceae7ce43fe498fba6bb5d30b4099533b0",
	name: "createClan",
	filename: "src/game/net.ts"
}, (opts) => createClan.__executeServer(opts));
var createClan = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createClan_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	await ensureCrusader(sql, context.userId);
	if ((await sql`select clan_id from crusaders where user_id = ${context.userId}`)[0]?.clan_id) throw new Error("Leave your clan before founding another.");
	const name = cleanClanName(data.name);
	const tag = cleanTag(data.tag);
	if (name.length < 3) throw new Error("Clan name needs at least 3 letters.");
	if (tag.length < 2) throw new Error("Banner tag needs 2–4 letters.");
	let clanId = 0;
	for (let i = 0; i < 6; i++) {
		const code = makeCode();
		try {
			const rows = await sql`
          insert into clans (name, tag, code, founder_id, raid_wave, raid_hp, raid_max)
          values (${name}, ${tag}, ${code}, ${context.userId}, 1, ${raidHpFor(1, 1)}, ${raidHpFor(1, 1)})
          returning id
        `;
			clanId = Number(rows[0]?.id ?? 0);
			break;
		} catch {}
	}
	if (!clanId) throw new Error("That name or tag is taken.");
	await sql`insert into clan_members (clan_id, user_id, role) values (${clanId}, ${context.userId}, ${"founder"})`;
	await sql`update crusaders set clan_id = ${clanId} where user_id = ${context.userId}`;
	return loadWorld(sql, context.userId);
});
var joinClan_createServerFn_handler = createServerRpc({
	id: "26d062d22df9defd6b62bffce8e7e19544618af1ba7c3b8607903324685c4caa",
	name: "joinClan",
	filename: "src/game/net.ts"
}, (opts) => joinClan.__executeServer(opts));
var joinClan = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(joinClan_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	await ensureCrusader(sql, context.userId);
	if ((await sql`select clan_id from crusaders where user_id = ${context.userId}`)[0]?.clan_id) throw new Error("You already fly a banner.");
	const clan = (await sql`select id, raid_wave from clans where code = ${cleanCode(data.code)}`)[0];
	if (!clan) throw new Error("No clan uses that code.");
	const counts = await sql`select count(*)::int as n from clan_members where clan_id = ${clan.id}`;
	const n = Number(counts[0]?.n ?? 0);
	if (n >= CLAN_CAP) throw new Error("That clan is full.");
	await sql`insert into clan_members (clan_id, user_id, role) values (${clan.id}, ${context.userId}, ${"member"})`;
	await sql`update crusaders set clan_id = ${clan.id} where user_id = ${context.userId}`;
	await sql`
      update clans set raid_max = greatest(raid_max, ${raidHpFor(n + 1, Number(clan.raid_wave) || 1)})
      where id = ${clan.id} and raid_hp > 0
    `;
	return loadWorld(sql, context.userId);
});
var leaveClan_createServerFn_handler = createServerRpc({
	id: "f8d5dba550700df457b8e8f7623b4c91e8f096084f16a0bbe954e108ed869764",
	name: "leaveClan",
	filename: "src/game/net.ts"
}, (opts) => leaveClan.__executeServer(opts));
var leaveClan = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(leaveClan_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const clanId = (await sql`select clan_id from crusaders where user_id = ${context.userId}`)[0]?.clan_id;
	if (!clanId) return loadWorld(sql, context.userId);
	if ((await sql`
      select role from clan_members where clan_id = ${clanId} and user_id = ${context.userId}
    `)[0]?.role === "founder") {
		const others = await sql`
        select count(*)::int as n from clan_members where clan_id = ${clanId} and user_id <> ${context.userId}
      `;
		if (Number(others[0]?.n ?? 0) > 0) throw new Error("Hand the banner off first — founders cannot abandon a living clan.");
		await sql`delete from clans where id = ${clanId}`;
	} else await sql`delete from clan_members where clan_id = ${clanId} and user_id = ${context.userId}`;
	await sql`update crusaders set clan_id = null where user_id = ${context.userId}`;
	return loadWorld(sql, context.userId);
});
var strikeRaid_createServerFn_handler = createServerRpc({
	id: "91d37860a72e99888c8a03ac360a11732cff928120da8f7cc1be8c75fa5d1537",
	name: "strikeRaid",
	filename: "src/game/net.ts"
}, (opts) => strikeRaid.__executeServer(opts));
var strikeRaid = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(strikeRaid_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const me = (await sql`select power, max_floor, clan_id, last_raid_at from crusaders where user_id = ${context.userId}`)[0];
	if (!me?.clan_id) throw new Error("Join a clan to raid.");
	if (cooldownLeft(me.last_raid_at, RAID_CD) > 0) throw new Error("The rift is still cooling.");
	const clan = (await sql`select id, raid_wave, raid_hp, raid_max from clans where id = ${me.clan_id}`)[0];
	if (!clan) throw new Error("The banner is gone.");
	const counts = await sql`select count(*)::int as n from clan_members where clan_id = ${clan.id}`;
	const members = Math.max(1, Number(counts[0]?.n ?? 1));
	let hp = Number(clan.raid_hp);
	let max = Number(clan.raid_max);
	let wave = Number(clan.raid_wave) || 1;
	if (hp <= 0 || max <= 0) {
		wave += 1;
		max = raidHpFor(members, wave);
		hp = max;
		await sql`
        update clans set raid_wave = ${wave}, raid_hp = ${hp}, raid_max = ${max}
        where id = ${clan.id}
      `;
		await sql`update clan_members set raid_damage = 0 where clan_id = ${clan.id}`;
	}
	const damage = Math.max(8, Math.floor(Number(me.power) * 6 + clampFloor(me.max_floor) * 12));
	const dealt = Math.min(damage, hp);
	hp = Math.max(0, hp - dealt);
	const killed = hp <= 0;
	await sql`update crusaders set last_raid_at = now() where user_id = ${context.userId}`;
	await sql`
      update clan_members
      set raid_damage = raid_damage + ${dealt}
      where clan_id = ${clan.id} and user_id = ${context.userId}
    `;
	let gold = Math.floor(18 * wave * (1 + members * .15));
	let souls = killed ? 1 + Math.floor(wave / 4) : 0;
	let influence = 3 + Math.floor(wave / 2);
	let chests = 0;
	if (killed) {
		influence += 8 + wave;
		chests = 1;
		gold = Math.floor(gold * 3.2);
		const nextWave = wave + 1;
		const nextMax = raidHpFor(members, nextWave);
		await sql`
        update clans
        set raid_hp = ${nextMax}, raid_max = ${nextMax}, raid_wave = ${nextWave}, influence = influence + ${influence}
        where id = ${clan.id}
      `;
		await sql`update clan_members set raid_damage = 0 where clan_id = ${clan.id}`;
		hp = nextMax;
		max = nextMax;
	} else await sql`
        update clans
        set raid_hp = ${hp}, influence = influence + 1
        where id = ${clan.id}
      `;
	return {
		damage: dealt,
		killed,
		gold,
		souls,
		influence,
		chests,
		raidHp: hp,
		raidMax: max
	};
});
var challengeCrusader_createServerFn_handler = createServerRpc({
	id: "deace6b747d57e9513111c63d026599dddf8fb05eeb0d10e3135525336771823",
	name: "challengeCrusader",
	filename: "src/game/net.ts"
}, (opts) => challengeCrusader.__executeServer(opts));
var challengeCrusader = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(challengeCrusader_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const defenderId = String(data.defenderId ?? "");
	if (!defenderId || defenderId === context.userId) throw new Error("Pick another crusader.");
	const me = (await sql`
      select power, max_floor, last_duel_at from crusaders where user_id = ${context.userId}
    `)[0];
	if (!me) throw new Error("Sync your warband first.");
	if (cooldownLeft(me.last_duel_at, DUEL_CD) > 0) throw new Error("Your warband is still catching breath.");
	const them = (await sql`
      select name, power from crusaders where user_id = ${defenderId}
    `)[0];
	if (!them) throw new Error("That crusader left the rift.");
	const yourPower = Math.max(1, Number(me.power));
	const theirPower = Math.max(1, Number(them.power));
	const win = yourPower / theirPower >= .78 + Math.random() * .28;
	await sql`update crusaders set last_duel_at = now() where user_id = ${context.userId}`;
	await sql`
      insert into duels (attacker_id, defender_id, win)
      values (${context.userId}, ${defenderId}, ${win})
    `;
	const floor = clampFloor(me.max_floor);
	const influence = win ? 8 + Math.floor(floor / 6) : 2;
	const souls = win && Math.random() < .35 ? 1 : 0;
	const gold = win ? Math.floor(12 * floor) : Math.floor(8 * floor);
	const chests = win && Math.random() < .18 ? 1 : 0;
	return {
		win,
		foe: them.name,
		yourPower,
		theirPower,
		gold,
		souls,
		influence,
		chests
	};
});
var PAYLOAD_MAX = 1e5;
function asStaff(sql, userId) {
	return sql`select user_id from staff where user_id = ${userId} limit 1`;
}
var pullCloudSave_createServerFn_handler = createServerRpc({
	id: "992591a67caef953846791e661f3add603e013c1b28286d32d5f6f11a9d7bd01",
	name: "pullCloudSave",
	filename: "src/game/net.ts"
}, (opts) => pullCloudSave.__executeServer(opts));
var pullCloudSave = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(pullCloudSave_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const rows = await sql`
      select payload, updated_at from game_saves where user_id = ${context.userId}
    `;
	const grants = await sql`
      select gems from gem_grants where user_id = ${context.userId}
    `;
	const gems = Math.max(0, Number(grants[0]?.gems ?? 0));
	if (gems > 0) await sql`update gem_grants set gems = 0 where user_id = ${context.userId}`;
	return {
		payload: rows[0]?.payload ?? null,
		updatedAt: rows[0]?.updated_at ?? null,
		grantGems: gems
	};
});
var pushCloudSave_createServerFn_handler = createServerRpc({
	id: "33a01b4f54aa166076641f2f72153e4607087b1e18dc1b27059a980b2b3a7064",
	name: "pushCloudSave",
	filename: "src/game/net.ts"
}, (opts) => pushCloudSave.__executeServer(opts));
var pushCloudSave = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(pushCloudSave_createServerFn_handler, async ({ context, data }) => {
	const raw = String(data.payload ?? "");
	if (!raw || raw.length > PAYLOAD_MAX) throw new Error("Save is too large.");
	JSON.parse(raw);
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	await (await getSql())`
      insert into game_saves (user_id, payload, updated_at)
      values (${context.userId}, ${raw}, now())
      on conflict (user_id) do update set payload = excluded.payload, updated_at = now()
    `;
	return { ok: true };
});
var staffStatus_createServerFn_handler = createServerRpc({
	id: "5a634201303bdd9522fa91eaeb247875276bd6a583090403868168a529ab4202",
	name: "staffStatus",
	filename: "src/game/net.ts"
}, (opts) => staffStatus.__executeServer(opts));
var staffStatus = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(staffStatus_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const mine = await asStaff(sql, context.userId);
	const count = await sql`select count(*)::int as n from staff`;
	return {
		isStaff: Boolean(mine[0]),
		canClaim: Number(count[0]?.n ?? 0) === 0
	};
});
var claimStaff_createServerFn_handler = createServerRpc({
	id: "4e2328c161c48c0d63008d38bf11f26449c43f652254d593cc3d01cc23b34404",
	name: "claimStaff",
	filename: "src/game/net.ts"
}, (opts) => claimStaff.__executeServer(opts));
var claimStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(claimStaff_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const count = await sql`select count(*)::int as n from staff`;
	if (Number(count[0]?.n ?? 0) > 0) throw new Error("Staff seat is already taken.");
	await sql`insert into staff (user_id, role) values (${context.userId}, 'admin')`;
	return {
		ok: true,
		isStaff: true
	};
});
var staffRoster_createServerFn_handler = createServerRpc({
	id: "fba7ade57cb23f7cf5d97622725f8cce14671a7cd19d74b0d7bac74d35a3acde",
	name: "staffRoster",
	filename: "src/game/net.ts"
}, (opts) => staffRoster.__executeServer(opts));
var staffRoster = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(staffRoster_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	if (!(await asStaff(sql, context.userId))[0]) throw new Error("Staff only.");
	return (await sql`
      select user_id, name, power, max_floor
      from crusaders
      order by last_seen desc
      limit 40
    `).map((r) => ({
		userId: r.user_id,
		name: r.name,
		power: Number(r.power),
		maxFloor: Number(r.max_floor)
	}));
});
var staffGrantGems_createServerFn_handler = createServerRpc({
	id: "87fb899aa326ff5eac5b6e4f1952e2b1f4767d3054467ac381a7a7d25110a3e1",
	name: "staffGrantGems",
	filename: "src/game/net.ts"
}, (opts) => staffGrantGems.__executeServer(opts));
var staffGrantGems = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(staffGrantGems_createServerFn_handler, async ({ context, data }) => {
	const { getSql } = await import("./db-DFj_wD-S.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	if (!(await asStaff(sql, context.userId))[0]) throw new Error("Staff only.");
	const target = String(data.userId ?? "").slice(0, 80);
	const gems = Math.max(1, Math.min(5e3, Math.floor(Number(data.gems) || 0)));
	if (!target) throw new Error("Pick a crusader.");
	await sql`
      insert into gem_grants (user_id, gems)
      values (${target}, ${gems})
      on conflict (user_id) do update set gems = gem_grants.gems + excluded.gems
    `;
	return {
		ok: true,
		gems
	};
});
//#endregion
export { challengeCrusader_createServerFn_handler, claimStaff_createServerFn_handler, createClan_createServerFn_handler, heartbeat_createServerFn_handler, joinClan_createServerFn_handler, leaveClan_createServerFn_handler, pullCloudSave_createServerFn_handler, pushCloudSave_createServerFn_handler, staffGrantGems_createServerFn_handler, staffRoster_createServerFn_handler, staffStatus_createServerFn_handler, strikeRaid_createServerFn_handler };
