// The Living Word Films, Episode 47 - Genesis 47. 90 seconds: 0:00-1:00 story, 1:00-1:25 reflection, 1:25-1:30 question.
import * as THREE from 'three';
import { clamp, lerp, seg, ease, rng, keyed, rgbOf, mx, css, P, smooth } from './util.js';
import { W, H, CINZEL, SANS2, ITAL, bloom, halo, grain, cineTitle, capLine, flare } from './fx2d.js';
import { makeCountry, stage } from './world47.js';
import { makeReflect, RT } from './reflect47.js';
import { makeEnding, endingReady, drawEnding } from './end47.js';
import { makeCubeField, makeMotes } from './props.js';
import { LK } from './lights.js';
import { drawSubs } from './subs47.js';
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

// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 7.8, b1 12.9, b2 18.9, c1 24.5, c2 31.9, d1 41.5, d2 46.7, e1 56.5
// phases of the world: 0-24 Pharaoh's court (the brothers, Jacob's blessing), with Goshen at 9.7-12.9 | 24-41 the famine: the granary, the livestock, the field, the seed | 41-50 Goshen grows, Jacob at his tent | 50-62 the bed, the oath, the bow at dusk
const S1 = [K(0.0, 0.0, P3(-5.3, -0.55, 0.4), 100, 7, 3.4, { dy: 60 }), K(0.0, 3.4, P3(-5.45, -0.55, 0.45), 108, 6, 2.8, { dy: 60 })];
const S2 = [K(3.3, 3.3, P3(-4.6, -0.55, 0.35), 120, 8, 2.6, { dy: 60 }), K(3.3, 7.0, P3(-4.6, -0.55, 0.35), 130, 8, 2.3, { dy: 60 })];
const S3 = [K(6.9, 6.9, P3(-6.0, -0.6, 0.45), 70, 5, 1.6, { dy: 60 }), K(6.9, 9.8, P3(-6.0, -0.6, 0.47), 78, 5, 1.3, { dy: 60 })];
const S4 = [K(9.7, 9.7, P3(-3.2, 3.6, 0.35), 350, 14, 4.2, { dy: 60 }), K(9.7, 12.9, P3(-3.2, 3.6, 0.35), 338, 14, 3.8, { dy: 60 })];
const S5 = [K(12.8, 12.8, P3(-4.2, -0.9, 0.35), 100, 7, 2.6, { dy: 60 }), K(12.8, 14.9, P3(-4.4, -0.8, 0.35), 108, 7, 2.2, { dy: 60 })];
const S6 = [K(14.8, 14.8, P3(-5.4, -0.65, 0.45), 85, 6, 1.4, { dy: 60 }), K(14.8, 16.9, P3(-5.4, -0.65, 0.45), 90, 6, 1.25, { dy: 60 })];
const S7 = [K(16.8, 16.8, P3(-6.0, -0.6, 0.52), 80, 4, 1.0, { dy: 60 }), K(16.8, 18.9, P3(-6.0, -0.6, 0.52), 85, 4, 0.85, { dy: 60 })];
const S8 = [K(18.8, 18.8, P3(-4.8, -0.7, 0.42), 335, 8, 1.1, { dy: 60 }), K(18.8, 24.5, P3(-4.8, -0.7, 0.42), 330, 8, 0.85, { dy: 60 })];
const S9 = [K(24.4, 24.4, P3(4.1, 1.7, 0.3), 150, 12, 2.8, { dy: 60 }), K(24.4, 27.0, P3(4.0, 1.7, 0.3), 140, 12, 2.4, { dy: 60 })];
const S10 = [K(26.9, 26.9, P3(3.1, 1.72, 0.3), 200, 14, 1.1, { dy: 60 }), K(26.9, 29.2, P3(3.1, 1.72, 0.3), 165, 14, 1.0, { dy: 60 })];
const S11 = [K(29.1, 29.1, P3(4.2, 1.0, 0.25), 150, 12, 2.1, { dy: 60 }), K(29.1, 31.9, P3(4.2, 1.0, 0.25), 170, 12, 1.8, { dy: 60 })];
const S12 = [K(31.8, 31.8, P3(2.8, 5.5, 0.3), 270, 8, 1.6, { dy: 60 }), K(31.8, 33.8, P3(2.8, 5.5, 0.3), 280, 8, 1.4, { dy: 60 })];
const S13 = [K(33.7, 33.7, P3(2.5, 5.4, 0.35), 0, 9, 1.4, { dy: 60 }), K(33.7, 36.9, P3(2.5, 5.4, 0.35), -15, 9, 1.3, { dy: 60 })];
const S14 = [K(36.8, 36.8, P3(2.7, 5.5, 0.3), 200, 10, 2.3, { dy: 60 }), K(36.8, 41.6, P3(2.7, 5.5, 0.3), 225, 10, 1.8, { dy: 60 })];
const S15 = [K(41.5, 41.5, P3(-3.2, 4.4, 0.3), 30, 30, 5.0, { dy: 60 }), K(41.5, 46.8, P3(-3.2, 4.4, 0.3), 40, 38, 6.0, { dy: 60 })];
const S16 = [K(46.7, 46.7, P3(-3.5, 3.45, 0.3), 330, 6, 1.5, { dy: 60 }), K(46.7, 50.0, P3(-3.5, 3.45, 0.3), 320, 6, 1.25, { dy: 60 })];
const S17 = [K(49.9, 49.9, P3(-4.45, 4.15, 0.24), 5, 28, 1.1, { dy: 60 }), K(49.9, 52.9, P3(-4.45, 4.15, 0.24), 15, 26, 0.95, { dy: 60 })];
const S18 = [K(52.8, 52.8, P3(-4.2, 4.3, 0.25), 355, 22, 1.6, { dy: 60 }), K(52.8, 56.6, P3(-4.2, 4.3, 0.25), 350, 20, 1.35, { dy: 60 })];
const S19 = [K(56.5, 56.5, P3(-4.15, 4.6, 0.35), 55, 8, 1.1, { dy: 60 }), K(56.5, 58.7, P3(-4.15, 4.6, 0.35), 50, 8, 1.0, { dy: 60 })];
const S20 = [K(58.6, 58.6, P3(-4.35, 4.2, 0.3), 50, 10, 1.1, { dy: 60 }), K(58.6, 62.0, P3(-4.35, 4.2, 0.3), 55, 10, 0.95, { dy: 60 })];
const LBL = [[0, .45], [30, .5], [60, .55]], LSC = [[0, .05], [60, .03]], LVG = [[0, .5], [60, .58]];
const landShot = (id, S, extra = {}) => ({ id, t0: S[0].t0, xin: .25, abs: true, follow: true, smoothCam: true, groups: [land.group], light: land.light, bg: land.bg, bloom: LBL, scrim: LSC, vig: LVG, grain: .1, bb: .58, bc: 2.7, cam: S, water: { light() { } },
  update: (lt, t, cam) => { refl.pl.forEach(l => l.intensity = 0); land.update(t, camera, id); }, ...extra });
const SHOTS = [
  landShot('court', S1, { xin: 0 }), landShot('shepherds', S2, { xin: 0 }), landShot('settle', S3, { xin: 0 }), landShot('goshen', S4, { xin: 0 }), landShot('jacobin', S5, { xin: 0 }), landShot('bless', S6, { xin: 0 }), landShot('asks', S7, { xin: 0 }), landShot('years', S8, { xin: 0 }), landShot('famine', S9, { xin: 0 }), landShot('silver', S10, { xin: 0 }), landShot('stock', S11, { xin: 0 }), landShot('buyland', S12, { xin: 0 }), landShot('seed', S13, { xin: 0 }), landShot('saved', S14, { xin: 0 }), landShot('numerous', S15, { xin: 0 }), landShot('lived', S16, { xin: 0 }), landShot('dying', S17, { xin: 0 }), landShot('bury', S18, { xin: 0 }), landShot('swear', S19, { xin: 0 }), landShot('bow', S20, { xin: 0 }),
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
  { l: ['JOSEPH BROUGHT', 'HIS BROTHERS'], a: 0.8, b: 3.0, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['WE ARE', 'SHEPHERDS'], a: 3.4, b: 5.5, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['THE FAMINE IN', 'CANAAN IS SEVERE'], a: 5.7, b: 7.5, y: 330, size: 88, glow: 1, maxW: 980 },
  { l: ['SETTLE THEM', 'IN GOSHEN'], a: 8.0, b: 10.6, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THE BEST', 'OF THE LAND'], a: 10.8, b: 12.5, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['JACOB BLESSED', 'PHARAOH'], a: 13.2, b: 15.8, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['HOW OLD', 'ARE YOU?'], a: 16.4, b: 18.5, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['A HUNDRED AND', 'THIRTY YEARS'], a: 19.1, b: 21.4, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['FEW AND HARD', 'HAVE BEEN MY YEARS'], a: 21.7, b: 24.2, y: 330, size: 76, glow: 1, maxW: 980 },
  { l: ['THE FAMINE', 'GREW HEAVY'], a: 24.7, b: 26.7, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['FIRST SILVER', 'FOR GRAIN'], a: 27.0, b: 28.9, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['THEN THEIR', 'LIVESTOCK'], a: 29.2, b: 31.1, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['JOSEPH BOUGHT', 'THE LAND'], a: 32.0, b: 34.2, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['HE GAVE THEM', 'SEED'], a: 34.4, b: 36.0, y: 330, size: 120, glow: 1, maxW: 980 },
  { l: ['A FIFTH TO', 'PHARAOH'], a: 36.2, b: 38.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['YOU HAVE SAVED', 'OUR LIVES'], a: 38.3, b: 40.9, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['ISRAEL SETTLED', 'IN GOSHEN'], a: 41.7, b: 44.2, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['A VERY', 'NUMEROUS PEOPLE'], a: 44.4, b: 46.5, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['JACOB LIVED', 'SEVENTEEN YEARS'], a: 47.0, b: 49.6, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['DO NOT BURY ME', 'IN EGYPT'], a: 50.2, b: 52.8, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['CARRY ME TO', 'MY FATHERS'], a: 53.0, b: 55.4, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['JOSEPH', 'SWORE IT'], a: 56.7, b: 58.6, y: 330, size: 124, glow: 1, maxW: 980 },
  { l: ['ISRAEL BOWED', 'AT HIS BED'], a: 58.8, b: 60.2, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['HIS LIFE,', 'A JOURNEY'], a: 62.0, b: 64.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['FEW AND', 'HARD YEARS'], a: 64.1, b: 66.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['YET HE', 'BLESSED A KING'], a: 66.9, b: 69.0, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['TO BE CARRIED', 'TO HIS FATHERS'], a: 69.1, b: 71.0, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['HARD YEARS', 'DO NOT WASTE'], a: 72.7, b: 74.6, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['A LIFE WALKING', 'TO A PROMISE'], a: 74.7, b: 78.6, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['HOLD YOUR', 'TROUBLES LOOSELY'], a: 79.1, b: 81.0, y: 330, size: 84, glow: 1, maxW: 980 },
  { l: ['KEEP', 'WALKING'], a: 81.1, b: 84.0, y: 330, size: 124, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 47', .6, 4.6, 252, { size: 28, track: 7 });
  [['GENESIS 47:2', 1.0, 3.0], ['GENESIS 47:3', 3.6, 5.5], ['GENESIS 47:4', 5.9, 7.5], ['GENESIS 47:6', 8.2, 10.6], ['GENESIS 47:6', 11.0, 12.5], ['GENESIS 47:7', 13.4, 15.8], ['GENESIS 47:8', 16.6, 18.5], ['GENESIS 47:9', 19.3, 21.4], ['GENESIS 47:9', 21.9, 24.2], ['GENESIS 47:13', 24.9, 26.7], ['GENESIS 47:14', 27.2, 28.9], ['GENESIS 47:17', 29.4, 31.1], ['GENESIS 47:20', 32.2, 34.2], ['GENESIS 47:23', 34.6, 36.0], ['GENESIS 47:24', 36.4, 38.0], ['GENESIS 47:25', 38.5, 40.9], ['GENESIS 47:27', 41.9, 44.2], ['GENESIS 47:27', 44.6, 46.5], ['GENESIS 47:28', 47.2, 49.6], ['GENESIS 47:29', 50.4, 52.8], ['GENESIS 47:30', 53.2, 55.4], ['GENESIS 47:31', 56.9, 58.6], ['GENESIS 47:31', 59.0, 60.2]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
  capLine(cx, t, 'GENESIS 47:9', 61.9, 66.2, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 47:7', 66.6, 68.9, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'GENESIS 47:30', 69.0, 71.2, 520, { size: 30, track: 12, color: P.cream });
  capLine(cx, t, 'TODAY', 72.3, 84.8, 520, { size: 30, track: 14, color: P.cream });
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

