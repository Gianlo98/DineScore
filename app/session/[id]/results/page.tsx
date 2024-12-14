"use client";

import { useEffect, useState } from "react";
import { fetchSession } from "@/actions/firebaseFunctions";
import { Guest, Session } from "@/types";
import { Progress } from "@nextui-org/progress";
import { Card } from "@nextui-org/card";
import { Spacer } from "@nextui-org/spacer";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // Replace with your Firebase config path

export default function ResultsPage({ params }: { params: { id: string } }) {
    const { id: sessionId } = useParams<{ id: string }>();

    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [averages, setAverages] = useState<Record<string, number>>({});

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
        if (session && session.guests.length === session.numberOfGuests) {
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
            {} as Record<string, number>
        );

        const averages = Object.keys(totals).reduce((acc, key) => {
            acc[key] = totals[key] / session.guests.length;
            return acc;
        }, {} as Record<string, number>);

        setAverages(averages);
    };

    return (
        <>
            {loading ? (
                <h2>Loading...</h2>
            ) : session && session.guests.length < session.numberOfGuests ? (
                <>
                    <Progress
                        value={(session.guests.length / session.numberOfGuests) * 100}
                        color="primary"
                    />
                    <Spacer y={1.5} />
                    <h2 className="text-center">Waiting for all guests to vote...</h2>
                    <p className="text-center">
                        {session.guests.length} / {session.numberOfGuests} votes received
                    </p>
                </>
            ) : (
                <>
                    <h2 className="text-center">Results</h2>
                    <Spacer y={1.5} />
                    <div className="text-left">
                        {Object.entries(averages).map(([key, value]) => (
                            <p key={key} className="text-lg">
                                {key.charAt(0).toUpperCase() + key.slice(1)}: {value.toFixed(2)}
                            </p>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}