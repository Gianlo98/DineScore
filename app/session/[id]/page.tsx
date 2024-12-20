"use client";

import { useState } from "react";
import { redirect, useParams } from "next/navigation";
import { Input } from "@nextui-org/input";
import { Progress } from "@nextui-org/progress";
import { Spacer } from "@nextui-org/spacer";
import { Form } from "@nextui-org/form";
import { Button } from "@nextui-org/button";

import { Guest, GuestVote } from "@/types";
import { useAuth } from "@/context/authContext";
import { useSession } from "@/hooks/useSession";

export default function Page() {
  const { id: sessionId } = useParams<{ id: string }>();
  const { currentSession, isLoading, addGuest } = useSession(sessionId);
  const { user, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [meal, setMeal] = useState("");
  const [votes, setVotes] = useState<GuestVote>({
    location: -1,
    service: -1,
    menu: -1,
    bill: -1,
    pizzaDough: -1,
    ingredients: -1,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions: {
    key: keyof GuestVote;
    question: string;
  }[] = [
    { key: "location", question: "Rate the location:" },
    { key: "service", question: "Rate the service:" },
    { key: "menu", question: "Rate the menu:" },
    { key: "bill", question: "Rate the bill:" },
    { key: "pizzaDough", question: "Rate the pizza dough:" },
    { key: "ingredients", question: "Rate the ingredients:" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (step === 1) {
      setMeal(e.target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1 && !meal.trim()) {
      alert("Please enter a valid meal");

      return;
    }

    if (step === questions.length + 2) {
      const guest: Guest = {
        name: user!.displayName || "Guest",
        meal,
        photoURL: user!.photoURL || undefined,
        uid: user!.uid,
        votes,
      };

      try {
        await addGuest(guest);
        setIsSubmitted(true);
      } catch (error) {
        console.error("Error submitting guest data:", error);
      }

      return;
    }

    setStep((prevStep) => prevStep + 1);
  };

  if (isSubmitted) {
    redirect(`/session/${sessionId}/results`);
  }

  if (loading || isLoading) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-medium">Loading...</h1>
      </div>
    );
  }

  if (!user || user === null || currentSession === null) {
    redirect(`/`);
  }

  if (currentSession.guests.some((g) => g.uid === user.uid)) {
    setIsSubmitted(true);
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-medium">
        Your experience at {currentSession.name}
      </h1>
      <Form
        className="w-full max-w-xs flex flex-col gap-4 py-8 mx-auto"
        validationBehavior="native"
        onSubmit={handleSubmit}
      >
        <Progress
          color="primary"
          value={(step / (questions.length + 2)) * 100}
        />
        <Spacer y={1.5} />

        {step === 1 && (
          <Input
            fullWidth
            isRequired
            errorMessage="Please enter a valid meal"
            label="Your Meal"
            labelPlacement="outside"
            name="meal"
            placeholder="Pizza Margherita"
            type="text"
            value={meal}
            onChange={handleInputChange}
          />
        )}
        {step > 1 && step <= questions.length + 1 && (
          <div className="flex flex-col gap-4 w-full">
            <h3 className="text-center">{questions[step - 2].question}</h3>
            <Spacer y={1} />
            <div className="flex justify-between gap-2 flex-col">
              {Array.from({ length: 5 }, (_, index) => (
                <Button
                  key={index + 1}
                  color={
                    votes[questions[step - 2].key] === index + 1
                      ? "primary"
                      : "default"
                  }
                  onClick={() => {
                    setVotes((prevVotes) => ({
                      ...prevVotes,
                      [questions[step - 2].key]: index + 1,
                    }));
                    setStep((prevStep) => prevStep + 1); // Move to the next step
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
        {step === questions.length + 2 && (
          <div className="w-full py-4">
            <h3 className="text-center text-2xl">Summary</h3>
            <ul className="text-left">
              <li>
                <strong>Meal:</strong> {meal}
              </li>
              {questions.map((q) => (
                <li key={q.key}>
                  <strong>{q.question}</strong> {votes[q.key]}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-between gap-2 w-full">
          {step > 1 && (
            <Button
              color="default"
              type="button"
              onClick={() => setStep((prevStep) => prevStep - 1)}
            >
              Back
            </Button>
          )}
          <Button
            className="w-full"
            color="primary"
            type={step === questions.length + 2 ? "submit" : "button"}
            onClick={() =>
              step !== questions.length + 2 &&
              setStep((prevStep) => prevStep + 1)
            }
          >
            {step === questions.length + 2 ? "Submit" : "Next"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
