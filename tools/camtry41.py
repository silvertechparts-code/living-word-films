import sys, json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text","--font-render-hinting=none"]
# usage: camtry.py sheet_name cands.json  ; cands = [[label,t,x,z,hy,az,el,w,dy],...]  (target = ground(x,z)+hy)
name=sys.argv[1]; cands=json.load(open(sys.argv[2]))
ims=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':2020})
    pg.goto('file:///home/claude/g11/ep41.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    for c in cands:
        lab,t,x,z,hy,az,el,w,dy=c
        y=pg.evaluate("([x,z])=>window.__gAt(x,z)",[x,z])+hy
        pg.evaluate("(s)=>{window.__DBGCAM=s}",f"{x},{y},{z},{az},{el},{w},{dy}")
        pg.evaluate("(t)=>window.seek(t)",t)
        pg.screenshot(path='/tmp/_f.png',clip={'x':0,'y':0,'width':1080,'height':1920})
        im=Image.open('/tmp/_f.png').convert('RGB').resize((405,720)); d=ImageDraw.Draw(im); d.rectangle([0,0,200,14],fill=(0,0,0)); d.text((2,1),lab+' t%.1f'%t,fill=(255,255,255)); ims.append(im)
    b.close()
cols=4; rows=(len(ims)+cols-1)//cols
sheet=Image.new('RGB',(405*cols,720*rows),(0,0,0))
for i,im in enumerate(ims): sheet.paste(im,((i%cols)*405,(i//cols)*720))
sheet.save(f'/home/claude/ep41_qc/{name}.png'); print('ok',len(ims))
