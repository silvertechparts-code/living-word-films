// The Living Word Films, Episode 31 - Genesis 31. 90 seconds: 0:00-1:00 story, 1:00-1:25 reflection, 1:25-1:30 question.
import * as THREE from 'three';
import { clamp, lerp, seg, ease, rng, keyed, rgbOf, mx, css, P, smooth } from './util.js';
import { W, H, CINZEL, SANS2, ITAL, bloom, halo, grain, cineTitle, capLine, flare } from './fx2d.js';
import { makeCountry, stage } from './world31.js';
import { makeReflect, RT } from './reflect31.js';
import { makeEnding, endingReady, drawEnding } from './end31.js';
import { makeCubeField, makeMotes } from './props.js';
import { LK } from './lights.js';
import { drawSubs } from './subs31.js';
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
const { gAt, HZ, DOOR, YARD, WELL, FLD, FIRE, PAS, PATH, CAMP, HEAP } = stage;
const P3 = (x, z, dy = .5) => [x, gAt(x, z) + dy, z];

// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 6.66, b1 14.49, b2 22.04, c1 27.72, c2 36.44, d1 46.21, e1 54.41
// a1 (0.6-5.9) after twenty years with Laban the Lord told Jacob: go back to the land of your fathers, and I will be with you (31:3); God is shown only as a shaft of light
const S1 = [K(0, 0, P3(-1.5, -2.6, .5), 22, 16, 8.2, { dy: 300 }), K(0, 3.7, P3(-1.6, -2.7, .5), 14, 12, 6.0, { dy: 300 })];
const S2 = [K(3.2, 3.2, P3(-.6, -2.45, .62), 14, 6, 3.2, { dy: 300 }), K(3.2, 7.0, P3(-.58, -2.45, .62), 4, 5, 2.5, { dy: 300 })];
// a2 (6.66-13.74) Jacob left in secret with his wives, children and flocks; Rachel stole her father's household gods (31:17-21)
const S3 = [K(6.4, 6.4, P3(-3.8, 1.3, .5), 36, 8, 3.8, { dy: 300 }), K(6.4, 8.8, P3(-3.2, 1.4, .5), 34, 8, 4.6, { dy: 300 }), K(6.4, 10.9, P3(-1.4, 1.3, .5), 28, 8, 5.2, { dy: 300 })];
const S4 = [K(10.4, 10.4, P3(-5.1, .8, .5), 24, 5, 2.4, { dy: 300 }), K(10.4, 12.4, P3(-5.1, .7, .45), 22, 5, 1.7, { dy: 300 }), K(10.4, 13.6, P3(-4.5, 1.1, .5), 14, 5, 2.0, { dy: 300 }), K(10.4, 14.6, P3(-3.9, 1.4, .5), 8, 5, 2.6, { dy: 300 })];
// b1 (14.49-21.29) Laban chased them for seven days; in a dream God warned him to be careful what he said to Jacob (31:22-24)
const S5 = [K(14.3, 14.3, P3(-3.2, 1.2, .5), 40, 5, 3.6, { dy: 300 }), K(14.3, 15.8, P3(-.5, .9, .5), 40, 5, 3.6, { dy: 300 }), K(14.3, 17.5, P3(2.4, -.1, .5), 40, 5, 4.2, { dy: 300 })];
const S6 = [K(17.2, 17.2, P3(2.6, 3.6, .3), 24, 14, 5.0, { dy: 300 }), K(17.2, 19.4, P3(3.0, 3.9, .2), 12, 10, 3.2, { dy: 300 }), K(17.2, 22.0, P3(3.2, 3.9, .2), 6, 22, 3.6, { dy: 300 })];
// b2 (22.04-26.97) Laban asked Jacob why he fled in secret and why he stole his gods (31:26-30)
const S7 = [K(21.6, 21.6, P3(5.6, -1.1, .55), -8, 6, 3.6, { dy: 300 }), K(21.6, 25.0, P3(5.7, -1.1, .55), 4, 6, 2.8, { dy: 300 })];
const S8 = [K(24.7, 24.7, P3(4.85, -1.15, .62), 36, 4, 2.4, { dy: 300 }), K(24.7, 28.0, P3(4.85, -1.15, .62), 32, 4, 2.2, { dy: 300 })];
// c1 (27.72-35.69) Jacob: whoever has them will not live (he did not know Rachel had taken them); Laban searched and found nothing (31:31-35)
const S9 = [K(27.6, 27.6, P3(6.5, -1.15, .62), -48, 5, 2.2, { dy: 300 }), K(27.6, 31.0, P3(6.5, -1.15, .62), -34, 5, 2.0, { dy: 300 })];
const S10 = [K(30.8, 30.8, P3(7.0, -2.2, .5), 0, 8, 5.8, { dy: 300 }), K(30.8, 33.4, P3(8.0, -2.2, .5), 6, 8, 4.9, { dy: 300 }), K(30.8, 36.0, P3(9.6, -1.9, .5), 8, 8, 3.8, { dy: 300 })];
// c2 (36.44-45.46) Jacob answered: twenty years I served you, you changed my wages ten times; without God you would have sent me away empty (31:36-42)
const S11 = [K(35.7, 35.7, P3(6.7, -1.15, .62), -35, 4, 2.4, { dy: 300 }), K(35.7, 40.8, P3(6.7, -1.15, .62), -30, 4, 2.3, { dy: 300 })];
const S12 = [K(40.6, 40.6, P3(6.5, -1.15, .7), -28, 2, 2.4, { dy: 300 }), K(40.6, 43.6, P3(6.5, -1.15, .7), -16, 5, 2.0, { dy: 300 }), K(40.6, 46.6, P3(6.55, -1.1, .8), -6, 9, 2.6, { dy: 300 })];
// d1 (46.21-53.66) they piled up stones as a witness; Laban: the Lord watch between us when we are out of each other's sight (31:44-49)
const S13 = [K(46.0, 46.0, P3(5.6, -1.0, .45), 16, 9, 5.6, { dy: 300 }), K(46.0, 48.4, P3(5.6, -1.0, .45), 6, 8, 4.4, { dy: 300 }), K(46.0, 50.6, P3(5.6, -1.0, .45), -4, 7, 3.8, { dy: 300 })];
const S14 = [K(50.2, 50.2, P3(5.6, -1.1, .6), -10, 4, 4.6, { dy: 300 }), K(50.2, 54.6, P3(5.6, -1.1, .6), 6, 4, 3.6, { dy: 300 })];
// e1 (54.41-59.64) next morning Laban kissed his grandchildren and daughters, blessed them, and went home (31:55)
const S15 = [K(54.2, 54.2, P3(7.7, -.9, .5), 18, 6, 3.0, { dy: 300 }), K(54.2, 58.4, P3(8.2, -.9, .5), 8, 7, 3.4, { dy: 300 })];
const S16 = [K(57.8, 57.8, P3(5.0, -1.0, .6), 12, 7, 4.0, { dy: 300 }), K(57.8, 60.0, P3(3.0, -.6, .6), 16, 8, 4.6, { dy: 300 }), K(57.8, 61.8, P3(1.2, -.1, .6), 22, 9, 5.4, { dy: 300 })];
const LBL = [[0, .4], [10, .42], [17, .5], [22, .46], [30, .45], [41, .52], [47, .45], [54, .46], [60, .46]], LSC = [[0, .06], [17, .04], [24, .05], [47, .03], [60, .03]], LVG = [[0, .5], [60, .55]];
const landShot = (id, S, extra = {}) => ({ id, t0: S[0].t0, xin: .25, abs: true, follow: true, smoothCam: true, groups: [land.group], light: land.light, bg: land.bg, bloom: LBL, scrim: LSC, vig: LVG, grain: .1, bb: .58, bc: 2.7, cam: S, water: { light() { } },
  update: (lt, t, cam) => { refl.pl.forEach(l => l.intensity = 0); land.update(t, camera, id); }, ...extra });
const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('go', S2, { xin: .5 }), landShot('leave', S3, { xin: .5 }), landShot('steal', S4, { xin: .5 }), landShot('chase', S5, { xin: .5 }), landShot('dream', S6, { xin: .5 }), landShot('meet', S7, { xin: .5 }), landShot('accuse', S8, { xin: .5 }),
  landShot('oath', S9, { xin: .5 }), landShot('search', S10, { xin: .5 }), landShot('grief', S11, { xin: .5 }), landShot('light', S12, { xin: .5 }), landShot('stones', S13, { xin: .5 }), landShot('pact', S14, { xin: .5 }), landShot('kiss', S15, { xin: .5 }), landShot('home', S16, { xin: .5 }),
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
  { l: ['TWENTY YEARS', 'WITH LABAN'], a: 1.0, b: 5.4, y: 390, size: 100, glow: 1, maxW: 980 },
  { l: ['LEAVING', 'IN SECRET'], a: 7.2, b: 13.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['LABAN CHASED', 'SEVEN DAYS'], a: 14.9, b: 18.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['GOD WARNED HIM', 'IN A DREAM'], a: 19.0, b: 22.0, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['WHY DID YOU', 'STEAL MY GODS?'], a: 22.5, b: 27.2, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['WHOEVER HAS THEM', 'WILL NOT LIVE'], a: 28.2, b: 32.8, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['LABAN SEARCHED,', 'FOUND NOTHING'], a: 33.1, b: 35.8, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['TWENTY YEARS,', 'TEN CHANGES'], a: 36.9, b: 41.6, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['GOD WAS', 'ON MY SIDE'], a: 42.2, b: 45.8, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['A HEAP OF STONES', 'AS WITNESS'], a: 46.6, b: 50.8, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['THE LORD WATCH', 'BETWEEN US'], a: 51.3, b: 54.1, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['BLESSED THEM,', 'WENT HOME'], a: 54.9, b: 59.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['TWENTY YEARS', 'OF HARD WORK'], a: 61.8, b: 66.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['GOD SAW', 'HIS HARDSHIP'], a: 67.3, b: 71.9, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['GOD SEES WHAT', 'NO ONE NOTICES'], a: 72.7, b: 78.4, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['TELL GOD', 'WHAT NO ONE SAW'], a: 79.5, b: 84.8, y: 330, size: 96, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 31', .6, 5.0, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 31:3', 2.6, 5.6, 596, { size: 36, track: 12 });
  [['GENESIS 31:17–21', 7.3, 13.0], ['GENESIS 31:22–24', 15.0, 22.0], ['GENESIS 31:26–30', 22.6, 27.2], ['GENESIS 31:31–35', 28.3, 35.8], ['GENESIS 31:36–42', 37.0, 45.8], ['GENESIS 31:44–49', 46.7, 54.1], ['GENESIS 31:55', 55.0, 59.4]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'TODAY', 61.9, 65.2, 520, { size: 30, track: 14, color: P.cream });
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

