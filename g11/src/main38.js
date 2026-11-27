// The Living Word Films, Episode 38 - Genesis 38. 90 seconds: 0:00-1:00 story, 1:00-1:25 reflection, 1:25-1:30 question.
import * as THREE from 'three';
import { clamp, lerp, seg, ease, rng, keyed, rgbOf, mx, css, P, smooth } from './util.js';
import { W, H, CINZEL, SANS2, ITAL, bloom, halo, grain, cineTitle, capLine, flare } from './fx2d.js';
import { makeCountry, stage } from './world38.js';
import { makeReflect, RT } from './reflect38.js';
import { makeEnding, endingReady, drawEnding } from './end38.js';
import { makeCubeField, makeMotes } from './props.js';
import { LK } from './lights.js';
import { drawSubs } from './subs38.js';
import { lam } from './kit.js';
const FPS = 30, BPM = 72, DURATION = 90;
Object.assign(window, { W, H, FPS, BPM, DURATION }); window.__ready = false; window.__cam = () => camera; window.__scene = () => scene;
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
const land = makeCountry(), refl = makeReflect(), ending = makeEnding();
scene.add(land.group);
[...land.pl, ...refl.pl].forEach(l => scene.add(l));
const ALL = [land.group];
const endG = new THREE.Group(), endCubes = makeCubeField({ n: 150, rmin: 3, rmax: 20, yspan: 12, smax: 1.0, seed: 44 }), endMotes = makeMotes({ n: 190, area: [14, 10, 10], size: .06, v: .38, seed: 51, color: 0xffd47a });
endG.add(endCubes.mesh, endMotes.mesh);
refl.group.visible = false; scene.add(refl.group); ALL.push(refl.group);
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
  camera.near = nearO || Math.max(.3, D * .08); camera.far = D * 2.6 + 260; camera.userData.T = c.T; camera.userData.W = c.w; camera.lookAt(c.T[0], c.T[1], c.T[2]); camera.setViewOffset(W, H, c.dx, -c.dy, W, H); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true); c.D = D; c.az = c.az; return c;
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
const K = (t0, t, T, az, el, w, o = {}) => ({ t: t - t0, t0, T, az, el, w, fov: FOV, dy: DY, ...o });
// EK: camera with its eye fixed at E, yaw az, pitch (degrees, up positive), distance D to the look-at point (the target is derived)
const TWF = Math.tan(FOV * D2R / 2) * 2 * (W / H);
const EK = (t0, t, E, az, pitch, D, o = {}) => { const e = -pitch * D2R, a = az * D2R; return K(t0, t, [E[0] - D * Math.sin(a) * Math.cos(e), E[1] - D * Math.sin(e), E[2] - D * Math.cos(a) * Math.cos(e)], az, -pitch, D * TWF, o); };
const { gAt, CITY, JD, OAK, JC, SEIR, HOR, CAMPC, PATH } = stage;
const P3 = (x, z, dy = .5) => [x, gAt(x, z) + dy, z]; window.__gAt = gAt;

// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 8.6, b1 16.8, b2 25.8, c1 31.2, c2 41.5, d1 49.2, d2 56.2
// phases of the world (who stands where): 0-4.6 the wedding | 4.6-6.5 Er at the door, the lamp goes out | 6.5-8.6 Tamar a widow | 8.6-12.2 Judah tells Onan | 12.2-14.2 Onan turns away | 14.2-16.8 the lamp goes out again | 16.8-20.4 Judah tells Tamar | 20.4-22.8 she goes to her father's house | 22.8-25.8 Judah and Shelah | 25.8-27.0 years pass | 27.0-28.4 Shelah grown | 28.4-31.4 Tamar waits | 31.4-34.2 the veil | 34.2-36.6 the road | 36.6-37.8 Judah does not know her | 37.8-41.8 the seal, cord and staff | 41.8-45.0 Judah is told | 45.0-47.6 bring her out | 47.6-49.4 she is led out | 49.4-51.8 she holds out the seal, cord and staff | 51.8-54.8 Judah owns it | 54.8-58.9 the twins | 58.9-61.8 morning
// a1 (0.6-8.6) Judah gave his firstborn Er a wife, Tamar (38:6); Er displeased the Lord and the Lord took his life (38:7): the camp at golden hour, the lamp at the door
const S1 = [K(0, 0, P3(-4.5, .5, .3), 62, 6, 1.6, { dy: 60 }), K(0, 4.7, P3(-4.5, .5, .25), 54, 6, 1.3, { dy: 60 })];
const S2 = [K(4.6, 4.6, P3(-5.1, .6, .25), 60, 5, 1.5, { dy: 60 }), K(4.6, 6.6, P3(-5.1, .6, .25), 52, 5, 1.2, { dy: 60 })];
const S3 = [K(6.5, 6.5, P3(-5.1, .58, .2), 45, 4, 1.4, { dy: 60 }), K(6.5, 8.7, P3(-5.1, .58, .2), 36, 4, 1.15, { dy: 60 })];
// a2 (8.6-16.8) Judah told Onan to marry his brother's widow (38:8); Onan would not give her a child and the Lord took his life too (38:9-10)
const S4 = [K(8.6, 8.6, P3(-4.5, .55, .25), 58, 6, 1.75, { dy: 60 }), K(8.6, 12.3, P3(-4.5, .55, .25), 48, 6, 1.4, { dy: 60 })];
const S5 = [K(12.2, 12.2, P3(-4.5, .88, .2), 22, 5, 1.25, { dy: 60 }), K(12.2, 14.3, P3(-4.5, .88, .2), 10, 5, 1.05, { dy: 60 })];
const S6 = [K(14.2, 14.2, P3(-5.2, .72, .15), 75, 6, 1.6, { dy: 60 }), K(14.2, 16.9, P3(-5.2, .72, .15), 64, 6, 1.3, { dy: 60 })];
// b1 (16.8-25.8) Judah told Tamar to stay a widow in her father's house until Shelah was grown (38:11); he feared Shelah would die too
const S7 = [K(16.8, 16.8, P3(-3.95, .6, .25), 34, 6, 1.9, { dy: 60 }), K(16.8, 20.5, P3(-3.95, .6, .25), 24, 6, 1.55, { dy: 60 })];
const S8 = [K(20.4, 20.4, P3(-3.9, -1.5, .2), 56, 8, 2.8, { dy: 60 }), K(20.4, 22.9, P3(-3.7, -2.6, .2), 50, 8, 2.4, { dy: 60 })];
const S9 = [K(22.8, 22.8, P3(-3.6, .7, .28), 38, 5, 1.6, { dy: 60 }), K(22.8, 25.9, P3(-3.6, .7, .28), 28, 5, 1.3, { dy: 60 })];
// b2 (25.8-31.4) years passed; Shelah grew up, but Tamar was not given to him (38:14)
const S10 = [K(25.8, 25.8, P3(-4.0, .6, .5), 40, 12, 6.2, { dy: 60 }), K(25.8, 27.1, P3(-4.0, .6, .5), 58, 10, 5.6, { dy: 60 })];
const S11 = [K(27.0, 27.0, P3(-3.4, .45, .32), 32, 4, 1.6, { dy: 60 }), K(27.0, 28.5, P3(-3.4, .45, .32), 22, 4, 1.3, { dy: 60 })];
const S12 = [K(28.4, 28.4, P3(-3.35, -4.15, .22), -14, 5, 1.8, { dy: 60 }), K(28.4, 31.5, P3(-3.35, -4.15, .22), -28, 5, 1.4, { dy: 60 })];
// c1 (31.2-41.8) she covered her face with a veil and sat by the road (38:14); Judah did not know her (38:15); he left his seal, cord and staff (38:18)
const S13 = [K(31.4, 31.4, P3(-3.35, -4.15, .24), -30, 4, 1.15, { dy: 60 }), K(31.4, 34.3, P3(-3.35, -4.15, .24), -40, 4, .95, { dy: 60 })];
const S14 = [K(34.2, 34.2, P3(3.4, .9, .3), -78, 6, 2.6, { dy: 60 }), K(34.2, 36.7, P3(3.5, 1.0, .3), -70, 6, 2.1, { dy: 60 })];
const S15 = [K(36.6, 36.6, P3(3.55, 1.0, .34), -62, 4, 1.6, { dy: 60 }), K(36.6, 37.9, P3(3.6, 1.1, .34), -58, 4, 1.35, { dy: 60 })];
const S16 = [K(37.8, 37.8, P3(3.6, 1.5, .1), -40, 9, 1.0, { dy: 60 }), K(37.8, 41.9, P3(4.0, 1.1, .35), -48, 10, 3.2, { dy: 60 })];
// c2 (41.5-49.4) three months later Judah heard Tamar was pregnant and said: bring her out, and let her be burned (38:24): dusk at the gate
const S17 = [K(41.8, 41.8, P3(4.6, .5, .3), -48, 6, 2.4, { dy: 60 }), K(41.8, 45.1, P3(4.6, .5, .3), -42, 6, 1.8, { dy: 60 })];
const S18 = [K(45.0, 45.0, P3(4.7, .55, .3), -8, 6, 1.5, { dy: 60 }), K(45.0, 47.7, P3(4.7, .55, .3), -18, 6, 1.3, { dy: 60 })];
const S19 = [K(47.6, 47.6, P3(5.3, .3, .3), -32, 8, 2.8, { dy: 60 }), K(47.6, 49.5, P3(5.2, .3, .3), -30, 8, 2.4, { dy: 60 })];
// d1 (49.2-54.6) she sent him the seal, cord and staff (38:25); Judah said she is more in the right than he (38:26)
const S20 = [K(49.4, 49.4, P3(4.95, .3, .27), -72, 5, 1.5, { dy: 60 }), K(49.4, 51.9, P3(4.95, .3, .27), -68, 5, 1.2, { dy: 60 })];
const S21 = [K(51.8, 51.8, P3(4.6, .6, .33), -15, 4, 1.3, { dy: 60 }), K(51.8, 54.9, P3(4.6, .6, .33), -24, 4, 1.05, { dy: 60 })];
// d2 (56.2-61.8) Tamar gave birth to twins, Perez and Zerah (38:27-30): morning at her father's house
const S22 = [K(54.8, 54.8, P3(-3.4, -4.2, .25), 30, 8, 3.0, { dy: 60 }), K(54.8, 59.0, P3(-3.4, -4.25, .2), 24, 6, 1.3, { dy: 60 })];
const S23 = [K(58.9, 58.9, P3(-3.4, -4.0, .3), 35, 10, 4.5, { dy: 60 }), K(58.9, 61.8, P3(-3.4, -4.0, .3), 58, 22, 8.0, { dy: 60 })];
const LBL = [[0, .45], [14, .5], [31, .55], [38, .65], [43, .78], [52, .7], [60, .62]], LSC = [[0, .05], [30, .05], [40, 0], [60, .03]], LVG = [[0, .5], [38, .56], [43, .62], [52, .58], [60, .58]];
const landShot = (id, S, extra = {}) => ({ id, t0: S[0].t0, xin: .25, abs: true, follow: true, smoothCam: true, groups: [land.group], light: land.light, bg: land.bg, bloom: LBL, scrim: LSC, vig: LVG, grain: .1, bb: .58, bc: 2.7, cam: S, water: { light() { } },
  update: (lt, t, cam) => { refl.pl.forEach(l => l.intensity = 0); land.update(t, camera, id); }, ...extra });
const DREAM = { light: [[0, LK('#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.4, [9, 5.5, -3], .62, '#7a8cd0', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#070c24', '#1a2a5a']]] };
const DAWN = { light: [[0, LK('#c0b4c0', '#6a5448', .95, '#ffc890', 2.4, [9, 2.6, -5], .5, '#ffcf9a', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#6a8ec8', '#f8d4a0']]] };
const SHOTS = [
  landShot('wed', S1, { xin: 0 }), landShot('door', S2, { xin: 0 }), landShot('widow', S3, { xin: 0 }), landShot('judah', S4, { xin: 0 }), landShot('onan', S5, { xin: 0 }), landShot('lamp', S6, { xin: 0 }), landShot('tell', S7, { xin: 0 }), landShot('away', S8, { xin: 0 }), landShot('worry', S9, { xin: 0 }),
  landShot('years', S10, { xin: 0 }), landShot('grown', S11, { xin: 0 }), landShot('father', S12, { xin: 0 }), landShot('veil', S13, { xin: 0 }), landShot('road', S14, { xin: 0 }), landShot('knew', S15, { xin: 0 }), landShot('left', S16, { xin: 0 }), landShot('told', S17, { xin: 0 }), landShot('burn', S18, { xin: 0 }), landShot('led', S19, { xin: 0 }), landShot('offer', S20, { xin: 0 }), landShot('owns', S21, { xin: 0 }),
  landShot('birth', S22, { xin: .5, ...DAWN }), landShot('rise', S23, { xin: 0, ...DAWN }),
  { id: 'reflect', t0: RT.t0, xin: 1.6, abs: true, follow: true, smoothCam: true, groups: [refl.group], light: refl.light, bg: refl.bg, bloom: [[0, .5]], bb: .5, bc: 3.0, scrim: [[0, .14]], vig: [[0, .5]], grain: .1, cam: refl.cam, water: { light() { } }, fog: null,
    update: (lt, t, cam) => { land.pl.forEach(l => l.intensity = 0); refl.update(lt, t, cam, camera); } },
  { id: 'end', t0: 85.0, xin: 1.0, groups: [endG], update: (lt, t) => { land.pl.forEach(l => l.intensity = 0); refl.pl.forEach(l => l.intensity = 0); endCubes.update(t); endMotes.update(t, 1, [0, -4, 0]); }, light: [[0, LK('#5a6ca8', '#1a1a2a', .55, '#ffcf90', 1.4, [-8, 8, 9], .5, '#7a8cff', [10, 6, -8], [0, 0, 0], 16)]], bg: [[0, ['#050a1e', '#10204a']]], bloom: [[0, .7]], scrim: [[0, .1]], vig: [[0, .5]], grain: .09,
    cam: [{ t: 0, T: [0, 0, 0], az: 20, el: 14, w: 16, fov: 26, dy: 0 }, { t: 5.0, T: [0, 0, 0], az: 34, el: 12, w: 14, fov: 26, dy: 0 }],
    post: (cx, lt, t) => drawEnding(cx, lt, t, proj) },
].sort((a, b) => a.t0 - b.t0);
SHOTS.forEach(s => { for (const k of ['light', 'bg']) if (s[k].length < 2) s[k] = [...s[k], [s[k][0][0] + 999, s[k][0][1]]]; });
SHOTS.forEach((s, i) => { s.end = i + 1 < SHOTS.length ? SHOTS[i + 1].t0 + (SHOTS[i + 1].wipe ?? SHOTS[i + 1].xin ?? 0) : 999; });


// ---------- render one shot into a 2D context
const bl = (keys, lt) => keyed(lt, keys, ease.inOutSine);
function renderShot(sh, t, cx) {
  const lt = t - sh.t0;
  cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over'; cx.filter = 'none'; cx.letterSpacing = '0px'; cx.shadowBlur = 0;
  ALL.forEach(g => g.visible = false); sh.groups.forEach(g => g.visible = true);
  const DBG = q.get('cam') || window.__DBGCAM; const dk = DBG ? (([x, y, z, az, el, w, dy]) => ({ T: [x, y, z], az, el, w, fov: 26, dy: dy ?? 290 }))(DBG.split(',').map(Number)) : null; const cam = setCamera(DBG ? [{ t: 0, ...dk }, { t: 99, ...dk }] : sh.cam, lt, !DBG && sh.smoothCam, sh.near); sh.update && sh.update(lt, t, cam);
  const kt = sh.abs ? t : lt, L = lightAt(sh.light, kt);
  hemi.color.setRGB(...L.hs.map(v => v / 255)).convertSRGBToLinear(); hemi.groundColor.setRGB(...L.hg.map(v => v / 255)).convertSRGBToLinear(); hemi.intensity = L.hi;
  sunL.color.setRGB(...L.sc.map(v => v / 255)).convertSRGBToLinear(); sunL.intensity = L.si;
  const sd = V3(...L.sd).normalize(), stp = sh.follow ? cam.T : L.st; sunL.target.position.set(...stp); sunL.position.copy(sd.clone().multiplyScalar(42)).add(sunL.target.position);
  const s = L.ss; Object.assign(sunL.shadow.camera, { left: -s, right: s, top: s, bottom: -s }); sunL.shadow.camera.updateProjectionMatrix();
  fill.color.setRGB(...L.fc.map(v => v / 255)).convertSRGBToLinear(); fill.intensity = L.fi; fill.position.set(...L.fd);
  sunL.updateMatrixWorld(); sunL.target.updateMatrixWorld(); if (sh.water) sh.water.light(hemi, sunL);
  const fg = sh.fog && sh.fog(lt, t, cam); scene.fog = fg ? new THREE.Fog(fg[0], fg[1], fg[2]) : null;
  const bg = bgAt(sh.bg, kt);
  let gy1 = H; if (sh.water && !sh.noHorizon) { const dxv = cam.T[0] - camera.position.x, dzv = cam.T[2] - camera.position.z, dl = Math.hypot(dxv, dzv) || 1;
    const hp = V3(camera.position.x + 1000 * dxv / dl, camera.position.y, camera.position.z + 1000 * dzv / dl).project(camera); gy1 = (-hp.y * .5 + .5) * H; }
  const gA = (sh.water && !sh.noHorizon) ? cx.createLinearGradient(0, gy1 - 1150, 0, gy1) : cx.createLinearGradient(0, 0, 0, H); gA.addColorStop(0, css(bg.a)); gA.addColorStop(1, css(bg.b)); const g = gA;
  cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  if (sh.back) sh.back(cx, lt, t, cam);
  renderer.render(scene, camera); cx.drawImage(glc, 0, 0);
  bloom(cx, glc, bl(sh.bloom || [[0, .3]], kt), 1.1, sh.bb ?? .72, sh.bc ?? 2.7);
  sh.halos && sh.halos(cx, lt, t, cam);
  const day = bl(sh.scrim || [[0, .3]], kt), sc = cx.createLinearGradient(0, 0, 0, 1050); sc.addColorStop(0, `rgba(3,6,18,${.14 + day})`); sc.addColorStop(.6, `rgba(3,6,18,${(.14 + day) * .8})`); sc.addColorStop(1, 'rgba(3,6,18,0)'); cx.fillStyle = sc; cx.fillRect(0, 0, W, 1050);
  const vgn = cx.createRadialGradient(W / 2, H * .55, 520, W / 2, H * .55, 1350), vs = bl(sh.vig || [[0, .4]], kt); vgn.addColorStop(0, 'rgba(2,4,12,0)'); vgn.addColorStop(1, `rgba(2,4,12,${vs})`); cx.fillStyle = vgn; cx.fillRect(0, 0, W, H);
  sh.post && sh.post(cx, lt, t, cam);
}
const grainPat = ctx.createPattern(grain, 'repeat');
const MIST = [[0, 0], [58.8, 0], [60.4, .5], [61.6, 0], [90, 0]];
function frame(t) {
  const act = SHOTS.filter(s => t >= s.t0 && t < s.end);
  if (act.length >= 2) {
    const [a, b] = act; const k = ease.inOutSine(seg(t, b.t0, b.t0 + (b.xin || .01)));
    renderShot(a, t, cxA); renderShot(b, t, cxB); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(cvA, 0, 0); ctx.globalAlpha = k; ctx.drawImage(cvB, 0, 0); ctx.globalAlpha = 1;
  } else if (act.length === 1) { renderShot(act[0], t, ctx); }
  else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  const fl = keyed(t, MIST, ease.inOutSine); if (fl > .003) { ctx.fillStyle = `rgba(230,190,170,${fl})`; ctx.fillRect(0, 0, W, H); }
  const sh = act[act.length - 1], gr = sh && sh.grain != null ? sh.grain : .1, fi = Math.floor(t * 30);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = gr; ctx.translate((fi * 97) % 256, (fi * 53) % 256); ctx.fillStyle = grainPat; ctx.fillRect(-256, -256, W + 512, H + 512); ctx.restore();
  drawTitles(ctx, t); drawSubs(ctx, t);
  const fo = ease.inOutSine(seg(t, 88.9, 89.97)); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
  const fi0 = 1 - seg(t, 0, .6); if (fi0 > 0) { ctx.fillStyle = `rgba(0,0,0,${fi0})`; ctx.fillRect(0, 0, W, H); }
}
// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['THE FIRSTBORN ER', 'AND TAMAR'], a: 1.0, b: 4.4, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['THE LORD TOOK', "ER'S LIFE"], a: 4.9, b: 8.2, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['MARRY YOUR', "BROTHER'S WIDOW"], a: 9.0, b: 12.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['ONAN WOULD NOT', 'GIVE HER A CHILD'], a: 12.6, b: 16.1, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['STAY A WIDOW', 'TILL SHELAH GROWS'], a: 17.1, b: 20.4, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['JUDAH FEARED', 'SHELAH WOULD DIE'], a: 20.9, b: 25.6, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['YEARS', 'PASSED'], a: 26.0, b: 28.2, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['SHE WAS NOT', 'GIVEN TO HIM'], a: 28.6, b: 31.2, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['A VEIL', 'OVER HER FACE'], a: 31.7, b: 34.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['SHE SAT', 'BY THE ROAD'], a: 34.6, b: 37.4, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['SEAL, CORD', 'AND STAFF'], a: 37.9, b: 41.6, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THREE MONTHS', 'LATER'], a: 42.2, b: 44.8, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['BRING HER OUT', 'LET HER BE BURNED'], a: 45.3, b: 48.6, y: 330, size: 90, glow: 1, maxW: 980 },
  { l: ['SHE SENT HIM', 'HIS OWN SEAL'], a: 49.6, b: 52.0, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['MORE IN THE', 'RIGHT THAN I'], a: 52.6, b: 54.6, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['TWINS:', 'PEREZ AND ZERAH'], a: 56.3, b: 60.0, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['HE HAD KEPT', 'SHELAH FROM HER'], a: 62.0, b: 67.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['HE DID NOT ARGUE', 'HE ADMITTED IT'], a: 68.3, b: 72.6, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['IT TAKES COURAGE', 'TO ADMIT A WRONG'], a: 73.3, b: 78.4, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['MAKE IT RIGHT', 'IF YOU CAN'], a: 79.8, b: 84.8, y: 330, size: 108, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 38', .6, 4.4, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 38:6', 1.4, 4.2, 540, { size: 34, track: 11 });
  [['GENESIS 38:7', 5.1, 8.2], ['GENESIS 38:8', 9.2, 12.2], ['GENESIS 38:9–10', 12.8, 16.1], ['GENESIS 38:11', 17.3, 20.4], ['GENESIS 38:11', 21.1, 25.6], ['GENESIS 38:14', 26.2, 28.2], ['GENESIS 38:14', 28.8, 31.2], ['GENESIS 38:14', 31.9, 34.0], ['GENESIS 38:14–16', 34.8, 37.4], ['GENESIS 38:18', 38.1, 41.6], ['GENESIS 38:24', 42.4, 44.8], ['GENESIS 38:24', 45.5, 48.6], ['GENESIS 38:25', 49.8, 52.0], ['GENESIS 38:26', 52.8, 54.6], ['GENESIS 38:27–30', 56.5, 60.0]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 38:11', 62.1, 67.2, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 38:25–26', 68.4, 72.6, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 38:26', 73.4, 78.4, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 79.9, 84.8, 520, { size: 30, track: 14, color: P.cream });
}
function seek(t) { t = clamp(t, 0, DURATION - 1e-4); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.letterSpacing = '0px'; ctx.globalCompositeOperation = 'source-over'; frame(t); }
window.seek = seek; window.renderAt = seek;
// sound events for the SFX synth (kinds are defined in compose8_sfx.py)
const EV = [];
window.EVENTS = EV; window.__W = { stage, state: land.state }; window.__scene = { scene, camera, renderer, land, refl, SHOTS, hemi, sunL };
Promise.all([document.fonts ? Promise.all(['700 40px Cinzel', '800 40px Cinzel', '600 40px Cinzel', '600 30px Inter', '800 52px "Anek Malayalam"', '500 30px Inter', 'italic 500 30px "Cormorant Garamond"', 'italic 600 30px "Cormorant Garamond"'].map(f => document.fonts.load(f))) : null, endingReady]).then(() => {
  window.__ready = true;
  if (q.has('t')) seek(parseFloat(q.get('t'))); else if (!q.has('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); })(); } else seek(0);
});

