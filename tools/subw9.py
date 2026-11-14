import sys, json
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':1920},device_scale_factor=1)
    pg.goto('file:///home/claude/g11/ep9.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    r=pg.evaluate("()=>window.__subWidths()")
    subs=json.load(open('/home/claude/g11/src/subs9.json'))
    bad=0
    for i,(s,x) in enumerate(zip(subs,r)):
        flag='OVER' if x['w']>860 else 'ok'; bad+= x['w']>860
        print(i,x['lines'],x['w'],flag)
    print('over limit:',bad); b.close()
