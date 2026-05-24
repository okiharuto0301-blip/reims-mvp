"use client";
import { useState } from "react";
import InputForm from "@/components/InputForm";
import ResultCard from "@/components/ResultCard";
import CashFlowChart from "@/components/CashFlowChart";
import { PropertyInput, calculate } from "@/lib/calculations";

const defaultInput: PropertyInput = {
  purchasePrice: 3000,
  monthlyRent: 15,
  managementFee: 1,
  vacancyRate: 5,
  otherExpenses: 10,
  loanAmount: 2400,
  interestRate: 1.8,
  loanTermYears: 30,
  initialCost: 150,
};

function fmt(n: number, digits = 1) {
  return n.toFixed(digits);
}

export default function Home() {
  const [input, setInput] = useState<PropertyInput>(defaultInput);
  const result = calculate(input);

  const cfColor = result.monthlyCashFlow >= 0 ? "green" : "red";
  const ltv = input.purchasePrice > 0
    ? (input.loanAmount / input.purchasePrice * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">REIMS</h1>
            <p className="text-xs text-gray-500">不動産投資シミュレーター</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              無料ツール
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* 入力フォーム */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <InputForm input={input} onChange={setInput} />
          </div>

          {/* 結果エリア */}
          <div className="lg:col-span-3 space-y-6">

            {/* 主要指標 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">投資指標サマリー</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <ResultCard
                  label="月間キャッシュフロー"
                  value={`${fmt(result.monthlyCashFlow)} 万円`}
                  sub={`年間 ${fmt(result.annualCashFlow)} 万円`}
                  color={cfColor}
                  large
                />
                <ResultCard
                  label="CF利回り（自己資金比）"
                  value={`${fmt(result.cashFlowYield)} %`}
                  sub={`自己資金 ${fmt(result.totalInvestment)} 万円`}
                  color={result.cashFlowYield >= 5 ? "green" : result.cashFlowYield >= 0 ? "blue" : "red"}
                  large
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ResultCard label="表面利回り" value={`${fmt(result.grossYield)} %`} color="gray" />
                <ResultCard label="実質利回り" value={`${fmt(result.netYield)} %`} color="gray" />
                <ResultCard label="月額ローン返済" value={`${fmt(result.monthlyLoanPayment)} 万円`} color="gray" />
              </div>
            </div>

            {/* 資金内訳 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">資金内訳</h2>
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

            {/* グラフ */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">30年間シミュレーション</h2>
              <CashFlowChart data={result.annualProjections} />
            </div>

            {/* 判定コメント */}
            <div className={`rounded-2xl p-5 border ${
              result.monthlyCashFlow >= 0
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
              <p className="text-sm font-semibold mb-1">
                {result.monthlyCashFlow >= 0 ? "✓ プラス収支の物件です" : "✗ 現状はマイナス収支です"}
              </p>
              <p className="text-xs text-gray-600">
                {result.monthlyCashFlow >= 0
                  ? `毎月 ${fmt(result.monthlyCashFlow)} 万円の手残りが見込まれます。CF利回り ${fmt(result.cashFlowYield)}%。`
                  : `毎月 ${fmt(Math.abs(result.monthlyCashFlow))} 万円の持ち出しが発生します。頭金増額・物件価格交渉をご検討ください。`
                }
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        ※ 本ツールのシミュレーション結果は参考値です。実際の投資判断は専門家にご相談ください。
      </footer>
    </div>
  );
}
