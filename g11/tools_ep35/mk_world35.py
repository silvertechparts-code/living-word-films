#!/usr/bin/env python3
# Assembles g11/src/world35.js
exec(open('/home/claude/g11/tools_ep35/mk_world35_a.py').read())
exec(open('/home/claude/g11/tools_ep35/mk_world35_b.py').read())
CONSTS = rep(CONSTS, "export const OAK = [-2.7, -2.9]" if False else "OAK = [-2.7, -2.9]", "OAK = [-3.0, -2.0]")
CONSTS = rep(CONSTS, "export const PIL = [-1.0, .05];", "export const PIL = [-1.1, .45];")
NEWPROPS = rep(NEWPROPS, "  { const b = new GB(rng(352)); b.box('#8a4a3c'", "  let rRug; { const b = new GB(rng(352)); b.box('#8a4a3c'")
NEWPROPS = rep(NEWPROPS, "[.7, .02, .5], [0, 0, 0], .02); ca.add(meshOf(b)); }", "[.7, .02, .5], [0, 0, 0], .02); rRug = meshOf(b); ca.add(rRug); }")
TORCHES = between("  const TX = GX - .34", "  // ---- the animals the sons drive out")
out = HEADER + IMPORTS + "\n" + CONSTS + "\n" + TERRAIN + STAGE + WALK + PEOPLE + MC1 + CITYB + TORCHES + NEWPROPS + MC2 + SKY + PEOPLE2 + ANIMH + CHOREO + "\n" + UPDATE + LIGHT
open(SRC + 'world35.js', 'w').write(out)
print('wrote', len(out), 'bytes', out.count('\n'), 'lines')
