import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { authClient, signOut } from "./client-9XRNwJic.mjs";
import { _ as Link, y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as createServerFn } from "./ssr2.mjs";
import { n as cn, t as Button } from "./button-BFUE7HRn.mjs";
import { t as authMiddleware } from "./middleware-CzRKijGJ.mjs";
import { a as mindPop, c as mindWill, i as mindLog, l as seasonClock, o as mindPower, r as formatSeasonLeft, s as mindSouls, t as SHARDS, u as warScore } from "./shards-Btx-VvES.mjs";
import { a as createSsrRpc, n as fetchSeason, r as joinShard, t as claimSeason } from "./shard-net-HCcb23p0.mjs";
import { a as emptyBag, i as dropFor, n as RECIPES, o as lootIcon, r as craftChance, s as matchRecipe, t as LOOT } from "./loot-BoxoOkJm.mjs";
import { C as Gem, D as Beaker, E as Coins, S as Ghost, T as Flag, _ as Settings, a as User, b as Mail, c as TimerReset, d as Star, f as Sparkles, g as Share2, h as Shield, i as Users, l as Swords, m as Skull, n as VolumeX, o as Trophy, p as Smartphone, r as Volume2, t as X, u as Sword, v as MessageCircle, w as Flame, x as Globe, y as Map$1 } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/game-app-B2O2DcOG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SUFFIXES = [
	"",
	"K",
	"M",
	"B",
	"T",
	"Qa",
	"Qi",
	"Sx",
	"Sp",
	"Oc",
	"No",
	"Dc",
	"Ud",
	"Dd",
	"Td"
];
function formatNum(n) {
	if (!Number.isFinite(n)) return "∞";
	const sign = n < 0 ? "-" : "";
	let v = Math.abs(n);
	if (v < 1e3) {
		if (v === 0) return "0";
		if (v < 10 && v % 1 !== 0) return sign + v.toFixed(1);
		return sign + Math.floor(v).toLocaleString("en-US");
	}
	const exp = Math.floor(Math.log10(v) / 3);
	const idx = Math.min(exp, SUFFIXES.length - 1);
	v = v / Math.pow(10, idx * 3);
	const digits = v >= 100 ? 0 : v >= 10 ? 1 : 2;
	return sign + v.toFixed(digits) + SUFFIXES[idx];
}
function formatTime(seconds) {
	const s = Math.max(0, Math.ceil(seconds));
	const m = Math.floor(s / 60);
	const r = s % 60;
	if (m <= 0) return `${r}s`;
	return `${m}:${r.toString().padStart(2, "0")}`;
}
var HEROES = [
	{
		id: "kael",
		name: "Kael",
		title: "The Initiate",
		blurb: "A soul-forged blade and a stubborn will. Your tap is his strike.",
		role: "click",
		baseCost: 10,
		costScale: 1.07,
		baseDps: 1.4,
		baseClick: 3,
		sprite: "/sprites/kael.png",
		passive: "Click damage",
		unlockFloor: 1,
		mark: "K",
		acquire: "gold",
		gemCost: 0
	},
	{
		id: "rook",
		name: "Rook",
		title: "Ashen Guard",
		blurb: "The wall that does not yield. The line holds because he does.",
		role: "dps",
		baseCost: 40,
		costScale: 1.07,
		baseDps: 6,
		baseClick: 0,
		sprite: "/sprites/rook.png",
		passive: "+8% party damage",
		unlockFloor: 1,
		mark: "R",
		acquire: "gold",
		gemCost: 0
	},
	{
		id: "lyra",
		name: "Lyra",
		title: "Moonbow Scout",
		blurb: "Every arrow finds a heart. She never wastes a shot.",
		role: "dps",
		baseCost: 280,
		costScale: 1.07,
		baseDps: 28,
		baseClick: 0,
		sprite: "/sprites/lyra.png",
		passive: "+12% critical chance",
		unlockFloor: 1,
		mark: "L",
		acquire: "gold",
		gemCost: 0
	},
	{
		id: "vex",
		name: "Vex",
		title: "Cinder Witch",
		blurb: "She speaks in sparks and endings. Gold runs like molten wax.",
		role: "dps",
		baseCost: 1400,
		costScale: 1.07,
		baseDps: 96,
		baseClick: 0,
		sprite: "/sprites/vex.png",
		passive: "+18% gold",
		unlockFloor: 1,
		mark: "V",
		acquire: "gold",
		gemCost: 0
	},
	{
		id: "thane",
		name: "Thane",
		title: "Iron Vow",
		blurb: "A hammer for every heresy. Bosses learn his name last.",
		role: "dps",
		baseCost: 8200,
		costScale: 1.07,
		baseDps: 340,
		baseClick: 0,
		sprite: "/sprites/thane.png",
		passive: "+25% boss damage",
		unlockFloor: 1,
		mark: "T",
		acquire: "gold",
		gemCost: 0
	},
	{
		id: "sable",
		name: "Sable",
		title: "Nightfang",
		blurb: "She opens throats in the dark and never needs a second cut.",
		role: "dps",
		baseCost: 22e3,
		costScale: 1.07,
		baseDps: 720,
		baseClick: 0,
		sprite: "/sprites/sable.png",
		passive: "+40% critical damage",
		unlockFloor: 8,
		mark: "S",
		acquire: "gold",
		gemCost: 80
	},
	{
		id: "morr",
		name: "Morr",
		title: "Grave Chanter",
		blurb: "The dead keep his tempo. Souls rise when the hymn ends.",
		role: "dps",
		baseCost: 48e3,
		costScale: 1.07,
		baseDps: 1280,
		baseClick: 0,
		sprite: "/sprites/morr.png",
		passive: "+20% souls",
		unlockFloor: 1,
		mark: "M",
		acquire: "gold",
		gemCost: 0
	},
	{
		id: "iskra",
		name: "Iskra",
		title: "Stormcaller",
		blurb: "Lightning learns her name. Every tap becomes a thunderhead.",
		role: "dps",
		baseCost: 12e4,
		costScale: 1.07,
		baseDps: 3100,
		baseClick: 0,
		sprite: "/sprites/iskra.png",
		passive: "+22% click damage",
		unlockFloor: 12,
		mark: "I",
		acquire: "gold",
		gemCost: 120
	},
	{
		id: "brann",
		name: "Brann",
		title: "Ember Smith",
		blurb: "He forges coin from cinder. The dungeon pays in melted gold.",
		role: "dps",
		baseCost: 26e4,
		costScale: 1.07,
		baseDps: 6400,
		baseClick: 0,
		sprite: "/sprites/brann.png",
		passive: "+24% gold",
		unlockFloor: 16,
		mark: "B",
		acquire: "gold",
		gemCost: 140
	},
	{
		id: "devourer",
		name: "The Devourer",
		title: "Riftborn",
		blurb: "It does not hunt. It harvests. The dungeon learned to fear hunger.",
		role: "dps",
		baseCost: 4e5,
		costScale: 1.07,
		baseDps: 9800,
		baseClick: 0,
		sprite: "/sprites/devourer.png",
		passive: "+30% all damage, soul steal",
		unlockFloor: 22,
		mark: "D",
		acquire: "summon",
		gemCost: 400
	},
	{
		id: "nyx",
		name: "Nyx",
		title: "Rift Dancer",
		blurb: "She steps between seconds. Skills return before the blood dries.",
		role: "dps",
		baseCost: 11e5,
		costScale: 1.07,
		baseDps: 22e3,
		baseClick: 0,
		sprite: "/sprites/nyx.png",
		passive: "+18% skill haste",
		unlockFloor: 30,
		mark: "N",
		acquire: "summon",
		gemCost: 280
	},
	{
		id: "kira",
		name: "Kira",
		title: "Glass Knife",
		blurb: "She is paid in gems and silence. The well spat her out hungry.",
		role: "dps",
		baseCost: 24e5,
		costScale: 1.07,
		baseDps: 41e3,
		baseClick: 0,
		sprite: "/sprites/kira.png",
		passive: "+10% click and crit",
		unlockFloor: 1,
		mark: "J",
		acquire: "summon",
		gemCost: 220
	},
	{
		id: "orin",
		name: "Orin",
		title: "Gilded King",
		blurb: "He does not fight for gold. He is the price.",
		role: "dps",
		baseCost: 5e6,
		costScale: 1.07,
		baseDps: 88e3,
		baseClick: 0,
		sprite: "/sprites/orin.png",
		passive: "+28% gold",
		unlockFloor: 1,
		mark: "O",
		acquire: "gems",
		gemCost: 450
	},
	{
		id: "vorr",
		name: "Vorr",
		title: "The Unmade",
		blurb: "A name the rift still owes. Gold cannot really buy this.",
		role: "dps",
		baseCost: 0x2386f26fc10000,
		costScale: 1.07,
		baseDps: 42e4,
		baseClick: 0,
		sprite: null,
		passive: "+40% all damage",
		unlockFloor: 1,
		mark: "V",
		acquire: "gold",
		gemCost: 0
	},
	{
		id: "selene",
		name: "Selene",
		title: "Nightwell",
		blurb: "She drinks the moon and invoices the world.",
		role: "dps",
		baseCost: 1e22,
		costScale: 1.07,
		baseDps: 8e6,
		baseClick: 0,
		sprite: null,
		passive: "+35% souls and gold",
		unlockFloor: 1,
		mark: "E",
		acquire: "gold",
		gemCost: 0
	},
	{
		id: "ashur",
		name: "Ashur",
		title: "The Last Coin",
		blurb: "The final price. Empires die trying to hire him.",
		role: "dps",
		baseCost: 1e30,
		costScale: 1.07,
		baseDps: 3e8,
		baseClick: 0,
		sprite: null,
		passive: "+50% gold",
		unlockFloor: 1,
		mark: "A",
		acquire: "gold",
		gemCost: 0
	},
	{
		id: "dax",
		name: "Dax",
		title: "Ash Cleaver",
		blurb: "The axe remembers every vault door it opened.",
		role: "dps",
		baseCost: 74e5,
		costScale: 1.07,
		baseDps: 12e4,
		baseClick: 0,
		sprite: "/sprites/dax.png",
		passive: "+16% boss damage",
		unlockFloor: 18,
		mark: "X",
		acquire: "gold",
		gemCost: 160
	},
	{
		id: "wren",
		name: "Wren",
		title: "Well Shepherd",
		blurb: "She knits wounds from moss and hymn.",
		role: "dps",
		baseCost: 16e6,
		costScale: 1.07,
		baseDps: 18e4,
		baseClick: 0,
		sprite: "/sprites/wren.png",
		passive: "+12% party damage",
		unlockFloor: 20,
		mark: "W",
		acquire: "gold",
		gemCost: 180
	},
	{
		id: "jora",
		name: "Jora",
		title: "Rime Bow",
		blurb: "Frost learns the shape of her arrows.",
		role: "dps",
		baseCost: 38e6,
		costScale: 1.07,
		baseDps: 26e4,
		baseClick: 0,
		sprite: "/sprites/jora.png",
		passive: "+10% critical chance",
		unlockFloor: 24,
		mark: "J",
		acquire: "summon",
		gemCost: 300
	},
	{
		id: "pike",
		name: "Pike",
		title: "Long Debt",
		blurb: "A spear paid for in other men's names.",
		role: "dps",
		baseCost: 9e7,
		costScale: 1.07,
		baseDps: 41e4,
		baseClick: 0,
		sprite: "/sprites/pike.png",
		passive: "+14% click damage",
		unlockFloor: 28,
		mark: "P",
		acquire: "gold",
		gemCost: 200
	}
];
var RELICS = [
	{
		id: "blood-sigil",
		name: "Blood Sigil",
		blurb: "Party damage +12% per rank.",
		baseCost: 3,
		costScale: 1.55
	},
	{
		id: "gilded-chalice",
		name: "Gilded Chalice",
		blurb: "Gold finds +14% per rank.",
		baseCost: 4,
		costScale: 1.55
	},
	{
		id: "soul-lamp",
		name: "Soul Lamp",
		blurb: "Ritual souls +16% per rank.",
		baseCost: 5,
		costScale: 1.6
	},
	{
		id: "click-relic",
		name: "Ashen Gauntlet",
		blurb: "Click damage +18% per rank.",
		baseCost: 3,
		costScale: 1.5
	},
	{
		id: "boss-bane",
		name: "Boss Bane",
		blurb: "Boss damage +15% per rank.",
		baseCost: 6,
		costScale: 1.6
	},
	{
		id: "world-anchor",
		name: "World Anchor",
		blurb: "Start +4 floors after ritual.",
		baseCost: 8,
		costScale: 1.65
	},
	{
		id: "hourglass",
		name: "Rift Hourglass",
		blurb: "Skill duration +10% per rank.",
		baseCost: 5,
		costScale: 1.55
	},
	{
		id: "fortune-fang",
		name: "Fortune Fang",
		blurb: "Critical chance +4% per rank.",
		baseCost: 6,
		costScale: 1.55
	},
	{
		id: "silent-bell",
		name: "Silent Bell",
		blurb: "Skill haste +7% per rank.",
		baseCost: 7,
		costScale: 1.6
	},
	{
		id: "coffer-key",
		name: "Coffer Key",
		blurb: "Chests and offline gold.",
		baseCost: 4,
		costScale: 1.5
	}
];
var SKILLS = [
	{
		id: "strike",
		name: "Soul Strike",
		blurb: "A heavy tap that always crits.",
		cooldown: 8,
		duration: 0
	},
	{
		id: "goldrush",
		name: "Gold Rush",
		blurb: "Double gold for a short hunt.",
		cooldown: 28,
		duration: 12
	},
	{
		id: "rage",
		name: "Bloodrage",
		blurb: "Double party damage.",
		cooldown: 30,
		duration: 10
	},
	{
		id: "harvest",
		name: "Dark Harvest",
		blurb: "Cut a slice of the beast's life.",
		cooldown: 16,
		duration: 0
	}
];
var SCIENCES = [
	{
		id: "war",
		name: "War",
		blurb: "Party damage +10% per rank.",
		baseCost: 12,
		costScale: 1.45
	},
	{
		id: "greed",
		name: "Greed",
		blurb: "Gold finds +12% per rank.",
		baseCost: 12,
		costScale: 1.45
	},
	{
		id: "hunger",
		name: "Hunger",
		blurb: "Souls +12% per rank.",
		baseCost: 14,
		costScale: 1.5
	},
	{
		id: "tempo",
		name: "Tempo",
		blurb: "Skill haste +8% per rank.",
		baseCost: 16,
		costScale: 1.5
	},
	{
		id: "fortune",
		name: "Fortune",
		blurb: "Critical chance +3% per rank.",
		baseCost: 18,
		costScale: 1.5
	},
	{
		id: "depth",
		name: "Depth",
		blurb: "Start +3 floors after ritual.",
		baseCost: 20,
		costScale: 1.55
	}
];
var MILESTONES = [
	10,
	25,
	50,
	100,
	250,
	500,
	1e3,
	2500
];
var ARENA_FOES = [
	"Ashen Pact",
	"Rime Banner",
	"Cinder Host",
	"Void Choir",
	"Gilded Teeth",
	"Nightwell",
	"Iron Hymn",
	"Last Coin"
];
var TRASH = [
	"rat",
	"skeleton",
	"slime",
	"spider",
	"bat",
	"wraith",
	"brute",
	"golem",
	"ghoul",
	"beetle",
	"hound"
];
var MONSTER_NAMES = {
	rat: [
		"Crypt Rat",
		"Bone Gnawer",
		"Sewer King"
	],
	skeleton: [
		"Ash Skeleton",
		"Rattle Guard",
		"Vault Bones"
	],
	slime: [
		"Cinder Slime",
		"Gold Jelly",
		"Well Pudding"
	],
	spider: [
		"Vault Spider",
		"Widow of the Crypt",
		"Rift Spinner"
	],
	bat: [
		"Tomb Bat",
		"Screech",
		"Night Fang"
	],
	wraith: [
		"Ash Wraith",
		"Name-Eater",
		"Pale Hymn"
	],
	brute: [
		"Crypt Brute",
		"Iron Thug",
		"Oathbreaker"
	],
	golem: [
		"Vault Golem",
		"Ember Statue",
		"Rune Hulk"
	],
	tyrant: [
		"Floor Tyrant",
		"Crown of Bone",
		"The Warden"
	],
	wyrm: [
		"Ash Wyrm",
		"Cinder Serpent",
		"Rift Drake"
	],
	riftmaw: [
		"Riftmaw",
		"The Cut",
		"Hunger Given Shape"
	],
	ghoul: [
		"Crypt Ghoul",
		"Name Chewer",
		"Pale Hunger"
	],
	beetle: [
		"Tomb Beetle",
		"Vault Shell",
		"Rune Tick"
	],
	serpent: [
		"Rime Serpent",
		"Coil of Frost",
		"Well Snake"
	],
	harpy: [
		"Ash Harpy",
		"Screech Queen",
		"Rift Wing"
	],
	lich: [
		"Floor Lich",
		"Last Chanter",
		"Bone Crown"
	],
	hound: [
		"Grave Hound",
		"Ash Wolf",
		"Night Pack"
	]
};
function monsterKindFor(floor, boss, avoid) {
	const pool = boss ? floor >= 40 ? [
		"tyrant",
		"wyrm",
		"riftmaw",
		"lich",
		"harpy"
	] : [
		"tyrant",
		"brute",
		"golem",
		"wraith",
		"serpent",
		"hound"
	] : floor >= 25 ? [
		...TRASH,
		"wyrm",
		"harpy",
		"serpent"
	] : [...TRASH];
	const opts = avoid ? pool.filter((k) => k !== avoid) : pool;
	const use = opts.length ? opts : pool;
	return use[Math.floor(Math.random() * use.length)];
}
function monsterName(kind, floor) {
	const list = MONSTER_NAMES[kind];
	return list[floor % list.length];
}
function biomeFor(floor) {
	if (floor >= 100) return "soulwell";
	if (floor >= 70) return "void";
	if (floor >= 30) return "ember";
	if (floor >= 12) return "frost";
	return "crypt";
}
function heroPortrait(id) {
	return `/portraits/${id}.jpg`;
}
function heroStars(hero, gilds) {
	let s = 1;
	if (hero.unlockFloor >= 8) s = 2;
	if (hero.unlockFloor >= 16) s = 3;
	if (hero.acquire === "summon") s = 4;
	if (hero.acquire === "gems") s = 5;
	if (hero.baseCost >= 0xe8d4a51000) s = 5;
	return Math.min(5, s + Math.max(0, gilds));
}
var CONTRACTS = {
	slay: {
		title: (n) => `Slay ${n} beasts`,
		next: (p) => Math.max(20, p.kills + 25)
	},
	depth: {
		title: (n) => `Reach floor ${n}`,
		next: (p) => p.maxFloor + 8
	},
	tyrants: {
		title: (n) => `Fell ${n} tyrants`,
		next: (p) => Math.max(2, p.bossKills + 2)
	},
	hire: {
		title: (n) => `Hire ${n} crusaders`,
		next: (p) => Math.min(HEROES.length, p.hires + 2)
	},
	crits: {
		title: (n) => `Land ${n} crits`,
		next: (p) => Math.max(8, p.crits + 12)
	},
	arena: {
		title: (n) => `Win ${n} arena bouts`,
		next: (p) => Math.max(1, p.arenaWins + 2)
	},
	gold: {
		title: (n) => `Loot ${n} gold`,
		next: (p) => Math.max(200, Math.floor(p.lootGold * 1.4) || 400)
	},
	ritual: {
		title: (n) => `Complete ${n} rituals`,
		next: (p) => p.rituals + 1
	}
};
function contractProgress(kind, p) {
	switch (kind) {
		case "slay": return p.kills;
		case "depth": return p.maxFloor;
		case "tyrants": return p.bossKills;
		case "hire": return p.hires;
		case "crits": return p.crits;
		case "arena": return p.arenaWins;
		case "gold": return Math.floor(p.lootGold);
		case "ritual": return p.rituals;
	}
}
function rollContracts(p) {
	const kinds = [
		"slay",
		"depth",
		"tyrants",
		"hire",
		"crits",
		"gold"
	];
	if (p.maxFloor >= 5) kinds.push("arena");
	if (p.maxFloor >= 12) kinds.push("ritual");
	return kinds.slice(0, 4).map((kind, i) => {
		const def = CONTRACTS[kind];
		const goal = Math.max(1, def.next(p));
		const gold = Math.floor(40 * Math.pow(1.35, Math.max(0, p.maxFloor / 8)) * (i + 1));
		return {
			kind,
			title: def.title(goal),
			goal,
			progress: 0,
			claimed: false,
			gold,
			souls: i === 0 ? 1 : 0,
			chests: i === 2 ? 1 : 0,
			influence: 4 + i * 2
		};
	});
}
var REALMS = [
	{
		id: "crypt",
		name: "Ashen Crypt",
		title: "The first dark",
		blurb: "Bone and silence. Every crusade starts in the vaults.",
		minFloor: 1,
		art: "/bg/crypt.jpg",
		biome: "crypt"
	},
	{
		id: "frost",
		name: "Rime Vaults",
		title: "Black ice",
		blurb: "The dead keep their shape in the cold.",
		minFloor: 12,
		art: "/bg/frost.jpg",
		biome: "frost"
	},
	{
		id: "ember",
		name: "Ember Forge",
		title: "Cinder halls",
		blurb: "Gold runs liquid. The walls remember fire.",
		minFloor: 30,
		art: "/bg/ember.jpg",
		biome: "ember"
	},
	{
		id: "void",
		name: "Void Rift",
		title: "The cut",
		blurb: "A wound in the world. Heroes come back thinner.",
		minFloor: 70,
		art: "/bg/void.jpg",
		biome: "void"
	},
	{
		id: "soulwell",
		name: "Soul Well",
		title: "The harvest",
		blurb: "Where names go when the ritual ends.",
		minFloor: 100,
		art: "/bg/soulwell.jpg",
		biome: "soulwell"
	}
];
var WEAPONS = [
	{
		id: "ash-blade",
		name: "Ash Blade",
		blurb: "Click damage +14% per rank.",
		goldCost: 180,
		gemCost: 0,
		costScale: 1.18
	},
	{
		id: "moon-string",
		name: "Moon String",
		blurb: "Critical chance +3% per rank.",
		goldCost: 900,
		gemCost: 0,
		costScale: 1.2
	},
	{
		id: "iron-maul",
		name: "Iron Maul",
		blurb: "Boss damage +12% per rank.",
		goldCost: 4200,
		gemCost: 0,
		costScale: 1.22
	},
	{
		id: "cinder-rod",
		name: "Cinder Rod",
		blurb: "Gold finds +12% per rank.",
		goldCost: 16e3,
		gemCost: 0,
		costScale: 1.22
	},
	{
		id: "rift-fang",
		name: "Rift Fang",
		blurb: "Party damage +16% per rank. Bought with gems.",
		goldCost: 0,
		gemCost: 180,
		costScale: 1.25
	}
];
var SOCKETS = [
	{
		id: "ruby",
		name: "Blood Ruby",
		blurb: "+18% party damage while socketed.",
		gemCost: 120
	},
	{
		id: "sapphire",
		name: "Gilt Sapphire",
		blurb: "+18% gold while socketed.",
		gemCost: 120
	},
	{
		id: "emerald",
		name: "Rift Emerald",
		blurb: "+8% critical chance while socketed.",
		gemCost: 150
	}
];
var GEM_PACKS = [
	{
		id: "purse",
		name: "Rift Purse",
		gems: 80,
		usd: "$0.99",
		tag: ""
	},
	{
		id: "coffer",
		name: "Cinder Coffer",
		gems: 500,
		usd: "$4.99",
		tag: "Best"
	},
	{
		id: "vault",
		name: "Void Vault",
		gems: 1200,
		usd: "$9.99",
		tag: ""
	},
	{
		id: "hoard",
		name: "Tyrant Hoard",
		gems: 2800,
		usd: "$19.99",
		tag: ""
	}
];
function realmByFloor(floor) {
	if (floor >= 100) return "soulwell";
	if (floor >= 70) return "void";
	if (floor >= 30) return "ember";
	if (floor >= 12) return "frost";
	return "crypt";
}
function realmRange(id) {
	const i = REALMS.findIndex((r) => r.id === id);
	return {
		min: REALMS[i]?.minFloor ?? 1,
		max: REALMS[i + 1] ? REALMS[i + 1].minFloor - 1 : 9999
	};
}
var EVENTS = [
	{
		id: "gold",
		name: "Gold Fever",
		blurb: "Gold finds +50%. Event points on every kill."
	},
	{
		id: "tyrant",
		name: "Tyrant Night",
		blurb: "Bosses drop runes more often. Points per tyrant."
	},
	{
		id: "siege",
		name: "Siege Rally",
		blurb: "Siege points doubled while you hold a lair."
	}
];
var RUNE_NAMES = {
	dps: [
		"War Mark",
		"Blood Rune",
		"Ash Brand"
	],
	gold: [
		"Gilt Rune",
		"Coin Brand",
		"Hoard Mark"
	],
	crit: [
		"Fang Rune",
		"Lucky Cut",
		"Eye Brand"
	],
	click: [
		"Tap Brand",
		"Gauntlet Rune",
		"Strike Mark"
	],
	soul: [
		"Hymn Rune",
		"Grave Brand",
		"Well Mark"
	],
	siege: [
		"Banner Rune",
		"Lair Brand",
		"Camp Mark"
	]
};
var RARITY_NAME = [
	"",
	"Common",
	"Rare",
	"Epic",
	"Legend"
];
var RARITY_VALUE = {
	1: .04,
	2: .08,
	3: .14,
	4: .22
};
var LEGENDS = {
	kael: {
		name: "First Cut",
		blurb: "Click damage +28%.",
		unlock: 25
	},
	rook: {
		name: "Unbroken Line",
		blurb: "Party damage +14%.",
		unlock: 25
	},
	lyra: {
		name: "Moonseeker",
		blurb: "Critical chance +10%.",
		unlock: 25
	},
	vex: {
		name: "Molten Tithe",
		blurb: "Gold finds +22%.",
		unlock: 25
	},
	thane: {
		name: "Oathbreaker",
		blurb: "Boss damage +32%.",
		unlock: 25
	},
	sable: {
		name: "Night Vein",
		blurb: "Critical damage +30%.",
		unlock: 25
	},
	morr: {
		name: "Last Hymn",
		blurb: "Souls +18%.",
		unlock: 25
	},
	iskra: {
		name: "Thunderhead",
		blurb: "Click damage +20%.",
		unlock: 25
	},
	brann: {
		name: "Cinder Purse",
		blurb: "Gold finds +16%.",
		unlock: 25
	},
	devourer: {
		name: "Harvest Maw",
		blurb: "Party damage +16%. Soul steal more often.",
		unlock: 25
	},
	nyx: {
		name: "Between Seconds",
		blurb: "Skill haste +14%.",
		unlock: 25
	},
	kira: {
		name: "Glass Edge",
		blurb: "Click +8% and crit +6%.",
		unlock: 25
	},
	orin: {
		name: "King's Due",
		blurb: "Gold finds +20%.",
		unlock: 25
	},
	vorr: {
		name: "Unmade Name",
		blurb: "Party damage +40%.",
		unlock: 25
	},
	selene: {
		name: "Moon Invoice",
		blurb: "Gold and souls +35%.",
		unlock: 25
	},
	ashur: {
		name: "Final Price",
		blurb: "Gold finds +50%.",
		unlock: 25
	},
	dax: {
		name: "Vault Split",
		blurb: "Boss damage +20%.",
		unlock: 25
	},
	wren: {
		name: "Well Stitch",
		blurb: "Party damage +12%.",
		unlock: 25
	},
	jora: {
		name: "Rime Nock",
		blurb: "Critical chance +8%.",
		unlock: 25
	},
	pike: {
		name: "Named Point",
		blurb: "Click damage +16%.",
		unlock: 25
	}
};
var HERO_CRAFTS = {
	kael: {
		name: "Soulforged Blade",
		blurb: "Kael's damage +10% per rank."
	},
	rook: {
		name: "Ashen Wall",
		blurb: "Rook's damage +10% per rank."
	},
	lyra: {
		name: "Moonlimb Bow",
		blurb: "Lyra's damage +10% per rank."
	},
	vex: {
		name: "Cinder Staff",
		blurb: "Vex's damage +10% per rank."
	},
	thane: {
		name: "Vow Hammer",
		blurb: "Thane's damage +10% per rank."
	},
	sable: {
		name: "Nightfangs",
		blurb: "Sable's damage +10% per rank."
	},
	morr: {
		name: "Grave Bell",
		blurb: "Morr's damage +10% per rank."
	},
	iskra: {
		name: "Storm Rod",
		blurb: "Iskra's damage +10% per rank."
	},
	brann: {
		name: "Ember Tongs",
		blurb: "Brann's damage +10% per rank."
	},
	devourer: {
		name: "Rift Jaw",
		blurb: "Devourer's damage +10% per rank."
	},
	nyx: {
		name: "Second Step",
		blurb: "Nyx's damage +10% per rank."
	},
	kira: {
		name: "Glass Knife",
		blurb: "Kira's damage +10% per rank."
	},
	orin: {
		name: "Gilded Scepter",
		blurb: "Orin's damage +10% per rank."
	},
	vorr: {
		name: "Unmade Core",
		blurb: "Vorr's damage +10% per rank."
	},
	selene: {
		name: "Nightwell Chalice",
		blurb: "Selene's damage +10% per rank."
	},
	ashur: {
		name: "Last Coin",
		blurb: "Ashur's damage +10% per rank."
	},
	dax: {
		name: "Ash Cleaver",
		blurb: "Dax's damage +10% per rank."
	},
	wren: {
		name: "Moss Crook",
		blurb: "Wren's damage +10% per rank."
	},
	jora: {
		name: "Rime Limb",
		blurb: "Jora's damage +10% per rank."
	},
	pike: {
		name: "Long Debt",
		blurb: "Pike's damage +10% per rank."
	}
};
var SIEGE_LAIRS = [
	{
		id: "crypt",
		name: "Bone Keep",
		bonus: "+8% gold"
	},
	{
		id: "frost",
		name: "Rime Spire",
		bonus: "+8% click"
	},
	{
		id: "ember",
		name: "Cinder Hold",
		bonus: "+8% party damage"
	},
	{
		id: "void",
		name: "Cut Gate",
		bonus: "+8% souls"
	},
	{
		id: "soulwell",
		name: "Well Crown",
		bonus: "+10% event points"
	}
];
function dayKey(now = Date.now()) {
	return new Date(now).toISOString().slice(0, 10);
}
function eventForDay(day) {
	let n = 0;
	for (let i = 0; i < day.length; i++) n += day.charCodeAt(i);
	return EVENTS[n % EVENTS.length];
}
function craftCost(rank) {
	return {
		ember: 6 + rank * 8,
		bone: 10 + rank * 10
	};
}
function runeSlots(level) {
	if (level <= 0) return 0;
	if (level >= 75) return 3;
	if (level >= 25) return 2;
	return 1;
}
function mintRune(seed, floor, boss) {
	const stats = [
		"dps",
		"gold",
		"crit",
		"click",
		"soul",
		"siege"
	];
	const stat = stats[Math.abs(seed) % stats.length];
	let rarity = 1;
	const roll = Math.abs(seed * 17 + floor) % 100 / 100;
	if (boss) {
		if (roll > .92) rarity = 4;
		else if (roll > .72) rarity = 3;
		else if (roll > .4) rarity = 2;
	} else if (roll > .97) rarity = 3;
	else if (roll > .82) rarity = 2;
	const names = RUNE_NAMES[stat];
	const name = names[rarity - 1] ?? names[0];
	return {
		id: `rn-${seed.toString(36)}-${Date.now().toString(36).slice(-4)}`,
		name,
		stat,
		value: RARITY_VALUE[rarity] * (1 + Math.min(.4, floor / 200)),
		rarity
	};
}
var EVENT_SHOP = [
	{
		id: "ember-pack",
		name: "8 ember",
		cost: 40,
		kind: "ember"
	},
	{
		id: "rune-bag",
		name: "Random rune",
		cost: 70,
		kind: "rune"
	},
	{
		id: "chest",
		name: "Event chest",
		cost: 55,
		kind: "chest"
	},
	{
		id: "rift",
		name: "6 rift dust",
		cost: 50,
		kind: "rift"
	}
];
var SAVE_KEY = "soulrift-crusher-save-2";
function emptySlots() {
	const o = {};
	for (const h of HEROES) o[h.id] = [
		null,
		null,
		null
	];
	return o;
}
function emptyLevels(ids) {
	const o = {};
	for (const id of ids) o[id] = 0;
	return o;
}
function emptyFlags(ids) {
	const o = {};
	for (const id of ids) o[id] = false;
	return o;
}
function defaultState(now = Date.now()) {
	const heroLevel = emptyLevels(HEROES.map((h) => h.id));
	heroLevel.kael = 1;
	const base = {
		version: 6,
		gold: 24,
		souls: 0,
		gems: 40,
		influence: 0,
		chests: 0,
		floor: 1,
		maxFloor: 1,
		farm: false,
		heroLevel,
		heroGild: emptyLevels(HEROES.map((h) => h.id)),
		relicLevel: emptyLevels(RELICS.map((r) => r.id)),
		scienceLevel: emptyLevels(SCIENCES.map((s) => s.id)),
		skillCd: emptyLevels(SKILLS.map((s) => s.id)),
		skillActive: emptyLevels(SKILLS.map((s) => s.id)),
		weaponLevel: emptyLevels(WEAPONS.map((w) => w.id)),
		socket: null,
		socketsOwned: emptyFlags(SOCKETS.map((s) => s.id)),
		founderClaimed: false,
		lastFreeWell: "",
		kills: 0,
		clicks: 0,
		rituals: 0,
		crits: 0,
		bossKills: 0,
		hires: 1,
		lootGold: 0,
		arenaWins: 0,
		arenaLosses: 0,
		arenaCharges: 5,
		arenaRegen: 0,
		contracts: [],
		quests: {},
		lastSaveAt: now,
		startedAt: now,
		ember: 16,
		bone: 24,
		riftDust: 0,
		runes: [],
		heroRunes: emptySlots(),
		heroCraft: emptyLevels(HEROES.map((h) => h.id)),
		heroPrestige: emptyLevels(HEROES.map((h) => h.id)),
		eventDay: dayKey(now),
		eventPts: 0,
		siegeLair: "crypt",
		siegePts: 0,
		siegeReadyAt: 0,
		arenaChest: 0,
		bag: emptyBag()
	};
	base.bag.skull = 6;
	base.bag.jaw = 4;
	base.bag.ticket = 1;
	base.contracts = rollContracts({
		kills: 0,
		maxFloor: 1,
		bossKills: 0,
		hires: 1,
		crits: 0,
		arenaWins: 0,
		lootGold: 0,
		rituals: 0
	});
	return base;
}
function migrate(raw) {
	const base = defaultState(raw.lastSaveAt ?? Date.now());
	const merged = {
		...base,
		...raw,
		heroLevel: {
			...base.heroLevel,
			...raw.heroLevel
		},
		heroGild: {
			...base.heroGild,
			...raw.heroGild
		},
		relicLevel: {
			...base.relicLevel,
			...raw.relicLevel
		},
		scienceLevel: {
			...base.scienceLevel,
			...raw.scienceLevel
		},
		skillCd: {
			...base.skillCd,
			...raw.skillCd
		},
		skillActive: {
			...base.skillActive,
			...raw.skillActive
		},
		weaponLevel: {
			...base.weaponLevel,
			...raw.weaponLevel
		},
		socketsOwned: {
			...base.socketsOwned,
			...raw.socketsOwned
		},
		heroRunes: {
			...base.heroRunes,
			...raw.heroRunes
		},
		heroCraft: {
			...base.heroCraft,
			...raw.heroCraft
		},
		heroPrestige: {
			...base.heroPrestige,
			...raw.heroPrestige ?? {}
		},
		runes: Array.isArray(raw.runes) ? raw.runes : [],
		quests: {
			...base.quests,
			...raw.quests
		},
		bag: {
			...base.bag,
			...raw.bag && typeof raw.bag === "object" ? raw.bag : {}
		},
		contracts: Array.isArray(raw.contracts) && raw.contracts.length ? raw.contracts : base.contracts,
		version: 6
	};
	if (merged.heroLevel.kael < 1) merged.heroLevel.kael = 1;
	if (merged.floor < 1) merged.floor = 1;
	if (!Number.isFinite(merged.influence)) merged.influence = 0;
	if (!Number.isFinite(merged.gems)) merged.gems = 40;
	if (!Number.isFinite(merged.chests)) merged.chests = 0;
	if (!Number.isFinite(merged.arenaCharges)) merged.arenaCharges = 5;
	if (merged.hires < 1) merged.hires = 1;
	if (!Number.isFinite(merged.ember)) merged.ember = 16;
	if (!Number.isFinite(merged.bone)) merged.bone = 24;
	if (merged.ember + merged.bone < 8) {
		merged.ember = Math.max(merged.ember, 16);
		merged.bone = Math.max(merged.bone, 24);
	}
	if (!Number.isFinite(merged.riftDust)) merged.riftDust = 0;
	if (!Array.isArray(merged.runes)) merged.runes = [];
	if (!Number.isFinite(merged.eventPts)) merged.eventPts = 0;
	if (!Number.isFinite(merged.siegePts)) merged.siegePts = 0;
	if (!Number.isFinite(merged.arenaChest)) merged.arenaChest = 0;
	if (!merged.eventDay) merged.eventDay = dayKey();
	if (!merged.bag) merged.bag = emptyBag();
	return merged;
}
function loadState() {
	const fallback = defaultState();
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return {
			state: fallback,
			offlineSeconds: 0
		};
		const state = migrate(JSON.parse(raw));
		return {
			state,
			offlineSeconds: Math.max(0, (Date.now() - (state.lastSaveAt || Date.now())) / 1e3)
		};
	} catch {
		return {
			state: fallback,
			offlineSeconds: 0
		};
	}
}
function persistState(state) {
	try {
		const payload = {
			...state,
			lastSaveAt: Date.now(),
			version: 6
		};
		const prev = localStorage.getItem(SAVE_KEY);
		if (prev) localStorage.setItem(SAVE_KEY + ":bak", prev);
		localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
	} catch {}
}
function clearSave() {
	try {
		localStorage.removeItem(SAVE_KEY);
		localStorage.removeItem(SAVE_KEY + ":bak");
	} catch {}
}
function hasSave() {
	try {
		return Boolean(localStorage.getItem(SAVE_KEY));
	} catch {
		return false;
	}
}
function applyIncoming(raw) {
	if (!raw || typeof raw !== "object") return defaultState();
	return migrate(raw);
}
function geometricSum(base, scale, from, n) {
	if (n <= 0) return 0;
	if (Math.abs(scale - 1) < 1e-9) return base * n;
	return base * Math.pow(scale, from) * ((Math.pow(scale, n) - 1) / (scale - 1));
}
function milestoneMult(level) {
	let m = 1;
	for (const t of MILESTONES) if (level >= t) m *= 2;
	return m;
}
var GameSim = class {
	state;
	monster;
	combo = 0;
	comboTimer = 0;
	events = [];
	attackCd;
	lastArena = null;
	saveAcc = 0;
	offlineGold = 0;
	constructor() {
		const { state, offlineSeconds } = loadState();
		this.state = state;
		this.attackCd = {};
		for (const h of HEROES) this.attackCd[h.id] = .2 + Math.random() * .6;
		this.monster = this.makeMonster(state.floor, this.isBossFloor(state.floor) && !state.farm);
		this.ensureEvent();
		if (offlineSeconds > 8) {
			const capped = Math.min(offlineSeconds, 28800);
			const extra = this.dps() * .18 * capped * this.goldMult() * this.offlineMult();
			this.offlineGold = extra;
			this.state.gold += extra;
			this.state.lootGold += extra;
		}
	}
	takeOfflineGold() {
		const g = this.offlineGold;
		this.offlineGold = 0;
		return g;
	}
	emit(e) {
		this.events.push(e);
		if (this.events.length > 80) this.events.splice(0, this.events.length - 80);
	}
	drain() {
		const e = this.events;
		this.events = [];
		return e;
	}
	progress() {
		return {
			kills: this.state.kills,
			maxFloor: this.state.maxFloor,
			bossKills: this.state.bossKills,
			hires: this.state.hires,
			crits: this.state.crits,
			arenaWins: this.state.arenaWins,
			lootGold: this.state.lootGold,
			rituals: this.state.rituals
		};
	}
	isBossFloor(floor) {
		return floor > 1 && floor % 10 === 0;
	}
	makeMonster(floor, boss) {
		const kind = monsterKindFor(floor, boss, this.monster?.kind);
		const hp = this.monsterHp(floor, boss);
		const timerMax = boss ? 30 + Math.min(18, Math.floor(floor / 35)) : 0;
		return {
			hp,
			max: hp,
			kind,
			name: monsterName(kind, floor),
			isBoss: boss,
			timer: timerMax,
			timerMax,
			artScale: (boss ? 1.15 : .82) + Math.random() * .28
		};
	}
	monsterHp(floor, boss) {
		const base = 14 * Math.pow(1.55, floor - 1);
		const wave = Math.pow(1.08, Math.floor((floor - 1) / 10));
		return Math.max(8, Math.floor(base * wave * (boss ? 7.5 : 1)));
	}
	monsterGold(floor, boss) {
		const hp = this.monsterHp(floor, false);
		return Math.max(5, Math.floor(hp / 4.2 * (boss ? 3.4 : 1)));
	}
	relicRank(id) {
		return this.state.relicLevel[id] ?? 0;
	}
	scienceRank(id) {
		return this.state.scienceLevel[id] ?? 0;
	}
	goldMult() {
		let m = 1 + this.relicRank("gilded-chalice") * .14;
		m *= 1 + this.scienceRank("greed") * .12;
		m *= 1 + this.weaponRank("cinder-rod") * .12;
		m *= 1 + this.runeBonus("gold");
		if (this.state.socket === "sapphire") m *= 1.18;
		if ((this.state.heroLevel.vex ?? 0) > 0) m *= 1.18;
		if ((this.state.heroLevel.brann ?? 0) > 0) m *= 1.24;
		if ((this.state.heroLevel.orin ?? 0) > 0) m *= 1.28;
		if (this.legendOn("selene")) m *= 1.35;
		if (this.legendOn("ashur") || (this.state.heroLevel.ashur ?? 0) > 0) m *= 1.5;
		if (this.legendOn("vex")) m *= 1.22;
		if (this.legendOn("brann")) m *= 1.16;
		if (this.legendOn("orin")) m *= 1.2;
		if (this.state.skillActive.goldrush > 0) m *= 2;
		if (this.activeEvent() === "gold") m *= 1.5;
		if (this.state.siegeLair === "crypt") m *= 1.08;
		return m;
	}
	dpsMult() {
		let m = 1 + this.relicRank("blood-sigil") * .12;
		m *= 1 + this.scienceRank("war") * .1;
		m *= 1 + this.weaponRank("rift-fang") * .16;
		m *= 1 + this.runeBonus("dps");
		if (this.state.socket === "ruby") m *= 1.18;
		if ((this.state.heroLevel.rook ?? 0) > 0) m *= 1.08;
		if ((this.state.heroLevel.wren ?? 0) > 0) m *= 1.12;
		if ((this.state.heroLevel.devourer ?? 0) > 0) m *= 1.3;
		if ((this.state.heroLevel.vorr ?? 0) > 0) m *= 1.4;
		if (this.legendOn("rook")) m *= 1.14;
		if (this.legendOn("devourer")) m *= 1.16;
		if (this.state.skillActive.rage > 0) m *= 2;
		if (this.state.siegeLair === "ember") m *= 1.08;
		return m;
	}
	clickMult() {
		let m = 1 + this.relicRank("click-relic") * .18;
		m *= 1 + this.weaponRank("ash-blade") * .14;
		m *= 1 + this.runeBonus("click");
		if ((this.state.heroLevel.iskra ?? 0) > 0) m *= 1.22;
		if ((this.state.heroLevel.pike ?? 0) > 0) m *= 1.14;
		if ((this.state.heroLevel.kira ?? 0) > 0) m *= 1.1;
		if (this.legendOn("kael")) m *= 1.28;
		if (this.legendOn("iskra")) m *= 1.2;
		if (this.legendOn("kira")) m *= 1.08;
		if (this.state.siegeLair === "frost") m *= 1.08;
		m *= 1 + this.combo * .12;
		return m;
	}
	critChance() {
		let c = .08;
		if ((this.state.heroLevel.lyra ?? 0) > 0) c += .12;
		if ((this.state.heroLevel.jora ?? 0) > 0) c += .1;
		if ((this.state.heroLevel.kira ?? 0) > 0) c += .05;
		if (this.legendOn("lyra")) c += .1;
		if (this.legendOn("kira")) c += .06;
		c += this.relicRank("fortune-fang") * .04;
		c += this.scienceRank("fortune") * .03;
		c += this.weaponRank("moon-string") * .03;
		c += this.runeBonus("crit");
		if (this.state.socket === "emerald") c += .08;
		return Math.min(.7, c);
	}
	critMult() {
		let m = 3.2;
		if ((this.state.heroLevel.sable ?? 0) > 0) m *= 1.4;
		if (this.legendOn("sable")) m *= 1.3;
		return m;
	}
	bossMult() {
		let m = 1 + this.relicRank("boss-bane") * .15;
		m *= 1 + this.weaponRank("iron-maul") * .12;
		if ((this.state.heroLevel.thane ?? 0) > 0) m *= 1.25;
		if ((this.state.heroLevel.dax ?? 0) > 0) m *= 1.16;
		if (this.legendOn("thane")) m *= 1.32;
		return m;
	}
	soulMult() {
		let m = 1 + this.relicRank("soul-lamp") * .16;
		m *= 1 + this.scienceRank("hunger") * .12;
		m *= 1 + this.runeBonus("soul");
		if ((this.state.heroLevel.morr ?? 0) > 0) m *= 1.2;
		if (this.legendOn("morr")) m *= 1.18;
		if (this.legendOn("selene") || (this.state.heroLevel.selene ?? 0) > 0) m *= 1.35;
		if (this.state.siegeLair === "void") m *= 1.08;
		return m;
	}
	skillHaste() {
		let h = 0;
		if ((this.state.heroLevel.nyx ?? 0) > 0) h += .18;
		if (this.legendOn("nyx")) h += .14;
		h += this.relicRank("silent-bell") * .07;
		h += this.scienceRank("tempo") * .08;
		return h;
	}
	skillDurationMult() {
		return 1 + this.relicRank("hourglass") * .1;
	}
	offlineMult() {
		return 1 + this.relicRank("coffer-key") * .12;
	}
	startFloorAfterRitual() {
		return 1 + this.relicRank("world-anchor") * 4 + this.scienceRank("depth") * 3;
	}
	ensureEvent() {
		const day = dayKey();
		if (this.state.eventDay !== day) {
			this.state.eventDay = day;
			this.state.eventPts = 0;
		}
	}
	activeEvent() {
		this.ensureEvent();
		return eventForDay(this.state.eventDay).id;
	}
	legendOn(id) {
		return (this.state.heroLevel[id] ?? 0) >= LEGENDS[id].unlock;
	}
	runeBonus(stat) {
		let v = 0;
		const bag = this.state.runes ?? [];
		for (const h of HEROES) {
			if ((this.state.heroLevel[h.id] ?? 0) <= 0) continue;
			for (const rid of this.state.heroRunes[h.id] ?? []) {
				if (!rid) continue;
				const r = bag.find((x) => x.id === rid);
				if (r && r.stat === stat) v += r.value;
			}
		}
		return v;
	}
	grantRune(rune) {
		this.state.runes = [...this.state.runes ?? [], rune].slice(-24);
	}
	heroDps(id) {
		const def = HEROES.find((h) => h.id === id);
		const level = this.state.heroLevel[id] ?? 0;
		if (level <= 0) return 0;
		const gilds = this.state.heroGild[id] ?? 0;
		const craft = 1 + .1 * (this.state.heroCraft[id] ?? 0);
		const pres = 1 + .12 * (this.state.heroPrestige?.[id] ?? 0);
		return def.baseDps * level * milestoneMult(level) * (1 + .5 * gilds) * craft * pres;
	}
	heroClick(id) {
		const def = HEROES.find((h) => h.id === id);
		const level = this.state.heroLevel[id] ?? 0;
		if (level <= 0 || def.baseClick <= 0) return 0;
		return def.baseClick * level * milestoneMult(level);
	}
	dps() {
		let sum = 0;
		for (const h of HEROES) sum += this.heroDps(h.id);
		return sum * this.dpsMult();
	}
	clickDamage() {
		let sum = 0;
		for (const h of HEROES) sum += this.heroClick(h.id);
		if (sum <= 0) sum = 3;
		return sum * this.clickMult() * this.dpsMult();
	}
	heroCost(id, fromLevel, n) {
		const def = HEROES.find((h) => h.id === id);
		if (fromLevel === 0) {
			if (n <= 1) return def.baseCost;
			return def.baseCost + geometricSum(def.baseCost, def.costScale, 1, n - 1);
		}
		return geometricSum(def.baseCost, def.costScale, fromLevel, n);
	}
	maxAffordable(id, cap = 1e3) {
		const level = this.state.heroLevel[id] ?? 0;
		const room = Math.max(0, 100 - level);
		if (room <= 0) return 0;
		cap = Math.min(cap, room);
		const def = HEROES.find((h) => h.id === id);
		if (level === 0) {
			if (this.state.gold < def.baseCost) return 0;
			let n = 1;
			while (n < cap && this.heroCost(id, 0, n + 1) <= this.state.gold) n++;
			return n;
		}
		let n = 0;
		let lo = 1;
		let hi = cap;
		while (lo <= hi) {
			const mid = lo + hi >> 1;
			if (this.heroCost(id, level, mid) <= this.state.gold) {
				n = mid;
				lo = mid + 1;
			} else hi = mid - 1;
		}
		return n;
	}
	bulkLevels(id, bulk) {
		const level = this.state.heroLevel[id] ?? 0;
		const room = Math.max(0, 100 - level);
		if (room <= 0) return 0;
		if (bulk === -1) return Math.max(0, this.maxAffordable(id));
		if (level === 0) return 1;
		return Math.min(bulk, room);
	}
	relicCost(id) {
		const def = RELICS.find((r) => r.id === id);
		return Math.ceil(def.baseCost * Math.pow(def.costScale, this.relicRank(id)));
	}
	scienceCost(id) {
		const def = SCIENCES.find((s) => s.id === id);
		return Math.ceil(def.baseCost * Math.pow(def.costScale, this.scienceRank(id)));
	}
	weaponRank(id) {
		return this.state.weaponLevel[id] ?? 0;
	}
	weaponCost(id) {
		const def = WEAPONS.find((w) => w.id === id);
		const level = this.weaponRank(id);
		if (def.gemCost > 0) {
			if (level <= 0) return 0;
			return Math.ceil(180 * Math.pow(def.costScale, level));
		}
		return Math.ceil(def.goldCost * Math.pow(def.costScale, level));
	}
	todayKey() {
		return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	}
	freeWell() {
		return this.state.lastFreeWell !== this.todayKey();
	}
	ritualSouls() {
		const f = this.state.maxFloor;
		if (f < 12) return 0;
		const raw = Math.pow(f / 9, 1.45) * 4;
		return Math.max(1, Math.floor(raw * this.soulMult()));
	}
	applyDamage(amount, source, heroId, forceCrit = false, silent = false) {
		if (amount <= 0 || this.monster.hp <= 0) return;
		let dmg = amount;
		if (this.monster.isBoss) dmg *= this.bossMult();
		const crit = !silent && (forceCrit || Math.random() < this.critChance());
		if (crit) {
			dmg *= this.critMult();
			this.state.crits += 1;
		}
		this.monster.hp = Math.max(0, this.monster.hp - dmg);
		if (!silent) this.emit({
			type: "hit",
			amount: dmg,
			crit,
			source,
			heroId
		});
		if (this.monster.hp <= 0) this.onKill();
	}
	onKill() {
		const { isBoss, kind } = this.monster;
		const floor = this.state.floor;
		const gold = this.monsterGold(floor, isBoss) * this.goldMult();
		let souls = 0;
		if ((this.state.heroLevel.devourer ?? 0) > 0 && Math.random() < (this.legendOn("devourer") ? .16 : .08)) souls = 1;
		let chest = false;
		if (isBoss) {
			this.state.bossKills += 1;
			const chance = .32 + this.relicRank("coffer-key") * .08;
			if (Math.random() < chance) {
				this.state.chests += 1;
				chest = true;
			}
		}
		this.state.gold += gold;
		this.state.lootGold += gold;
		this.state.souls += souls;
		this.state.kills += 1;
		this.state.bone += isBoss ? 3 : 1;
		if (isBoss) this.state.riftDust += 1;
		if (!this.state.bag) this.state.bag = {};
		for (const drop of dropFor(kind, isBoss)) this.state.bag[drop.id] = (this.state.bag[drop.id] ?? 0) + drop.n;
		if (isBoss) this.state.gems += 2 + Math.floor(Math.random() * 4);
		else if (Math.random() < .08) this.state.gems += 1;
		const ev = this.activeEvent();
		let pts = isBoss ? 8 : 1;
		if (ev === "tyrant" && isBoss) pts += 12;
		if (this.state.siegeLair === "soulwell") pts = Math.floor(pts * 1.1);
		this.state.eventPts += pts;
		let siege = isBoss ? 6 : 1;
		siege *= 1 + this.runeBonus("siege");
		if (ev === "siege") siege *= 2;
		if (this.state.siegeLair) this.state.siegePts += Math.max(1, Math.floor(siege));
		if (Math.random() < (isBoss ? ev === "tyrant" ? .55 : .32 : .05)) this.grantRune(mintRune(this.state.kills + floor, floor, isBoss));
		this.emit({
			type: "kill",
			gold,
			souls,
			isBoss,
			kind,
			chest
		});
		if (this.state.farm && this.isBossFloor(floor)) {
			this.monster = this.makeMonster(floor, false);
			return;
		}
		if (isBoss || !this.isBossFloor(floor + 1) || this.state.farm) {
			const next = isBoss || !this.isBossFloor(floor + 1) ? floor + 1 : floor;
			const target = this.state.farm && this.isBossFloor(floor + 1) ? floor : next;
			this.state.floor = Math.max(1, target);
			this.state.maxFloor = Math.max(this.state.maxFloor, this.state.floor);
			const boss = this.isBossFloor(this.state.floor) && !this.state.farm;
			this.monster = this.makeMonster(this.state.floor, boss);
			if (boss) this.emit({ type: "bossStart" });
		} else {
			this.state.floor = floor + 1;
			this.state.maxFloor = Math.max(this.state.maxFloor, this.state.floor);
			this.monster = this.makeMonster(this.state.floor, true);
			this.emit({ type: "bossStart" });
		}
	}
	click() {
		this.state.clicks += 1;
		this.combo = Math.min(14, this.combo + 1);
		this.comboTimer = 1.15;
		this.applyDamage(this.clickDamage(), "click");
	}
	hireOrUpgrade(id, bulk) {
		const def = HEROES.find((h) => h.id === id);
		const level = this.state.heroLevel[id] ?? 0;
		if (level <= 0 && def.acquire !== "gold") return false;
		if (this.state.maxFloor < def.unlockFloor && level <= 0) return false;
		const n = this.bulkLevels(id, bulk);
		if (n <= 0) return false;
		const cost = this.heroCost(id, level, n);
		if (this.state.gold < cost) return false;
		this.state.gold -= cost;
		this.state.heroLevel[id] = level + n;
		if (level <= 0) this.state.hires += 1;
		return true;
	}
	buyRelic(id) {
		const cost = this.relicCost(id);
		if (this.state.souls < cost) return false;
		this.state.souls -= cost;
		this.state.relicLevel[id] = this.relicRank(id) + 1;
		return true;
	}
	buyScience(id) {
		const cost = this.scienceCost(id);
		if (this.state.influence < cost) return false;
		this.state.influence -= cost;
		this.state.scienceLevel[id] = this.scienceRank(id) + 1;
		return true;
	}
	gild(id) {
		if ((this.state.heroLevel[id] ?? 0) <= 0) return false;
		const cost = 1 + (this.state.heroGild[id] ?? 0);
		if (this.state.souls < cost) return false;
		this.state.souls -= cost;
		this.state.heroGild[id] = (this.state.heroGild[id] ?? 0) + 1;
		return true;
	}
	prestigeHero(id) {
		const level = this.state.heroLevel[id] ?? 0;
		const p = this.state.heroPrestige?.[id] ?? 0;
		if (level < 100) return false;
		if (p >= 100) return false;
		const cost = 8 + p * 6;
		if (this.state.souls < cost) return false;
		this.state.souls -= cost;
		if (!this.state.heroPrestige) this.state.heroPrestige = {};
		this.state.heroPrestige[id] = p + 1;
		this.state.heroLevel[id] = 1;
		return true;
	}
	prestigeCost(id) {
		return 8 + (this.state.heroPrestige?.[id] ?? 0) * 6;
	}
	buyHeroGems(id) {
		const def = HEROES.find((h) => h.id === id);
		if (!def.gemCost) return false;
		if ((this.state.heroLevel[id] ?? 0) > 0) return false;
		if (this.state.gems < def.gemCost) return false;
		this.state.gems -= def.gemCost;
		this.state.heroLevel[id] = 1;
		this.state.hires += 1;
		return true;
	}
	convertGems() {
		if (this.state.gems < 10) return false;
		this.state.gems -= 10;
		this.state.ember += 8;
		return true;
	}
	craftHero(id) {
		if ((this.state.heroLevel[id] ?? 0) <= 0) return false;
		const rank = this.state.heroCraft[id] ?? 0;
		if (rank >= 8) return false;
		const cost = craftCost(rank);
		if (this.state.ember < cost.ember || this.state.bone < cost.bone) return false;
		this.state.ember -= cost.ember;
		this.state.bone -= cost.bone;
		this.state.heroCraft[id] = rank + 1;
		return true;
	}
	attachRune(heroId, slot, runeId) {
		const lv = this.state.heroLevel[heroId] ?? 0;
		if (slot < 0 || slot >= runeSlots(lv)) return false;
		if (!(this.state.runes ?? []).find((r) => r.id === runeId)) return false;
		const slots = [...this.state.heroRunes[heroId] ?? [
			null,
			null,
			null
		]];
		if (HEROES.some((h) => (this.state.heroRunes[h.id] ?? []).includes(runeId))) return false;
		slots[slot] = runeId;
		this.state.heroRunes[heroId] = slots;
		return true;
	}
	detachRune(heroId, slot) {
		const slots = [...this.state.heroRunes[heroId] ?? [
			null,
			null,
			null
		]];
		if (!slots[slot]) return false;
		slots[slot] = null;
		this.state.heroRunes[heroId] = slots;
		return true;
	}
	occupyLair(id) {
		if (!SIEGE_LAIRS.find((l) => l.id === id)) return false;
		const realm = REALMS.find((r) => r.id === id);
		if (!realm || this.state.maxFloor < realm.minFloor) return false;
		const now = Date.now() / 1e3;
		if (now < (this.state.siegeReadyAt ?? 0)) return false;
		this.state.siegeLair = id;
		this.state.siegeReadyAt = now + 12;
		return true;
	}
	buyEvent(itemId) {
		const item = EVENT_SHOP.find((x) => x.id === itemId);
		if (!item || this.state.eventPts < item.cost) return false;
		this.state.eventPts -= item.cost;
		if (item.kind === "ember") this.state.ember += 8;
		if (item.kind === "rift") this.state.riftDust += 6;
		if (item.kind === "chest") this.state.chests += 1;
		if (item.kind === "rune") this.grantRune(mintRune(this.state.eventPts + 3, this.state.maxFloor, true));
		return true;
	}
	buyWeapon(id) {
		const def = WEAPONS.find((w) => w.id === id);
		const level = this.weaponRank(id);
		if (level <= 0 && def.gemCost > 0) {
			if (this.state.gems < def.gemCost) return false;
			this.state.gems -= def.gemCost;
			this.state.weaponLevel[id] = 1;
			return true;
		}
		const cost = this.weaponCost(id);
		if (cost <= 0 || this.state.gold < cost) return false;
		this.state.gold -= cost;
		this.state.weaponLevel[id] = level + 1;
		return true;
	}
	buySocket(id) {
		const def = SOCKETS.find((s) => s.id === id);
		if (this.state.socketsOwned[id]) {
			this.state.socket = this.state.socket === id ? null : id;
			return true;
		}
		if (this.state.gems < def.gemCost) return false;
		this.state.gems -= def.gemCost;
		this.state.socketsOwned[id] = true;
		this.state.socket = id;
		return true;
	}
	travelRealm(id) {
		const def = REALMS.find((r) => r.id === id);
		if (!def) return false;
		if (this.state.maxFloor < def.minFloor) return false;
		const { min, max } = realmRange(id);
		const dest = Math.min(Math.max(this.state.maxFloor, min), max);
		this.state.floor = dest;
		this.state.farm = false;
		this.monster = this.makeMonster(dest, this.isBossFloor(dest));
		return true;
	}
	claimFounder() {
		if (this.state.founderClaimed) return false;
		this.state.founderClaimed = true;
		this.state.gold = 1e24;
		this.state.souls = 25e4;
		this.state.gems = 25e3;
		this.state.influence = 8e3;
		this.state.chests = 40;
		this.state.ember = 4e3;
		this.state.bone = 4e3;
		this.state.riftDust = 800;
		this.state.eventPts = 5e3;
		this.state.siegePts = 2500;
		this.state.arenaChest = 12;
		this.state.arenaCharges = 5;
		this.state.floor = 80;
		this.state.maxFloor = 80;
		this.state.hires = HEROES.length;
		this.state.kills = Math.max(this.state.kills, 400);
		this.state.bossKills = Math.max(this.state.bossKills, 40);
		this.state.socket = "ruby";
		for (const h of HEROES) {
			this.state.heroLevel[h.id] = 100;
			this.state.heroGild[h.id] = 8;
			this.state.heroCraft[h.id] = 8;
			if (!this.state.heroPrestige) this.state.heroPrestige = {};
			this.state.heroPrestige[h.id] = 12;
		}
		for (const r of RELICS) this.state.relicLevel[r.id] = 15;
		for (const s of SCIENCES) this.state.scienceLevel[s.id] = 12;
		for (const w of WEAPONS) this.state.weaponLevel[w.id] = 10;
		for (const s of SOCKETS) this.state.socketsOwned[s.id] = true;
		const runes = [];
		for (let i = 0; i < 24; i++) runes.push(mintRune(9e3 + i * 17, 80, true));
		this.state.runes = runes;
		for (let i = 0; i < HEROES.length; i++) {
			const id = HEROES[i].id;
			const a = runes[i * 3]?.id ?? null;
			const b = runes[i * 3 + 1]?.id ?? null;
			const c = runes[i * 3 + 2]?.id ?? null;
			this.state.heroRunes[id] = [
				a,
				b,
				c
			];
		}
		if (!this.state.bag) this.state.bag = {};
		for (const l of LOOT) this.state.bag[l.id] = 80;
		this.monster = this.makeMonster(this.state.floor, this.isBossFloor(this.state.floor));
		this.save();
		return true;
	}
	tryCraft(inputs, catalyst) {
		if (!this.state.bag) this.state.bag = {};
		const used = [...inputs];
		if (catalyst) used.push(catalyst);
		const have = {};
		for (const id of used) have[id] = (have[id] ?? 0) + 1;
		for (const [id, n] of Object.entries(have)) if ((this.state.bag[id] ?? 0) < n) return {
			ok: false,
			fail: false,
			name: "",
			blurb: "Missing parts."
		};
		const recipe = matchRecipe(inputs, catalyst);
		const chance = craftChance(recipe, catalyst);
		for (const [id, n] of Object.entries(have)) this.state.bag[id] -= n;
		if (!(Math.random() < chance)) {
			this.save();
			return {
				ok: true,
				fail: true,
				name: "The hammer missed",
				blurb: "Parts are gone. Chance failed."
			};
		}
		const result = recipe?.result ?? (Math.random() < .5 ? {
			kind: "ember",
			n: 8
		} : {
			kind: "gems",
			n: 12
		});
		let blurb = recipe?.blurb ?? "Random smash.";
		if (result.kind === "ember") this.state.ember += result.n;
		if (result.kind === "gems") this.state.gems += result.n;
		if (result.kind === "souls") this.state.souls += result.n;
		if (result.kind === "chest") this.state.chests += result.n;
		if (result.kind === "rune") this.grantRune(mintRune(this.state.kills + 3, this.state.floor, true));
		if (result.kind === "item") this.state.bag[result.id] = (this.state.bag[result.id] ?? 0) + result.n;
		if (result.kind === "craft") {
			const target = HEROES.find((h) => (this.state.heroLevel[h.id] ?? 0) > 0 && (this.state.heroCraft[h.id] ?? 0) < 8);
			if (target) this.state.heroCraft[target.id] = (this.state.heroCraft[target.id] ?? 0) + 1;
			else this.state.ember += 16;
		}
		this.save();
		return {
			ok: true,
			fail: false,
			name: recipe?.name ?? "Random smash",
			blurb
		};
	}
	dumpBag() {
		const o = {};
		for (const l of LOOT) o[l.id] = this.state.bag?.[l.id] ?? 0;
		return o;
	}
	applyBag(bag) {
		if (!this.state.bag) this.state.bag = {};
		for (const l of LOOT) {
			const n = Math.floor(Number(bag[l.id] ?? 0));
			this.state.bag[l.id] = Number.isFinite(n) && n > 0 ? n : 0;
		}
		this.save();
	}
	gemPouchCost() {
		return Math.max(80, Math.floor(60 * Math.pow(1.18, Math.max(0, this.state.maxFloor / 5))));
	}
	buyGemPouch() {
		const cost = this.gemPouchCost();
		if (this.state.gold < cost) return false;
		this.state.gold -= cost;
		this.state.gems += 40;
		return true;
	}
	summon(hits) {
		if (!this.freeWell()) {
			if (this.state.gems < 80) return null;
			this.state.gems -= 80;
		} else this.state.lastFreeWell = this.todayKey();
		const roll = Math.random() + hits * .08;
		const pool = HEROES.filter((h) => h.acquire !== "gold");
		let pick = pool[Math.floor(Math.random() * pool.length)];
		if (roll > 1.05) pick = pool.find((h) => h.id === "devourer" || h.id === "orin") ?? pick;
		else if (roll > .85) pick = pool.find((h) => h.id === "kira" || h.id === "nyx") ?? pick;
		if ((this.state.heroLevel[pick.id] ?? 0) <= 0) {
			this.state.heroLevel[pick.id] = 1;
			this.state.hires += 1;
			this.emit({
				type: "summon",
				name: pick.name
			});
			return {
				name: pick.name,
				kind: "hero",
				heroId: pick.id
			};
		}
		const gemBack = 25 + hits * 10;
		this.state.gems += gemBack;
		this.emit({
			type: "summon",
			name: pick.name
		});
		return {
			name: `${pick.name} already sworn · +${gemBack} gems`,
			kind: "gems",
			heroId: pick.id
		};
	}
	useSkill(id) {
		if ((this.state.skillCd[id] ?? 0) > 0) return false;
		const def = SKILLS.find((s) => s.id === id);
		const cd = def.cooldown / (1 + this.skillHaste());
		this.state.skillCd[id] = cd;
		if (def.duration > 0) this.state.skillActive[id] = def.duration * this.skillDurationMult();
		this.emit({
			type: "skill",
			id
		});
		if (id === "strike") this.applyDamage(this.clickDamage() * 22, "skill", void 0, true);
		else if (id === "harvest") {
			const pct = this.monster.isBoss ? .12 : .35;
			this.applyDamage(this.monster.max * pct, "skill");
		}
		return true;
	}
	claimContract(kind) {
		const c = this.state.contracts.find((x) => x.kind === kind);
		if (!c || c.claimed) return false;
		if (contractProgress(kind, this.progress()) < c.goal) return false;
		c.claimed = true;
		this.state.gold += c.gold;
		this.state.lootGold += c.gold;
		this.state.souls += c.souls;
		this.state.chests += c.chests;
		this.state.influence += c.influence;
		if (this.state.contracts.every((x) => x.claimed)) this.state.contracts = rollContracts(this.progress());
		return true;
	}
	openChest() {
		if (this.state.chests <= 0) return null;
		this.state.chests -= 1;
		const f = Math.max(1, this.state.maxFloor);
		const gold = Math.floor((40 + Math.random() * 80) * f * this.goldMult() * .35);
		const souls = Math.random() < .55 ? 1 + Math.floor(f / 25) : 0;
		const influence = 4 + Math.floor(f / 8);
		this.state.gold += gold;
		this.state.lootGold += gold;
		this.state.souls += souls;
		this.state.influence += influence;
		if (Math.random() < .28) this.grantRune(mintRune(this.state.chests + f, f, false));
		return {
			gold,
			souls,
			influence
		};
	}
	fightArena() {
		if (this.state.maxFloor < 5) return null;
		if (this.state.arenaCharges < 1) return null;
		this.state.arenaCharges -= 1;
		const yourPower = this.dps() + this.clickDamage() * .35;
		const theirPower = this.monsterHp(this.state.maxFloor, false) * (1.6 + Math.random() * .7);
		const win = yourPower / Math.max(1, theirPower) >= .78 + Math.random() * .28;
		const foe = ARENA_FOES[Math.floor(Math.random() * ARENA_FOES.length)];
		const influence = win ? 10 + Math.floor(this.state.maxFloor / 4) : 2;
		const souls = win ? Math.random() < .4 ? 1 : 0 : 0;
		const gold = win ? 0 : Math.floor(20 * this.state.maxFloor);
		const chests = win && Math.random() < .22 ? 1 : 0;
		this.state.influence += influence;
		this.state.souls += souls;
		this.state.gold += gold;
		this.state.lootGold += gold;
		this.state.chests += chests;
		if (win) this.state.arenaWins += 1;
		else this.state.arenaLosses += 1;
		if (win) {
			this.state.arenaChest = (this.state.arenaChest ?? 0) + 1;
			if (this.state.arenaChest >= 10) {
				this.state.arenaChest = 0;
				this.state.chests += 1;
				this.grantRune(mintRune(this.state.arenaWins + 9, this.state.maxFloor, true));
			}
		}
		const result = {
			win,
			foe,
			influence,
			souls,
			gold,
			chests,
			yourPower,
			theirPower
		};
		this.lastArena = result;
		this.emit({
			type: "arena",
			win,
			foe
		});
		return result;
	}
	applyLoot(loot) {
		const gold = Math.max(0, loot.gold ?? 0);
		const souls = Math.max(0, loot.souls ?? 0);
		const influence = Math.max(0, loot.influence ?? 0);
		const chests = Math.max(0, loot.chests ?? 0);
		const gems = Math.max(0, loot.gems ?? 0);
		this.state.gold += gold;
		this.state.lootGold += gold;
		this.state.souls += souls;
		this.state.influence += influence;
		this.state.chests += chests;
		this.state.gems += gems;
	}
	ritual() {
		const souls = this.ritualSouls();
		if (souls <= 0) return false;
		this.state.souls += souls;
		this.state.rituals += 1;
		this.state.gold = 0;
		this.state.floor = this.startFloorAfterRitual();
		for (const h of HEROES) this.state.heroLevel[h.id] = h.id === "kael" ? 1 : 0;
		this.state.hires = 1;
		for (const s of SKILLS) {
			this.state.skillCd[s.id] = 0;
			this.state.skillActive[s.id] = 0;
		}
		this.combo = 0;
		this.state.contracts = rollContracts(this.progress());
		this.monster = this.makeMonster(this.state.floor, this.isBossFloor(this.state.floor) && !this.state.farm);
		this.emit({
			type: "ritual",
			souls
		});
		this.save();
		return true;
	}
	setFarm(farm) {
		this.state.farm = farm;
		if (farm && this.monster.isBoss) {
			this.state.floor = Math.max(1, this.state.floor - 1);
			this.monster = this.makeMonster(this.state.floor, false);
		}
	}
	step(dt) {
		const t = Math.min(dt, .1);
		this.comboTimer -= t;
		if (this.comboTimer <= 0) this.combo = 0;
		for (const s of SKILLS) {
			if (this.state.skillCd[s.id] > 0) this.state.skillCd[s.id] = Math.max(0, this.state.skillCd[s.id] - t);
			if (this.state.skillActive[s.id] > 0) this.state.skillActive[s.id] = Math.max(0, this.state.skillActive[s.id] - t);
		}
		if (this.state.arenaCharges < 5) {
			this.state.arenaRegen += t;
			if (this.state.arenaRegen >= 90) {
				this.state.arenaRegen = 0;
				this.state.arenaCharges += 1;
			}
		} else this.state.arenaRegen = 0;
		if (this.monster.isBoss) {
			this.monster.timer -= t;
			if (this.monster.timer <= 0 && this.monster.hp > 0) {
				this.emit({ type: "bossFail" });
				this.state.floor = Math.max(1, this.state.floor - 1);
				this.monster = this.makeMonster(this.state.floor, false);
			}
		}
		const dps = this.dps();
		if (dps > 0 && this.monster.hp > 0) this.applyDamage(dps * t, "hero", void 0, false, true);
		for (const h of HEROES) {
			if ((this.state.heroLevel[h.id] ?? 0) <= 0) continue;
			this.attackCd[h.id] -= t;
			if (this.attackCd[h.id] <= 0) {
				this.attackCd[h.id] = .85 + h.id.charCodeAt(0) % 5 * .12;
				this.emit({
					type: "heroAttack",
					heroId: h.id
				});
			}
		}
		this.saveAcc += t;
		if (this.saveAcc >= 3) {
			this.saveAcc = 0;
			this.save();
		}
	}
	save() {
		persistState(this.state);
	}
	hydrate(next) {
		this.state = next;
		this.combo = 0;
		this.lastArena = null;
		this.monster = this.makeMonster(next.floor, this.isBossFloor(next.floor) && !next.farm);
		this.save();
	}
	grantGems(n) {
		if (n > 0) this.state.gems += n;
	}
	reset() {
		this.state = defaultState();
		this.combo = 0;
		this.lastArena = null;
		this.monster = this.makeMonster(1, false);
		this.save();
	}
	snapshot(bulk) {
		const p = this.progress();
		const haste = this.skillHaste();
		const heroes = HEROES.map((h) => {
			const level = this.state.heroLevel[h.id] ?? 0;
			const n = this.bulkLevels(h.id, bulk);
			const cost = this.heroCost(h.id, level, Math.max(1, n));
			const gildCost = 1 + (this.state.heroGild[h.id] ?? 0);
			const gilds = this.state.heroGild[h.id] ?? 0;
			return {
				id: h.id,
				level,
				gilds: this.state.heroGild[h.id] ?? 0,
				dps: this.heroDps(h.id) * this.dpsMult(),
				click: this.heroClick(h.id) * this.clickMult() * this.dpsMult(),
				cost,
				levels: Math.max(1, n),
				canAfford: level < 100 && this.state.gold >= cost && n > 0 && (level > 0 || h.acquire === "gold" && this.state.maxFloor >= h.unlockFloor),
				unlocked: level > 0 || h.acquire === "gold" && this.state.maxFloor >= h.unlockFloor,
				gildCost,
				canGild: level > 0 && this.state.souls >= gildCost,
				acquire: h.acquire,
				gemCost: h.gemCost,
				canGemHire: level <= 0 && h.gemCost > 0 && this.state.gems >= h.gemCost,
				stars: heroStars(h, gilds),
				legendName: LEGENDS[h.id].name,
				legendBlurb: LEGENDS[h.id].blurb,
				legendOn: level >= LEGENDS[h.id].unlock,
				craftRank: this.state.heroCraft[h.id] ?? 0,
				craftName: HERO_CRAFTS[h.id].name,
				craftEmber: craftCost(this.state.heroCraft[h.id] ?? 0).ember,
				craftBone: craftCost(this.state.heroCraft[h.id] ?? 0).bone,
				canCraft: level > 0 && (this.state.heroCraft[h.id] ?? 0) < 8 && this.state.ember >= craftCost(this.state.heroCraft[h.id] ?? 0).ember && this.state.bone >= craftCost(this.state.heroCraft[h.id] ?? 0).bone,
				runeSlots: runeSlots(level),
				attached: (this.state.heroRunes[h.id] ?? [
					null,
					null,
					null
				]).map((rid) => rid ? (this.state.runes ?? []).find((r) => r.id === rid) ?? null : null),
				prestige: this.state.heroPrestige?.[h.id] ?? 0,
				prestigeMax: 100,
				prestigeCost: this.prestigeCost(h.id),
				canPrestige: level >= 100 && (this.state.heroPrestige?.[h.id] ?? 0) < 100 && this.state.souls >= this.prestigeCost(h.id),
				atCap: level >= 100
			};
		});
		const weapons = WEAPONS.map((w) => {
			const level = this.weaponRank(w.id);
			const cost = this.weaponCost(w.id);
			return {
				id: w.id,
				level,
				cost,
				gemCost: level <= 0 ? w.gemCost : 0,
				canAfford: w.gemCost > 0 && level <= 0 ? false : this.state.gold >= cost && cost > 0,
				canGem: w.gemCost > 0 && level <= 0 && this.state.gems >= w.gemCost
			};
		});
		const sockets = SOCKETS.map((s) => ({
			id: s.id,
			owned: Boolean(this.state.socketsOwned[s.id]),
			equipped: this.state.socket === s.id,
			gemCost: s.gemCost,
			canAfford: this.state.gems >= s.gemCost || Boolean(this.state.socketsOwned[s.id])
		}));
		const relics = RELICS.map((r) => {
			const cost = this.relicCost(r.id);
			return {
				id: r.id,
				level: this.relicRank(r.id),
				cost,
				canAfford: this.state.souls >= cost
			};
		});
		const sciences = SCIENCES.map((s) => {
			const cost = this.scienceCost(s.id);
			return {
				id: s.id,
				level: this.scienceRank(s.id),
				cost,
				canAfford: this.state.influence >= cost
			};
		});
		const durM = this.skillDurationMult();
		const skills = SKILLS.map((s) => {
			const maxCd = s.cooldown / (1 + haste);
			return {
				id: s.id,
				cd: this.state.skillCd[s.id] ?? 0,
				maxCd,
				active: this.state.skillActive[s.id] ?? 0,
				maxActive: s.duration * durM,
				ready: (this.state.skillCd[s.id] ?? 0) <= 0
			};
		});
		const contracts = this.state.contracts.map((c) => {
			const progress = contractProgress(c.kind, p);
			return {
				...c,
				progress,
				ready: !c.claimed && progress >= c.goal
			};
		});
		return {
			gold: this.state.gold,
			souls: this.state.souls,
			gems: this.state.gems,
			influence: this.state.influence,
			chests: this.state.chests,
			floor: this.state.floor,
			maxFloor: this.state.maxFloor,
			wave: this.monster.isBoss ? 10 : (this.state.floor - 1) % 10 + 1,
			dps: this.dps(),
			clickDmg: this.clickDamage(),
			monsterHp: this.monster.hp,
			monsterMax: this.monster.max,
			monsterName: this.monster.name,
			monsterKind: this.monster.kind,
			isBoss: this.monster.isBoss,
			bossTime: this.monster.timer,
			bossMaxTime: this.monster.timerMax,
			farm: this.state.farm,
			combo: this.combo,
			heroes,
			relics,
			sciences,
			weapons,
			sockets,
			skills,
			contracts,
			ritualSouls: this.ritualSouls(),
			ritualUnlocked: this.state.maxFloor >= 12,
			startFloor: this.startFloorAfterRitual(),
			kills: this.state.kills,
			rituals: this.state.rituals,
			goldMult: this.goldMult(),
			dpsMult: this.dpsMult(),
			arenaCharges: this.state.arenaCharges,
			arenaChargeMax: 5,
			arenaRegen: this.state.arenaRegen,
			arenaWins: this.state.arenaWins,
			arenaUnlocked: this.state.maxFloor >= 5,
			critChance: this.critChance(),
			founderClaimed: this.state.founderClaimed,
			freeWell: this.freeWell(),
			summonCost: 80,
			pouchCost: this.gemPouchCost(),
			canPouch: this.state.gold >= this.gemPouchCost(),
			socket: this.state.socket,
			realm: realmByFloor(this.state.floor),
			realmName: REALMS.find((r) => r.id === realmByFloor(this.state.floor))?.name ?? "Ashen Crypt",
			ember: this.state.ember ?? 0,
			bone: this.state.bone ?? 0,
			riftDust: this.state.riftDust ?? 0,
			runeBag: this.state.runes ?? [],
			eventId: eventForDay(this.state.eventDay || dayKey()).id,
			eventName: eventForDay(this.state.eventDay || dayKey()).name,
			eventBlurb: eventForDay(this.state.eventDay || dayKey()).blurb,
			eventPts: this.state.eventPts ?? 0,
			siegeLair: this.state.siegeLair,
			siegePts: this.state.siegePts ?? 0,
			siegeReadyIn: Math.max(0, (this.state.siegeReadyAt ?? 0) - Date.now() / 1e3),
			arenaChest: this.state.arenaChest ?? 0,
			bag: LOOT.map((l) => ({
				id: l.id,
				name: l.name,
				kind: l.kind,
				count: this.state.bag?.[l.id] ?? 0
			}))
		};
	}
	biome() {
		return biomeFor(this.state.floor);
	}
};
var sim = new GameSim();
var bus = null;
var muted = false;
var drone = null;
function now() {
	return bus?.ctx.currentTime ?? 0;
}
function envGain(duration, peak, attack = .008) {
	if (!bus) throw new Error("audio locked");
	const g = bus.ctx.createGain();
	const t = now();
	g.gain.setValueAtTime(1e-4, t);
	g.gain.exponentialRampToValueAtTime(Math.max(2e-4, peak), t + attack);
	g.gain.exponentialRampToValueAtTime(1e-4, t + duration);
	g.connect(bus.sfx);
	return g;
}
function tone(freq, type, duration, peak, detune = 0) {
	if (!bus) return;
	const osc = bus.ctx.createOscillator();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, now());
	if (detune) osc.detune.setValueAtTime(detune, now());
	const g = envGain(duration, peak);
	osc.connect(g);
	osc.start();
	osc.stop(now() + duration + .02);
	osc.onended = () => {
		osc.disconnect();
		g.disconnect();
	};
}
function noise(duration, peak, hp = 400) {
	if (!bus) return;
	const n = Math.floor(bus.ctx.sampleRate * duration);
	const buf = bus.ctx.createBuffer(1, n, bus.ctx.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
	const src = bus.ctx.createBufferSource();
	src.buffer = buf;
	const filter = bus.ctx.createBiquadFilter();
	filter.type = "highpass";
	filter.frequency.value = hp;
	const g = envGain(duration, peak, .004);
	src.connect(filter);
	filter.connect(g);
	src.start();
	src.stop(now() + duration + .02);
	src.onended = () => {
		src.disconnect();
		filter.disconnect();
		g.disconnect();
	};
}
function unlockAudio() {
	if (!bus) {
		const ctx = new AudioContext({ latencyHint: "interactive" });
		const master = ctx.createGain();
		const sfx = ctx.createGain();
		const music = ctx.createGain();
		sfx.gain.value = .7;
		music.gain.value = .22;
		master.gain.value = muted ? 0 : .9;
		sfx.connect(master);
		music.connect(master);
		master.connect(ctx.destination);
		bus = {
			ctx,
			master,
			sfx,
			music
		};
	}
	if (bus.ctx.state === "suspended") bus.ctx.resume();
	startDrone();
}
function setMuted(next) {
	muted = next;
	if (bus) bus.master.gain.setTargetAtTime(next ? 0 : .9, now(), .04);
}
function startDrone() {
	if (!bus || drone) return;
	const ctx = bus.ctx;
	const oscA = ctx.createOscillator();
	const oscB = ctx.createOscillator();
	oscA.type = "sine";
	oscB.type = "sine";
	oscA.frequency.value = 55;
	oscB.frequency.value = 82.4;
	const g = ctx.createGain();
	g.gain.value = .07;
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = 240;
	oscA.connect(g);
	oscB.connect(g);
	g.connect(filter);
	filter.connect(bus.music);
	oscA.start();
	oscB.start();
	drone = { stop: () => {
		oscA.stop();
		oscB.stop();
		oscA.disconnect();
		oscB.disconnect();
		g.disconnect();
		filter.disconnect();
	} };
}
function resumeAudio() {
	if (bus?.ctx.state === "suspended") bus.ctx.resume();
}
var sfx = {
	hit(crit) {
		const rate = 1 + (Math.random() * 2 - 1) * .08;
		noise(.05, crit ? .18 : .1, crit ? 900 : 500);
		tone((crit ? 420 : 220) * rate, "square", .07, crit ? .08 : .045);
		if (crit) tone(840 * rate, "triangle", .09, .04);
	},
	hammer() {
		noise(.08, .22, 120);
		tone(90, "sawtooth", .12, .12);
		tone(180, "square", .07, .05);
	},
	gold() {
		const rate = 1 + (Math.random() * 2 - 1) * .06;
		tone(880 * rate, "sine", .08, .05);
		tone(1320 * rate, "sine", .1, .03);
	},
	kill(boss) {
		tone(boss ? 90 : 160, "sawtooth", .18, boss ? .12 : .06);
		noise(.12, boss ? .16 : .08, 200);
	},
	skill() {
		tone(196, "triangle", .16, .07);
		tone(392, "sine", .2, .05);
	},
	ritual() {
		tone(65, "sawtooth", .4, .1);
		tone(98, "triangle", .5, .08);
		tone(130, "sine", .55, .05);
	},
	ui() {
		tone(520, "sine", .05, .03);
	},
	fail() {
		tone(110, "square", .2, .07);
		tone(82, "sawtooth", .28, .05);
	},
	hire() {
		tone(330, "triangle", .1, .05);
		tone(495, "sine", .14, .04);
	},
	chest() {
		tone(262, "triangle", .12, .06);
		tone(392, "sine", .16, .05);
		tone(523, "sine", .18, .03);
	},
	win() {
		tone(330, "triangle", .12, .07);
		tone(440, "sine", .16, .05);
		tone(660, "sine", .22, .04);
	},
	claim() {
		tone(494, "sine", .1, .05);
		tone(740, "triangle", .14, .04);
	}
};
var useGame = create((set, get) => ({
	screen: "title",
	tab: "fight",
	clanPage: "hub",
	selectedHero: null,
	bulk: 1,
	muted: false,
	shake: true,
	settingsOpen: false,
	ritualOpen: false,
	summonOpen: false,
	shopNote: "",
	arenaResult: null,
	chestLoot: null,
	offlineGold: 0,
	onlineCount: 0,
	snap: sim.snapshot(1),
	setScreen: (screen) => set({ screen }),
	setTab: (tab) => set({
		tab,
		clanPage: tab === "clan" ? get().clanPage : get().clanPage
	}),
	setClanPage: (clanPage) => set({ clanPage }),
	setSelectedHero: (selectedHero) => set({ selectedHero }),
	setBulk: (bulk) => {
		set({
			bulk,
			snap: sim.snapshot(bulk)
		});
	},
	setMuted: (muted) => set({ muted }),
	setShake: (shake) => set({ shake }),
	setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
	setRitualOpen: (ritualOpen) => set({ ritualOpen }),
	setSummonOpen: (summonOpen) => set({ summonOpen }),
	setShopNote: (shopNote) => set({ shopNote }),
	setArenaResult: (arenaResult) => set({ arenaResult }),
	setChestLoot: (chestLoot) => set({ chestLoot }),
	clearOffline: () => set({ offlineGold: 0 }),
	setOnlineCount: (onlineCount) => set({ onlineCount }),
	refresh: () => set({ snap: sim.snapshot(get().bulk) })
}));
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
function errMessage$3(e) {
	if (e && typeof e === "object" && "message" in e) return String(e.message);
	return "The rift refused.";
}
function ServerPanel() {
	const { user, isPending } = useCurrentUserState();
	const [snap, setSnap] = (0, import_react.useState)(null);
	const [open, setOpen] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const clock = seasonClock();
	(0, import_react.useEffect)(() => {
		if (!user || isPending) return;
		fetchSeason().then(setSnap).catch((e) => setNote(errMessage$3(e)));
		const id = window.setInterval(() => {
			fetchSeason().then(setSnap).catch(() => void 0);
		}, 15e3);
		return () => window.clearInterval(id);
	}, [user, isPending]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-24 animate-pulse rounded-lg border border-border bg-bg/40" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeasonHead, { clock }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Sign in to pick a 1,000-soul server. NPC banners already grow on their own."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-4 h-12 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					children: "Sign in to join a server"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBoard, {})
		]
	});
	const rows = snap?.shards ?? [];
	const mine = snap?.mine;
	async function run(fn) {
		if (busy) return;
		setBusy(true);
		setNote("");
		try {
			await fn();
		} catch (e) {
			setNote(errMessage$3(e));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SeasonHead, {
				clock,
				season: snap?.season,
				day: snap?.day
			}),
			snap?.lastWar ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-gold",
				children: [
					"Last war · Season ",
					snap.lastWar.season,
					" · ",
					snap.lastWar.shardName,
					" took the field"
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: "Season 1 is still walking. First war at day 90."
			}),
			snap && snap.claimGems > 0 && !snap.claimed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-3 h-12 w-full",
				disabled: busy,
				onClick: () => run(async () => {
					unlockAudio();
					const result = await claimSeason();
					sim.state.gems += result.gems;
					useGame.getState().refresh();
					setSnap(result.snap);
					sfx.chest();
				}),
				children: [
					"Claim war tithe · ",
					snap.claimGems,
					" gems"
				]
			}) : null,
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-danger",
				children: note
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShardCard, {
					row: r,
					mine: mine === r.id,
					open: open === r.id,
					busy,
					onToggle: () => setOpen(open === r.id ? null : r.id),
					onJoin: () => run(async () => {
						unlockAudio();
						const next = await joinShard({ data: { shardId: r.id } });
						setSnap(next);
						sfx.hire();
					})
				}) }, r.id))
			})
		]
	});
}
function GhostBoard() {
	const clock = seasonClock();
	const [open, setOpen] = (0, import_react.useState)(null);
	const rows = SHARDS.map((def) => {
		const pop = mindPop(def, clock.day);
		const power = mindPower(def, clock.day, clock.season);
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
			cap: 1e3,
			power,
			souls,
			score: warScore(power, pop, souls),
			rank: 0
		};
	}).sort((a, b) => b.score - a.score);
	rows.forEach((r, i) => {
		r.rank = i + 1;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-3 flex flex-col gap-2",
		children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShardCard, {
			row: r,
			mine: false,
			open: open === r.id,
			busy: true,
			onToggle: () => setOpen(open === r.id ? null : r.id),
			onJoin: () => void 0
		}) }, r.id))
	});
}
function SeasonHead({ clock, season, day }) {
	const s = season ?? clock.season;
	const d = day ?? clock.day;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-gold/40 bg-wood p-4 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "size-4 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "font-display text-lg font-semibold",
					children: [
						"Season ",
						s,
						" · Server war"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-fg/80",
				children: [
					"Day ",
					d,
					" of 90. Every three months the shards collide. NPC servers grow while you sleep. Cap 1,000 living souls each."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-sm tabular-nums text-gold",
				children: clock.warToday ? "War horn is up" : `War in ${formatSeasonLeft(clock.msLeft)}`
			})
		]
	});
}
function ShardCard({ row, mine, open, busy, onToggle, onJoin }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-lg border bg-bg/40 p-3", mine ? "border-gold" : "border-border"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex w-full items-start gap-3 text-left",
			onClick: onToggle,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display w-6 text-sm text-gold",
				children: row.rank
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-display text-sm",
							children: [
								"[",
								row.tag,
								"] ",
								row.name
							]
						}),
						row.npc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] tracking-wide text-soul uppercase",
							children: "NPC"
						}) : null,
						mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] tracking-wide text-gold uppercase",
							children: "You"
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-1 block text-xs tabular-nums text-muted",
					children: [
						row.pop,
						"/",
						row.cap,
						" · ",
						formatNum(row.power),
						" power"
					]
				})]
			})]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 border-t border-border pt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-fg/85",
					children: row.blurb
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-gold",
					children: row.will
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 flex flex-col gap-1",
					children: row.log.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-xs text-muted",
						children: line
					}, line))
				}),
				row.joinable && !mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-3 h-12 w-full",
					disabled: busy || row.pop >= row.cap,
					onClick: onJoin,
					children: row.pop >= row.cap ? "Full · 1000" : `Move to ${row.name}`
				}) : null,
				row.npc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted",
					children: "NPC only. They will not take a living crusader."
				}) : null
			]
		}) : null]
	});
}
var loadPlaza = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("f46c32aa5316eae54286e7cd0fb33948598cabb7d1ab2d0dc1da501429c211ad"));
var sendWorldChat = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("b2bce63edd53949a722cdaae135326f18565a59dc32234ab31726a1b08cf9b1e"));
var openTrade = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("f4a09553d4a088f5bbc6de8e476a15ebfb773ecb8beb4b6d0c410bad951d3706"));
var setTradeOffer = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("0b0406966de2b2072a2f640acfae4e30d01da2011d5e218caf02b9070a81dfb7"));
var acceptTrade = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("04b509b625cea963a33b0f4b5d2a33397cd50c4b5d9ec3911ce708fbb515289b"));
var cancelTrade = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("73bca6e9c3bd2965f2103de7b830d45d674e5b28855a7b320bd92d2c90cd493b"));
var stallTrade = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("089be8c55244dfd50d159f3be5bdd7205f831679499453778f901e52c41c17b5"));
function errMessage$2(e) {
	if (e && typeof e === "object" && "message" in e) return String(e.message);
	return "The rift refused.";
}
var STALLS = [
	{
		id: "bone",
		name: "Bonewright",
		take: "4 Rat Skulls",
		give: "1 Bone Shard"
	},
	{
		id: "soul",
		name: "Choir Fence",
		take: "2 Soul Plumes",
		give: "1 Soul Shard"
	},
	{
		id: "rift",
		name: "Nightwell Hawker",
		take: "2 Rift Fish + leaf",
		give: "1 Flask"
	}
];
function PlazaPanel() {
	const { user } = useCurrentUserState();
	const refresh = useGame((s) => s.refresh);
	const setOnline = useGame((s) => s.setOnlineCount);
	const [plaza, setPlaza] = (0, import_react.useState)(null);
	const [body, setBody] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [view, setView] = (0, import_react.useState)("chat");
	const [offer, setOffer] = (0, import_react.useState)({});
	async function pull() {
		const next = await loadPlaza({ data: { bag: sim.dumpBag() } });
		setPlaza(next);
		setOnline(next.online);
	}
	(0, import_react.useEffect)(() => {
		if (!user) return;
		pull().catch((e) => setNote(errMessage$2(e)));
		const id = window.setInterval(() => {
			pull().catch(() => void 0);
		}, 5e3);
		return () => window.clearInterval(id);
	}, [user]);
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-center text-sm text-gold",
				children: "World chat"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 flex flex-col gap-2 rounded-lg border border-border bg-bg/40 p-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-muted",
						children: "Cinder Host"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " · Ashen Pact, your lair reeks of fear." })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-muted",
						children: "Void Choir"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " · Anyone selling soul plumes?" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-muted",
						children: "Nightwell"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " · Fish ran the well. Flasks for sale." })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Sign in to talk, see who is online, and trade parts."
			})
		]
	});
	const me = user.id;
	const others = (plaza?.souls ?? []).filter((s) => s.userId !== me);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-display text-center text-sm text-gold tabular-nums",
				children: [
					plaza?.online ?? 0,
					" crusader",
					(plaza?.online ?? 0) === 1 ? "" : "s",
					" online"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: cn("h-11 flex-1 rounded-md border font-display text-sm", view === "chat" ? "border-gold bg-wood text-gold" : "border-border"),
					onClick: () => setView("chat"),
					children: "World chat"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: cn("h-11 flex-1 rounded-md border font-display text-sm", view === "trade" ? "border-gold bg-wood text-gold" : "border-border"),
					onClick: () => setView("trade"),
					children: "Trade"
				})]
			}),
			view === "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex max-h-[46vh] min-h-[12rem] flex-col gap-2 overflow-y-auto rounded-lg border border-border bg-bg/40 p-2",
				children: (plaza?.chat ?? []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("font-display", m.npc ? "text-muted" : "text-gold"),
						children: m.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-fg",
						children: [" · ", m.body]
					})]
				}, m.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-2 flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					if (!body.trim() || busy) return;
					unlockAudio();
					setBusy(true);
					sendWorldChat({ data: {
						body,
						name: user.displayName ?? "Crusader"
					} }).then(() => {
						setBody("");
						sfx.ui();
						return pull();
					}).catch((err) => setNote(errMessage$2(err))).finally(() => setBusy(false));
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: body,
					onChange: (e) => setBody(e.target.value),
					maxLength: 120,
					placeholder: "Say it to the rift…",
					className: "h-12 min-w-0 flex-1 rounded-md border border-border bg-bg px-3 text-sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "h-12",
					disabled: busy || !body.trim(),
					children: "Send"
				})]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Online hunters. Tap trade to open a window. Stalls buy when no one else is on."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 flex flex-col gap-2",
					children: [others.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: "No other signed-in hunters yet. Use a stall."
					}) : null, others.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 rounded-md border border-border bg-bg/40 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-sm",
								children: s.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs tabular-nums text-muted",
								children: [
									"Floor ",
									s.maxFloor,
									" · ",
									formatNum(s.power)
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "h-11",
							disabled: busy,
							onClick: () => {
								unlockAudio();
								setBusy(true);
								openTrade({ data: { toId: s.userId } }).then(() => pull()).catch((err) => setNote(errMessage$2(err))).finally(() => setBusy(false));
							},
							children: "Trade"
						})]
					}, s.userId))]
				}),
				(plaza?.trades ?? []).map((t) => {
					const mineItems = t.mine === "from" ? t.fromItems : t.toItems;
					const theirs = t.mine === "from" ? t.toItems : t.fromItems;
					const theirName = t.mine === "from" ? t.toName : t.fromName;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-lg border border-gold/40 bg-wood p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-display text-sm text-gold",
								children: ["Window with ", theirName]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [
									"You ",
									t.mine === "from" ? t.fromOk ? "ready" : "open" : t.toOk ? "ready" : "open",
									" · they ",
									t.mine === "from" ? t.toOk ? "ready" : "open" : t.fromOk ? "ready" : "open"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-gold",
								children: "Your offer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfferGrid, {
								current: Object.keys(offer).length ? offer : mineItems,
								onChange: setOffer
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "mt-2 h-11 w-full",
								disabled: busy,
								onClick: () => {
									setBusy(true);
									setTradeOffer({ data: {
										id: t.id,
										items: offer
									} }).then(() => pull()).catch((err) => setNote(errMessage$2(err))).finally(() => setBusy(false));
								},
								children: "Put on table"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted",
								children: ["They offer: ", summarize(theirs) || "nothing yet"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "h-11 flex-1",
									disabled: busy,
									onClick: () => {
										setBusy(true);
										acceptTrade({ data: { id: t.id } }).then((res) => {
											sim.applyBag(res.bag);
											refresh();
											if (res.done) sfx.chest();
											return pull();
										}).catch((err) => setNote(errMessage$2(err))).finally(() => setBusy(false));
									},
									children: "Ready"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "h-11 flex-1",
									disabled: busy,
									onClick: () => {
										setBusy(true);
										cancelTrade({ data: { id: t.id } }).then(() => pull()).catch((err) => setNote(errMessage$2(err))).finally(() => setBusy(false));
									},
									children: "Cancel"
								})]
							})
						]
					}, t.id);
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display mt-4 text-sm text-gold",
					children: "Stalls"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 flex flex-col gap-2",
					children: STALLS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 rounded-md border border-border bg-bg/40 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-sm",
								children: s.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									s.take,
									" → ",
									s.give
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "h-11",
							disabled: busy,
							onClick: () => {
								unlockAudio();
								setBusy(true);
								stallTrade({ data: {
									stall: s.id,
									bag: sim.dumpBag()
								} }).then((res) => {
									sim.applyBag(res.bag);
									refresh();
									sfx.gold();
									setNote(`${s.name} took the deal.`);
									return pull();
								}).catch((err) => setNote(errMessage$2(err))).finally(() => setBusy(false));
							},
							children: "Deal"
						})]
					}, s.id))
				})
			] }),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-gold",
				children: note
			}) : null
		]
	});
}
function summarize(items) {
	return Object.entries(items).filter(([, n]) => n > 0).map(([id, n]) => `${n} ${LOOT.find((l) => l.id === id)?.name ?? id}`).join(", ");
}
function OfferGrid({ current, onChange }) {
	const bag = sim.dumpBag();
	const held = LOOT.filter((l) => (bag[l.id] ?? 0) > 0 || (current[l.id] ?? 0) > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 grid grid-cols-5 gap-1",
		children: held.map((l) => {
			const n = current[l.id] ?? 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: cn("relative aspect-square overflow-hidden rounded-md border", n > 0 ? "border-gold" : "border-border"),
				onClick: () => {
					const next = { ...current };
					const max = bag[l.id] ?? 0;
					next[l.id] = n >= max ? 0 : n + 1;
					onChange(next);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: lootIcon(l.id),
					alt: "",
					className: "size-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute right-0.5 bottom-0.5 rounded-sm bg-bg/80 px-1 text-[10px] tabular-nums",
					children: n
				})]
			}, l.id);
		})
	});
}
var heartbeat = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("46e384e2c63569a54fc1b0f0b06fa175fe615f7792438e3045f2dfa668486c13"));
var createClan = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("a86f966b94718debf4f9515b7936c9ceae7ce43fe498fba6bb5d30b4099533b0"));
var joinClan = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("26d062d22df9defd6b62bffce8e7e19544618af1ba7c3b8607903324685c4caa"));
var leaveClan = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("f8d5dba550700df457b8e8f7623b4c91e8f096084f16a0bbe954e108ed869764"));
var strikeRaid = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("91d37860a72e99888c8a03ac360a11732cff928120da8f7cc1be8c75fa5d1537"));
var challengeCrusader = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("deace6b747d57e9513111c63d026599dddf8fb05eeb0d10e3135525336771823"));
var pullCloudSave = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("992591a67caef953846791e661f3add603e013c1b28286d32d5f6f11a9d7bd01"));
var pushCloudSave = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("33a01b4f54aa166076641f2f72153e4607087b1e18dc1b27059a980b2b3a7064"));
var staffStatus = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("5a634201303bdd9522fa91eaeb247875276bd6a583090403868168a529ab4202"));
var claimStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("4e2328c161c48c0d63008d38bf11f26449c43f652254d593cc3d01cc23b34404"));
var staffRoster = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("fba7ade57cb23f7cf5d97622725f8cce14671a7cd19d74b0d7bac74d35a3acde"));
var staffGrantGems = createServerFn({ method: "POST" }).validator((d) => d).middleware([authMiddleware]).handler(createSsrRpc("87fb899aa326ff5eac5b6e4f1952e2b1f4767d3054467ac381a7a7d25110a3e1"));
function ArenaDuel() {
	const snap = useGame((s) => s.snap);
	const refresh = useGame((s) => s.refresh);
	const { user } = useCurrentUserState();
	const [rivals, setRivals] = (0, import_react.useState)([]);
	const [bout, setBout] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!user) return;
		heartbeat({ data: {
			name: user.displayName ?? "Crusader",
			power: snap.dps + snap.clickDmg * .35,
			maxFloor: snap.maxFloor
		} }).then((w) => setRivals(w.rivals)).catch(() => void 0);
	}, [
		user,
		snap.dps,
		snap.maxFloor
	]);
	function playBars(foe, win) {
		setBout({
			foe,
			you: 100,
			them: 100
		});
		let you = 100;
		let them = 100;
		const id = window.setInterval(() => {
			if (win) them = Math.max(0, them - 14 - Math.random() * 10);
			else you = Math.max(0, you - 14 - Math.random() * 10);
			if (!win) them = Math.max(8, them - 4);
			else you = Math.max(8, you - 4);
			setBout({
				foe,
				you,
				them
			});
			if (you <= 0 || them <= 0) {
				window.clearInterval(id);
				setBout({
					foe,
					you,
					them,
					win
				});
			}
		}, 120);
	}
	function npcFight() {
		if (busy || snap.arenaCharges < 1) return;
		unlockAudio();
		const result = sim.fightArena();
		if (!result) return;
		setBusy(true);
		playBars(result.foe, result.win);
		window.setTimeout(() => {
			if (result.win) sfx.win();
			else sfx.fail();
			useGame.getState().setArenaResult(result);
			refresh();
			setBusy(false);
		}, 1400);
	}
	function peopleFight(id, name) {
		if (busy) return;
		unlockAudio();
		setBusy(true);
		challengeCrusader({ data: { defenderId: id } }).then((r) => {
			sim.applyLoot({
				gold: r.gold,
				souls: r.souls,
				influence: r.influence,
				chests: r.chests
			});
			playBars(name, r.win);
			window.setTimeout(() => {
				if (r.win) sfx.win();
				else sfx.fail();
				useGame.getState().setArenaResult({
					win: r.win,
					foe: r.foe,
					yourPower: r.yourPower,
					theirPower: r.theirPower,
					gold: r.gold,
					souls: r.souls,
					influence: r.influence,
					chests: r.chests
				});
				refresh();
				setBusy(false);
			}, 1400);
		}).catch((e) => {
			setNote(e instanceof Error ? e.message : "The pit refused.");
			setBusy(false);
		});
	}
	const youFaces = snap.heroes.filter((h) => h.level > 0).slice(0, 3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-gold/40 bg-wood p-4 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-lg text-gold",
				children: "One-on-one"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-fg/80",
				children: [
					"Your warband vs theirs. Charges ",
					snap.arenaCharges,
					"/",
					snap.arenaChargeMax,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex -space-x-2",
						children: youFaces.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: heroPortrait(h.id),
							alt: "",
							className: "size-10 rounded-full border border-gold object-cover"
						}, h.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-gold",
						children: "VS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-10 items-center justify-center rounded-full border border-border bg-bg font-display text-xs",
						children: bout?.foe.slice(0, 1) ?? "?"
					})
				]
			}),
			bout ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					label: "You",
					value: bout.you,
					good: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					label: bout.foe,
					value: bout.them
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3 h-12 w-full",
				disabled: !snap.arenaUnlocked || snap.arenaCharges < 1 || busy,
				onClick: npcFight,
				children: snap.arenaUnlocked ? "Fight a banner" : "Reach floor 5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs tracking-wide text-gold uppercase",
				children: "People"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-2 flex flex-col gap-2",
				children: [rivals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "Sign in to duel other hunters. Banners still fight."
				}) : null, rivals.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-md border border-border bg-bg/40 px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-sm",
							children: [r.clanTag ? `[${r.clanTag}] ` : "", r.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs tabular-nums text-muted",
							children: [
								"Floor ",
								r.maxFloor,
								" · ",
								formatNum(r.power)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						className: "h-11",
						disabled: busy,
						onClick: () => peopleFight(r.userId, r.name),
						children: "Duel"
					})]
				}, r.userId))]
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-gold",
				children: note
			}) : null
		]
	});
}
function Bar({ label, value, good }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-1 text-[11px]",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-3 overflow-hidden rounded-full bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("h-full", good ? "bg-gold" : "bg-accent"),
			style: { width: `${Math.max(0, Math.min(100, value))}%` }
		})
	})] });
}
function errMessage$1(e) {
	if (e && typeof e === "object" && "message" in e) return String(e.message);
	return "The rift refused.";
}
function ClanSync() {
	const { user, isPending } = useCurrentUserState();
	const snap = useGame((s) => s.snap);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		const tick = () => {
			heartbeat({ data: {
				name: user.displayName ?? user.primaryEmail ?? "Crusader",
				power: snap.dps + snap.clickDmg * .35,
				maxFloor: snap.maxFloor
			} }).then((next) => useGame.getState().setOnlineCount(next.online)).catch(() => void 0);
		};
		tick();
		const id = window.setInterval(tick, 12e3);
		return () => window.clearInterval(id);
	}, [
		user,
		isPending,
		snap.dps,
		snap.clickDmg,
		snap.maxFloor
	]);
	return null;
}
function ClanPanel() {
	const { user, isPending } = useCurrentUserState();
	const page = useGame((s) => s.clanPage);
	const setPage = useGame((s) => s.setClanPage);
	const [world, setWorld] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [tag, setTag] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const snap = useGame((s) => s.snap);
	async function refreshWorld() {
		if (!user) return;
		const next = await heartbeat({ data: {
			name: user.displayName ?? user.primaryEmail ?? "Crusader",
			power: snap.dps + snap.clickDmg * .35,
			maxFloor: snap.maxFloor
		} });
		setWorld(next);
		useGame.getState().setOnlineCount(next.online);
	}
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		refreshWorld().catch((e) => setNote(errMessage$1(e)));
		const id = window.setInterval(() => {
			refreshWorld().catch(() => void 0);
		}, 8e3);
		return () => window.clearInterval(id);
	}, [user, isPending]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-24 animate-pulse rounded-lg border border-border bg-bg/40" });
	if (page === "hub") {
		const items = [
			{
				id: "servers",
				label: "Servers",
				icon: Globe
			},
			{
				id: "chat",
				label: "World chat",
				icon: MessageCircle
			},
			{
				id: "rating",
				label: "Rating",
				icon: Trophy
			},
			{
				id: "clan",
				label: "My Clan",
				icon: Shield
			},
			{
				id: "science",
				label: "Science",
				icon: Beaker
			},
			{
				id: "arena",
				label: "Arena",
				icon: Swords
			},
			{
				id: "mail",
				label: "Clan mail",
				icon: Mail
			},
			{
				id: "camp",
				label: "Army Camp",
				icon: Flag
			},
			{
				id: "manage",
				label: "Manage Clan",
				icon: Settings
			},
			{
				id: "profile",
				label: "My Profile",
				icon: User
			}
		];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pt-3",
			children: [world?.online ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-2 text-center font-display text-sm text-gold tabular-nums",
				children: [
					world.online,
					" crusader",
					world.online === 1 ? "" : "s",
					" online"
				]
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						sfx.ui();
						setPage(it.id);
					},
					className: "flex h-14 w-full items-center gap-3 rounded-lg border border-gold/30 bg-wood px-3 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-10 place-items-center rounded-full bg-surface text-gold",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(it.icon, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-base text-gold",
						children: it.label
					})]
				}) }, it.id))
			})]
		});
	}
	if (page === "servers") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "mb-3 h-11 text-sm text-gold",
			onClick: () => setPage("hub"),
			children: "← Clans"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServerPanel, {})]
	});
	if (page === "chat") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "mb-3 h-11 text-sm text-gold",
			onClick: () => setPage("hub"),
			children: "← Clans"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlazaPanel, {})]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "mb-3 h-11 text-sm text-gold",
			onClick: () => setPage("hub"),
			children: "← Clans"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-border bg-bg/40 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-base font-semibold",
					children: "Clans"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Sign in to found a banner, raid, and duel."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-4 h-12 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: "Sign in to hunt together"
					})
				})
			]
		})]
	});
	async function run(fn) {
		if (busy) return;
		setBusy(true);
		setNote("");
		try {
			await fn();
		} catch (e) {
			setNote(errMessage$1(e));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mb-3 h-11 text-sm text-gold",
				onClick: () => setPage("hub"),
				children: "← Clans"
			}),
			page === "clan" || page === "camp" || page === "manage" ? world?.clan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClanHome, {
				world,
				busy,
				onStrike: () => run(async () => {
					unlockAudio();
					const result = await strikeRaid();
					sim.applyLoot(result);
					useGame.getState().refresh();
					if (result.killed) sfx.win();
					else sfx.hit(false);
					await refreshWorld();
				}),
				onLeave: () => run(async () => {
					const next = await leaveClan();
					setWorld(next);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JoinBox, {
				name,
				tag,
				code,
				busy,
				setName,
				setTag,
				setCode,
				onFound: () => run(async () => {
					const next = await createClan({ data: {
						name,
						tag
					} });
					setWorld(next);
					sfx.hire();
				}),
				onJoin: () => run(async () => {
					const next = await joinClan({ data: { code } });
					setWorld(next);
					sfx.hire();
				})
			}) : null,
			page === "arena" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArenaDuel, {}) : null,
			page === "rating" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: (world?.board ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-md border border-border bg-bg/40 px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-display text-sm",
						children: [
							"[",
							c.tag,
							"] ",
							c.name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs tabular-nums text-muted",
						children: [
							c.members,
							" · ",
							formatNum(c.influence)
						]
					})]
				}, c.id))
			}) : null,
			page === "science" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Buy rift sciences in Shop with influence earned from raids and the arena."
			}) : null,
			page === "mail" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Clan mail waits for officers. Use World chat for the rift."
			}) : null,
			page === "profile" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-bg/40 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-base",
					children: world?.name ?? "Crusader"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm tabular-nums",
					children: [
						"Floor ",
						snap.maxFloor,
						" · power ",
						formatNum(snap.dps)
					]
				})]
			}) : null,
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-gold",
				children: note
			}) : null
		]
	});
}
function JoinBox(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-bg/40 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-base font-semibold",
				children: "Found or join a clan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-4 block text-xs text-muted",
				children: ["Clan name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: props.name,
					onChange: (e) => props.setName(e.target.value),
					maxLength: 22,
					className: "mt-1 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-3 block text-xs text-muted",
				children: ["Tag", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: props.tag,
					onChange: (e) => props.setTag(e.target.value.toUpperCase()),
					maxLength: 4,
					className: "mt-1 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3 h-12 w-full",
				disabled: props.busy,
				onClick: props.onFound,
				children: "Found clan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-5 block text-xs text-muted",
				children: ["Invite code", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: props.code,
					onChange: (e) => props.setCode(e.target.value.toUpperCase()),
					maxLength: 8,
					className: "mt-1 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "mt-3 h-12 w-full",
				disabled: props.busy,
				onClick: props.onJoin,
				children: "Join by code"
			})
		]
	});
}
function ClanHome({ world, busy, onStrike, onLeave }) {
	const clan = world.clan;
	const ratio = clan.raidMax > 0 ? clan.raidHp / clan.raidMax : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-bg/40 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "font-display text-base font-semibold",
					children: [
						"[",
						clan.tag,
						"] ",
						clan.name
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted",
				children: [
					"Invite ",
					clan.code,
					" · ",
					clan.memberCount,
					" · ",
					formatNum(clan.influence),
					" influence"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm font-medium",
				children: ["Clan raid · wave ", clan.raidWave]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 h-2 overflow-hidden rounded-full bg-surface-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-accent",
					style: { width: `${Math.max(2, ratio * 100)}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3 h-12 w-full",
				disabled: busy || world.raidReadyIn > 0,
				onClick: onStrike,
				children: world.raidReadyIn > 0 ? `Strike in ${formatTime(world.raidReadyIn)}` : "Strike the clan tyrant"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 flex flex-col gap-1",
				children: world.members.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn(m.role === "founder" ? "text-gold" : "text-fg"),
						children: [
							i + 1,
							". ",
							m.name,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: m.role === "founder" ? "Leader" : m.role
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs tabular-nums text-muted",
						children: ["floor ", m.maxFloor]
					})]
				}, m.userId))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				className: "mt-4 h-12 w-full",
				disabled: busy,
				onClick: onLeave,
				children: "Leave banner"
			})
		]
	});
}
function dump() {
	return JSON.stringify(sim.state);
}
function CloudSync() {
	const { user, isPending } = useCurrentUserState();
	const ready = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) {
			ready.current = false;
			return;
		}
		let alive = true;
		ready.current = false;
		async function boot() {
			try {
				const cloud = await pullCloudSave();
				if (!alive) return;
				if (cloud.payload) {
					const parsed = JSON.parse(cloud.payload);
					if (Number(parsed.lastSaveAt ?? 0) >= (sim.state.lastSaveAt ?? 0)) sim.hydrate(applyIncoming(parsed));
				}
				if (cloud.grantGems > 0) sim.grantGems(cloud.grantGems);
				sim.save();
				useGame.getState().refresh();
				await pushCloudSave({ data: { payload: dump() } });
				ready.current = true;
			} catch {
				ready.current = true;
			}
		}
		boot();
		const push = () => {
			if (!ready.current) return;
			pushCloudSave({ data: { payload: dump() } }).catch(() => void 0);
		};
		const id = window.setInterval(push, 2e4);
		const onHide = () => {
			if (document.visibilityState === "hidden") push();
		};
		document.addEventListener("visibilitychange", onHide);
		window.addEventListener("pagehide", push);
		return () => {
			alive = false;
			window.clearInterval(id);
			document.removeEventListener("visibilitychange", onHide);
			window.removeEventListener("pagehide", push);
		};
	}, [user, isPending]);
	return null;
}
function ShopPanel() {
	const snap = useGame((s) => s.snap);
	const refresh = useGame((s) => s.refresh);
	const note = useGame((s) => s.shopNote);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-gold/40 bg-wood p-4 text-fg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg font-semibold",
						children: "Crafting"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-fg/80",
						children: "Turn gems into ember. Bone drops from every kill. Each crusader has a unique weapon to rank up."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm tabular-nums",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-gold",
								children: [snap.ember, " ember"]
							}),
							" · ",
							snap.bone,
							" bone · ",
							snap.riftDust,
							" rift dust · ",
							formatNum(snap.gems),
							" gems"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 h-12 w-full",
						disabled: snap.gems < 10,
						onClick: () => {
							unlockAudio();
							if (sim.convertGems()) {
								sfx.gold();
								refresh();
							}
						},
						children: "Turn 10 gems into 8 ember"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 mb-2 text-xs tracking-wide text-muted uppercase",
				children: "Craft for each hero"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: snap.heroes.map((h) => {
					const def = HEROES.find((x) => x.id === h.id);
					const craft = HERO_CRAFTS[h.id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 rounded-lg border border-border bg-bg/40 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: heroPortrait(h.id),
								alt: "",
								className: "size-14 shrink-0 rounded-md object-cover",
								crossOrigin: "anonymous"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-sm font-semibold",
									children: craft.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										def.name,
										" · rank ",
										h.craftRank,
										"/8 · ",
										craft.blurb
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "h-11 shrink-0",
								disabled: !h.canCraft,
								onClick: () => {
									unlockAudio();
									if (sim.craftHero(h.id)) {
										sfx.hire();
										refresh();
									}
								},
								children: h.level <= 0 ? "Hire first" : `${h.craftEmber} ember`
							})
						]
					}, h.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg border border-border bg-bg/40 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-soul" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-semibold",
							children: "Soul Well"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"A short cutting rite. Free once a day, then ",
							snap.summonCost,
							" gems. New heroes climb out."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 h-12 w-full",
						disabled: !snap.freeWell && snap.gems < snap.summonCost,
						onClick: () => {
							unlockAudio();
							sfx.ui();
							useGame.getState().setSummonOpen(true);
						},
						children: snap.freeWell ? "Enter the well · free today" : `Enter the well · ${snap.summonCost} gems`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg border border-border bg-bg/40 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "size-4 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-semibold",
							children: "Gem shop"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: "Apple and Google only take card money inside their stores. Gold can still buy a small pouch."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						className: "mt-2 h-12 w-full",
						disabled: !snap.canPouch,
						onClick: () => {
							unlockAudio();
							if (sim.buyGemPouch()) {
								sfx.gold();
								refresh();
							}
						},
						children: ["Trade gold for 40 gems · ", formatNum(snap.pouchCost)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2",
						children: GEM_PACKS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between rounded-md border border-border px-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-sm",
								children: [
									p.name,
									" ",
									p.tag ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-gold",
										children: ["· ", p.tag]
									}) : null
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [p.gems, " gems"]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								className: "h-11",
								onClick: () => {
									useGame.getState().setShopNote(`${p.usd} packs go through the App Store / Play Store when this hunt is listed.`);
								},
								children: p.usd
							})]
						}, p.id))
					}),
					note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-gold",
						children: note
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 mb-2 text-xs tracking-wide text-muted uppercase",
				children: "Weapons"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: snap.weapons.map((w) => {
					const def = WEAPONS.find((x) => x.id === w.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 rounded-lg border border-border bg-bg/40 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sword, { className: "size-4 shrink-0 text-muted" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-sm font-semibold",
										children: def.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] text-muted",
										children: ["Rank ", w.level]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: def.blurb
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "h-11 shrink-0",
								disabled: w.canGem ? !w.canGem : !w.canAfford,
								onClick: () => {
									unlockAudio();
									if (sim.buyWeapon(w.id)) {
										sfx.hire();
										refresh();
									}
								},
								children: w.gemCost > 0 ? `${w.gemCost} gems` : formatNum(w.cost)
							})
						]
					}, w.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 mb-2 text-xs tracking-wide text-muted uppercase",
				children: "Gems to socket"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: snap.sockets.map((s) => {
					const def = SOCKETS.find((x) => x.id === s.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 rounded-lg border border-border bg-bg/40 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "font-display text-sm font-semibold",
								children: [def.name, s.equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-gold",
									children: "in"
								}) : null]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: def.blurb
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: s.owned ? "secondary" : "default",
							className: "h-11",
							disabled: !s.canAfford,
							onClick: () => {
								unlockAudio();
								if (sim.buySocket(s.id)) {
									sfx.ui();
									refresh();
								}
							},
							children: s.owned ? s.equipped ? "Unequip" : "Socket" : `${s.gemCost} gems`
						})]
					}, s.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 mb-2 text-xs tracking-wide text-muted uppercase",
				children: "Forge with souls"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: snap.relics.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelicRow, {
					relic: r,
					onBuy: () => {
						unlockAudio();
						if (sim.buyRelic(r.id)) {
							sfx.hire();
							refresh();
						}
					}
				}, r.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 mb-2 text-xs tracking-wide text-muted uppercase",
				children: "Rift sciences · influence"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: snap.sciences.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScienceRow, {
					science: s,
					onBuy: () => {
						unlockAudio();
						if (sim.buyScience(s.id)) {
							sfx.hire();
							refresh();
						}
					}
				}, s.id))
			})
		]
	});
}
function RelicRow({ relic, onBuy }) {
	const def = RELICS.find((r) => r.id === relic.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center gap-3 rounded-lg border border-border bg-bg/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-sm font-semibold",
					children: def.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[11px] text-muted",
					children: ["Rank ", relic.level]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: def.blurb
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			className: "h-11 shrink-0",
			disabled: !relic.canAfford,
			onClick: onBuy,
			children: formatNum(relic.cost)
		})]
	});
}
function ScienceRow({ science, onBuy }) {
	const def = SCIENCES.find((s) => s.id === science.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center gap-3 rounded-lg border border-border bg-bg/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-sm font-semibold",
					children: def.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[11px] text-muted",
					children: ["Rank ", science.level]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: def.blurb
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			variant: "secondary",
			className: "h-11 shrink-0",
			disabled: !science.canAfford,
			onClick: onBuy,
			children: formatNum(science.cost)
		})]
	});
}
function CraftPage({ onClose }) {
	const snap = useGame((s) => s.snap);
	const refresh = useGame((s) => s.refresh);
	const [page, setPage] = (0, import_react.useState)("bench");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [slots, setSlots] = (0, import_react.useState)([
		null,
		null,
		null,
		null,
		null,
		null
	]);
	const [catalyst, setCatalyst] = (0, import_react.useState)(null);
	const [picking, setPicking] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const recipe = matchRecipe(slots, catalyst);
	const chance = craftChance(recipe, catalyst);
	const filled = slots.filter(Boolean).length;
	const bag = (0, import_react.useMemo)(() => {
		const placed = {};
		for (const id of slots) if (id) placed[id] = (placed[id] ?? 0) + 1;
		if (catalyst) placed[catalyst] = (placed[catalyst] ?? 0) + 1;
		return snap.bag.map((b) => ({
			...b,
			count: Math.max(0, b.count - (placed[b.id] ?? 0))
		}));
	}, [
		snap.bag,
		slots,
		catalyst
	]);
	function put(id) {
		const row = bag.find((b) => b.id === id);
		if (!row || row.count <= 0) return;
		if (picking === "catalyst" || page === "catalyst") {
			setCatalyst(id);
			setPicking(null);
			setPage("bench");
			return;
		}
		const i = slots.findIndex((s) => s == null);
		if (i < 0) return;
		const next = [...slots];
		next[i] = id;
		setSlots(next);
		setPicking(null);
	}
	function clearSlot(i) {
		const next = [...slots];
		next[i] = null;
		setSlots(next);
	}
	function create() {
		if (busy || filled === 0) return;
		unlockAudio();
		setBusy(true);
		setNote("");
		sfx.hammer();
		window.setTimeout(() => {
			const result = sim.tryCraft(slots.filter((s) => !!s), catalyst);
			refresh();
			if (!result.ok) {
				setNote(result.blurb);
				setBusy(false);
				return;
			}
			setSlots([
				null,
				null,
				null,
				null,
				null,
				null
			]);
			setCatalyst(null);
			setNote(result.fail ? result.blurb : `${result.name}. ${result.blurb}`);
			if (result.fail) sfx.fail();
			else sfx.chest();
			setBusy(false);
		}, 720);
	}
	const shown = bag.filter((b) => {
		if (b.count <= 0 && filter !== "all") return false;
		if (filter === "all") return true;
		return b.kind === filter;
	});
	if (page === "market") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FullShell, {
		title: "Shop",
		onClose,
		onBack: () => setPage("bench"),
		snap,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopPanel, {})
	});
	if (page === "recipes") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FullShell, {
		title: "Recipes",
		onClose,
		onBack: () => setPage("bench"),
		snap,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-2",
			children: RECIPES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-lg border border-border bg-bg/40 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-sm font-semibold",
						children: r.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: r.blurb
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-1",
						children: [
							r.inputs.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: lootIcon(id),
								alt: "",
								className: "size-10 rounded-md object-cover"
							}, id + r.id)),
							r.catalyst ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-10 place-items-center rounded-md border border-gold/40 text-[10px] text-gold",
								children: "+"
							}) : null,
							r.catalyst ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: lootIcon(r.catalyst),
								alt: "",
								className: "size-10 rounded-md object-cover"
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs tabular-nums text-gold",
						children: [
							"Base chance ",
							Math.round(r.chance * 100),
							"%"
						]
					})
				]
			}, r.id))
		})
	});
	if (page === "catalyst") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FullShell, {
		title: "Catalyst",
		onClose,
		onBack: () => setPage("bench"),
		snap,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-muted",
			children: "A flask in the side slot raises the hammer's chance."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemGrid, {
			items: bag.filter((b) => b.id === "flask" || b.kind === "shard"),
			onPick: (id) => put(id)
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FullShell, {
		title: "Craft",
		onClose,
		snap,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto flex max-w-sm items-start gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "grid size-16 shrink-0 place-items-center rounded-lg border border-gold/50 bg-surface",
						onClick: () => setPage("recipes"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: lootIcon("ticket"),
							alt: "",
							className: "size-10 rounded object-cover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] tracking-wide text-gold uppercase",
							children: "Recipes"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("relative grid flex-1 grid-cols-3 gap-1 rounded-lg bg-bg p-1", busy && "bench-flash"),
						children: [slots.map((id, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "aspect-square rounded-md border border-border bg-bg",
							onClick: () => id ? clearSlot(i) : setPicking("slot"),
							children: id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: lootIcon(id),
								alt: "",
								className: "size-full rounded-md object-cover"
							}) : null
						}, i)), busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/sprites/hammer.png",
							alt: "",
							className: "hammer-strike pointer-events-none absolute inset-0 m-auto size-28"
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "grid size-16 shrink-0 place-items-center rounded-lg border border-gold/50 bg-surface",
						onClick: () => setPage("catalyst"),
						children: [catalyst ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: lootIcon(catalyst),
							alt: "",
							className: "size-10 rounded object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: lootIcon("flask"),
							alt: "",
							className: "size-10 rounded object-cover opacity-50"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] tracking-wide text-gold uppercase",
							children: "Catalyst"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-3 rounded-lg border border-border bg-bg/40 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: lootIcon("ticket"),
						alt: "",
						className: "size-12 rounded-md object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: ["Base chance: ", filled ? `${Math.round(chance * 100)}%` : "—"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: ["Catalysts: ", catalyst ? LOOT.find((l) => l.id === catalyst)?.name : "—"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-display text-sm text-gold",
								children: recipe ? recipe.name : filled ? "Random smash" : "Empty bench"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "h-14 w-24 shrink-0",
						disabled: busy || filled === 0,
						onClick: create,
						children: busy ? "…" : "Create"
					})
				]
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-gold",
				children: note
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-5 gap-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemGrid, {
					items: shown,
					onPick: put
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-2",
				children: [
					"all",
					"loot",
					"shard"
				].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(f),
					className: cn("h-11 flex-1 rounded-md border font-display text-sm capitalize", filter === f ? "border-gold bg-wood text-gold" : "border-border bg-surface text-muted"),
					children: f === "all" ? "All" : f === "loot" ? "Loot" : "Shards"
				}, f))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "mt-3 h-12 w-full",
				onClick: () => setPage("market"),
				children: "Soul Well and gem shop"
			})
		]
	});
}
function FullShell({ title, onClose, onBack, snap, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center justify-between gap-2 bg-wood px-3 py-2 text-xs tabular-nums text-gold",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, { className: "size-3" }),
							" ",
							formatNum(snap.souls)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "size-3" }),
							" ",
							formatNum(snap.gems)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-3" }),
							" ",
							formatNum(snap.gold)
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center px-3 py-2",
				children: [
					onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 pr-3 text-sm text-gold",
						onClick: onBack,
						children: "← Bench"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-11" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display flex-1 text-center text-xl text-gold",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						className: "grid size-11 place-items-center text-gold",
						onClick: onClose,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-6" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scroll-pane min-h-0 flex-1 px-2 pb-[max(1rem,env(safe-area-inset-bottom))]",
				children
			})
		]
	});
}
function ItemGrid({ items, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: items.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled: b.count <= 0,
		onClick: () => {
			unlockAudio();
			sfx.ui();
			onPick(b.id);
		},
		className: "relative aspect-square overflow-hidden rounded-md border border-border bg-bg disabled:opacity-40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: lootIcon(b.id),
			alt: b.name,
			className: "size-full object-cover"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute right-0.5 bottom-0.5 rounded-sm bg-bg/80 px-1 text-[10px] tabular-nums text-fg",
			children: formatNum(b.count)
		})]
	}, b.id)) });
}
function RealmPanel() {
	const snap = useGame((s) => s.snap);
	const refresh = useGame((s) => s.refresh);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-lg border border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/bg/realms.jpg",
					alt: "",
					className: "h-36 w-full object-cover",
					crossOrigin: "anonymous"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-bg/80 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map$1, { className: "size-4 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-semibold",
							children: "Realms"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"Walk a banner you have already bled for. Highest floor ",
							snap.maxFloor,
							"."
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: REALMS.map((r) => {
					const open = snap.maxFloor >= r.minFloor;
					const here = snap.realm === r.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: cn("overflow-hidden rounded-lg border border-border", here && "border-accent"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !open,
							onClick: () => {
								unlockAudio();
								if (sim.travelRealm(r.id)) {
									sfx.ui();
									refresh();
								}
							},
							className: "flex w-full gap-3 bg-bg/40 p-3 text-left disabled:opacity-40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: r.art,
								alt: "",
								className: "size-16 shrink-0 rounded-md object-cover",
								crossOrigin: "anonymous"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-display text-sm font-semibold",
										children: [r.name, here ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-2 text-accent",
											children: "here"
										}) : null]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: open ? r.blurb : `Unlocks at floor ${r.minFloor}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs tabular-nums text-muted",
										children: ["From floor ", r.minFloor]
									})
								]
							})]
						})
					}, r.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg border border-border bg-bg/40 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-base font-semibold",
						children: "Realm sieges"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Occupy a lair. Kills there score siege points. Hold one banner at a time."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm tabular-nums",
						children: [
							formatNum(snap.siegePts),
							" siege points",
							snap.siegeReadyIn > 0 ? ` · travel ${formatTime(snap.siegeReadyIn)}` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2",
						children: SIEGE_LAIRS.map((l) => {
							const realm = REALMS.find((r) => r.id === l.id);
							const open = snap.maxFloor >= realm.minFloor;
							const here = snap.siegeLair === l.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2 rounded-md border border-border px-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-display text-sm",
										children: [l.name, here ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-2 text-gold",
											children: "held"
										}) : null]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: open ? l.bonus : `Unlocks at floor ${realm.minFloor}`
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									className: "h-11",
									disabled: !open || here || snap.siegeReadyIn > 0,
									onClick: () => {
										unlockAudio();
										if (sim.occupyLair(l.id)) {
											sfx.ui();
											refresh();
										}
									},
									children: here ? "Held" : "March"
								})]
							}, l.id);
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArenaDuel, {})
		]
	});
}
function errMessage(e) {
	if (e && typeof e === "object" && "message" in e) return String(e.message);
	return "The rift refused.";
}
function StaffPanel() {
	const { user, isPending } = useCurrentUserState();
	const founderClaimed = useGame((s) => s.snap.founderClaimed);
	const [isStaff, setIsStaff] = (0, import_react.useState)(false);
	const [canClaim, setCanClaim] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [roster, setRoster] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		staffStatus().then((s) => {
			setIsStaff(s.isStaff);
			setCanClaim(s.canClaim);
			if (s.isStaff) return staffRoster().then(setRoster);
		}).catch(() => void 0);
	}, [user, isPending]);
	if (isPending || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 text-sm text-muted",
		children: "Sign in to claim staff or sync the cloud."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-lg border border-border bg-bg/40 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-base font-semibold",
				children: "Staff"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "First signed-in founder claims admin. Cloud save lives on this hunt's server, not Google Drive."
			}),
			canClaim && !isStaff ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3 h-12 w-full",
				disabled: busy,
				onClick: () => {
					unlockAudio();
					setBusy(true);
					claimStaff().then(() => {
						sfx.win();
						setIsStaff(true);
						setCanClaim(false);
						setNote("You hold the staff seat.");
						return staffRoster().then(setRoster);
					}).catch((e) => setNote(errMessage(e))).finally(() => setBusy(false));
				},
				children: "Claim founder admin"
			}) : null,
			isStaff ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [!founderClaimed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3 h-12 w-full",
				onClick: () => {
					unlockAudio();
					if (sim.claimFounder()) {
						sfx.chest();
						useGame.getState().refresh();
						setNote("Tithe taken. The button is gone.");
					}
				},
				children: "Founder's Tithe · take everything"
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: [roster.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "No crusaders signed in yet."
				}) : null, roster.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-md border border-border px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-sm",
							children: r.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs tabular-nums text-muted",
							children: [
								"Floor ",
								r.maxFloor,
								" · power ",
								formatNum(r.power)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						className: "h-11",
						disabled: busy,
						onClick: () => {
							unlockAudio();
							setBusy(true);
							staffGrantGems({ data: {
								userId: r.userId,
								gems: 200
							} }).then(() => {
								sfx.chest();
								if (r.userId === user.id) {
									sim.grantGems(200);
									useGame.getState().refresh();
								}
								setNote(`Granted 200 gems to ${r.name}. They land on next cloud pull.`);
							}).catch((e) => setNote(errMessage(e))).finally(() => setBusy(false));
						},
						children: "+200 gems"
					})]
				}, r.userId))]
			})] }) : !canClaim ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Staff seat is held. Sign in with that account to run the rift."
			}) : null,
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-gold",
				children: note
			}) : null
		]
	});
}
var CUTS = 5;
function SummonGame({ onClose }) {
	const canvasRef = (0, import_react.useRef)(null);
	const [hits, setHits] = (0, import_react.useState)(0);
	const [cuts, setCuts] = (0, import_react.useState)(0);
	const [phase, setPhase] = (0, import_react.useState)("play");
	const [result, setResult] = (0, import_react.useState)("");
	const angle = (0, import_react.useRef)(0);
	const raf = (0, import_react.useRef)(0);
	const hitsRef = (0, import_react.useRef)(0);
	const cutsRef = (0, import_react.useRef)(0);
	const windowOn = (0, import_react.useRef)(false);
	const flash = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let last = performance.now();
		const loop = (now) => {
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			angle.current += dt * (2.2 + hitsRef.current * .28);
			const a = angle.current % (Math.PI * 2);
			windowOn.current = a > 4.55 && a < 5.45;
			flash.current = Math.max(0, flash.current - dt * 4);
			const w = canvas.width;
			const h = canvas.height;
			ctx.clearRect(0, 0, w, h);
			const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 140);
			g.addColorStop(0, `rgba(196,92,74,${.18 + flash.current * .35})`);
			g.addColorStop(1, "rgba(12,10,11,0)");
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, w, h);
			ctx.save();
			ctx.translate(w / 2, h / 2 + 8);
			ctx.strokeStyle = "rgba(240,230,216,0.16)";
			ctx.lineWidth = 14;
			ctx.beginPath();
			ctx.arc(0, 0, 92, 0, Math.PI * 2);
			ctx.stroke();
			ctx.strokeStyle = windowOn.current ? "#e8a090" : "#c45c4a";
			ctx.lineWidth = 14;
			ctx.beginPath();
			ctx.arc(0, 0, 92, 4.55, 5.45);
			ctx.stroke();
			ctx.rotate(a);
			ctx.strokeStyle = "#f0e6d8";
			ctx.lineWidth = 4;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(0, 12);
			ctx.lineTo(0, -78);
			ctx.stroke();
			ctx.fillStyle = "#c45c4a";
			ctx.beginPath();
			ctx.arc(0, -82, 5, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
			raf.current = requestAnimationFrame(loop);
		};
		raf.current = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf.current);
	}, []);
	function tap() {
		if (phase !== "play") return;
		unlockAudio();
		if (windowOn.current) {
			hitsRef.current += 1;
			flash.current = 1;
			sfx.hit(true);
		} else sfx.fail();
		cutsRef.current += 1;
		setHits(hitsRef.current);
		setCuts(cutsRef.current);
		if (cutsRef.current >= CUTS) {
			const out = sim.summon(hitsRef.current);
			useGame.getState().refresh();
			setPhase("done");
			setResult(out ? out.name : "The well was silent — need gems.");
			if (out?.kind === "hero") sfx.win();
			else sfx.chest();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 grid place-items-end sm:place-items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-bg/80",
			"aria-label": "Close",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative m-3 w-[min(100%-1.5rem,420px)] overflow-hidden rounded-xl border border-border bg-surface",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/bg/well.jpg",
				alt: "",
				className: "absolute inset-0 size-full object-cover opacity-40",
				crossOrigin: "anonymous"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Soul Well"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Cut when the needle kisses the ember. Five cuts. More true cuts, rarer heroes."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						width: 320,
						height: 220,
						className: "mx-auto mt-3 block w-full"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-center text-sm tabular-nums",
						children: [
							"True cuts ",
							hits,
							" · remaining ",
							Math.max(0, CUTS - cuts)
						]
					}),
					phase === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 h-12 w-full",
						onClick: tap,
						children: "Cut"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-center font-display text-lg",
						children: result
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 h-12 w-full",
						onClick: onClose,
						children: "Return"
					})] })
				]
			})]
		})]
	});
}
var C = {
	ink: "#1a1210",
	bone: "#e8dcc4",
	ash: "#8a7e74",
	ember: "#c45c4a",
	emberHot: "#e8a090",
	slime: "#6a8f4e",
	slimeDark: "#2c3a22",
	steel: "#9aa3ad",
	void: "#0e1014",
	rift: "#9bb7c9"
};
function ellipse(ctx, x, y, rx, ry) {
	ctx.beginPath();
	ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}
function drawHeroFigure(ctx, id, t, x, y, scale, attacking) {
	switch (id) {
		case "devourer":
			drawDevourer(ctx, t, x, y, scale, attacking);
			break;
		case "sable":
			drawSable(ctx, t, x, y, scale, attacking);
			break;
		case "iskra":
			drawIskra(ctx, t, x, y, scale, attacking);
			break;
		case "brann":
			drawBrann(ctx, t, x, y, scale, attacking);
			break;
		case "nyx":
			drawNyx(ctx, t, x, y, scale, attacking);
			break;
		case "kira":
			drawKira(ctx, t, x, y, scale, attacking);
			break;
		case "orin": drawOrin(ctx, t, x, y, scale, attacking);
	}
}
var DRAWN_HEROES = [];
function drawDevourer(ctx, t, x, y, scale, attacking) {
	ctx.save();
	ctx.translate(x + attacking * 18 * scale, y);
	ctx.scale(scale, scale);
	ctx.translate(0, Math.sin(t * 2.2) * 3);
	ctx.fillStyle = "rgba(196,92,74,0.18)";
	ellipse(ctx, 0, -78, 38, 70);
	ctx.fill();
	ctx.fillStyle = C.void;
	ctx.beginPath();
	ctx.moveTo(-22, -8);
	ctx.lineTo(-28, -96);
	ctx.lineTo(-8, -118);
	ctx.lineTo(10, -118);
	ctx.lineTo(26, -92);
	ctx.lineTo(20, -8);
	ctx.closePath();
	ctx.fill();
	ctx.strokeStyle = "#2a2428";
	ctx.lineWidth = 2;
	ctx.stroke();
	ctx.fillStyle = C.ember;
	ctx.beginPath();
	ctx.moveTo(-6, -70);
	ctx.lineTo(0, -18);
	ctx.lineTo(6, -70);
	ctx.closePath();
	ctx.fill();
	ctx.globalAlpha = .55 + Math.sin(t * 5) * .25;
	ctx.fillStyle = C.emberHot;
	ctx.beginPath();
	ctx.moveTo(-3, -62);
	ctx.lineTo(0, -26);
	ctx.lineTo(3, -62);
	ctx.closePath();
	ctx.fill();
	ctx.globalAlpha = 1;
	ctx.fillStyle = "#141218";
	ctx.beginPath();
	ctx.moveTo(-16, -118);
	ctx.lineTo(0, -138);
	ctx.lineTo(16, -118);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = C.ember;
	for (const ox of [
		-6,
		0,
		6
	]) ctx.fillRect(ox - 1.2, -128, 2.4, 10);
	ctx.strokeStyle = "#1c181c";
	ctx.lineWidth = 7;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(-22, -78);
	ctx.lineTo(-48, -42);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(22, -78);
	ctx.lineTo(46, -38);
	ctx.stroke();
	ctx.fillStyle = C.ember;
	ellipse(ctx, -50, -40, 6, 5);
	ctx.fill();
	ellipse(ctx, 48, -36, 6, 5);
	ctx.fill();
	ctx.restore();
}
function drawSable(ctx, t, x, y, scale, attacking) {
	ctx.save();
	ctx.translate(x + attacking * 26 * scale, y);
	ctx.scale(scale, scale);
	ctx.translate(0, Math.sin(t * 4) * 2);
	ctx.fillStyle = "#1a1618";
	ctx.beginPath();
	ctx.moveTo(-10, -8);
	ctx.lineTo(-14, -72);
	ctx.lineTo(0, -96);
	ctx.lineTo(12, -70);
	ctx.lineTo(8, -8);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "#2e2628";
	ellipse(ctx, 0, -108, 10, 12);
	ctx.fill();
	ctx.fillStyle = C.ash;
	ellipse(ctx, -4, -110, 2, 2);
	ctx.fill();
	ctx.strokeStyle = C.steel;
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(10, -64);
	ctx.lineTo(28, -48);
	ctx.moveTo(-12, -60);
	ctx.lineTo(-30, -40);
	ctx.stroke();
	ctx.restore();
}
function drawIskra(ctx, t, x, y, scale, attacking) {
	ctx.save();
	ctx.translate(x + attacking * 14 * scale, y);
	ctx.scale(scale, scale);
	ctx.translate(0, Math.sin(t * 3) * 3);
	ctx.fillStyle = "#243040";
	ctx.beginPath();
	ctx.moveTo(-16, -10);
	ctx.lineTo(-18, -70);
	ctx.lineTo(0, -88);
	ctx.lineTo(16, -70);
	ctx.lineTo(14, -10);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "#d8c8b0";
	ellipse(ctx, 0, -100, 11, 12);
	ctx.fill();
	ctx.strokeStyle = C.rift;
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(8, -54);
	ctx.lineTo(6, -120 - Math.sin(t * 8) * 6);
	ctx.stroke();
	ctx.strokeStyle = C.emberHot;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(8, -90);
	ctx.lineTo(18, -80);
	ctx.lineTo(10, -70);
	ctx.lineTo(22, -58);
	ctx.stroke();
	ctx.restore();
}
function drawBrann(ctx, t, x, y, scale, attacking) {
	ctx.save();
	ctx.translate(x + attacking * 16 * scale, y);
	ctx.scale(scale, scale);
	ctx.translate(0, Math.sin(t * 2) * 2);
	ctx.fillStyle = "#4a342c";
	ellipse(ctx, 0, -28, 22, 18);
	ctx.fill();
	ctx.fillStyle = "#6a5044";
	ellipse(ctx, 0, -62, 24, 22);
	ctx.fill();
	ctx.fillStyle = "#c9a070";
	ellipse(ctx, 0, -96, 14, 13);
	ctx.fill();
	ctx.fillStyle = C.ash;
	ctx.fillRect(-16, -104, 32, 6);
	ctx.strokeStyle = C.steel;
	ctx.lineWidth = 6;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(16, -58);
	ctx.lineTo(36, -18);
	ctx.stroke();
	ctx.fillStyle = C.ember;
	ellipse(ctx, 38, -16, 8, 8);
	ctx.fill();
	ctx.restore();
}
function drawNyx(ctx, t, x, y, scale, attacking) {
	ctx.save();
	ctx.translate(x + attacking * 22 * scale, y);
	ctx.scale(scale, scale);
	const bob = Math.sin(t * 5) * 4;
	ctx.translate(0, bob);
	ctx.globalAlpha = .9;
	ctx.fillStyle = "#1c1822";
	ctx.beginPath();
	ctx.moveTo(-12, -8);
	ctx.quadraticCurveTo(-28, -50, 0, -92);
	ctx.quadraticCurveTo(24, -50, 10, -8);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "#d8d0c8";
	ellipse(ctx, 0, -104, 9, 11);
	ctx.fill();
	ctx.strokeStyle = C.rift;
	ctx.globalAlpha = .55 + Math.sin(t * 6) * .25;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(0, -52, 22, .2, 2.6);
	ctx.stroke();
	ctx.globalAlpha = 1;
	ctx.restore();
}
function drawKira(ctx, t, x, y, scale, attacking) {
	ctx.save();
	ctx.translate(x + attacking * 28 * scale, y);
	ctx.scale(scale, scale);
	ctx.translate(0, Math.sin(t * 4.4) * 2);
	ctx.fillStyle = "#2a2228";
	ctx.beginPath();
	ctx.moveTo(-9, -8);
	ctx.lineTo(-12, -70);
	ctx.lineTo(0, -88);
	ctx.lineTo(11, -68);
	ctx.lineTo(8, -8);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "#e8d8c8";
	ellipse(ctx, 0, -100, 8, 10);
	ctx.fill();
	ctx.strokeStyle = C.rift;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(8, -58);
	ctx.lineTo(26, -36);
	ctx.stroke();
	ctx.restore();
}
function drawOrin(ctx, t, x, y, scale, attacking) {
	ctx.save();
	ctx.translate(x + attacking * 12 * scale, y);
	ctx.scale(scale, scale);
	ctx.translate(0, Math.sin(t * 2.1) * 2);
	ctx.fillStyle = "#3a2c20";
	ellipse(ctx, 0, -26, 20, 16);
	ctx.fill();
	ctx.fillStyle = "#c4a060";
	ellipse(ctx, 0, -62, 22, 20);
	ctx.fill();
	ctx.fillStyle = "#e8d4b0";
	ellipse(ctx, 0, -96, 13, 13);
	ctx.fill();
	ctx.fillStyle = "#d4b483";
	ctx.fillRect(-14, -108, 28, 6);
	ctx.fillStyle = C.ember;
	ellipse(ctx, -5, -98, 2, 2);
	ctx.fill();
	ellipse(ctx, 5, -98, 2, 2);
	ctx.fill();
	ctx.restore();
}
function drawMonster(ctx, kind, t, x, y, scale, hurt, dead) {
	ctx.save();
	ctx.translate(x, y);
	const squash = dead > 0 ? 1 + dead * .4 : 1;
	const flatten = dead > 0 ? 1 - dead * .7 : 1;
	ctx.scale(scale * squash, scale * flatten);
	if (hurt > 0) ctx.filter = `brightness(${1.6 + hurt})`;
	const bob = kind === "wraith" || kind === "riftmaw" || kind === "bat" ? Math.sin(t * 2.4) * 8 : Math.sin(t * 3) * 2;
	switch (kind) {
		case "rat":
			drawRat(ctx, t, bob);
			break;
		case "skeleton":
			drawSkeleton(ctx, t, bob);
			break;
		case "slime":
			drawSlime(ctx, t);
			break;
		case "spider":
			drawSpider(ctx, t, bob);
			break;
		case "bat":
			drawBat(ctx, t, bob);
			break;
		case "wraith":
			drawWraith(ctx, t, bob);
			break;
		case "brute":
			drawBrute(ctx, t, bob);
			break;
		case "golem":
			drawGolem(ctx, t, bob);
			break;
		case "tyrant":
			drawTyrant(ctx, t, bob);
			break;
		case "wyrm":
			drawWyrm(ctx, t, bob);
			break;
		case "riftmaw":
			drawRiftmaw(ctx, t, bob);
			break;
		default: drawBrute(ctx, t, bob);
	}
	ctx.restore();
}
function drawRat(ctx, t, bob) {
	ctx.translate(0, bob);
	ctx.fillStyle = "#5a4034";
	ellipse(ctx, 8, -22, 34, 18);
	ctx.fill();
	ellipse(ctx, -22, -30, 16, 13);
	ctx.fill();
	ctx.fillStyle = "#c9a090";
	ctx.beginPath();
	ctx.moveTo(-30, -40);
	ctx.lineTo(-38, -58);
	ctx.lineTo(-18, -44);
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(-14, -42);
	ctx.lineTo(-10, -56);
	ctx.lineTo(-4, -40);
	ctx.fill();
	ctx.fillStyle = C.ember;
	ellipse(ctx, -28, -32, 3, 3);
	ctx.fill();
	ctx.strokeStyle = "#3a281e";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(36, -18);
	ctx.quadraticCurveTo(70, -40 + Math.sin(t * 6) * 6, 86, -8);
	ctx.stroke();
	ctx.fillStyle = C.bone;
	ctx.beginPath();
	ctx.moveTo(-34, -24);
	ctx.lineTo(-46, -18);
	ctx.lineTo(-34, -16);
	ctx.fill();
}
function drawSkeleton(ctx, t, bob) {
	ctx.translate(0, bob);
	ctx.strokeStyle = C.bone;
	ctx.lineWidth = 5;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(0, -18);
	ctx.lineTo(0, -70);
	ctx.stroke();
	for (let i = 0; i < 4; i++) {
		ctx.beginPath();
		ctx.moveTo(-14, -58 + i * 8);
		ctx.lineTo(14, -58 + i * 8);
		ctx.stroke();
	}
	ctx.beginPath();
	ctx.moveTo(0, -62);
	ctx.lineTo(-28, -38);
	ctx.moveTo(0, -62);
	ctx.lineTo(30, -44);
	ctx.stroke();
	ctx.fillStyle = C.ash;
	ctx.fillRect(26, -48, 22, 4);
	ellipse(ctx, 0, -84, 16, 18);
	ctx.fill();
	ctx.fillStyle = C.ink;
	ellipse(ctx, -6, -86, 4, 5);
	ctx.fill();
	ellipse(ctx, 6, -86, 4, 5);
	ctx.fill();
}
function drawSlime(ctx, t) {
	const squash = 1 + Math.sin(t * 4) * .08;
	ctx.scale(1 / squash, squash);
	const g = ctx.createRadialGradient(0, -28, 6, 0, -24, 40);
	g.addColorStop(0, "#9ecf6a");
	g.addColorStop(1, C.slimeDark);
	ctx.fillStyle = g;
	ellipse(ctx, 0, -24, 36, 28);
	ctx.fill();
	ctx.strokeStyle = "#1c2418";
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.fillStyle = C.ink;
	ellipse(ctx, -10, -32, 5, 7);
	ctx.fill();
	ellipse(ctx, 10, -32, 5, 7);
	ctx.fill();
	ctx.fillStyle = C.bone;
	ellipse(ctx, -8, -34, 2, 2);
	ctx.fill();
}
function drawSpider(ctx, t, bob) {
	ctx.translate(0, bob);
	ctx.fillStyle = "#2a1c18";
	ellipse(ctx, 6, -22, 22, 14);
	ctx.fill();
	ellipse(ctx, -16, -26, 12, 10);
	ctx.fill();
	ctx.strokeStyle = "#1a1210";
	ctx.lineWidth = 3;
	ctx.lineCap = "round";
	for (let i = 0; i < 4; i++) {
		const a = -.4 + i * .28 + Math.sin(t * 8 + i) * .08;
		ctx.beginPath();
		ctx.moveTo(0, -22);
		ctx.lineTo(Math.cos(a) * 40, -8 + Math.sin(a) * 18);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, -22);
		ctx.lineTo(-Math.cos(a) * 34, -10 + Math.sin(a) * 16);
		ctx.stroke();
	}
	ctx.fillStyle = C.ember;
	ellipse(ctx, -20, -28, 2, 2);
	ctx.fill();
	ellipse(ctx, -14, -30, 2, 2);
	ctx.fill();
}
function drawBat(ctx, t, bob) {
	ctx.translate(0, bob);
	const flap = Math.sin(t * 8) * 16;
	ctx.fillStyle = "#2c2428";
	ellipse(ctx, 0, -36, 10, 14);
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(-8, -40);
	ctx.quadraticCurveTo(-40, -50 - flap, -8, -20);
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(8, -40);
	ctx.quadraticCurveTo(40, -50 - flap, 8, -20);
	ctx.fill();
	ctx.fillStyle = C.ember;
	ellipse(ctx, -4, -38, 2, 2);
	ctx.fill();
	ellipse(ctx, 4, -38, 2, 2);
	ctx.fill();
}
function drawWraith(ctx, t, bob) {
	ctx.translate(0, bob);
	ctx.globalAlpha = .88;
	const g = ctx.createLinearGradient(0, -110, 0, 0);
	g.addColorStop(0, "#d8d0c4");
	g.addColorStop(1, "rgba(40,36,40,0.1)");
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.moveTo(0, -110);
	ctx.quadraticCurveTo(40, -70, 24, -8);
	ctx.quadraticCurveTo(0, 10, -28, -8);
	ctx.quadraticCurveTo(-42, -70, 0, -110);
	ctx.fill();
	ctx.fillStyle = "#2a2428";
	ellipse(ctx, 0, -78, 14, 16);
	ctx.fill();
	ctx.fillStyle = C.rift;
	ellipse(ctx, -5, -80, 3, 4);
	ctx.fill();
	ellipse(ctx, 5, -80, 3, 4);
	ctx.fill();
	ctx.globalAlpha = 1;
}
function drawBrute(ctx, t, bob) {
	ctx.translate(0, bob);
	ctx.fillStyle = "#4a3a32";
	ellipse(ctx, 0, -28, 32, 22);
	ctx.fill();
	ctx.fillStyle = "#5a463c";
	ellipse(ctx, 0, -70, 28, 26);
	ctx.fill();
	ctx.fillStyle = "#6a5448";
	ellipse(ctx, 0, -108, 20, 18);
	ctx.fill();
	ctx.fillStyle = C.ember;
	ellipse(ctx, -8, -110, 4, 4);
	ctx.fill();
	ellipse(ctx, 8, -110, 4, 4);
	ctx.fill();
	ctx.fillStyle = "#3a2c26";
	ctx.fillRect(-38, -78, 18, 14);
	ctx.fillRect(22, -78, 18, 14);
	ctx.strokeStyle = "#2a201c";
	ctx.lineWidth = 6;
	ctx.beginPath();
	ctx.moveTo(30, -70);
	ctx.lineTo(48, -18);
	ctx.stroke();
}
function drawGolem(ctx, t, bob) {
	ctx.translate(0, bob);
	ctx.fillStyle = "#5a5854";
	ctx.fillRect(-22, -20, 44, 18);
	ctx.fillStyle = "#6a6862";
	ctx.fillRect(-26, -62, 52, 42);
	ctx.fillStyle = "#7a7872";
	ctx.fillRect(-16, -90, 32, 28);
	ctx.fillStyle = C.ember;
	ctx.fillRect(-8, -78, 6, 6);
	ctx.fillRect(4, -78, 6, 6);
	ctx.fillStyle = "#4a4844";
	ctx.fillRect(-38, -58, 14, 22);
	ctx.fillRect(24, -58, 14, 22);
}
function drawTyrant(ctx, t, bob) {
	ctx.translate(0, bob);
	ctx.fillStyle = "#2a2420";
	ctx.beginPath();
	ctx.moveTo(-40, -8);
	ctx.lineTo(-48, -90);
	ctx.lineTo(0, -70);
	ctx.lineTo(50, -96);
	ctx.lineTo(38, -8);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = C.bone;
	ellipse(ctx, 0, -112, 22, 24);
	ctx.fill();
	ctx.fillStyle = C.ember;
	ellipse(ctx, -8, -114, 5, 6);
	ctx.fill();
	ellipse(ctx, 8, -114, 5, 6);
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(-16, -132);
	ctx.lineTo(0, -158);
	ctx.lineTo(16, -132);
	ctx.fill();
	ctx.strokeStyle = C.ash;
	ctx.lineWidth = 5;
	ctx.beginPath();
	ctx.moveTo(28, -80);
	ctx.lineTo(64, -20);
	ctx.stroke();
	ctx.fillStyle = C.steel;
	ctx.beginPath();
	ctx.moveTo(64, -28);
	ctx.lineTo(86, -8);
	ctx.lineTo(58, -4);
	ctx.closePath();
	ctx.fill();
}
function drawWyrm(ctx, t, bob) {
	ctx.translate(0, bob);
	ctx.fillStyle = "#5a2820";
	ctx.beginPath();
	ctx.moveTo(-20, -10);
	ctx.quadraticCurveTo(-10, -70, 20, -40);
	ctx.quadraticCurveTo(50, -20, 36, -8);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "#7a3428";
	ellipse(ctx, -28, -48, 28, 18);
	ctx.fill();
	ctx.fillStyle = C.ember;
	ellipse(ctx, -40, -52, 4, 4);
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(-50, -56);
	ctx.lineTo(-70, -64);
	ctx.lineTo(-48, -46);
	ctx.fill();
	ctx.fillStyle = C.emberHot;
	ctx.globalAlpha = .6 + Math.sin(t * 6) * .2;
	ctx.beginPath();
	ctx.moveTo(-54, -48);
	ctx.quadraticCurveTo(-90, -40, -58, -30);
	ctx.fill();
	ctx.globalAlpha = 1;
}
function drawRiftmaw(ctx, t, bob) {
	ctx.translate(0, bob);
	const pulse = .5 + Math.sin(t * 4) * .5;
	ctx.fillStyle = `rgba(155,183,201,${.12 + pulse * .1})`;
	ellipse(ctx, 0, -70, 70, 80);
	ctx.fill();
	ctx.fillStyle = "#0c0e12";
	ctx.beginPath();
	ctx.moveTo(-36, -10);
	ctx.quadraticCurveTo(-70, -80, 0, -150);
	ctx.quadraticCurveTo(70, -80, 36, -10);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = C.ember;
	ctx.beginPath();
	ctx.moveTo(-14, -40);
	ctx.quadraticCurveTo(0, -20 - pulse * 16, 14, -40);
	ctx.quadraticCurveTo(0, -120, -14, -40);
	ctx.fill();
	ctx.fillStyle = C.emberHot;
	ctx.globalAlpha = .7;
	ctx.beginPath();
	ctx.moveTo(-6, -50);
	ctx.quadraticCurveTo(0, -30, 6, -50);
	ctx.quadraticCurveTo(0, -100, -6, -50);
	ctx.fill();
	ctx.globalAlpha = 1;
	ctx.fillStyle = C.rift;
	ellipse(ctx, -18, -96, 4, 7);
	ctx.fill();
	ellipse(ctx, 18, -96, 4, 7);
	ctx.fill();
}
var HERO_ORDER = [
	"kael",
	"rook",
	"lyra",
	"vex",
	"thane",
	"sable",
	"morr",
	"iskra",
	"brann",
	"devourer",
	"nyx",
	"kira",
	"orin",
	"vorr",
	"selene",
	"ashur",
	"dax",
	"wren",
	"jora",
	"pike"
];
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(src));
		img.src = src;
	});
}
function roundRect(ctx, x, y, w, h, r) {
	const rr = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.arcTo(x + w, y, x + w, y + h, rr);
	ctx.arcTo(x + w, y + h, x, y + h, rr);
	ctx.arcTo(x, y + h, x, y, rr);
	ctx.arcTo(x, y, x + w, y, rr);
	ctx.closePath();
}
var Renderer = class {
	canvas;
	ctx;
	sim;
	raf = 0;
	running = false;
	last = 0;
	acc = 0;
	time = 0;
	sheets = /* @__PURE__ */ new Map();
	bgs = /* @__PURE__ */ new Map();
	monsters = /* @__PURE__ */ new Map();
	particles = [];
	floaters = [];
	bolts = [];
	trauma = 0;
	hitstop = 0;
	monsterHurt = 0;
	monsterDead = 0;
	heroLunge = {};
	reduced = false;
	shakeOn = true;
	onHud = null;
	hudAcc = 0;
	groundY = 0;
	monsterX = 0;
	monsterY = 0;
	w = 1;
	h = 1;
	constructor(canvas, sim) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("No 2d context");
		this.ctx = ctx;
		this.sim = sim;
		for (const h of HEROES) this.heroLunge[h.id] = 0;
	}
	setShake(on) {
		this.shakeOn = on;
	}
	setHud(fn) {
		this.onHud = fn;
	}
	async load() {
		const jobs = [];
		for (const h of HEROES) {
			if (!h.sprite) continue;
			jobs.push(loadImage(h.sprite).then((img) => {
				this.sheets.set(h.id, img);
			}).catch(() => void 0));
		}
		for (const [k, src] of [
			["crypt", "/bg/crypt.jpg"],
			["frost", "/bg/frost.jpg"],
			["ember", "/bg/ember.jpg"],
			["void", "/bg/void.jpg"],
			["soulwell", "/bg/soulwell.jpg"]
		]) jobs.push(loadImage(src).then((img) => {
			this.bgs.set(k, img);
		}).catch(() => void 0));
		for (const kind of [
			"rat",
			"skeleton",
			"slime",
			"spider",
			"bat",
			"wraith",
			"brute",
			"golem",
			"tyrant",
			"wyrm",
			"riftmaw",
			"ghoul",
			"beetle",
			"serpent",
			"harpy",
			"lich",
			"hound"
		]) jobs.push(loadImage(`/sprites/monsters/${kind}.png`).then((img) => {
			this.monsters.set(kind, img);
		}).catch(() => void 0));
		await Promise.all(jobs);
	}
	start() {
		if (this.running) return;
		this.running = true;
		this.last = performance.now();
		this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const loop = (t) => {
			if (!this.running) return;
			const raw = Math.min(.1, (t - this.last) / 1e3);
			this.last = t;
			this.tick(raw);
			this.raf = requestAnimationFrame(loop);
		};
		this.raf = requestAnimationFrame(loop);
	}
	stop() {
		this.running = false;
		cancelAnimationFrame(this.raf);
	}
	resize() {
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const rect = this.canvas.getBoundingClientRect();
		const w = Math.max(1, Math.floor(rect.width * dpr));
		const h = Math.max(1, Math.floor(rect.height * dpr));
		if (this.canvas.width !== w || this.canvas.height !== h) {
			this.canvas.width = w;
			this.canvas.height = h;
		}
		this.w = w;
		this.h = h;
	}
	tick(dt) {
		this.resize();
		if (this.hitstop > 0) {
			this.hitstop -= dt;
			this.draw();
			return;
		}
		this.acc += dt;
		const step = 1 / 60;
		while (this.acc >= step) {
			this.sim.step(step);
			this.acc -= step;
			this.time += step;
		}
		this.present(dt);
		this.hudAcc += dt;
		if (this.hudAcc >= .1) {
			this.hudAcc = 0;
			this.onHud?.();
		}
		this.draw();
	}
	present(dt) {
		const events = this.sim.drain();
		for (const e of events) this.handle(e);
		this.trauma = Math.max(0, this.trauma - dt * 2.4);
		this.monsterHurt = Math.max(0, this.monsterHurt - dt * 6);
		this.monsterDead = Math.max(0, this.monsterDead - dt * 2.2);
		for (const id of HERO_ORDER) this.heroLunge[id] = Math.max(0, (this.heroLunge[id] ?? 0) - dt * 4);
		for (const p of this.particles) {
			p.life -= dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.vy += (p.kind === "coin" || p.kind === "soul" ? 420 : 80) * dt;
			if (p.kind === "ash") p.vy -= 120 * dt;
		}
		this.particles = this.particles.filter((p) => p.life > 0).slice(-180);
		for (const f of this.floaters) {
			f.life -= dt;
			f.y += f.vy * dt;
			f.vy *= .98;
		}
		this.floaters = this.floaters.filter((f) => f.life > 0).slice(-24);
		for (const b of this.bolts) {
			b.life -= dt;
			const u = 1 - b.life / b.max;
			b.x += (b.tx - b.x) * Math.min(1, u * 3);
			b.y += (b.ty - b.y) * Math.min(1, u * 3);
		}
		this.bolts = this.bolts.filter((b) => b.life > 0);
		if (Math.random() < dt * 8) this.particles.push({
			x: Math.random() * this.w,
			y: this.h * .2 + Math.random() * this.h * .4,
			vx: (Math.random() - .5) * 20,
			vy: 12 + Math.random() * 20,
			life: 2.4,
			max: 2.4,
			size: 1 + Math.random() * 2,
			color: "rgba(240,230,216,0.35)",
			kind: "ash"
		});
	}
	handle(e) {
		const mx = this.monsterX;
		const my = this.monsterY - 40;
		if (e.type === "hit") {
			this.monsterHurt = 1;
			this.trauma = Math.min(1, this.trauma + (e.crit ? .45 : .18));
			if (e.crit && !this.reduced) this.hitstop = .045;
			sfx.hit(e.crit);
			this.floaters.push({
				x: mx + (Math.random() - .5) * 40,
				y: my - 20,
				vy: -70,
				life: .7,
				max: .7,
				text: formatNum(e.amount),
				crit: e.crit,
				color: e.crit ? "#f0e6d8" : "#e8a090"
			});
			for (let i = 0; i < (e.crit ? 10 : 5); i++) this.particles.push({
				x: mx,
				y: my,
				vx: (Math.random() - .5) * 260,
				vy: -40 - Math.random() * 180,
				life: .35 + Math.random() * .25,
				max: .5,
				size: 2 + Math.random() * 3,
				color: e.crit ? "#f0e6d8" : "#c45c4a",
				kind: "spark"
			});
			if (e.heroId) this.heroLunge[e.heroId] = 1;
		} else if (e.type === "kill") {
			this.monsterDead = 1;
			sfx.hit(true);
			for (let i = 0; i < 14; i++) this.particles.push({
				x: mx,
				y: my,
				vx: (Math.random() - .5) * 220,
				vy: -80 - Math.random() * 160,
				life: .7,
				max: .7,
				size: 3,
				color: e.chest ? "#d4b483" : "#c45c4a",
				kind: e.chest ? "coin" : "spark"
			});
		} else if (e.type === "heroAttack" && e.heroId) {
			const pos = this.heroPos(e.heroId);
			if (pos) {
				this.bolts.push({
					x: pos.x,
					y: pos.y - 40 * pos.scale,
					tx: mx,
					ty: my,
					life: .22,
					max: .22,
					color: boltColor(e.heroId),
					heroId: e.heroId
				});
				this.heroLunge[e.heroId] = 1;
			}
		}
	}
	heroPos(id) {
		const i = HERO_ORDER.filter((h) => (this.sim.state.heroLevel[h] ?? 0) > 0).indexOf(id);
		if (i < 0) return null;
		const col = i % 4;
		const row = Math.floor(i / 4);
		return {
			x: this.w * (.1 + col * .085),
			y: this.groundY - row * this.h * .07,
			scale: (.92 - row * .12) * (this.h / 520)
		};
	}
	draw() {
		const ctx = this.ctx;
		const w = this.w;
		const h = this.h;
		this.groundY = h * .86;
		this.monsterX = w * .62;
		this.monsterY = this.groundY;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, w, h);
		let sx = 0;
		let sy = 0;
		if (this.shakeOn && !this.reduced && this.trauma > 0) {
			const mag = this.trauma * this.trauma * 14;
			sx = (Math.random() * 2 - 1) * mag;
			sy = (Math.random() * 2 - 1) * mag;
		}
		ctx.translate(sx, sy);
		this.drawBg();
		this.drawGround();
		this.drawHeroes();
		this.drawMonster();
		this.drawBolts();
		this.drawParticles();
		this.drawFloaters();
		this.drawHudOverlay();
	}
	drawBg() {
		const ctx = this.ctx;
		const img = this.bgs.get(this.sim.biome());
		if (img) {
			const iw = img.width;
			const ih = img.height;
			const scale = Math.max(this.w / iw, this.h / ih);
			const dw = iw * scale;
			const dh = ih * scale;
			ctx.drawImage(img, (this.w - dw) / 2, (this.h - dh) / 2, dw, dh);
		} else {
			ctx.fillStyle = "#0c0a0b";
			ctx.fillRect(0, 0, this.w, this.h);
		}
		const g = ctx.createLinearGradient(0, 0, 0, this.h);
		g.addColorStop(0, "rgba(12,10,11,0.15)");
		g.addColorStop(1, "rgba(12,10,11,0.45)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, this.w, this.h);
	}
	drawGround() {
		const ctx = this.ctx;
		ctx.fillStyle = "rgba(12,10,11,0.45)";
		ctx.beginPath();
		ctx.ellipse(this.w * .5, this.groundY + 18, this.w * .46, 16, 0, 0, Math.PI * 2);
		ctx.fill();
	}
	drawHeroes() {
		const ctx = this.ctx;
		const t = this.time;
		for (const id of HERO_ORDER) {
			if ((this.sim.state.heroLevel[id] ?? 0) <= 0) continue;
			const pos = this.heroPos(id);
			if (!pos) continue;
			const lunge = this.heroLunge[id] ?? 0;
			const bob = Math.sin(t * 3 + id.charCodeAt(0)) * 3 * pos.scale;
			if (DRAWN_HEROES.includes(id)) {
				drawHeroFigure(ctx, id, t, pos.x, pos.y + bob, pos.scale * .95, lunge);
				continue;
			}
			const sheet = this.sheets.get(id);
			if (!sheet) continue;
			if (id === "dax" || id === "wren" || id === "jora" || id === "pike") {
				const dw = 56 * pos.scale;
				ctx.save();
				ctx.translate(pos.x + lunge * 22 * pos.scale, pos.y + bob);
				ctx.beginPath();
				ctx.arc(0, -dw * .35, dw / 2, 0, Math.PI * 2);
				ctx.clip();
				ctx.drawImage(sheet, -dw / 2, -dw, dw, dw);
				ctx.restore();
				continue;
			}
			const frame = Math.floor(t * 6 + id.charCodeAt(0)) % 4;
			const col = frame % 2;
			const row = Math.floor(frame / 2);
			const cw = sheet.width / 2;
			const ch = sheet.height / 2;
			const dw = 128 * pos.scale;
			const dh = 128 * pos.scale;
			ctx.save();
			ctx.translate(pos.x + lunge * 22 * pos.scale, pos.y + bob);
			ctx.drawImage(sheet, col * cw, row * ch, cw, ch, -dw / 2, -dh + 8, dw, dh);
			ctx.restore();
		}
	}
	drawMonster() {
		const m = this.sim.monster;
		const art = this.monsters.get(m.kind);
		if (art) {
			const hurt = this.monsterHurt;
			const dead = this.monsterDead;
			const size = Math.min(this.w, this.h) * .34 * (m.isBoss ? 1.3 : 1) * (m.artScale || 1);
			const x = this.monsterX - size / 2 + (Math.random() - .5) * hurt * 8;
			const y = this.monsterY - size * .92 + dead * 16;
			this.ctx.save();
			this.ctx.globalAlpha = Math.max(.35, 1 - dead);
			this.ctx.drawImage(art, x, y, size, size);
			this.ctx.restore();
			return;
		}
		const scale = (m.isBoss ? 1.45 : 1.12) * (this.h / 420);
		drawMonster(this.ctx, m.kind, this.time, this.monsterX, this.monsterY, scale, this.monsterHurt, this.monsterDead);
	}
	drawBolts() {
		const ctx = this.ctx;
		for (const b of this.bolts) {
			const a = b.life / b.max;
			ctx.strokeStyle = b.color;
			ctx.globalAlpha = a;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(b.x, b.y);
			ctx.lineTo(b.tx, b.ty);
			ctx.stroke();
			ctx.fillStyle = b.color;
			ctx.beginPath();
			ctx.arc(b.x + (b.tx - b.x) * (1 - a), b.y + (b.ty - b.y) * (1 - a), 4, 0, Math.PI * 2);
			ctx.fill();
			ctx.globalAlpha = 1;
		}
	}
	drawParticles() {
		const ctx = this.ctx;
		for (const p of this.particles) {
			ctx.globalAlpha = Math.max(0, p.life / p.max);
			ctx.fillStyle = p.color;
			if (p.kind === "coin") {
				ctx.beginPath();
				ctx.ellipse(p.x, p.y, p.size, p.size * .7, 0, 0, Math.PI * 2);
				ctx.fill();
			} else ctx.fillRect(p.x, p.y, p.size, p.size);
		}
		ctx.globalAlpha = 1;
	}
	drawFloaters() {
		const ctx = this.ctx;
		for (const f of this.floaters) {
			ctx.globalAlpha = Math.max(0, f.life / f.max);
			ctx.fillStyle = f.color;
			ctx.font = f.crit ? "700 16px Outfit, sans-serif" : "600 13px Outfit, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText(f.text, f.x, f.y);
		}
		ctx.globalAlpha = 1;
	}
	drawHudOverlay() {
		const ctx = this.ctx;
		const m = this.sim.monster;
		const bw = Math.min(280, this.w * .72);
		const x = this.w / 2;
		const y = this.h - 36;
		const ratio = m.max > 0 ? m.hp / m.max : 0;
		ctx.fillStyle = "rgba(12,10,11,0.72)";
		roundRect(ctx, x - bw / 2, y - 8, bw, 18, 8);
		ctx.fill();
		ctx.fillStyle = m.isBoss ? "#c45c4a" : "#b54a3c";
		roundRect(ctx, x - bw / 2 + 2, y - 6, Math.max(0, (bw - 4) * ratio), 14, 7);
		ctx.fill();
		ctx.fillStyle = "#f0e6d8";
		ctx.font = "600 11px Outfit, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(formatNum(m.hp), x, y + 1);
		ctx.font = "600 15px Cinzel, serif";
		ctx.fillStyle = m.isBoss ? "#e8a090" : "#f0e6d8";
		ctx.fillText(m.name, x, y - 22);
		if (m.isBoss && m.timerMax > 0) {
			const tw = bw;
			const tr = m.timer / m.timerMax;
			ctx.fillStyle = "rgba(12,10,11,0.7)";
			roundRect(ctx, x - tw / 2, y + 14, tw, 6, 3);
			ctx.fill();
			ctx.fillStyle = "#c45c4a";
			roundRect(ctx, x - tw / 2, y + 14, tw * Math.max(0, tr), 6, 3);
			ctx.fill();
		}
	}
};
function boltColor(id) {
	switch (id) {
		case "lyra": return "#c8d4c0";
		case "vex": return "#c45c4a";
		case "iskra": return "#9bb7c9";
		case "nyx": return "#7aa0b8";
		case "orin": return "#d4b483";
		default: return "#f0e6d8";
	}
}
function installLink() {
	const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
	return /iPhone|iPad|iPod/i.test(ua) ? "/?install=1&platform=ios" : "/?install=1&platform=android";
}
function huntUrl() {
	if (typeof window === "undefined") return "https://grok.me";
	return `${window.location.origin}/`;
}
function inFrame() {
	try {
		return typeof window !== "undefined" && window.self !== window.top;
	} catch {
		return true;
	}
}
function copyFallback(text) {
	try {
		const el = document.createElement("textarea");
		el.value = text;
		el.setAttribute("readonly", "");
		el.style.position = "fixed";
		el.style.left = "0";
		el.style.top = "0";
		el.style.opacity = "0";
		document.body.appendChild(el);
		el.focus();
		el.select();
		el.setSelectionRange(0, text.length);
		const ok = document.execCommand("copy");
		document.body.removeChild(el);
		return ok;
	} catch {
		return false;
	}
}
async function copyHunt(url) {
	try {
		await navigator.clipboard.writeText(url);
		return true;
	} catch {
		return copyFallback(url);
	}
}
function ShareSheet({ onClose }) {
	const url = huntUrl();
	const [note, setNote] = (0, import_react.useState)("");
	const inputRef = (0, import_react.useRef)(null);
	const canNative = typeof navigator !== "undefined" && typeof navigator.share === "function" && !inFrame();
	(0, import_react.useEffect)(() => {
		const el = inputRef.current;
		if (!el) return;
		el.focus();
		el.select();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-end bg-bg/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-lg border border-gold/40 bg-wood p-4 text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg text-gold",
					children: "Share this hunt"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-fg/80",
					children: inFrame() ? "This preview window blocks send. Copy the link, or open the published hunt in your phone browser." : "Send this link. Friends play in their browser."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: inputRef,
					readOnly: true,
					value: url,
					className: "mt-3 h-12 w-full select-text rounded-md border border-gold/40 bg-bg px-3 text-sm text-fg",
					onFocus: (e) => e.currentTarget.select()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "h-12 w-full",
							onClick: () => {
								unlockAudio();
								copyHunt(url).then((ok) => {
									setNote(ok ? "Copied. Paste it in a text or chat." : "Long-press the link above and copy.");
								});
							},
							children: "Copy link"
						}),
						canNative ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							className: "h-12 w-full",
							onClick: () => {
								unlockAudio();
								navigator.share({
									title: "Soulrift Crusher",
									text: "Idle dungeon hunt. Crush the rift with me.",
									url
								}).then(() => onClose()).catch((err) => {
									if ((err && typeof err === "object" && "name" in err ? String(err.name) : "") === "AbortError") return;
									setNote("Use copy, or text a friend.");
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "Send to a friend"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "secondary",
							className: "h-12 w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `sms:?body=${encodeURIComponent("Play Soulrift Crusher " + url)}`,
								children: "Text a friend"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "h-12 w-full",
							onClick: onClose,
							children: "Close"
						})
					]
				}),
				note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center text-xs text-gold",
					children: note
				}) : null
			]
		})
	});
}
function GameApp() {
	const screen = useGame((s) => s.screen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-dvh flex-col overflow-hidden bg-bg text-fg select-none",
		children: screen === "title" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleScreen, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayScreen, {})
	});
}
function TitleScreen() {
	const setScreen = useGame((s) => s.setScreen);
	const refresh = useGame((s) => s.refresh);
	const [continueAvailable, setContinueAvailable] = (0, import_react.useState)(false);
	const [load, setLoad] = (0, import_react.useState)(18);
	const [shareOpen, setShareOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setContinueAvailable(hasSave() && sim.state.kills + sim.state.clicks > 0);
		const id = window.setInterval(() => {
			setLoad((n) => n >= 100 ? 100 : n + 9);
		}, 70);
		return () => window.clearInterval(id);
	}, []);
	function enter(fresh) {
		unlockAudio();
		sfx.ui();
		if (fresh) {
			clearSave();
			sim.reset();
		}
		useGame.getState().offlineGold = sim.takeOfflineGold();
		refresh();
		setScreen("play");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/bg/splash.jpg?v=fight",
				alt: "",
				className: "absolute inset-0 size-full object-cover",
				crossOrigin: "anonymous"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-bg via-bg/35 to-transparent" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex h-full flex-col items-center px-5 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs tracking-[0.32em] text-gold uppercase",
						children: "Idle dungeon RPG"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-display mt-2 text-center text-5xl leading-none font-semibold text-gold drop-shadow",
						children: ["Soulrift", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-4xl text-fg",
							children: "Crusher"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-center text-xs text-gold/90",
						children: [
							"Season ",
							seasonClock().season,
							" · server war in ",
							formatSeasonLeft(seasonClock().msLeft)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-auto w-full max-w-sm",
						children: load < 100 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-3 overflow-hidden rounded-full border border-gold/50 bg-bg/80",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-accent",
									style: { width: `${load}%` }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-center font-display text-sm text-gold",
								children: [
									"Starting up… ",
									load,
									"%"
								]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "lg",
									className: "h-12 w-full font-display tracking-wide",
									onClick: () => enter(!continueAvailable),
									children: continueAvailable ? "Enter the rift" : "Begin the hunt"
								}),
								continueAvailable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "lg",
									variant: "secondary",
									className: "h-12 w-full",
									onClick: () => enter(true),
									children: "New crusade"
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "lg",
									variant: "secondary",
									className: "h-12 w-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/login",
										children: "Sign in for clans"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "lg",
									variant: "outline",
									className: "h-12 w-full",
									onClick: () => {
										unlockAudio();
										sfx.ui();
										setShareOpen(true);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "Share this hunt"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "lg",
									variant: "outline",
									className: "h-12 w-full",
									onClick: () => {
										window.location.href = installLink();
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4" }), "Install on your phone"]
								})
							]
						})
					})
				]
			}),
			shareOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareSheet, { onClose: () => setShareOpen(false) }) : null
		]
	});
}
function TabBar() {
	const tab = useGame((s) => s.tab);
	const setTab = useGame((s) => s.setTab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex shrink-0 gap-1 border-t border-border bg-wood px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]",
		children: [
			["fight", "Fight"],
			["heroes", "Heroes"],
			["shop", "Craft"],
			["hunt", "Hunt"],
			["clan", "Clans"]
		].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => {
				sfx.ui();
				setTab(id);
			},
			className: cn("h-11 flex-1 rounded-t-md text-xs font-semibold sm:text-sm", tab === id || id === "fight" && tab === "realm" ? "bg-parchment text-parchment-ink" : "text-gold"),
			children: label
		}, id))
	});
}
function MenuPage({ title, parchment, children }) {
	const snap = useGame((s) => s.snap);
	const setTab = useGame((s) => s.setTab);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-h-0 flex-1 flex-col", parchment ? "bg-parchment text-parchment-ink" : "bg-surface"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center justify-between gap-2 bg-wood px-3 py-2 text-xs tabular-nums text-gold",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, { className: "size-3" }),
							" ",
							formatNum(snap.souls)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "size-3" }),
							" ",
							formatNum(snap.gems)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-3" }),
							" ",
							formatNum(snap.gold)
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center px-3 py-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-11" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display flex-1 text-center text-xl text-gold",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						className: "grid size-11 place-items-center text-gold",
						onClick: () => setTab("fight"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-6" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scroll-pane min-h-0 flex-1 px-2 pb-[max(1rem,env(safe-area-inset-bottom))]",
				children
			})
		]
	});
}
function PlayScreen() {
	const tab = useGame((s) => s.tab);
	const setTab = useGame((s) => s.setTab);
	const offlineGold = useGame((s) => s.offlineGold);
	const settingsOpen = useGame((s) => s.settingsOpen);
	const ritualOpen = useGame((s) => s.ritualOpen);
	const arenaResult = useGame((s) => s.arenaResult);
	const chestLoot = useGame((s) => s.chestLoot);
	const summonOpen = useGame((s) => s.summonOpen);
	(0, import_react.useEffect)(() => {
		const onVis = () => {
			if (document.visibilityState === "hidden") sim.save();
			else resumeAudio();
		};
		document.addEventListener("visibilitychange", onVis);
		window.addEventListener("pagehide", () => sim.save());
		return () => document.removeEventListener("visibilitychange", onVis);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClanSync, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudSync, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex min-h-0 flex-col", tab === "fight" ? "min-h-0 flex-1" : "hidden"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Battle, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillBar, {})
				]
			}),
			tab === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CraftPage, { onClose: () => setTab("fight") }) : tab === "heroes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuPage, {
				title: "Heroes",
				parchment: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroPanel, {})
			}) : tab === "realm" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuPage, {
				title: "Realms",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RealmPanel, {})
			}) : tab === "hunt" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuPage, {
				title: "Hunt",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HuntPanel, {})
			}) : tab === "clan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuPage, {
				title: "Clans",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClanPanel, {})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBar, {}),
			offlineGold > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineModal, { gold: offlineGold }) : null,
			settingsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsModal, {}) : null,
			ritualOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RitualModal, {}) : null,
			arenaResult ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArenaModal, { result: arenaResult }) : null,
			chestLoot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChestModal, { loot: chestLoot }) : null,
			summonOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummonGame, { onClose: () => useGame.getState().setSummonOpen(false) }) : null
		]
	});
}
function Hud() {
	const snap = useGame((s) => s.snap);
	const onlineCount = useGame((s) => s.onlineCount);
	const setSettingsOpen = useGame((s) => s.setSettingsOpen);
	const muted = useGame((s) => s.muted);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "grid shrink-0 grid-cols-3 gap-1 border-b border-border bg-bg px-2 py-1.5 pt-[max(0.4rem,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudStat, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "size-3.5 text-accent" }),
				value: formatNum(snap.clickDmg)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudStat, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, { className: "size-3.5 text-soul" }),
				value: formatNum(snap.souls)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudStat, {
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-3.5 text-gold" }),
				value: formatNum(snap.gold)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-3 mt-0.5 flex items-center gap-2 text-[11px] tabular-nums text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "size-3 text-gold" }),
					formatNum(snap.gems),
					" gems",
					onlineCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-gold",
						children: [
							"· ",
							onlineCount,
							" online"
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-auto flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthChip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": muted ? "Unmute" : "Mute",
								className: "grid size-9 place-items-center rounded-md",
								onClick: () => {
									const next = !useGame.getState().muted;
									useGame.getState().setMuted(next);
									setMuted(next);
									unlockAudio();
								},
								children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "Settings",
								className: "grid size-9 place-items-center rounded-md",
								onClick: () => setSettingsOpen(true),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
							})
						]
					})
				]
			})
		]
	});
}
function HudStat({ icon, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-8 items-center justify-center gap-1 rounded-md bg-surface-2 text-sm font-semibold tabular-nums",
		children: [icon, value]
	});
}
function AuthChip() {
	const { user, isPending } = useCurrentUserState();
	const [out, setOut] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-9 shrink-0 animate-pulse rounded-md bg-surface-2" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		"aria-label": "Sign in",
		className: "grid size-9 shrink-0 place-items-center rounded-md text-muted hover:text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": "Sign out",
		disabled: out,
		className: "grid size-9 shrink-0 place-items-center overflow-hidden rounded-md",
		onClick: () => {
			setOut(true);
			signOut().catch(() => setOut(false));
		},
		children: user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: user.profileImageUrl,
			alt: "",
			className: "size-7 rounded-full object-cover"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-7 place-items-center rounded-full bg-surface-2 font-display text-xs text-accent",
			children: (user.displayName ?? "C").charAt(0).toUpperCase()
		})
	});
}
function Battle() {
	const canvasRef = (0, import_react.useRef)(null);
	const rendererRef = (0, import_react.useRef)(null);
	const shake = useGame((s) => s.shake);
	const snap = useGame((s) => s.snap);
	const refresh = useGame((s) => s.refresh);
	const setTab = useGame((s) => s.setTab);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const renderer = new Renderer(canvas, sim);
		rendererRef.current = renderer;
		renderer.setHud(refresh);
		renderer.setShake(useGame.getState().shake);
		renderer.load();
		renderer.start();
		return () => {
			renderer.stop();
		};
	}, [refresh]);
	(0, import_react.useEffect)(() => {
		rendererRef.current?.setShake(shake);
	}, [shake]);
	function onPointer(e) {
		e.preventDefault();
		unlockAudio();
		sim.click();
		refresh();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative shrink-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "block w-full touch-none bg-bg",
				style: { height: "min(58vh, 520px)" },
				onPointerDown: onPointer
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 top-2 flex flex-col items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "rounded-sm bg-bg/70 px-3 py-1 font-display text-sm tabular-nums",
					children: ["Level ", snap.floor]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1 rounded-sm bg-bg/70 px-2 py-0.5 text-[11px] tabular-nums",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skull, { className: "size-3 text-accent" }),
						snap.wave,
						" / 10"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-14 left-1 flex flex-col gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideBtn, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4" }),
						label: "Hunt",
						onClick: () => setTab("hunt")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideBtn, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" }),
						label: "Clans",
						onClick: () => setTab("clan")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideBtn, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map$1, { className: "size-4" }),
						label: "Realms",
						onClick: () => setTab("realm")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-14 right-1 flex flex-col gap-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideBtn, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gem, { className: "size-4" }),
					label: "Shop",
					onClick: () => setTab("shop")
				})
			})
		]
	});
}
function SideBtn({ icon, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: () => {
			unlockAudio();
			sfx.ui();
			onClick();
		},
		className: "grid size-11 place-items-center rounded-md border border-gold/40 bg-surface/90 text-gold",
		"aria-label": label,
		children: icon
	});
}
function SkillBar() {
	const snap = useGame((s) => s.snap);
	const refresh = useGame((s) => s.refresh);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid shrink-0 grid-cols-4 gap-1 border-t border-border bg-bg px-2 py-1.5",
		children: snap.skills.map((sk) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillButton, {
			skill: sk,
			onUse: () => {
				unlockAudio();
				if (sim.useSkill(sk.id)) refresh();
			}
		}, sk.id))
	});
}
function SkillButton({ skill, onUse }) {
	const def = SKILLS.find((s) => s.id === skill.id);
	const Icon = {
		strike: Swords,
		goldrush: Coins,
		rage: Flame,
		harvest: Ghost
	}[skill.id];
	const cdRatio = skill.cd > 0 ? 1 - skill.cd / skill.maxCd : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled: !skill.ready,
		onClick: onUse,
		className: "relative flex h-12 flex-col items-center justify-center rounded-md border border-border bg-surface-2 px-1 text-[10px] leading-tight disabled:opacity-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mb-0.5 size-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-fg",
				children: def.name
			}),
			!skill.ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-x-1 bottom-1 h-0.5 overflow-hidden rounded-full bg-bg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block h-full bg-accent",
					style: { width: `${cdRatio * 100}%` }
				})
			}) : null
		]
	});
}
function HeroPanel() {
	const snap = useGame((s) => s.snap);
	const bulk = useGame((s) => s.bulk);
	const setBulk = useGame((s) => s.setBulk);
	const selected = useGame((s) => s.selectedHero);
	const refresh = useGame((s) => s.refresh);
	const hero = snap.heroes.find((h) => h.id === selected) ?? snap.heroes[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 flex items-center justify-between gap-1",
				children: [
					{
						id: 1,
						label: "x1"
					},
					{
						id: 10,
						label: "x10"
					},
					{
						id: 100,
						label: "x100"
					},
					{
						id: -1,
						label: "MAX"
					}
				].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setBulk(o.id),
					className: cn("h-9 flex-1 rounded-md text-xs font-bold", bulk === o.id ? "bg-wood text-gold" : "bg-parchment-ink/10 text-parchment-ink"),
					children: o.label
				}, o.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-4 gap-1.5 pb-2",
				children: snap.heroes.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroTile, {
					hero: h,
					selected: h.id === hero.id,
					onPick: () => {
						unlockAudio();
						sfx.ui();
						useGame.getState().setSelectedHero(h.id);
					}
				}, h.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-md bg-wood p-3 text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-base font-semibold",
							children: HEROES.find((x) => x.id === hero.id)?.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-gold",
							children: HEROES.find((x) => x.id === hero.id)?.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-fg/80",
							children: hero.level > 0 ? `Lv ${hero.level}${hero.atCap ? " MAX" : ""} · P${hero.prestige} · DPS ${formatNum(hero.dps)}` : HEROES.find((x) => x.id === hero.id)?.passive
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-gold",
							children: hero.legendOn ? `Legendary · ${hero.legendName}` : `Legendary at lv 25 · ${hero.legendName}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-fg/70",
							children: hero.legendBlurb
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						className: "h-11",
						disabled: hero.level <= 0 ? hero.acquire === "gold" ? !hero.canAfford : !hero.canGemHire && hero.acquire !== "summon" : !hero.canAfford,
						onClick: () => {
							unlockAudio();
							if (hero.level <= 0 && hero.acquire === "gems") {
								if (sim.buyHeroGems(hero.id)) {
									sfx.hire();
									refresh();
								}
								return;
							}
							if (hero.level <= 0 && hero.acquire === "summon") {
								sfx.ui();
								useGame.getState().setTab("shop");
								useGame.getState().setSummonOpen(true);
								return;
							}
							if (sim.hireOrUpgrade(hero.id, bulk)) {
								sfx.hire();
								refresh();
							}
						},
						children: hero.level <= 0 ? hero.acquire === "gems" ? `${hero.gemCost} gems` : hero.acquire === "summon" ? "Soul Well" : `Hire · ${formatNum(hero.cost)}` : hero.atCap ? "MAX" : `Upg · ${formatNum(hero.cost)}`
					})]
				}), hero.level > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroLoadout, { hero }) : null]
			})
		]
	});
}
function HeroLoadout({ hero }) {
	const snap = useGame((s) => s.snap);
	const refresh = useGame((s) => s.refresh);
	const free = snap.runeBag.filter((r) => !snap.heroes.some((h) => h.attached.some((a) => a?.id === r.id)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 border-t border-gold/30 pt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] tracking-wide text-gold uppercase",
				children: [
					"Prestige ",
					hero.prestige,
					"/",
					hero.prestigeMax,
					" · +",
					Math.round(hero.prestige * 12),
					"%"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "mt-2 h-11 w-full",
				disabled: !hero.canPrestige,
				onClick: () => {
					unlockAudio();
					if (sim.prestigeHero(hero.id)) {
						sfx.ritual();
						refresh();
					}
				},
				children: hero.atCap ? `Prestige · ${hero.prestigeCost} souls` : `Max at lv 100 to prestige`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-[11px] tracking-wide text-gold uppercase",
				children: [
					hero.craftName,
					" · rank ",
					hero.craftRank
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "secondary",
				className: "mt-2 h-11 w-full",
				disabled: !hero.canCraft,
				onClick: () => {
					unlockAudio();
					if (sim.craftHero(hero.id)) {
						sfx.hire();
						refresh();
					}
				},
				children: [
					"Craft · ",
					hero.craftEmber,
					" ember · ",
					hero.craftBone,
					" bone"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-[11px] tracking-wide text-gold uppercase",
				children: [
					"Rune slots ",
					hero.runeSlots,
					"/3"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 flex gap-1",
				children: Array.from({ length: 3 }).map((_, i) => {
					const r = hero.attached[i];
					const open = i < hero.runeSlots;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !open || !r,
						onClick: () => {
							if (sim.detachRune(hero.id, i)) {
								sfx.ui();
								refresh();
							}
						},
						className: "h-14 flex-1 rounded-md border border-gold/30 bg-bg/40 px-1 text-[10px] leading-tight text-fg disabled:opacity-40",
						children: r ? `${r.name}` : open ? "Empty" : "Lv lock"
					}, i);
				})
			}),
			free.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 max-h-28 overflow-y-auto",
				children: free.slice(0, 8).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-2 py-1 text-[11px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						RARITY_NAME[r.rarity],
						" ",
						r.name
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-8 rounded-md bg-surface-2 px-2",
						onClick: () => {
							const slot = hero.attached.findIndex((a, i) => i < hero.runeSlots && !a);
							if (slot >= 0 && sim.attachRune(hero.id, slot, r.id)) {
								sfx.ui();
								refresh();
							}
						},
						children: "Socket"
					})]
				}, r.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[11px] text-fg/70",
				children: "Find runes on bosses, chests, and events."
			})
		]
	});
}
function HeroTile({ hero, selected, onPick }) {
	const def = HEROES.find((h) => h.id === hero.id);
	const frame = hero.stars >= 5 ? "border-frame" : hero.stars >= 3 ? "border-gold" : hero.stars >= 2 ? "border-soul" : "border-wood";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onPick,
		className: cn("relative aspect-square w-full overflow-hidden rounded-md border-2 bg-surface-2", frame, selected && "ring-2 ring-accent", hero.level <= 0 && "opacity-70"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: heroPortrait(hero.id),
				alt: "",
				className: "size-full object-cover",
				crossOrigin: "anonymous"
			}),
			hero.level > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-0.5 right-0.5 rounded bg-bg/80 px-1 text-[10px] tabular-nums",
				children: hero.level
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-x-0 bottom-0 flex justify-center gap-px bg-bg/70 py-0.5",
				children: Array.from({ length: hero.stars }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-2.5 fill-gold text-gold" }, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: def.name
			})
		]
	}) });
}
function HuntPanel() {
	const snap = useGame((s) => s.snap);
	const refresh = useGame((s) => s.refresh);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-gold/30 bg-wood p-4 text-fg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-gold uppercase",
						children: "Today's event"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display mt-1 text-lg",
						children: snap.eventName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-fg/80",
						children: snap.eventBlurb
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm tabular-nums",
						children: [snap.eventPts, " event points"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2",
						children: EVENT_SHOP.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm",
								children: it.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "h-10",
								disabled: snap.eventPts < it.cost,
								onClick: () => {
									unlockAudio();
									if (sim.buyEvent(it.id)) {
										sfx.chest();
										refresh();
									}
								},
								children: [it.cost, " pts"]
							})]
						}, it.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 mb-2 text-xs tracking-wide text-muted uppercase",
				children: "Contracts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: snap.contracts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContractRow, {
					contract: c,
					onClaim: () => {
						unlockAudio();
						if (sim.claimContract(c.kind)) {
							sfx.chest();
							refresh();
						}
					}
				}, c.kind))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-3 h-12 w-full",
				variant: "secondary",
				disabled: snap.chests <= 0,
				onClick: () => {
					unlockAudio();
					const loot = sim.openChest();
					if (loot) {
						sfx.chest();
						useGame.getState().setChestLoot(loot);
						refresh();
					}
				},
				children: ["Open a chest", snap.chests > 0 ? ` · ${snap.chests}` : ""]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArenaDuel, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg border border-border bg-bg/40 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-base font-semibold",
						children: "Dark Ritual"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Reset the hunt for souls. Unlocks at floor 12. You keep relics, gems, and influence."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm tabular-nums",
						children: snap.ritualUnlocked ? `${formatNum(snap.ritualSouls)} souls` : "Reach floor 12"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 h-12 w-full",
						disabled: !snap.ritualUnlocked || snap.ritualSouls <= 0,
						onClick: () => useGame.getState().setRitualOpen(true),
						children: "Begin ritual"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 flex h-11 items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Farm this floor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: snap.farm,
							onChange: (e) => {
								sim.setFarm(e.target.checked);
								refresh();
							},
							className: "size-5 accent-accent"
						})]
					})
				]
			})
		]
	});
}
function ContractRow({ contract, onClaim }) {
	const ratio = Math.min(1, contract.progress / Math.max(1, contract.goal));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg border border-border bg-bg/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-sm font-semibold",
				children: contract.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs tabular-nums text-muted",
				children: [
					formatNum(Math.min(contract.progress, contract.goal)),
					" / ",
					formatNum(contract.goal)
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "h-11",
				disabled: !contract.ready,
				onClick: onClaim,
				children: contract.claimed ? "Done" : "Claim"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 h-1 overflow-hidden rounded-full bg-surface-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full bg-accent",
				style: { width: `${ratio * 100}%` }
			})
		})]
	});
}
function SettingsModal() {
	const close = () => useGame.getState().setSettingsOpen(false);
	const shake = useGame((s) => s.shake);
	const muted = useGame((s) => s.muted);
	const setScreen = useGame((s) => s.setScreen);
	const [shareOpen, setShareOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		onClose: close,
		title: "Settings",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex h-12 items-center justify-between text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Screen shake" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: shake,
					onChange: (e) => useGame.getState().setShake(e.target.checked),
					className: "size-5 accent-accent"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex h-12 items-center justify-between text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mute audio" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: muted,
					onChange: (e) => {
						useGame.getState().setMuted(e.target.checked);
						setMuted(e.target.checked);
					},
					className: "size-5 accent-accent"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "secondary",
				className: "mt-2 h-12 w-full",
				onClick: () => {
					window.location.href = installLink();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4" }), "Install on Home Screen"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "secondary",
				className: "mt-2 h-12 w-full",
				onClick: () => {
					unlockAudio();
					sfx.ui();
					setShareOpen(true);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "Share this hunt"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "mt-2 h-12 w-full",
				onClick: () => {
					sim.save();
					close();
					setScreen("title");
				},
				children: "Return to title"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: "mt-2 h-12 w-full text-danger",
				onClick: () => {
					clearSave();
					sim.reset();
					useGame.getState().refresh();
					close();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimerReset, { className: "size-4" }), "Reset crusade"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffPanel, {})
		]
	}), shareOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareSheet, { onClose: () => setShareOpen(false) }) : null] });
}
function RitualModal() {
	const snap = useGame((s) => s.snap);
	const close = () => useGame.getState().setRitualOpen(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		onClose: close,
		title: "Dark Ritual",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted",
			children: [
				"The warband is unmade. Relics, gems, and influence stay. You climb again from floor ",
				snap.startFloor,
				" and harvest ",
				formatNum(snap.ritualSouls),
				" souls."
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			className: "mt-4 h-12 w-full",
			onClick: () => {
				unlockAudio();
				if (sim.ritual()) {
					sfx.win();
					useGame.getState().refresh();
					close();
				}
			},
			children: [
				"Harvest ",
				formatNum(snap.ritualSouls),
				" souls"
			]
		})]
	});
}
function ArenaModal({ result }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		onClose: () => useGame.getState().setArenaResult(null),
		title: result.win ? "Victory" : "Defeat",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-lg",
				children: result.foe
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm tabular-nums text-muted",
				children: [
					formatNum(result.yourPower),
					" vs ",
					formatNum(result.theirPower)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4 h-12 w-full",
				onClick: () => useGame.getState().setArenaResult(null),
				children: "Return"
			})
		]
	});
}
function ChestModal({ loot }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		onClose: () => useGame.getState().setChestLoot(null),
		title: "Chest",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-gold tabular-nums",
					children: [formatNum(loot.gold), " gold"]
				}),
				loot.souls ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-soul",
					children: [loot.souls, " souls"]
				})] }) : null,
				" · ",
				loot.influence,
				" influence"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4 h-12 w-full",
			onClick: () => useGame.getState().setChestLoot(null),
			children: "Take it"
		})]
	});
}
function OfflineModal({ gold }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		onClose: () => useGame.getState().clearOffline(),
		title: "While you slept",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm",
			children: [
				"The warband kept cutting. ",
				formatNum(gold),
				" gold."
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4 h-12 w-full",
			onClick: () => useGame.getState().clearOffline(),
			children: "Collect"
		})]
	});
}
function Modal({ title, children, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 grid place-items-end sm:place-items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-bg/80",
			"aria-label": "Close",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative m-3 w-[min(100%-1.5rem,420px)] rounded-xl border border-border bg-surface p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "grid size-11 place-items-center rounded-md text-muted",
					onClick: onClose,
					"aria-label": "Close",
					children: "×"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children
			})]
		})]
	});
}
//#endregion
export { GameApp };
