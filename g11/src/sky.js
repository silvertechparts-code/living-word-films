// Episode 5 sky: one continuous time-of-day curve (dawn -> morning -> a time-lapse of days -> night -> dawn), with sun, moon and stars.
import * as THREE from 'three';
import { clamp, lerp, smooth, seg, ease, rgbOf, mx, rng } from './util.js';
import { LK } from './lights.js';
import { G } from './geo.js';
import { sunGeometry, basicV } from './props.js';
import { glowTex } from './kit.js';

export const F = [0.5, -0.866], S = [0.866, 0.5];     // chain heading and screen-right on the ground (camera az about -30)
const lin = (t, k) => { if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])); return k[k.length - 1][1]; };
export function phiAt(t) {
  if (t < 34) return lin(t, [[0, .20], [10, .29], [22, .46], [34, .68]]);
  if (t < 47.8) return .68 + (2.97 - .68) * ease.inOutSine((t - 34) / 13.8);          // the years pass: about 2.4 days in 14 s
  if (t < 52.5) return lerp(2.97, 3.05, (t - 47.8) / 4.7);                             // Noah is born by night
  if (t < 57) return lerp(3.05, 3.27, ease.inOutSine((t - 52.5) / 4.5));              // dawn
  return lerp(3.27, 3.33, (t - 57) / 3);
}
export function sky(t) {
  const phi = phiAt(t), a = 2 * Math.PI * (phi - .25), e = Math.sin(a);
  return { phi, a, e, day: smooth(-.08, .5, e), night: 1 - smooth(-.30, .10, e), glow: Math.exp(-Math.pow(e / .30, 2)), stars: 1 - smooth(-.28, .10, e) };
}
const hex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export function bgFor(sk) {
  const dk = sk.day; let top = mx(rgbOf('#04061a'), rgbOf('#1c2f66'), dk), bot = mx(rgbOf('#101a40'), rgbOf('#9a8468'), dk);
  top = mx(top, rgbOf('#0c1236'), sk.glow * .45 * (1 - dk * .5)); bot = mx(bot, rgbOf('#d27a4c'), sk.glow * .8);
  return [hex(top), hex(bot)];
}
// key light swings with the sun (long shadows at dawn), colour and strength follow the day; the rim comes from behind
export function lightFor(sk, ex = {}) {
  const dk = sk.day, gl = sk.glow, e = sk.e, a = sk.a, gold = ex.gold || 0;
  const hs = mx(mx(rgbOf('#34448c'), rgbOf('#a8bef0'), dk), rgbOf('#c0a090'), gl * .3);
  const hg = mx(rgbOf('#12142a'), rgbOf('#6a4a30'), dk);
  const hi = lerp(.82, .84, dk) + (ex.hi || 0);
  let sc = mx(mx(rgbOf('#a8b8ff'), rgbOf('#ffd8a0'), dk), rgbOf('#ff9458'), gl * .8); sc = mx(sc, rgbOf('#ffe2a8'), gold);
  const si = lerp(1.55, 2.3, dk) + gl * .3 + gold * .35 + (ex.si || 0);
  const k = .55, ca = Math.cos(a);
  const sd = [(-F[0] * .75 - S[0] * ca * k) * 15, (.45 + .55 * Math.max(0, e)) * 15, (-F[1] * .75 - S[1] * ca * k) * 15];
  const rim = mx(rgbOf('#6a8cff'), rgbOf('#ffb070'), clamp(dk * .6 + gl * .5));
  const fd = [(F[0] * .7 - S[0] * ca * .5) * 14, 5.5, (F[1] * .7 - S[1] * ca * .5) * 14];
  return LK(hex(hs), hex(hg), hi, hex(sc), si, sd, lerp(.5, .85, dk) + (ex.fi || 0), hex(rim), fd, [0, 0, 0], 9);
}

// sun, moon, stars: real 3D bodies, but placed from screen coordinates so the arc is the same however the camera moves
export function makeCelestial() {
  const g = new THREE.Group(), R = rng(55);
  const sunM = new THREE.Mesh(sunGeometry(R, '#ffe9a0', '#d8761c'), basicV()); sunM.renderOrder = -2;
  const moonM = new THREE.Mesh(sunGeometry(R, '#f6f0e0', '#8a96b8'), basicV()); moonM.renderOrder = -2;
  const sunGl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffc070, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sunGl.renderOrder = -3;
  const moonGl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x9fb4ff, transparent: true, opacity: .4, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); moonGl.renderOrder = -3;
  g.add(sunM, moonM, sunGl, moonGl);
  const NS = 150, stars = new THREE.InstancedMesh(G.oct, new THREE.MeshBasicMaterial({ color: 0xfff0d0, toneMapped: false }), NS); stars.frustumCulled = false; stars.renderOrder = -4; g.add(stars);
  const SP = Array.from({ length: NS }, () => ({ x: (R() - .5) * 2, y: .1 + R() * 1.0, s: .018 + Math.pow(R(), 3) * .05, ph: R() * 6, tw: 1 + R() * 3 }));
  const _o = new THREE.Object3D(), _v = new THREE.Vector3(), _d = new THREE.Vector3();
  function ray(camera, nx, ny, dist) { _v.set(nx, ny, .5).unproject(camera); _d.copy(_v).sub(camera.position).normalize(); return _d.clone().multiplyScalar(dist).add(camera.position); }
  // position of the sun's screen path: x from -.78 (east) to +.78 (west); y from the horizon (ndc -.02) up to ndc .36
  function update(t, camera, D, sk, vis = 1) {
    const dist = D * 2.2 + 30, u = dist * .0085;
    const a = sk.a, ex = -Math.cos(a) * .80, ey = -.04 + .42 * Math.max(Math.sin(a), -.5);
    sunM.position.copy(ray(camera, ex, ey, dist)); sunM.scale.setScalar(u * 1.7); sunM.rotation.set(t * .05, t * .07, 0); sunM.visible = vis > .01 && sk.e > -.12;
    sunGl.position.copy(sunM.position); sunGl.scale.setScalar(u * 11); sunGl.material.opacity = .5 * vis * smooth(-.12, .2, sk.e) * (.8 + .2 * Math.sin(t * 2));
    const mx_ = Math.cos(a) * .80, my = -.04 + .42 * Math.max(-Math.sin(a), -.5);
    moonM.position.copy(ray(camera, mx_, my, dist)); moonM.scale.setScalar(u * 1.25); moonM.rotation.set(t * .03, t * .05, 0); moonM.visible = vis > .01 && sk.e < .1;
    moonGl.position.copy(moonM.position); moonGl.scale.setScalar(u * 8); moonGl.material.opacity = .4 * vis * smooth(.1, -.2, sk.e);
    const sd = dist * 1.05; g.position.set(0, 0, 0);
    for (let i = 0; i < NS; i++) { const p = SP[i], k = sk.stars * vis * (.55 + .45 * Math.sin(t * p.tw + p.ph)); const w = ray(camera, p.x * .98 + Math.sin(t * .02 + p.ph) * .003, -.12 + p.y * .8, sd);
      _o.position.copy(w); _o.scale.setScalar(Math.max(.0001, sd * (.0007 + .0030 * (p.s / .068)) * k)); _o.rotation.set(t * .2 + i, t * .1, 0); _o.updateMatrix(); stars.setMatrixAt(i, _o.matrix); }
    stars.instanceMatrix.needsUpdate = true;
  }
  return { group: g, update };
}
