import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { User } from "firebase/auth";

import { db } from "@/firebase/firebaseConfig";
import { Session } from "@/types";
import { SESSION_COLLECTION } from "@/config/firebaseStorage";

export const useHistory = (user: User | null) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    if (user === null) {
      setIsLoading(false);

      return;
    }
    const sessionsRef = collection(db, SESSION_COLLECTION);
    const q = query(
      sessionsRef,
      where("guestsUid", "array-contains", user.uid),
    );

    try {
      const querySnapshot = await getDocs(q);
      const sessionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Session[];

      setSessions(sessionsData);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const sessionsRef = collection(db, SESSION_COLLECTION);

    if (!user) {
      setIsLoading(false);

      return;
    }
    const q = query(
      sessionsRef,
      where("guests", "array-contains", { uid: user.uid }),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const updatedSessions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Session[];

        setSessions(updatedSessions);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error subscribing to sessions:", error);
        setIsLoading(false);
      },
    );

    fetchSessions();

    return () => unsubscribe();
  }, [fetchSessions]);

  return { sessions, isLoading };
};
