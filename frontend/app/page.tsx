"use client";

import { useState } from "react";
import Image from "next/image";
import { LuCalendar, LuMapPin, LuSparkles } from "react-icons/lu";
import { format } from "date-fns";

export default function Home() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const handleGenerateItinerary = () => {
    if (!destination || !startDate || !endDate) {
      return;
    }
    // TODO: Implement itinerary generation logic
    console.log("Generating itinerary for:", {
      destination,
      startDate,
      endDate,
    });
  };

  return (
    <div>
      <main className="min-h-screen flex flex-col justify-center items-center overflow-hidden">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LuSparkles className="w-8 h-8 text-white" />
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Itinera
            </h1>
          </div>
          <p className="text-xl md:text-2xl font-light">
            Your journey, perfectly planned
          </p>
          <p className="mt-8 text-sm">
            Discover optimized travel plans tailored to your preferences
          </p>
        </div>

        {/* Content */}
        <div className=" w-full flex items-center justify-between px-10">
          {/* Main Form Card */}
          <div className="w-full max-w-2xl">
            <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 text-card-foreground">
                Plan Your Trip
              </h2>

              <div className="space-y-6">
                {/* Destination Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="destination"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Where do you want to go?
                  </label>
                  <div className="relative">
                    <LuMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="destination"
                      type="text"
                      placeholder="Enter destination (e.g., Paris, Tokyo, New York)"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="pl-11 h-12 text-base w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                {/* Date Pickers */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Start Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowStartCalendar(!showStartCalendar)}
                      className={`w-full h-12 justify-start text-left font-normal inline-flex items-center rounded-md border border-input bg-background px-3 py-2 hover:bg-accent hover:text-accent-foreground
                        ${!startDate && "text-muted-foreground"}`}
                    >
                      <LuCalendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </button>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      End Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowEndCalendar(!showEndCalendar)}
                      className={`w-full h-12 justify-start text-left font-normal inline-flex items-center rounded-md border border-input bg-background px-3 py-2 hover:bg-accent hover:text-accent-foreground
                        ${!endDate && "text-muted-foreground"}`}
                    >
                      <LuCalendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  className="w-full h-14 text-lg font-semibold inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={handleGenerateItinerary}
                  disabled={!destination || !startDate || !endDate}
                >
                  <LuSparkles className="mr-2 h-5 w-5" />
                  Generate Itinerary
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
