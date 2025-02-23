"use client";

import { useEffect, useState } from "react";
import { Progress } from "@heroui/progress";
import { Card, CardBody } from "@heroui/card";
import { Spacer } from "@heroui/spacer";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";

import { Session } from "@/types";
import { db } from "@/firebase/firebaseConfig";
import { SESSION_COLLECTION } from "@/config/firebaseStorage";
import { QUESTIONS } from "@/config/questions";
import { TextEffect } from "@/components/ui/text-effect";

export default function ResultsPage() {
  const { id: sessionId } = useParams<{ id: string }>();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [averages, setAverages] = useState<Record<string, number>>({});
  const [totalAverage, setTotalAverage] = useState<number | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    const sessionRef = doc(db, SESSION_COLLECTION, sessionId);

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

  const sortedGuests = session
    ? [...session.guests].sort((a, b) => {
        const totalVotesA = Object.values(a.votes).reduce(
          (acc, vote) => acc + vote,
          0,
        );
        const totalVotesB = Object.values(b.votes).reduce(
          (acc, vote) => acc + vote,
          0,
        );

        return totalVotesB - totalVotesA;
      })
    : [];

  return (
    <div className="flex justify-center items-center">
      {loading ? (
        <h2 className="text-center text-xl">Loading...</h2>
      ) : session && session.guests.length < session.numberOfGuests ? (
        <Card className="max-w-md w-full p-6">
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
        </Card>
      ) : Object.entries(averages).length < 3 ? (
        <h2 className="text-center text-xl">Calculating...</h2>
      ) : (
        <div className="flex flex-col items-center">
          <h2 className="text-center text-4xl font-bold mb-4">Results</h2>
          <Spacer y={1.5} />
          <Table
            isStriped
            aria-label="Results table"
            className="min-w-md"
            style={{ width: "300px" }}
          >
            <TableHeader>
              <TableColumn>AREA</TableColumn>
              <TableColumn>SCORE</TableColumn>
            </TableHeader>
            <TableBody>
              {QUESTIONS.map(({ key, question }, index) => (
                <TableRow key={key}>
                  <TableCell className="font-bold">{question}</TableCell>
                  <TableCell>
                    <TextEffect delay={(0 + index) * 5} per="char">
                      {`${averages[key].toFixed(2)}`}
                    </TextEffect>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {displayIndex >= Object.keys(averages).length &&
            totalAverage !== null && (
              <>
                <Spacer y={1.5} />
                <Card
                  fullWidth
                  className="bg-black text-white text-center text-xl font-bold"
                >
                  <CardBody className="text-center">
                    Final Score : {totalAverage.toFixed(2)}
                  </CardBody>
                </Card>
              </>
            )}

          {displayIndex >= Object.keys(averages).length && (
            <>
              <Spacer y={1.5} />
              <h2 className="text-center text-4xl font-bold mb-4 mt-20">
                Diners
              </h2>
              <Table
                isStriped
                aria-label="Leaderboard table"
                className="min-w-md"
                style={{ width: "300px" }}
              >
                <TableHeader>
                  <TableColumn>Avatar</TableColumn>
                  <TableColumn>Name</TableColumn>
                  <TableColumn>Total Score</TableColumn>
                </TableHeader>
                <TableBody>
                  {sortedGuests.map((guest) => {
                    const totalVotes = Object.values(guest.votes).reduce(
                      (acc, vote) => acc + vote,
                      0,
                    );

                    return (
                      <TableRow key={guest.name}>
                        <TableCell>
                          <Avatar src={guest.photoURL} />
                        </TableCell>
                        <TableCell>{guest.name}</TableCell>
                        <TableCell>{totalVotes}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
