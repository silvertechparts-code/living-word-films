// Episode 11, 1:00-1:25: the terrace over the cloud sea at golden hour. Far off, in the haze, the unfinished tower of Babel (h1). Six people in today's clothes carry stones and timber
// and build a plain open shelter with a bench and a lantern (h2, h3). The light that touches it is soft and from above. At the last line they hang the lantern and gather in it (h4).
// Cinematic interpretation: the shelter is a picture of "build something for God"; it is not in Scripture.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, spriteGlow, shaft, pool } from './kit.js';
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
const JK = ['#7a8a9a', '#a2564e', '#5e7fa6', '#c9a15a', '#6c8a6a', '#8a6a9a', '#d8cfc0', '#4a6a78', '#b5654a'];
const SX = 0, SZ = -2.6, HW = 2.2, HD = 1.6, PH = 2.3;            // the shelter: centre, half width, half depth, post height
const T = { stones: [61.4, 65.2], posts: [66.0, 70.2], beams: [71.2, 73.2], roof: [73.4, 76.0], hang: [77.6, 78.6], lit: 78.7, gather: [79.0, 80.8] };

export function makeReflect() {
  const R = rng(5353), g = new THREE.Group();
  // ---- the terrace
  { const gb = new GB(R); gb.add(new THREE.CylinderGeometry(11, 11.6, .5, 28, 1).translate(0, -.25, 0), '#6f8a48', [0, 0, 0], [1, 1, 1], [0, 0, 0], .08); gb.add(new THREE.CylinderGeometry(11.6, 11.5, .3, 28, 1).translate(0, -.65, 0), '#5a4a38', [0, 0, 0], [1, 1, 1], [0, 0, 0], .1);
    for (let k = 0; k < 40; k++) { const a = R() * 6.28, r = 2 + R() * 8.6, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(x - SX) < HW + 1 && Math.abs(z - SZ) < HD + 1) continue; gb.add(G.ico0, pk(R, ['#7a9a52', '#68893f', '#86a35a']), [x, .02, z], [.22 + R() * .3, .05, .22 + R() * .3], [0, R() * 3, 0], .1); }
    for (let k = 0; k < 14; k++) { const a = R() * 6.28, r = 9.4 + R() * .9; gb.add(G.ico0, pk(R, ['#6e6a66', '#7a766e', '#5e5a58']), [Math.cos(a) * r, .05, Math.sin(a) * r], [.35 + R() * .3, .22 + R() * .2, .3 + R() * .3], [R() * 3, R() * 3, 0], .1); }
    const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; g.add(m); { const ur = underRock(rng(5354), 11.4); ur.position.set(0, -.2, 0); g.add(ur); } }
  [[-7.6, -5.2, 1.3, 0], [-5.2, -7.0, 1.2, 1], [-2.0, -8.0, 1.4, 0], [1.8, -8.2, 1.3, 2], [5.0, -7.2, 1.2, 0], [7.8, -4.6, 1.3, 1], [8.6, -.4, 1.2, 0], [-8.6, -1.0, 1.2, 1], [-10.2, 5.2, 1.1, 0], [8.0, 4.4, 1.1, 2], [-5.4, -4.6, 1.0, 2], [5.6, -4.8, 1.0, 1]].forEach(([x, z, s, k]) => {
    const geo = k === 1 ? oliveGeo(s, R) : k === 2 ? pineGeo(s, R) : roundTreeGeo(s, R, ['#5f9a46', '#52903e', '#6aa84f']); const m = new THREE.Mesh(geo, lam); m.position.set(x, 0, z); m.castShadow = true; m.rotation.y = R() * 6; g.add(m); });
  { const mat = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), cols = ['#3a4666', '#303a5a', '#2a3350'];
    for (let i = 0; i < 20; i++) { const a = -Math.PI / 2 + (i / 19 - .5) * Math.PI * 1.4 + (R() - .5) * .1, r = 60 + R() * 30, s = 3 + R() * 3.4, c = cols[i % 3]; const m = new THREE.Mesh(peakGeo(s, R, [c, c, c], false), mat); m.scale.set(2.8, 1.0 + R() * .3, 2.0); m.position.set(Math.cos(a) * r, -3.0 + R() * 1.0, Math.sin(a) * r); m.rotation.y = R() * 6; g.add(m); } }
  const sea = cloudSea(rng(5355), 140, [[0, 0, 14]]); g.add(sea.mesh); sea.mat.color.set('#e8c0a8'); sea.mat.emissive.set('#40304a');

  // ---- the far tower in the haze: eight finished tiers and a ninth half built (cinematic echo of the first half of the episode)
  const farTower = (() => { const b = new GB(R); for (let k = 0; k < 9; k++) { const s = 7.2 - k * .72, hh = k === 8 ? .8 : 1.5; b.box(k % 2 ? '#c4aa80' : '#cdb48a', [0, k * 1.5 + hh / 2, 0], [s, hh, s], [0, 0, 0], .05); b.box('#9a7c52', [0, k * 1.5 + .1, 0], [s + .1, .2, s + .1], [0, 0, 0], .03); }
    b.box('#6a4a2c', [0, 13.3, 0], [.12, 2.2, .12], [0, 0, 0], .04); const m = new THREE.Mesh(b.build(), lam); m.position.set(-13, -1.6, -31); m.scale.setScalar(1.0); g.add(m); return m; })();

  // ---- the shelter: stones, posts, beams, a pitched roof, a bench, a lantern
  const part = (b, y = 0) => { const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m); m.position.set(SX, y, SZ); return m; };
  const corners = [[-HW, -HD], [HW, -HD], [-HW, HD], [HW, HD], [0, -HD], [0, HD]];
  const stones = corners.map(([x, z]) => { const b = new GB(R); b.box('#a8a39a', [0, .1, 0], [.56, .2, .56], [0, .2, 0], .05); b.box('#938e84', [0, .24, 0], [.42, .12, .42], [0, -.2, 0], .05); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; m.position.set(SX + x, 0, SZ + z); m.scale.setScalar(.001); g.add(m); return m; });
  const posts = corners.map(([x, z]) => { const b = new GB(R); b.box('#7a5636', [0, PH / 2, 0], [.16, PH, .16], [0, 0, 0], .03); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.position.set(SX + x, .2, SZ + z); m.scale.set(1, .001, 1); g.add(m); return m; });
  const beams = (() => { const out = [], b1 = new GB(R); b1.box('#8a6642', [0, 0, 0], [HW * 2 + .5, .16, .18], [0, 0, 0], .03); const b2 = new GB(R); b2.box('#8a6642', [0, 0, 0], [.18, .16, HD * 2 + .3], [0, 0, 0], .03);
    for (const [z, geo, ax] of [[-HD, b1, 'x'], [HD, b1, 'x'], [0, b1, 'x']]) { const m = new THREE.Mesh(geo.build(), lam); m.castShadow = true; m.position.set(SX, .2 + PH + .02, SZ + z); m.scale.set(.001, 1, 1); g.add(m); out.push({ m, ax }); }
    for (const x of [-HW, HW]) { const m = new THREE.Mesh(b2.build(), lam); m.castShadow = true; m.position.set(SX + x, .2 + PH + .12, SZ); m.scale.set(1, 1, .001); g.add(m); out.push({ m, ax: 'z' }); } return out; })();
  const roof = (() => { const b = new GB(R), rh = 1.0, L = Math.hypot(HD + .5, rh), ang = Math.atan2(rh, HD + .5); for (const s of [-1, 1]) b.box('#a8604a', [0, rh / 2 + .0, s * (HD + .5) / 2], [HW * 2 + .9, .1, L], [s * ang, 0, 0], .04);
    b.box('#8a4a3a', [0, rh + .06, 0], [HW * 2 + .9, .14, .16], [0, 0, 0], .03); for (let k = 0; k < 9; k++) for (const s of [-1, 1]) b.box(k % 2 ? '#b66c52' : '#9a5440', [-HW - .35 + k * (HW * 2 + .7) / 8, rh / 2 + .07 - Math.abs(0) * 0, s * (HD + .5) / 2], [.4, .04, L * .98], [s * ang, 0, 0], .05);
    const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; m.position.set(SX, .2 + PH + .26, SZ); m.scale.set(1, .001, 1); g.add(m); return m; })();
  const bench = (() => { const b = new GB(R); b.box('#8a6642', [0, .42, 0], [2.4, .08, .5], [0, 0, 0], .03); for (const x of [-1.0, 1.0]) b.box('#6a4a2c', [x, .2, 0], [.1, .4, .4], [0, 0, 0], .03); const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; m.receiveShadow = true; m.position.set(SX, 0, SZ - HD + .55); m.scale.setScalar(.001); g.add(m); return m; })();
  const lantern = (() => { const gr = new THREE.Group(), b = new GB(R); b.box('#3a2a1c', [0, 0, 0], [.2, .26, .2], [0, 0, 0], .03); b.box('#2a1c10', [0, .17, 0], [.24, .05, .24], [0, 0, 0], .02); b.box('#2a1c10', [0, -.15, 0], [.24, .04, .24], [0, 0, 0], .02); const m = new THREE.Mesh(b.build(), lam); gr.add(m);
    const chain = new THREE.Mesh(new THREE.BoxGeometry(.015, 1, .015), new THREE.MeshBasicMaterial({ color: 0x2a1c10, toneMapped: false })); gr.add(chain); gr.position.set(SX, 0, SZ); g.add(gr); return { gr, chain }; })();
  const lGlow = spriteGlow(SX, 1.7, SZ, 2.6, 0xffb860, 0), lGlow2 = spriteGlow(SX, 1.7, SZ, 1.0, 0xffe6a8, 0); g.add(lGlow, lGlow2);
  const lPool = pool(3.2, 0xffc878, 0); lPool.position.set(SX, .09, SZ); g.add(lPool);
  const beam = shaft(14, 2.2, 2.6, [1, .86, .56], 1, .5); beam.position.set(SX, .3, SZ); beam.visible = false; g.add(beam);       // soft light from above, over the finished roof
  // string lights from the shelter ridge to two poles (they come on with the lantern)
  const bulbs = []; { const pb = new GB(R); for (const [x, z] of [[-4.6, -1.0], [4.6, -1.0]]) pb.box('#4a3624', [x, 1.25, z], [.1, 2.5, .1], [0, 0, 0], .04); const pm = new THREE.Mesh(pb.build(), lam); pm.castShadow = true; g.add(pm);
    for (const sx of [-1, 1]) for (let k = 0; k < 8; k++) { const u = (k + 1) / 9, x = lerp(sx * 4.6, sx * (HW + .3), u), z = lerp(-1.0, SZ + HD + .2, u), y = lerp(2.5, PH + .85, u) - .3 * Math.sin(Math.PI * u), sp = spriteGlow(x, y, z, .5, 0xffd890, 0); g.add(sp); bulbs.push({ sp, ph: R() * 6 }); } }

  // ---- six builders (today's clothes): they carry stones, then timber, from a stack on the left to the shelter, and walk back for more
  const people = Array.from({ length: 6 }, (_, i) => { const p = makeModern(R, { skin: pk(R, SK), jacket: pk(R, JK), jacket2: pk(R, JK), long: i % 3 === 1, hat: i === 4 ? '#8a6a46' : null, sc: 1.1 }); g.add(p.group);
    const st = new THREE.Mesh(new THREE.BoxGeometry(.3, .18, .22), new THREE.MeshLambertMaterial({ color: 0xa8a39a })), tb = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, .95), new THREE.MeshLambertMaterial({ color: 0x8a6642 }));
    st.position.set(0, .62, .3); tb.position.set(0, .64, .34); st.visible = tb.visible = false; p.group.add(st, tb); return { p, st, tb, i }; });
  { const sb = new GB(R); for (let k = 0; k < 7; k++) sb.box('#8a6642', [0, .06 + k * .1, 0], [.9, .08, .08], [0, 0, 0], .04); for (let k = 0; k < 6; k++) sb.box('#a8a39a', [1.2 + (k % 3) * .32, .1 + Math.floor(k / 3) * .17, .1], [.3, .16, .22], [0, k, 0], .06); const sm = new THREE.Mesh(sb.build(), lam); sm.position.set(-4.7, 0, -.4); sm.castShadow = true; g.add(sm); }
  const STACK = [-3.9, -.5], SITE = i => [[-HW - .8, SZ + HD + .3], [-1.2, SZ + HD + .8], [1.2, SZ + HD + .8], [HW + .8, SZ + HD + .3], [-HW - .9, SZ - .2], [HW + .9, SZ - .2]][i];
  const GATH = [[-1.2, SZ + .15, 2.6], [-.45, SZ + 1.0, 3.0], [.55, SZ + 1.0, 3.2], [1.25, SZ + .1, 3.6], [.45, SZ - .75, -.4], [-.5, SZ - .75, .4]];
  const walkAnim = (t, ph = 0) => { const w = Math.sin(t * 6 + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .02, leg: .5 * w }; };
  function setLegs(p, sw) { p.legs[0].rotation.x = sw; p.legs[1].rotation.x = -sw; }
  function place(p, x, z, ry, o = {}) { p.group.position.set(x, o.hop || 0, z); p.group.rotation.set(o.lx || 0, ry, 0, 'YXZ'); p.arms[0].rotation.set(o.a0x || 0, 0, -.06); p.arms[1].rotation.set(o.a1x || 0, 0, .06); }
  const C = 7.0;
  function loopAt(i, t) { const u = ((((t - 61.0) + i * 1.12) % C) + C) % C / C, a = [STACK[0], STACK[1] - .3 + i * .3], b = SITE(i); let x, z, ph = 'idle', mv = false, ry;
    if (u < .42) { const k = ease.inOutSine(u / .42); x = lerp(a[0], b[0], k); z = lerp(a[1], b[1], k); ph = 'carry'; mv = true; ry = Math.atan2(b[0] - a[0], b[1] - a[1]); }
    else if (u < .52) { x = b[0]; z = b[1]; ph = 'put'; ry = Math.atan2(SX - b[0], SZ - b[1]); }
    else if (u < .92) { const k = ease.inOutSine((u - .52) / .4); x = lerp(b[0], a[0], k); z = lerp(b[1], a[1], k); ph = 'back'; mv = true; ry = Math.atan2(a[0] - b[0], a[1] - b[1]); }
    else { x = a[0]; z = a[1]; ph = 'pick'; ry = Math.atan2(b[0] - a[0], b[1] - a[1]); } return { x, z, ph, mv, ry }; }
  const motes = makeMotes({ n: 70, area: [16, 3.4, 12], size: .035, v: .12, seed: 85, color: 0xffd8a0 }); g.add(motes.mesh);
  const flock = Array.from({ length: 5 }, (_, i) => { const b = makeBird(rng(900 + i), '#f4f0e6'); b.group.scale.setScalar(.55); g.add(b.group); return { ...b, r: 5 + i, h: 5 + i * .5, w: (.18 + i * .02) * (i % 2 ? 1 : -1), ph: i * 1.3 }; });

  function update(lt, t, cam, camPos) {
    const cp = camPos && (camPos.position || camPos);
    sea.update(t, cp, 16); sea.mat.color.set(t < 72 ? '#e8c0a8' : '#f0c8a0');
    farTower.visible = true;
    stones.forEach((m, i) => { const u = ease.outBack(seg(t, T.stones[0] + i * .55, T.stones[0] + i * .55 + .8)); m.scale.setScalar(Math.max(.001, u)); m.visible = u > .01; });
    posts.forEach((m, i) => { const u = ease.outCubic(seg(t, T.posts[0] + i * .6, T.posts[0] + i * .6 + 1.2)); m.scale.y = Math.max(.001, u); m.visible = u > .01; });
    beams.forEach(({ m, ax }, i) => { const u = ease.outCubic(seg(t, T.beams[0] + i * .3, T.beams[0] + i * .3 + .9)); if (ax === 'x') m.scale.x = Math.max(.001, u); else m.scale.z = Math.max(.001, u); m.visible = u > .01; });
    { const u = ease.outCubic(seg(t, T.roof[0], T.roof[1])); roof.scale.y = Math.max(.001, u); roof.visible = u > .01; const b = ease.outBack(seg(t, T.roof[1] - .4, T.roof[1] + .6)); bench.scale.setScalar(Math.max(.001, b)); bench.visible = b > .01; }
    { const on = smooth(T.roof[0] + .6, T.roof[1] + 1.4, t) * (1 - smooth(T.lit + 1, T.lit + 3, t) * .35); beam.visible = on > .005; beam.material.opacity = .32 * on * (.9 + .1 * Math.sin(t * 1.7)); beam.scale.set(1, 1, 1); }
    // lantern: lowered on a chain from the ridge, then lit
    { const d = ease.outCubic(seg(t, T.hang[0], T.hang[1])), top = .2 + PH + 1.1, len = lerp(.25, 1.1, d), y = top - len - .15;
      lantern.gr.visible = d > .01; lantern.gr.position.set(SX, y, SZ + .1); lantern.chain.scale.y = len; lantern.chain.position.y = len / 2 + .12;
      const lit = smooth(T.lit - .3, T.lit + .9, t), fl = .85 + .15 * Math.sin(t * 9) * Math.sin(t * 5.3); lGlow.position.set(SX, y, SZ + .1); lGlow2.position.copy(lGlow.position); lGlow.material.opacity = .85 * lit * fl; lGlow2.material.opacity = .7 * lit; lGlow.visible = lGlow2.visible = lit > .01;
      lPool.material.opacity = .45 * lit * fl; lPool.visible = lit > .01; }
    bulbs.forEach(b => { b.sp.material.opacity = (.55 + .25 * Math.sin(t * 2.4 + b.ph)) * smooth(T.lit - .3, T.lit + 1.2, t); });
    // the builders
    const gt = ease.inOutSine(seg(t, T.gather[0], T.gather[1]));
    people.forEach(({ p, st, tb, i }) => { const L = loopAt(i, Math.min(t, T.gather[0])), G0 = GATH[i], w = walkAnim(t, i * 1.3);
      let x = L.x, z = L.z, ry = L.ry, mv = L.mv, a0 = 0, a1 = 0, lx = 0, hop = 0, leg = 0;
      if (t >= T.gather[0]) { x = lerp(L.x, G0[0], gt); z = lerp(L.z, G0[1], gt); mv = gt > .01 && gt < .99; ry = mv ? Math.atan2(G0[0] - L.x, G0[1] - L.z) : (gt >= .99 ? G0[2] : L.ry); }
      const carrying = t >= T.gather[0] ? false : L.ph === 'carry'; const timber = t > T.posts[0] - .6;
      if (L.ph === 'carry' && t < T.gather[0]) { a0 = a1 = -1.15; lx = .06; } else if ((L.ph === 'put' || L.ph === 'pick') && t < T.gather[0]) { a0 = a1 = -.5; lx = .22; }
      if (mv) { hop = w.hop; leg = w.leg; if (!carrying) { a0 = w.a0x; a1 = w.a1x; } } else if (t >= T.gather[0] && gt >= .99) { a0 = -.1 * Math.sin(t * .8 + i); a1 = -.08; lx = .02 * Math.sin(t * 1.1 + i); }
      place(p, x, z, ry, { a0x: a0, a1x: a1, lx, hop }); setLegs(p, leg);
      st.visible = carrying && !timber; tb.visible = carrying && timber; });
    flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.position.set(Math.cos(a) * b.r, b.h + Math.sin(t * .5 + i), -4 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
    motes.update(t, .8, [0, .3, -1]);
  }
  const cam = [
    { t: 60, T: [-6, 4.2, -12], az: -6, el: 8, w: 30 },
    { t: 63.4, T: [-6.5, 4.0, -10], az: -10, el: 8, w: 22 },
    { t: 65.4, T: [0, 1.2, -2.0], az: 12, el: 12, w: 10 },
    { t: 68.2, T: [.4, 1.5, -2.4], az: 20, el: 8, w: 7.4 },
    { t: 71.4, T: [-.6, 2.0, -2.6], az: -10, el: 7, w: 7.6 },
    { t: 74.6, T: [0, 1.7, -2.6], az: -16, el: 10, w: 8.4 },
    { t: 77.4, T: [0, 1.4, -2.5], az: -6, el: 6, w: 5.2 },
    { t: 79.4, T: [0, 1.0, -2.2], az: 8, el: 7, w: 4.6 },
    { t: 82.0, T: [0, 1.1, -2.4], az: 14, el: 9, w: 7.6 },
    { t: 85.0, T: [0, 1.5, -2.2], az: 20, el: 15, w: 12.5, stop: true },
  ].map(k => ({ fov: 26, dy: 330, ...k, t: k.t - RT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#6a6a98', '#32283a', .86, '#ffb080', 1.6, [-4, 2.8, -9], .6, '#ffcf9a', [7, 4.5, 10], 12), D(72, '#7a76a2', '#38303c', .9, '#ffb888', 1.7, [-4, 2.4, -9], .65, '#ffcf9a', [7, 4.5, 10], 12), D(86, '#7a76a2', '#403640', .95, '#ffc090', 1.7, [-4, 2.0, -9], .7, '#ffd8a8', [7, 4.5, 10], 12)];
  const bg = [[60, ['#1c2a60', '#c88a88']], [72, ['#2a3c78', '#e49a80']], [86, ['#2f4586', '#f0a878']]];
  return { group: g, update, light, bg, cam, HAZE, fog: (lt, t, c) => [HAZE, c.D + 3, c.D + 30 + 90 * (1 - smooth(60, 68, t))], sunElev: t => lerp(9, 3.5, smooth(60, 84, t)) };
}
