// Episode 9: Genesis 9. The ark stands on the mountain after the flood; God blesses Noah's family and makes the covenant; the bow in the clouds;
// Noah's vineyard, the tent, the cloak carried backward by Shem and Japheth; Noah's words; the bow stays in the sky.
// Colour note: the three brothers share one skin tone on purpose (this episode contains the passage that has been misused to justify racism).
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, person, pose, shaft, spriteGlow } from './kit.js';
import { seg, ease, keyed } from './util.js';
import { pk, makeQuad, makeMotes, roundTreeGeo, pineGeo, oliveGeo, peakGeo } from './props.js';
import { build as buildWild, makeBird } from './fauna6.js';
import { buildTerrain, underRock, makeClouds, Hf, ARK8, TAU } from './terrain8.js';
import { makeArk } from './ark.js';
import { makeWater, makeRain } from './flood.js';
import { LK } from './lights.js';
import { NOAH, SONS, WIVES } from './world.js';
import { gy, AY0 } from './world8.js';

// ---------------- the timeline of the story events (seconds on the episode clock); retimed from the real narration clips
export const EV = {
  noahArmsUp: [13.4, 14.2, 19.6, 20.6],        // covenant: arms rise, hold, fall
  bowIn: [21.6, 26.0],                          // the bow forms (reveal start, reveal end)
  walkToVine: [27.6, 30.6],                     // the men walk to the vineyard
  plant: [31.0, 33.0],                          // Noah plants (kneels)
  drink: [33.4, 35.2],                          // the cup
  toTent: [35.2, 37.0],                         // Noah walks to the tent and goes in
  hamGo: [36.6, 38.6], hamLook: [38.6, 39.6], hamBack: [39.6, 41.6],
  cloakUp: [41.0, 41.9], backwalk: [41.9, 44.6], // Shem and Japheth with the cloak
  noahOut: [46.0, 47.6], noahRaise: [47.6, 48.2, 50.4, 51.2],
};

const D2R = Math.PI / 180;
function farMountains(rn) {
  const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#2b3250', '#232a45', '#1c2238'], N = 26;
  for (let i = 0; i < N; i++) {
    const a = -Math.PI / 2 + (i / (N - 1) - .5) * Math.PI * 1.5 + (rn() - .5) * .12, r = 54 + rn() * 34, s = 3.4 + rn() * 4.4, c = cols[i % 3];
    const m = new THREE.Mesh(peakGeo(s, rn, [c, c, c], false), mat); m.scale.set(2.9 + rn() * .8, 1.05 + rn() * .3, 2.0 + rn() * .6); m.position.set(Math.cos(a) * r, -3.6 + rn() * 1.0, Math.sin(a) * r); m.rotation.y = rn() * 6; g.add(m);
  }
  g.userData.mat = mat; return g;
}

// the bow in the clouds: seven concentric half rings in a vertical plane that always turns to face the camera
export function makeBow(R0 = 11.2, bw = .34) {
  const g = new THREE.Group(), cols = ['#e8503c', '#f08c3e', '#f4d64c', '#76c66e', '#4aa6de', '#5468cc', '#8e5cc4'], arcs = [], SEG = 84;
  cols.forEach((c, i) => {
    const geo = new THREE.RingGeometry(R0 - (i + 1) * bw, R0 - i * bw + .01, SEG, 1, 0, Math.PI);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
    m.renderOrder = 3; m.frustumCulled = false; g.add(m); arcs.push(m);
  });
  // a soft wide glow band behind the colours
  const glow = new THREE.Mesh(new THREE.RingGeometry(R0 - 7 * bw - .5, R0 + .5, SEG, 1, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  glow.renderOrder = 2; glow.frustumCulled = false; g.add(glow); arcs.push(glow);
  const SEGN = SEG * 6;
  function set(u, op, camPos, center) {
    arcs.forEach((m, i) => { const last = i === arcs.length - 1; m.geometry.setDrawRange(0, Math.max(0, Math.floor(clamp(u) * SEG)) * 6); m.material.opacity = op * (last ? .22 : 1) * (last ? 1 : (.82 + .18 * Math.sin(i))); });
    g.visible = op > .003 && u > .001;
    if (camPos) g.rotation.y = Math.atan2(camPos.x - center[0], camPos.z - center[2]);
  }
  g.userData.set = set; return g;
}
export const BOWC = [0.4, 0.6, -15.5];   // centre of the arch (the base line sits at this height)

export function makeLand() {
  const R = rng(9090), g = new THREE.Group();
  g.add(buildTerrain(rng(61)), underRock(rng(62)));
  const far = farMountains(rng(63)); g.add(far);
  const sea = makeClouds(rng(64), 130, { r0: [14, 62], y: [-3.8, -1.0], s: [3, 7.5], cols: ['#8a86a8', '#9a92b0', '#7a7898', '#a89aaa'], pull: 1 });
  const storm = makeClouds(rng(65), 90, { r0: [12.5, 34], y: [2.4, 7.5], s: [2.2, 4.6], cols: ['#3c4466', '#464e72', '#343c5e', '#50567a'], pull: .8, grow: .3 });
  const canopy = makeClouds(rng(67), 28, { r0: [.6, 7], y: [5.4, 8.2], s: [1.5, 3.0], cols: ['#363e62', '#424a70', '#2e3658', '#4a5078'], pull: 1 });
  g.add(sea.mesh, storm.mesh, canopy.mesh); storm.mat.emissive.set('#1c2440'); canopy.mat.emissive.set('#1c2440'); sea.mat.emissive.set('#40405a');
  const ark = makeArk(rng(66)); ark.update(1000); ark.slitMat.opacity = 0; g.add(ark.group);
  ark.group.position.set(ARK8.x, AY0, ARK8.z); ark.group.rotation.set(0, ARK8.yaw, 0, 'YXZ'); ark.setDoor(1.5);
  const water = makeWater(false, Hf, () => -.7, () => .04), rain = makeRain(); g.add(water.mesh, rain.group);
  const bow = makeBow(); bow.position.set(...BOWC); g.add(bow);

  // ---------------- people
  const mk = (o, sc, name) => { const f = person(R, o, sc); f.group.name = name || ''; g.add(f.group); return f; };
  const SK = '#c98d62';
  const noah = mk(NOAH, .5, 'noah'), shem = mk({ ...SONS.shem, skin: SK }, .45, 'shem'), ham = mk({ ...SONS.ham, skin: SK }, .45, 'ham'), jap = mk({ ...SONS.jap, skin: SK }, .44, 'jap');
  const wN = mk(WIVES.noah, .46, 'wNoah'), wS = mk(WIVES.shem, .44, 'wShem'), wH = mk(WIVES.ham, .44, 'wHam'), wJ = mk(WIVES.jap, .43, 'wJap');
  { const b = new GB(R); b.add(new THREE.CylinderGeometry(.5, .38, 1, 8).translate(0, .5, 0), '#b08a5e', [0, -.46, .06], [.07, .1, .07], [0, 0, 0], .03); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; noah.arms[1].add(m); noah.cup = m; m.visible = false; }
  const cloak = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xd2b87c })); cloak.castShadow = true; cloak.visible = false; g.add(cloak);

  // ---------------- the tent (entrance faces +z, toward the viewer) and the vineyard
  const TENT = { x: 4.7, z: -2.9 };
  const tentG = new THREE.Group(); g.add(tentG); tentG.position.set(TENT.x, gy(TENT.x, TENT.z) - .02, TENT.z);
  { const b = new GB(R), r = 1.2, h = 1.15; b.add(new THREE.ConeGeometry(r, h, 4, 1).rotateY(Math.PI / 4).translate(0, h / 2, 0), '#cdb48c', [0, 0, 0], [1, 1, 1], [0, 0, 0], .05);
    b.box('#5a3a20', [0, h + .08, 0], [.05, .3, .05], [0, 0, 0], .02); for (const s of [-1, 1]) b.box('#5a3a20', [s * .86, .03, .0], [.04, .08, .5], [0, 0, 0], .02);
    const zf = y => r * Math.SQRT1_2 * (1 - y / h) + .012, v = [[-.34, .02, zf(.02)], [.34, .02, zf(.02)], [0, .66, zf(.66)]], geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(v.flat(), 3)); geo.setIndex([0, 1, 2]); geo.computeVertexNormals(); b.add(geo, '#1a1008', [0, 0, 0], [1, 1, 1], [0, 0, 0], 0);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; tentG.add(m); }
  tentG.visible = false;
  const ROWZ = [-3.05, -2.4, -1.75], VX = [-2.6, -1.8, -1.0, -.2, .6, 1.4], plants = [];
  ROWZ.forEach((z, ri) => VX.forEach((x, ci) => {
    const b = new GB(R), n = ri * VX.length + ci; b.box('#5a3a20', [0, .2, 0], [.05, .42, .05], [0, 0, 0], .03); b.box('#3a2a1a', [.4, .38, 0], [.8, .02, .02], [0, 0, 0], 0);
    b.add(G.ico0, pk(R, ['#5a8a3a', '#4f8034', '#68963f']), [0, .36, 0], [.2, .17, .2], [R(), R(), 0], .08); b.add(G.ico0, pk(R, ['#5a8a3a', '#68963f']), [.4, .34, 0], [.18, .15, .18], [R(), R(), 0], .08);
    for (const [dx, dy] of [[-.06, .17], [.08, .14], [.4, .17]]) b.add(G.ico0, '#5a2e6a', [dx, dy, .06], [.05, .06, .05], [0, 0, 0], .04);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.position.set(x, gy(x, z) - .02, z); m.scale.setScalar(.001); g.add(m); plants.push({ m, t0: EV.plant[0] + 0.3 + n * .16 });
  }));

  // ---------------- trees and shrubs (all standing: the flood is over)
  const tree = (x, z, s, kind) => { const geo = kind === 'olive' ? oliveGeo(s, R) : kind === 'pine' ? pineGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f', '#4f8a3a']); const m = new THREE.Mesh(geo, lam); m.position.set(x, gy(x, z) - .02, z); m.castShadow = true; g.add(m); return m; };
  [[-8.6, -5.4, 1.1, 'round'], [8.8, -5.9, 1.0, 'olive'], [-9.4, -7.4, .9, 'round'], [9.6, -7.6, 1.0, 'round'], [-6.2, -9.0, 1.1, 'pine'], [5.8, -9.1, 1.0, 'round'], [-2.6, -9.0, .9, 'olive'], [3.2, -9.2, 1.1, 'pine'],
    [-7.8, -2.6, 1.0, 'olive'], [8.4, -3.4, .8, 'olive'], [-9.0, -4.0, .9, 'round'],
    [-10.4, 3.2, 1.2, 'olive'], [-8.2, 5.4, 1.0, 'round'], [-3.0, 6.8, 1.1, 'round'], [2.2, 7.6, 1.2, 'olive'], [7.0, 6.2, 1.0, 'round'], [9.8, 2.6, 1.0, 'pine'], [-5.6, 3.4, .9, 'olive'], [4.8, 3.2, 1.0, 'round'], [0.4, 4.6, .8, 'olive'], [-1.4, 9.2, .9, 'round']].forEach(a => tree(...a));
  { const sh = new GB(R); for (let k = 0; k < 34; k++) { const a = R() * TAU, r = 1 + R() * 12, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Hf(x, z) > 2.6 && Hf(x, z) < 3.2 && Math.abs(z - ARK8.z) < 1.9 && Math.abs(x) < 8.4) continue; if (z > -4.9 && z < -.6 && x > -9 && x < 8) continue; sh.add(G.ico0, pk(R, ['#7a766e', '#8a867c', '#6a665e', '#9a9488']), [x, gy(x, z) + .02, z], [.16 + R() * .12, .1 + R() * .08, .14 + R() * .1], [R() * 3, R() * 3, 0], .1); } g.add(new THREE.Mesh(sh.build(), lam)); }

  // ---------------- animals, resting on the plateau to the left of the family (they came out of the ark in Genesis 8)
  const KIND = {
    sheep: { sc: .6, mk: i => makeQuad({ rn: rng(910 + i), len: .46, h: .24, w: .2, legL: .2, legW: .04, col: pk(rng(i * 7 + 3), ['#f1ece0', '#e8e0cf', '#d9cfb8', '#f6f2e8', '#6a5a4a']), col2: '#d8d0bc', neck: [.12, .9, .08], head: [.16, .1, .09], ears: false, legCol: '#3a2e26' }) },
    ox: { sc: .5, mk: i => makeQuad({ rn: rng(940 + i), len: .88, h: .38, w: .3, legL: .38, legW: .075, col: pk(rng(i * 5 + 1), ['#8a5a38', '#7a4a2c', '#a8784a', '#5a3a28', '#b08a60']), col2: '#caa27a', neck: [.2, .9, .16], head: [.26, .18, .18], horns: true }) },
    camel: { sc: .42, mk: i => makeQuad({ rn: rng(970 + i), len: 1.05, h: .42, w: .3, legL: .72, legW: .07, col: '#c89a5a', col2: '#a97c44', neck: [.62, .62, .12], head: [.26, .13, .12], hump: true, ears: false }) },
    donkey: { sc: .5, mk: i => makeQuad({ rn: rng(980 + i), len: .78, h: .3, w: .22, legL: .42, legW: .05, col: '#8c8378', col2: '#d8d0c0', neck: [.26, .7, .1], head: [.26, .13, .1], ears: true }) },
    elephant: { sc: .36, mk: i => buildWild('elephant', rng(990 + i)) },
    zebra: { sc: .45, mk: i => buildWild('zebra', rng(995 + i)) },
    lion: { sc: .5, mk: i => buildWild('lion', rng(997 + i)) },
  };
  const SEQ = ['ox', 'sheep', 'sheep', 'elephant', 'ox', 'sheep', 'camel', 'zebra', 'sheep', 'ox', 'lion', 'sheep', 'donkey', 'sheep', 'ox', 'sheep'];
  const slots = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) slots.push([-8.0 + c * .86 + (r % 2) * .35 + (R() - .5) * .25, -4.7 + r * .9 + (R() - .5) * .22]);
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
  const animals = SEQ.map((kind, i) => { const K = KIND[kind], a = K.mk(i); a.group.scale.setScalar(K.sc * (.93 + .14 * R())); const [x, z] = slots[i]; a.group.position.set(x, gy(x, z) - .02, z); a.group.rotation.y = -.9 + R() * 1.8; g.add(a.group); return { a, sd: R() }; });
  const BCOL = ['#f4f0e6', '#f4f0e6', '#f4f0e6', '#f4f0e6', '#f4f0e6', '#f4f0e6', '#bdb7a8', '#bdb7a8', '#bdb7a8', '#bdb7a8', '#5a6a8a', '#5a6a8a', '#d8a45a', '#d8a45a'];
  const flock = BCOL.map((c, i) => { const b = makeBird(rng(800 + i), c); b.group.scale.setScalar(.5 + .1 * R()); b.group.visible = false; g.add(b.group); return { ...b, ts: 8 + i * .3, r: 3.2 + R() * 3.4, h: 6.4 + R() * 3.2, w: (.22 + R() * .12) * (i % 2 ? 1 : -1), ph: R() * 6 }; });
  const motes = makeMotes({ n: 90, area: [14, 5, 10], size: .05, v: .16, seed: 72, color: 0xffdd90 }); g.add(motes.mesh);
  const SHAFTS = [[-6.0, -2.0], [5.0, -1.0], [9.0, -5.0], [-1.0, 3.5]].map(([x, z]) => { const s = shaft(16, .9, 2.4, [1, .84, .5], 1, .3); s.position.set(x, gy(x, z), z); s.visible = false; g.add(s); return s; });

  // ---------------- tracks for the people: [t, x, z, ry]
  const FAM = { noah: [-1.0, -3.0], shem: [-2.0, -2.4], ham: [.1, -2.3], jap: [-1.5, -3.7], wNoah: [-4.4, -3.6], wShem: [-3.6, -2.8], wHam: [-4.8, -2.4], wJap: [-3.2, -4.0] };
  const WAIT = { shem: [3.9, -.95], jap: [4.9, -.95] }, TD = { x: TENT.x - .1, z: TENT.z + .75 };
  // tracks: keys [t, x, z, ry]; ry 'h' = face the direction of travel (kept after arrival)
  const prep = keys => { let last = 0; return keys.map((k, i) => { const p = keys[i - 1]; let ry = k[3], h = false; if (ry === 'h') { h = true; ry = (p && (Math.abs(k[1] - p[1]) + Math.abs(k[2] - p[2]) > .01)) ? Math.atan2(k[1] - p[1], k[2] - p[2]) : last; } last = ry; return { t: k[0], x: k[1], z: k[2], ry, h }; }); };
  const trk = (K, t) => { const keys = K.pk || (K.pk = prep(K)); if (t <= keys[0].t) return { ...keys[0], mv: false };
    for (let i = 1; i < keys.length; i++) if (t <= keys[i].t) { const a = keys[i - 1], b = keys[i], u = ease.inOutSine(seg(t, a.t, b.t)), mv = Math.abs(b.x - a.x) + Math.abs(b.z - a.z) > .01 && t > a.t && t < b.t; return { x: lerp(a.x, b.x, u), z: lerp(a.z, b.z, u), ry: b.h ? b.ry : lerp(a.ry, b.ry, u), mv }; }
    return { ...keys[keys.length - 1], mv: false }; };
  // Noah: stands with the family, walks to the vineyard, plants, drinks, walks to the tent, hides, comes out
  const NK = [[0, ...FAM.noah, 0], [EV.walkToVine[0], ...FAM.noah, 0], [EV.walkToVine[1], 1.0, -2.3, 'h'], [EV.plant[1], 1.0, -2.3, 0], [EV.toTent[0], 1.0, -2.3, 'h'], [EV.toTent[1] - .3, TD.x, TD.z, 'h'], [EV.toTent[1] + .3, TENT.x, TENT.z + .2, 'h'], [EV.noahOut[0], TENT.x, TENT.z + .2, 0], [EV.noahOut[1], TENT.x, TENT.z + 1.2, 'h'], [99, TENT.x, TENT.z + 1.2, 0]];
  const SK_ = [[0, ...FAM.shem, 0], [EV.walkToVine[0], ...FAM.shem, 0], [EV.walkToVine[1], ...WAIT.shem, 'h'], [EV.cloakUp[1], ...WAIT.shem, 0], [EV.backwalk[1], TENT.x - .42, TENT.z + .9, 0], [EV.noahOut[1] + 1.4, TENT.x - .42, TENT.z + .9, 0], [EV.noahOut[1] + 2.6, TENT.x - 1.0, TENT.z + 1.4, 'h'], [99, TENT.x - 1.0, TENT.z + 1.4, 0]];
  const JK_ = [[0, ...FAM.jap, 0], [EV.walkToVine[0], ...FAM.jap, 0], [EV.walkToVine[1], ...WAIT.jap, 'h'], [EV.cloakUp[1], ...WAIT.jap, 0], [EV.backwalk[1], TENT.x + .42, TENT.z + .9, 0], [EV.noahOut[1] + 1.4, TENT.x + .42, TENT.z + .9, 0], [EV.noahOut[1] + 2.6, TENT.x + 1.0, TENT.z + 1.4, 'h'], [99, TENT.x + 1.0, TENT.z + 1.4, 0]];
  const HK = [[0, ...FAM.ham, 0], [EV.walkToVine[0], ...FAM.ham, 0], [EV.walkToVine[1], 2.8, -1.0, 'h'], [EV.hamGo[0], 2.8, -1.0, 'h'], [EV.hamGo[1], TENT.x - 1.0, TENT.z + .95, 'h'], [EV.hamLook[1], TENT.x - 1.0, TENT.z + .95, 'h'], [EV.hamBack[1], 3.2, -.9, 'h'], [EV.noahOut[1] + 2.0, 3.2, -.9, 0], [99, 3.2, -.9, 0]];
  const wiv = [['wNoah', wN], ['wShem', wS], ['wHam', wH], ['wJap', wJ]];

  function update(t, cam) {
    const cp = cam && cam.position, Tg = cam && cam.userData.T;
    water.set(t, { opf: () => 0 });
    rain.group.visible = false; // Genesis 8:2 - the rain was restrained before this chapter begins
    // ---- sky: the storm breaks up in the first seconds and the sky clears
    const clr = 26 * smooth(0, 6, t), vis = 1 - smooth(.5, 11, t);
    storm.update(t, .6 * vis + .1, vis, null, 0, cp, 14, Tg, clr); canopy.update(t, 0, (1 - smooth(0, 8, t)) * .9, null, 0, cp, 10, Tg, clr); sea.mesh.visible = true; sea.update(t, 0, 1, null, 0, cp, 16, Tg);
    { const w = smooth(1, 10, t), c = lerp(1, 1.9, w); storm.mat.color.setRGB(c, c * .98, c * .94); storm.mat.emissive.set(w < .5 ? '#1c2440' : '#4a3a38'); }
    far.visible = true; far.scale.set(1, 1, 1);
    const sk = Math.max(smooth(1.5, 4.5, t) * (1 - smooth(13, 20, t)), smooth(50, 53, t) * (1 - smooth(58, 60, t)));
    SHAFTS.forEach((s, i) => { const k = sk * smooth(0, 1, 1 - i * .12); s.visible = k > .01; s.material.opacity = .16 * k; });
    motes.update(t, .6 * smooth(3, 8, t), [0, 3, -3]);
    // ---- the bow
    const bu = ease.inOutSine(seg(t, EV.bowIn[0], EV.bowIn[1]));
    const bop = keyed(t, [[0, 0], [EV.bowIn[0], 0], [EV.bowIn[0] + 1.8, .66], [29.6, .66], [32, .3], [45, .3], [46.5, .1], [50.4, .1], [52.4, .66], [58.4, .66], [60, 0], [90, 0]], ease.inOutSine);
    bow.userData.set(t < EV.bowIn[0] ? 0 : t < 50 ? bu : 1, bop, cp, BOWC);
    // ---- tent and vineyard
    tentG.visible = t > 29.8;
    plants.forEach(p => { const k = ease.outBack(seg(t, p.t0, p.t0 + .6)); p.m.scale.setScalar(Math.max(.001, k)); p.m.visible = k > .002; });
    // ---- people
    const place = (f, x, z, ry, o = {}) => pose(f, x, gy(x, z) - .02 + (o.hop || 0), z, ry, o);
    const bob = (i) => ({ lx: .02 * Math.sin(t * 1.1 + i) });
    const arms = ease.inOutSine(seg(t, EV.noahArmsUp[0], EV.noahArmsUp[1])) * (1 - ease.inOutSine(seg(t, EV.noahArmsUp[2], EV.noahArmsUp[3])));
    // Noah
    {
      const k = trk(NK, t), w = Math.sin(t * 6.5);
      const kneel = ease.inOutSine(seg(t, EV.plant[0], EV.plant[0] + .5)) * (1 - ease.inOutSine(seg(t, EV.plant[1] - .4, EV.plant[1])));
      const drink = ease.inOutSine(seg(t, EV.drink[0], EV.drink[0] + .5)) * (1 - ease.inOutSine(seg(t, EV.drink[1] - .4, EV.drink[1])));
      const raise = ease.inOutSine(seg(t, EV.noahRaise[0], EV.noahRaise[1])) * (1 - ease.inOutSine(seg(t, EV.noahRaise[2], EV.noahRaise[3])));
      const o = k.mv ? { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .02, lx: t > EV.toTent[0] && t < EV.toTent[1] ? .09 * Math.sin(t * 3.1) : 0 } : { ...bob(0) };
      if (arms > 0) { o.a0x = -2.3 * arms; o.a1x = -2.3 * arms; }
      if (kneel > 0) { o.lx = .55 * kneel; o.a0x = -.9 * kneel; o.a1x = -.9 * kneel; }
      if (drink > 0) { o.a1x = -2.15 * drink; o.lx = -.06 * drink + .06 * Math.sin(t * 2.2); }
      if (raise > 0) { o.a1x = -2.4 * raise; o.a0x = -.3 * raise; }
      noah.cup.visible = drink > .02 && t < EV.toTent[1];
      noah.group.visible = !(t > EV.toTent[1] + .3 && t < EV.noahOut[0] + .05);
      place(noah, k.x, k.z, k.ry, o);
      if (t > EV.plant[1] && t < EV.noahOut[0] && !k.mv && drink < .01) noah.group.rotation.y = lerp(k.ry, 1.4, .0);
    }
    // sons
    const Hk = trk(HK, t), hw = Math.sin(t * 6.5 + 2);
    ham.group.visible = true; { const o = Hk.mv ? { a0x: .4 * hw, a1x: -.4 * hw, hop: Math.abs(hw) * .02 } : { ...bob(2) }; if (t > EV.hamBack[1] - .2 && t < EV.hamBack[1] + 2.2) o.a1x = -.9 * Math.sin(seg(t, EV.hamBack[1] - .2, EV.hamBack[1] + 2.2) * 9) * .5; place(ham, Hk.x, Hk.z, (t > EV.hamLook[0] && t < EV.hamLook[1]) ? 0 : Hk.ry, o); }
    // Shem and Japheth
    const sc = trk(SK_, t), jc = trk(JK_, t), sw = Math.sin(t * 6.5 + 1), jw = Math.sin(t * 6.5 + 3), back = t > EV.backwalk[0] && t < EV.backwalk[1], carry = ease.inOutSine(seg(t, EV.cloakUp[0], EV.cloakUp[1])) * (1 - seg(t, EV.backwalk[1] - .3, EV.backwalk[1] + .1));
    const vis2 = t < EV.backwalk[1] + .15 || t > EV.noahOut[1] + 1.4;
    shem.group.visible = vis2; jap.group.visible = vis2;
    { const o = sc.mv ? { a0x: .4 * sw, a1x: -.4 * sw, hop: Math.abs(sw) * .02 } : { ...bob(1) }; if (back) { o.a0x = -.5; o.a1x = -.5; o.hop = Math.abs(sw) * .012; } if (carry > 0) { o.a0x = -.55 * carry; o.a1x = -.55 * carry; } place(shem, sc.x, sc.z, (!sc.mv || back) ? 0 : sc.ry, o); }
    { const o = jc.mv ? { a0x: .4 * jw, a1x: -.4 * jw, hop: Math.abs(jw) * .02 } : { ...bob(3) }; if (back) { o.a0x = -.5; o.a1x = -.5; o.hop = Math.abs(jw) * .012; } if (carry > 0) { o.a0x = -.55 * carry; o.a1x = -.55 * carry; } place(jap, jc.x, jc.z, (!jc.mv || back) ? 0 : jc.ry, o); }
    // the cloak: on the ground between them, lifted to their shoulders, carried into the tent
    {
      const on = t > EV.cloakUp[0] - .6 && t < EV.backwalk[1] + .15; cloak.visible = on;
      if (on) { const lift = ease.inOutSine(seg(t, EV.cloakUp[0], EV.cloakUp[1])), mx = (sc.x + jc.x) / 2, mz = (sc.z + jc.z) / 2, gyv = gy(mx, mz) - .02, dx = Math.abs(jc.x - sc.x) + .1;
        cloak.position.set(mx, gyv + lerp(.03, .56, lift), mz); cloak.scale.set(Math.max(.4, dx), lerp(.03, .26, lift), lerp(.5, .035, lift)); cloak.rotation.set(0, 0, 0); }
    }
    // wives: standing together to the left, quietly
    wiv.forEach(([k, f], i) => { const [x, z] = FAM[k]; place(f, x, z, .2 - i * .12, { ...bob(i + 4), a0x: arms * -.5 * (i % 2), a1x: arms * -.5 * ((i + 1) % 2) }); });
    // ---- the animals: breathing, a little shift
    animals.forEach(({ a, sd }, i) => { a.group.position.y = a.group.position.y; if (a.legs) a.legs.forEach(l => l.rotation.z = 0); a.group.rotation.x = .004 * Math.sin(t * .8 + sd * 6); });
    // ---- birds wheel over the land once the sky has cleared
    flock.forEach((b, i) => {
      const u = seg(t, b.ts, b.ts + 2.4), a = t * b.w + b.ph, cx = -.5, cz = -2.6, ox = cx + Math.cos(a) * b.r, oz = cz + Math.sin(a) * b.r * .7, oy = b.h + Math.sin(t * .6 + i) * .4;
      const sx = ARK8.x + 1, sy = AY0 + .8, sz = ARK8.z + 1.3, e = ease.inOutSine(u), x = lerp(sx, ox, e), y = lerp(sy, oy, e), z = lerp(sz, oz, e), vis3 = t >= b.ts; b.group.visible = vis3; if (!vis3) return;
      b.group.position.set(x, y, z); const nx = cx + Math.cos(a + .05 * Math.sign(b.w)) * b.r, nz = cz + Math.sin(a + .05 * Math.sign(b.w)) * b.r * .7;
      b.group.rotation.set(0, u < 1 ? Math.atan2(-(oz - sz), ox - sx) : Math.atan2(-(nz - oz), nx - ox), -.12 * Math.sin(t * 1.4 + i)); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6);
    });
    ark.group.updateMatrixWorld(true);
  }
  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [
    Dk(0, '#46547a', '#1c2236', .9, '#c4cce4', 1.1, [-10, 6, 6], .5, '#6a7cff', [10, 6, -8], 14),
    Dk(5, '#5a6a98', '#262a42', 1.0, '#ffc490', 1.8, [-12, 4.5, 5], .5, '#6a7cff', [10, 6, -8], 14),
    Dk(12, '#6878a8', '#3a3040', 1.0, '#ffd8a0', 2.1, [-12, 5, 6], .45, '#7a8cff', [10, 6, -8], 13),
    Dk(22, '#7c8cb8', '#403f3c', 1.05, '#ffe2b4', 2.2, [-9, 8, 5], .4, '#8a9cff', [10, 6, -8], 12),
    Dk(29, '#7c8cb8', '#403f3c', 1.05, '#ffe2b4', 2.2, [-9, 8, 5], .4, '#8a9cff', [10, 6, -8], 12),
    Dk(32, '#7480ae', '#40383c', 1.0, '#ffb878', 2.2, [-14, 3.6, 4], .4, '#8a96ff', [10, 6, -8], 12),
    Dk(40, '#5a5a88', '#38304a', .92, '#ff9a58', 1.9, [-14, 2.4, 3], .4, '#8a96ff', [10, 6, -8], 12),
    Dk(45.5, '#4c5684', '#2e2c44', .86, '#d89a88', 1.5, [-12, 3.2, 4], .5, '#7a8cff', [10, 6, -8], 12),
    Dk(51, '#7480ae', '#3c3840', 1.0, '#ffc680', 2.2, [-12, 3.8, 4], .42, '#8a96ff', [10, 6, -8], 12),
    Dk(60, '#7480ae', '#3c3840', 1.0, '#ffc680', 2.1, [-12, 3.6, 4], .42, '#8a96ff', [10, 6, -8], 12)];
  const bg = [[0, ['#10163a', '#4a4a6a']], [5, ['#1a2450', '#a8806a']], [12, ['#2a4a88', '#e0b888']], [22, ['#3a6ab0', '#d8d0b0']], [29, ['#3a6ab0', '#d8d0b0']], [32, ['#3a5a98', '#f0b070']], [40, ['#2a3470', '#e89a60']], [45.5, ['#1c2454', '#8a6a8a']], [51, ['#3a5a98', '#f0c890']], [60, ['#2a3a78', '#f0a868']]];
  return { group: g, far, update, light, bg, ark, water, AY0, noah, ham, shem, jap, bow, TENT, FAM };
}
