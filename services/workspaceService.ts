import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Workspace, WorkspaceMember } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createWorkspace(
  name: string,
  userId: string,
  userEmail: string
): Promise<Workspace> {
  const timestamp = nowIso();
  const inviteCode = generateInviteCode();

  const payload: Omit<Workspace, "id"> = {
    name,
    createdByUserId: userId,
    inviteCode,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const docRef = await addDoc(collection(db, "workspaces"), payload);
  const workspace: Workspace = { id: docRef.id, ...payload };

  const memberDocId = `${docRef.id}_${userId}`;
  const member: WorkspaceMember = {
    id: memberDocId,
    workspaceId: docRef.id,
    userId,
    userEmail,
    joinedAt: timestamp,
  };
  await setDoc(doc(db, "workspaceMembers", memberDocId), member);

  await updateDoc(doc(db, "users", userId), { workspaceId: docRef.id });

  return workspace;
}

export async function joinWorkspaceByInviteCode(
  inviteCode: string,
  userId: string,
  userEmail: string
): Promise<Workspace> {
  const snapshot = await getDocs(
    query(collection(db, "workspaces"), where("inviteCode", "==", inviteCode))
  );

  if (snapshot.empty) {
    throw new Error("Invalid invite code");
  }

  const wsDoc = snapshot.docs[0];
  const workspace = { id: wsDoc.id, ...wsDoc.data() } as Workspace;

  const memberDocId = `${workspace.id}_${userId}`;
  const existingMember = await getDoc(doc(db, "workspaceMembers", memberDocId));

  if (!existingMember.exists()) {
    const member: WorkspaceMember = {
      id: memberDocId,
      workspaceId: workspace.id,
      userId,
      userEmail,
      joinedAt: nowIso(),
    };
    await setDoc(doc(db, "workspaceMembers", memberDocId), member);
  }

  await updateDoc(doc(db, "users", userId), { workspaceId: workspace.id });

  return workspace;
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const snapshot = await getDoc(doc(db, "workspaces", workspaceId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Workspace;
}

export async function updateWorkspaceName(workspaceId: string, name: string) {
  await updateDoc(doc(db, "workspaces", workspaceId), {
    name,
    updatedAt: nowIso(),
  });
}

export async function updatePageBanner(
  workspaceId: string,
  pageKey: string,
  url: string | null
) {
  const docRef = doc(db, "workspaces", workspaceId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return;

  const data = snapshot.data();
  const pageBanners = { ...(data.pageBanners || {}), [pageKey]: url || null };
  if (!url) delete pageBanners[pageKey];

  await updateDoc(docRef, {
    pageBanners,
    updatedAt: nowIso(),
  });
}

export async function listWorkspaceMembers(
  workspaceId: string
): Promise<WorkspaceMember[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "workspaceMembers"),
      where("workspaceId", "==", workspaceId)
    )
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as WorkspaceMember
  );
}

export async function leaveWorkspace(workspaceId: string, userId: string) {
  const memberDocId = `${workspaceId}_${userId}`;
  await deleteDoc(doc(db, "workspaceMembers", memberDocId));
  await updateDoc(doc(db, "users", userId), { workspaceId: null });
}

export async function regenerateInviteCode(workspaceId: string): Promise<string> {
  const newCode = generateInviteCode();
  await updateDoc(doc(db, "workspaces", workspaceId), {
    inviteCode: newCode,
    updatedAt: nowIso(),
  });
  return newCode;
}
