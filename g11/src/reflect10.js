// Episode 10, 1:00-1:25: a long table under string lights at golden hour. Twelve people stand around it, talking; one person stands apart at the edge, hands in pockets.
// At "Today, treat one person like family" one of the guests turns, walks over, and brings the person to the table. Skin tones, hair and dress are mixed at random.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, spriteGlow } from './kit.js';
import { ease, seg, keyed } from './util.js';
import { pk, roundTreeGeo, pineGeo, oliveGeo, peakGeo, makeMotes } from './props.js';
import { makeBird } from './fauna6.js';
import { underRock } from './terrain8.js';
import { cloudSea } from './world10.js';
import { LK } from './lights.js';

export const RT = { t0: 60, end: 85 };
const HAZE = '#d49a8a';
const SK = ['#c98d62', '#b57a50', '#d9a073', '#9c6a42', '#e4b48a', '#8a5a3a', '#ba8458'];
const JK = ['#7a8a9a', '#a2564e', '#5e7fa6', '#c9a15a', '#6c8a6a', '#8a6a9a', '#d8cfc0', '#4a6a78', '#b5654a'];
const TR = ['#27324c', '#3a3a44', '#4a4036', '#2e3c34', '#3a4a6a'];
const HR = ['#2a1a10', '#1f160d', '#3a2616', '#5a4128', '#6a4a2a', '#8a8478'];

// a present-day person (jacket, trousers, shoes); legs and arms pivot for walking and gestures
export function makeModern(R, o = {}) {
  const g = new THREE.Group(), b = new GB(R), jacket = o.jacket || pk(R, JK), jacket2 = o.jacket2 || pk(R, JK), trou = o.trou || pk(R, TR), skin = o.skin || pk(R, SK), hair = o.hair || pk(R, HR), shoe = '#17171f';
  b.box(jacket, [0, .75, 0], [.36, .46, .2], [0, 0, 0], .04); b.box(jacket2, [0, .54, 0], [.38, .1, .22], [0, 0, 0], .04); b.box(jacket2, [0, 1.0, .0], [.3, .1, .2], [0, 0, 0], .04);
  if (o.scarf) b.box(o.scarf, [0, .99, .02], [.3, .09, .22], [0, 0, 0], .03);
  b.add(G.cyl6, skin, [0, .98, 0], [.04, .07, .04], [0, 0, 0], .02); b.add(G.ico1, skin, [0, 1.12, 0], [.105, .118, .105], [0, 0, 0], .05);
  if (o.hat) { b.add(G.ico0, o.hat, [0, 1.19, -.01], [.12, .07, .125], [0, 0, 0], .05); b.box(o.hat, [0, 1.15, .06], [.2, .02, .1], [0, 0, 0], .03); }
  else b.add(G.ico0, hair, [0, 1.17, -.02], [.112, .08, .118], [0, 0, 0], .06);
  if (o.long) b.box(hair, [0, 1.02, -.09], [.2, .3, .07], [.08, 0, 0], .05);
  if (o.bag) b.box(o.bag, [0, .78, -.17], [.26, .32, .13], [0, 0, 0], .05);
  const body = new THREE.Mesh(b.build(), lam); body.castShadow = true; g.add(body);
  const legs = [], arms = [];
  for (const s of [-1, 1]) {
    const l = new GB(R); l.box(trou, [0, -.23, 0], [.125, .5, .135], [0, 0, 0], .04); l.box(shoe, [0, -.5, .04], [.135, .08, .22], [0, 0, 0], .03);
    const m = new THREE.Mesh(l.build(), lam); m.castShadow = true; m.position.set(.078 * s, .5, 0); g.add(m); legs.push(m);
    const a = new GB(R); a.box(jacket, [0, -.18, 0], [.085, .38, .085], [0, 0, 0], .04); a.add(G.ico0, skin, [0, -.4, 0], [.042, .042, .042], [0, 0, 0], .03);
    const am = new THREE.Mesh(a.build(), lam); am.castShadow = true; am.position.set(.215 * s, .94, 0); g.add(am); arms.push(am);
  }
  g.scale.setScalar(o.sc || 1.1); return { group: g, legs, arms, sc: o.sc || 1.1 };
}

export function makeReflect() {
  const R = rng(5353), g = new THREE.Group();
  // ---- the terrace: a floating lawn over the cloud sea
  { const gb = new GB(R); gb.add(new THREE.CylinderGeometry(11, 11.6, .5, 28, 1).translate(0, -.25, 0), '#6f8a48', [0, 0, 0], [1, 1, 1], [0, 0, 0], .08); gb.add(new THREE.CylinderGeometry(11.6, 11.5, .3, 28, 1).translate(0, -.65, 0), '#5a4a38', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
    for (let k = 0; k < 40; k++) { const a = R() * 6.28, r = 2 + R() * 8.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(z + 1) < 2.4 && Math.abs(x) < 6.2) continue; gb.add(G.ico0, pk(R, ['#7a9a52', '#68893f', '#86a35a']), [x, .02, z], [.22 + R() * .3, .05, .22 + R() * .3], [0, R() * 3, 0], .1); }
    for (let k = 0; k < 14; k++) { const a = R() * 6.28, r = 9.4 + R() * .9; gb.add(G.ico0, pk(R, ['#6e6a66', '#7a766e', '#5e5a58']), [Math.cos(a) * r, .05, Math.sin(a) * r], [.35 + R() * .3, .22 + R() * .2, .3 + R() * .3], [R() * 3, R() * 3, 0], .1); }
    const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; g.add(m); { const ur = underRock(rng(5354), 11.4); ur.position.set(0, -.2, 0); g.add(ur); } }
  // trees around the back and sides
  [[-7.6, -5.2, 1.3, 0], [-5.2, -7.0, 1.2, 1], [-2.0, -8.0, 1.4, 0], [1.8, -8.2, 1.3, 2], [5.0, -7.2, 1.2, 0], [7.8, -4.6, 1.3, 1], [8.6, -.4, 1.2, 0], [-8.6, -1.0, 1.2, 1], [-10.2, 5.2, 1.1, 0], [8.0, 4.4, 1.1, 2], [-4.4, -4.4, 1.0, 2], [4.4, -4.6, 1.0, 1]].forEach(([x, z, s, k]) => {
    const geo = k === 1 ? oliveGeo(s, R) : k === 2 ? pineGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f']); const m = new THREE.Mesh(geo, lam); m.position.set(x, 0, z); m.castShadow = true; m.rotation.y = R() * 6; g.add(m); });
  // far hills in the haze
  { const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#3a4666', '#303a5a', '#2a3350'];
    for (let i = 0; i < 20; i++) { const a = -Math.PI / 2 + (i / 19 - .5) * Math.PI * 1.4 + (R() - .5) * .1, r = 60 + R() * 30, s = 3 + R() * 3.4, c = cols[i % 3]; const m = new THREE.Mesh(peakGeo(s, R, [c, c, c], false), mat); m.scale.set(2.8, 1.0 + R() * .3, 2.0); m.position.set(Math.cos(a) * r, -3.0 + R() * 1.0, Math.sin(a) * r); m.rotation.y = R() * 6; g.add(m); } }
  const sea = cloudSea(rng(5355), 140, [[0, 0, 14]]); g.add(sea.mesh); sea.mat.color.set('#e8c0a8'); sea.mat.emissive.set('#40304a');

  // ---- the table
  const TZ = -1.0, TX0 = -3.7, TX1 = 3.7;
  { const t = new GB(R); t.box('#e8dcc0', [0, .86, TZ], [TX1 - TX0 + .5, .06, 1.15], [0, 0, 0], .03); t.box('#e0d2b2', [0, .6, TZ - .58], [TX1 - TX0 + .5, .5, .02], [0, 0, 0], .03); t.box('#e0d2b2', [0, .6, TZ + .58], [TX1 - TX0 + .5, .5, .02], [0, 0, 0], .03);
    for (const x of [TX0 + .3, 0, TX1 - .3]) for (const z of [-.45, .45]) t.box('#4a3624', [x, .4, TZ + z], [.08, .8, .08], [0, 0, 0], .04);
    for (let k = 0; k < 9; k++) for (const s of [-1, 1]) { const x = TX0 + .3 + k * .85; t.add(G.cyl6, '#f4efe6', [x, .9, TZ + s * .36], [.16, .02, .16], [0, 0, 0], .02); t.add(G.cyl6, pk(R, ['#b5654a', '#c9a15a', '#5e7fa6', '#8a9a6a']), [x + .18 * s, .9, TZ + s * .3], [.04, .09, .04], [0, 0, 0], .03); }
    for (let k = 0; k < 6; k++) { const x = TX0 + .7 + k * 1.35; t.add(G.ico0, '#b8844a', [x, .95, TZ + (k % 2 ? .1 : -.1)], [.2, .08, .1], [0, R() * 3, 0], .05); t.add(G.ico0, pk(R, ['#a8503a', '#6a8a3a', '#d8a040']), [x + .4, .93, TZ + .0], [.12, .08, .12], [0, 0, 0], .06); }
    const m = new THREE.Mesh(t.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  // lanterns on the table and the string lights
  const lights = []; for (let k = 0; k < 5; k++) { const x = -3 + k * 1.5, lb = new GB(R); lb.box('#3a2a1c', [x, .95, TZ], [.12, .14, .12], [0, 0, 0], .03); const lm = new THREE.Mesh(lb.build(), lam); g.add(lm); const sp = spriteGlow(x, 1.02, TZ, 1.0, 0xffb860, .0); g.add(sp); lights.push(sp); }
  const bulbs = []; const poles = [[-5.2, -3.4], [5.2, -3.4], [-5.2, 1.6], [5.2, 1.6]];
  { const pb = new GB(R); for (const [x, z] of poles) pb.box('#4a3624', [x, 1.35, z], [.1, 2.7, .1], [0, 0, 0], .04); const pm = new THREE.Mesh(pb.build(), lam); pm.castShadow = true; g.add(pm); }
  for (const [za, zb] of [[-3.4, -3.4], [1.6, 1.6]]) for (let k = 0; k < 17; k++) { const u = k / 16, x = lerp(-5.2, 5.2, u), y = 2.65 - .55 * Math.sin(Math.PI * u), sp = spriteGlow(x, y, za, .5, 0xffd890, 0); g.add(sp); bulbs.push({ sp, ph: R() * 6, u }); }
  for (const zz of [-3.4, 1.6]) { const wb = new GB(R); for (let k = 0; k < 16; k++) { const u = (k + .5) / 16, x = lerp(-5.2, 5.2, u), y = 2.65 - .55 * Math.sin(Math.PI * u); wb.box('#2a2018', [x, y, zz], [10.4 / 16 + .02, .015, .015], [0, 0, .12 * Math.cos(Math.PI * u) * 0], .01); } g.add(new THREE.Mesh(wb.build(), lam)); }

  // ---- people
  const mkP = (o = {}) => { const p = makeModern(R, o); g.add(p.group); return p; };
  const guests = [];
  const BACK = [-3.0, -1.8, -.6, .6, 1.8, 3.0], FRONT = [-1.2, .4, 2.0, 3.4];
  BACK.forEach((x, i) => guests.push({ p: mkP({ long: R() < .35, hat: R() < .15 ? '#8a6a46' : null, scarf: R() < .3 ? pk(R, ['#d86a4a', '#e8dcc0', '#3a5a8a']) : null }), x, z: TZ - 1.0, ry: 0 + (R() - .5) * .3, i }));
  FRONT.forEach((x, i) => guests.push({ p: mkP({ long: R() < .35, bag: R() < .3 ? '#7b5a3a' : null }), x, z: TZ + 1.25, ry: Math.PI + (R() - .5) * .3, i: i + 6, front: true }));
  const G_END = { p: mkP({ long: false, hat: null }), x: TX1 + .8, z: TZ, ry: -Math.PI / 2, i: 10 }; guests.push(G_END);
  const HOST = { p: mkP({ jacket: '#d4965a', jacket2: '#b87a44', trou: '#3a4a6a', skin: '#c08258', hair: '#2a1a10', long: true, sc: 1.1 }), i: 11 }; HOST.p.group.visible = true;
  const LONE = { p: mkP({ jacket: '#8c9ab0', jacket2: '#74839a', trou: '#4c566c', skin: '#b57a50', hair: '#1f160d', hat: null, scarf: null, bag: '#4a4a58', sc: 1.1 }) };
  const motes = makeMotes({ n: 70, area: [16, 3.4, 12], size: .035, v: .12, seed: 85, color: 0xffd8a0 }); g.add(motes.mesh);
  const flock = Array.from({ length: 5 }, (_, i) => { const b = makeBird(rng(900 + i), '#f4f0e6'); b.group.scale.setScalar(.55); g.add(b.group); return { ...b, r: 5 + i, h: 5 + i * .5, w: (.18 + i * .02) * (i % 2 ? 1 : -1), ph: i * 1.3 }; });

  // positions of the host and the lone person over time (absolute seconds)
  const LP = [-7.6, 2.4], HP0 = [TX0 - .7, TZ - .1], MEET = [-6.5, 1.6], HP1 = [-3.7, .35], LP1 = [-2.8, .45];
  const T = { turn: [77.6, 78.8], go: [79.4, 81.6], offer: [81.6, 82.4], walk: [82.4, 84.5] };
  const walkAnim = (t, ph = 0) => { const w = Math.sin(t * 6 + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .02, leg: .5 * w }; };
  function setLegs(p, sw) { p.legs[0].rotation.x = sw; p.legs[1].rotation.x = -sw; }
  function place(p, x, z, ry, o = {}) { p.group.position.set(x, o.hop || 0, z); p.group.rotation.set(o.lx || 0, ry, 0, 'YXZ'); p.arms[0].rotation.set(o.a0x || 0, 0, -.06); p.arms[1].rotation.set(o.a1x || 0, 0, .06); }

  function update(lt, t, cam, camPos) {
    const cp = camPos && (camPos.position || camPos);
    sea.update(t, cp, 16); mat_(sea.mat, t);
    // the guests: small shifts and gestures while they talk
    guests.forEach(q => { const s = q.i * 1.7, o = { lx: .01 * Math.sin(t * 1.1 + s), a0x: -.25 * Math.max(0, Math.sin(t * .8 + s)) - .1 * Math.sin(t * 2.3 + s) * .3, a1x: -.18 * Math.max(0, Math.sin(t * .7 + s * 1.3)) };
      let ry = q.ry + .08 * Math.sin(t * .6 + s), x = q.x, z = q.z;
      if (q.front && q.i === 6) { const m = ease.inOutSine(seg(t, 83.9, 84.8)); x = lerp(q.x, q.x + .15, m); ry = lerp(ry, Math.PI + .55, m); }      // the nearest guest turns to greet
      if (q === G_END) { ry = lerp(q.ry, q.ry + .5, ease.inOutSine(seg(t, 83.8, 84.8))) + .05 * Math.sin(t * .6); }
      place(q.p, x, z, ry, o); setLegs(q.p, 0); });
    // the person who stands apart: weight shifts, looks down, then looks up and steps forward
    { const look = ease.inOutSine(seg(t, 81.6, 82.4)), wlk = seg(t, T.walk[0], T.walk[1]), e = ease.inOutSine(wlk), x = lerp(MEET[0] - .9, LP1[0], e), z = lerp(MEET[1] + .8, LP1[1], e);
      const idle = t < T.walk[0], px = idle ? LP[0] : x, pz = idle ? LP[1] : z, mv = !idle && wlk < 1, w = walkAnim(t, 1.3), face = idle ? lerp(.9, .55, look) : Math.atan2(HP1[0] - x + .001, HP1[1] - z) * (1 - wlk) + Math.PI * wlk;
      const place_ = (t0 => t < 82.4 ? { x: LP[0], z: LP[1] } : { x: px, z: pz })(); const pos = t < 82.4 ? [LP[0], LP[1]] : [lerp(LP[0], LP1[0], e), lerp(LP[1], LP1[1], e)];
      const f2 = t < 82.4 ? lerp(.95, .55, look) : lerp(.55, Math.PI, ease.inOutSine(seg(t, 83.6, 84.6)));
      place(LONE.p, pos[0], pos[1], f2, { lx: t < 82.4 ? .1 * (1 - look) : (mv ? 0 : 0), a0x: t < 82.4 ? .22 : (mv ? w.a0x : .1), a1x: t < 82.4 ? .22 : (mv ? w.a1x : .1), hop: mv ? w.hop : 0 }); setLegs(LONE.p, mv ? w.leg : 0);
      if (t < 82.4) LONE.p.group.rotation.x = .1 * (1 - look) + .02 * Math.sin(t * .8); }
    // the host: turns at the end of the table, walks over, offers a hand, walks back with the person
    { const turn = ease.inOutSine(seg(t, T.turn[0], T.turn[1])), go = ease.inOutSine(seg(t, T.go[0], T.go[1])), back = ease.inOutSine(seg(t, T.walk[0], T.walk[1])), a = lerp(HP0[0], MEET[0], go), b = lerp(HP0[1], MEET[1], go);
      const x = t < T.walk[0] ? a : lerp(MEET[0], HP1[0], back), z = t < T.walk[0] ? b : lerp(MEET[1], HP1[1], back), mv = (t > T.go[0] && t < T.go[1]) || (t > T.walk[0] && t < T.walk[1]), w = walkAnim(t, 0), offer = ease.inOutSine(seg(t, T.offer[0], T.offer[0] + .5)) * (1 - ease.inOutSine(seg(t, T.offer[1], T.offer[1] + .4)));
      let ry = t < T.go[0] ? lerp(Math.PI / 2, -Math.PI / 2 - .5, turn) : t < T.walk[0] ? Math.atan2(MEET[0] - HP0[0], MEET[1] - HP0[1]) : lerp(Math.atan2(MEET[0] - HP0[0], MEET[1] - HP0[1]) + Math.PI, Math.PI, back);
      if (t >= T.go[1] && t < T.walk[0]) ry = lerp(ry, Math.atan2(LP[0] - MEET[0], LP[1] - MEET[1]), .8);
      place(HOST.p, x, z, ry, { a0x: mv ? w.a0x : -.12 * offer, a1x: mv ? w.a1x : -1.25 * offer, hop: mv ? w.hop : 0, lx: 0 }); setLegs(HOST.p, mv ? w.leg : 0); }
    // lights
    lights.forEach((s, i) => { s.material.opacity = (.55 + .12 * Math.sin(t * 3 + i)) * smooth(60, 64, t); });
    bulbs.forEach(b => { b.sp.material.opacity = (.6 + .25 * Math.sin(t * 2.4 + b.ph)) * smooth(60, 63, t); });
    flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.position.set(Math.cos(a) * b.r, b.h + Math.sin(t * .5 + i), -4 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
    motes.update(t, .8, [0, .3, -1]);
  }
  const mat_ = (m, t) => { m.color.set(t < 72 ? '#e8c0a8' : '#f0c8a0'); };
  const cam = [
    { t: 60, T: [0, 1.0, -1.0], az: 10, el: 22, w: 16 },
    { t: 63.2, T: [.5, 1.1, -1.0], az: 6, el: 15, w: 10.5 },
    { t: 66.2, T: [-2.2, 1.2, -1.2], az: 16, el: 8, w: 6.0 },
    { t: 69.0, T: [1.6, 1.2, -1.3], az: -10, el: 7, w: 6.4 },
    { t: 71.4, T: [-4.8, 1.1, 0.4], az: 30, el: 9, w: 8.4 },
    { t: 73.4, T: [-7.0, 1.15, 2.0], az: 14, el: 6, w: 3.8 },
    { t: 76.0, T: [-6.2, 1.2, 1.4], az: -12, el: 8, w: 6.8 },
    { t: 78.6, T: [-5.0, 1.2, .6], az: 4, el: 9, w: 9.6 },
    { t: 81.0, T: [-5.6, 1.2, 1.0], az: -8, el: 8, w: 7.0 },
    { t: 83.2, T: [-4.6, 1.3, .6], az: 10, el: 10, w: 7.6 },
    { t: 85.0, T: [-2.0, 1.6, -.4], az: 16, el: 17, w: 12.5, stop: true },
  ].map(k => ({ fov: 26, dy: 330, ...k, t: k.t - RT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#6a6a98', '#32283a', .86, '#ffb080', 1.6, [-4, 2.8, -9], .6, '#ffcf9a', [7, 4.5, 10], 12), D(72, '#7a76a2', '#38303c', .9, '#ffb888', 1.7, [-4, 2.4, -9], .65, '#ffcf9a', [7, 4.5, 10], 12), D(86, '#7a76a2', '#403640', .95, '#ffc090', 1.7, [-4, 2.0, -9], .7, '#ffd8a8', [7, 4.5, 10], 12)];
  const bg = [[60, ['#1c2a60', '#c88a88']], [72, ['#2a3c78', '#e49a80']], [86, ['#2f4586', '#f0a878']]];
  return { group: g, update, light, bg, cam, HAZE, fog: (lt, t, c) => [HAZE, c.D + 3, c.D + 30], sunElev: t => lerp(9, 3.5, smooth(60, 84, t)) };
}
