import os, sys, json, math, random
from PIL import Image, ImageFilter, ImageDraw
src = sys.argv[1]; out = sys.argv[2]
W, H, FPS, DUR = 1280, 720, 30, 24
COLS, ROWS, T = 5, 3, 256
names = json.load(open(os.path.join(src, "ids.json")))
random.seed(5); names=names[:30]; random.shuffle(names)
tiles = names[:COLS*ROWS]
def load(n, k):
    return Image.open(os.path.join(src, f"{n}_{k}.jpg")).convert("RGB").resize((T, T), Image.LANCZOS)
imgs = [(load(n, "gt"), load(n, "gen0")) for n in tiles]
# per-tile schedule: period 8s, offset staggered
offs = [random.uniform(0, 8) for _ in tiles]
noise = [Image.effect_noise((T, T), 64).convert("RGB") for _ in range(8)]
os.makedirs(out, exist_ok=True)
frames = FPS * DUR
yoff = (ROWS*T - H)//2
for f in range(frames):
    t = f / FPS
    canvas = Image.new("RGB", (COLS*T, ROWS*T), (8, 10, 18))
    for i, (gt, gen) in enumerate(imgs):
        ph = ((t + offs[i]) % 8.0)
        # 0-3.2: gt ; 3.2-4.0: dissolve through noise to gen ; 4.0-7.2: gen ; 7.2-8: back
        if ph < 3.2: img = gt
        elif ph < 4.0:
            a = (ph - 3.2) / 0.8
            # noise burst in the middle of the transition
            n = noise[f % 8]
            if a < 0.5:
                k = a / 0.5
                img = Image.blend(gt, n, k * 0.85)
                img = img.filter(ImageFilter.GaussianBlur(k * 6))
            else:
                k = (a - 0.5) / 0.5
                img = Image.blend(n, gen, k)
                img = img.filter(ImageFilter.GaussianBlur((1 - k) * 6))
        elif ph < 7.2: img = gen
        else:
            a = (ph - 7.2) / 0.8
            img = Image.blend(gen, gt, a)
        x, y = (i % COLS) * T, (i // COLS) * T
        canvas.paste(img, (x, y))
    canvas = canvas.crop((0, yoff, W, yoff + H))
    canvas.save(os.path.join(out, f"f{f:05d}.jpg"), quality=88)
print("frames", frames)
