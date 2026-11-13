"""Episode 7 narration in Voice 4 (Kokoro am_michael), same treatment chain as Episode 4."""
import sys, re, json, numpy as np, soundfile as sf, scipy.signal as ss
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer
k = Kokoro('model/kokoro-v1.0.int8.onnx', 'model/voices-v1.0.bin'); tok = Tokenizer()
VOICE = 'am_michael'
# pronunciation fixes (espeak guesses are wrong for these)
FIX = {'Methuselah': 'məθˈuːzələ', 'Lamech': 'lˈeɪmɛk', 'Mahalalel': 'mɐhˈælɐlˌɛl', 'Kenan': 'kˈiːnən', 'Noah': 'nˈoʊə', 'Enoch': 'ˈiːnək', 'Shem': 'ʃˈɛm', 'Ham': 'hˈæm', 'Japheth': 'dʒˈeɪfɛθ'}
PAT = re.compile(r'\b(' + '|'.join(FIX) + r')\b')
def phon(text):
    out = []
    for part in PAT.split(text):
        if part in FIX: out.append(FIX[part])
        elif part.strip(): out.append(tok.phonemize(part, 'en-us'))
        else: out.append(part)
    return ' '.join(o.strip() for o in out if o.strip())
LINES = [
 ('a1', 0.90, "God called Noah to enter the ark with his household, for Noah had been found righteous in his generation."),
 ('b1', 0.92, "Noah was six hundred years old when the waters of the Flood came upon the earth."),
 ('c1', 0.95, "He entered the ark with his wife, his sons, Shem, Ham, and Japheth, and their wives."),
 ('c2', 0.95, "The animals came as God had commanded, and Noah did everything the Lord had told him."),
 ('d', 0.85, "Then the appointed day arrived."),
 ('e1', 1.04, "The fountains of the great deep burst forth, and the windows of the heavens were opened."),
 ('e2', 1.05, "Rain fell upon the earth for forty days and forty nights."),
 ('f1', 1.05, "The waters rose and lifted the ark high above the ground."),
 ('f2', 1.08, "They grew stronger, covering the land until even the high mountains beneath the heavens were covered."),
 ('g', 1.1, "Every living creature outside the ark perished, and the waters prevailed upon the earth for one hundred and fifty days."),
 ('h1', 0.94, "Sometimes, doing what is right means trusting God before we can see the outcome."),
 ('h2', 0.94, "We may face uncertainty, difficult choices, or storms we never expected."),
 ('h3a', 0.94, "We cannot control everything that comes our way,"),
 ('h3b', 0.96, "but we can choose to remain faithful, act with integrity, and place our hope in God."),
 ('i', 0.9, "Will you trust God when you cannot see what lies ahead?"),
]
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
only = set(sys.argv[1:])
try: meta = json.load(open('out_ep7/meta.json'))['dur']
except Exception: meta = {}
sp_over = {}
for name, sp, text in LINES:
    if only and name not in only: continue
    s, sr = k.create(phon(text), voice=VOICE, speed=sp, lang='en-us', is_phonemes=True); s = np.asarray(s, np.float32)
    nz = np.where(np.abs(s) > 0.01)[0]; s = s[nz[0]:nz[-1] + 1]; s = treat(s, sr)
    sf.write(f'out_ep7/{name}.wav', s, sr); meta[name] = round(len(s) / sr, 2); print(name, sp, meta[name], flush=True)
json.dump({'sr': 24000, 'dur': meta, 'voice': VOICE}, open('out_ep7/meta.json', 'w'))
