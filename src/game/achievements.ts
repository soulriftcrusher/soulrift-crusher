export type AchievementDef = {
  id: string;
  name: string;
  blurb: string;
  hint: string;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "blood", name: "First Blood", blurb: "A monster fell.", hint: "Kill 1" },
  { id: "sweeper", name: "Crypt Sweeper", blurb: "The floor remembers you.", hint: "Kill 100" },
  { id: "tide", name: "Bone Tide", blurb: "A thousand names in the ash.", hint: "Kill 1,000" },
  { id: "dawn", name: "First Dawn", blurb: "You came back.", hint: "Play 2 days" },
  { id: "week", name: "Week in the Rift", blurb: "Seven dawns. Still hunting.", hint: "Play 7 days" },
  { id: "hammer", name: "Hammer Hand", blurb: "The bench rang.", hint: "Craft 10" },
  { id: "forge", name: "Forge Lord", blurb: "Nothing leaves the bench unshaped.", hint: "Craft 50" },
  { id: "depth", name: "Ten Deep", blurb: "The tenth gate opened.", hint: "Reach floor 10" },
  { id: "vault", name: "Vault Walker", blurb: "Fifty floors of bone.", hint: "Reach floor 50" },
  { id: "warband", name: "Warband", blurb: "Five blades at your back.", hint: "Hire 5 heroes" },
  { id: "pit", name: "Pit Winner", blurb: "Someone else sat down.", hint: "Win 1 arena" },
  { id: "tyrant", name: "Tyrant Eater", blurb: "Bosses are just louder trash.", hint: "Kill 10 bosses" },
];
