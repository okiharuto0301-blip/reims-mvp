export interface PropertyInput {
  purchasePrice: number;       // 物件価格（万円）
  monthlyRent: number;         // 月額家賃収入（万円）
  managementFee: number;       // 管理費・修繕積立（月額、万円）
  vacancyRate: number;         // 空室率（%）
  otherExpenses: number;       // その他経費（年額、万円）
  loanAmount: number;          // 借入額（万円）
  interestRate: number;        // 金利（%）
  loanTermYears: number;       // 返済期間（年）
  initialCost: number;         // 諸費用（万円）
}

export interface CalculationResult {
  grossYield: number;          // 表面利回り（%）
  netYield: number;            // 実質利回り（%）
  monthlyLoanPayment: number;  // 月額ローン返済額（万円）
  monthlyCashFlow: number;     // 月間キャッシュフロー（万円）
  annualCashFlow: number;      // 年間キャッシュフロー（万円）
  cashFlowYield: number;       // CF利回り（%）
  totalInvestment: number;     // 自己資金（万円）
  annualProjections: YearlyProjection[];
}

export interface YearlyProjection {
  year: number;
  annualCF: number;            // 年間CF（万円）
  loanBalance: number;         // ローン残高（万円）
  cumulativeCF: number;        // 累積CF（万円）
}

export function calculate(input: PropertyInput): CalculationResult {
  const {
    purchasePrice, monthlyRent, managementFee, vacancyRate,
    otherExpenses, loanAmount, interestRate, loanTermYears, initialCost,
  } = input;

  const annualRent = monthlyRent * 12;
  const effectiveAnnualRent = annualRent * (1 - vacancyRate / 100);
  const annualExpenses = managementFee * 12 + otherExpenses;

  const grossYield = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
  const netYield = purchasePrice > 0 ? ((effectiveAnnualRent - annualExpenses) / purchasePrice) * 100 : 0;

  // 元利均等返済
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = loanTermYears * 12;
  let monthlyLoanPayment = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    monthlyLoanPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)
      / (Math.pow(1 + monthlyRate, totalPayments) - 1);
  } else if (loanAmount > 0) {
    monthlyLoanPayment = loanAmount / totalPayments;
  }

  const monthlyEffectiveRent = monthlyRent * (1 - vacancyRate / 100);
  const monthlyExpenses = managementFee + otherExpenses / 12;
  const monthlyCashFlow = monthlyEffectiveRent - monthlyExpenses - monthlyLoanPayment;
  const annualCashFlow = monthlyCashFlow * 12;

  const totalInvestment = purchasePrice - loanAmount + initialCost;
  const cashFlowYield = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

  // 30年間のプロジェクション
  const annualProjections: YearlyProjection[] = [];
  let remainingBalance = loanAmount;
  let cumulativeCF = 0;

  for (let year = 1; year <= 30; year++) {
    let yearlyPrincipalPaid = 0;
    if (year <= loanTermYears && remainingBalance > 0) {
      for (let m = 0; m < 12; m++) {
        const interest = remainingBalance * monthlyRate;
        const principal = Math.min(monthlyLoanPayment - interest, remainingBalance);
        yearlyPrincipalPaid += principal;
        remainingBalance = Math.max(remainingBalance - principal, 0);
      }
    }
    const loanBalance = year <= loanTermYears ? Math.max(remainingBalance, 0) : 0;

    // 返済期間終了後はローン返済なし
    const yearLoanPayment = year <= loanTermYears ? monthlyLoanPayment * 12 : 0;
    const yearCF = effectiveAnnualRent - annualExpenses - yearLoanPayment;
    cumulativeCF += yearCF;

    annualProjections.push({ year, annualCF: yearCF, loanBalance, cumulativeCF });
  }

  return {
    grossYield,
    netYield,
    monthlyLoanPayment,
    monthlyCashFlow,
    annualCashFlow,
    cashFlowYield,
    totalInvestment,
    annualProjections,
  };
}
