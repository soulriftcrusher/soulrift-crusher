//#region node_modules/.nitro/vite/services/ssr/assets/shards-Btx-VvES.js
var SHARD_CAP = 1e3;
var SEASON_MS = 7776e6;
/** Season 1 opened 1 July 2026. Wars fire every 90 days after that. */
var SEASON_EPOCH = Date.parse("2026-07-01T00:00:00.000Z");
var SHARDS = [
	{
		id: "ashen-1",
		name: "Ashen Pact",
		tag: "ASH1",
		mind: "player",
		blurb: "Open server. Real crusaders. The rest of the thousand grind while you sleep.",
		joinable: true,
		basePower: 22e3,
		startPop: 140
	},
	{
		id: "ember-2",
		name: "Ember Gate",
		tag: "EMB2",
		mind: "player",
		blurb: "Open server. Hot floors, louder clans, same thousand-soul cap.",
		joinable: true,
		basePower: 2e4,
		startPop: 110
	},
	{
		id: "cut-3",
		name: "The Cut",
		tag: "CUT3",
		mind: "player",
		blurb: "Open server. Quiet at first. The rift likes the quiet ones.",
		joinable: true,
		basePower: 18e3,
		startPop: 80
	},
	{
		id: "iron-hymn",
		name: "Iron Hymn",
		tag: "HYMN",
		mind: "steady",
		blurb: "NPC server. They never skip a day. Same ritual, every dawn.",
		joinable: false,
		basePower: 4e4,
		startPop: 420
	},
	{
		id: "void-choir",
		name: "Void Choir",
		tag: "CHOIR",
		mind: "volatile",
		blurb: "NPC server. Their mind splits. Some nights they explode. Some nights they starve.",
		joinable: false,
		basePower: 45e3,
		startPop: 380
	},
	{
		id: "cinder-host",
		name: "Cinder Host",
		tag: "HOST",
		mind: "hunter",
		blurb: "NPC server. They only hunt. Lairs fall. They do not talk.",
		joinable: false,
		basePower: 5e4,
		startPop: 510
	},
	{
		id: "nightwell",
		name: "Nightwell",
		tag: "WELL",
		mind: "greedy",
		blurb: "NPC server. They hoard gold and ignore glory until the war horn.",
		joinable: false,
		basePower: 25e3,
		startPop: 290
	},
	{
		id: "rime-banner",
		name: "Rime Banner",
		tag: "RIME",
		mind: "sleeper",
		blurb: "NPC server. Silent for weeks. Then the frost moves all at once.",
		joinable: false,
		basePower: 15e3,
		startPop: 160
	}
];
function seasonClock(now = Date.now()) {
	const elapsed = Math.max(0, now - SEASON_EPOCH);
	const season = Math.floor(elapsed / SEASON_MS) + 1;
	const into = elapsed % SEASON_MS;
	const day = Math.min(90, Math.floor(into / 864e5) + 1);
	const endsAt = SEASON_EPOCH + season * SEASON_MS;
	const msLeft = Math.max(0, endsAt - now);
	return {
		season,
		day,
		endsAt,
		msLeft,
		warToday: msLeft <= 1296e5
	};
}
function hash(id, n) {
	let h = n * 1103515245 + 12345;
	for (let i = 0; i < id.length; i++) h = h * 33 + id.charCodeAt(i) >>> 0;
	return h / 4294967296;
}
function mindPop(def, day) {
	const t = Math.max(1, day);
	let per = 6;
	if (def.mind === "hunter") per = 9;
	if (def.mind === "steady") per = 8;
	if (def.mind === "volatile") per = 5;
	if (def.mind === "greedy") per = 4;
	if (def.mind === "sleeper") per = t > 40 ? 14 : 3;
	if (def.mind === "player") per = 7;
	const noise = Math.floor(hash(def.id, t) * 18 - 8);
	return Math.max(def.startPop, Math.min(SHARD_CAP, def.startPop + per * t + noise));
}
function mindPower(def, day, season) {
	const t = Math.max(1, day);
	const era = 1 + (season - 1) * .12;
	let p = def.basePower * era;
	switch (def.mind) {
		case "steady":
			p *= Math.pow(1.021, t);
			break;
		case "volatile":
			p *= Math.pow(1.03, t) * (1 + .28 * Math.sin(t * .73 + hash(def.id, season) * 6));
			break;
		case "hunter":
			p *= Math.pow(1.034, t);
			break;
		case "greedy":
			p *= Math.pow(1.018, t);
			break;
		case "sleeper":
			p *= Math.pow(1.008, Math.min(t, 42));
			if (t > 42) p *= Math.pow(1.058, t - 42);
			break;
		case "player": p *= Math.pow(1.024, t);
	}
	return Math.max(100, Math.floor(p));
}
function mindSouls(def, day) {
	const t = Math.max(1, day);
	const rate = def.mind === "greedy" ? 22 : def.mind === "hunter" ? 18 : 12;
	return Math.floor(def.startPop * .4 + rate * t * t * .15);
}
function warScore(power, pop, souls) {
	return power + pop * 40 + souls * .08;
}
function mindWill(def, day) {
	const roll = Math.floor(hash(def.id, day) * 5);
	if (def.mind === "steady") return [
		"Same dawn ritual. They refuse to miss a floor.",
		"They upgrade the back line and keep walking.",
		"Quiet ranks. Iron on iron.",
		"They bank souls for a war they already marked on the wall.",
		"A hymn at the gate. Then the grind."
	][roll];
	if (def.mind === "volatile") return [
		"Half the choir vanished into a rift. The other half doubled.",
		"They burned a tyrant for sport, then slept through the loot.",
		"A split mind. Power spiked, then ate itself.",
		"They opened three wells at once. Two screamed.",
		"No plan. Only appetite."
	][roll];
	if (def.mind === "hunter") return [
		"Four lairs taken before noon. They do not stop.",
		"They are camping a floor-boss and will not share.",
		"Cinder Host is pushing depth, not gold.",
		"A hunt horn. Then silence. Then a bigger horn.",
		"They found a realm and decided it was already theirs."
	][roll];
	if (def.mind === "greedy") return [
		"They skipped the boss to farm gold. Again.",
		"Chests only. No glory. Fat coffers.",
		"Nightwell sold a relic to buy two more relics.",
		"They are converting gems to ember in bulk.",
		"The war is coming. They are still counting coin."
	][roll];
	if (def.mind === "sleeper") return [
		"Frost. No movement on the board.",
		"A single ritual. Then they went dark.",
		"Rime Banner's power is coiled, not spent.",
		"They woke 40 floors at once. The rift noticed.",
		"Still quiet. That is the warning."
	][roll];
	return [
		"Crusaders logged in. The filler ranks kept the floors warm.",
		"Clans raided. The rest of the thousand did not wait.",
		"A few new names. The cap still has room.",
		"Local tyrants fell while you were away.",
		"The server breathes. It does not need you, but it wants you."
	][roll];
}
function mindLog(def, day) {
	return [
		0,
		1,
		2
	].map((i) => {
		const d = Math.max(1, day - i);
		return `Day ${d} · ${mindWill(def, d)}`;
	});
}
function formatSeasonLeft(ms) {
	const s = Math.max(0, Math.floor(ms / 1e3));
	const d = Math.floor(s / 86400);
	const h = Math.floor(s % 86400 / 3600);
	if (d >= 2) return `${d} days`;
	if (d === 1) return `1 day ${h}h`;
	const m = Math.floor(s % 3600 / 60);
	if (h > 0) return `${h}h ${m}m`;
	return `${m}m`;
}
//#endregion
export { mindPop as a, mindWill as c, mindLog as i, seasonClock as l, SHARD_CAP as n, mindPower as o, formatSeasonLeft as r, mindSouls as s, SHARDS as t, warScore as u };
