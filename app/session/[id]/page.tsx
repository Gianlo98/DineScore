"use client";

import { SetStateAction, useEffect, useState } from "react";
import { addGuest } from "@/actions/firebaseFunctions";
import { redirect, useParams } from "next/navigation";
import { Guest, GuestVote } from "@/types";
import { Input } from "@nextui-org/input";
import { Progress } from "@nextui-org/progress";
import { Card } from "@nextui-org/card";
import { Spacer } from "@nextui-org/spacer";
import { Button } from "@nextui-org/button";

export default function Page() {
  const { id: sessionId } = useParams<{ id: string }>();

  const [step, setStep] = useState(0); // Keeps track of the current step
  const [name, setName] = useState("");
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

  const questions = [
    { key: "location", question: "Rate the location (1-5):" },
    { key: "service", question: "Rate the service (1-5):" },
    { key: "menu", question: "Rate the menu (1-5):" },
    { key: "bill", question: "Rate the bill (1-5):" },
    { key: "pizzaDough", question: "Rate the pizza dough (1-5):" },
    { key: "ingredients", question: "Rate the ingredients (1-5):" },
  ];

  const handleNextStep = (value?: number | string) => {
    console.log("Handling next step with value:", value);
    if (step > 1 && value !== undefined) {
      const voteKey = questions[step - 2].key;
      console.log("Setting vote for", voteKey, "to", value);
      setVotes((prevVotes) => ({
        ...prevVotes,
        [voteKey]: value,
      }));
    }

    setStep((prevStep) => prevStep + 1);
  };

  useEffect(() => {
    if (step === questions.length + 2) {
      handleSubmit();
    }
  }, [step])

  const handleSubmit = async () => {
    const guest: Guest = {
      name: name,
      meal: meal,
      votes,
    };

    try {
      console.log("Submitting guest data:", guest);
      await addGuest(sessionId, guest);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting guest data:", error);
    }
  };

  if (isSubmitted) {
    redirect(`/session/${sessionId}/results`);
  }

  return (
    <>
      <Progress
        value={(step / (questions.length + 2)) * 100}
        color="primary"

      />
      <Spacer y={1.5} />

      {step === 0 && (
        <div>
          <Input
            label="Your Name"
            placeholder="Enter your name"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Spacer y={1} />
          <button
            onClick={() => handleNextStep(1)}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <Input
            label="Your Meal"
            placeholder="Enter the meal you had"
            fullWidth
            value={meal}
            onChange={e => setMeal(e.target.value)}
          />
          <Spacer y={1} />
          <button
            onClick={() => handleNextStep(1)}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {step > 1 && step <= questions.length + 1 && (
        <div>
          <h3 className="text-center">{questions[step - 2].question}</h3>
          <Spacer y={1} />
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => handleNextStep(value)}
                className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 :outline-none focus:ring focus:ring-primary-300"
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}