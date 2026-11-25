import sys, json
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
ts=[float(x) for x in sys.argv[1:]]
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.goto('file:///home/claude/g11/ep14.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    for t in ts:
        r=pg.evaluate("(t)=>{const W=window.__W; const f=a=>a.map(v=>+v.toFixed(2)); return {A:f(W.abramPos(t)),L:f(W.lotPos(t)),I0:f(W.invPos(0,t)),I9:f(W.invPos(9,t)),M0:f(W.menPos(0,t)),M12:f(W.menPos(12,t)),M23:f(W.menPos(23,t))}}",t)
        print(t,json.dumps(r))
    b.close()
