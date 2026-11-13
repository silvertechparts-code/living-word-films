import * as THREE from 'three';
import { GB, G } from './geo.js';
import { rng, seg, ease, lerp, clamp } from './util.js';
import { lam } from './flora.js';

const legMesh = (w, len, col, rn) => { const gb = new GB(rn); gb.box(col, [0, -len / 2, 0], [w, len, w], [0, 0, 0], .06); const m = new THREE.Mesh(gb.build(), lam); m.castShadow = true; return m; };
const bodyMesh = (gb) => { const m = new THREE.Mesh(gb.build(), lam); m.castShadow = true; m.receiveShadow = true; return m; };

export function build(kind, rn, opts = {}) {
  const g = new THREE.Group(), body = new GB(rn); let legs = [], hipY = .5, leg = {};
  if (kind === 'deer') {
    body.box('#b9824a', [0, .58, 0], [.62, .28, .24]); body.box('#e5cfa3', [0, .47, 0], [.5, .1, .2]);
    body.box('#b9824a', [.36, .8, 0], [.13, .36, .13], [0, 0, -.55]); body.box('#b9824a', [.52, .99, 0], [.22, .13, .13], [0, 0, -.1]); body.box('#4a3322', [.64, .97, 0], [.06, .07, .08]);
    for (const s of [-1, 1]) { body.box('#a06c3a', [.46, 1.08, .07 * s], [.04, .1, .06], [.3 * s, 0, .4]); body.box('#e0d2b0', [.5, 1.2, .05 * s], [.02, .22, .02], [0, 0, .3]); body.box('#e0d2b0', [.45, 1.3, .06 * s], [.02, .14, .02], [0, 0, -.7]); body.box('#e0d2b0', [.55, 1.33, .06 * s], [.02, .12, .02], [0, 0, .9]); }
    body.box('#f4efe3', [-.33, .66, 0], [.07, .1, .07]);
    hipY = .48; leg = { w: .065, len: .48, col: '#8a5a30', pos: [[.22, .09], [.22, -.09], [-.22, .09], [-.22, -.09]] };
  } else if (kind === 'elephant') {
    const c = opts.col || '#b7b4ad', d = opts.dark || '#9a978f';
    body.box(c, [0, 1.15, 0], [1.25, .95, .8]); body.box(d, [0, .78, 0], [1.1, .3, .72]); body.box(c, [.92, 1.3, 0], [.72, .82, .72]);
    for (const s of [-1, 1]) { body.box(d, [.78, 1.4, .5 * s], [.05, .66, .58], [0, -.45 * s, 0]); body.box('#f5f1e6', [1.3, .95, .24 * s], [.26, .05, .05], [0, 0, -.25]); }
    body.box(c, [1.34, 1.0, 0], [.22, .55, .22], [0, 0, -.18]); body.box(c, [1.43, .62, 0], [.2, .45, .2], [0, 0, -.3]); body.box(d, [1.5, .4, 0], [.18, .3, .18], [0, 0, -.5]);
    body.box(d, [-.66, 1.1, 0], [.06, .5, .06], [0, 0, .1]);
    hipY = .85; leg = { w: .32, len: .85, col: d, pos: [[.4, .26], [.4, -.26], [-.4, .26], [-.4, -.26]] };
  } else if (kind === 'giraffe') {
    body.box('#e3a63a', [0, 1.25, 0], [.82, .46, .38]); body.box('#e3a63a', [.52, 1.85, 0], [.2, 1.05, .2], [0, 0, -.22]); body.box('#e3a63a', [.74, 2.4, 0], [.32, .16, .16], [0, 0, -.1]); body.box('#6b4a2c', [.9, 2.38, 0], [.06, .08, .1]);
    for (const s of [-1, 1]) { body.box('#6b4a2c', [.7, 2.54, .05 * s], [.025, .13, .025]); body.box('#e3a63a', [.62, 2.5, .1 * s], [.03, .08, .08], [0, 0, .5]); }
    for (let k = 0; k < 11; k++) { const x = (rn() - .5) * .66, y = 1.12 + rn() * .26; for (const s of [-1, 1]) body.box('#8a5a2b', [x, y, .192 * s], [.14, .11, .02], [0, 0, 0], .1); }
    for (let k = 0; k < 6; k++) { const u = k / 6; for (const s of [-1, 1]) body.box('#8a5a2b', [.46 + u * .22, 1.5 + u * .85, .108 * s], [.1, .13, .02], [0, 0, -.22]); }
    body.box('#6b4a2c', [-.44, 1.15, 0], [.04, .5, .04], [0, 0, .1]);
    hipY = 1.02; leg = { w: .085, len: 1.02, col: '#d29a3a', pos: [[.3, .13], [.3, -.13], [-.3, .13], [-.3, -.13]] };
  } else if (kind === 'zebra') {
    body.box('#f4f1ea', [0, .85, 0], [.8, .45, .32]); for (let k = 0; k < 8; k++) body.box('#1f1f24', [-.36 + k * .1, .85, 0], [.05, .47, .34], [0, 0, 0], .03);
    body.box('#f4f1ea', [.46, 1.13, 0], [.18, .52, .16], [0, 0, -.5]); for (let k = 0; k < 3; k++) body.box('#1f1f24', [.37 + k * .07, 1.0 + k * .13, 0], [.05, .13, .18], [0, 0, -.5]);
    body.box('#f4f1ea', [.64, 1.32, 0], [.3, .15, .14], [0, 0, -.15]); body.box('#1f1f24', [.78, 1.3, 0], [.07, .1, .12]); body.box('#1f1f24', [.5, 1.4, 0], [.2, .04, .05], [0, 0, -.5]);
    body.box('#1f1f24', [-.42, .8, 0], [.04, .5, .04], [0, 0, .15]);
    hipY = .65; leg = { w: .07, len: .65, col: '#e8e5de', pos: [[.3, .11], [.3, -.11], [-.3, .11], [-.3, -.11]] };
  } else if (kind === 'lion') {
    body.box('#c79a52', [0, .62, 0], [.78, .34, .3]); body.box('#e0bd7a', [0, .5, 0], [.62, .1, .26]);
    body.box('#c79a52', [.44, .78, 0], [.2, .3, .24], [0, 0, -.35]); body.add(G.ico1, '#8a5a28', [.54, .9, 0], [.27, .26, .27], [0, 0, 0], .08);
    body.box('#d7aa60', [.68, .84, 0], [.2, .17, .2]); body.box('#3a2418', [.79, .83, 0], [.05, .06, .07]);
    body.box('#c79a52', [-.46, .66, 0], [.05, .5, .05], [0, 0, .7]); body.add(G.ico0, '#6a3a18', [-.7, .45, 0], [.08, .1, .08]);
    hipY = .5; leg = { w: .11, len: .5, col: '#b8894a', pos: [[.26, .11], [.26, -.11], [-.26, .11], [-.26, -.11]] };
  }
  const bm = bodyMesh(body); g.add(bm);
  for (const [lx, lz] of leg.pos) { const m = legMesh(leg.w, leg.len, leg.col, rn); m.position.set(lx, hipY, lz); g.add(m); legs.push(m); }
  return { group: g, body: bm, legs };
}

export function makeBird(rn, col = '#f4f0e6') {
  const g = new THREE.Group(), b = new GB(rn);
  b.add(G.ico0, col, [0, 0, 0], [.16, .075, .075]); b.add(G.ico0, col, [.15, .03, 0], [.06, .06, .06]); b.add(G.cone5, '#f08a30', [.22, .03, 0], [.025, .09, .025], [0, 0, -Math.PI / 2]); b.add(G.cone5, '#d8d2c4', [-.18, 0, 0], [.04, .14, .04], [0, 0, Math.PI / 2]);
  const body = new THREE.Mesh(b.build(), lam); body.castShadow = true; g.add(body);
  const wings = [];
  for (const s of [-1, 1]) { const w = new GB(rn); w.box(col, [0, 0, .17 * s], [.13, .014, .34]); w.box('#2c3a52', [-.02, 0, .32 * s], [.1, .016, .08]); const m = new THREE.Mesh(w.build(), lam); m.castShadow = true; g.add(m); wings.push(m); }
  return { group: g, wings };
}
export function makeFish(rn, col) {
  const g = new THREE.Group(), b = new GB(rn);
  b.add(G.oct, col, [0, 0, 0], [.22, .09, .07]); b.add(G.oct, col, [-.24, 0, 0], [.09, .11, .02], [0, 0, .5]); b.add(G.tet, '#f4f0e6', [0, .08, 0], [.05, .06, .02], [0, 0, 0]);
  const m = new THREE.Mesh(b.build(), lam); m.castShadow = true; g.add(m); return { group: g };
}
