import sys, json, numpy as np, soundfile as sf
d = sys.argv[1]; min_ms = float(sys.argv[2]) if len(sys.argv) > 2 else 90
meta = json.load(open(f'{d}/meta.json'))['dur']
for k in meta:
    x, sr = sf.read(f'{d}/{k}.wav'); x = np.abs(x); w = int(sr * .01)
    env = np.array([x[i:i + w].max() for i in range(0, len(x) - w, w)]); thr = 0.02 * env.max()
    sil = env < thr; out = []; i = 0
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]: j += 1
            if (j - i) * 10 >= min_ms: out.append((round(i * .01, 2), round(j * .01, 2)))
            i = j
        else: i += 1
    print(k, round(len(x) / sr, 2), out)
