"""Build subs43.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1': 0.6, 'a2': 7.7, 'b1': 17.1, 'b2': 26.2, 'c1': 31.3, 'c2': 42.4, 'd1': 48.7, 'd2': 54.1, 'h1': 61.8, 'h2': 67.6, 'h3': 73.0, 'h4': 78.8, 'i': 85.3}
_B = json.load(open('/home/claude/batch43/ep43_lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [dict(_B['question'], id='i')]}
# One entry per card; the split is given as the number of Malayalam words per card (the wording is NEVER changed: the cards are cut from the approved lines.json text).
# ENDS = clip-relative card end time: the midpoint of the pauses measured in the real clips (tools/pauses.py).
SPLIT = {'a1':[2,4,6],'a2':[2,3,3,9],'b1':[2,4,2,8],'b2':[4,5],'c1':[4,2,3,6,3],'c2':[6,6],'d1':[2,4,4],'d2':[7,4],'h1':[6,6],'h2':[7,6],'h3':[5],'h4':[6],'i':[4]}
CHUNKS = {}
for k, sp in SPLIT.items():
    ws = ML[k].strip().split(' '); assert sum(sp) == len(ws), (k, sum(sp), len(ws)); o = 0; CHUNKS[k] = []
    for n in sp: CHUNKS[k].append(' '.join(ws[o:o + n])); o += n
ENDS = {'a1':[1.51,3.84,5.85],'a2':[0.86,2.46,4.51,8.14],'b1':[1.47,3.59,4.71,7.76],'b2':[1.96,3.86],'c1':[2.52,3.75,6.0,8.41,9.84],'c2':[2.96,4.95],'d1':[1.37,2.73,4.2],'d2':[2.68,5.75],'h1':[2.2,5.06],'h2':[2.42,3.92],'h3':[2.34],'h4':[3.42],'i':[1.87]}
HOLD = {'i':1.6,'h4':1.2}   # the question card stays up while the question is on screen
for k in ML: assert ' '.join(CHUNKS[k])==ML[k].strip(), ('chunks do not rejoin to the approved text', k)
MAXW = 850; LIM = 860   # 10 px inside the 860 rule
JS = """async (a)=>{const [texts,maxw,force]=a; await document.fonts.load('800 52px "Anek Malayalam"', texts.join(' ')+' ,;:.?!'); await document.fonts.ready; const cx=document.createElement('canvas').getContext('2d'); cx.font='800 52px "Anek Malayalam", sans-serif';
 const W=s=>Math.ceil(cx.measureText(s).width);
 const STOP=new Set(['പക്ഷേ','ഒരു','എന്നാൽ','എങ്കിലും','എന്റെ','നിന്റെ','അവന്റെ','തന്റെ','നീ','പിന്നെ','പിന്നീട്','അവൻ','അവന്റെ','അതുകൊണ്ട്','എല്ലാ','അതിലെ','എങ്കിലും','ഈ','ആ','ഒരു']);
 const PUNCT=/[,;:.?!]$/;
 const greedy=(t,mw)=>{const ws=t.split(' '),L=[];let cur='';for(const w of ws){const n=cur?cur+' '+w:w; if(W(n)<=mw||!cur)cur=n; else{L.push(cur);cur=w;}} if(cur)L.push(cur);return L;};
 // every split of the words into n lines (n0, or n0+1 when n0 is odd so that both cards get two lines), each <= maxw;
 // pick the best by reading rules (wording is never changed): no card/line ends on a word that belongs to the next one,
 // prefer breaks after punctuation, avoid one-word orphan lines, keep lines balanced
 const best=(t)=>{const ws=t.split(' '); const n0=greedy(t,maxw).length; let top=null;
  for(const n of [n0]){
   const rec=(i,lines)=>{ if(lines.length===n-1){ const last=ws.slice(i).join(' '); if(!last||W(last)>maxw) return; score([...lines,last]); return; }
    for(let j=i+1;j<ws.length;j++){ const ln=ws.slice(i,j).join(' '); if(W(ln)>maxw) break; rec(j,[...lines,ln]); } };
   const score=(L)=>{ let c=0; const w=L.map(W);
    L.forEach((ln,k)=>{ const last=ln.split(' ').pop(); if(k<L.length-1){ if(STOP.has(last)) c+=1000; if(PUNCT.test(ln)) c-=(k%2===1?500:200); } if(W(ln)<230) c+=400; });
    if(L.length%2===1&&L.length>1) c+=150;
    c+=Math.max(...w)-Math.min(...w);
    if(!top||c<top.c) top={c,L}; };
   rec(0,[]); }
  return top?top.L:greedy(t,maxw); };
 return texts.map((t,i)=>{ const L=force[i]||best(t); return {lines:L, w:L.map(W)}; });}"""
def split_chunk(c, t0, t1):
    ws = c.split(' '); best = None
    for j in range(1, len(ws)):
        l, r = ' '.join(ws[:j]), ' '.join(ws[j:]); cost = abs(len(l) - len(r)) - (40 if l[-1] in ',;:.?!' else 0)
        if best is None or cost < best[0]: best = (cost, l, r)
    _, l, r = best; tm = t0 + (t1 - t0) * len(l) / (len(l) + len(r)); return (l, tm), (r, t1)
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':1920},device_scale_factor=1)
    pg.goto('file://' + os.environ.get('SUBS_PAGE', '/home/claude/g11/ep43.html') + '?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    keys=list(ML)
    for rnd in range(4):   # cards whose text needs more than two lines are split in two; their end time is interpolated by character count
        items=[(k,i,c) for k in keys for i,c in enumerate(CHUNKS[k])]
        res=pg.evaluate(JS,[[c for _,_,c in items],MAXW,[None]*len(items)])
        bad_=[(it[0],it[1]) for it,rr in zip(items,res) if len(rr['lines'])>2]
        if not bad_: break
        for k in keys:
            nc=[]; ne=[]; prev=0
            for i,(c,e) in enumerate(zip(CHUNKS[k],ENDS[k])):
                if (k,i) in bad_: (l,tm),(r,te)=split_chunk(c,prev,e); nc+=[l,r]; ne+=[round(tm,2),e]; print('split',k,i,'->',l,'|',r)
                else: nc.append(c); ne.append(e)
                prev=e
            CHUNKS[k]=nc; ENDS[k]=ne
    # merge phase (added after the first Ep40 build had 55 cards, 14 under 1 s and two under 0.4 s): a card shorter than MINDUR is joined to its shorter neighbour when the joined text still fits in two lines of <= MAXW px
    MINDUR, MAXDUR = 1.0, 3.6
    fits = lambda text: len(pg.evaluate(JS, [[text], MAXW, [None]])[0]['lines']) <= 2
    for k in keys:
        changed = True
        while changed:
            changed = False; starts = [0] + ENDS[k][:-1]; durs = [e - s_ for s_, e in zip(starts, ENDS[k])]
            for i in sorted(range(len(durs)), key=lambda i: durs[i]):
                if durs[i] >= MINDUR: break
                for j in sorted([j for j in (i - 1, i + 1) if 0 <= j < len(durs)], key=lambda j: durs[j]):
                    lo, hi = min(i, j), max(i, j); text = CHUNKS[k][lo] + ' ' + CHUNKS[k][hi]
                    if durs[lo] + durs[hi] <= MAXDUR and fits(text):
                        print('merge', k, lo, hi, '->', text); CHUNKS[k][lo:hi + 1] = [text]; ENDS[k][lo:hi + 1] = [ENDS[k][hi]]; changed = True; break
                if changed: break
    items = [(k, i, c) for k in keys for i, c in enumerate(CHUNKS[k])]
    res = pg.evaluate(JS, [[c for _, _, c in items], MAXW, [None] * len(items)])
    b.close()
bad=[(it[0],it[1],rr['lines']) for it,rr in zip(items,res) if len(rr['lines'])>2]
print('TOO LONG:'); [print('  ',b) for b in bad]
cards=[]; widest=0
for k in keys:
    d=len(sf.read(f'/home/claude/vo/out_ep43/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep43/{k}.wav').samplerate
    t0=PLACE[k]; ends=ENDS[k]; assert len(ends)==len(CHUNKS[k]); assert abs(ends[-1]-d)<.06,(k,ends[-1],d); prev=0
    for n,((kk,i,c),r) in enumerate([(it,rr) for it,rr in zip(items,res) if it[0]==k]):
        L=r['lines']; assert len(L)<=2,('more than 2 lines',k,L); widest=max(widest,max(r['w']))
        a=t0+prev; bb=t0+ends[n]; last=n==len(ends)-1
        cards.append({'a':round(a+(.03 if n else 0),2),'b':round(bb+((.3+HOLD.get(k,0)) if last else -.03),2),'t':'|'.join(L),'clip':k}); prev=ends[n]
        print(k,n,r['w'],'|'.join(L))
for x, y in zip(cards, cards[1:]): assert x['b'] <= y['a'] + 1e-6, ('overlap', x, y)
for k in keys: assert ' '.join(CHUNKS[k]) == ML[k].strip(), ('merged chunks do not rejoin to the approved text', k)
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs43.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', widest)
