"use client";
import { PropertyInput } from "@/lib/calculations";

interface Props {
  input: PropertyInput;
  onChange: (input: PropertyInput) => void;
}

interface FieldConfig {
  key: keyof PropertyInput;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  hint?: string;
}

const sections: { title: string; fields: FieldConfig[] }[] = [
  {
    title: "物件情報",
    fields: [
      { key: "purchasePrice", label: "物件価格", unit: "万円", min: 0, max: 100000, step: 100, hint: "税込み購入価格" },
      { key: "initialCost", label: "購入諸費用", unit: "万円", min: 0, max: 5000, step: 10, hint: "仲介手数料・登記費用など（目安：物件価格の5〜8%）" },
      { key: "monthlyRent", label: "月額家賃収入", unit: "万円", min: 0, max: 500, step: 0.5 },
      { key: "vacancyRate", label: "想定空室率", unit: "%", min: 0, max: 50, step: 1, hint: "一般的には5〜10%" },
      { key: "managementFee", label: "管理費・修繕積立（月額）", unit: "万円", min: 0, max: 50, step: 0.1 },
      { key: "otherExpenses", label: "その他経費（年額）", unit: "万円", min: 0, max: 500, step: 1, hint: "固定資産税・保険料など" },
    ],
  },
  {
    title: "ローン条件",
    fields: [
      { key: "loanAmount", label: "借入額", unit: "万円", min: 0, max: 100000, step: 100, hint: "物件価格以下" },
      { key: "interestRate", label: "金利", unit: "%", min: 0, max: 10, step: 0.01 },
      { key: "loanTermYears", label: "返済期間", unit: "年", min: 1, max: 50, step: 1 },
    ],
  },
];

export default function InputForm({ input, onChange }: Props) {
  const set = (key: keyof PropertyInput, value: number) =>
    onChange({ ...input, [key]: value });

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="text-lg font-bold text-gray-800 border-b border-blue-200 pb-2 mb-4">
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.fields.map(({ key, label, unit, min, max, step, hint }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                  <span className="ml-1 text-xs text-gray-400">（{unit}）</span>
                </label>
                {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    value={input[key]}
                    min={min}
                    max={max}
                    step={step}
                    onChange={(e) => set(key, parseFloat(e.target.value) || 0)}
                    className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-500">{unit}</span>
                  <input
                    type="range"
                    value={input[key]}
                    min={min}
                    max={max}
                    step={step}
                    onChange={(e) => set(key, parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
