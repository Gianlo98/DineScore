"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import Link from "next/link";
import { User } from "@firebase/auth";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";

import { useAuth } from "@/context/authContext";
import { useHistory } from "@/hooks/useHistory";
import { Session } from "@/types";
import GoogleMap from "@/components/GoogleMap";
import { subtitle } from "@/components/primitives";
import { Place } from "@/components/GoogleMap";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getMapsLink(session: Session) {
  if (!session.placeId) return "#";

  return `https://www.google.com/maps/place/?q=place_id:${session.placeId}`;
}

function getFinalScore(session: Session) {
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

  const total = Object.values(averages).reduce((sum, value) => sum + value, 0);

  return total;
}

function getAverage(session: Session, user: User) {
  if (!session || session.guests.length === 0) return;

  const userVote = session.guests.find((guest) => guest.uid === user.uid);

  if (!userVote) return;

  return Object.values(userVote.votes).reduce((sum, value) => sum + value, 0);
}

// Convert sessions to places for the map component
function getPlacesFromSessions(sessions: Session[]): Place[] {
  const uniquePlacesMap = new Map<string, Place>();
  
  sessions.forEach((session) => {
    if (session.placeId && !uniquePlacesMap.has(session.placeId)) {
      uniquePlacesMap.set(session.placeId, {
        id: session.id || crypto.randomUUID(),
        name: session.name,
        placeId: session.placeId
      });
    }
  });
  
  const places = Array.from(uniquePlacesMap.values());
  console.log("Places in history:", places.length, places);
  return places;
}

export default function Page() {
  const { user, loading } = useAuth();
  const { sessions, isLoading } = useHistory(user);

  if (isLoading || loading) {
    return <div>Loading...</div>;
  }
  if (user === null) {
    return <div>You need to be logged in to see your history.</div>;
  }

  const places = getPlacesFromSessions(sessions);

  return (
    <div className="w-full flex flex-col items-center">
      {places.length > 0 && (
        <div className="w-full max-w-5xl px-4 mb-8">
          <h2 className={subtitle({ class: "mb-4 text-center" })}>
            Your Pizza Adventure Map
          </h2>
          <GoogleMap 
            places={places} 
            height="400px" 
            showInfo={true}
            initialZoom={11}
          />
          <Divider className="my-8" />
        </div>
      )}
      
      <div className="w-full max-w-5xl px-4">
        <Table isStriped aria-label="Sessions history table">
          <TableHeader>
            <TableColumn>DATE</TableColumn>
            <TableColumn>PLACE</TableColumn>
            <TableColumn>YOUR SCORE</TableColumn>
            <TableColumn>FINAL SCORE</TableColumn>
            <TableColumn> </TableColumn>
          </TableHeader>
          <TableBody>
            <>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{formatDate(session.date)}</TableCell>
                  <TableCell>
                    {session.placeId ? (
                      <Link
                        className="text-blue-500"
                        href={getMapsLink(session)}
                        passHref={true}
                      >
                        {session.name}
                      </Link>
                    ) : (
                      session.name
                    )}
                  </TableCell>
                  <TableCell className="font-bold">
                    {getAverage(session, user)}
                  </TableCell>
                  <TableCell>{getFinalScore(session)}</TableCell>
                  <TableCell>
                    <Link as={`/history/${session.id}`} href="/history/[id]">
                      <Button color="primary">→</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
