// The Living Word Films, Episode 39 - Genesis 39. 90 seconds: 0:00-1:00 story, 1:00-1:25 reflection, 1:25-1:30 question.
import * as THREE from 'three';
import { clamp, lerp, seg, ease, rng, keyed, rgbOf, mx, css, P, smooth } from './util.js';
import { W, H, CINZEL, SANS2, ITAL, bloom, halo, grain, cineTitle, capLine, flare } from './fx2d.js';
import { makeCountry, stage } from './world39.js';
import { makeReflect, RT } from './reflect39.js';
import { makeEnding, endingReady, drawEnding } from './end39.js';
import { makeCubeField, makeMotes } from './props.js';
import { LK } from './lights.js';
import { drawSubs } from './subs39.js';
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

// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 8.4, b1 15.6, b2 26.0, c1 29.6, c2 37.9, d1 44.4, d2 51.6
// phases of the world (who stands where): 0-8.4 Joseph carries a jar to the house | 8.4-15.4 Potiphar watches and puts him in charge | 15.6-22.4 she looks at him, he refuses | 22.4-26 he turns away | 26-29.6 day after day, the light swings | 29.6-32.5 the house is empty, he goes in | 32.5-35.2 she catches his cloak | 35.2-38 he runs out | 37.9-40.9 she calls the servants | 40.9-44.4 she shows the cloak | 44.4-47.4 Potiphar is furious | 47.4-50.6 Joseph is led to the prison | 50.5-58.5 the prison at night | 58.4-61.8 dawn
// a1 (0.6-8.4) In Egypt Joseph served in Potiphar's house; the Lord was with him and everything he did prospered (39:1-3): the house at golden hour, Joseph brings a jar
const S1 = [K(0, 0, P3(-5.3, -1.0, .45), 62, 6, 2.5, { dy: 60 }), K(0, 4.7, P3(-5.6, -1.0, .4), 52, 5, 1.7, { dy: 60 })];
const S2 = [K(4.6, 4.6, P3(-5.3, -1.0, .3), 62, 4, 1.35, { dy: 60 }), K(4.6, 8.5, P3(-5.3, -1.0, .3), 54, 4, 1.05, { dy: 60 })];
// a2 (8.4-15.4) Potiphar saw this; he made Joseph his attendant and put him in charge of his whole household (39:3-4)
const S3 = [K(8.4, 8.4, P3(-6.0, -.45, .3), 70, 4, 1.45, { dy: 60 }), K(8.4, 11.7, P3(-6.0, -.45, .3), 60, 4, 1.15, { dy: 60 })];
const S4 = [K(11.6, 11.6, P3(-5.7, -.85, .3), 25, 5, 1.8, { dy: 60 }), K(11.6, 15.5, P3(-5.7, -.85, .3), 15, 5, 1.4, { dy: 60 })];
// b1 (15.6-26.0) she looked at Joseph and asked him to lie with her (39:7); he refused: how could I do this great wickedness and sin against God (39:8-9)
const S5 = [K(15.6, 15.6, P3(-5.5, -1.2, .32), 58, 4, 1.8, { dy: 60 }), K(15.6, 19.5, P3(-5.5, -1.2, .32), 50, 4, 1.5, { dy: 60 })];
const S6 = [K(19.4, 19.4, P3(-5.0, -.95, .3), 18, 5, 1.8, { dy: 60 }), K(19.4, 22.5, P3(-5.0, -.95, .3), 8, 5, 1.5, { dy: 60 })];
const S7 = [K(22.4, 22.4, P3(-4.6, -.85, .34), -40, 6, 1.6, { dy: 60 }), K(22.4, 26.1, P3(-4.5, -.8, .34), -46, 6, 1.3, { dy: 60 })];
// b2 (26.0-29.6) she pressed him day after day (39:10): the light swings across the sky
const S8 = [K(26.0, 26.0, P3(-4.1, -.5, .3), 38, 6, 1.7, { dy: 60 }), K(26.0, 27.7, P3(-4.6, -1.35, .3), 22, 6, 1.6, { dy: 60 }), K(26.0, 29.6, P3(-5.2, -.35, .3), 48, 6, 1.6, { dy: 60 })];
// c1 (29.6-37.9) one day, with none of the men of the house inside, she caught hold of his cloak; he left it in her hand and ran outside (39:11-12)
const S9 = [K(29.5, 29.5, P3(-5.4, -.6, .32), 50, 6, 1.9, { dy: 60 }), K(29.5, 32.6, P3(-6.0, -1.0, .32), 56, 6, 1.4, { dy: 60 })];
const S10 = [K(32.5, 32.5, P3(-6.2, -1.0, .32), 52, 4, 1.25, { dy: 60 }), K(32.5, 35.3, P3(-6.2, -1.0, .32), 58, 4, 1.05, { dy: 60 })];
const S11 = [K(35.2, 35.2, P3(-5.3, -1.0, .3), 8, 7, 1.6, { dy: 60 }), K(35.2, 36.6, P3(-3.6, -1.0, .3), 8, 7, 1.6, { dy: 60 }), K(35.2, 38.0, P3(-1.9, -.9, .3), 8, 7, 1.6, { dy: 60 })];
// c2 (37.9-44.4) she called her servants and told her husband a story, showing the cloak (39:13-18)
const S12 = [K(37.9, 37.9, P3(-6.0, -1.4, .3), 58, 4, 1.5, { dy: 60 }), K(37.9, 41.0, P3(-6.0, -1.4, .3), 50, 4, 1.3, { dy: 60 })];
const S13 = [K(40.9, 40.9, P3(-5.7, -1.15, .32), 40, 4, 1.45, { dy: 60 }), K(40.9, 44.5, P3(-5.7, -1.15, .32), 30, 4, 1.25, { dy: 60 })];
// d1 (44.4-51.6) Potiphar was furious and had Joseph put in the prison where the king's prisoners were held (39:19-20)
const S14 = [K(44.4, 44.4, P3(-5.5, -.95, .36), 80, 3, 1.25, { dy: 60 }), K(44.4, 47.5, P3(-5.5, -.95, .36), 70, 3, 1.0, { dy: 60 })];
const S15 = [K(47.4, 47.4, P3(-3.15, -2.2, .3), 8, 10, 2.1, { dy: 60 }), K(47.4, 50.7, P3(-3.3, -3.9, .3), 5, 12, 1.7, { dy: 60 })];
// d2 (51.6-59.8) the Lord was with Joseph in prison too, and showed him kindness; the keeper put the prisoners in his care (39:21-23)
const S16 = [K(50.5, 50.5, P3(-3.35, -4.6, .3), 6, 12, 1.9, { dy: 60 }), K(50.5, 54.6, P3(-3.35, -4.6, .3), 8, 11, 1.35, { dy: 60 })];
const S17 = [K(54.5, 54.5, P3(-3.1, -4.7, .32), 22, 36, 1.7, { dy: 60 }), K(54.5, 58.5, P3(-3.1, -4.7, .32), 34, 34, 1.4, { dy: 60 })];
const S18 = [K(58.4, 58.4, P3(-3.4, -4.1, .3), 40, 12, 3.2, { dy: 60 }), K(58.4, 61.8, P3(-5.0, -2.6, .3), 68, 28, 9.0, { dy: 60 })];
const LBL = [[0, .45], [14, .5], [29, .55], [38, .65], [44, .78], [52, .7], [60, .62]], LSC = [[0, .05], [30, .05], [40, 0], [60, .03]], LVG = [[0, .5], [38, .56], [44, .62], [52, .58], [60, .58]];
const landShot = (id, S, extra = {}) => ({ id, t0: S[0].t0, xin: .25, abs: true, follow: true, smoothCam: true, groups: [land.group], light: land.light, bg: land.bg, bloom: LBL, scrim: LSC, vig: LVG, grain: .1, bb: .58, bc: 2.7, cam: S, water: { light() { } },
  update: (lt, t, cam) => { refl.pl.forEach(l => l.intensity = 0); land.update(t, camera, id); }, ...extra });
const DREAM = { light: [[0, LK('#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.4, [9, 5.5, -3], .62, '#7a8cd0', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#070c24', '#1a2a5a']]] };
const DAWN = { light: [[0, LK('#c0b4c0', '#6a5448', .95, '#ffc890', 2.4, [9, 2.6, -5], .5, '#ffcf9a', [-8, 4, 6], [0, 0, 0], 14)]], bg: [[0, ['#6a8ec8', '#f8d4a0']]] };
const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('work', S2, { xin: 0 }), landShot('watch', S3, { xin: 0 }), landShot('charge', S4, { xin: 0 }), landShot('look', S5, { xin: 0 }), landShot('ask', S6, { xin: 0 }), landShot('refuse', S7, { xin: 0 }), landShot('days', S8, { xin: 0 }), landShot('empty', S9, { xin: 0 }),
  landShot('catch', S10, { xin: 0 }), landShot('run', S11, { xin: 0 }), landShot('tell', S12, { xin: 0 }), landShot('show', S13, { xin: 0 }), landShot('furious', S14, { xin: 0 }), landShot('led', S15, { xin: 0 }), landShot('night', S16, { xin: 0 }), landShot('trust', S17, { xin: 0 }),
  landShot('rise', S18, { xin: 0, ...DAWN }),
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
  { l: ['THE LORD WAS', 'WITH JOSEPH'], a: 1.0, b: 4.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['EVERYTHING HE DID', 'PROSPERED'], a: 4.9, b: 8.1, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['POTIPHAR', 'SAW THIS'], a: 8.9, b: 11.4, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['PUT IN CHARGE', 'OF HIS HOUSEHOLD'], a: 12.0, b: 15.2, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ["HIS MASTER'S WIFE", 'LOOKED AT HIM'], a: 16.0, b: 19.2, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['JOSEPH', 'REFUSED'], a: 19.9, b: 22.3, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['HOW COULD I', 'SIN AGAINST GOD?'], a: 22.8, b: 25.9, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['DAY AFTER DAY', 'HE REFUSED'], a: 26.3, b: 29.3, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['NO SERVANTS', 'INSIDE'], a: 29.9, b: 32.3, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['SHE CAUGHT', 'HIS CLOAK'], a: 32.8, b: 35.1, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['HE LEFT IT', 'AND RAN'], a: 35.6, b: 37.8, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['SHE CALLED HER', 'SERVANTS'], a: 38.2, b: 40.8, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['A FALSE STORY', 'AND THE CLOAK'], a: 41.2, b: 44.2, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['POTIPHAR', 'WAS FURIOUS'], a: 44.7, b: 47.3, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THROWN INTO', 'PRISON'], a: 47.7, b: 50.5, y: 330, size: 116, glow: 1, maxW: 980 },
  { l: ['THE LORD WAS', 'THERE TOO'], a: 51.8, b: 54.8, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['THE KEEPER', 'TRUSTED HIM'], a: 55.4, b: 59.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['HE DID RIGHT', 'AND IT COST HIM'], a: 62.0, b: 67.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['THE LORD WAS', 'WITH JOSEPH'], a: 68.3, b: 72.6, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['DOING RIGHT MAY', 'COST YOU SOMETHING'], a: 73.3, b: 78.4, y: 330, size: 84, glow: 1, maxW: 980 },
  { l: ['DO RIGHT WHEN', 'NO ONE IS WATCHING'], a: 79.8, b: 84.8, y: 330, size: 88, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 39', .6, 4.4, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 39:2', 1.4, 4.2, 540, { size: 34, track: 11 });
  [['GENESIS 39:3', 5.1, 8.1], ['GENESIS 39:3', 9.1, 11.4], ['GENESIS 39:4', 12.2, 15.2], ['GENESIS 39:7', 16.2, 19.2], ['GENESIS 39:8', 20.1, 22.3], ['GENESIS 39:9', 23.0, 25.9], ['GENESIS 39:10', 26.5, 29.3], ['GENESIS 39:11', 30.1, 32.3], ['GENESIS 39:12', 33.0, 35.1], ['GENESIS 39:12', 35.8, 37.8], ['GENESIS 39:13–14', 38.4, 40.8], ['GENESIS 39:16–18', 41.4, 44.2], ['GENESIS 39:19', 44.9, 47.3], ['GENESIS 39:20', 47.9, 50.5], ['GENESIS 39:21', 52.0, 54.8], ['GENESIS 39:22', 55.6, 59.0]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 39:20–21', 62.1, 67.2, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 39:2, 21', 68.4, 72.6, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 39:21', 73.4, 78.4, 520, { size: 30, track: 12, color: P.cream });
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

