// Episode 15: the star dome. A few hundred bright stars, a band of fainter ones for the Milky Way, and a reserve of extra stars that
// switch on as `boost` rises from 0 to 1 (Genesis 15:5, "count the stars, if you can"). Drawn as soft round points, additive, centred on the camera.
import * as THREE from 'three';
import { rng } from './util.js';

const VS = `attribute float size; attribute float phase; attribute float thr; attribute vec3 col;
uniform float time; uniform float boost; uniform float scale; uniform float opacity; varying vec3 vC; varying float vA;
void main(){ vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz; float elev = (wp.y - cameraPosition.y) / max(1.0, length(wp - cameraPosition)); float tw = .72 + .28 * sin(time * (1.3 + phase * 1.7) + phase * 40.0); float vis = smoothstep(thr - .02, thr + .14, boost + .0001); vA = vis * tw * opacity * smoothstep(-.01, .035, elev); vC = col;
  vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = size * scale * (1.0 + .3 * boost * (1.0 - thr)) * (.8 + .2 * tw); }`;
const FS = `varying vec3 vC; varying float vA; void main(){ vec2 d = gl_PointCoord - .5; float r = length(d) * 2.0; float a = clamp((1.0 - r) * 1.9, 0.0, 1.0); a = a * a * (3.0 - 2.0 * a); gl_FragColor = vec4(vC * 1.55, a * vA); }`;

export function makeStars(o = {}) {
  const R = rng(o.seed || 15), NB = o.nBright || 4500, NX = o.nExtra || 12000, NM = o.nMilky || 30000, N = NB + NX + NM;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N), phase = new Float32Array(N), thr = new Float32Array(N);
  const nrm = new THREE.Vector3(.38, .78, .5).normalize(), u = new THREE.Vector3(1, 0, 0).cross(nrm).normalize(), v = nrm.clone().cross(u).normalize();
  const tint = () => { const k = R(); return k < .22 ? [.72, .82, 1] : k < .55 ? [1, .97, .88] : [1, .86, .62]; };
  let n = 0;
  const put = (x, y, z, s, c, th) => { pos.set([x, y, z], n * 3); col.set(c, n * 3); size[n] = s; phase[n] = R(); thr[n] = th; n++; };
  const dirUp = () => { const y = -1 + R() * 2, a = R() * Math.PI * 2, r = Math.sqrt(1 - y * y); return [Math.cos(a) * r, y, Math.sin(a) * r]; };
  for (let i = 0; i < NB; i++) { const [x, y, z] = dirUp(), big = R() < .1; put(x, y, z, big ? 8.5 + R() * 5.5 : 3.6 + R() * 2.6, tint(), -1); }
  for (let i = 0; i < NX; i++) { const [x, y, z] = dirUp(); put(x, y, z, 3.0 + R() * 3.0, tint(), .05 + .9 * R()); }
  let guard = 0; while (n < N && guard++ < 400000) { const th = R() * Math.PI * 2, off = (R() + R() + R() - 1.5) * .26, w = off;
    const dx = Math.cos(th) * u.x + Math.sin(th) * v.x + w * nrm.x, dy = Math.cos(th) * u.y + Math.sin(th) * v.y + w * nrm.y, dz = Math.cos(th) * u.z + Math.sin(th) * v.z + w * nrm.z, l = Math.hypot(dx, dy, dz);
    const fade = 1 - Math.min(1, Math.abs(off) / .4); put(dx / l, dy / l, dz / l, 2.2 + 2.0 * R(), [.62 * fade + .1, .68 * fade + .1, .9 * fade + .1], -1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, n * 3), 3)); geo.setAttribute('col', new THREE.BufferAttribute(col.subarray(0, n * 3), 3));
  geo.setAttribute('size', new THREE.BufferAttribute(size.subarray(0, n), 1)); geo.setAttribute('phase', new THREE.BufferAttribute(phase.subarray(0, n), 1)); geo.setAttribute('thr', new THREE.BufferAttribute(thr.subarray(0, n), 1));
  const mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { time: { value: 0 }, boost: { value: 0 }, scale: { value: 1 }, opacity: { value: 0 } } });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = -20; pts.scale.setScalar(240);
  const pole = new THREE.Group(); pole.rotation.x = .55; pole.add(pts); const g = new THREE.Group(); g.add(pole); g.renderOrder = -20;
  // t: seconds; op: 0..1; boost: 0..1; spin: radians about the celestial pole; camPos: the dome is centred on the camera
  function update(t, op, boost, spin, camPos) { mat.uniforms.time.value = t; mat.uniforms.opacity.value = op; mat.uniforms.boost.value = boost; g.visible = op > .003; pts.rotation.y = spin; if (camPos) g.position.copy(camPos); }
  return { group: g, update, mat };
}
