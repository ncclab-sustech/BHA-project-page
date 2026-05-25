/**
 * BHA project page — EN (default) / ZH optional.
 * Persist choice in localStorage key "bha-lang".
 */
(function (global) {
  var STORAGE_KEY = "bha-lang";
  var DEFAULT_LANG = "en";

  var STRINGS = {
    en: {
      "nav.abstract": "Abstract",
      "nav.method": "Method",
      "nav.results": "Results",
      "nav.quantitative": "Quantitative",
      "nav.subjects": "Subjects",
      "nav.code": "Code",
      "nav.bibtex": "BibTeX",
      "lang.label": "Language",
      "lang.en": "EN",
      "lang.zh": "中文",

      "hero.badge": "Brain-to-image decoding",
      "hero.subtitle":
        "We align multi-level neural activity to hierarchical visual representations and transport them through bridge priors—linking retrieval, high-level semantics, and low-level appearance in a unified framework.",
      "hero.cta.read": "Read overview",
      "hero.meta.modalities": "Modalities",
      "hero.meta.tasks": "Tasks",
      "hero.meta.datasets": "Datasets",

      "abstract.label": "Overview",
      "abstract.title": "From neural hierarchies to images",
      "abstract.lead1":
        "<strong>BHA (Brain Hierarchical Alignment)</strong> is a decoding framework that maps hierarchical brain representations to visual semantics using <em>bridge priors</em>—including Schrödinger-bridge, diffusion-prior, and cascade-bridge variants—so that models trained on one subject or setting can better transfer to new subjects and modalities.",
      "abstract.lead2":
        "The codebase supports end-to-end pipelines: brain encoder training, high-level reconstruction with IP-Adapter and SDXL-Turbo, low-level latent regression with optional bridge refinement, and dual-path evaluation that blends semantic and appearance pathways.",
      "abstract.item1":
        "Intra-subject and leave-one-subject-out (LOSO) evaluation on standard THINGS splits",
      "abstract.item2":
        "Multiple encoder backbones and prior families in one reproducible shell workflow",
      "abstract.item3":
        "Rich metrics: PixCorr, SSIM, deep feature similarity, and bidirectional retrieval",

      "method.label": "Method",
      "method.title": "Hierarchical alignment with bridge transport",
      "method.lead":
        "High-level tracks align brain signals to OpenCLIP-style vision features and decode through a learned prior; low-level tracks regress SDXL VAE latents with optional bridge refinement. A dual-path evaluator blends the two for sharper, more faithful reconstructions.",
      "method.card1.title": "Hierarchical visual fusion (multi-model, multi-layer)",
      "method.card1.body":
        "Fuses semantic and appearance features from multiple vision encoders and network layers into a multi-scale representation space aligned with brain signals.",
      "method.card2.title": "Hierarchical alignment loss (pre/post projection)",
      "method.card2.body":
        "Applies hierarchical alignment constraints before and after projection into a shared embedding space, jointly optimizing cross-modal matching and representation geometry.",
      "method.card3.title": "Hierarchical high–low fusion for reconstruction",
      "method.card3.body":
        "Fuses high-level semantic and low-level appearance pathways with a tunable blend weight to balance semantic accuracy and fine-grained visual fidelity.",
      "method.figcap":
        "Framework overview: hierarchical brain representations are aligned to visual features and transported through bridge priors for retrieval and reconstruction.",

      "results.label": "Qualitative",
      "results.title": "Reconstruction preview",
      "results.lead":
        "Representative decoded images from our pipeline (quantitative benchmarks in the paper).",
      "results.figcap":
        "Teaser reconstructions from the dual-path evaluation (high-level + low-level blend).",
      "results.metric.sim": "Similarity",
      "results.metric.sim.desc":
        "AlexNet, InceptionV3, CLIP, EfficientNet, SwAV feature metrics",
      "results.metric.qual": "Image quality",
      "results.metric.qual.desc": "PixCorr and SSIM against held-out stimuli",
      "results.metric.ret": "Retrieval",
      "results.metric.ret.desc": "EEG↔image and image↔EEG top-k accuracy (high-level track)",

      "quant.label": "Quantitative",
      "quant.title": "Main results from the paper",
      "quant.lead":
        "Key tables and Figure 3 from our NeurIPS submission: reconstruction benchmarks on THINGS-EEG2, cross-modality retrieval, and the effect of high-/low-level blending coefficient α. Click any panel to view at full resolution.",
      "quant.open": "Open full size",
      "quant.t1cap":
        "<strong>Table 1.</strong> Visual reconstruction performance on THINGS-EEG2 (low- and high-level metrics). Oracle rows report real-image CLS / VAE-latent conditioning and their α&nbsp;=&nbsp;0.5 blend; bold and underline mark best and second-best results.",
      "quant.t2cap":
        "<strong>Table 2.</strong> Average Top-1 / Top-5 accuracy (%) for 200-way zero-shot retrieval on THINGS-EEG2 and THINGS-MEG (subject-wise averages).",
      "quant.f3cap":
        "<strong>Figure 3.</strong> Effect of high-/low-level blending coefficient α on reconstruction quality. Metrics are plotted per subject as α varies from the VAE branch (α&nbsp;=&nbsp;0) to the IP-Adapter branch (α&nbsp;=&nbsp;1); α&nbsp;=&nbsp;0.5 offers the best overall compromise.",

      "subjects.label": "Per-subject",
      "subjects.title": "Reconstruction detail by participant",
      "subjects.lead":
        "Each panel summarizes reconstructions for one participant (α sweep). Previews are scaled to fit your screen; click any panel to open the full-resolution PNG.",
      "subjects.hint": "Preview · click for full PNG",
      "subjects.open": "Open full size",
      "subjects.aria": "Open subject {n} reconstruction panel at full resolution",

      "code.label": "Reproducibility",
      "code.title": "Code & scripts",
      "code.lead":
        "Four entry points mirror the paper’s experimental sections: retrieval benchmarking, high-level reconstruction, low-level latent training, and dual-path evaluation. See the repository README for environment variables and dataset paths.",
      "code.card1": "Train encoders; intra-subject + LOSO retrieval on EEG or MEG.",
      "code.card2": "High-level reconstruction with bridge prior + IP-Adapter + SDXL-Turbo.",
      "code.card3": "Direct regression to VAE latents with optional bridge refinement.",
      "code.card4": "Load HL/LL checkpoints, blend paths, sweep α, optional GT ceiling.",

      "bibtex.label": "Citation",
      "bibtex.title": "BibTeX",
      "bibtex.lead":
        "Use this placeholder during anonymous review; swap for the official entry after publication.",
      "bibtex.tip":
        "Tip: add a “Copy” button with <code>navigator.clipboard</code> when you are no longer on a strict static host—clipboard often requires HTTPS.",

      "footer.body":
        "Built for anonymous release · MIT License · Acknowledgements: THINGS-EEG2/MEG, ATMS-style alignment, I2SB / Schrödinger-bridge literature, IP-Adapter, SDXL-Turbo, DINOv2 / REPA-style alignment — cite upstream work when using this code.",
      "footer.readme": "Repository README",
    },
    zh: {
      "nav.abstract": "摘要",
      "nav.method": "方法",
      "nav.results": "结果",
      "nav.quantitative": "定量",
      "nav.subjects": "被试",
      "nav.code": "代码",
      "nav.bibtex": "引用",
      "lang.label": "语言",
      "lang.en": "EN",
      "lang.zh": "中文",

      "hero.badge": "脑信号到图像解码",
      "hero.subtitle":
        "我们将多层次神经活动对齐到层次化视觉表征，并通过桥接先验进行传输——在统一框架中连接检索、高级语义与低级外观通路。",
      "hero.cta.read": "阅读概览",
      "hero.meta.modalities": "模态",
      "hero.meta.tasks": "任务",
      "hero.meta.datasets": "数据集",

      "abstract.label": "概览",
      "abstract.title": "从神经层次结构到图像",
      "abstract.lead1":
        "<strong>BHA（Brain Hierarchical Alignment）</strong> 是一种解码框架，通过 <em>桥接先验</em>（含薛定谔桥、扩散先验与级联桥等变体）将层次化脑表征映射到视觉语义，使在某一被试或设定上训练的模型更易迁移到新被试与新模态。",
      "abstract.lead2":
        "代码库支持端到端流程：脑编码器训练、基于 IP-Adapter 与 SDXL-Turbo 的高级重建、带可选桥接细化的低级潜变量回归，以及融合语义与外观通路的双路径评估。",
      "abstract.item1": "在标准 THINGS 划分上进行被试内与留一被试（LOSO）评估",
      "abstract.item2": "多种编码器骨干与先验族，统一的可复现 shell 工作流",
      "abstract.item3": "丰富指标：PixCorr、SSIM、深度特征相似度与双向检索",

      "method.label": "方法",
      "method.title": "层次化对齐与桥接传输",
      "method.lead":
        "高级通路将脑信号对齐到 OpenCLIP 风格视觉特征并经学习先验解码；低级通路回归 SDXL VAE 潜变量并可选用桥接细化。双路径评估器融合两者以获得更清晰、更忠实的重建。",
      "method.card1.title": "视觉层次化融合（不同模型不同层）",
      "method.card1.body":
        "将多路视觉编码器、不同网络层级的语义与外观特征进行层次化融合，使脑信号对齐到与视觉系统一致的多尺度表示空间。",
      "method.card2.title": "层次化对齐损失（投影前后）",
      "method.card2.body":
        "在投影到共享嵌入空间的前后分别施加层次化对齐约束，联合优化跨模态语义匹配与表征几何一致性。",
      "method.card3.title": "高级-低级层次化融合的图像重建",
      "method.card3.body":
        "将高级语义通路与低级外观通路进行层次化融合，通过可调混合权重生成兼顾语义准确性与细节保真度的重建图像。",
      "method.figcap":
        "框架概览：层次化脑表征对齐到视觉特征，并经桥接先验用于检索与重建。",

      "results.label": "定性",
      "results.title": "重建预览",
      "results.lead": "流水线代表性解码结果（定量结果见论文）。",
      "results.figcap": "双路径评估（高级 + 低级融合）的示意重建。",
      "results.metric.sim": "相似度",
      "results.metric.sim.desc": "AlexNet、InceptionV3、CLIP、EfficientNet、SwAV 特征指标",
      "results.metric.qual": "图像质量",
      "results.metric.qual.desc": "相对保留刺激的 PixCorr 与 SSIM",
      "results.metric.ret": "检索",
      "results.metric.ret.desc": "EEG↔图像 与 图像↔EEG 的 top-k 准确率（高级通路）",

      "quant.label": "定量",
      "quant.title": "论文主要结果",
      "quant.lead":
        "NeurIPS 投稿中的关键表格与图 3：THINGS-EEG2 重建基准、跨模态检索，以及高/低级融合系数 α 的影响。点击任意面板可查看全分辨率。",
      "quant.open": "查看原图",
      "quant.t1cap":
        "<strong>表 1.</strong> THINGS-EEG2 视觉重建性能（低/高级指标）。Oracle 行报告真实图像 CLS / VAE 潜变量条件及其 α&nbsp;=&nbsp;0.5 混合；粗体与下划线为最优与次优。",
      "quant.t2cap":
        "<strong>表 2.</strong> THINGS-EEG2 与 THINGS-MEG 上 200 类零样本检索的平均 Top-1 / Top-5 准确率（%）（被试平均）。",
      "quant.f3cap":
        "<strong>图 3.</strong> 高/低级融合系数 α 对重建质量的影响。各被试指标随 α 从 VAE 分支（α&nbsp;=&nbsp;0）到 IP-Adapter 分支（α&nbsp;=&nbsp;1）变化；α&nbsp;=&nbsp;0.5 为整体最佳折中。",

      "subjects.label": "逐被试",
      "subjects.title": "各被试重建细节",
      "subjects.lead":
        "每个面板汇总一名被试的重建（α 扫描）。预览已缩放以适配屏幕；点击可打开全分辨率 PNG。",
      "subjects.hint": "预览 · 点击查看原图",
      "subjects.open": "查看原图",
      "subjects.aria": "在新标签页打开被试 {n} 的重建全图",

      "code.label": "可复现性",
      "code.title": "代码与脚本",
      "code.lead":
        "四个入口对应论文实验章节：检索基准、高级重建、低级潜变量训练与双路径评估。环境变量与数据路径见仓库 README。",
      "code.card1": "训练编码器；EEG 或 MEG 的被试内 + LOSO 检索。",
      "code.card2": "桥接先验 + IP-Adapter + SDXL-Turbo 的高级重建。",
      "code.card3": "直接回归 VAE 潜变量，可选桥接细化。",
      "code.card4": "加载 HL/LL 检查点，融合通路，扫描 α，可选 GT 上界。",

      "bibtex.label": "引用",
      "bibtex.title": "BibTeX",
      "bibtex.lead": "匿名审稿阶段可使用此占位条目；发表后替换为正式条目。",
      "bibtex.tip":
        "提示：在非严格静态托管时可添加「复制」按钮（<code>navigator.clipboard</code> 通常需要 HTTPS）。",

      "footer.body":
        "匿名发布版本 · MIT 许可证 · 致谢：THINGS-EEG2/MEG、ATMS 风格对齐、I2SB / 薛定谔桥文献、IP-Adapter、SDXL-Turbo、DINOv2 / REPA 风格对齐——使用本代码时请引用上游工作。",
      "footer.readme": "仓库 README",
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
