#!/usr/bin/env python3
# Derives the Genesis 33 reflection (time-warped to the Ep33 narration), question card, subtitle drawer, build script and debug scripts from the Ep31 files.
import re
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25): the same terrace and road; one person alone, no passer-by; Ep31 timings are warped onto the Ep33 narration
s = open(S + 'src/reflect31.js').read()
L = s.split('\n')
hdr = [
 "// Episode 33, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Jacob prepared for the worst: gifts, a plan, and seven bows.\");",
 "// the road quietly begins to glow (h2, \"Esau did not wait for any of it. He ran to Jacob, and they wept.\"); the person lifts their head into soft golden light (h3, \"The brother Jacob feared was the first to run.\");",
 "// they open their hands and take one step out along the lit road toward the dawn (h4, \"Today, take one step toward someone you have been avoiding.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W33) from the Ep31 timings onto the Ep33 narration; there is no second person."]
assert L[4].startswith('import * as THREE')
L = hdr + L[4:]
s = '\n'.join(L)
s = rep(s, "export const RT = { t0: 60, end: 85 };",
"""export const RT = { t0: 60, end: 85 };
// Ep33 time -> Ep31 set time (h1 61.4, h2 66.9, h3 72.4, h4 78.0->79.0, question 85->86.1); IW33 is the inverse
const WP = [[60, 60], [61.4, 61.4], [66.9, 66.9], [72.4, 72.4], [78.0, 79.0], [85, 86.1], [90, 91.1]];
const wmap = (t, f, o) => { const n = WP.length; if (t <= WP[0][f]) return t - WP[0][f] + WP[0][o]; for (let i = 1; i < n; i++) if (t <= WP[i][f]) { const a = WP[i - 1], b = WP[i]; return a[o] + (b[o] - a[o]) * (t - a[f]) / (b[f] - a[f]); } return t - WP[n - 1][f] + WP[n - 1][o]; };
export const W33 = t => wmap(t, 0, 1), IW33 = t => wmap(t, 1, 0);""")
s = rep(s, "  function update(lt, t, cam, camPos) {\n", "  function update(lt, t, cam, camPos) {\n    t = W33(t);\n")
s = rep(s, "B.group.visible = t < 75.0;", "B.group.visible = false;")
s = rep(s, "].map(k => ({ fov: FOV, dy: DYY, ...k, t: k.t - RT.t0 }));", "].map(k => ({ fov: FOV, dy: DYY, ...k, t: (k.t === 85.0 ? 85.0 : IW33(k.t)) - RT.t0 }));")
s = rep(s, "  return { group: g, update, light, bg, cam,", "  light.forEach(k => { k[0] = IW33(k[0]); }); bg.forEach(k => { k[0] = IW33(k[0]); });\n  return { group: g, update, light, bg, cam,")
s = rep(s, "sunElev: t => lerp(14, 20, smooth(60, 80, t))", "sunElev: t => lerp(14, 20, smooth(60, 80, W33(t)))")
s = s.replace("Episode 31", "Episode 33")
open(S + 'src/reflect33.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end31.js').read()
s = rep(s, "// Episode 31 final card (question: What are you carrying that no one sees?)", "// Episode 33 final card (question: Who do you need to make peace with?)")
old = """  cineTitle(cx, t, ['WHAT ARE YOU'], 85.4, 89.9, { ...q, size: 70, y: 410, color: P.cream });
  cineTitle(cx, t, ['CARRYING'], 85.95, 89.9, { ...q, size: 100, y: 520, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['THAT NO ONE'], 86.5, 89.9, { ...q, size: 70, y: 615, color: P.cream });
  cineTitle(cx, t, ['SEES?'], 87.0, 89.9, { ...q, size: 100, y: 725, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHO DO YOU NEED'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['TO MAKE PEACE'], 85.95, 89.9, { ...q, size: 100, y: 540, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['WITH?'], 86.6, 89.9, { ...q, size: 100, y: 650, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end33.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs31.js').read()
s = s.replace("subs31.json", "subs33.json").replace("Episode 31", "Episode 33")
open(S + 'src/subs33.js', 'w').write(s)

# ---- build script
s = open(S + 'build31.sh').read()
s = s.replace('main31.js', 'main33.js').replace('bundle31.js', 'bundle33.js').replace('ep31.html', 'ep33.html').replace('Episode 31 - Genesis 31', 'Episode 33 - Genesis 33').replace('Episode 31', 'Episode 33')
open(S + 'build33.sh', 'w').write(s)

# ---- debug scripts
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '31.py').read()
    s = s.replace('ep31', 'ep33').replace('main31', 'main33')
    open(S + n + '33.py', 'w').write(s)
print('ok')
