#!/usr/bin/env python3
# Derives the Genesis 35 reflection (time-warped to the Ep35 narration), question card, subtitle drawer, build script and debug scripts from the Ep31 files.
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25): the same terrace and road; one person alone; Ep31 timings are warped onto the Ep35 narration
s = open(S + 'src/reflect31.js').read()
L = s.split('\n')
hdr = [
 "// Episode 35, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together (h1, \"Before returning to Bethel, Jacob's household put away their other gods.\");",
 "// the road quietly begins to glow (h2, \"Jacob said God had been with him wherever he went.\"); the person lifts their head into soft golden light (h3, \"Let go of what you hold in God's place, and return to where you first met him.\");",
 "// they open their hands and take one step out along the lit road (h4, \"Today, name one thing to put down.\"). Cinematic interpretation: the person, the house and the road are a picture for today and are not in Scripture; they are not a biblical figure, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode by a time-warp (W35) from the Ep31 timings onto the Ep35 narration; there is no second person."]
assert L[4].startswith('import * as THREE')
L = hdr + L[4:]
s = '\n'.join(L)
s = rep(s, "export const RT = { t0: 60, end: 85 };",
"""export const RT = { t0: 60, end: 85 };
// Ep35 time -> Ep31 set time (h1 61.8->61.4, h2 68.0->66.9, h3 73.0->72.4, h4 79.6->79.0, question 85->86.1); IW35 is the inverse
const WP = [[60, 60], [61.8, 61.4], [68.0, 66.9], [73.0, 72.4], [79.6, 79.0], [85, 86.1], [90, 91.1]];
const wmap = (t, f, o) => { const n = WP.length; if (t <= WP[0][f]) return t - WP[0][f] + WP[0][o]; for (let i = 1; i < n; i++) if (t <= WP[i][f]) { const a = WP[i - 1], b = WP[i]; return a[o] + (b[o] - a[o]) * (t - a[f]) / (b[f] - a[f]); } return t - WP[n - 1][f] + WP[n - 1][o]; };
export const W35 = t => wmap(t, 0, 1), IW35 = t => wmap(t, 1, 0);""")
s = rep(s, "  function update(lt, t, cam, camPos) {\n", "  function update(lt, t, cam, camPos) {\n    t = W35(t);\n")
s = rep(s, "B.group.visible = t < 75.0;", "B.group.visible = false;")
s = rep(s, "].map(k => ({ fov: FOV, dy: DYY, ...k, t: k.t - RT.t0 }));", "].map(k => ({ fov: FOV, dy: DYY, ...k, t: (k.t === 85.0 ? 85.0 : IW35(k.t)) - RT.t0 }));")
s = rep(s, "  return { group: g, update, light, bg, cam,", "  light.forEach(k => { k[0] = IW35(k[0]); }); bg.forEach(k => { k[0] = IW35(k[0]); });\n  return { group: g, update, light, bg, cam,")
s = rep(s, "sunElev: t => lerp(14, 20, smooth(60, 80, t))", "sunElev: t => lerp(14, 20, smooth(60, 80, W35(t)))")
s = s.replace("Episode 31", "Episode 35")
open(S + 'src/reflect35.js', 'w').write(s)

# ---- question card: three lines (WHAT DO YOU / NEED TO / LET GO OF?)
s = open(S + 'src/end31.js').read()
s = rep(s, "// Episode 31 final card (question: What are you carrying that no one sees?)", "// Episode 35 final card (question: What do you need to let go of?)")
old = """  cineTitle(cx, t, ['WHAT ARE YOU'], 85.4, 89.9, { ...q, size: 70, y: 410, color: P.cream });
  cineTitle(cx, t, ['CARRYING'], 85.95, 89.9, { ...q, size: 100, y: 520, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['THAT NO ONE'], 86.5, 89.9, { ...q, size: 70, y: 615, color: P.cream });
  cineTitle(cx, t, ['SEES?'], 87.0, 89.9, { ...q, size: 100, y: 725, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHAT DO YOU'], 85.4, 89.9, { ...q, size: 76, y: 430, color: P.cream });
  cineTitle(cx, t, ['NEED TO'], 85.95, 89.9, { ...q, size: 76, y: 540, color: P.cream });
  cineTitle(cx, t, ['LET GO OF?'], 86.5, 89.9, { ...q, size: 112, y: 665, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end35.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs31.js').read()
s = s.replace("subs31.json", "subs35.json").replace("Episode 31", "Episode 35")
open(S + 'src/subs35.js', 'w').write(s)

# ---- build script
s = open(S + 'build31.sh').read()
s = s.replace('main31.js', 'main35.js').replace('bundle31.js', 'bundle35.js').replace('ep31.html', 'ep35.html').replace('Episode 31 - Genesis 31', 'Episode 35 - Genesis 35').replace('Episode 31', 'Episode 35')
open(S + 'build35.sh', 'w').write(s)

# ---- debug scripts
import os
os.makedirs('/home/claude/ep35_qc', exist_ok=True)
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '34.py').read()
    s = s.replace('ep34', 'ep35').replace('main34', 'main35')
    open(S + n + '35.py', 'w').write(s)
print('ok')
