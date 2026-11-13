// Episode 5: the golden thread. Ten floating islands, one for each generation of Genesis 5, strung along one luminous timeline.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, V3, pose, slab, spriteGlow, bits, put, bump, pool, ringMesh, shaft, SKINS } from './kit.js';
import { seg, ease, css, P } from './util.js';
import { pk, makeFigure, makeSheep, roundTreeGeo, pineGeo, oliveGeo, palmGeo, rockGeo, makeMotes } from './props.js';
import { W, H, CINZEL, SANS2 } from './fx2d.js';
import { F, S, sky } from './sky.js';

const TAU = Math.PI * 2, TH = -Math.PI / 6, CT = Math.cos(TH), ST = Math.sin(TH);
const ALONG = [0, 6.2, 12.4, 18.6, 24.9, 31.4, 38.0, 45.0, 52.2, 59.8];
export const WV = [0, 2.4, -2.2, 2.0, -2.4, 1.6, -2.2, 2.2, -1.8, 1.0];
export const NODE = ALONG.map((a, i) => { const w = WV[i]; return [F[0] * a + S[0] * w, F[1] * a + S[1] * w]; });
export const loc = (i, x, z) => [NODE[i][0] + x * CT + z * ST, NODE[i][1] - x * ST + z * CT];     // island-local (x right, z toward camera) -> world
const ANCH = 0.8;                                                                          // the thread crosses each island at local x = +0.8
export const anchor = i => loc(i, ANCH, 0);
// name, years lived (Genesis 5, NRSV-CE), radius, surface colour, the time the island rises
export const GEN = [
  { n: 'ADAM', y: 930, r: 2.0, top: '#667f46', rev: 0 },
  { n: 'SETH', y: 912, r: 1.9, top: '#6f8648', rev: 11.3 },
  { n: 'ENOSH', y: 905, r: 1.9, top: '#7f8a50', rev: 13.15 },
  { n: 'KENAN', y: 910, r: 1.9, top: '#7f7c4a', rev: 13.6 },
  { n: 'MAHALALEL', y: 895, r: 1.9, top: '#6f8a56', rev: 14.5 },
  { n: 'JARED', y: 962, r: 2.1, top: '#5f7f50', rev: 15.5 },
  { n: 'ENOCH', y: 365, r: 2.1, top: '#6c8a5a', rev: 22.6 },
  { n: 'METHUSELAH', y: 969, r: 2.7, top: '#7f7c4a', rev: 36.3 },
  { n: 'LAMECH', y: 777, r: 2.1, top: '#7c6e4a', rev: 42.3 },
  { n: 'NOAH', y: 0, r: 1.7, top: '#7a8a58', rev: 56.2 },
];
export const REV = GEN.map(g => g.rev);
const ROBES = ['#b8946a', '#8a5a3a', '#cdb88e', '#7a8a5a', '#a8603a', '#6c6a8a', '#d8c8a0', '#9a7a5a'], HAIRS = ['#2e1d10', '#3a2616', '#5a4128', '#1f160d'];

export function makeChain() {
  const R = rng(5050), group = new THREE.Group();
  const winMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  const fig = (o, sc = 1.0) => { const f = makeFigure({ robe: o.robe, robe2: o.robe2 || o.robe, skin: o.skin || pk(R, SKINS), hair: o.hair || pk(R, HAIRS), long: o.long, beard: o.beard, sash: o.sash, cloth: o.cloth, mantle: o.mantle, staff: o.staff, rn: rng(o.seed || 7) }); f.group.scale.setScalar(sc); f.sc = sc; return f; };
  const man = (seed, beard = '#3a2616', sc = 1.05) => fig({ robe: pk(R, ROBES), robe2: pk(R, ROBES), sash: '#5a3a20', beard, cloth: R() < .5 ? '#e8dcc0' : null, seed }, sc);
  const woman = (seed, sc = 1.0) => fig({ robe: pk(R, ROBES), robe2: pk(R, ROBES), long: true, hair: pk(R, HAIRS), seed }, sc);
  const kid = (seed, sc = .62) => fig({ robe: pk(R, ROBES), robe2: pk(R, ROBES), hair: pk(R, HAIRS), seed }, sc);
  // ---- scenery pieces (all in island-local coordinates)
  const tree = (g, kind, x, z, s) => { const geo = kind === 'pine' ? pineGeo(s, R) : kind === 'olive' ? oliveGeo(s, R) : kind === 'palm' ? palmGeo(s, R) : roundTreeGeo(s, R, kind === 'gold' ? ['#c9a548', '#b8943e', '#d8b85a', '#a88436'] : kind === 'dark' ? ['#4f7a40', '#46703a', '#5a8a46'] : null); const m = new THREE.Mesh(geo, lam); m.position.set(x, 0, z); m.rotation.y = R() * 6; m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  const hut = (g, x, z, ry, wall = '#d6c4a0', roof = '#8a5a3a', sc = 1) => {
    const lit = new GB(R), gl = new GB(R); lit.box(wall, [0, .3, 0], [.9, .6, .8], [0, 0, 0], .05); lit.add(new THREE.ConeGeometry(.7, .5, 4), roof, [0, .85, 0], [1, 1, 1], [0, Math.PI / 4, 0], .06); lit.box('#4a3424', [-.18, .22, .405], [.22, .44, .02], [0, 0, 0], .03); gl.box('#ffd27a', [.22, .34, .405], [.2, .2, .02], [0, 0, 0], .02);
    const a = new THREE.Mesh(lit.build(), lam), b = new THREE.Mesh(gl.build(), winMat); a.castShadow = a.receiveShadow = true; const h = new THREE.Group(); h.add(a, b); h.position.set(x, 0, z); h.rotation.y = ry; h.scale.setScalar(sc); g.add(h); return h;
  };
  const tent = (g, x, z, ry, col = '#c8a878') => { const gb = new GB(R); gb.add(new THREE.ConeGeometry(.72, 1.0, 5), col, [0, .5, 0], [1, 1, 1], [0, .3, 0], .07); gb.box('#3a2a1c', [0, .26, .55], [.2, .5, .03], [-.35, 0, 0], .02); const m = new THREE.Mesh(gb.build(), lam); m.position.set(x, 0, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  const rocks = (g, n, r0, r1, rr = [0, 6.28]) => { const gb = new GB(R); for (let k = 0; k < n; k++) { const a = lerp(rr[0], rr[1], R()), r = lerp(r0, r1, R()); gb.add(G.ico0, pk(R, ['#8f8b82', '#a39f95', '#77746c']), [Math.cos(a) * r, .05, Math.sin(a) * r], [.1 + R() * .14, .07 + R() * .06, .1 + R() * .12], [R() * 3, R() * 3, 0], .1); } const m = new THREE.Mesh(gb.build(), lam); m.castShadow = true; g.add(m); };
  const flowers = (g, n, r0, r1) => { const gb = new GB(R); for (let k = 0; k < n; k++) { const a = R() * TAU, r = lerp(r0, r1, R()); gb.add(G.ico0, pk(R, ['#f2c230', '#f5f0e6', '#e8a07a', '#c8a0d8']), [Math.cos(a) * r, .06, Math.sin(a) * r], [.045, .04, .045], [0, 0, 0], .05); } g.add(new THREE.Mesh(gb.build(), lam)); };
  const wheat = (g, x, z, w, d, rot = 0) => { const gb = new GB(R); for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) gb.box(pk(R, ['#e0b858', '#d8a84a', '#ecc86a']), [-w / 2 + i * w / 8 + (R() - .5) * .04, .13, -d / 2 + j * d / 4 + (R() - .5) * .04], [.06, .26 + R() * .06, .06], [0, 0, (R() - .5) * .2], .06); const m = new THREE.Mesh(gb.build(), lam); m.position.set(x, 0, z); m.rotation.y = rot; m.castShadow = true; g.add(m); };
  const furrows = (g, x, z, w, d) => { const gb = new GB(R); for (let j = 0; j < 7; j++) gb.box(j % 2 ? '#5a3c26' : '#7a5636', [0, .045, -d / 2 + j * d / 6], [w, .09, d / 8], [0, 0, 0], .06); const m = new THREE.Mesh(gb.build(), lam); m.position.set(x, 0, z); m.receiveShadow = true; g.add(m); };
  const vines = (g, x, z, w, d) => { const gb = new GB(R); for (let j = 0; j < 3; j++) { gb.box('#6a4a2c', [-w / 2, .22, -d / 2 + j * d / 2], [.05, .44, .05], [0, 0, 0], .04); gb.box('#6a4a2c', [w / 2, .22, -d / 2 + j * d / 2], [.05, .44, .05], [0, 0, 0], .04); for (let i = 0; i < 6; i++) gb.add(G.ico0, i % 3 === 0 ? '#6a3a6a' : '#5f9a46', [-w / 2 + i * w / 5, .3 + R() * .08, -d / 2 + j * d / 2], [.12, .1, .1], [R(), R(), 0], .08); } const m = new THREE.Mesh(gb.build(), lam); m.position.set(x, 0, z); m.castShadow = true; g.add(m); };
  const well = (g, x, z) => { const gb = new GB(R); gb.add(new THREE.CylinderGeometry(.3, .3, .3, 10), '#a39f95', [0, .15, 0], [1, 1, 1], [0, 0, 0], .06); gb.box('#6b4a2c', [-.28, .5, 0], [.05, .6, .05], [0, 0, 0], .03); gb.box('#6b4a2c', [.28, .5, 0], [.05, .6, .05], [0, 0, 0], .03); gb.box('#8a5a3a', [0, .85, 0], [.7, .06, .3], [0, 0, .12], .03); const m = new THREE.Mesh(gb.build(), lam); m.position.set(x, 0, z); m.castShadow = true; g.add(m); };
  const flames = [];
  const campfire = (g, x, z) => { const gb = new GB(R); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; gb.add(G.ico0, '#8a867c', [Math.cos(a) * .2, .04, Math.sin(a) * .2], [.07, .05, .07], [R(), R(), 0], .1); } const m = new THREE.Mesh(gb.build(), lam); m.position.set(x, 0, z); g.add(m);
    const fl = new THREE.Group(); fl.position.set(x, 0, z); for (const [dx, h, c] of [[0, .36, 0xffb030], [.06, .28, 0xff7a20], [-.06, .24, 0xffd860]]) { const c1 = new THREE.Mesh(G.cone5, new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); c1.scale.set(.1, h, .1); c1.position.set(dx, .06, 0); fl.add(c1); }
    g.add(fl); const gl = spriteGlow(x, .3, z, 1.8, 0xffa040, .5); g.add(gl); flames.push({ fl, gl }); };
  const sheep = (g, x, z, ry) => { const s = makeSheep(R); s.group.position.set(x, 0, z); s.group.rotation.y = ry; s.group.scale.setScalar(1.2); g.add(s.group); return s; };

  // ---- the islands
  const isl = [], fams = [];
  const IP = (f, x, z, ry, o = {}) => ({ f, x, z, ry, o });
  GEN.forEach((G_, i) => {
    const g = new THREE.Group(), sl = slab(R, G_.r, G_.top); g.add(sl); g.position.set(NODE[i][0], 0, NODE[i][1]); g.rotation.y = TH;
    const fm = []; const O = { g, i, fm, big: null, kids: [] };
    if (i === 0) { tree(g, 'round', -1.3, -.8, 1.25); tree(g, 'round', -.55, -1.4, 1.05); tree(g, 'round', 1.35, -.85, 1.15); tree(g, 'olive', 1.45, .75, .9); tent(g, -1.3, .75, .7); flowers(g, 14, .7, 1.7);
      fm.push(IP(man(11, '#4a3022', 1.15), -.25, 0, Math.PI, { adam: true }), IP(woman(12, 1.05), .55, -.2, Math.PI)); }
    if (i === 1) { hut(g, -1.2, -.8, .5); tree(g, 'pine', -.4, -1.5, 1.2); tree(g, 'pine', 1.3, -1.1, 1.05); sheep(g, 1.1, .8, -.6); sheep(g, 1.5, .25, .4); sheep(g, .7, 1.2, 1.4); flowers(g, 8, .8, 1.6);
      fm.push(IP(man(21, '#4a3426'), -.45, .1, 0), IP(woman(22), .2, .3, 0), IP(kid(23), -.1, .75, 0)); }
    if (i === 2) { wheat(g, -1.0, -.6, 1.3, 1.0, .2); hut(g, 1.2, -.95, -.4); tree(g, 'olive', -1.4, .9, 1.0); tree(g, 'olive', .9, -1.5, 1.1); flowers(g, 6, 1.0, 1.6);
      fm.push(IP(man(31, '#3a2616'), -.3, .3, 0), IP(woman(32), .35, .45, 0), IP(kid(33), -.8, .95, 0), IP(kid(34, .55), .8, 1.0, 0)); }
    if (i === 3) { well(g, -1.0, -.4); tree(g, 'palm', 1.35, -.9, 1.25); tree(g, 'palm', -1.45, .8, 1.1); tent(g, 1.2, .1, -.5, '#bfa070'); rocks(g, 6, 1.4, 1.8);
      fm.push(IP(man(41, '#5a4128'), -.3, .35, 0), IP(woman(42), .4, .4, 0), IP(kid(43), -.75, 1.0, 0)); }
    if (i === 4) { vines(g, -.4, -1.2, 1.8, 1.0); hut(g, 1.35, -.6, -.5, '#d8c8a8', '#7a4a30'); tree(g, 'round', -1.5, .5, 1.1); rocks(g, 6, 1.4, 1.75); flowers(g, 8, .8, 1.5);
      fm.push(IP(man(51, '#5a4a3a'), -.35, .4, 0), IP(woman(52), .3, .55, 0), IP(kid(53), -.9, 1.0, 0), IP(kid(54, .55), .9, 1.0, 0)); }
    if (i === 5) { campfire(g, 1.0, .6); hut(g, -1.3, -.9, .45); hut(g, .6, -1.4, -.2, '#cdb88e', '#8a5a3a', .9); tree(g, 'dark', -1.6, .7, 1.2); tree(g, 'pine', 1.5, -.8, 1.2);
      fm.push(IP(man(61, '#8a7a66'), -.5, .2, 0), IP(woman(62), .15, .45, 0), IP(kid(63), -.9, 1.0, 0), IP(kid(64, .55), -.1, 1.05, 0), IP(kid(65, .5), .5, 1.15, 0)); }
    if (i === 6) { const mound = new THREE.Mesh(new GB(R).add(G.ico1, '#86a474', [0, -.05, 0], [1.5, .3, 1.4], [0, .5, 0], .06).build(), lam); mound.receiveShadow = true; g.add(mound);
      tree(g, 'round', -1.2, -.9, 1.5); tent(g, -1.4, .55, .9, '#cdb88e'); rocks(g, 5, 1.5, 1.9); flowers(g, 10, .6, 1.5);
      fm.push(IP(fig({ robe: '#e9dfc6', robe2: '#f1e8d2', sash: '#a8844a', beard: '#cfc7b8', hair: '#d6cfc0', seed: 71 }, 1.12), .15, .1, Math.PI, { enoch: true })); }
    if (i === 7) { hut(g, -1.5, -1.0, .5, '#d8c8a8', '#7a4a30', 1.1); hut(g, 1.5, -1.2, -.4, '#cdb88e', '#8a5a3a', 1.0); hut(g, -1.9, .5, 1.1, '#d6c4a0', '#6a4a30', .95); tree(g, 'olive', 1.9, .8, 1.1); tree(g, 'palm', -.7, -1.8, 1.2); rocks(g, 8, 2.0, 2.45); flowers(g, 12, .7, 1.8);
      sheep(g, 1.4, 1.0, -.5); sheep(g, 1.0, 1.6, .6); sheep(g, -1.2, 1.4, 2);
      const bt = new THREE.Group(), bg = new GB(R); bg.add(G.cylT, '#7a5a3a', [0, 0, 0], [.2, 1.5, .2], [0, 0, 0], .06); for (const [x, y, z, s] of [[0, 1.7, 0, .9], [.5, 1.45, .15, .6], [-.5, 1.5, -.1, .6], [.1, 2.15, 0, .55], [-.2, 1.9, .4, .5]]) bg.add(G.ico1, pk(R, ['#7a9a52', '#6a8a46', '#8aaa5e']), [x, y, z], [s, s * .85, s], [R(), R(), 0], .08);
      const bm = new THREE.Mesh(bg.build(), lam); bm.castShadow = bm.receiveShadow = true; bt.add(bm); bt.position.set(.5, 0, -1.35); g.add(bt); O.big = bt;
      const m1 = man(81, '#e4e0d6', 1.12), kA = kid(83, .6), kB = kid(84, .55); O.kids = [kA, kB];
      fm.push(IP(m1, -.45, .15, 0, { elder: true }), IP(woman(82, 1.0), .25, .3, 0), IP(man(85, '#2e1d10', 1.0), -1.0, .85, 0), IP(woman(86, .98), .85, .75, 0), IP(kA, -.2, .95, 0, { grow: true }), IP(kB, .6, 1.15, 0, { grow: true })); }
    if (i === 8) { furrows(g, 1.15, -.35, 1.3, 1.6); hut(g, -1.35, -1.05, .5, '#cdb88e', '#7a4a30'); campfire(g, -.85, .75); tree(g, 'dark', -1.7, .3, 1.0); sheep(g, 1.35, 1.25, 2.4); sheep(g, .95, 1.5, 3.4); rocks(g, 5, 1.6, 1.95);
      const hg = new GB(R); hg.box('#6b4a2c', [0, .35, 0], [.04, .7, .04], [0, 0, 0], .04); hg.box('#8a929a', [.11, .67, 0], [.24, .06, .08], [0, 0, 0], .04); const hoe = new THREE.Mesh(hg.build(), lam); hoe.position.set(.75, 0, .55); hoe.rotation.set(.05, .3, -.28); g.add(hoe);
      const lam_ = fig({ robe: '#9c7a52', robe2: '#ad8c62', sash: '#6a4a2a', beard: '#cfc8b8', cloth: '#efe4cc', seed: 91 }, 1.32); const baby = new THREE.Group(), bb = new GB(R); bb.box('#f4e8cc', [0, 0, 0], [.17, .13, .36], [0, 0, 0], .03); bb.add(G.ico0, '#f2cfa6', [0, .02, .2], [.075, .075, .075], [0, 0, 0], .02); bb.box('#e8d6a8', [0, .035, -.02], [.18, .02, .2], [0, 0, 0], .02);
      baby.add(new THREE.Mesh(bb.build(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }))); baby.position.set(0, .64, .36); lam_.group.add(baby); O.baby = baby;
      fm.push(IP(lam_, .1, .6, -.3, { lamech: true })); }
    if (i === 9) { tree(g, 'round', .2, -.2, .7); tent(g, -.9, .3, .6, '#cdb88e'); flowers(g, 6, .6, 1.2); }
    fm.forEach(p => g.add(p.f.group)); g.visible = false; group.add(g); isl.push(O); fams.push(fm);
  });
  // ---- node markers: a ring on the thread at every island, a soft pool of light, and a lantern glow
  const mk = GEN.map((G_, i) => { const a = anchor(i), ring = ringMesh(.62, .08, 0xffd070, 0), ring2 = ringMesh(1, .07, 0xffe6a0, 0), pl = pool(1.25, 0xffc060, 0), gl = spriteGlow(a[0], 1.0, a[1], 3.0, 0xffc060, 0); [ring, ring2, pl].forEach(m => { m.position.set(a[0], .1, a[1]); }); ring2.position.y = .11; group.add(ring, ring2, pl, gl); return { ring, ring2, pl, gl }; });

  // ---- the thread: one ribbon of light that runs through every island and on over the horizon
  const pts = []; GEN.forEach((_, i) => { const a = anchor(i); pts.push(V3(a[0], .16, a[1])); if (i < 9) { const b = anchor(i + 1); pts.push(V3((a[0] + b[0]) / 2, .58, (a[1] + b[1]) / 2)); } });
  const a9 = anchor(9); pts.push(V3(a9[0] + F[0] * 8, .9, a9[1] + F[1] * 8), V3(a9[0] + F[0] * 22 + S[0] * .8, 1.6, a9[1] + F[1] * 22 + S[1] * .8), V3(a9[0] + F[0] * 42, 2.6, a9[1] + F[1] * 42));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), NS = 1200, LEN = curve.getLength(), pos = [], tan = [];
  for (let j = 0; j <= NS; j++) { pos.push(curve.getPointAt(j / NS)); tan.push(curve.getTangentAt(j / NS)); }
  const nodeJ = GEN.map((_, i) => { const a = anchor(i); let bj = 0, bd = 1e9; pos.forEach((p, j) => { const d = Math.hypot(p.x - a[0], p.z - a[1]); if (d < bd) { bd = d; bj = j; } }); return bj; });
  const ribbon = (w, op) => {
    const g = new THREE.BufferGeometry(), p = new Float32Array((NS + 1) * 6), c = new Float32Array((NS + 1) * 6), idx = [];
    for (let j = 0; j <= NS; j++) { const q = pos[j], t = tan[j], nx = -t.z, nz = t.x, nl = Math.hypot(nx, nz) || 1; p.set([q.x + nx / nl * w, q.y, q.z + nz / nl * w, q.x - nx / nl * w, q.y, q.z - nz / nl * w], j * 6); if (j < NS) idx.push(2 * j, 2 * j + 1, 2 * j + 2, 2 * j + 1, 2 * j + 3, 2 * j + 2); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); m.frustumCulled = false; m.renderOrder = 3; m.userData.c = c; return m;
  };
  const core = ribbon(.075, 1), halo = ribbon(.34, .32); group.add(core, halo);
  const head = spriteGlow(0, .3, 0, 1.6, 0xffe2a0, 0); group.add(head);
  const headAt = t => ease.inOutSine(seg(t, 1.0, 8.6));
  const pulseTrack = t => 7 * Math.min(t, 22) + 2.6 * clamp(t - 22, 0, 13) + 4.5 * Math.max(0, t - 35);   // pulse distance travelled: slows through Enoch's walk
  const litOf = (m, t) => { if (m >= 9) return smooth(54.5, 57, t); return smooth(REV[m + 1] - .5, REV[m + 1] + .7, t); };
  // ---- Enoch's luminous path: steps of light rising into the sky
  const E = isl[6], enochP = fams[6][0], eDir = [-.47, -.88], NT = 14, E0 = [ANCH, 0];
  const tileP = i => [E0[0] + eDir[0] * (1.45 + .8 * i), .12 + .46 * i, E0[1] + eDir[1] * (1.45 + .8 * i)];
  const tiles = bits(NT, G.box, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquationAlpha: THREE.AddEquation, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor, depthWrite: false, toneMapped: false })); tiles.frustumCulled = false; E.g.add(tiles);
  const tg = [], tc = new THREE.Color(); for (let i = 0; i < NT; i++) { const p = tileP(i); put(tiles, i, p[0], p[1], p[2], .95, .1, .72, 0, Math.atan2(-eDir[0], -eDir[1]), 0); tiles.setColorAt(i, tc.setRGB(0, 0, 0)); const s = spriteGlow(p[0], p[1] + .1, p[2], 1.3, 0xffd890, 0); E.g.add(s); tg.push(s); }
  tiles.instanceMatrix.needsUpdate = true; tiles.instanceColor.needsUpdate = true;
  const endP = tileP(NT - 1), pillar = shaft(16, .55, 1.1, [1, .86, .55], .04, .8), bigGl = spriteGlow(endP[0], endP[1] + 1.4, endP[2], 9, 0xffe0a0, 0), radiant = spriteGlow(endP[0], endP[1] + .6, endP[2], 3, 0xffe2a8, 0);
  pillar.position.set(endP[0], endP[1] - 1, endP[2]); E.g.add(pillar, bigGl, radiant);
  const glowFig = (() => { const c = enochP.f.group.clone(true), gm = new THREE.MeshBasicMaterial({ color: 0xffe9b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }); c.traverse(o => { if (o.isMesh) { o.material = gm; o.castShadow = false; } }); E.g.add(c); return { group: c, arms: [c.children[1], c.children[2]], sc: enochP.f.sc, gm }; })();
  const NP = 70, sparks = bits(NP, G.tet, new THREE.MeshBasicMaterial({ color: 0xffe6a8, toneMapped: false })); E.g.add(sparks); const SPK = Array.from({ length: NP }, () => ({ a: R() * TAU, v: .3 + R() * 1.1, up: .6 + R() * 2.4, s: .03 + R() * .05, d: R() * .5 })); sparks.visible = false;
  const walkAt = t => ease.inOutSine(seg(t, 24.9, 29.0));
  const pathXYZ = q => { const d = lerp(.55, 1.45 + .8 * (NT - 2), q), y = d < 1.0 ? .04 + (d - .55) * .2 : .12 + (d - 1.45) * .575; return [E0[0] + eDir[0] * d, Math.max(.04, y + .0), E0[1] + eDir[1] * d]; };
  // ---- Lamech and the newborn
  const L = fams[8][0], baby = isl[8].baby;
  const babyGl = spriteGlow(0, .64, .36, 1.3, 0xffd08a, 0); L.f.group.add(babyGl); babyGl.scale.set(1.3 / L.f.sc, 1.3 / L.f.sc, 1);
  const fw = loc(8, -.85, .75), fireL = new THREE.PointLight(0xff9a50, 0, 5, 2); fireL.position.set(fw[0], 1.3, fw[1]); group.add(fireL);
  // ---- distant sea of cloud, drifting rocks and far mountains
  const cloudG = new GB(R); for (let k = 0; k < 64; k++) { const a = R() * 100 - 14, side = (R() - .5) * 2, lat = Math.sign(side) * (4.5 + Math.pow(Math.abs(side), 1.2) * 22), cx_ = F[0] * a + S[0] * lat, cz_ = F[1] * a + S[1] * lat, y = -5.6 + (R() - .5) * 1.0, n = 4 + Math.floor(R() * 3), cc = pk(R, ['#8e8ab0', '#7f7ca6', '#9c98ba', '#7a78a2']); for (let q = 0; q < n; q++) cloudG.add(G.ico1, cc, [cx_ + (q - n / 2) * 1.5 + (R() - .5) * .8, y + (R() - .5) * .2, cz_ + (R() - .5) * 1.2], [1.5 + R() * 1.2, .26 + R() * .16, 1.1 + R() * .8], [0, R() * 3, 0], .1); }
  const clouds = new THREE.Mesh(cloudG.build(), lam); clouds.receiveShadow = true; group.add(clouds);
  const rkG = new GB(R); for (let k = 0; k < 26; k++) { const a = -6 + R() * 70, side = (R() - .5) * 2, lat = Math.sign(side) * (6 + R() * 18), y = -1.5 + (R() - .3) * 6; const px = F[0] * a + S[0] * lat, pz = F[1] * a + S[1] * lat, s = .3 + R() * .8; rkG.add(G.ico0, pk(R, ['#3a3f5e', '#4a4660', '#2e3452', '#564a62']), [px, y, pz], [s, s * .7, s], [R(), R(), 0], .12); rkG.add(G.cone5, pk(R, ['#34395a', '#423e5a']), [px, y - s * .6, pz], [s * .8, s * 1.4, s * .8], [Math.PI, 0, 0], .12); }
  const rocksM = new THREE.Mesh(rkG.build(), lam); group.add(rocksM);
  const mtG = new GB(R); for (let k = 0; k < 16; k++) { const lat = (k - 7.5) * 6.5 + (R() - .5) * 3, a = 96 + R() * 10, px = F[0] * a + S[0] * lat, pz = F[1] * a + S[1] * lat, h = 7 + R() * 9; mtG.add(G.cone6, pk(R, ['#3a3a66', '#46446e', '#323660', '#524a78']), [px, -5.2, pz], [4 + R() * 4, h, 4 + R() * 4], [0, R() * 3, 0], .1); }
  group.add(new THREE.Mesh(mtG.build(), lam));
  const motes = makeMotes({ n: 130, area: [18, 8, 18], size: .05, v: .22, seed: 61, color: 0xffd47a }); group.add(motes.mesh);

  const reveal = (i, t) => ease.outBack(seg(t, REV[i], REV[i] + 1.2));
  const dimK = (i, t) => (i >= 7 ? 0 : smooth(45.2 + i * .12, 47.4 + i * .1, t) * (i === 6 ? .0 : 1));      // "each life reached its end": the older lights settle, the thread stays lit
  function update(t, camera) {
    const sk = sky(t), nk = 1 - sk.day * .85;
    // islands rise
    isl.forEach((O, i) => { const k = i === 0 ? 1 : reveal(i, t), g = O.g; g.visible = t >= REV[i] - .02; if (!g.visible) return; g.position.y = -3.2 * (1 - clamp(k, 0, 1.15)); g.scale.setScalar(.72 + .28 * clamp(k, 0, 1.1)); });
    winMat.color.setScalar(.25 + .75 * clamp(sk.night * 1.3));
    // node markers
    mk.forEach((m, i) => { const lv = smooth(REV[i] - .1, REV[i] + 1.0, t) * (1 - .62 * dimK(i, t)), br = .75 + .25 * Math.sin(t * 2.2 + i); m.ring.material.opacity = .85 * lv * br; m.pl.material.opacity = .35 * lv; m.gl.material.opacity = .26 * lv * br;
      const u = t - REV[i] - .5; m.ring2.visible = u > 0 && u < 1.8; if (m.ring2.visible) { const kk = u / 1.8; m.ring2.scale.setScalar(.4 + 2.6 * ease.outCubic(kk)); m.ring2.material.opacity = .8 * (1 - kk) * (1 - kk); } });
    // the thread
    const hp = headAt(t), vis = Math.floor(hp * NS), cc = core.userData.c, ch = halo.userData.c, trav = pulseTrack(t);
    core.geometry.setDrawRange(0, Math.max(0, vis) * 6); halo.geometry.setDrawRange(0, Math.max(0, vis) * 6);
    for (let j = 0; j <= NS; j++) {
      let m = 0; while (m < 9 && j >= nodeJ[m + 1]) m++; const u = j / NS, lit = litOf(m, t) * (1 - .0 * dimK(m, t)), arc = u * LEN;
      let pl = 0; const gap = 8.5, dd = ((arc - trav) % gap + gap) % gap, dist = Math.min(dd, gap - dd); pl = Math.exp(-(dist * dist) / .9) * lit * smooth(9.4, 11, t);
      const b = (.5 + .5 * lit) * (j / NS < hp ? 1 : 0), k = .55 + .45 * pl;
      cc[j * 6] = cc[j * 6 + 3] = 1.0 * b * k; cc[j * 6 + 1] = cc[j * 6 + 4] = (.60 + .30 * pl) * b * k; cc[j * 6 + 2] = cc[j * 6 + 5] = (.14 + .50 * pl) * b * k;
      ch[j * 6] = ch[j * 6 + 3] = .95 * b * (.5 + .9 * pl); ch[j * 6 + 1] = ch[j * 6 + 4] = .50 * b * (.5 + .9 * pl); ch[j * 6 + 2] = ch[j * 6 + 5] = .10 * b * (.5 + .9 * pl);
    }
    core.geometry.attributes.color.needsUpdate = true; halo.geometry.attributes.color.needsUpdate = true;
    const hj = clamp(Math.floor(hp * NS), 0, NS), hpP = pos[hj]; head.position.set(hpP.x, hpP.y + .15, hpP.z); head.material.opacity = .9 * smooth(1.0, 1.4, t) * (1 - smooth(8.2, 9.2, t)); head.scale.setScalar(1.6 + .3 * Math.sin(t * 9));
    // flames
    fireL.intensity = .8 * clamp(sk.night * 1.2) * smooth(47, 48.5, t) * (.9 + .1 * Math.sin(t * 12));
    flames.forEach(f => { f.fl.scale.set(1, .85 + .25 * Math.sin(t * 13 + f.fl.position.x), 1); f.gl.material.opacity = (.2 + .35 * sk.night) * (.85 + .15 * Math.sin(t * 11)); });
    // families: gentle life
    fams.forEach((fm, i) => { if (!isl[i].g.visible) return; fm.forEach((p, q) => {
      const o = p.o, f = p.f, ph = i * 1.7 + q * 2.3, sway = .025 * Math.sin(t * 1.3 + ph);
      if (o.enoch || o.lamech) return;
      let ry = p.ry, a1x = 0, a0x = 0, s = 1, y = .04, lx = sway;
      if (o.adam) { const turn = smooth(8.6, 10.2, t); ry = lerp(Math.PI, -.3, turn); a1x = -.5 * turn * Math.max(0, Math.sin((t - 10) * 1.2)); }
      else if (i === 0 && q === 1) { ry = lerp(Math.PI, .3, smooth(9.0, 10.4, t)); }
      else { ry = p.ry + .25 * Math.sin(t * .5 + ph) * (q % 2 ? 1 : -1); a1x = q === 0 ? -.35 * Math.max(0, Math.sin(t * .9 + ph)) : 0; }
      if (o.grow) s = lerp(1, 1.6, smooth(36.4, 47, t)); if (o.elder) { lx = .06 + sway; }
      if (f.sc < .7 && !o.grow) y += Math.abs(Math.sin(t * 2.6 + ph)) * .03;
      pose(f, p.x, y, p.z, ry, { lx, a0x, a1x, a0z: -.1, a1z: .1, s });
    }); });
    if (isl[7].big) isl[7].big.scale.setScalar(lerp(.62, 1.22, smooth(36.4, 47.2, t)));
    // ---- Enoch: stands, walks the path of light, becomes light
    {
      const q = walkAt(t), P_ = pathXYZ(q), walking = t > 24.9 && t < 29.1, st = Math.sin(t * 9.5);
      const dis = smooth(29.0, 29.55, t), fade = 1 - dis, up = seg(t, 29.3, 31.6);
      const sx = Math.max(.001, fade), ry = Math.atan2(-eDir[0], -eDir[1]);
      const baseX = ANCH - .0, bx = t < 24.9 ? 0 : P_[0], bz = t < 24.9 ? 0 : P_[2];
      const ex = t < 24.9 ? .15 : P_[0], ey = t < 24.9 ? .04 : P_[1] + .04 + (walking ? Math.abs(st) * .035 : 0), ez = t < 24.9 ? .1 : P_[2];
      const turn = smooth(24.3, 24.9, t), eRy = lerp(Math.PI, ry, turn);
      const pp = { lx: .08 * turn + .02 * Math.sin(t * 1.3), a0x: walking ? .5 * st : 0, a1x: walking ? -.5 * st : 0, a0z: -.1, a1z: .1 };
      pose(enochP.f, ex, ey, ez, eRy, { ...pp, s: fade > .02 ? 1 : .001, sx: sx });
      pose(glowFig, ex, ey + up * 1.6, ez, eRy, { ...pp, s: 1.05 + up * 1.2, sx: lerp(1.1, .25, up) });
      glowFig.gm.opacity = smooth(28.0, 29.2, t) * (1 - seg(t, 29.9, 31.8)); glowFig.group.visible = glowFig.gm.opacity > .01;
      // tiles light as he steps on them, and the whole path wakes before he starts
      const wake = smooth(23.6, 25.0, t), tvis = t < 34 ? 1 : lerp(1, smooth(9, 15, camera.w), smooth(34, 36, t)); for (let i = 0; i < NT; i++) { const reach = (i + 1) / NT, stepped = smooth(reach - .05, reach + .05, q) , br = (.42 * wake + .58 * stepped) * (.8 + .2 * smooth(30, 32, t)) * (1 - .88 * smooth(33.5, 36.5, t)) * tvis; tiles.setColorAt(i, tc.setRGB(1.0 * br, (.84 - .12 * smooth(33.5, 36.5, t)) * br, (.5 - .1 * smooth(33.5, 36.5, t)) * br)); tg[i].material.opacity = .3 * br; }
      tiles.instanceColor.needsUpdate = true;
      const pk_ = smooth(28.2, 29.4, t) * (1 - smooth(32.5, 35, t) * .5); pillar.material.opacity = .4 * smooth(28.4, 30.0, t) * (1 - smooth(33, 36, t) * .55); bigGl.material.opacity = .28 * pk_; radiant.material.opacity = .4 * smooth(28.6, 29.6, t) * (1 - smooth(31.5, 34, t) * .6); radiant.scale.setScalar(2.4 + 1.2 * smooth(29, 31, t));
      sparks.visible = t > 29.0 && t < 35; if (sparks.visible) { const u0 = t - 29.2; for (let i = 0; i < NP; i++) { const s = SPK[i], uu = Math.max(0, u0 - s.d), f2 = 1 - smooth(2.6, 4.6, uu); put(sparks, i, ex + Math.cos(s.a + uu) * s.v * uu * .5, ey + .5 + s.up * uu, ez + Math.sin(s.a + uu) * s.v * uu * .5, s.s * f2, s.s * f2, s.s * f2, uu * 4 + i, uu * 3, 0); } sparks.instanceMatrix.needsUpdate = true; }
    }
    // ---- Lamech holds the newborn
    {
      const f = L.f, lift = smooth(51.0, 53.4, t) * (1 - smooth(55.6, 57.6, t)), sw = .02 * Math.sin(t * 1.1), turn = -.3 + .1 * Math.sin(t * .4);
      pose(f, L.x, .04, L.z, turn, { lx: -.04 * lift + sw, a0x: -1.1 - .45 * lift, a1x: -1.1 - .45 * lift, a0z: .12, a1z: -.12 });
      baby.visible = true; baby.position.y = .64 + .0; babyGl.material.opacity = smooth(48.2, 50.0, t) * (.7 + .3 * Math.sin(t * 2.1)) * .55;
      baby.position.set(0, .66 + .06 * lift, .36 + .02 * lift); baby.rotation.x = -.1 - .2 * lift;
    }
    motes.update(t, .9, [camera ? camera.T[0] : 0, -2, camera ? camera.T[2] : 0]);
    return sk;
  }
  // ---- name plates drawn over the 3D view
  const PL = GEN.map((g, i) => ({ i, a: g.rev + .35 + (i === 0 ? 1.6 : 0), side: i % 2 ? 1 : -1 }));
  const PLW = [ [3.7, 99], [11.6, 99], [13.4, 99], [13.8, 99], [14.75, 99], [15.8, 99], [23.2, 99], [37.4, 99], [43.0, 99], [56.6, 99] ];
  function plates(cx, t, proj, cam) {
    const sc = clamp(9.5 / cam.w, .66, 1.18), closeK = smooth(5.4, 7.2, cam.w);
    GEN.forEach((g, i) => {
      const a = ease.outCubic(seg(t, PLW[i][0], PLW[i][0] + .9)) * closeK; if (a <= .01) return;
      const an = anchor(i), P1 = proj(V3(an[0], .15, an[1])); let side = WV[i] >= 0 ? -1 : 1; const H0 = 128 * sc, x = P1[0], y0 = P1[1] - H0 * (.7 + .3 * a); if (x < -30 || x > W + 30 || y0 < -60 || y0 > H + 60) return;
      const dim = i < 6 ? 1 - .45 * smooth(45.4 + i * .1, 47.2, t) : 1;
      cx.save(); cx.globalAlpha = a * (.55 + .45 * dim); cx.textAlign = side > 0 ? 'left' : 'right';
      const nameSz = (g.n.length > 8 ? 44 : 52) * sc; cx.font = `700 ${nameSz}px ${CINZEL}`; cx.letterSpacing = `${nameSz * .1}px`; const nw = cx.measureText(g.n).width;
      const sub = g.n === 'NOAH' ? 'FATHER OF SHEM, HAM AND JAPHETH' : 'LIVED ' + g.y + ' YEARS'; cx.font = `600 ${24 * sc}px ${SANS2}`; cx.letterSpacing = `${4.5 * sc}px`; const sw = cx.measureText(sub).width;
      const tw_ = Math.max(nw, sw) + 26 * sc; if (x + side * tw_ > W - 18 || x + side * tw_ < 18) { side = -side; cx.textAlign = side > 0 ? 'left' : 'right'; } const x1 = x + side * tw_;
      // soft dark backing so the lettering stays crisp on any sky
      cx.save(); cx.translate((x + x1) / 2, y0 - 6 * sc); cx.scale(1, .5); const bw = tw_ * .95, gr = cx.createRadialGradient(0, 0, 10, 0, 0, bw); gr.addColorStop(0, 'rgba(4,8,22,.55)'); gr.addColorStop(1, 'rgba(4,8,22,0)'); cx.fillStyle = gr; cx.fillRect(-bw, -bw, bw * 2, bw * 2); cx.restore();
      // stem, diamond, tick
      const sg = cx.createLinearGradient(0, y0, 0, P1[1]); sg.addColorStop(0, 'rgba(255,222,150,.95)'); sg.addColorStop(1, 'rgba(255,200,110,.55)'); cx.strokeStyle = sg; cx.lineWidth = 2.4 * sc; cx.beginPath(); cx.moveTo(x, P1[1]); cx.lineTo(x, y0); cx.lineTo(x1, y0); cx.stroke();
      cx.fillStyle = 'rgba(255,232,170,.95)'; cx.save(); cx.translate(x, y0); cx.rotate(Math.PI / 4); cx.fillRect(-5 * sc, -5 * sc, 10 * sc, 10 * sc); cx.restore();
      cx.shadowColor = 'rgba(2,5,16,.9)'; cx.shadowBlur = 14; cx.font = `700 ${nameSz}px ${CINZEL}`; cx.letterSpacing = `${nameSz * .1}px`; cx.fillStyle = css(P.cream); const tx = x + side * 14 * sc; cx.fillText(g.n, tx, y0 - 12 * sc);
      cx.shadowBlur = 8; cx.font = `600 ${24 * sc}px ${SANS2}`; cx.letterSpacing = `${4.5 * sc}px`; cx.fillStyle = css(P.goldHi); cx.fillText(sub, tx, y0 + 30 * sc);
      if (g.n === 'NOAH') { cx.fillText('NOAH WAS 500 YEARS OLD', tx, y0 + 62 * sc); }
      cx.restore();
    });
    // the newborn's name, written beside him
    const nt = ease.outCubic(seg(t, 48.9, 49.9)) * (1 - ease.inOutSine(seg(t, 53.6, 54.8)));
    if (nt > .01) { const f = isl[8].baby, wp = new THREE.Vector3(); f.getWorldPosition(wp); const bp = proj(wp), bx = bp[0], by = bp[1];
      cx.save(); cx.globalAlpha = nt; cx.textAlign = 'left';
      cx.strokeStyle = 'rgba(255,222,150,.9)'; cx.lineWidth = 2.4; cx.beginPath(); cx.moveTo(bx + 24, by - 14); cx.lineTo(bx + 120, by - 112); cx.lineTo(bx + 330, by - 112); cx.stroke();
      cx.fillStyle = 'rgba(255,232,170,.95)'; cx.save(); cx.translate(bx + 24, by - 14); cx.rotate(Math.PI / 4); cx.fillRect(-5, -5, 10, 10); cx.restore();
      cx.save(); cx.translate(bx + 220, by - 128); cx.scale(1, .5); const gr = cx.createRadialGradient(0, 0, 10, 0, 0, 240); gr.addColorStop(0, 'rgba(4,8,22,.55)'); gr.addColorStop(1, 'rgba(4,8,22,0)'); cx.fillStyle = gr; cx.fillRect(-240, -240, 480, 480); cx.restore();
      cx.shadowColor = 'rgba(2,5,16,.9)'; cx.shadowBlur = 14; cx.font = `700 70px ${CINZEL}`; cx.letterSpacing = '7px'; cx.fillStyle = css(P.cream); cx.fillText('NOAH', bx + 132, by - 126);
      cx.shadowBlur = 8; cx.font = `600 25px ${SANS2}`; cx.letterSpacing = '4.5px'; cx.fillStyle = css(P.goldHi); cx.fillText('SON OF LAMECH', bx + 134, by - 78); cx.restore(); }
  }
  return { group, update, plates, isl, fams, NODE, enochP, tileP, endP, glowFig, E, pathXYZ };
}
