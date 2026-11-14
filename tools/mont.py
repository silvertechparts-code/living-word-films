import sys
from PIL import Image
out=sys.argv[1]; files=sys.argv[2:]
ims=[Image.open(f).convert('RGB') for f in files]; w=360; h=640
M=Image.new('RGB',(w*len(ims),h))
for i,im in enumerate(ims): M.paste(im.resize((w,h),Image.LANCZOS),(i*w,0))
M.save(out)
