"use client";

import { useEffect, useState } from "react";
import { Progress } from "@nextui-org/progress";
import { Card } from "@nextui-org/card";
import { Spacer } from "@nextui-org/spacer";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { Avatar, AvatarGroup } from "@nextui-org/avatar";

import { Session } from "@/types";
import { db } from "@/firebase/firebaseConfig";

export default function ResultsPage() {
  const { id: sessionId } = useParams<{ id: string }>();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [averages, setAverages] = useState<Record<string, number>>({});
  const [totalAverage, setTotalAverage] = useState<number | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0); // To control suspense effect

  useEffect(() => {
    const sessionRef = doc(db, "sessions", sessionId);

    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        setSession(doc.data() as Session);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [sessionId]);

  useEffect(() => {
    if (session && session.guests.length >= session.numberOfGuests) {
      calculateAverages();
    }
  }, [session]);

  const calculateAverages = () => {
    if (!session || session.guests.length === 0) return;

    const totals = session.guests.reduce(
      (acc, guest) => {
        Object.keys(guest.votes).forEach((key) => {
          const voteKey = key as keyof typeof guest.votes;

          acc[voteKey] = (acc[voteKey] || 0) + guest.votes[voteKey];
        });

        return acc;
      },
      {} as Record<string, number>,
    );

    const averages = Object.keys(totals).reduce(
      (acc, key) => {
        acc[key] = totals[key] / session.guests.length;

        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate total average
    const total = Object.values(averages).reduce(
      (sum, value) => sum + value,
      0,
    );

    setTotalAverage(total / Object.keys(averages).length);

    setAverages(averages);
  };

  // Suspense effect: Show one line every 5 seconds
  useEffect(() => {
    if (!loading && Object.keys(averages).length > 0) {
      const interval = setInterval(() => {
        setDisplayIndex((prevIndex) =>
          prevIndex < Object.keys(averages).length ? prevIndex + 1 : prevIndex,
        );
      }, 5000); // 5 seconds for each line

      return () => clearInterval(interval);
    }
  }, [averages, loading]);

  return (
    <div className="flex justify-center items-center">
      <Card className="max-w-md w-full p-6">
        {loading ? (
          <h2 className="text-center text-xl">Loading...</h2>
        ) : session && session.guests.length < session.numberOfGuests ? (
          <>
            <div className="flex flex-col items-center mb-4">
              <AvatarGroup isBordered>
                {session.guests.map((guest) => (
                  <Avatar key={guest.name} src={guest.photoURL} />
                ))}
              </AvatarGroup>
            </div>
            <Progress
              color="primary"
              value={(session.guests.length / session.numberOfGuests) * 100}
            />
            <Spacer y={1.5} />
            <h2 className="text-center text-xl">
              Waiting for all guests to vote...
            </h2>
            <p className="text-center">
              {session.guests.length} / {session.numberOfGuests} votes received
            </p>
          </>
        ) : (
          <>
            <h2 className="text-center text-2xl font-bold mb-4">Results</h2>
            <Spacer y={1.5} />
            <div className="text-left">
              {Object.entries(averages)
                .slice(0, displayIndex)
                .map(([key, value]) => (
                  <motion.p
                    key={key}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                    {value.toFixed(2)}
                  </motion.p>
                ))}
            </div>
            {displayIndex >= Object.keys(averages).length &&
              totalAverage !== null && (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-center text-xl font-bold">
                    Total Average: {totalAverage.toFixed(2)}
                  </h3>
                </motion.div>
              )}
          </>
        )}
      </Card>
    </div>
  );
}
