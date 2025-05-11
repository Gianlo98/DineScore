"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";

import { getMapMarkerColor } from "@/lib/score-utils";

export interface Place {
  id: string;
  name: string;
  placeId: string;
  score?: number;
}

interface GoogleMapProps {
  places: Place[];
  height?: string;
  width?: string;
  showInfo?: boolean;
  initialZoom?: number;
  className?: string;
}

export default function GoogleMap({
  places,
  height = "400px",
  width = "100%",
  showInfo = true,
  initialZoom = 12,
  className = "",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [activeMarker, setActiveMarker] = useState<google.maps.Marker | null>(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  // Check if Google Maps API is loaded
  useEffect(() => {
    const maxAttempts = 50; // 5 seconds max
    let attempts = 0;

    const checkGoogleMapsLoaded = () => {
      if (
        typeof window !== "undefined" &&
        window.google &&
        window.google.maps &&
        window.google.maps.Map &&
        window.google.maps.places
      ) {
        setGoogleLoaded(true);
        setError(null);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          setLoading(false);
          setError("Google Maps could not be loaded. Please check your internet connection.");
        } else {
          // Set a timeout to check again
          setTimeout(checkGoogleMapsLoaded, 100);
        }
      }
    };

    checkGoogleMapsLoaded();

    // Cleanup
    return () => {
      attempts = maxAttempts; // Stop checking
    };
  }, []);

  // Clean up markers when component unmounts
  useEffect(() => {
    return () => {
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [markers]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map || !googleLoaded) return;

    try {
      // Default center (can be updated later)
      const defaultCenter = { lat: 40.7128, lng: -74.006 };

      const newMap = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: initialZoom,
        mapId: "DINE_SCORE_MAP",
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      setMap(newMap);
      setLoading(false);
    } catch (error) {
      console.error("Error initializing Google Map:", error);
      setLoading(false);
    }
  }, [initialZoom, map, googleLoaded]);

  // Handle places changes
  useEffect(() => {
    if (
      !map ||
      places.length === 0 ||
      !googleLoaded ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places
    )
      return;

    // Store references to cleanup
    let markersToCleanup: google.maps.Marker[] = [];
    let activeInfoWindowToCleanup: google.maps.InfoWindow | null = null;

    // Clear previous markers and info windows
    const clearExistingMarkers = () => {
      markers.forEach((marker) => marker.setMap(null));
      if (activeInfoWindow) {
        activeInfoWindow.close();
      }
    };

    clearExistingMarkers();

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();
    const placesService = new google.maps.places.PlacesService(map);

    // Create custom pizza marker icon with color based on score
    const getCustomIcon = (score?: number) => {
      // Default color if no score is provided
      const fillColor = score !== undefined ? getMapMarkerColor(score) : "#FF9933";

      return {
        path: "M 0,0 m -12,-12 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0", // Circle
        fillColor: fillColor,
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#FFFFFF", // White border
        scale: 1,
        labelOrigin: new google.maps.Point(0, 0),
      };
    };

    // Track if component is mounted to prevent state updates after unmounting
    let isMounted = true;

    // Process each place
    let processedCount = 0;
    let errorCount = 0;

    places.forEach((place) => {
      if (!place.placeId) {
        processedCount++;

        return;
      }

      try {
        placesService.getDetails(
          {
            placeId: place.placeId,
            fields: ["name", "geometry", "formatted_address", "place_id"],
          },
          (placeDetails, status) => {
            if (!isMounted) return;

            processedCount++;

            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              placeDetails?.geometry?.location
            ) {
              const position = {
                lat: placeDetails.geometry.location.lat(),
                lng: placeDetails.geometry.location.lng(),
              };

              bounds.extend(position);

              const marker = new google.maps.Marker({
                position,
                map,
                title: placeDetails.name || place.name,
                animation: google.maps.Animation.DROP,
                icon: getCustomIcon(place.score),
              });

              markersToCleanup.push(marker);

              if (showInfo) {
                const infoWindow = new google.maps.InfoWindow({
                  content: `
                    <div style="padding: 8px;">
                      <h3 style="margin: 0 0 8px; font-weight: bold;">${placeDetails.name || place.name}</h3>
                      <p style="margin: 0;">${placeDetails.formatted_address || ""}</p>
                      ${
                        place.score
                          ? `<p style="margin: 4px 0 0; font-weight: bold; color: ${getMapMarkerColor(place.score)}">
                        Score: ${place.score.toFixed(1)}
                      </p>`
                          : ""
                      }
                    </div>
                  `,
                });

                marker.addListener("click", () => {
                  if (!isMounted) return;

                  // Close any open info window
                  if (activeInfoWindowToCleanup) {
                    activeInfoWindowToCleanup.close();
                  }

                  infoWindow.open(map, marker);
                  activeInfoWindowToCleanup = infoWindow;

                  // Only update state when necessary
                  if (isMounted) {
                    setActiveMarker(marker);
                    setActiveInfoWindow(infoWindow);
                  }
                });
              }

              newMarkers.push(marker);
            } else {
              console.error(`Error fetching place details for ${place.name}:`, status);
              errorCount++;
            }

            // If all places have been processed
            if (processedCount === places.length) {
              if (newMarkers.length > 0) {
                if (newMarkers.length === 1) {
                  // Center on the single marker
                  const position = newMarkers[0].getPosition();

                  if (position) {
                    map.setCenter(position);
                    map.setZoom(15);
                  }
                } else {
                  // Fit to show all markers
                  map.fitBounds(bounds);
                }

                // Only update markers state once at the end
                if (isMounted) {
                  setMarkers(newMarkers);
                }
              } else if (errorCount === places.length) {
                // All places failed to load
                setError("Could not display any locations on the map.");
              }
            }
          }
        );
      } catch (err) {
        console.error("Error in Places API call:", err);
        processedCount++;
        errorCount++;

        // Check if all places failed
        if (processedCount === places.length && newMarkers.length === 0) {
          setError("Could not display any locations on the map.");
        }
      }
    });

    // Cleanup function
    return () => {
      isMounted = false;
      markersToCleanup.forEach((marker) => marker.setMap(null));
      if (activeInfoWindowToCleanup) {
        activeInfoWindowToCleanup.close();
      }
    };
  }, [map, places, showInfo]); // Removed markers and activeInfoWindow from dependencies

  return (
    <Card className={`w-full overflow-hidden ${className}`}>
      <CardBody className="p-0">
        {loading && (
          <div className="flex items-center justify-center" style={{ height, width }}>
            <Spinner color="primary" />
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center text-danger" style={{ height, width }}>
            {error}
          </div>
        )}
        <div
          ref={mapRef}
          className="google-map-container"
          style={{ height, width, display: error ? "none" : "block" }}
        />
      </CardBody>
    </Card>
  );
}
