import { useState } from "react";
import DateTimePicker from "./DateTimePicker";
import LocationInput from "./LocationInput";

const HomeInputBox = () => {
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
  };

  return (
    <div>
      <div className="absolute top-44 left-1/2 -translate-x-1/2 w-4/5 flex justify-between gap-2 bg-white p-4 rounded-3xl shadow-md">
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
            className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-2xl cursor-pointer"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeInputBox;
