/** Simple update number you and Grok share. Say "go back to Update N" to restore that snapshot. */
export const APP_VERSION = "3";
export const UPDATE_NO = 3;

export type Patch = {
  version: string;
  date: string;
  title: string;
  lines: string[];
};

export const PATCHES: Patch[] = [
  {
    version: "3",
    date: "Sep 16, 2026",
    title: "Wheel, legal row, color",
    lines: [
      "Fortune wheel is a real Wheel of Fortune — slices, pointer, it spins.",
      "Support and Copyright stay on screen at login. Privacy and Copyright on the title stay in the hunt.",
      "Richer gold, ember, teal, and green. No pink.",
      "Ads are wired and off until a real network ID is set.",
      "One live device per hunt — a second phone or PC kicks the first off.",
      "Chat hides emails and hunt codes. Other hunters never see your login.",
      "If this update bugs out, tell Grok: go back to Update 2.",
    ],
  },
  {
    version: "2",
    date: "Sep 14, 2026",
    title: "Runes, MAX, HP colors",
    lines: [
      "Tap a rune — or the Runes button on Heroes — for a full picture and what it does. Socket or pull off from that sheet.",
      "Hero row has MAX. It applies to hire, upgrade, and gild.",
      "Monster HP bar is green / gold / red and shows current / max.",
      "Fortune wheel no longer says jackpot.",
      "If this update bugs out, tell Grok: go back to Update 1.",
    ],
  },
  {
    version: "1",
    date: "Sep 14, 2026",
    title: "Locked snapshot",
    lines: [
      "Clan profile, hero faces, and saves as they were.",
      "Progress only goes up.",
    ],
  },
];
