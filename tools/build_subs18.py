"""Build subs18.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':0.8,'b1':6.2,'b2':11.4,'c1':14.8,'c2':20.2,'c3':23.8,'d1':27.9,'d2':34.4,'d3':43.0,'e1':48.8,'e2':53.6,'h1':61.0,'h2':65.4,'h3':71.0,'h4':77.4,'i':85.3}
_B = json.load(open('/home/claude/batch/episodes/ep18/lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
# One entry per card (clip-relative end time in ENDS, taken from the pauses measured in the real clips); the Malayalam wording is NEVER changed: the chunks must join back to the lines.json text.
CHUNKS = {
 'a1':['കർത്താവ് മമ്രേയിൽ അബ്രാഹത്തിനു പ്രത്യക്ഷപ്പെട്ടു.','അവൻ തലയുയർത്തി നോക്കിയപ്പോൾ','മൂന്നു പുരുഷന്മാരെ കണ്ടു.'],
 'b1':['അവൻ ഓടിച്ചെന്നു: ദയവായി കടന്നുപോകരുതേ;','ഞാൻ വെള്ളവും അപ്പവും കൊണ്ടുവരാം.'],
 'b2':['അബ്രാഹവും സാറായും തിടുക്കത്തിൽ വിരുന്നൊരുക്കി.'],
 'c1':['അവർ ചോദിച്ചു: സാറാ എവിടെ?','ഒരാൾ പറഞ്ഞു: ഞാൻ വീണ്ടും വരും; സാറായ്ക്ക് ഒരു മകനുണ്ടാകും.'],
 'c2':['കൂടാരവാതിൽക്കൽ കേട്ടുനിന്ന സാറാ','ഉള്ളിൽ ചിരിച്ചു.'],
 'c3':['കർത്താവ് പറഞ്ഞു:','കർത്താവിന് അസാധ്യമായി എന്തെങ്കിലുമുണ്ടോ?'],
 'd1':['അപ്പോൾ അവിടുന്ന് അരുളിച്ചെയ്തു:','സോദോമിനും ഗൊമോറായ്ക്കും എതിരായ നിലവിളി വലുതാണ്;','ഞാൻ ഇറങ്ങിച്ചെന്നു കാണും.'],
 'd2':['അബ്രാഹം ചോദിച്ചു:','നീതിമാന്മാരെയും ദുഷ്ടരെയും ഒരുമിച്ചു നശിപ്പിക്കുമോ?','ഭൂമി മുഴുവന്റെയും വിധികർത്താവ് നീതി പ്രവർത്തിക്കേണ്ടതല്ലേ?'],
 'd3':['അൻപതു നീതിമാന്മാർ ഉണ്ടെങ്കിലോ?','കർത്താവ് പറഞ്ഞു: അവർക്കുവേണ്ടി ഞാൻ നഗരത്തെ ഒഴിവാക്കും.'],
 'e1':['അബ്രാഹം വീണ്ടും ചോദിച്ചു:','നാൽപത്തഞ്ച്, നാൽപത്, മുപ്പത്, ഇരുപത്.'],
 'e2':['ഒടുവിൽ: പത്തുപേരുണ്ടെങ്കിലോ?','കർത്താവ് പറഞ്ഞു:','പത്തുപേർക്കുവേണ്ടി ഞാൻ നശിപ്പിക്കില്ല.'],
 'h1':['അബ്രാഹം അപരിചിതരെ സ്വീകരിച്ചു;','അവിടെ കർത്താവിനെ കണ്ടുമുട്ടി.'],
 'h2':['പിന്നെ അവൻ ദൈവത്തിന്റെ മുമ്പിൽ നിന്ന്,','തന്റേതല്ലാത്ത ഒരു നഗരത്തിനുവേണ്ടി അപേക്ഷിച്ചു.'],
 'h3':['പ്രാർഥന നമുക്കുവേണ്ടി മാത്രം ചോദിക്കലല്ല;','മറ്റുള്ളവർക്കുവേണ്ടി ദൈവത്തിന്റെ മുമ്പിൽ നിൽക്കലാണ്.'],
 'h4':['ഇന്ന് ഒരാൾക്കുവേണ്ടി പേരുചൊല്ലി പ്രാർഥിക്കുക.'],
 'i':['ഇന്ന് ആരുടെ പേരാണ് നീ','ദൈവത്തിന്റെ മുമ്പിൽ കൊണ്ടുവരുന്നത്?'],
}
ENDS = {'a1':[2.58,3.45,4.48],'b1':[2.58,4.34],'b2':[2.65],'c1':[2.38,4.68],'c2':[1.55,2.75],'c3':[1.0,3.13],'d1':[.8,3.93,5.49],'d2':[1.37,4.22,7.46],'d3':[1.93,4.71],'e1':[1.52,4.01],'e2':[1.63,2.7,4.78],'h1':[1.98,3.08],'h2':[1.66,4.53],'h3':[2.66,5.09],'h4':[1.96],'i':[1.05,2.16]}
HOLD = {'i':1.6}   # the question card stays up while the question is on screen
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
bad=[(it[0],it[1],rr['lines']) for it,rr in zip(items,res) if len(rr['lines'])>2]
print('TOO LONG:',bad)
cards=[]; widest=0
for k in keys:
    d=len(sf.read(f'/home/claude/vo/out_ep18/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep18/{k}.wav').samplerate
    t0=PLACE[k]; ends=ENDS[k]; assert len(ends)==len(CHUNKS[k]); assert abs(ends[-1]-d)<.06,(k,ends[-1],d); prev=0
    for n,((kk,i,c),r) in enumerate([(it,rr) for it,rr in zip(items,res) if it[0]==k]):
        L=r['lines']; assert len(L)<=2,('more than 2 lines',k,L); widest=max(widest,max(r['w']))
        a=t0+prev; bb=t0+ends[n]; last=n==len(ends)-1
        cards.append({'a':round(a+(.03 if n else 0),2),'b':round(bb+((.3+HOLD.get(k,0)) if last else -.03),2),'t':'|'.join(L),'clip':k}); prev=ends[n]
        print(k,n,r['w'],'|'.join(L))
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs18.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', widest)
