import { useState, useCallback, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import type { AvailabilityGroup, Member, TimeSlot } from "../../domain/models/types";
import { getMemberColor } from "../services/color.service";
import { detectUserTimezone } from "../services/timezone.service";
import {
  sanitizeName,
  validateMemberInput,
  MAX_SLOTS_PER_MEMBER,
} from "../services/validation.service";
import { debounce } from "../services/throttle.service";
import * as repo from "../../infrastructure/persistence/firestore.repository";

const POOL_ID = "generation-alumni-council";

function createPool(): AvailabilityGroup {
  return {
    id: POOL_ID,
    name: "Generation Alumni Council",
    members: [],
    createdAt: Date.now(),
  };
}

export function useGroupStore() {
  const [group, setGroup] = useState<AvailabilityGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewTimezone, setViewTimezone] = useState<string>(detectUserTimezone);

  const debouncedUpdateAvailability = useMemo(
    () =>
      debounce((memberId: string, availability: TimeSlot[]) => {
        repo.updateMemberAvailability(POOL_ID, memberId, availability);
      }, 500),
    [],
  );

  useEffect(() => {
    const unsub = repo.subscribeToGroup(POOL_ID, (remote) => {
      if (remote) {
        setGroup(remote);
      } else {
        const fresh = createPool();
        setGroup(fresh);
        repo.createGroup(fresh);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const addMember = useCallback(
    (name: string, timezone: string) => {
      if (!group) return;
      const sanitized = sanitizeName(name);
      const validation = validateMemberInput(sanitized, group.members.length);
      if (!validation.valid) return;

      const member: Member = {
        id: uuidv4(),
        name: sanitized,
        timezone,
        availability: [],
        color: getMemberColor(group.members.length),
      };
      setGroup((prev) =>
        prev ? { ...prev, members: [...prev.members, member] } : prev,
      );
      repo.addMemberToGroup(POOL_ID, member);
    },
    [group],
  );

  const removeMember = useCallback(
    (memberId: string) => {
      if (!group) return;
      const member = group.members.find((m) => m.id === memberId);
      if (!member) return;
      setGroup((prev) =>
        prev
          ? { ...prev, members: prev.members.filter((m) => m.id !== memberId) }
          : prev,
      );
      repo.removeMemberFromGroup(POOL_ID, member);
    },
    [group],
  );

  const updateMemberAvailability = useCallback(
    (memberId: string, availability: TimeSlot[]) => {
      if (!group) return;
      const clamped = availability.slice(0, MAX_SLOTS_PER_MEMBER);
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.map((m) =>
                m.id === memberId ? { ...m, availability: clamped } : m,
              ),
            }
          : prev,
      );
      debouncedUpdateAvailability(memberId, clamped);
    },
    [group, debouncedUpdateAvailability],
  );

  return {
    group,
    loading,
    viewTimezone,
    setViewTimezone,
    addMember,
    removeMember,
    updateMemberAvailability,
  };
}
