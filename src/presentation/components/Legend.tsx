interface LegendProps {
  totalMembers: number;
}

export function Legend({ totalMembers }: LegendProps) {
  if (totalMembers === 0) return null;

  return (
    <div className="flex items-center gap-4 text-xs text-slate-500">
      <span className="font-medium">Overlap:</span>
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-6 rounded" style={{ backgroundColor: "rgba(99, 102, 241, 0.25)" }} />
        <span>Some</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-6 rounded" style={{ backgroundColor: "rgba(250, 204, 21, 0.5)" }} />
        <span>Half+</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-6 rounded" style={{ backgroundColor: "rgba(16, 185, 129, 0.7)" }} />
        <span>All</span>
      </div>
    </div>
  );
}
