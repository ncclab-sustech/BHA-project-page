/* BHA technical report — charts and interactions (English only) */
(function () {
  "use strict";
  var T = ["OpenCLIP", "DFN-6", "MAE-18", "DINOv2-12"];
  var INK = "#5f6684";

  /* KaTeX */
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }],
      throwOnError: false
    });
  }

  /* TOC highlight */
  var tocLinks = [].slice.call(document.querySelectorAll(".rp-toc a"));
  var secs = tocLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  if ("IntersectionObserver" in window && secs.length) {
    var cur = null;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) cur = e.target; });
      if (!cur) return;
      tocLinks.forEach(function (a, i) { a.classList.toggle("is-active", secs[i] === cur); });
    }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
    secs.forEach(function (s) { if (s) io.observe(s); });
  }

  /* generic horizontal bars */
  function bars(host, rows, max, fmt, animate) {
    if (!host) return;
    host.innerHTML = "";
    rows.forEach(function (r) {
      var el = document.createElement("div");
      el.className = "bar" + (r.cls ? " " + r.cls : "");
      el.innerHTML = '<span class="bar__name">' + r.name + '</span><span class="bar__track"><span class="bar__fill" data-w="' + (r.v / max) * 100 + '"></span></span><span class="bar__v">' + fmt(r.v) + "</span>";
      host.appendChild(el);
    });
    var go = function () { host.querySelectorAll(".bar__fill").forEach(function (f) { f.style.width = f.getAttribute("data-w") + "%"; }); };
    if (animate && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (!e.isIntersecting) return; go(); o.disconnect(); }); }, { threshold: 0.3 }).observe(host);
    } else requestAnimationFrame(go);
  }
  var f3 = function (v) { return v.toFixed(3); }, f2 = function (v) { return v.toFixed(2); }, f1 = function (v) { return v.toFixed(1) + "%"; };

  /* 5.3 data-scale line chart */
  (function scale() {
    var svg = document.getElementById("rp-scale");
    if (!svg) return;
    var X = [25, 50, 75, 100];
    var S = [
      { n: "BHA (composed)", c: "#ff3d81", v: [53.25, 74.95, 82.45, 87.0] },
      { n: "Shared expert", c: "#2b5cff", v: [45.5, 68.2, 77.9, 82.2] },
      { n: "Pretrained backbone", c: "#9aa0b8", v: [42.7, 65.3, 75.55, 80.8] }
    ];
    var W = 640, H = 340, L = 52, R = 190, Tp = 24, B = 44, ymin = 30, ymax = 95;
    var px = function (x) { return L + ((x - 25) / 75) * (W - L - R); }, py = function (y) { return Tp + (1 - (y - ymin) / (ymax - ymin)) * (H - Tp - B); };
    var s = "";
    for (var g = 30; g <= 90; g += 10) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + py(g) + '" y2="' + py(g) + '" stroke="rgba(11,16,32,.08)"/><text x="' + (L - 8) + '" y="' + (py(g) + 4) + '" text-anchor="end">' + g + "</text>";
    X.forEach(function (x) { s += '<text x="' + px(x) + '" y="' + (H - B + 20) + '" text-anchor="middle">' + x + "%</text>"; });
    s += '<text x="' + (W - R) + '" y="' + (H - 8) + '" text-anchor="end">fraction of training data</text>';
    s += '<text x="' + L + '" y="14">Raw Top-1 (%)</text>';
    S.slice().reverse().forEach(function (ser) {
      var d = "";
      ser.v.forEach(function (v, i) { d += (i ? "L" : "M") + px(X[i]) + " " + py(v) + " "; });
      s += '<path d="' + d + '" fill="none" stroke="' + ser.c + '" stroke-width="' + (ser.n.indexOf("BHA") === 0 ? 3 : 2) + '" stroke-linejoin="round" stroke-linecap="round" class="rp-line"/>';
      var top = ser.n.indexOf("BHA") === 0, bottom = ser.n.indexOf("Pre") === 0;
      ser.v.forEach(function (v, i) {
        s += '<circle cx="' + px(X[i]) + '" cy="' + py(v) + '" r="4.5" fill="#fff" stroke="' + ser.c + '" stroke-width="2.5"/>';
        if (top || bottom) s += '<text x="' + (px(X[i]) + (bottom ? 12 : 0)) + '" y="' + (py(v) + (top ? -11 : 19)) + '" text-anchor="middle" style="fill:' + ser.c + ';font-weight:600">' + v.toFixed(1) + "</text>";
      });
    });
    var ly = Tp + 8;
    S.forEach(function (ser) { s += '<line x1="' + (W - R + 14) + '" x2="' + (W - R + 34) + '" y1="' + ly + '" y2="' + ly + '" stroke="' + ser.c + '" stroke-width="3" stroke-linecap="round"/><text x="' + (W - R + 40) + '" y="' + (ly + 4) + '" style="fill:' + ser.c + '">' + ser.n + "</text>"; ly += 20; });
    svg.innerHTML = s;
  })();

  /* 7 parameter-budget bars grouped by rank */
  (function budget() {
    var host = document.getElementById("rp-budget");
    if (!host) return;
    var ranks = [4, 16, 64, 256];
    var D = { "Group MoE": [86.8, 86.5, 86.5, 86.7], "MLP": [86.5, 86.6, 86.6, 85.9], "Low-rank linear": [86.7, 86.6, 86.5, 86.4] };
    var C = { "Group MoE": "#7c3aed", "MLP": "#2b5cff", "Low-rank linear": "#06c7f1" };
    var W = 640, H = 300, L = 52, R = 20, Tp = 36, B = 46, ymin = 84, ymax = 88;
    var gw = (W - L - R) / ranks.length, bw = gw / 4.4;
    var py = function (y) { return Tp + (1 - (y - ymin) / (ymax - ymin)) * (H - Tp - B); };
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Composed Top-1 by readout family and parameter budget">';
    for (var g = ymin; g <= ymax; g += 1) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + py(g) + '" y2="' + py(g) + '" stroke="rgba(11,16,32,.08)"/><text x="' + (L - 8) + '" y="' + (py(g) + 4) + '" text-anchor="end">' + g + "</text>";
    s += '<text x="' + L + '" y="14">Composed Raw Top-1 (%) · 10 participants × 3 seeds</text>';
    ranks.forEach(function (r, i) {
      var x0 = L + i * gw + gw * 0.12;
      Object.keys(D).forEach(function (k, j) {
        var v = D[k][i], x = x0 + j * bw * 1.15;
        s += '<rect x="' + x + '" y="' + py(v) + '" width="' + bw + '" height="' + (py(ymin) - py(v)) + '" rx="4" fill="' + C[k] + '" opacity=".9"/>';
        s += '<text x="' + (x + bw / 2) + '" y="' + (py(v) - 6) + '" text-anchor="middle" style="font-size:10px">' + v.toFixed(1) + "</text>";
      });
      s += '<text x="' + (L + i * gw + gw / 2) + '" y="' + (H - B + 18) + '" text-anchor="middle">r = ' + r + "</text>";
    });
    var lx = L;
    Object.keys(D).forEach(function (k) {
      s += '<rect x="' + lx + '" y="' + (H - 14) + '" width="12" height="12" rx="3" fill="' + C[k] + '"/><text x="' + (lx + 18) + '" y="' + (H - 4) + '">' + k + "</text>";
      lx += 16 + k.length * 7.5 + 22;
    });
    s += "</svg>";
    host.innerHTML = s;
    host.querySelector("svg").style.width = "100%";
    host.querySelector("svg").style.height = "auto";
    host.querySelectorAll("text").forEach(function (t) { t.style.fontFamily = "JetBrains Mono, monospace"; t.style.fontSize = t.style.fontSize || "11px"; t.style.fill = INK; });
  })();

  /* 8.1 alignment */
  (function align() {
    var ALIGN = { raw: [0.204, 0.256, 0.041, 0.050], adapted: [0.399, 0.611, 0.545, 0.474], shared: 0.624 };
    var host = document.getElementById("rp-align");
    function render(mode) {
      var rows = T.map(function (n, i) { return { name: n, v: ALIGN[mode][i] }; });
      rows.push({ name: "Shared target", v: ALIGN.shared, cls: "bar--shared" });
      if (!host.children.length) bars(host, rows, 0.7, f3, true);
      else [].forEach.call(host.children, function (el, i) { el.querySelector(".bar__fill").style.width = (rows[i].v / 0.7) * 100 + "%"; el.querySelector(".bar__v").textContent = f3(rows[i].v); });
    }
    document.querySelectorAll(".seg__btn[data-align]").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".seg__btn[data-align]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
        render(b.getAttribute("data-align"));
      });
    });
    render("raw");
  })();

  /* 8.2 RSM heatmap */
  (function rsm() {
    var N = T.concat(["Shared"]);
    var VFM = [[1, .334, .069, .191, .349], [.334, 1, .311, .490, .704], [.069, .311, 1, .379, .249], [.191, .490, .379, 1, .363], [.349, .704, .249, .363, 1]];
    var BHA = [[1, .839, .736, .748, .868], [.839, 1, .768, .793, .895], [.736, .768, 1, .911, .712], [.748, .793, .911, 1, .718], [.868, .895, .712, .718, 1]];
    var heat = document.getElementById("rp-rsm"), note = document.getElementById("rp-rsm-note");
    if (!heat) return;
    var base = note.textContent;
    function col(v) {
      var p = Math.max(0, Math.min(1, (v + 1) / 2));
      var stops = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]];
      var x = p * (stops.length - 1), i = Math.floor(x), f = x - i, a = stops[i], b = stops[Math.min(i + 1, stops.length - 1)];
      return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * f) + "," + Math.round(a[1] + (b[1] - a[1]) * f) + "," + Math.round(a[2] + (b[2] - a[2]) * f) + ")";
    }
    function render(mode) {
      var M = mode === "bha" ? BHA : VFM;
      if (!heat.children.length) {
        heat.appendChild(document.createElement("div"));
        N.forEach(function (n) { var d = document.createElement("div"); d.className = "heat__top"; d.textContent = n; heat.appendChild(d); });
        N.forEach(function (n, i) {
          var l = document.createElement("div"); l.className = "heat__lab"; l.textContent = n; heat.appendChild(l);
          N.forEach(function (m, j) {
            var c = document.createElement("div"); c.className = "heat__cell"; c.dataset.i = i; c.dataset.j = j;
            c.addEventListener("mouseenter", function () { note.textContent = i === j ? base : n + " vs " + m + ": r = " + VFM[i][j].toFixed(2) + " between teacher features → " + BHA[i][j].toFixed(2) + " between the student outputs predicted from the same brain signal."; });
            c.addEventListener("mouseleave", function () { note.textContent = base; });
            heat.appendChild(c);
          });
        });
      }
      heat.querySelectorAll(".heat__cell").forEach(function (c) {
        var v = M[c.dataset.i][c.dataset.j];
        c.style.background = col(v); c.textContent = v.toFixed(2); c.style.color = v > 0.6 ? "#0b1020" : "#fff";
      });
    }
    document.querySelectorAll(".seg__btn[data-rsm]").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".seg__btn[data-rsm]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
        render(b.getAttribute("data-rsm"));
      });
    });
    render("vfm");
  })();

  /* 8.3 attribution */
  (function attr() {
    var IM = ["bonnet", "snowshoe", "gondola", "bok_choy", "goose", "pocketknife"];
    var GROUPS = ["openclip", "dfn", "mae", "dinov2l", "shared_fusion"];
    var GLAB = { openclip: "OpenCLIP", dfn: "DFN-6", mae: "MAE-18", dinov2l: "DINOv2-12", shared_fusion: "Shared" };
    var picks = document.getElementById("rp-attr-picks"), row = document.getElementById("rp-attr"), ATTR = null;
    if (!picks || !row) return;
    function divColor(v) {
      var a = Math.abs(v), r, g, b;
      if (v >= 0) { r = 255; g = Math.round(255 - a * 215); b = Math.round(255 - a * 230); }
      else { r = Math.round(255 - a * 215); g = Math.round(255 - a * 160); b = 255; }
      return "rgb(" + r + "," + g + "," + b + ")";
    }
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
      var hasImg = ["bonnet", "snowshoe", "gondola"].indexOf(id) >= 0;
      row.innerHTML = hasImg ? '<div class="attr__tile"><img src="assets/insight/img/' + id + '.jpg" alt="' + id + '" loading="lazy"><span>seen</span></div>' : '<div class="attr__tile attr__tile--name"><b>' + id.replace(/_/g, " ") + "</b><span>seen</span></div>";
      GROUPS.forEach(function (g) {
        var d = document.createElement("div"); d.className = "attr__tile";
        var cv = document.createElement("canvas"); cv.width = 160; cv.height = 160; d.appendChild(cv);
        var sp = document.createElement("span"); sp.textContent = GLAB[g]; d.appendChild(sp);
        row.appendChild(d);
        drawMap(cv, ATTR[id].maps[ATTR[id].groups.indexOf(g)]);
      });
      picks.querySelectorAll(".attr__pick").forEach(function (p) { p.classList.toggle("is-active", p.dataset.id === id); });
    }
    fetch("assets/insight/attribution_maps.json").then(function (r) { return r.json(); }).then(function (d) {
      ATTR = d;
      IM.filter(function (id) { return d[id]; }).forEach(function (id) {
        var b = document.createElement("button"); b.type = "button"; b.className = "attr__pick"; b.dataset.id = id;
        b.innerHTML = ["bonnet", "snowshoe", "gondola"].indexOf(id) >= 0 ? '<img src="assets/insight/img/' + id + '.jpg" alt="' + id + '" loading="lazy">' : "<b>" + id.replace(/_/g, " ") + "</b>";
        b.addEventListener("click", function () { render(id); });
        picks.appendChild(b);
      });
      render("bonnet");
      var lg = document.createElement("div"); lg.className = "attr__legend"; lg.innerHTML = "<span>lowers match</span><i></i><span>raises match</span>"; row.parentNode.insertBefore(lg, row.nextSibling);
    });
  })();

  /* 8.4 units + concept bars */
  (function units() {
    var UNITS = [
      { id: "905", concept: "Clothing", imgs: [["suit", 0.076], ["gorilla", 0.067], ["chaps", 0.063], ["kneepad", 0.057], ["coat", 0.057]] },
      { id: "4610", concept: "Dessert / food", imgs: [["dessert", 0.074], ["calamari", 0.069], ["omelet", 0.067], ["crepe", 0.065], ["pie", 0.064]] },
      { id: "504", concept: "Animal", imgs: [["piglet", 0.069], ["lamb", 0.055], ["antelope", 0.047], ["cat", 0.047], ["pajamas", 0.046]] }
    ];
    var host = document.getElementById("rp-units");
    if (host) host.innerHTML = UNITS.map(function (u) {
      var mx = u.imgs[0][1];
      return '<div class="unit"><div class="unit__tag"><span class="unit__id">unit ' + u.id + '</span><span class="unit__concept">' + u.concept + '</span><span class="unit__sub">top-5 held-out activations</span></div><div class="unit__imgs">' +
        u.imgs.map(function (x) { return '<div class="unit__img"><img src="assets/insight/img/' + x[0] + '.jpg" alt="' + x[0] + '" loading="lazy"><b>' + x[0].replace(/_/g, " ") + " · " + x[1].toFixed(3) + '</b><i style="width:' + (x[1] / mx) * 100 + '%"></i></div>'; }).join("") + "</div></div>";
    }).join("");
    bars(document.getElementById("rp-concept"), [["OpenCLIP", .612], ["DFN-6", .726], ["MAE-18", .796], ["DINOv2-12", .812], ["Shared", .814], ["Neuron shuffle", 0.0]].map(function (r) { return { name: r[0], v: r[1], cls: r[0] === "Shared" ? "bar--shared" : (r[1] === 0 ? "bar--grey" : "") }; }), 0.9, f2, true);
  })();

  /* 8.5 temporal */
  (function temporal() {
    var TEMP = null, cur = "eeg";
    var TCOL = { bha: "#ff3d81", shared_fusion: "#0ea5e9", dfn: "#f59e0b", openclip: "#2b5cff", mae: "#16a34a", dinov2l: "#9333ea" };
    var TLAB = { bha: "BHA (composed)", shared_fusion: "shared expert", dfn: "DFN-6", openclip: "OpenCLIP", mae: "MAE-18", dinov2l: "DINOv2-12" };
    function tchart(svg, D, key, sdKey, title, yLabel, chance) {
      if (!svg) return;
      var W = 520, H = 300, L = 42, R = 14, Tp = 30, B = 40, xs = D.centers, xmax = 800, ymax = 0;
      Object.keys(D.series).forEach(function (e) { D.series[e][key].forEach(function (v) { ymax = Math.max(ymax, v); }); });
      ymax = Math.ceil(ymax / 10) * 10 || 10;
      var X = function (v) { return L + (v / xmax) * (W - L - R); }, Y = function (v) { return Tp + (1 - v / ymax) * (H - Tp - B); };
      var s = '<text class="ttl" x="' + L + '" y="18">' + title + " · " + yLabel + "</text>";
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
        var d = "";
        xs.forEach(function (x, i) { d += (i ? "L" : "M") + X(x).toFixed(1) + " " + Y(Math.max(0, D.series[e][key][i])).toFixed(1) + " "; });
        s += '<path class="ln" d="' + d + '" stroke="' + TCOL[e] + '" stroke-width="' + (e === "bha" ? 2.6 : 1.6) + '" opacity="' + (e === "bha" || e === "dfn" ? 1 : 0.85) + '"/>';
      });
      svg.innerHTML = s;
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
      b.addEventListener("click", function () {
        document.querySelectorAll(".seg__btn[data-temporal]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
        cur = b.getAttribute("data-temporal"); render();
      });
    });
  })();
})();
