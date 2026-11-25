"""Build subs19.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':0.8,'b1':6.2,'b2':11.2,'c1':16.2,'c2':22.0,'c3':25.0,'d1':33.0,'d2':36.8,'e1':41.2,'e2':46.2,'e3':50.4,'h1':61.0,'h2':65.4,'h3':71.0,'h4':78.0,'i':85.3}
_B = json.load(open('/home/claude/batch/episodes/ep19/lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
# One entry per card (clip-relative end time in ENDS, taken from the pauses measured in the real clips); the Malayalam wording is NEVER changed: the chunks must join back to the lines.json text.
CHUNKS = {
 'a1':['സന്ധ്യയ്ക്ക് രണ്ടു ദൂതന്മാർ സോദോമിലെത്തി;','ലോത്ത് അവരെ തന്റെ വീട്ടിലേക്കു സ്വീകരിച്ചു.'],
 'b1':['ആ രാത്രി നഗരത്തിലെ പുരുഷന്മാർ വീടു വളഞ്ഞ്','ലോത്തിന്റെ അതിഥികളെ വിട്ടുകൊടുക്കണമെന്ന് ആവശ്യപ്പെട്ടു.'],
 'b2':['ദൂതന്മാർ ലോത്തിനെ അകത്തേക്കു വലിച്ചു;','ജനക്കൂട്ടത്തെ അന്ധതകൊണ്ടു ബാധിച്ചു.'],
 'c1':['അവർ പറഞ്ഞു: ഈ നഗരം നശിപ്പിക്കാൻ','കർത്താവ് ഞങ്ങളെ അയച്ചിരിക്കുന്നു;','നിന്റെ കുടുംബത്തെയും കൂട്ടി പുറപ്പെടുക.'],
 'c2':['അവന്റെ മരുമക്കൾ അതു തമാശയായി കരുതി.'],
 'c3':['പ്രഭാതത്തിൽ ലോത്ത് മടിച്ചുനിന്നു.','കർത്താവിന്റെ കരുണയാൽ ദൂതന്മാർ അവരുടെ കൈകൾ പിടിച്ച്','അവരെ പുറത്തേക്കു നയിച്ചു.'],
 'd1':['മലകളിലേക്ക് ഓടിപ്പോകുക;','തിരിഞ്ഞുനോക്കരുത് എന്ന് അവർ പറഞ്ഞു.'],
 'd2':['സൂര്യൻ ഉദിച്ചപ്പോൾ','ലോത്ത് സോവാർ എന്ന ചെറിയ പട്ടണത്തിലെത്തി.'],
 'e1':['അപ്പോൾ കർത്താവ് സോദോമിന്റെയും','ഗൊമോറായുടെയും മേൽ ഗന്ധകവും തീയും വർഷിച്ചു.'],
 'e2':['ലോത്തിന്റെ ഭാര്യ തിരിഞ്ഞുനോക്കി;','അവൾ ഉപ്പുതൂണായി.'],
 'e3':['രാവിലെ അബ്രാഹം','സമതലത്തിൽനിന്നു പുക ഉയരുന്നതു കണ്ടു.','ദൈവം അബ്രാഹത്തെ ഓർത്ത്','ലോത്തിനെ രക്ഷപ്പെടുത്തി.'],
 'h1':['ലോത്ത് മടിച്ചു;','എങ്കിലും ദൂതന്മാർ അവന്റെ കൈ പിടിച്ചു.'],
 'h2':['അതാണു കരുണ:','നമ്മൾ പൂർണമായി വിട്ടുകൊടുക്കുംമുമ്പേ','ദൈവം നമ്മെ പുറത്തേക്കു വലിക്കുന്നു.'],
 'h3':['യേശു പറഞ്ഞു: ലോത്തിന്റെ ഭാര്യയെ ഓർക്കുവിൻ.','ദൈവം നിന്നെ വിടുവിച്ചതിലേക്കു വീണ്ടും തിരിഞ്ഞുനോക്കരുത്.'],
 'h4':['ഇന്ന് മുന്നോട്ട് ഒരു ചുവടു വയ്ക്കുക.'],
 'i':['ഉപേക്ഷിക്കാൻ ദൈവം നിന്നോട്','ആവശ്യപ്പെടുന്നത് എന്താണ്?'],
}
ENDS = {'a1':[2.3,4.51],'b1':[2.73,4.37],'b2':[1.99,4.13],'c1':[1.9,3.27,5.09],'c2':[2.1],'c3':[2.17,5.03,6.83],'d1':[1.59,2.79],'d2':[1.99,3.32],'e1':[1.7,3.84],'e2':[1.45,3.08],'e3':[0.95,3.87,5.6,7.25],'h1':[1.23,3.48],'h2':[1.14,2.4,3.98],'h3':[2.79,6.02],'h4':[1.8],'i':[1.1,2.29]}
HOLD = {'i':1.6}   # the question card stays up while the question is on screen
for k in ML: assert ' '.join(CHUNKS[k])==ML[k].strip(), ('chunks do not rejoin to the approved text', k)
MAXW = 850; LIM = 860   # 10 px inside the 860 rule
JS = """(a)=>{const [texts,maxw,force]=a; const cx=document.createElement('canvas').getContext('2d'); cx.font='800 52px "Anek Malayalam", sans-serif';
 const W=s=>Math.ceil(cx.measureText(s).width);
 const STOP=new Set(['പക്ഷേ','ഒരു','എന്നാൽ','എങ്കിലും','എന്റെ','നിന്റെ','അവന്റെ','തന്റെ','പിന്നെ','പിന്നീട്','അവൻ','അവന്റെ','അതുകൊണ്ട്','എങ്കിലും','ഈ','ആ','ഒരു']);
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
bad=[(it[0],it[1],rr['lines']) for it,rr in zip(items,res) if len(rr['lines'])>2]
print('TOO LONG:',bad)
cards=[]; widest=0
for k in keys:
    d=len(sf.read(f'/home/claude/vo/out_ep19/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep19/{k}.wav').samplerate
    t0=PLACE[k]; ends=ENDS[k]; assert len(ends)==len(CHUNKS[k]); assert abs(ends[-1]-d)<.06,(k,ends[-1],d); prev=0
    for n,((kk,i,c),r) in enumerate([(it,rr) for it,rr in zip(items,res) if it[0]==k]):
        L=r['lines']; assert len(L)<=2,('more than 2 lines',k,L); widest=max(widest,max(r['w']))
        a=t0+prev; bb=t0+ends[n]; last=n==len(ends)-1
        cards.append({'a':round(a+(.03 if n else 0),2),'b':round(bb+((.3+HOLD.get(k,0)) if last else -.03),2),'t':'|'.join(L),'clip':k}); prev=ends[n]
        print(k,n,r['w'],'|'.join(L))
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs19.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', widest)
