"use client";

import { useState } from "react";
import { createVotingSession } from "@/actions/firebaseFunctions";
import { SessionStatus } from "@/types";
import { redirect } from 'next/navigation'

export default function StartSession() {
  const [name, setName] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(0);
  // const router = useRouter();

  const handleSubmit = async () => {
    const session = {
      date: new Date().toISOString(),
      name,
      numberOfGuests,
      guests: [],
      status: "open" as SessionStatus,
    };

    const s = await createVotingSession(session)
    console.log("Session created", s);
    redirect(`/session/${s.id}`)

  };

  return (
    <div>
      <h1>Start a Voting Session</h1>
      <input placeholder="Session Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input
        placeholder="Number of Guests"
        type="number"
        value={numberOfGuests}
        onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
      />
      <button onClick={handleSubmit}>Start Session</button>
    </div>
  );
}