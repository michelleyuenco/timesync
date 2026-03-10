export interface TimeSlot {
  day: DayOfWeek;
  hour: number; // 0-23
}

export interface Member {
  id: string;
  name: string;
  timezone: string;
  availability: TimeSlot[];
  color: string;
}

export interface ProposedTime {
  slot: TimeSlot;
  timezone: string;
  proposedBy: string; // member name
}

export interface AvailabilityGroup {
  id: string;
  name: string;
  members: Member[];
  proposedTime: ProposedTime | null;
  createdAt: number;
}

export interface OverlapCell {
  day: DayOfWeek;
  hour: number;
  memberIds: string[];
  count: number;
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
