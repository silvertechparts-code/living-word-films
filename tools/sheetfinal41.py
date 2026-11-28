import subprocess, sys
from PIL import Image
F='ep41_out/LivingWord_Ep41_Genesis41_FromPrisonToPalace.mp4'; Q='ep41_qc/final'
T=[0.3,3,6.5,9.5,12.5,15.5,18.5,21.5, 24,27,30,33,35.6,38,42,45, 48,50,52.5,55,57.5,59.6,63,67, 70,73,76,79,82,85.6,87.5,89.6]
for k in range(4):
    ims=[]
    for t in T[k*8:(k+1)*8]:
        p=f'{Q}/f_{t:05.1f}.png'
        subprocess.run(['ffmpeg','-nostdin','-y','-v','error','-ss',str(t),'-i',F,'-frames:v','1',p],check=True)
        ims.append(Image.open(p).convert('RGB').resize((380,640),Image.LANCZOS))
    M=Image.new('RGB',(380*4,640*2))
    for i,im in enumerate(ims): M.paste(im,((i%4)*380,(i//4)*640))
    M.save(f'{Q}/final_sheet_{k+1}.png'); print('sheet',k+1,T[k*8:(k+1)*8])
