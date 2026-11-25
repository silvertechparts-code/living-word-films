"""Build subs16.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':0.8,'b1':4.9,'b2':13.3,'c1':18.2,'c2':23.9,'c3':29.1,'c4':33.8,'d1':38.6,'d2':44.9,'e1':50.9,'e2':55.6,'h1':61.0,'h2':66.2,'h3':71.2,'h4':78.0,'i':85.3}
_B = json.load(open('/home/claude/batch/episodes/ep16/lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
FORCE = {
 'a1':['അബ്രാമിന്റെ ഭാര്യ സാറായിക്ക്','അപ്പോഴും കുഞ്ഞുണ്ടായിരുന്നില്ല.'],
 'b1':['സാറായി പറഞ്ഞു: കർത്താവ്','എന്നെ പ്രസവിക്കുന്നതിൽനിന്നു','തടഞ്ഞിരിക്കുന്നു. അതുകൊണ്ട്','അവൾ തന്റെ ഈജിപ്തുകാരി ദാസി','ഹാഗാറിനെ അബ്രാമിനു നൽകി.'],
 'b2':['ഹാഗാർ ഗർഭിണിയായി;','അവൾ തന്റെ യജമാനത്തിയെ','നിന്ദിക്കാൻ തുടങ്ങി.'],
 'c1':['സാറായി ഹാഗാറിനോടു','കഠിനമായി പെരുമാറി;','ഹാഗാർ മരുഭൂമിയിലേക്ക്','ഓടിപ്പോയി.'],
 'c2':['ഷൂരിലേക്കുള്ള വഴിയിലെ','ഒരു നീരുറവയ്ക്കരികെ','കർത്താവിന്റെ ദൂതൻ','അവളെ കണ്ടെത്തി.'],
 'c3':['അവൻ ചോദിച്ചു: ഹാഗാർ,','നീ എവിടെനിന്നു വരുന്നു?','എവിടേക്കു പോകുന്നു?'],
 'c4':['അവൾ മറുപടി പറഞ്ഞു:','ഞാൻ എന്റെ യജമാനത്തി','സാറായിയുടെ അടുത്തുനിന്ന്','ഓടിപ്പോകുകയാണ്.'],
 'd1':['തിരികെ പോകാൻ ദൂതൻ അവളോടു','പറഞ്ഞു; എന്നിട്ടു വാഗ്ദാനം ചെയ്തു:','നിന്റെ സന്തതി','എണ്ണാനാവാത്തവിധം പെരുകും.'],
 'd2':['നീ ഒരു പുത്രനെ പ്രസവിക്കും;','അവനെ ഇസ്മായേൽ','എന്നു വിളിക്കണം; കർത്താവ്','നിന്റെ കഷ്ടത കേട്ടിരിക്കുന്നു.'],
 'e1':['ഹാഗാർ കർത്താവിന്','ഒരു പേരു നൽകി:','അങ്ങ് എന്നെ കാണുന്ന ദൈവം.'],
 'e2':['ഹാഗാർ അബ്രാമിന്','ഒരു മകനെ പ്രസവിച്ചു;','അബ്രാം അവനെ ഇസ്മായേൽ','എന്നു വിളിച്ചു.'],
 'h1':['ഹാഗാർ അധികാരമില്ലാത്ത','ഒരു ദാസിയായിരുന്നു;','മരുഭൂമിയിൽ ഒറ്റയ്ക്ക്.'],
 'h2':['എങ്കിലും ദൈവം അവളെ അവിടെ','കണ്ടെത്തി, പേരു ചൊല്ലി വിളിച്ചു.'],
 'h3':['അവൾ ദൈവത്തിനു പേരു നൽകി:','എന്നെ കാണുന്നവൻ.','അവിടുത്തേക്ക് ആരും അദൃശ്യരല്ല.'],
 'h4':['ആരും നിന്നെ കാണുന്നില്ലെന്നു','തോന്നിയാലും,','ദൈവം നിന്നെ കാണുന്നു;','നിന്റെ നിലവിളി കേൾക്കുന്നു.'],
 'i':['ഇന്ന് നിന്റെ ചുറ്റുമുള്ള','ആരെയാണ് നീ കാണേണ്ടത്?'],
}
# card sizes (lines per card) where a card must hold one line
GROUPS = {'a1':[2],'b1':[2,2,1],'b2':[1,2],'c1':[2,2],'c2':[2,2],'c3':[2,1],'c4':[2,2],'d1':[2,2],'d2':[2,2],'e1':[2,1],'e2':[2,2],'h1':[2,1],'h2':[2],'h3':[2,1],'h4':[2,2],'i':[2]}
# clip-relative end of the first card, where the speech has a clear pause (measured from the real clips)
SPLIT = {}
ENDS = {'a1':[2.9],'b1':[3.38,6.4,7.28],'b2':[1.3,3.52],'c1':[2.0,4.51],'c2':[2.0,4.04],'c3':[2.3,3.55],'c4':[2.2,3.43],'d1':[2.9,5.05],'d2':[2.4,4.68],'e1':[1.7,3.58],'e2':[1.85,3.76],'h1':[2.1,3.78],'h2':[2.65],'h3':[2.5,4.4],'h4':[1.7,3.42],'i':[2.1]}
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
    d=len(sf.read(f'/home/claude/vo/out_ep16/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep16/{k}.wav').samplerate
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
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs16.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', max(max(r['w']) for r in res))
