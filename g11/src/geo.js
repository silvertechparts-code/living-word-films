import * as THREE from 'three';
// Merge many primitives into ONE flat-shaded, vertex-coloured BufferGeometry (low-poly look).
const mk = (g, ty = 0) => { g.translate(0, ty, 0); return g; };
export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cone5: mk(new THREE.ConeGeometry(1, 1, 5, 1), .5),
  cone6: mk(new THREE.ConeGeometry(1, 1, 6, 1), .5),
  cone7: mk(new THREE.ConeGeometry(1, 1, 7, 1), .5),
  cyl6: mk(new THREE.CylinderGeometry(1, 1, 1, 6, 1), .5),
  cylT: mk(new THREE.CylinderGeometry(.6, 1, 1, 6, 1), .5),
  ico0: new THREE.IcosahedronGeometry(1, 0),
  ico1: new THREE.IcosahedronGeometry(1, 1),
  ico2: new THREE.IcosahedronGeometry(1, 2),
  oct: new THREE.OctahedronGeometry(1, 0),
  tet: new THREE.TetrahedronGeometry(1, 0),
};
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
export function mat(p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0]) {
  _e.set(r[0], r[1], r[2], 'YXZ'); _q.setFromEuler(_e); _p.set(...p); _s.set(...s);
  return new THREE.Matrix4().compose(_p, _q, _s);
}
export class GB {
  constructor(rnd) { this.p = []; this.c = []; this.rnd = rnd || Math.random; }
  add(geo, col, p, s, r, jit = 0.07) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (typeof s === 'number') s = [s, s, s];
    g.applyMatrix4(mat(p, s || [1, 1, 1], r || [0, 0, 0]));
    const pos = g.attributes.position, n = pos.count, base = new THREE.Color(col);
    for (let i = 0; i < n; i += 3) {
      const j = 1 + (this.rnd() - .5) * 2 * jit;
      for (let k = 0; k < 3; k++) { this.p.push(pos.getX(i + k), pos.getY(i + k), pos.getZ(i + k)); this.c.push(base.r * j, base.g * j, base.b * j); }
    }
    g.dispose(); return this;
  }
  box(col, p, s, r, jit) { return this.add(G.box, col, p, s, r, jit); }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.computeVertexNormals(); g.computeBoundingSphere(); return g;
  }
}
// bake a lit look into vertex colours (for unlit MeshBasic bodies: sun, moon, stars, cloud in the sky)
export function bake(geo, colA, colB, lightDir, jit, rnd, bias = 0.0, power = 1) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  g.computeVertexNormals();
  const pos = g.attributes.position, nor = g.attributes.normal, n = pos.count, cA = new THREE.Color(colA), cB = new THREE.Color(colB);
  const L = new THREE.Vector3(...lightDir).normalize(), cols = [], c = new THREE.Color();
  for (let i = 0; i < n; i += 3) {
    const nx = (nor.getX(i) + nor.getX(i + 1) + nor.getX(i + 2)) / 3, ny = (nor.getY(i) + nor.getY(i + 1) + nor.getY(i + 2)) / 3, nz = (nor.getZ(i) + nor.getZ(i + 1) + nor.getZ(i + 2)) / 3;
    let k = Math.max(0, Math.min(1, (nx * L.x + ny * L.y + nz * L.z) * .5 + .5 + bias)); k = Math.pow(k, power);
    k = Math.max(0, Math.min(1, k + (rnd() - .5) * jit));
    c.copy(cB).lerp(cA, k);
    for (let q = 0; q < 3; q++) cols.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); return g;
}
