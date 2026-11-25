import sys
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS)
    for n in sys.argv[1:]:
        pg=b.new_page(viewport={'width':1080,'height':2020})
        try:
            pg.goto(f'file:///home/claude/g11/ep{n}.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
            has=pg.evaluate("()=>typeof window.__subWidths")
            if has!='function': print(n,'no __subWidths'); pg.close(); continue
            r0=pg.evaluate("()=>window.__subWidths()")
            pg.evaluate("async()=>{await document.fonts.load('800 52px \"Anek Malayalam\"','അവൾ അവനു കുടിക്കാൻ കൊടുത്തു; ദൈവം'); await document.fonts.ready;}")
            r1=pg.evaluate("()=>window.__subWidths()")
            over=[(x['a'],x['w']) for x in r1 if x['w']>860]
            print(n,'cards',len(r1),'max before',max(x['w'] for x in r0),'max after',max(x['w'] for x in r1),'over860:',len(over), over[:6])
        except Exception as e: print(n,'err',str(e)[:100])
        pg.close()
    b.close()
