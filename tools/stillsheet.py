import sys, glob
from PIL import Image, ImageDraw
out=sys.argv[1]; files=sys.argv[2:]
ims=[]
for f in files:
    im=Image.open(f).convert('RGB').crop((0,0,1080,1920)).resize((360,640)); d=ImageDraw.Draw(im); d.rectangle([0,0,170,13],fill=(0,0,0)); d.text((2,1),f.split('/')[-1],fill=(255,255,255)); ims.append(im)
cols=min(4,len(ims)); rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(360*cols,640*rows))
for i,im in enumerate(ims): sh.paste(im,((i%cols)*360,(i//cols)*640))
sh.save(out); print(out,sh.size)
