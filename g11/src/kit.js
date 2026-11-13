// Shared building blocks for Episode 4: people, slabs, glows, instancing helpers, light shafts
import * as THREE from 'three';
import { GB, G } from './geo.js';
import { rng, lerp, clamp, smooth } from './util.js';
import { pk, makeFigure } from './props.js';
import { lam } from './flora.js';
export { lam };

export const SKINS = ['#c98d62', '#b57a50', '#d9a073', '#9c6a42', '#e4b48a'];
export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export function person(R, o = {}, sc = 1.2) {
  const f = makeFigure({ robe: o.pants || '#3a4a6a', robe2: o.top || '#d86a4a', skin: o.skin || pk(R, SKINS), hair: o.hair || '#2e1d10', long: o.long, beard: o.beard, sash: o.sash, cloth: o.cloth, mantle: o.mantle, rn: rng(o.seed || 7) });
  f.group.scale.setScalar(sc); f.sc = sc; return f;
}
export function pose(f, x, y, z, ry, o = {}) {
  f.group.position.set(x, y, z); f.group.rotation.set(o.lx || 0, ry, o.lz || 0, 'YXZ');
  f.arms[0].rotation.set(o.a0x || 0, o.a0y || 0, o.a0z ?? -.1); f.arms[1].rotation.set(o.a1x || 0, o.a1y || 0, o.a1z ?? .1);
  f.group.scale.set(f.sc * (o.sx || 1), f.sc * (o.s || 1), f.sc * (o.sx || 1));
}
// world position of a point "d" ahead of a figure and "h" up (ignores lean; fine for carried things)
export const ahead = (x, z, ry, d, side = 0) => [x + Math.sin(ry) * d + Math.cos(ry) * side, z + Math.cos(ry) * d - Math.sin(ry) * side];

// round floating slab with strata (used by the small dioramas)
export function slab(R, r = 3.5, top = '#5a8a42', strata) {
  const gb = new GB(R), N = 30, S = strata || ['#6a4a30', '#8a6a48', '#5a4030', '#7a5a3c', '#4a3428'];
  const cyl = (rt, rb, h, y, col) => { const g = new THREE.CylinderGeometry(rt, rb, h, N, 1); g.translate(0, y, 0); gb.add(g, col, [0, 0, 0], [1, 1, 1], [0, 0, 0], .08); };
  cyl(r, r, .18, -.09, top); cyl(r * .995, r * .97, .22, -.29, S[0]); cyl(r * .96, r * .86, .3, -.55, S[1]); cyl(r * .85, r * .66, .5, -.95, S[2]); cyl(r * .64, r * .38, .6, -1.5, S[3]); cyl(r * .37, r * .08, 1.2, -2.4, S[4]);
  const m = new THREE.Mesh(gb.build(), lam); m.receiveShadow = true; m.castShadow = true; return m;
}
export const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
export const spriteGlow = (x, y, z, s, col, op) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); sp.position.set(x, y, z); sp.scale.set(s, s, 1); sp.renderOrder = 7; return sp; };
export const bits = (n, geo, mat, cast = false) => { const m = new THREE.InstancedMesh(geo, mat, n); m.frustumCulled = false; m.castShadow = cast; return m; };
const _ob = new THREE.Object3D();
export const put = (m, i, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) => { _ob.position.set(x, y, z); _ob.scale.set(sx, sy, sz); _ob.rotation.set(rx, ry, rz); _ob.updateMatrix(); m.setMatrixAt(i, _ob.matrix); };
export const bump = t => 1 + .06 * Math.sin(t * 2.2);
// a column of additive light: soft at its edges (fades where the surface turns away from the camera), brighter at the top
export function shaft(h, rTop, rBot, col = [1, .85, .5], bTop = 1, bBot = .25, n = 32) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, n, 1, true); g.translate(0, h / 2, 0);
  const p = g.attributes.position, cc = []; for (let i = 0; i < p.count; i++) { const k = p.getY(i) / h, b = lerp(bBot, bTop, k); cc.push(col[0] * b, col[1] * b, col[2] * b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3));
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquationAlpha: THREE.AddEquation, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor, side: THREE.DoubleSide, vertexColors: true, uniforms: { op: { value: 0 } },
    vertexShader: 'varying vec3 vC; varying vec3 vN; void main(){ vC = color; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float op; varying vec3 vC; varying vec3 vN; void main(){ float a = pow(abs(vN.z), 1.6); gl_FragColor = vec4(vC * a * op, 1.0); }' });
  Object.defineProperty(mat, 'opacity', { get() { return mat.uniforms.op.value; }, set(v) { mat.uniforms.op.value = v; } });
  const m = new THREE.Mesh(g, mat); m.renderOrder = 8; m.frustumCulled = false; return m;
}
// flat additive disc / ring lying on the ground
export function pool(r, col, op = 0) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ map: glowTex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 4; m.frustumCulled = false; return m;
}
export function ringMesh(r, w, col, op = 0) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r - w / 2, r + w / 2, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 5; m.frustumCulled = false; return m;
}
export const basicMat = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: op < 1, opacity: op, toneMapped: false });
export const lamC = c => new THREE.MeshLambertMaterial({ color: c });
export { GB, G, rng, lerp, clamp, smooth };
