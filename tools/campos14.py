import sys, json
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
ts=[float(x) for x in sys.argv[1:]]
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.goto('file:///home/claude/g11/ep14.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    for t in ts:
        pg.evaluate("(t)=>window.seek(t)",t)
        r=pg.evaluate("()=>(()=>{const c=window.__scene.camera;return [c.position.x,c.position.y,c.position.z].map(v=>+v.toFixed(2))})()")
        print(t,json.dumps(r))
    b.close()
