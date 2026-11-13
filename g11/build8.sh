#!/bin/bash
# build the Episode 8 page: bundles src/main8.js with the fonts and logo into one self-contained HTML file
set -e
cd /home/claude/g11
mkdir -p dist
npx esbuild src/main8.js --bundle --minify --format=iife --outfile=dist/bundle8.js --log-level=warning
python3 - <<'PY'
import base64
F='/home/claude/g11/node_modules/@fontsource/'
fonts=[('Cinzel',600,'normal','cinzel/files/cinzel-latin-600-normal.woff2'),('Cinzel',700,'normal','cinzel/files/cinzel-latin-700-normal.woff2'),
 ('Cinzel',800,'normal','cinzel/files/cinzel-latin-800-normal.woff2'),
 ('Inter',500,'normal','inter/files/inter-latin-500-normal.woff2'),('Inter',600,'normal','inter/files/inter-latin-600-normal.woff2'),
 ('Cormorant Garamond',500,'italic','cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2'),
 ('Cormorant Garamond',600,'italic','cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2'),
 ('Cormorant Garamond',600,'normal','cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2')]
css=''
for fam,w,st,p in fonts:
    b=base64.b64encode(open(F+p,'rb').read()).decode()
    css+="@font-face{font-family:'%s';font-weight:%d;font-style:%s;src:url(data:font/woff2;base64,%s) format('woff2');}\n"%(fam,w,st,b)
logo=base64.b64encode(open('/home/claude/g11/assets/logo.png','rb').read()).decode()
bundle=open('/home/claude/g11/dist/bundle8.js').read()
html='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Living Word Films - Episode 8 - Genesis 8</title>\n<style>html,body{margin:0;height:100%;background:#020308;overflow:hidden}\n'+css+'</style></head><body>\n<script>window.__LOGO="data:image/png;base64,'+logo+'";</script>\n<script>'+bundle+'\n</script></body></html>\n'
open('/home/claude/g11/ep8.html','w').write(html)
print(len(html)//1024,'KB')
PY
