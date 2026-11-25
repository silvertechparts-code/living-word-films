"""Build subs21.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':0.8,'b1':7.9,'b2':9.9,'c1':15.4,'c2':22.8,'d1':30.4,'d2':37.2,'e1':43.4,'e2':50.4,'e3':55.2,'h1':61.4,'h2':66.2,'h3':72.0,'h4':78.4,'i':85.3}
_B = json.load(open('/home/claude/batch/episodes/ep21/lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
# One entry per card (clip-relative end time in ENDS, taken from the pauses measured in the real clips); the Malayalam wording is NEVER changed: the chunks must join back to the lines.json text.
CHUNKS = {
 'a1':['കർത്താവ് തന്റെ വാഗ്ദാനം പാലിച്ചു.','ദൈവം നിശ്ചയിച്ച സമയത്ത്, വാർധക്യത്തിൽ,','സാറാ അബ്രാഹത്തിന് ഒരു മകനെ പ്രസവിച്ചു.'],
 'b1':['അബ്രാഹം അവനെ ഇസഹാക്ക് എന്നു വിളിച്ചു.'],
 'b2':['സാറാ പറഞ്ഞു: ദൈവം എന്നെ ചിരിപ്പിച്ചു;','കേൾക്കുന്നവരെല്ലാം എന്നോടൊപ്പം ചിരിക്കും.'],
 'c1':['ഇസഹാക്ക് മുലകുടി മാറിയപ്പോൾ','ഇസ്മായേൽ അവനോടു കളിക്കുന്നതു കണ്ട് സാറാ പറഞ്ഞു:','ഹാഗാറിനെയും അവളുടെ മകനെയും പറഞ്ഞയയ്ക്കുക.'],
 'c2':['അബ്രാഹം വല്ലാതെ വിഷമിച്ചു;','എന്നാൽ ദൈവം പറഞ്ഞു:','വിഷമിക്കേണ്ട; ഇസ്മായേലിൽനിന്നും ഞാൻ ഒരു ജനതയെ ഉണ്ടാക്കും.'],
 'd1':['പിറ്റേന്നു പുലർച്ചെ','അബ്രാഹം ഹാഗാറിന് അപ്പവും വെള്ളവും കൊടുത്ത്','ബാലനോടൊപ്പം അവളെ പറഞ്ഞയച്ചു.'],
 'd2':['മരുഭൂമിയിൽ വെള്ളം തീർന്നു;','മകൻ മരിക്കുന്നതു കാണാൻ വയ്യാതെ അവൾ കരഞ്ഞു.'],
 'e1':['എന്നാൽ ബാലന്റെ കരച്ചിൽ ദൈവം കേട്ടു.','സ്വർഗത്തിൽനിന്ന് ദൂതൻ വിളിച്ചു:','ഹാഗാർ, ഭയപ്പെടേണ്ട.'],
 'e2':['ദൈവം അവളുടെ കണ്ണു തുറന്നു;','അവൾ ഒരു കിണർ കണ്ടു; ബാലനു വെള്ളം കൊടുത്തു.'],
 'e3':['ബാലൻ വളർന്നപ്പോൾ ദൈവം അവനോടുകൂടെ ഉണ്ടായിരുന്നു.'],
 'h1':['ദൈവം തന്റെ സമയത്ത് സാറായോടുള്ള വാഗ്ദാനം പാലിച്ചു.'],
 'h2':['അതേ അധ്യായത്തിൽത്തന്നെ,','മരുഭൂമിയിൽ ദാഹിച്ചു കരഞ്ഞ ഒരു ബാലനെയും അവൻ കേട്ടു.'],
 'h3':['ദൈവം തന്റെ വാഗ്ദാനങ്ങൾ പാലിക്കുന്നു;','മറക്കപ്പെട്ടവരുടെ നിലവിളിയും കേൾക്കുന്നു.'],
 'h4':['ഇന്ന് പ്രത്യാശയോടെ കാത്തിരിക്കുക;','അവിടുത്തെ സമയത്തിൽ ആശ്രയിക്കുക.'],
 'i':['ദൈവത്തിന്റെ ഏതു വാഗ്ദാനത്തിനായാണ്','നീ ഇപ്പോഴും കാത്തിരിക്കുന്നത്?'],
}
ENDS = {'a1':[1.8,4.4,6.73],'b1':[1.58],'b2':[2.5,4.39],'c1':[1.47,4.3,6.32],'c2':[2.69,4.1,6.46],'d1':[1.24,3.87,5.57],'d2':[2.9,4.94],'e1':[1.96,3.9,5.89],'e2':[1.64,4.14],'e3':[2.12],'h1':[2.98],'h2':[1.36,4.31],'h3':[1.77,4.04],'h4':[1.25,2.44],'i':[1.25,2.44]}
HOLD = {'i':1.6,'b1':0.5,'e3':0.5}   # the question card stays up while the question is on screen
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
    d=len(sf.read(f'/home/claude/vo/out_ep21/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep21/{k}.wav').samplerate
    t0=PLACE[k]; ends=ENDS[k]; assert len(ends)==len(CHUNKS[k]); assert abs(ends[-1]-d)<.06,(k,ends[-1],d); prev=0
    for n,((kk,i,c),r) in enumerate([(it,rr) for it,rr in zip(items,res) if it[0]==k]):
        L=r['lines']; assert len(L)<=2,('more than 2 lines',k,L); widest=max(widest,max(r['w']))
        a=t0+prev; bb=t0+ends[n]; last=n==len(ends)-1
        cards.append({'a':round(a+(.03 if n else 0),2),'b':round(bb+((.3+HOLD.get(k,0)) if last else -.03),2),'t':'|'.join(L),'clip':k}); prev=ends[n]
        print(k,n,r['w'],'|'.join(L))
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs21.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', widest)
