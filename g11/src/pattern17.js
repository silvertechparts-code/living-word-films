// Episode 17: the "new name" pattern. A fine gold pattern of a central star ringed by more and more small stars (Genesis 17:5, "father of many nations"), drawn into a texture and shown as a light-only
// decal on the ground. `rev` (0..1.1) is the radius the pattern has been written out to; `op` its brightness. Cinematic interpretation, not Scripture: nothing in the text describes a pattern.
import * as THREE from 'three';

function star(g, x, y, r, n, w) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * .42 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.lineWidth = w; g.stroke(); }
export function patternTexture() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
  const C = S / 2, U = S / 2; g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineCap = 'round';
  const ring = (r, w, a = 1) => { g.globalAlpha = a; g.lineWidth = w; g.beginPath(); g.arc(C, C, r * U, 0, Math.PI * 2); g.stroke(); };
  ring(.985, 5, .9); ring(.93, 2, .7); ring(.72, 3, .8); ring(.5, 3, .85); ring(.29, 3, 1);
  g.globalAlpha = .45; g.lineWidth = 2; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.beginPath(); g.moveTo(C + Math.cos(a) * .3 * U, C + Math.sin(a) * .3 * U); g.lineTo(C + Math.cos(a) * .92 * U, C + Math.sin(a) * .92 * U); g.stroke(); }
  g.globalAlpha = 1; star(g, C, C, .22 * U, 8, 5); star(g, C, C, .13 * U, 8, 3);
  [[.39, 6, .045], [.61, 12, .04], [.84, 20, .033]].forEach(([r, n, s], k) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + k * .3; star(g, C + Math.cos(a) * r * U, C + Math.sin(a) * r * U, s * U, 5, 2.6); } });
  g.globalAlpha = .9; for (let i = 0; i < 90; i++) { const a = i * 2.399963, r = .12 + .8 * Math.sqrt(i / 90); g.beginPath(); g.arc(C + Math.cos(a) * r * U, C + Math.sin(a) * r * U, 3, 0, Math.PI * 2); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}
export function makePattern(radius, col = [1, .82, .45]) {
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquationAlpha: THREE.AddEquation, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor, side: THREE.DoubleSide,
    uniforms: { map: { value: patternTexture() }, rev: { value: 0 }, op: { value: 0 }, col: { value: new THREE.Vector3(...col) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D map; uniform float rev; uniform float op; uniform vec3 col; varying vec2 vUv; void main(){ vec2 c = vUv - .5; float r = length(c) * 2.0; float m = smoothstep(rev, rev - .1, r); float a = texture2D(map, vUv).r; gl_FragColor = vec4(col * a * m * op, 1.0); }' });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), mat); m.rotation.x = -Math.PI / 2; m.renderOrder = 5; m.frustumCulled = false; m.visible = false;
  m.userData.set = (rev, op) => { mat.uniforms.rev.value = rev; mat.uniforms.op.value = op; m.visible = op > .004 && rev > .01; };
  return m;
}
