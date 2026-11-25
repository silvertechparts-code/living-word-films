import sys, json
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
# usage: dbgc11.py prefix t "x,y,z,az,el,w" ["x,y,z,az,el,w" ...]  -> debug-camera frames at time t
prefix=sys.argv[1]; t=float(sys.argv[2]); cams=sys.argv[3:]
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':1920},device_scale_factor=1)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///home/claude/g11/ep12.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    for i,c in enumerate(cams):
        pg.evaluate("(c)=>{window.__DBGCAM=c;}",c); pg.evaluate("(t)=>window.seek(t)",t); pg.screenshot(path=f'/home/claude/ep12_qc/{prefix}_{i}.png'); print('shot',i,c,flush=True)
    print('errors:',[e for e in errs if 'GL' not in e][:6]); b.close()
