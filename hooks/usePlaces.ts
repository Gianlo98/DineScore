import { useEffect, useState, useCallback } from "react";
import { User } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

import { db } from "@/firebase/firebaseConfig";
import { Session } from "@/types";
import { SESSION_COLLECTION } from "@/config/firebaseStorage";
import { Place } from "@/components/GoogleMap";

export const usePlaces = (user: User | null) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    
    if (!user) {
      setIsLoading(false);
      return [];
    }

    try {
      const sessionsRef = collection(db, SESSION_COLLECTION);
      
      // Get all sessions first, then filter for the user
      const querySnapshot = await getDocs(sessionsRef);
      
      // Extract unique places with placeId
      const uniquePlacesMap = new Map<string, Place>();
      
      querySnapshot.docs.forEach((doc) => {
        const session = doc.data() as Session;
        const id = doc.id;
        
        // Check if this session has a placeId and if the user is in the guests array
        const userIsInSession = session.guests.some(guest => guest.uid === user.uid);
        
        if (session.placeId && !uniquePlacesMap.has(session.placeId) && userIsInSession) {
          uniquePlacesMap.set(session.placeId, {
            id,
            name: session.name,
            placeId: session.placeId
          });
        }
      });
      
      const uniquePlaces = Array.from(uniquePlacesMap.values());
      console.log("Places found:", uniquePlaces.length, uniquePlaces);
      setPlaces(uniquePlaces);
      return uniquePlaces;
    } catch (error) {
      console.error("Error fetching places:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return { places, isLoading, fetchPlaces };
};