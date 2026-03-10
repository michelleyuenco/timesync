export const MAX_MEMBER_NAME_LENGTH = 50;
export const MAX_MEMBERS_PER_GROUP = 20;
export const MAX_SLOTS_PER_MEMBER = 168; // 24h * 7 days

export function sanitizeName(name: string): string {
  return name.trim().replace(/[<>"'&]/g, "").slice(0, MAX_MEMBER_NAME_LENGTH);
}

export function validateMemberInput(
  name: string,
  currentMemberCount: number,
): { valid: boolean; error?: string } {
  const sanitized = sanitizeName(name);
  if (sanitized.length === 0) {
    return { valid: false, error: "Name is required" };
  }
  if (sanitized.length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }
  if (currentMemberCount >= MAX_MEMBERS_PER_GROUP) {
    return { valid: false, error: `Maximum ${MAX_MEMBERS_PER_GROUP} members allowed` };
  }
  return { valid: true };
}

export function clampSlots(
  slots: { day: string; hour: number }[],
): { day: string; hour: number }[] {
  return slots.slice(0, MAX_SLOTS_PER_MEMBER).filter(
    (s) => typeof s.hour === "number" && s.hour >= 0 && s.hour <= 23,
  );
}
