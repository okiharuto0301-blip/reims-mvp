"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ScenarioResult {
  label: string;
  irr: number | null;
  npv: number;
  annualCF: number;
  payback: number | null;
}

interface Props {
  scenarios: ScenarioResult[];
}

const COLORS: Record<string, string> = {
  "安全": "#f59e0b",
  "中庸": "#3b82f6",
  "攻め": "#10b981",
};

export default function ScenarioChart({ scenarios }: Props) {
  const irrData = scenarios.map((s) => ({ label: s.label, value: s.irr ?? 0 }));
  const npvData = scenarios.map((s) => ({ label: s.label, value: Math.round(s.npv) }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">シナリオ別 IRR（%）</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={irrData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(1)}%`} />
            <Tooltip formatter={(v) => [`${Number(v).toFixed(2)}%`, "IRR"]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {irrData.map((entry) => (
                <Cell key={entry.label} fill={COLORS[entry.label] ?? "#6366f1"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">シナリオ別 NPV（万円）</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={npvData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}万円`, "NPV"]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {npvData.map((entry) => (
                <Cell key={entry.label} fill={COLORS[entry.label] ?? "#6366f1"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* シナリオ比較テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-3 py-2 font-medium text-gray-600">シナリオ</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">IRR</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">NPV</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">年間CF</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">回収期間</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => (
              <tr key={s.label} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[s.label] }}
                    />
                    {s.label}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  {s.irr !== null ? `${s.irr.toFixed(2)}%` : "—"}
                </td>
                <td className={`px-3 py-2 text-right ${s.npv >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {Math.round(s.npv).toLocaleString()}万円
                </td>
                <td className={`px-3 py-2 text-right ${s.annualCF >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {s.annualCF.toFixed(1)}万円
                </td>
                <td className="px-3 py-2 text-right">
                  {s.payback !== null ? `${s.payback.toFixed(1)}年` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
