import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "../api/axiosClient";
import DateTimePicker from "./DateTimePicker";
import LocationInput from "./LocationInput";

interface HomeInputBoxProps {
  setLoading: (value: boolean) => void;
}

const HomeInputBox = ({ setLoading }: HomeInputBoxProps) => {
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);

  const [openPicker, setOpenPicker] = useState<"start" | "end" | null>(null);

  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  const validateInput = () => {
    const newError: Record<string, string> = {};

    if (location.trim() === "") newError.location = "Location is required";
    if (!startDateTime)
      newError.startDateTime = "Start date & time is required";
    if (!endDateTime) newError.endDateTime = "End date & time is required";

    setInputErrors(newError);
    return Object.keys(newError).length === 0;
  };

  const handleFocus = (field: string) => {
    // remove that field’s error when focused
    if (inputErrors[field]) {
      setInputErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const generatePlaces = async () => {
    if (!validateInput()) return;

    setLoading(true);

    try {
      localStorage.setItem("tripStart", startDateTime?.toISOString() || "");
      localStorage.setItem("tripEnd", endDateTime?.toISOString() || "");
      localStorage.setItem("tripLocation", location);

      const response = await axiosClient.post("/ai/generate-places", {
        location,
      });

      const sessionId = response.data.sessionId;

      // Encode and navigate with all relevant data
      const query = new URLSearchParams({
        sessionId,
        start: startDateTime?.toISOString() || "",
        end: endDateTime?.toISOString() || "",
        location,
      }).toString();

      setTimeout(() => {
        router.push(`/places?${query}`);
      }, 300);
    } catch (error) {
      console.log("Error fetching places:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between gap-3 bg-white p-4 rounded-3xl shadow-md">
      {/* Location */}
      <LocationInput
        value={location}
        onChange={(location) => setLocation(location)}
        error={inputErrors.location}
      />

      {/* Start Date & Time */}
      <DateTimePicker
        label="Start date & time"
        value={startDateTime}
        onChange={(date) => setStartDateTime(date)}
        onFocus={() => handleFocus("startDateTime")}
        open={openPicker === "start"}
        onOpenChange={(open) => setOpenPicker(open ? "start" : null)}
        minDate={new Date()}
        error={!!inputErrors.startDateTime}
        fieldName="startDateTime"
      />

      {/* End Date & Time */}

      <DateTimePicker
        label="End date & time"
        value={endDateTime}
        onChange={(date) => setEndDateTime(date)}
        onFocus={() => handleFocus("endDateTime")}
        open={openPicker === "end"}
        onOpenChange={(open) => setOpenPicker(open ? "end" : null)}
        minDate={startDateTime || new Date()}
        defaultMonth={startDateTime || new Date()}
        error={!!inputErrors.endDateTime}
        fieldName="endDateTime"
      />

      {/* Go Button */}
      <div className="flex items-center">
        <button
          onClick={generatePlaces}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-2xl cursor-pointer"
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default HomeInputBox;
