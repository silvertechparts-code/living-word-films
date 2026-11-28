import sys,glob
from PIL import Image, ImageDraw
prefix=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 5
fs=sorted(glob.glob(f'/home/claude/ep45_qc/{prefix}_*.png'))
W,H=324,576
ims=[]
for f in fs:
    im=Image.open(f).convert('RGB').crop((0,0,1080,1920)).resize((W,H)); d=ImageDraw.Draw(im); d.rectangle([0,0,60,12],fill=(0,0,0)); d.text((2,1),f.split('_')[-1][:-4],fill=(255,255,255)); ims.append(im)
rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(W*cols,H*rows))
for i,im in enumerate(ims): sh.paste(im,((i%cols)*W,(i//cols)*H))
sh.save(f'/home/claude/ep45_qc/{out}.png'); print(len(ims))
