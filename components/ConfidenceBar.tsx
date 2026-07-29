export default function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Model confidence</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
