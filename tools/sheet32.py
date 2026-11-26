import sys, glob
from PIL import Image
prefix=sys.argv[1]; cols=int(sys.argv[2]) if len(sys.argv)>2 else 4; W=int(sys.argv[3]) if len(sys.argv)>3 else 360
fs=sorted(glob.glob(f'/home/claude/ep32_qc/{prefix}_*.png'))
H=int(2020*W/1080); rows=(len(fs)+cols-1)//cols
s=Image.new('RGB',(W*cols,H*rows))
for i,f in enumerate(fs): s.paste(Image.open(f).convert('RGB').resize((W,H)),((i%cols)*W,(i//cols)*H))
s.save(f'/home/claude/ep32_qc/sheet_{prefix}.png'); print(len(fs))
