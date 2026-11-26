// The Living Word Films, Episode 32 - Genesis 32. 90 seconds: 0:00-1:00 story, 1:00-1:25 reflection, 1:25-1:30 question.
import * as THREE from 'three';
import { clamp, lerp, seg, ease, rng, keyed, rgbOf, mx, css, P, smooth } from './util.js';
import { W, H, CINZEL, SANS2, ITAL, bloom, halo, grain, cineTitle, capLine, flare } from './fx2d.js';
import { makeCountry, stage } from './world32.js';
import { makeReflect, RT } from './reflect32.js';
import { makeEnding, endingReady, drawEnding } from './end32.js';
import { makeCubeField, makeMotes } from './props.js';
import { LK } from './lights.js';
import { drawSubs } from './subs32.js';
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
const { gAt, JP, FORD, FIRE, CAMPC, RIDGE, EAST, WR, PATH, RV } = stage;
const P3 = (x, z, dy = .5) => [x, gAt(x, z) + dy, z];

// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 7.9, b1 15.9, b2 21.2, c1 27.0, c2 35.6, d1 41.2, d2 50.4, e1 57.4
// a1 (0.6-6.84) Jacob sent messengers to Esau; they came back: he is coming with four hundred men (32:3-6)
const S1 = [K(0, 0, P3(-.9, 1.7, .5), -52, 12, 7.0, { dy: 300 }), K(0, 3.7, P3(-1.2, 1.8, .5), -44, 10, 5.0, { dy: 300 })];
const S2 = [K(3.2, 3.2, P3(-1.3, 1.9, .55), -30, 6, 3.4, { dy: 300 }), K(3.2, 5.6, P3(-1.2, 1.9, .6), -18, 6, 3.0, { dy: 300 })];
const S3 = [K(5.2, 5.2, P3(3.0, 1.0, .8), -42, 6, 9.0, { dy: 300 }), K(5.2, 8.2, P3(5.5, 1.5, .9), -38, 7, 8.0, { dy: 300 })];
// a2 (7.9-14.7) Jacob was terrified and prayed (32:7-12)
const S4 = [K(7.7, 7.7, P3(-2.0, 2.0, .5), 96, 8, 2.6, { dy: 300 }), K(7.7, 11.0, P3(-2.0, 2.0, .55), 110, 7, 1.9, { dy: 300 }), K(7.7, 15.2, P3(-2.0, 2.0, .6), 100, 10, 2.3, { dy: 300 })];
// b1 (15.9-19.88) the gift of animals, herd by herd (32:13-21)
const S5 = [K(14.6, 14.6, P3(-1.0, 1.3, .4), 14, 7, 5.5, { dy: 300 }), K(14.6, 18.0, P3(.6, 1.3, .4), 8, 7, 5.2, { dy: 300 }), K(14.6, 21.4, P3(2.6, 1.3, .4), 4, 8, 6.0, { dy: 300 })];
// b2 (21.2-25.66) that night he sent his family across the Jabbok and stayed behind, alone (32:22-24)
const S6 = [K(20.9, 20.9, P3(-.8, 1.2, .5), 6, 8, 5.2, { dy: 300 }), K(20.9, 25.5, P3(1.2, 1.2, .5), 4, 8, 5.0, { dy: 300 })];
const S7 = [K(25.2, 25.2, P3(-2.0, 2.0, .6), -45, 8, 3.4, { dy: 300 }), K(25.2, 28.0, P3(-2.0, 2.0, .6), -38, 8, 2.8, { dy: 300 })];
// c1 (27.0-34.0) a man wrestled with him until daybreak and struck his hip (32:24-25)
const S8 = [K(26.8, 26.8, P3(-2.1, 2.1, .55), 32, 6, 2.1, { dy: 300 }), K(26.8, 31.8, P3(-2.1, 2.1, .55), 12, 5, 1.65, { dy: 300 })];
const S9 = [K(31.3, 31.3, P3(-2.1, 2.1, .45), -28, 4, 1.5, { dy: 300 }), K(31.3, 36.0, P3(-2.1, 2.1, .5), -12, 5, 1.6, { dy: 300 })];
// c2 (35.6-39.7) "Let me go." "Not unless you bless me." (32:26)
const S10 = [K(35.5, 35.5, P3(-2.1, 2.1, .6), 40, 4, 1.6, { dy: 300 }), K(35.5, 41.6, P3(-2.1, 2.05, .6), 18, 6, 1.8, { dy: 300 })];
// d1 (41.2-49.06) the new name, Israel (32:27-29)
const S11 = [K(41.2, 41.2, P3(-1.7, 1.9, .6), -34, 4, 2.6, { dy: 300 }), K(41.2, 45.0, P3(-1.7, 1.9, .7), -24, 5, 2.4, { dy: 300 }), K(41.2, 50.8, P3(-1.7, 1.9, .75), -10, 6, 3.0, { dy: 300 })];
// d2 (50.4-56.27) Peniel: "I have seen God face to face" (32:30)
const S12 = [K(50.2, 50.2, P3(-2.0, 2.0, .65), -48, 3, 3.2, { dy: 300 }), K(50.2, 54.0, P3(-2.0, 2.0, .7), -38, 4, 2.6, { dy: 300 }), K(50.2, 57.8, P3(-2.0, 2.0, .7), -26, 5, 3.0, { dy: 300 })];
// e1 (57.4-60.21) the sun rose and Jacob walked on, limping (32:31)
const S13 = [K(57.2, 57.2, P3(-1.6, 1.9, .6), -30, 6, 3.4, { dy: 300 }), K(57.2, 59.6, P3(.2, 1.5, .5), -22, 7, 4.6, { dy: 300 }), K(57.2, 61.8, P3(2.0, 1.3, .5), -10, 8, 6.0, { dy: 300 })];
const LBL = [[0, .4], [8, .42], [16, .5], [22, .55], [30, .55], [42, .5], [48, .55], [54, .46], [60, .46]], LSC = [[0, .06], [16, .04], [24, .05], [48, .03], [60, .03]], LVG = [[0, .5], [60, .55]];
const landShot = (id, S, extra = {}) => ({ id, t0: S[0].t0, xin: .25, abs: true, follow: true, smoothCam: true, groups: [land.group], light: land.light, bg: land.bg, bloom: LBL, scrim: LSC, vig: LVG, grain: .1, bb: .58, bc: 2.7, cam: S, water: { light() { } },
  update: (lt, t, cam) => { refl.pl.forEach(l => l.intensity = 0); land.update(t, camera, id); }, ...extra });
const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('news', S2, { xin: .5 }), landShot('host', S3, { xin: .5 }), landShot('pray', S4, { xin: .5 }), landShot('droves', S5, { xin: .5 }), landShot('cross', S6, { xin: .5 }), landShot('alone', S7, { xin: .5 }),
  landShot('wrestle', S8, { xin: .5 }), landShot('hip', S9, { xin: .5 }), landShot('hold', S10, { xin: .5 }), landShot('bless', S11, { xin: .5 }), landShot('peniel', S12, { xin: .5 }), landShot('limp', S13, { xin: .5 }),
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
  { l: ['ESAU IS COMING', 'WITH 400 MEN'], a: 1.0, b: 6.4, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['JACOB PRAYED', 'IN FEAR'], a: 8.2, b: 14.4, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['A GIFT OF', 'ANIMALS AHEAD'], a: 16.2, b: 19.9, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['ALONE AT', 'THE JABBOK'], a: 21.6, b: 26.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['A MAN WRESTLED', 'WITH HIM'], a: 27.6, b: 32.8, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['NOT UNLESS YOU', 'BLESS ME'], a: 35.8, b: 39.8, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['A NEW NAME:', 'ISRAEL'], a: 41.4, b: 46.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['I SAW GOD', 'FACE TO FACE'], a: 50.6, b: 56.0, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['HE WALKED ON,', 'LIMPING'], a: 57.4, b: 60.0, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['HE PRAYED', 'HONESTLY'], a: 61.8, b: 65.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['HE HELD ON', 'UNTIL BLESSED'], a: 66.2, b: 69.8, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['STRUGGLE IS NOT', 'THE END OF FAITH'], a: 71.0, b: 77.5, y: 330, size: 92, glow: 1, maxW: 980 },
  { l: ['HOLD ON TO GOD,', 'DO NOT LET GO'], a: 78.2, b: 84.8, y: 330, size: 96, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 32', .6, 5.0, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 32:3–6', 1.4, 6.4, 540, { size: 34, track: 11 });
  [['GENESIS 32:7–12', 8.3, 14.4], ['GENESIS 32:13–21', 16.3, 19.9], ['GENESIS 32:22–24', 21.7, 26.0], ['GENESIS 32:24–25', 27.7, 32.8], ['GENESIS 32:26', 35.9, 39.8], ['GENESIS 32:27–28', 41.5, 46.0], ['GENESIS 32:30', 50.7, 56.0], ['GENESIS 32:31', 57.5, 60.0]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
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

