// Episode 6 land: one floating island (radius 14) with a dark settlement in the west, Noah's hill in the south, the ark site in the east and mountains along the north rim.
import * as THREE from 'three';
import { GB, G } from './geo.js';
import { rng, lerp, clamp, smooth } from './util.js';
import { tri, peakGeo } from './props.js';
import { lam } from './flora.js';

export const RI = 14, TAU = Math.PI * 2;
export const SET = { x: -6.0, z: 1.2, r: 4.9 };            // settlement and plaza
export const HILL = { x: 2.4, z: 6.0, h: 1.9, r: 3.1 };    // Noah's hill
export const ARKP = { x: 7.0, z: -0.6 };                   // ark centre (long axis = z)
const PEAKS = [[-3.5, -9.6, 5.6, 5.2], [3.0, -10.6, 4.6, 4.6], [-9.3, -6.0, 4.6, 4.4], [-11.2, 1.0, 3.3, 3.6], [8.2, -9.0, 3.4, 3.6], [-7.2, -10.0, 4.2, 3.4], [11.0, -4.8, 2.6, 3.0]];
const smoothstep = (a, b, x) => smooth(a, b, x);
function mount(x, z) {
  let h = 0;
  for (const [px, pz, ph, pr] of PEAKS) { const d = Math.hypot(x - px, z - pz) / pr; if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.25)); }
  return h * (0.86 + .28 * Math.abs(Math.sin(x * 2.9 + z * 1.3) * Math.cos(z * 2.3 - x * .7)));
}
export function Hf(x, z) {
  const r = Math.hypot(x, z);
  let h = .16 * Math.sin(x * .7 + 1.3) * Math.cos(z * .6) + .09 * Math.sin(x * 1.9 + z * 1.3) + .1;
  h += mount(x, z) * smoothstep(.2, 1.4, Math.hypot(x - SET.x, z - SET.z) - SET.r + 1.2) * smoothstep(.2, 1.2, Math.hypot(x - ARKP.x, (z - ARKP.z) * .55) - 3.1);
  const hd = Math.hypot(x - HILL.x, z - HILL.z) / HILL.r; if (hd < 1) h = Math.max(h, HILL.h * (hd < .3 ? 1 : Math.pow(1 - (hd - .3) / .7, 1.6) * .9 + .1 * (1 - hd)));
  const ds = Math.hypot(x - SET.x, z - SET.z); h = lerp(.08, h, smoothstep(SET.r - 1.2, SET.r + .6, ds));              // settlement ground is flat
  const da = Math.hypot((x - ARKP.x) * .8, (z - ARKP.z) * .5); h = lerp(.07, h, smoothstep(2.4, 3.8, da));            // ark site is flat
  return Math.max(.03, h * (1 - smoothstep(RI - 2.4, RI - .15, r)) + .03);
}
// ground colour: ash and charcoal in the west, muted olive and earth in the east
export function groundCol(x, y, z, slope, rn) {
  const g = smoothstep(-6, 5, x), c = new THREE.Color();
  let base = c.set('#4b473d').lerp(new THREE.Color('#58633f'), g * .8).clone();
  const ds = Math.hypot(x - SET.x, z - SET.z); if (ds < SET.r - .4) base.lerp(new THREE.Color('#4a4238'), .8);
  if (ds < 2.1) base.lerp(new THREE.Color('#7a6a52'), .8 * (1 - ds / 2.1));
  const da = Math.hypot((x - ARKP.x) * .8, (z - ARKP.z) * .5); if (da < 3.0) base.lerp(new THREE.Color('#8e7a58'), .85 * (1 - da / 3.0));
  if (slope > .3 || y > 2.4) base.lerp(new THREE.Color(y > 3.6 ? '#9a9aa8' : '#6c685f'), clamp((slope - .25) * 2.2 + (y - 2.2) * .22));
  const hd = Math.hypot(x - HILL.x, z - HILL.z); if (hd < HILL.r * 1.05 && slope < .35) base.lerp(new THREE.Color('#6a7c46'), .55);
  if (Math.hypot(x, z) > RI - 1.0) base.lerp(new THREE.Color('#5a4a38'), .7);
  return base.getHex();
}
export function buildTerrain(rn) {
  const rings = 36, segs = 84, V = [];
  for (let i = 0; i <= rings; i++) { const row = []; for (let j = 0; j < segs; j++) {
    let r = i / rings * RI, a = j / segs * TAU; if (i > 0 && i < rings) { r += (rn() - .5) * .4 * (RI / rings); a += (rn() - .5) * .55 * TAU / segs; }
    const x = Math.cos(a) * r, z = Math.sin(a) * r; row.push([x, i === 0 ? Hf(0, 0) : Hf(x, z), z]); } V.push(row); }
  const gb = new GB(rn), A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  const put = (p, q, r) => {
    A.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); B.set(r[0] - p[0], r[1] - p[1], r[2] - p[2]); C.crossVectors(A, B);
    if (C.y < 0) { const t = q; q = r; r = t; C.negate(); } C.normalize();
    const cx = (p[0] + q[0] + r[0]) / 3, cy = (p[1] + q[1] + r[1]) / 3, cz = (p[2] + q[2] + r[2]) / 3;
    tri(gb, p, q, r, groundCol(cx, cy, cz, 1 - C.y, rn), .07);
  };
  for (let i = 0; i < rings; i++) for (let j = 0; j < segs; j++) {
    const j1 = (j + 1) % segs, a = V[i][j], b = V[i][j1], c = V[i + 1][j1], d = V[i + 1][j];
    if (i === 0) put(V[0][0], d, c); else if ((i + j) & 1) { put(a, b, c); put(a, c, d); } else { put(a, b, d); put(b, c, d); }
  }
  const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; m.frustumCulled = false; return m;
}
export function underRock(rn, R = RI) {
  const gb = new GB(rn), cyl = (rt, rb, h, y, col) => gb.add(new THREE.CylinderGeometry(rt, rb, h, 30, 1).translate(0, y, 0), col, [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
  cyl(R, R, .3, -.15, '#4a3a2c'); cyl(R * .995, R * .93, .8, -.7, '#5a4634'); cyl(R * .93, R * .78, 1.4, -1.8, '#6a5440'); cyl(R * .78, R * .55, 2.2, -3.6, '#4a3a2e'); cyl(R * .55, R * .28, 2.8, -6.1, '#5a4636'); cyl(R * .28, R * .04, 3.2, -9.1, '#3a2e26');
  const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; return m;
}
// a ring of far mountains standing in the cloud sea
export function farMountains(rn, col = ['#2b3250', '#232a45', '#1c2238']) {
  const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  const N = 34; for (let i = 0; i < N; i++) {
    const a = i / N * TAU + rn() * .12, r = 46 + rn() * 34, s = 3 + rn() * 5, c = col[i % 3];
    const m = new THREE.Mesh(peakGeo(s, rn, [c, c, c]), mat); m.position.set(Math.cos(a) * r, -4.5 + rn() * 1.5, Math.sin(a) * r); m.rotation.y = rn() * 6; g.add(m);
  }
  g.userData.mat = mat; return g;
}
// puffy flat-shaded clouds. kind 'sea' lies below the island; 'storm' gathers above it
export function makeClouds(rn, n, o) {
  const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), m = new THREE.InstancedMesh(G.ico1, mat, n); m.frustumCulled = false; m.castShadow = false; m.receiveShadow = false;
  const col = new THREE.Color(), items = [], ob = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    const a = rn() * TAU, r0 = lerp(o.r0[0], o.r0[1], Math.pow(rn(), .7)), cl = rn(), s = lerp(o.s[0], o.s[1], rn());
    items.push({ a, r0, y: lerp(o.y[0], o.y[1], rn()), s, sy: .38 + rn() * .22, ph: rn() * 6, v: (rn() - .5) * .02, ox: rn() * 6 });
    m.setColorAt(i, col.set(o.cols[Math.floor(rn() * o.cols.length)]));
  }
  m.instanceColor.needsUpdate = true;
  // gather(a): 0 -> clouds sit at r0 (outer), 1 -> inner radius shrunk by 'pull'; vis: overall scale; gap(a): angular sector kept open
  function update(t, gather = 0, vis = 1, gap = null, lift = 0, cp = null, near = 14, tg = null, cl = 0) {
    items.forEach((c, i) => {
      const a = c.a + t * c.v, open = gap ? Math.max(0, Math.cos(a - gap.a)) : 0, rr = lerp(c.r0, c.r0 * o.pull, gather) + (gap ? gap.d * open * gather : 0);
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr, y = c.y + lift + Math.sin(t * .2 + c.ph) * .12 - gather * (o.sink || 0);
      const dd = cp ? Math.hypot(x - cp.x, y - cp.y, z - cp.z) : 999; let sc = c.s * vis * (1 + gather * (o.grow || 0)) * smooth(near * .45, near, dd);
      if (cp && tg) { const bx = tg[0] - cp.x, by = tg[1] - cp.y, bz = tg[2] - cp.z, u = clamp(((x - cp.x) * bx + (y - cp.y) * by + (z - cp.z) * bz) / (bx * bx + by * by + bz * bz)); if (u < .99) { const d2 = Math.hypot(x - cp.x - bx * u, y - cp.y - by * u, z - cp.z - bz * u); sc *= smooth(sc * .9, sc * 2.1 + .3, d2); } }
      if (cl && tg) sc *= smooth(cl * .72, cl, Math.hypot(x - tg[0], z - tg[2]));
      ob.position.set(x, y, z); ob.scale.set(sc, sc * c.sy, sc * .82); ob.rotation.set(0, c.ox + t * .01, 0); ob.updateMatrix(); m.setMatrixAt(i, ob.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }
  return { mesh: m, update, mat };
}
