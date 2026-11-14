/**
 * BHA project page — EN (default) / ZH optional.
 */
(function (global) {
  var STORAGE_KEY = "bha-lang";
  var DEFAULT_LANG = "en";
  var listeners = [];

  var STRINGS = {
    en: {
      "nav.film": "Film",
      "nav.decoder": "Decoder",
      "nav.how": "How it works",
      "nav.results": "Results",
      "nav.vision": "Vision",
      "nav.cta": "Watch the film",
      "lang.label": "Language",

      "hero.kicker": "Non-invasive brain decoding · EEG & MEG",
      "hero.t1": "See what",
      "hero.t2": "the brain",
      "hero.t3": "sees.",
      "hero.sub": "BHA turns a few hundred milliseconds of brain activity into the picture a person is looking at. No surgery, no implants — a cap of electrodes and one model that learns from four vision models at once.",
      "hero.cta1": "Watch the film",
      "hero.cta2": "Try the decoder",
      "chip.eeg": "EEG retrieval, 200 images",
      "chip.meg": "MEG retrieval, 200 images",
      "chip.rec": "sharper reconstructions",

      "film.kicker": "The film",
      "film.title": "Three minutes. <span class=\"grad\">One idea.</span>",
      "film.lede": "A short explainer, narrated in English: what we record, what the model learns, and what comes out the other end.",

      "dec.kicker": "Live decoder",
      "dec.title": "From brainwaves <span class=\"grad\">to pictures.</span>",
      "dec.lede": "Real data, no cherry-picked pixels. One participant looks at a photo they have never seen; their EEG goes into BHA; a picture comes out. Pick any image to run it.",
      "dec.seen": "What they saw",
      "dec.eeg": "Their brain, 63 channels",
      "dec.out": "What BHA decoded",
      "dec.part": "participant",
      "dec.foot": "THINGS-EEG2 held-out image · three independent decodes · best of ten participants shown",
      "wall.seen": "seen",
      "wall.dec": "decoded",

      "how.kicker": "How it works",
      "how.title": "One brain model, <span class=\"grad\">four teachers.</span>",
      "how.lede": "Every vision model sees an image differently. Instead of picking one — or averaging them into a single target — BHA lets four of them teach a single brain model and keeps their opinions separate when it matters.",
      "how.s1t": "Listen",
      "how.s1b": "A 63-electrode cap records the brain’s response to a picture: a few hundred milliseconds of electrical activity, noisy and faint.",
      "how.s2t": "Learn from four teachers",
      "how.s2b": "The brain model is trained to predict what four different vision models would say about the picture. Each teacher keeps its own read-out, and learned weights decide how much each opinion counts.",
      "how.s3t": "Generate",
      "how.s3b": "The prediction steers a frozen image generator. Nothing about the generator is retrained, so a better one can be swapped in tomorrow.",
      "how.more": "For researchers: the architecture figure",

      "res.kicker": "Results",
      "res.title": "A new state of the art, <span class=\"grad\">on both EEG and MEG.</span>",
      "res.lede": "Shown 200 candidate pictures, how often does the model pick the exact one the person is looking at? Averages over ten EEG and four MEG participants on the public THINGS benchmarks.",
      "big.eeg": "EEG · Top-1 of 200",
      "big.eeg.n": "previous best 82.6%",
      "big.meg": "MEG · Top-1 of 200",
      "big.meg.n": "previous best 48.0%",
      "big.data": "with only 25% of the data",
      "big.data.n": "backbone alone 42.7%",
      "bars.prior": "prior methods",
      "bars.raw": "raw",
      "rec.title": "Sharper pictures, same generator.",
      "rec.body": "On image reconstruction from EEG, BHA beats the strongest published method on every pixel-level and semantic metric — while leaving the image generator completely untouched.",
      "res.more": "Full comparison tables",
      "res.t1cap": "<strong>200-way retrieval (Top-1 / Top-5, %).</strong> LOSO = tested on a person never seen in training.",
      "res.t2cap": "<strong>Image reconstruction from EEG (THINGS-EEG2, ten-participant mean).</strong> ↑ higher is better, ↓ lower is better.",
      "res.th.method": "Method",
      "res.th.within": "Within",
      "res.th.low": "Low-level",
      "res.th.high": "High-level",

      "vis.kicker": "Why it matters",
      "vis.title": "A new interface between <span class=\"grad\">mind and machine.</span>",
      "vis.lede": "Non-invasive, wearable-ready, data-efficient. BHA is built for the constraints of the real world, not just the lab.",
      "vis.p1t": "Data-efficient",
      "vis.p1b": "Gains hold with a quarter of a participant’s data. Shorter calibration means products, not demos.",
      "vis.p2t": "Generator-agnostic",
      "vis.p2b": "The image generator stays frozen. Every advance in generative AI upgrades BHA for free.",
      "vis.p3t": "Transparent",
      "vis.p3b": "We can show which image regions and which concepts the decoder relies on — the groundwork for clinical and consumer trust.",
      "road.1t": "Now",
      "road.1b": "State of the art on EEG and MEG, within-subject. Full pipeline, manuscript under review.",
      "road.2t": "Next",
      "road.2b": "Cross-subject generalization: a model that works on a person it has never seen (today 30.4% Top-1 on EEG, chance 0.5%).",
      "road.3t": "Ambition",
      "road.3b": "Real-time decoding on consumer-grade wearables, and the same recipe on new signals and new tasks.",

      "footer": "Anonymous project page · manuscript under peer review · built on THINGS-EEG2, THINGS-MEG, OpenCLIP, DFN, MAE, DINOv2, SDXL-Turbo and IP-Adapter."
    },
    zh: {
      "nav.film": "短片",
      "nav.decoder": "解码器",
      "nav.how": "原理",
      "nav.results": "结果",
      "nav.vision": "愿景",
      "nav.cta": "观看短片",
      "lang.label": "语言",

      "hero.kicker": "非侵入式脑解码 · EEG 与 MEG",
      "hero.t1": "看见",
      "hero.t2": "大脑",
      "hero.t3": "所见。",
      "hero.sub": "BHA 把几百毫秒的脑活动，还原成一个人正在看的画面。无需手术、无需植入——一顶电极帽，加一个同时向四个视觉模型学习的脑模型。",
      "hero.cta1": "观看短片",
      "hero.cta2": "试试解码器",
      "chip.eeg": "EEG 检索，200 张候选",
      "chip.meg": "MEG 检索，200 张候选",
      "chip.rec": "更清晰的重建",

      "film.kicker": "短片",
      "film.title": "三分钟，<span class=\"grad\">一个想法。</span>",
      "film.lede": "一段英文讲解短片：我们记录什么、模型学到什么、另一端输出什么。",

      "dec.kicker": "实时解码",
      "dec.title": "从脑电波<span class=\"grad\">到图像。</span>",
      "dec.lede": "真实数据，没有挑选像素。一名被试看一张从未见过的照片；EEG 送入 BHA；一张图像生成出来。点选任意图片即可运行。",
      "dec.seen": "被试所见",
      "dec.eeg": "大脑信号，63 通道",
      "dec.out": "BHA 解码结果",
      "dec.part": "被试",
      "dec.foot": "THINGS-EEG2 未见图像 · 三次独立解码 · 展示十名被试中最接近的结果",
      "wall.seen": "所见",
      "wall.dec": "解码",

      "how.kicker": "原理",
      "how.title": "一个脑模型，<span class=\"grad\">四位教师。</span>",
      "how.lede": "每个视觉模型看图的方式都不同。BHA 既不做单选、也不把它们平均成一个目标，而是让四个模型共同教一个脑模型，并在关键时刻保留各自的判断。",
      "how.s1t": "倾听",
      "how.s1b": "63 导电极帽记录大脑对一张图片的响应：几百毫秒的电活动，嘈杂而微弱。",
      "how.s2t": "向四位教师学习",
      "how.s2b": "脑模型学习预测四个不同视觉模型对这张图的「看法」。每位教师保留自己的读出头，由可学习的权重决定各自意见的分量。",
      "how.s3t": "生成",
      "how.s3b": "预测结果驱动一个冻结的图像生成器。生成器不做任何重训，明天就能换上更强的。",
      "how.more": "给研究者：架构图",

      "res.kicker": "结果",
      "res.title": "EEG 与 MEG <span class=\"grad\">双双刷新最先进水平。</span>",
      "res.lede": "给出 200 张候选图片，模型多久能选中被试正在看的那一张？公开 THINGS 基准上 10 名 EEG 与 4 名 MEG 被试的平均值。",
      "big.eeg": "EEG · 200 选 1 Top-1",
      "big.eeg.n": "此前最优 82.6%",
      "big.meg": "MEG · 200 选 1 Top-1",
      "big.meg.n": "此前最优 48.0%",
      "big.data": "仅用 25% 的数据",
      "big.data.n": "仅骨干网络 42.7%",
      "bars.prior": "已有方法",
      "bars.raw": "Raw",
      "rec.title": "更清晰的图像，同一个生成器。",
      "rec.body": "在 EEG 图像重建上，BHA 在每一项像素级与语义指标上都超过已发表最强方法——而图像生成器完全不动。",
      "res.more": "完整对比表",
      "res.t1cap": "<strong>200 类检索（Top-1 / Top-5，%）。</strong> LOSO = 在训练中从未见过的人上测试。",
      "res.t2cap": "<strong>EEG 图像重建（THINGS-EEG2，10 名被试平均）。</strong> ↑ 越高越好，↓ 越低越好。",
      "res.th.method": "方法",
      "res.th.within": "被试内",
      "res.th.low": "低级指标",
      "res.th.high": "高级指标",

      "vis.kicker": "为什么重要",
      "vis.title": "大脑与机器之间的<span class=\"grad\">新接口。</span>",
      "vis.lede": "非侵入、可穿戴、数据高效。BHA 为真实世界的约束而设计，而不只是实验室。",
      "vis.p1t": "数据高效",
      "vis.p1b": "仅用被试四分之一的数据优势依然保持。更短的校准，意味着产品而非演示。",
      "vis.p2t": "生成器无关",
      "vis.p2b": "图像生成器保持冻结。生成式 AI 的每一次进步都会免费升级 BHA。",
      "vis.p3t": "透明可解释",
      "vis.p3b": "我们能展示解码器依赖图像的哪些区域、哪些概念——这是临床与消费级信任的基础。",
      "road.1t": "现在",
      "road.1b": "EEG 与 MEG 被试内最先进水平。完整流程，论文评审中。",
      "road.2t": "下一步",
      "road.2b": "跨被试泛化：让模型在从未见过的人身上工作（目前 EEG 上 30.4% Top-1，随机水平 0.5%）。",
      "road.3t": "愿景",
      "road.3b": "消费级可穿戴设备上的实时解码，以及同一方案在新信号、新任务上的复用。",

      "footer": "匿名项目主页 · 论文同行评审中 · 基于 THINGS-EEG2、THINGS-MEG、OpenCLIP、DFN、MAE、DINOv2、SDXL-Turbo 与 IP-Adapter 构建。"
    }
  };

  function getLang() {
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    return stored === "zh" ? "zh" : DEFAULT_LANG;
  }

  function setLang(lang) {
    var next = lang === "zh" ? "zh" : DEFAULT_LANG;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* ignore */
    }
    applyLang(next);
    updateLangButtons(next);
    document.documentElement.lang = next === "zh" ? "zh-Hans" : "en";
    listeners.forEach(function (cb) {
      cb(next);
    });
  }

  function t(lang, key, vars) {
    var table = STRINGS[lang] || STRINGS.en;
    var text = table[key] != null ? table[key] : STRINGS.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        text = text.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
      });
    }
    return text;
  }

  function applyLang(lang) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(lang, el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(lang, el.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").map(function (s) {
        return s.trim();
      }).filter(Boolean).forEach(function (pair) {
        var parts = pair.split(":");
        el.setAttribute(parts[0].trim(), t(lang, parts.slice(1).join(":").trim()));
      });
    });
  }

  function updateLangButtons(lang) {
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var active = btn.getAttribute("data-set-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function initI18n() {
    var lang = getLang();
    applyLang(lang);
    updateLangButtons(lang);
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-set-lang"));
      });
    });
  }

  global.BHA_I18N = {
    init: initI18n,
    setLang: setLang,
    getLang: getLang,
    t: t,
    onChange: function (cb) {
      listeners.push(cb);
    }
  };
})(typeof window !== "undefined" ? window : this);
