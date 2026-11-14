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
    "piglet", "cruise_ship", "orange", "rhinoceros", "lamb", "coffee_bean", "suit", "boat",
    "omelet", "cat", "bread", "pajamas", "basketball", "wok"
  ];
  var RET = {
    eeg: [
      ["NICE", 16.1], ["ATM-S", 28.5], ["UBP", 50.9], ["NeuroBridge", 63.2], ["HyFI", 68.2],
      ["MBP", 75.7], ["LVBP", 80.0], ["DMSA", 82.6], ["BHA", 87.0, 93.9]
    ],
    meg: [
      ["NICE", 12.8], ["UBP", 26.7], ["NeuroBridge", 32.2], ["MBP", 33.9], ["HyFI", 35.8],
      ["LVBP", 44.0], ["DMSA", 48.0], ["BHA", 55.6, 68.1]
    ]
  };
  var REC = [
    ["PixCorr", 0.277, 0.195, 0.35],
    ["SSIM", 0.454, 0.336, 0.55],
    ["CLIP", 0.830, 0.808, 1.0]
  ];
  var CURVE = {
    x: [25, 50, 75, 100],
    series: [
      { key: "chart.l1", color: "#67645c", y: [42.7, 65.3, 75.55, 80.8] },
      { key: "chart.l2", color: "#7aa2ff", y: [45.65, 68.25, 77.65, 82.2] },
      { key: "chart.l3", color: "#ff6b4a", y: [53.25, 74.95, 82.45, 87.0] }
    ]
  };

  function src(id, kind) {
    return "assets/showcase/" + id + "_" + kind + ".jpg";
  }

  /* ---------- nav ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var navLinks = document.querySelectorAll(".nav__links a[href^='#']");
  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          navLinks.forEach(function (l) {
            l.toggleAttribute("aria-current", l.getAttribute("href") === "#" + e.target.id);
            if (l.hasAttribute("aria-current")) l.setAttribute("aria-current", "page");
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
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
    var dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var revObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
          el.style.setProperty("--d", Math.min(sib, 6) * 90 + "ms");
          el.classList.add("is-in");
          el.querySelectorAll(".count").forEach(countUp);
          if (el.id === "bars") renderBars(currentMod);
          revObs.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      revObs.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
      el.querySelectorAll(".count").forEach(countUp);
    });
  }

  /* ---------- EEG canvas ---------- */
  var canvas = document.getElementById("eeg");
  var eegData = null;
  var eegSig = [];
  fetch("assets/eeg_sub08.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      eegData = d;
      var n = d.channels.length;
      for (var c = 0; c < n; c++) {
        var arr = [];
        d.trials.forEach(function (tr) {
          arr = arr.concat(tr.avg[c]);
        });
        var m = 0;
        for (var i = 0; i < arr.length; i++) m += arr[i] * arr[i];
        var sd = Math.sqrt(m / arr.length) || 1;
        eegSig.push(arr.map(function (v) {
          return v / sd;
        }));
      }
      setupEEG();
      startDecodeLoop();
    })
    .catch(function () {
      startDecodeLoop();
    });

  function setupEEG() {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W, H;
    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var n = eegSig.length;
    var L = eegSig[0].length;
    var span = 900; // samples visible
    var offset = 0;
    var last = 0;

    function draw(ts) {
      if (!last) last = ts;
      var dt = Math.min(50, ts - last);
      last = ts;
      if (!reduced) offset = (offset + dt * 0.11) % L;
      ctx.clearRect(0, 0, W, H);
      var rowH = H / (n + 1);
      var amp = Math.min(rowH * 0.9, 42);
      for (var c = 0; c < n; c++) {
        var base = rowH * (c + 1);
        var sig = eegSig[c];
        var hot = c >= n - 3; // occipital channels highlighted
        ctx.beginPath();
        for (var px = 0; px <= W; px += 2) {
          var idx = (offset + (px / W) * span) % L;
          var i0 = Math.floor(idx);
          var i1 = (i0 + 1) % L;
          var f = idx - i0;
          var v = sig[i0] * (1 - f) + sig[i1] * f;
          var y = base - v * amp * 0.28;
          if (px === 0) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.lineWidth = hot ? 1.2 : 1;
        ctx.strokeStyle = hot ? "rgba(255,107,74,0.38)" : "rgba(236,232,223,0.075)";
        ctx.stroke();
      }
      // leading edge glow
      var g = ctx.createLinearGradient(W - 160, 0, W, 0);
      g.addColorStop(0, "rgba(7,8,12,0)");
      g.addColorStop(1, "rgba(7,8,12,0.9)");
      ctx.fillStyle = g;
      ctx.fillRect(W - 160, 0, 160, H);
      if (!reduced) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ---------- hero decode loop ---------- */
  function startDecodeLoop() {
    var seen = document.getElementById("decode-seen");
    var out = document.getElementById("decode-out");
    var lbl = document.getElementById("decode-label");
    var wave = document.getElementById("decode-wave");
    if (!seen || !out) return;
    var i = 0;
    var gen = 0;
    function setWave() {
      if (!eegSig.length || !wave) return;
      var sig = eegSig[eegSig.length - 1];
      var start = Math.floor(Math.random() * (sig.length - 120));
      var d = "";
      for (var k = 0; k < 120; k += 2) {
        var y = 20 - sig[start + k] * 7;
        d += (k === 0 ? "M" : "L") + k + " " + y.toFixed(1) + " ";
      }
      wave.setAttribute("d", d);
    }
    setWave();
    function next() {
      i = (i + 1) % SHOW.length;
      gen = (gen + 1) % 3;
      var id = SHOW[i];
      var a = new Image();
      var b = new Image();
      a.src = src(id, "gt");
      b.src = src(id, "gen" + gen);
      seen.classList.add("is-fading");
      out.classList.add("is-fading");
      setTimeout(function () {
        seen.src = a.src;
        lbl.textContent = id.replace(/_/g, " ");
        setWave();
        seen.classList.remove("is-fading");
        setTimeout(function () {
          out.src = b.src;
          out.classList.remove("is-fading");
        }, 420);
      }, 480);
    }
    if (!reduced) setInterval(next, 3600);
  }

  /* ---------- bars ---------- */
  var currentMod = "eeg";
  var barsList = document.getElementById("bars-list");
  function renderBars(mod) {
    if (!barsList) return;
    currentMod = mod;
    var rows = RET[mod].slice().sort(function (a, b) {
      return a[1] - b[1];
    }).reverse();
    var max = 100;
    barsList.innerHTML = "";
    rows.forEach(function (r) {
      var ours = r[0] === "BHA";
      var el = document.createElement("div");
      el.className = "bar" + (ours ? " bar--ours" : "");
      el.innerHTML =
        '<span class="bar__name">' + r[0] + "</span>" +
        '<span class="bar__track"><span class="bar__fill"></span>' + (ours ? '<span class="bar__ext"></span>' : "") + "</span>" +
        '<span class="bar__v">' + (ours ? r[2].toFixed(1) : r[1].toFixed(1)) + "%</span>";
      barsList.appendChild(el);
      var fill = el.querySelector(".bar__fill");
      var ext = el.querySelector(".bar__ext");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          fill.style.width = (r[1] / max) * 100 + "%";
          if (ext) ext.style.width = (r[2] / max) * 100 + "%";
        });
      });
    });
    var leg = document.createElement("div");
    leg.className = "bars__legend";
    leg.innerHTML =
      '<span><i style="background:rgba(255,255,255,.28)"></i>' + t("bars.raw") + "</span>" +
      '<span><i style="background:linear-gradient(90deg,#ff6b4a,#ff9a7a)"></i>BHA · ' + t("bars.raw") + "</span>" +
      '<span><i style="background:repeating-linear-gradient(135deg,rgba(255,107,74,.75) 0 3px,transparent 3px 6px)"></i>BHA · CSLS-2</span>';
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
  if (reduced) renderBars("eeg");

  /* ---------- minis ---------- */
  var minis = document.getElementById("minis");
  function renderMinis() {
    if (!minis) return;
    minis.innerHTML = "";
    REC.forEach(function (m) {
      var el = document.createElement("div");
      el.className = "mini";
      el.innerHTML =
        '<div class="mini__t">' + m[0] + "</div>" +
        '<div class="bar bar--ours"><span class="bar__name">BHA</span><span class="bar__track"><span class="bar__fill" data-w="' + (m[1] / m[3]) * 100 + '"></span></span><span class="bar__v">' + m[1].toFixed(3) + "</span></div>" +
        '<div class="bar"><span class="bar__name">MBP</span><span class="bar__track"><span class="bar__fill" data-w="' + (m[2] / m[3]) * 100 + '"></span></span><span class="bar__v">' + m[2].toFixed(3) + "</span></div>";
      minis.appendChild(el);
    });
  }
  renderMinis();
  if ("IntersectionObserver" in window && !reduced) {
    var miniObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll(".bar__fill").forEach(function (f) {
          f.style.width = f.getAttribute("data-w") + "%";
        });
        miniObs.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    if (minis) miniObs.observe(minis);
  } else if (minis) {
    minis.querySelectorAll(".bar__fill").forEach(function (f) {
      f.style.width = f.getAttribute("data-w") + "%";
    });
  }

  /* ---------- compare slider ---------- */
  var stage = document.getElementById("cmp-stage");
  var range = document.getElementById("cmp-range");
  var cmpSeen = document.getElementById("cmp-seen");
  var cmpOut = document.getElementById("cmp-out");
  var picks = document.getElementById("cmp-picks");
  if (stage && range) {
    range.addEventListener("input", function () {
      stage.style.setProperty("--x", range.value + "%");
    });
    var PICKS = SHOW.slice(0, 12);
    PICKS.forEach(function (id, k) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pick" + (id === "elephant" ? " is-active" : "");
      b.innerHTML = '<img src="' + src(id, "gt") + '" alt="' + id.replace(/_/g, " ") + '" loading="lazy" width="80" height="80">';
      b.addEventListener("click", function () {
        picks.querySelectorAll(".pick").forEach(function (p) {
          p.classList.toggle("is-active", p === b);
        });
        cmpSeen.src = src(id, "gt");
        cmpOut.src = src(id, "gen0");
        range.value = 50;
        stage.style.setProperty("--x", "50%");
      });
      picks.appendChild(b);
    });
    // gentle idle sweep until the user touches it
    if (!reduced) {
      var touched = false;
      range.addEventListener("pointerdown", function () {
        touched = true;
      });
      var t0 = null;
      function sweep(ts) {
        if (touched) return;
        if (!t0) t0 = ts;
        var p = ((ts - t0) / 5200) % 1;
        var x = 50 + 22 * Math.sin(p * Math.PI * 2);
        stage.style.setProperty("--x", x + "%");
        range.value = x;
        requestAnimationFrame(sweep);
      }
      requestAnimationFrame(sweep);
    }
  }

  /* ---------- tiles ---------- */
  var tiles = document.getElementById("tiles");
  if (tiles) {
    SHOW.forEach(function (id) {
      var el = document.createElement("div");
      el.className = "tile";
      el.setAttribute("data-g", "0");
      el.innerHTML =
        '<img class="in" src="' + src(id, "gt") + '" alt="' + id.replace(/_/g, " ") + ', seen" loading="lazy" width="200" height="200">' +
        '<img class="out" src="' + src(id, "gen0") + '" alt="' + id.replace(/_/g, " ") + ', decoded" loading="lazy" width="200" height="200">' +
        '<span class="tile__lbl">' + id.replace(/_/g, " ") + "</span>";
      function cycle() {
        var g = (parseInt(el.getAttribute("data-g"), 10) + 1) % 3;
        el.setAttribute("data-g", g);
        el.querySelector(".out").src = src(id, "gen" + g);
      }
      el.addEventListener("mouseenter", function () {
        el.classList.add("is-on");
        el.dataset.hover = "1";
      });
      el.addEventListener("mouseleave", function () {
        el.classList.remove("is-on");
        el.dataset.hover = "";
        cycle();
      });
      el.addEventListener("click", function () {
        if (el.classList.contains("is-on")) cycle();
        el.classList.add("is-on");
      });
      tiles.appendChild(el);
    });
    if (!reduced) {
      var all = tiles.querySelectorAll(".tile");
      setInterval(function () {
        var el = all[Math.floor(Math.random() * all.length)];
        if (el.dataset.hover || el.classList.contains("is-on")) return;
        el.classList.add("is-on");
        setTimeout(function () {
          if (!el.dataset.hover) el.classList.remove("is-on");
        }, 2600);
      }, 650);
    }
  }

  /* ---------- line chart ---------- */
  var chart = document.getElementById("chart");
  function renderChart() {
    if (!chart) return;
    var W = 560, H = 360, L = 56, R = 48, T = 30, B = 50;
    var ymin = 35, ymax = 92;
    function X(v) {
      return L + ((v - 25) / 75) * (W - L - R);
    }
    function Y(v) {
      return T + (1 - (v - ymin) / (ymax - ymin)) * (H - T - B);
    }
    var s = "";
    [40, 50, 60, 70, 80, 90].forEach(function (g) {
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(g) + '" y2="' + Y(g) + '"/>';
      s += '<text class="axis" x="' + (L - 10) + '" y="' + (Y(g) + 4) + '" text-anchor="end">' + g + "</text>";
    });
    CURVE.x.forEach(function (x) {
      s += '<text class="axis" x="' + X(x) + '" y="' + (H - B + 22) + '" text-anchor="middle">' + x + "%</text>";
    });
    s += '<text class="axis" x="' + (W - R) + '" y="' + (H - 8) + '" text-anchor="end">' + t("chart.x") + "</text>";
    s += '<text class="axis" x="' + L + '" y="' + (T - 12) + '" text-anchor="start">' + t("chart.y") + "</text>";
    // spread end labels so they never overlap
    var ends = CURVE.series.map(function (se) {
      return { v: se.y[se.y.length - 1], y: Y(se.y[se.y.length - 1]) };
    });
    ends.slice().sort(function (a, b) {
      return a.y - b.y;
    }).forEach(function (e, i, arr) {
      if (i > 0 && e.y - arr[i - 1].ly < 15) e.ly = arr[i - 1].ly + 15;
      else e.ly = e.y;
    });
    CURVE.series.forEach(function (se, si) {
      var d = "";
      se.y.forEach(function (v, i) {
        d += (i ? "L" : "M") + X(CURVE.x[i]) + " " + Y(v) + " ";
      });
      s += '<path class="line" d="' + d + '" stroke="' + se.color + '" style="transition-delay:' + si * 250 + 'ms"/>';
      se.y.forEach(function (v, i) {
        s += '<circle class="dot" cx="' + X(CURVE.x[i]) + '" cy="' + Y(v) + '" r="4" fill="' + se.color + '" style="transition-delay:' + (600 + i * 250) + 'ms"/>';
      });
      var last = se.y[se.y.length - 1];
      s += '<text class="lbl" x="' + (X(100) + 8) + '" y="' + (ends[si].ly + 4) + '" text-anchor="start" fill="' + se.color + '">' + last.toFixed(1) + "</text>";
      s += '<g class="legend" transform="translate(' + (L + 8) + "," + (H - B - 14 - si * 18) + ')"><rect width="16" height="3" y="-4" fill="' + se.color + '"/><text x="22">' + t(se.key) + "</text></g>";
    });
    chart.innerHTML = s;
  }
  renderChart();

  /* ---------- why cards glow ---------- */
  document.querySelectorAll(".why__card").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- language change re-render ---------- */
  if (I18N && I18N.onChange) {
    I18N.onChange(function () {
      renderChart();
      if (document.getElementById("bars").classList.contains("is-in") || reduced) renderBars(currentMod);
    });
  }
})();
