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

# Brand film (`brand4.html`, current)

The published `video/brand.mp4` is the 103-second fourth cut. Changes against the third cut: a
new 8-second chapter at 52 s, "one world, many eyes" (one photograph at the centre, five views
of it: the brain's own reading and the four teachers, under the platonic representation
hypothesis: every eye, human or machine, is looking at the same world); the four-teacher beat
uses the bok choy instead of the bonnet (OpenCLIP lowers the match, DFN and MAE raise it,
DINOv2 splits); the ticker in the pairs montage moves inside a fixed, soft-edged clip box so
no word is cut at the frame edge; the "a film · 2026" stamp is gone. Chapters now run
0 / 12 / 23 / 45 / 52 / 71 / 85 / 97 s. `synth4.py` renders the 103-second cue (flash cuts at
12, 29, 52, 60, 85, 97 s; heartbeat 23–77 s).

    BHA_REPO=<site root> node record2.mjs brand4.html stills stills_b4 39,53.5,57.5,63,70,87,100
    BHA_REPO=<site root> node record2.mjs brand4.html all frames_brand4
    ../../../../kokoro/venv/bin/python synth4.py 103       # brand4_music.wav
    ffmpeg -framerate 30 -i frames_brand4/f%05d.jpg -i brand4_music.wav -c:v libx264 -crf 23 \
      -pix_fmt yuv420p -c:a aac -b:a 160k -shortest brand4.mp4

# Brand film, third cut (`brand3.html`)

The 95-second third cut. Type is Fraunces (600/700, italic
500) with Syne and JetBrains Mono labels at 20 px; every stroke is 2 px or heavier so the film
reads on a phone. Photographs are never shown larger than 580 px: the ten-thousand-pictures beat
and the retrieval beat are mosaics of small tiles. Scenes: an iris opener, the particle cosmos,
the 1924 cream page, a hundred years of lines, the mosaic, the first picture, six seen/decoded
pairs over a dimmed contact sheet, "one in two hundred" (87 of 100 found among 200 candidates,
previous best 83), the four-teacher attribution maps, the radial 300 ms sweep, "a brain it has
never met" (leave-one-subject-out: 22.5 % top-1 against 0.5 % chance, 45×), a crow that gathers
out of 3,200 particles (labelled "imagined, not yet measured"), the cream "what it is for" page,
the cosmos collapse and the end card. `record2.mjs` now passes `--allow-file-access-from-files`
so the particle scene can sample a local image. `synth3.py` renders the cue.

    BHA_REPO=<site root> node record2.mjs brand3.html stills stills_b3 1.5,8,15,22,27,33,42,50,55,61,66,74,80,92
    BHA_REPO=<site root> node record2.mjs brand3.html all frames_brand3
    ../../../../kokoro/venv/bin/python synth3.py 95        # brand3_music.wav
    ffmpeg -framerate 30 -i frames_brand3/f%05d.jpg -i brand3_music.wav -c:v libx264 -crf 23 \
      -pix_fmt yuv420p -c:a aac -b:a 160k -shortest brand3.mp4

# Brand film, second cut (`brand2.html`)

The published `video/brand.mp4` is the 86-second second cut: six chapters (a universe · a century
of listening · the picture · four ways of seeing · a third of a second · what it is for), an
editorial Didone type system (Bodoni Moda + Syne + JetBrains Mono), hard cuts with cream flash
frames, wipes, a stateless 3-D particle cosmos, a 1924 cream "magazine page", a ten-thousand-
pictures rapid montage, a seen/decoded pair montage with a ticker, the attribution maps as four
teachers, a radial 300 ms EEG "sun", and a cream end card. `synth2.py` renders the cue: the felt
piano bed, a 64 bpm heartbeat under chapters III–V, risers and impacts on the flash cuts.

    BHA_REPO=<site root> node record2.mjs brand2.html stills stills_b2 6.5,9,16,22,29.5,34,38.5,45,54,63,72,84
    BHA_REPO=<site root> node record2.mjs brand2.html all frames_brand2
    ../../../../kokoro/venv/bin/python synth2.py 86        # brand2_music.wav
    ffmpeg -framerate 30 -i frames_brand2/f%05d.jpg -i brand2_music.wav -c:v libx264 -crf 23 \
      -pix_fmt yuv420p -c:a aac -b:a 160k -shortest brand2.mp4

# Brand film, first cut (`brand.html`)

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
