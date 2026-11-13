import * as THREE from 'three';
import { GB, G, bake } from './geo.js';
import { rng, seg, ease, lerp, clamp, smooth } from './util.js';
import { lam } from './flora.js';
export { lam };

export const pk = (rn, arr) => arr[Math.floor(rn() * arr.length) % arr.length];
export const basicV = () => new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
export const addMat = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// raw triangle into a GB (flat colour, small per-face jitter)
export function tri(gb, a, b, c, col, jit = .05) {
  const base = new THREE.Color(col), j = 1 + (gb.rnd() - .5) * 2 * jit;
  for (const v of [a, b, c]) { gb.p.push(v[0], v[1], v[2]); gb.c.push(base.r * j, base.g * j, base.b * j); }
}
// faceted terrain patch centred on origin. hf(x,z)->y ; col(cx,cy,cz,slope,rn)->hex
export function patch(o) {
  const { w, d, nx, nz, hf, col, rn } = o, jx = o.jit ?? .35, V = [];
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) {
    const edge = i === 0 || j === 0 || i === nx || j === nz;
    const x = -w / 2 + i * w / nx + (edge ? 0 : (rn() - .5) * w / nx * jx), z = -d / 2 + j * d / nz + (edge ? 0 : (rn() - .5) * d / nz * jx);
    V.push([x, hf(x, z), z]);
  }
  const gb = o.gb || new GB(rn), id = (i, j) => i * (nz + 1) + j, A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  const put = (p, q, r) => {
    A.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); B.set(r[0] - p[0], r[1] - p[1], r[2] - p[2]); C.crossVectors(A, B);
    if (C.y < 0) { const t = q; q = r; r = t; C.negate(); }
    C.normalize(); const cx = (p[0] + q[0] + r[0]) / 3, cy = (p[1] + q[1] + r[1]) / 3, cz = (p[2] + q[2] + r[2]) / 3;
    tri(gb, p, q, r, col(cx, cy, cz, 1 - C.y, rn), o.cj ?? .06);
  };
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const a = V[id(i, j)], b = V[id(i + 1, j)], c = V[id(i + 1, j + 1)], d2 = V[id(i, j + 1)];
    if ((i + j) & 1) { put(a, b, c); put(a, c, d2); } else { put(a, b, d2); put(b, c, d2); }
  }
  return o.gb ? o.gb : gb.build();
}
export function litMesh(geo, shadow = true, recv = true) { const m = new THREE.Mesh(geo, lam); m.castShadow = shadow; m.receiveShadow = recv; m.frustumCulled = false; return m; }

// animated faceted sea
export function makeSea(o = {}) {
  const w = o.w || 40, d = o.d || 40, n = o.n || 30, rn = rng(o.seed || 9), base = new THREE.Color(o.base || '#1f7a96'), crest = new THREE.Color(o.crest || '#c8eef0'), deep = new THREE.Color(o.deep || '#0d3f58');
  const M = n * n * 2, pos = new Float32Array(M * 9), col = new Float32Array(M * 9), cell = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let h = 0; h < 2; h++) { const jj = 1 + (rn() - .5) * .3, k = rn(); cell.push({ i, j, h, jj, k }); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: o.shine ?? 70, specular: o.spec ?? 0x8fb8c8, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false; mesh.receiveShadow = true;
  const sx = w / n, sz = d / n, c = new THREE.Color();
  const H = (x, z, t, amp, sp) => amp * (Math.sin(x * .55 + t * sp) * Math.cos(z * .45 - t * sp * .8) + .5 * Math.sin((x + z) * .95 + t * sp * 1.7) + .25 * Math.sin(x * 1.9 - z * 1.3 + t * sp * 2.3));
  function update(t, amp = .2, sp = 1.2, foam = 0) {
    cell.forEach((q, m) => {
      const x0 = -w / 2 + q.i * sx, x1 = x0 + sx, z0 = -d / 2 + q.j * sz, z1 = z0 + sz;
      const P = [[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]]; P.forEach(p => p[1] = H(p[0], p[2], t, amp, sp));
      const T = (q.i + q.j) & 1 ? (q.h ? [0, 2, 3] : [0, 1, 2]) : (q.h ? [1, 2, 3] : [0, 1, 3]);
      const hy = (P[T[0]][1] + P[T[1]][1] + P[T[2]][1]) / 3;
      for (let v = 0; v < 3; v++) { const p = P[T[v]]; pos[m * 9 + v * 3] = p[0]; pos[m * 9 + v * 3 + 1] = p[1]; pos[m * 9 + v * 3 + 2] = p[2]; }
      const kk = clamp(.5 + hy / (amp * 3 + .001) * .9); c.copy(deep).lerp(base, clamp(kk * 1.4)); if (kk > .8 - foam * .3 && q.k < .3 + foam * .5) c.lerp(crest, .55 + foam * .3);
      for (let v = 0; v < 3; v++) { col[m * 9 + v * 3] = c.r * q.jj; col[m * 9 + v * 3 + 1] = c.g * q.jj; col[m * 9 + v * 3 + 2] = c.b * q.jj; }
    });
    g.attributes.position.needsUpdate = g.attributes.color.needsUpdate = true; g.computeVertexNormals();
  }
  return { mesh, update, H };
}

// ---------- people
export function makeFigure(o = {}) {
  const rn = o.rn || rng(o.seed || 3), g = new THREE.Group(), b = new GB(rn);
  const robe = o.robe || '#d9ccb0', robe2 = o.robe2 || robe, skin = o.skin || '#c98d62', hair = o.hair || '#3a2616';
  b.add(G.cylT, robe, [0, 0, 0], [.21, .66, .21], [0, 0, 0], .06);
  b.add(G.cylT, robe2, [0, .5, 0], [.17, .4, .14], [0, 0, 0], .05);
  b.box(robe2, [0, .86, 0], [.38, .1, .18], [0, 0, 0], .04);
  if (o.sash) b.box(o.sash, [0, .5, 0], [.27, .06, .2], [0, 0, 0], .02);
  if (o.mantle) { b.box(o.mantle, [0, .5, -.1], [.34, .78, .05], [.05, 0, 0], .05); b.box(o.mantle, [0, .87, 0], [.42, .08, .22], [0, 0, 0], .04); }
  b.add(G.cyl6, skin, [0, .88, 0], [.04, .08, .04], [0, 0, 0], .02);
  b.add(G.ico1, skin, [0, 1.0, 0], [.1, .115, .1], [0, 0, 0], .05);
  if (o.cloth) { b.add(G.ico1, o.cloth, [0, 1.04, -.01], [.125, .12, .125], [0, 0, 0], .05); b.box(o.cloth, [0, .92, -.07], [.2, .26, .06], [.18, 0, 0], .05); }
  else b.add(G.ico0, hair, [0, 1.05, -.025], [.108, .075, .11], [0, 0, 0], .06);
  if (o.beard) b.add(G.ico0, o.beard, [0, .94, .045], [.07, .09, .06], [0, 0, 0], .05);
  if (o.long) b.box(hair, [0, .88, -.075], [.17, .3, .07], [.1, 0, 0], .05);
  const body = new THREE.Mesh(b.build(), lam); body.castShadow = true; body.receiveShadow = true; g.add(body);
  const arms = [];
  for (const s of [-1, 1]) { const a = new GB(rn); a.box(robe2, [0, -.21, 0], [.07, .42, .07], [0, 0, 0], .04); a.add(G.ico0, skin, [0, -.43, 0], [.04, .04, .04], [0, 0, 0], .03); const m = new THREE.Mesh(a.build(), lam); m.castShadow = true; m.position.set(.21 * s, .86, 0); g.add(m); arms.push(m); }
  let halo = null;
  if (o.halo) { halo = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .012, 18), new THREE.MeshBasicMaterial({ color: 0xffd36a, toneMapped: false })); halo.rotation.x = Math.PI / 2 - .12; halo.position.set(0, 1.04, -.12); g.add(halo); }
  let staff = null;
  if (o.staff) { const s = new GB(rn); s.box('#6b4a2c', [0, .7, 0], [.035, 1.5, .035], [0, 0, 0], .05); s.add(G.ico0, '#5a3a20', [0, 1.45, 0], [.05, .05, .05], [0, 0, 0], .05); staff = new THREE.Mesh(s.build(), lam); staff.castShadow = true; g.add(staff); staff.position.set(.34, 0, .05); }
  g.userData = { arms, body, staff, halo };
  return { group: g, arms, body, staff, halo };
}
// person with a face-less look but proportion options for crowds
export function crowdPalette(rn) { const robes = ['#b5654a', '#c9a15a', '#5e7fa6', '#8a9a6a', '#cfc2a0', '#a2564e', '#6c5a8a', '#d9b36a']; return { robe: pk(rn, robes), robe2: pk(rn, robes), skin: pk(rn, ['#c98d62', '#b57a50', '#d9a073', '#9c6a42']), hair: pk(rn, ['#2e1d10', '#3a2616', '#1f160d', '#5a4128']), cloth: rn() < .45 ? pk(rn, ['#efe4cc', '#d9ccb0', '#c9b88a']) : null }; }

// ---------- animals
export function makeQuad(o) {
  const rn = o.rn || rng(5), g = new THREE.Group(), b = new GB(rn), L = o.legL, y0 = L;
  b.box(o.col, [0, y0 + o.h / 2, 0], [o.len, o.h, o.w], [0, 0, 0], .06);
  if (o.col2) b.box(o.col2, [0, y0 + o.h * .15, 0], [o.len * .92, o.h * .3, o.w * .95], [0, 0, 0], .05);
  const nl = o.neck[0], na = o.neck[1], nx = o.len / 2 - .04, ny = y0 + o.h * .85;
  b.box(o.col, [nx + Math.sin(-na) * nl * .5 * -1, ny + Math.cos(na) * nl * .5, 0], [o.neck[2] || .12, nl, o.neck[2] || .12], [0, 0, na], .05);
  const hx = nx + Math.sin(-na) * nl * -1, hy = ny + Math.cos(na) * nl;
  b.box(o.col, [hx + o.head[0] * .35, hy, 0], [o.head[0], o.head[1], o.head[2]], [0, 0, -.18], .05);
  b.box('#3a2a1c', [hx + o.head[0] * .85, hy - .02, 0], [o.head[0] * .22, o.head[1] * .7, o.head[2] * .8], [0, 0, 0], .03);
  if (o.hump) b.add(G.ico0, o.col, [-.05 * o.len, y0 + o.h + .06, 0], [o.len * .13, .15, o.w * .55], [0, 0, 0], .06);
  if (o.ears) for (const s of [-1, 1]) b.box(o.col, [hx + o.head[0] * .1, hy + o.head[1] * .75, .06 * s * (o.head[2] / .14)], [.04, .2, .05], [.25 * s, 0, 0], .05);
  if (o.horns) for (const s of [-1, 1]) b.add(G.cone5, '#f0e8d4', [hx + .02, hy + o.head[1] * .5, .09 * s], [.025, .13, .025], [.9 * s, 0, 0], .03);
  b.box(o.col2 || o.col, [-o.len / 2 - .02, y0 + o.h * .65, 0], [.04, o.h * .7, .04], [0, 0, .15], .04);
  const body = new THREE.Mesh(b.build(), lam); body.castShadow = true; body.receiveShadow = true; g.add(body);
  const legs = []; const lx = o.len / 2 - .12, lz = o.w / 2 - .04;
  for (const [x, z] of [[lx, lz], [lx, -lz], [-lx, lz], [-lx, -lz]]) { const gl = new GB(rn); gl.box(o.legCol || o.col2 || o.col, [0, -L / 2, 0], [o.legW, L, o.legW], [0, 0, 0], .06); const m = new THREE.Mesh(gl.build(), lam); m.position.set(x, L, z); m.castShadow = true; g.add(m); legs.push(m); }
  return { group: g, legs, body };
}
export const makeCamel = rn => makeQuad({ rn, len: 1.05, h: .42, w: .3, legL: .72, legW: .07, col: '#c89a5a', col2: '#a97c44', neck: [.62, .62, .12], head: [.26, .13, .12], hump: true, ears: false });
export const makeDonkey = rn => makeQuad({ rn, len: .78, h: .3, w: .22, legL: .42, legW: .05, col: '#8c8378', col2: '#d8d0c0', neck: [.26, .7, .1], head: [.26, .13, .1], ears: true });
export const makeOx = rn => makeQuad({ rn, len: .88, h: .38, w: .3, legL: .38, legW: .075, col: '#8a5a38', col2: '#caa27a', neck: [.2, .9, .16], head: [.26, .18, .18], horns: true });
export const makeSheep = rn => makeQuad({ rn, len: .46, h: .24, w: .2, legL: .2, legW: .04, col: '#f1ece0', col2: '#d8d0bc', neck: [.12, .9, .08], head: [.16, .1, .09], ears: false, legCol: '#3a2e26' });
export function walkLegs(legs, t, sp = 5, amp = .45) { const s = Math.sin(t * sp) * amp; legs.forEach((l, i) => l.rotation.z = (i === 1 || i === 2 ? -s : s)); }

// ---------- plants / rocks / buildings
export function pineGeo(s, rn) { const gb = new GB(rn), gs = ['#2c6a2c', '#347a30', '#3f8a36', '#2a5f2a']; gb.add(G.cyl6, '#6b4a2c', [0, 0, 0], [.07 * s, .3 * s, .07 * s]); for (let k = 0; k < 3; k++) gb.add(G.cone7, pk(rn, gs), [0, (.16 + .34 * k) * s, 0], [(.52 - .12 * k) * s, .6 * s, (.52 - .12 * k) * s], [0, rn() * 3, 0], .1); return gb.build(); }
export function roundTreeGeo(s, rn, cols) { const gb = new GB(rn), gs = cols || ['#6aa84f', '#5c9b3f', '#7cba58', '#4f8f3a']; gb.add(G.cylT, '#7a5230', [0, 0, 0], [.1 * s, .62 * s, .1 * s]); gb.add(G.ico1, pk(rn, gs), [0, .88 * s, 0], [.5 * s, .44 * s, .5 * s], [rn(), rn(), 0]); gb.add(G.ico0, pk(rn, gs), [.28 * s, .72 * s, .08 * s], [.3 * s, .28 * s, .3 * s], [rn(), rn(), 0]); gb.add(G.ico0, pk(rn, gs), [-.26 * s, .74 * s, -.1 * s], [.28 * s, .26 * s, .28 * s], [rn(), rn(), 0]); return gb.build(); }
export function oliveGeo(s, rn) { return roundTreeGeo(s, rn, ['#8a9a6a', '#a3b27e', '#7a8b5c', '#b4bf8e']); }
export function palmGeo(s, rn) {
  const gb = new GB(rn); let x = 0, y = 0; for (let k = 0; k < 5; k++) { gb.box('#8a6238', [x, y + .17 * s, 0], [.11 * s, .36 * s, .11 * s], [0, 0, -.12 * k * .3], .06); x += .03 * s * (k + 1) * .5; y += .34 * s; }
  for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283; gb.add(G.cone5, k % 2 ? '#4f8f3a' : '#6aa84f', [x + Math.cos(a) * .22 * s, y + .02 * s, Math.sin(a) * .22 * s], [.09 * s, .6 * s, .2 * s], [0, -a + 1.571, Math.PI / 2 + .55], .08); }
  return gb.build();
}
export function rockGeo(s, rn, cols) { const gb = new GB(rn), gs = cols || ['#8f8b82', '#a39f95', '#77746c']; gb.add(G.ico0, pk(rn, gs), [0, .08 * s, 0], [.22 * s, .15 * s, .19 * s], [rn() * 3, rn() * 3, 0], .1); if (rn() < .6) gb.add(G.ico0, pk(rn, gs), [.18 * s, .05 * s, .07 * s], [.12 * s, .09 * s, .1 * s], [rn() * 3, rn() * 3, 0], .1); return gb.build(); }
export function peakGeo(s, rn, cols, snow) { const gb = new GB(rn), gs = cols || ['#8b8478', '#a39b8c', '#6f695e']; gb.add(G.cone6, pk(rn, gs), [0, 0, 0], [.9 * s, 1.6 * s, .9 * s], [0, rn() * 3, 0], .12); gb.add(G.cone5, pk(rn, gs), [.5 * s, 0, .2 * s], [.55 * s, 1.0 * s, .55 * s], [0, rn() * 3, 0], .12); if (snow) gb.add(G.cone6, '#f4f7f7', [0, 1.18 * s, 0], [.34 * s, .45 * s, .34 * s], [0, rn() * 3, 0], .06); return gb.build(); }

// a mixed lit/glow builder: lit parts are Lambert, glow parts are unlit gold
export class Pair {
  constructor(rn) { this.lit = new GB(rn); this.glow = new GB(rn); this.rn = rn; }
  mesh(shadow = true) { const g = new THREE.Group(); const a = new THREE.Mesh(this.lit.build(), lam); a.castShadow = shadow; a.receiveShadow = true; g.add(a); if (this.glow.p.length) g.add(new THREE.Mesh(this.glow.build(), basicV())); return g; }
}
export function houseParts(pr, x, z, w, d, h, o = {}) {
  const wall = o.wall || '#e3d3ae', roof = o.roof || '#d8c79a', lit = pr.lit, gl = pr.glow, ry = o.ry || 0;
  const y0 = o.y0 || 0, R = (px, py, pz) => { const c = Math.cos(ry), s = Math.sin(ry); return [x + px * c + pz * s, py + y0, z - px * s + pz * c]; };
  lit.box(wall, R(0, h / 2, 0), [w, h, d], [0, ry, 0], .05); lit.box(roof, R(0, h + .03, 0), [w * 1.08, .07, d * 1.08], [0, ry, 0], .04);
  if (o.dome) lit.add(G.ico1, roof, R(0, h + .02, 0), [w * .36, w * .3, w * .36], [0, ry, 0], .04);
  gl.box(o.win || '#ffd27a', R(w * .22, h * .55, d / 2 + .004), [w * .16, h * .28, .01], [0, ry, 0], .02);
  lit.box('#4a3a2a', R(-w * .18, h * .32, d / 2 + .004), [w * .2, h * .6, .012], [0, ry, 0], .03);
}
export function starGeometry(rn, a = '#ffe38c', b = '#b06f1a', depth = .26) {
  const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const an = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .42 : 1; i ? sh.lineTo(Math.cos(an) * r, Math.sin(an) * r) : sh.moveTo(Math.cos(an) * r, Math.sin(an) * r); }
  const eg = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: .07, bevelSize: .06, bevelSegments: 1 }); eg.translate(0, 0, -depth / 2);
  return bake(eg, a, b, [-.55, .6, .9], .26, rn, 0, 1);
}
export function sunGeometry(rn, a = '#ffeb8a', b = '#b4560c') { return bake(G.ico1, a, b, [-.55, .65, .75], .5, rn, .08, 1.0); }

// ---------- fx
export function fadeCone(h, r0, r1, c = [1, .78, .36], pw = 1.5) { const g = new THREE.CylinderGeometry(r1, r0, h, 28, 1, true); g.translate(0, h / 2, 0); const p = g.attributes.position, cc = []; for (let i = 0; i < p.count; i++) { const f = Math.pow(1 - p.getY(i) / h, pw); cc.push(c[0] * f, c[1] * f, c[2] * f); } g.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3)); return g; }
export const glowMat = (op = 1) => new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
export function makeMotes(o = {}) {
  const R = rng(o.seed || 4), n = o.n || 120, area = o.area || [10, 8, 10], g = new THREE.InstancedMesh(G.tet, addMat(o.color || 0xffd47a, .95), n); g.frustumCulled = false; g.renderOrder = 8;
  const pts = []; for (let i = 0; i < n; i++) pts.push({ x: (R() - .5) * area[0], y0: R() * area[1], z: (R() - .5) * area[2], v: (o.v || .4) * (.4 + R()), s: (o.size || .05) * (.3 + R()), ph: R() * 6 });
  const ob = new THREE.Object3D();
  function update(t, k = 1, off = [0, 0, 0]) { g.visible = k > .003; if (!g.visible) return; pts.forEach((p, i) => { const y = ((p.y0 + p.v * t) % area[1] + area[1]) % area[1]; ob.position.set(off[0] + p.x + Math.sin(t * .7 + p.ph) * .25, off[1] + y, off[2] + p.z + Math.cos(t * .6 + p.ph) * .25); ob.scale.setScalar(p.s * k * (.55 + .45 * Math.sin(t * 4 + p.ph))); ob.rotation.set(t + p.ph, t * .7, 0); ob.updateMatrix(); g.setMatrixAt(i, ob.matrix); }); g.instanceMatrix.needsUpdate = true; }
  return { mesh: g, update };
}
export function makeRain(o = {}) {
  const R = rng(o.seed || 8), n = o.n || 260, area = o.area || [14, 12, 14], gm = new THREE.BoxGeometry(.025, .7, .025), g = new THREE.InstancedMesh(gm, addMat(0xbfd4ff, .55), n); g.frustumCulled = false; g.renderOrder = 9;
  const pts = []; for (let i = 0; i < n; i++) pts.push({ x: (R() - .5) * area[0], y0: R() * area[1], z: (R() - .5) * area[2], v: 11 + R() * 5 });
  const ob = new THREE.Object3D();
  function update(t, k = 1, off = [0, 0, 0]) { g.visible = k > .003; if (!g.visible) return; pts.forEach((p, i) => { const y = area[1] - (((p.v * t + p.y0) % area[1])); ob.position.set(off[0] + p.x + (area[1] - y) * .12, off[1] + y, off[2] + p.z); ob.rotation.set(0, 0, .12); ob.scale.set(1, k, 1); ob.updateMatrix(); g.setMatrixAt(i, ob.matrix); }); g.instanceMatrix.needsUpdate = true; }
  return { mesh: g, update };
}
export function makeCubeField(o = {}) {
  const R = rng(o.seed || 6), N = o.n || 220, geo = new THREE.BoxGeometry(1, 1, 1), mat = new THREE.MeshLambertMaterial({ color: 0xffffff }), m = new THREE.InstancedMesh(geo, mat, N); m.frustumCulled = false;
  const col = new THREE.Color(), ob = new THREE.Object3D(), items = [];
  for (let i = 0; i < N; i++) {
    const r = (o.rmin || 4) + Math.pow(R(), 1.3) * ((o.rmax || 24) - (o.rmin || 4)), th = R() * 6.283, y = (R() - .5) * (o.yspan || 14) + (o.y0 || 0), s = .18 + Math.pow(R(), 3) * (o.smax || 1.3);
    col.setHSL(.6 + R() * .06, .3 + R() * .25, .035 + R() * .09); m.setColorAt(i, col);
    items.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r, s, rx: R() * 6, ry: R() * 6, sp: (R() - .5) * .3, ph: R() * 6 });
  }
  m.instanceColor.needsUpdate = true;
  const A = new THREE.Vector3(), Bv = new THREE.Vector3(), Cv = new THREE.Vector3();
  function update(t, cam, tgt) { if (cam) { A.copy(cam.position); Bv.set(tgt[0], tgt[1], tgt[2]); } items.forEach((c, i) => { ob.position.set(c.x, c.y + Math.sin(t * .3 + c.ph) * .25, c.z); ob.rotation.set(c.rx + c.sp * t, c.ry + c.sp * t * .7, 0); let k = 1; if (cam) { Cv.set(c.x - A.x, c.y - A.y, c.z - A.z); const ab = Bv.clone().sub(A), tt = clamp(Cv.dot(ab) / ab.lengthSq(), 0, 1), px = A.x + ab.x * tt - c.x, py = A.y + ab.y * tt - c.y, pz = A.z + ab.z * tt - c.z, d = Math.hypot(px, py, pz) - c.s * .9; k = tt > .98 ? 1 : smooth(.8, 3.6, d); } ob.scale.setScalar(Math.max(.0001, c.s * k)); ob.updateMatrix(); m.setMatrixAt(i, ob.matrix); }); m.instanceMatrix.needsUpdate = true; }
  update(0); return { mesh: m, update };
}
