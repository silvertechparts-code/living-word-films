// The ark: 300 x 50 x 30 cubits (1 cubit = 0.05 world units) -> 15 x 2.5 x 1.5. Every plank, rib, deck board, partition and roof board is an instance with its own birth time,
// so the whole construction is a pure function of film time. Long axis = z, bay 0 is the +z (south) end, the door is in the -x side.
import * as THREE from 'three';
import { GB, G } from './geo.js';
import { rng, lerp, clamp, smooth, seg, ease } from './util.js';
import { lam } from './flora.js';

export const AK = { L: 15, W: 2.5, H: 1.5, Y0: .3, NB: 15, ROWS: 7 };
const { L, W, H, Y0, NB, ROWS } = AK, BAY = L / NB, RH = H / ROWS;
export const zr = i => L / 2 - i * BAY, zb = i => L / 2 - (i + .5) * BAY;
const WOOD = ['#b98b55', '#a97c48', '#c49a62', '#9c7040', '#b58450', '#c2915a'], FRAME = ['#8a6238', '#7a5630', '#946a3e'], DECK = ['#a98050', '#b48a56', '#9c7646'], PITCH = '#2a2018';
export const T_ARK = { keel: 36.0, ribs: 37.8, floor1: 37.0, hull: 41.0, deck2: 42.5, deck3: 45.0, parts: 43.0, door: 44.2, ramp: 47.0, roof: 50.2 };

export function makeArk(rn) {
  const group = new THREE.Group(), P = [];
  const add = (o) => { P.push(Object.assign({ rx: 0, ry: 0, rz: 0, dur: .7, off: [0, .8, 0], grow: false }, o)); };
  const jit = (c, k = .07) => { const col = new THREE.Color(c), j = 1 + (rn() - .5) * 2 * k; return col.multiplyScalar(j); };
  // --- timber blocks and keel
  for (let i = 0; i < 9; i++) add({ x: 0, y: .14, z: zr(i * 1.9) - .0, sx: 1.7, sy: .28, sz: .34, tb: 35.2 + i * .08, dur: .5, off: [0, .5, 0], col: jit('#5a4630', .1), ctl: 0 });
  for (let i = 0; i < NB; i++) {
    add({ x: 0, y: Y0 - .03, z: zb(i), sx: .3, sy: .17, sz: BAY - .015, tb: T_ARK.keel + i * .09, col: jit(FRAME[i % 3]), off: [0, .7, 0] });
    for (const s of [-1, 1]) add({ x: s * .72, y: Y0 + .03, z: zb(i), sx: .11, sy: .09, sz: BAY - .015, tb: T_ARK.keel + .3 + i * .09, col: jit(FRAME[(i + 1) % 3]), off: [s * .4, .6, 0] });
  }
  // --- ribs (posts) and deck beams
  for (let i = 0; i <= NB; i++) {
    for (const s of [-1, 1]) add({ x: s * (W / 2 - .04), y: Y0 + H / 2, z: zr(i), sx: .075, sy: H, sz: .075, tb: T_ARK.ribs + i * .22 + (s > 0 ? .06 : 0), dur: .75, grow: true, off: [0, 0, 0], col: jit(FRAME[(i + (s > 0)) % 3]) });
    for (const lv of [1, 2, 3]) add({ x: 0, y: Y0 + (lv === 3 ? H : lv * .5) - .03, z: zr(i), sx: W - .02, sy: .07, sz: .09, tb: T_ARK.ribs + 1.0 + i * .2 + lv * .35, dur: .6, off: [0, .6, 0], col: jit(FRAME[(i + lv) % 3]) });
  }
  // --- deck boards (three decks)
  for (const [d, t0] of [[0, T_ARK.floor1], [1, T_ARK.deck2], [2, T_ARK.deck3]]) for (let j = 0; j < 30; j++) if (!(d >= 1 && L / 2 - .25 - j * .5 > -.6 && L / 2 - .25 - j * .5 < 2.6)) add({ x: 0, y: Y0 + .06 + .5 * d, z: L / 2 - .25 - j * .5, sx: W - .13, sy: .04, sz: .46, tb: t0 + j * .075 + rn() * .1, dur: .6, off: [0, .5, 0], col: jit(DECK[j % 3], .09) });
  // --- partitions: the compartments
  [3, 6, 9, 12].forEach((ri, q) => { for (let d = 0; d < 3; d++) add({ x: 0, y: Y0 + .5 * d + .31, z: zr(ri), sx: W - .13, sy: .46, sz: .045, tb: T_ARK.parts + d * .55 + q * .32 + rn() * .15, dur: .7, off: [0, .5, 0], col: jit('#a47c4a', .1) }); });
  // --- hull planks: each bay carries two boards, rows climb from the keel, the hull is pitched from the bottom up
  for (const s of [-1, 1]) for (let k = 0; k < ROWS; k++) for (let i = 0; i < NB; i++) {
    if (s < 0 && i === 6 && k < 4) continue;                          // the door in the side
    const f = .38 + rn() * .26, l1 = BAY * f - .012, l2 = BAY * (1 - f) - .012, zc = zb(i);
    const tb = T_ARK.hull + .62 * k + .24 * i + rn() * .22, pitched = k < 2;
    [[zc + BAY / 2 - l1 / 2 - .005, l1], [zc - BAY / 2 + l2 / 2 + .005, l2]].forEach(([z, len], h) => add({ x: s * (W / 2 + .03), y: Y0 + RH * (k + .5), z, sx: .06, sy: RH - .014, sz: len, tb: tb + h * .05, dur: .7, off: [s * .5, .8, 0], col: jit(WOOD[(k + i + h) % WOOD.length], .08), col2: pitched ? new THREE.Color(PITCH) : null, tc0: 46.0 + .17 * i, tc1: 47.4 + .17 * i }));
  }
  for (let k = 0; k < ROWS; k++) for (const [z, kk, t0] of [[L / 2 + .03, true, T_ARK.hull + .62 * k], [-L / 2 - .03, true, T_ARK.hull + .62 * k + NB * .24 + .2]]) if (kk) for (const h of [-1, 1]) add({ x: h * (W / 4 - .005), y: Y0 + RH * (k + .5), z, sx: W / 2 - .02, sy: RH - .014, sz: .06, tb: t0 + (h > 0 ? .06 : 0) + rn() * .1, dur: .7, off: [0, .8, h * .0], col: jit(WOOD[(k + h + 3) % WOOD.length], .08), col2: k < 2 ? new THREE.Color(PITCH) : null, tc0: z > 0 ? 46.0 : 48.8, tc1: z > 0 ? 47.4 : 50.0 });
  // --- door: frame and leaf, ramp with cleats
  for (const z of [zb(6) + .5, zb(6) - .5]) add({ x: -(W / 2 + .045), y: Y0 + .46, z, sx: .09, sy: .93, sz: .09, tb: T_ARK.door, dur: .6, off: [-.3, .4, 0], col: jit('#4a3220', .05) });
  add({ x: -(W / 2 + .045), y: Y0 + .93, z: zb(6), sx: .09, sy: .08, sz: 1.12, tb: T_ARK.door + .3, dur: .6, off: [-.3, .4, 0], col: jit('#4a3220', .05) });
  const th = Math.atan((Y0 + .03) / 1.75);
  add({ x: -(W / 2 + .03) - .87, y: (.05 + Y0 + .07) / 2, z: zb(6), sx: 1.8, sy: .05, sz: .62, rz: th, tb: T_ARK.ramp, dur: .9, off: [-.6, .8, 0], col: jit('#9c7646', .05) });
  for (let c = 0; c < 6; c++) { const xx = -(W / 2 + .03) - .17 - c * .27; add({ x: xx, y: .06 + (Y0 + .02) * (1 - (-(W / 2 + .03) - xx) / 1.75) + .05, z: zb(6), sx: .05, sy: .03, sz: .56, rz: th, tb: T_ARK.ramp + .5 + c * .08, dur: .4, off: [0, .3, 0], col: jit('#6a4a2c', .05) }); }
  // --- roof: rafters from the bow backwards, boards only over the bow half
  const sl = Math.atan(.24 / (W / 2 + .05));
  for (let i = 15; i >= 0; i--) {
    const tb = T_ARK.roof + (15 - i) * .4;
    for (const s of [-1, 1]) add({ x: s * .66, y: Y0 + H + .13, z: zr(i), sx: 1.36, sy: .06, sz: .075, rz: -s * sl, tb: tb + (s > 0 ? .08 : 0), dur: .7, off: [0, .8, 0], col: jit(FRAME[i % 3]) });
    if (i < 15) add({ x: 0, y: Y0 + H + .255, z: zr(i) - BAY / 2, sx: .09, sy: .07, sz: BAY, tb: tb + .3, dur: .6, off: [0, .6, 0], col: jit(FRAME[(i + 1) % 3]) });
  }
  for (let i = 14; i >= 0; i--) for (const s of [-1, 1]) for (let q = 0; q < 4; q++) add({ x: s * ((W / 2 + .05) - (q + .5) * (W / 2 + .05) / 4), y: Y0 + H + .24 * (q + .5) / 4 + .045, z: zb(i), sx: .36, sy: .035, sz: BAY - .02, rz: -s * sl, tb: 52.0 + (14 - i) * .5 + q * .14 + (s > 0 ? .06 : 0) + rn() * .08, dur: .7, off: [s * .3, .8, 0], col: jit(WOOD[(i + q) % WOOD.length], .08) });

  const n = P.length, mat = new THREE.MeshLambertMaterial({ color: 0xffffff }), mesh = new THREE.InstancedMesh(G.box, mat, n); mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true;
  const ob = new THREE.Object3D(), col = new THREE.Color();
  P.forEach((p, i) => mesh.setColorAt(i, p.col)); mesh.instanceColor.needsUpdate = true;
  group.add(mesh);
  // --- the door leaf: hinged on the +z edge, swings outward (-x) when open; angle 0 = closed
  const doorPivot = new THREE.Group(); doorPivot.position.set(-(W / 2 + .045), Y0 - .02, zb(6) + .47); group.add(doorPivot);
  { const d = new GB(rn); for (let k = 0; k < 4; k++) d.box(jit('#8a6238', .08).getStyle ? '#8a6238' : '#8a6238', [0, .11 + k * .22, -.465], [.05, .215, .93], [0, 0, 0], .08);
    for (const y of [.14, .72]) d.box('#3a2a1c', [-.03, y, -.465], [.025, .07, .93], [0, 0, 0], .03); d.box('#2a2018', [-.04, .42, -.82], [.04, .06, .06], [0, 0, 0], .02);
    const m = new THREE.Mesh(d.build(), lam); m.castShadow = true; m.receiveShadow = true; doorPivot.add(m); }
  const setDoor = a => { doorPivot.rotation.y = a; };
  // --- stowage just inside the door (food and water), a lantern hook
  const gb = new GB(rn);
  for (const [x, z, y, s2] of [[-.95, 1.9, .4, 1], [-.95, 2.25, .4, .9], [-.8, 2.1, .62, .85], [-.95, -.2, .4, 1], [-1.0, -.55, .4, .9], [.7, 2.0, .4, 1], [.95, 1.7, .4, .9]]) { gb.add(G.ico1, '#b09a6a', [x, y + .1, z], [.17 * s2, .2 * s2, .15 * s2], [0, rn() * 3, 0], .06); gb.add(G.ico0, '#8a7448', [x, y + .3 * s2, z], [.07, .05, .07], [0, 0, 0], .05); }
  for (const [x, z] of [[.95, .1], [1.0, -.3], [-.9, 3.4]]) { gb.add(G.cylT, '#7a5a38', [x, .36, z], [.14, .3, .14], [0, 0, 0], .05); gb.box('#2a2018', [x, .5, z], [.3, .02, .3], [0, 0, 0], 0); }
  const stow = new THREE.Mesh(gb.build(), lam); stow.castShadow = true; stow.receiveShadow = true; group.add(stow);

  // --- lamplight leaking between the hull boards once the door is shut (a design choice, not in the text): thin warm slits along both sides, just under the roof
  const slitG = new GB(rn);
  for (const s of [-1, 1]) for (let i = 0; i < NB; i++) { if (s < 0 && i === 6) continue; for (const o of [-.26, .26]) slitG.box('#ffc474', [s * (W / 2 + .075), Y0 + RH * 5.5, zb(i) + o * BAY], [.022, .055, BAY * .26], [0, 0, 0], 0); }
  const slitMat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, transparent: true, opacity: 0 }), slits = new THREE.Mesh(slitG.build(), slitMat); slits.renderOrder = 2; group.add(slits);

  let lastT = -1;
  function update(t) {
    slitMat.opacity = .92 * smooth(34.3, 37.0, t) * (1 - .35 * smooth(75, 79, t)) * (.94 + .06 * Math.sin(t * 3.1));
    if (t === lastT) return; lastT = t;
    for (let i = 0; i < n; i++) {
      const p = P[i];
      if (t < p.tb) { ob.scale.set(0, 0, 0); ob.position.set(0, -50, 0); ob.updateMatrix(); mesh.setMatrixAt(i, ob.matrix); continue; }
      const u = clamp((t - p.tb) / p.dur), e = ease.outCubic(u), k = 1 - e;
      if (p.grow) { const sy = Math.max(.001, p.sy * e); ob.position.set(p.x, Y0 + sy / 2, p.z); ob.scale.set(p.sx, sy, p.sz); ob.rotation.set(0, 0, 0); }
      else { ob.position.set(p.x + p.off[0] * k, p.y + p.off[1] * k, p.z + p.off[2] * k); ob.scale.set(p.sx, p.sy, p.sz); ob.rotation.set(p.rx, p.ry + k * .12 * (i % 2 ? 1 : -1), p.rz + k * .05); }
      ob.updateMatrix(); mesh.setMatrixAt(i, ob.matrix);
      if (p.col2) { const c = smooth(p.tc0, p.tc1, t); col.copy(p.col).lerp(p.col2, c); mesh.setColorAt(i, col); }
    }
    mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
  }
  return { group, update, count: n, setDoor, doorPivot, slitMat };
}
