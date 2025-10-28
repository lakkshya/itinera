"use client";

import { useState, useEffect, useRef } from "react";
import { LuCalendar } from "react-icons/lu";

function formatDateTime(date: Date | null) {
  if (!date) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DateTimePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  onFocus?: (field: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minDate?: Date | null;
  defaultMonth?: Date;
  error?: boolean;
  fieldName?: string;
}

const DateTimePicker = ({
  label = "Select Date & Time",
  value,
  onChange,
  onFocus,
  open,
  onOpenChange,
  minDate,
  defaultMonth,
  error,
  fieldName,
}: DateTimePickerProps) => {
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmPm] = useState("AM");

  const pickerRef = useRef<HTMLDivElement>(null);

  // 👇 Detect click outside and close popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const applyDateTime = () => {
    if (!tempDate) return;
    const finalDate = new Date(tempDate);
    let h = parseInt(hour);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    finalDate.setHours(h, parseInt(minute));

    // ⛔ prevent confirming before minDate
    if (minDate && finalDate < minDate) {
      alert("End date/time cannot be before the start date/time.");
      return;
    }

    onChange(finalDate);
    onOpenChange(false);
  };

  // Helper: check if a date is before minDate (ignore time)
  const isBeforeMinDate = (date: Date) => {
    if (!minDate) return false;
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const m = new Date(
      minDate.getFullYear(),
      minDate.getMonth(),
      minDate.getDate()
    );
    return d < m;
  };

  return (
    <div ref={pickerRef} className="relative min-w-56">
      {/* Input box */}
      <div
        onClick={() => {
          if (!open && defaultMonth) setCurrentMonth(defaultMonth);
          onOpenChange(!open);
          if (onFocus && fieldName) onFocus(fieldName);
        }}
        className={`flex flex-col gap-1 hover:bg-gray-100 px-4 py-3 rounded-2xl border transition-colors cursor-pointer bg-white ${
          error ? "border-2 border-red-400" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <LuCalendar />
          <span>{label}</span>
        </div>
        <div className="text-gray-500 font-medium">
          {formatDateTime(value) || "Pick date & time"}
        </div>
      </div>

      {/* Picker popup */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 bg-white shadow-sm border border-gray-200 rounded-xl z-50 w-80 p-4">
          {!tempDate ? (
            <>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  ‹
                </button>
                <div className="font-semibold">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <button
                  onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  ›
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 text-xs text-gray-500 mb-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                  if (!d) return <div key={`empty-${i}`} className="h-8"></div>;
                  const date = new Date(year, month, d);
                  const isToday =
                    new Date().toDateString() === date.toDateString();
                  const disabled = isBeforeMinDate(date);

                  return (
                    <button
                      key={`day-${year}-${month}-${d}`}
                      onClick={() => !disabled && setTempDate(date)}
                      disabled={disabled}
                      className={`h-8 rounded-md text-sm transition-colors ${
                        disabled
                          ? "text-gray-300 cursor-not-allowed"
                          : isToday
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Time Picker */}
              <div className="text-sm font-semibold mb-2 text-gray-700">
                Pick Time
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <input
                  type="number"
                  value={hour}
                  min={1}
                  max={12}
                  onChange={(e) =>
                    setHour(
                      Math.min(12, Math.max(1, Number(e.target.value || 12)))
                        .toString()
                        .padStart(2, "0")
                    )
                  }
                  className="w-14 text-center border rounded-lg py-1"
                />
                :
                <input
                  type="number"
                  value={minute}
                  min={0}
                  max={59}
                  onChange={(e) =>
                    setMinute(
                      Math.min(59, Math.max(0, Number(e.target.value || 0)))
                        .toString()
                        .padStart(2, "0")
                    )
                  }
                  className="w-14 text-center border rounded-lg py-1"
                />
                <select
                  value={ampm}
                  onChange={(e) => setAmPm(e.target.value)}
                  className="border rounded-lg py-1 px-2"
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setTempDate(null)}
                  className="text-gray-500 text-sm hover:underline cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={applyDateTime}
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-sm cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
