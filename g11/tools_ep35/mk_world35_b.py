# second half of the world35 generator (choreography, update, light, return). exec'd by mk_world35.py after mk_world35_a.py
BASE = between("  const PW = [...PATH].reverse();", "  // Dinah and her two friends")

CHOREO = BASE + r"""
  // ---- who goes where. Phases, each with its own cast: P1 camp, oak and the road east | P2 Bethel | P3 the road back west to the lone tent | P4 the bier and the pillar | P5 Isaac in the camp | P6 the bier carried away
  const T2 = 21.7, T3 = 29.9, T4 = 46.5, T5 = 52.9, T6 = 57.0, T7 = 61.8;
  const mixA = (...o) => { const r = { a0z: -.1, a1z: .1 }; for (const x of o) for (const k in x) r[k] = (r[k] || 0) + x[k]; return r; };
  const aF = k => k > .001 ? { a0x: -.9 * k, a1x: -.9 * k, a0z: .35 * k, a1z: -.35 * k } : {};      // hands together in front: giving, holding, carrying
  const aU = k => k > .001 ? { a0x: -2.35 * k, a1x: -2.35 * k, a0z: -.2 * k, a1z: .2 * k } : {};      // arms raised
  const aO = k => k > .001 ? { a0x: -.6 * k, a1x: -.6 * k, a0z: -.95 * k, a1z: .95 * k } : {};        // hands open to the sides
  const toward = (x, z, p) => headZ(p[0] - x, p[1] - z);
  const RING = i => { const a = (i * 45 + 20) * Math.PI / 180; return [HEAP[0] + .86 * Math.cos(a), HEAP[1] + .86 * Math.sin(a)]; };
  const OAKF = [OAK[0] - .5, OAK[1] + .25];                                  // where Jacob kneels at the foot of the oak
  const GIVE = [8.7, 9.15, 9.6, 10.05, 10.5, 10.95, 11.4, 11.6];            // when each of the eight at the cloth lays something down (35:4)
  const pairPath = (t0, v, W, d) => { const n = W.length, un = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; };
    const f = route(t0, W[0]); for (let i = 1; i < n; i++) f.go(v, W[i]);
    const u0 = un(W[0], W[1]), uN = un(W[n - 2], W[n - 1]), r = route(t0, [W[0][0] - d * u0[0], W[0][1] - d * u0[1]]);
    for (let i = 1; i < n - 1; i++) r.go(v, W[i]); r.go(v, [W[n - 1][0] - d * uN[0], W[n - 1][1] - d * uN[1]]);
    return { f: f.keys, r: r.keys }; };                                        // two bearers d apart on one path, arriving together

  // ===== P1 (a1, a2, b1): Jacob in the camp, the household at the cloth, the burial at the oak, the column on the road (35:1-5)
  const RINGERS = [[jacob, 4], [leah, 5], [rachel, 6], [SON.reu, 7], [SON.sim, 0], [bil, 1], [SON.lev, 2], [zil, 3]];
  const HOME = [JD, [-6.3, -.3], [-5.0, -2.3], [-2.4, -1.5], [-2.6, .6], [-3.0, 1.4], [-4.2, -2.3], [-5.2, 1.6]];
  RINGERS.forEach(([f, k], i) => { const rg = RING(k), r = route(0, HOME[i]), so = ((i % 3) - 1) * .25;
    if (i === 0) { r.wait(6.4).go(1.2, rg).wait(11.9).go(1.5, OAKF).wait(14.9).go(1.7, [-3.2, 1.2]); alongE(r, 1.35, 0, -3.0, 3.2); r.go(1.35, [4.3, 2.7]).go(1.35, [5.3, 3.9]); }
    else { r.wait(6.5 + .22 * i).go(1.25, rg).wait(12.6 + .1 * i).go(1.3, [-3.3, 1.2 + so]).wait(15.2 + .18 * i); alongE(r, 1.3, so, -3.0, 3.2); r.go(1.3, [4.3, 2.7 + so]).go(1.3, [5.3, 3.9 + so]); }
    act(f, r.keys, { ph: 1.3 + i * 1.1, sp: i === 0 ? 5.5 : 7, show: W_(0, T2),
      face: (t, p) => { if (p.mv) return null;
        if (i === 0) { if (t < 6.3) return headZ(1, .12); if (t > 7.4 && t < 12.0) return toward(p.x, p.z, HEAP); if (t > 13.2 && t < 14.9) return toward(p.x, p.z, OAK); return null; }
        return (t > 7.9 && t < 12.6) ? toward(p.x, p.z, HEAP) : (t < 6.5 ? headZ(1, .1 * i) : null); },
      ex: t => { if (i === 0) { const lay = ON(t, 7.4, 8.0, 10.6, 11.0), kn1 = ON(t, 10.9, 11.3, 11.5, 11.9), kn2 = ON(t, 13.3, 13.7, 14.5, 14.95), dg = kn2 * (.5 + .5 * Math.sin(t * 9));
          return { ...mixA(aO(lay), aF(.6 * kn1 + .9 * dg)), s: 1 - .22 * kn1 - .24 * kn2, lx: .4 * kn1 + .46 * kn2 }; }
        const gv = ON(t, GIVE[i] - .35, GIVE[i], GIVE[i] + .45, GIVE[i] + .85); return { ...mixA(aF(gv)), lx: .12 * gv }; } }); });
  // the others in the camp join the column
  const OTH = [[SON.jud, [-7.9, .2], 0], [SON.dan, [-8.2, 2.0], 1], [SON.gad, [-7.2, -2.4], 2], [SON.iss, [-4.7, -2.3], 0], [CAPW[0], [-7.2, 2.6], 1], [CAPW[1], [-8.1, 2.4], 2], [CAPK[0], [-6.0, 2.4], 0], [CAPK[1], [-5.0, 2.2], 1], [CAPK[2], [-4.5, 2.6], 2], [MEN[0], [-8.8, 1.1], 0], [MEN[1], [-5.1, -2.9], 1], [MEN[2], [-7.0, -2.6], 2]];
  OTH.forEach(([f, h, o], i) => { const off = (o - 1) * .22, r = route(0, h); r.wait(12.4 + .1 * i).go(1.25, [-3.7 - .25 * (i % 3), 1.1 + off + .1 * (i % 2)]).wait(15.2 + .18 * i); alongE(r, 1.3, off, -3.0, 3.2); r.go(1.3, [4.3, 2.7 + off]).go(1.3, [5.3, 3.9 + off]);
    act(f, r.keys, { ph: 4 + i * 1.4, sp: 7, show: W_(0, T2), face: (t, p) => (!p.mv && t < 12.4) ? headZ(1, .15 * (o - 1)) : null, ex: t => ({ lx: .06 * ON(t, 8, 9, 11.5, 12.4) }) }); });
  // the flocks go with them
  const ANIM = [...WHITE, ...GOATS, ...donkeys], AK = new Map();
  ANIM.forEach((a, i) => { const off = ((i % 5) - 2) * .2 + .45, r = route(0, [-5.6 + .35 * (i % 5), 2.4 + .3 * (i % 3)]); r.wait(14.6 + .25 * i).go(1.2, [-3.0, 1.2 + off]); alongE(r, 1.25, off, -2.9, 3.2); r.go(1.25, [4.6, 2.9 + off]).go(1.25, [5.6, 3.9 + off]); AK.set(a, r.keys); });

  // ===== P2 (b2): Bethel (35:6-10): the household climbs the hill, Jacob builds the altar, God appears as light
  const BP = [[jacob, [-.95, -.1]], [leah, [-1.75, .55]], [rachel, [-1.6, -.7]], [SON.reu, [-2.15, -.05]], [SON.sim, [-2.35, .85]], [SON.lev, [-2.5, -.9]], [SON.jud, [-2.95, .1]]];
  BP.forEach(([f, d], i) => { const sp_ = [BETH[0] + d[0], BETH[1] + d[1]], r = route(T2 - .8, [sp_[0] - 2.4, sp_[1] - 1.2]); r.go(1.15 + .02 * i, sp_).wait(T3);
    act(f, r.keys, { ph: 2 + i * 1.5, sp: 6, show: W_(T2, T3), face: (t, p) => !p.mv ? toward(p.x, p.z, BETH) : null,
      ex: t => { if (i === 0) { const lay = ON(t, 22.8, 23.2, 24.8, 25.2), kn = ON(t, 25.2, 25.9, 27.6, 28.1), up = ON(t, 27.4, 28.0, 29.7, 29.95);
          return { ...mixA(aF(.9 * lay + .4 * kn), aU(up)), s: 1 - .22 * kn, lx: .4 * lay + .34 * kn }; }
        const bw = ON(t, 25.4, 26.2, 27.6, 28.2); return { ...mixA(aF(.5 * bw)), lx: .14 * bw }; } }); });

  // ===== P3 (c1, c2): back along the road to the lone tent; Rachel goes in; the midwife; the lamp; the child (35:16-18)
  const CW = [[leah, 0, 1.2, [-.7, 1.75]], [bil, .2, 1.2, [-2.9, 1.65]], [zil, -.2, 1.2, [-3.2, 1.3]], [SON.reu, -.15, 1.1, [1.0, 1.55]], [SON.sim, .2, 1.1, [1.5, .75]], [SON.lev, .35, 1.1, [2.0, 1.4]], [SON.jud, -.3, 1.1, [2.5, .85]]];
  CW.forEach(([f, off, v, fin], i) => { const r = route(T3 + .12 * i, [4.4, 2.6 + off]); r.go(v, [3.4, .9 + off]); along(r, v, off, 3.2, fin[0] + .1); r.go(v, fin).wait(T4);
    act(f, r.keys, { ph: 5 + i * 1.2, sp: 7, show: W_(T3, T4), face: (t, p) => { if (p.mv) return null; if (t > 31.5 && t < T4) return toward(p.x, p.z, i < 3 ? [RACH[0], RACH[1] - .6] : [RACH[0], RACH[1]]); return null; },
      ex: t => { const gr = ON(t, 38.8, 39.8, 46.0, 46.5), bw = ON(t, 41.0, 42.0, 45.6, 46.4); return { ...mixA(), lx: .2 * gr + .08 * bw, s: i < 3 ? 1 - .2 * bw : 1 }; } }); });
  { const r = route(T3, [4.2, 2.5]); r.go(1.25, [3.4, .9]); along(r, 1.25, 0, 3.2, -1.1); r.go(1.0, [-1.4, 1.7]).go(.85, [RDOOR[0] + .1, RDOOR[1] - .05]).go(.8, [RACH[0] - .02, RACH[1] - .2]);
    const tEnd = r.keys[r.keys.length - 1][0];
    act(rachel, r.keys, { ph: 2, sp: 6, show: t => t >= T3 && t < tEnd, ex: t => { const lab = smooth(31.6, 33.2, t); return { ...mixA(aF(.55 * lab)), lx: .14 + .22 * lab }; } }); }
  { const r = route(T3, [4.3, 2.4]); r.go(1.2, [3.4, .9]); along(r, 1.2, 0, 3.2, -.1); r.go(1.0, [-.2, 1.35]).wait(37.2).go(.6, [-.75, 1.5]).wait(38.6).go(.5, [-1.2, 1.5]).wait(41.0).go(.4, [-1.35, 1.5]).wait(T4);
    act(jacob, r.keys, { ph: 6.2, sp: 5.2, show: W_(T3, T4), face: (t, p) => (!p.mv && t > 33.0) ? toward(p.x, p.z, RDOOR) : null,
      ex: t => { const wr = ON(t, 33.6, 34.6, 37.4, 38.2), kn = ON(t, 40.4, 41.6, 43.2, 43.8), hb = ON(t, 43.6, 44.2, 46.2, 46.5); return { ...mixA(aF(.9 * hb + .5 * wr)), s: 1 - .24 * kn, lx: .1 * wr + .38 * kn }; } }); }
  { const r = route(33.3, [RACH[0] - .05, RACH[1] - .15]).go(.9, [RDOOR[0] + RDIR[0] * .5, RDOOR[1] + RDIR[1] * .5]).wait(T4);
    act(mid, r.keys, { ph: 3, sp: 6, show: W_(33.3, T4), face: (t, p) => !p.mv ? headZ(1.5, -.2) : null, ex: t => ({ ...mixA(aO(ON(t, 35.0, 35.8, 37.8, 38.6))), lx: .1 * ON(t, 38.8, 39.6, 41.5, 43) }) }); }

  // ===== P4 (d1): the bier is carried to the roadside, the pillar is raised (35:19-20)
  const BEAR = { d1: pairPath(T4, .8, [[-3.05, 1.5], [-1.25, 1.45]], 1.3), e1: pairPath(T6, .95, [[-3.6, 1.5], [-1.0, 1.15], [.45, 1.2], [2.2, 1.0]], 1.3) };
  [[SON.sim, 'f'], [SON.lev, 'r']].forEach(([f, w], i) => { act(f, BEAR.d1[w], { ph: 1 + i, sp: 6, show: W_(T4, T5), face: (t, p) => (!p.mv && t > 49.0) ? toward(p.x, p.z, PIL) : null,
      ex: t => { const kn = ON(t, 48.7, 49.3, 49.7, 50.6); return { ...mixA(aF(ON(t, 46.4, 46.8, 48.6, 49.1))), s: 1 - .22 * kn, lx: .3 * kn + .18 * ON(t, 50.8, 51.6, 52.6, 52.9) }; } }); });
  { const r = route(T4, [-5.0, 1.45]).go(.8, [-3.3, 1.45]).wait(49.2).go(.9, [-1.75, .8]).wait(T5);
    act(jacob, r.keys, { ph: 6.2, sp: 5.2, show: W_(T4, T5), face: (t, p) => (!p.mv && t > 50.0) ? toward(p.x, p.z, PIL) : null, ex: t => { const pl_ = ON(t, 50.0, 50.6, 52.2, 52.7); return { ...mixA(aF(.5 * pl_)), lx: .22 * pl_ }; } }); }
  [[leah, [-5.7, 1.7], [-4.3, 1.6], [-3.0, 1.05]], [bil, [-6.0, 1.4], [-4.6, 1.3], [-2.75, .5]], [zil, [-6.3, 1.7], [-4.9, 1.65], [-3.25, 1.75]]].forEach(([f, a, b, c], i) => { const r = route(T4, a).go(.8, b).wait(49.4).go(.85, c).wait(T5);
    act(f, r.keys, { ph: 3 + i * 1.4, sp: 6, show: W_(T4, T5), face: (t, p) => (!p.mv && t > 50.0) ? toward(p.x, p.z, PIL) : null, ex: t => ({ lx: .2 * ON(t, 50.0, 51.0, 52.6, 52.9) }) }); });

  // ===== P5 (e1): Jacob comes home to Isaac; Isaac dies (35:27-29)
  const ISP = [-7.0, 2.1];
  act(isaac, route(0, ISP).keys, { ph: 5, sp: 5, show: W_(T5, T6), face: () => headZ(1, -.25), ex: t => ({ ...mixA(aF(.25 * ON(t, 55.4, 56.0, 56.6, 57.0))), s: .72, lx: .05 * Math.sin(t * 1.3) }) });
  { const r = route(T5, [-3.8, 1.7]).go(1.2, [-6.1, 2.05]).wait(T6);
    act(jacob, r.keys, { ph: 6.2, sp: 5.2, show: W_(T5, T6), face: (t, p) => !p.mv ? toward(p.x, p.z, ISP) : null, ex: t => { const kn = ON(t, 55.2, 55.8, 56.8, 57.0); return { ...mixA(aF(.5 * kn)), s: 1 - .24 * kn, lx: .3 * kn }; } }); }
  // ===== P6: Esau and Jacob carry Isaac away (35:29)
  act(esau, BEAR.e1.f, { ph: 1, sp: 6, show: W_(T6, T7), ex: t => mixA(aF(1)) });
  act(jacob, BEAR.e1.r, { ph: 2, sp: 6, show: W_(T6, T7), ex: t => mixA(aF(1)) });
"""

UPDATE_HEAD = between("  function update(t, camera, sid) {", "    const night = ")
SUN = between("    // the low sun behind the subject", "    motes.update(")
RIVER = between("    // ---- the river: day colours", "    // ---- torches at the gate")
TORCH = between("    // ---- torches at the gate", "    // ---- the actors")
TORCH = rep(TORCH, "gk = ON(t, 42.2, 43.6, 47.0, 48.8)", "gk = 0")
TORCH = rep(TORCH, "smooth(38.2, 40.4, t) * (1 - smooth(50.2, 52.6, t))", "smooth(37.6, 39.8, t) * (1 - smooth(50.2, 52.6, t))")
TORCH = rep(TORCH, "campL.intensity = 1.1 * ON(t, 55.5, 58.5, 90, 91) * fl; }", "campL.intensity = 1.1 * night * fl; }")
ACTORS = between("    // ---- the actors: every one is a pure function of time", "    swS.visible")
assert ACTORS.count("    ACT.forEach(a => { a.f.group.visible = false; });") == 1
ACTORS = ACTORS.replace("    ACT.forEach(a => { a.f.group.visible = false; });", "    ALLP.forEach(o => { o.group.visible = false; }); ACT.forEach(a => { a.f.group.visible = false; });")

PROPS = r"""    // ---- what stands where, by time
    { const hk = 1 - smooth(11.4, 11.9, t); heapG.visible = t > 6.3 && hk > .01; cloth.scale.setScalar(Math.max(.01, smooth(6.3, 7.0, t) * hk));
      ITEMS.forEach((m, i) => { const gv = GIVE[i % 8] + .06 * Math.floor(i / 8); m.visible = t > gv; m.scale.setScalar(Math.max(.01, hk * (.4 + .6 * smooth(gv, gv + .35, t)))); });
      bundle.visible = t > 11.6 && t < 14.1; const mk = smooth(14.0, 14.8, t); mound.visible = mk > .01; mound.scale.set(.3 * mk + .001, .07 * mk + .001, .2 * mk + .001);
      stones.forEach((m, i) => { const k = smooth(22.9 + .33 * i, 23.4 + .33 * i, t); m.visible = k > .01; m.scale.setScalar(.2 + .8 * k); });
      const gB = ON(t, 26.2, 27.4, 29.5, 29.9), gJ = ON(t, 1.2, 2.4, 5.2, 6.0);
      shaftB.material.opacity = .6 * gB; shaftB.visible = gB > .005; poolB.material.opacity = .55 * gB; poolB.visible = gB > .005; altarL.intensity = 2.4 * gB * (.92 + .08 * Math.sin(t * 6));
      bethM.update(t, gB, [BETH[0], hC(BETH[0], BETH[1]) + 1.8, BETH[1]]); bethM.mesh.visible = gB > .005;
      shaftJ.material.opacity = .5 * gJ; shaftJ.visible = gJ > .005; poolJ.material.opacity = .5 * gJ; poolJ.visible = gJ > .005; callM.update(t, gJ, [JD[0] + 1.15, hC(JD[0] + 1.15, JD[1]) + 1.6, JD[1] + .1]); callM.mesh.visible = gJ > .005;
      const tentOn = t >= T3 - .05 && t < T5; rTent.visible = tentOn; rRug.visible = tentOn; const lk = smooth(32.5, 36.0, t) * (1 - smooth(48.5, 50.5, t));
      lampG.material.opacity = .8 * lk * fl; lampG2.material.opacity = .7 * lk * fl; lampG.visible = lampG2.visible = lk > .01; lampL.intensity = 2.2 * lk * fl;
      babe.visible = t > 43.8 && t < T4;
      pStones.forEach((m, i) => { const k = smooth(49.3 + .36 * i, 49.8 + .36 * i, t); m.visible = k > .01; m.scale.setScalar(.2 + .8 * k); });
      const carry = (br, kf, kr, on) => { br.visible = on; if (!on) return; const a = kp(t, kf), b = kp(t, kr), x = (a.x + b.x) / 2, z = (a.z + b.z) / 2; br.position.set(x, hC(x, z) + .56, z); br.rotation.y = Math.atan2(-(a.z - b.z), a.x - b.x); };
      carry(bierR, BEAR.d1.f, BEAR.d1.r, t >= T4 && t < 49.7); carry(bierI, BEAR.e1.f, BEAR.e1.r, t >= T6 && t < T7); }
"""
ANIMS = r"""    // ---- the animals
    ANIM.forEach((a, i) => { const K = AK.get(a), p = kp(t, K), on = t < T2; a.group.visible = on; if (!on) return; a.group.position.set(p.x, hC(p.x, p.z) - .02, p.z); a.group.rotation.y = p.mv ? headX(p.vx, p.vz) : headX(1, .2 * Math.sin(i * 2.1));
      const big = i >= 7; if (p.mv) walkLegs(a.legs, t + i * 1.3, big ? 5 : 7, big ? .35 : .5); else walkLegs(a.legs, 0, 0, 0); });
    dustR.update(t, .5 * ON(t, 46.8, 47.6, 48.6, 49.2) + .6 * ON(t, 15.4, 16.4, 20.6, 21.6), [t < T2 ? 1.6 : -1.5, hC(-1.5, 1.4) + .05, t < T2 ? 1.1 : 1.4]);
    state.t = t;
  }
"""
UPDATE = UPDATE_HEAD + """    const night = ON(t, 37.6, 40.6, 46.4, 49.6), fl = .86 + .1 * Math.sin(t * 13.1) + .05 * Math.sin(t * 27.3 + 1);

""" + SUN + """    motes.update(t, .5 * (.3 + .7 * ON(t, 0, 4, 80, 88)) * (1 - .7 * night), [1, .5, 2.5]); dust.update(t, .3 * ON(t, 14.6, 16, 21, 22), [.5, .1, 1.4]);
""" + RIVER + TORCH + PROPS + ACTORS + ANIMS

LIGHT = r"""

  const Dk = (t, hs, hg, hi, sc, si, sd, fi, fc, fd, ss) => [t, LK(hs, hg, hi, sc, si, sd, fi, fc, fd, [0, 0, 0], ss)];
  const FD = [-8, 4, 6];
  const light = [
    Dk(0, '#b8b8c8', '#6a5444', 1.0, '#ffc890', 2.6, [9, 2.8, -5], .5, '#ffcf9a', FD, 14), Dk(12, '#b8b2c8', '#6a5444', 1.0, '#ffbc78', 2.7, [9, 3.2, -5], .5, '#ffcf9a', FD, 14),
    Dk(17, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [9, 3.0, -5], .5, '#ffcf9a', FD, 14), Dk(22.4, '#bcb0c0', '#6a5040', 1.0, '#ffb470', 2.8, [9, 3.0, -5], .5, '#ffcf9a', FD, 14),
    Dk(31, '#bca8b8', '#6a4a3c', 1.0, '#ffa060', 2.8, [10, 2.0, -4], .5, '#ffbc88', FD, 14), Dk(36.5, '#a89ab8', '#5a4448', .95, '#ff9458', 2.4, [10, 1.6, -4], .5, '#ffb480', FD, 14),
    Dk(38.4, '#8a86b0', '#4a3a40', .9, '#ff8a50', 2.0, [10, 1.2, -4], .5, '#ffa878', FD, 14), Dk(41.5, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14),
    Dk(46.0, '#5a6aa8', '#2a2a44', 1.0, '#8aa0f0', 1.5, [9, 5.5, -3], .62, '#7a8cd0', FD, 14), Dk(49.4, '#8a94c4', '#5a4a50', .95, '#ffb088', 2.1, [10, 1.6, -4], .5, '#ffbc98', FD, 14),
    Dk(53, '#b0a8c0', '#6a5446', 1.0, '#ffb470', 2.7, [10, 2.8, -4], .5, '#ffcf9a', FD, 14), Dk(58, '#c8a8a0', '#6a4a3a', 1.0, '#ff9a58', 2.8, [10, 1.5, -4], .5, '#ffbc88', FD, 14), Dk(62, '#c8a8a0', '#6a4a3a', 1.0, '#ff9a58', 2.8, [10, 1.5, -4], .5, '#ffbc88', FD, 14)];
  const bg = [[0, ['#5a86c4', '#f6c890']], [12, ['#5a86c4', '#f6d09a']], [22, ['#5a86c4', '#f6c890']], [31, ['#5a86c4', '#f6c890']], [36.5, ['#5a74b0', '#f4a070']], [38.4, ['#4a5a9a', '#f0905a']], [41.5, ['#0e1636', '#2a3466']], [46, ['#0e1636', '#2a3466']], [49.4, ['#4a5a9a', '#f4a888']], [53, ['#5a7ab8', '#f6b888']], [58, ['#7a78b0', '#f6a068']], [62, ['#7a78b0', '#f6a068']]];
  return { group: g, update, light, bg, far, pl: [altarL, lampL, ...torchL, gateL, campL], state, jacob };
}
"""
