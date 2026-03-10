import type { TimeSlot, DayOfWeek } from "../../domain/models/types";
import { DAYS_OF_WEEK } from "../../domain/models/types";

const DAY_INDEX: Record<DayOfWeek, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

export function getTimezoneOffsetHours(timezone: string): number {
  const now = new Date();
  const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}

export function convertSlotToTimezone(
  slot: TimeSlot,
  fromTimezone: string,
  toTimezone: string,
): TimeSlot {
  const fromOffset = getTimezoneOffsetHours(fromTimezone);
  const toOffset = getTimezoneOffsetHours(toTimezone);
  const diff = toOffset - fromOffset;

  const dayIndex = DAY_INDEX[slot.day];
  let newHour = slot.hour + diff;
  let dayShift = 0;

  if (newHour >= 24) {
    dayShift = Math.floor(newHour / 24);
    newHour = newHour % 24;
  } else if (newHour < 0) {
    dayShift = Math.ceil(newHour / 24) - 1;
    newHour = ((newHour % 24) + 24) % 24;
  }

  const newDayIndex = ((dayIndex + dayShift) % 7 + 7) % 7;

  return {
    day: DAYS_OF_WEEK[newDayIndex],
    hour: Math.round(newHour),
  };
}

export function convertSlotsToTimezone(
  slots: TimeSlot[],
  fromTimezone: string,
  toTimezone: string,
): TimeSlot[] {
  return slots.map((slot) => convertSlotToTimezone(slot, fromTimezone, toTimezone));
}

export function detectUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}
