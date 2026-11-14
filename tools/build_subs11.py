"""Build subs11.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':1.0,'b1':4.51,'c1':11.8,'c2':16.66,'c3':21.64,'c4':25.9,'d1':31.99,'d2':36.35,'d3':41.09,'e1':44.54,'e2':49.96,'e3':55.27,'h1':61.0,'h2':65.6,'h3':71.6,'h4':78.6,'i':85.3}
_B = json.load(open('/home/claude/batch/ep11_lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
FORCE = {
 'c1':['പിന്നെ അവർ പറഞ്ഞു:','ആകാശത്തോളം എത്തുന്ന','ഒരു ഗോപുരമുള്ള നഗരം പണിയാം.'],
 'c4':['അവിടുന്ന് ഒരു ജനതയും','ഒരു ഭാഷയും കണ്ടു;','അവരുടെ ഭാഷ','കലക്കിക്കളയാം എന്നു പറഞ്ഞു.'],
 'e2':['തേരഹിന്റെ മകൻ അബ്രാമിന്റെ ഭാര്യ','സാറായിക്കു','കുഞ്ഞുണ്ടായിരുന്നില്ല.'],
 'e3':['തേരഹ് അവരെ ഊരിൽ നിന്ന്','കാനാനിലേക്കു നയിച്ചു;','പക്ഷേ അവർ','ഹാരാനിൽ താമസമാക്കി.'],
 'h3':['അഹങ്കാരം കാണപ്പെടാൻ','ഗോപുരം പണിയുന്നു;','വിശ്വാസം ദൈവത്തെ','പണിയാൻ അനുവദിക്കുന്നു.'],
 'h4':['ഇന്ന് നിന്റെ പേരിനു വേണ്ടി മാത്രമല്ല,','ദൈവത്തിനു വേണ്ടിയും പണിയുക.'],
}
# card sizes (lines per card) where a card must hold one line
GROUPS = {'c1':[1,2],'e2':[1,2]}
# clip-relative end of the first card, where the speech has a clear pause (measured from the real clips)
SPLIT = {'b1':3.7,'c1':1.5,'c4':2.55,'e1':2.8,'e2':2.7,'e3':2.3,'h2':2.8,'h3':2.0}
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
    pg.goto('file:///home/claude/g11/ep10.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    keys=list(ML); res=pg.evaluate(JS,[[ML[k] for k in keys],MAXW,[FORCE.get(k) for k in keys]]); b.close()
cards=[]
for k,r in zip(keys,res):
    d=len(sf.read(f'/home/claude/vo/out_ep11/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep11/{k}.wav').samplerate
    t0=PLACE[k]; L=r['lines']; sz=GROUPS.get(k) or [2]*((len(L)+1)//2); groups=[]; p_=0
    for n_ in sz: groups.append(L[p_:p_+n_]); p_+=n_
    ch=[sum(len(x) for x in g) for g in groups]
    if k in SPLIT and len(groups)>1:
        ends=[SPLIT[k]]; rest=sum(ch[1:]); acc=0
        for c in ch[1:]: acc+=c; ends.append(SPLIT[k]+(d-SPLIT[k])*acc/rest)
    else:
        tot=sum(ch); acc=0; ends=[]
        for c in ch: acc+=c; ends.append(d*acc/tot)
    prev=0
    for n,(g,e) in enumerate(zip(groups,ends)):
        a=t0+prev; bb=t0+e; last=n==len(groups)-1
        cards.append({'a':round(a+(.03 if n else 0),2),'b':round(bb+(.3 if last else -.03),2),'t':'|'.join(g),'clip':k}); prev=e
    print(k,round(d,2),[x for x in r['w']])
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs11.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', max(max(r['w']) for r in res))
