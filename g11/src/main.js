import * as THREE from 'three';
import { clamp, lerp, seg, ease, rng, keyed, rgbOf, mx, css, P, smooth } from './util.js';
import { W, H, CINZEL, SANS2, ITAL, bloom, halo, grain, cineTitle, capLine, flare } from './fx2d.js';
import { makeLand } from './world.js';
import { makeTrust, TT } from './trust.js';
import { makeEnding, endingReady, drawEnding } from './ending.js';
import { makeCubeField, makeMotes } from './props.js';
import { LK } from './lights.js';
import { HILL, ARKP, SET } from './terrain6.js';
import { AK, zb } from './ark.js';
import { lam } from './kit.js';
const FPS = 30, BPM = 72, DURATION = 90;
Object.assign(window, { W, H, FPS, BPM, DURATION }); window.__ready = false;
const q = new URLSearchParams(location.search);

// ---------- canvases
const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; canvas.id = 'c';
canvas.style.cssText = 'display:block;position:absolute;inset:0;margin:auto;' + (q.has('render') ? `width:${W}px;height:${H}px` : `width:min(100vw,calc(100vh*${W / H}));height:auto`);
document.body.appendChild(canvas); const ctx = canvas.getContext('2d');
const mk2d = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
const [cvA, cxA] = mk2d(), [cvB, cxB] = mk2d();
const glc = document.createElement('canvas'); glc.width = W; glc.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor(0x000000, 0); renderer.localClippingEnabled = true;
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(24, W / H, .5, 400);

// ---------- lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x333333, 1), sunL = new THREE.DirectionalLight(0xffffff, 3), fill = new THREE.DirectionalLight(0xffffff, 0);
sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); Object.assign(sunL.shadow.camera, { left: -11.5, right: 11.5, top: 11.5, bottom: -11.5, near: 1, far: 140 }); sunL.shadow.bias = -.0006; sunL.shadow.normalBias = .03; sunL.shadow.radius = 3;
scene.add(hemi, sunL, sunL.target, fill);
const D2R = Math.PI / 180;

// ---------- worlds
const land = makeLand(), trust = makeTrust(), ending = makeEnding();
scene.add(land.group);
const ALL = [land.group];
const endG = new THREE.Group(), endCubes = makeCubeField({ n: 150, rmin: 3, rmax: 20, yspan: 12, smax: 1.0, seed: 44 }), endMotes = makeMotes({ n: 190, area: [14, 10, 10], size: .06, v: .38, seed: 51, color: 0xffd47a });
endG.add(endCubes.mesh, endMotes.mesh);
trust.group.visible = false; scene.add(trust.group); ALL.push(trust.group);
endG.visible = false; scene.add(endG); ALL.push(endG);

// ---------- camera helpers
function camAt(keys, lt) {
  let i = 1; while (i < keys.length - 1 && lt > keys[i].t) i++;
  const a = keys[Math.max(0, i - 1)], b = keys[i], k = ease.inOutSine(seg(lt, a.t, b.t)), L = (u, v) => lerp(u, v, k);
  return { T: a.T.map((v, j) => L(v, b.T[j])), az: L(a.az, b.az), el: L(a.el, b.el), w: L(a.w, b.w), fov: L(a.fov, b.fov), dy: L(a.dy ?? 0, b.dy ?? 0), dx: L(a.dx ?? 0, b.dx ?? 0) };
}
// continuous-velocity camera: cubic Hermite through the keys (a key with stop:true comes to rest)
function camSmooth(keys, lt) {
  let i = 1; while (i < keys.length - 1 && lt > keys[i].t) i++;
  const a = keys[i - 1], b = keys[i], h = Math.max(1e-6, b.t - a.t), u = clamp((lt - a.t) / h), p = keys[i - 2], n = keys[i + 1];
  const u2 = u * u, u3 = u2 * u, h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const f = (get) => { const y0 = get(a), y1 = get(b); const m0 = a.stop ? 0 : (p ? (y1 - get(p)) / (b.t - p.t) : (y1 - y0) / h), m1 = b.stop ? 0 : (n ? (get(n) - y0) / (n.t - a.t) : (y1 - y0) / h); return h00 * y0 + h10 * h * m0 + h01 * y1 + h11 * h * m1; };
  return { T: [0, 1, 2].map(j => f(k => k.T[j])), az: f(k => k.az), el: f(k => k.el), w: f(k => k.w), fov: f(k => k.fov), dy: f(k => k.dy ?? 0), dx: f(k => k.dx ?? 0) };
}
function setCamera(keys, lt, smoothCam, nearO) {
  const c = smoothCam ? camSmooth(keys, lt) : camAt(keys, lt); camera.fov = c.fov; const D = c.w / (2 * Math.tan(c.fov * D2R / 2) * (W / H));
  const az = c.az * D2R, el = c.el * D2R; camera.position.set(c.T[0] + D * Math.sin(az) * Math.cos(el), c.T[1] + D * Math.sin(el), c.T[2] + D * Math.cos(az) * Math.cos(el));
  camera.near = nearO || Math.max(.3, D * .08); camera.far = D * 2.6 + 260; camera.userData.T = c.T; camera.userData.W = c.w; camera.lookAt(c.T[0], c.T[1], c.T[2]); camera.setViewOffset(W, H, c.dx, -c.dy, W, H); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true); c.D = D; return c;
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const proj = (v) => { const p = (v.isVector3 ? v : V3(...v)).clone().project(camera); return [(p.x * .5 + .5) * W, (-p.y * .5 + .5) * H]; };
const projv = (x, y, z) => { const p = V3(x, y, z).project(camera); return [(p.x * .5 + .5) * W, (-p.y * .5 + .5) * H, p.z < 1 && p.z > -1]; };
function lightAt(keys, lt) {
  let i = 1; while (i < keys.length - 1 && lt > keys[i][0]) i++; const [ta, a] = keys[Math.max(0, i - 1)], [tb, b] = keys[i], k = ease.inOutSine(seg(lt, ta, tb)), o = {};
  for (const key of Object.keys(a)) o[key] = Array.isArray(a[key]) ? a[key].map((v, j) => lerp(v, b[key][j], k)) : lerp(a[key], b[key], k); return o;
}
const hx = rgbOf;
function bgAt(keys, lt) { let i = 1; while (i < keys.length - 1 && lt > keys[i][0]) i++; const [ta, a] = keys[Math.max(0, i - 1)], [tb, b] = keys[i], k = ease.inOutSine(seg(lt, ta, tb)); return { a: mx(hx(a[0]), hx(b[0]), k), b: mx(hx(a[1]), hx(b[1]), k) }; }

const DY = 330, FOV = 26;
// cutaway for the inside shot: the east wall of the ark is clipped away so the camera can look across the interior
const clipPl = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 8.02), arkMats = [];
land.ark.group.traverse(o => { if (o.isMesh) { if (o.material === lam) o.material = lam.clone(); arkMats.push(o.material); } });
const AY0 = land.AY0, DOORZ = ARKP.z + zb(6);
const AR = (t, dx, dy, dz) => { const s = land.arkState(t); return [s.x + dx, s.y + dy, s.z + dz]; };
const K = (t0, t, T, az, el, w, o = {}) => ({ t: t - t0, T, az, el, w, fov: FOV, dy: DY, ...o });

// ---------- 0:00-0:30 the island at dusk: the call, the animals, the family
const CAM_LAND = [
  K(0, 0,    [1.5, 2.2, .0],  18, 13, 34, { dy: 90 }),
  K(0, 3.4,  [2.8, .8, .5],   6,  40, 14.5, { dy: 250 }),
  K(0, 6.4,  [3.3, .85, 1.0], -10, 28, 6.2, { dy: 300 }),
  K(0, 8.4,  [3.4, .8, .9],   -14, 28, 6.4),
  K(0, 11.0, [3.5, .5, -.3],  -26, 34, 11.5),
  K(0, 14.5, [4.0, .55, -.2], -42, 27, 9.5),
  K(0, 18.3, [4.4, .65, .5],  -52, 22, 8.0),
  K(0, 20.8, [3.3, .75, .9],  -34, 22, 6.8),
  K(0, 23.5, [4.5, .8, .6],   -60, 14, 5.2),
  K(0, 27.0, [5.0, AY0 + .85, .45], -72, 10, 3.6),
  K(0, 30.0, [5.4, AY0 + .85, .42], -78, 9, 3.0),
];
// ---------- 0:28.8-0:37.6 inside the ark: daylight through the door, then darkness
const IN0 = 28.8, FT0 = 36.2;
const CAM_IN = [
  K(IN0, 28.8, [6.25, AY0 + .62, .5], 96, 6, 2.7, { fov: 44, dy: 120 }),
  K(IN0, 33.0, [6.2, AY0 + .62, .5], 96, 6, 2.35, { fov: 44, dy: 120 }),
  K(IN0, 38.0, [6.1, AY0 + .6, .5], 96, 6, 2.0, { fov: 44, dy: 120, stop: true }),
];
// ---------- 0:36-1:00 the flood: fountains, rain, rising water, the ark lifts, then the camera circles out over the dark sea
const CAM_FLOOD = [
  K(FT0, 36.2, AR(36.2, -2.0, .9, .9),  -58, 18, 11.5),
  K(FT0, 40.0, AR(40.0, -2.0, .9, .8),  -64, 17, 9.5),
  K(FT0, 44.0, AR(44.0, -1.9, .8, .6),  -72, 14, 7.6),
  K(FT0, 47.5, AR(47.5, -.8, 1.0, .4),  -10, 11, 11, { fov: 30 }),
  K(FT0, 50.5, AR(50.5, -.2, 1.2, .2),   36, 14, 13, { fov: 34 }),
  K(FT0, 55.0, AR(55.0, 0, 1.4, 0),      44, 19, 15.5, { fov: 36 }),
  K(FT0, 60.0, AR(60.0, .3, 1.6, 0),     52, 20, 19, { fov: 38 }),
  K(FT0, 61.8, AR(61.8, .3, 1.7, 0),     54, 20, 20, { fov: 38 }),
];
// ---------- 1:15-1:23 hope in the storm: the ark afloat, a thin gold shaft through the clouds
const HT0 = 75, HW = 61;
const CAM_HOPE = [
  K(HT0, 75.0, AR(HW, .3, 1.6, 0), 50, 3, 17, { fov: 36 }),
  K(HT0, 79.0, AR(HW, .2, 1.5, 0), 54, 2.5, 14.5, { fov: 36 }),
  K(HT0, 83.6, AR(HW, .0, 1.4, 0), 58, 2, 12.5, { fov: 36, stop: true }),
];
const LBL = [[0, .5], [10, .5], [22, .55], [38, .55], [50, .55], [60, .5]];
const LSC = [[0, .3], [20, .34], [38, .3], [56, .26], [60, .24]];
const LVG = [[0, .6], [30, .62], [48, .66], [60, .6]];
const STARS = (() => { const R = rng(9); return Array.from({ length: 120 }, () => ({ x: R() * W, y: R() * 1100, s: .6 + R() * 1.6, ph: R() * 6, f: 1 + R() * 3 })); })();
function starfield(cx, t, a) { if (a <= .01) return; cx.save(); cx.fillStyle = '#f4ecd8'; STARS.forEach(s => { cx.globalAlpha = a * (.35 + .5 * Math.sin(t * s.f + s.ph) * .5 + .15) * (1 - s.y / 1300); cx.fillRect(s.x, s.y, s.s, s.s); }); cx.restore(); }
// thin golden lines converging on a point (dir -1: fanning up from it, +1: fanning down)
function rays(cx, x, y, a, t, spread = 1, dir = -1) {
  if (a <= .004) return; cx.save(); cx.globalCompositeOperation = 'lighter'; const R = rng(17);
  for (let i = 0; i < 70; i++) { const ang = dir * Math.PI / 2 + (R() - .5) * 2.9 * spread, L = 500 + R() * 1300, w = .7 + R() * 1.6, ph = R() * 6, al = a * (.12 + R() * .3) * (.75 + .25 * Math.sin(t * 1.3 + ph)); const x1 = x + Math.cos(ang) * L, y1 = y + Math.sin(ang) * L; const g = cx.createLinearGradient(x, y, x1, y1); g.addColorStop(0, `rgba(255,236,180,${al})`); g.addColorStop(.7, `rgba(255,214,140,${al * .45})`); g.addColorStop(1, 'rgba(255,200,120,0)'); cx.strokeStyle = g; cx.lineWidth = w; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x1, y1); cx.stroke(); }
  cx.restore();
}
// the hope shot's own sky: dark clouds that part over the ark, gold at the horizon
const SK = (() => { const R = rng(321); return Array.from({ length: 26 }, () => ({ x: R(), y: R(), s: .5 + R() * .9, a: .35 + R() * .5, v: .004 + R() * .01 })); })();
function hopeSky(cx, t, cam) {
  const st = land.arkState(HW), dx = -Math.sin(cam.az * D2R), dz = -Math.cos(cam.az * D2R), [gx, hy] = projv(cam.T[0] + dx * 500, st.L, cam.T[2] + dz * 500), k = smooth(75, 79, t), h = Math.max(hy, 300);
  const g = cx.createLinearGradient(0, 0, 0, h + 12), C = (a, b) => css(mx(hx(a), hx(b), k));
  g.addColorStop(0, '#0e1236'); g.addColorStop(.5, '#22274f'); g.addColorStop(.8, C('#34305a', '#54486e')); g.addColorStop(1, C('#5e4a6a', '#b88e78')); cx.fillStyle = g; cx.fillRect(0, 0, W, h + 12);
  const [sx] = proj(V3(land.arkState(HW).x - 1.5, st.L, land.arkState(HW).z + 1.0));
  SK.forEach((c, i) => {
    const x = ((c.x + t * c.v) % 1.2 - .1) * W, y = h - 60 - c.y * h * .82, r = (160 + 300 * c.s) * (.7 + .5 * c.y), gap = 1 - .8 * k * Math.exp(-Math.pow((x - sx) / 300, 2)) * (1 - c.y * .6);
    cx.save(); cx.translate(x, y); cx.scale(1, .3); const rg = cx.createRadialGradient(0, 0, 0, 0, 0, r); rg.addColorStop(0, `rgba(14,18,46,${c.a * gap})`); rg.addColorStop(.55, `rgba(20,24,56,${c.a * .7 * gap})`); rg.addColorStop(1, 'rgba(24,28,62,0)'); cx.fillStyle = rg; cx.fillRect(-r, -r, 2 * r, 2 * r); cx.restore();
  });
  const gl = cx.createRadialGradient(sx, h, 0, sx, h, 760); gl.addColorStop(0, `rgba(255,214,150,${.34 * k})`); gl.addColorStop(.4, `rgba(255,180,120,${.12 * k})`); gl.addColorStop(1, 'rgba(255,170,110,0)'); cx.save(); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = gl; cx.fillRect(0, h - 760, W, 900); cx.restore();
}
const doorOpen = t => 1 - ease.inOutSine(seg(t, 31.4, 34.0));
const HOPE_L = [[75, LK('#4a5886', '#1c2238', .82, '#ffd9a8', .6, [-7, 3.6, -6], .3, '#7a8cff', [8, 5, 6], [0, 0, 0], 16)], [83, LK('#52608c', '#1e263c', .86, '#ffddb0', .7, [-7, 3.2, -6], .3, '#7a8cff', [-8, 5, 6], [0, 0, 0], 16)]];
const HOPE_BG = [[75, ['#141a40', '#8a6a70']], [83, ['#181e46', '#a07a70']]];
const IN_L = [[28.8, LK('#2a2e48', '#14121c', .62, '#ffa660', 2.0, [-13, 4, 3.5], .2, '#6a7cff', [10, 6, -8], [0, 0, 0], 4)], [34, LK('#242840', '#12101a', .46, '#ffa660', 1.6, [-13, 4, 3.5], .15, '#6a7cff', [10, 6, -8], [0, 0, 0], 4)], [36.2, LK('#1c2036', '#0e0e16', .3, '#98a6d4', .5, [-9, 7, 5], .1, '#6a7cff', [10, 6, -8], [0, 0, 0], 4)]];
const IN_BG = [[0, ['#0c0c18', '#16121c']], [99, ['#0c0c18', '#16121c']]];
const SHOTS = [
  { id: 'land', t0: 0, abs: true, follow: true, smoothCam: true, groups: [land.group], light: land.light, bg: land.bg, bloom: LBL, scrim: LSC, vig: LVG, grain: .1, cam: CAM_LAND, water: land.water,
    update: (lt, t) => land.update(t, camera),
    back: (cx, lt, t) => starfield(cx, t, .55 * (1 - smooth(14, 30, t))),
    halos: (cx, lt, t) => {
      const [nx, ny] = proj(V3(3.2, 1.0, 1.1)); halo(cx, nx, ny, 560, '255,206,130', .12 * smooth(1, 4, t) * (1 - smooth(22, 28, t)));
      const [dx, dy] = proj(V3(5.4, AY0 + .75, DOORZ)); halo(cx, dx, dy, 380, '255,196,120', .16 * smooth(21, 24, t));
    } },
  { id: 'inside', t0: IN0, xin: 1.2, abs: true, follow: true, smoothCam: true, groups: [land.group], light: IN_L, bg: IN_BG, bloom: [[0, .6]], scrim: [[0, .12]], vig: [[0, .7]], grain: .12, cam: CAM_IN, clip: true, water: land.water,
    update: (lt, t) => land.update(t, camera, { interior: true }),
    halos: (cx, lt, t) => { const [dx, dy] = proj(V3(5.7, AY0 + .72, ARKP.z + zb(6))); halo(cx, dx, dy, 560, '255,200,130', .3 * doorOpen(t) * smooth(28.8, 29.8, t)); } },
  { id: 'flood', t0: FT0, xin: 1.4, abs: true, follow: true, smoothCam: true, groups: [land.group], light: land.light, bg: land.bg, bloom: LBL, scrim: LSC, vig: LVG, grain: .1, cam: CAM_FLOOD, water: land.water,
    update: (lt, t) => { land.water.U.uHaze.value.set('#1c2036'); land.water.U.uSky.value.set('#3a4a78'); land.water.U.uDeep.value.set('#14305a'); land.water.U.uShallow.value.set('#3a7088'); land.water.U.uSpec.value = .35; land.water.U.uFoam.value = .55; land.update(t, camera); },
    back: (cx, lt, t) => starfield(cx, t, 0),
    halos: (cx, lt, t) => { const s = land.arkState(t), [ax, ay] = proj(V3(s.x - 1.6, s.y + .7, s.z + .4)); halo(cx, ax, ay, 420, '255,184,104', .08 * smooth(36.5, 40, t) * (1 - smooth(46, 52, t))); } },
  { id: 'trust', t0: TT.t0, xin: 1.6, abs: true, follow: true, smoothCam: true, groups: [trust.group], light: trust.light, bg: trust.bg, bloom: [[0, .45]], scrim: [[0, .2]], vig: [[0, .55]], grain: .1, cam: trust.cam, water: trust.water, fog: trust.fog,
    update: (lt, t, cam) => trust.update(lt, t, cam),
    back: (cx, lt, t, cam) => { const [, hy] = proj(V3(0, 0, -150)); const g = cx.createLinearGradient(0, hy - 380, 0, hy + 30); g.addColorStop(0, 'rgba(92,84,120,0)'); g.addColorStop(1, 'rgba(92,84,120,.95)'); cx.fillStyle = g; cx.fillRect(0, hy - 380, W, 410); cx.fillStyle = 'rgba(92,84,120,.95)'; cx.fillRect(0, hy + 29, W, H); },
    halos: (cx, lt, t) => { const [lx, ly] = proj(trust.lg.position); halo(cx, lx, ly, 170, '255,200,130', .22 * smooth(61, 63, t)); const [ex, ey] = proj(V3(0, 1.4, -16)); halo(cx, ex, ey, 620, '255,196,140', .16 * smooth(61, 68, t)); } },
  { id: 'hope', t0: HT0, xin: 1.6, abs: true, follow: true, smoothCam: true, groups: [land.group], light: HOPE_L, bg: HOPE_BG, bloom: [[0, .6]], scrim: [[0, .2]], vig: [[0, .6]], grain: .1, cam: CAM_HOPE, water: land.water,
    update: (lt, t) => { const k = smooth(75, 78, t); land.water.U.uHaze.value.set('#8a6068'); land.water.U.uSky.value.set('#232a50'); land.water.U.uDeep.value.set('#143e7a'); land.water.U.uShallow.value.set('#2c72a0'); land.water.U.uSpec.value = .16; land.water.U.uFoam.value = .35; land.update(HW + (t - HT0) * .25, camera, { hope: k, noCloud: true }); },
    back: (cx, lt, t, cam) => hopeSky(cx, t, cam),
    halos: (cx, lt, t) => { const s = land.arkState(HW), [gx, gy] = proj(V3(s.x - 1.5, land.arkState(HW).L + .6, s.z + 1.0)); halo(cx, gx, gy, 560, '255,206,130', .2 * smooth(75.6, 79, t)); },
    post: (cx, lt, t) => { const s = land.arkState(HW), [gx, gy] = proj(V3(s.x - 1.5, s.L + 17, s.z + 1.0)); rays(cx, gx, gy, smooth(75.8, 79.5, t) * .36, t, .32, 1); } },
  { id: 'end', t0: 83.0, xin: 1.0, groups: [endG], update: (lt, t) => { endCubes.update(t); endMotes.update(t, 1, [0, -4, 0]); }, light: [[0, LK('#5a6ca8', '#1a1a2a', .55, '#ffcf90', 1.4, [-8, 8, 9], .5, '#7a8cff', [10, 6, -8], [0, 0, 0], 16)]], bg: [[0, ['#050a1e', '#10204a']]], bloom: [[0, .7]], scrim: [[0, .1]], vig: [[0, .5]], grain: .09,
    cam: [{ t: 0, T: [0, 0, 0], az: 20, el: 14, w: 16, fov: 26, dy: 0 }, { t: 7.2, T: [0, 0, 0], az: 34, el: 12, w: 14, fov: 26, dy: 0 }],
    post: (cx, lt, t) => drawEnding(cx, lt, t, proj) },
].sort((a, b) => a.t0 - b.t0);
SHOTS.forEach(s => { for (const k of ['light', 'bg']) if (s[k].length < 2) s[k] = [...s[k], [s[k][0][0] + 999, s[k][0][1]]]; });
SHOTS.forEach((s, i) => { s.end = i + 1 < SHOTS.length ? SHOTS[i + 1].t0 + (SHOTS[i + 1].wipe ?? SHOTS[i + 1].xin ?? 0) : 999; });

// ---------- render one shot into a 2D context
const bl = (keys, lt) => keyed(lt, keys, ease.inOutSine);
function renderShot(sh, t, cx) {
  const lt = t - sh.t0;
  cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over'; cx.filter = 'none'; cx.letterSpacing = '0px'; cx.shadowBlur = 0;
  arkMats.forEach(m2 => { m2.clippingPlanes = sh.clip ? [clipPl] : null; });
  { const em = smooth(36, 40, t) * (1 - .6 * smooth(75, 79, t)); arkMats.forEach(m2 => { if (m2.emissive) m2.emissive.setRGB(.018, .011, .006).multiplyScalar(em); }); }
  ALL.forEach(g => g.visible = false); sh.groups.forEach(g => g.visible = true); if (window.__hide) { land.group.children.forEach((c, i) => c.visible = !window.__hide.includes(i)); }
  const DBG = q.get('cam') || window.__DBGCAM; const dk = DBG ? (([x, y, z, az, el, w]) => ({ T: [x, y, z], az, el, w, fov: 26, dy: 290 }))(DBG.split(',').map(Number)) : null; const cam = setCamera(DBG ? [{ t: 0, ...dk }, { t: 99, ...dk }] : sh.cam, lt, !DBG && sh.smoothCam, sh.near); sh.update && sh.update(lt, t, cam);
  const kt = sh.abs ? t : lt, L = lightAt(sh.light, kt);
  hemi.color.setRGB(...L.hs.map(v => v / 255)).convertSRGBToLinear(); hemi.groundColor.setRGB(...L.hg.map(v => v / 255)).convertSRGBToLinear(); hemi.intensity = L.hi;
  sunL.color.setRGB(...L.sc.map(v => v / 255)).convertSRGBToLinear(); sunL.intensity = L.si;
  const sd = V3(...L.sd).normalize(), stp = sh.follow ? cam.T : L.st; sunL.target.position.set(...stp); sunL.position.copy(sd.clone().multiplyScalar(42)).add(sunL.target.position);
  const s = L.ss; Object.assign(sunL.shadow.camera, { left: -s, right: s, top: s, bottom: -s }); sunL.shadow.camera.updateProjectionMatrix();
  fill.color.setRGB(...L.fc.map(v => v / 255)).convertSRGBToLinear(); fill.intensity = L.fi; fill.position.set(...L.fd);
  sunL.updateMatrixWorld(); sunL.target.updateMatrixWorld(); if (sh.water) sh.water.light(hemi, sunL);
  const fg = sh.fog && sh.fog(lt, t, cam); scene.fog = fg ? new THREE.Fog(fg[0], fg[1], fg[2]) : null;
  const bg = bgAt(sh.bg, kt), g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, css(bg.a)); g.addColorStop(1, css(bg.b)); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  if (sh.back) sh.back(cx, lt, t, cam);
  renderer.render(scene, camera); cx.drawImage(glc, 0, 0);
  bloom(cx, glc, bl(sh.bloom || [[0, .3]], kt), 1.1);
  sh.halos && sh.halos(cx, lt, t, cam);
  const day = bl(sh.scrim || [[0, .3]], kt), sc = cx.createLinearGradient(0, 0, 0, 1050); sc.addColorStop(0, `rgba(3,6,18,${.14 + day})`); sc.addColorStop(.6, `rgba(3,6,18,${(.14 + day) * .8})`); sc.addColorStop(1, 'rgba(3,6,18,0)'); cx.fillStyle = sc; cx.fillRect(0, 0, W, 1050);
  const vgn = cx.createRadialGradient(W / 2, H * .55, 520, W / 2, H * .55, 1350), vs = bl(sh.vig || [[0, .4]], kt); vgn.addColorStop(0, 'rgba(2,4,12,0)'); vgn.addColorStop(1, `rgba(2,4,12,${vs})`); cx.fillStyle = vgn; cx.fillRect(0, 0, W, H);
  sh.post && sh.post(cx, lt, t, cam);
}
const grainPat = ctx.createPattern(grain, 'repeat');
const MIST = [[0, 0], [59.0, 0], [60.7, .5], [62.0, 0], [90, 0]];
function frame(t) {
  const act = SHOTS.filter(s => t >= s.t0 && t < s.end);
  if (act.length >= 2) {
    const [a, b] = act; const k = ease.inOutSine(seg(t, b.t0, b.t0 + (b.xin || .01)));
    renderShot(a, t, cxA); renderShot(b, t, cxB); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(cvA, 0, 0); ctx.globalAlpha = k; ctx.drawImage(cvB, 0, 0); ctx.globalAlpha = 1;
  } else if (act.length === 1) { renderShot(act[0], t, ctx); }
  else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  const fl = keyed(t, MIST, ease.inOutSine); if (fl > .003) { ctx.fillStyle = `rgba(150,150,184,${fl})`; ctx.fillRect(0, 0, W, H); }
  const sh = act[act.length - 1], gr = sh && sh.grain != null ? sh.grain : .1, fi = Math.floor(t * 30);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = gr; ctx.translate((fi * 97) % 256, (fi * 53) % 256); ctx.fillStyle = grainPat; ctx.fillRect(-256, -256, W + 512, H + 512); ctx.restore();
  drawTitles(ctx, t);
  const fo = ease.inOutSine(seg(t, 88.9, 89.97)); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
  const fi0 = 1 - seg(t, 0, .6); if (fi0 > 0) { ctx.fillStyle = `rgba(0,0,0,${fi0})`; ctx.fillRect(0, 0, W, H); }
}
// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['THE FLOOD'], a: 1.0, b: 7.4, y: 400, size: 128, glow: 1 },
  { l: ['WHEN THE WATERS CAME'], a: 1.6, b: 7.4, y: 488, size: 48, color: P.cream, stag: 0 },
  { l: ['THE ANIMALS'], a: 8.8, b: 19.4, y: 395, size: 104, glow: 1 },
  { l: ['NOAH AND', 'HIS FAMILY'], a: 20.6, b: 29.2, y: 330, size: 100, glow: 1 },
  { l: ['THE LORD', 'SHUT HIM IN'], a: 30.4, b: 37.0, y: 330, size: 96, glow: 1 },
  { l: ['THE FLOOD', 'BEGINS'], a: 38.2, b: 48.2, y: 330, size: 104, glow: 1 },
  { l: ['THE ARK', 'FLOATS'], a: 49.4, b: 58.9, y: 330, size: 108, glow: 1 },
  { l: ['TRUST IN', 'UNCERTAINTY'], a: 62.2, b: 73.6, y: 330, size: 100, glow: 1 },
  { l: ['HOPE IN', 'THE STORM'], a: 75.6, b: 82.8, y: 330, size: 104, glow: 1 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 07', .6, 4.8, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 7:1–24', 3.4, 7.4, 600, { size: 36, track: 12 });
  capLine(cx, t, 'GENESIS 7:2–3', 9.4, 19.4, 520, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 7:7', 21.0, 29.2, 560, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 7:16', 30.9, 37.0, 560, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 7:11–12', 38.9, 48.2, 540, { size: 32, track: 10 });
  capLine(cx, t, 'FORTY DAYS AND FORTY NIGHTS', 41.4, 47.8, 604, { size: 28, track: 7, color: P.cream });
  capLine(cx, t, 'GENESIS 7:17–20', 50.1, 58.9, 540, { size: 32, track: 10 });
  capLine(cx, t, '150 DAYS', 55.6, 59.0, 620, { size: 46, track: 14, color: P.cream });
  capLine(cx, t, 'THE WATERS PREVAILED  ·  GENESIS 7:24', 56.2, 59.0, 668, { size: 24, track: 6 });
  capLine(cx, t, 'TODAY', 62.8, 73.4, 580, { size: 30, track: 14, color: P.cream });
  capLine(cx, t, 'HOPE', 76.4, 82.8, 540, { size: 34, track: 14, color: P.goldHi });
}
function seek(t) { t = clamp(t, 0, DURATION - 1e-4); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.letterSpacing = '0px'; ctx.globalCompositeOperation = 'source-over'; frame(t); }
window.seek = seek; window.renderAt = seek;
const EV = [
  { t: 0.8, kind: 'low', gain: 0.5 },
  { t: 4.4, kind: 'whoosh', dur: 2.4, gain: 0.25 },
  { t: 10.6, kind: 'birds', gain: 0.4 },
  { t: 12.8, kind: 'birds', gain: 0.35 },
  { t: 15.0, kind: 'birds', gain: 0.4 },
  { t: 17.2, kind: 'birds', gain: 0.35 },
  { t: 19.4, kind: 'birds', gain: 0.3 },
  { t: 20.5, kind: 'chime', gain: 0.5 },
  { t: 22.0, kind: 'step', gain: 0.22 },
  { t: 22.45, kind: 'step', gain: 0.2 },
  { t: 23.4, kind: 'step', gain: 0.22 },
  { t: 23.85, kind: 'step', gain: 0.2 },
  { t: 24.8, kind: 'step', gain: 0.22 },
  { t: 25.25, kind: 'step', gain: 0.2 },
  { t: 25.5, kind: 'step', gain: 0.2 },
  { t: 26.7, kind: 'step', gain: 0.22 },
  { t: 27.15, kind: 'step', gain: 0.2 },
  { t: 27.3, kind: 'step', gain: 0.2 },
  { t: 28.4, kind: 'step', gain: 0.22 },
  { t: 28.85, kind: 'step', gain: 0.2 },
  { t: 29.0, kind: 'step', gain: 0.2 },
  { t: 28.8, kind: 'whoosh', dur: 1.4, gain: 0.22 },
  { t: 31.4, kind: 'creak', dur: 2.7, gain: 0.55 },
  { t: 34.0, kind: 'door', gain: 0.9 },
  { t: 36.2, kind: 'burst', dur: 3.6, gain: 0.6 },
  { t: 36.4, kind: 'rumble', dur: 4.6, gain: 0.5 },
  { t: 37.8, kind: 'thunder', dur: 5, gain: 0.42 },
  { t: 41.0, kind: 'thunder', dur: 6, gain: 0.5 },
  { t: 44.4, kind: 'creak', dur: 3.6, gain: 0.5 },
  { t: 47.0, kind: 'whoosh', dur: 2.2, gain: 0.35 },
  { t: 49.0, kind: 'thunder', dur: 6, gain: 0.4 },
  { t: 52.6, kind: 'creak', dur: 3, gain: 0.35 },
  { t: 55.0, kind: 'riser', dur: 4.8, gain: 0.35 },
  { t: 59.4, kind: 'whoosh', dur: 2.6, gain: 0.5 },
  { t: 61.8, kind: 'chime', gain: 0.55 },
  { t: 62.4, kind: 'sparkle', gain: 0.2 },
  { t: 62.95, kind: 'sparkle', gain: 0.2 },
  { t: 63.5, kind: 'sparkle', gain: 0.2 },
  { t: 64.05, kind: 'sparkle', gain: 0.2 },
  { t: 64.6, kind: 'sparkle', gain: 0.2 },
  { t: 65.15, kind: 'sparkle', gain: 0.2 },
  { t: 65.7, kind: 'sparkle', gain: 0.2 },
  { t: 70.2, kind: 'step', gain: 0.2 },
  { t: 70.7, kind: 'step', gain: 0.2 },
  { t: 71.2, kind: 'step', gain: 0.2 },
  { t: 71.7, kind: 'step', gain: 0.2 },
  { t: 72.2, kind: 'step', gain: 0.2 },
  { t: 72.7, kind: 'step', gain: 0.2 },
  { t: 74.2, kind: 'chime', gain: 0.5 },
  { t: 74.4, kind: 'sparkle', gain: 0.4 },
  { t: 76.0, kind: 'sparkle', gain: 0.4 },
  { t: 77.8, kind: 'chime', gain: 0.5 },
  { t: 80.0, kind: 'grow', dur: 3.2, gain: 0.35 },
  { t: 83.2, kind: 'hit', gain: 0.4 },
  { t: 83.4, kind: 'sparkle', gain: 0.6 },
  { t: 85.0, kind: 'chime', gain: 0.75 },
  { t: 85.2, kind: 'sparkle', gain: 0.8 },
  { t: 86.2, kind: 'sparkle', gain: 0.6 },
  { t: 87.0, kind: 'chime', gain: 0.6 },
];

window.EVENTS = EV; window.__scene = { scene, camera, renderer, land, trust };
Promise.all([document.fonts ? Promise.all(['700 40px Cinzel', '800 40px Cinzel', '600 40px Cinzel', '600 30px Inter', '500 30px Inter', 'italic 500 30px "Cormorant Garamond"', 'italic 600 30px "Cormorant Garamond"'].map(f => document.fonts.load(f))) : null, endingReady]).then(() => {
  window.__ready = true;
  if (q.has('t')) seek(parseFloat(q.get('t'))); else if (!q.has('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); })(); } else seek(0);
});
