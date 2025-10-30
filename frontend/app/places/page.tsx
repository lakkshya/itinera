"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axiosClient from "../api/axiosClient";

// ✅ Define a proper type
interface Place {
  name: string;
  description: string;
  ideal_visit_time: string;
}

export default function PlacesPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  // ✅ Strongly typed state
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: unknown) {
        console.error("Error fetching places:", err);
        setError("Failed to load places. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [sessionId]);

  // ✅ Loading state
  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading places...</p>;

  // ✅ Error state
  if (error)
    return (
      <div className="text-center mt-10 text-red-600">
        <p>{error}</p>
      </div>
    );

  // ✅ Empty state
  if (places.length === 0)
    return (
      <p className="text-center mt-10 text-gray-500">
        No places found for this session.
      </p>
    );

  // ✅ Success render
  return (
    <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {places.map((place, i) => (
        <div
          key={i}
          className="p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-300"
        >
          <h2 className="font-bold text-xl mb-2 text-gray-800">{place.name}</h2>
          <p className="text-gray-600 text-sm mb-2">{place.description}</p>
          <p className="text-blue-700 text-sm">
            🕒 Best time: {place.ideal_visit_time}
          </p>
        </div>
      ))}
    </div>
  );
}
