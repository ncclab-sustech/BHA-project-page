#!/usr/bin/env python3
"""BHA explainer builder: render | tts | assemble  (paper-talk-pipeline stages)."""
import json, os, re, subprocess, sys, math, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.environ.get("BHA_REPO")
SHOW = os.path.join(REPO, "assets", "showcase")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
S = json.load(open(os.path.join(HERE, "slides.json")))
SLIDES = S["slides"]
W, H, FPS = 1920, 1080, 30
for d in ["slides", "frames", "audio", "segments", "video"]:
    os.makedirs(os.path.join(HERE, d), exist_ok=True)

# ---------------- visuals ----------------
def eeg_svg(width=900, height=520, chans=8):
    d = json.load(open(os.path.join(REPO, "assets", "eeg_sub08.json")))
    tr = d["trials"][3]["avg"]
    out = []
    row = height / (chans + 1)
    for c in range(chans):
        ch = tr[c]
        sd = (sum(v * v for v in ch) / len(ch)) ** 0.5 or 1
        pts = []
        for i, v in enumerate(ch):
            x = i / (len(ch) - 1) * width
            y = row * (c + 1) - (v / sd) * row * 0.42
            pts.append(f"{x:.1f},{y:.1f}")
        col = "#9fd0ff" if c >= chans - 3 else "rgba(255,255,255,.35)"
        wdt = 2.4 if c >= chans - 3 else 1.6
        out.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{col}" stroke-width="{wdt}" stroke-linejoin="round"/>')
    return f'<svg viewBox="0 0 {width} {height}" width="{width}" height="{height}">{"".join(out)}</svg>'

def img(id_, kind):
    return "file://" + os.path.join(SHOW, f"{id_}_{kind}.jpg")

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;overflow:hidden;background:#0b1020;color:#fff;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0;background:#0b1020}
.aur{position:absolute;inset:-30%;filter:blur(90px);opacity:.9;background:
 radial-gradient(32% 32% at 22% 35%,rgba(43,92,255,.55),transparent 70%),
 radial-gradient(28% 28% at 78% 28%,rgba(124,58,237,.45),transparent 70%),
 radial-gradient(24% 24% at 58% 82%,rgba(255,61,129,.32),transparent 70%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:80px 80px;mask-image:radial-gradient(70% 70% at 50% 50%,#000 20%,transparent 80%)}
.slide{position:absolute;inset:0;padding:96px 120px}
.kicker{font-family:'JetBrains Mono',monospace;font-size:24px;letter-spacing:.16em;text-transform:uppercase;color:#9fd0ff;margin-bottom:28px}
h1{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:84px;line-height:1.02;letter-spacing:-.035em;max-width:1500px}
h1 .g{background:linear-gradient(95deg,#06c7f1,#2b5cff 30%,#7c3aed 65%,#ff3d81);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{font-size:30px;color:rgba(255,255,255,.72);margin-top:22px;max-width:1300px;line-height:1.45}
.brand{position:absolute;left:120px;bottom:60px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:26px;letter-spacing:.06em;display:flex;align-items:center;gap:14px}
.brand i{width:18px;height:18px;border-radius:5px;transform:rotate(45deg);background:linear-gradient(95deg,#06c7f1,#2b5cff,#7c3aed,#ff3d81)}
.foot{position:absolute;right:120px;bottom:60px;font-family:'JetBrains Mono',monospace;font-size:20px;color:rgba(255,255,255,.45)}
.card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:28px;backdrop-filter:blur(12px)}
.mono{font-family:'JetBrains Mono',monospace}
.grad{background:linear-gradient(95deg,#06c7f1,#2b5cff 30%,#7c3aed 65%,#ff3d81)}
.gradtxt{background:linear-gradient(95deg,#06c7f1,#2b5cff 30%,#7c3aed 65%,#ff3d81);-webkit-background-clip:text;background-clip:text;color:transparent}
"""

def shell(kicker, title, body, foot="", title_size=None, bg_image=None):
    ts = f"style='font-size:{title_size}px'" if title_size else ""
    bgi = ""
    if bg_image:
        bgi = (f"<div style=\"position:absolute;inset:0;background:url('file://{bg_image}') center/cover;filter:saturate(1.1)\"></div>"
               "<div style=\"position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,16,32,.95) 0%,rgba(11,16,32,.82) 45%,rgba(11,16,32,.35) 100%)\"></div>")
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body><div class="bg"></div>{bgi}<div class="aur" style="{'opacity:.55' if bg_image else ''}"></div><div class="grid"></div>
<div class="slide"><div class="kicker">{kicker}</div><h1 {ts}>{title}</h1>{body}</div>
<div class="brand"><i></i>BHA</div><div class="foot">{foot}</div></body></html>"""

def slide_hook(s):
    body = """<div class="sub" style="font-size:36px;margin-top:34px">Non-invasive brain decoding with EEG and MEG.<br>No surgery. No implants. Just a cap of electrodes.</div>"""
    return shell(s["kicker"], 'See what<br>the brain <span class="g">sees.</span>', body, "a three-minute explainer", 118, bg_image=os.path.join(REPO, "video", "showreel_poster.jpg"))

def slide_setup(s):
    facts = [("63", "electrodes on the scalp"), ("250 Hz", "sampling rate"), ("16,540", "training images per person"), ("200", "held-out test images"), ("10 + 4", "EEG and MEG participants")]
    cards = "".join(f'<div class="card" style="padding:26px 30px"><div class="gradtxt" style="font-family:\'Plus Jakarta Sans\';font-weight:800;font-size:54px;line-height:1">{a}</div><div style="font-size:22px;color:rgba(255,255,255,.7);margin-top:8px">{b}</div></div>' for a, b in facts)
    body = f"""<div style="display:grid;grid-template-columns:1.25fr 1fr;gap:48px;margin-top:48px;align-items:stretch">
<div class="card" style="padding:28px;position:relative;overflow:hidden">{eeg_svg(1000, 540)}<div class="mono" style="position:absolute;right:30px;top:24px;font-size:20px;color:#9fd0ff">real EEG · participant 08 · 1 000 ms</div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;align-content:start">{cards}</div></div>"""
    return shell(s["kicker"], s["title"], body, "THINGS-EEG2 · THINGS-MEG (public benchmarks)", 72)

def box(label, sub="", w=300, accent=False, icon=""):
    bg = "linear-gradient(95deg,#2b5cff,#7c3aed)" if accent else "rgba(255,255,255,.07)"
    return f'<div class="card" style="width:{w}px;padding:30px 28px;text-align:center;background:{bg}"><div style="font-size:40px">{icon}</div><div style="font-family:\'Plus Jakarta Sans\';font-weight:800;font-size:34px;line-height:1.15">{label}</div><div style="font-size:21px;color:rgba(255,255,255,.72);margin-top:8px">{sub}</div></div>'

ARROW = '<div style="font-size:56px;color:#9fd0ff;align-self:center">→</div>'

def slide_prior(s):
    body = f"""<div style="display:flex;gap:34px;align-items:center;margin-top:90px;justify-content:center">
{box("Brain signal", "EEG / MEG", 340, icon="〰")}{ARROW}{box("Predict CLIP features", "one vision model", 420, icon="◎")}{ARROW}
<div style="display:flex;flex-direction:column;gap:22px">{box("Search a gallery", "retrieval", 380, icon="⌕")}{box("Drive a generator", "reconstruction", 380, icon="✦")}</div></div>
<div class="sub" style="text-align:center;margin:70px auto 0;max-width:1400px">The standard recipe. It works — and it silently decides <b style="color:#fff">which vision model to imitate.</b></div>"""
    return shell(s["kicker"], s["title"], body, "prior work · 2023 – 2026", 72)

def slide_problem(s):
    src = img("cheetah", "gt")
    models = [("CLIP", "meaning", "none"), ("DINOv2", "shape & parts", "grayscale(1) contrast(1.6)"), ("MAE", "texture & layout", "blur(6px) saturate(.6)"), ("DFN", "web semantics", "saturate(1.9) hue-rotate(12deg)")]
    cards = "".join(f'<div class="card" style="padding:18px;overflow:hidden"><img src="{src}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:18px;filter:{f}"><div style="font-family:\'Plus Jakarta Sans\';font-weight:800;font-size:34px;margin-top:18px">{m}</div><div style="font-size:22px;color:rgba(255,255,255,.7)">sees <b style="color:#fff">{d}</b></div></div>' for m, d, f in models)
    body = f'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:28px;margin-top:54px">{cards}</div><div class="sub" style="text-align:center;margin-top:40px">Pick one and you throw the rest away. Average them and you blur their differences.</div>'
    return shell(s["kicker"], s["title"], body, "same photo · four vision models", 72)

def slide_idea(s):
    teachers = ["OpenCLIP", "DFN", "MAE", "DINOv2"]
    tboxes = "".join(f'<div class="card" style="padding:18px 26px;font-family:\'JetBrains Mono\';font-size:26px;text-align:center;background:rgba(122,162,255,.14);border-color:rgba(122,162,255,.5)">{t}</div>' for t in teachers)
    body = f"""<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:50px">
<div class="card" style="padding:40px">
 <div class="kicker" style="margin-bottom:18px;color:#c7d2ff">Stage 1 · learn together</div>
 <div style="display:flex;align-items:center;gap:30px">
  <div class="grad" style="width:190px;height:190px;border-radius:50%;display:grid;place-items:center;font-family:'Plus Jakarta Sans';font-weight:800;font-size:40px;box-shadow:0 0 70px rgba(124,58,237,.7)">BHA</div>
  <div style="font-size:50px;color:#9fd0ff">⇆</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;flex:1">{tboxes}</div>
 </div>
 <div style="font-size:26px;color:rgba(255,255,255,.75);margin-top:26px">One brain model, supervised by four vision teachers at once.</div>
</div>
<div class="card" style="padding:40px">
 <div class="kicker" style="margin-bottom:18px;color:#c7d2ff">Stage 2 · compose</div>
 <div style="display:flex;align-items:center;gap:26px">
  <div class="card" style="width:190px;height:190px;border-radius:50%;display:grid;place-items:center;font-family:'Plus Jakarta Sans';font-weight:800;font-size:34px;line-height:1.1;text-align:center;background:rgba(255,255,255,.08)">BHA<br><span style="font-size:20px;color:#9fd0ff">frozen ❄</span></div>
  <div style="font-size:50px;color:#9fd0ff">→</div>
  <div style="flex:1;display:grid;gap:12px">
   <div class="card" style="padding:16px 22px;font-size:26px">4 teacher read-outs <span style="color:rgba(255,255,255,.55)">+ learned weights</span></div>
   <div class="card" style="padding:16px 22px;font-size:26px;background:linear-gradient(95deg,rgba(43,92,255,.5),rgba(124,58,237,.5))">compose → retrieval</div>
   <div class="card" style="padding:16px 22px;font-size:26px">steer a <b>frozen</b> generator → picture</div>
  </div>
 </div>
 <div style="font-size:26px;color:rgba(255,255,255,.75);margin-top:26px">Learned weights decide how much each teacher's opinion counts.</div>
</div></div>"""
    return shell(s["kicker"], s["title"], body, "Beyond Hierarchical Alignment", 72)

def bars(title, rows, maxv=100):
    out = f'<div class="card" style="padding:34px 38px"><div class="kicker" style="margin-bottom:22px;color:#c7d2ff">{title}</div>'
    for name, v, ours in rows:
        fill = "linear-gradient(90deg,#06c7f1,#2b5cff,#7c3aed)" if ours else "rgba(255,255,255,.28)"
        out += f'<div style="display:grid;grid-template-columns:230px 1fr 130px;gap:22px;align-items:center;padding:9px 0;font-size:26px;{"font-weight:700" if ours else "color:rgba(255,255,255,.7)"}"><span>{name}</span><span style="height:26px;border-radius:8px;background:rgba(255,255,255,.08);overflow:hidden"><span style="display:block;height:100%;width:{v/maxv*100:.1f}%;background:{fill};border-radius:8px"></span></span><span class="mono" style="text-align:right;{"color:#c7d2ff" if ours else ""}">{v:.1f}%</span></div>'
    return out + "</div>"

def slide_retrieval(s):
    eeg = [("BHA (ours)", 93.9, True), ("DMSA", 82.6, False), ("LVBP", 80.0, False), ("MBP", 75.7, False), ("HyFI", 68.2, False), ("UBP", 50.9, False)]
    meg = [("BHA (ours)", 68.1, True), ("DMSA", 48.0, False), ("LVBP", 44.0, False), ("HyFI", 35.8, False), ("MBP", 33.9, False), ("UBP", 26.7, False)]
    body = f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:44px">{bars("EEG · Top-1 of 200 candidates", eeg)}{bars("MEG · Top-1 of 200 candidates", meg)}</div><div class="sub" style="margin-top:30px;text-align:center">Ten EEG and four MEG participants · within-subject · gains hold with <b style="color:#fff">25% of the training data</b></div>'
    return shell(s["kicker"], s["title"], body, "Table 1 · THINGS-EEG2 / THINGS-MEG", 72)

def slide_recon(s):
    ids = ["cheetah", "lamb", "strawberry", "goose", "orange", "suit", "panther", "pear"]
    tops = "".join(f'<img src="{img(i,"gt")}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:18px">' for i in ids)
    bots = "".join(f'<img src="{img(i,"gen0")}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:18px;outline:3px solid rgba(124,58,237,.8);outline-offset:-3px">' for i in ids)
    body = f"""<div style="margin-top:40px;display:grid;grid-template-columns:150px 1fr;gap:22px;align-items:center">
<div class="mono" style="font-size:22px;color:rgba(255,255,255,.6)">SEEN</div><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:16px">{tops}</div>
<div class="mono" style="font-size:22px" ><span class="gradtxt">DECODED<br>from EEG</span></div><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:16px">{bots}</div></div>
<div style="display:flex;gap:28px;margin-top:40px;justify-content:center">
<div class="card" style="padding:22px 34px;font-size:28px"><span class="gradtxt" style="font-family:'Plus Jakarta Sans';font-weight:800;font-size:44px">+42%</span>&nbsp; pixel fidelity vs. best prior method</div>
<div class="card" style="padding:22px 34px;font-size:28px"><span class="gradtxt" style="font-family:'Plus Jakarta Sans';font-weight:800;font-size:44px">0 ❄</span>&nbsp; generator weights changed</div></div>"""
    return shell(s["kicker"], s["title"], body, "ten participants · held-out images · frozen SDXL-Turbo", 72)

def slide_qa(s):
    q = s["questions"]
    cards = "".join(f'<div class="card" style="padding:44px 48px"><div class="kicker" style="color:#c7d2ff;margin-bottom:16px">Q</div><div style="font-family:\'Plus Jakarta Sans\';font-weight:800;font-size:46px;line-height:1.1">{x["prompt"]}</div><div style="font-size:28px;color:rgba(255,255,255,.78);margin-top:26px;line-height:1.45">{x["answer"]}</div></div>' for x in q)
    body = f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:60px">{cards}</div>'
    return shell(s["kicker"], s["title"], body, "reviewer discussion", 66)

def slide_close(s):
    body = """<div style="display:flex;gap:22px;margin-top:50px;flex-wrap:wrap">
<div class="card" style="padding:20px 34px;font-size:30px">Non-invasive</div><div class="card" style="padding:20px 34px;font-size:30px">Data-efficient</div><div class="card" style="padding:20px 34px;font-size:30px">Generator-agnostic</div><div class="card" style="padding:20px 34px;font-size:30px">Transparent</div></div>
<div class="sub" style="font-size:34px;margin-top:70px">And this is just the first picture.</div>"""
    return shell(s["kicker"], 'A new interface between<br><span class="g">mind and machine.</span>', body, "manuscript under review · anonymous", 104)

BUILDERS = dict(hook=slide_hook, setup=slide_setup, prior=slide_prior, problem=slide_problem, idea=slide_idea, retrieval=slide_retrieval, recon=slide_recon, qa=slide_qa, close=slide_close)

def render():
    for i, s in enumerate(SLIDES):
        html = BUILDERS[s["kind"]](s)
        p = os.path.join(HERE, "slides", f"{i+1:02d}-{s['id']}.html")
        open(p, "w").write(html)
        png = os.path.join(HERE, "frames", f"{i+1:02d}.png")
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1920,1080", "--virtual-time-budget=6000", f"--screenshot={png}", "file://" + p], check=True, capture_output=True)
        print("rendered", png)
    shutil.copy(os.path.join(HERE, "frames", "01.png"), os.path.join(HERE, "video", "poster.png"))

# ---------------- tts ----------------
def tts():
    import soundfile as sf, numpy as np
    engine = os.environ.get("TTS", "kokoro")
    manifest = {"engine": engine, "slides": []}
    if engine == "kokoro":
        from kokoro_onnx import Kokoro
        kdir = os.path.join(HERE, "..", "kokoro")
        k = Kokoro(os.path.join(kdir, "kokoro-v1.0.onnx"), os.path.join(kdir, "voices-v1.0.bin"))
    for i, s in enumerate(SLIDES):
        txt = s["voice"]
        open(os.path.join(HERE, "audio", f"slide-{i+1:02d}.txt"), "w").write(txt)
        wav = os.path.join(HERE, "audio", f"slide-{i+1:02d}.wav")
        if engine == "kokoro":
            samples, sr = k.create(txt, voice=os.environ.get("VOICE", "af_heart"), speed=float(os.environ.get("SPEED", "0.95")), lang="en-us")
            sf.write(wav, samples, sr)
        else:
            aiff = wav.replace(".wav", ".aiff")
            subprocess.run(["say", "-v", "Samantha", "-r", "175", "-o", aiff, txt], check=True)
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", aiff, "-ar", "24000", "-ac", "1", wav], check=True)
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).decode().strip())
        manifest["slides"].append({"id": s["id"], "wav": wav, "duration": dur})
        print("tts", s["id"], f"{dur:.1f}s")
    json.dump(manifest, open(os.path.join(HERE, "audio", "tts_manifest.json"), "w"), indent=1)

# ---------------- assemble ----------------
def fmt(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")
def fmtv(t):
    return fmt(t).replace(",", ".")

def assemble():
    man = json.load(open(os.path.join(HERE, "audio", "tts_manifest.json")))
    PAD_IN, PAD_OUT = 0.5, 0.9
    cues, chapters, tcur = [], [], 0.0
    seglist = []
    for i, (s, m) in enumerate(zip(SLIDES, man["slides"])):
        dur = PAD_IN + m["duration"] + PAD_OUT
        png = os.path.join(HERE, "frames", f"{i+1:02d}.png")
        seg = os.path.join(HERE, "segments", f"{i+1:02d}.mp4")
        frames = int(round(dur * FPS))
        # slow push-in (Ken Burns) + fades; audio delayed by PAD_IN, padded to dur
        vf = (f"zoompan=z='1+0.045*on/{frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1920x1080:fps={FPS},"
              f"fade=t=in:st=0:d=0.45,fade=t=out:st={dur-0.45:.3f}:d=0.45,format=yuv420p")
        af = f"adelay={int(PAD_IN*1000)}|{int(PAD_IN*1000)},apad=whole_dur={dur:.3f},afade=t=out:st={dur-0.3:.3f}:d=0.3"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-framerate", str(FPS), "-i", png, "-i", m["wav"],
                        "-vf", vf, "-af", af, "-t", f"{dur:.3f}", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                        "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-shortest", seg], check=True)
        seglist.append(seg)
        chapters.append({"slide": i, "title": s["title"], "start": round(tcur, 3)})
        # subtitle cues by sentence, proportional to characters
        sents = [x.strip() for x in re.split(r"(?<=[.!?])\s+", s["voice"]) if x.strip()]
        total = sum(len(x) for x in sents)
        t0 = tcur + PAD_IN
        for x in sents:
            d = m["duration"] * len(x) / total
            cues.append({"slide": i, "start": round(t0, 3), "end": round(t0 + d, 3), "text": x})
            t0 += d
        tcur += dur
        print("segment", i + 1, f"{dur:.1f}s")
    lst = os.path.join(HERE, "segments", "list.txt")
    open(lst, "w").write("".join(f"file '{p}'\n" for p in seglist))
    base = os.path.join(HERE, "video", "explainer.mp4")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", base], check=True)
    json.dump({"duration": round(tcur, 3), "chapters": chapters, "cues": cues}, open(os.path.join(HERE, "timeline.json"), "w"), indent=1)
    with open(os.path.join(HERE, "video", "explainer.srt"), "w") as f:
        for n, c in enumerate(cues, 1):
            f.write(f"{n}\n{fmt(c['start'])} --> {fmt(c['end'])}\n{c['text']}\n\n")
    with open(os.path.join(HERE, "video", "explainer.vtt"), "w") as f:
        f.write("WEBVTT\n\n")
        for c in cues:
            f.write(f"{fmtv(c['start'])} --> {fmtv(c['end'])}\n{c['text']}\n\n")
    print("done", base, f"{tcur:.1f}s")

if __name__ == "__main__":
    {"render": render, "tts": tts, "assemble": assemble}[sys.argv[1]]()
