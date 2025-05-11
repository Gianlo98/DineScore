"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";
import { FormEvent, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { redirect } from "next/navigation";

import PlaceAutocompleteDropdown from "@/components/PlaceAutocompleteDropdown";
import GoogleMap from "@/components/GoogleMap";
import { SessionStatus } from "@/types";
import { createVotingSession } from "@/actions/firebaseFunctions";
import { Place } from "@/components/GoogleMap";

export default function StartSession() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.currentTarget));
    const session = {
      date: new Date().toISOString(),
      name: data.place as string,
      placeId: data.place_id as string,
      numberOfGuests: data.guests as unknown as number,
      guests: [],
      guestsUid: [],
      status: "open" as SessionStatus,
    };

    const s = await createVotingSession(session);

    redirect(`/session/${s.id}`);
  };
  
  const handlePlaceSelect = (place: { place_id: string | null; place_name: string }) => {
    if (place.place_id) {
      setSelectedPlace({
        id: crypto.randomUUID(),
        name: place.place_name,
        placeId: place.place_id
      });
    } else {
      setSelectedPlace(null);
    }
  };

  return (
    <div className="flex items-center justify-center text-center">
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
        <DotLottieReact
          autoplay
          loop
          className="mx-auto"
          src="animations/session.lottie"
        />

        <h1 className="text-2xl font-medium">Start a Voting Session</h1>

        <Form
          className="w-full flex flex-col gap-4 py-8 mx-auto"
          validationBehavior="native"
          onSubmit={handleSubmit}
        >
          <PlaceAutocompleteDropdown
            label="Restaurant Name"
            name="place"
            placeholder="Vito Europalle"
            onSelect={handlePlaceSelect}
          />
          
          {selectedPlace && (
            <div className="w-full my-4">
              <GoogleMap 
                places={[selectedPlace]} 
                height="250px" 
                showInfo={true}
                initialZoom={15}
              />
            </div>
          )}

          <Input
            isRequired
            errorMessage="Please enter a valid number"
            label="Number of Guests"
            labelPlacement="outside"
            name="guests"
            placeholder="4"
            type="number"
          />
          <div className="w-full">
            <Button className="w-full" color="primary" type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
