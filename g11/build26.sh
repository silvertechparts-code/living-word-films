#!/bin/bash
# build the Episode 26 page: bundles src/main26.js with the fonts and logo into one self-contained HTML file
set -e
cd /home/claude/g11
mkdir -p dist
npx esbuild src/main26.js --bundle --minify --format=iife --outfile=dist/bundle26.js --log-level=warning
python3 - <<'PY'
import base64
F='/home/claude/g11/node_modules/@fontsource/'
fonts=[('Cinzel',600,'normal','cinzel/files/cinzel-latin-600-normal.woff2'),('Cinzel',700,'normal','cinzel/files/cinzel-latin-700-normal.woff2'),
 ('Cinzel',800,'normal','cinzel/files/cinzel-latin-800-normal.woff2'),
 ('Inter',500,'normal','inter/files/inter-latin-500-normal.woff2'),('Inter',600,'normal','inter/files/inter-latin-600-normal.woff2'),
 ('Cormorant Garamond',500,'italic','cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2'),
 ('Cormorant Garamond',600,'italic','cormorant-garamond/files/cormorant-garamond-latin-600-italic.woff2'),
 ('Cormorant Garamond',600,'normal','cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2')]
# Malayalam subtitles (OFL, @fontsource/anek-malayalam): Malayalam and Latin subsets share one family with unicode-range
ANEK=[('anek-malayalam/files/anek-malayalam-malayalam-800-normal.woff2','U+0D00-0D7F,U+200C-200D,U+25CC'),('anek-malayalam/files/anek-malayalam-latin-800-normal.woff2','U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD')]
css=''
for fam,w,st,p in fonts:
    b=base64.b64encode(open(F+p,'rb').read()).decode()
    css+="@font-face{font-family:'%s';font-weight:%d;font-style:%s;src:url(data:font/woff2;base64,%s) format('woff2');}\n"%(fam,w,st,b)
for p,ur in ANEK:
    b=base64.b64encode(open(F+p,'rb').read()).decode()
    css+="@font-face{font-family:'Anek Malayalam';font-weight:800;font-style:normal;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s;}\n"%(b,ur)
logo=base64.b64encode(open('/home/claude/g11/assets/logo.png','rb').read()).decode()
bundle=open('/home/claude/g11/dist/bundle26.js').read()
html='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Living Word Films - Episode 26 - Genesis 26</title>\n<style>html,body{margin:0;height:100%;background:#020308;overflow:hidden}\n'+css+'</style></head><body>\n<script>window.__LOGO="data:image/png;base64,'+logo+'";</script>\n<script>'+bundle+'\n</script></body></html>\n'
open('/home/claude/g11/ep26.html','w').write(html)
print(len(html)//1024,'KB')
PY
