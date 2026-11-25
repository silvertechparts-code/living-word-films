import sys, json
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb"]
ts=[float(x) for x in sys.argv[1:]]
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':2020},device_scale_factor=1)
    pg.goto('file:///home/claude/g11/ep24.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    for t in ts:
        r=pg.evaluate("""(t)=>{window.seek(t);const S=window.__scene;const c=S.camera;const d=new (c.position.constructor)();c.getWorldDirection(d);return {pos:c.position.toArray().map(v=>+v.toFixed(2)),dir:d.toArray().map(v=>+v.toFixed(2))}}""",t)
        print(t,json.dumps(r))
    b.close()
