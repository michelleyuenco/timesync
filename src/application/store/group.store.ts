import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import type { AvailabilityGroup, Member, TimeSlot } from "../../domain/models/types";
import { getMemberColor } from "../services/color.service";
import { detectUserTimezone } from "../services/timezone.service";
import {
  isValidGroupId,
  sanitizeName,
  validateMemberInput,
  MAX_SLOTS_PER_MEMBER,
} from "../services/validation.service";
import { debounce } from "../services/throttle.service";
import * as repo from "../../infrastructure/persistence/firestore.repository";

function createNewGroup(): AvailabilityGroup {
  return {
    id: uuidv4(),
    name: "Generation Alumni Council",
    members: [],
    createdAt: Date.now(),
  };
}

function getGroupIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("group");
  return isValidGroupId(id) ? id : null;
}

function setGroupIdInUrl(groupId: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set("group", groupId);
  window.history.replaceState({}, "", url.toString());
}

export function useGroupStore() {
  const [group, setGroup] = useState<AvailabilityGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewTimezone, setViewTimezone] = useState<string>(detectUserTimezone);
  const isRemoteUpdate = useRef(false);

  // Debounced availability write to Firestore (avoids flooding during drag-select)
  const debouncedUpdateAvailability = useMemo(
    () =>
      debounce((groupId: string, memberId: string, availability: TimeSlot[]) => {
        repo.updateMemberAvailability(groupId, memberId, availability);
      }, 500),
    [],
  );

  // Initialize: load from URL or create new group
  useEffect(() => {
    const existingId = getGroupIdFromUrl();

    if (existingId) {
      const unsub = repo.subscribeToGroup(existingId, (remoteGroup) => {
        if (remoteGroup) {
          isRemoteUpdate.current = true;
          setGroup(remoteGroup);
        } else {
          const fresh = createNewGroup();
          setGroup(fresh);
          setGroupIdInUrl(fresh.id);
          repo.createGroup(fresh);
        }
        setLoading(false);
      });
      return unsub;
    } else {
      const fresh = createNewGroup();
      setGroup(fresh);
      setGroupIdInUrl(fresh.id);
      repo.createGroup(fresh);
      setLoading(false);

      const unsub = repo.subscribeToGroup(fresh.id, (remoteGroup) => {
        if (remoteGroup) {
          isRemoteUpdate.current = true;
          setGroup(remoteGroup);
        }
      });
      return unsub;
    }
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
      repo.addMemberToGroup(group.id, member);
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
      repo.removeMemberFromGroup(group.id, member);
    },
    [group],
  );

  const updateMemberAvailability = useCallback(
    (memberId: string, availability: TimeSlot[]) => {
      if (!group) return;

      // Enforce slot limit
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
      debouncedUpdateAvailability(group.id, memberId, clamped);
    },
    [group, debouncedUpdateAvailability],
  );

  const updateGroupName = useCallback((name: string) => {
    const sanitized = sanitizeName(name);
    if (!sanitized) return;
    setGroup((prev) => (prev ? { ...prev, name: sanitized } : prev));
    if (group) {
      repo.updateGroupName(group.id, sanitized);
    }
  }, [group]);

  const shareUrl = group
    ? `${window.location.origin}${window.location.pathname}?group=${group.id}`
    : "";

  return {
    group,
    loading,
    viewTimezone,
    setViewTimezone,
    addMember,
    removeMember,
    updateMemberAvailability,
    updateGroupName,
    shareUrl,
  };
}
