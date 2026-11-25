// Malayalam subtitles, burned into the picture (series rule 8): Anek Malayalam ExtraBold, 52 px, bottom edge of the last line at y = 1750 of 1920,
// 2 lines at most, every line inside 860 px, warm white with a soft shadow and a 30 % backing. Cards come from subs19.json: {a, b, t} with "|" for the line break.
import { W } from './fx2d.js';
import SUBS from './subs19.json';
const FS = 52, LH = 78, BOTTOM = 1750, MAXW = 860, FONT = `800 ${FS}px "Anek Malayalam", sans-serif`;
const fade = (t, a, b) => Math.min(1, Math.max(0, (t - a) / .12)) * Math.min(1, Math.max(0, (b - t) / .14));
let fm = null;
export function subWidths(cx) {          // for the QC step: widest line of each card, in px
  cx.save(); cx.font = FONT; const out = SUBS.map(s => { const L = s.t.split('|').map(x => x.trim()); return { a: s.a, lines: L.length, w: Math.max(...L.map(l => Math.ceil(cx.measureText(l).width))) }; }); cx.restore(); return out;
}
export function drawSubs(cx, t) {
  let s = null; for (const c of SUBS) if (t >= c.a - .02 && t < c.b + .22) s = c; if (!s) return;   // the latest card wins, so a follow-on card is never held back by the tail of the one before
  const al = fade(t, s.a - .02, s.b + .22); if (al <= .003) return;
  const lines = s.t.split('|').map(x => x.trim()), n = lines.length;
  cx.save(); cx.font = FONT; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic'; cx.globalAlpha = al;
  if (!fm) { const m = cx.measureText('മ'); fm = { A: m.fontBoundingBoxAscent, D: m.fontBoundingBoxDescent }; }
  const { A, D } = fm;
  lines.forEach((ln, i) => {
    const boxBottom = BOTTOM - (n - 1 - i) * LH, base = boxBottom - LH + (LH - (A + D)) / 2 + A, w = cx.measureText(ln).width;
    cx.fillStyle = 'rgba(10,14,30,.30)'; cx.beginPath(); cx.roundRect(W / 2 - w / 2 - 20, base - A - 3, w + 40, A + D + 6, 12); cx.fill();
    cx.fillStyle = '#fff6e0';
    for (const [bx, by, bl, ba] of [[0, 0, 26, .65], [0, 3, 10, .85], [0, 0, 6, .9]]) { cx.shadowColor = `rgba(0,0,0,${ba})`; cx.shadowBlur = bl; cx.shadowOffsetX = bx; cx.shadowOffsetY = by; cx.fillText(ln, W / 2, base); }
    cx.shadowBlur = 0; cx.shadowColor = 'transparent'; cx.fillText(ln, W / 2, base);
  });
  cx.restore();
}
window.__subWidths = () => { const c = document.createElement('canvas').getContext('2d'); return subWidths(c); };
