"""Parse one episode out of the approved weekly script batch doc.
Usage: python3 tools/parse_batch.py <batch.md> <episode number>
Writes living-word-films/episodes/epNN/{lines.json,caption.txt} and vo/epNN_lines.json (speed 0.95).
"""
import re, sys, json, os
src, ep = sys.argv[1], int(sys.argv[2])
txt = open(src, encoding='utf-8').read()
m = re.search(r'^## Episode %d — (Genesis \d+): (.+)$' % ep, txt, re.M)
assert m, 'episode not found'
chapter, title = m.group(1), m.group(2).strip()
start = m.end(); nxt = re.search(r'^## Episode \d+', txt[start:], re.M)
sec = txt[start: start + nxt.start()] if nxt else txt[start:]
hook = re.search(r'\*\*On-screen title:\*\*\s*(.+?)\s{2,}·', sec).group(1).replace(' / ', '|').strip()
def table(after, nextmark):
    a = sec.index(after); b = sec.index(nextmark, a) if nextmark else len(sec)
    rows = []
    for ln in sec[a:b].splitlines():
        if ln.startswith('|') and not ln.startswith('|---') and not ln.startswith('| id') :
            c = [x.strip() for x in ln.strip().strip('|').split('|')]
            if len(c) == 3: rows.append({'id': c[0], 'en': c[1], 'ml': c[2]})
    return rows
story = table('**Story, 0:00', '**Reflection, 1:00')
refl = table('**Reflection, 1:00', '**Question, 1:25')
q = table('**Question, 1:25', '**Caption draft**')
assert len(q) == 1 and q[0]['id'] == 'i'
cap = sec[sec.index('**Caption draft**') + len('**Caption draft**'):]
cap = cap.split('\n---')[0].strip('\n')
paras = [p.strip() for p in cap.split('\n\n') if p.strip()]
assert len(paras) == 7, len(paras)
caption = {'hook': paras[0], 'story': paras[1], 'reflection': paras[2], 'malayalam': paras[3], 'ask': paras[4], 'episode_line': paras[5]}
tags = paras[6]
d = {'episode': ep, 'chapter': chapter, 'title': title, 'hook': hook, 'story': story, 'reflection': refl, 'question': q[0], 'tags': tags, 'caption': caption}
root = '/home/claude/living-word-films'
os.makedirs(f'{root}/episodes/ep{ep}', exist_ok=True)
json.dump(d, open(f'{root}/episodes/ep{ep}/lines.json', 'w'), ensure_ascii=False, indent=1)
open(f'{root}/episodes/ep{ep}/caption.txt', 'w', encoding='utf-8').write('\n\n'.join(paras) + '\n')
vo = [[r['id'], 0.95, r['en']] for r in story + refl + [q[0]]]
json.dump(vo, open(f'/home/claude/vo/ep{ep}_lines.json', 'w'), ensure_ascii=False)
json.dump(vo, open(f'{root}/vo/ep{ep}_lines.json', 'w'), ensure_ascii=False)
print(ep, chapter, title, hook, len(story), len(refl), 'story words', sum(len(r['en'].split()) for r in story), 'refl', sum(len(r['en'].split()) for r in refl))
