// Episode 14, 1:00-1:25: the terrace over the cloud sea at golden hour. Two people in today's clothes: one comes over to a friend sitting out at the bench (h1: goes to help), then goes to a long low table where ten small
// gift boxes are laid out and carries one of them to a little stone altar (h2: a tenth to God); a third person in a dark jacket comes with a gold-wrapped gift and is gently turned down (h2: no reward). At h3 the giver stands before the altar
// with open raised hands and a soft beam of light rises from the altar into the evening sky; at h4 the friend joins and the camera lifts away.
// Cinematic interpretation: the table, the ten boxes, the altar, the gift and the beam are a picture of giving God the credit and keeping clean hands; they are not in Scripture and they do not depict the meeting at Salem.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, spriteGlow, pool, shaft } from './kit.js';
import { ease, seg } from './util.js';
import { pk, roundTreeGeo, pineGeo, oliveGeo, peakGeo, makeMotes } from './props.js';
import { makeBird } from './fauna6.js';
import { underRock } from './terrain8.js';
import { cloudSea } from './world10.js';
import { makeModern } from './reflect10.js';
import { LK } from './lights.js';

export const RT = { t0: 60, end: 85 };
const HAZE = '#d49a8a';
const SK = ['#c98d62', '#b57a50', '#d9a073', '#9c6a42', '#e4b48a', '#8a5a3a', '#ba8458'];
const AL = [2.0, -1.6], TBX = [-1.26, 1.26], TBZ = -1.0, NBX = 10;          // the altar, the table's x range and z, the number of boxes
const boxX = k => lerp(TBX[0], TBX[1], k / (NBX - 1));
// a walker defined by keys [[t, x, z], ...]: eased between keys; stands still between two equal keys
function kp(t, keys) { if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], mv: false, vx: keys.length > 1 ? keys[1][1] - keys[0][1] : 0, vz: keys.length > 1 ? keys[1][2] - keys[0][2] : 1 };
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++; const a = keys[i - 1], b = keys[i]; if (t >= keys[keys.length - 1][0]) { const p = keys[keys.length - 2], q = keys[keys.length - 1]; return { x: q[1], z: q[2], mv: false, vx: q[1] - p[1], vz: q[2] - p[2] }; }
  const u = ease.inOutSine(clamp((t - a[0]) / (b[0] - a[0]))), d = Math.hypot(b[1] - a[1], b[2] - a[2]); return { x: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u), mv: d > .01 && t > a[0] && t < b[0], vx: b[1] - a[1], vz: b[2] - a[2] }; }

export function makeReflect() {
  const R = rng(5353), g = new THREE.Group();
  // ---- the terrace
  { const gb = new GB(R); gb.add(new THREE.CylinderGeometry(11, 11.6, .5, 28, 1).translate(0, -.25, 0), '#6f8a48', [0, 0, 0], [1, 1, 1], [0, 0, 0], .08); gb.add(new THREE.CylinderGeometry(11.6, 11.5, .3, 28, 1).translate(0, -.65, 0), '#5a4a38', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
    for (let k = 0; k < 40; k++) { const a = R() * 6.28, r = 2 + R() * 8.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (x > -.8 && x < 3.2 && z < 0) continue; gb.add(G.ico0, pk(R, ['#7a9a52', '#68893f', '#86a35a']), [x, .02, z], [.22 + R() * .3, .05, .22 + R() * .3], [0, R() * 3, 0], .1); }
    for (let k = 0; k < 14; k++) { const a = R() * 6.28, r = 9.4 + R() * .9; gb.add(G.ico0, pk(R, ['#6e6a66', '#7a766e', '#5e5a58']), [Math.cos(a) * r, .05, Math.sin(a) * r], [.35 + R() * .3, .22 + R() * .2, .3 + R() * .3], [R() * 3, R() * 3, 0], .1); }
    const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; g.add(m); { const ur = underRock(rng(5354), 11.4); ur.position.set(0, -.2, 0); g.add(ur); } }
  [[-7.6, -5.2, 1.3, 0], [-5.4, -7.4, 1.2, 1], [-4.2, -3.8, 1.0, 2], [5.6, -7.2, 1.2, 0], [7.8, -4.6, 1.3, 1], [8.6, -.4, 1.2, 0], [-8.6, -1.0, 1.2, 1], [-9.6, 4.6, 1.1, 0], [8.0, 4.4, 1.1, 2], [6.2, -3.0, 1.0, 2], [-2.6, -9.0, 1.2, 0], [8.4, 7.4, 1.0, 1]].forEach(([x, z, s, k]) => {
    const geo = k === 1 ? oliveGeo(s, R) : k === 2 ? pineGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f']); const m = new THREE.Mesh(geo, lam); m.position.set(x, 0, z); m.castShadow = true; m.rotation.y = R() * 6; g.add(m); });
  { const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#3a4666', '#303a5a', '#2a3350'];
    for (let i = 0; i < 20; i++) { const a = -Math.PI / 2 + (i / 19 - .5) * Math.PI * 1.4 + (R() - .5) * .1, r = 60 + R() * 30, s = 3 + R() * 3.4, c = cols[i % 3]; const m = new THREE.Mesh(peakGeo(s, R, [c, c, c], false), mat); m.scale.set(2.8, 1.0 + R() * .3, 2.0); m.position.set(Math.cos(a) * r, -3.0 + R() * 1.0, Math.sin(a) * r); m.rotation.y = R() * 6; g.add(m); } }
  const sea = cloudSea(rng(5355), 140, [[0, 0, 14], [2, -18, 12]]); g.add(sea.mesh); sea.mat.color.set('#e8c0a8'); sea.mat.emissive.set('#40304a');

  // ---- the familiar corner: a small house with a lit window, a bench and a lantern on a post
  const hb = new GB(R); { const hx = -5.6, hz = .2;
    hb.box('#cdb48c', [hx, .62, hz], [2.4, 1.24, 1.9], [0, 0, 0], .04); hb.box('#b09c74', [hx, 1.3, hz], [2.6, .14, 2.1], [0, 0, 0], .03); hb.box('#8a6642', [hx, 1.42, hz], [2.6, .1, 2.1], [0, 0, 0], .03);
    hb.box('#3a2a1c', [hx + 1.21, .5, hz + .1], [.06, .9, .6], [0, 0, 0], .02); hb.box('#e8b060', [hx + 1.22, .78, hz + .72], [.05, .3, .3], [0, 0, 0], .02); hb.box('#7a5636', [hx + 1.22, .78, hz + .72], [.03, .34, .04], [0, 0, 0], .01);
    hb.box('#8a6642', [-3.4, .24, 1.8], [1.5, .07, .4], [0, 0, 0], .03); for (const x of [-4.0, -2.8]) hb.box('#6a4a2c', [x, .12, 1.8], [.09, .24, .32], [0, 0, 0], .03);
    hb.box('#4a3624', [-2.0, .62, 1.6], [.09, 1.24, .09], [0, 0, 0], .03); hb.box('#3a2a1c', [-2.0, 1.3, 1.6], [.2, .24, .2], [0, 0, 0], .03); hb.box('#2a1c10', [-2.0, 1.46, 1.6], [.26, .05, .26], [0, 0, 0], .02); }
  { const m = new THREE.Mesh(hb.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  const winGlow = spriteGlow(-4.4, .8, .9, 1.5, 0xffb860, .8), lanGlow = spriteGlow(-2.0, 1.3, 1.6, 1.6, 0xffb860, .8), lanGlow2 = spriteGlow(-2.0, 1.3, 1.6, .6, 0xffe6a8, .7); [winGlow, lanGlow, lanGlow2].forEach(s => { s.material.fog = false; g.add(s); });

  // ---- the long low stone table with ten gift boxes, and the little altar
  const tb = new GB(R); tb.box('#b8b2a6', [0, .18, TBZ], [3.1, .36, .62], [0, 0, 0], .04); tb.box('#c8c2b4', [0, .38, TBZ], [3.25, .05, .72], [0, 0, 0], .03);
  const GOLD = ['#d9b36a', '#e8d4a0', '#c9a15a'];
  for (let k = 1; k < NBX; k++) { const x = boxX(k); tb.box(GOLD[k % 3], [x, .5, TBZ], [.2, .17, .2], [0, (R() - .5) * .3, 0], .02); tb.box('#a2564e', [x, .5, TBZ], [.04, .18, .21], [0, 0, 0], .01); tb.box('#a2564e', [x, .5, TBZ], [.21, .18, .04], [0, 0, 0], .01); }
  { const m = new THREE.Mesh(tb.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  const mkBox = col => { const b = new GB(R); b.box(col, [0, 0, 0], [.2, .17, .2], [0, 0, 0], .02); b.box('#a2564e', [0, 0, 0], [.04, .18, .21], [0, 0, 0], .01); b.box('#a2564e', [0, 0, 0], [.21, .18, .04], [0, 0, 0], .01); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; return m; };
  const tenth = mkBox('#d9b36a'); tenth.position.set(boxX(0), .5, TBZ); g.add(tenth);
  const alt = new GB(R); alt.box('#a8a39a', [AL[0] - .2, .11, AL[1]], [.38, .22, .34], [0, .1, 0], .05); alt.box('#938e84', [AL[0] + .2, .11, AL[1]], [.38, .22, .34], [0, -.1, 0], .05); alt.box('#b4aea2', [AL[0], .33, AL[1]], [.4, .22, .34], [0, .06, 0], .05);
  { const m = new THREE.Mesh(alt.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  const altGlow = spriteGlow(AL[0], .62, AL[1], 1.3, 0xffd890, 0), altGlow2 = spriteGlow(AL[0], .56, AL[1], .55, 0xfff0c0, 0), altPool = pool(2.2, 0xffe6b0, 0); altPool.position.set(AL[0], .06, AL[1]); [altGlow, altGlow2].forEach(s => { s.material.fog = false; g.add(s); }); altPool.material.fog = false; g.add(altPool);
  const beam = shaft(16, .42, .22, [1, .86, .55], .6, 1), beamG = shaft(16, 1.0, .5, [1, .84, .5], .25, .6); [beam, beamG].forEach(m => { m.position.set(AL[0], .55, AL[1]); m.material.opacity = 0; m.visible = false; g.add(m); });

  // ---- people in today's clothes: the giver (A), the friend on the bench (B) and the one who brings a gift (C)
  const mkP = (o = {}) => { const p = makeModern(R, { skin: pk(R, SK), hat: null, sc: 1.1, ...o }); g.add(p.group); return p; };
  const A = mkP({ jacket: '#5e7fa6', jacket2: '#4a6a78', hair: '#2a1a10' }), B = mkP({ jacket: '#a2564e', jacket2: '#8a4a3c', long: true, hair: '#3a2616' }), C = mkP({ jacket: '#3a4256', jacket2: '#2c3244', scarf: '#c9a15a', hair: '#1f160d' });
  const gift = new THREE.Group(); { const gb = new GB(R); gb.box('#d9b36a', [0, 0, 0], [.22, .18, .22], [0, 0, 0], .02); gb.box('#a2564e', [0, 0, 0], [.04, .19, .23], [0, 0, 0], .01); gb.box('#a2564e', [0, 0, 0], [.23, .19, .04], [0, 0, 0], .01); const m = new THREE.Mesh(gb.build(), lam); m.castShadow = true; gift.add(m); }
  gift.position.set(0, .66, .28); C.group.add(gift); const giftGlow = spriteGlow(0, .66, .28, .5, 0xffe6a8, .5); giftGlow.material.fog = false; C.group.add(giftGlow);
  const walkAnim = (t, ph = 0) => { const w = Math.sin(t * 6.2 + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .02, leg: .5 * w }; };
  const setLegs = (p, sw) => { p.legs[0].rotation.x = sw; p.legs[1].rotation.x = -sw; };
  const place = (p, x, y, z, ry, o = {}) => { p.group.position.set(x, y + (o.hop || 0), z); p.group.rotation.set(o.lx || 0, ry, 0, 'YXZ'); p.arms[0].rotation.set(o.a0x || 0, 0, o.a0z ?? -.06); p.arms[1].rotation.set(o.a1x || 0, 0, o.a1z ?? .06); };
  const head = (vx, vz) => Math.atan2(vx, vz);
  const KA = [[60, 1.4, 1.6], [61.2, 1.4, 1.6], [64.3, -2.0, 1.4], [66.1, -2.0, 1.4], [67.1, -.95, .25], [71.9, -.95, .25], [72.9, 1.6, -.2]];
  const KB = [[60, -3.0, 1.9], [76.8, -3.0, 1.9], [79.0, .5, .5]];
  const KC = [[60, 5.2, 1.0], [68.4, 5.2, 1.0], [69.6, 1.3, .55], [71.0, 1.3, .55], [72.2, 5.0, 1.2]];
  const motes = makeMotes({ n: 90, area: [16, 5.4, 20], size: .035, v: .12, seed: 85, color: 0xffd8a0 }); g.add(motes.mesh);
  const flock = Array.from({ length: 5 }, (_, i) => { const b = makeBird(rng(900 + i), '#f4f0e6'); b.group.scale.setScalar(.55); g.add(b.group); return { ...b, r: 5 + i, h: 5 + i * .5, w: (.18 + i * .02) * (i % 2 ? 1 : -1), ph: i * 1.3 }; });
  const lp = new THREE.Vector3();

  function update(lt, t, cam, camPos) {
    const cp = camPos && (camPos.position || camPos);
    sea.update(t, cp, 16); sea.mat.color.set(t < 72 ? '#e8c0a8' : '#f0c8a0');
    winGlow.material.opacity = .75 + .1 * Math.sin(t * 2.1); lanGlow.material.opacity = .6 * (.85 + .15 * Math.sin(t * 9) * Math.sin(t * 5.3)); lanGlow2.material.opacity = .55;
    // A: walks over to the friend and puts a hand toward them (h1), goes to the table (h2), lifts the tenth box onto the altar, turns the gift down, then stands at the altar with open raised hands (h3)
    const pA = kp(t, KA), pB = kp(t, KB), pC = kp(t, KC), wA = walkAnim(t, 0), wB = walkAnim(t, 1.7), wC = walkAnim(t, 3.1);
    { let ry = head(pA.vx, pA.vz), ex = {}; const tt = t;
      if (!pA.mv) { if (tt < 61.2) ry = head(-1, 0); else if (tt < 66.6) { ry = head(-1, .2); const rc = smooth(64.5, 65.2, tt) * (1 - smooth(66.0, 66.5, tt)); ex = { a0x: -1.2 * rc, a1x: -.3 * rc }; }
        else if (tt < 72.0) { const gv = smooth(67.2, 67.6, tt) * (1 - smooth(68.8, 69.2, tt)); ry = head(0, -1); ry = lerp(ry, head(AL[0] - pA.x, AL[1] - pA.z), smooth(67.2, 67.6, tt) * (1 - smooth(68.8, 69.2, tt)));
          const tc = smooth(69.2, 69.7, tt) * (1 - smooth(71.2, 71.7, tt)), sw = Math.sin((tt - 69.7) * 6.0) * tc; ry = lerp(ry, head(1.3 - pA.x, .55 - pA.z) + .5 * sw, tc);
          ex = { a0x: -1.2 * gv, a1x: -.8 * gv, a0z: -.1 - .5 * tc, a1z: .1 }; ex.a1x = ex.a1x - 1.0 * tc; }
        else { const up = smooth(73.2, 74.2, tt); ry = head(AL[0] - pA.x, AL[1] - pA.z); ex = { a0x: -2.6 * up, a1x: -2.6 * up, a0z: -.1 - .22 * up, a1z: .1 + .22 * up, lx: -.05 * up }; } }
      place(A, pA.x, 0, pA.z, ry, { hop: 0, ...ex, ...(pA.mv ? { a0x: wA.a0x, a1x: wA.a1x, hop: wA.hop } : {}) }); setLegs(A, pA.mv ? wA.leg : 0); }
    // B: sits out at the bench, turns when A comes, then walks over to stand beside A (h4)
    { const toA = head(pA.x - pB.x, pA.z - pB.z); let ry = pB.mv ? head(pB.vx, pB.vz) : lerp(head(-1, -.6), toA, smooth(63.2, 64.0, t)); if (!pB.mv && t > 79.0) ry = head(AL[0] - pB.x, AL[1] - pB.z);
      place(B, pB.x, 0, pB.z, ry, pB.mv ? { a0x: wB.a0x, a1x: wB.a1x, hop: wB.hop } : { a0x: -.1, a1x: -.06 }); setLegs(B, pB.mv ? wB.leg : 0); }
    // C: arrives with a gold-wrapped gift, holds it out, is turned down, lowers it and leaves
    { const give = smooth(69.7, 70.2, t) * (1 - smooth(70.6, 71.0, t)); let ry = pC.mv ? head(pC.vx, pC.vz) : head(-1, 0); const away = smooth(70.9, 71.6, t); if (!pC.mv && t < 71.0) ry = head(-1, .15);
      place(C, pC.x, 0, pC.z, ry, pC.mv ? { a0x: -.9, a1x: -.9, hop: wC.hop } : { a0x: -1.0 * give - .5, a1x: -1.0 * give - .5 }); setLegs(C, pC.mv ? wC.leg : 0);
      gift.position.set(0, .66 - .12 * smooth(70.8, 71.3, t), .28 - .04 * smooth(70.8, 71.3, t)); const show = t > 68.2 && t < 72.6; C.group.visible = show; }
    // the tenth box: from the table to the altar, where it stays
    { const u = ease.inOutSine(seg(t, 67.3, 68.7)), x = lerp(boxX(0), AL[0], u), z = lerp(TBZ, AL[1], u), y = .5 + Math.sin(Math.PI * u) * .55 + .13 * u; tenth.position.set(x, y, z); tenth.rotation.y = u * 1.4; }
    // the altar glow, the pool of light and the beam rising into the evening sky
    { const on = smooth(68.6, 69.6, t), flare = smooth(72.6, 73.6, t), keep = .28 + .72 * flare, fl = .9 + .1 * Math.sin(t * 7) * Math.sin(t * 4.3);
      altGlow.material.opacity = (.4 * on + .5 * flare) * fl; altGlow2.material.opacity = (.35 * on + .45 * flare); altPool.material.opacity = (.2 * on + .3 * flare); altGlow.visible = altGlow2.visible = on > .01; altPool.visible = on > .01;
      const bm = smooth(72.9, 75.2, t) * (1 - .35 * smooth(80, 84, t)); beam.visible = beamG.visible = bm > .01; beam.material.opacity = .5 * bm; beamG.material.opacity = .22 * bm; beam.scale.set(1, .2 + .8 * smooth(72.9, 75.6, t), 1); beamG.scale.copy(beam.scale); }
    flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.position.set(Math.cos(a) * b.r, b.h + Math.sin(t * .5 + i), -6 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
    motes.update(t, .8 + .6 * smooth(72.8, 75.5, t), [1.5, .3, -2]);
  }
  const cam = [
    { t: 60, T: [0, 2.2, -3.0], az: -6, el: 10, w: 24 },
    { t: 62.4, T: [-.4, .95, 1.5], az: 18, el: 8, w: 7.6 },
    { t: 64.6, T: [-2.4, 1.0, 1.4], az: 22, el: 7, w: 4.8 },
    { t: 66.2, T: [-.9, .85, .4], az: -12, el: 9, w: 6.4 },
    { t: 67.8, T: [.7, .9, -.5], az: 6, el: 10, w: 7.0 },
    { t: 69.6, T: [1.6, .9, .2], az: -26, el: 8, w: 6.2 },
    { t: 71.4, T: [1.8, .9, -.2], az: 4, el: 8, w: 7 },
    { t: 73.4, T: [2.0, 1.3, -1.0], az: 62, el: 4, w: 4.6 },
    { t: 75.8, T: [2.0, 2.2, -1.2], az: 30, el: 12, w: 9 },
    { t: 78.5, T: [.6, 3.4, -1.0], az: 4, el: 20, w: 18 },
    { t: 82.0, T: [.4, 4.8, -4.0], az: -6, el: 26, w: 28 },
    { t: 85.0, T: [.4, 5.4, -5.0], az: -8, el: 28, w: 32, stop: true },
  ].map(k => ({ fov: 26, dy: 330, ...k, t: k.t - RT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#6a6a98', '#32283a', .86, '#ffb080', 1.6, [-4, 2.8, -9], .6, '#ffcf9a', [7, 4.5, 10], 12), D(72, '#7a76a2', '#38303c', .9, '#ffb888', 1.7, [-4, 2.4, -9], .65, '#ffcf9a', [7, 4.5, 10], 12), D(86, '#7a76a2', '#403640', .95, '#ffc090', 1.7, [-4, 2.0, -9], .7, '#ffd8a8', [7, 4.5, 10], 12)];
  const bg = [[60, ['#1c2a60', '#c88a88']], [72, ['#2a3c78', '#e49a80']], [86, ['#2f4586', '#f0a878']]];
  return { group: g, update, light, bg, cam, HAZE, fog: (lt, t, c) => [HAZE, c.D + 3, c.D + 26 + 80 * smooth(76, 80, t)], sunElev: t => lerp(9, 3.5, smooth(60, 84, t)) };
}
