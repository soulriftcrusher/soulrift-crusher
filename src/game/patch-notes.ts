/** Simple update number you and Grok share. Say "go back to Update N" to restore that snapshot. */
export const APP_VERSION = "1";
export const UPDATE_NO = 1;

export type Patch = {
  version: string;
  date: string;
  title: string;
  lines: string[];
};

export const PATCHES: Patch[] = [
  {
    version: "1",
    date: "Sep 14, 2026",
    title: "Locked snapshot",
    lines: [
      "This is Update 1 — the hunt, clans, hero faces, and saves as they are right now.",
      "Clan profile matches the old warband desk. Edit clan, crests, last online, Leader / Co-Leader / Elder.",
      "Hero faces are profile pics. Progress only goes up.",
      "If a later update bugs out, tell Grok: go back to Update 1.",
    ],
  },
];
