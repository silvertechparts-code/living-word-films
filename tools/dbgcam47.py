import sys
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
# usage: dbgcam30.py prefix "x,y,z,az,el,w" t1 t2 ...
prefix=sys.argv[1]; cam=sys.argv[2]; ts=[float(x) for x in sys.argv[3:]]
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':2020})
    pg.goto(f'file:///home/claude/g11/ep47.html?render=1&cam={cam}'); pg.wait_for_function('window.__ready===true',timeout=90000)
    for t in ts:
        pg.evaluate("(t)=>window.seek(t)",t); pg.screenshot(path=f'/home/claude/ep47_qc/{prefix}_{t:05.1f}.png',clip={'x':0,'y':0,'width':1080,'height':1920})
    b.close()
