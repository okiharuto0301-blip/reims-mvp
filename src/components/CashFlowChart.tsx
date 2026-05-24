"use client";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { YearlyProjection } from "@/lib/calculations";

interface Props {
  data: YearlyProjection[];
}

export default function CashFlowChart({ data }: Props) {
  const chartData = data.map((d) => ({
    year: `${d.year}年目`,
    年間CF: Math.round(d.annualCF * 10) / 10,
    累積CF: Math.round(d.cumulativeCF * 10) / 10,
    ローン残高: Math.round(d.loanBalance * 10) / 10,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">年間キャッシュフロー推移（万円）</h3>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} interval={4} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}万円`]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={0} stroke="#999" />
            <Bar dataKey="年間CF" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Line dataKey="累積CF" stroke="#10b981" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3">ローン残高推移（万円）</h3>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} interval={4} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}万円`]} />
            <Line dataKey="ローン残高" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
