"""Episode 8 narration in Voice 4 (Kokoro am_michael), same treatment chain as Episode 4."""
import sys, re, json, numpy as np, soundfile as sf, scipy.signal as ss
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer
k = Kokoro('model/kokoro-v1.0.int8.onnx', 'model/voices-v1.0.bin'); tok = Tokenizer()
VOICE = 'am_michael'
# pronunciation fixes (espeak guesses are wrong for these)
FIX = {'Methuselah': 'məθˈuːzələ', 'Lamech': 'lˈeɪmɛk', 'Mahalalel': 'mɐhˈælɐlˌɛl', 'Kenan': 'kˈiːnən', 'Noah': 'nˈoʊə', 'Enoch': 'ˈiːnək', 'Shem': 'ʃˈɛm', 'Ham': 'hˈæm', 'Japheth': 'dʒˈeɪfɛθ', 'Ararat': 'ˈæɹɐɹˌæt'}
PAT = re.compile(r'\b(' + '|'.join(FIX) + r')\b')
def phon(text):
    out = []
    for part in PAT.split(text):
        if part in FIX: out.append(FIX[part])
        elif part.strip(): out.append(tok.phonemize(part, 'en-us'))
        else: out.append(part)
    return ' '.join(o.strip() for o in out if o.strip())
LINES = [
 ('a1', 0.92, "But God remembered Noah, and every creature with him in the ark."),
 ('b1', 0.96, "He sent a wind over the earth. The rain stopped, and the waters began to sink."),
 ('c1', 0.95, "The ark came to rest on the mountains of Ararat."),
 ('c2', 0.95, "Then the tops of the mountains appeared."),
 ('d', 0.96, "Forty days later, Noah opened the window and sent out a raven."),
 ('e1', 1.0, "Then he sent out a dove, but she found nowhere to rest, and she returned to him."),
 ('e2', 0.98, "A week later, he sent her again. At evening, she came back with a fresh olive leaf in her beak."),
 ('f1', 0.95, "Noah knew the waters had gone down."),
 ('f2', 1.0, "Seven days later, he sent her out once more, and she did not return."),
 ('g1', 1.0, "The earth was dry. God told Noah to come out, with his family and all the animals."),
 ('g2', 0.95, "Noah built an altar to the Lord, and made an offering."),
 ('g3', 0.98, "And God promised never again to curse the ground because of people, and that the seasons would never cease."),
 ('h1', 0.94, "God never forgot Noah, even through more than a year of waiting."),
 ('h2', 0.94, "Hope came slowly, one dove, one small olive leaf at a time."),
 ('h3a', 0.94, "When life feels like waiting, keep trusting."),
 ('h3b', 0.95, "God is still working, even before the water goes down."),
 ('h4', 0.94, "And when your ground is dry again, do what Noah did first: give thanks."),
 ('i', 0.9, "When your storm ends, what will you build first?"),
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
try: meta = json.load(open('out_ep8/meta.json'))['dur']
except Exception: meta = {}
sp_over = {}
for name, sp, text in LINES:
    if only and name not in only: continue
    s, sr = k.create(phon(text), voice=VOICE, speed=sp, lang='en-us', is_phonemes=True); s = np.asarray(s, np.float32)
    nz = np.where(np.abs(s) > 0.01)[0]; s = s[nz[0]:nz[-1] + 1]; s = treat(s, sr)
    sf.write(f'out_ep8/{name}.wav', s, sr); meta[name] = round(len(s) / sr, 2); print(name, sp, meta[name], flush=True)
json.dump({'sr': 24000, 'dur': meta, 'voice': VOICE}, open('out_ep8/meta.json', 'w'))
