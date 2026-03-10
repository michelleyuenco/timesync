import { useCallback, useRef, useState } from "react";
import type { TimeSlot, DayOfWeek } from "../../domain/models/types";
import { DAYS_OF_WEEK, DAY_LABELS, HOURS } from "../../domain/models/types";
import { isSlotSelected } from "../../application/services/availability.service";
import { formatHour } from "../../application/services/timezone.service";

interface AvailabilityGridProps {
  slots: TimeSlot[];
  memberColor: string;
  onChange: (slots: TimeSlot[]) => void;
}

export function AvailabilityGrid({ slots, memberColor, onChange }: AvailabilityGridProps) {
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
        <div className="h-8" />
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-xs font-semibold text-slate-500 uppercase"
          >
            {DAY_LABELS[day]}
          </div>
        ))}

        {/* Time rows */}
        {HOURS.map((hour) => (
          <AvailabilityRow
            key={hour}
            hour={hour}
            slots={slots}
            memberColor={memberColor}
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
  onPointerDown: (day: DayOfWeek, hour: number) => void;
  onPointerEnter: (day: DayOfWeek, hour: number) => void;
}

function AvailabilityRow({
  hour,
  slots,
  memberColor,
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
        return (
          <div
            key={`${day}-${hour}`}
            onPointerDown={() => onPointerDown(day, hour)}
            onPointerEnter={() => onPointerEnter(day, hour)}
            className={`h-7 cursor-pointer rounded-sm border transition-colors ${
              selected
                ? "border-transparent"
                : "border-slate-100 bg-white hover:bg-slate-50"
            }`}
            style={
              selected
                ? { backgroundColor: memberColor, opacity: 0.7 }
                : undefined
            }
          />
        );
      })}
    </>
  );
}
