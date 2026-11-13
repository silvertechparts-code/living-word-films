// Episode 7: the water (a faceted shader surface that knows how deep it is over the island), rain, splashes, the fountains of the great deep and the first streams.
import * as THREE from 'three';
import { rng, lerp, clamp, smooth } from './util.js';
import { Hf as Hf7, RI } from './terrain6.js';

// ---- water level (world units; the ground of the plain is about 0.1, the highest peak about 6.4)
const WL = [[0, -6], [35.9, -1.2], [36.6, -.9], [38, .0], [40, .14], [42, .4], [44, .85], [46, 1.55], [48, 2.5], [50, 3.5], [52, 4.7], [54, 6.0], [56, 7.2], [58, 8.0], [60, 8.4], [90, 8.6]];
export function waterLevel(t) { let i = 1; while (i < WL.length - 1 && t > WL[i][0]) i++; const [ta, a] = WL[i - 1], [tb, b] = WL[i]; const u = clamp((t - ta) / (tb - ta)), e = u * u * (3 - 2 * u) * .5 + u * .5; return lerp(a, b, e); }
const AMP = [[0, 0], [36, .03], [38, .08], [44, .18], [50, .3], [56, .4], [60, .38], [90, .3]];
export function waveAmp(t) { let i = 1; while (i < AMP.length - 1 && t > AMP[i][0]) i++; const [ta, a] = AMP[i - 1], [tb, b] = AMP[i]; return lerp(a, b, clamp((t - ta) / (tb - ta))); }

// ---- height map of the island, packed in two 8-bit channels so the water knows its depth and where the shore is
function heightTex(Hf = Hf7) {
  const N = 512, data = new Uint8Array(N * N * 4), X = 15;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = (i + .5) / N * 2 * X - X, z = (j + .5) / N * 2 * X - X, r = Math.hypot(x, z), h = r > RI - .3 ? -3 : Hf(x, z) + .02, v = Math.round(clamp((h + 3) / 11) * 65535), o = (j * N + i) * 4;
    data[o] = v >> 8; data[o + 1] = v & 255; data[o + 2] = 0; data[o + 3] = 255;
  }
  const t = new THREE.DataTexture(data, N, N, THREE.RGBAFormat, THREE.UnsignedByteType); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true; return t;
}

function flatTex() { const d = new Uint8Array([0, 0, 0, 255]), t = new THREE.DataTexture(d, 1, 1, THREE.RGBAFormat, THREE.UnsignedByteType); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; }
const VS = `
uniform float uT, uLevel, uAmp; varying vec3 vW;
float wv(vec2 p, float t){ float h = 0.; h += sin(p.x*.9 + p.y*.45 + t*1.3)*.5; h += sin(-p.x*.55 + p.y*1.1 + t*1.7)*.35; h += sin(p.x*1.9 - p.y*1.4 + t*2.4)*.18; h += sin(p.x*.3 + p.y*.2 + t*.6)*.6; return h; }
void main(){ vec3 p = position; float k = smoothstep(2., 14., length(p.xz)) * .6 + .4; vec3 w = vec3(p.x, uLevel + wv(p.xz, uT) * uAmp * k, p.z); vW = w; gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.); }`;
const FS = `
uniform vec3 uSun, uLit, uAmb, uDeep, uShallow, uSky, uHaze; uniform sampler2D uH; uniform float uLevel, uAmp, uOp, uFogA, uFogB, uSpec, uFoam; varying vec3 vW;
void main(){
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW))); if (n.y < 0.) n = -n;
  vec3 V = normalize(cameraPosition - vW); float ndl = max(dot(n, uSun), 0.), fres = pow(1. - max(dot(n, V), 0.), 3.);
  vec2 uv = (vW.xz + 15.) / 30.; float inside = step(0., uv.x) * step(uv.x, 1.) * step(0., uv.y) * step(uv.y, 1.);
  vec4 hh = texture2D(uH, uv); float th = (hh.r * 255. * 256. + hh.g * 255.) / 65535. * 11. - 3.;
  float depth = inside > .5 ? max(vW.y - th, 0.) : 4.;
  vec3 base = mix(uShallow, uDeep, smoothstep(.0, 1.8, depth));
  vec3 col = base * (uAmb + uLit * ndl);
  col = mix(col, uSky, fres * .5);
  float crest = smoothstep(uAmp * .5, uAmp * 1.0, vW.y - uLevel) * uFoam, shore = (1. - smoothstep(.0, .22, depth)) * inside * (.45 + .55 * (.5 + .5 * sin(vW.x * 5. + vW.z * 4.)));
  float ff = smoothstep(uFogA * .5, uFogB * .7, length(vW.xz - cameraPosition.xz)); float foam = clamp(crest * .55 * (1. - ff) + shore * .8 * (1. - ff), 0., 1.); col = mix(col, (uAmb + uLit * .6) * vec3(.9, .94, 1.), foam * .8);
  float d = length(vW.xz - cameraPosition.xz), f = smoothstep(uFogA, uFogB, d);
  vec3 R = reflect(-uSun, n); col += min(uLit, vec3(1.15)) * pow(max(dot(R, V), 0.), 60.) * uSpec * (1. - f);
  col = mix(col, uHaze, f);
  float a = mix(.5, 1., smoothstep(.0, .55, depth)); a = mix(a, 1., f) * uOp;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
}`;

export function makeWater(flat = false, Hf = Hf7, WLf = waterLevel, AMPf = waveAmp) {
  const NR = 90, NS = 140, RMAX = 170, pos = new Float32Array((NR + 1) * NS * 3), idx = [];
  for (let i = 0; i <= NR; i++) for (let j = 0; j < NS; j++) { const r = RMAX * Math.pow(i / NR, 1.75), a = j / NS * Math.PI * 2 + (i & 1) * Math.PI / NS; pos.set([Math.cos(a) * r, 0, Math.sin(a) * r], (i * NS + j) * 3); }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) { const j1 = (j + 1) % NS, a = i * NS + j, b = i * NS + j1, c = (i + 1) * NS + j1, d = (i + 1) * NS + j; if ((i & 1) === 0) idx.push(a, d, b, b, d, c); else idx.push(a, d, c, a, c, b); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
  const C = c => new THREE.Color(c), U = {
    uT: { value: 0 }, uLevel: { value: -6 }, uAmp: { value: 0 }, uOp: { value: 0 }, uSun: { value: new THREE.Vector3(0, 1, 0) }, uLit: { value: new THREE.Vector3(1, 1, 1) }, uAmb: { value: new THREE.Vector3(.3, .3, .3) },
    uDeep: { value: C('#14305a') }, uShallow: { value: C('#3a7088') }, uSky: { value: C('#3a4a78') }, uHaze: { value: C('#1c2036') }, uH: { value: flat ? flatTex() : heightTex(Hf) }, uFogA: { value: 40 }, uFogB: { value: 140 }, uSpec: { value: .5 }, uFoam: { value: 1 } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 3;
  const tmpC = new THREE.Color();
  return {
    mesh, U,
    // time-dependent look; k.haze / k.sky colours are passed by the caller
    set(t, o = {}) { U.uT.value = t; const L = WLf(t); U.uLevel.value = L + (o.dl || 0); U.uAmp.value = AMPf(t) * (o.amp ?? 1); U.uOp.value = (o.opf ? o.opf(t, L) : smooth(36.2, 37.6, t)) * (o.op ?? 1); if (o.haze) U.uHaze.value.set(o.haze); if (o.sky) U.uSky.value.set(o.sky); if (o.deep) U.uDeep.value.set(o.deep); if (o.shallow) U.uShallow.value.set(o.shallow); if (o.fog) { U.uFogA.value = o.fog[0]; U.uFogB.value = o.fog[1]; } if (o.spec != null) U.uSpec.value = o.spec; },
    light(hemi, sun) { const sd = sun.position.clone().sub(sun.target.position).normalize(); U.uSun.value.copy(sd); tmpC.copy(sun.color); U.uLit.value.set(tmpC.r, tmpC.g, tmpC.b).multiplyScalar(sun.intensity * .7); tmpC.copy(hemi.color); U.uAmb.value.set(tmpC.r, tmpC.g, tmpC.b).multiplyScalar(hemi.intensity * .85); },
  };
}

// ---- rain streaks in a volume that follows the camera target, plus splash rings on the water
export function makeRain() {
  const N = 2600, geo = new THREE.BoxGeometry(1, 1, 1), mat = new THREE.MeshBasicMaterial({ color: 0xa9bde0, transparent: true, opacity: .3, depthWrite: false, toneMapped: false }), m = new THREE.InstancedMesh(geo, mat, N); m.frustumCulled = false; m.renderOrder = 6;
  const R = rng(5150), S = Array.from({ length: N }, () => ({ a: R(), b: R(), c: R(), v: .85 + R() * .5 })), ob = new THREE.Object3D();
  const NSP = 260, ring = new THREE.RingGeometry(.82, 1, 18), smat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }), sp = new THREE.InstancedMesh(ring, smat, NSP); sp.frustumCulled = false; sp.renderOrder = 6; ring.rotateX(-Math.PI / 2);
  const SP = Array.from({ length: NSP }, () => ({ x: R(), z: R(), ph: R(), per: .55 + R() * .5 })), col = new THREE.Color(); sp.setColorAt(0, col.setRGB(0, 0, 0)); for (let i = 1; i < NSP; i++) sp.setColorAt(i, col);
  const group = new THREE.Group(); group.add(m, sp);
  function update(t, k, T, w, level, ampl) {
    const S0 = w * 1.25, H = S0 * 1.3, n = Math.floor(N * clamp(k)), len = S0 * .075, th = Math.max(S0 * .0011, .004), wind = .28; mat.opacity = .3 + .12 * clamp(k - .6);
    for (let i = 0; i < N; i++) {
      if (i >= n) { ob.scale.set(0, 0, 0); ob.position.set(0, -99, 0); ob.updateMatrix(); m.setMatrixAt(i, ob.matrix); continue; }
      const s = S[i], fall = ((s.c - t * S0 * .9 * s.v / H) % 1 + 1) % 1, y = T[1] - H * .35 + fall * H;
      ob.position.set(T[0] + (s.a - .5) * S0 * 1.5 + (fall - .5) * wind * H * .3, y, T[2] + (s.b - .5) * S0 * 1.5); ob.scale.set(th, len * (.7 + .6 * s.v), th); ob.rotation.set(0, 0, wind * -.9); ob.updateMatrix(); m.setMatrixAt(i, ob.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    const ns = level > -.5 ? Math.floor(NSP * clamp(k)) : 0; // splashes only where there is water at all
    for (let i = 0; i < NSP; i++) {
      const s = SP[i], u = (((t / s.per + s.ph) % 1) + 1) % 1; if (i >= ns || level < -.5) { ob.scale.set(0, 0, 0); ob.position.set(0, -99, 0); ob.updateMatrix(); sp.setMatrixAt(i, ob.matrix); continue; }
      const cyc = Math.floor(t / s.per + s.ph), rx = ((Math.sin(cyc * 12.9898 + i * 78.233) * 43758.5453) % 1 + 1) % 1, rz = ((Math.sin(cyc * 39.346 + i * 11.135) * 24634.634) % 1 + 1) % 1;
      const x = T[0] + (rx - .5) * S0 * 1.6, z = T[2] + (rz - .5) * S0 * 1.6, r = S0 * (.004 + .03 * u);
      ob.position.set(x, level + .02, z); ob.scale.set(r, 1, r); ob.rotation.set(0, 0, 0); ob.updateMatrix(); sp.setMatrixAt(i, ob.matrix); const f = (1 - u) * (1 - u) * .55; sp.setColorAt(i, col.setRGB(f * .8, f * .88, f));
    }
    sp.instanceMatrix.needsUpdate = true; sp.instanceColor.needsUpdate = true;
  }
  return { group, update };
}

// ---- the great deep bursts forth: jets from the plain, and streams running down the mountain flanks
export function makeSprings(gyf) {
  const SRC = [[2.6, -2.3], [4.2, 3.2], [-.8, -1.6], [9.6, 2.6], [6.2, -4.6], [.4, 4.3], [-4.2, -3.1], [-2.0, 1.2], [10.2, -1.2]], NP = 34, R = rng(7171);
  const geo = new THREE.IcosahedronGeometry(1, 0), mat = new THREE.MeshBasicMaterial({ color: 0xcfe0f4, toneMapped: false, transparent: true, opacity: .8 }), jets = new THREE.InstancedMesh(geo, mat, SRC.length * NP); jets.frustumCulled = false;
  const P = []; SRC.forEach((s, k) => { for (let i = 0; i < NP; i++) { const a = R() * 6.283, sp = .35 + R() * .9; P.push({ k, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: 2.6 + R() * 1.6, ph: R(), life: 1.1 + R() * .5, sz: .03 + R() * .035 }); } });
  const t0s = SRC.map((_, k) => 36.2 + k * .22 + R() * .2);
  // streams: follow the downhill gradient from points on the mountain flanks
  const STR = [[-3.5, -7.4], [2.6, -8.2], [-8.2, -5.2], [8.0, -7.4], [11.0, -3.6], [-1.0, -6.4], [5.2, -6.6]].map(([x0, z0]) => {
    const pts = []; let x = x0, z = z0; for (let i = 0; i < 160; i++) { pts.push([x, z]); const e = .08, gx = (Hf(x + e, z) - Hf(x - e, z)) / (2 * e), gz = (Hf(x, z + e) - Hf(x, z - e)) / (2 * e), gl = Math.hypot(gx, gz) || 1; if (Hf(x, z) < .14 || Math.hypot(x, z) > RI - 1) break; x -= gx / gl * .11 + .03 * Math.sin(i * .3); z -= gz / gl * .11; } return pts; });
  const NSD = STR.reduce((a, s) => a + Math.max(0, Math.floor(s.length / 3)), 0), dmat = new THREE.MeshBasicMaterial({ color: 0xc4d6ee, toneMapped: false, transparent: true, opacity: .7 }), dash = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), dmat, NSD); dash.frustumCulled = false;
  const ob = new THREE.Object3D(), group = new THREE.Group(); group.add(jets, dash);
  function update(t, level) {
    let i = 0;
    for (const p of P) {
      const t0 = t0s[p.k], on = smooth(t0, t0 + 1.2, t) * (1 - smooth(t0 + 5.5, t0 + 8.5, t)); const [sx, sz] = SRC[p.k], u = (((t - t0) / p.life + p.ph) % 1 + 1) % 1, tau = u * p.life, y0 = gyf(sx, sz);
      const y = y0 + p.vy * tau - 2.6 * tau * tau, s = p.sz * on * (y > Math.max(y0 - .02, level) ? 1 : 0);
      ob.position.set(sx + p.vx * tau, Math.max(y, y0), sz + p.vz * tau); ob.scale.set(s, s * 1.3, s); ob.rotation.set(0, 0, 0); ob.updateMatrix(); jets.setMatrixAt(i++, ob.matrix);
    }
    jets.instanceMatrix.needsUpdate = true;
    let d = 0; STR.forEach((pts, k) => { const n = Math.floor(pts.length / 3), on = smooth(36.8 + k * .3, 38.6 + k * .3, t) * (1 - smooth(43 + k * .4, 46 + k * .4, t));
      for (let q = 0; q < n; q++) { const f = (((q / n + t * .22 * (1 + (k % 3) * .12)) % 1) + 1) % 1, fi = f * (pts.length - 1), a = pts[Math.floor(fi)], b = pts[Math.min(pts.length - 1, Math.floor(fi) + 1)], x = lerp(a[0], b[0], fi % 1), z = lerp(a[1], b[1], fi % 1), ang = Math.atan2(b[0] - a[0], b[1] - a[1]), vis = on * (gyf(x, z) > level + .01 ? 1 : 0);
        ob.position.set(x, gyf(x, z) + .015, z); ob.scale.set(.05 * vis, .012 * vis, .16 * vis); ob.rotation.set(0, ang, 0); ob.updateMatrix(); dash.setMatrixAt(d++, ob.matrix); } });
    dash.instanceMatrix.needsUpdate = true;
  }
  return { group, update };
}
