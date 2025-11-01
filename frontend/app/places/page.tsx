"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axiosClient from "../api/axiosClient";
import { LuSparkles } from "react-icons/lu";

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
  const [error, setError] = useState<string | null>(null);

  // ✅ Selection states
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [tripMode, setTripMode] = useState<"2w" | "4w" | null>(null);

  const handleTogglePlace = (place: Place) => {
    setSelectedPlaces((prev) => {
      const alreadySelected = prev.some((p) => p.name === place.name);
      return alreadySelected
        ? prev.filter((p) => p.name !== place.name)
        : [...prev, place];
    });
  };

  const handleGenerateItinerary = () => {
    if (selectedPlaces.length === 0 || !tripMode) {
      alert("Please select at least one place and choose a trip mode!");
      return;
    }

    // You can store selected places + mode for next screen
    localStorage.setItem("selectedPlaces", JSON.stringify(selectedPlaces));
    localStorage.setItem("tripMode", tripMode);

    // navigate to itinerary page (example)
    alert(
      `Generating itinerary for ${selectedPlaces.length} places by ${
        tripMode === "2w" ? "2-wheeler" : "4-wheeler"
      }`
    );
  };

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        if (!sessionId) {
          setError("Missing session ID.");
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
        setError("Failed to load places. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [sessionId]);

  // Loading / Error states
  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading places...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="flex flex-col md:flex-row md:h-screen">
      {/* LEFT PANEL */}
      <div className="w-full md:w-1/3 bg-[linear-gradient(to_right,#fcb045,#fd1d1d,#833ab4)] p-10 flex flex-col justify-between gap-10 md:fixed left-0 top-0 md:h-full shadow-md">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-10">
            <LuSparkles className="w-8 h-8 text-white" />
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Itinera
            </h1>
          </div>

          {/* Trip Summary */}
          <div className="bg-white/20 border border-white/30 text-white text-sm rounded-lg p-4">
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

        <div>
          <h2 className="text-white font-semibold mb-3 text-lg">
            Select Trip Mode
          </h2>

          {/* Trip mode selector */}
          <div className="flex gap-4">
            <button
              onClick={() => setTripMode("2w")}
              className={`px-4 py-2 rounded-xl border font-medium ${
                tripMode === "2w"
                  ? "bg-white text-pink-800 border-white"
                  : "bg-transparent text-white border-white hover:bg-white/20"
              }`}
            >
              🏍️ 2-Wheeler
            </button>

            <button
              onClick={() => setTripMode("4w")}
              className={`px-4 py-2 rounded-xl border font-medium ${
                tripMode === "4w"
                  ? "bg-white text-pink-800 border-white"
                  : "bg-transparent text-white border-white hover:bg-white/20"
              }`}
            >
              🚗 4-Wheeler
            </button>
          </div>
        </div>

        {/* ✅ NOTE about max 5 places */}
        <div className="bg-white/20 border border-white/30 text-white text-sm rounded-lg p-4">
          <p className="font-semibold">💡 Travel Tip:</p>
          <p>
            It’s always advisable to explore a maximum of{" "}
            <span className="font-bold">5 places in a day</span> for a relaxed
            and enjoyable experience. Select your places accordingly.
          </p>
        </div>

        {/* Generate Button */}
        <div>
          <p className="text-white mb-3">
            {selectedPlaces.length} place
            {selectedPlaces.length > 1 ? "s" : ""} selected
          </p>
          <button
            onClick={handleGenerateItinerary}
            disabled={selectedPlaces.length === 0 || !tripMode}
            className={`w-full py-3 rounded-xl text-lg font-semibold transition ${
              selectedPlaces.length === 0 || !tripMode
                ? "bg-white/40 text-white cursor-not-allowed"
                : "bg-white text-pink-800 hover:bg-amber-100"
            }`}
          >
            Generate Itinerary
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="md:ml-[33.33%] w-full md:w-2/3 overflow-y-auto p-10 grid grid-cols-1 gap-3">
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
  );
}
