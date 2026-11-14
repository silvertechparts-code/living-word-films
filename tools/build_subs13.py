"""Build subs13.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':1.0,'b1':7.0,'b2':12.4,'c1':16.0,'c2':21.8,'d1':27.0,'d2':32.4,'d3':35.7,'e1':41.5,'e2':46.4,'e3':51.2,'e4':54.0,'h1':61.0,'h2':65.8,'h3':71.6,'h4':78.6,'i':85.3}
_B = json.load(open('/home/claude/batch/ep13_lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
FORCE = {
 'a1':['അബ്രാം ഈജിപ്തിൽ നിന്നു മടങ്ങി;','കാലിക്കൂട്ടങ്ങളും വെള്ളിയും','പൊന്നും കൊണ്ട് സമ്പന്നനായി.'],
 'c2':['ദേശം മുഴുവൻ നിന്റെ മുമ്പിലുണ്ട്.','നീ ഇടത്തോട്ടു പോയാൽ','ഞാൻ വലത്തോട്ടു പോകാം.'],
 'd1':['ലോത്ത് ജോർദാൻ സമതലം കണ്ടു;','കർത്താവിന്റെ തോട്ടം പോലെ','ജലസമൃദ്ധം.'],
 'd3':['എന്നാൽ സോദോമിലെ ആളുകൾ','ദുഷ്ടരായിരുന്നു;','കർത്താവിനെതിരെ','വലിയ പാപികൾ.'],
 'e2':['നീ കാണുന്ന ദേശമെല്ലാം','ഞാൻ നിനക്കും നിന്റെ സന്തതിക്കും','എന്നേക്കും തരും.'],
}
# card sizes (lines per card) where a card must hold one line
GROUPS = {'a1':[1,2],'c2':[1,2],'d1':[1,2],'d3':[2,2],'e2':[1,2]}
# clip-relative end of the first card, where the speech has a clear pause (measured from the real clips)
SPLIT = {}
ENDS = {'a1':[1.65,4.36],'b1':[2.05,4.37],'c1':[3.7,4.81],'c2':[1.7,3.84],'d1':[1.75,4.56],'d3':[1.9,4.07],'e1':[2.3,4.02],'e2':[1.25,4.12],'e4':[2.1,4.39],'h1':[1.7,2.78],'h2':[1.85,4.61],'h3':[1.7,4.73]}
MAXW = 850; LIM = 860   # 10 px inside the 860 rule
JS = """(a)=>{const [texts,maxw,force]=a; const cx=document.createElement('canvas').getContext('2d'); cx.font='800 52px "Anek Malayalam", sans-serif';
 const W=s=>Math.ceil(cx.measureText(s).width);
 const STOP=new Set(['പക്ഷേ','ഒരു','എന്നാൽ','എങ്കിലും','എന്റെ','നിന്റെ','അവന്റെ','തന്റെ','പിന്നെ','പിന്നീട്','അവൻ','അവന്റെ','അതുകൊണ്ട്','എങ്കിലും']);
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
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':1920},device_scale_factor=1)
    pg.goto('file:///home/claude/g11/ep11.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    keys=list(ML); res=pg.evaluate(JS,[[ML[k] for k in keys],MAXW,[FORCE.get(k) for k in keys]]); b.close()
cards=[]
for k,r in zip(keys,res):
    d=len(sf.read(f'/home/claude/vo/out_ep13/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep13/{k}.wav').samplerate
    t0=PLACE[k]; L=r['lines']; sz=GROUPS.get(k) or [2]*((len(L)+1)//2); groups=[]; p_=0
    for n_ in sz: groups.append(L[p_:p_+n_]); p_+=n_
    ch=[sum(len(x) for x in g) for g in groups]
    if k in SPLIT and len(groups)>1:
        ends=[SPLIT[k]]; rest=sum(ch[1:]); acc=0
        for c in ch[1:]: acc+=c; ends.append(SPLIT[k]+(d-SPLIT[k])*acc/rest)
    else:
        tot=sum(ch); acc=0; ends=[]
        for c in ch: acc+=c; ends.append(d*acc/tot)
    if k in ENDS: ends=ENDS[k]
    prev=0
    for n,(g,e) in enumerate(zip(groups,ends)):
        a=t0+prev; bb=t0+e; last=n==len(groups)-1
        cards.append({'a':round(a+(.03 if n else 0),2),'b':round(bb+(.3 if last else -.03),2),'t':'|'.join(g),'clip':k}); prev=e
    print(k,round(d,2),[x for x in r['w']])
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs13.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', max(max(r['w']) for r in res))
