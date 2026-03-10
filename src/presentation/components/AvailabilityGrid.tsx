import { useCallback, useRef, useState } from "react";
import type { TimeSlot, DayOfWeek } from "../../domain/models/types";
import { DAYS_OF_WEEK, DAY_LABELS, HOURS } from "../../domain/models/types";
import { isSlotSelected, getWeekDates } from "../../application/services/availability.service";
import { formatHour } from "../../application/services/timezone.service";

interface ProposedSlotMark {
  day: DayOfWeek;
  hour: number;
}

interface AvailabilityGridProps {
  slots: TimeSlot[];
  memberColor: string;
  onChange: (slots: TimeSlot[]) => void;
  proposedSlot?: ProposedSlotMark | null;
}

export function AvailabilityGrid({ slots, memberColor, onChange, proposedSlot }: AvailabilityGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragModeRef = useRef<"add" | "remove">("add");

  const handlePointerDown = useCallback(
    (day: DayOfWeek, hour: number) => {
      const selected = isSlotSelected(slots, day, hour);
      dragModeRef.current = selected ? "remove" : "add";
      setIsDragging(true);

      if (selected) {
        onChange(slots.filter((s) => !(s.day === day && s.hour === hour)));
      } else {
        onChange([...slots, { day, hour }]);
      }
    },
    [slots, onChange],
  );

  const handlePointerEnter = useCallback(
    (day: DayOfWeek, hour: number) => {
      if (!isDragging) return;
      const selected = isSlotSelected(slots, day, hour);

      if (dragModeRef.current === "add" && !selected) {
        onChange([...slots, { day, hour }]);
      } else if (dragModeRef.current === "remove" && selected) {
        onChange(slots.filter((s) => !(s.day === day && s.hour === hour)));
      }
    },
    [isDragging, slots, onChange],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      className="select-none overflow-x-auto"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="inline-grid gap-px" style={{
        gridTemplateColumns: `64px repeat(${DAYS_OF_WEEK.length}, minmax(60px, 1fr))`,
      }}>
        {/* Header row */}
        {(() => {
          const weekDates = getWeekDates();
          return (
            <>
              <div className="h-14" />
              {DAYS_OF_WEEK.map((day, i) => (
                <div
                  key={day}
                  className="flex h-14 flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-[10px] font-bold text-indigo-500">
                    {weekDates[i]}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    {DAY_LABELS[day]}
                  </span>
                </div>
              ))}
            </>
          );
        })()}

        {/* Time rows */}
        {HOURS.map((hour) => (
          <AvailabilityRow
            key={hour}
            hour={hour}
            slots={slots}
            memberColor={memberColor}
            proposedSlot={proposedSlot}
            onPointerDown={handlePointerDown}
            onPointerEnter={handlePointerEnter}
          />
        ))}
      </div>
    </div>
  );
}

interface AvailabilityRowProps {
  hour: number;
  slots: TimeSlot[];
  memberColor: string;
  proposedSlot?: ProposedSlotMark | null;
  onPointerDown: (day: DayOfWeek, hour: number) => void;
  onPointerEnter: (day: DayOfWeek, hour: number) => void;
}

function AvailabilityRow({
  hour,
  slots,
  memberColor,
  proposedSlot,
  onPointerDown,
  onPointerEnter,
}: AvailabilityRowProps) {
  return (
    <>
      <div className="flex h-7 items-center justify-end pr-2 text-xs text-slate-400">
        {formatHour(hour)}
      </div>
      {DAYS_OF_WEEK.map((day) => {
        const selected = isSlotSelected(slots, day, hour);
        const isProposed = proposedSlot?.day === day && proposedSlot?.hour === hour;
        return (
          <div
            key={`${day}-${hour}`}
            onPointerDown={() => onPointerDown(day, hour)}
            onPointerEnter={() => onPointerEnter(day, hour)}
            className={`relative h-7 cursor-pointer rounded-sm border transition-colors ${
              selected
                ? "border-transparent"
                : isProposed
                  ? "border-violet-400 bg-violet-50"
                  : "border-slate-100 bg-white hover:bg-slate-50"
            }`}
            style={
              selected
                ? { backgroundColor: memberColor, opacity: 0.7 }
                : undefined
            }
          >
            {isProposed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`h-2 w-2 rounded-full ${selected ? "bg-white" : "bg-violet-500"} ring-2 ${selected ? "ring-white/50" : "ring-violet-300"}`} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
