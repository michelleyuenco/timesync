import { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { AvailabilityGroup, Member, TimeSlot } from "../../domain/models/types";
import { getMemberColor } from "../services/color.service";
import { detectUserTimezone } from "../services/timezone.service";
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
  return params.get("group");
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

  // Initialize: load from URL or create new group
  useEffect(() => {
    const existingId = getGroupIdFromUrl();

    if (existingId) {
      // Subscribe to existing group in Firestore
      const unsub = repo.subscribeToGroup(existingId, (remoteGroup) => {
        if (remoteGroup) {
          isRemoteUpdate.current = true;
          setGroup(remoteGroup);
        } else {
          // Group not found — create fresh
          const fresh = createNewGroup();
          setGroup(fresh);
          setGroupIdInUrl(fresh.id);
          repo.createGroup(fresh);
        }
        setLoading(false);
      });
      return unsub;
    } else {
      // No group in URL — create new one
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
      const member: Member = {
        id: uuidv4(),
        name,
        timezone,
        availability: [],
        color: getMemberColor(group.members.length),
      };
      // Optimistic local update
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
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.map((m) =>
                m.id === memberId ? { ...m, availability } : m,
              ),
            }
          : prev,
      );
      repo.updateMemberAvailability(group.id, memberId, availability);
    },
    [group],
  );

  const updateGroupName = useCallback(
    (name: string) => {
      setGroup((prev) => (prev ? { ...prev, name } : prev));
    },
    [],
  );

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
