import subprocess, sys
from PIL import Image
F='ep25_out/LivingWord_Ep25_Genesis25_OneBowlOfStew.mp4'; Q='ep25_qc/final'
T=[0.3,3,6.5,9.5,12.5,15.5,18.5,21.5, 25,28,31,34,37,40,43,46, 49,52,55,58,61,64,67,70, 73,76,79,82,85,86.5,88,89.6]
for k in range(4):
    ims=[]
    for t in T[k*8:(k+1)*8]:
        p=f'{Q}/f_{t:05.1f}.png'
        subprocess.run(['ffmpeg','-nostdin','-y','-v','error','-ss',str(t),'-i',F,'-frames:v','1',p],check=True)
        ims.append(Image.open(p).convert('RGB').resize((360,640),Image.LANCZOS))
    M=Image.new('RGB',(360*4,640*2))
    for i,im in enumerate(ims): M.paste(im,((i%4)*360,(i//4)*640))
    M.save(f'{Q}/final_sheet_{k+1}.png'); print('sheet',k+1,T[k*8:(k+1)*8])
