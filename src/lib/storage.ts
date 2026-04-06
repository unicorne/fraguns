// Local storage helpers

// --- Global user ---
export interface UserInfo {
  userId: string;
  username: string;
}

const USER_KEY = "fraguns_user";

export function getStoredUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function storeUser(info: UserInfo) {
  localStorage.setItem(USER_KEY, JSON.stringify(info));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

// --- Per-group member info ---
export interface MemberInfo {
  memberId: string;
  memberName: string;
  groupId: string;
  groupName: string;
  inviteCode: string;
}

const MEMBERS_KEY = "fraguns_members";

export function getStoredMembers(): Record<string, MemberInfo> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(MEMBERS_KEY) || "{}");
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
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function setAllMembers(memberships: MemberInfo[]) {
  const members: Record<string, MemberInfo> = {};
  for (const m of memberships) {
    members[m.groupId] = m;
  }
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function getAllGroups(): MemberInfo[] {
  return Object.values(getStoredMembers());
}
