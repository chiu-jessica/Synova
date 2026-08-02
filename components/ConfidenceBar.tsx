export default function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted">Model confidence</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="w-full h-3 bg-teal-light rounded-pill overflow-hidden">
        <div
          className="h-full bg-teal rounded-pill transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
