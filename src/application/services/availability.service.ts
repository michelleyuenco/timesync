import type { Member, OverlapCell, TimeSlot, DayOfWeek } from "../../domain/models/types";
import { DAYS_OF_WEEK, HOURS } from "../../domain/models/types";
import { convertSlotsToTimezone } from "./timezone.service";

export function computeOverlap(
  members: Member[],
  viewTimezone: string,
): OverlapCell[] {
  const grid: Map<string, string[]> = new Map();

  for (const member of members) {
    const convertedSlots = convertSlotsToTimezone(
      member.availability,
      member.timezone,
      viewTimezone,
    );

    for (const slot of convertedSlots) {
      const key = `${slot.day}-${slot.hour}`;
      const existing = grid.get(key) ?? [];
      if (!existing.includes(member.id)) {
        existing.push(member.id);
      }
      grid.set(key, existing);
    }
  }

  const cells: OverlapCell[] = [];

  for (const day of DAYS_OF_WEEK) {
    for (const hour of HOURS) {
      const key = `${day}-${hour}`;
      const memberIds = grid.get(key) ?? [];
      cells.push({
        day,
        hour,
        memberIds,
        count: memberIds.length,
      });
    }
  }

  return cells;
}

export function findBestSlots(
  overlap: OverlapCell[],
  totalMembers: number,
): OverlapCell[] {
  if (totalMembers === 0) return [];
  const maxCount = Math.max(...overlap.map((c) => c.count));
  if (maxCount === 0) return [];
  return overlap.filter((c) => c.count === maxCount);
}

export function slotKey(slot: TimeSlot): string {
  return `${slot.day}-${slot.hour}`;
}

export function isSlotSelected(
  slots: TimeSlot[],
  day: DayOfWeek,
  hour: number,
): boolean {
  return slots.some((s) => s.day === day && s.hour === hour);
}

export function toggleSlot(
  slots: TimeSlot[],
  day: DayOfWeek,
  hour: number,
): TimeSlot[] {
  if (isSlotSelected(slots, day, hour)) {
    return slots.filter((s) => !(s.day === day && s.hour === hour));
  }
  return [...slots, { day, hour }];
}
