# Explainer video sources

Built with the paper-talk-pipeline stages: `slides.json` (single content source, validated with
`validate_slides.py`) → `build.py render` (HTML slides → 1920×1080 frames via headless Chrome)
→ `build.py tts` (Kokoro `af_heart`, speed 0.95) → `build.py assemble` (ffmpeg: per-slide
segments with a gentle push-in, concat, SRT/VTT from the real audio durations).
`showreel.py` renders the hero montage from `assets/showcase`. Set `BHA_REPO` to the site root.
