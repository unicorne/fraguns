// Local storage helpers for member identity

interface MemberInfo {
  memberId: string;
  memberName: string;
  groupId: string;
  groupName: string;
}

const STORAGE_KEY = "fraguns_members";

export function getStoredMembers(): Record<string, MemberInfo> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getMemberForGroup(groupId: string): MemberInfo | null {
  const members = getStoredMembers();
  return members[groupId] || null;
}

export function storeMember(info: MemberInfo) {
  const members = getStoredMembers();
  members[info.groupId] = info;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export function getAllGroups(): MemberInfo[] {
  return Object.values(getStoredMembers());
}
