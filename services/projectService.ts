import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Project } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

export async function createProject(
  workspaceId: string,
  userId: string,
  data: { name: string }
): Promise<string> {
  const timestamp = nowIso();
  const payload: Omit<Project, "id"> = {
    workspaceId,
    createdByUserId: userId,
    name: data.name,
    description: "",
    status: "not_started",
    gitRepo: "",
    link: "",
    content: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const docRef = await addDoc(collection(db, "projects"), payload);
  return docRef.id;
}

export async function listProjects(workspaceId: string): Promise<Project[]> {
  const snapshot = await getDocs(
    query(collection(db, "projects"), where("workspaceId", "==", workspaceId))
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as Project
  );
}

export async function getProject(projectId: string): Promise<Project | null> {
  const snapshot = await getDoc(doc(db, "projects", projectId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Project;
}

export async function updateProject(
  projectId: string,
  data: Partial<
    Pick<Project, "name" | "description" | "status" | "gitRepo" | "link" | "content" | "coverImage" | "icon">
  >
) {
  await updateDoc(doc(db, "projects", projectId), {
    ...data,
    updatedAt: nowIso(),
  });
}

export async function deleteProject(projectId: string) {
  await deleteDoc(doc(db, "projects", projectId));
}
