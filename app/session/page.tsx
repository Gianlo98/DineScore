"use client";

import { redirect } from "next/navigation";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Form } from "@nextui-org/form";
import { FormEvent } from "react";

import { SessionStatus } from "@/types";
import { createVotingSession } from "@/actions/firebaseFunctions";

export default function StartSession() {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.currentTarget));

    const session = {
      date: new Date().toISOString(),
      name: data.name as string,
      numberOfGuests: data.guests as unknown as number,
      guests: [],
      status: "open" as SessionStatus,
    };

    const s = await createVotingSession(session);

    redirect(`/session/${s.id}`);
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-medium">Start a Voting Session</h1>

      <Form
        className="w-full max-w-xs flex flex-col gap-4 py-8 mx-auto"
        validationBehavior="native"
        onSubmit={handleSubmit}
      >
        <Input
          isRequired
          errorMessage="Please enter a valid name"
          label="Place name"
          labelPlacement="outside"
          name="place"
          placeholder="Enter the place name"
          type="text"
        />

        <Input
          isRequired
          errorMessage="Please enter a valid number"
          label="Number of Guests"
          labelPlacement="outside"
          name="guests"
          placeholder="Number of Guests"
          type="number"
        />
        <div className=" w-full">
          <Button className="w-full" color="primary" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
}
