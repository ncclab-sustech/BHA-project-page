#!/bin/bash
set -e
SP="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SP/film"
# narration: pad each slide wav (0.5 s in, 0.9 s out) and concatenate, matching the timeline
python3 - <<'PY'
import json, subprocess, os
man=json.load(open("../explainer/audio/tts_manifest.json"))
parts=[]
for i,m in enumerate(man["slides"]):
    dur=0.5+m["duration"]+0.9
    out=f"seg_{i:02d}.wav"
    subprocess.run(["ffmpeg","-y","-v","error","-i",m["wav"],"-af",f"adelay=500|500,apad=whole_dur={dur:.3f}","-ar","48000","-ac","2",out],check=True)
    parts.append(out)
open("narr_list.txt","w").write("".join(f"file '{p}'\n" for p in parts))
PY
ffmpeg -y -v error -f concat -safe 0 -i narr_list.txt -c:a pcm_s16le narration.wav
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 narration.wav)
# mix: music ducked under the voice
ffmpeg -y -v error -i narration.wav -i music_bed.wav -filter_complex "[0:a]asplit=2[v1][v2];[1:a]atrim=0:${DUR},volume=0.16,afade=t=out:st=$(python3 -c "print(max(0,float('$DUR')-5))"):d=5[m];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=700[md];[v1][md]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]" -map "[a]" -ar 48000 -c:a pcm_s16le mix.wav
# video
ffmpeg -y -v error -framerate 30 -i frames/f%05d.jpg -i mix.wav -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart film_master.mp4
ffmpeg -y -v error -i film_master.mp4 -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart film_web.mp4
ls -la film_master.mp4 film_web.mp4
