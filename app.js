const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const SOH_LEVELS = [60, 65, 70, 75, 80, 85, 90, 95, 100];
const COLORS = { ink: '#102a2a', muted: '#85908d', grid: '#d9ddd2', green: '#0e6b56', lime: '#b8e14b', orange: '#f36d32', purple: '#6657d9', blue: '#1769aa', cyan: '#00a6a6', paper: '#fffdf6' };
const CANVAS_FONT = '"Times New Roman", "SimSun", "宋体", serif';

const i18n = {
  zh: { tagline:'看见算法如何估计电池荷电状态', chooseMethod:'选择一种 SOC 估计方法', settings:'参数配置', batteryType:'锂电池类型', ocvSource:'数据源', chemLfp:'磷酸铁锂（LFP）', chemNca:'镍钴铝（NCA）', chemNmc:'镍锰钴（NMC）', chemNcoLco:'NCO/LCO 混合体系', sohLabel:'电池健康状态 (SOH)', profile:'测试工况', profileCharge:'恒流充电', profileDischarge:'恒流放电', profileHppc:'HPPC 脉冲工况', profileUdds:'UDDS 城市循环', profileDst:'DST 动态应力测试', experimentMode:'实验模式', modeTeaching:'教学演示', modeUnified:'论文式统一基准', modeDatasetNative:'数据集原生复现（待数据）', benchmarkSeed:'随机种子', benchmarkDt:'采样周期', benchmarkInitial:'统一估计初值', benchmarkEta:'统一库仑效率', benchmarkCurrentNoise:'电流噪声标准差', benchmarkVoltageNoise:'电压噪声标准差', benchmarkCurrentBias:'统一电流偏置', benchmarkCapacityScale:'假设容量/新电芯容量', benchmarkR0Scale:'假设 R₀/标称 R₀', benchmarkRpScale:'假设 Rₚ/标称 Rₚ', benchmarkTauScale:'假设 τ/标称 τ', benchmarkEvidenceTitle:'配置依据与缺失项', cellModel:'电芯与运行参数', algorithmParams:'SOC 估计算法参数', reset:'参数初始化', downloadCsv:'↓ 下载运行数据 CSV', maxError:'误差最大值', rmse:'误差 RMS 值', meanError:'误差平均值', mse:'误差 M² 值', figureA:'单体电芯 SOC 测试系统', figureB:'SOC-OCV曲线', figureC:'电池工作电流波形', figureD:'SOC 估计结果与误差', otherCurves:'其他 SOH', truth:'真实 SOC', estimate:'估计 SOC', estimateError:'估计误差', powerSensing:'功率与传感路径', stateUpdate:'状态更新', measurementCorrection:'测量校正', footerText:'单体电芯测试台 · 实测多 SOH OCV · 浏览器交互仿真', batteryInfoTitle:'锂电池类型与公开数据来源', guideDisclaimer:'参数影响是本网站实现的一般性说明；论文式统一基准使用公共输入并以原始估计值计算误差。', references:'参考文献与公开数据', currentSoh:'当前 SOH', definition:'定义', increase:'增大', decrease:'减小' },
  en: { tagline:'See how algorithms estimate battery state of charge', chooseMethod:'Choose an SOC estimation method', settings:'Parameter settings', batteryType:'Lithium-ion chemistry', ocvSource:'Data source', chemLfp:'Lithium iron phosphate (LFP)', chemNca:'Nickel cobalt aluminium (NCA)', chemNmc:'Nickel manganese cobalt (NMC)', chemNcoLco:'NCO/LCO blended oxide', sohLabel:'State of health (SOH)', profile:'Test profile', profileCharge:'Constant-current charge', profileDischarge:'Constant-current discharge', profileHppc:'HPPC pulse profile', profileUdds:'UDDS urban cycle', profileDst:'DST dynamic stress test', experimentMode:'Experiment mode', modeTeaching:'Teaching demonstration', modeUnified:'Unified research benchmark', modeDatasetNative:'Dataset-native reproduction (data pending)', benchmarkSeed:'Random seed', benchmarkDt:'Sample period', benchmarkInitial:'Common initial estimate', benchmarkEta:'Common coulombic efficiency', benchmarkCurrentNoise:'Current-noise standard deviation', benchmarkVoltageNoise:'Voltage-noise standard deviation', benchmarkCurrentBias:'Common current bias', benchmarkCapacityScale:'Assumed/new-cell capacity', benchmarkR0Scale:'Assumed/nominal R₀', benchmarkRpScale:'Assumed/nominal Rₚ', benchmarkTauScale:'Assumed/nominal τ', benchmarkEvidenceTitle:'Configuration basis and missing items', cellModel:'Cell and run parameters', algorithmParams:'SOC estimator parameters', reset:'Reset parameters', downloadCsv:'↓ Download run data CSV', maxError:'Maximum error', rmse:'Error RMS', meanError:'Mean error', mse:'Mean squared error', figureA:'Single-cell SOC test system', figureB:'SOC–OCV curves', figureC:'Battery operating-current waveform', figureD:'SOC estimates and error', otherCurves:'Other SOH', truth:'True SOC', estimate:'Estimated SOC', estimateError:'Estimation error', powerSensing:'Power and sensing path', stateUpdate:'State update', measurementCorrection:'Measurement correction', footerText:'Single-cell test bench · measured multi-SOH OCV · interactive browser simulation', batteryInfoTitle:'Battery chemistries and public data sources', guideDisclaimer:'Parameter effects describe this website implementation; the unified research benchmark uses common inputs and raw estimates for error metrics.', references:'References and public data', currentSoh:'Selected SOH', definition:'Definition', increase:'Increase', decrease:'Decrease' }
};

Object.assign(i18n.zh, {
  modeUnified:'论文式统一基准',
  benchmarkDt:'采样周期（标准 1 s）',
  benchmarkInfoButton:'论文配置与复现边界',
  benchmarkInfoTitle:'论文配置与复现边界',
  guideDisclaimer:'参数说明用于解释本网站实现，不代表某一篇论文的原始最优参数。论文式统一基准不会按算法单独修改测试输入，也不会把超过阈值的误差清零；所有指标均由未作全局 0–100% 截断的原始估计值计算。数据驱动方法在未加载作者训练权重时明确标记为“浏览器代理”，其结果不得引用为对应论文的复现实验。'
});
Object.assign(i18n.en, {
  modeUnified:'Unified research benchmark',
  benchmarkDt:'Sample period (1 s standard)',
  benchmarkInfoButton:'Paper configurations and reproduction boundary',
  benchmarkInfoTitle:'Paper configurations and reproduction boundary',
  guideDisclaimer:'The parameter guide explains this website implementation; it is not a claim that the displayed values are the optimum settings from any one paper. The unified research benchmark never changes the test input for a particular algorithm or zeros errors above a threshold. Metrics use the raw estimate without a global 0–100% clamp. Data-driven methods are explicitly labelled browser surrogates until author-trained weights are loaded, and their results must not be cited as paper reproductions.'
});

const tr = key => i18n[language]?.[key] ?? i18n.zh[key] ?? key;

const refs = {
  data: '<a href="https://doi.org/10.57745/OLBXKT" target="_blank" rel="noreferrer">Wheeler et al., Aging study on twenty A123 18650 Graphite/LFP 1.1 Ah cells, Recherche Data Gouv (2025), CC BY 4.0.</a>',
  paper: '<a href="https://doi.org/10.1038/s41597-025-04712-7" target="_blank" rel="noreferrer">Wheeler et al., An ageing study of twenty 18650 lithium-ion Graphite/LFP cells in first and second life use, Scientific Data 12, 392 (2025).</a>',
  nmcData: '<a href="https://doi.org/10.5683/SP3/UYPYDJ" target="_blank" rel="noreferrer">Duque, Kollmeyer, Naguib et al., Battery Aging Dataset for 15 Minute Fast Charging of Samsung 30T Cells, Borealis (2023), CC BY-SA 4.0.</a>',
  nmcPaper: '<a href="https://battery.mcmaster.ca/research/datasets-and-algorithms/" target="_blank" rel="noreferrer">McMaster Battery Research Group, Dataset and Algorithms: Samsung 30T aging dataset.</a>',
  stanfordData: '<a href="https://osf.io/qsabn/?view_only=2a03b6c78ef14922a3e244f3d549de78" target="_blank" rel="noreferrer">Pozzato, Allam and Onori, Dataset_SECL_INR21700-M50T, Stanford Energy Control Lab.</a>',
  stanfordPaper: '<a href="https://doi.org/10.1016/j.dib.2022.107995" target="_blank" rel="noreferrer">Pozzato, Allam and Onori, Lithium-ion battery aging dataset based on electric vehicle real-driving profiles, Data in Brief 41 (2022) 107995.</a>',
  dynamicData: '<a href="https://purl.stanford.edu/td676xr4322" target="_blank" rel="noreferrer">Geslin et al., Dynamic cycling battery ageing dataset, Stanford Digital Repository.</a>',
  dynamicPaper: '<a href="https://doi.org/10.1038/s41560-024-01675-8" target="_blank" rel="noreferrer">Geslin et al., Dynamic cycling enhances battery lifetime, Nature Energy 10 (2025) 172–180.</a>',
  oxfordData: '<a href="https://doi.org/10.5287/bodleian:KO2kdmYGg" target="_blank" rel="noreferrer">Howey and Birkl, Oxford Battery Degradation Dataset 1, University of Oxford (2017), ODbL 1.0.</a>',
  oxfordChemistry: '<a href="https://ora.ox.ac.uk/objects/uuid%3A1cd07380-ac39-4ca2-856d-4903f2a5757a/files/m6784460aeaeb59c4a70f4cb3533f8fa2" target="_blank" rel="noreferrer">Birkl, Diagnosis and Prognosis of Degradation in Lithium-Ion Batteries, University of Oxford thesis (NCO/LCO cathode analysis).</a>',
  calce: '<a href="https://calce.umd.edu/data" target="_blank" rel="noreferrer">University of Maryland CALCE open battery research data (LFP, NMC and LCO).</a>',
  multiChem: '<a href="https://doi.org/10.21227/651q-8v82" target="_blank" rel="noreferrer">Voicila et al., 24-hour raw OCV relaxation dataset for rechargeable batteries with different chemistries.</a>',
  plett: '<a href="https://doi.org/10.1016/j.jpowsour.2004.02.031" target="_blank" rel="noreferrer">Plett, Extended Kalman filtering for battery management systems, Part 1, Journal of Power Sources 134 (2004) 252–261.</a>',
  compare: '<a href="https://doi.org/10.1016/j.est.2022.104174" target="_blank" rel="noreferrer">Kalman filtering techniques for online model-parameter and SOC estimation: comparative analysis, Journal of Energy Storage 51 (2022) 104174.</a>',
  review: '<a href="https://doi.org/10.1016/j.est.2023.108707" target="_blank" rel="noreferrer">Review on SOC estimation techniques: a control-oriented approach, Journal of Energy Storage 72 (2023) 108707.</a>',
  dual: '<a href="https://doi.org/10.1016/j.jpowsour.2013.03.131" target="_blank" rel="noreferrer">Mastali et al., Battery SOC estimation using EKF and dual EKF, Journal of Power Sources 239 (2013) 294–307.</a>',
  ieee: '<a href="https://doi.org/10.1109/VPPC49601.2020.9330850" target="_blank" rel="noreferrer">Combined neural-network/UKF SOC estimation with adaptive covariance matching, IEEE VPPC (2020).</a>'
  ,xiongReview: '<a href="https://doi.org/10.1109/ACCESS.2017.2780258" target="_blank" rel="noreferrer">Xiong et al., Critical Review on the Battery State of Charge Estimation Methods for Electric Vehicles, IEEE Access 6 (2018).</a>'
  ,hannanReview: '<a href="https://doi.org/10.1016/j.rser.2017.05.001" target="_blank" rel="noreferrer">Hannan et al., A review of lithium-ion battery SOC estimation and management systems, Renewable and Sustainable Energy Reviews 78 (2017).</a>'
  ,yangReview: '<a href="https://doi.org/10.1016/j.est.2021.102572" target="_blank" rel="noreferrer">Yang et al., Classification, summarization and perspectives on SOC estimation, Journal of Energy Storage 39 (2021).</a>'
  ,dataReview: '<a href="https://doi.org/10.1016/j.est.2023.108420" target="_blank" rel="noreferrer">A review on data-driven SOC estimation with Li-ion batteries, Journal of Energy Storage 72 (2023).</a>'
  ,hybridReview: '<a href="https://doi.org/10.1016/j.est.2024.113604" target="_blank" rel="noreferrer">A comprehensive review of hybrid battery SOC estimation: physics-aware AI approaches, Journal of Energy Storage 100 (2024).</a>'
};

const paperConfigurationSources = {
  huang2018: {
    title:'Huang et al., IEEE Access 2018',
    url:'https://doi.org/10.1109/ACCESS.2018.2833858',
    methods:'EKF / UKF',
    cell:'BAK B18650CD Li-NMC',
    protocolZh:'一阶 RC 与组合模型；DST 用于辨识、FUDS 用于验证；论文单独考察方差 0.25 A²（σ=0.5 A）的零均值高斯电流噪声。',
    protocolEn:'First-order RC and combined models; DST identification and FUDS validation; a separate robustness test uses zero-mean Gaussian current noise with variance 0.25 A² (σ=0.5 A).',
    missingZh:'没有给出可直接移植到本站五个电芯的一组统一 Q/R/P₀；电芯与工况也不同。',
    missingEn:'No single transferable Q/R/P₀ set is reported for the five cells on this site; the cell and profile also differ.'
  },
  lv2020: {
    title:'Lv et al., Electronics 2020',
    url:'https://doi.org/10.3390/electronics9091425',
    methods:'AUKF / UKF',
    cell:'LiCoO₂ cell',
    protocolZh:'二阶 RC、UDDS；公开 x₀=[0,0,0.6]ᵀ、P₀=diag(10⁻⁵,10⁻⁵,10⁻³)、Q=10⁻⁷I、R=1。',
    protocolEn:'Second-order RC under UDDS; reports x₀=[0,0,0.6]ᵀ, P₀=diag(10⁻⁵,10⁻⁵,10⁻³), Q=10⁻⁷I, and R=1.',
    missingZh:'本站是一维 SOC + 一阶极化的降阶实现；状态维度和电压归一化不同，不能把矩阵数值直接冒充本站默认值。',
    missingEn:'This site uses a reduced scalar-SOC plus first-order-polarization implementation; different state dimension and voltage scaling prevent direct transfer.'
  },
  guo2023: {
    title:'Guo et al., Frontiers in Energy Research 2023',
    url:'https://doi.org/10.3389/fenrg.2022.998002',
    methods:'EKF / UKF',
    cell:'6.2 Ah LiFePO₄',
    protocolZh:'25 °C、二阶 RC、0.5C 恒流与 UDDS；真实 SOC 从 0.9 放至约 0.1，并给出随 SOC 变化的 R₁/C₁/R₂/C₂ 表。',
    protocolEn:'25 °C, second-order RC, 0.5C constant-current and UDDS tests; true SOC runs from 0.9 to about 0.1 and SOC-dependent R₁/C₁/R₂/C₂ values are tabulated.',
    missingZh:'不是本站 A123 Cell6a；论文的完整滤波协方差与原始动态记录不足以在浏览器逐样本复现。',
    missingEn:'It is not this site’s A123 Cell6a; complete covariance settings and raw dynamic records are insufficient for sample-exact browser reproduction.'
  },
  duque2022: {
    title:'Duque et al., IEEE ITEC 2022',
    url:'https://doi.org/10.1109/ITEC53557.2022.9813961',
    methods:'Dual EKF (SOC / capacity SOH)',
    cell:'Samsung INR21700-30T',
    protocolZh:'与本站 Samsung 30T 数据直接关联；论文报告 SOH 100%–80% 范围平均 SOC RMS 误差约 1.0%，并测试初始 SOC 与传感器误差鲁棒性。',
    protocolEn:'Directly associated with this site’s Samsung 30T data; reports about 1.0% average SOC RMS error over 100%–80% SOH and tests initial-SOC and sensor-error robustness.',
    missingZh:'公开元数据未给出逐样本输入、完整参数矩阵和实现代码，因此本站 DEKF 只能标记为降阶复现。',
    missingEn:'Public metadata does not expose sample-level inputs, full parameter matrices, or implementation code; the site DEKF is therefore a reduced reproduction.'
  },
  chemali2018: {
    title:'Chemali et al., IEEE TIE 2018',
    url:'https://doi.org/10.1109/TIE.2017.2787586',
    methods:'LSTM-RNN',
    cell:'Panasonic 18650PF',
    protocolZh:'多温度动态工况；论文公开 LSTM 结构与 Adam 超参数（β₁=0.9、β₂=0.999、学习率 10⁻⁴、ε=10⁻⁸），并报告固定温度 MAE 0.573%。',
    protocolEn:'Dynamic profiles over multiple temperatures; reports the LSTM formulation and Adam settings (β₁=0.9, β₂=0.999, learning rate 10⁻⁴, ε=10⁻⁸), with 0.573% fixed-temperature MAE.',
    missingZh:'作者训练权重、完全相同的数据划分与当前五个电芯的再训练权重未加载，本站 LSTM 不是该论文模型的复现。',
    missingEn:'Author-trained weights, the exact split, and retrained weights for the five current cells are not loaded; the site LSTM is not a reproduction of that network.'
  },
  sung2022: {
    title:'Sung et al., Sensors 2022',
    url:'https://doi.org/10.3390/s22166303',
    methods:'Residual CNN',
    cell:'Panasonic NCR18650PF',
    protocolZh:'九种行驶工况、五个温度；两段残差块，每层 16 个 3×3 卷积核，后接 32/16/8 全连接层，并使用 Adam 与早停。',
    protocolEn:'Nine drive schedules and five temperatures; two residual blocks with 16 3×3 filters per convolution, followed by 32/16/8 fully connected layers, Adam, and early stopping.',
    missingZh:'训练样本预处理和作者权重未加载；本站 CNN 仅为时间窗平滑代理。',
    missingEn:'Training preprocessing and author weights are not loaded; the site CNN is only a temporal-window surrogate.'
  }
};

const parameterEnglish = {
  initialSoc: ['Initial cell SOC','True cell SOC at t = 0.','A higher value starts the test at a higher charge level.','A lower value reaches the low-SOC nonlinear region sooner.'],
  duration: ['Run duration','Total simulated duration and the time-axis span of Figures C and D.','A longer duration reveals full pulse sequences and long-term drift.','A shorter duration runs faster but may show little SOC movement.'],
  chargeCurrent: ['Charge current','Magnitude of charge current; charging is negative internally.','Higher current raises SOC faster and increases polarization.','Lower current approaches quasi-static operation.'],
  dischargeCurrent: ['Discharge current','Magnitude of discharge current and the scale for dynamic profiles.','Higher current lowers SOC faster and strengthens excitation.','Lower current reduces SOC change and dynamic excitation.'],
  initialEstimate: ['Initial SOC estimate','Estimator SOC prior at startup, independent of the true initial SOC.','A higher value shifts the initial estimate upward; closed-loop methods correct it over time.','A lower value shifts it downward; coulomb counting retains the offset.'],
  qSoc: ['Process noise Q','Process-noise variance of the SOC state equation.','More measurement-driven correction, but a noisier estimate.','More trust in coulomb counting and slower convergence.'],
  rVoltage: ['Voltage noise R','Terminal-voltage measurement-noise variance.','Less weight on voltage measurements and smoother estimates.','More measurement weight and greater noise sensitivity.'],
  p0: ['Initial covariance P₀','Initial uncertainty assigned to the SOC estimate.','Faster acceptance of measurement correction at startup.','Greater confidence in the initial SOC prior.'],
  efficiency: ['Coulombic efficiency η','Fraction of transferred charge reflected in usable capacity.','SOC changes slightly faster for the same current.','SOC changes slightly slower.'],
  currentBias: ['Current bias','Systematic current-sensor offset.','SOC decreases faster during discharge.','SOC decreases more slowly during discharge.'],
  restThreshold: ['Rest-current threshold','Maximum current magnitude regarded as near-rest for OCV correction.','Updates occur more often but include more polarization error.','Updates are more reliable but less frequent.'],
  voltageFilter: ['Voltage filter coefficient','Weight of the newest sample in the voltage or residual low-pass filter.','Faster response with more visible noise.','Smoother response with more lag.'],
  correctionGain: ['OCV correction gain','Fusion weight applied to the OCV lookup result.','Faster drift correction but stronger OCV-model influence.','Behavior stays closer to pure coulomb counting.'],
  observerGain: ['Observer gain L','Strength of voltage-residual feedback into the SOC state.','Faster convergence with greater noise sensitivity.','Smoother estimates but slower recovery from initial error.'],
  switchGain: ['Switching gain Kₛ','Amplitude of the sliding-mode correction term.','Greater robustness and faster convergence but more chattering.','Smoother output with less robustness to model error.'],
  boundaryLayer: ['Boundary layer φ','Smoothing region used by the saturation function.','Less chattering but softer correction.','Sharper correction with greater chattering risk.'],
  alpha: ['Sigma-point α','Controls sigma-point spread around the mean.','Covers a wider nonlinear region.','Concentrates points and approaches local linearization.'],
  beta: ['Prior-distribution β','Encodes prior distribution knowledge; β = 2 is common for Gaussian states.','Increases the central covariance weight.','Reduces the prior correction.'],
  kappa: ['Scaling parameter κ','Works with α to set sigma-point scale.','Spreads sigma points farther.','Concentrates the point set; very small values can hurt stability.'],
  forgetting: ['Forgetting factor λ','Retention of past innovations in adaptive noise estimation.','Produces smoother covariance evolution.','Adapts faster to changes but fluctuates more.'],
  parameterQ: ['Capacity process noise Qθ','Random-walk variance of slowly varying usable capacity.','Adapts faster to capacity fade but may fluctuate more.','Produces a steadier capacity estimate but slower SOH correction.'],
  particles: ['Particle count N','Number of samples representing the SOC posterior.','Improves posterior stability at higher computational cost.','Runs faster but increases depletion and random variation.'],
  resample: ['Resampling threshold','Effective-particle ratio below which resampling is triggered.','Resamples more often and removes low-weight particles sooner.','Preserves diversity longer but may retain ineffective particles.']
  ,nonlinearGain: ['Nonlinear correction gain','Gain applied to the bounded nonlinear voltage-innovation feedback.','Speeds convergence but increases sensitivity to voltage-model mismatch.','Produces smoother correction but slower initial-error recovery.']
  ,highGain: ['High-gain coefficient','Scales the voltage innovation in the high-gain observer.','Accelerates convergence but amplifies measurement noise.','Reduces noise amplification but slows convergence.']
  ,gainEpsilon: ['High-gain regularization ε','Denominator limiting the effective high-gain correction.','Softens the correction and reduces noise sensitivity.','Strengthens correction but can produce oscillation.']
  ,window: ['Input window','Number of recent voltage-current samples used by the learned estimator.','Uses more temporal context but adds lag and computation.','Responds faster but captures less dynamic history.']
  ,dataGain: ['Learned-model correction gain','Strength of the surrogate learned mapping from measured features to SOC.','Tracks measurement-derived SOC faster but exposes domain-shift error.','Relies more on temporal integration and becomes smoother.']
  ,memory: ['Recurrent memory factor','Retention of the previous hidden or cell state.','Preserves longer history but adapts more slowly to abrupt changes.','Forgets history faster and follows recent samples more strongly.']
  ,gateBias: ['Gate bias','Bias controlling the LSTM forget/input balance.','Retains the cell state longer.','Lets new measurements replace memory more quickly.']
  ,fusionWeight: ['Neural residual weight','Weight of the ANN residual correction added to the EKF estimate.','Corrects systematic model bias more strongly but increases dependence on training-domain similarity.','Behaves closer to the physics-based EKF.']
  ,measurementWeight: ['Innovation multiplier γ','The standard KF/UKF uses γ = 1; values below 1 define an artificially damped variant.','Corrects voltage innovations faster but exposes OCV-model mismatch and noise.','Relies more on the current-integration prediction and converges more slowly from a wrong initial SOC.']
};

function localizeDef(def) {
  if (language !== 'en' || !parameterEnglish[def.key]) return def;
  const [label, ...help] = parameterEnglish[def.key];
  return { ...def, label, help };
}

const p = (key, label, min, max, step, value, unit, help) => ({ key, label, min, max, step, value, unit, help });
const commonInitial = p('initialEstimate','SOC 估计初值',0,100,1,100,'%', ['估计器启动时采用的 SOC 先验，与电芯真实初始 SOC 分开设置。','增大：估计曲线初始位置上移；闭环方法会逐步校正。','减小：估计曲线初始位置下移；安时积分法会长期保留偏差。']);
const qSoc = p('qSoc','过程噪声 Q',0.00000001,0.0001,0.00000001,0.0000001,'', ['SOC 状态方程的过程噪声方差；默认 10⁻⁷ 取自公开 AUKF 配置的 SOC 量级。','增大：滤波器更快修正模型偏差，但估计更抖。','减小：更信任安时积分模型，收敛变慢。']);
const rVoltage = p('rVoltage','电压噪声 R',0.0000001,0.01,0.0000001,0.0000063,'V²', ['端电压测量噪声方差；默认值约等于统一基准 (2.5 mV)²。','增大：降低电压测量权重，估计更平滑。','减小：提高测量权重，也更易受噪声和 OCV 模型失配影响。']);
const p0 = p('p0','初始协方差 P₀',0.0001,0.2,0.0001,0.001,'', ['初始 SOC 估计的不确定度；默认 10⁻³ 与公开 AUKF 配置中的 SOC 对角项同量级。','增大：启动阶段更快接受测量校正。','减小：启动阶段更坚持初始 SOC。']);
const restThreshold = p('restThreshold','静置电流阈值',0.001,0.5,0.001,0.04,'A',['只有测量电流绝对值低于该阈值时才执行 OCV 校正。','增大：更频繁校正，但更容易把负载极化误当作 OCV。','减小：校正更接近静置条件，但可用更新点减少。']);

const algorithms = {
  conventional:{label:'传统及开环方法',items:{
    cc:{name:'安时积分法 (Coulomb Counting)',desc:'对测得电流随时间积分；实现简单，但初值、容量误差和电流偏置会累积。',f1:'SOCₖ = SOCₖ₋₁ − ηIₖΔt / Qₙ',f2:'开环估计：无端电压反馈校正',params:[commonInitial,p('efficiency','库仑效率 η',0.94,1.02,0.001,1,'',['充放电电量进入可用容量的比例。','增大：同样电流下 SOC 变化略快。','减小：SOC 变化略慢。']),p('currentBias','电流偏置',-.15,.15,.005,0,'A',['电流传感器的系统偏差。','正偏置：放电时 SOC 更快下降。','负偏置：放电时 SOC 下降变慢。'])]},
    ocv:{name:'开路电压查表法 (OCV)',desc:'由静置或补偿后的电压反查 SOC–OCV 表；无累积误差，动态负载下会受极化影响。',f1:'SOCₖ = OCV⁻¹(Vₜ,ₖ)',f2:'端电压滤波后直接查表',params:[commonInitial,p('voltageFilter','电压滤波系数',.01,1,.01,.12,'',['一阶低通滤波的新样本权重。','增大：响应更快，噪声更明显。','减小：更平滑，但滞后增大。']),restThreshold]}
  }},
  bayesian:{label:'模型—贝叶斯滤波方法',items:{
    kf:{name:'卡尔曼滤波 (KF)',desc:'采用固定线性 OCV–SOC 测量模型，计算量低，但在平台区和强非线性区间易产生模型偏差。',f1:'x̂⁻ₖ = Ax̂ₖ₋₁ + Buₖ',f2:'x̂ₖ = x̂⁻ₖ + γKₖ(yₖ − Hx̂⁻ₖ)',params:[commonInitial,qSoc,rVoltage,p0,p('measurementWeight','创新抑制系数 γ',.0001,1,.0001,1,'',['标准 KF 取 γ=1；γ<1 表示人为阻尼化的变体。','增大：电压创新校正更快，但 OCV 模型失配更明显。','减小：更信任安时积分预测，错误初值收敛更慢。'])]},
    ekf:{name:'扩展卡尔曼滤波 (EKF)',desc:'用 OCV–SOC 曲线局部雅可比线性化非线性端电压方程。',f1:'x̂⁻ₖ = f(x̂ₖ₋₁,uₖ)',f2:'Kₖ = P⁻ₖHᵀ(H P⁻ₖHᵀ + R)⁻¹',params:[commonInitial,qSoc,rVoltage,p0]},
    ukf:{name:'无迹卡尔曼滤波 (UKF)',desc:'以 Sigma 点传播非线性分布，无需显式雅可比。',f1:'χᵢ,ₖ₋₁ → f(χᵢ,ₖ₋₁,uₖ)',f2:'x̂ₖ = x̂⁻ₖ + γKₖ(yₖ − ŷ⁻ₖ)',params:[commonInitial,p('alpha','Sigma 点 α',.001,1,.001,1,'',['控制 Sigma 点扩展范围。','增大：覆盖更宽的非线性区域。','减小：结果趋近局部线性化。']),p('beta','先验分布 β',0,4,.1,2,'',['编码状态分布先验。','增大：提高中心协方差权重。','减小：降低先验修正。']),p('kappa','缩放参数 κ',-.9,3,.1,0,'',['与 α 一起调整 Sigma 点尺度；一维状态必须满足 κ > −1 才有有效 Sigma 点。','增大：点集扩展更宽。','减小：点集更集中。']),qSoc,rVoltage,p('measurementWeight','创新抑制系数 γ',.0001,1,.0001,1,'',['标准 UKF 取 γ=1；γ<1 表示人为阻尼化的变体。','增大：创新校正更快但噪声与失配影响增强。','减小：更信任状态预测。'])]},
    aekf:{name:'自适应扩展卡尔曼滤波 (AEKF)',desc:'根据创新序列在线调整噪声协方差。',f1:'Rₖ = λRₖ₋₁ + (1−λ)νₖνₖᵀ',f2:'x̂ₖ = x̂⁻ₖ + Kₖνₖ',params:[commonInitial,qSoc,rVoltage,p0,p('forgetting','遗忘因子 λ',.8,.999,.001,.96,'',['控制历史创新的保留程度。','增大：协方差变化更平稳。','减小：适应更快但波动更大。'])]},
    pf:{name:'粒子滤波 (PF)',desc:'用带权粒子近似 SOC 后验分布，可处理非高斯噪声和强非线性。',f1:'xₖ⁽ⁱ⁾ ~ p(xₖ | xₖ₋₁⁽ⁱ⁾,uₖ)',f2:'wₖ⁽ⁱ⁾ ∝ wₖ₋₁⁽ⁱ⁾ p(yₖ | xₖ⁽ⁱ⁾)',params:[commonInitial,p('particles','粒子数 N',50,1000,10,300,'',['表示 SOC 后验分布的样本数量。','增大：更稳定但计算量上升。','减小：更快但粒子贫化更明显。']),qSoc,rVoltage,p0,p('resample','重采样阈值',.1,.9,.05,.5,'N',['有效粒子比例低于该值时重采样。','增大：更频繁重采样。','减小：保持多样性更久。'])]}
  }},
  observer:{label:'状态观测器方法',items:{
    luenberger:{name:'Luenberger 状态观测器',desc:'用安时积分预测状态，再用端电压残差线性反馈修正 SOC。',f1:'SOĈₖ₊₁ = f(SOĈₖ,Iₖ) + L eᵥ',f2:'eᵥ = Vₜ − V̂ₜ',params:[commonInitial,p('observerGain','观测器增益 L',.01,1.2,.01,.15,'',['端电压残差反馈强度。','增大：收敛加快但对噪声敏感。','减小：更平滑但收敛慢。']),p('voltageFilter','残差滤波系数',.01,1,.01,.18,'',['电压残差低通滤波权重。','增大：跟踪更快。','减小：噪声更低但滞后增大。'])]},
    nonlinear:{name:'非线性观测器',desc:'将 OCV–SOC 非线性显式保留在测量方程中，以有界非线性创新项修正 SOC。',f1:'SOĈ̇ = −ηI/Q + L tanh(eᵥ/φ)',f2:'eᵥ = Vₜ − OCV(SOĈ)',params:[commonInitial,p('nonlinearGain','非线性校正增益',.001,.25,.001,.035,'',['有界非线性电压创新反馈增益。','增大：收敛更快但模型失配影响增强。','减小：更平滑但收敛较慢。']),p('boundaryLayer','非线性边界层 φ',.002,.2,.001,.05,'V',['限制 tanh 校正项的平滑区。','增大：校正更温和。','减小：校正更快但更敏感。'])]},
    smo:{name:'滑模观测器 (SMO)',desc:'用饱和型切换项抑制模型不确定性，鲁棒但增益过大会抖振。',f1:'SOĈₖ₊₁ = f(x̂ₖ,Iₖ) + Kₛ sat(eᵥ/φ)',f2:'eᵥ = Vₜ − V̂ₜ',params:[commonInitial,p('switchGain','切换增益 Kₛ',.001,.25,.001,.035,'',['滑模校正项幅值。','增大：鲁棒性增强但抖振增加。','减小：更平滑但抗模型误差能力下降。']),p('boundaryLayer','边界层 φ',.002,.2,.001,.05,'V',['用饱和函数代替符号函数的平滑区。','增大：抖振减小但校正变软。','减小：校正更锐利。'])]},
    highgain:{name:'高增益观测器 (HGO)',desc:'用高增益电压创新迅速压缩初值误差，但对噪声和 OCV 平台区更敏感。',f1:'SOĈ̇ = −ηI/Q + (L/ε)eᵥ',f2:'0 < ε ≪ 1',params:[commonInitial,p('highGain','高增益系数 L',.01,1,.01,.16,'',['缩放电压创新的增益。','增大：收敛更快但噪声放大。','减小：噪声更低但收敛慢。']),p('gainEpsilon','高增益正则项 ε',.1,2,.01,.8,'',['限制有效高增益的分母。','增大：校正变软。','减小：校正增强但可能振荡。']),p('voltageFilter','残差滤波系数',.01,1,.01,.18,'',['高增益校正前的电压残差低通权重。','增大：响应更快但噪声更多。','减小：更平滑但收敛滞后。'])]}
  }},
  dataDriven:{label:'数据驱动方法',items:{
    ann:{name:'人工神经网络 (ANN)',desc:'用静态非线性映射从电压、电流和 SOH 特征直接回归 SOC。',f1:'SOĈₖ = fθ(Vₖ,Iₖ,SOH)',f2:'fθ = W₂ σ(W₁x+b₁)+b₂',params:[commonInitial,p('dataGain','学习模型校正增益',.01,1,.01,.14,'',['学习映射对 SOC 的更新强度。','增大：更快跟踪但域偏移误差更明显。','减小：更平滑但反应较慢。'])]},
    cnn:{name:'卷积神经网络 (CNN)',desc:'对电压–电流时间窗口做局部卷积特征提取，适合捕捉脉冲和短时动态。',f1:'zₖ = Conv([V,I]ₖ₋ᴡ₊₁:ₖ)',f2:'SOĈₖ = fθ(zₖ)',params:[commonInitial,p('window','输入窗口',3,31,2,9,'sample',['参与卷积的最近样本数。','增大：动态上下文更多但滞后增大。','减小：响应更快但动态特征更少。']),p('dataGain','学习模型校正增益',.01,1,.01,.18,'',['卷积特征映射的更新强度。','增大：跟踪更快。','减小：更平滑。'])]},
    rnn:{name:'循环神经网络 (RNN)',desc:'通过隐状态递归记忆历史电压与电流，用于序列 SOC 回归。',f1:'hₖ = tanh(Wₓxₖ + Wₕhₖ₋₁+b)',f2:'SOĈₖ = Wₒhₖ+bₒ',params:[commonInitial,p('memory','循环记忆系数',0,.999,.001,.94,'',['历史隐状态的保留程度。','增大：长时记忆更强但适应突变更慢。','减小：更关注最近样本。']),p('dataGain','学习模型校正增益',.01,1,.01,.14,'',['递归输出对 SOC 的更新强度。','增大：跟踪更快。','减小：更平滑。'])]},
    lstm:{name:'长短期记忆网络 (LSTM)',desc:'用输入、遗忘和输出门管理长时依赖，减轻普通 RNN 的长期梯度问题。',f1:'cₖ = fₖ⊙cₖ₋₁ + iₖ⊙gₖ',f2:'SOĈₖ = Wₒ(oₖ⊙tanh(cₖ))+bₒ',params:[commonInitial,p('memory','记忆保留系数',0,.999,.001,.95,'',['单元状态的时间记忆强度。','增大：长期趋势更稳定。','减小：对新工况响应更快。']),p('gateBias','门控偏置',-2,2,.05,.35,'',['控制遗忘门与输入门的平衡。','增大：保留更多记忆。','减小：更快接受新测量。']),p('dataGain','学习模型校正增益',.005,1,.005,.02,'',['门控输出对 SOC 的更新强度。','增大：跟踪更快。','减小：更平滑。'])]}
  }},
  hybrid:{label:'混合与联合估计',items:{
    ccocv:{name:'安时积分–OCV 融合',desc:'在安时积分连续性基础上，用补偿电压查表结果抑制长期漂移。',f1:'SOC⁻ₖ = SOCₖ₋₁ − ηIₖΔt / Qₙ',f2:'SOCₖ = SOC⁻ₖ + K(SOC_OCV − SOC⁻ₖ)',params:[commonInitial,p('correctionGain','OCV 校正增益',0,1,.01,.025,'',['OCV 查表结果的融合权重。','增大：漂移修正更快但模型误差影响增加。','减小：轨迹更接近纯安时积分。']),restThreshold]},
    dekf:{name:'双 EKF 联合 SOC–容量估计',desc:'以两个耦合估计通道在不同时标联合跟踪 SOC 与可用容量。',f1:'[SOC,Q]ₖ⁻ = f([SOC,Q]ₖ₋₁,Iₖ)',f2:'[SOC,Q]ₖ = [SOC,Q]ₖ⁻ + Kₖνₖ',params:[commonInitial,qSoc,rVoltage,p0,p('parameterQ','容量过程噪声 Qθ',1e-8,.001,1e-8,.00002,'Ah²',['慢变可用容量的随机游走方差。','增大：更快适应容量衰减但波动增加。','减小：容量轨迹更稳定但适应更慢。'])]},
    ekfann:{name:'EKF–ANN 残差融合',desc:'由 EKF 提供可解释的状态估计，ANN 学习端电压创新中的系统性残差。',f1:'SOĈₖ = SOĈ_EKF,ₖ + w fθ(νₖ,Iₖ)',f2:'νₖ = Vₖ − V̂_EKF,ₖ',params:[commonInitial,qSoc,rVoltage,p0,p('fusionWeight','神经网络残差权重',0,1,.01,.12,'',['ANN 残差校正加到 EKF 结果的权重。','增大：模型偏差修正更强但更依赖训练域。','减小：行为更接近物理 EKF。'])]}
  }}
};

const algorithmEnglish = {
  conventional:{label:'Conventional / Open-loop',items:{cc:{name:'Coulomb Counting',desc:'Integrates measured current; simple, but initial-SOC, capacity, and current-bias errors accumulate.',f2:'Open-loop estimate: no terminal-voltage feedback'},ocv:{name:'OCV Lookup',desc:'Infers SOC directly from filtered terminal voltage and the measured SOC–OCV lookup curve.'}}},
  bayesian:{label:'Model-based Bayesian Filters',items:{
    kf:{name:'Kalman Filter (KF)',desc:'Uses a fixed linear OCV–SOC measurement model. It is efficient but biased in flat and strongly nonlinear regions.'},
    ekf:{name:'Extended Kalman Filter (EKF)',desc:'Locally linearizes the nonlinear terminal-voltage equation using the OCV–SOC Jacobian.'},
    ukf:{name:'Unscented Kalman Filter (UKF)',desc:'Propagates sigma points through the nonlinear model without an explicit Jacobian.'},
    aekf:{name:'Adaptive EKF (AEKF)',desc:'Adapts measurement-noise covariance online from the innovation sequence.'},
    pf:{name:'Particle Filter (PF)',desc:'Approximates the SOC posterior with weighted particles and supports non-Gaussian noise and strong nonlinearity.'}
  }},
  observer:{label:'State Observers',items:{
    luenberger:{name:'Luenberger State Observer',desc:'Combines coulomb-counting prediction with linear terminal-voltage residual feedback.'},
    nonlinear:{name:'Nonlinear Observer',desc:'Retains the nonlinear OCV–SOC relation and applies a bounded nonlinear innovation correction.'},
    smo:{name:'Sliding-Mode Observer (SMO)',desc:'Uses a saturated switching correction to reject model uncertainty; excessive gain can cause chattering.'},
    highgain:{name:'High-Gain Observer (HGO)',desc:'Uses strong innovation feedback for rapid convergence, at the cost of greater noise and plateau-region sensitivity.'}
  }},
  dataDriven:{label:'Data-driven Methods',items:{
    ann:{name:'Artificial Neural Network (ANN)',desc:'Regresses SOC from voltage, current, and SOH features through a static nonlinear mapping.'},
    cnn:{name:'Convolutional Neural Network (CNN)',desc:'Extracts local features from a voltage–current time window to capture pulses and short-term dynamics.'},
    rnn:{name:'Recurrent Neural Network (RNN)',desc:'Carries a recurrent hidden state to encode voltage–current history for sequential SOC regression.'},
    lstm:{name:'Long Short-Term Memory (LSTM)',desc:'Uses input, forget, and output gates to preserve long-term dependencies more effectively than a basic RNN.'}
  }},
  hybrid:{label:'Hybrid / Joint Estimation',items:{
    ccocv:{name:'Coulomb Counting–OCV Fusion',desc:'Combines continuous coulomb counting with low-current OCV correction to suppress long-term drift.'},
    dekf:{name:'Dual EKF SOC–Capacity Estimation',desc:'Uses coupled estimators on different time scales to jointly track SOC and usable capacity.'},
    ekfann:{name:'EKF–ANN Residual Fusion',desc:'Uses an interpretable EKF state estimate and a neural residual model to compensate systematic voltage-model error.'}
  }}
};

const implementationEvidence = {
  cc:{level:'equation',sources:[],zh:'标准安时积分方程；无论文专属参数。',en:'Standard coulomb-counting equation; no paper-specific parameter set.'},
  ocv:{level:'equation',sources:[],zh:'基于当前电芯实测 OCV 表的查表实现。',en:'Lookup implementation using the current cell’s measured OCV table.'},
  kf:{level:'reduced',sources:['huang2018'],zh:'一维线性化 SOC 滤波器；不是任何论文的完整电池状态模型。',en:'Reduced scalar linearized SOC filter; not a complete paper battery-state model.'},
  ekf:{level:'reduced',sources:['huang2018','guo2023'],zh:'保留 OCV 雅可比和协方差更新，但把论文常见的多状态 RC 模型降为一维 SOC + 公共极化补偿。',en:'Retains OCV Jacobian and covariance updates but reduces common multi-state RC models to scalar SOC plus shared polarization compensation.'},
  ukf:{level:'reduced',sources:['huang2018','guo2023','lv2020'],zh:'一维 Sigma 点 UKF；保留无迹变换原理，不等同于论文的三状态/多状态实现。',en:'Scalar sigma-point UKF retaining the unscented-transform principle, not the papers’ three-state or multi-state implementation.'},
  aekf:{level:'reduced',sources:['lv2020'],zh:'用创新在线更新 R 的降阶 AEKF；没有复制论文完整自适应协方差算法。',en:'Reduced innovation-based R adaptation; it does not reproduce the paper’s full adaptive covariance algorithm.'},
  pf:{level:'reduced',sources:[],zh:'标量 bootstrap 粒子滤波，包含粒子传播、似然、ESS 与系统重采样。',en:'Scalar bootstrap particle filter with propagation, likelihood, ESS, and systematic resampling.'},
  luenberger:{level:'reduced',sources:[],zh:'教学型标量 Luenberger 残差反馈。',en:'Teaching-oriented scalar Luenberger residual feedback.'},
  nonlinear:{level:'reduced',sources:[],zh:'有界 tanh 创新项的代表性非线性观测器。',en:'Representative nonlinear observer with bounded tanh innovation.'},
  smo:{level:'reduced',sources:[],zh:'边界层饱和切换项的代表性 SMO。',en:'Representative SMO using a boundary-layer saturated switching term.'},
  highgain:{level:'reduced',sources:[],zh:'标量高增益创新反馈，未复制特定论文的多状态增益矩阵。',en:'Scalar high-gain innovation feedback without a paper-specific multi-state gain matrix.'},
  ann:{level:'surrogate',sources:[],zh:'没有训练网络与权重；当前仅为可交互的非线性特征代理。',en:'No trained network or weights are loaded; this is an interactive nonlinear-feature surrogate.'},
  cnn:{level:'surrogate',sources:['sung2022'],zh:'没有论文训练权重；当前用时间窗加权特征模拟局部卷积效应。',en:'No paper-trained weights are loaded; a weighted temporal window only mimics local convolutional context.'},
  rnn:{level:'surrogate',sources:['chemali2018'],zh:'没有训练权重；当前仅保留递归记忆的定性机制。',en:'No trained weights are loaded; only the qualitative recurrent-memory mechanism is represented.'},
  lstm:{level:'surrogate',sources:['chemali2018'],zh:'没有训练权重；当前门控记忆是浏览器代理，不能与论文 MAE 直接比较。',en:'No trained weights are loaded; the gated memory is a browser surrogate and cannot be compared directly with the paper MAE.'},
  ccocv:{level:'reduced',sources:[],zh:'安时积分 + 低电流 OCV 校正的透明融合规则。',en:'Transparent coulomb-counting plus low-current OCV-correction rule.'},
  dekf:{level:'reduced',sources:['duque2022'],zh:'与 Samsung 30T 论文同属 SOC–容量双估计思路，但本站是一维降阶耦合实现。',en:'Shares the SOC–capacity dual-estimation concept with the Samsung 30T paper, but uses a reduced coupled scalar implementation.'},
  ekfann:{level:'surrogate',sources:[],zh:'EKF 为物理骨架，ANN 残差没有经过数据训练，属于代理。',en:'The EKF is the physical backbone; the ANN residual is untrained and therefore a surrogate.'}
};

function evidenceLabel(level){
  const labels=language==='en'
    ?{equation:'Equation-level',reduced:'Reduced implementation',surrogate:'Browser surrogate',unavailable:'Unavailable'}
    :{equation:'方程级实现',reduced:'降阶实现',surrogate:'浏览器代理',unavailable:'不可复现'};
  return labels[level]||labels.unavailable;
}

function localizedAlgorithm(categoryKey, algorithmKey) {
  const original = algorithms[categoryKey].items[algorithmKey];
  if (language !== 'en') return original;
  return { ...original, ...(algorithmEnglish[categoryKey]?.items?.[algorithmKey] || {}) };
}

const modelDefs = [
  p('initialSoc','电芯初始 SOC',0,100,1,100,'%', ['仿真电芯在 t=0 时的真实 SOC。','增大：整个测试从更高荷电状态开始。','减小：更早进入低 SOC 非线性区域；0% 可用于完整恒流充电测试。']),
  p('duration','运行时间',60,108000,60,14400,'s',['仿真总时长和图 C/D 的时间轴范围，最大可设置为 30 h，可覆盖站内最大容量电芯在 0.2 A 下的完整放电。','增大：可以观察完整 HPPC 阶跃序列和长期 SOC 漂移。','减小：运行更快，但大容量电芯的 SOC 轨迹可能近似平直。']),
  p('chargeCurrent','充电电流',0.1,5,0.05,0.55,'A',['充电电流幅值；模型内部使用负号表示充电。','增大：充电 SOC 上升更快，极化更明显。','减小：曲线更接近准静态。']),
  p('dischargeCurrent','放电电流',0.1,10,0.05,0.2,'A',['放电电流幅值；HPPC、UDDS 和 DST 也按此参数缩放。','增大：SOC 下降更快、动态激励更强。','减小：SOC 下降和动态激励减弱。'])
];

let language = 'en';
let category = 'conventional', algorithm = 'cc', chemistry = 'lfp', datasetKey = 'lfpA123', ocvDataset = null, ocvCurves = new Map(), result = null, cursor = 0, timer = null, playhead = 0, previousFrameTime = 0, simulationBusy = false;
const datasets = new Map();
const datasetCatalog = {
  lfp: [{key:'lfpA123',label:'A123 Cell6a · LFP'}],
  nca: [{key:'nca30t',label:'Samsung 30T · NCA'},{key:'stanfordDynamic',label:'Stanford Cell 034 · NCA/SiOx'}],
  nmc: [{key:'stanfordM50t',label:'Stanford LG M50T W8 · NMC811'}],
  ncoLco: [{key:'oxfordKokam',label:'Oxford Kokam Cell1 · NCO/LCO'}]
};
let experimentMode = 'unified';
const benchmarkSettings = {
  seed: 20261028,
  sampleInterval: 1,
  initialEstimate: 100,
  efficiency: .995,
  currentNoiseStd: .004,
  voltageNoiseStd: .0025,
  currentBias: 0,
  capacityScale: 1,
  r0Scale: 1,
  rpScale: 1,
  tauScale: 1
};
let sharedStreamCache = null;
const benchmarkBindings = {
  benchmarkSeed: ['seed',0,4294967295], benchmarkDt: ['sampleInterval',1,10], benchmarkInitial: ['initialEstimate',0,100],
  benchmarkEta: ['efficiency',.9,1.02], benchmarkCurrentNoise: ['currentNoiseStd',0,1], benchmarkVoltageNoise: ['voltageNoiseStd',0,.05],
  benchmarkCurrentBias: ['currentBias',-.15,.15], benchmarkCapacityScale: ['capacityScale',.5,1.1], benchmarkR0Scale: ['r0Scale',.5,2],
  benchmarkRpScale: ['rpScale',.5,2], benchmarkTauScale: ['tauScale',.5,2]
};
let modelValues = Object.fromEntries(modelDefs.map(x => [x.key, x.value]));
let algorithmValues = {};

function syncBenchmarkOverrides(){
  const overridden=experimentMode==='unified'?new Set(['initialEstimate','efficiency','currentBias']):new Set();
  const commonValues={initialEstimate:benchmarkSettings.initialEstimate,efficiency:benchmarkSettings.efficiency,currentBias:benchmarkSettings.currentBias};
  const defs=algorithms[category]?.items[algorithm]?.params||[];
  document.querySelectorAll('#algorithmParameters input[data-param]').forEach(input=>{
    const key=input.dataset.param,disabled=overridden.has(key);input.disabled=disabled;
    input.title=disabled?(language==='en'?'Controlled by the common unified-benchmark setting':'由论文统一基准中的公共设置控制'):'';
    if(disabled){
      const value=commonValues[key],def=defs.find(item=>item.key===key);
      input.value=value;
      const out=document.querySelector(`#algorithmParameters #out-${CSS.escape(key)}`);
      if(out&&def)out.textContent=format(value,def.step,def.unit);
    }
  });
}
function renderBenchmarkEvidence(){
  const panel=$('benchmarkPanel');if(!panel)return;
  panel.hidden=experimentMode!=='unified';
  if(experimentMode!=='unified')return;
  const datasetName=ocvDataset?.cell||ocvDataset?.title||ocvDataset?.dataset||datasetKey;
  const samples=Math.ceil(modelValues.duration/benchmarkSettings.sampleInterval)+1;
  const nonstandard=benchmarkSettings.sampleInterval!==1;
  const particleOps=algorithm==='pf'?samples*Math.round(algorithmValues.pf?.particles??300):0;
  $('benchmarkStatus').textContent=language==='en'
    ?`One cached input stream is shared by every algorithm: seed ${benchmarkSettings.seed}, Δt ${benchmarkSettings.sampleInterval} s, approximately ${samples.toLocaleString()} samples.${nonstandard?' This is a down-sampled sensitivity run; the standard is 1 s.':''}${particleOps?` PF will perform about ${particleOps.toLocaleString()} particle updates.`:''}`
    :`所有算法共用同一条缓存输入流：种子 ${benchmarkSettings.seed}，Δt=${benchmarkSettings.sampleInterval} s，约 ${samples.toLocaleString()} 个采样点。${nonstandard?' 当前属于降采样敏感性实验；标准设置为 1 s。':''}${particleOps?` PF 预计进行约 ${particleOps.toLocaleString()} 次粒子更新。`:''}`;
  $('benchmarkEvidence').innerHTML=language==='en'
    ?`<p><strong>Fairness:</strong> identical time stamps, commanded/measured current, terminal voltage, true SOC, initial estimate, sensor noise, and model-mismatch ratios are supplied to all methods. No algorithm-specific disturbance is injected.</p><p><strong>Metrics:</strong> maximum error, RMS, mean, and MSE use the raw estimator output. A 0–100% value is retained only for plotting, and never replaces the raw value in a metric or CSV.</p><p><strong>Dataset basis:</strong> ${datasetName}. Measured multi-SOH OCV/capacity curves are used; the dynamic current/voltage record is generated by the disclosed common simulator.</p><p class="status-warning"><strong>Not an exact paper reproduction:</strong> the source papers do not provide one common set of Q/R/P₀, equivalent-circuit parameters, sensor-error statistics, preprocessing, and trained weights for all methods. Data-driven methods without loaded author weights remain surrogates.</p>`
    :`<p><strong>公平性：</strong>所有方法使用完全相同的时间戳、指令/测量电流、端电压、真实 SOC、统一估计初值、传感器噪声与模型失配比例，不会对某个算法单独注入扰动。</p><p><strong>指标：</strong>最大误差、RMS、平均值和 MSE 均使用估计器原始输出；0–100% 限幅值只用于绘图，绝不会替换指标或 CSV 中的原始值。</p><p><strong>数据依据：</strong>${datasetName}。网站读取其实测多 SOH OCV/容量曲线；动态电流与电压由已披露的公共仿真器生成。</p><p class="status-warning"><strong>并非逐篇论文完全复现：</strong>来源论文没有同时报告所有方法共用的 Q/R/P₀、等效电路参数、传感器误差统计、预处理及训练权重。未加载作者权重的数据驱动方法仍是代理实现。</p>`;
  syncBenchmarkOverrides();
  renderBenchmarkInfo();
}

function datasetNativeCondition(){
  const conditions={
    lfpA123:{zh:'A123 Cell6a：50 °C 周期检查，C/25 充放电 pOCV；数据论文是老化数据论文，不包含本站全部 SOC 算法参数。',en:'A123 Cell6a: 50 °C periodic check-ups with C/25 charge/discharge pOCV; the source is an ageing-data paper and does not specify all site estimator parameters.'},
    nca30t:{zh:'Samsung 30T：25 °C，重复 C/20 OCV/容量诊断；Duque 2022 DEKF 与该数据直接关联。',en:'Samsung 30T: 25 °C with repeated C/20 OCV/capacity diagnostics; the Duque 2022 DEKF paper is directly associated with this dataset.'},
    stanfordDynamic:{zh:'Stanford Cell 034：35 °C，周期 C/40 诊断与 HPPC；来源论文研究动态循环寿命，并非 SOC 算法对比。',en:'Stanford Cell 034: 35 °C periodic C/40 diagnostics and HPPC; the source paper studies dynamic-cycling lifetime rather than SOC-algorithm comparison.'},
    stanfordM50t:{zh:'LG M50T W8：23 °C，周期容量、HPPC 与 EIS 诊断；本站图 B 使用 C/20 放电 OCV，来源论文是老化数据论文。',en:'LG M50T W8: 23 °C periodic capacity, HPPC, and EIS diagnostics; Figure B uses C/20 discharge OCV from an ageing-data paper.'},
    oxfordKokam:{zh:'Oxford Kokam Cell1：40 °C，每 100 个 Artemis 循环做约 C/18.5 的 pOCV 检查；来源为老化数据集。',en:'Oxford Kokam Cell1: 40 °C, about C/18.5 pOCV check-ups every 100 Artemis cycles; the source is an ageing dataset.'}
  };
  return conditions[datasetKey]?.[language]||datasetKey;
}

function renderBenchmarkInfo(){
  const root=$('benchmarkInfoContent');if(!root)return;
  const english=language==='en',current=implementationEvidence[algorithm]||{level:'unavailable',sources:[],zh:'没有实现证据说明。',en:'No implementation evidence is available.'};
  const currentName=localizedAlgorithm(category,algorithm).name;
  const allMethods=Object.entries(algorithms).flatMap(([categoryKey,group])=>Object.keys(group.items).map(key=>({category:language==='en'?(algorithmEnglish[categoryKey]?.label||group.label):group.label,key,name:localizedAlgorithm(categoryKey,key).name,evidence:implementationEvidence[key]||{level:'unavailable',zh:'未说明',en:'Undocumented'}})));
  const methodRows=allMethods.map(item=>`<tr><td>${item.category}</td><td>${item.name}</td><td><span class="evidence-badge evidence-${item.evidence.level}">${evidenceLabel(item.evidence.level)}</span></td><td>${english?item.evidence.en:item.evidence.zh}</td></tr>`).join('');
  const paperRows=Object.values(paperConfigurationSources).map(source=>`<tr><td><a href="${source.url}" target="_blank" rel="noreferrer">${source.title}</a></td><td>${source.methods}</td><td>${source.cell}</td><td>${english?source.protocolEn:source.protocolZh}</td><td>${english?source.missingEn:source.missingZh}</td></tr>`).join('');
  const protocolRows=english?[
    ['Input stream',`Common seeded stream; seed ${benchmarkSettings.seed}`,'Identical command/measured current, voltage, true SOC, and timestamps for every algorithm.'],
    ['Sampling','1 s (fixed research standard)','The unified research benchmark is fixed at 1 s; the teaching mode alone may use a coarser step for long runs.'],
    ['Sensor model',`σI=${benchmarkSettings.currentNoiseStd} A, σV=${benchmarkSettings.voltageNoiseStd} V, current bias=${benchmarkSettings.currentBias} A`,'Seeded Gaussian white noise plus the disclosed common current bias.'],
    ['Filter baseline','Q=1×10⁻⁷, R=6.3×10⁻⁶ V², P₀=1×10⁻³','A common, interpretable baseline derived from published covariance orders and the 2.5 mV sensor-noise setting; it is not outcome-tuned per algorithm.'],
    ['Plant / estimator mismatch',`Q/Qnew=${benchmarkSettings.capacityScale}, R₀×${benchmarkSettings.r0Scale}, Rₚ×${benchmarkSettings.rpScale}, τ×${benchmarkSettings.tauScale}`,'One common mismatch setting; never changed by algorithm.'],
    ['Error metrics','Raw estimator SOC','No global 0–100% clamp and no 2% threshold replacement. The graph alone uses a bounded display trace.'],
    ['CC cut-off','Stop at first 0% / 100% boundary','Prevents post-cut-off integration from creating artificial errors.']
  ]:[
    ['输入流',`公共固定种子流；种子 ${benchmarkSettings.seed}`,'每个算法获得相同的指令/测量电流、端电压、真实 SOC 与时间戳。'],
    ['采样','1 s（论文式基准固定值）','论文式统一基准固定为 1 s；只有教学演示模式会在长时运行中使用更大步长。'],
    ['传感器模型',`σI=${benchmarkSettings.currentNoiseStd} A，σV=${benchmarkSettings.voltageNoiseStd} V，电流偏置=${benchmarkSettings.currentBias} A`,'固定种子的高斯白噪声 + 已披露的公共电流偏置。'],
    ['滤波公共基线','Q=1×10⁻⁷，R=6.3×10⁻⁶ V²，P₀=1×10⁻³','依据公开协方差量级和 2.5 mV 传感器噪声设定的可解释公共起点，不按算法结果单独调参。'],
    ['对象/估计器失配',`Q/Qnew=${benchmarkSettings.capacityScale}，R₀×${benchmarkSettings.r0Scale}，Rₚ×${benchmarkSettings.rpScale}，τ×${benchmarkSettings.tauScale}`,'所有算法共用，绝不按算法修改。'],
    ['误差指标','估计器原始 SOC','不做全局 0–100% 截断，也不做 2% 阈值替换；仅绘图保留限幅显示轨迹。'],
    ['恒流截止','首次到达 0% / 100% 时结束','避免截止后继续积分制造虚假误差。']
  ];
  $('benchmarkInfoSubtitle').textContent=english?`${currentName} · ${evidenceLabel(current.level)}`:`${currentName} · ${evidenceLabel(current.level)}`;
  root.innerHTML=`
    <p class="benchmark-protocol-note"><strong>${english?'Scope':'范围'}：</strong>${english?'This is a transparent, common research-style benchmark—not a claim of sample-exact reproduction of every cited paper.':'这是透明、统一的论文式对比基准，不声称逐样本复现每一篇引用论文。'} ${datasetNativeCondition()}</p>
    <section class="benchmark-info-section"><h3>${english?'Common benchmark protocol':'公共基准协议'}</h3><div class="benchmark-table-wrap"><table class="benchmark-table"><thead><tr><th>${english?'Item':'项目'}</th><th>${english?'Current value':'当前值'}</th><th>${english?'Rule / interpretation':'规则与解释'}</th></tr></thead><tbody>${protocolRows.map(row=>`<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="benchmark-info-section"><h3>${english?'Implementation evidence audit':'算法实现证据审计'}</h3><div class="benchmark-table-wrap"><table class="benchmark-table"><thead><tr><th>${english?'Class':'类别'}</th><th>${english?'Method':'方法'}</th><th>${english?'Evidence level':'证据等级'}</th><th>${english?'What is implemented':'本站实现'}</th></tr></thead><tbody>${methodRows}</tbody></table></div></section>
    <section class="benchmark-info-section"><h3>${english?'Published configurations used as references':'参考的论文配置'}</h3><div class="benchmark-table-wrap"><table class="benchmark-table"><thead><tr><th>${english?'Paper':'论文'}</th><th>${english?'Method':'方法'}</th><th>${english?'Cell / data':'电芯/数据'}</th><th>${english?'Published configuration':'论文公开配置'}</th><th>${english?'Missing / non-transferable':'缺失或不可直接移植项'}</th></tr></thead><tbody>${paperRows}</tbody></table></div></section>
    <div class="benchmark-downloads"><a href="./data/research_benchmark_protocol.json" target="_blank" rel="noreferrer">JSON protocol</a><a href="./data/research_benchmark_protocol.md" target="_blank" rel="noreferrer">Readable protocol</a></div>`;
}
function setExperimentMode(value){
  experimentMode=value==='unified'?'unified':'teaching';
  $('experimentModeSelect').value=experimentMode;sharedStreamCache=null;renderBenchmarkEvidence();syncBenchmarkOverrides();invalidate();
}

function format(v, step, unit='') {
  if (Math.abs(v) > 0 && Math.abs(v) < .0001) return `${Number(v).toExponential(2)}${unit ? ' ' + unit : ''}`;
  const digits = step < .001 ? 6 : step < .01 ? 4 : step < .1 ? 2 : step < 1 ? 2 : 0;
  return `${Number(v).toFixed(digits)}${unit ? ' ' + unit : ''}`;
}
function control(def, scope) {
  def=localizeDef(def);
  const value = scope[def.key] ?? def.value; scope[def.key] = Number(value);
  const valueLabel=language==='en'?`${def.label} value`:`${def.label}数值输入`;
  return `<label class="parameter"><span><b>${def.label}</b><output id="out-${def.key}">${format(value,def.step,def.unit)}</output></span><span class="range-number-row"><input data-param="${def.key}" data-role="range" type="range" min="${def.min}" max="${def.max}" step="${def.step}" value="${value}"><span class="number-entry${def.unit ? ' has-unit' : ''}"><input data-param="${def.key}" data-role="number" type="number" min="${def.min}" max="${def.max}" step="${def.step}" value="${value}" inputmode="decimal" aria-label="${valueLabel}">${def.unit ? `<small>${def.unit}</small>` : ''}</span></span></label>`;
}
function quantizeParameter(raw, def) {
  const bounded=clamp(raw,def.min,def.max);
  const snapped=def.min+Math.round((bounded-def.min)/def.step)*def.step;
  return clamp(Number(snapped.toPrecision(15)),def.min,def.max);
}
function bindControls(root, scope) {
  root.querySelectorAll('input[data-param]').forEach(input => input.addEventListener('input', () => {
    const key=input.dataset.param, def=[...modelDefs,...algorithms[category].items[algorithm].params].find(x=>x.key===key), raw=Number(input.value);
    if(!Number.isFinite(raw)) return;
    const value=quantizeParameter(raw,def); scope[key]=value;
    root.querySelectorAll(`input[data-param="${CSS.escape(key)}"]`).forEach(peer=>{if(peer!==input)peer.value=value});
    const out=root.querySelector(`#out-${CSS.escape(key)}`); if(out) out.textContent=format(value,def.step,def.unit);
    if(key==='duration') $('timeline').max=Math.round(value);
    invalidate();
  }));
  root.querySelectorAll('input[data-role="number"]').forEach(input=>input.addEventListener('change',()=>{
    const key=input.dataset.param, def=[...modelDefs,...algorithms[category].items[algorithm].params].find(x=>x.key===key);
    if(!Number.isFinite(Number(input.value))) input.value=scope[key]; else input.value=quantizeParameter(Number(input.value),def);
  }));
}
function renderModelControls(){ $('modelParameters').innerHTML = modelDefs.map(d=>control(d,modelValues)).join(''); bindControls($('modelParameters'),modelValues); }
function renderAlgorithmControls(reset=false){
  const defs=algorithms[category].items[algorithm].params; if(reset || !algorithmValues[algorithm]) algorithmValues[algorithm]=Object.fromEntries(defs.map(d=>[d.key,d.value]));
  $('algorithmParameters').innerHTML=defs.map(d=>control(d,algorithmValues[algorithm])).join(''); bindControls($('algorithmParameters'),algorithmValues[algorithm]);syncBenchmarkOverrides();
}
function renderCategories(){
  $('algorithmCategory').innerHTML=Object.entries(algorithms).map(([k,v])=>`<option value="${k}">${language==='en'?(algorithmEnglish[k]?.label||v.label):v.label}</option>`).join(''); $('algorithmCategory').value=category; renderAlgorithmOptions();
}
function renderAlgorithmOptions(){
  const items=algorithms[category].items; if(!items[algorithm]) algorithm=Object.keys(items)[0]; $('algorithmSelect').innerHTML=Object.keys(items).map(k=>`<option value="${k}">${localizedAlgorithm(category,k).name}</option>`).join(''); $('algorithmSelect').value=algorithm; updateAlgorithmText(); renderAlgorithmControls();
}
function updateAlgorithmText(){ const a=localizedAlgorithm(category,algorithm); $('algorithmDescription').textContent=a.desc; $('formulaOne').textContent=a.f1; $('formulaTwo').textContent=a.f2; $('runButtonLabel').textContent=language==='en'?`Run ${a.name}`:`运行 ${a.name.split(' (')[0]}`; }
function applyLanguage(){
  document.documentElement.lang=language==='zh'?'zh-CN':'en';
  document.querySelectorAll('[data-i18n]').forEach(el=>{const v=tr(el.dataset.i18n);if(v)el.textContent=v});
  $('languageToggle').classList.toggle('english-active',language==='en');
  $('toast').classList.remove('show');
  const english=language==='en';
  if($('benchmarkDt'))$('benchmarkDt').title=english?'The unified research benchmark is fixed at 1 s':'论文式统一基准固定为 1 s';
  const aria=english?{
    brand:'Back to top',category:'Algorithm category',algorithm:'Specific SOC estimation algorithm',panel:'SOC estimator parameter settings',batteryInfo:'View battery chemistries and data sources',benchmarkInfo:'View paper configurations and reproduction boundary',dataset:'Data source',soh:'SOH numeric input',system:'SOC test system with a cell, controller, current sensor, and voltage sensor',ocv:'SOC–OCV curves at different SOH levels',current:'Battery current versus time',result:'True SOC, estimated SOC, and estimation error versus time',playback:'Animation playback controls',speed:'Playback speed',previous:'Previous time step',play:'Play or pause',next:'Next time step',timeline:'Run-time progress',batteryClose:'Close battery information',guideClose:'Close parameter guide',benchmarkClose:'Close paper-configuration information'
  }:{
    brand:'回到顶部',category:'算法类别',algorithm:'具体 SOC 估计算法',panel:'SOC 算法参数设置',batteryInfo:'查看电池类型和数据来源',benchmarkInfo:'查看论文配置与复现边界',dataset:'数据源',soh:'SOH 数值输入',system:'由电芯、控制板、电流传感器和电压传感器组成的 SOC 测试系统',ocv:'不同 SOH 下的 SOC-OCV 曲线',current:'电池电流随时间变化曲线',result:'真实 SOC、估计 SOC 与估计误差随时间变化曲线',playback:'动画播放控制',speed:'播放速度',previous:'上一个时间步',play:'播放或暂停',next:'下一个时间步',timeline:'运行时间进度',batteryClose:'关闭电池信息',guideClose:'关闭参数解释',benchmarkClose:'关闭论文配置说明'
  };
  [['.brand','brand'],['algorithmCategory','category'],['algorithmSelect','algorithm'],['controlPanel','panel'],['batteryInfoButton','batteryInfo'],['benchmarkInfoButton','benchmarkInfo'],['datasetSelect','dataset'],['sohNumber','soh'],['systemChart','system'],['ocvChart','ocv'],['socChart','current'],['errorChart','result'],['.playback','playback'],['speed','speed'],['previousButton','previous'],['playButton','play'],['nextButton','next'],['timeline','timeline'],['batteryInfoClose','batteryClose'],['parameterHelpClose','guideClose'],['benchmarkInfoClose','benchmarkClose']].forEach(([target,key])=>{
    const element=target.startsWith('.')?document.querySelector(target):$(target);
    if(element)element.setAttribute('aria-label',aria[key]);
  });
  renderCategories();renderModelControls();renderDatasetOptions(datasetKey);renderBatteryInfo();renderBenchmarkEvidence();
  if(result)updateFrame();else drawAll();
}

function renderDatasetOptions(preferred){
  chemistry=$('chemistrySelect').value;
  const options=datasetCatalog[chemistry]||[];
  $('datasetSelect').innerHTML=options.map(item=>`<option value="${item.key}">${item.label}</option>`).join('');
  datasetKey=options.some(item=>item.key===preferred)?preferred:options[0]?.key;
  $('datasetSelect').value=datasetKey;
}
function activateDataset(key){
  datasetKey=key;ocvDataset=datasets.get(key)||null;ocvCurves=new Map((ocvDataset?.curves||[]).map(curve=>[curve.targetSoh,curve]));
  const levels=[...ocvCurves.keys()],minimum=ocvDataset?.supportedSohMin??(levels.length?Math.min(...levels):60);
  if(Number($('sohSlider').value)<minimum)setSoh(minimum,true);
  sharedStreamCache=null;renderBenchmarkEvidence();drawAll();
}
async function loadCurve(){
  try{
    const [lfp,nca,stanford,dynamic,oxford]=await Promise.all(['./data/a123_cell6a_measured_pocv.json','./data/samsung30t_cc_measured_pocv.json','./data/stanford_m50t_w8_measured_ocv.json','./data/stanford_dynamic_cell034_measured_pocv.json','./data/oxford_kokam_cell1_measured_pocv.json'].map(file=>fetch(file).then(r=>{if(!r.ok)throw Error(r.status);return r.json()})));
    datasets.set('lfpA123',lfp);datasets.set('nca30t',nca);datasets.set('stanfordM50t',stanford);datasets.set('stanfordDynamic',dynamic);datasets.set('oxfordKokam',oxford);renderDatasetOptions(datasetKey);activateDataset(datasetKey);
  }
  catch{
    ocvDataset=null;ocvCurves=new Map();
    showToast(language==='en'?'Measured pOCV data failed to load. Open the site through the local server.':'实测 pOCV 数据文件加载失败，请通过本地服务器访问');
  }
  drawAll();
}
function curveVoltage(curve,soc){
  if(!curve?.points?.length)return 3.3;
  const points=curve.points,value=clamp(soc,0,1);
  if(value<=points[0].soc)return points[0].ocv;
  if(value>=points.at(-1).soc)return points.at(-1).ocv;
  let lo=0,hi=points.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(value<=points[mid].soc)hi=mid;else lo=mid}
  const left=points[lo],right=points[hi];
  const a=right.soc===left.soc?0:(value-left.soc)/(right.soc-left.soc);return left.ocv*(1-a)+right.ocv*a;
}
function measuredOcv(soc,soh){
  if(!ocvCurves.size)return 3.3;
  if(ocvCurves.has(soh))return curveVoltage(ocvCurves.get(soh),soc);
  const levels=[...ocvCurves.keys()].sort((a,b)=>a-b),value=clamp(soh,levels[0],levels.at(-1));
  let lower=levels[0],upper=levels.at(-1);
  for(let i=1;i<levels.length;i++)if(value<=levels[i]){lower=levels[i-1];upper=levels[i];break}
  if(lower===upper)return curveVoltage(ocvCurves.get(lower),soc);
  const a=(value-lower)/(upper-lower);
  return curveVoltage(ocvCurves.get(lower),soc)*(1-a)+curveVoltage(ocvCurves.get(upper),soc)*a;
}
function baseOcv(soc){return measuredOcv(soc,100)}
function inverseOcv(v,soh=100){ let lo=0,hi=1;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(measuredOcv(m,soh)<v)lo=m;else hi=m}return (lo+hi)/2; }
function ocvSlope(soc){const e=.0025;return (baseOcv(clamp(soc+e,0,1))-baseOcv(clamp(soc-e,0,1)))/Math.max(1e-6,clamp(soc+e,0,1)-clamp(soc-e,0,1));}

function currentAt(t,profile){
  const charge=modelValues.chargeCurrent, discharge=modelValues.dischargeCurrent;
  if(profile==='ccCharge')return -charge;
  if(profile==='ccDischarge')return discharge;
  if(profile==='hppc'){
    // Repeating, time-scaled HPPC block: rest → discharge pulse → rest →
    // regenerative pulse → rest → SOC-reduction discharge → second pulse pair.
    const m=t%900;
    if(m<60)return 0;
    if(m<90)return discharge;
    if(m<150)return 0;
    if(m<180)return -charge*.75;
    if(m<300)return 0;
    if(m<660)return discharge*.35;
    if(m<720)return 0;
    if(m<750)return discharge*.75;
    if(m<810)return 0;
    if(m<840)return -charge*.5;
    return 0;
  }
  if(profile==='udds')return clamp(discharge*(.42+.38*Math.sin(t*.17)+.25*Math.sin(t*.053+1.7)+.18*Math.sin(t*.61)),-charge,discharge);
  return clamp(discharge*(.45*Math.sin(t*.11)+.34*Math.sin(t*.037+2)+.26*Math.sign(Math.sin(t*.021))),-charge,discharge);
}
function deterministicNoise(i,scale=1){return scale*(Math.sin(i*12.9898)*.55+Math.sin(i*4.1414+2)*.45);}
function simulationStep(duration){
  if(duration<=3600)return 1;
  if(duration<=14400)return 5;
  if(duration<=43200)return 10;
  return 20;
}
function makeRandom(seed=0x6d2b79f5){let state=seed>>>0;return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296}}
function normalRandom(random){const u=Math.max(1e-12,random()),v=random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function mixedUint32(seed,index,salt){let x=(Number(seed)>>>0)^Math.imul((index+1)>>>0,0x9e3779b1)^salt;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);return (x^(x>>>16))>>>0}
function seededNormalAt(index,std,seed,salt){if(!(std>0))return 0;const u=(mixedUint32(seed,index,salt)+1)/4294967297,v=(mixedUint32(seed,index,salt^0xa5a5a5a5)+1)/4294967297;return std*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function buildUnifiedStream({soh,profile,duration,dt,qTrue,rTrue,rpTrue,tauTrue}){
  const cacheKey=JSON.stringify({datasetKey,soh,profile,duration,dt,qTrue,rTrue,rpTrue,tauTrue,initialSoc:modelValues.initialSoc,charge:modelValues.chargeCurrent,discharge:modelValues.dischargeCurrent,seed:benchmarkSettings.seed,currentNoiseStd:benchmarkSettings.currentNoiseStd,voltageNoiseStd:benchmarkSettings.voltageNoiseStd,currentBias:benchmarkSettings.currentBias});
  if(sharedStreamCache?.key===cacheKey)return sharedStreamCache.rows;
  const timePoints=[];for(let t=0;t<duration;t+=dt)timePoints.push(t);timePoints.push(duration);
  const rows=[];let trueSoc=modelValues.initialSoc/100,polarization=0;
  for(let i=0;i<timePoints.length;i++){
    const t=timePoints[i],delta=i?timePoints[i]-timePoints[i-1]:0,commandedCurrent=currentAt(t,profile);
    let current=commandedCurrent;
    const atDischargeCutoff=profile==='ccDischarge'&&trueSoc<=1e-12,atChargeCutoff=profile==='ccCharge'&&trueSoc>=1-1e-12;
    if(atDischargeCutoff||atChargeCutoff)current=0;
    if(i>0){
      if((trueSoc<=0&&current>0)||(trueSoc>=1&&current<0))current=0;
      let proposed=trueSoc-current*delta/(qTrue*3600);
      if(proposed<0){current=trueSoc*qTrue*3600/delta;proposed=0}
      else if(proposed>1){current=-(1-trueSoc)*qTrue*3600/delta;proposed=1}
      trueSoc=proposed;
    }
    if(i>0)polarization=polarization*Math.exp(-delta/tauTrue)+current*rpTrue*(1-Math.exp(-delta/tauTrue));
    const measuredI=current+benchmarkSettings.currentBias+seededNormalAt(i,benchmarkSettings.currentNoiseStd,benchmarkSettings.seed,0x13579bdf);
    const voltage=measuredOcv(trueSoc,soh)-current*rTrue-polarization+seededNormalAt(i,benchmarkSettings.voltageNoiseStd,benchmarkSettings.seed,0x2468ace0);
    const cutoffReached=(profile==='ccDischarge'&&trueSoc<=1e-12)||(profile==='ccCharge'&&trueSoc>=1-1e-12);
    rows.push({t,delta,commandedCurrent,current,measuredI,voltage,trueSoc,polarization,terminationReason:cutoffReached?'soc_cutoff':null});
    if(cutoffReached)break;
  }
  sharedStreamCache={key:cacheKey,rows};return rows;
}
function simulate(){
  const soh=Number($('sohSlider').value), profile=$('profileSelect').value, a=algorithms[category].items[algorithm], av=algorithmValues[algorithm]||{}, duration=Math.round(modelValues.duration), unified=experimentMode==='unified', dt=unified?1:simulationStep(duration);
  const selectedCurve=ocvCurves.get(soh), referenceCurve=ocvCurves.get(100), nominalCapacity=referenceCurve?.dischargeCapacityAh??referenceCurve?.capacityAh??(chemistry==='lfp'?1.1:3);
  const qTrue=selectedCurve?.dischargeCapacityAh??selectedCurve?.capacityAh??nominalCapacity*soh/100, qAssumed=(referenceCurve?.dischargeCapacityAh??referenceCurve?.capacityAh??nominalCapacity)*(unified?benchmarkSettings.capacityScale:1), eta=unified?benchmarkSettings.efficiency:(av.efficiency??.995);
  const rNominal=chemistry==='lfp'?.032:.018,rTrue=rNominal*(1+(100-soh)/95),rpTrue=chemistry==='lfp'?.020:.013,tauTrue=chemistry==='lfp'?85:62,rModel=rNominal*(unified?benchmarkSettings.r0Scale:1),rpModel=rpTrue*(unified?benchmarkSettings.rpScale:1),tauModel=tauTrue*(unified?benchmarkSettings.tauScale:1);
  let trueSoc=modelValues.initialSoc/100, estSoc=(unified?benchmarkSettings.initialEstimate:(av.initialEstimate??modelValues.initialSoc))/100, filteredV=baseOcv(trueSoc),filteredCompV=baseOcv(trueSoc),filteredResidual=0,polarization=0,polarizationHat=0;
  const linearAnchorSoc=estSoc,linearAnchorV=baseOcv(linearAnchorSoc);
  let recurrentState=estSoc,lstmCell=estSoc;const featureHistory=[];
  let covariance=av.p0??.001, adaptiveR=av.rVoltage??.0000063, qEstimate=qAssumed;
  let p00=covariance,p01=0,p11=.25*qAssumed*qAssumed;
  const random=makeRandom(unified?((benchmarkSettings.seed>>>0)^0x51f15e):(0x51f15e+Math.round(soh)*97+algorithm.length*131)),particleCount=Math.round(av.particles??300);
  let particles=null,weights=null,particleScratch=null;
  if(algorithm==='pf'){
    particles=new Float64Array(particleCount);weights=new Float64Array(particleCount);particleScratch=new Float64Array(particleCount);
    const sigma=Math.min(.01,Math.sqrt(av.p0??.001)*.05);
    for(let j=0;j<particleCount;j++){particles[j]=clamp(estSoc+normalRandom(random)*sigma,-.05,1.05);weights[j]=1/particleCount}
  }
  const sharedRows=unified?buildUnifiedStream({soh,profile,duration,dt,qTrue,rTrue,rpTrue,tauTrue}):null;
  const rows=[];let cumulativeAbsError=0,cumulativeError=0,cumulativeSquaredError=0,minSoc=Infinity,maxSoc=-Infinity,maxError=0,hasDisplayClipping=false;
  const timePoints=sharedRows?sharedRows.map(row=>row.t):[];if(!sharedRows){for(let t=0;t<duration;t+=dt)timePoints.push(t);timePoints.push(duration)}
  for(let i=0;i<timePoints.length;i++){
    const shared=sharedRows?.[i],t=timePoints[i],delta=i?timePoints[i]-timePoints[i-1]:0,current=shared?.current??currentAt(t,profile),commandedCurrent=shared?.commandedCurrent??current,sensorBias=unified?benchmarkSettings.currentBias:(av.currentBias??0),measuredI=shared?.measuredI??(current+sensorBias+deterministicNoise(i,.004));
    if(shared){trueSoc=shared.trueSoc;polarization=shared.polarization}else if(i>0){trueSoc=clamp(trueSoc-current*delta/(qTrue*3600),0,1);polarization=polarization*Math.exp(-delta/tauTrue)+current*rpTrue*(1-Math.exp(-delta/tauTrue))}
    if(i>0)polarizationHat=polarizationHat*Math.exp(-delta/tauModel)+measuredI*rpModel*(1-Math.exp(-delta/tauModel));
    const voltage=shared?.voltage??(measuredOcv(trueSoc,soh)-current*rTrue-polarization+deterministicNoise(i,.0025));
    filteredV=(av.voltageFilter??.2)*voltage+(1-(av.voltageFilter??.2))*filteredV;
    const compensatedV=voltage+measuredI*rModel+polarizationHat;filteredCompV=(av.voltageFilter??.2)*compensatedV+(1-(av.voltageFilter??.2))*filteredCompV;
    const qNoise=(av.qSoc??.0000001)*Math.max(1,delta), rNoise=av.rVoltage??.0000063;
    if(i>0){
      if(algorithm==='ocv'){
        estSoc-=measuredI*delta/(qAssumed*3600);
        if(Math.abs(measuredI)<(av.restThreshold??.04))estSoc+=.05*(inverseOcv(filteredCompV,100)-estSoc);
      }else if(algorithm==='pf'){
        let weightSum=0,weightedSoc=0,effectiveDenominator=0;
        const sigma=Math.sqrt(qNoise),socDelta=eta*measuredI*delta/(qAssumed*3600),voltageDrop=measuredI*rModel+polarizationHat,inverseTwoR=.5/Math.max(1e-10,rNoise);
        for(let j=0;j<particleCount;j++){
          particles[j]=clamp(particles[j]-socDelta+normalRandom(random)*sigma,-.05,1.05);
          const innovation=voltage-(curveVoltage(referenceCurve,particles[j])-voltageDrop),likelihood=Math.exp(-innovation*innovation*inverseTwoR);
          weights[j]*=Math.max(1e-300,likelihood);weightSum+=weights[j];
        }
        if(!Number.isFinite(weightSum)||weightSum<=0){
          const uniform=1/particleCount;
          for(let j=0;j<particleCount;j++){weights[j]=uniform;weightedSoc+=particles[j]*uniform}
          effectiveDenominator=uniform;
        }else{
          const inverseWeightSum=1/weightSum;
          for(let j=0;j<particleCount;j++){const weight=weights[j]*inverseWeightSum;weights[j]=weight;weightedSoc+=particles[j]*weight;effectiveDenominator+=weight*weight}
        }
        estSoc=weightedSoc;const ess=1/Math.max(1e-12,effectiveDenominator);
        if(ess<particleCount*(av.resample??.5)){
          const step=1/particleCount,start=random()*step;let cumulative=weights[0],j=0;
          for(let k=0;k<particleCount;k++){const u=start+k*step;while(u>cumulative&&j<particleCount-1)cumulative+=weights[++j];particleScratch[k]=particles[j];weights[k]=step}
          const previous=particles;particles=particleScratch;particleScratch=previous;
        }
      }else if(algorithm==='kf'){
        estSoc-=eta*measuredI*delta/(qAssumed*3600);covariance+=qNoise;
        const h=Math.max(.05,ocvSlope(linearAnchorSoc)),predicted=linearAnchorV+h*(estSoc-linearAnchorSoc)-measuredI*rModel-polarizationHat,innovation=voltage-predicted,gain=(av.measurementWeight??.0002)*covariance*h/(h*h*covariance+rNoise);
        estSoc+=gain*innovation;covariance=Math.max(1e-10,(1-gain*h)*covariance);
      }else if(['ekf','aekf','ekfann'].includes(algorithm)){
        estSoc-=eta*measuredI*delta/(qAssumed*3600);covariance+=qNoise;
        const h=ocvSlope(estSoc),predicted=baseOcv(estSoc)-measuredI*rModel-polarizationHat,innovation=voltage-predicted;
        if(algorithm==='aekf'){const lambda=av.forgetting??.96;adaptiveR=clamp(lambda*adaptiveR+(1-lambda)*Math.max(1e-8,innovation*innovation),1e-8,.02)}
        const usedR=algorithm==='aekf'?adaptiveR:rNoise,gain=covariance*h/(h*h*covariance+usedR);
        estSoc+=gain*innovation;covariance=Math.max(1e-10,(1-gain*h)*covariance);
        if(algorithm==='ekfann')estSoc+=(av.fusionWeight??.12)*Math.tanh(innovation/.08)*.0007*Math.min(delta,5);
      }else if(algorithm==='ukf'){
        const alpha=av.alpha??.12,beta=av.beta??2,kappa=av.kappa??0,lambda=alpha*alpha*(1+kappa)-1,c=1+lambda;
        const spread=Math.sqrt(Math.max(1e-12,c*covariance)),sigma=[estSoc,estSoc+spread,estSoc-spread],wm=[lambda/c,1/(2*c),1/(2*c)],wc=[lambda/c+(1-alpha*alpha+beta),1/(2*c),1/(2*c)];
        const propagated=sigma.map(x=>x-eta*measuredI*delta/(qAssumed*3600)),mean=propagated.reduce((sum,x,j)=>sum+wm[j]*x,0);
        let predictedP=qNoise;for(let j=0;j<3;j++)predictedP+=wc[j]*(propagated[j]-mean)**2;
        const z=propagated.map(x=>baseOcv(x)-measuredI*rModel-polarizationHat),zMean=z.reduce((sum,x,j)=>sum+wm[j]*x,0);let s=rNoise,cross=0;
        for(let j=0;j<3;j++){s+=wc[j]*(z[j]-zMean)**2;cross+=wc[j]*(propagated[j]-mean)*(z[j]-zMean)}
        const gain=(av.measurementWeight??.0002)*cross/Math.max(1e-12,s);estSoc=mean+gain*(voltage-zMean);covariance=Math.max(1e-10,predictedP-gain*cross);
      }else if(algorithm==='dekf'){
        const qSafe=Math.max(.35*qAssumed,qEstimate),f01=eta*measuredI*delta/(qSafe*qSafe*3600),xPred=estSoc-eta*measuredI*delta/(qSafe*3600);
        const old00=p00,old01=p01,old11=p11;p00=old00+2*f01*old01+f01*f01*old11+qNoise;p01=old01+f01*old11;p11=old11+(av.parameterQ??.00005)*Math.max(1,delta);
        const h=ocvSlope(xPred),innovation=voltage-(baseOcv(xPred)-measuredI*rModel-polarizationHat),s=Math.max(1e-12,h*h*p00+rNoise),k0=p00*h/s,k1=p01*h/s,prior01=p01;
        estSoc=xPred+k0*innovation;qEstimate=clamp(qEstimate+k1*innovation,.45*qAssumed,1.1*qAssumed);p00=Math.max(1e-10,(1-k0*h)*p00);p01=(1-k0*h)*p01;p11=Math.max(1e-10,p11-k1*h*prior01);
      }else{
        estSoc-=eta*measuredI*delta/(qAssumed*3600);
        const predicted=baseOcv(estSoc)-measuredI*rModel-polarizationHat,residual=voltage-predicted;
        const measuredFeature=clamp(inverseOcv(compensatedV,100),-.05,1.05);
        featureHistory.push(measuredFeature);if(featureHistory.length>31)featureHistory.shift();
        if(algorithm==='ccocv'&&Math.abs(measuredI)<(av.restThreshold??.04))estSoc+=(av.correctionGain??.025)*(inverseOcv(filteredCompV,100)-estSoc);
        else if(algorithm==='luenberger'){filteredResidual=(av.voltageFilter??.22)*residual+(1-(av.voltageFilter??.22))*filteredResidual;estSoc+=(av.observerGain??.28)*filteredResidual*Math.min(delta,5)}
        else if(algorithm==='nonlinear'){const phi=av.boundaryLayer??.05;estSoc+=(av.nonlinearGain??.035)*Math.tanh(residual/phi)*Math.min(delta,5)*.06}
        else if(algorithm==='smo'){const phi=av.boundaryLayer??.05;estSoc+=(av.switchGain??.035)*Math.tanh(residual/phi)*Math.min(delta,5)*.07}
        else if(algorithm==='highgain'){const filter=av.voltageFilter??.18;filteredResidual=filter*residual+(1-filter)*filteredResidual;const effective=(av.highGain??.16)/(av.gainEpsilon??.8);estSoc+=effective*filteredResidual*Math.min(delta,5)*.08}
        else if(algorithm==='ann'){const target=clamp(measuredFeature-.0015*Math.tanh(measuredI),-.05,1.05);estSoc+=(av.dataGain??.16)*(target-estSoc)*Math.min(1,delta/20)}
        else if(algorithm==='cnn'){
          const width=Math.max(3,Math.min(featureHistory.length,Math.round(av.window??9))),slice=featureHistory.slice(-width),weights=slice.map((_,j)=>1-Math.abs((j-(width-1)/2)/((width+1)/2))),den=weights.reduce((s,x)=>s+x,0),target=slice.reduce((s,x,j)=>s+x*weights[j],0)/Math.max(1e-9,den);
          estSoc+=(av.dataGain??.18)*(target-estSoc)*Math.min(1,delta/24);
        }else if(algorithm==='rnn'){
          const memory=av.memory??.94,target=clamp(measuredFeature-.001*Math.tanh(measuredI),-.05,1.05);recurrentState=memory*recurrentState+(1-memory)*target;estSoc+=(av.dataGain??.14)*(recurrentState-estSoc)*Math.min(1,delta/12);
        }else if(algorithm==='lstm'){
          const memory=av.memory??.97,forget=clamp(memory+.015*Math.tanh(av.gateBias??.35),.7,.998),input=1-forget,target=clamp(measuredFeature-.0007*Math.tanh(measuredI),-.05,1.05);lstmCell=forget*lstmCell+input*target;estSoc+=(av.dataGain??.02)*(lstmCell-estSoc)*Math.min(1,delta/10);
        }
      }
    }
    const rawEstimatedSoc=estSoc*100,displayEstimatedSoc=clamp(rawEstimatedSoc,0,100);
    const row={t,commandedCurrent,current,measuredCurrent:measuredI,voltage,trueSoc:trueSoc*100,estimatedSoc:rawEstimatedSoc,displayEstimatedSoc,error:(estSoc-trueSoc)*100,terminationReason:shared?.terminationReason??null};
    if(displayEstimatedSoc!==rawEstimatedSoc)hasDisplayClipping=true;
    cumulativeAbsError+=Math.abs(row.error);cumulativeError+=row.error;cumulativeSquaredError+=row.error*row.error;
    minSoc=Math.min(minSoc,row.trueSoc,row.estimatedSoc);maxSoc=Math.max(maxSoc,row.trueSoc,row.estimatedSoc);maxError=Math.max(maxError,Math.abs(row.error));
    row.cumulativeAbsError=cumulativeAbsError;row.cumulativeError=cumulativeError;row.cumulativeSquaredError=cumulativeSquaredError;row.cumulativeMaxError=maxError;rows.push(row);
  }
  result={rows,soh,profile,chemistry,algorithm:a.name,experimentMode,benchmark:unified?{...benchmarkSettings}:null,mae:cumulativeAbsError/rows.length,meanError:cumulativeError/rows.length,mse:cumulativeSquaredError/rows.length,rmse:Math.sqrt(cumulativeSquaredError/rows.length),minSoc,maxSoc,maxError,dt,qTrue,qAssumed,qEstimate,hasDisplayClipping,terminationReason:rows.at(-1)?.terminationReason||'duration'}; cursor=0;playhead=0;$('timeline').max=rows.length-1;$('timeline').value=0;$('downloadButton').disabled=false; updateFrame();
}

function setupCanvas(canvas){const rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1,w=Math.max(10,rect.width),h=Math.max(10,rect.height);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w,h};}
function chartFrame(canvas,xLabel,yLabel,xMin,xMax,yMin,yMax){const {ctx,w,h}=setupCanvas(canvas),m={l:48,r:16,t:12,b:34},pw=w-m.l-m.r,ph=h-m.t-m.b,xDigits=Math.abs(xMax-xMin)<10?2:0,yDigits=Math.abs(yMax-yMin)<10?2:0;ctx.clearRect(0,0,w,h);ctx.font=`11px ${CANVAS_FONT}`;ctx.fillStyle=COLORS.muted;ctx.strokeStyle=COLORS.grid;ctx.lineWidth=1;for(let i=0;i<=5;i++){const y=m.t+ph*i/5;ctx.beginPath();ctx.moveTo(m.l,y);ctx.lineTo(w-m.r,y);ctx.stroke();const val=yMax-(yMax-yMin)*i/5;ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(val.toFixed(yDigits),m.l-7,y)}for(let i=0;i<=5;i++){const x=m.l+pw*i/5;ctx.fillStyle=COLORS.muted;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText((xMin+(xMax-xMin)*i/5).toFixed(xDigits),x,h-m.b+8)}ctx.fillStyle=COLORS.ink;ctx.textAlign='center';ctx.fillText(xLabel,m.l+pw/2,h-12);ctx.save();ctx.translate(12,m.t+ph/2);ctx.rotate(-Math.PI/2);ctx.fillText(yLabel,0,0);ctx.restore();return {ctx,w,h,m,pw,ph,X:v=>m.l+(v-xMin)/(xMax-xMin)*pw,Y:v=>m.t+(yMax-v)/(yMax-yMin)*ph};}
function dualAxisFrame(canvas,xLabel,leftLabel,rightLabel,xMin,xMax,leftMin,leftMax,rightMin,rightMax){const {ctx,w,h}=setupCanvas(canvas),m={l:48,r:52,t:12,b:34},pw=w-m.l-m.r,ph=h-m.t-m.b,rightDigits=Math.max(Math.abs(rightMin),Math.abs(rightMax))<=.5?2:Math.max(Math.abs(rightMin),Math.abs(rightMax))<=5?1:0;ctx.clearRect(0,0,w,h);ctx.font=`11px ${CANVAS_FONT}`;ctx.strokeStyle=COLORS.grid;ctx.lineWidth=1;for(let i=0;i<=5;i++){const y=m.t+ph*i/5;ctx.beginPath();ctx.moveTo(m.l,y);ctx.lineTo(w-m.r,y);ctx.stroke();ctx.textBaseline='middle';ctx.fillStyle=COLORS.ink;ctx.textAlign='right';ctx.fillText((leftMax-(leftMax-leftMin)*i/5).toFixed(0),m.l-7,y);ctx.fillStyle=COLORS.orange;ctx.textAlign='left';ctx.fillText((rightMax-(rightMax-rightMin)*i/5).toFixed(rightDigits),w-m.r+7,y)}for(let i=0;i<=5;i++){const x=m.l+pw*i/5;ctx.fillStyle=COLORS.muted;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText((xMin+(xMax-xMin)*i/5).toFixed(0),x,h-m.b+8)}ctx.fillStyle=COLORS.ink;ctx.textAlign='center';ctx.fillText(xLabel,m.l+pw/2,h-12);ctx.save();ctx.translate(12,m.t+ph/2);ctx.rotate(-Math.PI/2);ctx.fillText(leftLabel,0,0);ctx.restore();ctx.save();ctx.fillStyle=COLORS.orange;ctx.translate(w-12,m.t+ph/2);ctx.rotate(Math.PI/2);ctx.fillText(rightLabel,0,0);ctx.restore();return {ctx,w,h,m,pw,ph,X:v=>m.l+(v-xMin)/(xMax-xMin)*pw,Y:v=>m.t+(leftMax-v)/(leftMax-leftMin)*ph,YRight:v=>m.t+(rightMax-v)/(rightMax-rightMin)*ph};}
function line(c,points,color,width=2,dash=[]){const {ctx,X,Y}=c;ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();points.forEach((p,i)=>{const x=X(p[0]),y=Y(p[1]);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.restore();}
function drawOcv(){
  const selected=Number($('sohSlider').value),all=[...ocvCurves.values()],voltages=all.flatMap(curve=>curve.points.map(point=>point.ocv));
  const availableLevels=[...ocvCurves.keys()].sort((a,b)=>a-b);
  const yMin=voltages.length?Math.floor((Math.min(...voltages)-.015)*20)/20:2.5,yMax=voltages.length?Math.ceil((Math.max(...voltages)+.015)*20)/20:4.2;
  const c=chartFrame($('ocvChart'),'SOC (%)','OCV (V)',0,100,yMin,yMax),selectedCurve=ocvCurves.get(selected),reference=ocvCurves.get(100);
  availableLevels.filter(s=>s!==selected).forEach((soh,index)=>{const curve=ocvCurves.get(soh);if(curve)line(c,curve.points.map(p=>[p.soc*100,p.ocv]),`rgba(105,118,114,${.18+index*.025})`,1)});
  if(selectedCurve)line(c,selectedCurve.points.map(p=>[p.soc*100,p.ocv]),COLORS.green,3);
  const shownCurve=selectedCurve,maxDelta=shownCurve&&reference?Math.max(...shownCurve.points.map((p,i)=>Math.abs(p.ocv-reference.points[i].ocv)))*1000:0;
  const checkpoint=selectedCurve?.cycle!==undefined?`cycle ${selectedCurve.cycle}`:selectedCurve?.diagnostic!==undefined?`RPT ${selectedCurve.diagnostic}`:`check-up ${selectedCurve?.checkup??'—'}`;
  $('selectedSohLegend').textContent=`${tr('currentSoh')}${language==='en'?': ':'：'}${selected}%`;
  const {ctx}=c,iw=Math.min(178,c.pw*.43),ih=Math.min(88,c.ph*.38),ix=c.m.l+c.pw-iw-8,iy=c.m.t+c.ph-ih-7,pad={l:31,r:6,t:20,b:18};
  ctx.save();ctx.fillStyle='rgba(255,253,246,.94)';ctx.strokeStyle='rgba(16,42,42,.24)';ctx.lineWidth=1;ctx.fillRect(ix,iy,iw,ih);ctx.strokeRect(ix,iy,iw,ih);ctx.fillStyle=COLORS.ink;ctx.font=`9px ${CANVAS_FONT}`;ctx.textAlign='left';ctx.fillText(language==='en'?'Selected SOH − 100% SOH (mV)':'当前 SOH − 100% SOH (mV)',ix+6,iy+12);
  const vals=shownCurve&&reference?shownCurve.points.map((pt,i)=>(pt.ocv-reference.points[i].ocv)*1000):[0],lim=Math.max(5,Math.ceil(Math.max(...vals.map(Math.abs))/5)*5),px=s=>ix+pad.l+s/100*(iw-pad.l-pad.r),py=v=>iy+pad.t+(lim-v)/(2*lim)*(ih-pad.t-pad.b);
  ctx.strokeStyle='rgba(126,137,134,.35)';ctx.beginPath();ctx.moveTo(ix+pad.l,py(0));ctx.lineTo(ix+iw-pad.r,py(0));ctx.stroke();ctx.fillStyle=COLORS.muted;ctx.textAlign='right';ctx.fillText(`+${lim}`,ix+pad.l-3,iy+pad.t+2);ctx.fillText('0',ix+pad.l-3,py(0)+3);ctx.fillText(`−${lim}`,ix+pad.l-3,iy+ih-pad.b+3);
  if(reference&&shownCurve){ctx.strokeStyle=COLORS.orange;ctx.lineWidth=1.8;ctx.beginPath();shownCurve.points.forEach((pt,i)=>{const x=px(pt.soc*100),y=py((pt.ocv-reference.points[i].ocv)*1000);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()}ctx.restore();
  if(result&&selectedCurve&&result.rows[cursor]){
    const soc=clamp(result.rows[cursor].trueSoc,0,100),voltage=curveVoltage(selectedCurve,soc/100),x=c.X(soc),y=c.Y(voltage);
    ctx.save();ctx.fillStyle=COLORS.orange;ctx.strokeStyle=COLORS.paper;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=COLORS.orange;ctx.font=`bold 10px ${CANVAS_FONT}`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(`SOC ${soc.toFixed(1)}% · ${voltage.toFixed(3)} V`,x,y-9);ctx.restore();
  }
  if(selectedCurve)$('selectedSohLegend').title=language==='en'?`Display bin ${selected}% maps to measured SOH ${selectedCurve.measuredSoh.toFixed(6)}%; checkpoint ${checkpoint}; maximum difference from the 100% curve ${maxDelta.toFixed(1)} mV`:`显示档位 ${selected}% 对应实测 SOH ${selectedCurve.measuredSoh.toFixed(6)}%；检查点 ${checkpoint}；相对 100% 曲线最大差值 ${maxDelta.toFixed(1)} mV`;
}
function sampledRows(rows,endIndex,maxPoints=600){
  if(!rows.length||endIndex<0)return [];
  const end=Math.min(endIndex,rows.length-1);if(end+1<=maxPoints)return rows.slice(0,end+1);
  const selectors=[
    ['error',(a,b)=>a<b],['error',(a,b)=>a>b],
    ['current',(a,b)=>a<b],['current',(a,b)=>a>b],
    ['trueSoc',(a,b)=>a<b],['trueSoc',(a,b)=>a>b],
    ['displayEstimatedSoc',(a,b)=>a<b],['displayEstimatedSoc',(a,b)=>a>b]
  ];
  const bucketCount=Math.max(1,Math.floor((maxPoints-2)/10)),bucketSize=(end+1)/bucketCount,selected=new Set([0,end]);
  for(let bucket=0;bucket<bucketCount;bucket++){
    const start=Math.floor(bucket*bucketSize),stop=Math.min(end+1,Math.floor((bucket+1)*bucketSize));if(stop<=start)continue;
    selected.add(start);selected.add(stop-1);
    for(const [field,compare] of selectors){let best=start;for(let i=start+1;i<stop;i++){const candidate=Number(rows[i][field]??0),incumbent=Number(rows[best][field]??0);if(compare(candidate,incumbent))best=i}selected.add(best)}
  }
  const indices=[...selected].sort((a,b)=>a-b);
  if(indices.length<=maxPoints)return indices.map(index=>rows[index]);
  const thinned=[];for(let i=0;i<maxPoints;i++)thinned.push(indices[Math.round(i*(indices.length-1)/(maxPoints-1))]);
  return [...new Set(thinned)].map(index=>rows[index]);
}
function adaptiveErrorLimit(maxError){const target=Math.max(.1,Math.abs(maxError||0)*1.15),levels=[.1,.2,.5,1,2,5,10,20,50,100];return levels.find(level=>level>=target)??Math.ceil(target/50)*50}
function drawIdleChartMessage(frame,text){
  const {ctx,m,pw,ph}=frame;
  ctx.save();ctx.fillStyle='#71807d';ctx.font=`600 13px ${CANVAS_FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,m.l+pw/2,m.t+ph/2);ctx.restore();
}
function drawTimeCharts(){
  const maxT=result?result.rows[result.rows.length-1].t:modelValues.duration;
  const currentLimit=Math.max(1,modelValues.chargeCurrent,modelValues.dischargeCurrent)*1.2,currentFrame=chartFrame($('socChart'),'Time (s)','Current (A)',0,maxT,-currentLimit,currentLimit);
  const errorLimit=adaptiveErrorLimit(result?.rows?.[cursor]?.cumulativeMaxError??0),outputFrame=dualAxisFrame($('errorChart'),'Time (s)','SOC (%)','SOC error (%)',0,maxT,0,100,-errorLimit,errorLimit);
  if(!result){
    drawIdleChartMessage(currentFrame,language==='en'?'Run the selected algorithm to generate a waveform':'点击“运行”生成功率轨迹');
    drawIdleChartMessage(outputFrame,language==='en'?'Run the selected algorithm to generate a waveform':'点击“运行”生成输出功率波形');
    return;
  }
  const upto=sampledRows(result.rows,cursor);
  line(currentFrame,[[0,0],[maxT,0]],COLORS.muted,1,[4,4]);line(currentFrame,upto.map(r=>[r.t,r.current]),COLORS.purple,2.2);
  line({...outputFrame,Y:outputFrame.YRight},[[0,0],[maxT,0]],COLORS.muted,1,[4,4]);
  if(upto.length){line(outputFrame,upto.map(r=>[r.t,r.trueSoc]),COLORS.blue,3);line(outputFrame,upto.map(r=>[r.t,r.displayEstimatedSoc??r.estimatedSoc]),COLORS.purple,2.6,[8,4]);line({...outputFrame,Y:outputFrame.YRight},upto.map(r=>[r.t,r.error]),COLORS.orange,2.2)}
}
function arrow(ctx,x1,y1,x2,y2,color=COLORS.green){ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-8*Math.cos(a-.5),y2-8*Math.sin(a-.5));ctx.lineTo(x2-8*Math.cos(a+.5),y2-8*Math.sin(a+.5));ctx.closePath();ctx.fill();}
function box(ctx,x,y,w,h,title,sub,fill='#fff'){ctx.fillStyle=fill;ctx.strokeStyle=COLORS.green;ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x,y,w,h,5);ctx.fill();ctx.stroke();ctx.fillStyle=COLORS.ink;ctx.font=`bold 12px ${CANVAS_FONT}`;ctx.textAlign='center';ctx.fillText(title,x+w/2,y+h/2-3);ctx.font=`9px ${CANVAS_FONT}`;ctx.fillStyle=COLORS.muted;ctx.fillText(sub,x+w/2,y+h/2+12);}
function drawSystem(){
  const {ctx,w,h}=setupCanvas($('systemChart'));ctx.clearRect(0,0,w,h);const sy=Math.max(.72,Math.min(1.25,h/260)),cx=w*.5,baseY=h*.54;
  const wire=(points,color=COLORS.ink,width=2,dash=[])=>{ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.restore()};
  const caption=(text,x,y,color=COLORS.ink)=>{ctx.fillStyle=color;ctx.font=`bold ${Math.max(8,11*sy)}px ${CANVAS_FONT}`;ctx.textAlign='center';ctx.fillText(text,x,y)};
  const shadow=()=>{ctx.shadowColor='rgba(16,42,42,.18)';ctx.shadowBlur=8;ctx.shadowOffsetY=4};
  const cycler={x:18,y:baseY-34*sy,w:76*sy,h:66*sy};shadow();ctx.fillStyle='#dfe5df';ctx.strokeStyle='#61716d';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(cycler.x,cycler.y,cycler.w,cycler.h,7);ctx.fill();ctx.stroke();ctx.shadowColor='transparent';ctx.fillStyle='#173f37';ctx.fillRect(cycler.x+10*sy,cycler.y+10*sy,cycler.w-20*sy,20*sy);ctx.fillStyle='#b8e14b';ctx.font=`${10*sy}px ${CANVAS_FONT}`;ctx.textAlign='center';ctx.fillText('1.10 A',cycler.x+cycler.w/2,cycler.y+24*sy);ctx.fillStyle='#f36d32';ctx.beginPath();ctx.arc(cycler.x+20*sy,cycler.y+47*sy,4*sy,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1d2d2a';ctx.beginPath();ctx.arc(cycler.x+cycler.w-20*sy,cycler.y+47*sy,4*sy,0,Math.PI*2);ctx.fill();caption('Battery cycler',cycler.x+cycler.w/2,cycler.y+cycler.h+16*sy);

  const sensorX=w*.27,sensorY=baseY;shadow();ctx.fillStyle='#eaf1f5';ctx.strokeStyle='#3f718e';ctx.lineWidth=3*sy;ctx.beginPath();ctx.arc(sensorX,sensorY,24*sy,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowColor='transparent';ctx.strokeStyle='#fff';ctx.lineWidth=9*sy;ctx.beginPath();ctx.arc(sensorX,sensorY,10*sy,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#3f718e';ctx.fillRect(sensorX-16*sy,sensorY+18*sy,32*sy,13*sy);ctx.fillStyle='#fff';ctx.font=`bold ${9*sy}px ${CANVAS_FONT}`;ctx.textAlign='center';ctx.fillText('I',sensorX,sensorY+28*sy);caption('Current sensor',sensorX,sensorY+48*sy,'#3f718e');

  const cellLabel=datasetKey==='lfpA123'?['A123','LFP 1.1 Ah','18650 cell']:datasetKey==='oxfordKokam'?['Kokam','NCO/LCO 0.74 Ah','pouch cell']:datasetKey==='stanfordM50t'?['LG M50T','NMC811 4.85 Ah','21700 cell']:datasetKey==='stanfordDynamic'?['Cell 034','NCA / SiOx','cylindrical cell']:['Samsung 30T','NCA 3.0 Ah','21700 cell'];
  const cell={x:cx-19*sy,y:baseY-55*sy,w:38*sy,h:106*sy};shadow();const cellGradient=ctx.createLinearGradient(cell.x,0,cell.x+cell.w,0);cellGradient.addColorStop(0,'#0a5948');cellGradient.addColorStop(.45,'#18a47f');cellGradient.addColorStop(.72,'#0e6b56');cellGradient.addColorStop(1,'#083f35');ctx.fillStyle=cellGradient;ctx.strokeStyle='#083f35';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(cell.x,cell.y,cell.w,cell.h,17*sy);ctx.fill();ctx.stroke();ctx.shadowColor='transparent';ctx.fillStyle='#c6ccc7';ctx.beginPath();ctx.ellipse(cx,cell.y+4*sy,17*sy,5*sy,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e6ebe6';ctx.fillRect(cx-5*sy,cell.y-4*sy,10*sy,6*sy);ctx.fillStyle='#fff';ctx.font=`bold ${11*sy}px ${CANVAS_FONT}`;ctx.textAlign='center';ctx.fillText(cellLabel[0],cx,baseY-5*sy);ctx.font=`${8*sy}px ${CANVAS_FONT}`;ctx.fillText(cellLabel[1],cx,baseY+10*sy);caption(cellLabel[2],cx,cell.y+cell.h+18*sy);

  const volt={x:w*.64,y:Math.max(24,h*.2),w:64*sy,h:48*sy};shadow();ctx.fillStyle='#f4eadf';ctx.strokeStyle='#b86b36';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(volt.x-volt.w/2,volt.y-volt.h/2,volt.w,volt.h,7);ctx.fill();ctx.stroke();ctx.shadowColor='transparent';ctx.fillStyle='#fffdf6';ctx.fillRect(volt.x-23*sy,volt.y-13*sy,46*sy,20*sy);ctx.fillStyle='#f36d32';ctx.font=`bold ${15*sy}px ${CANVAS_FONT}`;ctx.textAlign='center';ctx.fillText('V',volt.x,volt.y+3*sy);ctx.fillStyle='#b86b36';for(const dx of [-18,18]){ctx.beginPath();ctx.arc(volt.x+dx*sy,volt.y+15*sy,3*sy,0,Math.PI*2);ctx.fill()}caption('Voltage sensor',volt.x,volt.y+volt.h/2+15*sy,'#b86b36');

  const board={x:w-108*sy,y:baseY-49*sy,w:94*sy,h:92*sy};shadow();ctx.fillStyle='#167f67';ctx.strokeStyle='#075142';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(board.x,board.y,board.w,board.h,8);ctx.fill();ctx.stroke();ctx.shadowColor='transparent';ctx.fillStyle='#10312c';ctx.fillRect(board.x+25*sy,board.y+30*sy,42*sy,30*sy);for(let i=0;i<5;i++){wire([[board.x+18*sy,board.y+(28+i*8)*sy],[board.x+25*sy,board.y+(28+i*8)*sy]],'#d6c36c',1);wire([[board.x+67*sy,board.y+(28+i*8)*sy],[board.x+76*sy,board.y+(28+i*8)*sy]],'#d6c36c',1)}ctx.fillStyle='#d7f590';ctx.fillRect(board.x+12*sy,board.y+10*sy,70*sy,14*sy);ctx.fillStyle='#173f37';ctx.font=`bold ${9*sy}px ${CANVAS_FONT}`;ctx.textAlign='center';ctx.fillText('SOC 82.0%',board.x+47*sy,board.y+20*sy);ctx.fillStyle='#f4d35e';for(const [dx,dy] of [[12,72],[82,72],[12,16],[82,16]]){ctx.beginPath();ctx.arc(board.x+dx*sy,board.y+dy*sy,3*sy,0,Math.PI*2);ctx.fill()}caption('SOC controller',board.x+board.w/2,board.y+board.h+17*sy);

  wire([[cycler.x+cycler.w,baseY-13*sy],[sensorX-24*sy,baseY-13*sy]],'#f36d32',3);wire([[sensorX+24*sy,baseY-13*sy],[cell.x,baseY-13*sy]],'#f36d32',3);wire([[cell.x+cell.w,baseY+25*sy],[cycler.x+cycler.w,baseY+25*sy],[cycler.x+cycler.w,baseY+13*sy]],'#233f3a',3);
  wire([[cx,cell.y],[cx,volt.y+volt.h/2],[volt.x-18*sy,volt.y+volt.h/2]],'#d84b35',1.8);wire([[cx,cell.y+cell.h],[volt.x+18*sy,cell.y+cell.h],[volt.x+18*sy,volt.y+volt.h/2]],'#263c39',1.8);
  wire([[sensorX,sensorY-24*sy],[sensorX,20*sy],[board.x+10*sy,20*sy],[board.x+10*sy,board.y+18*sy]],'#3f718e',1.8,[5,3]);wire([[volt.x+volt.w/2,volt.y],[board.x,volt.y]],'#b86b36',1.8,[5,3]);
  ctx.fillStyle=COLORS.muted;ctx.font=`${8.5*sy}px ${CANVAS_FONT}`;ctx.textAlign='left';ctx.fillText('POWER PATH',18,14*sy);ctx.textAlign='right';ctx.fillText('SENSOR SIGNALS  · · ·',w-14,14*sy);
}
function drawAll(){drawOcv();drawTimeCharts();}
function updateFrame(){if(!result){drawTimeCharts();drawOcv();return}const r=result.rows[cursor],count=cursor+1,meanError=r.cumulativeError/count,mse=r.cumulativeSquaredError/count,rmse=Math.sqrt(mse);$('timeline').value=cursor;$('metricMaxError').innerHTML=`${r.cumulativeMaxError.toFixed(2)} <small>%</small>`;$('metricRmse').innerHTML=`${rmse.toFixed(2)} <small>%</small>`;$('metricMeanError').innerHTML=`${meanError.toFixed(2)} <small>%</small>`;$('metricMse').innerHTML=`${mse.toFixed(3)} <small>%²</small>`;const clipNote=result.hasDisplayClipping?(language==='en'?'Metrics use raw SOC; the purple plot alone is clipped to 0–100%.':'指标使用原始 SOC；只有紫色绘图轨迹被限制在 0–100%。'):(language==='en'?'Metrics and the visible trace both use the raw SOC because no display clipping occurred.':'本次未发生显示限幅，指标和可见轨迹均对应原始 SOC。');$('errorChart').title=clipNote;const estimateLegend=document.querySelector('.output-model-note .estimate-line')?.parentElement;if(estimateLegend)estimateLegend.title=clipNote;drawTimeCharts();drawOcv();}
function stopPlayback(){if(timer){cancelAnimationFrame(timer);timer=null}previousFrameTime=0;$('playButton').textContent='▶';}
function playbackFrame(now){
  if(!timer)return;
  if(!previousFrameTime)previousFrameTime=now;
  const elapsed=Math.min(.25,(now-previousFrameTime)/1000),speed=Number($('speed').value)||1;previousFrameTime=now;playhead=Math.min(result.rows.length-1,playhead+elapsed*speed*32);const next=Math.floor(playhead);
  if(next!==cursor){cursor=next;updateFrame()}
  if(cursor>=result.rows.length-1){stopPlayback();return}
  timer=requestAnimationFrame(playbackFrame);
}
function play(){
  if(!result){runSimulationAndPlay();return}
  if(timer){stopPlayback();return}
  if(cursor>=result.rows.length-1){cursor=0;playhead=0;updateFrame()}else playhead=cursor;
  previousFrameTime=0;$('playButton').textContent='❚❚';timer=requestAnimationFrame(playbackFrame);
}
async function runSimulationAndPlay(){
  if(simulationBusy)return;
  simulationBusy=true;invalidate();
  const runButton=$('runButton'),playButton=$('playButton'),icon=runButton.querySelector('.play-icon');
  runButton.disabled=true;playButton.disabled=true;runButton.setAttribute('aria-busy','true');icon.textContent='…';$('runButtonLabel').textContent=language==='en'?'Calculating…':'正在计算…';
  let succeeded=false;
  try{
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    simulate();succeeded=true;
  }catch(error){
    console.error(error);showToast(language==='en'?'Simulation failed; see the browser console for details.':'仿真运行失败，请检查浏览器控制台。');
  }finally{
    simulationBusy=false;runButton.disabled=false;playButton.disabled=false;runButton.removeAttribute('aria-busy');icon.textContent='▶';updateAlgorithmText();
  }
  if(succeeded)play();
}
function invalidate(){stopPlayback();result=null;cursor=0;playhead=0;$('downloadButton').disabled=true;$('metricMaxError').innerHTML='— <small>%</small>';$('metricRmse').innerHTML='— <small>%</small>';$('metricMeanError').innerHTML='— <small>%</small>';$('metricMse').innerHTML='— <small>%²</small>';renderBenchmarkEvidence();drawAll();}
function showToast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._id);t._id=setTimeout(()=>t.classList.remove('show'),2200);}
function openGuide(){const a=localizedAlgorithm(category,algorithm),defs=algorithms[category].items[algorithm].params.map(localizeDef);$('parameterHelpSubtitle').textContent=a.name;$('parameterHelpList').innerHTML=defs.map(d=>`<article class="parameter-help-item"><h3>${d.label}</h3><dl><div><dt>${tr('definition')}</dt><dd>${d.help[0]}</dd></div><div><dt>${tr('increase')}</dt><dd>${d.help[1]}</dd></div><div><dt>${tr('decrease')}</dt><dd>${d.help[2]}</dd></div></dl></article>`).join('');const datasetRefs=datasetKey==='lfpA123'?[refs.data,refs.paper]:datasetKey==='oxfordKokam'?[refs.oxfordData,refs.oxfordChemistry]:datasetKey==='stanfordM50t'?[refs.stanfordData,refs.stanfordPaper]:datasetKey==='stanfordDynamic'?[refs.dynamicData,refs.dynamicPaper]:[refs.nmcData,refs.nmcPaper];let list=[refs.xiongReview,refs.yangReview,...datasetRefs];if(category==='bayesian')list.push(refs.plett,refs.compare);else if(category==='observer')list.push(refs.review);else if(category==='dataDriven')list.push(refs.hannanReview,refs.dataReview);else if(category==='hybrid')list.push(refs.dual,refs.ieee,refs.hybridReview);$('parameterHelpReferenceList').innerHTML=[...new Set(list)].map(x=>`<li>${x}</li>`).join('');$('parameterHelpModal').hidden=false;syncModalOpen();}
function syncModalOpen(){document.body.classList.toggle('modal-open',['parameterHelpModal','batteryInfoModal'].some(id=>$(id)&&!$(id).hidden))}
function closeGuide(){$('parameterHelpModal').hidden=true;syncModalOpen();}
function renderBatteryInfo(){
  const zh=language==='zh';
  $('batteryInfoGrid').innerHTML=zh?`
    <article><h3>磷酸铁锂（LFP）</h3><dl><div><dt>电芯</dt><dd>A123 APR18650M1A · 1.1 Ah · Cell6a</dd></div><div><dt>测量</dt><dd>50 °C；同一电芯 C/25 充放电 pOCV；覆盖 100%–60% SOH。</dd></div><div><dt>数据</dt><dd><a href="https://doi.org/10.57745/OLBXKT" target="_blank" rel="noreferrer">Recherche Data Gouv（CC BY 4.0）</a></dd></div><div><dt>论文</dt><dd><a href="https://doi.org/10.1038/s41597-025-04712-7" target="_blank" rel="noreferrer">Scientific Data</a></dd></div></dl></article>
    <article><h3>镍钴铝（NCA）</h3><dl><div><dt>电芯</dt><dd>Samsung INR21700-30T · 3.0 Ah</dd></div><div><dt>测量</dt><dd>25 °C；同一电芯重复 C/20 充放电；实测覆盖 100%–74.78% SOH。</dd></div><div><dt>数据</dt><dd><a href="https://doi.org/10.5683/SP3/UYPYDJ" target="_blank" rel="noreferrer">McMaster / Borealis</a></dd></div></dl></article>
    <article><h3>镍钴铝（NCA/SiOₓ）</h3><dl><div><dt>电芯</dt><dd>Stanford Dynamic Cycling · Cell 034；商用圆柱电芯，型号未公开</dd></div><div><dt>测量</dt><dd>35 °C；同一电芯周期性 2.8–4.2 V C/40 诊断；网站显示实测 100%、95.55%、90.07%、84.53%、80.78% 检查点。</dd></div><div><dt>处理</dt><dd>每条 pOCV 是该检查点 C/40 充电与放电电压的逐点平均；SOH 由同一电芯首个 C/40 放电容量归一化得到。</dd></div><div><dt>数据</dt><dd><a href="https://purl.stanford.edu/td676xr4322" target="_blank" rel="noreferrer">Stanford Digital Repository</a></dd></div><div><dt>论文</dt><dd><a href="https://doi.org/10.1038/s41560-024-01675-8" target="_blank" rel="noreferrer">Nature Energy</a></dd></div></dl></article>
    <article><h3>镍锰钴（NMC811）</h3><dl><div><dt>电芯</dt><dd>LG Chem INR21700-M50T · 4.85 Ah · W8</dd></div><div><dt>测量</dt><dd>23 °C；同一电芯周期性 C/20 放电诊断；实测覆盖 100%–91.39% SOH，仅保留 100%、95%、90% 显示档位。</dd></div><div><dt>限制</dt><dd>没有覆盖 80% SOH，不满足优选门槛；因当前公开可用数据有限，按用户要求保留并明确标记。</dd></div><div><dt>数据</dt><dd><a href="https://osf.io/qsabn/?view_only=2a03b6c78ef14922a3e244f3d549de78" target="_blank" rel="noreferrer">Stanford Energy Control Lab / OSF</a></dd></div><div><dt>论文</dt><dd><a href="https://doi.org/10.1016/j.dib.2022.107995" target="_blank" rel="noreferrer">Data in Brief</a></dd></div></dl></article>
    <article><h3>NCO/LCO 混合层状氧化物</h3><dl><div><dt>电芯</dt><dd>Kokam SLPB533459H4 · 0.74 Ah · Cell1</dd></div><div><dt>测量</dt><dd>40 °C；每 100 个 Artemis 循环进行 40 mA pOCV；本网站选取的实测检查点覆盖 100%–75.77% SOH。</dd></div><div><dt>数据</dt><dd><a href="https://doi.org/10.5287/bodleian:KO2kdmYGg" target="_blank" rel="noreferrer">Oxford University Research Archive（ODbL 1.0）</a></dd></div><div><dt>化学体系依据</dt><dd><a href="https://ora.ox.ac.uk/objects/uuid%3A1cd07380-ac39-4ca2-856d-4903f2a5757a/files/m6784460aeaeb59c4a70f4cb3533f8fa2" target="_blank" rel="noreferrer">Oxford thesis：XRD/EDX 识别为 NCO 与 LCO 混合正极</a></dd></div></dl></article>
    <article class="wide chemistry-note"><h3>七个候选电芯的化学体系归类</h3><p><b>LFP：</b>A123 Cell6a。<b>NCA：</b>Samsung 30T、Battery Aging Matrix、Stanford Dynamic Cycling Cell 034。<b>NMC811：</b>Stanford LG M50T W8。<b>NCO/LCO 混合正极：</b>Oxford Kokam Cell1。<b>LCO：</b>Politecnico di Milano 电芯。当前图 B 已加载 A123、Samsung 30T、Stanford Dynamic、Stanford M50T W8 与 Oxford Kokam；另外两项仍只作为候选来源列示，未把尚未提取核验的曲线冒充实测曲线。</p></article>
    `:`
    <article><h3>LFP</h3><dl><div><dt>Cell</dt><dd>A123 APR18650M1A · 1.1 Ah · Cell6a</dd></div><div><dt>Test</dt><dd>50 °C; C/25 charge/discharge pOCV from one cell; 100%–60% SOH.</dd></div><div><dt>Data</dt><dd><a href="https://doi.org/10.57745/OLBXKT" target="_blank" rel="noreferrer">Recherche Data Gouv (CC BY 4.0)</a></dd></div><div><dt>Paper</dt><dd><a href="https://doi.org/10.1038/s41597-025-04712-7" target="_blank" rel="noreferrer">Scientific Data</a></dd></div></dl></article>
    <article><h3>Nickel cobalt aluminium (NCA)</h3><dl><div><dt>Cell</dt><dd>Samsung INR21700-30T · 3.0 Ah</dd></div><div><dt>Test</dt><dd>25 °C; repeated C/20 charge/discharge on one cell; measured 100%–74.78% SOH.</dd></div><div><dt>Data</dt><dd><a href="https://doi.org/10.5683/SP3/UYPYDJ" target="_blank" rel="noreferrer">McMaster / Borealis</a></dd></div></dl></article>
    <article><h3>Nickel cobalt aluminium (NCA/SiOₓ)</h3><dl><div><dt>Cell</dt><dd>Stanford Dynamic Cycling · Cell 034; commercial cylindrical cell, model undisclosed</dd></div><div><dt>Test</dt><dd>35 °C; periodic 2.8–4.2 V C/40 diagnostics on one cell; displayed checkpoints are measured at 100%, 95.55%, 90.07%, 84.53%, and 80.78% SOH.</dd></div><div><dt>Method</dt><dd>Each pOCV curve is the pointwise mean of the measured C/40 charge and discharge voltage; SOH is normalized to the first C/40 discharge capacity.</dd></div><div><dt>Data</dt><dd><a href="https://purl.stanford.edu/td676xr4322" target="_blank" rel="noreferrer">Stanford Digital Repository</a></dd></div><div><dt>Paper</dt><dd><a href="https://doi.org/10.1038/s41560-024-01675-8" target="_blank" rel="noreferrer">Nature Energy</a></dd></div></dl></article>
    <article><h3>Nickel manganese cobalt (NMC811)</h3><dl><div><dt>Cell</dt><dd>LG Chem INR21700-M50T · 4.85 Ah · W8</dd></div><div><dt>Test</dt><dd>23 °C; periodic C/20 discharge diagnostics from one cell; measured span 100%–91.39% SOH, retained as 100%, 95%, and 90% display bins.</dd></div><div><dt>Limitation</dt><dd>It does not reach 80% SOH and therefore misses the preferred inclusion threshold. It remains available, clearly labelled, at the user's request.</dd></div><div><dt>Data</dt><dd><a href="https://osf.io/qsabn/?view_only=2a03b6c78ef14922a3e244f3d549de78" target="_blank" rel="noreferrer">Stanford Energy Control Lab / OSF</a></dd></div><div><dt>Paper</dt><dd><a href="https://doi.org/10.1016/j.dib.2022.107995" target="_blank" rel="noreferrer">Data in Brief</a></dd></div></dl></article>
    <article><h3>NCO/LCO blended layered oxide</h3><dl><div><dt>Cell</dt><dd>Kokam SLPB533459H4 · 0.74 Ah · Cell1</dd></div><div><dt>Test</dt><dd>40 °C; 40 mA pOCV every 100 Artemis cycles; the measured checkpoints selected by this site span 100%–75.77% SOH.</dd></div><div><dt>Data</dt><dd><a href="https://doi.org/10.5287/bodleian:KO2kdmYGg" target="_blank" rel="noreferrer">Oxford University Research Archive (ODbL 1.0)</a></dd></div><div><dt>Chemistry evidence</dt><dd><a href="https://ora.ox.ac.uk/objects/uuid%3A1cd07380-ac39-4ca2-856d-4903f2a5757a/files/m6784460aeaeb59c4a70f4cb3533f8fa2" target="_blank" rel="noreferrer">Oxford thesis: NCO/LCO blended cathode identified by XRD/EDX</a></dd></div></dl></article>
    <article class="wide chemistry-note"><h3>Chemistry classification of the seven candidate cells</h3><p><b>LFP:</b> A123 Cell6a. <b>NCA:</b> Samsung 30T, Battery Aging Matrix, and Stanford Dynamic Cycling Cell 034. <b>NMC811:</b> Stanford LG M50T W8. <b>NCO/LCO blended cathode:</b> Oxford Kokam Cell1. <b>LCO:</b> Politecnico di Milano cell. Figure B currently loads A123, Samsung 30T, Stanford Dynamic, Stanford M50T W8, and Oxford Kokam. The other two remain listed as candidate sources; unextracted curves are not presented as measured data.</p></article>
    `;
}
function openBatteryInfo(){$('batteryInfoModal').hidden=false;syncModalOpen();}
function closeBatteryInfo(){$('batteryInfoModal').hidden=true;syncModalOpen();}
function download(){
  if(!result)return;
  const header='time_s,command_current_A,actual_current_A,measured_current_A,terminal_voltage_V,true_soc_percent,estimated_soc_raw_percent,estimated_soc_display_percent,error_raw_percent,experiment_mode,random_seed,sample_period_s,termination_reason\n';
  const body=result.rows.map(r=>[
    r.t,r.commandedCurrent??r.current,r.current,r.measuredCurrent??r.current,r.voltage,r.trueSoc,r.estimatedSoc,r.displayEstimatedSoc??clamp(r.estimatedSoc,0,100),r.error
  ].map(v=>Number(v).toFixed(6)).concat([result.experimentMode,result.benchmark?.seed??'',result.dt,r.terminationReason??'']).join(',')).join('\n');
  const blob=new Blob([header+body],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`battery_soc_${chemistry}_${algorithm}_${result.experimentMode}_soh${result.soh}.csv`;a.click();URL.revokeObjectURL(url);
}

$('algorithmCategory').addEventListener('change',e=>{category=e.target.value;algorithm=Object.keys(algorithms[category].items)[0];renderAlgorithmOptions();invalidate();});
$('algorithmSelect').addEventListener('change',e=>{algorithm=e.target.value;updateAlgorithmText();renderAlgorithmControls();invalidate();});
$('chemistrySelect').addEventListener('change',e=>{chemistry=e.target.value;renderDatasetOptions();activateDataset(datasetKey);invalidate();});
$('datasetSelect').addEventListener('change',e=>{activateDataset(e.target.value);invalidate();});
function setSoh(value,quiet=false){const requested=Math.round(clamp(Number(value),60,100)/5)*5,levels=[...ocvCurves.keys()],minimum=ocvDataset?.supportedSohMin??(levels.length?Math.min(...levels):60),v=Math.max(minimum,requested);$('sohSlider').value=v;$('sohNumber').value=v;$('sohValue').textContent=`${v.toFixed(1)}%`;if(!quiet&&v!==requested)showToast(language==='en'?`This measured dataset is available down to the ${minimum}% SOH display bin`:`当前公开数据的实测范围最低对应 ${minimum}% SOH 档位`);invalidate();}
$('sohSlider').addEventListener('input',e=>setSoh(e.target.value));$('sohNumber').addEventListener('change',e=>setSoh(Number.isFinite(Number(e.target.value))?e.target.value:$('sohSlider').value));
$('profileSelect').addEventListener('change',invalidate);$('runButton').addEventListener('click',runSimulationAndPlay);$('playButton').addEventListener('click',play);
Object.entries(benchmarkBindings).forEach(([id,[key,min,max]])=>{
  const input=$(id);if(!input)return;
  input.addEventListener('change',()=>{
    let value=Number(input.value);if(!Number.isFinite(value))value=benchmarkSettings[key];value=clamp(value,min,max);
    if(key==='seed')value=Math.round(value)>>>0;if(key==='sampleInterval')value=Math.max(1,Math.round(value));
    benchmarkSettings[key]=value;input.value=value;sharedStreamCache=null;syncBenchmarkOverrides();invalidate();
  });
});
$('previousButton').addEventListener('click',()=>{if(result){cursor=Math.max(0,cursor-1);playhead=cursor;updateFrame()}});$('nextButton').addEventListener('click',()=>{if(result){cursor=Math.min(result.rows.length-1,cursor+1);playhead=cursor;updateFrame()}});$('timeline').addEventListener('input',e=>{if(result){cursor=Number(e.target.value);playhead=cursor;updateFrame()}});
$('resetAlgorithmButton').addEventListener('click',()=>{renderAlgorithmControls(true);invalidate();showToast(language==='en'?'Current algorithm parameters were reset to defaults':'当前算法参数已恢复默认值');});$('parameterHelpButton').addEventListener('click',openGuide);$('parameterHelpClose').addEventListener('click',closeGuide);$('parameterHelpModal').addEventListener('click',e=>{if(e.target===$('parameterHelpModal'))closeGuide()});$('batteryInfoButton').addEventListener('click',openBatteryInfo);$('batteryInfoClose').addEventListener('click',closeBatteryInfo);$('batteryInfoModal').addEventListener('click',e=>{if(e.target===$('batteryInfoModal'))closeBatteryInfo()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeGuide();closeBatteryInfo()}});$('downloadButton').addEventListener('click',download);$('languageToggle').addEventListener('click',()=>{language=language==='zh'?'en':'zh';applyLanguage()});
new ResizeObserver(()=>drawAll()).observe(document.querySelector('.visualization-area'));
renderCategories();renderModelControls();applyLanguage();loadCurve();
