"""Episode 40 final mix: narration + score + nature ambience + sound effects -> loudness-normalised WAVs."""
import sys, json, subprocess, numpy as np, soundfile as sf, scipy.signal as ss
sys.path.insert(0, '/home/claude/music')
from synth import SR, make_ir
from scipy.signal import fftconvolve
O = '/home/claude/music/out40/'; V = '/home/claude/vo/out_ep40/'
N = int(90.0 * SR)
def fit(x):
    y = np.zeros((N, 2), np.float32); n = min(N, len(x)); y[:n] = x[:n]; return y
music = fit(sf.read(O + 'music.wav')[0]); amb = fit(sf.read(O + 'amb.wav')[0]); sfx = fit(sf.read(O + 'sfx.wav')[0])
PLACE = {'a1': 0.6, 'a2': 8.9, 'b1': 17.6, 'b2': 25.6, 'c1': 32.1, 'c2': 42.1, 'd1': 48.0, 'd2': 52.6, 'e1': 58.0, 'h1': 61.5, 'h2': 69.5, 'h3': 74.1, 'h4': 79.6, 'i': 85.3}
# --- narration: level-match every line, light room, place on the timeline
vo = np.zeros(N, np.float32); lines = {}
ir = make_ir(1.1, 5)[0][:int(.9 * SR)] * 1.0
for k, t0 in PLACE.items():
    x, sr = sf.read(V + f'{k}.wav'); x = ss.resample_poly(x, SR, sr).astype(np.float32)
    x = ss.sosfilt(ss.butter(2, 85, 'hp', fs=SR, output='sos'), x)
    rms = np.sqrt(np.mean(x ** 2) + 1e-12); x = x * (0.095 / rms)
    # presence + air (gentle), then small room
    x = x + .22 * ss.sosfilt(ss.butter(2, [2200, 5200], 'bp', fs=SR, output='sos'), x)
    wet = fftconvolve(x, ir)[:len(x)].astype(np.float32); wet *= (np.sqrt(np.mean(x ** 2)) / (np.sqrt(np.mean(wet ** 2)) + 1e-9)) * .16
    x = x * .94 + wet
    fi = int(.03 * SR); x[:fi] *= np.linspace(0, 1, fi); x[-fi:] *= np.linspace(1, 0, fi)
    i = int(t0 * SR); n = min(len(x), N - i); vo[i:i + n] += x[:n]; lines[k] = (t0, round(len(x) / SR, 2))
    print(k, t0, '->', round(t0 + len(x) / SR, 2))
vo_peak = np.abs(vo).max(); print('vo peak', vo_peak)
# --- sidechain: slow-release duck keyed from the narration
env = np.abs(vo); dec = 48; m = len(env) // dec * dec; e_ds = env[:m].reshape(-1, dec).max(1)
att = np.exp(-1 / (.05 * (SR / dec))); rel = np.exp(-1 / (.55 * (SR / dec))); e = np.zeros_like(e_ds); c = 0.
for i in range(len(e_ds)):
    c = e_ds[i] if e_ds[i] > c else e_ds[i] + (c - e_ds[i]) * rel
    e[i] = c
k = np.clip(e / (.55 * np.percentile(e_ds[e_ds > .01], 90)), 0, 1)
k = ss.sosfiltfilt(ss.butter(2, 6, 'lp', fs=SR / dec, output='sos'), k); k = np.clip(k, 0, 1)
kk = np.interp(np.arange(N), np.arange(len(k)) * dec + dec / 2, k)
tt_ = np.arange(N) / SR; depth = 7.0 + 2.0 * np.clip((tt_ - 83) / 3, 0, 1); dmus = 10 ** (-(depth * kk) / 20); damb = 10 ** (-(4.0 * kk) / 20); dsfx = 10 ** (-(3.5 * kk) / 20)
AUTO = np.interp(np.arange(N) / SR, [0, 59, 61, 84.6, 85.0, 90], [0, 0, -1.5, -1.5, -2.5, -2.5]); aut = 10 ** (AUTO / 20)
# --- master fade-out for the non-voice layers; short fade-in
t = np.arange(N) / SR
fo = np.clip((90.0 - t) / 2.0, 0, 1); fo = (fo * fo * (3 - 2 * fo)); fo = np.where(t < 88.0, 1.0, fo)
fi_ = np.clip(t / .5, 0, 1)
bed = fo * fi_
G = dict(music=.55, amb=.26, sfx=.42, vo=1.0)
# level check (Ep40, first pass; refine after measuring): short extra dips where the score or effects peak while the voice speaks, so every word stays clear
_XM = [(0, 0), (79.2, 0), (79.5, -3.5), (83.2, -3.5), (83.8, 0), (85.0, 0), (85.3, -4), (87.8, -4), (88.4, 0), (90, 0)]
_XS = [(0, 0), (62.3, 0), (62.6, -3), (63.3, -3), (63.7, 0), (79.0, 0), (79.3, -4), (83.2, -4), (83.8, 0), (85.0, 0), (85.3, -3.5), (87.6, -3.5), (88.4, 0), (90, 0)]
XM = 10 ** (np.interp(tt_, [a for a, b in _XM], [b for a, b in _XM]) / 20); XS = 10 ** (np.interp(tt_, [a for a, b in _XS], [b for a, b in _XS]) / 20)
m_ = music * (G['music'] * dmus * bed * aut * XM)[:, None]; a_ = amb * (G['amb'] * damb * bed)[:, None]; s_ = sfx * (G['sfx'] * dsfx * bed * XS)[:, None]
vo_st = np.stack([vo, vo], 1) * G['vo']

# --- diagnostic: voice vs bed level in each narrated line
def _rms(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
for k_, (t0_, d_) in lines.items():
    i0, i1 = int(t0_ * SR), int((t0_ + d_) * SR)
    v_ = _rms(vo_st[i0:i1, 0]); b_ = _rms((m_ + a_ + s_)[i0:i1]); print('lvl', k_, 'vo %.1f' % v_, 'bed %.1f' % b_, 'gap %.1f' % (v_ - b_), 'bedpeak %.2f' % np.abs((m_ + a_ + s_)[i0:i1]).max())
def write(name, x): sf.write(O + name, x.astype(np.float32), SR)
def norm_two_pass(src, dst, target=-14.0, tp=-1.5):
    f = f'loudnorm=I={target}:TP={tp}:LRA=9:print_format=json'
    r = subprocess.run(['ffmpeg', '-nostdin', '-y', '-i', src, '-af', f, '-f', 'null', '-'], capture_output=True, text=True)
    js = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
    f2 = f"loudnorm=I={target}:TP={tp}:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,alimiter=limit=0.84:level=false"
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-i', src, '-af', f2, '-ar', str(SR), '-c:a', 'pcm_s16le', dst], check=True, capture_output=True)
    return js
full = m_ + a_ + s_ + vo_st
write('pre_full.wav', full); jf = norm_two_pass(O + 'pre_full.wav', O + 'ep40_narrated_mix.wav'); print('full', jf['input_i'], jf['input_tp'])
nov = m_ + a_ + s_
write('pre_nov.wav', nov); jn = norm_two_pass(O + 'pre_nov.wav', O + 'ep40_music_sfx_mix.wav', -15.0); print('no vo', jn['input_i'], jn['input_tp'])
mus_only = music * (G['music'] * bed)[:, None] * .9 * 1.35
write('pre_mus.wav', mus_only); norm_two_pass(O + 'pre_mus.wav', O + 'ep40_score_only.wav', -16.0)
write('pre_vo.wav', vo_st); norm_two_pass(O + 'pre_vo.wav', O + 'ep40_narration_only.wav', -16.0)
json.dump(lines, open(O + 'vo_timing.json', 'w'))
print('done')
