"""Build subs9.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':1.0,'b1':4.7,'b2':8.0,'c1':13.2,'c2':18.6,'c3':21.6,'c4':25.2,'d1':31.2,'d2':33.6,'d3':37.2,'d4':40.5,'e1':46.0,'e2':51.4,'h1':61.0,'h2':65.8,'h3':69.4,'h4':77.6,'i':85.3}
ML = {
 'a1':'പ്രളയത്തിനു ശേഷം ദൈവം നോഹയോടും അവന്റെ മക്കളോടും സംസാരിച്ചു.',
 'b1':'ദൈവം അവരെ അനുഗ്രഹിച്ചു: സന്താനപുഷ്ടിയുള്ളവരായി ഭൂമിയിൽ നിറയുവിൻ.',
 'b2':'മനുഷ്യജീവൻ പവിത്രമാണ്; ദൈവം തന്റെ ഛായയിലാണ് മനുഷ്യനെ സൃഷ്ടിച്ചത്.',
 'c1':'പിന്നെ ദൈവം നോഹയോടും മക്കളോടും എല്ലാ ജീവജാലങ്ങളോടും ഉടമ്പടി ചെയ്തു.',
 'c2':'ഇനിയൊരിക്കലും ജലപ്രളയം ഭൂമിയെ നശിപ്പിക്കില്ല.',
 'c3':'ദൈവം ഒരു അടയാളം നൽകി: മേഘങ്ങളിൽ ഒരു വില്ല്.',
 'c4':'അതു കാണുമ്പോൾ ഞാൻ എന്റെ വാഗ്ദാനം ഓർക്കും എന്ന് ദൈവം പറഞ്ഞു.',
 'd1':'പിന്നീട് നോഹ ഒരു മുന്തിരിത്തോട്ടം നട്ടു.',
 'd2':'അവൻ വീഞ്ഞ് കുടിച്ചു, കൂടാരത്തിൽ നഗ്നനായി കിടന്നു.',
 'd3':'മകൻ ഹാം അതു കണ്ട്, സഹോദരന്മാരോട് പറഞ്ഞു.',
 'd4':'എന്നാൽ ഷേമും യാഫെത്തും ഒരു മേലങ്കി എടുത്തു, പിന്നോട്ട് നടന്നുചെന്ന് പിതാവിനെ പുതപ്പിച്ചു.',
 'e1':'നോഹ ഉണർന്നപ്പോൾ, ഹാമിന്റെ മകൻ കാനാനെ ശപിച്ചു; ഷേമിനെയും യാഫെത്തിനെയും അനുഗ്രഹിച്ചു.',
 'e2':'നോഹ 950 വർഷം ജീവിച്ചു. മേഘത്തിലെ വില്ല് ദൈവത്തിന്റെ ശാശ്വത ഉടമ്പടിയുടെ അടയാളമായി നിന്നു.',
 'h1':'ദൈവത്തിന്റെ വാഗ്ദാനം നോഹ പൂർണനായതിനെ ആശ്രയിച്ചിരുന്നില്ല.',
 'h2':'നോഹ വീണുപോയി, എങ്കിലും വില്ല് നിലനിന്നു.',
 'h3':'നിനക്കും പരാജയം പറ്റാം; എല്ലാം നശിപ്പിച്ചു എന്നും തോന്നാം. പക്ഷേ ദൈവത്തിന്റെ വിശ്വസ്തത നിന്റെ മോശം ദിനത്തെക്കാൾ വലുതാണ്.',
 'h4':'ഒരു മഴവില്ല് കാണുമ്പോൾ ഓർക്കുക: ദൈവം തന്റെ വാഗ്ദാനങ്ങൾ പാലിക്കുന്നു.',
 'i':'ദൈവത്തിന്റെ ഏത് വാഗ്ദാനത്തിലാണ് നീ ഇന്ന് മുറുകെ പിടിക്കുന്നത്?'}
FORCE = {'d4':['എന്നാൽ ഷേമും യാഫെത്തും','ഒരു മേലങ്കി എടുത്തു,','പിന്നോട്ട് നടന്നുചെന്ന്','പിതാവിനെ പുതപ്പിച്ചു.']}  # split at the comma: two even cards
MAXW = 850   # 10 px inside the 860 rule
JS = """(a)=>{const [texts,maxw,force]=a; const cx=document.createElement('canvas').getContext('2d'); cx.font='800 52px "Anek Malayalam", sans-serif';
 const W=s=>Math.ceil(cx.measureText(s).width);
 const STOP=new Set(['പക്ഷേ','ഒരു','എന്നാൽ','എങ്കിലും','എന്റെ','നിന്റെ','അവന്റെ','തന്റെ','പിന്നെ','പിന്നീട്']);
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
    pg.goto('file:///home/claude/g11/ep9.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    keys=list(ML); res=pg.evaluate(JS,[[ML[k] for k in keys],MAXW,[FORCE.get(k) for k in keys]]); b.close()
cards=[]
for k,r in zip(keys,res):
    d=len(sf.read(f'/home/claude/vo/out_ep9/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep9/{k}.wav').samplerate
    t0=PLACE[k]; L=r['lines']; groups=[L[i:i+2] for i in range(0,len(L),2)]
    ch=[sum(len(x) for x in g) for g in groups]; tot=sum(ch); acc=0
    for g,c in zip(groups,ch):
        a=t0+d*acc/tot; acc+=c; bb=t0+d*acc/tot
        cards.append({'a':round(a+(.03 if acc>c else 0),2),'b':round(bb-(.03 if acc<tot else 0),2),'t':'|'.join(g),'clip':k})
    print(k,round(d,2),[x for x in r['w']])
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs9.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', max(max(r['w']) for r in res))
