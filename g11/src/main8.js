// The Living Word Films, Episode 8 - Genesis 8. 90 seconds: 0:00-1:00 story, 1:00-1:25 reflection, 1:25-1:30 question.
import * as THREE from 'three';
import { clamp, lerp, seg, ease, rng, keyed, rgbOf, mx, css, P, smooth } from './util.js';
import { W, H, CINZEL, SANS2, ITAL, bloom, halo, grain, cineTitle, capLine, flare } from './fx2d.js';
import { makeLand, AY0, NOAH_LOCAL } from './world8.js';
import { makeReflect, RT } from './reflect8.js';
import { makeEnding, endingReady, drawEnding } from './end8.js';
import { makeCubeField, makeMotes } from './props.js';
import { LK } from './lights.js';
import { ARK8 } from './terrain8.js';
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
const land = makeLand(), refl = makeReflect(), ending = makeEnding();
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
const AR = (t, dx, dy, dz) => { const s = land.arkState(t); return [s.x + dx, s.y + dy, s.z + dz]; };
const K = (t0, t, T, az, el, w, o = {}) => ({ t: t - t0, t0, T, az, el, w, fov: FOV, dy: DY, ...o });
const RYS = AY0 + .9, HZ = ARK8.z;                                   // rest height of the ark's deck line and its z
const HT = [0.15, AY0 + 2.3, HZ + .05];                              // the hatch
const CV = land.curves, atC = (c, u, dx = 0, dy = 0, dz = 0) => { const p = c.getPointAt(clamp(u)); return [p.x + dx, p.y + dy, p.z + dz]; };

// ---------- the story shots (0:00-1:00)
const S1 = [K(0, 0, AR(0, 0, .9, 0), 22, 9, 34, { dy: 150 }), K(0, 2.8, AR(2.8, 0, 1.1, 0), 10, 11, 17, { dy: 260 }), K(0, 5.8, AR(5.8, .3, 1.2, 0), -12, 9, 10.5)];
const S2 = [K(5.6, 5.6, AR(5.6, .3, 1.2, 0), -12, 9, 10.5), K(5.6, 8.5, AR(8.5, .2, 1.0, 0), -40, 14, 12.5), K(5.6, 11.8, AR(11.8, 0, 1.0, 0), -66, 12, 14)];
const S3 = [K(11.4, 11.4, [0, RYS, HZ], -52, 6, 13), K(11.4, 14.2, [0, RYS - .1, HZ], -10, 7, 11.5), K(11.4, 17.8, [0, RYS + 2.2, HZ - 1.5], 4, 9, 36, { fov: 28 })];
const S4 = [K(17.4, 17.4, HT, 34, 14, 3.2, { dy: 220 }), K(17.4, 19.8, [0, HT[1] + .12, HT[2] - .1], 16, 9, 1.9, { dy: 260 }), K(17.4, 21.6, atC(CV.RAVEN, .14), 30, 11, 7.0), K(17.4, 22.6, atC(CV.RAVEN, .26), 44, 12, 12)];
const S5 = [K(22.2, 22.2, [.2, HT[1] + .1, HT[2] - .2], 10, 8, 2.4), K(22.2, 23.6, atC(CV.DOVE1, .24, 0, -.1), -22, 12, 4.2), K(22.2, 25.0, atC(CV.DOVE1, .6, -.6, -.3), -52, 15, 6.4), K(22.2, 26.4, atC(CV.DOVE1, .96, 0, 0), -20, 12, 4.0), K(22.2, 27.6, [.2, HT[1] + .1, HT[2] - .2], 12, 7, 2.5)];
const S6 = [K(27.0, 27.0, [.2, HT[1] + .1, HT[2] - .2], 12, 7, 2.6), K(27.0, 28.6, atC(CV.DOVE2, .16, 0, -.1), 32, 13, 4.6), K(27.0, 30.4, atC(CV.DOVE2, .52, 1.0, .2), 78, 9, 4.4), K(27.0, 32.0, atC(CV.DOVE2, .86, 0, 0), 24, 8, 3.6), K(27.0, 33.8, [.15, HT[1] + .12, HT[2] - .1], 6, 5, 1.7, { dy: 220 })];
const S7 = [K(33.4, 33.4, [.15, HT[1] + .12, HT[2] - .1], 6, 5, 1.7, { dy: 220 }), K(33.4, 35.0, [0, HT[1] - .2, HT[2] + .5], -4, 12, 6.2), K(33.4, 36.6, [0, AY0 + 1.4, -3.2], 4, 22, 22)];
const S8 = [K(36.2, 36.2, [.2, HT[1] + .1, HT[2] - .2], 14, 8, 2.4), K(36.2, 37.6, atC(CV.DOVE3, .2), 20, 10, 4.4), K(36.2, 39.2, atC(CV.DOVE3, .45), 36, 9, 7.5), K(36.2, 41.4, atC(CV.DOVE3, .7), 26, 6, 15)];
const S9 = [K(41.0, 41.0, [1.0, AY0 + .6, HZ + 1.3], 6, 5, 5.0), K(41.0, 44.0, [1.0, AY0 + .45, HZ + 2.2], 16, 7, 5.6), K(41.0, 47.6, [-.6, AY0 + .55, HZ + 3.4], 28, 9, 10.5)];
const S10 = [K(47.4, 47.4, [-3.9, AY0 + .4, land.ALT.z + .0], -34, 8, 4.8), K(47.4, 49.8, [-4.0, AY0 + .55, land.ALT.z], -14, 10, 4.2), K(47.4, 51.8, [-3.8, AY0 + 1.0, land.ALT.z], 6, 14, 4.8)];
const S11 = [K(51.4, 51.4, [-3.8, AY0 + 1.2, land.ALT.z], 10, 16, 6.0), K(51.4, 54.6, [-1.5, AY0 + 2.6, -3.6], 20, 24, 15), K(51.4, 58.6, [0, AY0 + 3.4, -3.5], 24, 30, 27, { fov: 30 })];
const ST = S => ({ t0: S[0].t0 });
const LBL = [[0, .45], [10, .5], [30, .55], [60, .5]], LSC = [[0, .26], [12, .2], [40, .16], [60, .14]], LVG = [[0, .55], [30, .5], [60, .5]];
const waterLook = t => {
  const U = land.water.U, bgc = bgAt(land.bg, t).b, w = smooth(5, 14, t);
  U.uHaze.value.set(css(bgc)); U.uSky.value.set(css(mx(hx('#3a4a78'), hx('#9ab4d8'), w))); U.uDeep.value.set(css(mx(hx('#14305a'), hx('#1c4a7c'), w))); U.uShallow.value.set(css(mx(hx('#3a7088'), hx('#5ea6a2'), w)));
  U.uSpec.value = lerp(.3, .6, w); U.uFoam.value = lerp(.7, .14, w);
  { const hz = new THREE.Color(css(bgc)), M = land.far.userData.mat, f = smooth(14, 18, t) * .62; M.color.setRGB(hz.r * f / .026 + (1 - f), hz.g * f / .036 + (1 - f), hz.b * f / .085 + (1 - f)); }
};
const landShot = (id, S, extra = {}) => ({ id, t0: S[0].t0, xin: .25, abs: true, follow: true, smoothCam: true, groups: [land.group], light: land.light, bg: land.bg, bloom: LBL, scrim: LSC, vig: LVG, grain: .1, bb: .56, bc: 3.4, cam: S, water: land.water,
  update: (lt, t, cam) => { waterLook(t); land.update(t, camera); }, ...extra });
const SHOTS = [
  landShot('hook', S1, { xin: 0 }), landShot('wind', S2), landShot('rest', S3), landShot('raven', S4), landShot('dove1', S5), landShot('dove2', S6), landShot('knew', S7), landShot('dove3', S8), landShot('out', S9), landShot('altar', S10), landShot('promise', S11),
  { id: 'reflect', t0: RT.t0, xin: 1.6, abs: true, follow: true, smoothCam: true, groups: [refl.group], light: refl.light, bg: refl.bg, bloom: [[0, .5]], bb: .56, bc: 3.4, scrim: [[0, .16]], vig: [[0, .5]], grain: .1, cam: refl.cam, water: refl.water, fog: refl.fog,
    update: (lt, t, cam) => refl.update(lt, t, cam),
    back: (cx, lt, t, cam) => { const [, hy] = proj(V3(0, 0, -150)); const g = cx.createLinearGradient(0, hy - 380, 0, hy + 30); g.addColorStop(0, 'rgba(212,154,138,0)'); g.addColorStop(1, 'rgba(212,154,138,.95)'); cx.fillStyle = g; cx.fillRect(0, hy - 380, W, 410); cx.fillStyle = 'rgba(212,154,138,.95)'; cx.fillRect(0, hy + 29, W, H); },
    halos: (cx, lt, t, cam) => { const el = refl.sunElev(t), [sx, sy] = proj(V3(-3, 150 * Math.tan(el * D2R), -150)), a = .3 + .2 * smooth(60, 80, t); halo(cx, sx, sy, 900, '255,206,150', a); halo(cx, sx, sy, 200, '255,236,190', .5); } },
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
const MIST = [[0, 0], [58.6, 0], [60.4, .5], [61.6, 0], [90, 0]];
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
  drawTitles(ctx, t);
  const fo = ease.inOutSine(seg(t, 88.9, 89.97)); if (fo > 0) { ctx.fillStyle = `rgba(0,0,0,${fo})`; ctx.fillRect(0, 0, W, H); }
  const fi0 = 1 - seg(t, 0, .6); if (fi0 > 0) { ctx.fillStyle = `rgba(0,0,0,${fi0})`; ctx.fillRect(0, 0, W, H); }
}
// ---------- titles (one block per beat), all inside the 1080 x 1920 mobile-safe area
const TITLES = [
  { l: ['GOD REMEMBERED', 'NOAH'], a: 1.0, b: 5.3, y: 400, size: 92, glow: 1 },
  { l: ['THE WATERS', 'BEGIN TO SINK'], a: 5.9, b: 11.0, y: 330, size: 96, glow: 1 },
  { l: ['THE ARK', 'COMES TO REST'], a: 11.9, b: 17.2, y: 330, size: 96, glow: 1 },
  { l: ['THE RAVEN'], a: 17.9, b: 22.0, y: 395, size: 112, glow: 1 },
  { l: ['THE DOVE'], a: 22.6, b: 26.8, y: 395, size: 118, glow: 1 },
  { l: ['THE OLIVE', 'LEAF'], a: 27.6, b: 33.1, y: 330, size: 112, glow: 1 },
  { l: ['THE WATERS', 'HAD GONE DOWN'], a: 33.8, b: 36.0, y: 330, size: 92, glow: 1 },
  { l: ['THE DOVE', 'DID NOT RETURN'], a: 36.6, b: 41.0, y: 330, size: 94, glow: 1 },
  { l: ['THE EARTH', 'WAS DRY'], a: 41.6, b: 47.2, y: 330, size: 108, glow: 1 },
  { l: ['NOAH BUILT', 'AN ALTAR'], a: 47.8, b: 51.3, y: 330, size: 102, glow: 1 },
  { l: ['GOD’S', 'PROMISE'], a: 51.9, b: 58.2, y: 330, size: 118, glow: 1 },
  { l: ['GOD DID NOT', 'FORGET'], a: 61.1, b: 65.7, y: 330, size: 100, glow: 1 },
  { l: ['HOPE COMES', 'SLOWLY'], a: 66.0, b: 70.7, y: 330, size: 100, glow: 1 },
  { l: ['KEEP', 'TRUSTING'], a: 71.1, b: 77.6, y: 330, size: 112, glow: 1 },
  { l: ['GIVE', 'THANKS'], a: 78.7, b: 84.6, y: 330, size: 118, glow: 1 },
];
function drawTitles(cx, t) {
  for (const T of TITLES) cineTitle(cx, t, T.l, T.a, T.b, { size: T.size, y: T.y, glow: T.glow, color: T.color, lh: T.lh, stag: T.stag, rule: T.rule });
  capLine(cx, t, 'THE LIVING WORD FILMS  ·  EPISODE 08', .6, 4.8, 252, { size: 28, track: 7 });
  capLine(cx, t, 'GENESIS 8:1', 2.6, 5.3, 560, { size: 36, track: 12 });
  capLine(cx, t, 'GENESIS 8:1–3', 6.6, 11.0, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 8:4', 12.5, 17.2, 540, { size: 32, track: 10 });
  capLine(cx, t, 'THE TOPS OF THE MOUNTAINS APPEAR  ·  8:5', 14.8, 17.2, 590, { size: 22, track: 5, color: P.cream });
  capLine(cx, t, 'GENESIS 8:6–7', 18.6, 22.0, 520, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 8:8–9', 23.2, 26.8, 520, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 8:10–11', 28.2, 33.1, 540, { size: 32, track: 10 });
  capLine(cx, t, 'EVENING', 28.8, 33.1, 596, { size: 26, track: 14, color: P.cream });
  capLine(cx, t, 'GENESIS 8:11', 34.4, 36.0, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 8:12', 37.2, 41.0, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 8:13–19', 42.2, 47.2, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 8:20', 48.4, 51.3, 540, { size: 32, track: 10 });
  capLine(cx, t, 'GENESIS 8:21–22', 52.5, 58.2, 540, { size: 32, track: 10 });
  capLine(cx, t, 'THE SEASONS WILL NEVER CEASE', 54.6, 58.0, 596, { size: 22, track: 6, color: P.cream });
  capLine(cx, t, 'TODAY', 61.7, 65.6, 520, { size: 30, track: 14, color: P.cream });
}
function seek(t) { t = clamp(t, 0, DURATION - 1e-4); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.letterSpacing = '0px'; ctx.globalCompositeOperation = 'source-over'; frame(t); }
window.seek = seek; window.renderAt = seek;
// sound events for the SFX synth (kinds are defined in compose8_sfx.py)
const EV = [];
window.EVENTS = EV; window.__scene = { scene, camera, renderer, land, refl, SHOTS, hemi, sunL };
Promise.all([document.fonts ? Promise.all(['700 40px Cinzel', '800 40px Cinzel', '600 40px Cinzel', '600 30px Inter', '500 30px Inter', 'italic 500 30px "Cormorant Garamond"', 'italic 600 30px "Cormorant Garamond"'].map(f => document.fonts.load(f))) : null, endingReady]).then(() => {
  window.__ready = true;
  if (q.has('t')) seek(parseFloat(q.get('t'))); else if (!q.has('render')) { const t0 = performance.now(); (function loop() { seek(((performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); })(); } else seek(0);
});
