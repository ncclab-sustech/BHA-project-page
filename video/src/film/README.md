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
