const MEMBER_COLORS = [
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
  "#14b8a6", // teal
  "#84cc16", // lime
];

export function getMemberColor(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

export function getOverlapColor(count: number, total: number): string {
  if (count === 0 || total === 0) return "transparent";
  const ratio = count / total;
  if (ratio === 1) return "rgba(16, 185, 129, 0.7)";  // full overlap - green
  if (ratio >= 0.5) return "rgba(250, 204, 21, 0.5)";  // half+ - yellow
  return "rgba(99, 102, 241, 0.25)";                    // some - light indigo
}
