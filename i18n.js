/**
 * BHA project page — EN (default) / ZH optional.
 * Persist choice in localStorage key "bha-lang".
 */
(function (global) {
  var STORAGE_KEY = "bha-lang";
  var DEFAULT_LANG = "en";

  var STRINGS = {
    en: {
      "nav.overview": "Overview",
      "nav.method": "Method",
      "nav.results": "Results",
      "nav.analysis": "Interpretability",
      "nav.examples": "Examples",
      "nav.why": "Why it matters",
      "nav.status": "Status",
      "lang.label": "Language",
      "lang.en": "EN",
      "lang.zh": "中文",

      "hero.badge": "Non-invasive brain-to-image decoding",
      "hero.tagline": "Distilling teacher diversity for brain visual decoding",
      "hero.subtitle":
        "BHA turns non-invasive brain recordings into image retrieval and image reconstruction. One brain model learns from several vision foundation models at once, composes their complementary notions of visual similarity, and drives a frozen image generator — no generator fine-tuning required.",
      "hero.cta.read": "Read overview",
      "hero.cta.results": "See results",
      "hero.meta.modalities": "Modalities",
      "hero.meta.tasks": "Tasks",
      "hero.meta.tasks.val": "Retrieval · Reconstruction",
      "hero.meta.datasets": "Datasets",

      "stat.eeg.label": "EEG · 200-way Top-1 retrieval",
      "stat.eeg.note": "Within-subject, CSLS-2 · prior best 82.6%",
      "stat.meg.label": "MEG · 200-way Top-1 retrieval",
      "stat.meg.note": "Within-subject, CSLS-2 · prior best 48.0%",
      "stat.rec.label": "Reconstruction fidelity (PixCorr)",
      "stat.rec.note": "0.277 vs. 0.195 for the strongest prior EEG method",
      "stat.teachers.label": "Vision teachers in one brain model",

      "overview.label": "Overview",
      "overview.title": "A strong vision model is not automatically a good decoding target",
      "overview.lead1":
        "Modern brain decoders do not predict pixels. They predict the <em>features</em> a pretrained vision model would compute for the image a person is looking at, then search or generate from those features. Which vision model to imitate is therefore a central design decision — and different models (CLIP-style, self-supervised, masked autoencoders) capture different, complementary aspects of an image.",
      "overview.lead2":
        "<strong>BHA (Beyond Hierarchical Alignment)</strong> stops choosing. It learns one shared brain representation while letting several vision “teachers” supervise it, and it keeps the teachers’ distinct notions of similarity alive at decision time instead of collapsing them into a single fused space. The same backbone then feeds a frozen image generator for reconstruction, with no generator fine-tuning.",
      "overview.item1":
        "Joint brain–visual adaptation: the brain encoder and the fused visual target are learned together, so supervision adapts to what is actually predictable from noisy recordings.",
      "overview.item2":
        "Teacher-specific readouts with learned, query-dependent score composition: complementary notions of visual similarity all contribute to retrieval.",
      "overview.item3":
        "Semantic and spatial adapters condition a frozen latent-diffusion generator, so the generator can be upgraded without retraining the brain model.",
      "overview.figcap1":
        "<strong>Visual representations shape brain–image alignment.</strong> Left: where the brain prediction matches image patches (BHA column) versus a random query. Right: retrieval accuracy of single vision-model layers against BHA on THINGS-EEG2 — BHA (star) moves both within-subject and cross-subject accuracy to a new regime.",
      "overview.figcap2":
        "<strong>Shared alignment need not erase teacher-specific structure.</strong> (a) Each vision model defines its own geometry; fusion merges them into one target. (b) Multi-teacher supervision lets one brain representation predict several visual spaces. (c) Teacher-specific readouts keep distinct brain–image correspondences, which BHA composes at retrieval time.",

      "method.label": "Method",
      "method.title": "One backbone, task-specific prediction spaces",
      "method.lead":
        "Retrieval and reconstruction ask different things of a brain representation: features that discriminate images need not preserve the structure a pretrained generator expects. BHA keeps a single shared backbone and attaches purpose-built prediction heads for each task.",
      "method.card1.title": "Stage 1 · Shared representation",
      "method.card1.body":
        "A geometry-aware BrainViT encoder (channel attention plus feature–sensor convolution) is trained jointly with a learnable fusion of four vision foundation models. The visual target adapts to the brain signal rather than being fixed in advance.",
      "method.card2.title": "Stage 2 · Composed retrieval",
      "method.card2.body":
        "With the backbone frozen, teacher-specific Group Mixture-of-Experts readouts map the brain representation into each teacher’s native space. A learned gate and query-dependent weights combine their matching scores with the shared score.",
      "method.card3.title": "Reconstruction · Frozen generator",
      "method.card3.body":
        "Separate semantic and spatial adapters predict the generator’s own conditioning features and VAE latents. A single mixing parameter trades predicted layout against semantic generation, and an optional training-free guidance step keeps the output close to the predicted structure.",
      "method.figcap":
        "<strong>BHA learns shared representations and task-specific predictions.</strong> (a) BrainViT encoder. (b) Stage 1 jointly learns BrainViT and visual fusion; Stage 2 freezes both and trains shared and teacher-specific readouts, visual adapters, and routing. (c) Semantic and spatial predictors condition the frozen diffusion generator, VAE, and IP-Adapter.",

      "results.label": "Results",
      "results.title": "State of the art on EEG and MEG benchmarks",
      "results.lead":
        "All numbers are averages over ten EEG and four MEG participants on the public THINGS benchmarks. “Within-subject” trains and tests on the same person; “LOSO” (leave-one-subject-out) tests on a person never seen during training. Raw scores rank each query independently; CSLS-2 re-scores against the unlabeled query set.",
      "results.t1cap":
        "<strong>200-way brain-to-image retrieval (Top-1 / Top-5, %).</strong> Higher is better. Best in bold.",
      "results.t2cap":
        "<strong>Image reconstruction from EEG (THINGS-EEG2, ten-participant mean).</strong> Low-level metrics measure pixel and structural fidelity; high-level metrics measure semantic identification. ↑ higher is better, ↓ lower is better.",
      "results.th.method": "Method",
      "results.th.within": "Within-subject",
      "results.th.low": "Low-level",
      "results.th.high": "High-level",
      "results.data.title": "Gains persist with a quarter of the training data",
      "results.data.body":
        "Composing teacher-specific scores on top of the shared representation lifts within-subject EEG accuracy at every training-data scale. With only 25% of a participant’s data, the gated readout reaches 53.3% Top-1 against 42.7% for the pretrained backbone alone — a practical advantage when recording sessions are short and expensive.",
      "results.data.body2":
        "Permuting the predicted conditions drives reconstruction identification to chance, confirming that the generated images carry stimulus-specific information rather than generator priors.",
      "results.data.figcap":
        "THINGS-EEG2 within-subject Raw Top-1 (%) as a function of training-data fraction; ten-participant means.",


      "analysis.label": "Interpretability",
      "analysis.title": "We can see what each expert is matching on",
      "analysis.lead":
        "Because BHA keeps teacher-specific prediction spaces, its decisions can be attributed. Occlusion analysis shows which image regions each expert uses to match a brain response, and concept analysis shows that individual model neurons become selective for semantic categories such as food, clothing and animals.",
      "analysis.figcap1":
        "<strong>Shared geometry with distinct matching contributions.</strong> (a–c) Student outputs share a common geometry across teachers. (d) Visual sensitivity maps. (e) Occlusion attributions per expert: red regions raise the match score, blue regions lower it — experts can disagree on the same image region, which is exactly what score composition exploits.",
      "analysis.figcap2":
        "<strong>Feature alignment and semantic selectivity capture different structure.</strong> (a) Trainable visual adapters raise brain–image alignment for every teacher. (b–c) Concept profiles of brain predictions track those of the visual models far above a shuffled baseline. (d–e) Example neurons and the test images that activate them most strongly.",

      "examples.label": "Qualitative",
      "examples.title": "Reconstructions from EEG",
      "examples.lead":
        "Images generated from a single participant’s EEG responses to held-out stimuli. Each panel below sweeps the mixing parameter from pure predicted layout to pure semantic generation; click any panel for the full-resolution version.",
      "examples.figcap": "Seen images (top of each pair) and EEG-driven reconstructions.",
      "subjects.name": "Participant {n}",
      "subjects.hint": "Preview · click for full PNG",
      "subjects.open": "Open full size",
      "subjects.aria": "Open participant {n} reconstruction panel at full resolution",

      "why.label": "Why it matters",
      "why.title": "Built to scale beyond the lab",
      "why.lead":
        "EEG and MEG are non-invasive, wearable-compatible and inexpensive to record, but their signals are noisy and small in volume. BHA is designed around exactly those constraints.",
      "why.card1.title": "Data-efficient",
      "why.card1.body": "Gains hold with a quarter of a participant’s training data, shortening calibration sessions.",
      "why.card2.title": "Generator-agnostic",
      "why.card2.body": "The image generator stays frozen. Better generators can be dropped in without retraining the brain model.",
      "why.card3.title": "Modality-general",
      "why.card3.body": "One recipe runs on 63-channel EEG and 271-channel MEG; only the input tokenizer changes between modalities.",
      "why.card4.title": "Interpretable",
      "why.card4.body": "Attribution maps and concept-selective neurons expose what the decoder is relying on, which matters for clinical and consumer use.",

      "status.label": "Status",
      "status.title": "Where the project stands",
      "status.item1": "A full manuscript with theory, benchmarks and analyses is under peer review. This page is kept anonymous for that reason.",
      "status.item2": "A complete pipeline exists end to end: data preprocessing, two-stage training, retrieval and reconstruction, an eight-metric evaluation suite, on both EEG and MEG.",
      "status.item3": "Open problem: cross-subject transfer. A model trained on other people reaches 30.4% Top-1 on EEG (chance 0.5%) but far below within-subject accuracy; closing this gap is the focus of ongoing work.",
      "status.item4": "Code and pretrained weights will be released after review.",

      "footer.body":
        "Anonymous project page · Built on public datasets (THINGS-EEG2, THINGS-MEG) and open models (OpenCLIP, DFN, MAE, DINOv2, SDXL-Turbo, IP-Adapter, CLIP-Dissect).",
    },
    zh: {
      "nav.overview": "概览",
      "nav.method": "方法",
      "nav.results": "结果",
      "nav.analysis": "可解释性",
      "nav.examples": "示例",
      "nav.why": "价值",
      "nav.status": "进展",
      "lang.label": "语言",
      "lang.en": "EN",
      "lang.zh": "中文",

      "hero.badge": "非侵入式脑信号到图像解码",
      "hero.tagline": "蒸馏多教师视觉多样性，实现脑视觉解码",
      "hero.subtitle":
        "BHA 将非侵入式脑记录转化为图像检索与图像重建。一个脑模型同时向多个视觉基础模型学习，组合它们互补的视觉相似性判断，并驱动一个冻结的图像生成器——无需微调生成器。",
      "hero.cta.read": "阅读概览",
      "hero.cta.results": "查看结果",
      "hero.meta.modalities": "模态",
      "hero.meta.tasks": "任务",
      "hero.meta.tasks.val": "检索 · 重建",
      "hero.meta.datasets": "数据集",

      "stat.eeg.label": "EEG · 200 类 Top-1 检索",
      "stat.eeg.note": "被试内，CSLS-2 · 此前最优 82.6%",
      "stat.meg.label": "MEG · 200 类 Top-1 检索",
      "stat.meg.note": "被试内，CSLS-2 · 此前最优 48.0%",
      "stat.rec.label": "重建保真度（PixCorr）",
      "stat.rec.note": "0.277 vs. 此前最强 EEG 方法 0.195",
      "stat.teachers.label": "一个脑模型中的视觉教师数",

      "overview.label": "概览",
      "overview.title": "强的视觉模型不一定是好的解码目标",
      "overview.lead1":
        "现代脑解码器并不直接预测像素，而是预测预训练视觉模型对所见图像计算出的<em>特征</em>，再基于这些特征进行检索或生成。因此「模仿哪个视觉模型」是核心设计决策——不同模型（CLIP 类、自监督、掩码自编码器）捕捉的是图像中不同且互补的属性。",
      "overview.lead2":
        "<strong>BHA（Beyond Hierarchical Alignment）</strong> 不再做单选题。它学习一个共享的脑表征，同时让多个视觉「教师」共同监督；在决策阶段保留各教师独立的相似性判断，而不是将它们塌缩成单一融合空间。同一个骨干网络再驱动一个冻结的图像生成器完成重建，无需微调生成器。",
      "overview.item1":
        "脑–视觉联合适配：脑编码器与融合视觉目标一起学习，使监督信号适应嘈杂脑记录中真正可预测的内容。",
      "overview.item2":
        "教师专属读出 + 可学习的、随查询变化的分数组合：互补的视觉相似性判断共同参与检索。",
      "overview.item3":
        "语义与空间适配器为冻结的潜扩散生成器提供条件，生成器可随时升级而无需重训脑模型。",
      "overview.figcap1":
        "<strong>视觉表征决定脑–图像对齐。</strong> 左：脑预测与图像块的匹配位置（BHA 列）对比随机查询。右：THINGS-EEG2 上单一视觉模型各层与 BHA 的检索准确率——BHA（星号）同时将被试内与跨被试准确率推向新区间。",
      "overview.figcap2":
        "<strong>共享对齐不必抹去教师特有结构。</strong> (a) 每个视觉模型定义自己的几何；融合将它们合并为单一目标。(b) 多教师监督让一个脑表征能预测多个视觉空间。(c) 教师专属读出保留各自的脑–图像对应关系，BHA 在检索时将其组合。",

      "method.label": "方法",
      "method.title": "一个骨干网络，多个任务专属预测空间",
      "method.lead":
        "检索与重建对脑表征的要求不同：能区分图像的特征未必保留预训练生成器所需的结构。BHA 保留单一共享骨干，并为每个任务挂载专门的预测头。",
      "method.card1.title": "阶段 1 · 共享表征",
      "method.card1.body":
        "几何感知的 BrainViT 编码器（通道注意力 + 特征–传感器卷积）与四个视觉基础模型的可学习融合联合训练。视觉目标随脑信号自适应，而非事先固定。",
      "method.card2.title": "阶段 2 · 组合式检索",
      "method.card2.body":
        "冻结骨干后，教师专属的分组混合专家（Group MoE）读出将脑表征映射到各教师的原生空间。可学习门控与随查询变化的权重将各匹配分数与共享分数组合。",
      "method.card3.title": "重建 · 冻结生成器",
      "method.card3.body":
        "独立的语义与空间适配器预测生成器自身的条件特征与 VAE 潜变量。单一混合参数在「预测布局」与「语义生成」之间权衡，可选的免训练引导使输出贴近预测结构。",
      "method.figcap":
        "<strong>BHA 学习共享表征与任务专属预测。</strong> (a) BrainViT 编码器。(b) 阶段 1 联合学习 BrainViT 与视觉融合；阶段 2 冻结两者，训练共享与教师专属读出、视觉适配器及路由。(c) 语义与空间预测器为冻结的扩散生成器、VAE 与 IP-Adapter 提供条件。",

      "results.label": "结果",
      "results.title": "EEG 与 MEG 基准上的最先进水平",
      "results.lead":
        "所有数字为公开 THINGS 基准上 10 名 EEG 与 4 名 MEG 被试的平均值。「被试内」在同一人上训练与测试；「LOSO」（留一被试）在训练中从未见过的人上测试。Raw 对每个查询独立排序；CSLS-2 利用无标签查询集重新打分。",
      "results.t1cap":
        "<strong>200 类脑到图像检索（Top-1 / Top-5，%）。</strong> 越高越好，最优加粗。",
      "results.t2cap":
        "<strong>EEG 图像重建（THINGS-EEG2，10 名被试平均）。</strong> 低级指标衡量像素与结构保真度；高级指标衡量语义辨识。↑ 越高越好，↓ 越低越好。",
      "results.th.method": "方法",
      "results.th.within": "被试内",
      "results.th.low": "低级指标",
      "results.th.high": "高级指标",
      "results.data.title": "仅用四分之一训练数据，优势依然保持",
      "results.data.body":
        "在共享表征之上组合教师专属分数，在每个训练数据规模下都提升了被试内 EEG 准确率。仅用一名被试 25% 的数据，门控读出达到 53.3% Top-1，而预训练骨干单独仅 42.7%——在采集时间短、成本高的场景中这是实际优势。",
      "results.data.body2":
        "打乱预测条件后，重建辨识率降至随机水平，证明生成图像承载的是刺激特异信息，而非生成器先验。",
      "results.data.figcap":
        "THINGS-EEG2 被试内 Raw Top-1（%）随训练数据比例的变化；10 名被试平均。",


      "analysis.label": "可解释性",
      "analysis.title": "可以看到每个专家在匹配什么",
      "analysis.lead":
        "由于 BHA 保留了教师专属预测空间，其决策可被归因。遮挡分析显示每个专家用图像的哪些区域匹配脑响应；概念分析显示模型中的单个神经元对食物、服饰、动物等语义类别产生选择性。",
      "analysis.figcap1":
        "<strong>共享几何，不同的匹配贡献。</strong> (a–c) 各教师的学生输出共享相近几何。(d) 视觉敏感度图。(e) 各专家的遮挡归因：红色区域提高匹配分数，蓝色降低——不同专家可对同一图像区域给出相反判断，这正是分数组合所利用的。",
      "analysis.figcap2":
        "<strong>特征对齐与语义选择性刻画的是不同结构。</strong> (a) 可训练视觉适配器提高了每个教师的脑–图像对齐。(b–c) 脑预测的概念画像与视觉模型高度一致，远高于打乱基线。(d–e) 示例神经元及其最强激活的测试图像。",

      "examples.label": "定性结果",
      "examples.title": "来自 EEG 的重建",
      "examples.lead":
        "由单名被试对未见刺激的 EEG 响应生成的图像。下方每个面板扫描混合参数，从纯预测布局到纯语义生成；点击可查看全分辨率版本。",
      "examples.figcap": "所见图像（每组上方）与 EEG 驱动的重建。",
      "subjects.name": "被试 {n}",
      "subjects.hint": "预览 · 点击查看原图",
      "subjects.open": "查看原图",
      "subjects.aria": "在新标签页打开被试 {n} 的重建全图",

      "why.label": "价值",
      "why.title": "面向实验室之外的规模化",
      "why.lead":
        "EEG 与 MEG 非侵入、可穿戴、采集成本低，但信号嘈杂且数据量小。BHA 正是围绕这些约束设计的。",
      "why.card1.title": "数据高效",
      "why.card1.body": "仅用被试四分之一的训练数据优势依然保持，可缩短校准采集时间。",
      "why.card2.title": "生成器无关",
      "why.card2.body": "图像生成器保持冻结，更强的生成器可直接替换而无需重训脑模型。",
      "why.card3.title": "跨模态通用",
      "why.card3.body": "同一方案运行于 63 通道 EEG 与 271 通道 MEG，不同模态间仅需更换输入分词器。",
      "why.card4.title": "可解释",
      "why.card4.body": "归因图与概念选择性神经元揭示解码器依赖的信息，这对临床与消费级应用至关重要。",

      "status.label": "进展",
      "status.title": "项目现状",
      "status.item1": "包含理论、基准与分析的完整论文正在同行评审中；本页面因此保持匿名。",
      "status.item2": "端到端流程已完整：数据预处理、两阶段训练、检索与重建、八指标评估套件，覆盖 EEG 与 MEG 两种模态。",
      "status.item3": "待解决问题：跨被试迁移。在他人数据上训练的模型在 EEG 上可达 30.4% Top-1（随机水平 0.5%），但远低于被试内准确率；缩小这一差距是当前工作的重点。",
      "status.item4": "代码与预训练权重将在评审结束后发布。",

      "footer.body":
        "匿名项目主页 · 基于公开数据集（THINGS-EEG2、THINGS-MEG）与开源模型（OpenCLIP、DFN、MAE、DINOv2、SDXL-Turbo、IP-Adapter、CLIP-Dissect）构建。",
    },
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
      var key = el.getAttribute("data-i18n-html");
      el.innerHTML = t(lang, key);
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
          var attr = parts[0].trim();
          var key = parts.slice(1).join(":").trim();
          var varsRaw = el.getAttribute("data-i18n-vars");
          var vars = varsRaw ? JSON.parse(varsRaw) : null;
          el.setAttribute(attr, t(lang, key, vars));
        });
    });

    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.title = t(lang, el.getAttribute("data-i18n-title"));
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
  };
})(typeof window !== "undefined" ? window : this);
