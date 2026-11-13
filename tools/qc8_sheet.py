#!/usr/bin/env python3
# usage: qc8_sheet.py final.mp4 out.png t1,t2,... [cols] [thumb_w]
import sys, subprocess, os, tempfile
from PIL import Image, ImageDraw
f, out, ts = sys.argv[1], sys.argv[2], [float(x) for x in sys.argv[3].split(',')]
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 6
tw = int(sys.argv[5]) if len(sys.argv) > 5 else 270
th = int(tw * 16 / 9)
d = tempfile.mkdtemp()
ims = []
for i, t in enumerate(ts):
    p = os.path.join(d, f"{i}.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t}", "-i", f, "-frames:v", "1", p], check=True)
    im = Image.open(p).convert("RGB").resize((tw, th))
    ImageDraw.Draw(im).text((6, 6), f"{t:.1f}s", fill=(255, 255, 0))
    ims.append(im)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * th), (20, 20, 20))
for i, im in enumerate(ims):
    sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
sheet.save(out)
print(out, sheet.size)
