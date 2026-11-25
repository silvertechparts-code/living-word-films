"""Build subs15.json: wrap every Malayalam narration line to <= 860 px (measured in the real page font), 2 lines per card, timed to the real clips."""
import json, sys, os, soundfile as sf
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
PLACE = {'a1':1.0,'b1':6.4,'b2':11.6,'c1':15.6,'c3':22.2,'d1':27.7,'d2':32.3,'d3':37.4,'e1':43.5,'e2':50.0,'e3':56.0,'h1':61.0,'h2':66.0,'h3':72.0,'h4':78.4,'i':85.3}
_B = json.load(open('/home/claude/batch/ep15_lines.json'))
ML = {x['id']: x['ml'] for x in _B['story'] + _B['reflection'] + [_B['question']]}
FORCE = {
 'a1':['ഒരു ദർശനത്തിൽ കർത്താവ്','അബ്രാമിനോടു പറഞ്ഞു:','ഭയപ്പെടേണ്ട,','ഞാൻ നിന്റെ പരിച ആകുന്നു.'],
 'b1':['അബ്രാം പറഞ്ഞു:','എനിക്കു കുഞ്ഞില്ല;','എന്റെ അവകാശി','എന്റെ വീട്ടിലെ ഒരു ദാസനാണ്.'],
 'b2':['കർത്താവ് മറുപടി പറഞ്ഞു:','നിന്റെ സ്വന്തം മകൻ തന്നെ','നിന്റെ അവകാശി ആകും.'],
 'c1':['അവൻ അബ്രാമിനെ','പുറത്തു കൊണ്ടുവന്നു:','നക്ഷത്രങ്ങളെ','എണ്ണാമെങ്കിൽ എണ്ണുക;','നിന്റെ സന്തതിയും','അങ്ങനെ ആകും.'],
 'c3':['അബ്രാം കർത്താവിൽ','വിശ്വസിച്ചു;','അത് അവന്','നീതിയായി കണക്കാക്കപ്പെട്ടു.'],
 'd1':['അബ്രാം ചോദിച്ചു:','ഈ ദേശം എനിക്ക്','അവകാശമാകുമെന്ന്','ഞാൻ എങ്ങനെ അറിയും?'],
 'd2':['മൃഗങ്ങളെ കൊണ്ടുവരാൻ','കർത്താവ് പറഞ്ഞു;','അബ്രാം അവയെ രണ്ടായി മുറിച്ചു.'],
 'd3':['സൂര്യാസ്തമയത്തിൽ','അബ്രാമിന് ഗാഢനിദ്ര വന്നു;','വലിയ അന്ധകാരം അവനെ മൂടി.'],
 'e1':['അവന്റെ സന്തതി നാനൂറു വർഷം','അന്യരായി കഴിയും;','പിന്നെ വലിയ സമ്പത്തോടെ','പുറത്തുവരും.'],
 'e2':['ഇരുട്ടിൽ പുകയുന്ന','ഒരു തീച്ചട്ടിയും','ജ്വലിക്കുന്ന ഒരു പന്തവും','ആ കഷണങ്ങൾക്കിടയിലൂടെ','കടന്നുപോയി.'],
 'h1':['ആ വാഗ്ദാനം എങ്ങനെ','നിറവേറുമെന്ന് അബ്രാമിനു','കാണാൻ കഴിഞ്ഞില്ല.'],
 'h2':['എങ്കിലും ദൈവം പറഞ്ഞു:','മുകളിലേക്കു നോക്കുക;','കഴിയുമെങ്കിൽ','നക്ഷത്രങ്ങളെ എണ്ണുക.'],
 'h3':['അബ്രാം വിശ്വസിച്ചു;','ദൈവം അവന്റെ വിശ്വാസം','നീതിയായി കണക്കാക്കി.'],
 'h4':['ഭാവി ഇരുണ്ടതായി തോന്നുമ്പോൾ','മുകളിലേക്കു നോക്കുക;','നക്ഷത്രങ്ങളെ സൃഷ്ടിച്ചവനെ','വിശ്വസിക്കുക.'],
 'i':['ഇരുട്ടിൽ ദൈവത്തെ വിശ്വസിക്കേണ്ട','ഇടം നിനക്ക് ഏതാണ്?'],
}
# card sizes (lines per card) where a card must hold one line
GROUPS = {'a1':[2,2],'b1':[2,2],'b2':[1,2],'c1':[2,2,2],'c3':[2,2],'d1':[1,2,1],'d2':[2,1],'d3':[2,1],'e1':[2,2],'e2':[2,1,2],'e3':[2],'h1':[2,1],'h2':[2,2],'h3':[1,2],'h4':[2,2],'i':[2]}
# clip-relative end of the first card, where the speech has a clear pause (measured from the real clips)
SPLIT = {}
ENDS = {'a1':[1.9,4.57],'b1':[2.02,4.42],'b2':[1.3,3.08],'c1':[1.5,3.6,5.47],'c3':[1.5,4.5],'d1':[1.1,2.5,3.69],'d2':[1.95,4.01],'d3':[2.7,4.98],'e1':[3.3,5.47],'e2':[2.2,3.6,5.07],'e3':[2.61],'h1':[1.7,2.57],'h2':[1.5,3.45],'h3':[1.05,4.05],'h4':[1.85,4.24],'i':[2.18]}
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
    d=len(sf.read(f'/home/claude/vo/out_ep15/{k}.wav')[0])/sf.info(f'/home/claude/vo/out_ep15/{k}.wav').samplerate
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
json.dump(cards,open(os.environ.get('SUBS_OUT','/home/claude/g11/src/subs15.json'),'w'),ensure_ascii=False,indent=0)
print(len(cards),'cards; widest line', max(max(r['w']) for r in res))
