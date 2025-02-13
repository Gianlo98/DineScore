"use server";

import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { Session, Guest } from "../types";

import { SESSION_COLLECTION } from "@/config/firebaseStorage";

// Create a new session
export const createVotingSession = async (
  session: Session,
): Promise<Session> => {
  try {
    const docRef = await addDoc(collection(db, SESSION_COLLECTION), session);

    return {
      ...session,
      id: docRef.id,
    };
  } catch (e) {
    throw e;
  }
};

// Add a guest to the session
export const addGuest = async (
  sessionId: string,
  guest: Guest,
): Promise<void> => {
  const sessionRef = doc(db, SESSION_COLLECTION, sessionId);

  await updateDoc(sessionRef, {
    guests: arrayUnion(guest),
  });
};

export const fetchSessions = async (): Promise<Session[]> => {
  const sessionsRef = collection(db, SESSION_COLLECTION);
  const querySnapshot = await getDocs(sessionsRef);

  const sessions: Session[] = querySnapshot.docs.map(
    (doc) => doc.data() as Session,
  );

  return sessions;
};

// Fetch session data
export const fetchSession = async (
  sessionId: string,
): Promise<Session | null> => {
  const sessionRef = doc(db, SESSION_COLLECTION, sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (sessionSnap.exists()) {
    return sessionSnap.data() as Session;
  } else {
    return null;
  }
};
