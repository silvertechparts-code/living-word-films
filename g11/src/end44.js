// Episode 44 final card (question: What would you give up for your family?): golden light gathers into the open-book emblem, the viewer question holds on screen, then the brand signature.
import { clamp, lerp, seg, ease, rng, css, P, smooth } from './util.js';
import { W, H, CINZEL, SANS2, ITAL, halo, cineTitle, flare } from './fx2d.js';

const LW = 1254, LS = .78, LX = (W - LW * LS) / 2, LY = 800;
const sx = x => LX + x * LS, sy = y => LY + y * LS;
const img = new Image(); let regions = null;
function region(y0, y1, fT, fB, fX = .05) {
  const c = document.createElement('canvas'); c.width = LW; c.height = y1 - y0; const g = c.getContext('2d'); g.drawImage(img, 0, -y0);
  g.globalCompositeOperation = 'destination-in';
  const h = c.height, gv = g.createLinearGradient(0, 0, 0, h); gv.addColorStop(0, fT ? 'rgba(0,0,0,0)' : '#000'); if (fT) gv.addColorStop(fT / h, '#000'); if (fB) gv.addColorStop(1 - fB / h, '#000'); gv.addColorStop(1, fB ? 'rgba(0,0,0,0)' : '#000');
  g.fillStyle = gv; g.fillRect(0, 0, LW, h);
  const gh = g.createLinearGradient(0, 0, LW, 0); gh.addColorStop(0, 'rgba(0,0,0,0)'); gh.addColorStop(fX, '#000'); gh.addColorStop(1 - fX, '#000'); gh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gh; g.fillRect(0, 0, LW, h);
  return { c, y0, h };
}
export const endingReady = new Promise(res => { img.onload = () => { try { regions = { E: region(40, 600, 90, 34, .14), T: region(580, 872, 24, 20, .12), S: region(862, 948, 22, 44, .12) }; } catch (e) { console.error(e); } res(); }; img.onerror = res; img.src = window.__LOGO || ''; });
export function makeEnding() { return {}; }

const R = rng(88), SP = Array.from({ length: 70 }, () => ({ ox: R(), oy: R(), d: R() * 1.6, dur: 1.1 + R() * .9, bend: (R() - .5) * 340, sz: 2 + R() * 3.2 }));
const T0 = 85.7;          // the emblem appears here (absolute seconds); the question starts at 85.3
const STEEL = [168, 184, 224];
function goldRule(cx, y, p, a, w = 600) {
  if (p <= 0.003) return; const hw = w / 2 * p; cx.save(); cx.globalAlpha = a;
  const g = cx.createLinearGradient(W / 2 - hw, 0, W / 2 + hw, 0); g.addColorStop(0, 'rgba(242,184,75,0)'); g.addColorStop(.5, 'rgba(255,220,143,1)'); g.addColorStop(1, 'rgba(242,184,75,0)');
  cx.fillStyle = g; cx.fillRect(W / 2 - hw, y - 1.5, 2 * hw, 3);
  cx.translate(W / 2, y); cx.rotate(Math.PI / 4); cx.fillStyle = 'rgba(255,224,150,1)'; const d = 9 * ease.outCubic(seg(p, .5, 1)); cx.fillRect(-d / 2, -d / 2, d, d); cx.restore();
}
export function drawEnding(cx, lt, t, proj) {
  const cxm = W / 2, eY = sy(330), LC = LY + 560;
  // a dark pool behind the emblem so the gold lettering stays crisp
  const sa = ease.inOutSine(seg(t, T0 - .4, T0 + 1.4)); if (sa > 0) { cx.save(); const g = cx.createRadialGradient(cxm, LC, 80, cxm, LC, 640); g.addColorStop(0, `rgba(3,6,18,${.5 * sa})`); g.addColorStop(.6, `rgba(3,6,18,${.34 * sa})`); g.addColorStop(1, 'rgba(3,6,18,0)'); cx.fillStyle = g; cx.fillRect(0, LY - 150, W, 1250); cx.restore(); }
  // refined golden lines frame the question
  goldRule(cx, 318, ease.outCubic(seg(t, 85.0, 86.2)), 1 * (1 - ease.inOutCubic(seg(t, 89.2, 89.9))));
  goldRule(cx, 770, ease.outCubic(seg(t, 87.0, 88.2)), 1 * (1 - ease.inOutCubic(seg(t, 89.2, 89.9))));
  // golden glow builds, then holds
  halo(cx, cxm, eY, 780, '255,190,80', (.08 + .22 * ease.outCubic(seg(t, T0 - .2, T0 + 1.8))) * (1 + .08 * Math.sin(lt * 2.0)));
  // sparks of light stream upward into the emblem
  const ox = W / 2, oy = 1700;
  cx.save(); cx.globalCompositeOperation = 'lighter';
  SP.forEach(p => {
    const u = (t - (T0 - 1.5) - p.d) / p.dur; if (u <= 0 || u >= 1) return; const e = ease.inOutCubic(u), x0 = ox + (p.ox - .5) * 520, y0 = oy + (p.oy - .5) * 240, x = lerp(x0, cxm + (p.ox - .5) * 40, e) + Math.sin(e * Math.PI) * p.bend, y = lerp(y0, eY, e);
    const a = Math.sin(Math.PI * u) * .9, g = cx.createRadialGradient(x, y, 0, x, y, p.sz * 5); g.addColorStop(0, `rgba(255,236,170,${a})`); g.addColorStop(1, 'rgba(255,190,70,0)'); cx.fillStyle = g; cx.fillRect(x - p.sz * 5, y - p.sz * 5, p.sz * 10, p.sz * 10);
  });
  cx.restore();
  // the open-book emblem, then the series name, then the promise
  if (regions) {
    const e = t - T0;
    const draw = (r, alpha, clipHalf = 1, sc = 1) => { if (alpha <= .002) return; cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = alpha; if (clipHalf < 1) { const hw = clipHalf * LW / 2; cx.beginPath(); cx.rect(sx(LW / 2 - hw), sy(r.y0 - 4), 2 * hw * LS, (r.h + 8) * LS); cx.clip(); } if (sc !== 1) { cx.translate(cxm, sy(r.y0 + r.h / 2)); cx.scale(sc, sc); cx.translate(-cxm, -sy(r.y0 + r.h / 2)); } cx.drawImage(r.c, sx(0), sy(r.y0), LW * LS, r.h * LS); cx.restore(); };
    const fo = 1 - ease.inOutCubic(seg(t, 89.3, 89.95));
    draw(regions.E, ease.inOutSine(seg(e, 0, 1.6)) * fo, 1, 1 + .05 * (1 - ease.outCubic(seg(e, 0, 2.3))));
    const tw = ease.outCubic(seg(e, 1.2, 2.4)); draw(regions.T, ease.inOutSine(seg(e, 1.2, 1.8)) * fo, tw);
    if (tw > 0 && tw < 1) { cx.save(); cx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) { const x = cxm + s * tw * LW * LS / 2, g = cx.createLinearGradient(x - 50, 0, x + 50, 0); g.addColorStop(0, 'rgba(255,220,130,0)'); g.addColorStop(.5, `rgba(255,230,150,${.55 * (1 - tw)})`); g.addColorStop(1, 'rgba(255,220,130,0)'); cx.fillStyle = g; cx.fillRect(x - 50, sy(640), 100, 200 * LS); } cx.restore(); }
    const sw = ease.outCubic(seg(e, 2.1, 3.1)); draw(regions.S, ease.inOutSine(seg(e, 2.1, 2.7)) * fo, sw);
    const pk2 = ease.outCubic(seg(e, .4, 1.4)); flare(cx, cxm, sy(125), 150 * pk2, .55 * pk2 * (1 - seg(e, 2.5, 4)), 2);
  }
  // the question: spoken in two breaths, kept on screen to the end
  const q = { maxW: 960, stag: 0, glow: 0 };
  cineTitle(cx, t, ['WHAT WOULD YOU'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['GIVE UP FOR'], 86.0, 89.9, { ...q, size: 100, y: 550, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['YOUR FAMILY?'], 86.7, 89.9, { ...q, size: 110, y: 680, color: P.goldHi, glow: 1 });
}
