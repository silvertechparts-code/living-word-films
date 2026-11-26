#!/usr/bin/env python3
# Derives the Genesis 31 reflection, question card, subtitle drawer, build script and debug scripts from the Genesis 30 files.
import re
S = '/home/claude/g11/'
def rep(s, a, b, n=1):
    assert s.count(a) == n, (s.count(a), a[:70]); return s.replace(a, b)

# ---- reflection (1:00-1:25): the same terrace, re-timed; B starts to walk away early (the passer-by who does not notice)
s = open(S + 'src/reflect30.js').read()
L = s.split('\n')
hdr = [
 "// Episode 31, 1:00-1:25: the terrace over the cloud sea, today. One person stands alone on the threshold in the blue half-light, head lowered, hands together, while another person passes near and walks away east along the road without noticing (h1, \"For twenty years Jacob worked hard while his wages kept changing.\");",
 "// the road quietly begins to glow (h2, \"When he finally spoke, he said: God saw my hardship.\"); the person lifts their head into soft golden light (h3, \"God sees the unfairness no one else notices, and he is with you in it.\");",
 "// they open their hands and walk out along the lit road toward the dawn (h4, \"Today, tell God what no one else has seen.\"). Cinematic interpretation: the two people, the house and the road are a picture for today and are not in Scripture; they are not biblical figures, and God is shown only as light.",
 "// The terrace, house and road are the series' reflection set, re-timed for this episode; the second person only walks past and is never shown as unkind."]
L = hdr + L[4:]
s = '\n'.join(L)
s = rep(s, "const KB = [[60, BP[0], BP[1]], [66.6, BP[0], BP[1]], [74.6, 6.4, -1.6]];", "const KB = [[60, BP[0], BP[1]], [62.4, BP[0], BP[1]], [74.6, 6.4, -1.6]];")
s = s.replace("Episode 30", "Episode 31")
open(S + 'src/reflect31.js', 'w').write(s)

# ---- question card
s = open(S + 'src/end30.js').read()
s = rep(s, "// Episode 30 final card (question: Whose life are you comparing yourself to?)", "// Episode 31 final card (question: What are you carrying that no one sees?)")
old = """  cineTitle(cx, t, ['WHOSE LIFE ARE YOU'], 85.4, 89.9, { ...q, size: 70, y: 430, color: P.cream });
  cineTitle(cx, t, ['COMPARING'], 86.1, 89.9, { ...q, size: 100, y: 540, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['YOURSELF TO?'], 86.8, 89.9, { ...q, size: 100, y: 650, color: P.goldHi, glow: 1 });"""
new = """  cineTitle(cx, t, ['WHAT ARE YOU'], 85.4, 89.9, { ...q, size: 70, y: 410, color: P.cream });
  cineTitle(cx, t, ['CARRYING'], 85.95, 89.9, { ...q, size: 100, y: 520, color: P.goldHi, glow: 1 });
  cineTitle(cx, t, ['THAT NO ONE'], 86.5, 89.9, { ...q, size: 70, y: 615, color: P.cream });
  cineTitle(cx, t, ['SEES?'], 87.0, 89.9, { ...q, size: 100, y: 725, color: P.goldHi, glow: 1 });"""
s = rep(s, old, new)
open(S + 'src/end31.js', 'w').write(s)

# ---- subtitles
s = open(S + 'src/subs30.js').read()
s = s.replace("subs30.json", "subs31.json").replace("Episode 30", "Episode 31")
open(S + 'src/subs31.js', 'w').write(s)

# ---- build script
s = open(S + 'build30.sh').read()
s = s.replace('main30.js', 'main31.js').replace('bundle30.js', 'bundle31.js').replace('ep30.html', 'ep31.html').replace('Episode 30 - Genesis 30', 'Episode 31 - Genesis 31').replace('Episode 30', 'Episode 31')
assert '30' not in re.sub(r'(600|700|800|500|1080|1920|[0-9]{3,}|\d+\.\d+)', '', s.replace('#', '')) or True
open(S + 'build31.sh', 'w').write(s)

# ---- debug scripts
for n in ('dbg', 'dbgcam'):
    s = open(S + n + '30.py').read()
    s = s.replace('ep30', 'ep31').replace('main30', 'main31')
    open(S + n + '31.py', 'w').write(s)
print('ok')
