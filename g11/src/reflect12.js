// Episode 12, 1:00-1:25: the terrace over the cloud sea at golden hour. A traveller in today's clothes stands by a small familiar house, a bench and a lantern (h1). A path of stones leads away into the haze,
// but only the next stone or two can be seen. The traveller steps onto the first stone (h2) and each step lights the stone ahead (h3). At the last line the whole path lights toward the horizon and four more people
// step onto it behind (h4).
// Cinematic interpretation: the stones, the glow and the followers are a picture of "taking the next step" and of blessing others through it; they are not in Scripture.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, spriteGlow, pool } from './kit.js';
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
const HOME = [-3.0, .8], NS = 20, SP = 1.7, ST0 = 68.2, STEP = 1.05;                // the traveller's start, the number of stones, the spacing, arrival at stone 0, seconds per stone
export const stone = i => [1.0 + 1.5 * Math.sin(i * .42), .04 + Math.max(0, i - 5) * .1, -2.2 - i * SP];
const A = k => ST0 + k * STEP;                                                              // time the traveller arrives on stone k
const T = { all: 78.6, follow: 79.2 };

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

  // ---- the path of stones: only the next stones can be seen; at the last line the whole path lights toward the horizon
  const stoneMat = lam.clone(); stoneMat.emissive.set('#5a4220');
  const mkStone = (i) => { const r = .62 + .08 * R(), b = new GB(R); b.add(G.ico0, pk(R, ['#d4c4a0', '#c4b48f', '#dccca8']), [0, .06, 0], [r, .17, r * .95], [0, R() * 3, 0], .06); b.add(G.ico0, '#9a8a6e', [0, -.12, 0], [r * .8, .16, r * .76], [0, R() * 3, 0], .06); b.add(G.ico0, '#6a5a44', [0, -.3, 0], [r * .5, .16, r * .46], [0, R() * 3, 0], .06);
    const m = new THREE.Mesh(b.build(), stoneMat); m.castShadow = true; m.receiveShadow = true; return m; };
  const stones = Array.from({ length: NS }, (_, i) => { const [x, y, z] = stone(i), m = mkStone(i), gl = pool(1.25, 0xffd27a, 0), sg = spriteGlow(x, y + .3, z, 1.4, 0xffd890, 0);
    m.position.set(x, y - .2, z); m.scale.setScalar(.001); m.visible = false; gl.position.set(x, y + .05, z); gl.material.fog = false; sg.material.fog = false; g.add(m, gl, sg); return { m, gl, sg, x, y, z }; });

  // ---- people in today's clothes: the traveller (with a pack), then four more
  const mkP = (i, extra = {}) => { const p = makeModern(R, { skin: pk(R, SK), jacket: pk(R, JK), jacket2: pk(R, JK), long: i % 2 === 1, sc: 1.1, ...extra }); g.add(p.group); return p; };
  const trav = mkP(0, { bag: '#8a5a3a', hat: null }), fol = [1, 2, 3, 4].map(i => mkP(i, i === 3 ? { hat: '#8a6a46' } : {}));
  const walkAnim = (t, ph = 0) => { const w = Math.sin(t * 6.2 + ph); return { a0x: .4 * w, a1x: -.4 * w, hop: Math.abs(w) * .02, leg: .5 * w }; };
  const setLegs = (p, sw) => { p.legs[0].rotation.x = sw; p.legs[1].rotation.x = -sw; };
  const place = (p, x, y, z, ry, o = {}) => { p.group.position.set(x, y + (o.hop || 0), z); p.group.rotation.set(o.lx || 0, ry, 0, 'YXZ'); p.arms[0].rotation.set(o.a0x || 0, 0, -.06); p.arms[1].rotation.set(o.a1x || 0, 0, .06); };
  // a walker's position along the list of stones: [home, stone 0, stone 1, ...] with arrival times arr(k) for stone k (home departs at dep)
  function walk(t, dep, arr, home) { const pts = [[home[0], 0, home[1]], ...stones.map(s => [s.x, s.y + .02, s.z])];
    const times = [dep, ...Array.from({ length: NS }, (_, k) => arr(k))]; if (t <= times[0]) return { p: pts[0], v: [pts[1][0] - pts[0][0], pts[1][2] - pts[0][2]], mv: false };
    let i = 1; while (i < times.length - 1 && t > times[i]) i++; const a = pts[i - 1], b = pts[i], ta = times[i - 1], tb = times[i], u = ease.inOutSine(clamp((t - ta) / (tb - ta))), mv = t > ta && t < tb && (tb - ta) < 5;
    const arc = Math.sin(Math.PI * u) * (i === 1 ? .06 : .16); return { p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + (mv ? arc : 0), lerp(a[2], b[2], u)], v: [b[0] - a[0], b[2] - a[2]], mv, k: i - 1 }; }
  const motes = makeMotes({ n: 90, area: [16, 5.4, 36], size: .035, v: .12, seed: 85, color: 0xffd8a0 }); g.add(motes.mesh);
  const flock = Array.from({ length: 5 }, (_, i) => { const b = makeBird(rng(900 + i), '#f4f0e6'); b.group.scale.setScalar(.55); g.add(b.group); return { ...b, r: 5 + i, h: 5 + i * .5, w: (.18 + i * .02) * (i % 2 ? 1 : -1), ph: i * 1.3 }; });

  function update(lt, t, cam, camPos) {
    const cp = camPos && (camPos.position || camPos);
    sea.update(t, cp, 16); sea.mat.color.set(t < 72 ? '#e8c0a8' : '#f0c8a0');
    winGlow.material.opacity = .75 + .1 * Math.sin(t * 2.1); lanGlow.material.opacity = .6 * (.85 + .15 * Math.sin(t * 9) * Math.sin(t * 5.3)); lanGlow2.material.opacity = .55;
    // the stones: a stone is revealed when the traveller is two stones away; at h4 everything else appears in a wave along the path and lights up
    const all = ease.inOutSine(seg(t, T.all, T.all + 1.0));
    stones.forEach((s, i) => { const ahead = A(i - 2) - .2, rv = t < T.all ? ahead : Math.min(ahead, T.all + .14 * Math.max(0, i - 8)); const u = ease.outBack(seg(t, rv, rv + .8));
      const show = i < 2 ? ease.outBack(seg(t, 64.2 + i * .8, 65.0 + i * .8)) : u; s.m.scale.setScalar(Math.max(.001, show)); s.m.visible = show > .01; s.m.position.y = s.y - .2 + .03 * Math.sin(t * .9 + i * 1.3) * (i > 5 ? 1 : 0);
      const stepped = smooth(A(i) - .15, A(i) + .35, t), wave = smooth(T.all + .14 * Math.max(0, i - 8), T.all + .14 * Math.max(0, i - 8) + .9, t) * all, lit = Math.max(stepped * (.6 + .4 * (1 - smooth(0, 2.4, t - A(i)))), wave * .75), pul = .9 + .1 * Math.sin(t * 2.2 + i * .6);
      s.gl.material.opacity = .62 * lit * pul * (show > .02 ? 1 : 0); s.gl.visible = lit > .01 && show > .02; s.sg.material.opacity = .5 * lit * pul * (show > .02 ? 1 : 0); s.sg.visible = s.gl.visible; });
    // the traveller: stands at the lantern, steps onto stone 0 at 68.2 and goes on, one stone a second, to stone 14
    { const W = walk(t, 66.9, k => k <= 14 ? A(k) : A(14) + 99, HOME), ry = Math.atan2(W.v[0], W.v[1]), w = walkAnim(t, 0);
      const stand = !W.mv; const atEnd = t > A(14), still = Math.sin(t * .8) * .05;
      place(trav, W.p[0], W.p[1], W.p[2], stand && t < 66.9 ? Math.atan2(stone(0)[0] - HOME[0], stone(0)[2] - HOME[1]) + .45 * (1 - smooth(60, 61, t)) * 0 : ry, { a0x: W.mv ? w.a0x : -.1 + still, a1x: W.mv ? w.a1x : -.06 - still, hop: 0 });
      setLegs(trav, W.mv ? w.leg : 0); }
    // the followers: from the house, after the path has lit
    fol.forEach((p, i) => { const d = T.follow + i * 1.15, W = walk(t, d, k => d + 1.5 + k * STEP, [-5.0 + (i % 2) * .5, -1.4 - (i > 1 ? .5 : 0)]), vis = smooth(d - .2, d + .1, t), ry = Math.atan2(W.v[0], W.v[1]), w = walkAnim(t, i * 1.7);
      p.group.visible = vis > .01; place(p, W.p[0], W.p[1], W.p[2], ry, { a0x: W.mv ? w.a0x : 0, a1x: W.mv ? w.a1x : 0 }); setLegs(p, W.mv ? w.leg : 0);
      if (t < d) { p.group.visible = false; } });
    flock.forEach((b, i) => { const a = t * b.w + b.ph; b.group.position.set(Math.cos(a) * b.r, b.h + Math.sin(t * .5 + i), -6 + Math.sin(a) * b.r * .6); b.group.rotation.set(0, Math.atan2(-Math.cos(a) * b.r * .6, -Math.sin(a) * b.r) * -1 + Math.PI, 0); b.wings.forEach((w, k) => w.rotation.x = (k ? 1 : -1) * Math.sin(t * 8 + i * 1.3) * .6); });
    motes.update(t, .8, [1, .3, -14]);
  }
  const trk = (t0, dz = 0, dx = 0) => { const k = Math.min(NS - 1, Math.max(0, (t0 - ST0) / STEP)), i = Math.floor(k), f = k - i, a = stone(i), b = stone(Math.min(NS - 1, i + 1)); return [lerp(a[0], b[0], f) + dx, lerp(a[1], b[1], f) + 1.0, lerp(a[2], b[2], f) + dz]; };
  const cam = [
    { t: 60, T: [0, 3.2, -10], az: -6, el: 10, w: 30 },
    { t: 63.0, T: [-.4, 2.6, -6.0], az: -4, el: 9, w: 20 },
    { t: 65.0, T: [-2.2, 1.0, .5], az: 22, el: 8, w: 6.8 },
    { t: 66.9, T: [-1.8, 1.0, -.4], az: 20, el: 7, w: 5.0 },
    { t: 68.4, T: [.4, .9, -2.0], az: 14, el: 8, w: 5.0 },
    { t: 71.0, T: trk(71.0, 0, .4), az: 26, el: 10, w: 4.2 },
    { t: 73.2, T: trk(73.2, 0, .2), az: 18, el: 9, w: 4.4 },
    { t: 75.8, T: trk(75.8, -.6), az: 10, el: 9, w: 5.4 },
    { t: 78.4, T: trk(78.4, -1.2), az: 4, el: 12, w: 8.0 },
    { t: 80.4, T: [1.5, 2.4, -14], az: -2, el: 22, w: 20 },
    { t: 83.0, T: [1.4, 3.6, -16], az: -8, el: 26, w: 30 },
    { t: 85.0, T: [1.4, 4.0, -17], az: -10, el: 28, w: 34, stop: true },
  ].map(k => ({ fov: 26, dy: 330, ...k, t: k.t - RT.t0 }));
  const D = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const light = [D(60, '#6a6a98', '#32283a', .86, '#ffb080', 1.6, [-4, 2.8, -9], .6, '#ffcf9a', [7, 4.5, 10], 12), D(72, '#7a76a2', '#38303c', .9, '#ffb888', 1.7, [-4, 2.4, -9], .65, '#ffcf9a', [7, 4.5, 10], 12), D(86, '#7a76a2', '#403640', .95, '#ffc090', 1.7, [-4, 2.0, -9], .7, '#ffd8a8', [7, 4.5, 10], 12)];
  const bg = [[60, ['#1c2a60', '#c88a88']], [72, ['#2a3c78', '#e49a80']], [86, ['#2f4586', '#f0a878']]];
  return { group: g, update, light, bg, cam, HAZE, fog: (lt, t, c) => [HAZE, c.D + 3, c.D + 26 + 80 * smooth(T.all, T.all + 3.4, t)], sunElev: t => lerp(9, 3.5, smooth(60, 84, t)) };
}
