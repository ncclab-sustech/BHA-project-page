/* BHA technical report — one chart system, one palette. English only. */
(function () {
  "use strict";
  var C = { grey: "#c9ceda", grey2: "#9aa0b8", ink: "#14172a", muted: "#5f6684", faint: "#9aa0b8", blue: "#2b5cff", violet: "#7c3aed", pink: "#ff3d81", cyan: "#06c7f1", green: "#16a34a", amber: "#f59e0b", grid: "rgba(11,16,32,.08)" };
  var FONT = "Inter, system-ui, sans-serif", MONO = "JetBrains Mono, ui-monospace, monospace";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function T(x, y, str, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || "start") + '" style="font-family:' + (o.mono ? MONO : FONT) + ';font-size:' + (o.fs || 12.5) + 'px;fill:' + (o.c || C.muted) + ';font-weight:' + (o.w || 400) + ';letter-spacing:' + (o.ls || 0) + 'em">' + esc(str) + "</text>";
  }
  function svg(w, h, label, body) { return '<svg class="ch' + (w >= 900 ? " ch--w" : "") + '" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(label) + '">' + body + "</svg>"; }
  function put(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  function title(x, y, s) { return T(x, y, s, { fs: 11, c: C.muted, mono: true, ls: 0.08 }); }

  /* KaTeX */
  if (window.renderMathInElement) renderMathInElement(document.body, { delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }], throwOnError: false });

  /* TOC highlight */
  (function () {
    var links = [].slice.call(document.querySelectorAll(".rp-toc a"));
    var secs = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
    if (!("IntersectionObserver" in window) || !secs.length) return;
    var cur = null;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) cur = e.target; });
      if (!cur) return;
      links.forEach(function (a, i) { a.classList.toggle("is-active", secs[i] === cur); });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });
    secs.forEach(function (s) { if (s) io.observe(s); });
  })();

  /* ---------- horizontal bars ---------- */
  function hbars(o) {
    var W = o.w || 480, rowH = o.rowH || 24, L = o.left || 112, R = o.right || 54, Tp = o.title ? 30 : 10, H = Tp + o.rows.length * rowH + 10;
    var max = o.max, s = "";
    if (o.title) s += title(L, 16, o.title);
    o.rows.forEach(function (r, i) {
      var y = Tp + i * rowH, w = (r.v / max) * (W - L - R), col = r.c || C.grey;
      s += T(L - 10, y + rowH * 0.68, r.n, { a: "end", c: r.c ? C.ink : C.muted, w: r.c ? 600 : 400 });
      s += '<rect x="' + L + '" y="' + (y + 4) + '" width="' + w + '" height="' + (rowH - 8) + '" rx="3" fill="' + col + '"/>';
      s += T(L + w + 8, y + rowH * 0.68, (o.fmt || function (v) { return v; })(r.v), { c: r.c ? r.c : C.muted, w: r.c ? 600 : 400, fs: 12 });
      if (r.note) s += T(W, y + rowH * 0.68, r.note, { a: "end", c: C.faint, fs: 11 });
    });
    if (o.ceil) o.ceil.forEach(function (c) { var x = L + (c.v / max) * (W - L - R); s += '<line x1="' + x + '" x2="' + x + '" y1="' + (Tp - 2) + '" y2="' + (H - 8) + '" stroke="' + C.ink + '" stroke-dasharray="3 3" opacity=".55"/>' + T(x, Tp - 6, c.n, { a: "middle", fs: 10.5, c: C.ink }); });
    return svg(W, H, o.label || o.title || "bar chart", s);
  }
  var pct1 = function (v) { return v.toFixed(1); }, f3 = function (v) { return v.toFixed(3); }, f2 = function (v) { return v.toFixed(2); };

  /* Figure 1 */
  put("fig-eeg", hbars({ title: "THINGS-EEG2 · 10 participants · Top-1 (%)", max: 100, fmt: pct1, rows: [
    { n: "NICE", v: 16.1 }, { n: "ATM-S", v: 28.5 }, { n: "CC-All", v: 35.6 }, { n: "UBP", v: 50.9 }, { n: "NeuroBridge", v: 63.2 }, { n: "HyFI", v: 68.2 }, { n: "MBP", v: 75.7 }, { n: "LVBP", v: 80.0 }, { n: "DMSA", v: 82.6 }, { n: "BHA · Raw", v: 87.0, c: C.blue }, { n: "BHA · CSLS-2", v: 93.9, c: C.violet }] }));
  put("fig-meg", hbars({ title: "THINGS-MEG · 4 participants · Top-1 (%)", max: 100, fmt: pct1, rows: [
    { n: "NICE", v: 12.8 }, { n: "UBP", v: 26.7 }, { n: "NeuroBridge", v: 32.2 }, { n: "MBP", v: 33.9 }, { n: "HyFI", v: 35.8 }, { n: "LVBP", v: 44.0 }, { n: "DMSA", v: 48.0 }, { n: "BHA · Raw", v: 55.6, c: C.blue }, { n: "BHA · CSLS-2", v: 68.1, c: C.violet }] }));

  /* Figure 2: per participant */
  (function () {
    var W = 960, H = 340, L = 46, R = 16, Tp = 62, B = 36, ymin = 60, ymax = 102;
    var MBP = [64.3, 76.3, 74.0, 67.0, 68.0, 81.5, 76.8, 84.8, 76.8, 87.3], DMSA = [75.0, 87.5, 83.2, 79.5, 74.6, 89.9, 78.5, 86.9, 81.3, 89.3], RAW = [90.0, 85.5, 88.0, 83.5, 77.0, 92.5, 88.5, 91.0, 85.0, 89.0], CS = [98.0, 92.5, 95.0, 91.0, 85.0, 96.5, 96.5, 96.5, 91.0, 97.0];
    var X = function (i) { return L + (i + 0.5) * (W - L - R) / 10; }, Y = function (v) { return Tp + (1 - (v - ymin) / (ymax - ymin)) * (H - Tp - B); };
    var s = "";
    for (var g = ymin; g <= 100; g += 10) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(g) + '" y2="' + Y(g) + '" stroke="' + C.grid + '"/>' + T(L - 8, Y(g) + 4, g, { a: "end", fs: 11.5 });
    for (var i = 0; i < 10; i++) {
      s += '<line x1="' + X(i) + '" x2="' + X(i) + '" y1="' + Y(Math.min(MBP[i], DMSA[i], RAW[i])) + '" y2="' + Y(CS[i]) + '" stroke="' + C.grid + '" stroke-width="2"/>';
      s += '<circle cx="' + X(i) + '" cy="' + Y(MBP[i]) + '" r="5" fill="' + C.grey + '"/>';
      s += '<circle cx="' + X(i) + '" cy="' + Y(DMSA[i]) + '" r="5.5" fill="' + C.grey2 + '"/>';
      s += '<circle cx="' + X(i) + '" cy="' + Y(RAW[i]) + '" r="6" fill="' + C.blue + '"/>';
      s += '<circle cx="' + X(i) + '" cy="' + Y(CS[i]) + '" r="6" fill="' + C.violet + '"/>';
      s += T(X(i), Y(CS[i]) - 11, CS[i].toFixed(1), { a: "middle", fs: 11, c: C.violet, w: 600 });
      s += T(X(i), H - 14, "P" + (i + 1), { a: "middle", fs: 11.5, c: C.ink });
    }
    s += title(L, 16, "Top-1 (%) per participant · THINGS-EEG2 · within participant");
    var lg = [["MBP", C.grey], ["DMSA (best prior)", C.grey2], ["BHA · Raw", C.blue], ["BHA · CSLS-2", C.violet]], lx = L;
    lg.forEach(function (l) { s += '<circle cx="' + (lx + 5) + '" cy="' + 32 + '" r="5" fill="' + l[1] + '"/>' + T(lx + 16, 36, l[0], { fs: 11.5, c: C.ink }); lx += 30 + l[0].length * 6.8; });
    put("fig-subj", svg(W, H, "Per-participant Top-1 on THINGS-EEG2", s));
  })();

  /* Figure 3: within vs LOSO dumbbells */
  (function () {
    var rows = [["NICE", 6.2, 16.1], ["ATM-S", 11.9, 28.5], ["UBP", 12.4, 50.9], ["NeuroBridge", 19.0, 63.2], ["HyFI", 15.1, 68.2], ["MBP", 20.0, 75.7], ["LVBP", 20.0, 80.0], ["DMSA", 21.8, 82.6], ["BHA · Raw", 22.5, 87.0, C.blue], ["BHA · CSLS-2", 30.4, 93.9, C.violet]];
    var W = 960, rowH = 26, L = 120, R = 40, Tp = 44, H = Tp + rows.length * rowH + 30;
    var X = function (v) { return L + (v / 100) * (W - L - R); }, s = "";
    [0, 20, 40, 60, 80, 100].forEach(function (g) { s += '<line x1="' + X(g) + '" x2="' + X(g) + '" y1="' + (Tp - 6) + '" y2="' + (H - 24) + '" stroke="' + C.grid + '"/>' + T(X(g), H - 8, g + "%", { a: "middle", fs: 11.5 }); });
    s += '<line x1="' + X(0.5) + '" x2="' + X(0.5) + '" y1="' + (Tp - 6) + '" y2="' + (H - 24) + '" stroke="' + C.pink + '" stroke-dasharray="3 3"/>' + T(X(0.5) + 5, Tp - 10, "chance 0.5%", { fs: 10.5, c: C.pink });
    rows.forEach(function (r, i) {
      var y = Tp + i * rowH + rowH / 2, col = r[3] || C.grey2;
      s += T(L - 12, y + 4, r[0], { a: "end", c: r[3] ? C.ink : C.muted, w: r[3] ? 600 : 400 });
      s += '<line x1="' + X(r[1]) + '" x2="' + X(r[2]) + '" y1="' + y + '" y2="' + y + '" stroke="' + col + '" stroke-width="3" stroke-linecap="round" opacity="' + (r[3] ? 0.5 : 0.45) + '"/>';
      s += '<circle cx="' + X(r[1]) + '" cy="' + y + '" r="5.5" fill="#fff" stroke="' + col + '" stroke-width="2.5"/><circle cx="' + X(r[2]) + '" cy="' + y + '" r="6" fill="' + col + '"/>';
      s += T(X(r[1]) - 10, y + 4, r[1].toFixed(1), { a: "end", fs: 11, c: col, w: r[3] ? 600 : 400 }) + T(X(r[2]) + 10, y + 4, r[2].toFixed(1), { fs: 11, c: col, w: r[3] ? 600 : 400 });
    });
    s += title(L, 16, "Top-1 (%) · THINGS-EEG2") + '<circle cx="' + (W - 300) + '" cy="14" r="5" fill="#fff" stroke="' + C.grey2 + '" stroke-width="2.5"/>' + T(W - 290, 18, "LOSO (unseen participant)", { fs: 11.5, c: C.ink }) + '<circle cx="' + (W - 110) + '" cy="14" r="5.5" fill="' + C.grey2 + '"/>' + T(W - 100, 18, "within participant", { fs: 11.5, c: C.ink });
    put("fig-loso", svg(W, H, "Within versus LOSO Top-1", s));
  })();

  /* Figure 4: gallery */
  (function () {
    var host = document.getElementById("fig-gallery"); if (!host) return;
    var ids = ["lamb", "goose", "cheetah", "pie", "orange", "coconut", "strawberry", "antelope"];
    var s = "";
    ["seen", "draw 1", "draw 2", "draw 3"].forEach(function (h) { s += '<div class="g-h' + (h === "seen" ? " seen" : "") + '">' + h + "</div>"; });
    ["seen", "draw 1", "draw 2", "draw 3"].forEach(function (h) { s += '<div class="g-h second' + (h === "seen" ? " seen" : "") + '">' + h + "</div>"; });
    for (var r = 0; r < 4; r++) {
      [ids[r], ids[r + 4]].forEach(function (id, k) {
        ["gt", "gen0", "gen1", "gen2"].forEach(function (key) {
          s += '<div class="g-t' + (key === "gt" ? " seen" : "") + (k ? " second" : "") + '"><img src="assets/showcase/' + id + "_" + key + '.jpg" alt="' + id.replace(/_/g, " ") + " " + key + '"></div>';
        });
      });
    }
    host.innerHTML = s;
  })();

  /* Figure 5: reconstruction panels */
  (function () {
    var W = 960, H = 262, pw = 296, gap = 36, L0 = 0;
    var M = [
      { n: "PixCorr ↑", max: 0.35, ceil: 0.288, chance: 0.112, rows: [["ATM-S", 0.130], ["CC-All", 0.143], ["AVDE", 0.147], ["MBP", 0.195], ["BHA", 0.277, C.blue], ["BHA + VAE-guided", 0.283, C.violet]] },
      { n: "SSIM ↑", max: 0.55, ceil: 0.443, chance: 0.400, rows: [["ATM-S", 0.339], ["CC-All", 0.347], ["AVDE", 0.366], ["MBP", 0.336], ["BHA", 0.454, C.blue], ["BHA + VAE-guided", 0.464, C.violet]] },
      { n: "CLIP identification ↑", max: 1.0, ceil: 1.0, chance: 0.491, rows: [["ATM-S", 0.716], ["CC-All", 0.715], ["AVDE", 0.747], ["MBP", 0.808], ["BHA", 0.830, C.blue], ["BHA + VAE-guided", 0.830, C.violet]] }
    ];
    var s = "";
    M.forEach(function (m, p) {
      var x0 = L0 + p * (pw + gap), L = x0 + 118, R = 46, rowH = 26, Tp = 48;
      s += title(x0, 16, m.n);
      m.rows.forEach(function (r, i) {
        var y = Tp + i * rowH, w = (r[1] / m.max) * (pw - 118 - R), col = r[2] || C.grey;
        s += T(L - 8, y + 17, r[0], { a: "end", c: r[2] ? C.ink : C.muted, w: r[2] ? 600 : 400, fs: 11.5 });
        s += '<rect x="' + L + '" y="' + (y + 4) + '" width="' + w + '" height="' + (rowH - 9) + '" rx="3" fill="' + col + '"/>';
        s += T(L + w + 6, y + 17, r[1].toFixed(3), { fs: 11, c: r[2] ? r[2] : C.muted, w: r[2] ? 600 : 400 });
      });
      var yb = Tp + m.rows.length * rowH + 2;
      [["ceiling", m.ceil, C.ink, Tp - 8], ["chance", m.chance, C.pink, yb + 14]].forEach(function (c) { var x = L + (c[1] / m.max) * (pw - 118 - R); s += '<line x1="' + x + '" x2="' + x + '" y1="' + (Tp - 4) + '" y2="' + yb + '" stroke="' + c[2] + '" stroke-dasharray="3 3" opacity=".7"/>' + T(Math.min(x, x0 + pw - 30), c[3], c[0] + " " + c[1].toFixed(3), { a: "middle", fs: 10, c: c[2] }); });
    });
    put("fig-recon", svg(W, H, "Reconstruction metrics against prior methods", s));
  })();

  /* Figure 6: the idea (schematic) */
  (function () {
    var W = 960, H = 250, s = "";
    function box(x, y, w, h, t, fill, stroke, c, dash) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + fill + '" stroke="' + stroke + '"' + (dash ? ' stroke-dasharray="4 3"' : "") + '/>' + T(x + w / 2, y + h / 2 + 4.5, t, { a: "middle", fs: 11.5, c: c || C.ink, w: 500 }); }
    function arrow(x1, y1, x2, y2, col) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (col || C.grey2) + '" stroke-width="1.5" marker-end="url(#ideaArr)"/>'; }
    s += '<defs><marker id="ideaArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="' + C.grey2 + '"/></marker></defs>';
    var P = [[0, "One teacher", "search in one teacher's space"], [330, "Fused target", "one geometry, four views averaged"], [640, "BHA · composed", "one space per teacher, scores composed"]];
    P.forEach(function (p, k) {
      var x0 = p[0];
      s += T(x0, 16, (k + 1) + " · " + p[1], { fs: 12.5, c: C.ink, w: 600 }) + T(x0, 34, p[2], { fs: 11, c: C.muted });
      s += box(x0, 100, 70, 36, "brain", "#f3f5ff", "#c9d1ff");
      if (k === 0) {
        s += arrow(72, 118, 128, 118) + box(130, 100, 90, 36, "encoder", "#fff", C.grey2) + arrow(222, 118, 262, 118);
        s += box(264, 60, 58, 116, "", "#fff", C.grey, true);
        s += T(293, 100, "T1", { a: "middle", fs: 11.5, c: C.ink, w: 600 }) + T(293, 128, "T2 T3 T4", { a: "middle", fs: 9.5, c: C.faint }) + T(293, 142, "unused", { a: "middle", fs: 9.5, c: C.faint });
      } else if (k === 1) {
        s += arrow(402, 118, 458, 118) + box(460, 100, 90, 36, "encoder", "#fff", C.grey2) + arrow(552, 118, 592, 118);
        s += box(594, 60, 60, 116, "", "#f6f3ff", "#c9b8ff");
        ["T1", "T2", "T3", "T4"].forEach(function (t, i) { s += T(624, 80 + i * 26, t, { a: "middle", fs: 11, c: C.violet, w: 600 }); });
        s += T(624, 190, "one fused target", { a: "middle", fs: 10.5, c: C.violet });
      } else {
        s += arrow(712, 118, 758, 118) + box(760, 100, 70, 36, "encoder", "#fff", C.grey2);
        ["T1", "T2", "T3", "T4"].forEach(function (t, i) { var y = 60 + i * 30; s += arrow(832, 118, 862, y + 12) + box(864, y, 30, 24, t, "#fff", C.blue, C.blue); s += arrow(896, y + 12, 916, 118); });
        s += '<circle cx="926" cy="118" r="10" fill="' + C.blue + '"/>' + T(926, 122, "Σ", { a: "middle", fs: 11, c: "#fff", w: 700 });
        s += T(850, 196, "+ shared score · learned gate", { a: "middle", fs: 10.5, c: C.blue });
      }
    });
    s += T(0, 236, "T1–T4: OpenCLIP, DFN, MAE, DINOv2", { fs: 10.5, c: C.faint });
    put("fig-idea", svg(W, H, "Three ways to use four teachers", s));
  })();

  /* Figure 8: stages (left) and readout families (right) */
  (function () {
    var W = 470, H = 290, L = 46, R = 16, Tp = 44, B = 56, ymin = 70, ymax = 90;
    var cats = [["Stage 1", "pretrained"], ["Stage 2", "shared readout"], ["Stage 2", "composed"]], within = [80.8, 82.2, 87.0], loso = [22.5, 22.05, 20.2];
    var gw = (W - L - R) / 3, Y = function (v) { return Tp + (1 - (v - ymin) / (ymax - ymin)) * (H - Tp - B); }, s = "";
    for (var g = ymin; g <= ymax; g += 5) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(g) + '" y2="' + Y(g) + '" stroke="' + C.grid + '"/>' + T(L - 8, Y(g) + 4, g, { a: "end", fs: 11.5 });
    cats.forEach(function (c, i) {
      var x = L + i * gw + gw * 0.22, w = gw * 0.56, col = i === 2 ? C.blue : C.grey;
      s += '<rect x="' + x + '" y="' + Y(within[i]) + '" width="' + w + '" height="' + (Y(ymin) - Y(within[i])) + '" rx="4" fill="' + col + '"/>';
      s += T(x + w / 2, Y(within[i]) - 7, within[i].toFixed(1), { a: "middle", fs: 12, c: i === 2 ? C.blue : C.muted, w: 600 });
      s += T(x + w / 2, H - B + 18, c[0], { a: "middle", fs: 11.5, c: C.ink }) + T(x + w / 2, H - B + 33, c[1], { a: "middle", fs: 11, c: C.muted });
      s += T(x + w / 2, H - B + 50, "LOSO " + loso[i].toFixed(1), { a: "middle", fs: 10.5, c: C.faint, mono: true });
    });
    s += title(L, 16, "Raw Top-1 (%) · within participant · THINGS-EEG2");
    put("fig-stages", svg(W, H, "Accuracy by training stage", s));
    put("fig-readout", hbars({ w: 470, left: 150, right: 90, title: "Readout family on the same frozen backbone · Raw Top-1 (%)", max: 100, fmt: pct1, rows: [
      { n: "Teacher experts only", v: 79.6, note: "CSLS-2 87.7" }, { n: "Shared expert only", v: 82.05, note: "91.4" }, { n: "MLP heads", v: 83.2, note: "92.2" }, { n: "Linear heads", v: 85.0, note: "93.5" }, { n: "Experts + shared (BHA)", v: 87.0, c: C.blue, note: "93.9" }] }));
  })();

  /* budget grouped bars */
  (function () {
    var ranks = [4, 16, 64, 256], D = [["Group MoE", [86.8, 86.5, 86.5, 86.7], C.violet], ["MLP", [86.5, 86.6, 86.6, 85.9], C.blue], ["Low-rank linear", [86.7, 86.6, 86.5, 86.4], C.cyan]];
    var W = 960, H = 240, L = 46, R = 16, Tp = 40, B = 44, ymin = 84, ymax = 88, gw = (W - L - R) / 4, bw = gw / 4.2;
    var Y = function (v) { return Tp + (1 - (v - ymin) / (ymax - ymin)) * (H - Tp - B); }, s = "";
    for (var g = ymin; g <= ymax; g += 1) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(g) + '" y2="' + Y(g) + '" stroke="' + C.grid + '"/>' + T(L - 8, Y(g) + 4, g, { a: "end", fs: 11.5 });
    ranks.forEach(function (r, i) {
      var x0 = L + i * gw + gw * 0.14;
      D.forEach(function (d, j) { var v = d[1][i], x = x0 + j * bw * 1.12; s += '<rect x="' + x + '" y="' + Y(v) + '" width="' + bw + '" height="' + (Y(ymin) - Y(v)) + '" rx="3" fill="' + d[2] + '" opacity=".9"/>' + T(x + bw / 2, Y(v) - 6, v.toFixed(1), { a: "middle", fs: 10.5 }); });
      s += T(L + i * gw + gw / 2, H - B + 18, "r = " + r, { a: "middle", fs: 11.5, c: C.ink });
    });
    var lx = L; D.forEach(function (d) { s += '<rect x="' + lx + '" y="' + (H - 13) + '" width="11" height="11" rx="3" fill="' + d[2] + '"/>' + T(lx + 16, H - 4, d[0], { fs: 11.5, c: C.ink }); lx += 30 + d[0].length * 7; });
    s += title(L, 16, "Composed Raw Top-1 (%) · 10 participants × 3 seeds");
    put("fig-budget", svg(W, H, "Readout families at equal parameter budgets", s));
  })();

  /* Figure 9: data scale */
  (function () {
    var X = [25, 50, 75, 100], S = [["BHA (composed)", C.blue, [53.25, 74.95, 82.45, 87.0]], ["Shared expert", C.violet, [45.5, 68.2, 77.9, 82.2]], ["Pretrained backbone", C.grey2, [42.7, 65.3, 75.55, 80.8]]];
    var W = 960, H = 360, L = 50, R = 190, Tp = 30, B = 46, ymin = 35, ymax = 92;
    var px = function (x) { return L + ((x - 25) / 75) * (W - L - R); }, py = function (y) { return Tp + (1 - (y - ymin) / (ymax - ymin)) * (H - Tp - B); }, s = "";
    for (var g = 40; g <= 90; g += 10) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + py(g) + '" y2="' + py(g) + '" stroke="' + C.grid + '"/>' + T(L - 8, py(g) + 4, g, { a: "end", fs: 11.5 });
    X.forEach(function (x) { s += T(px(x), H - B + 20, x + "%", { a: "middle", fs: 11.5, c: C.ink }); });
    s += T(W - R, H - 8, "fraction of training data", { a: "end", fs: 11.5 }) + title(L, 16, "Raw Top-1 (%)");
    var lys = S.map(function (ser) { return py(ser[2][3]); }); for (var k = 1; k < lys.length; k++) if (lys[k] - lys[k - 1] < 18) lys[k] = lys[k - 1] + 18;
    S.slice().reverse().forEach(function (ser, ri) {
      var d = ""; ser[2].forEach(function (v, i) { d += (i ? "L" : "M") + px(X[i]) + " " + py(v) + " "; });
      s += '<path d="' + d + '" fill="none" stroke="' + ser[1] + '" stroke-width="' + (ser[1] === C.blue ? 3 : 2) + '" stroke-linejoin="round" stroke-linecap="round"/>';
      ser[2].forEach(function (v, i) { s += '<circle cx="' + px(X[i]) + '" cy="' + py(v) + '" r="4.5" fill="#fff" stroke="' + ser[1] + '" stroke-width="2.5"/>'; if (ser[1] !== C.violet && !(ser[1] === C.grey2 && i === 3)) s += T(px(X[i]) + (ser[1] === C.blue ? 0 : 12), py(v) + (ser[1] === C.blue ? -11 : 19), v.toFixed(1), { a: "middle", fs: 11.5, c: ser[1], w: 600 }); });
      var ly = lys[S.length - 1 - ri]; s += '<line x1="' + (px(100) + 8) + '" x2="' + (W - R + 8) + '" y1="' + py(ser[2][3]) + '" y2="' + ly + '" stroke="' + ser[1] + '" opacity=".5"/>' + T(W - R + 12, ly + 4, ser[0], { fs: 12, c: ser[1], w: 600 });
    });
    put("fig-scale", svg(W, H, "Accuracy versus training-data fraction", s));
  })();

  /* Figure 10: alignment dumbbells */
  (function () {
    var rows = [["OpenCLIP", 0.204, 0.399], ["DFN-6", 0.256, 0.611], ["MAE-18", 0.041, 0.545], ["DINOv2-12", 0.050, 0.474]];
    var W = 960, rowH = 30, L = 120, R = 40, Tp = 40, H = Tp + 5 * rowH + 28, X = function (v) { return L + (v / 0.7) * (W - L - R); }, s = "";
    [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].forEach(function (g) { s += '<line x1="' + X(g) + '" x2="' + X(g) + '" y1="' + (Tp - 6) + '" y2="' + (H - 22) + '" stroke="' + C.grid + '"/>' + T(X(g), H - 6, g.toFixed(1), { a: "middle", fs: 11.5 }); });
    rows.forEach(function (r, i) {
      var y = Tp + i * rowH + rowH / 2;
      s += T(L - 12, y + 4, r[0], { a: "end", c: C.ink, w: 600 });
      s += '<line x1="' + X(r[1]) + '" x2="' + X(r[2]) + '" y1="' + y + '" y2="' + y + '" stroke="' + C.blue + '" stroke-width="3" opacity=".35" stroke-linecap="round"/>';
      s += '<circle cx="' + X(r[1]) + '" cy="' + y + '" r="6" fill="' + C.grey2 + '"/><circle cx="' + X(r[2]) + '" cy="' + y + '" r="6" fill="' + C.blue + '"/>';
      s += T(X(r[1]) - 10, y + 4, r[1].toFixed(3), { a: "end", fs: 11, c: C.muted }) + T(X(r[2]) + 10, y + 4, r[2].toFixed(3), { fs: 11, c: C.blue, w: 600 });
    });
    var y = Tp + 4 * rowH + rowH / 2;
    s += T(L - 12, y + 4, "Shared target", { a: "end", c: C.violet, w: 600 }) + '<circle cx="' + X(0.624) + '" cy="' + y + '" r="6" fill="' + C.violet + '"/>' + T(X(0.624) + 10, y + 4, "0.624", { fs: 11, c: C.violet, w: 600 });
    s += title(L, 16, "Paired brain–image cosine") + '<circle cx="' + (W - 330) + '" cy="14" r="5.5" fill="' + C.grey2 + '"/>' + T(W - 320, 18, "raw teacher features", { fs: 11.5, c: C.ink }) + '<circle cx="' + (W - 160) + '" cy="14" r="5.5" fill="' + C.blue + '"/>' + T(W - 150, 18, "with visual adapter", { fs: 11.5, c: C.ink });
    put("fig-align", svg(W, H, "Brain-predictability of teacher features", s));
  })();

  /* Figure 11: RSM heatmaps */
  (function () {
    var N = ["OpenCLIP", "DFN-6", "MAE-18", "DINOv2-12", "Shared"];
    var VFM = [[1, .334, .069, .191, .349], [.334, 1, .311, .490, .704], [.069, .311, 1, .379, .249], [.191, .490, .379, 1, .363], [.349, .704, .249, .363, 1]];
    var BHA = [[1, .839, .736, .748, .868], [.839, 1, .768, .793, .895], [.736, .768, 1, .911, .712], [.748, .793, .911, 1, .718], [.868, .895, .712, .718, 1]];
    function col(v) { var a = [241, 243, 250], b = [43, 92, 255], p = Math.max(0, Math.min(1, v)); return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * p) + "," + Math.round(a[1] + (b[1] - a[1]) * p) + "," + Math.round(a[2] + (b[2] - a[2]) * p) + ")"; }
    function heat(M, ttl) {
      var W = 470, cell = 66, L = 84, Tp = 56, s = title(0, 14, ttl);
      N.forEach(function (n, j) { s += T(L + j * cell + cell / 2, Tp - 10, n, { a: "middle", fs: 11, c: C.ink }); });
      N.forEach(function (n, i) {
        s += T(L - 8, Tp + i * cell + cell / 2 + 4, n, { a: "end", fs: 11, c: C.ink });
        N.forEach(function (m, j) { var v = M[i][j]; s += '<rect x="' + (L + j * cell + 1) + '" y="' + (Tp + i * cell + 1) + '" width="' + (cell - 2) + '" height="' + (cell - 2) + '" rx="6" fill="' + col(v) + '"/>' + T(L + j * cell + cell / 2, Tp + i * cell + cell / 2 + 4.5, v.toFixed(2), { a: "middle", fs: 12, c: v > 0.55 ? "#fff" : C.ink, w: 500, mono: true }); });
      });
      return svg(W, Tp + 5 * cell + 6, ttl, s);
    }
    put("fig-rsm-vfm", heat(VFM, "Teacher features · RSM correlation"));
    put("fig-rsm-bha", heat(BHA, "BHA student outputs · RSM correlation"));
  })();

  /* Figure 12: attribution */
  (function () {
    var IM = ["bonnet", "snowshoe", "gondola", "bok_choy", "goose", "pocketknife"], HAS = ["bonnet", "snowshoe", "gondola", "bok_choy", "goose"];
    var GROUPS = ["openclip", "dfn", "mae", "dinov2l", "shared_fusion"], GLAB = { openclip: "OpenCLIP", dfn: "DFN-6", mae: "MAE-18", dinov2l: "DINOv2-12", shared_fusion: "Shared" };
    var picks = document.getElementById("rp-attr-picks"), row = document.getElementById("rp-attr"), ATTR = null;
    if (!picks || !row) return;
    function divColor(v) { var a = Math.abs(v), r, g, b; if (v >= 0) { r = 255; g = Math.round(255 - a * 215); b = Math.round(255 - a * 230); } else { r = Math.round(255 - a * 215); g = Math.round(255 - a * 160); b = 255; } return "rgb(" + r + "," + g + "," + b + ")"; }
    function drawMap(cv, m) {
      var n = m.length, ctx = cv.getContext("2d"), flat = [];
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) flat.push(Math.abs(m[i][j]));
      var sorted = flat.slice().sort(function (a, b) { return a - b; });
      var rank = function (v) { var lo = 0, hi = sorted.length; while (lo < hi) { var mid = (lo + hi) >> 1; if (sorted[mid] < v) lo = mid + 1; else hi = mid; } return lo / (sorted.length - 1); };
      var cell = cv.width / n;
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var v = m[y][x]; ctx.fillStyle = divColor((v < 0 ? -1 : 1) * rank(Math.abs(v))); ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5); }
    }
    function render(id) {
      if (!ATTR || !ATTR[id]) return;
      var has = HAS.indexOf(id) >= 0;
      row.innerHTML = has ? '<div class="attr__tile"><img src="assets/insight/img/' + id + '.jpg" alt="' + id + '"><span>seen</span></div>' : '<div class="attr__tile attr__tile--name"><b>' + id.replace(/_/g, " ") + "</b><span>seen</span></div>";
      GROUPS.forEach(function (g) {
        var d = document.createElement("div"); d.className = "attr__tile";
        var cv = document.createElement("canvas"); cv.width = 160; cv.height = 160; d.appendChild(cv);
        var sp = document.createElement("span"); sp.textContent = GLAB[g]; d.appendChild(sp);
        row.appendChild(d); drawMap(cv, ATTR[id].maps[ATTR[id].groups.indexOf(g)]);
      });
      picks.querySelectorAll(".attr__pick").forEach(function (p) { p.classList.toggle("is-active", p.dataset.id === id); });
    }
    fetch("assets/insight/attribution_maps.json").then(function (r) { return r.json(); }).then(function (d) {
      ATTR = d;
      IM.filter(function (id) { return d[id]; }).forEach(function (id) {
        var b = document.createElement("button"); b.type = "button"; b.className = "attr__pick"; b.dataset.id = id;
        b.innerHTML = HAS.indexOf(id) >= 0 ? '<img src="assets/insight/img/' + id + '.jpg" alt="' + id + '">' : "<b>" + id.replace(/_/g, " ") + "</b>";
        b.addEventListener("click", function () { render(id); }); picks.appendChild(b);
      });
      render("bonnet");
      var lg = document.createElement("div"); lg.className = "attr__legend"; lg.innerHTML = "<span>lowers match</span><i></i><span>raises match</span>"; row.parentNode.insertBefore(lg, row.nextSibling);
    });
  })();

  /* Figure 13: units + concept bars */
  (function () {
    var UNITS = [
      { id: "905", concept: "Clothing", imgs: [["suit", 0.076], ["gorilla", 0.067], ["chaps", 0.063], ["kneepad", 0.057], ["coat", 0.057]] },
      { id: "4610", concept: "Dessert / food", imgs: [["dessert", 0.074], ["calamari", 0.069], ["omelet", 0.067], ["crepe", 0.065], ["pie", 0.064]] },
      { id: "504", concept: "Animal", imgs: [["piglet", 0.069], ["lamb", 0.055], ["antelope", 0.047], ["cat", 0.047], ["pajamas", 0.046]] }];
    var host = document.getElementById("rp-units");
    if (host) host.innerHTML = UNITS.map(function (u) {
      var mx = u.imgs[0][1];
      return '<div class="rp-unit"><div><div class="rp-unit__id">unit ' + u.id + '</div><div class="rp-unit__c">' + u.concept + '</div><div class="rp-unit__s">top-5 held-out activations</div></div><div class="rp-unit__imgs">' +
        u.imgs.map(function (x) { return '<div class="rp-unit__img"><img src="assets/insight/img/' + x[0] + '.jpg" alt="' + x[0] + '"><b>' + x[0].replace(/_/g, " ") + " · " + x[1].toFixed(3) + '</b><i style="width:' + (x[1] / mx) * 100 + '%"></i></div>'; }).join("") + "</div></div>";
    }).join("");
    put("fig-concept", hbars({ w: 960, left: 130, right: 60, rowH: 24, title: "Brain–visual concept-profile cosine · 27 THINGS categories · held-out images", max: 1.0, fmt: f3, rows: [
      { n: "OpenCLIP", v: 0.612, c: C.grey2 }, { n: "DFN-6", v: 0.726, c: C.grey2 }, { n: "MAE-18", v: 0.796, c: C.grey2 }, { n: "DINOv2-12", v: 0.812, c: C.grey2 }, { n: "Shared", v: 0.814, c: C.violet }, { n: "Neuron shuffle", v: 0.004 }] }));
  })();

  /* Figure 14: temporal */
  (function () {
    var TEMP = null, cur = "eeg";
    var TCOL = { bha: C.blue, shared_fusion: C.violet, dfn: C.amber, openclip: C.cyan, mae: C.green, dinov2l: C.pink };
    var TLAB = { bha: "BHA (composed)", shared_fusion: "shared expert", dfn: "DFN-6", openclip: "OpenCLIP", mae: "MAE-18", dinov2l: "DINOv2-12" };
    function tchart(el, D, key, sdKey, ttl, yLabel, chance) {
      if (!el) return;
      var W = 520, H = 300, L = 42, R = 14, Tp = 30, B = 40, xs = D.centers, xmax = 800, ymax = 0;
      Object.keys(D.series).forEach(function (e) { D.series[e][key].forEach(function (v) { ymax = Math.max(ymax, v); }); });
      ymax = Math.ceil(ymax / 10) * 10 || 10;
      var X = function (v) { return L + (v / xmax) * (W - L - R); }, Y = function (v) { return Tp + (1 - v / ymax) * (H - Tp - B); };
      var s = '<text class="ttl" x="' + L + '" y="18">' + ttl + " · " + yLabel + "</text>";
      for (var g = 0; g <= ymax; g += ymax / 4) s += '<line class="ax" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(g) + '" y2="' + Y(g) + '"/><text class="tick" x="' + (L - 6) + '" y="' + (Y(g) + 4) + '" text-anchor="end">' + Math.round(g) + "</text>";
      [0, 200, 400, 600, 800].forEach(function (x) { s += '<text class="tick" x="' + X(x) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + x + "</text>"; });
      s += '<text class="tick" x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">ms after image onset</text>';
      [100, 220].forEach(function (m) { s += '<line class="mark" x1="' + X(m) + '" x2="' + X(m) + '" y1="' + Tp + '" y2="' + (H - B) + '"/><text class="mlab" x="' + (X(m) + 4) + '" y="' + (Tp + 12) + '">' + m + " ms</text>"; });
      if (chance != null) s += '<line class="ax" style="stroke:rgba(11,16,32,.35);stroke-dasharray:2 3" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(chance) + '" y2="' + Y(chance) + '"/>';
      var b = D.series.bha, up = "", dn = "";
      xs.forEach(function (x, i) { up += (i ? "L" : "M") + X(x) + " " + Y(Math.min(ymax, b[key][i] + b[sdKey][i])) + " "; });
      for (var i = xs.length - 1; i >= 0; i--) dn += "L" + X(xs[i]) + " " + Y(Math.max(0, b[key][i] - b[sdKey][i])) + " ";
      s += '<path class="band" d="' + up + dn + 'Z" fill="' + TCOL.bha + '"/>';
      ["dinov2l", "mae", "openclip", "dfn", "shared_fusion", "bha"].forEach(function (e) {
        var d = ""; xs.forEach(function (x, i) { d += (i ? "L" : "M") + X(x).toFixed(1) + " " + Y(Math.max(0, D.series[e][key][i])).toFixed(1) + " "; });
        s += '<path class="ln" d="' + d + '" stroke="' + TCOL[e] + '" stroke-width="' + (e === "bha" ? 2.6 : 1.5) + '" opacity="' + (e === "bha" ? 1 : 0.8) + '"/>';
      });
      el.innerHTML = s;
    }
    function render() {
      if (!TEMP) return;
      var D = TEMP[cur];
      tchart(document.getElementById("rp-tdel"), D, "del", "delSd", "Delete window", "Top-1 lost (pp)", null);
      tchart(document.getElementById("rp-tkeep"), D, "keep", "keepSd", "Keep window only", "Top-1 (%)", 0.5);
      var lg = document.getElementById("rp-tlegend");
      if (lg) lg.innerHTML = ["bha", "shared_fusion", "dfn", "openclip", "mae", "dinov2l"].map(function (e) { return '<span><i style="background:' + TCOL[e] + '"></i>' + TLAB[e] + "</span>"; }).join("");
    }
    fetch("assets/insight/temporal.json").then(function (r) { return r.json(); }).then(function (d) { TEMP = d; render(); });
    document.querySelectorAll(".seg__btn[data-temporal]").forEach(function (b) {
      b.addEventListener("click", function () { document.querySelectorAll(".seg__btn[data-temporal]").forEach(function (x) { x.classList.toggle("is-active", x === b); }); cur = b.getAttribute("data-temporal"); render(); });
    });
  })();

  /* Figure 15: adaptation trap */
  (function () {
    var rows = [["Paired cosine", 0.217, 0.481, 1, f3, "up"], ["Raw Top-1 (%)", 30.05, 37.80, 50, pct1, "up"], ["CLIP identification of reconstructions", 0.754, 0.706, 1, f3, "down"]];
    var W = 960, rowH = 44, L = 290, R = 40, Tp = 36, H = Tp + rows.length * rowH + 10, s = "";
    rows.forEach(function (r, i) {
      var y = Tp + i * rowH + rowH / 2, X = function (v) { return L + (v / r[3]) * (W - L - R); }, up = r[5] === "up", col = up ? C.blue : C.pink;
      s += T(L - 14, y + 4, r[0], { a: "end", c: C.ink, w: 600 });
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" stroke="' + C.grid + '"/>';
      s += '<line x1="' + X(r[1]) + '" x2="' + X(r[2]) + '" y1="' + y + '" y2="' + y + '" stroke="' + col + '" stroke-width="3" opacity=".4" stroke-linecap="round"/>';
      s += '<circle cx="' + X(r[1]) + '" cy="' + y + '" r="6" fill="' + C.grey2 + '"/><circle cx="' + X(r[2]) + '" cy="' + y + '" r="6" fill="' + col + '"/>';
      s += T(X(r[1]) + (up ? -10 : 10), y + 4, r[4](r[1]), { a: up ? "end" : "start", fs: 11, c: C.muted }) + T(X(r[2]) + (up ? 10 : -10), y + 4, r[4](r[2]) + (up ? "  ↑" : "  ↓"), { a: up ? "start" : "end", fs: 11, c: col, w: 600 });
    });
    s += '<circle cx="' + L + '" cy="14" r="5.5" fill="' + C.grey2 + '"/>' + T(L + 10, 18, "fixed target", { fs: 11.5, c: C.ink }) + '<circle cx="' + (L + 130) + '" cy="14" r="5.5" fill="' + C.blue + '"/>' + T(L + 140, 18, "target adapted toward the brain (BiCLIP)", { fs: 11.5, c: C.ink });
    put("fig-trap", svg(W, H, "Adapting the target toward the brain", s));
  })();
})();
