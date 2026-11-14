// The Living Word Films, Episode 10 - Genesis 10. 90 seconds: 0:00-1:00 story, 1:00-1:25 reflection, 1:25-1:30 question.
import * as THREE from 'three';
import { clamp, lerp, seg, ease, rng, keyed, rgbOf, mx, css, P, smooth } from './util.js';
import { W, H, CINZEL, SANS2, ITAL, bloom, halo, grain, cineTitle, capLine, flare } from './fx2d.js';
import { makeNations, POS } from './world10.js';
import { AY0 } from './world8.js';
import { makeReflect, RT } from './reflect10.js';
import { makeEnding, endingReady, drawEnding } from './end10.js';
import { makeCubeField, makeMotes } from './props.js';
import { LK } from './lights.js';
import { ARK8 } from './terrain8.js';
import { drawSubs } from './subs10.js';
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
const land = makeNations(), refl = makeReflect(), ending = makeEnding();
scene.add(land.group);
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
const Y = AY0, AZ = ARK8.z;
const L = (k, x, y, z) => [POS[k][0] + x, POS[k][1] + y, POS[k][2] + z];
// ---------- the story shots (0:00-1:00), windows follow the narration beats (PLACE in world10.js)
const S1 = [K(0, 0, [0, Y + 8, -3], 0, 34, 40, { dy: 150 }), K(0, 2.4, [0, Y + 3.2, -3.5], 14, 18, 20, { dy: 240 }), K(0, 5.0, [-.3, Y + .8, -2.6], -8, 9, 8.5)];
const S2 = [K(5.26, 5.26, [-2.8, Y + .9, -2.8], 62, 10, 7.5), K(5.26, 7.2, [-12, Y + 1.0, -.5], 74, 14, 20), K(5.26, 9.0, L('J', -.5, .6, 2), 68, 16, 18), K(5.26, 10.9, L('J', -1, .4, 3), 56, 14, 16)];
const S3 = [K(10.95, 10.95, [2, Y - .4, 8], -12, 14, 16), K(10.95, 13.2, L('H', 0, .3, 0), -18, 18, 20), K(10.95, 15.9, L('H', 3.5, .8, 1.5), -30, 12, 13)];
const S4 = [K(15.96, 15.96, L('B', -3, 1.8, -1), 40, 10, 14), K(15.96, 17.4, L('B', -5.0, 2.0, -2.8), 30, 8, 8), K(15.96, 21.0, L('B', -5.4, 2.4, -3.0), -14, 3, 4.2)];
const S5 = [K(21.14, 21.14, L('B', -5.4, 2.2, -3), -28, 5, 5), K(21.14, 24.0, L('B', -2.5, 1.2, -1), 20, 12, 13), K(21.14, 26.9, L('B', 1.5, .8, .5), 50, 22, 20)];
const S6 = [K(27.0, 27.0, L('A', 9, 1.5, 6), 60, 18, 24), K(27.0, 29.2, L('A', -1.5, .9, .5), 30, 22, 17), K(27.0, 31.7, L('A', -1.5, .8, .5), -10, 28, 13)];
const S7 = [K(31.76, 31.76, [-1.1, Y + .8, -2.0], -34, 8, 4.8), K(31.76, 34.0, [-.8, Y + .9, -2.0], -14, 8, 4.2), K(31.76, 36.0, [-.6, Y + 1.0, -2.1], 8, 9, 5.2)];
const S8 = [K(36.12, 36.12, L('S', -9, 1.8, 3), -60, 14, 12), K(36.12, 38.4, L('S', -1, 1.5, 0), -20, 16, 16), K(36.12, 40.2, L('S', 5, 1.5, -.5), 20, 16, 16)];
const S9 = [K(40.29, 40.29, L('S', 3, 1.0, 1), 0, 38, 22), K(40.29, 43.5, L('S', 3.5, 1.2, 1.0), 10, 34, 17), K(40.29, 45.1, L('S', 2, 1.2, 0), 20, 30, 17)];
const S10 = [K(45.16, 45.16, L('S', 2, 1.2, 0), 20, 30, 17), K(45.16, 47.7, [7, -2, -30], 34, 30, 90), K(45.16, 50.8, [4, -1, -12], 18, 40, 112), K(45.16, 53.2, [0, -1, -4], 6, 44, 120), K(45.16, 56.5, [0, Y, -4.5], 8, 24, 34), K(45.16, 59.9, [0, Y + 1.4, -4.0], 12, 13, 14, { stop: true })];
const LBL = [[0, .45], [10, .5], [30, .55], [60, .5]], LSC = [[0, .24], [12, .18], [40, .16], [60, .14]], LVG = [[0, .55], [30, .5], [60, .5]];
const landShot = (id, S, extra = {}) => ({ id, t0: S[0].t0, xin: .25, abs: true, follow: true, smoothCam: true, groups: [land.group], light: land.light, bg: land.bg, bloom: LBL, scrim: LSC, vig: LVG, grain: .1, bb: .56, bc: 3.4, cam: S, water: { light() { } },
  update: (lt, t, cam) => { land.update(t, camera); }, ...extra });
const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('japheth', S2), landShot('ham', S3), landShot('nimrod', S4), landShot('babel', S5), landShot('assyria', S6), landShot('shem', S7), landShot('camps', S8), landShot('eber', S9), landShot('crane', S10, { xin: .3 }),
  { id: 'reflect', t0: RT.t0, xin: 1.6, abs: true, follow: true, smoothCam: true, groups: [refl.group], light: refl.light, bg: refl.bg, bloom: [[0, .55]], bb: .56, bc: 3.4, scrim: [[0, .14]], vig: [[0, .5]], grain: .1, cam: refl.cam, water: { light() { } }, fog: refl.fog,
    update: (lt, t, cam) => refl.update(lt, t, cam, camera),
    back: (cx, lt, t, cam) => { const [, hy] = proj(V3(0, 0, -150)); const g = cx.createLinearGradient(0, hy - 380, 0, hy + 30); g.addColorStop(0, 'rgba(212,154,138,0)'); g.addColorStop(1, 'rgba(212,154,138,.95)'); cx.fillStyle = g; cx.fillRect(0, hy - 380, W, 410); cx.fillStyle = 'rgba(212,154,138,.95)'; cx.fillRect(0, hy + 29, W, H); },
    halos: (cx, lt, t, cam) => { const el = refl.sunElev(t), [sx, sy] = proj(V3(-3, 150 * Math.tan(el * D2R), -150)), a = .14 + .12 * smooth(60, 80, t); halo(cx, sx, sy, 900, '255,150,100', a); halo(cx, sx, sy, 200, '255,150,100', .2); } },
  { id: 'end', t0: 85.0, xin: 1.0, groups: [endG], update: (lt, t) => { endCubes.update(t); endMotes.update(t, 1, [0, -4, 0]); }, light: [[0, LK('#5a6ca8', '#1a1a2a', .55, '#ffcf90', 1.4, [-8, 8, 9], .5, '#7a8cff', [10, 6, -8], [0, 0, 0], 16)]], bg: [[0, ['#050a1e', '#10204a']]], bloom: [[0, .7]], scrim: [[0, .1]], vig: [[0, .5]], grain: .09,
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
  { l: ['ONE HUMAN', 'FAMILY'], a: 1.0, b: 4.8, y: 390, size: 96, glow: 1 },
  { l: ['THE PEOPLES OF', 'THE COASTLANDS'], a: 5.6, b: 10.4, y: 330, size: 84, glow: 1 },
  { l: ['THE FAMILY', 'OF HAM'], a: 11.2, b: 15.4, y: 330, size: 108, glow: 1 },
  { l: ['NIMROD,', 'THE FIRST WARRIOR'], a: 16.3, b: 20.8, y: 330, size: 88, glow: 1 },
  { l: ['A MIGHTY HUNTER', 'BEFORE THE LORD'], a: 21.5, b: 26.5, y: 330, size: 84, glow: 1 },
  { l: ['NINEVEH AND', 'GREAT CITIES'], a: 27.3, b: 31.2, y: 330, size: 98, glow: 1 },
  { l: ['THE FAMILY', 'OF SHEM'], a: 32.0, b: 35.8, y: 330, size: 108, glow: 1 },
  { l: ['THE SONS', 'OF SHEM'], a: 36.4, b: 40.0, y: 330, size: 112, glow: 1 },
  { l: ['EBER, PELEG', 'AND JOKTAN'], a: 40.6, b: 44.8, y: 330, size: 100, glow: 1 },
  { l: ['THE EARTH', 'WAS DIVIDED'], a: 45.5, b: 47.9, y: 330, size: 104, glow: 1 },
  { l: ['NATION AFTER', 'NATION'], a: 48.5, b: 52.9, y: 330, size: 104, glow: 1 },
  { l: ['THE NATIONS', 'SPREAD'], a: 53.5, b: 58.6, y: 330, size: 112, glow: 1 },
  { l: ['A LONG LIST', 'OF NAMES'], a: 61.1, b: 65.4, y: 330, size: 104, glow: 1 },
  { l: ['EVERY NATION,', 'ONE FAMILY'], a: 66.4, b: 70.5, y: 330, size: 98, glow: 1 },
  { l: ['NO ONE IS', 'A STRANGER'], a: 71.6, b: 77.7, y: 330, size: 108, glow: 1 },
  { l: ['TREAT ONE PERSON', 'LIKE FAMILY'], a: 79.6, b: 84.7, y: 330, size: 92, glow: 1 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 10', .6, 4.8, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 10:1', 2.6, 4.8, 560, { size: 36, track: 12 });
  capLine(cx, t, 'GENESIS 10:2–5', 5.9, 10.4, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 10:6–7', 11.5, 15.4, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 10:8', 16.6, 20.8, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 10:9–10', 21.8, 26.5, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 10:11–12', 27.6, 31.2, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 10:21', 32.3, 35.8, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 10:22', 36.7, 40.0, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 10:24–25', 40.9, 44.8, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 10:25', 45.8, 47.9, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 10:5, 20, 31', 48.8, 52.9, 540, { size: 30, track: 9 });
  capLine(cx, t, 'GENESIS 10:32', 53.8, 58.6, 540, { size: 32, track: 10 });
  capLine(cx, t, 'TODAY', 61.7, 65.4, 520, { size: 30, track: 14, color: P.cream });
}
function seek(t) { t = clamp(t, 0, DURATION - 1e-4); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.letterSpacing = '0px'; ctx.globalCompositeOperation = 'source-over'; frame(t); }
window.seek = seek; window.renderAt = seek;
// sound events for the SFX synth (kinds are defined in compose8_sfx.py)
const EV = [];
window.EVENTS = EV; window.__scene = { scene, camera, renderer, land, refl, SHOTS, hemi, sunL };
Promise.all([document.fonts ? Promise.all(['700 40px Cinzel', '800 40px Cinzel', '600 40px Cinzel', '600 30px Inter', '800 52px "Anek Malayalam"', '500 30px Inter', 'italic 500 30px "Cormorant Garamond"', 'italic 600 30px "Cormorant Garamond"'].map(f => document.fonts.load(f))) : null, endingReady]).then(() => {
  window.__ready = true;
  if (q.has('t')) seek(parseFloat(q.get('t'))); else if (!q.has('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); })(); } else seek(0);
});
