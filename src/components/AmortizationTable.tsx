"use client";
import { AmortizationYear } from "@/lib/calculations";
import { useState } from "react";

interface Props {
  schedule: AmortizationYear[];
}

export default function AmortizationTable({ schedule }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShow((v) => !v)}
        className="text-sm text-blue-600 hover:text-blue-800 underline mb-3"
      >
        {show ? "▲ アモチゼーション表を閉じる" : "▼ アモチゼーション表（年次元利内訳）を開く"}
      </button>
      {show && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-right px-2 py-2 font-medium text-gray-600">年</th>
                <th className="text-right px-2 py-2 font-medium text-gray-600">年間返済額</th>
                <th className="text-right px-2 py-2 font-medium text-gray-600">うち利息</th>
                <th className="text-right px-2 py-2 font-medium text-gray-600">うち元金</th>
                <th className="text-right px-2 py-2 font-medium text-gray-600">ローン残高</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.year} className="border-b hover:bg-gray-50">
                  <td className="text-right px-2 py-1.5">{row.year}年目</td>
                  <td className="text-right px-2 py-1.5">{row.ads.toFixed(1)}万円</td>
                  <td className="text-right px-2 py-1.5 text-red-500">{row.interest.toFixed(1)}万円</td>
                  <td className="text-right px-2 py-1.5 text-blue-500">{row.principal.toFixed(1)}万円</td>
                  <td className="text-right px-2 py-1.5">{row.endBalance.toFixed(1)}万円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
