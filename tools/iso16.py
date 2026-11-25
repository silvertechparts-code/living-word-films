import sys
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text"]
# usage: iso16.py t   -> variants a(base) b(no sprites) c(no beams) d(no far mtn) e(no point light)
t=float(sys.argv[1])
JS="""(mode)=>{const S=window.__scene; const kill=o=>Object.defineProperty(o,'visible',{get:()=>false,set:()=>{},configurable:true});
 S.scene.traverse(o=>{ if(mode==='b'&&o.isSprite) kill(o);
  if(mode==='c'&&o.isMesh&&o.geometry&&o.geometry.parameters&&o.geometry.parameters.height===26) kill(o);
  if(mode==='d'&&o===S.land.far) kill(o); });
 if(mode==='e'){ S.land.pl.forEach(l=>{l.intensity=0; Object.defineProperty(l,'intensity',{get:()=>0,set:()=>{},configurable:true});}); }
 window.seek(%f); }""" % t
with sync_playwright() as p:
    for mode in ['b','c','d','e']:
        b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':1920},device_scale_factor=1)
        pg.goto('file:///home/claude/g11/ep16.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
        pg.evaluate("window.seek(%f)"%t)
        pg.evaluate(JS,mode); pg.screenshot(path=f'/home/claude/ep16_qc/iso_{mode}_{t:05.1f}.png'); print('shot',mode,flush=True); b.close()
