import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { AvailabilityGroup, Member, TimeSlot } from "../../domain/models/types";

const COLLECTION = "groups";

export async function createGroup(group: AvailabilityGroup): Promise<void> {
  await setDoc(doc(db, COLLECTION, group.id), {
    id: group.id,
    name: group.name,
    members: group.members,
    createdAt: group.createdAt,
  });
}

export async function getGroup(groupId: string): Promise<AvailabilityGroup | null> {
  const snap = await getDoc(doc(db, COLLECTION, groupId));
  if (!snap.exists()) return null;
  return snap.data() as AvailabilityGroup;
}

export async function addMemberToGroup(
  groupId: string,
  member: Member,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, groupId), {
    members: arrayUnion(member),
  });
}

export async function removeMemberFromGroup(
  groupId: string,
  member: Member,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, groupId), {
    members: arrayRemove(member),
  });
}

export async function updateMemberAvailability(
  groupId: string,
  memberId: string,
  availability: TimeSlot[],
): Promise<void> {
  const group = await getGroup(groupId);
  if (!group) return;

  const updatedMembers = group.members.map((m) =>
    m.id === memberId ? { ...m, availability } : m,
  );

  await updateDoc(doc(db, COLLECTION, groupId), {
    members: updatedMembers,
  });
}

export function subscribeToGroup(
  groupId: string,
  callback: (group: AvailabilityGroup | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, COLLECTION, groupId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(snap.data() as AvailabilityGroup);
  });
}
