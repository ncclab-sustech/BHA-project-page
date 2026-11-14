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
      "hero.sub": "BHA turns a few hundred milliseconds of brain activity into the picture a person is looking at — and, because it learns from four vision models kept separate, it shows which AI representations the brain actually carries, where it looks, and when.",
      "hero.cta1": "Watch the film",
      "hero.cta2": "What we learned",
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

      "nav.insights": "Insights",
      "ins.kicker": "AI ↔ BI · What BHA reveals",
      "ins.title": "A decoder that is also <span class=\"grad\">an instrument.</span>",
      "ins.lede": "Because BHA keeps four AI “views” of every image separate instead of fusing them, it can answer questions no single-teacher decoder can: which AI representations the human brain actually carries, where in the image each one looks, and when the signal arrives. Six things we learned.",
      "ins.l1.t": "Not every AI sees like a brain — until you let it.",
      "ins.l1.b": "We measured how well each vision model’s features can be predicted from EEG (brain–image cosine, higher = more brain-like). Out of the box, a web-trained CLIP-style model (DFN) is the most brain-predictable; self-supervised DINOv2 and masked MAE are almost unpredictable. Train a small adapter on their space and they become nearly as predictable — the brain-relevant information was there, encoded differently.",
      "ins.l1.k": "Takeaway: “brain-likeness” is a property of the readout, not only of the model. Pick teachers for what they add, then let the brain reshape them.",
      "ins.l1.raw": "Raw teacher features",
      "ins.l1.adapted": "After brain-trained adapter",
      "ins.l1.note": "Paired brain–image cosine similarity, THINGS-EEG2, ten participants. Non-paired baseline ≈ 0.",
      "ins.l2.t": "The brain imposes a shared geometry on very different AIs.",
      "ins.l2.b": "Ask the four vision models which images are similar to which, and they barely agree (correlation between their similarity structures 0.07–0.70). Ask BHA’s four expert heads — each predicting its own teacher’s space from the same brain signal — and they agree strongly (0.71–0.91). Passing through a brain pulls wildly different AI spaces into one geometry.",
      "ins.l2.k": "Takeaway: what the brain can express is the common denominator across vision models. The shared expert preserves image-to-image relations best (r = 0.82).",
      "ins.l2.vfm": "The AI teachers",
      "ins.l2.bha": "Predicted from the brain",
      "ins.l2.note": "Hover a cell. Pearson correlation between representational similarity matrices, mean over ten participants.",
      "ins.l2.asAI": "between the AI models",
      "ins.l2.viaBrain": "once predicted from the brain",
      "ins.l3.t": "Same geometry, different eyes.",
      "ins.l3.b": "Occlude a patch of the image and watch each expert’s match score move. For the bonnet, the OpenCLIP and DFN experts raise the match from the hat itself; the MAE and DINOv2 experts lower it from the very same pixels. Experts that embed images similarly can still use them in opposite ways.",
      "ins.l3.k": "Takeaway: this is why BHA composes expert scores instead of averaging them — averaging would cancel exactly these disagreements.",
      "ins.l3.seen": "seen image",
      "ins.l3.shared": "shared expert",
      "ins.l3.neg": "lowers the match",
      "ins.l3.pos": "raises the match",
      "ins.l4.t": "Units of the brain-aligned model become concept-selective.",
      "ins.l4.b": "Probe single units of BHA’s brain readout with held-out images: one fires for clothing (suit, chaps, coat), one for desserts, one for animals. Across all units, the concept profile of the brain predictions matches that of the vision models at cosine 0.61–0.81, against 0 for a shuffled control.",
      "ins.l4.k": "Takeaway: category structure survives the trip through 63 noisy electrodes. These are properties of the learned model, not claims about individual neurons in cortex.",
      "ins.l4.note": "Top-activating held-out images for three units of the brain readout; concept-profile cosine per branch versus a shuffled baseline.",
      "ins.l5.t": "When the brain speaks: two windows, 100 and 220 ms.",
      "ins.l5.b": "Delete a 50 ms slice of the recording and re-run the frozen model. Two slices matter: around 100 ms and around 220 ms after the image appears, where deleting costs up to 60 points of accuracy. The DFN expert and the composed BHA output depend on these windows far more than the DINOv2 and MAE experts — the same pattern on EEG and MEG.",
      "ins.l5.k": "Takeaway: the decoder keys on the earliest visual responses, not on late cognition — and different AI teachers tap different moments of the response.",
      "ins.l5.note": "Left: accuracy lost when a 50 ms window is deleted. Right: accuracy when only that window is kept. Mean ± SD over participants.",
      "ins.l6.t": "Two results you can take to your own decoder.",
      "ins.l6.b": "First, a bound: with K teachers whose errors are uncorrelated, the teacher-error part of the alignment risk shrinks by a factor of K — diversity is worth more than another epoch. Second, a trap: adapting the visual target to the brain raised brain–image agreement from 0.22 to 0.48 and retrieval from 30.1% to 37.8%, yet made reconstructions less recognisable (CLIP identification 0.754 → 0.706).",
      "ins.l6.k": "Takeaway: features that discriminate images drift away from what a frozen generator expects. Keep one prediction space per task — exactly what BHA does.",
      "ins.l6.a": "Brain–image agreement",
      "ins.l6.r": "Retrieval Top-1",
      "ins.l6.c": "Reconstruction identification (CLIP)",
      "ins.l6.note": "Effect of adapting the visual target toward brain signals, same backbone, same generator.",
      "diff.t": "What is actually different from a typical brain decoder",
      "diff.h0": "",
      "diff.h1": "Typical decoder",
      "diff.r1": "Supervision",
      "diff.r1a": "One vision model (usually CLIP), or several fused into one target",
      "diff.r1b": "Four teachers, kept separate; the brain encoder and the fused target learned jointly",
      "diff.r2": "Decision",
      "diff.r2a": "One similarity score in one space",
      "diff.r2b": "Scores from each teacher’s own space, composed with learned weights",
      "diff.r3": "Generator",
      "diff.r3a": "Fine-tuned or adapted to brain features",
      "diff.r3b": "Frozen; native semantic and spatial conditions predicted separately",
      "diff.r4": "What you learn",
      "diff.r4a": "An accuracy number",
      "diff.r4b": "Which AI representations the brain carries, where each looks, when the signal arrives — plus the number",
      "ins.l4.clothing": "clothing",
      "ins.l4.dessert": "dessert",
      "ins.l4.animal": "animal",
      "ins.l4.unit": "unit",
      "ins.l4.top5": "top-5 held-out images · activation",
      "ins.l5.delete": "Delete a 50 ms window",
      "ins.l5.keep": "Keep only a 50 ms window",
      "ins.l5.pp": "accuracy lost (pp)",
      "ins.l5.top1": "Top-1 (%)",
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
      "hero.sub": "BHA 把几百毫秒的脑活动还原成一个人正在看的画面——并且因为它向四个彼此独立的视觉模型学习，它还能告诉我们大脑究竟携带了哪些 AI 表征、看向图像的哪里、信号何时到来。",
      "hero.cta1": "观看短片",
      "hero.cta2": "我们学到了什么",
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

      "nav.insights": "洞见",
      "ins.kicker": "AI ↔ BI · BHA 揭示了什么",
      "ins.title": "既是解码器，也是<span class=\"grad\">一台仪器。</span>",
      "ins.lede": "BHA 把每张图像的四种 AI「看法」分开保留而不是融合，因此它能回答单教师解码器无法回答的问题：人脑究竟携带了哪些 AI 表征、每种表征看向图像的哪里、信号何时到达。我们学到的六件事。",
      "ins.l1.t": "并非每个 AI 都像大脑那样看——除非你允许它。",
      "ins.l1.b": "我们测量了每个视觉模型的特征能在多大程度上从 EEG 预测出来（脑–图像余弦，越高越「像脑」）。开箱即用时，网络数据训练的 CLIP 类模型（DFN）最可预测；自监督的 DINOv2 和掩码的 MAE 几乎不可预测。给它们的空间训练一个小适配器后，可预测性几乎追平——与脑相关的信息一直都在，只是编码方式不同。",
      "ins.l1.k": "要点：「像脑」是读出方式的属性，而不只是模型的属性。按各自能贡献什么来选教师，再让大脑重塑它们。",
      "ins.l1.raw": "原始教师特征",
      "ins.l1.adapted": "经脑训练适配器之后",
      "ins.l1.note": "配对脑–图像余弦相似度，THINGS-EEG2，10 名被试。非配对基线 ≈ 0。",
      "ins.l2.t": "大脑给差异巨大的 AI 强加了一个共享几何。",
      "ins.l2.b": "问四个视觉模型哪些图像彼此相似，它们几乎不一致（相似性结构之间的相关 0.07–0.70）。问 BHA 的四个专家头——各自从同一脑信号预测自己教师的空间——它们高度一致（0.71–0.91）。经过大脑这一趟，截然不同的 AI 空间被拉成了同一种几何。",
      "ins.l2.k": "要点：大脑能表达的，就是各视觉模型的公约数。共享专家最好地保留了图像之间的关系（r = 0.82）。",
      "ins.l2.vfm": "AI 教师本身",
      "ins.l2.bha": "从大脑预测出的",
      "ins.l2.note": "悬停查看。表征相似性矩阵之间的 Pearson 相关，10 名被试平均。",
      "ins.l2.asAI": "AI 模型之间",
      "ins.l2.viaBrain": "经大脑预测后",
      "ins.l3.t": "几何相同，眼睛不同。",
      "ins.l3.b": "遮住图像的一小块，看每个专家的匹配分数如何变化。对这顶软帽，OpenCLIP 与 DFN 专家靠帽子本身提高匹配；MAE 与 DINOv2 专家却因同一批像素降低匹配。嵌入相似的专家，仍可能以相反方式使用图像。",
      "ins.l3.k": "要点：这正是 BHA 组合专家分数而不是取平均的原因——平均会恰好抵消这些分歧。",
      "ins.l3.seen": "所见图像",
      "ins.l3.shared": "共享专家",
      "ins.l3.neg": "降低匹配",
      "ins.l3.pos": "提高匹配",
      "ins.l4.t": "脑对齐模型的单元出现概念选择性。",
      "ins.l4.b": "用未见过的图像探测 BHA 脑读出头的单个单元：一个对服饰（西装、皮套裤、外套）放电，一个对甜点，一个对动物。在全部单元上，脑预测的概念画像与视觉模型的概念画像余弦达 0.61–0.81，打乱对照为 0。",
      "ins.l4.k": "要点：类别结构经过 63 个嘈杂电极仍然幸存。这些是所学模型的性质，不是对皮层中单个神经元的断言。",
      "ins.l4.note": "脑读出头三个单元的最强激活未见图像；各分支的概念画像余弦与打乱基线对比。",
      "ins.l5.t": "大脑何时开口：两个窗口，100 与 220 毫秒。",
      "ins.l5.b": "删掉记录中 50 毫秒的一段，再跑冻结的模型。只有两段真正重要：图像出现后约 100 毫秒与约 220 毫秒，删掉可损失多达 60 个百分点。DFN 专家与组合后的 BHA 输出对这两个窗口的依赖远高于 DINOv2 与 MAE 专家——EEG 与 MEG 上模式一致。",
      "ins.l5.k": "要点：解码器依赖最早期的视觉响应，而非后期认知——且不同 AI 教师取用响应的不同时刻。",
      "ins.l5.note": "左：删除 50 毫秒窗口导致的准确率损失。右：仅保留该窗口时的准确率。被试均值 ± 标准差。",
      "ins.l6.t": "两条可以带回你自己解码器的结论。",
      "ins.l6.b": "其一，一个界：K 个误差互不相关的教师，可使对齐风险中的教师误差项缩小 K 倍——多样性比多训一轮更值钱。其二，一个陷阱：把视觉目标向大脑适配，脑–图像一致性从 0.22 升到 0.48，检索从 30.1% 升到 37.8%，但重建却更难辨认（CLIP 辨识 0.754 → 0.706）。",
      "ins.l6.k": "要点：区分图像的特征会偏离冻结生成器所期望的分布。每个任务保留一个预测空间——这正是 BHA 的做法。",
      "ins.l6.a": "脑–图像一致性",
      "ins.l6.r": "检索 Top-1",
      "ins.l6.c": "重建辨识率（CLIP）",
      "ins.l6.note": "把视觉目标向脑信号适配的效应；同一骨干、同一生成器。",
      "diff.t": "与典型脑解码器的真正区别",
      "diff.h0": "",
      "diff.h1": "典型解码器",
      "diff.r1": "监督信号",
      "diff.r1a": "一个视觉模型（通常是 CLIP），或多个融合成单一目标",
      "diff.r1b": "四位教师彼此独立；脑编码器与融合目标联合学习",
      "diff.r2": "决策",
      "diff.r2a": "单一空间中的单一相似度分数",
      "diff.r2b": "各教师自身空间的分数，用可学习权重组合",
      "diff.r3": "生成器",
      "diff.r3a": "针对脑特征微调或适配",
      "diff.r3b": "冻结；分别预测原生的语义与空间条件",
      "diff.r4": "你学到什么",
      "diff.r4a": "一个准确率数字",
      "diff.r4b": "大脑携带哪些 AI 表征、各看向哪里、信号何时到来——外加那个数字",
      "ins.l4.clothing": "服饰",
      "ins.l4.dessert": "甜点",
      "ins.l4.animal": "动物",
      "ins.l4.unit": "单元",
      "ins.l4.top5": "最强激活的 5 张未见图像 · 激活值",
      "ins.l5.delete": "删除 50 毫秒窗口",
      "ins.l5.keep": "仅保留 50 毫秒窗口",
      "ins.l5.pp": "损失的准确率（百分点）",
      "ins.l5.top1": "Top-1 (%)",
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
