/* This file handles creating and listing comments on tasks. */
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Comment, WorkspaceType } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

export async function createComment(input: {
  taskId: string;
  goalId: string;
  workspaceType: WorkspaceType;
  workspaceId: string;
  authorUserId: string;
  text: string;
}) {
  const payload: Omit<Comment, "id"> = {
    taskId: input.taskId,
    goalId: input.goalId,
    workspaceType: input.workspaceType,
    workspaceId: input.workspaceId,
    authorUserId: input.authorUserId,
    text: input.text,
    createdAt: nowIso(),
  };
  await addDoc(collection(db, "comments"), payload);
}

export async function listTaskComments(taskId: string): Promise<Comment[]> {
  const snapshot = await getDocs(
    query(collection(db, "comments"), where("taskId", "==", taskId)),
  );
  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as Comment,
  );
}
