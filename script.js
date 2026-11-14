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

  /* ---------- i18n re-render ---------- */
  if (I18N && I18N.onChange) {
    I18N.onChange(function () {
      buildWalls();
      if (barsList && barsList.children.length) renderBars(currentMod);
    });
  }
})();
