"use client";
import { useState, useEffect, useRef } from "react";
import { LuLocate } from "react-icons/lu";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

interface GeoapifyResult {
  properties: { formatted: string };
}

export default function LocationInput({
  value,
  onChange,
  error,
}: LocationInputProps) {
  const locationRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUserSelecting, setIsUserSelecting] = useState(false); // 👈 new state

  const fetchCities = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY!;
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&limit=6&apiKey=${API_KEY}`
      );
      const data = await res.json();
      const cityNames = data.features.map(
        (item: GeoapifyResult) => item.properties.formatted
      );
      setSuggestions(cityNames);
      setShowDropdown(true);
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced API call — skips if user just selected
  useEffect(() => {
    if (!showDropdown || isUserSelecting) return; // don't fetch right after selection

    const timeout = setTimeout(() => fetchCities(value), 400);
    return () => clearTimeout(timeout);
  }, [value, showDropdown, isUserSelecting]);

  const handleSelect = (city: string) => {
    setIsUserSelecting(true);
    onChange(city);
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div
      onClick={() => locationRef.current?.focus()}
      className="relative min-w-64 flex flex-col gap-1 overflow-visible"
    >
      <div
        className={`flex flex-col hover:bg-gray-100 px-3 py-3 rounded-2xl border transition-colors bg-white ${
          error ? "border-2 border-red-400" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <LuLocate />
          <span>Location</span>
        </div>

        <input
          ref={locationRef}
          type="text"
          placeholder="Search destinations"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsUserSelecting(false); 
            setShowDropdown(true);
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="w-full bg-transparent border-none outline-none text-gray-500 font-medium placeholder-gray-500"
        />
      </div>

      {showDropdown &&
        (loading || suggestions.length > 0 || value.length > 0) && (
          <ul
            role="listbox"
            className="absolute bottom-full left-0 mb-2 w-full flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-y-auto overflow-x-hidden z-50"
          >
            {loading && (
              <li className="p-2 text-sm text-gray-500 text-center">
                Loading...
              </li>
            )}

            {!loading &&
              suggestions.map((city, index) => (
                <li
                  key={index}
                  onMouseDown={() => handleSelect(city)}
                  className="w-full p-2 text-sm hover:bg-gray-100 cursor-pointer"
                >
                  {city}
                </li>
              ))}

            {!loading && !suggestions.length && value.length > 0 && (
              <li className="p-2 text-sm text-gray-400 text-center">
                No results
              </li>
            )}
          </ul>
        )}
    </div>
  );
}
