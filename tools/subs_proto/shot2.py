import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":1080,"height":1920})
        jobs=[("bg1.png","പക്ഷേ അതിന് വിശ്രമിക്കാൻ<br>ഇടം കിട്ടിയില്ല.",False,"b1.png"),
              ("bg2.png","നോഹ കർത്താവിന് ഒരു<br>ബലിപീഠം പണിതു.",False,"b2.png"),
              ("bg1.png","പക്ഷേ അതിന് വിശ്രമിക്കാൻ<br>ഇടം കിട്ടിയില്ല.",True,"b3.png")]
        for bg,txt,guides,out in jobs:
            await pg.goto("file:///home/claude/subs_sample/sample2.html")
            await pg.evaluate("([bg,txt,g])=>{document.getElementById('bg').style.backgroundImage='url('+bg+')';document.getElementById('t').innerHTML=txt;document.body.classList.toggle('guides',g)}",[bg,txt,guides])
            await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=out)
            r = await pg.evaluate("(()=>{const r=document.getElementById('t').getBoundingClientRect();return [Math.round(r.top),Math.round(r.bottom)]})()")
            print(out, "subtitle top/bottom px:", r)
        await b.close()
asyncio.run(main())
