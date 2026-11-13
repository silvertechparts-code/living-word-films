// Episode 8 land: the same floating island, renewed. A broad plateau of the mountains of Ararat in the north carries the resting ark; lower peaks ring the island; a green plain lies to the south.
// Every peak stays at or below the plateau + 0.3, so the ark touches down first and "the tops of the mountains" appear afterwards.
import * as THREE from 'three';
import { GB } from './geo.js';
import { rng, lerp, clamp, smooth } from './util.js';
import { tri } from './props.js';
import { lam } from './flora.js';
export { underRock, farMountains, makeClouds, TAU, RI } from './terrain6.js';
import { RI, TAU } from './terrain6.js';

export const YSH = 3.0;                                    // top of the plateau
export const MESA = { x: 0, z: -5.0, a: 10.6, b: 5.2 };    // plateau ellipse (flat top inside ~0.8 of it)
export const ARK8 = { x: 0, z: -7.0, yaw: Math.PI / 2 };   // resting place of the ark (long axis along x, the door faces south, +z)
const PK = [[-10.2, -2.6, 3.3, 3.8], [10.4, -3.0, 3.1, 3.6], [-7.8, -10.4, 3.25, 3.4], [8.0, -10.6, 3.05, 3.4], [.4, -12.4, 2.9, 3.2], [-11.2, 3.6, 2.3, 3.0], [11.0, 4.4, 2.1, 2.8], [-4.4, 8.6, 1.6, 2.6], [5.0, 9.0, 1.8, 2.6], [-11.8, -6.6, 2.6, 2.8]];
const ss = smooth;
function peaks(x, z) {
  let h = 0;
  for (const [px, pz, ph, pr] of PK) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.2)); }
  return h * (.88 + .24 * Math.abs(Math.sin(x * 2.9 + z * 1.3) * Math.cos(z * 2.3 - x * .7)));
}
export function Hf(x, z) {
  const r = Math.hypot(x, z);
  let h = .16 * Math.sin(x * .7 + 1.3) * Math.cos(z * .6) + .09 * Math.sin(x * 1.9 + z * 1.3) + .1;
  h = Math.max(h, peaks(x, z));
  const d = Math.hypot((x - MESA.x) / MESA.a, (z - MESA.z) / MESA.b), k = ss(1.14, .8, d);       // 1 on the flat top
  const rim = (.05 * Math.sin(x * 1.7 + 2) * Math.cos(z * 2.1) + .04 * Math.sin(x * 3.1 + z * 2.3)) * (1 - ss(.62, .82, d)) * 0;
  h = lerp(h, YSH + rim, k * k * (3 - 2 * k));
  return Math.max(.03, h * (1 - ss(RI - 2.4, RI - .15, r)) + .03);
}
const C = c => new THREE.Color(c);
export function groundCol(x, y, z, slope) {
  const b = C('#6f8a48'), d = Math.hypot((x - MESA.x) / MESA.a, (z - MESA.z) / MESA.b);
  b.lerp(C('#86985a'), .55 * ss(-5, 8, z) * (1 - ss(1, 1.3, d)));
  b.lerp(C('#7a8a50'), .5 * ss(.2, .7, Math.sin(x * 1.3 + z * .9) * .5 + .5));
  if (d < .84) b.lerp(C('#80965a'), .6);                                       // the grass of the plateau top
  if (y < .5) b.lerp(C('#7f8856'), .5);
  if (slope > .3 || y > 2.7 && d > .9) b.lerp(C(y > 2.4 ? '#8d8578' : '#766e62'), clamp((slope - .22) * 2.2 + (y - 1.2) * .12));
  if (Math.hypot(x, z) > RI - 1.0) b.lerp(C('#5a4a38'), .7);
  return b.getHex();
}
export function buildTerrain(rn) {
  const rings = 46, segs = 108, V = [];
  for (let i = 0; i <= rings; i++) { const row = []; for (let j = 0; j < segs; j++) {
    let r = i / rings * RI, a = j / segs * TAU; if (i > 0 && i < rings) { r += (rn() - .5) * .4 * (RI / rings); a += (rn() - .5) * .55 * TAU / segs; }
    const x = Math.cos(a) * r, z = Math.sin(a) * r; row.push([x, i === 0 ? Hf(0, 0) : Hf(x, z), z]); } V.push(row); }
  const gb = new GB(rn), A = new THREE.Vector3(), B = new THREE.Vector3(), Cc = new THREE.Vector3();
  const put = (p, q, r) => {
    A.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); B.set(r[0] - p[0], r[1] - p[1], r[2] - p[2]); Cc.crossVectors(A, B);
    if (Cc.y < 0) { const t = q; q = r; r = t; Cc.negate(); } Cc.normalize();
    tri(gb, p, q, r, groundCol((p[0] + q[0] + r[0]) / 3, (p[1] + q[1] + r[1]) / 3, (p[2] + q[2] + r[2]) / 3, 1 - Cc.y), .07);
  };
  for (let i = 0; i < rings; i++) for (let j = 0; j < segs; j++) {
    const j1 = (j + 1) % segs, a = V[i][j], b = V[i][j1], c = V[i + 1][j1], d = V[i + 1][j];
    if (i === 0) put(V[0][0], d, c); else if ((i + j) & 1) { put(a, b, c); put(a, c, d); } else { put(a, b, d); put(b, c, d); }
  }
  const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; m.frustumCulled = false; return m;
}
