import sys, json
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
# usage: dbg9.py out_prefix t1 t2 ...   -> /home/claude/ep20_qc/<prefix>_<t>.png (one browser session, several frames)
prefix=sys.argv[1]; ts=[float(x) for x in sys.argv[2:]]
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':2020},device_scale_factor=1)
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type in('error','warning') else None)
    pg.goto('file:///home/claude/g11/ep20.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    for t in ts:
        pg.evaluate("(t)=>window.seek(t)",t); pg.screenshot(path=f'/home/claude/ep20_qc/{prefix}_{t:05.1f}.png'); print('shot',t,flush=True)
    print('errors:',errs[:8])
    b.close()
