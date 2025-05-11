"use client";

import { useState } from "react";
import { redirect, useParams } from "next/navigation";
import { Input } from "@heroui/input";
import { Spacer } from "@heroui/spacer";
import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Textarea } from "@heroui/input";

import { Guest, GuestVote } from "@/types";
import { useAuth } from "@/context/authContext";
import { useSession } from "@/hooks/useSession";
import { QUESTIONS } from "@/config/questions";

export default function Page() {
  const { id: sessionId } = useParams<{ id: string }>();
  const { currentSession, isLoading, addGuest } = useSession(sessionId);
  const { user, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [meal, setMeal] = useState("");
  const [note, setNote] = useState("");
  const [votes, setVotes] = useState<GuestVote>({
    location: -1,
    service: -1,
    menu: -1,
    bill: -1,
    pizzaDough: -1,
    ingredients: -1,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (step === 1) {
      setMeal(e.target.value);
    } else {
      setNote(e.target.value);
    }
  };

  const getAnimation = () => {
    switch (step) {
      case 1:
        return "/animations/pizzeria.json";
      case 2:
        return "/animations/location.json";
      case 3:
        return "/animations/service.json";
      case 4:
        return "/animations/menu.lottie";
      case 5:
        return "/animations/bill.lottie";
      case 6:
        return "/animations/pizzaDough.lottie";
      case 7:
        return "/animations/ingredients.lottie";
      default:
        return "/animations/summary.json";
    }
  };

  const getHeadline = () => {
    if (step === 1) {
      return "Which pizza did you have?";
    }

    if (step === QUESTIONS.length + 2) {
      return "Your experience at " + currentSession!.name;
    }

    return "Rate the " + QUESTIONS[step - 2].question;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1 && !meal.trim()) {
      alert("Please enter a valid meal");
    }

    if (step === QUESTIONS.length + 2) {
      const guest: Guest = {
        name: user!.displayName || "Guest",
        meal,
        note: note,
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
    <div className="text-center mb-20">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="px-4 rounded-lg">
          <DotLottieReact
            autoplay
            loop
            backgroundColor="transparent"
            className="w-full mx-auto"
            src={getAnimation()}
          />
        </div>
      </div>
      <h1 className="text-3xl font-medium text-center mt-10">{getHeadline()}</h1>

      <Form
        className="w-full max-w-xs flex flex-col gap-4 mx-auto"
        validationBehavior="native"
        onSubmit={handleSubmit}
      >
        <Spacer y={1.5} />

        {step === 1 && (
          <Input
            fullWidth
            isRequired
            errorMessage="Please enter a valid pizza"
            labelPlacement="outside"
            name="meal"
            placeholder="Pizza Margherita"
            type="text"
            value={meal}
            onChange={handleInputChange}
          />
        )}
        {step > 1 && step <= QUESTIONS.length + 1 && (
          <div className="flex flex-col gap-4 w-full">
            <Spacer y={1} />
            <div className="flex justify-between gap-2 flex-col">
              {Array.from({ length: 5 }, (_, index) => (
                <Button
                  key={index + 1}
                  color={votes[QUESTIONS[step - 2].key] === index + 1 ? "primary" : "default"}
                  onPress={() => {
                    setVotes((prevVotes) => ({
                      ...prevVotes,
                      [QUESTIONS[step - 2].key]: index + 1,
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
        {step === QUESTIONS.length + 2 && (
          <div className="w-full py-4">
            <Table isStriped aria-label="Example static collection table">
              <TableHeader>
                <TableColumn>AREA</TableColumn>
                <TableColumn>SCORE</TableColumn>
              </TableHeader>
              <TableBody>
                <>
                  <TableRow key="meal">
                    <TableCell className="font-bold">Meal</TableCell>
                    <TableCell>{meal}</TableCell>
                  </TableRow>
                  {QUESTIONS.map((q) => (
                    <TableRow key={q.key}>
                      <TableCell className="font-bold">{q.question}</TableCell>
                      <TableCell>{votes[q.key]}</TableCell>
                    </TableRow>
                  ))}
                </>
              </TableBody>
            </Table>

            <Textarea
              fullWidth
              className="max-w-xs mt-10"
              errorMessage="Please enter a valid pizza"
              label="Personal Note"
              labelPlacement="outside"
              name="notes"
              placeholder="It was a great experience!"
              type="textarea"
              value={note}
              onChange={handleInputChange}
            />
          </div>
        )}
        <div className="flex justify-between gap-2 w-full">
          {step > 1 && (
            <Button
              color="default"
              type="button"
              onPress={() => setStep((prevStep) => prevStep - 1)}
            >
              Back
            </Button>
          )}
          <Button
            className="w-full"
            color="primary"
            type={step === QUESTIONS.length + 2 ? "submit" : "button"}
            onPress={() => step !== QUESTIONS.length + 2 && setStep((prevStep) => prevStep + 1)}
          >
            {step === QUESTIONS.length + 2 ? "Save" : "Next"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
