#!/bin/bash
# usage: sheet8.sh out.png t1,t2,... [cols] [thumb]
S=/root/.claude/skills/synced/497c519d-95fe-487b-af04-1e6b687d8988_7b4c4eb5-ff00-4e40-abbd-600fa2c1eca5/video-from-code/scripts
python3 $S/render.py sheet /home/claude/g11/ep8.html /home/claude/ep8_qc/$1 --times $2 --cols ${3:-4} --thumb ${4:-360} 2>&1 | tail -3
