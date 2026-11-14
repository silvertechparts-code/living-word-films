#!/bin/bash
# usage: encode9.sh  -> ep10_out/LivingWord_Ep10_Genesis10_OneHumanFamily.mp4 (two-pass ABR 8000k, AAC 192k)
# Joins ep10_render/seg_0..5.mp4 (silent, crf 14) and muxes music/out10/ep10_narrated_mix.wav. Same targets as Ep8.
set -e
cd /home/claude
R=ep10_render; O=ep10_out; N=LivingWord_Ep10_Genesis10_OneHumanFamily
printf "file 'seg_%s.mp4'\n" 0 1 2 3 4 5 > $R/list.txt
for k in 0 1 2 3 4 5; do [ -s $R/seg_$k.mp4 ] || { echo "missing seg_$k"; exit 1; }; done
ffmpeg -y -v error -f concat -safe 0 -i $R/list.txt -c copy $R/ep10_joined.mp4
ffmpeg -y -v error -i music/out10/ep10_narrated_mix.wav -c:a aac -b:a 192k -ar 48000 -ac 2 $R/ep10_audio.m4a
X="-c:v libx264 -preset ${PRESET:-medium} -b:v 8000k -maxrate 12000k -bufsize 16000k -pix_fmt yuv420p -profile:v high -g 60 -r 30"
echo "pass1 $(date +%T)"
ffmpeg -y -v error -i $R/ep10_joined.mp4 -an $X -pass 1 -passlogfile $R/ep10_pass -f mp4 /dev/null
echo "pass2 $(date +%T)"
ffmpeg -y -v error -i $R/ep10_joined.mp4 -i $R/ep10_audio.m4a -map 0:v:0 -map 1:a:0 $X -pass 2 -passlogfile $R/ep10_pass -c:a copy -movflags +faststart -t 90 $O/$N.mp4
echo "done $(date +%T)"
ls -l $O/$N.mp4
sha256sum $O/$N.mp4 | tee $O/$N.mp4.sha256
