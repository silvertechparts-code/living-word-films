"""Episode 14 narration in Voice 4 (Kokoro am_michael), same treatment chain as Episode 8.
Usage: python3 gen_ep14_vo.py            -> writes out_ep14/*.wav and out_ep14/meta.json
       python3 gen_ep14_vo.py --measure  -> only prints durations (no files), for fitting the script to the timeline
"""
import sys, re, json, numpy as np, soundfile as sf, scipy.signal as ss
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer
k = Kokoro('model/kokoro-v1.0.int8.onnx', 'model/voices-v1.0.bin'); tok = Tokenizer()
VOICE = 'am_michael'
FIX = {'Noah': 'nˈoʊə', 'Shem': 'ʃˈɛm', 'Ham': 'hˈæm', 'Japheth': 'dʒˈeɪfɛθ', 'Canaan': 'kˈeɪnən', 'Cush': 'kˈʌʃ', 'Nimrod': 'nˈɪmɹɑd', 'Babel': 'bˈeɪbəl',
       'Assyria': 'əsˈɪɹiə', 'Nineveh': 'nˈɪnɪvə', 'Elam': 'ˈiləm', 'Asshur': 'ˈæʃɚ', 'Arpachshad': 'ɑɹpˈækʃæd', 'Lud': 'lˈʌd', 'Aram': 'ˈɛɹəm', 'Eber': 'ˈibɚ',
       'Peleg': 'pˈilɛɡ', 'Joktan': 'dʒˈɑktæn', 'Put': 'pˈʊt', 'Shinar': 'ʃˈaɪnɑɹ', 'Terah': 'tˈɛɹə', 'Abram': 'ˈeɪbɹəm', 'Sarai': 'sˈɛɹaɪ', 'Ur': 'ˈɜɹ', 'Haran': 'hˈɛɹən', 'Terah’s': 'tˈɛɹəz', 'Abram’s': 'ˈeɪbɹəmz', 'Shem’s': 'ʃˈɛmz', 'Shechem': 'ʃˈɛkəm', 'Bethel': 'bˈɛθɛl', 'Pharaoh': 'fˈɛɹoʊ', 'Lot': 'lˈɑt', 'Egypt': 'ˈidʒɪpt', 'Sodom': 'sˈɑdəm', 'Mamre': 'mˈæmɹi', 'Hebron': 'hˈibɹən', 'Melchizedek': 'mɛlkˈɪzədɛk', 'Salem': 'sˈeɪləm', 'Dan': 'dˈæn'}
PAT = re.compile(r"\b(" + '|'.join(sorted((k for k in FIX if '’' not in k), key=len, reverse=True)) + r")('s)?\b")
def poss(ph):
    last = ph[-1]
    if last in 'ʃʒ': return 'ɪz'
    return 's' if last in 'θkptf' else 'z'
def phon(text):
    out = []; pos = 0
    for m in PAT.finditer(text):
        pre = text[pos:m.start()]
        if pre.strip(): out.append(tok.phonemize(pre, 'en-us'))
        ph = FIX[m.group(1)]; out.append(ph + (poss(ph) if m.group(2) else '')); pos = m.end()
    rest = text[pos:]
    if rest.strip(): out.append(tok.phonemize(rest, 'en-us'))
    return ' '.join(o.strip() for o in out if o.strip())
LINES = json.load(open('ep14_lines.json'))  # [[id, speed, text], ...]
def treat(x, sr):
    sos = lambda *a, **kw: ss.butter(*a, **kw, output='sos')
    x = ss.sosfilt(sos(2, 70, 'hp', fs=sr), x)
    x = x + .55 * ss.sosfilt(sos(2, 220, 'lp', fs=sr), x) * 0.5
    x = x + .25 * ss.sosfilt(sos(2, [2200, 5200], 'bp', fs=sr), x)
    env = np.abs(x); r = np.exp(-1 / (.12 * sr)); e = np.zeros_like(env); c = 0.
    for i in range(len(env)):
        c = env[i] if env[i] > c else env[i] + (c - env[i]) * r; e[i] = c
    g = np.where(e > .12, (.12 + (e - .12) / 2.6) / (e + 1e-9), 1.0); g = ss.sosfiltfilt(sos(1, 40, 'lp', fs=sr), g)
    return (x * g).astype(np.float32)
measure = '--measure' in sys.argv
only = set(a for a in sys.argv[1:] if not a.startswith('--'))
meta = {}
for name, sp, text in LINES:
    if only and name not in only: continue
    s, sr = k.create(phon(text), voice=VOICE, speed=sp, lang='en-us', is_phonemes=True); s = np.asarray(s, np.float32)
    nz = np.where(np.abs(s) > 0.01)[0]; s = s[nz[0]:nz[-1] + 1]
    if not measure:
        s = treat(s, sr); sf.write(f'out_ep14/{name}.wav', s, sr)
    meta[name] = round(len(s) / sr, 2); print(name, sp, meta[name], len(text.split()), 'words', flush=True)
if not measure: json.dump({'sr': 24000, 'dur': meta, 'voice': VOICE}, open('out_ep14/meta.json', 'w'))
else: print('story total', round(sum(v for n, v in meta.items() if n[0] in 'abcde'), 2), 'refl total', round(sum(v for n, v in meta.items() if n[0] == 'h'), 2))
