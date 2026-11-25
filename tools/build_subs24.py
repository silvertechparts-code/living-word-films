"""Build subs24.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':0.6,'b1':8.9,'b2':12.6,'c1':21.9,'c2':29.8,'d1':35.2,'e1':43.0,'e2':48.4,'h1':61.4,'h2':66.7,'h3':72.4,'h4':79.2,'i':85.3}
_B = json.load(open('/home/claude/living-word-films/episodes/ep24/lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
# One entry per card (clip-relative end time in ENDS = midpoint of the pauses measured in the real clips: tools/pauses.py); the Malayalam wording is NEVER changed: the chunks must join back to the lines.json text.
CHUNKS = {
 'a1':['അബ്രാഹം വൃദ്ധനായിരുന്നു.','അവൻ തന്റെ ഏറ്റവും മുതിർന്ന ദാസനോടു പറഞ്ഞു:','എന്റെ മകൻ ഇസഹാക്കിന്','എന്റെ സ്വന്തം കുടുംബത്തിൽനിന്ന്','ഒരു ഭാര്യയെ കണ്ടെത്തുക.'],
 'b1':['ദാസൻ പത്ത് ഒട്ടകങ്ങളുമായി','സന്ധ്യാസമയത്ത് ഒരു കിണറ്റിനരികെ എത്തി.'],
 'b2':['അവൻ പ്രാർഥിച്ചു: കർത്താവേ,','എനിക്കു വെള്ളം തരികയും എന്റെ ഒട്ടകങ്ങൾക്കും','വെള്ളം നൽകാമെന്നു പറയുകയും ചെയ്യുന്ന യുവതി,','ഇസഹാക്കിനായി അങ്ങു തിരഞ്ഞെടുത്തവളായിരിക്കട്ടെ.'],
 'c1':['അവൻ പ്രാർഥന തീരുംമുമ്പേ','റബേക്കാ കുടവുമായി വന്നു.','അവൾ അവനു കുടിക്കാൻ കൊടുത്തു;','പത്ത് ഒട്ടകങ്ങൾക്കും വെള്ളം കോരിക്കൊടുത്തു.'],
 'c2':['അവൻ കുമ്പിട്ടു:','എന്റെ യജമാനന്റെ കുടുംബത്തിലേക്ക്','എന്നെ നയിച്ച കർത്താവു വാഴ്ത്തപ്പെട്ടവൻ.'],
 'd1':['അവളുടെ കുടുംബം പറഞ്ഞു:','ഇതു കർത്താവിൽനിന്നുള്ളതാണ്.','അവർ റബേക്കായോടു ചോദിച്ചു:','നീ ഈ മനുഷ്യനോടുകൂടെ പോകുമോ?','അവൾ പറഞ്ഞു: ഞാൻ പോകാം.'],
 'e1':['സന്ധ്യയ്ക്ക് ഇസഹാക്ക് വയലിലൂടെ നടക്കുമ്പോൾ','ഒട്ടകങ്ങൾ വരുന്നതു കണ്ടു.'],
 'e2':['ഇസഹാക്ക് അവളെ തന്റെ അമ്മ','സാറായുടെ കൂടാരത്തിലേക്കു കൊണ്ടുവന്നു.','അവൻ അവളെ സ്നേഹിച്ചു;','അമ്മയുടെ മരണശേഷം അവനു ആശ്വാസം ലഭിച്ചു.'],
 'h1':['ദാസൻ ദൈവത്തോടു ഒരു അടയാളം ചോദിച്ചു;','ദയയ്ക്കായി കാത്തിരുന്നു.'],
 'h2':['റബേക്കാ ഒരു അപരിചിതനു വെള്ളം നൽകാമെന്നു പറഞ്ഞു;','അവന്റെ എല്ലാ ഒട്ടകങ്ങൾക്കും നൽകി.'],
 'h3':['സാധാരണ ദയയിലൂടെ ദൈവം പലപ്പോഴും നമ്മെ നയിക്കുന്നു;','നാം ചോദിച്ചു തീരുംമുമ്പേ നമ്മെ കേൾക്കുന്നു.'],
 'h4':['ഇന്ന് വഴിനടത്തിപ്പിനായി പ്രാർഥിക്കുക;','നീ ആയിരിക്കുന്നിടത്ത് ദയ കാണിക്കുക.'],
 'i':['ഇന്ന് ആരുടെ പ്രാർഥനയ്ക്കു നിന്റെ ദയ ഉത്തരമാകും?'],
}
ENDS = {'a1':[1.45,3.54,5.3,6.25,7.11],'b1':[1.3,2.59],'b2':[1.6,4.08,6.1,8.03],'c1':[1.03,3.0,4.75,6.71],'c2':[.93,2.0,3.98],'d1':[1.05,2.34,3.6,5.7,6.36],'e1':[2.55,4.06],'e2':[1.6,2.87,4.11,6.42],'h1':[2.18,3.8],'h2':[2.45,3.98],'h3':[3.25,5.41],'h4':[1.6,3.08],'i':[2.24]}
HOLD = {'i':1.6,'e2':0.3,'d1':0.9}   # the question card stays up while the question is on screen; 'I will' lingers
for k in ML: assert ' '.join(CHUNKS[k])==ML[k].strip(), ('chunks do not rejoin to the approved text', k)
MAXW = 850; LIM = 860   # 10 px inside the 860 rule
JS = """async (a)=>{const [texts,maxw,force]=a; await document.fonts.load('800 52px "Anek Malayalam"', texts.join(' ')+' ,;:.?!'); await document.fonts.ready; const cx=document.createElement('canvas').getContext('2d'); cx.font='800 52px "Anek Malayalam", sans-serif';
 const W=s=>Math.ceil(cx.measureText(s).width);
 const STOP=new Set(['പക്ഷേ','ഒരു','എന്നാൽ','എങ്കിലും','എന്റെ','നിന്റെ','അവന്റെ','തന്റെ','നീ','പിന്നെ','പിന്നീട്','അവൻ','അവന്റെ','അതുകൊണ്ട്','എങ്കിലും','ഈ','ആ','ഒരു']);
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
print('TOO LONG:'); [print('  ',b) for b in bad]
cards=[]; widest=0
for k in keys:
    d=len(sf.read(f'/home/claude/vo/out_ep24/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep24/{k}.wav').samplerate
    t0=PLACE[k]; ends=ENDS[k]; assert len(ends)==len(CHUNKS[k]); assert abs(ends[-1]-d)<.06,(k,ends[-1],d); prev=0
    for n,((kk,i,c),r) in enumerate([(it,rr) for it,rr in zip(items,res) if it[0]==k]):
        L=r['lines']; assert len(L)<=2,('more than 2 lines',k,L); widest=max(widest,max(r['w']))
        a=t0+prev; bb=t0+ends[n]; last=n==len(ends)-1
        cards.append({'a':round(a+(.03 if n else 0),2),'b':round(bb+((.3+HOLD.get(k,0)) if last else -.03),2),'t':'|'.join(L),'clip':k}); prev=ends[n]
        print(k,n,r['w'],'|'.join(L))
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs24.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', widest)
