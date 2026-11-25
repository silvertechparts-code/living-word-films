"""Build subs22.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':0.6,'b1':8.8,'c1':14.2,'c2':20.1,'c3':24.3,'d1':30.9,'d2':36.6,'d3':42.5,'e1':47.3,'e2':51.8,'e3':55.2,'h1':61.4,'h2':66.2,'h3':71.6,'h4':78.2,'i':85.3}
_B = json.load(open('/home/claude/batch/episodes/ep22/lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
# One entry per card (clip-relative end time in ENDS, taken from the pauses measured in the real clips); the Malayalam wording is NEVER changed: the chunks must join back to the lines.json text.
CHUNKS = {
 'a1':['ദൈവം അബ്രാഹത്തെ പരീക്ഷിച്ചു:','നീ സ്നേഹിക്കുന്ന നിന്റെ ഏകപുത്രനായ','ഇസഹാക്കിനെ കൊണ്ടുപോയി','ഞാൻ കാണിച്ചുതരുന്ന ഒരു മലയിൽ ബലിയായി അർപ്പിക്കുക.'],
 'b1':['പിറ്റേന്ന് അതിരാവിലെ','അബ്രാഹം ഇസഹാക്കിനെയും രണ്ടു ദാസന്മാരെയും കൂട്ടി','വിറകുമായി പുറപ്പെട്ടു.'],
 'c1':['മൂന്നാം ദിവസം അവൻ ആ സ്ഥലം കണ്ടു.','ദാസന്മാരോട് അവൻ പറഞ്ഞു: ഞങ്ങൾ ആരാധിച്ച് മടങ്ങിവരും.'],
 'c2':['ഇസഹാക്ക് വിറകു ചുമന്നു;','അബ്രാഹം തീയും കത്തിയും എടുത്തു.'],
 'c3':['ഇസഹാക്ക് ചോദിച്ചു: ആട്ടിൻകുട്ടി എവിടെ?','അബ്രാഹം പറഞ്ഞു: ദൈവംതന്നെ ആട്ടിൻകുട്ടിയെ നൽകും.'],
 'd1':['ദൈവം പറഞ്ഞ സ്ഥലത്ത്','അബ്രാഹം ബലിപീഠം പണിത് ഇസഹാക്കിനെ ബന്ധിച്ചു.'],
 'd2':['അവൻ കത്തി എടുത്തപ്പോൾ','കർത്താവിന്റെ ദൂതൻ വിളിച്ചു:','അബ്രാഹമേ! ബാലനെ ഉപദ്രവിക്കരുത്.'],
 'd3':['നീ ദൈവത്തെ ഭയപ്പെടുന്നുവെന്ന് ഇപ്പോൾ ഞാൻ അറിയുന്നു;','നീ നിന്റെ മകനെ എന്നിൽനിന്നു തടഞ്ഞുവച്ചില്ല.'],
 'e1':['ഒരു മുൾപ്പടർപ്പിൽ കൊമ്പു കുടുങ്ങിയ','ഒരു ആട്ടിൻകൊറ്റനെ അബ്രാഹം കണ്ടു;','അവൻ അതിനെ പകരം അർപ്പിച്ചു.'],
 'e2':['അവൻ ആ സ്ഥലത്തിനു പേരിട്ടു:','കർത്താവ് കരുതിക്കൊള്ളും.'],
 'e3':['ദൂതൻ വാഗ്ദാനം ചെയ്തു:','നിന്റെ സന്തതിയിലൂടെ','ഭൂമിയിലെ സകല ജനതകളും അനുഗ്രഹിക്കപ്പെടും.'],
 'h1':['ദൈവം തനിക്കു വാഗ്ദാനം ചെയ്തതിനെത്തന്നെ','അബ്രാഹം ദൈവത്തെ ഏൽപിച്ചു.'],
 'h2':['അവസാനം എന്താകുമെന്ന് അവനറിയില്ലായിരുന്നു;','അവൻ പറഞ്ഞു: ദൈവംതന്നെ നൽകും.'],
 'h3':['ദൈവം എങ്ങനെ നൽകുമെന്ന് അറിയുന്നതല്ല വിശ്വാസം;','എങ്കിലും അവനോടൊപ്പം മുന്നോട്ടു നടക്കുന്നതാണ്.'],
 'h4':['ഇന്ന് നഷ്ടപ്പെടുമെന്നു നീ ഭയപ്പെടുന്നതിനെ','ദൈവത്തിന്റെ കൈകളിൽ ഏൽപിക്കുക.'],
 'i':['ദൈവത്തെ ഏൽപിക്കാൻ നിനക്ക് ഏറ്റവും പ്രയാസമുള്ളത് എന്താണ്?'],
}
ENDS = {'a1':[1.75,3.4,4.9,7.36],'b1':[1.18,3.05,4.54],'c1':[2.04,5.08],'c2':[1.41,3.38],'c3':[2.28,5.48],'d1':[1.62,4.37],'d2':[2.85,3.95,5.05],'d3':[1.88,3.92],'e1':[1.15,2.25,3.71],'e2':[1.13,2.58],'e3':[1.37,2.7,4.37],'h1':[2.3,3.92],'h2':[1.47,4.03],'h3':[2.88,5.08],'h4':[2.2,3.2],'i':[2.14]}
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
    d=len(sf.read(f'/home/claude/vo/out_ep22/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep22/{k}.wav').samplerate
    t0=PLACE[k]; ends=ENDS[k]; assert len(ends)==len(CHUNKS[k]); assert abs(ends[-1]-d)<.06,(k,ends[-1],d); prev=0
    for n,((kk,i,c),r) in enumerate([(it,rr) for it,rr in zip(items,res) if it[0]==k]):
        L=r['lines']; assert len(L)<=2,('more than 2 lines',k,L); widest=max(widest,max(r['w']))
        a=t0+prev; bb=t0+ends[n]; last=n==len(ends)-1
        cards.append({'a':round(a+(.03 if n else 0),2),'b':round(bb+((.3+HOLD.get(k,0)) if last else -.03),2),'t':'|'.join(L),'clip':k}); prev=ends[n]
        print(k,n,r['w'],'|'.join(L))
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs22.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', widest)
