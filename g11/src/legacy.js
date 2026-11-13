// The modern half of Genesis 5: five small floating dioramas, one thread of gold running through all of them.
//   l1 family love · l2 faith lived (prayer) · l3 an elder passes wisdom on · l4 kindness, then time with family · l5 walking toward morning light
// Every one is a pure function of film time.
import * as THREE from 'three';
import { GB, G, rng, lerp, clamp, smooth, lam, V3, person, pose, slab, spriteGlow, bits, put, bump, pool, ringMesh, shaft } from './kit.js';
import { seg, ease } from './util.js';
import { pk, makeMotes, roundTreeGeo, basicV, peakGeo } from './props.js';
import { LK } from './lights.js';

export const VT = { l1: 60.0, l2: 64.4, l3: 67.0, l4: 75.0, l5: 79.3, end: 83.3 };
const TAU = Math.PI * 2;
const GOLD = 0xffc860;
const heartTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.shadowColor = '#ffb0c0'; g.shadowBlur = 14; const gr = g.createLinearGradient(0, 20, 0, 110); gr.addColorStop(0, '#ffd2a8'); gr.addColorStop(1, '#ff6a8c'); g.fillStyle = gr; g.beginPath(); g.moveTo(64, 104); g.bezierCurveTo(14, 70, 22, 22, 64, 46); g.bezierCurveTo(106, 22, 114, 70, 64, 104); g.fill(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const spr = (tex, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false })); sp.renderOrder = 10; sp.scale.set(s, s, 1); return sp; };
const GRASS = ['#6a4a30', '#8a6a48', '#5a4030', '#7a5a3c', '#4a3428'];

// hearts that drift up from a point
function hearts(g, n, seed, size = .45) {
  const Rr = rng(seed), arr = [];
  for (let i = 0; i < n; i++) { const s = spr(heartTex, size); g.add(s); arr.push({ s, ph: Rr() * 6, a: Rr() * TAU, r: .25 + Rr() * .7, per: 1.6 + Rr() * .8 }); }
  return (t, w, cx, cy, cz) => arr.forEach(o => { const v = (((t * .5 + o.ph) % o.per) + o.per) % o.per / o.per; o.s.position.set(cx + Math.cos(o.a) * o.r, cy + v * 1.5, cz + Math.sin(o.a) * o.r * .5); o.s.material.opacity = clamp(Math.sin(Math.PI * v) * 2.2) * w; o.s.scale.setScalar(size * (.4 + .6 * clamp(v * 4))); });
}
// confetti / sparkle burst, a pure function of seconds since the burst
function confetti(n, seed, cols) {
  const Rr = rng(seed), m = new THREE.InstancedMesh(G.tet, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), n), c = new THREE.Color(), PP = [];
  m.frustumCulled = false;
  for (let i = 0; i < n; i++) { PP.push({ a: Rr() * TAU, v: .6 + Rr() * 1.7, up: 1.6 + Rr() * 2.4, s: .035 + Rr() * .05, sp: 2 + Rr() * 8, d: Rr() * .3 }); m.setColorAt(i, c.set(pk(Rr, cols || ['#ffd36a', '#fff0c0', '#ffb0c0', '#ffffff', '#f2b84b']))); }
  m.instanceColor.needsUpdate = true;
  m.update = (u, ox, oy, oz) => { m.visible = u > 0 && u < 3.4; if (!m.visible) return; for (let i = 0; i < n; i++) { const p = PP[i], uu = Math.max(0, u - p.d), f = 1 - smooth(1.7, 3.2, uu), y = Math.max(.05, oy + p.up * uu - 2.4 * uu * uu); put(m, i, ox + Math.cos(p.a) * p.v * uu * .75, y, oz + Math.sin(p.a) * p.v * uu * .75, p.s * f, p.s * f, p.s * f, p.sp * uu, p.sp * uu * .7, 0); } m.instanceMatrix.needsUpdate = true; };
  return m;
}
const ripple = (r, u, maxS, op) => { r.visible = u > 0 && u < 1.6; const k = clamp(u / 1.6); r.scale.setScalar(.2 + maxS * ease.outCubic(k)); r.material.opacity = op * (1 - k) * (1 - k); };
// flat golden ribbon lying on the ground (or in the air), drawn on with setDraw(k)
function ribbon(pts, w, y, col = GOLD) {
  const cur = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[2] ?? y, p[1]))), N = 140, pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const p = cur.getPoint(i / N), tg = cur.getTangent(i / N), nx = -tg.z, nz = tg.x, l = Math.hypot(nx, nz) || 1, ww = w * (.35 + .65 * Math.min(1, i / 8));
    pos.push(p.x + nx / l * ww / 2, p.y, p.z + nz / l * ww / 2, p.x - nx / l * ww / 2, p.y, p.z - nz / l * ww / 2);
    if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, toneMapped: false, side: THREE.DoubleSide })); m.frustumCulled = false; m.renderOrder = 3;
  m.setDraw = k => g.setDrawRange(0, Math.floor(clamp(k) * N) * 6); m.curve = cur; return m;
}
// a small cottage; front (the door and two windows) faces +z
function cottage(R, x, z, w, d, h, wall, roof, ry = 0) {
  const g = new THREE.Group(), gb = new GB(R);
  gb.box(wall, [0, h / 2, 0], [w, h, d], [0, 0, 0], .04);
  gb.add(new THREE.ConeGeometry(1, 1, 4, 1).translate(0, .5, 0), roof, [0, h, 0], [w * .8, h * .78, d * .8], [0, Math.PI / 4, 0], .05);
  gb.box('#5a3a24', [0, .3, d / 2 + .004], [.26, .6, .02], [0, 0, 0], .02);
  gb.box('#8a8f98', [w * .3, h * 1.25, -d * .1], [.16, .5, .16], [0, 0, 0], .03);
  const m = new THREE.Mesh(gb.build(), lam); m.castShadow = true; m.receiveShadow = true; g.add(m);
  const wb = new GB(R); for (const sx of [-1, 1]) wb.box('#eab874', [sx * w * .3, h * .58, d / 2 + .012], [.2, .22, .012], [0, 0, 0], .02);
  g.add(new THREE.Mesh(wb.build(), basicV())); g.position.set(x, 0, z); g.rotation.y = ry; return g;
}
function fence(R, x0, z0, x1, z1, n = 7) {
  const gb = new GB(R); for (let i = 0; i < n; i++) { const k = i / (n - 1); gb.box('#8a6a44', [lerp(x0, x1, k), .16, lerp(z0, z1, k)], [.05, .32, .05], [0, 0, 0], .05); }
  const L = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0); gb.box('#9a7a52', [(x0 + x1) / 2, .26, (z0 + z1) / 2], [.035, .05, L], [0, a, 0], .04); gb.box('#9a7a52', [(x0 + x1) / 2, .14, (z0 + z1) / 2], [.035, .05, L], [0, a, 0], .04);
  const m = new THREE.Mesh(gb.build(), lam); m.castShadow = true; m.receiveShadow = true; return m;
}
const lawn = (R, r, top, col) => { const g = new THREE.Group(); g.add(slab(R, r, top, GRASS)); const gb = new GB(R); gb.add(new THREE.CylinderGeometry(r - .7, r - .7, .05, 40), col, [0, .025, 0], [1, 1, 1], [0, 0, 0], .05); const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; g.add(m); return g; };
function tuft(R, n, rmin, rmax, cols, avoid) {
  const gb = new GB(R); for (let k = 0; k < n; k++) { const a = R() * TAU, r = rmin + R() * (rmax - rmin), x = Math.cos(a) * r, z = Math.sin(a) * r; if (avoid && avoid(x, z)) continue; gb.add(G.ico0, pk(R, cols), [x, .09, z], [.06, .055, .06], [0, 0, 0], .06); gb.add(G.cyl6, '#4f8f3a', [x, 0, z], [.008, .09, .008], [0, 0, 0], 0); }
  return new THREE.Mesh(gb.build(), lam);
}
const FLOW = ['#f2c230', '#f5f0e6', '#e8639a', '#a58ad8'];

export function makeLegacy() {
  const R = rng(5150);
  const WARM = LK('#ffe0b8', '#5a4028', .78, '#ffd090', 2.1, [-9, 6, 8], .35, '#ffb878', [8, 5, -6], [0, 0, 0], 6.5);

  // =================== l1: family love ===================
  const l1 = (() => {
    const g = new THREE.Group(); g.add(lawn(R, 3.6, '#6a8a4c', '#a39577'));
    g.add(cottage(R, -.9, -1.85, 1.9, 1.3, 1.0, '#e0cca4', '#b5654a'), fence(R, -3.0, -.4, -2.4, -2.6, 6), fence(R, 2.0, -2.5, 3.0, -1.0, 5), tuft(R, 26, 1.6, 3.2, FLOW, (x, z) => Math.hypot(x, z) < 1.9));
    const tr = new THREE.Mesh(roundTreeGeo(1.7, rng(3), ['#6aa84f', '#5c9b3f', '#7cba58']), lam); tr.position.set(2.15, 0, -1.55); tr.castShadow = true; g.add(tr);
    const tr2 = new THREE.Mesh(roundTreeGeo(1.15, rng(4), ['#6aa84f', '#7cba58']), lam); tr2.position.set(-2.8, 0, 1.2); tr2.castShadow = true; g.add(tr2);
    const Fa = person(R, { top: '#4a7ac8', pants: '#2a3350', seed: 201, hair: '#2a1a10' }, 1.3), Mo = person(R, { top: '#e0765a', pants: '#3a4a6a', long: true, hair: '#2a1a12', seed: 202 }, 1.2), Gi = person(R, { top: '#e8c070', pants: '#4a3a52', long: true, hair: '#5a3a1c', seed: 203 }, .86), Bo = person(R, { top: '#5aa8a0', pants: '#34415f', seed: 204, hair: '#3a2214' }, .78);
    g.add(Fa.group, Mo.group, Gi.group, Bo.group);
    const th = ribbon([[-3.4, 2.3], [-1.6, 1.5], [0, .9], [1.8, 1.3], [3.5, 2.2]], .22, .07); g.add(th);
    const warm = spriteGlow(0, 1.2, .4, 5.2, 0xffc060, 0), r1 = ringMesh(1, .12, 0xffe0a0, 0), r2 = ringMesh(1, .1, 0xffd080, 0); r1.position.set(0, .3, .5); r2.position.set(0, .32, .5); g.add(warm, r1, r2);
    const hz = hearts(g, 12, 11), conf = confetti(50, 3, ['#ffd36a', '#fff0c0', '#ffb0c0', '#ffffff']); g.add(conf);
    const motes = makeMotes({ n: 90, area: [5, 3.4, 5], size: .05, v: .2, seed: 61, color: 0xffe9a8 }); g.add(motes.mesh);
    function update(lt, t) {
      const come = ease.inOutSine(seg(lt, .1, 1.7)), hug = smooth(1.3, 2.0, lt), sw = Math.sin(t * 1.6) * .012 * hug, hop = (i) => come > 0 && come < 1 ? Math.abs(Math.sin(lt * 7 + i)) * .03 : 0;
      pose(Fa, lerp(-2.3, -.42, come), .04 + hop(0), lerp(.9, .6, come), lerp(1.3, 1.0, come), { lx: .05 * hug, a0x: lerp(-.1, -1.35, hug), a1x: lerp(-.1, -1.25, hug), a0z: lerp(-.1, .5, hug), a1z: lerp(.1, -.1, hug), s: 1 + sw });
      pose(Mo, lerp(2.4, .42, come), .04 + hop(1), lerp(.8, .6, come), lerp(-1.3, -1.0, come), { lx: .05 * hug, a0x: lerp(-.1, -1.25, hug), a1x: lerp(-.1, -1.35, hug), a0z: lerp(-.1, .1, hug), a1z: lerp(.1, -.5, hug), s: 1 + sw });
      pose(Gi, lerp(-1.6, -.12, come), .04 + hop(2), lerp(1.9, 1.05, come), lerp(.5, .15, come), { lx: .03, a0x: lerp(-.1, -2.5, hug), a1x: lerp(-.1, -2.2, hug), a0z: lerp(-.1, .25, hug), a1z: lerp(.1, -.25, hug), s: 1 });
      pose(Bo, lerp(1.5, .2, come), .04 + hop(3), lerp(1.9, 1.0, come), lerp(-.5, -.2, come), { lx: .03, a0x: lerp(-.1, -2.3, hug), a1x: lerp(-.1, -2.5, hug), a0z: lerp(-.1, .25, hug), a1z: lerp(.1, -.25, hug), s: 1 });
      th.setDraw(ease.inOutSine(seg(lt, .2, 2.8)));
      const burst = lt - 1.75; ripple(r1, burst, 2.4, .5); ripple(r2, burst - .35, 1.9, .35);
      warm.material.opacity = .36 * smooth(1.5, 2.6, lt) * bump(t); conf.update(burst, 0, 1.0, .5); motes.update(t, smooth(.8, 2, lt)); hz(t, smooth(1.5, 2.2, lt), 0, 1.5, .5);
    }
    return { group: g, update, light: [[0, WARM]], bg: [[0, ['#1c2450', '#b07a58']]], bloom: [[0, .55], [3, .7]],
      cam: [{ t: 0, T: [0, 1.0, .3], az: 16, el: 17, w: 5.9, fov: 26, dy: 230 }, { t: 4.4, T: [0, 1.1, .45], az: 2, el: 15, w: 4.2, fov: 26, dy: 230 }],
      halos: (cx, lt, t, h, proj) => { const [x, y] = proj(V3(0, 1.3, .5)); h(cx, x, y, 700, '255,200,120', .22 * smooth(1.6, 2.8, lt)); } };
  })();

  // =================== l2: faith lived — a person kneels in prayer under a great tree ===================
  const l2 = (() => {
    const g = new THREE.Group(); g.add(lawn(R, 3.5, '#6a8a4c', '#9a8d70'));
    const tree = new THREE.Mesh(roundTreeGeo(2.5, rng(9), ['#6aa84f', '#5c9b3f', '#7cba58', '#4f8f3a']), lam); tree.position.set(.9, 0, -1.1); tree.castShadow = true; tree.receiveShadow = true; g.add(tree);
    g.add(tuft(R, 34, 1.0, 3.1, FLOW, (x, z) => Math.hypot(x + .3, z - .5) < .8));
    const rb = new GB(R); for (let k = 0; k < 7; k++) { const a = R() * TAU, r = 2.0 + R() * 1.0; rb.add(G.ico0, pk(R, ['#9a958a', '#8a867c']), [Math.cos(a) * r, .06, Math.sin(a) * r], [.14, .08, .12], [0, R() * 3, 0], .1); } const rk = new THREE.Mesh(rb.build(), lam); g.add(rk);
    const P = person(R, { top: '#e8dcc0', pants: '#5a4a6a', long: true, hair: '#3a2214', seed: 211 }, 1.28); g.add(P.group);
    const th = ribbon([[-3.4, 1.6], [-1.6, 1.4], [-.2, 1.0], [1.4, 1.2], [3.5, 1.7]], .2, .07); g.add(th);
    const sun = spriteGlow(2.6, 3.7, -1.8, 6.2, 0xffd890, 0); g.add(sun);
    const shafts = [[-.6, .55, .62, .16], [-.5, .35, .5, .12], [-.4, .12, .42, .1]].map(([rz, ox, rt, op]) => { const s = shaft(4.4, rt, .1, [1, .78, .4], 1, .2); s.position.set(-.3 + ox * .35, 0, .5); s.rotation.z = rz; s.userData.op = op; g.add(s); return s; });
    const pl = spriteGlow(-.3, .9, .5, 2.3, 0xffd890, 0), r1 = ringMesh(1, .12, 0xffe0a0, 0), r2 = ringMesh(1, .1, 0xffd080, 0); r1.position.set(-.3, .06, .5); r2.position.set(-.3, .08, .5); g.add(pl, r1, r2);
    const NF = 40, flo = bits(NF, G.tet, new THREE.MeshBasicMaterial({ color: 0xffd47a, toneMapped: false })), FL = Array.from({ length: NF }, () => ({ a: R() * TAU, r: .25 + R() * 1.0, v: .3 + R() * .55, s: .03 + R() * .04 })); g.add(flo);
    const motes = makeMotes({ n: 90, area: [5, 3.8, 5], size: .05, v: .22, seed: 63, color: 0xffe9a8 }); g.add(motes.mesh);
    function update(lt, t) {
      const kneel = smooth(.15, 1.0, lt), pray = smooth(.8, 1.5, lt), lit = smooth(.5, 1.9, lt);
      pose(P, lerp(-1.4, -.3, ease.inOutSine(seg(lt, 0, .8))), .04, .5, .45, { lx: .08 + .3 * pray, a0x: lerp(-.1, -1.2, pray), a1x: lerp(-.1, -1.2, pray), a0z: lerp(-.1, .52, pray), a1z: lerp(.1, -.52, pray), s: 1 - .36 * kneel });
      th.setDraw(ease.inOutSine(seg(lt, .1, 2.2)));
      sun.material.opacity = .55 * lit * bump(t); shafts.forEach((s, i) => { s.material.opacity = s.userData.op * lit * (.85 + .15 * Math.sin(t * 1.3 + i * 2)); });
      pl.material.opacity = .3 * pray * bump(t); ripple(r1, lt - 1.2, 2.2, .7); ripple(r2, lt - 1.6, 1.7, .5);
      for (let i = 0; i < NF; i++) { const f = FL[i], tt = Math.max(0, lt - 1.0), y = .3 + ((tt * f.v + i * .13) % 2.6), ang = f.a + tt * .5; put(flo, i, -.3 + Math.cos(ang) * f.r, y, .5 + Math.sin(ang) * f.r * .6, f.s * lit, f.s * lit, f.s * lit, t * 3 + i, t * 2, 0); } flo.instanceMatrix.needsUpdate = true;
      motes.update(t, lit);
    }
    return { group: g, update, light: [[0, LK('#e8dcc8', '#4a3a30', .8, '#ffd498', 2.0, [-6, 8, 7], .5, '#ffb878', [8, 5, -6], [0, 0, 0], 6.5)]], bg: [[0, ['#1a2450', '#c89060']]], bloom: [[0, .6], [2.6, .7]],
      cam: [{ t: 0, T: [-.1, 1.0, .2], az: 18, el: 15, w: 5.0, fov: 26, dy: 230 }, { t: 3.0, T: [-.2, 1.05, .4], az: 6, el: 13, w: 3.6, fov: 26, dy: 230 }],
      halos: (cx, lt, t, h, proj) => { const [x, y] = proj(V3(-.3, 1.0, .5)); h(cx, x, y, 620, '255,205,120', .24 * smooth(.8, 2, lt)); } };
  })();

  // =================== l3: an elder shares what he has learned; the gold passes to the child; a sapling grows ===================
  const l3 = (() => {
    const g = new THREE.Group(); g.add(lawn(R, 3.7, '#6a8a4c', '#a39577'));
    g.add(cottage(R, -1.9, -2.0, 1.7, 1.2, .95, '#d8c4a0', '#9a5a40'), tuft(R, 30, 1.5, 3.3, FLOW, (x, z) => Math.hypot(x - .4, z) < 1.7));
    const bb = new GB(R); bb.box('#8a6a44', [-1.35, .2, .45], [.9, .08, .3], [0, 0.2, 0], .04); bb.box('#6a4a2c', [-1.7, .09, .55], [.07, .18, .22], [0, .2, 0], .03); bb.box('#6a4a2c', [-1.0, .09, .35], [.07, .18, .22], [0, .2, 0], .03);
    const bench = new THREE.Mesh(bb.build(), lam); bench.castShadow = true; g.add(bench);
    const tr = new THREE.Mesh(roundTreeGeo(1.9, rng(5), ['#6aa84f', '#5c9b3f', '#7cba58']), lam); tr.position.set(2.5, 0, -1.7); tr.castShadow = true; g.add(tr);
    const El = person(R, { top: '#9a6a4a', pants: '#3a4a5a', hair: '#cfc9c0', beard: '#dcd8d0', seed: 221, skin: '#c98d62' }, 1.3), Ch = person(R, { top: '#e0a83a', pants: '#34415f', seed: 222, hair: '#3a2214', long: true }, .92); g.add(El.group, Ch.group);
    // an open book in the elder's hands: gold-edged, softly lit
    const bk = new THREE.Group(), bg = new GB(R); bg.box('#6a3e22', [0, 0, 0], [.4, .04, .3], [0, 0, 0], .03); bg.box('#f4ead2', [-.09, .035, 0], [.18, .03, .25], [0, 0, .06], .02); bg.box('#f4ead2', [.09, .035, 0], [.18, .03, .25], [0, 0, -.06], .02);
    bk.add(new THREE.Mesh(bg.build(), lam)); const bkGl = spriteGlow(0, .12, 0, .9, 0xffd890, 0); bk.add(bkGl); El.group.add(bk); bk.position.set(0, .66, .3); bk.rotation.x = -.7;
    const th = ribbon([[-3.5, 1.8], [-1.6, .6], [.2, .5], [1.6, 1.0], [3.5, 1.2]], .22, .07); g.add(th);
    // sparks flowing from book to child
    const NS = 34, sp = bits(NS, G.tet, new THREE.MeshBasicMaterial({ color: 0xffd47a, toneMapped: false })), SPd = Array.from({ length: NS }, () => ({ ph: R(), per: 1.1 + R() * .7, off: (R() - .5) * .25, s: .035 + R() * .04, arc: .25 + R() * .3, z: (R() - .5) * .3 })); g.add(sp);
    // the sapling
    const sapling = new THREE.Group(), tg = new GB(R); tg.add(G.cylT, '#8a5e38', [0, 0, 0], [.07, .9, .07], [0, 0, 0], .05); const crown = new THREE.Group(), cg = new GB(R);
    for (const [x, y, z, s] of [[0, 1.1, 0, .5], [.3, .95, .08, .34], [-.28, .98, -.08, .32], [.05, 1.4, .05, .3]]) cg.add(G.ico1, pk(R, ['#5f9a46', '#559040', '#68a44e']), [x, y, z], [s, s * .9, s], [R(), R(), 0], .08);
    crown.add(new THREE.Mesh(cg.build(), lam)); sapling.add(new THREE.Mesh(tg.build(), lam), crown); sapling.position.set(1.45, .04, .45); sapling.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(sapling);
    const rg1 = ringMesh(1, .14, 0xffe0a0, 0), rg2 = ringMesh(1, .1, 0xffd080, 0); [rg1, rg2].forEach(r => { r.position.set(1.45, .1, .45); g.add(r); });
    const glow = spriteGlow(1.45, 1.2, .45, 4.2, 0xffc060, 0); g.add(glow);
    const NF = 34, flo = bits(NF, G.tet, new THREE.MeshBasicMaterial({ color: 0xffd47a, toneMapped: false })), FL = Array.from({ length: NF }, () => ({ a: R() * TAU, r: .25 + R() * 1.0, v: .35 + R() * .6, s: .03 + R() * .04 })); g.add(flo);
    const motes = makeMotes({ n: 100, area: [5, 3.8, 5], size: .05, v: .2, seed: 65, color: 0xffe9a8 }); g.add(motes.mesh);
    const A = new THREE.Vector3(-.34, .98, .1), B = new THREE.Vector3(.24, .7, .1);
    function update(lt, t) {
      const come = ease.inOutSine(seg(lt, 0, 1.3)), tell = smooth(1.2, 2.0, lt), nod = Math.sin(t * 1.9) * .04 * tell, gest = Math.sin(t * 2.3) * tell, sp_ = smooth(1.9, 2.8, lt) * (1 - smooth(6.6, 7.4, lt));
      pose(El, -.75, .04, .1, Math.PI / 2 - .1, { lx: .1 * tell, a0x: lerp(-.1, -1.05, tell), a1x: lerp(-.1, -1.0, tell) + .06 * gest, a0z: lerp(-.1, .38, tell), a1z: lerp(.1, -.38, tell), s: 1 });
      pose(Ch, lerp(2.3, .55, come), .04 + (come > 0 && come < 1 ? Math.abs(Math.sin(lt * 8)) * .03 : 0), .1, -Math.PI / 2 + .12, { lx: .1 * tell + nod, a0x: -.1, a1x: -.1, a0z: -.1, a1z: .1, s: 1 });
      bk.scale.setScalar(Math.max(.001, ease.outBack(seg(lt, 1.1, 1.9)))); bkGl.material.opacity = .55 * smooth(1.6, 2.4, lt) * bump(t);
      th.setDraw(ease.inOutSine(seg(lt, 2.4, 5.4)));
      for (let i = 0; i < NS; i++) { const s = SPd[i], u = ((lt * .8 / s.per + s.ph) % 1 + 1) % 1, e = ease.inOutSine(u), x = lerp(A.x, B.x, e), y = lerp(A.y, B.y, e) + Math.sin(Math.PI * e) * s.arc, z = A.z + s.z * Math.sin(Math.PI * e), k = Math.sin(Math.PI * u) * sp_; put(sp, i, x, y, z + s.off * .3, s.s * k, s.s * k, s.s * k, t * 3 + i, t * 2, 0); } sp.instanceMatrix.needsUpdate = true;
      const grow = ease.outBack(seg(lt, 4.2, 7.2)); sapling.scale.setScalar(Math.max(.001, .18 + .95 * grow)); sapling.visible = lt >= 4.1; crown.scale.setScalar(Math.max(.01, .3 + .7 * ease.outCubic(seg(lt, 4.3, 7.0))));
      ripple(rg1, lt - 4.2, 3.0, .6); ripple(rg2, lt - 4.7, 2.3, .42);
      const gl = smooth(4.2, 5.4, lt); glow.material.opacity = .3 * gl * bump(t); glow.position.y = 1.2 + .5 * grow;
      for (let i = 0; i < NF; i++) { const f = FL[i], tt = Math.max(0, lt - 4.3), y = .3 + ((tt * f.v) % 2.8), ang = f.a + tt * .6; put(flo, i, 1.45 + Math.cos(ang) * f.r * (.5 + .5 * Math.sin(y)), y, .45 + Math.sin(ang) * f.r * .6, f.s * gl, f.s * gl, f.s * gl, t * 3 + i, t * 2, 0); } flo.instanceMatrix.needsUpdate = true;
      motes.update(t, smooth(1.5, 3, lt));
    }
    return { group: g, update, light: [[0, LK('#ffe0b0', '#4a3622', .78, '#ffd090', 2.2, [-8, 9, 8], .35, '#ffb878', [10, 6, -8], [0, 0, 0], 6.5)]], bg: [[0, ['#1c2450', '#d8a068']]], bloom: [[0, .6], [5, .72]],
      cam: [{ t: 0, T: [.2, 1.0, .3], az: 20, el: 16, w: 5.8, fov: 26, dy: 230 }, { t: 2.6, T: [-.05, 1.0, .15], az: 8, el: 14, w: 3.9, fov: 26, dy: 230 }, { t: 5.2, T: [.45, 1.0, .25], az: -4, el: 15, w: 4.6, fov: 26, dy: 230 }, { t: 8.0, T: [.5, 1.05, .25], az: -10, el: 16, w: 6.0, fov: 26, dy: 230 }],
      halos: (cx, lt, t, h, proj) => { const [x, y] = proj(V3(.4, 1.1, .2)); h(cx, x, y, 700, '255,205,120', .2 * smooth(2.2, 4, lt)); const [x2, y2] = proj(V3(1.45, 1.3, .45)); h(cx, x2, y2, 560, '255,205,120', .22 * smooth(4.6, 6.4, lt)); } };
  })();

  // =================== l4: choosing kindness, then making time for family (one lawn, camera pans between) ===================
  const l4 = (() => {
    const g = new THREE.Group(); g.add(lawn(R, 4.2, '#6a8a4c', '#a39577'));
    g.add(tuft(R, 40, 1.2, 3.8, FLOW, (x, z) => Math.abs(z) < 1.0 && Math.abs(Math.abs(x) - 1.4) < 1.5));
    const tr = new THREE.Mesh(roundTreeGeo(2.0, rng(6), ['#6aa84f', '#5c9b3f', '#7cba58']), lam); tr.position.set(0, 0, -2.3); tr.castShadow = true; g.add(tr);
    const tr2 = new THREE.Mesh(roundTreeGeo(1.3, rng(7), ['#6aa84f', '#7cba58']), lam); tr2.position.set(-3.0, 0, -.9); tr2.castShadow = true; g.add(tr2);
    const tr3 = new THREE.Mesh(roundTreeGeo(1.5, rng(8), ['#6aa84f', '#5c9b3f']), lam); tr3.position.set(3.1, 0, -1.4); tr3.castShadow = true; g.add(tr3);
    g.add(cottage(R, 1.9, -2.3, 1.6, 1.15, .9, '#e0cca4', '#b5654a', -.3));
    // kindness: a man shares his bread with a neighbour
    const Gv = person(R, { top: '#5aa87a', pants: '#2a3a4a', seed: 231, hair: '#2a1a10' }, 1.3), Nb = person(R, { top: '#c98a8a', pants: '#5a4a6a', long: true, hair: '#cfc9c0', cloth: '#e8dcc0', seed: 232 }, 1.14); g.add(Gv.group, Nb.group);
    const loaf = new THREE.Group(), lg = new GB(R); lg.add(G.ico1, '#d8a85a', [0, 0, 0], [.1, .065, .065], [0, 0, 0], .05); loaf.add(new THREE.Mesh(lg.build(), lam)); loaf.position.set(0, -.44, .06);
    const bag = new THREE.Group(), bgg = new GB(R); bgg.add(G.ico1, '#9a7a52', [0, .1, 0], [.16, .13, .15], [0, 0, 0], .05); bag.add(new THREE.Mesh(bgg.build(), lam)); bag.position.set(-.52, .02, .2); g.add(bag);
    // family time: a child runs into a parent's open arms
    const Pa = person(R, { top: '#e0765a', pants: '#3a4a6a', long: true, hair: '#2a1a12', seed: 233 }, 1.22), Kd = person(R, { top: '#4a8fc8', pants: '#34415f', seed: 234, hair: '#8a5a2c' }, .76); g.add(Pa.group, Kd.group);
    const th = ribbon([[-4.0, 1.5], [-2.0, 1.2], [0, 1.6], [2.0, 1.2], [4.0, 1.5]], .22, .07); g.add(th);
    const hzA = hearts(g, 8, 21, .4), hzB = hearts(g, 10, 22, .42), confA = confetti(30, 4, ['#ffd36a', '#fff0c0', '#ffffff']), confB = confetti(40, 5, ['#ffd36a', '#fff0c0', '#ffb0c0', '#ffffff']); g.add(confA, confB);
    const wA = spriteGlow(-1.1, 1.2, .3, 4.6, 0xffc060, 0), wB = spriteGlow(1.35, 1.0, .3, 4.6, 0xffc060, 0), rA = ringMesh(1, .12, 0xffe0a0, 0), rB = ringMesh(1, .12, 0xffe0a0, 0); rA.position.set(-1.1, .3, .3); rB.position.set(1.35, .3, .3); g.add(wA, wB, rA, rB);
    const motes = makeMotes({ n: 110, area: [8, 3.8, 6], size: .05, v: .2, seed: 67, color: 0xffe9a8 }); g.add(motes.mesh);
    function update(lt, t) {
      // kindness
      const come = ease.inOutSine(seg(lt, 0, .9)), give = smooth(.7, 1.1, lt), hand = ease.inOutSine(seg(lt, .95, 1.4));
      pose(Gv, lerp(-2.3, -1.38, come), .04 + (come > 0 && come < 1 ? Math.abs(Math.sin(lt * 8)) * .03 : 0), .25, Math.PI / 2 - .1, { lx: .06, a0x: -.15, a1x: lerp(-.2, -1.5, give), a0z: -.1, a1z: .1, s: 1 });
      pose(Nb, -.55, .04, .2, -Math.PI / 2 + .1, { lx: .1 * give, a0x: lerp(-.1, -1.0, hand), a1x: lerp(-.1, -1.2, hand), a0z: lerp(-.1, .3, hand), a1z: lerp(.1, -.3, hand), s: 1 });
      Gv.arms[1].remove(loaf); Nb.arms[0].remove(loaf); (lt < 1.2 ? Gv.arms[1] : Nb.arms[0]).add(loaf); loaf.visible = true;
      bag.visible = lt < 1.2; bag.position.set(-.52 + .0, .02, .2);
      // family
      const run = ease.inOutSine(seg(lt, 2.0, 3.0)), hug = smooth(2.9, 3.4, lt), open = smooth(2.0, 2.7, lt) * (1 - hug);
      pose(Pa, 1.15, .04, .25, Math.PI / 2 + .1, { lx: .05 + .3 * hug, a0x: lerp(-.1, -1.2, Math.max(open, hug)), a1x: lerp(-.1, -1.2, Math.max(open, hug)), a0z: lerp(-.1, -.55, open) + .6 * hug, a1z: lerp(.1, .55, open) - .6 * hug, s: 1 - .3 * smooth(2.0, 2.6, lt) });
      pose(Kd, lerp(3.0, 1.75, run), .04 + (run > 0 && run < 1 ? Math.abs(Math.sin(lt * 10)) * .05 : 0), .25, -Math.PI / 2 - .05, { lx: .08, a0x: lerp(-.1, -2.4, hug), a1x: lerp(-.1, -2.4, hug), a0z: lerp(-.1, .2, hug), a1z: lerp(.1, -.2, hug), s: 1 });
      th.setDraw(ease.inOutSine(seg(lt, .2, 3.4)));
      const bA = lt - 1.3, bB = lt - 3.1; ripple(rA, bA, 1.9, .5); ripple(rB, bB, 2.1, .5);
      wA.material.opacity = .26 * smooth(1.2, 2.0, lt) * bump(t); wB.material.opacity = .24 * smooth(3.0, 3.8, lt) * bump(t);
      confA.update(bA, -1.1, 1.0, .3); confB.update(bB, 1.35, 1.0, .3); hzA(t, smooth(1.3, 2.0, lt) * (1 - smooth(3.4, 4.2, lt)), -1.0, 1.3, .3); hzB(t, smooth(3.1, 3.8, lt), 1.35, 1.1, .3);
      motes.update(t, smooth(.5, 2, lt));
    }
    return { group: g, update, light: [[0, LK('#f0e4d0', '#5a4430', .8, '#ffe0a8', 2.2, [-9, 8, 7], .4, '#ffd09a', [8, 5, -6], [0, 0, 0], 7)]], bg: [[0, ['#2a3a70', '#e4b078']]], bloom: [[0, .6], [4, .72]],
      cam: [{ t: 0, T: [-1.5, 1.0, .25], az: 14, el: 15, w: 5.4, fov: 26, dy: 230 }, { t: 1.8, T: [-1.2, 1.0, .25], az: 8, el: 14, w: 4.9, fov: 26, dy: 230 }, { t: 2.8, T: [1.0, .95, .25], az: -4, el: 14, w: 5.0, fov: 26, dy: 230 }, { t: 4.3, T: [1.2, 1.0, .25], az: -8, el: 14, w: 4.6, fov: 26, dy: 230 }],
      halos: (cx, lt, t, h, proj) => { const [x, y] = proj(V3(-1.0, 1.2, .3)); h(cx, x, y, 560, '255,205,120', .2 * smooth(1.2, 2, lt) * (1 - smooth(2.4, 3, lt))); const [x2, y2] = proj(V3(1.35, 1.1, .3)); h(cx, x2, y2, 600, '255,205,120', .22 * smooth(3, 3.8, lt)); } };
  })();

  // =================== l5: walking toward morning light — a father and child, hand in hand, on a golden path ===================
  const l5 = (() => {
    const g = new THREE.Group(); g.add(lawn(R, 4.4, '#6a8a4c', '#8a8a6a'));
    g.add(tuft(R, 40, 1.4, 4.0, FLOW, (x, z) => Math.abs(x) < .9));
    for (const [x, z, s] of [[-2.6, -1.0, 1.5], [2.8, -.4, 1.3], [-3.2, 1.6, 1.1], [3.2, 2.0, 1.0]]) { const m = new THREE.Mesh(roundTreeGeo(s, rng(x * 7 + 3), ['#6aa84f', '#5c9b3f', '#7cba58']), lam); m.position.set(x, 0, z); m.castShadow = true; g.add(m); }
    // a sea of cloud far below the floating lawn, warm toward the sun, with a few hazed hills standing in it
    const sg = new THREE.PlaneGeometry(160, 96, 32, 20); sg.rotateX(-Math.PI / 2); sg.translate(0, -2.0, -53); { const p = sg.attributes.position, rr = rng(77); for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + (rr() - .5) * .5); }
    const sgn = sg.toNonIndexed(), sp_ = sgn.attributes.position, sc_ = [], cm = rng(78), mixc = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
    for (let i = 0; i < sp_.count; i += 3) { const cx_ = (sp_.getX(i) + sp_.getX(i + 1) + sp_.getX(i + 2)) / 3, cz_ = (sp_.getZ(i) + sp_.getZ(i + 1) + sp_.getZ(i + 2)) / 3, u = Math.abs(cx_) / 55, v = clamp((-cz_ - 5) / 90), warm = Math.exp(-u * u * 3.4) * (.5 + .5 * v), j = .9 + cm() * .2, c = mixc([.17, .15, .30], [.78, .46, .30], clamp(warm * 1.1)).map(x => x * (.7 + .3 * v) * j); for (let q = 0; q < 3; q++) sc_.push(c[0], c[1], c[2]); }
    sgn.setAttribute('color', new THREE.Float32BufferAttribute(sc_, 3)); g.add(new THREE.Mesh(sgn, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })));
    const hills = new THREE.Group(); [[-16, -36, 3.0, 0], [6, -43, 4.2, 1], [21, -35, 2.8, 0], [-31, -41, 3.6, 1], [33, -45, 4.0, 1], [-5, -31, 1.5, 0], [13, -31, 1.7, 0]].forEach(([x, z, s, far]) => { const c = far ? '#4e4570' : '#41395f'; const m = new THREE.Mesh(peakGeo(s, rng(Math.abs(x) + 5), [c, c, c]), basicV()); m.position.set(x, -2.1, z); hills.add(m); }); g.add(hills);
    const sunM = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 1), new THREE.MeshBasicMaterial({ color: 0xfff4d0, toneMapped: false })); sunM.position.set(0, 3.4, -30); g.add(sunM);
    const sunGl = spriteGlow(0, 3.4, -30, 11, 0xffb860, 0); g.add(sunGl);
    const path = ribbon([[0.2, 5.6], [-.6, 3.2], [.6, .6], [-.5, -1.8], [.3, -3.8], [0, -8], [0, -16], [0, -28]], .5, .07); g.add(path);
    const Fa = person(R, { top: '#4a7ac8', pants: '#2a3350', seed: 241, hair: '#2a1a10' }, 1.3), Ch = person(R, { top: '#e0a83a', pants: '#34415f', seed: 242, hair: '#3a2214', long: true }, .82); g.add(Fa.group, Ch.group);
    const motes = makeMotes({ n: 130, area: [8, 4.6, 10], size: .055, v: .22, seed: 69, color: 0xffe9a8 }); g.add(motes.mesh);
    const lead = spriteGlow(0, 1.0, 0, 2.6, 0xffd890, 0); g.add(lead);
    const pt = k => path.curve.getPoint(clamp(k)); // k in 0..1 along the path
    function update(lt, t) {
      const k = lerp(.045, .36, ease.inOutSine(seg(lt, 0, 5.2))), p = pt(k), p2 = pt(k + .012), ry = Math.atan2(p2.x - p.x, p2.z - p.z), bob = Math.abs(Math.sin(lt * 5.2)) * .03, sx = Math.cos(ry), sz = -Math.sin(ry);
      pose(Fa, p.x, .04 + bob, p.z, ry, { lx: -.02, a0x: -.12, a0z: -.5, a1x: .22 * Math.sin(lt * 5.2), a1z: .1, s: 1 });
      pose(Ch, p.x - sx * .88, .04 + Math.abs(Math.sin(lt * 5.2 + 1)) * .04, p.z - sz * .88, ry, { lx: -.02, a0x: -.2 * Math.sin(lt * 5.2), a0z: -.1, a1x: -.12, a1z: .5, s: 1 });
      lead.position.set(p.x, 1.0, p.z); lead.material.opacity = .22 * smooth(.2, 1.4, lt);
      path.setDraw(ease.inOutSine(seg(lt, 0, 2.0)) * 1.0 + 0.0001);
      sunGl.material.opacity = (.3 + .25 * smooth(0, 4.5, lt)) * bump(t); sunM.position.y = 3.4 + .5 * smooth(0, 5, lt);
      motes.update(t, smooth(0, 1.4, lt), [0, 0, p.z]);
    }
    // the camera follows from behind and a little to one side
    const cam = [0, 1.7, 3.4, 5.2].map((tt, i) => { const kk = lerp(.045, .36, ease.inOutSine(seg(tt, 0, 5.2))), p = path.curve.getPoint(kk); return { t: tt, T: [p.x * .6, 1.0 + i * .06, p.z - 1.2], az: [-5, -2, 3, 6][i], el: [12, 10, 8, 7][i], w: [4.8, 5.0, 5.8, 7.2][i], fov: 26, dy: 270 }; });
    cam.push({ t: 6.0, T: cam[3].T, az: 8, el: 7, w: 7.6, fov: 26, dy: 270 });
    return { group: g, update, light: [[0, LK('#ffe0b8', '#4a3a40', .75, '#ffcf90', 2.3, [4, 4, -8], .5, '#7a8cff', [-8, 6, 8], [0, 0, 0], 8)]], bg: [[0, ['#1c2f66', '#e8a070']]], bloom: [[0, .34], [3.4, .44], [5.2, .6]], xin: .6, scrim: [[0, .08]],
      cam, halos: (cx, lt, t, h, proj) => { const [x, y] = proj(V3(0, 3.5, -30)); h(cx, x, y, 760, '255,180,100', .14 + .14 * smooth(0, 4.5, lt)); h(cx, x, y, 340, '255,230,170', .16 * smooth(1, 4.5, lt)); } };
  })();
  return { l1, l2, l3, l4, l5 };
}
