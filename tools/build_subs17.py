"""Build subs17.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':0.8,'b1':8.3,'b2':13.4,'c1':18.5,'c2':24.4,'d1':30.7,'d2':35.9,'d3':42.7,'e1':49.3,'e2':53.5,'e3':56.9,'h1':61.0,'h2':65.8,'h3':71.2,'h4':76.6,'i':85.3}
_B = json.load(open('/home/claude/batch/episodes/ep17/lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
# One entry per card (clip-relative end time in ENDS, measured from the real clips' pauses); the Malayalam wording is NEVER changed: the chunks must join back to the lines.json text.
CHUNKS = {
 'a1':['തൊണ്ണൂറ്റിയൊൻപതാം വയസ്സിൽ അബ്രാം കർത്താവിന്റെ വാക്കു കേട്ടു:','ഞാൻ സർവശക്തനായ ദൈവം;','എന്റെ മുമ്പാകെ നടക്കുക, നിഷ്കളങ്കനായിരിക്കുക.'],
 'b1':['അബ്രാം സാഷ്ടാംഗം വീണു. ദൈവം അരുളിച്ചെയ്തു:','ഞാൻ നിന്നോട് എന്റെ ഉടമ്പടി ചെയ്യുന്നു.'],
 'b2':['നീ അനേകം ജനതകളുടെ പിതാവാകും.','നിന്റെ പേര് അബ്രാഹം എന്നായിരിക്കും.'],
 'c1':['ഞാൻ നിന്റെയും നിന്റെ സന്തതിയുടെയും ദൈവമായിരിക്കും,','എന്നേക്കും; കാനാൻ ദേശം അവരുടേതാകും.'],
 'c2':['ഉടമ്പടിയുടെ അടയാളം:','അബ്രാഹത്തിന്റെ ഭവനത്തിലെ എല്ലാ പുരുഷന്മാരും','പരിച്ഛേദനം ചെയ്യപ്പെടണം.'],
 'd1':['ദൈവം സാറായിയുടെയും പേരു മാറ്റി:','അവൾ സാറാ ആയിരിക്കും; ജനതകളുടെ മാതാവ്.'],
 'd2':['അബ്രാഹം സാഷ്ടാംഗം വീണു ചിരിച്ചു:','നൂറു വയസ്സുള്ള പുരുഷനും','തൊണ്ണൂറു വയസ്സുള്ള സ്ത്രീക്കും കുഞ്ഞുണ്ടാകുമോ?'],
 'd3':['ദൈവം പറഞ്ഞു: സാറാ നിനക്ക് ഒരു പുത്രനെ പ്രസവിക്കും;','അവനെ ഇസഹാക്ക് എന്നു വിളിക്കണം;','എന്റെ ഉടമ്പടി അവനോടു കൂടെയായിരിക്കും.'],
 'e1':['ഇസ്മായേലും അനുഗ്രഹിക്കപ്പെടും;','അവൻ ഒരു വലിയ ജനതയാകും.'],
 'e2':['അടുത്ത വർഷം ഈ സമയത്ത് ഇസഹാക്ക് ജനിക്കും.'],
 'e3':['അന്നുതന്നെ ദൈവം കൽപിച്ചതെല്ലാം അബ്രാഹം ചെയ്തു.'],
 'h1':['വാഗ്ദാനം നിറവേറുംമുമ്പേ ദൈവം അബ്രാമിന്റെ പേരു മാറ്റി.'],
 'h2':['ഒരു കുഞ്ഞിനായി കാത്തിരിക്കുമ്പോൾത്തന്നെ','അവനെ അനേകം ജനതകളുടെ പിതാവ് എന്നു വിളിച്ചു.'],
 'h3':['ദൈവം നമ്മെ കാണുന്നത് നമ്മുടെ ഭൂതകാലം കൊണ്ടല്ല,','തന്റെ വാഗ്ദാനം കൊണ്ടാണ്.'],
 'h4':['ഇന്ന് നീ നിന്നെക്കുറിച്ചു പറയുന്നതിനെക്കാൾ,','ദൈവം നിന്നെക്കുറിച്ചു പറയുന്നതു വിശ്വസിക്കുക.'],
 'i':['ദൈവം നിന്നെക്കുറിച്ചു പറഞ്ഞതിൽ നീ ഏതാണു സംശയിക്കുന്നത്?'],
}
ENDS = {'a1':[2.45,4.36,6.53],'b1':[2.6,4.18],'b2':[2.2,4.14],'c1':[2.6,4.94],'c2':[1.5,4.0,5.29],'d1':[1.97,4.27],'d2':[1.97,3.7,5.84],'d3':[2.72,4.15,5.65],'e1':[1.71,3.31],'e2':[2.49],'e3':[2.66],'h1':[3.48],'h2':[2.23,4.22],'h3':[1.87,3.15],'h4':[2.76,4.67],'i':[2.22]}
for k in ML: assert ' '.join(CHUNKS[k])==ML[k].strip(), ('chunks do not rejoin to the approved text', k)
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
    keys=list(ML); items=[(k,i,c) for k in keys for i,c in enumerate(CHUNKS[k])]
    res=pg.evaluate(JS,[[c for _,_,c in items],MAXW,[None]*len(items)]); b.close()
cards=[]; widest=0
for k in keys:
    d=len(sf.read(f'/home/claude/vo/out_ep17/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep17/{k}.wav').samplerate
    t0=PLACE[k]; ends=ENDS[k]; assert len(ends)==len(CHUNKS[k]); assert abs(ends[-1]-d)<.06,(k,ends[-1],d); prev=0
    for n,((kk,i,c),r) in enumerate([(it,rr) for it,rr in zip(items,res) if it[0]==k]):
        L=r['lines']; assert len(L)<=2,('more than 2 lines',k,L); widest=max(widest,max(r['w']))
        a=t0+prev; bb=t0+ends[n]; last=n==len(ends)-1
        cards.append({'a':round(a+(.03 if n else 0),2),'b':round(bb+(.3 if last else -.03),2),'t':'|'.join(L),'clip':k}); prev=ends[n]
        print(k,n,r['w'],'|'.join(L))
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs17.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', widest)
