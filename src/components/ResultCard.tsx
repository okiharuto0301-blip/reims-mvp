interface Props {
  label: string;
  value: string;
  sub?: string;
  color?: "blue" | "green" | "red" | "gray";
  large?: boolean;
}

const colorMap = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  red: "bg-red-50 border-red-200 text-red-700",
  gray: "bg-gray-50 border-gray-200 text-gray-700",
};

export default function ResultCard({ label, value, sub, color = "blue", large = false }: Props) {
  return (
    <div className={`border rounded-xl p-4 ${colorMap[color]}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
      <p className={`font-bold ${large ? "text-3xl" : "text-2xl"}`}>{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </div>
  );
}
