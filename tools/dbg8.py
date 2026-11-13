import sys, json
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
# usage: dbg8.py t "js-before-seek-or-after" out.png
t=float(sys.argv[1]); js=sys.argv[2] if len(sys.argv)>2 else ''; out=sys.argv[3] if len(sys.argv)>3 else '/home/claude/ep8_qc/dbg.png'
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':1920},device_scale_factor=1)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type in('error','warning') else None)
    pg.goto('file:///home/claude/g11/ep8.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=60000)
    r=pg.evaluate("(a)=>{const [t,js]=a; window.seek(t); const r=js?eval(js):null; if(js&&js.indexOf('seek')>=0){} return r===undefined?null:r}",[t,js])
    print(json.dumps(r) if r is not None else '')
    pg.screenshot(path=out); print('errors:',errs[:6])
    b.close()
