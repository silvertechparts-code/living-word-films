// The Living Word Films, Episode 23 - Genesis 23. 90 seconds: 0:00-1:00 story, 1:00-1:25 reflection, 1:25-1:30 question.
import * as THREE from 'three';
import { clamp, lerp, seg, ease, rng, keyed, rgbOf, mx, css, P, smooth } from './util.js';
import { W, H, CINZEL, SANS2, ITAL, bloom, halo, grain, cineTitle, capLine, flare } from './fx2d.js';
import { makeHebron, stage } from './world23.js';
import { makeReflect, RT } from './reflect23.js';
import { makeEnding, endingReady, drawEnding } from './end23.js';
import { makeCubeField, makeMotes } from './props.js';
import { LK } from './lights.js';
import { drawSubs } from './subs23.js';
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
const land = makeHebron(), refl = makeReflect(), ending = makeEnding();
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
const { gAt, GX, GZ, GF, TS, BIER, ABK, TBL, FLD, CAVE, CF } = stage;
// windows follow the narration beats (PLACE in the mix and subtitle scripts): a1 0.6, a2 8.25, b1 12.09, b2 19.7, c1 25.87, c2 31.93, c3 36.36, d1 40.38, d2 46.7, e1 51.89, e2 56.45
// a1 (0.6-7.45) Sarah died at Kiriath-arba, which is Hebron, in the land of Canaan; she was 127 (23:1-2). Dusk over the town; the camp and the lamp by the covered figure are a picture (the chapter does not say where she lay).
const S1 = [K(0, 0, [-.6, 1.0, 3.4], -40, 20, 15, { dy: 220 }), K(0, 4.6, [-1.8, .8, 4.4], -50, 14, 9, { dy: 270 })];
const S2 = [K(4.0, 4.0, [BIER[0] + .1, .5, BIER[1]], -72, 9, 5.4, { dy: 300 }), K(4.0, 8.4, [BIER[0] + .35, .46, BIER[1]], -66, 8, 3.0), K(4.0, 10.9, [BIER[0] + .5, .44, BIER[1]], -58, 7, 2.5)];
// a2 (8.25-10.9) Abraham came to mourn for her and to weep (23:2): he kneels at her side
// b1 (12.09-18.9) he rises and stands before the Hittites at the city gate: I am a stranger and a guest among you; give me a burial place (23:3-4)
const S3 = [K(10.6, 10.6, [GX - .6, .7, 3.0], 16, 6, 6.2), K(10.6, 14.4, [GX - .1, .75, 2.9], 10, 6, 4.2)];
const S4 = [K(14.0, 14.0, [.55, .62, 2.55], 24, 9, 3.6), K(14.0, 19.9, [.2, .62, 2.35], 12, 8, 3.0)];
// b2 (19.7-24.77) the Hittites answer: you are a prince of God among us; bury your dead in the choicest of our tombs (23:5-6)
const S5 = [K(19.5, 19.5, [.2, .7, 2.5], -34, 8, 2.7), K(19.5, 25.7, [.5, .68, 2.75], -20, 7, 2.2)];
// c1 (25.87-31.13) Abraham bows to the people of the land and asks for the cave of Machpelah at the end of Ephron's field (23:7-9)
const S6 = [K(25.6, 25.6, [GF[0], .6, GF[1] - .1], 82, 12, 2.7), K(25.6, 28.8, [GF[0], .62, GF[1] - .1], 70, 12, 2.2)];
const S7 = [K(28.4, 28.4, [2.4, .7, 3.0], -48, 10, 4.5), K(28.4, 32.2, [6.4, 1.0, 2.2], -52, 10, 8.5)];
// c2 (31.93-35.66) Ephron, sitting among the Hittites, answers in the hearing of all who went in at the gate: I give you the field, and the cave in it (23:10-11)
const S8 = [K(31.7, 31.7, [2.6, .75, 2.4], -24, 8, 2.3), K(31.7, 36.4, [2.7, .75, 2.3], -14, 8, 1.9)];
// c3 (36.36-39.48) Abraham bows again and insists on paying the full price (23:12-13)
const S9 = [K(36.2, 36.2, [1.9, .65, 2.7], -62, 6, 3.2), K(36.2, 40.6, [1.8, .65, 2.7], -48, 6, 2.6)];
// d1 (40.38-45.9) Ephron: a piece of land worth four hundred shekels of silver, what is that between you and me? Bury your dead (23:14-15)
const S10 = [K(40.2, 40.2, [2.8, .72, 2.2], 0, 7, 2.0), K(40.2, 46.6, [2.7, .72, 2.2], -12, 7, 1.7)];
// d2 (46.7-50.89) Abraham weighs out the silver in the hearing of the Hittites (23:16)
const S11 = [K(46.4, 46.4, [GX, .62, 2.75], -80, 11, 2.6), K(46.4, 51.4, [GX, .6, 2.7], -68, 15, 1.8)];
// e1 (51.89-55.55) the field, the cave in it and all the trees within its whole area are made over to Abraham in the sight of the Hittites (23:17-18)
const S12 = [K(51.3, 51.3, [5.2, .8, 2.6], -50, 14, 9.5), K(51.3, 55.9, [7.0, .9, 2.2], -44, 13, 8.0)];
// e2 (56.45-59.22) Abraham buries Sarah in the cave of the field of Machpelah, east of Mamre (23:19-20); the film shows only the cave mouth, the stone and Abraham facing west
const S13 = [K(55.5, 55.5, [9.0, .8, 1.6], -24, 13, 3.8), K(55.5, 59.8, [8.6, 1.0, 1.6], -10, 14, 2.9), K(55.5, 61.6, [8.4, 1.5, 1.6], 0, 16, 5.0)];
const LBL = [[0, .4], [8, .42], [12, .3], [30, .3], [50, .34], [60, .4]], LSC = [[0, .1], [8, .1], [14, .06], [50, .06], [60, .08]], LVG = [[0, .5], [60, .5]];
const landShot = (id, S, extra = {}) => ({ id, t0: S[0].t0, xin: .25, abs: true, follow: true, smoothCam: true, groups: [land.group], light: land.light, bg: land.bg, bloom: LBL, scrim: LSC, vig: LVG, grain: .1, bb: .58, bc: 2.7, cam: S, water: { light() { } },
  update: (lt, t, cam) => { refl.pl.forEach(l => l.intensity = 0); land.update(t, camera); }, ...extra });
const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('mourn', S2, { xin: .5 }), landShot('gate', S3, { xin: .5 }), landShot('stand', S4, { xin: .4 }), landShot('answer', S5, { xin: .4 }), landShot('bow', S6, { xin: .4 }), landShot('field', S7, { xin: .4 }), landShot('ephron', S8, { xin: .4 }),
  landShot('insist', S9, { xin: .4 }), landShot('price', S10, { xin: .4 }), landShot('silver', S11, { xin: .4 }), landShot('made', S12, { xin: .5 }), landShot('buried', S13, { xin: .5 }),
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
  { l: ['SARAH', 'HAS DIED'], a: 1.0, b: 5.8, y: 390, size: 112, glow: 1, maxW: 980 },
  { l: ['ABRAHAM', 'WEPT'], a: 8.7, b: 11.0, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['A STRANGER', 'AMONG YOU'], a: 13.4, b: 18.7, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['A PRINCE', 'AMONG US'], a: 20.0, b: 24.9, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['THE CAVE OF', 'MACHPELAH'], a: 26.3, b: 31.2, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['TAKE IT,', 'I GIVE IT'], a: 32.2, b: 35.7, y: 330, size: 112, glow: 1, maxW: 980 },
  { l: ['PAY THE', 'FULL PRICE'], a: 36.7, b: 39.5, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['FOUR HUNDRED', 'SHEKELS'], a: 40.7, b: 45.9, y: 330, size: 96, glow: 1, maxW: 980 },
  { l: ['THE SILVER', 'WEIGHED OUT'], a: 47.0, b: 50.8, y: 330, size: 100, glow: 1, maxW: 980 },
  { l: ['THE FIELD', 'BECAME HIS'], a: 52.1, b: 55.5, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['FACING', 'MAMRE'], a: 56.7, b: 59.4, y: 330, size: 116, glow: 1, maxW: 980 },
  { l: ['A STRANGER,', 'MOURNING'], a: 61.7, b: 66.0, y: 330, size: 104, glow: 1, maxW: 980 },
  { l: ['HE WEPT,', 'THEN ROSE'], a: 68.0, b: 70.8, y: 330, size: 108, glow: 1, maxW: 980 },
  { l: ['GRIEF AND FAITH', 'STAND TOGETHER'], a: 72.9, b: 77.6, y: 330, size: 84, glow: 1, maxW: 980 },
  { l: ['HONOR SOMEONE', 'YOU MISS'], a: 78.8, b: 84.7, y: 330, size: 88, glow: 1, maxW: 980 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule, maxW: T.maxW });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 23', .6, 5.0, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 23:1–2', 2.6, 5.5, 596, { size: 36, track: 12 });
  [['GENESIS 23:2', 8.8, 11.0], ['GENESIS 23:3–4', 13.5, 18.7], ['GENESIS 23:5–6', 20.1, 24.9], ['GENESIS 23:7–9', 26.4, 31.2], ['GENESIS 23:10–11', 32.3, 35.7], ['GENESIS 23:12–13', 36.8, 39.5],
   ['GENESIS 23:14–15', 40.8, 45.9], ['GENESIS 23:16', 47.1, 50.8], ['GENESIS 23:17–18', 52.2, 55.5], ['GENESIS 23:19–20', 56.8, 59.4]].forEach(([tx, a, b]) => capLine(cx, t, tx, a, b, 540, { size: 32, track: 10 }));
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
