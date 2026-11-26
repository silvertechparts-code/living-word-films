import sys
from PIL import Image, ImageDraw
# usage: sheet36.py out.png cols file1 file2 ...  (labels = file names)
out=sys.argv[1]; cols=int(sys.argv[2]); files=sys.argv[3:]
w,h=405,720; rows=(len(files)+cols-1)//cols
S=Image.new('RGB',(w*cols,h*rows),(0,0,0))
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB').crop((0,0,1080,1920)).resize((w,h),Image.LANCZOS); d=ImageDraw.Draw(im); d.rectangle([0,0,150,12],fill=(0,0,0)); d.text((2,1),f.split('/')[-1][:24],fill=(255,255,255)); S.paste(im,((i%cols)*w,(i//cols)*h))
S.save(out); print(out,S.size)
