import sys
from playwright.sync_api import sync_playwright
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist","--hide-scrollbars","--force-color-profile=srgb","--disable-lcd-text"]
ts=[float(x) for x in sys.argv[1:]]
JS="""(t)=>{ window.seek(t); const S=window.__scene, cam=window.__cam(); const THREE_Box=S.land.hagar; 
  const b={min:{x:1e9,y:1e9,z:1e9},max:{x:-1e9,y:-1e9,z:-1e9}}; const v=new cam.position.constructor();
  const pts=[]; S.land.hagar.group.updateWorldMatrix(true,true);
  S.land.hagar.group.traverse(o=>{ if(o.isMesh&&o.geometry){ o.geometry.computeBoundingBox(); const bb=o.geometry.boundingBox; for(const x of [bb.min.x,bb.max.x]) for(const y of [bb.min.y,bb.max.y]) for(const z of [bb.min.z,bb.max.z]){ v.set(x,y,z).applyMatrix4(o.matrixWorld); pts.push([v.x,v.y,v.z]); } } });
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(const p of pts){ v.set(p[0],p[1],p[2]).project(cam); const sx=(v.x+1)/2*1080, sy=(1-v.y)/2*1920; x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy);} 
  return {t, x:[x0|0,x1|0], y:[y0|0,y1|0], h:(y1-y0)|0, cam:[cam.position.x.toFixed(2),cam.position.y.toFixed(2),cam.position.z.toFixed(2)], fov:cam.fov}; }"""
with sync_playwright() as p:
    b=p.chromium.launch(args=ARGS); pg=b.new_page(viewport={'width':1080,'height':1920},device_scale_factor=1)
    pg.goto('file:///home/claude/g11/ep16.html?render=1'); pg.wait_for_function('window.__ready===true',timeout=90000)
    for t in ts: print(pg.evaluate(JS,t),flush=True)
    b.close()
