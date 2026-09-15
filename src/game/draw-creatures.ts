import type { HeroId, MonsterKind } from "./data";

const C = {
  ink: "#1a1210",
  bone: "#e8dcc4",
  ash: "#8a7e74",
  ember: "#c45c4a",
  emberHot: "#e8a090",
  slime: "#6a8f4e",
  slimeDark: "#2c3a22",
  steel: "#9aa3ad",
  void: "#0e1014",
  rift: "#9bb7c9",
};

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

export function drawHeroFigure(
  ctx: CanvasRenderingContext2D,
  id: HeroId,
  t: number,
  x: number,
  y: number,
  scale: number,
  attacking: number,
) {
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
    case "orin":
      drawOrin(ctx, t, x, y, scale, attacking);
      break;
    default:
      break;
  }
}

export const DRAWN_HEROES: HeroId[] = [];

export function drawDevourer(
  ctx: CanvasRenderingContext2D,
  t: number,
  x: number,
  y: number,
  scale: number,
  attacking: number,
) {
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
  ctx.globalAlpha = 0.55 + Math.sin(t * 5) * 0.25;
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
  for (const ox of [-6, 0, 6]) ctx.fillRect(ox - 1.2, -128, 2.4, 10);

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

function drawSable(
  ctx: CanvasRenderingContext2D,
  t: number,
  x: number,
  y: number,
  scale: number,
  attacking: number,
) {
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

function drawIskra(
  ctx: CanvasRenderingContext2D,
  t: number,
  x: number,
  y: number,
  scale: number,
  attacking: number,
) {
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

function drawBrann(
  ctx: CanvasRenderingContext2D,
  t: number,
  x: number,
  y: number,
  scale: number,
  attacking: number,
) {
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

function drawNyx(
  ctx: CanvasRenderingContext2D,
  t: number,
  x: number,
  y: number,
  scale: number,
  attacking: number,
) {
  ctx.save();
  ctx.translate(x + attacking * 22 * scale, y);
  ctx.scale(scale, scale);
  const bob = Math.sin(t * 5) * 4;
  ctx.translate(0, bob);
  ctx.globalAlpha = 0.9;
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
  ctx.globalAlpha = 0.55 + Math.sin(t * 6) * 0.25;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -52, 22, 0.2, 2.6);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawKira(
  ctx: CanvasRenderingContext2D,
  t: number,
  x: number,
  y: number,
  scale: number,
  attacking: number,
) {
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

function drawOrin(
  ctx: CanvasRenderingContext2D,
  t: number,
  x: number,
  y: number,
  scale: number,
  attacking: number,
) {
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

export function drawMonster(
  ctx: CanvasRenderingContext2D,
  kind: MonsterKind,
  t: number,
  x: number,
  y: number,
  scale: number,
  hurt: number,
  dead: number,
) {
  ctx.save();
  ctx.translate(x, y);
  const squash = dead > 0 ? 1 + dead * 0.4 : 1;
  const flatten = dead > 0 ? 1 - dead * 0.7 : 1;
  ctx.scale(scale * squash, scale * flatten);
  if (hurt > 0) ctx.globalAlpha = Math.min(1, 0.75 + hurt * 0.4);
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
    default:
      drawBrute(ctx, t, bob);
      break;
  }
  ctx.restore();
}

function drawRat(ctx: CanvasRenderingContext2D, t: number, bob: number) {
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

function drawSkeleton(ctx: CanvasRenderingContext2D, t: number, bob: number) {
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

function drawSlime(ctx: CanvasRenderingContext2D, t: number) {
  const squash = 1 + Math.sin(t * 4) * 0.08;
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

function drawSpider(ctx: CanvasRenderingContext2D, t: number, bob: number) {
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
    const a = -0.4 + i * 0.28 + Math.sin(t * 8 + i) * 0.08;
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

function drawBat(ctx: CanvasRenderingContext2D, t: number, bob: number) {
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

function drawWraith(ctx: CanvasRenderingContext2D, t: number, bob: number) {
  ctx.translate(0, bob);
  ctx.globalAlpha = 0.88;
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

function drawBrute(ctx: CanvasRenderingContext2D, t: number, bob: number) {
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

function drawGolem(ctx: CanvasRenderingContext2D, t: number, bob: number) {
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

function drawTyrant(ctx: CanvasRenderingContext2D, t: number, bob: number) {
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

function drawWyrm(ctx: CanvasRenderingContext2D, t: number, bob: number) {
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
  ctx.globalAlpha = 0.6 + Math.sin(t * 6) * 0.2;
  ctx.beginPath();
  ctx.moveTo(-54, -48);
  ctx.quadraticCurveTo(-90, -40, -58, -30);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRiftmaw(ctx: CanvasRenderingContext2D, t: number, bob: number) {
  ctx.translate(0, bob);
  const pulse = 0.5 + Math.sin(t * 4) * 0.5;
  ctx.fillStyle = `rgba(155,183,201,${0.12 + pulse * 0.1})`;
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
  ctx.globalAlpha = 0.7;
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
