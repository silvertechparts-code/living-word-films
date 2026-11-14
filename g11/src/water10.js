// Episode 10: the faceted water of Episode 7, as a small patch around one islet (offset off, height map covering +-X around it)
import * as THREE from 'three';
import { clamp, lerp, smooth } from './util.js';

const clampv=clamp;
// ---- height map of the island, packed in two 8-bit channels so the water knows its depth and where the shore is
function heightTex(Hf, X, RI) {
  const N = 512, data = new Uint8Array(N * N * 4);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = (i + .5) / N * 2 * X - X, z = (j + .5) / N * 2 * X - X, r = Math.hypot(x, z), h = r > RI - .3 ? -3 : Hf(x, z) + .02, v = Math.round(clamp((h + 3) / 11) * 65535), o = (j * N + i) * 4;
    data[o] = v >> 8; data[o + 1] = v & 255; data[o + 2] = 0; data[o + 3] = 255;
  }
  const t = new THREE.DataTexture(data, N, N, THREE.RGBAFormat, THREE.UnsignedByteType); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true; return t;
}

function flatTex() { const d = new Uint8Array([0, 0, 0, 255]), t = new THREE.DataTexture(d, 1, 1, THREE.RGBAFormat, THREE.UnsignedByteType); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; }
const VS = `
uniform float uT, uLevel, uAmp; uniform vec2 uOff; varying vec3 vW;
float wv(vec2 p, float t){ float h = 0.; h += sin(p.x*.9 + p.y*.45 + t*1.3)*.5; h += sin(-p.x*.55 + p.y*1.1 + t*1.7)*.35; h += sin(p.x*1.9 - p.y*1.4 + t*2.4)*.18; h += sin(p.x*.3 + p.y*.2 + t*.6)*.6; return h; }
void main(){ vec3 p = position; float k = .8; vec3 w = vec3(p.x + uOff.x, uLevel + wv(p.xz + uOff, uT) * uAmp * k, p.z + uOff.y); vW = w; gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.); }`;
const FS = `
uniform vec3 uSun, uLit, uAmb, uDeep, uShallow, uSky, uHaze; uniform sampler2D uH; uniform vec2 uOff; uniform float uX; uniform float uLevel, uAmp, uOp, uFogA, uFogB, uSpec, uFoam; varying vec3 vW;
void main(){
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW))); if (n.y < 0.) n = -n;
  vec3 V = normalize(cameraPosition - vW); float ndl = max(dot(n, uSun), 0.), fres = pow(1. - max(dot(n, V), 0.), 3.);
  vec2 uv = (vW.xz - uOff + uX) / (2. * uX); float inside = step(0., uv.x) * step(uv.x, 1.) * step(0., uv.y) * step(uv.y, 1.);
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

export function makeWater10(Hf, X, RI, off, RMAX = 20) {
  const NR = 36, NS = 72, pos = new Float32Array((NR + 1) * NS * 3), idx = [];
  for (let i = 0; i <= NR; i++) for (let j = 0; j < NS; j++) { const r = RMAX * Math.pow(i / NR, 1.3), a = j / NS * Math.PI * 2 + (i & 1) * Math.PI / NS; pos.set([Math.cos(a) * r, 0, Math.sin(a) * r], (i * NS + j) * 3); }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) { const j1 = (j + 1) % NS, a = i * NS + j, b = i * NS + j1, c = (i + 1) * NS + j1, d = (i + 1) * NS + j; if ((i & 1) === 0) idx.push(a, d, b, b, d, c); else idx.push(a, d, c, a, c, b); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
  const C = c => new THREE.Color(c), U = {
    uT: { value: 0 }, uLevel: { value: .06 }, uAmp: { value: 0 }, uOp: { value: 0 }, uSun: { value: new THREE.Vector3(0, 1, 0) }, uLit: { value: new THREE.Vector3(1, 1, 1) }, uAmb: { value: new THREE.Vector3(.3, .3, .3) },
    uDeep: { value: C('#14305a') }, uShallow: { value: C('#3a7088') }, uSky: { value: C('#3a4a78') }, uHaze: { value: C('#1c2036') }, uH: { value: heightTex(Hf, X, RI) }, uOff: { value: new THREE.Vector2(off[0], off[1]) }, uX: { value: X }, uFogA: { value: 40 }, uFogB: { value: 140 }, uSpec: { value: .5 }, uFoam: { value: 1 } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 3;
  const tmpC = new THREE.Color();
  return {
    mesh, U,
    light(hemi, sun) { const sd = sun.position.clone().sub(sun.target.position).normalize(); U.uSun.value.copy(sd); tmpC.copy(sun.color); U.uLit.value.set(tmpC.r, tmpC.g, tmpC.b).multiplyScalar(sun.intensity * .7); tmpC.copy(hemi.color); U.uAmb.value.set(tmpC.r, tmpC.g, tmpC.b).multiplyScalar(hemi.intensity * .85); },
  };
}
