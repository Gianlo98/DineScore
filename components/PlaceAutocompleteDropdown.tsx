"use client";

import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useState, useEffect, useRef, ChangeEvent } from "react";

interface PlacePrediction {
  description: string;
  place_id: string;
}

interface PlaceDetails {
  name: string;
  formatted_address?: string;
  address_components?: google.maps.GeocoderAddressComponent[];
}

interface PlaceAutocompleteDropdownProps {
  name?: string; // for form integration
  value?: string;
  placeholder?: string;
  label?: string;
  onChange?: (value: string) => void;
  onSelect?: (place: { place_id: string | null; place_name: string }) => void;
}

// Helper to extract street and city from address components.
function getStreetAndCity(details: PlaceDetails): {
  street: string;
  city: string;
} {
  let streetNumber = "";
  let route = "";
  let city = "";

  if (details.address_components) {
    details.address_components.forEach((component) => {
      if (component.types.includes("street_number")) {
        streetNumber = component.long_name;
      }
      if (component.types.includes("route")) {
        route = component.long_name;
      }
      if (component.types.includes("locality")) {
        city = component.long_name;
      }
    });
  }
  // Combine street number and route if available.
  const street = streetNumber && route ? `${streetNumber} ${route}` : route;

  return { street, city };
}

export default function PlaceAutocompleteDropdown({
  name,
  value = "",
  placeholder = "Search for a restaurant",
  label = "Search for a restaurant",
  onChange,
  onSelect,
}: PlaceAutocompleteDropdownProps) {
  // Start with an empty text field (value) so that the placeholder is visible.
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [detailsMap, setDetailsMap] = useState<Record<string, PlaceDetails>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  // Hold the selected place_id; if no selection is made, it remains null.
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize the AutocompleteService.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.google &&
      !autocompleteService.current
    ) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
    }
  }, []);

  // Initialize the PlacesService using a hidden container.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.google &&
      containerRef.current &&
      !placesServiceRef.current
    ) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        containerRef.current,
      );
    }
  }, [containerRef]);

  // Fetch predictions with debounce.
  useEffect(() => {
    if (!inputValue) {
      setPredictions([]);

      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      autocompleteService.current?.getPlacePredictions(
        { input: inputValue, types: ["restaurant"], locationBias: "IP_BIAS" },
        (preds, status) => {
          setLoading(false);
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            preds
          ) {
            setPredictions(preds);
            preds.forEach((prediction) => {
              if (
                !detailsMap[prediction.place_id] &&
                placesServiceRef.current
              ) {
                placesServiceRef.current.getDetails(
                  {
                    placeId: prediction.place_id,
                    fields: ["name", "formatted_address", "address_components"],
                  },
                  (placeResult, statusDetail) => {
                    if (
                      statusDetail ===
                        window.google.maps.places.PlacesServiceStatus.OK &&
                      placeResult
                    ) {
                      setDetailsMap((prev) => ({
                        ...prev,
                        [prediction.place_id]: {
                          name: placeResult.name || prediction.description,
                          formatted_address: placeResult.formatted_address,
                          address_components: placeResult.address_components,
                        },
                      }));
                    }
                  },
                );
              }
            });
          } else {
            setPredictions([]);
          }
        },
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, detailsMap]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange && onChange(e.target.value);
    setSelectedPlaceId(null);
  };

  const handleSelect = (prediction: PlacePrediction) => {
    const details = detailsMap[prediction.place_id];
    const place_name = details?.name || prediction.description;

    setInputValue(place_name);
    setPredictions([]);
    setSelectedPlaceId(prediction.place_id);
    onSelect && onSelect({ place_id: prediction.place_id, place_name });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && predictions.length > 0) {
      e.preventDefault();
      handleSelect(predictions[0]);
    }
  };

  return (
    <div className="w-full">
      <Autocomplete
        fullWidth
        aria-label="Search for a place"
        classNames={{
          base: "max-w-xs",
          listboxWrapper: "max-h-[320px]",
          selectorButton: "text-default-500",
        }}
        defaultItems={predictions}
        inputProps={{
          name,
          value: inputValue,
          onChange: handleInputChange,
          onKeyDown: handleKeyDown,
          classNames: {
            input: "ml-1",
            inputWrapper: "h-[48px]",
          },
          placeholder,
        }}
        label={label}
        labelPlacement="outside"
        popoverProps={{
          offset: 10,
          classNames: {
            content: "p-1 border-small border-default-100 bg-background",
          },
        }}
      >
        {predictions.map((item: PlacePrediction) => {
          const details = detailsMap[item.place_id];
          const { street, city } =
            details && details.address_components
              ? getStreetAndCity(details)
              : { street: "", city: "" };

          return (
            <AutocompleteItem
              key={item.place_id}
              textValue={details?.name || item.description}
              onPress={() => handleSelect(item)}
            >
              <div className="flex flex-col">
                <span className="font-bold">
                  {details?.name || item.description}
                </span>
                {(street || city) && (
                  <span className="text-sm text-default-400">
                    {street}
                    {street && city ? ", " : ""}
                    {city}
                  </span>
                )}
              </div>
            </AutocompleteItem>
          );
        })}
      </Autocomplete>
      {/* Hidden container for PlacesService */}
      <div ref={containerRef} style={{ display: "none" }} />
      {/* Hidden input for form integration with placeID */}
      <input name="place_id" type="hidden" value={selectedPlaceId ?? ""} />
    </div>
  );
}
