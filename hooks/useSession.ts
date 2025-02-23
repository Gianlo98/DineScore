import { useEffect, useState, useCallback } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

import { db } from "@/firebase/firebaseConfig";
import { Guest, Session } from "@/types";
import { SESSION_COLLECTION } from "@/config/firebaseStorage";

export const useSession = (sessionId: string) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const subscribeToSession = useCallback(() => {
    const sessionDoc = doc(db, SESSION_COLLECTION, sessionId);

    return onSnapshot(
      sessionDoc,
      (snapshot) => {
        if (snapshot.exists()) {
          setCurrentSession({
            id: snapshot.id,
            ...snapshot.data(),
          } as unknown as Session);
        } else {
          setCurrentSession(null);
        }
        setIsLoading(false);
      },
      (_error) => {
        setIsLoading(false);
      },
    );
  }, [sessionId]);

  const fetchSession = useCallback(async () => {
    setIsLoading(true);
    const sessionDoc = doc(db, SESSION_COLLECTION, sessionId);

    try {
      const snapshot = await getDoc(sessionDoc);

      if (snapshot.exists()) {
        setCurrentSession({
          id: snapshot.id,
          ...snapshot.data(),
        } as unknown as Session);
      } else {
        setCurrentSession(null);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setIsLoading(false); // End loading
    }
  }, [sessionId]);

  const addGuest = useCallback(
    async (guest: Guest) => {
      const sessionDoc = doc(db, SESSION_COLLECTION, sessionId);

      try {
        await updateDoc(sessionDoc, {
          guests: arrayUnion(guest),
          guestsUid: arrayUnion(guest.uid),
        });
      } catch (error) {
        console.error("Error adding guest:", error);
      }
    },
    [sessionId],
  );

  useEffect(() => {
    const unsubscribe = subscribeToSession();

    fetchSession();

    return () => unsubscribe();
  }, [subscribeToSession, fetchSession]);

  return { currentSession, isLoading, addGuest };
};
