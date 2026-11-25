"""Build subs23.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':0.6,'a2':8.25,'b1':12.09,'b2':19.7,'c1':25.87,'c2':31.93,'c3':36.36,'d1':40.38,'d2':46.7,'e1':51.89,'e2':56.45,'h1':61.4,'h2':67.8,'h3':72.6,'h4':78.4,'i':85.3}
_B = json.load(open('/home/claude/living-word-films/episodes/ep23/lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
# One entry per card (clip-relative end time in ENDS, taken from the pauses measured in the real clips: tools/pauses.py); the Malayalam wording is NEVER changed: the chunks must join back to the lines.json text.
CHUNKS = {
 'a1':['കിര്യത്ത്-അർബാ എന്ന ഹെബ്രോണിൽ,','കാനാനിൽവച്ച് സാറാ മരിച്ചു.','അവൾക്കു നൂറ്റിയിരുപത്തിയേഴു വയസ്സായിരുന്നു.'],
 'a2':['അബ്രാഹം സാറായെക്കുറിച്ചു വിലപിക്കാനും കരയാനും വന്നു.'],
 'b1':['പിന്നെ അവൻ ഹിത്യരുടെ മുമ്പിൽ നിന്നു പറഞ്ഞു:','ഞാൻ നിങ്ങളുടെ ഇടയിൽ ഒരു പരദേശിയും അതിഥിയുമാണ്.','എനിക്കു സ്വന്തമായി ഒരു ശ്മശാനഭൂമി തരുക.'],
 'b2':['അവർ മറുപടി പറഞ്ഞു: നീ ഞങ്ങളുടെ ഇടയിൽ ഒരു പ്രഭുവാണ്.','ഞങ്ങളുടെ ഏറ്റവും നല്ല കല്ലറയിൽ നിന്റെ മരിച്ചവരെ അടക്കുക.'],
 'c1':['അബ്രാഹം അവരെ വണങ്ങി;','എഫ്രോന്റെ വയലിന്റെ അറ്റത്തുള്ള മക്പേലാ ഗുഹ ചോദിച്ചു.'],
 'c2':['എഫ്രോൺ പറഞ്ഞു: വയലും ഗുഹയും എടുത്തുകൊള്ളുക;','ഞാൻ അതു നിനക്കു തരുന്നു.'],
 'c3':['എന്നാൽ മുഴുവൻ വിലയും കൊടുക്കണമെന്ന്','അബ്രാഹം നിർബന്ധിച്ചു.'],
 'd1':['എഫ്രോൺ പറഞ്ഞു: നാനൂറു ശേക്കൽ വെള്ളി.','അതു നമ്മുടെ ഇടയിൽ എന്ത്?','നിന്റെ മരിച്ചവരെ അടക്കുക.'],
 'd2':['നഗരവാതിൽക്കൽ എല്ലാവരുടെയും മുമ്പിൽവച്ച്','അബ്രാഹം വെള്ളി തൂക്കിക്കൊടുത്തു.'],
 'e1':['വയലും ഗുഹയും അതിലെ വൃക്ഷങ്ങളും അബ്രാഹത്തിന്റേതായി.'],
 'e2':['അവിടെ അവൻ തന്റെ ഭാര്യ','സാറായെ മമ്രേക്ക് എതിർവശത്ത് അടക്കി.'],
 'h1':['ദൈവം വാഗ്ദാനം ചെയ്ത ദേശത്ത് അബ്രാഹം ഒരു പരദേശിയായിരുന്നു;','അവൻ തന്റെ ഭാര്യയെ ഓർത്തു വിലപിച്ചു.'],
 'h2':['അവൻ കരഞ്ഞു; പിന്നെ എഴുന്നേറ്റ് സ്നേഹം ആവശ്യപ്പെട്ടതു ചെയ്തു.'],
 'h3':['ദുഃഖവും വിശ്വാസവും ഒരുമിച്ചു നിൽക്കും.','കണ്ണുനീർ വിശ്വാസക്കുറവല്ല.'],
 'h4':['ഇന്ന് നീ ഓർക്കുന്ന ഒരാളെ ഒരു സ്നേഹപ്രവൃത്തികൊണ്ട് ആദരിക്കുക.'],
 'i':['നീ ഓർക്കുന്ന ആളുകളെ നീ എങ്ങനെ ആദരിക്കുന്നു?'],
}
ENDS = {'a1':[2.1,4.3,6.85],'a2':[2.64],'b1':[1.78,4.46,6.81],'b2':[2.52,5.07],'c1':[1.23,5.26],'c2':[2.58,3.73],'c3':[1.9,3.12],'d1':[2.86,4.33,5.52],'d2':[2.0,4.19],'e1':[3.66],'e2':[1.66,2.77],'h1':[3.46,4.83],'h2':[2.95],'h3':[1.75,3.8],'h4':[2.93],'i':[1.88]}
HOLD = {'i':1.6,'e2':0.5}   # the question card stays up while the question is on screen; the burial line lingers
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
    d=len(sf.read(f'/home/claude/vo/out_ep23/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep23/{k}.wav').samplerate
    t0=PLACE[k]; ends=ENDS[k]; assert len(ends)==len(CHUNKS[k]); assert abs(ends[-1]-d)<.06,(k,ends[-1],d); prev=0
    for n,((kk,i,c),r) in enumerate([(it,rr) for it,rr in zip(items,res) if it[0]==k]):
        L=r['lines']; assert len(L)<=2,('more than 2 lines',k,L); widest=max(widest,max(r['w']))
        a=t0+prev; bb=t0+ends[n]; last=n==len(ends)-1
        cards.append({'a':round(a+(.03 if n else 0),2),'b':round(bb+((.3+HOLD.get(k,0)) if last else -.03),2),'t':'|'.join(L),'clip':k}); prev=ends[n]
        print(k,n,r['w'],'|'.join(L))
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs23.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', widest)
