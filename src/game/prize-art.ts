export type PrizeKind = "chest" | "ember" | "rune" | "rift" | "gems" | "gold" | "souls";

export function prizeArt(kind: PrizeKind): string {
  switch (kind) {
    case "chest":
      return "/tiles/loot-chest.png";
    case "ember":
      return "/tiles/loot-ember.png";
    case "rune":
      return "/tiles/loot-rune.png";
    case "rift":
      return "/tiles/loot-rift.png";
    case "gems":
      return "/tiles/loot-gems.png";
    case "gold":
      return "/wheel/gold.png";
    case "souls":
      return "/wheel/soul.png";
  }
}
