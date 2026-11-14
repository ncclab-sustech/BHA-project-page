/**
 * BHA project page — EN (default) / ZH optional.
 * Persist choice in localStorage key "bha-lang".
 */
(function (global) {
  var STORAGE_KEY = "bha-lang";
  var DEFAULT_LANG = "en";
  var listeners = [];

  var STRINGS = {
    en: {
      "nav.idea": "Idea",
      "nav.results": "Results",
      "nav.decoded": "Decoded",
      "nav.inside": "Inside",
      "nav.why": "Why",
      "nav.status": "Status",
      "lang.label": "Language",

      "hero.eyebrow": "Real EEG · participant 08 · THINGS-EEG2",
      "hero.sub": "Decoding what a person sees from non-invasive brain recordings — by teaching one brain model to think like four vision models at once.",
      "hero.cta1": "See decoded images",
      "hero.cta2": "How it works",
      "decode.seen": "Seen",
      "decode.out": "Decoded from EEG",
      "decode.cap": "single participant, held-out image",

      "num.eeg": "EEG · 200-way Top-1 retrieval",
      "num.eeg.n": "prior best 82.6%",
      "num.meg": "MEG · 200-way Top-1 retrieval",
      "num.meg.n": "prior best 48.0%",
      "num.rec": "Reconstruction fidelity",
      "num.rec.n": "PixCorr 0.277 vs. 0.195",
      "num.teach": "Vision teachers, one brain model",

      "idea.label": "01 — The idea",
      "idea.title": "A strong vision model is <em>not</em> automatically a good decoding target.",
      "idea.p1": "Modern brain decoders do not predict pixels. They predict the <strong>features</strong> a pretrained vision model would compute for the image a person is looking at, then search or generate from those features. Which model to imitate is the central design decision — and CLIP-style, self-supervised and masked-autoencoder models each see an image differently.",
      "idea.p2": "<strong>BHA stops choosing.</strong> One brain encoder learns a representation that four vision teachers supervise together. At decision time the teachers’ distinct notions of similarity are kept alive and composed, instead of collapsed into a single fused space. The same backbone then drives a <strong>frozen</strong> image generator — no generator fine-tuning.",
      "idea.t1": "Brain encoder and fused visual target learned jointly",
      "idea.t2": "Teacher-specific readouts, gated score composition",
      "idea.t3": "Semantic + spatial adapters into a frozen generator",
      "flow.in": "brain signal",
      "flow.enc": "shared encoder",
      "flow.teachers": "four frozen vision teachers",
      "flow.gate": "gated",
      "flow.ret": "retrieval",
      "flow.frozen": "frozen",
      "flow.gen": "generator",
      "flow.note": "Stage 1 trains the encoder with all four teachers. Stage 2 freezes it and learns how to weigh each teacher per query.",
      "idea.more": "Show the full architecture figure",
      "idea.figcap": "(a) BrainViT encoder. (b) Stage 1 jointly learns BrainViT and visual fusion; Stage 2 freezes both and trains shared and teacher-specific readouts. (c) Semantic and spatial predictors condition the frozen diffusion generator.",

      "res.label": "02 — Results",
      "res.title": "State of the art on <em>both</em> EEG and MEG.",
      "res.lede": "200-way brain-to-image retrieval, within-subject Top-1 accuracy. Averages over ten EEG and four MEG participants on the public THINGS benchmarks. Bars show raw scores; the hatched extension is BHA with CSLS-2 re-scoring.",
      "bars.raw": "raw",
      "res.rec.title": "Reconstruction from EEG",
      "res.rec.lede": "Ten-participant means on THINGS-EEG2 against the strongest published EEG method. Higher is better.",
      "res.more": "Show the full comparison tables",
      "res.t1cap": "<strong>200-way retrieval (Top-1 / Top-5, %).</strong> LOSO = leave-one-subject-out, tested on a person never seen in training.",
      "res.t2cap": "<strong>Image reconstruction from EEG (THINGS-EEG2, ten-participant mean).</strong> ↑ higher is better, ↓ lower is better.",
      "res.th.method": "Method",
      "res.th.within": "Within",
      "res.th.low": "Low-level",
      "res.th.high": "High-level",

      "dec.label": "03 — Decoded",
      "dec.title": "What the brain saw, <em>and what we decoded.</em>",
      "dec.lede": "Every image below was generated from one participant’s EEG response to a photograph they had never seen during training. Drag the slider, or hover a tile to flip between the seen image and three independent decodes.",
      "dec.decoded": "decoded",
      "dec.seen": "seen",
      "dec.foot": "Participant 08, THINGS-EEG2 test set. Decodes use the main-table configuration: semantic + spatial conditioning of a frozen SDXL-Turbo generator.",

      "eff.label": "04 — Data efficiency",
      "eff.title": "The gain survives with a <em>quarter</em> of the data.",
      "eff.p1": "Composing teacher-specific scores on top of the shared representation lifts within-subject EEG accuracy at every training-data scale. With 25% of a participant’s data the gated readout reaches 53.3% Top-1, against 42.7% for the pretrained backbone alone.",
      "eff.p2": "Recording sessions are short and expensive. Needing fewer of them is the difference between a lab demo and a product.",
      "chart.x": "training data",
      "chart.y": "Top-1 (%)",
      "chart.l1": "pretrained backbone",
      "chart.l2": "shared expert",
      "chart.l3": "BHA gated",

      "in.label": "05 — Inside the model",
      "in.title": "We can see what each expert is <em>matching on.</em>",
      "in.lede": "Because BHA keeps teacher-specific prediction spaces, its decisions can be attributed. Occlusion maps show which image regions each expert uses to match a brain response; concept analysis shows individual model neurons becoming selective for food, clothing or animals.",
      "in.cap1": "<strong>Shared geometry, distinct contributions.</strong> (e) Red regions raise an expert’s match score, blue regions lower it — experts can disagree on the same region, which is what score composition exploits.",
      "in.cap2": "<strong>Semantic selectivity.</strong> (d–e) Example neurons and the held-out images that activate them most strongly.",

      "why.label": "06 — Why it matters",
      "why.title": "Built for the constraints <em>outside</em> the lab.",
      "why.1t": "Data-efficient",
      "why.1b": "Gains hold with a quarter of a participant’s training data, shortening calibration sessions.",
      "why.2t": "Generator-agnostic",
      "why.2b": "The image generator stays frozen. Better generators drop in without retraining the brain model.",
      "why.3t": "Modality-general",
      "why.3b": "One recipe runs on 63-channel EEG and 271-channel MEG; only the input tokenizer changes.",
      "why.4t": "Interpretable",
      "why.4b": "Attribution maps and concept-selective neurons expose what the decoder relies on — essential for clinical and consumer use.",

      "st.label": "07 — Status",
      "st.title": "Where the project <em>stands.</em>",
      "st.1t": "Manuscript",
      "st.1b": "A full paper with theory, benchmarks and analyses is under peer review. This page is kept anonymous for that reason.",
      "st.2t": "Pipeline",
      "st.2b": "End to end: preprocessing, two-stage training, retrieval and reconstruction, an eight-metric evaluation suite, on EEG and MEG.",
      "st.3t": "Open problem",
      "st.3b": "Cross-subject transfer. A model trained on other people reaches 30.4% Top-1 on EEG (chance 0.5%) but far below within-subject accuracy; closing this gap is the focus of ongoing work.",
      "st.4t": "Release",
      "st.4b": "Code and pretrained weights will be released after review.",

      "footer": "Anonymous project page · built on THINGS-EEG2, THINGS-MEG, OpenCLIP, DFN, MAE, DINOv2, SDXL-Turbo, IP-Adapter and CLIP-Dissect."
    },
    zh: {
      "nav.idea": "思路",
      "nav.results": "结果",
      "nav.decoded": "解码",
      "nav.inside": "内部",
      "nav.why": "价值",
      "nav.status": "进展",
      "lang.label": "语言",

      "hero.eyebrow": "真实 EEG · 被试 08 · THINGS-EEG2",
      "hero.sub": "从非侵入式脑记录中解码一个人正在看什么——让一个脑模型同时学会四个视觉模型的「看法」。",
      "hero.cta1": "看解码结果",
      "hero.cta2": "它如何工作",
      "decode.seen": "所见",
      "decode.out": "由 EEG 解码",
      "decode.cap": "单名被试，未见过的图像",

      "num.eeg": "EEG · 200 类 Top-1 检索",
      "num.eeg.n": "此前最优 82.6%",
      "num.meg": "MEG · 200 类 Top-1 检索",
      "num.meg.n": "此前最优 48.0%",
      "num.rec": "重建保真度",
      "num.rec.n": "PixCorr 0.277 vs. 0.195",
      "num.teach": "视觉教师数，一个脑模型",

      "idea.label": "01 — 思路",
      "idea.title": "强的视觉模型<em>不一定</em>是好的解码目标。",
      "idea.p1": "现代脑解码器并不直接预测像素，而是预测预训练视觉模型对所见图像计算出的<strong>特征</strong>，再基于这些特征检索或生成。「模仿哪个模型」是核心设计决策——CLIP 类、自监督、掩码自编码器模型看同一张图的方式各不相同。",
      "idea.p2": "<strong>BHA 不再做单选题。</strong>一个脑编码器学习由四个视觉教师共同监督的表征。在决策时保留并组合各教师独立的相似性判断，而不是塌缩成单一融合空间。同一骨干再驱动一个<strong>冻结</strong>的图像生成器——无需微调生成器。",
      "idea.t1": "脑编码器与融合视觉目标联合学习",
      "idea.t2": "教师专属读出 + 门控分数组合",
      "idea.t3": "语义 + 空间适配器接入冻结生成器",
      "flow.in": "脑信号",
      "flow.enc": "共享编码器",
      "flow.teachers": "四个冻结的视觉教师",
      "flow.gate": "门控",
      "flow.ret": "检索",
      "flow.frozen": "冻结",
      "flow.gen": "生成器",
      "flow.note": "阶段 1 用四个教师共同训练编码器；阶段 2 冻结编码器，学习对每个查询如何加权各教师。",
      "idea.more": "展开完整架构图",
      "idea.figcap": "(a) BrainViT 编码器。(b) 阶段 1 联合学习 BrainViT 与视觉融合；阶段 2 冻结两者，训练共享与教师专属读出。(c) 语义与空间预测器为冻结的扩散生成器提供条件。",

      "res.label": "02 — 结果",
      "res.title": "EEG 与 MEG <em>双双</em>达到最先进水平。",
      "res.lede": "200 类脑到图像检索，被试内 Top-1 准确率。公开 THINGS 基准上 10 名 EEG 与 4 名 MEG 被试的平均值。柱状为 Raw 分数；斜纹延伸为 BHA 经 CSLS-2 重打分。",
      "bars.raw": "Raw",
      "res.rec.title": "来自 EEG 的重建",
      "res.rec.lede": "THINGS-EEG2 上 10 名被试平均，对比已发表最强的 EEG 方法。越高越好。",
      "res.more": "展开完整对比表",
      "res.t1cap": "<strong>200 类检索（Top-1 / Top-5，%）。</strong> LOSO = 留一被试，在训练中从未见过的人上测试。",
      "res.t2cap": "<strong>EEG 图像重建（THINGS-EEG2，10 名被试平均）。</strong> ↑ 越高越好，↓ 越低越好。",
      "res.th.method": "方法",
      "res.th.within": "被试内",
      "res.th.low": "低级指标",
      "res.th.high": "高级指标",

      "dec.label": "03 — 解码",
      "dec.title": "大脑看到的，<em>以及我们解码出的。</em>",
      "dec.lede": "下面每张图都由一名被试对一张训练中从未见过的照片的 EEG 响应生成。拖动滑块，或悬停方块在所见图与三次独立解码之间切换。",
      "dec.decoded": "解码",
      "dec.seen": "所见",
      "dec.foot": "被试 08，THINGS-EEG2 测试集。解码使用主表配置：语义 + 空间条件驱动冻结的 SDXL-Turbo 生成器。",

      "eff.label": "04 — 数据效率",
      "eff.title": "只用<em>四分之一</em>的数据，优势依然在。",
      "eff.p1": "在共享表征之上组合教师专属分数，在每个训练数据规模下都提升了被试内 EEG 准确率。仅用一名被试 25% 的数据，门控读出达到 53.3% Top-1，而预训练骨干单独仅 42.7%。",
      "eff.p2": "采集时间短、成本高。少采几次，就是实验室演示与产品之间的差别。",
      "chart.x": "训练数据",
      "chart.y": "Top-1 (%)",
      "chart.l1": "预训练骨干",
      "chart.l2": "共享专家",
      "chart.l3": "BHA 门控",

      "in.label": "05 — 模型内部",
      "in.title": "可以看到每个专家在<em>匹配什么。</em>",
      "in.lede": "由于 BHA 保留了教师专属预测空间，其决策可被归因。遮挡图显示每个专家用图像的哪些区域匹配脑响应；概念分析显示单个模型神经元对食物、服饰或动物产生选择性。",
      "in.cap1": "<strong>共享几何，不同贡献。</strong> (e) 红色区域提高该专家的匹配分数，蓝色降低——不同专家可对同一区域给出相反判断，这正是分数组合所利用的。",
      "in.cap2": "<strong>语义选择性。</strong> (d–e) 示例神经元及其最强激活的未见图像。",

      "why.label": "06 — 价值",
      "why.title": "为实验室<em>之外</em>的约束而设计。",
      "why.1t": "数据高效",
      "why.1b": "仅用被试四分之一的训练数据优势依然保持，可缩短校准采集。",
      "why.2t": "生成器无关",
      "why.2b": "图像生成器保持冻结，更强的生成器可直接替换而无需重训脑模型。",
      "why.3t": "跨模态通用",
      "why.3b": "同一方案运行于 63 通道 EEG 与 271 通道 MEG，仅需更换输入分词器。",
      "why.4t": "可解释",
      "why.4b": "归因图与概念选择性神经元揭示解码器依赖的信息——对临床与消费级应用至关重要。",

      "st.label": "07 — 进展",
      "st.title": "项目<em>现状。</em>",
      "st.1t": "论文",
      "st.1b": "包含理论、基准与分析的完整论文正在同行评审中；本页面因此保持匿名。",
      "st.2t": "流程",
      "st.2b": "端到端：预处理、两阶段训练、检索与重建、八指标评估套件，覆盖 EEG 与 MEG。",
      "st.3t": "待解问题",
      "st.3b": "跨被试迁移。在他人数据上训练的模型在 EEG 上可达 30.4% Top-1（随机水平 0.5%），但远低于被试内准确率；缩小这一差距是当前工作的重点。",
      "st.4t": "发布",
      "st.4b": "代码与预训练权重将在评审结束后发布。",

      "footer": "匿名项目主页 · 基于 THINGS-EEG2、THINGS-MEG、OpenCLIP、DFN、MAE、DINOv2、SDXL-Turbo、IP-Adapter 与 CLIP-Dissect 构建。"
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
      var key = el.getAttribute("data-i18n");
      var varsRaw = el.getAttribute("data-i18n-vars");
      var vars = varsRaw ? JSON.parse(varsRaw) : null;
      el.textContent = t(lang, key, vars);
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(lang, el.getAttribute("data-i18n-html"));
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr")
        .split(";")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean)
        .forEach(function (pair) {
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
