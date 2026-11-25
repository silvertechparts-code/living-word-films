"""Build subs20.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':0.8,'b1':5.2,'b2':12.6,'c1':19.4,'c2':25.6,'d1':34.2,'d2':39.2,'d3':45.6,'e1':49.0,'e2':54.4,'h1':61.0,'h2':66.6,'h3':70.6,'h4':77.8,'i':85.3}
_B = json.load(open('/home/claude/batch/episodes/ep20/lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
# One entry per card (clip-relative end time in ENDS, taken from the pauses measured in the real clips); the Malayalam wording is NEVER changed: the chunks must join back to the lines.json text.
CHUNKS = {
 'a1':['അബ്രാഹം തെക്കോട്ടു സഞ്ചരിച്ച്','കുറച്ചുകാലം ഗരാറിൽ താമസിച്ചു.'],
 'b1':['ജീവനെ ഭയന്ന്','സാറാ തന്റെ സഹോദരിയാണെന്ന് അവൻ ആളുകളോടു പറഞ്ഞു;','രാജാവ് അബിമെലക്ക് അവളെ','തന്റെ ഭവനത്തിലേക്കു കൊണ്ടുപോയി.'],
 'b2':['അന്നു രാത്രി ദൈവം സ്വപ്നത്തിൽ അബിമെലക്കിനോടു പറഞ്ഞു:','നീ മരിക്കും;','ഈ സ്ത്രീ വിവാഹിതയാണ്.'],
 'c1':['അബിമെലക്ക് അവളെ സ്പർശിച്ചിരുന്നില്ല. അവൻ പറഞ്ഞു:','കർത്താവേ, നിരപരാധികളായ ഒരു ജനതയെ അങ്ങ് നശിപ്പിക്കുമോ?'],
 'c2':['ദൈവം മറുപടി പറഞ്ഞു:','നീ പാപം ചെയ്യാതിരിക്കാൻ ഞാൻ നിന്നെ തടഞ്ഞു.','അവളെ അവളുടെ ഭർത്താവായ പ്രവാചകനു തിരികെ കൊടുക്കുക;','അവൻ നിനക്കുവേണ്ടി പ്രാർഥിക്കും, നീ ജീവിക്കും.'],
 'd1':['രാവിലെ അബിമെലക്ക് അബ്രാഹത്തെ വിളിച്ചു:','നീ ഞങ്ങളോട് എന്താണു ചെയ്തത്?'],
 'd2':['അബ്രാഹം പറഞ്ഞു:','ഇവിടെ ആരും ദൈവത്തെ ഭയപ്പെടുന്നില്ലെന്നും','എന്റെ ഭാര്യയ്ക്കായി എന്നെ കൊല്ലുമെന്നും ഞാൻ കരുതി.'],
 'd3':['അവൾ യഥാർഥത്തിൽ','തന്റെ അർധസഹോദരിയാണെന്നും അവൻ കൂട്ടിച്ചേർത്തു.'],
 'e1':['അബിമെലക്ക് സാറായെ തിരികെ ഏൽപിക്കുകയും','അബ്രാഹത്തിന് ആടുമാടുകളെയും','ദാസീദാസന്മാരെയും നൽകുകയും ചെയ്തു.'],
 'e2':['അബ്രാഹം പ്രാർഥിച്ചു;','ദൈവം അബിമെലക്കിന്റെ ഭവനത്തെ സുഖപ്പെടുത്തി.'],
 'h1':['അബ്രാഹം ഭയന്നു;','സാറാ തന്റെ സഹോദരി മാത്രമാണെന്ന്','മറ്റുള്ളവർ വിശ്വസിക്കാൻ അവൻ അനുവദിച്ചു.'],
 'h2':['എങ്കിലും ദൈവം സാറായെയും','വാഗ്ദാനത്തെയും സംരക്ഷിച്ചു.'],
 'h3':['ഭയം സത്യം മറയ്ക്കാൻ നമ്മെ പ്രലോഭിപ്പിക്കുന്നു.','ദൈവത്തിന്റെ വിശ്വസ്തത','നമ്മുടെ കുറ്റമറ്റ ജീവിതത്തെ ആശ്രയിക്കുന്നില്ല.'],
 'h4':['ഇന്ന് സത്യസന്ധത തിരഞ്ഞെടുക്കുക;','ഫലം ദൈവത്തെ ഏൽപിക്കുക.'],
 'i':['ഭയം എവിടെയാണ് നിന്നെ','സത്യസന്ധത കുറഞ്ഞവനാക്കിയത്?'],
}
ENDS = {'a1':[1.38,3.34],'b1':[1.40,3.90,5.57,6.37],'b2':[2.82,4.00,5.57],'c1':[2.42,5.12],'c2':[1.09,2.61,5.13,7.28],'d1':[2.55,3.90],'d2':[1.17,3.61,5.49],'d3':[1.52,2.34],'e1':[1.58,3.13,4.39],'e2':[1.14,3.53],'h1':[1.63,3.30,4.71],'h2':[1.78,2.75],'h3':[2.32,3.75,5.91],'h4':[1.40,3.09],'i':[1.40,2.09]}
HOLD = {'i':1.6,'b1':0.5,'d3':0.5}   # the question card stays up while the question is on screen
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
    d=len(sf.read(f'/home/claude/vo/out_ep20/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep20/{k}.wav').samplerate
    t0=PLACE[k]; ends=ENDS[k]; assert len(ends)==len(CHUNKS[k]); assert abs(ends[-1]-d)<.06,(k,ends[-1],d); prev=0
    for n,((kk,i,c),r) in enumerate([(it,rr) for it,rr in zip(items,res) if it[0]==k]):
        L=r['lines']; assert len(L)<=2,('more than 2 lines',k,L); widest=max(widest,max(r['w']))
        a=t0+prev; bb=t0+ends[n]; last=n==len(ends)-1
        cards.append({'a':round(a+(.03 if n else 0),2),'b':round(bb+((.3+HOLD.get(k,0)) if last else -.03),2),'t':'|'.join(L),'clip':k}); prev=ends[n]
        print(k,n,r['w'],'|'.join(L))
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs20.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', widest)
