// 2D compositing helpers shared by all shots: bloom, halos, titles, brand card
import { clamp, lerp, seg, ease, rng, css, P, rgbOf, mx } from './util.js';

export const W = 1080, H = 1920;
export const CINZEL = '"Cinzel", "Trajan Pro", "Bitstream Charter", Georgia, serif';
export const SANS2 = '"Inter", "Helvetica Neue", Arial, sans-serif';
export const ITAL = '"Cormorant Garamond", "Bitstream Charter", Georgia, serif';

const bw = W / 4, bh = H / 4, bl = document.createElement('canvas'); bl.width = bw; bl.height = bh; const bctx = bl.getContext('2d');
const bl2 = document.createElement('canvas'); bl2.width = W / 10; bl2.height = H / 10; const bctx2 = bl2.getContext('2d');
export function bloom(cx, src, strength, wide = 1.1, bright = .72, contrast = 2.7) {
  if (strength <= .005) return;
  bctx.clearRect(0, 0, bw, bh); bctx.filter = `brightness(${bright}) contrast(${contrast}) blur(2px)`; bctx.drawImage(src, 0, 0, bw, bh); bctx.filter = 'none';
  bctx2.clearRect(0, 0, bl2.width, bl2.height); bctx2.filter = 'blur(3px)'; bctx2.drawImage(bl, 0, 0, bl2.width, bl2.height); bctx2.filter = 'none';
  cx.save(); cx.globalCompositeOperation = 'lighter'; cx.imageSmoothingEnabled = true; cx.globalAlpha = strength; cx.drawImage(bl, 0, 0, W, H); cx.globalAlpha = strength * wide; cx.drawImage(bl2, 0, 0, W, H); cx.restore();
}
export function halo(cx, x, y, r, c0, a) {
  if (a <= .003) return; const g = cx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${c0},${a})`); g.addColorStop(.35, `rgba(${c0},${a * .38})`); g.addColorStop(1, `rgba(${c0},0)`);
  cx.save(); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = g; cx.fillRect(x - r, y - r, 2 * r, 2 * r); cx.restore();
}
export const grain = document.createElement('canvas'); grain.width = grain.height = 256;
{ const g = grain.getContext('2d'), d = g.createImageData(256, 256), r = rng(3); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - .5) * 150 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }

// cinematic title: tracking collapses from wide to tight while a gold highlight sweeps across the letters
export function cineTitle(cx, t, lines, tIn, tOut, o = {}) {
  const size = o.size || 96, lh = o.lh || size * 1.14, y0 = o.y || 330, maxW = o.maxW || 900;
  const outA = 1 - ease.inOutCubic(seg(t, tOut - .55, tOut)); if (t < tIn || outA <= .002) return;
  cx.save(); cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
  lines.forEach((ln, i) => {
    const ti = tIn + i * (o.stag ?? .22), p = ease.outCubic(seg(t, ti, ti + 1.1)); if (p <= 0) return;
    let sz = size; cx.font = `${o.weight || 700} ${sz}px ${CINZEL}`; cx.letterSpacing = `${sz * .05}px`; const w0 = cx.measureText(ln).width; if (w0 > maxW) sz = size * maxW / w0;
    let ls = sz * (.045 + .20 * (1 - p)); cx.font = `${o.weight || 700} ${sz}px ${CINZEL}`; cx.letterSpacing = '0px'; { const wb = cx.measureText(ln).width, n = ln.length; ls = Math.max(sz * .045, Math.min(ls, (1030 - wb) / n)); } cx.letterSpacing = `${ls}px`;
    const base = y0 + i * lh + (1 - p) * sz * .18, w = cx.measureText(ln).width, x = W / 2 + ls / 2;
    const a = outA * Math.min(1, p * 2.0);
    const sweep = seg(t, ti + .1, ti + 1.5), cxh = lerp(-w * .2, w * 1.2, sweep) - w / 2 + W / 2;
    const g = cx.createLinearGradient(cxh - w * .22, 0, cxh + w * .22, 0), base1 = css(o.color || P.cream), hi = css(P.goldHi);
    g.addColorStop(0, base1); g.addColorStop(.5, sweep > 0 && sweep < 1 ? '#ffd36a' : base1); g.addColorStop(1, base1);
    cx.globalAlpha = a; cx.shadowColor = 'rgba(2,5,16,.8)'; cx.shadowBlur = 30; cx.shadowOffsetY = 4; cx.fillStyle = base1; cx.fillText(ln, x, base);
    cx.shadowBlur = 0; cx.shadowOffsetY = 0; cx.fillStyle = g; cx.fillText(ln, x, base);
    if (o.glow) { cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = a * .22; cx.shadowColor = 'rgba(255,200,90,.9)'; cx.shadowBlur = 40; cx.fillStyle = 'rgba(255,200,100,.5)'; cx.fillText(ln, x, base); cx.restore(); }
  });
  if (o.rule) { const n = lines.length, p = ease.outCubic(seg(t, tIn + .5 + n * .2, tIn + 1.4 + n * .2)), ry = y0 + (n - 1) * lh + size * .34; cx.globalAlpha = outA; cx.fillStyle = css(P.gold); cx.fillRect(W / 2 - 70 * p, ry, 140 * p, 3); }
  cx.restore();
}
// small caption in tracked sans
export function capLine(cx, t, text, tIn, tOut, y, o = {}) {
  const a = ease.outCubic(seg(t, tIn, tIn + .8)) * (1 - ease.inOutCubic(seg(t, tOut - .5, tOut))); if (a <= .003) return;
  cx.save(); cx.globalAlpha = a; cx.textAlign = 'center'; cx.font = `${o.weight || 600} ${o.size || 30}px ${o.family || SANS2}`; cx.letterSpacing = `${o.track ?? 9}px`; cx.shadowColor = 'rgba(2,5,16,.8)'; cx.shadowBlur = 14; cx.fillStyle = css(o.color || P.goldHi); cx.fillText(text, W / 2 + (o.track ?? 9) / 2, y); cx.restore();
}
// four-point star flare (thin cross of light) at a screen point
export function flare(cx, x, y, len, a, thick = 2.2) {
  if (a <= .003) return; cx.save(); cx.globalCompositeOperation = 'lighter';
  for (const [dx, dy] of [[1, 0], [0, 1]]) { const g = cx.createLinearGradient(x - dx * len, y - dy * len, x + dx * len, y + dy * len); g.addColorStop(0, 'rgba(255,230,160,0)'); g.addColorStop(.5, `rgba(255,244,205,${a})`); g.addColorStop(1, 'rgba(255,230,160,0)'); cx.fillStyle = g; cx.fillRect(x - (dx ? len : thick), y - (dy ? len : thick), dx ? 2 * len : 2 * thick, dy ? 2 * len : 2 * thick); }
  cx.restore();
}
