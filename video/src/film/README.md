# Animated film (motion-graphics version)

`film.html` is a time-driven scene graph: `window.seek(t)` lays out every element for absolute
time `t` (word-by-word type reveals, count-ups, growing bars, noise-to-image materialisation,
orbiting teachers, camera push-ins, crossfades). `record.mjs` drives it with puppeteer-core and
the installed Chrome, capturing one JPEG per frame at 30 fps; scene starts and sentence cues
come from the narration timeline (`../timeline.json`, `../audio/tts_manifest.json`).
`assemble.sh` pads/concatenates the narration, ducks the synthesized ambient bed under the voice
(sidechain compression) and encodes the master and web versions.

    npm i puppeteer-core@23
    BHA_REPO=<site root> node record.mjs stills   # review frames
    BHA_REPO=<site root> node record.mjs all      # ~5 800 frames
    ./assemble.sh

# Brand film (`brand.html`)

An 84-second cinematic piece in the style of recent lab films (annotated real signal, poetic
lines, a cream serif end card) — no narration, only a felt-piano cue. `brand.html` is the same
kind of time-driven scene graph; `record2.mjs` is a generic recorder for any such page and
injects the showcase pairs, the participant-08 EEG averages and the attribution maps from the
site's assets. `synth.py` renders the piano cue with numpy. The published `video/brand.mp4`
is trimmed to 78 s with a video and audio fade on the end card.

    BHA_REPO=<site root> node record2.mjs brand.html stills stills_brand 2 12 20 30 42 55 63 70 80
    BHA_REPO=<site root> node record2.mjs brand.html all frames_brand
    ../../../../kokoro/venv/bin/python synth.py          # brand_music.wav
    ffmpeg -framerate 30 -i frames_brand/f%05d.jpg -i brand_music.wav \
      -filter_complex "[1:a]atrim=0:84,afade=t=out:st=79:d=5,volume=0.9[a]" -map 0:v -map "[a]" \
      -c:v libx264 -crf 19 -pix_fmt yuv420p -c:a aac -shortest -movflags +faststart brand_master.mp4
    ffmpeg -i brand_master.mp4 -t 78 -vf fade=t=out:st=75:d=3 -af afade=t=out:st=74:d=4 \
      -c:v libx264 -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart brand.mp4
