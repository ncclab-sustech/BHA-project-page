(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var I18N = window.BHA_I18N;
  if (I18N) I18N.init();
  function t(key) {
    return I18N ? I18N.t(I18N.getLang(), key) : key;
  }

  /* ---------- data ---------- */
  var SHOW = [
    "cheetah", "elephant", "hamburger", "sailboat", "pug", "strawberry", "jeep", "flamingo",
    "croissant", "gorilla", "cupcake", "dalmatian", "banana", "eagle", "birthday_cake", "wine",
    "piglet", "cruise_ship", "orange", "rhinoceros", "lamb", "suit", "boat", "omelet", "cat",
    "bread", "pajamas", "basketball", "wok", "beaver", "bike", "coconut", "pie", "popcorn",
    "pretzel", "rooster", "turkey", "tiara", "gondola", "goose", "kettle", "lettuce", "manatee",
    "minivan", "pear", "robot"
  ];
  var RET = {
    eeg: [["NICE", 16.1], ["ATM-S", 28.5], ["UBP", 50.9], ["NeuroBridge", 63.2], ["HyFI", 68.2], ["MBP", 75.7], ["LVBP", 80.0], ["DMSA", 82.6], ["BHA", 87.0, 93.9]],
    meg: [["NICE", 12.8], ["UBP", 26.7], ["NeuroBridge", 32.2], ["MBP", 33.9], ["HyFI", 35.8], ["LVBP", 44.0], ["DMSA", 48.0], ["BHA", 55.6, 68.1]]
  };
  var REC = [["PixCorr", 0.277, 0.195, 0.35], ["SSIM", 0.454, 0.336, 0.55], ["CLIP", 0.830, 0.808, 1.0]];

  var SUBS = {};
  function src(id, kind) {
    return "assets/showcase/" + id + "_" + kind + ".jpg";
  }
  function pretty(id) {
    return id.replace(/_/g, " ");
  }
  function subOf(id) {
    return SUBS[id] || "08";
  }

  /* ---------- nav ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > window.innerHeight * 0.75);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  var navLinks = document.querySelectorAll(".nav__links a[href^='#']");
  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (l) {
          if (l.getAttribute("href") === "#" + e.target.id) l.setAttribute("aria-current", "page");
          else l.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px" });
    navLinks.forEach(function (l) {
      var el = document.getElementById(l.getAttribute("href").slice(1));
      if (el) secObs.observe(el);
    });
  }

  /* ---------- reveal + count-up ---------- */
  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-to"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    if (reduced) {
      el.textContent = to.toFixed(dec);
      return;
    }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / 1500);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.setProperty("--d", Math.min(sib, 5) * 110 + "ms");
        el.classList.add("is-in");
        el.querySelectorAll(".count").forEach(countUp);
        if (el.id === "bars") renderBars(currentMod);
        if (el.querySelector("#minis")) fillMinis();
        revObs.unobserve(el);
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) {
      revObs.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
      el.querySelectorAll(".count").forEach(countUp);
    });
    renderBars("eeg");
    fillMinis();
  }

  /* ---------- film player ---------- */
  var player = document.getElementById("player");
  var film = document.getElementById("film-video");
  var filmBtn = document.getElementById("film-play");
  var filmDur = document.getElementById("film-dur");
  if (film && filmBtn) {
    filmBtn.addEventListener("click", function () {
      film.play();
    });
    film.addEventListener("play", function () {
      player.classList.add("is-playing");
    });
    film.addEventListener("pause", function () {
      if (film.currentTime < film.duration - 0.2) player.classList.remove("is-playing");
    });
    film.addEventListener("ended", function () {
      player.classList.remove("is-playing");
    });
    film.addEventListener("loadedmetadata", function () {
      if (isFinite(film.duration)) {
        var m = Math.floor(film.duration / 60), s = Math.round(film.duration % 60);
        filmDur.textContent = m + ":" + (s < 10 ? "0" : "") + s;
      }
    });
    film.addEventListener("error", function () {
      player.classList.add("is-missing");
    });
  }

  /* ---------- manifest ---------- */
  var manifestReady = fetch("assets/showcase/manifest.json").then(function (r) {
    return r.json();
  }).then(function (m) {
    if (Array.isArray(m) && m.length && typeof m[0] === "object") {
      SHOW = m.map(function (x) {
        SUBS[x.id] = x.sub;
        return x.id;
      });
    }
  }).catch(function () {});

  /* ---------- EEG data ---------- */
  var eeg = null; // {channels, trials:[{avg:[[...]]}]}
  var eegNorm = [];
  fetch("assets/eeg_sub08.json").then(function (r) {
    return r.json();
  }).then(function (d) {
    eeg = d;
    eegNorm = d.trials.map(function (tr) {
      return tr.avg.map(function (ch) {
        var m = 0;
        for (var i = 0; i < ch.length; i++) m += ch[i] * ch[i];
        var sd = Math.sqrt(m / ch.length) || 1;
        return ch.map(function (v) {
          return v / sd;
        });
      });
    });
    startListenArt();
    manifestReady.then(function () {
      demoRun(0, 0, true);
    });
  }).catch(function () {
    manifestReady.then(function () {
      demoRun(0, 0, true);
    });
  });

  /* ---------- live decoder demo ---------- */
  var seenImg = document.getElementById("demo-seen");
  var outCv = document.getElementById("demo-out");
  var eegCv = document.getElementById("demo-eeg");
  var msEl = document.getElementById("demo-ms");
  var nameEl = document.getElementById("demo-name");
  var drawsEl = document.getElementById("demo-draws");
  var pickerEl = document.getElementById("demo-picker");
  var demoIdx = 0, demoGen = 0, demoTimer = null, lastUser = 0, animToken = 0;

  var noiseCvs = [];
  (function makeNoise() {
    for (var k = 0; k < 4; k++) {
      var c = document.createElement("canvas");
      c.width = 128;
      c.height = 128;
      var cx = c.getContext("2d");
      var im = cx.createImageData(128, 128);
      for (var i = 0; i < im.data.length; i += 4) {
        var v = 40 + Math.random() * 200;
        im.data[i] = v * (0.7 + Math.random() * 0.3);
        im.data[i + 1] = v * (0.7 + Math.random() * 0.3);
        im.data[i + 2] = v;
        im.data[i + 3] = 255;
      }
      cx.putImageData(im, 0, 0);
      noiseCvs.push(c);
    }
  })();

  function buildPicker() {
    if (!pickerEl) return;
    pickerEl.innerHTML = "";
    SHOW.forEach(function (id, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pick" + (i === 0 ? " is-active" : "");
      b.innerHTML = '<img src="' + src(id, "gt") + '" alt="' + pretty(id) + '" loading="lazy" width="72" height="72">';
      b.addEventListener("click", function () {
        lastUser = Date.now();
        demoRun(i, 0, false);
      });
      pickerEl.appendChild(b);
    });
  }

  function drawEEG(fraction, trialIdx) {
    if (!eegCv) return;
    var ctx = eegCv.getContext("2d");
    var W = eegCv.width, H = eegCv.height;
    ctx.clearRect(0, 0, W, H);
    var chans = eegNorm.length ? eegNorm[trialIdx % eegNorm.length] : null;
    var n = chans ? chans.length : 8;
    var rowH = H / (n + 1);
    for (var c = 0; c < n; c++) {
      var base = rowH * (c + 1);
      ctx.beginPath();
      var L = chans ? chans[c].length : 250;
      var upto = Math.floor(L * fraction);
      for (var i = 0; i < upto; i++) {
        var v = chans ? chans[c][i] : Math.sin(i / 9 + c) * 0.8;
        var x = (i / (L - 1)) * (W - 24) + 12;
        var y = base - v * rowH * 0.42;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      var hot = c >= n - 3;
      ctx.lineWidth = hot ? 1.6 : 1.1;
      ctx.strokeStyle = hot ? "rgba(159,208,255,0.95)" : "rgba(255,255,255,0.35)";
      ctx.stroke();
      if (upto > 0 && fraction < 1) {
        var lx = ((upto - 1) / (L - 1)) * (W - 24) + 12;
        ctx.fillStyle = hot ? "#9fd0ff" : "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.arc(lx, base - (chans ? chans[c][upto - 1] : 0) * rowH * 0.42, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (msEl) msEl.textContent = Math.round(fraction * 1000) + " ms";
  }

  function materialize(img, token, done) {
    if (!outCv) return;
    var ctx = outCv.getContext("2d");
    var W = outCv.width, H = outCv.height;
    var start = null;
    var dur = reduced ? 1 : 1700;
    function frame(ts) {
      if (token !== animToken) return;
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var e = 1 - Math.pow(1 - p, 2.2);
      ctx.save();
      ctx.filter = "blur(" + ((1 - e) * 26).toFixed(1) + "px) saturate(" + (0.2 + 0.8 * e).toFixed(2) + ") contrast(" + (0.8 + 0.2 * e).toFixed(2) + ")";
      var sc = 1 + (1 - e) * 0.12;
      ctx.drawImage(img, (W - W * sc) / 2, (H - H * sc) / 2, W * sc, H * sc);
      ctx.restore();
      if (e < 1) {
        ctx.save();
        ctx.globalAlpha = Math.pow(1 - e, 1.3) * 0.95;
        ctx.imageSmoothingEnabled = false;
        var nc = noiseCvs[Math.floor(ts / 40) % noiseCvs.length];
        var block = Math.max(1, Math.round((1 - e) * 10));
        ctx.drawImage(nc, 0, 0, Math.max(8, 128 / block), Math.max(8, 128 / block), 0, 0, W, H);
        ctx.restore();
        requestAnimationFrame(frame);
      } else if (done) done();
    }
    requestAnimationFrame(frame);
  }

  function demoRun(i, gen, auto) {
    if (!seenImg) return;
    demoIdx = i;
    demoGen = gen;
    var id = SHOW[i];
    var token = ++animToken;
    seenImg.src = src(id, "gt");
    nameEl.textContent = pretty(id) + " · " + t("dec.part") + " " + subOf(id);
    pickerEl.querySelectorAll(".pick").forEach(function (p, k) {
      p.classList.toggle("is-active", k === i);
    });
    if (!auto) {
      var active = pickerEl.children[i];
      if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
    drawsEl.innerHTML = "";
    [0, 1, 2].forEach(function (g) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "draw" + (g === gen ? " is-active" : "");
      b.innerHTML = '<img src="' + src(id, "gen" + g) + '" alt="decode ' + (g + 1) + '" width="160" height="160">';
      b.addEventListener("click", function () {
        lastUser = Date.now();
        demoRun(i, g, false);
      });
      drawsEl.appendChild(b);
    });
    var out = new Image();
    out.src = src(id, "gen" + gen);
    // phase 1: EEG sweep
    var start = null;
    var sweep = reduced ? 1 : 1100;
    function sweepFrame(ts) {
      if (token !== animToken) return;
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / sweep);
      drawEEG(p, i);
      if (p < 1) requestAnimationFrame(sweepFrame);
      else {
        if (out.complete) materialize(out, token);
        else out.onload = function () {
          materialize(out, token);
        };
      }
    }
    // clear output to noise immediately
    if (outCv) {
      var ctx = outCv.getContext("2d");
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(noiseCvs[0], 0, 0, 16, 16, 0, 0, outCv.width, outCv.height);
      ctx.restore();
    }
    requestAnimationFrame(sweepFrame);
    scheduleAuto();
  }

  function scheduleAuto() {
    if (reduced) return;
    clearTimeout(demoTimer);
    demoTimer = setTimeout(function () {
      if (Date.now() - lastUser < 14000) {
        scheduleAuto();
        return;
      }
      var rect = document.getElementById("demo").getBoundingClientRect();
      var visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (visible) demoRun((demoIdx + 1) % SHOW.length, (demoGen + 1) % 3, true);
      else scheduleAuto();
    }, 6500);
  }

  /* ---------- wall ---------- */
  function buildWall(rowEl, ids) {
    if (!rowEl) return;
    var html = "";
    ids.forEach(function (id) {
      html += '<div class="pair"><img src="' + src(id, "gt") + '" alt="' + pretty(id) + ', seen" loading="lazy" width="200" height="200"><img src="' + src(id, "gen" + (id.length % 3)) + '" alt="' + pretty(id) + ', decoded" loading="lazy" width="200" height="200"><i>' + t("wall.seen") + "</i><i>" + t("wall.dec") + "</i></div>";
    });
    rowEl.innerHTML = html + html;
  }
  function buildWalls() {
    buildWall(document.getElementById("wall-a"), SHOW.slice(0, 23));
    buildWall(document.getElementById("wall-b"), SHOW.slice(23));
  }
  manifestReady.then(function () {
    buildPicker();
    buildWalls();
  });

  /* ---------- listen art (real EEG) ---------- */
  function startListenArt() {
    var cv = document.getElementById("art-listen");
    if (!cv || !eegNorm.length) return;
    var ctx = cv.getContext("2d");
    var W = cv.width, H = cv.height;
    var sig = [];
    for (var c = 0; c < 8; c++) {
      var arr = [];
      eegNorm.forEach(function (tr) {
        arr = arr.concat(tr[c]);
      });
      sig.push(arr);
    }
    var L = sig[0].length, span = 700, off = 0, last = 0;
    function draw(ts) {
      if (!last) last = ts;
      var dt = Math.min(50, ts - last);
      last = ts;
      if (!reduced) off = (off + dt * 0.12) % L;
      ctx.clearRect(0, 0, W, H);
      var rowH = H / 9;
      for (var c = 0; c < 8; c++) {
        var base = rowH * (c + 1);
        ctx.beginPath();
        for (var px = 0; px <= W; px += 3) {
          var idx = (off + (px / W) * span) % L;
          var i0 = Math.floor(idx), f = idx - i0;
          var v = sig[c][i0] * (1 - f) + sig[c][(i0 + 1) % L] * f;
          var y = base - v * rowH * 0.45;
          if (px === 0) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        var g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, "rgba(6,199,241,0.1)");
        g.addColorStop(0.6, c >= 5 ? "rgba(159,208,255,0.95)" : "rgba(255,255,255,0.45)");
        g.addColorStop(1, "rgba(255,61,129,0.9)");
        ctx.strokeStyle = g;
        ctx.lineWidth = c >= 5 ? 1.8 : 1.2;
        ctx.stroke();
      }
      if (!reduced) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ---------- bars ---------- */
  var currentMod = "eeg";
  var barsList = document.getElementById("bars-list");
  function renderBars(mod) {
    if (!barsList) return;
    currentMod = mod;
    var rows = RET[mod].slice().sort(function (a, b) {
      return b[1] - a[1];
    });
    barsList.innerHTML = "";
    rows.forEach(function (r) {
      var ours = r[0] === "BHA";
      var el = document.createElement("div");
      el.className = "bar" + (ours ? " bar--ours" : "");
      el.innerHTML = '<span class="bar__name">' + r[0] + '</span><span class="bar__track"><span class="bar__fill"></span>' + (ours ? '<span class="bar__ext"></span>' : "") + '</span><span class="bar__v">' + (ours ? r[2] : r[1]).toFixed(1) + "%</span>";
      barsList.appendChild(el);
      var fill = el.querySelector(".bar__fill"), ext = el.querySelector(".bar__ext");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fill.style.width = r[1] + "%";
          if (ext) ext.style.width = r[2] + "%";
        });
      });
    });
    var leg = document.createElement("div");
    leg.className = "bars__legend";
    leg.innerHTML = '<span><i style="background:#c9cfe3"></i>' + t("bars.prior") + '</span><span><i style="background:linear-gradient(90deg,#2b5cff,#7c3aed)"></i>BHA · ' + t("bars.raw") + '</span><span><i style="background:repeating-linear-gradient(135deg,rgba(124,58,237,.7) 0 3px,transparent 3px 6px)"></i>BHA · CSLS-2</span>';
    barsList.appendChild(leg);
  }
  document.querySelectorAll(".tab[data-mod]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".tab[data-mod]").forEach(function (x) {
        x.classList.toggle("is-active", x === b);
      });
      renderBars(b.getAttribute("data-mod"));
    });
  });

  /* ---------- minis ---------- */
  var minis = document.getElementById("minis");
  (function renderMinis() {
    if (!minis) return;
    minis.innerHTML = "";
    REC.forEach(function (m) {
      var el = document.createElement("div");
      el.className = "mini";
      el.innerHTML = '<div class="mini__t">' + m[0] + '</div><div class="bar bar--ours"><span class="bar__name">BHA</span><span class="bar__track"><span class="bar__fill" data-w="' + (m[1] / m[3]) * 100 + '"></span></span><span class="bar__v">' + m[1].toFixed(3) + '</span></div><div class="bar"><span class="bar__name">MBP</span><span class="bar__track"><span class="bar__fill" data-w="' + (m[2] / m[3]) * 100 + '"></span></span><span class="bar__v">' + m[2].toFixed(3) + "</span></div>";
      minis.appendChild(el);
    });
  })();
  function fillMinis() {
    if (!minis) return;
    minis.querySelectorAll(".bar__fill").forEach(function (f) {
      f.style.width = f.getAttribute("data-w") + "%";
    });
  }


  /* ---------- insights ---------- */
  (function insights() {
    var T = ["OpenCLIP", "DFN-6", "MAE-18", "DINOv2-12"];
    // L1: brain–image cosine, raw vs adapted (Fig. concept (a))
    var ALIGN = { raw: [0.204, 0.256, 0.041, 0.050], adapted: [0.399, 0.611, 0.545, 0.474], shared: 0.624 };
    var ab = document.getElementById("align-bars");
    function renderAlign(mode) {
      if (!ab) return;
      if (!ab.children.length) {
        T.concat(["Shared"]).forEach(function (n, i) {
          var el = document.createElement("div");
          el.className = "bar" + (i === 4 ? " bar--shared" : "");
          el.innerHTML = '<span class="bar__name">' + n + '</span><span class="bar__track"><span class="bar__fill"></span></span><span class="bar__v">0.00</span>';
          ab.appendChild(el);
        });
      }
      [].forEach.call(ab.children, function (el, i) {
        var v = i === 4 ? ALIGN.shared : ALIGN[mode][i];
        el.querySelector(".bar__fill").style.width = (v / 0.7) * 100 + "%";
        el.querySelector(".bar__v").textContent = v.toFixed(3);
      });
    }
    document.querySelectorAll(".seg__btn[data-align]").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".seg__btn[data-align]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
        renderAlign(b.getAttribute("data-align"));
      });
    });
    renderAlign("raw");

    // L2: RSM correlations (Fig. rsa (c))
    var N = T.concat(["Shared"]);
    var VFM = [[1, .334, .069, .191, .349], [.334, 1, .311, .490, .704], [.069, .311, 1, .379, .249], [.191, .490, .379, 1, .363], [.349, .704, .249, .363, 1]];
    var BHA = [[1, .839, .736, .748, .868], [.839, 1, .768, .793, .895], [.736, .768, 1, .911, .712], [.748, .793, .911, 1, .718], [.868, .895, .712, .718, 1]];
    var heat = document.getElementById("rsm"), note = document.getElementById("rsm-note");
    function col(v) { // -1..1 -> blue..green..yellow (viridis-ish)
      var p = Math.max(0, Math.min(1, (v + 1) / 2));
      var stops = [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]];
      var x = p * (stops.length - 1), i = Math.floor(x), f = x - i, a = stops[i], b = stops[Math.min(i + 1, stops.length - 1)];
      return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * f) + "," + Math.round(a[1] + (b[1] - a[1]) * f) + "," + Math.round(a[2] + (b[2] - a[2]) * f) + ")";
    }
    function renderHeat(mode) {
      if (!heat) return;
      var M = mode === "bha" ? BHA : VFM;
      if (!heat.children.length) {
        heat.appendChild(document.createElement("div"));
        N.forEach(function (n) { var d = document.createElement("div"); d.className = "heat__top"; d.textContent = n; heat.appendChild(d); });
        N.forEach(function (n, i) {
          var l = document.createElement("div"); l.className = "heat__lab"; l.textContent = n; heat.appendChild(l);
          N.forEach(function (m, j) {
            var c = document.createElement("div"); c.className = "heat__cell"; c.dataset.i = i; c.dataset.j = j;
            c.addEventListener("mouseenter", function () {
              if (i === j) { note.textContent = n; return; }
              note.textContent = n + " vs " + m + ": r = " + VFM[i][j].toFixed(2) + " " + t("ins.l2.asAI") + " → " + BHA[i][j].toFixed(2) + " " + t("ins.l2.viaBrain");
            });
            heat.appendChild(c);
          });
        });
      }
      heat.querySelectorAll(".heat__cell").forEach(function (c) {
        var v = M[c.dataset.i][c.dataset.j];
        c.style.background = col(v);
        c.textContent = v.toFixed(2);
        c.style.color = v > 0.6 ? "#0b1020" : "#fff";
      });
    }
    document.querySelectorAll(".seg__btn[data-rsm]").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".seg__btn[data-rsm]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
        renderHeat(b.getAttribute("data-rsm"));
      });
    });
    renderHeat("vfm");

    // L3: occlusion attribution maps, drawn natively from the ten-participant means
    var IM = ["bonnet", "snowshoe", "gondola"], GROUPS = ["openclip", "dfn", "mae", "dinov2l", "shared_fusion"];
    var GLAB = { openclip: "OpenCLIP", dfn: "DFN-6", mae: "MAE-18", dinov2l: "DINOv2-12", shared_fusion: "ins.l3.shared" };
    var picks = document.getElementById("attr-picks"), row = document.getElementById("attr-row"), ATTR = null, curAttr = "bonnet";
    function divColor(v) { // -1..1 -> blue..white..red
      var a = Math.abs(v), r, g, b;
      if (v >= 0) { r = 255; g = Math.round(255 - a * 215); b = Math.round(255 - a * 230); }
      else { r = Math.round(255 - a * 215); g = Math.round(255 - a * 160); b = 255; }
      return "rgb(" + r + "," + g + "," + b + ")";
    }
    function drawMap(cv, m) { // within-map signed percentile colouring, as in the manuscript
      var n = m.length, ctx = cv.getContext("2d"), flat = [];
      for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) flat.push(Math.abs(m[i][j]));
      var sorted = flat.slice().sort(function (a, b) { return a - b; });
      var rank = function (v) { var lo = 0, hi = sorted.length; while (lo < hi) { var mid = (lo + hi) >> 1; if (sorted[mid] < v) lo = mid + 1; else hi = mid; } return lo / (sorted.length - 1); };
      var cell = cv.width / n;
      for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var v = m[y][x]; ctx.fillStyle = divColor((v < 0 ? -1 : 1) * rank(Math.abs(v))); ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5); }
    }
    function renderAttr(id) {
      if (!row || !ATTR) return;
      curAttr = id;
      row.innerHTML = '<div class="attr__tile"><img src="assets/insight/img/' + id + '.jpg" alt="' + id + '" loading="lazy"><span>' + t("ins.l3.seen") + "</span></div>";
      GROUPS.forEach(function (g, k) {
        var l = GLAB[g].indexOf("ins.") === 0 ? t(GLAB[g]) : GLAB[g];
        var d = document.createElement("div"); d.className = "attr__tile";
        var cv = document.createElement("canvas"); cv.width = 160; cv.height = 160; d.appendChild(cv);
        var sp = document.createElement("span"); sp.textContent = l; d.appendChild(sp);
        row.appendChild(d);
        drawMap(cv, ATTR[id].maps[ATTR[id].groups.indexOf(g)]);
      });
      picks.querySelectorAll(".attr__pick").forEach(function (p) { p.classList.toggle("is-active", p.dataset.id === id); });
    }
    if (picks) {
      IM.forEach(function (id) {
        var b = document.createElement("button"); b.type = "button"; b.className = "attr__pick"; b.dataset.id = id;
        b.innerHTML = '<img src="assets/insight/img/' + id + '.jpg" alt="' + id + '" loading="lazy">';
        b.addEventListener("click", function () { renderAttr(id); });
        picks.appendChild(b);
      });
      fetch("assets/insight/attribution_maps.json").then(function (r) { return r.json(); }).then(function (d) { ATTR = d; renderAttr("bonnet"); });
    }

    // L4: concept-selective units, native cards
    var UNITS = [
      { id: "905", concept: "ins.l4.clothing", imgs: [["suit", 0.076], ["gorilla", 0.067], ["chaps", 0.063], ["kneepad", 0.057], ["coat", 0.057]] },
      { id: "4610", concept: "ins.l4.dessert", imgs: [["dessert", 0.074], ["calamari", 0.069], ["omelet", 0.067], ["crepe", 0.065], ["pie", 0.064]] },
      { id: "504", concept: "ins.l4.animal", imgs: [["piglet", 0.069], ["lamb", 0.055], ["antelope", 0.047], ["cat", 0.047], ["pajamas", 0.046]] }
    ];
    var unitsEl = document.getElementById("units");
    function renderUnits() {
      if (!unitsEl) return;
      unitsEl.innerHTML = UNITS.map(function (u) {
        var mx = u.imgs[0][1];
        return '<div class="unit"><div class="unit__tag"><span class="unit__id">' + t("ins.l4.unit") + " " + u.id + '</span><span class="unit__concept">' + t(u.concept) + '</span><span class="unit__sub">' + t("ins.l4.top5") + '</span></div><div class="unit__imgs">' +
          u.imgs.map(function (x) { return '<div class="unit__img"><img src="assets/insight/img/' + x[0] + '.jpg" alt="' + x[0] + '" loading="lazy"><b>' + x[0].replace(/_/g, " ") + " · " + x[1].toFixed(3) + '</b><i style="width:' + (x[1] / mx) * 100 + '%"></i></div>'; }).join("") + "</div></div>";
      }).join("");
    }
    renderUnits();
    var cb = document.getElementById("concept-bars");
    if (cb) {
      [["OpenCLIP", .612], ["DFN-6", .726], ["MAE-18", .796], ["DINOv2-12", .812], ["Shared", .814], ["shuffle", 0.0]].forEach(function (r) {
        var el = document.createElement("div"); el.className = "bar" + (r[0] === "Shared" ? " bar--shared" : "");
        el.innerHTML = '<span class="bar__name">' + r[0] + '</span><span class="bar__track"><span class="bar__fill" data-w="' + (r[1] / 0.9) * 100 + '"></span></span><span class="bar__v">' + r[1].toFixed(2) + "</span>";
        cb.appendChild(el);
      });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (!e.isIntersecting) return; cb.querySelectorAll(".bar__fill").forEach(function (f) { f.style.width = f.getAttribute("data-w") + "%"; }); o.disconnect(); }); }, { threshold: 0.3 }).observe(cb);
      } else cb.querySelectorAll(".bar__fill").forEach(function (f) { f.style.width = f.getAttribute("data-w") + "%"; });
    }

    // L5: temporal masking curves, native SVG
    var TEMP = null, curDs = "eeg";
    var TCOL = { bha: "#ff3d81", shared_fusion: "#9fd0ff", dfn: "#f59e0b", openclip: "#2b5cff", mae: "#4ade80", dinov2l: "#c084fc" };
    var TLAB = { bha: "BHA (composed)", shared_fusion: "shared expert", dfn: "DFN-6", openclip: "OpenCLIP", mae: "MAE-18", dinov2l: "DINOv2-12" };
    function tchart(svg, D, key, sdKey, title, yLabel, chance) {
      if (!svg) return;
      var W = 520, H = 300, L = 42, R = 14, Tp = 30, B = 40;
      var xs = D.centers, xmax = 800;
      var ymax = 0;
      Object.keys(D.series).forEach(function (e) { D.series[e][key].forEach(function (v) { ymax = Math.max(ymax, v); }); });
      ymax = Math.ceil(ymax / 10) * 10 || 10;
      var X = function (v) { return L + (v / xmax) * (W - L - R); }, Y = function (v) { return Tp + (1 - v / ymax) * (H - Tp - B); };
      var s = '<text class="ttl" x="' + L + '" y="18">' + title + ' · ' + yLabel + "</text>";
      for (var g = 0; g <= ymax; g += ymax / 4) s += '<line class="ax" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(g) + '" y2="' + Y(g) + '"/><text class="tick" x="' + (L - 6) + '" y="' + (Y(g) + 4) + '" text-anchor="end">' + Math.round(g) + "</text>";
      [0, 200, 400, 600, 800].forEach(function (x) { s += '<text class="tick" x="' + X(x) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + x + "</text>"; });
      s += '<text class="tick" x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">ms after image onset</text>';
      [100, 220].forEach(function (m) { s += '<line class="mark" x1="' + X(m) + '" x2="' + X(m) + '" y1="' + Tp + '" y2="' + (H - B) + '"/><text class="mlab" x="' + (X(m) + 4) + '" y="' + (Tp + 12) + '">' + m + " ms</text>"; });
      if (chance != null) s += '<line class="ax" style="stroke:rgba(255,255,255,.4);stroke-dasharray:2 3" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(chance) + '" y2="' + Y(chance) + '"/>';
      // band for composed output
      var b = D.series.bha, up = "", dn = "";
      xs.forEach(function (x, i) { up += (i ? "L" : "M") + X(x) + " " + Y(Math.min(ymax, b[key][i] + b[sdKey][i])) + " "; });
      for (var i = xs.length - 1; i >= 0; i--) dn += "L" + X(xs[i]) + " " + Y(Math.max(0, b[key][i] - b[sdKey][i])) + " ";
      s += '<path class="band" d="' + up + dn + 'Z" fill="' + TCOL.bha + '"/>';
      ["dinov2l", "mae", "openclip", "dfn", "shared_fusion", "bha"].forEach(function (e) {
        var d = "";
        xs.forEach(function (x, i) { d += (i ? "L" : "M") + X(x).toFixed(1) + " " + Y(Math.max(0, D.series[e][key][i])).toFixed(1) + " "; });
        s += '<path class="ln" d="' + d + '" stroke="' + TCOL[e] + '" stroke-width="' + (e === "bha" ? 2.6 : 1.6) + '" opacity="' + (e === "bha" || e === "dfn" ? 1 : 0.8) + '"/>';
      });
      svg.innerHTML = s;
    }
    function renderTemporal() {
      if (!TEMP) return;
      var D = TEMP[curDs];
      tchart(document.getElementById("tchart-del"), D, "del", "delSd", t("ins.l5.delete"), t("ins.l5.pp"), null);
      tchart(document.getElementById("tchart-keep"), D, "keep", "keepSd", t("ins.l5.keep"), t("ins.l5.top1"), 0.5);
      var lg = document.getElementById("tlegend");
      if (lg) lg.innerHTML = ["bha", "shared_fusion", "dfn", "openclip", "mae", "dinov2l"].map(function (e) { return '<span><i style="background:' + TCOL[e] + '"></i>' + TLAB[e] + "</span>"; }).join("");
    }
    fetch("assets/insight/temporal.json").then(function (r) { return r.json(); }).then(function (d) { TEMP = d; renderTemporal(); });
    document.querySelectorAll(".seg__btn[data-temporal]").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".seg__btn[data-temporal]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
        curDs = b.getAttribute("data-temporal"); renderTemporal();
      });
    });

    if (I18N && I18N.onChange) I18N.onChange(function () { renderAttr(curAttr); renderUnits(); renderTemporal(); });
  })();

  /* ---------- i18n re-render ---------- */
  if (I18N && I18N.onChange) {
    I18N.onChange(function () {
      buildWalls();
      if (barsList && barsList.children.length) renderBars(currentMod);
    });
  }
})();
