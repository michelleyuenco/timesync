import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { AvailabilityGroup, Member, TimeSlot } from "../../domain/models/types";
import { getMemberColor } from "../services/color.service";
import { detectUserTimezone } from "../services/timezone.service";

function createDefaultGroup(): AvailabilityGroup {
  return {
    id: uuidv4(),
    name: "Generation Alumni Council",
    members: [],
    createdAt: Date.now(),
  };
}

export function useGroupStore() {
  const [group, setGroup] = useState<AvailabilityGroup>(createDefaultGroup);
  const [viewTimezone, setViewTimezone] = useState<string>(detectUserTimezone);

  const addMember = useCallback((name: string, timezone: string) => {
    setGroup((prev) => {
      const member: Member = {
        id: uuidv4(),
        name,
        timezone,
        availability: [],
        color: getMemberColor(prev.members.length),
      };
      return { ...prev, members: [...prev.members, member] };
    });
  }, []);

  const removeMember = useCallback((memberId: string) => {
    setGroup((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }));
  }, []);

  const updateMemberAvailability = useCallback(
    (memberId: string, availability: TimeSlot[]) => {
      setGroup((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m.id === memberId ? { ...m, availability } : m,
        ),
      }));
    },
    [],
  );

  const updateGroupName = useCallback((name: string) => {
    setGroup((prev) => ({ ...prev, name }));
  }, []);

  return {
    group,
    viewTimezone,
    setViewTimezone,
    addMember,
    removeMember,
    updateMemberAvailability,
    updateGroupName,
  };
}
