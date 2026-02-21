/* This file contains Firestore reads/writes for teams and memberships. */
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Team, TeamMembership, TeamRole } from "@/types/models";

function nowIso(): string {
  return new Date().toISOString();
}

export async function createTeam(name: string, ownerUserId: string) {
  const timestamp = nowIso();
  const teamPayload: Omit<Team, "id"> = {
    name,
    ownerUserId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const teamRef = await addDoc(collection(db, "teams"), teamPayload);
  const ownerMembershipId = `${teamRef.id}_${ownerUserId}`;

  const membershipPayload: TeamMembership = {
    id: ownerMembershipId,
    teamId: teamRef.id,
    userId: ownerUserId,
    role: "owner",
    createdAt: timestamp,
  };

  await setDoc(doc(db, "teamMemberships", ownerMembershipId), membershipPayload);
}

export async function getTeamsForUser(userId: string): Promise<Team[]> {
  const membershipsSnapshot = await getDocs(
    query(collection(db, "teamMemberships"), where("userId", "==", userId)),
  );

  const memberships = membershipsSnapshot.docs.map((snapshot) =>
    snapshot.data(),
  ) as TeamMembership[];

  if (memberships.length === 0) {
    return [];
  }

  const teamIdList = memberships.map((membership) => membership.teamId);
  const teamSnapshot = await getDocs(
    query(collection(db, "teams"), where("__name__", "in", teamIdList)),
  );

  return teamSnapshot.docs.map(
    (snapshot) => ({ id: snapshot.id, ...snapshot.data() }) as Team,
  );
}

export async function getMembershipForUserInTeam(
  teamId: string,
  userId: string,
): Promise<TeamMembership | null> {
  const membershipId = `${teamId}_${userId}`;
  const snapshot = await getDoc(doc(db, "teamMemberships", membershipId));
  return snapshot.exists() ? (snapshot.data() as TeamMembership) : null;
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  const snapshot = await getDoc(doc(db, "teams", teamId));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...(snapshot.data() as Omit<Team, "id">) };
}

export async function addTeamMemberByEmail(
  teamId: string,
  role: TeamRole,
  email: string,
) {
  const userByEmailSnapshot = await getDocs(
    query(
      collection(db, "users"),
      where("emailLower", "==", email.toLowerCase()),
    ),
  );

  const userMatch = userByEmailSnapshot.docs[0];
  if (!userMatch) {
    throw new Error("No user found for that email address.");
  }

  const userData = userMatch.data() as { id?: string };
  const memberUserId = userData.id ?? userMatch.id;
  const membershipId = `${teamId}_${memberUserId}`;
  const membershipPayload: TeamMembership = {
    id: membershipId,
    teamId,
    userId: memberUserId,
    role,
    createdAt: nowIso(),
  };

  await setDoc(doc(db, "teamMemberships", membershipId), membershipPayload);
}
