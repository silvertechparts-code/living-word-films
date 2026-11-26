import sys, glob
from PIL import Image
prefix, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
fs = sorted(glob.glob(f'/home/claude/ep34_qc/{prefix}_*.png')); W, H = 432, 768
rows = (len(fs) + cols - 1) // cols
s = Image.new('RGB', (W * cols, H * rows))
for i, f in enumerate(fs): s.paste(Image.open(f).convert('RGB').crop((0, 100, 1080, 2020)).resize((W, H)), ((i % cols) * W, (i // cols) * H))
s.save(out); print(len(fs), out)
