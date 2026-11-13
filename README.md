# The Living Word Films: production pipeline (Phase 1)

Code that builds the Instagram Reels of the series *The Living Word Films* (one Bible chapter per episode, 90 s, 1080x1920, 30 fps). This is the **Phase 1** pipeline (flat-shaded low-poly three.js page rendered frame by frame). Phase 2 (detailed stylized 3D in Blender) is not started and is not in this repo.

Scripts, narration, captions, owner decisions, QC records and the publish log live in the Claude project "The Living Word Films" (documents `series-operating-rules`, `genesis-8-script-pack-*`, `publish-log`, `automation-plan-*`), not here. **No cloud names, upload presets, tokens or passwords belong in this repo.**

## Layout (mirrors the working directory `/home/claude`; scripts use these absolute paths)
| Folder | What |
|---|---|
| `g11/` | Episode 7 and 8 page source. `src/main8.js` is the Episode 8 entry, `build8.sh` bundles it with the fonts and `assets/logo.png` into one self-contained `ep8.html` (exposes `window.seek(t)`, `window.DURATION`). Needs `npm install` (three, esbuild, @fontsource fonts) |
| `music/` | numpy/scipy score, ambience and effects (`compose7|8_music.py`, `compose7|8_sfx.py`, `lib3*.py`, `synth.py`) and the mix (`mix7|8.py`: ducking under the voice, two-pass loudness to about -14 LUFS) |
| `vo/` | Kokoro TTS narration (`gen_ep7_vo.py`, `gen_ep8_vo.py`, voice `am_michael`) |
| `tools/` | `run_render8.sh` (6 shards of 450 frames, resumable), `sheet8.sh` and `dbg8.py` (contact sheets and one-frame debugging), `qc8_video.sh` and `qc8_sheet.py` (measurements and contact sheets on the final MP4), `subs_proto/` (Malayalam subtitle prototype) |
| `episodes/ep08/` | narration timing (`vo_timing.json`, `vo_meta.json`) and the caption text as posted |

## Run order for an episode (as done for Episode 8)
1. `g11/build8.sh` builds the page. 2. `vo/gen_epN_vo.py` writes the narration clips. 3. `music/composeN_*.py` then `music/mixN.py` write the score and the final mix. 4. `tools/run_render8.sh` renders the frames in shards (about 5 minutes per 15 s shard on 2 CPU cores). 5. Join shards, mux the audio, two-pass x264 to 95 MB or less (about 8 Mbps video, AAC 192k). 6. `tools/qc8_video.sh` and `tools/qc8_sheet.py`, then look at the frames.

## Not in this repo / known gaps
- `render.py` comes from the `video-from-code` skill of the owner's Claude account (path in `run_render8.sh`), not from this repo.
- The Kokoro model files (`vo/model/kokoro-v1.0.int8.onnx`, `voices-v1.0.bin`) are not committed; python packages used: kokoro-onnx, numpy, scipy, soundfile, playwright, pillow, ffmpeg on the PATH.
- Paths are absolute (`/home/claude/...`); a fresh session has to copy the folders there. Making them relative is open work.
- Only Episode 8 has been built from this exact code. Episodes 1 to 7 used earlier source packages that the owner supplied separately.
- Untested: a full run inside a fresh scheduled session.
