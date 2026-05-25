"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

interface Props {
  data: { rate: number; npv: number }[];
  discountRate: number;
}

export default function NPVChart({ data, discountRate }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-600 mb-3">NPV vs 割引率（万円）</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="rate" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 100) * 100}`} />
          <Tooltip
            formatter={(v) => [`${Math.round(Number(v))}万円`, "NPV"]}
            labelFormatter={(l) => `割引率 ${l}%`}
          />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" />
          <ReferenceLine x={discountRate} stroke="#3b82f6" strokeDasharray="4 2" label={{ value: "現在", fontSize: 10 }} />
          <Line dataKey="npv" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
