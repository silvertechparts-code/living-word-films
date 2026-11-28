#!/bin/bash
# sequential shards of 450 frames (15 s each) -> ep41_render/seg_N.mp4 (silent, crf 14); resumable
S=/root/.claude/skills/synced/497c519d-95fe-487b-af04-1e6b687d8988_7b4c4eb5-ff00-4e40-abbd-600fa2c1eca5/video-from-code/scripts
cd /home/claude
for k in 0 1 2 3 4 5; do
  a=$((k*450)); b=$(((k+1)*450)); out=ep41_render/seg_$k.mp4
  if [ -s $out ] && ffprobe -v error -show_entries format=duration -of csv=p=0 $out >/dev/null 2>&1; then echo "skip $k"; continue; fi
  echo "start shard $k $a:$b $(date +%T)"
  python3 $S/render.py video g11/ep41.html ep41_render/tmp_$k.mp4 --fps 30 --subframes 1 --workers 2 --crf 14 --range $a:$b > ep41_render/log_$k.txt 2>&1 && mv ep41_render/tmp_$k.mp4 $out && echo "done shard $k $(date +%T)"
done
echo ALLDONE $(date +%T)
