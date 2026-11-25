import sys, json
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb"]
ts=[float(x) for x in sys.argv[1:]]
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':1920},device_scale_factor=1)
    pg.goto('file:///home/claude/g11/ep15.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    for t in ts:
        r=pg.evaluate("""(t)=>{window.seek(t);const S=window.__scene;const a=S.land.abram.group;a.updateMatrixWorld(true);const c=S.camera;const V=a.position.constructor;const w=new V();a.getWorldPosition(w);const sc=a.scale.x;const q=w.clone().add(new V(0,.4,0)).project(c);return {pos:w.toArray().map(v=>+v.toFixed(2)),rot:[a.rotation.x,a.rotation.y].map(v=>+v.toFixed(2)),vis:a.visible,scale:+sc.toFixed(2),screen:[Math.round((q.x*.5+.5)*1080),Math.round((-q.y*.5+.5)*1920)]}}""",t)
        print(t,json.dumps(r))
    b.close()
