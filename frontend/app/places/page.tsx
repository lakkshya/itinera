"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import axiosClient from "../api/axiosClient";
import LoadingScreen from "../components/LoadingScreen";

interface Place {
  name: string;
  description: string;
  read_more_link: string;
}

export default function PlacesPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const tripStart = searchParams.get("start");
  const tripEnd = searchParams.get("end");
  const tripLocation = searchParams.get("location");

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);

  const handleTogglePlace = (place: Place) => {
    setSelectedPlaces((prev) => {
      const alreadySelected = prev.some((p) => p.name === place.name);
      return alreadySelected
        ? prev.filter((p) => p.name !== place.name)
        : [...prev, place];
    });
  };

  const handleGenerateItinerary = async () => {
    if (selectedPlaces.length === 0) {
      alert("Please select at least one place and choose a trip mode!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        hotel: {
          name: "Hotel Start", // You can replace with actual user-selected hotel
          latitude: 28.6139, // Example: New Delhi coords
          longitude: 77.209,
        },
        places: selectedPlaces.map((p) => ({
          name: p.name,
          description: p.description,
          read_more_link: p.read_more_link,
        })),
        location: tripLocation,
        startDate: tripStart,
        endDate: tripEnd,
      };

      const response = await axiosClient.post(
        "/algorithm/generate-order",
        payload
      );

      if (response.data && response.data.optimizedOrder) {
        console.log("Optimized Itinerary:", response.data);

        // Example: redirect to itinerary result page with data
        const itineraryData = encodeURIComponent(
          JSON.stringify(response.data.optimizedOrder)
        );
        window.location.href = `/itinerary?data=${itineraryData}`;
      } else {
        throw new Error("Invalid itinerary response");
      }
    } catch (error) {
      console.log("Error generating itinerary:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        if (!sessionId) {
          setLoading(false);
          return;
        }

        const res = await axiosClient.get(`/ai/places/${sessionId}`);
        const data: { places: Place[] } =
          typeof res.data === "string" ? JSON.parse(res.data) : res.data;

        if (Array.isArray(data.places)) {
          setPlaces(data.places);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching places:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [sessionId]);

  return (
    <div>
      {loading && <LoadingScreen message="Generating itinerary..." />}

      <div className="flex flex-col gap-5 md:flex-row md:gap-0 md:h-screen">
        {/* LEFT PANEL */}
        <div className="w-full md:w-1/3 bg-[linear-gradient(to_right,#fcb045,#fd1d1d,#833ab4)] p-5 md:p-10 flex flex-col justify-between gap-10 md:fixed left-0 top-0 md:h-full shadow-md">
          {/* Header */}
          <div className="flex flex-col items-center md:items-start gap-5">
            <Image
              src="/logo-white.png"
              alt="Itinera Logo"
              width={400}
              height={400}
              className="w-2/3"
            />

            {/* Trip Summary */}
            <div className="w-full bg-white/20 border border-white/30 text-white text-sm rounded-lg p-4">
              <p className="font-semibold">📍 Trip Summary</p>
              <p>
                Location: <span className="font-medium">{tripLocation}</span>
              </p>
              <p>
                Start:{" "}
                <span className="font-medium">
                  {new Date(tripStart || "").toLocaleString()}
                </span>
              </p>
              <p>
                End:{" "}
                <span className="font-medium">
                  {new Date(tripEnd || "").toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <div>
            <p className="text-white mb-3">
              {selectedPlaces.length} place
              {selectedPlaces.length > 1 ? "s" : ""} selected
            </p>
            <button
              onClick={handleGenerateItinerary}
              disabled={selectedPlaces.length === 0}
              className={`w-full py-3 rounded-xl text-lg font-semibold transition ${
                selectedPlaces.length === 0
                  ? "bg-white/40 text-white cursor-not-allowed"
                  : "bg-white text-pink-800 hover:bg-amber-100"
              }`}
            >
              Generate Itinerary
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-2/3 md:ml-[33.33%] flex flex-col gap-5 p-5 md:p-10 overflow-y-auto">
          <h1 className="text-3xl font-bold">Select places</h1>
          {/* NOTE about max 5 places */}
          <div className="bg-gray-500/20 text-sm rounded-lg p-4">
            <p className="font-semibold">💡 Travel Tip:</p>
            <p>
              It’s always advisable to explore a maximum of{" "}
              <span className="font-bold">5 places in a day</span> for a relaxed
              and enjoyable experience. Select your places accordingly.
            </p>
          </div>

          {/* List of places */}
          <div className="grid grid-cols-1 gap-3">
            {places.map((place, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-5 rounded-2xl border shadow-md transition duration-300 cursor-pointer ${
                  selectedPlaces.some((p) => p.name === place.name)
                    ? "border-blue-700 bg-blue-50"
                    : "border-gray-200 bg-white hover:shadow-lg"
                }`}
                onClick={() => handleTogglePlace(place)}
              >
                <input
                  type="checkbox"
                  checked={selectedPlaces.some((p) => p.name === place.name)}
                  onChange={() => handleTogglePlace(place)}
                  className="mt-1 w-4 h-4 accent-blue-700 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-gray-800">
                      {place.name}
                    </h2>
                    <a
                      href={place.read_more_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-blue-800 hover:underline"
                    >
                      Read more
                    </a>
                  </div>
                  <p className="text-gray-600 text-sm">{place.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
