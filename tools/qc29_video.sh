#!/bin/bash
# usage: qc29_video.sh final.mp4  -> prints measured facts; writes /home/claude/ep29_qc/final/*
# Measures only. Nothing here replaces watching or listening.
F=$1; Q=/home/claude/ep29_qc/final; mkdir -p $Q
echo "== container/streams"
ffprobe -v error -show_entries stream=index,codec_type,codec_name,profile,width,height,pix_fmt,r_frame_rate,sample_rate,channels,bit_rate,start_time,duration -of compact $F
ffprobe -v error -show_entries format=duration,size,bit_rate -of compact $F
echo "== decoded video frame count"
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $F
echo "== black frames (>=0.1 s)"
ffmpeg -hide_banner -nostats -i $F -an -vf blackdetect=d=0.1:pic_th=0.98 -f null - 2>&1 | grep -E "black_start" || echo none
echo "== frozen video (>=1.0 s, near-identical frames)"
ffmpeg -hide_banner -nostats -i $F -an -vf freezedetect=n=0.0005:d=1.0 -f null - 2>&1 | grep -E "freeze_(start|duration|end)" || echo none
echo "== loudness (EBU R128) and true peak"
ffmpeg -hide_banner -nostats -i $F -vn -af ebur128=peak=true -f null - 2>&1 | awk '/Summary:/{f=1} f' | grep -E "I:|LRA:|Peak:"
echo "== silence (>=1.0 s below -50 dB)"
ffmpeg -hide_banner -nostats -i $F -vn -af silencedetect=n=-50dB:d=1.0 -f null - 2>&1 | grep silence_ || echo none
