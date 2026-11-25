from playwright.sync_api import sync_playwright
import json
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text"]
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':2020},device_scale_factor=1)
    pg.goto('file:///home/claude/g11/ep20.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    r=pg.evaluate("()=>window.__subWidths?window.__subWidths():null")
    print(type(r), (len(r) if r else None))
    if r:
        rows=r if isinstance(r,list) else list(r.items())
        ws=[x if isinstance(x,(int,float)) else (x.get('w') if isinstance(x,dict) else None) for x in rows]
        print(str(rows[:3])[:300]); 
        try: print('max', max(w for w in ws if w))
        except Exception as e: print('err',e)
    b.close()
