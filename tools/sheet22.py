import sys
from PIL import Image, ImageDraw
prefix=sys.argv[1]; ts=[float(x) for x in sys.argv[2:]]; cols=3; sc=.5
ims=[Image.open(f'/home/claude/ep22_qc/{prefix}_{t:05.1f}.png').convert('RGB') for t in ts]
w,h=int(1080*sc),int(2020*sc); rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(w*cols,h*rows),(10,10,10)); d=ImageDraw.Draw(S)
for i,(im,t) in enumerate(zip(ims,ts)):
    S.paste(im.resize((w,h),Image.LANCZOS),((i%cols)*w,(i//cols)*h)); d.text(((i%cols)*w+8,(i//cols)*h+8),f'{t:.1f}',fill=(255,255,0))
S.save(f'/home/claude/ep22_qc/sheet_{prefix}.png'); print(S.size)
