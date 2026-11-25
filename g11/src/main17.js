// The Living Word Films, Episode 17 - Genesis 17. 90 seconds: 0:00-1:00 story, 1:00-1:25 reflection, 1:25-1:30 question.
import * as THREE from 'three';
import { clamp, lerp, seg, ease, rng, keyed, rgbOf, mx, css, P, smooth } from './util.js';
import { W, H, CINZEL, SANS2, ITAL, bloom, halo, grain, cineTitle, capLine, flare } from './fx2d.js';
import { makeCovenant, EV as WEV, abrahamPos, sarahPos, ishmaelPos, stage } from './world17.js';
import { makeReflect, RT } from './reflect17.js';
import { makeEnding, endingReady, drawEnding } from './end17.js';
import { makeCubeField, makeMotes } from './props.js';
import { LK } from './lights.js';
import { drawSubs } from './subs17.js';
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
const land = makeCovenant(), refl = makeReflect(), ending = makeEnding();
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
// ---------- the story shots (0:00-1:00), windows follow the narration beats (PLACE in the mix and subtitle scripts)
// EK: camera with its eye fixed at E, yaw az, pitch (degrees, up positive), distance D to the look-at point (the target is derived)
const TWF = Math.tan(FOV * D2R / 2) * 2 * (W / H);
const EK = (t0, t, E, az, pitch, D, o = {}) => { const e = -pitch * D2R, a = az * D2R; return K(t0, t, [E[0] - D * Math.sin(a) * Math.cos(e), E[1] - D * Math.sin(e), E[2] - D * Math.cos(a) * Math.cos(e)], az, -pitch, D * TWF, o); };
const { gAt, LP, CG, AB0, SD, IS, FIRE } = stage;
const ABR = (t, dx = 0, dy = .55, dz = 0) => { const p = abrahamPos(t); return [p[0] + dx, p[1] + dy, p[2] + dz]; };
const SAR = (t, dx = 0, dy = .5, dz = 0) => { const p = sarahPos(t); return [p[0] + dx, p[1] + dy, p[2] + dz]; };
const ISH = (t, dx = 0, dy = .45, dz = 0) => { const p = ishmaelPos(t); return [p[0] + dx, p[1] + dy, p[2] + dz]; };
// a1 (0.8-7.3) the night, the column of light, "I am God Almighty; walk before me"
const S1 = [K(0, 0, [.4, 2.4, 4.2], -16, 9, 30, { dy: 190 }), K(0, 2.6, [1.9, 1.5, 4.1], -12, 8, 14, { dy: 230 }), K(0, 5.2, ABR(5.2, 1.15, .62, 0), -10, 7, 5.8), K(0, 8.0, ABR(8.0, 1.1, .62, 0), -8, 6, 5.0)];
// b1 (8.3-12.5) Abram falls on his face
const S2 = [K(8.0, 8.0, ABR(8.0, .1, .5, 0), 24, 5, 3.6), K(8.0, 10.3, ABR(10.3, .1, .22, 0), 30, 12, 3.0), K(8.0, 13.0, ABR(13.0, .0, .3, 0), 34, 22, 5.0)];
// b2 (13.4-17.5) the new name; the pattern is written on the ground
const S3 = [K(13.0, 13.0, [CG[0], .1, CG[1]], 20, 54, 8.0, { dy: 250 }), K(13.0, 15.5, [CG[0], .2, CG[1]], 28, 46, 9.5), K(13.0, 18.0, [CG[0], .3, CG[1]], 34, 38, 11.5)];
// c1 (18.5-23.4) the land, dawn in the east
const S4 = [K(18.0, 18.0, [5.2, .7, 3.9], -80, 7, 13), K(18.0, 21.0, [6.0, .9, 3.6], -72, 8, 16), K(18.0, 24.0, [6.4, 1.1, 3.4], -64, 10, 19)];
// c2 (24.4-29.7) the household gathers
const S5 = [K(23.9, 23.9, [-2.0, .6, 4.5], 22, 12, 12, { dy: 260 }), K(23.9, 26.6, [-.4, .6, 4.7], 16, 10, 9.0), K(23.9, 30.2, [1.0, .8, 4.6], 8, 8, 6.2)];
// d1 (30.7-35.0) Sarai is renamed Sarah
const S6 = [K(30.1, 30.1, SAR(30.1, .2, .42, 0), -26, 6, 3.4), K(30.1, 32.0, SAR(32.0, .1, .5, 0), -18, 5, 1.9), K(30.1, 35.6, SAR(35.0, .0, .52, 0), -10, 4, 1.5)];
// d2 (35.9-41.7) Abraham falls down laughing
const S7 = [K(35.4, 35.4, ABR(35.4, .1, .48, 0), 26, 22, 2.8, { dy: 300 }), K(35.4, 37.2, ABR(37.2, .1, .3, 0), 30, 30, 2.0, { dy: 300 }), K(35.4, 42.2, ABR(41.5, .1, .5, 0), 26, 26, 3.0)];
// d3 (42.7-48.4) Isaac is named; descendants too many to count
const S8 = [K(42.2, 42.2, ABR(42.2, .2, .35, 0), 24, 24, 3.2), K(42.2, 44.8, [1.8, .8, 4.2], 30, 10, 5.0), K(42.2, 48.9, [1.8, 2.0, 4.0], 36, 24, 12)];
// e1 (49.3-52.6) Ishmael is blessed
const S9 = [K(48.9, 48.9, ISH(48.9, 0, .45, 0), -20, 6, 3.2), K(48.9, 51.2, ISH(51.2, .0, .45, 0), -10, 5, 2.0), K(48.9, 53.4, [AB0[0] + .5, .5, AB0[1] + .5], 10, 5, 2.6)];
// e2 (53.5-56.0) "by this time next year": the stars turn fast over the camp
const S10 = [K(53.0, 53.0, [1.0, 1.0, 4.2], -20, 10, 22, { dy: 200 }), K(53.0, 56.8, [1.0, 2.2, 4.0], -10, 15, 27, { dy: 200 })];
// e3 (56.9-59.6) that same day: Abraham walks back to the tents with his household
const S11 = [K(56.4, 56.4, [AB0[0] - .6, .5, AB0[1] + .5], 40, 8, 3.6, { dy: 280 }), K(56.4, 59.0, [-1.6, .6, 5.2], 46, 9, 5.6), K(56.4, 61.6, [-3.0, 2.0, 4.4], 60, 26, 22)];
const LBL = [[0, .3], [24, .22], [38, .3], [56, .3], [60, .4]], LSC = [[0, .06], [24, .04], [60, .08]], LVG = [[0, .5], [60, .5]];
const landShot = (id, S, extra = {}) => ({ id, t0: S[0].t0, xin: .25, abs: true, follow: true, smoothCam: true, groups: [land.group], light: land.light, bg: land.bg, bloom: LBL, scrim: LSC, vig: LVG, grain: .1, bb: .58, bc: 2.7, cam: S, water: { light() { } },
  update: (lt, t, cam) => { refl.pl.forEach(l => l.intensity = 0); land.update(t, camera); }, ...extra });
const SHOTS = [
  landShot('night', S1, { xin: 0 }), landShot('fall', S2), landShot('name', S3), landShot('land', S4), landShot('sign', S5), landShot('sarah', S6), landShot('laugh', S7), landShot('isaac', S8), landShot('ishmael', S9), landShot('year', S10), landShot('that', S11, { xin: .3 }),
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
  const DBG = q.get('cam') || window.__DBGCAM; const dk = DBG ? (([x, y, z, az, el, w]) => ({ T: [x, y, z], az, el, w, fov: 26, dy: 290 }))(DBG.split(',').map(Number)) : null; const cam = setCamera(DBG ? [{ t: 0, ...dk }, { t: 99, ...dk }] : sh.cam, lt, !DBG && sh.smoothCam, sh.near); sh.update && sh.update(lt, t, cam);
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
  { l: ['A NEW', 'NAME'], a: 1.0, b: 4.4, y: 390, size: 124, glow: 1 },
  { l: ['ABRAM FALLS', 'ON HIS FACE'], a: 8.6, b: 12.4, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['FATHER OF', 'MANY NATIONS'], a: 13.6, b: 17.4, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['I WILL BE', 'YOUR GOD'], a: 18.7, b: 23.4, y: 330, size: 112, glow: 1 },
  { l: ['THE SIGN OF', 'THE COVENANT'], a: 24.6, b: 29.4, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['SARAI BECOMES', 'SARAH'], a: 30.9, b: 34.9, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['ABRAHAM', 'LAUGHS'], a: 36.1, b: 41.5, y: 330, size: 116, glow: 1 },
  { l: ['NAME HIM', 'ISAAC'], a: 42.9, b: 48.2, y: 330, size: 116, glow: 1 },
  { l: ['ISHMAEL IS', 'BLESSED TOO'], a: 49.5, b: 52.5, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['NEXT YEAR,', 'THIS TIME'], a: 53.6, b: 55.9, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['THAT SAME', 'DAY'], a: 57.0, b: 59.6, y: 330, size: 112, glow: 1 },
  { l: ['A NEW NAME,', 'BEFORE THE PROMISE'], a: 61.4, b: 65.3, y: 330, size: 80, glow: 1, maxW: 980 },
  { l: ['STILL WAITING,', 'ALREADY NAMED'], a: 66.2, b: 70.6, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['SEEN BY HIS', 'PROMISE'], a: 71.4, b: 76.0, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['BELIEVE WHAT', 'GOD SAYS ABOUT YOU'], a: 77.0, b: 84.7, y: 330, size: 82, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 17', .6, 4.8, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 17:1', 2.6, 4.4, 596, { size: 36, track: 12 });
  [['GENESIS 17:2–3', 8.8, 12.4], ['GENESIS 17:4–5', 13.8, 17.4], ['GENESIS 17:7–8', 18.9, 23.4], ['GENESIS 17:9–14', 24.8, 29.4], ['GENESIS 17:15–16', 31.1, 34.9], ['GENESIS 17:17', 36.3, 41.5],
   ['GENESIS 17:19', 43.1, 48.2], ['GENESIS 17:20', 49.7, 52.5], ['GENESIS 17:21', 53.8, 55.9], ['GENESIS 17:23', 57.2, 59.6]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'TODAY', 61.7, 65.3, 520, { size: 30, track: 14, color: P.cream });
}
function seek(t) { t = clamp(t, 0, DURATION - 1e-4); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.letterSpacing = '0px'; ctx.globalCompositeOperation = 'source-over'; frame(t); }
window.seek = seek; window.renderAt = seek;
// sound events for the SFX synth (kinds are defined in compose8_sfx.py)
const EV = [];
window.EVENTS = EV; window.__W = { abrahamPos, sarahPos, ishmaelPos, stage, state: land.state }; window.__scene = { scene, camera, renderer, land, refl, SHOTS, hemi, sunL };
Promise.all([document.fonts ? Promise.all(['700 40px Cinzel', '800 40px Cinzel', '600 40px Cinzel', '600 30px Inter', '800 52px "Anek Malayalam"', '500 30px Inter', 'italic 500 30px "Cormorant Garamond"', 'italic 600 30px "Cormorant Garamond"'].map(f => document.fonts.load(f))) : null, endingReady]).then(() => {
  window.__ready = true;
  if (q.has('t')) seek(parseFloat(q.get('t'))); else if (!q.has('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); })(); } else seek(0);
});
