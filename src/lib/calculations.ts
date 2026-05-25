// ─── 入力型 ───────────────────────────────────────────────────────────────────

export interface PropertyInput {
  // 物件情報
  purchasePrice: number;       // 物件価格（万円）
  monthlyRent: number;         // 月額家賃収入（万円）
  managementFee: number;       // 管理費・修繕積立（月額、万円）
  vacancyRate: number;         // 空室率（%）
  otherExpenses: number;       // その他経費（年額、万円）
  initialCost: number;         // 購入諸費用（万円）

  // ローン
  loanAmount: number;          // 借入額（万円）
  interestRate: number;        // 金利（%）
  loanTermYears: number;       // 返済期間（年）
  paymentsPerYear: number;     // 返済頻度（12=月次, 1=年次）

  // 投資期間・出口
  holdingPeriod: number;       // 保有期間（年）
  saleProceeds: number;        // 売却収益（万円）

  // NPV用
  discountRate: number;        // 割引率（%）

  // 資本蓄積（再投資）
  safeRate: number;            // 安全利回り（%）
  reinvestRate1: number;       // 再投資利回り1（%）
  reinvestCeiling1: number;    // 上限1（万円）
  reinvestRate2: number;       // 再投資利回り2（%）
  reinvestCeiling2: number;    // 上限2（万円）
  reinvestRate3: number;       // 再投資利回り3（%）
}

// ─── 出力型 ───────────────────────────────────────────────────────────────────

export interface CalculationResult {
  // 基本利回り
  grossYield: number;
  netYield: number;

  // ローン
  monthlyLoanPayment: number;
  annualDebtService: number;

  // キャッシュフロー
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashFlowYield: number;
  totalInvestment: number;

  // 財務指標
  npv: number;
  irr: number | null;          // 解なしの場合 null
  pi: number;                  // Profitability Index
  paybackPeriod: number | null; // 投資回収期間（年）
  capitalAccumulation: number;  // 資本蓄積額

  // 年次テーブル
  annualProjections: YearlyProjection[];
  amortizationSchedule: AmortizationYear[];

  // NPV感度（割引率 0〜20%）
  npvSensitivity: { rate: number; npv: number }[];
}

export interface YearlyProjection {
  year: number;
  noi: number;          // NOI（万円）
  ads: number;          // 年間返済額
  freeCF: number;       // フリーCF
  cumulativeCF: number;
  loanBalance: number;
}

export interface AmortizationYear {
  year: number;
  ads: number;          // 年間返済額
  interest: number;     // 利息合計
  principal: number;    // 元金合計
  endBalance: number;   // 期末残高
}

// ─── ローン計算ヘルパー ────────────────────────────────────────────────────────

function calcPMT(loanAmount: number, annualRate: number, termYears: number, paymentsPerYear: number): number {
  const n = termYears * paymentsPerYear;
  const j = annualRate / 100 / paymentsPerYear;
  if (loanAmount <= 0 || n <= 0) return 0;
  if (j === 0) return loanAmount / n;
  return loanAmount * j * Math.pow(1 + j, n) / (Math.pow(1 + j, n) - 1);
}

function buildAmortization(
  loanAmount: number,
  annualRate: number,
  termYears: number,
  paymentsPerYear: number,
  holdingPeriod: number
): AmortizationYear[] {
  const j = annualRate / 100 / paymentsPerYear;
  const pmt = calcPMT(loanAmount, annualRate, termYears, paymentsPerYear);
  const years: AmortizationYear[] = [];
  let balance = loanAmount;

  for (let year = 1; year <= holdingPeriod; year++) {
    if (year > termYears || balance <= 0) {
      years.push({ year, ads: 0, interest: 0, principal: 0, endBalance: 0 });
      continue;
    }
    let yearInt = 0, yearPrin = 0;
    for (let p = 0; p < paymentsPerYear; p++) {
      const int = balance * j;
      const prin = Math.min(pmt - int, balance);
      yearInt += int;
      yearPrin += prin;
      balance = Math.max(balance - prin, 0);
    }
    years.push({
      year,
      ads: pmt * paymentsPerYear,
      interest: yearInt,
      principal: yearPrin,
      endBalance: balance,
    });
  }
  return years;
}

// ─── IRR（二分法） ─────────────────────────────────────────────────────────────

function calcNPVFromCFs(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
}

function calcIRR(cashFlows: number[]): number | null {
  // 符号反転確認（解の存在条件）
  const hasNeg = cashFlows.some((v) => v < 0);
  const hasPos = cashFlows.some((v) => v > 0);
  if (!hasNeg || !hasPos) return null;

  let lo = -0.999, hi = 10.0;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const npvMid = calcNPVFromCFs(mid, cashFlows);
    if (Math.abs(npvMid) < 1e-8) return mid * 100;
    if (Math.sign(npvMid) === Math.sign(calcNPVFromCFs(lo, cashFlows))) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const result = (lo + hi) / 2;
  return Math.abs(result) > 5 ? null : result * 100;
}

// ─── 資本蓄積 ─────────────────────────────────────────────────────────────────

function calcCapitalAccumulation(
  cashFlows: number[],
  safeRate: number,
  k1: number, c1: number,
  k2: number, c2: number,
  k3: number,
): number {
  const T = cashFlows.length;
  let total = 0;
  cashFlows.forEach((cf, idx) => {
    if (cf <= 0) return;
    const n = T - 1 - idx;
    const r1 = k1 / 100, r2 = k2 / 100, r3 = k3 / 100, rs = safeRate / 100;
    const x1 = Math.min(c1, cf);
    const x2 = Math.min(Math.max(c2 - c1, 0), Math.max(cf - c1, 0));
    const x3 = Math.max(cf - c2, 0);
    const fv = x1 * Math.pow(1 + (r1 || rs), n)
      + x2 * Math.pow(1 + (r2 || rs), n)
      + x3 * Math.pow(1 + (r3 || rs), n);
    total += fv;
  });
  return total;
}

// ─── メイン計算関数 ────────────────────────────────────────────────────────────

export function calculate(input: PropertyInput): CalculationResult {
  const {
    purchasePrice, monthlyRent, managementFee, vacancyRate, otherExpenses, initialCost,
    loanAmount, interestRate, loanTermYears, paymentsPerYear,
    holdingPeriod, saleProceeds, discountRate,
    safeRate, reinvestRate1, reinvestCeiling1, reinvestRate2, reinvestCeiling2, reinvestRate3,
  } = input;

  // 基本利回り
  const annualRent = monthlyRent * 12;
  const effectiveAnnualRent = annualRent * (1 - vacancyRate / 100);
  const annualExpenses = managementFee * 12 + otherExpenses;
  const grossYield = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
  const netYield = purchasePrice > 0 ? ((effectiveAnnualRent - annualExpenses) / purchasePrice) * 100 : 0;

  // ローン
  const pmt = calcPMT(loanAmount, interestRate, loanTermYears, paymentsPerYear);
  const annualDebtService = pmt * paymentsPerYear;
  const monthlyLoanPayment = pmt * (paymentsPerYear === 12 ? 1 : paymentsPerYear / 12);

  // アモチゼーション
  const amortizationSchedule = buildAmortization(loanAmount, interestRate, loanTermYears, paymentsPerYear, holdingPeriod);

  // 年次キャッシュフロー
  const totalInvestment = purchasePrice - loanAmount + initialCost;
  const annualProjections: YearlyProjection[] = [];
  let cumulativeCF = 0;

  for (let year = 1; year <= holdingPeriod; year++) {
    const amorYear = amortizationSchedule[year - 1];
    const noi = effectiveAnnualRent - annualExpenses;
    const ads = amorYear?.ads ?? 0;
    const freeCF = noi - ads;
    cumulativeCF += freeCF;
    annualProjections.push({
      year,
      noi,
      ads,
      freeCF,
      cumulativeCF,
      loanBalance: amorYear?.endBalance ?? 0,
    });
  }

  const monthlyCashFlow = (annualProjections[0]?.freeCF ?? 0) / 12;
  const annualCashFlow = annualProjections[0]?.freeCF ?? 0;
  const cashFlowYield = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

  // NPV / IRR 用キャッシュフロー列（t=0が初期投資）
  const cfList: number[] = [-(totalInvestment)];
  for (let year = 1; year <= holdingPeriod; year++) {
    const cf = annualProjections[year - 1].freeCF + (year === holdingPeriod ? saleProceeds : 0);
    cfList.push(cf);
  }

  // NPV
  const r = discountRate / 100;
  const npv = calcNPVFromCFs(r, cfList);

  // IRR
  const irr = calcIRR(cfList);

  // PI
  const pvFuture = cfList.slice(1).reduce((acc, cf, t) => acc + cf / Math.pow(1 + r, t + 1), 0);
  const pi = totalInvestment > 0 ? pvFuture / totalInvestment : 0;

  // Payback Period
  let paybackPeriod: number | null = null;
  let cumCF = 0;
  for (let year = 1; year <= holdingPeriod; year++) {
    const prevCum = cumCF;
    cumCF += annualProjections[year - 1].freeCF;
    if (prevCum < totalInvestment && cumCF >= totalInvestment) {
      paybackPeriod = year - 1 + (totalInvestment - prevCum) / annualProjections[year - 1].freeCF;
      break;
    }
  }

  // 資本蓄積
  const cfForCA = annualProjections.map((y) => y.freeCF);
  const capitalAccumulation = calcCapitalAccumulation(
    cfForCA, safeRate,
    reinvestRate1, reinvestCeiling1,
    reinvestRate2, reinvestCeiling2,
    reinvestRate3,
  );

  // NPV感度（割引率 0〜20%）
  const npvSensitivity = Array.from({ length: 21 }, (_, i) => {
    const rate = i;
    return { rate, npv: calcNPVFromCFs(rate / 100, cfList) };
  });

  return {
    grossYield, netYield,
    monthlyLoanPayment, annualDebtService,
    monthlyCashFlow, annualCashFlow, cashFlowYield, totalInvestment,
    npv, irr, pi, paybackPeriod, capitalAccumulation,
    annualProjections, amortizationSchedule,
    npvSensitivity,
  };
}

// ─── シナリオ計算 ──────────────────────────────────────────────────────────────

export interface Scenario {
  label: string;
  vacancyRate: number;   // 空室率
  rentChange: number;    // 賃料変化率（%）
  saleProceedsChange: number; // 売却価格変化率（%）
}

export const DEFAULT_SCENARIOS: Scenario[] = [
  { label: "安全", vacancyRate: 15, rentChange: -5, saleProceedsChange: -20 },
  { label: "中庸", vacancyRate: 5, rentChange: 0, saleProceedsChange: 0 },
  { label: "攻め", vacancyRate: 2, rentChange: 5, saleProceedsChange: 20 },
];

export function calcScenario(base: PropertyInput, scenario: Scenario) {
  const modified: PropertyInput = {
    ...base,
    vacancyRate: scenario.vacancyRate,
    monthlyRent: base.monthlyRent * (1 + scenario.rentChange / 100),
    saleProceeds: base.saleProceeds * (1 + scenario.saleProceedsChange / 100),
  };
  const result = calculate(modified);
  return {
    label: scenario.label,
    irr: result.irr,
    npv: result.npv,
    annualCF: result.annualCashFlow,
    payback: result.paybackPeriod,
  };
}
