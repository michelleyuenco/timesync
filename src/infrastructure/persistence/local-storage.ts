import type { AvailabilityGroup } from "../../domain/models/types";

const STORAGE_KEY = "timesync_group";

export function saveGroup(group: AvailabilityGroup): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(group));
  } catch {
    // Storage full or unavailable — silent fail for MVP
  }
}

export function loadGroup(): AvailabilityGroup | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as AvailabilityGroup) : null;
  } catch {
    return null;
  }
}

export function clearGroup(): void {
  localStorage.removeItem(STORAGE_KEY);
}
