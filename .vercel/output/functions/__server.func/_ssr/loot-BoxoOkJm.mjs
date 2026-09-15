//#region node_modules/.nitro/vite/services/ssr/assets/loot-BoxoOkJm.js
var LOOT = [
	{
		id: "ticket",
		name: "Rift Scrap",
		kind: "loot",
		blurb: "A torn recipe."
	},
	{
		id: "skull",
		name: "Rat Skull",
		kind: "loot",
		blurb: "Drops from crypt rats."
	},
	{
		id: "jaw",
		name: "Bone Jaw",
		kind: "loot",
		blurb: "Drops from skeletons."
	},
	{
		id: "fangs",
		name: "Fang Cord",
		kind: "loot",
		blurb: "Drops from spiders."
	},
	{
		id: "tooth",
		name: "Ivory Tooth",
		kind: "loot",
		blurb: "Drops from brutes."
	},
	{
		id: "claw",
		name: "Ash Claw",
		kind: "loot",
		blurb: "Drops from wyrms."
	},
	{
		id: "wing",
		name: "Tomb Wing",
		kind: "loot",
		blurb: "Drops from bats."
	},
	{
		id: "gold-plume",
		name: "Gold Plume",
		kind: "loot",
		blurb: "Rare feather."
	},
	{
		id: "blood-plume",
		name: "Blood Plume",
		kind: "loot",
		blurb: "War-feather."
	},
	{
		id: "soul-plume",
		name: "Soul Plume",
		kind: "loot",
		blurb: "Drops from wraiths."
	},
	{
		id: "frond",
		name: "Moss Frond",
		kind: "loot",
		blurb: "Grows in the crypt."
	},
	{
		id: "worm",
		name: "Grave Worm",
		kind: "loot",
		blurb: "Drops from slimes."
	},
	{
		id: "heart",
		name: "Still Heart",
		kind: "loot",
		blurb: "Boss trophy."
	},
	{
		id: "eye",
		name: "Tyrant Eye",
		kind: "loot",
		blurb: "Drops from floor tyrants."
	},
	{
		id: "ember-leaf",
		name: "Ember Leaf",
		kind: "loot",
		blurb: "Forge weed."
	},
	{
		id: "rift-fish",
		name: "Rift Fish",
		kind: "loot",
		blurb: "Drops from riftmaws."
	},
	{
		id: "bone-shard",
		name: "Bone Shard",
		kind: "shard",
		blurb: "Drops from golems."
	},
	{
		id: "soul-shard",
		name: "Soul Shard",
		kind: "shard",
		blurb: "Rare soul crystal."
	},
	{
		id: "rift-shard",
		name: "Rift Shard",
		kind: "shard",
		blurb: "Cut-glass from the rift."
	},
	{
		id: "flask",
		name: "Catalyst Flask",
		kind: "loot",
		blurb: "Raises create chance."
	},
	{
		id: "horn",
		name: "War Horn",
		kind: "loot",
		blurb: "Drops from hounds."
	},
	{
		id: "ichor",
		name: "Grave Ichor",
		kind: "loot",
		blurb: "Drops from ghouls."
	},
	{
		id: "scale",
		name: "Wyrm Scale",
		kind: "loot",
		blurb: "Drops from serpents."
	},
	{
		id: "husk",
		name: "Beetle Husk",
		kind: "loot",
		blurb: "Drops from beetles."
	},
	{
		id: "venom",
		name: "Venom Sac",
		kind: "loot",
		blurb: "Drops from harpies."
	},
	{
		id: "ice-core",
		name: "Ice Core",
		kind: "loot",
		blurb: "Rime trophy."
	},
	{
		id: "silk",
		name: "Shadow Silk",
		kind: "loot",
		blurb: "Rare wrap."
	},
	{
		id: "ember-core",
		name: "Ember Core",
		kind: "loot",
		blurb: "Forge heart."
	},
	{
		id: "cap",
		name: "Well Cap",
		kind: "loot",
		blurb: "Grows by the well."
	},
	{
		id: "lung",
		name: "Crystal Lung",
		kind: "loot",
		blurb: "Drops from liches."
	}
];
Object.fromEntries(LOOT.map((l) => [l.id, l]));
function lootIcon(id) {
	return `/sprites/loot/${id}.jpg`;
}
var MONSTER_DROP = {
	rat: "skull",
	skeleton: "jaw",
	slime: "worm",
	spider: "fangs",
	bat: "wing",
	wraith: "soul-plume",
	brute: "tooth",
	golem: "bone-shard",
	tyrant: "eye",
	wyrm: "claw",
	riftmaw: "rift-fish",
	ghoul: "ichor",
	beetle: "husk",
	serpent: "scale",
	harpy: "venom",
	lich: "lung",
	hound: "horn"
};
var EXTRA_DROPS = [
	"ticket",
	"gold-plume",
	"blood-plume",
	"frond",
	"ember-leaf",
	"flask",
	"heart",
	"silk",
	"cap",
	"ice-core",
	"ember-core"
];
var RECIPES = [
	{
		id: "broth",
		name: "Ash Broth",
		blurb: "Skull and jaw, boiled to ember.",
		inputs: ["skull", "jaw"],
		chance: 1,
		result: {
			kind: "ember",
			n: 20
		}
	},
	{
		id: "cord",
		name: "Fang Temper",
		blurb: "Fangs, tooth, claw. Hits the warband weapon.",
		inputs: [
			"fangs",
			"tooth",
			"claw"
		],
		chance: .85,
		result: { kind: "craft" }
	},
	{
		id: "sky",
		name: "Sky Charm",
		blurb: "Wing and gold plume buy gems.",
		inputs: ["wing", "gold-plume"],
		chance: .9,
		result: {
			kind: "gems",
			n: 40
		}
	},
	{
		id: "hymn",
		name: "Blood Hymn",
		blurb: "Two plumes for souls.",
		inputs: ["blood-plume", "soul-plume"],
		chance: .9,
		result: {
			kind: "souls",
			n: 8
		}
	},
	{
		id: "offering",
		name: "Still Offering",
		blurb: "Heart and eye open a chest.",
		inputs: ["heart", "eye"],
		chance: .8,
		result: {
			kind: "chest",
			n: 1
		}
	},
	{
		id: "fry",
		name: "Rift Fry",
		blurb: "Fish and ember leaf.",
		inputs: ["rift-fish", "ember-leaf"],
		chance: .9,
		result: {
			kind: "gems",
			n: 18
		}
	},
	{
		id: "bone-temper",
		name: "Bone Temper",
		blurb: "Shard, skull, claw. Ranks a hired weapon.",
		inputs: [
			"bone-shard",
			"skull",
			"claw"
		],
		chance: .75,
		result: { kind: "craft" }
	},
	{
		id: "soul-cut",
		name: "Soul Cut",
		blurb: "Soul shard and plume mint a rune.",
		inputs: ["soul-shard", "soul-plume"],
		catalyst: "flask",
		chance: .7,
		result: { kind: "rune" }
	},
	{
		id: "rift-cut",
		name: "Rift Cut",
		blurb: "Rift shard and fish, with a flask.",
		inputs: ["rift-shard", "rift-fish"],
		catalyst: "flask",
		chance: .65,
		result: {
			kind: "item",
			id: "soul-shard",
			n: 1
		}
	},
	{
		id: "horn-call",
		name: "War Call",
		blurb: "Horn and husk temper a hired weapon.",
		inputs: ["horn", "husk"],
		chance: .85,
		result: { kind: "craft" }
	},
	{
		id: "ichor-brew",
		name: "Ichor Brew",
		blurb: "Ichor and cap for ember.",
		inputs: ["ichor", "cap"],
		chance: .9,
		result: {
			kind: "ember",
			n: 24
		}
	},
	{
		id: "scale-mail",
		name: "Scale Mail",
		blurb: "Scale and silk mint a rune.",
		inputs: ["scale", "silk"],
		chance: .75,
		result: { kind: "rune" }
	},
	{
		id: "lich-breath",
		name: "Lich Breath",
		blurb: "Lung and ice-core open a chest.",
		inputs: ["lung", "ice-core"],
		chance: .7,
		result: {
			kind: "chest",
			n: 1
		}
	},
	{
		id: "venom-cut",
		name: "Venom Cut",
		blurb: "Venom and ember-core for gems.",
		inputs: ["venom", "ember-core"],
		chance: .8,
		result: {
			kind: "gems",
			n: 28
		}
	}
];
function emptyBag() {
	const o = {};
	for (const l of LOOT) o[l.id] = 0;
	return o;
}
function sortedKey(ids) {
	return [...ids].sort().join("|");
}
var RECIPE_MAP = new Map(RECIPES.map((r) => [sortedKey(r.inputs), r]));
function matchRecipe(slots, catalyst) {
	const filled = slots.filter((s) => !!s);
	if (filled.length === 0) return null;
	const hit = RECIPE_MAP.get(sortedKey(filled));
	if (!hit) return null;
	if (hit.catalyst && catalyst !== hit.catalyst) return hit;
	return hit;
}
function craftChance(recipe, catalyst) {
	if (!recipe) return catalyst === "flask" ? .35 : .22;
	let c = recipe.chance;
	if (catalyst === "flask") c = Math.min(1, c + .2);
	if (recipe.catalyst && catalyst === recipe.catalyst) c = Math.min(1, c + .15);
	return c;
}
function dropFor(kind, boss) {
	const out = [{
		id: MONSTER_DROP[kind],
		n: boss ? 2 + Math.floor(Math.random() * 3) : 1
	}];
	if (boss) {
		const shards = [
			"bone-shard",
			"soul-shard",
			"rift-shard"
		];
		out.push({
			id: shards[Math.floor(Math.random() * shards.length)],
			n: 1
		});
		if (Math.random() < .35) out.push({
			id: "heart",
			n: 1
		});
		if (Math.random() < .25) out.push({
			id: "flask",
			n: 1
		});
	} else if (Math.random() < .18) out.push({
		id: EXTRA_DROPS[Math.floor(Math.random() * EXTRA_DROPS.length)],
		n: 1
	});
	return out;
}
//#endregion
export { emptyBag as a, dropFor as i, RECIPES as n, lootIcon as o, craftChance as r, matchRecipe as s, LOOT as t };
