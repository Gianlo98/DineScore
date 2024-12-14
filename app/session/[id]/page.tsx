"use client";

import { useState } from "react";
import { addGuest } from "@/actions/firebaseFunctions";
import { useParams } from "next/navigation";

export default function Page() {
  const { id: sessionId } = useParams<{ id: string }>();

  // Form state
  const [step, setStep] = useState(0); // Keeps track of the current step
  const [name, setName] = useState("");
  const [meal, setMeal] = useState("");
  const [votes, setVotes] = useState<Record<string, number>>({
    location: 0,
    service: 0,
    menu: 0,
    bill: 0,
    pizzaDough: 0,
    ingredients: 0,
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

  const handleNextStep = (value: string | number) => {
    if (step === 0) {
      setName(value as string);
    } else if (step === 1) {
      setMeal(value as string);
    } else {
      const voteKey = questions[step - 2].key;
      setVotes((prevVotes) => ({
        ...prevVotes,
        [voteKey]: Number(value),
      }));
    }

    if (step === questions.length + 1) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    const guest = { name, meal, votes };
    await addGuest(sessionId, guest);
    setIsSubmitted(true);
  };

  return (
    <div>
      {!isSubmitted ? (
        <>
          <h1>Vote for Session {sessionId}</h1>

          {step === 0 && (
            <div>
              <label>Your Name:</label>
              <input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button onClick={() => handleNextStep(name)}>Next</button>
            </div>
          )}

          {step === 1 && (
            <div>
              <label>Your Meal:</label>
              <input
                placeholder="Enter the meal you had"
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
              />
              <button onClick={() => handleNextStep(meal)}>Next</button>
            </div>
          )}

          {step > 1 && step <= questions.length + 1 && (
            <div>
              <label>{questions[step - 2].question}</label>
              <input
                type="number"
                min="1"
                max="5"
                onChange={(e) => handleNextStep(e.target.value)}
              />
              <button
                onClick={() => handleNextStep((votes[questions[step - 2].key] as number) || 0)}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <h2>Waiting for other results...</h2>
      )}
    </div>
  );
}