"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { Divider } from "@heroui/divider";

import GoogleButton from "./GoogleButton";
import GoogleMap from "./GoogleMap";

import { title, subtitle } from "@/components/primitives";
import { useAuth } from "@/context/authContext";
import { usePlaces } from "@/hooks/usePlaces";

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { places, isLoading: placesLoading } = usePlaces(user);

  const phrases = [
    "🍕 Slice into your journey! sign up now and pile on those tasty scores!",
    "🍕 Hungry for high scores? Join us and let's serve up some cheesy perfection!",
    "🍕 Ready to top your life with something delicious? Sign up and dig into your scores!",
    "🍕 Fire up the oven, sign up, and let's bake your scores to perfection!",
    "🍕 Roll out the dough of destiny! join now to keep track of your score toppings!",
    "🍕 Don't just taste, track! Sign in to slice up your scores and share the pizza love.",
    "🍕 Let's toss out excuses and toss in some fun—sign up and start scoring!",
    "🍕 Score big, slice by slice! jump in now to see how high you can top your table!",
    "🍕 Extra cheese, extra fun! sign up to save every last crumb of your dining journey!",
    "🍕 We've got the crust, you bring the hunger! join now and let's dish out those scores!",
  ];

  const [randomPhrase, setRandomPhrase] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * phrases.length);

    setRandomPhrase(phrases[randomIndex]);
  }, []);

  if (loading) return;

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 w-full">
      {user === null ? (
        <>
          <div className="inline-block max-w-xl text-center justify-center">
            <span className={title()}>{randomPhrase}</span>
          </div>
          <GoogleButton />
        </>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center max-w-xl text-center mb-8">
            <Avatar
              className="w-30 h-30 mb-5"
              size="lg"
              src={user.photoURL || undefined}
            />
            <span className={title()}>
              👋 Welcome back, {user.displayName || "User"}!
            </span>
            <Button className="mt-5" onPress={() => router.push("/session")}>
              Start a New Session
            </Button>
          </div>
          
          {places.length > 0 && (
            <div className="w-full max-w-5xl px-4">
              <Divider className="my-4" />
              <h2 className={subtitle({ class: "mb-4 text-center" })}>
                Your Pizza Journey Map
              </h2>
              <GoogleMap 
                places={places} 
                height="400px" 
                showInfo={true}
                initialZoom={11}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
