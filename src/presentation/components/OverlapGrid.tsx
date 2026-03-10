import type { Member, OverlapCell } from "../../domain/models/types";
import { DAYS_OF_WEEK, DAY_LABELS, HOURS } from "../../domain/models/types";
import { formatHour } from "../../application/services/timezone.service";
import { getOverlapColor } from "../../application/services/color.service";
import { useState } from "react";

interface OverlapGridProps {
  overlap: OverlapCell[];
  members: Member[];
  totalMembers: number;
}

export function OverlapGrid({ overlap, members, totalMembers }: OverlapGridProps) {
  const [tooltip, setTooltip] = useState<{ cell: OverlapCell; x: number; y: number } | null>(null);

  const cellMap = new Map<string, OverlapCell>();
  for (const cell of overlap) {
    cellMap.set(`${cell.day}-${cell.hour}`, cell);
  }

  return (
    <div className="relative select-none overflow-x-auto">
      <div
        className="inline-grid gap-px"
        style={{
          gridTemplateColumns: `64px repeat(${DAYS_OF_WEEK.length}, minmax(60px, 1fr))`,
        }}
      >
        {/* Header */}
        <div className="h-8" />
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-xs font-semibold text-slate-500 uppercase"
          >
            {DAY_LABELS[day]}
          </div>
        ))}

        {/* Rows */}
        {HOURS.map((hour) => (
          <OverlapRow
            key={hour}
            hour={hour}
            cellMap={cellMap}
            totalMembers={totalMembers}
            onHover={(cell, x, y) => setTooltip(cell ? { cell, x, y } : null)}
          />
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && tooltip.cell.count > 0 && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <div className="font-semibold text-slate-700">
            {tooltip.cell.count}/{totalMembers} available
          </div>
          <div className="mt-1 flex flex-col gap-0.5">
            {tooltip.cell.memberIds.map((id) => {
              const member = members.find((m) => m.id === id);
              return member ? (
                <div key={id} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="text-slate-600">{member.name}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface OverlapRowProps {
  hour: number;
  cellMap: Map<string, OverlapCell>;
  totalMembers: number;
  onHover: (cell: OverlapCell | null, x: number, y: number) => void;
}

function OverlapRow({ hour, cellMap, totalMembers, onHover }: OverlapRowProps) {
  return (
    <>
      <div className="flex h-7 items-center justify-end pr-2 text-xs text-slate-400">
        {formatHour(hour)}
      </div>
      {DAYS_OF_WEEK.map((day) => {
        const cell = cellMap.get(`${day}-${hour}`);
        const count = cell?.count ?? 0;
        return (
          <div
            key={`${day}-${hour}`}
            onPointerEnter={(e) =>
              cell && onHover(cell, e.nativeEvent.offsetX + (e.currentTarget as HTMLElement).offsetLeft, (e.currentTarget as HTMLElement).offsetTop)
            }
            onPointerLeave={() => onHover(null, 0, 0)}
            className="flex h-7 items-center justify-center rounded-sm border border-slate-100 text-xs font-medium transition-colors"
            style={{ backgroundColor: getOverlapColor(count, totalMembers) }}
          >
            {count > 0 && (
              <span className="text-slate-700">{count}</span>
            )}
          </div>
        );
      })}
    </>
  );
}
