"use client";
import { useState } from "react";
import InputForm from "@/components/InputForm";
import ResultCard from "@/components/ResultCard";
import CashFlowChart from "@/components/CashFlowChart";
import NPVChart from "@/components/NPVChart";
import ScenarioChart from "@/components/ScenarioChart";
import AmortizationTable from "@/components/AmortizationTable";
import { PropertyInput, calculate, calcScenario, DEFAULT_SCENARIOS } from "@/lib/calculations";

const defaultInput: PropertyInput = {
  purchasePrice: 3000,
  monthlyRent: 15,
  managementFee: 1,
  vacancyRate: 5,
  otherExpenses: 10,
  initialCost: 150,
  loanAmount: 2400,
  interestRate: 1.8,
  loanTermYears: 30,
  paymentsPerYear: 12,
  holdingPeriod: 10,
  saleProceeds: 2500,
  discountRate: 5,
  safeRate: 2,
  reinvestRate1: 5,
  reinvestCeiling1: 100,
  reinvestRate2: 8,
  reinvestCeiling2: 500,
  reinvestRate3: 10,
};

function fmt(n: number, d = 1) { return n.toFixed(d); }

type Tab = "summary" | "cashflow" | "npv" | "scenario" | "amortization";

export default function Home() {
  const [input, setInput] = useState<PropertyInput>(defaultInput);
  const [activeTab, setActiveTab] = useState<Tab>("summary");

  const result = calculate(input);
  const scenarios = DEFAULT_SCENARIOS.map((s) => calcScenario(input, s));
  const ltv = input.purchasePrice > 0 ? (input.loanAmount / input.purchasePrice * 100) : 0;
  const cfColor = result.monthlyCashFlow >= 0 ? "green" : "red";

  const tabs: { id: Tab; label: string }[] = [
    { id: "summary", label: "指標サマリー" },
    { id: "cashflow", label: "CF推移" },
    { id: "npv", label: "NPV感度" },
    { id: "scenario", label: "シナリオ比較" },
    { id: "amortization", label: "返済表" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">REIMS</h1>
            <p className="text-xs text-gray-500 leading-tight">不動産投資シミュレーター</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              Ver 1.0.0-alpha
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* 入力フォーム */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-y-auto max-h-screen lg:sticky lg:top-20">
            <h2 className="text-base font-bold text-gray-800 mb-4">物件・条件を入力</h2>
            <InputForm input={input} onChange={setInput} />
          </div>

          {/* 結果エリア */}
          <div className="lg:col-span-3 space-y-4">

            {/* タブ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex overflow-x-auto gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 指標サマリー */}
            {activeTab === "summary" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h2 className="text-base font-bold text-gray-800 mb-4">財務指標</h2>

                  {/* メインKPI */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <ResultCard
                      label="NPV（正味現在価値）"
                      value={`${Math.round(result.npv).toLocaleString()} 万円`}
                      sub={`割引率 ${input.discountRate}% 適用`}
                      color={result.npv >= 0 ? "green" : "red"}
                      large
                    />
                    <ResultCard
                      label="IRR（内部収益率）"
                      value={result.irr !== null ? `${fmt(result.irr)} %` : "計算不可"}
                      sub={result.irr !== null ? `割引率 ${input.discountRate}% との差: ${fmt(result.irr - input.discountRate)}%` : "CFの符号を確認してください"}
                      color={result.irr !== null && result.irr >= input.discountRate ? "green" : "red"}
                      large
                    />
                  </div>

                  {/* サブKPI */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <ResultCard
                      label="PI（収益性指数）"
                      value={fmt(result.pi, 2)}
                      sub="1.0以上で投資価値あり"
                      color={result.pi >= 1 ? "green" : "red"}
                    />
                    <ResultCard
                      label="投資回収期間"
                      value={result.paybackPeriod !== null ? `${fmt(result.paybackPeriod)} 年` : "—"}
                      color="gray"
                    />
                    <ResultCard
                      label="資本蓄積額（保有期間末）"
                      value={`${Math.round(result.capitalAccumulation).toLocaleString()} 万円`}
                      color="blue"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ResultCard label="表面利回り" value={`${fmt(result.grossYield)} %`} color="gray" />
                    <ResultCard label="実質利回り" value={`${fmt(result.netYield)} %`} color="gray" />
                    <ResultCard label="CF利回り（自己資金比）" value={`${fmt(result.cashFlowYield)} %`} color="gray" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h2 className="text-base font-bold text-gray-800 mb-4">キャッシュフロー</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <ResultCard
                      label="月間キャッシュフロー"
                      value={`${fmt(result.monthlyCashFlow)} 万円`}
                      sub={`年間 ${fmt(result.annualCashFlow)} 万円`}
                      color={cfColor}
                      large
                    />
                    <ResultCard
                      label="年間ローン返済額"
                      value={`${fmt(result.annualDebtService)} 万円`}
                      sub={`月額 ${fmt(result.monthlyLoanPayment)} 万円`}
                      color="gray"
                      large
                    />
                  </div>
                </div>

                {/* 資金内訳 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h2 className="text-base font-bold text-gray-800 mb-4">資金内訳</h2>
                  <div className="space-y-3">
                    {[
                      { label: "物件価格", value: input.purchasePrice, dot: "bg-blue-400" },
                      { label: "購入諸費用", value: input.initialCost, dot: "bg-blue-200" },
                      { label: `借入額（LTV ${fmt(ltv, 0)}%）`, value: input.loanAmount, dot: "bg-amber-300" },
                      { label: "自己資金", value: result.totalInvestment, dot: "bg-green-400" },
                    ].map(({ label, value, dot }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${dot} flex-shrink-0`} />
                        <span className="text-sm text-gray-600 flex-1">{label}</span>
                        <span className="text-sm font-semibold text-gray-800">{value.toLocaleString()} 万円</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 判定 */}
                <div className={`rounded-2xl p-4 border ${result.npv >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <p className="text-sm font-semibold mb-1">
                    {result.npv >= 0 ? "✓ NPVプラス：投資価値があります" : "✗ NPVマイナス：現状の条件では割引率を下回ります"}
                  </p>
                  <p className="text-xs text-gray-600">
                    IRR {result.irr !== null ? `${fmt(result.irr)}%` : "N/A"} ／ 投資回収 {result.paybackPeriod !== null ? `${fmt(result.paybackPeriod)}年` : "—"} ／ PI {fmt(result.pi, 2)}
                  </p>
                </div>
              </div>
            )}

            {/* CF推移 */}
            {activeTab === "cashflow" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-base font-bold text-gray-800 mb-4">キャッシュフロー推移（{input.holdingPeriod}年間）</h2>
                <CashFlowChart data={result.annualProjections} />
              </div>
            )}

            {/* NPV感度 */}
            {activeTab === "npv" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-base font-bold text-gray-800 mb-4">NPV感度分析</h2>
                <p className="text-xs text-gray-500 mb-4">割引率が変化したときのNPVの動き。グラフが0を下回る割引率がIRRです。</p>
                <NPVChart data={result.npvSensitivity} discountRate={input.discountRate} />
              </div>
            )}

            {/* シナリオ比較 */}
            {activeTab === "scenario" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-base font-bold text-gray-800 mb-2">シナリオ比較</h2>
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <p>安全：空室率15%・賃料-5%・売却-20%</p>
                  <p>中庸：空室率5%・賃料±0%・売却±0%（入力値）</p>
                  <p>攻め：空室率2%・賃料+5%・売却+20%</p>
                </div>
                <ScenarioChart scenarios={scenarios} />
              </div>
            )}

            {/* 返済表 */}
            {activeTab === "amortization" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-base font-bold text-gray-800 mb-4">アモチゼーション表（年次元利内訳）</h2>
                <AmortizationTable schedule={result.amortizationSchedule} />
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        ※ 本ツールのシミュレーション結果は参考値です。実際の投資判断は専門家にご相談ください。
      </footer>
    </div>
  );
}
