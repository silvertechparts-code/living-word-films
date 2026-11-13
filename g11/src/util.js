// ---- math, easing, keyframes, colour, type helpers
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
export const ease = {
  outCubic: k => 1 - Math.pow(1 - k, 3),
  outQuad: k => 1 - (1 - k) * (1 - k),
  inCubic: k => k * k * k,
  inQuad: k => k * k,
  inOutCubic: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  inOutSine: k => 0.5 - Math.cos(Math.PI * k) / 2,
  outBack: k => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  lin: k => k,
};
export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function keyed(t, keys, e = ease.inOutSine) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; return lerp(a[1], b[1], e(seg(t, a[0], b[0]))); }
  return keys[keys.length - 1][1];
}
export function keyedVec(t, keys, e = ease.inOutSine) {   // keys [[t,[..]],..]
  if (t <= keys[0][0]) return keys[0][1].slice();
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i], k = e(seg(t, a[0], b[0])); return a[1].map((v, j) => lerp(v, b[1][j], k)); }
  return keys[keys.length - 1][1].slice();
}
export const rgbOf = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
export const mx = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
export const css = (a, al = 1) => `rgba(${a[0] | 0},${a[1] | 0},${a[2] | 0},${al})`;
export const P = {
  gold: rgbOf('#F2B84B'), goldHi: rgbOf('#FFDC8F'), cream: rgbOf('#F4EBD6'),
};
export const SERIF = '"Bitstream Charter", "Charter", "FreeSerif", Georgia, serif';
export const SANS = '"Inter", "Helvetica Neue", Arial, sans-serif';

export function fitFont(ctx, text, weight, size, family, maxW, spacing = 0.04) {
  ctx.font = `${weight} ${size}px ${family}`; ctx.letterSpacing = `${size * spacing}px`;
  const w = ctx.measureText(text).width; return w > maxW ? size * maxW / w : size;
}
export function titleBlock(ctx, W, t, lines, ref, tIn, tOut, o = {}) {
  const size = o.size || 96, lh = size * 1.1, y0 = o.y || 400;
  const outA = 1 - ease.inOutCubic(seg(t, tOut - 0.5, tOut));
  if (t < tIn || outA <= 0.002) return;
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  lines.forEach((ln, i) => {
    const p = ease.outCubic(seg(t, tIn + i * 0.14, tIn + i * 0.14 + 0.85));
    if (p <= 0) return;
    const sz = fitFont(ctx, ln, 700, size, SERIF, 900);
    const base = y0 + i * lh;
    ctx.save(); ctx.beginPath(); ctx.rect(0, base - sz * 0.95, W, sz * 1.3); ctx.clip();
    ctx.globalAlpha = outA * Math.min(1, p * 2.2);
    ctx.font = `700 ${sz}px ${SERIF}`; ctx.letterSpacing = `${sz * 0.04}px`;
    const dy = (1 - p) * sz * 0.95;
    ctx.shadowColor = 'rgba(2,6,20,0.75)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 4;
    ctx.fillStyle = css(o.color || P.cream); ctx.fillText(ln, W / 2, base + dy); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.fillText(ln, W / 2, base + dy);
    ctx.restore();
  });
  if (ref) {
    const t1 = tIn + 0.3 + lines.length * 0.14;
    const rp = ease.outCubic(seg(t, t1, t1 + 0.9));
    const ry = y0 + (lines.length - 1) * lh + size * 0.36;
    ctx.globalAlpha = outA;
    ctx.fillStyle = css(P.gold); ctx.fillRect(W / 2 - 70 * rp, ry, 140 * rp, 3);
    ctx.globalAlpha = outA * rp; ctx.font = `600 38px ${SANS}`; ctx.letterSpacing = '9px';
    ctx.fillStyle = 'rgba(2,4,14,0.5)'; ctx.fillText(ref, W / 2, ry + 66);
    ctx.fillStyle = css(P.goldHi); ctx.fillText(ref, W / 2, ry + 64);
  }
  ctx.restore();
}
