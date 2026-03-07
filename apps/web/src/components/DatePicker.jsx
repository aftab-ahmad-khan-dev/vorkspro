import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  date,
  setDate,
  placeholder = "Pick a date",
  simpleCalendar = false,
  startMonthFrom = null,
  maxDate = null,
  minDate = null,
  maxYear = null, // ⭐ NEW FLAG
}) {
  const derivedMaxYear = maxYear ?? (maxDate ? maxDate.getFullYear() : null);

  const initialMonth =
    startMonthFrom !== null
      ? new Date(new Date().getFullYear(), startMonthFrom, 1)
      : date || new Date();

  const [stage, setStage] = useState("year");
  const [selectedYear, setSelectedYear] = useState(
    date?.getFullYear() || new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    date?.getMonth() ?? new Date().getMonth()
  );
  const [viewDate, setViewDate] = useState(initialMonth);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [yearOffset, setYearOffset] = useState(0);

  const yearsInRange = 20;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // ⭐ UPDATED YEAR GENERATOR WITH DISABLED FLAG
  const generateYears = () => {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: yearsInRange }, (_, i) => {
      const year = currentYear - 10 + i + yearOffset;

      return {
        value: year,
        disabled: derivedMaxYear !== null && year > derivedMaxYear,
      };
    });
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setStage("month");
  };

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
    setViewDate(new Date(selectedYear, monthIndex, 1));
    setStage("day");
  };

  const handleDaySelect = (day) => {
    const finalDate = new Date(selectedYear, selectedMonth, day.getDate());
    setDate(finalDate);
    setViewDate(finalDate);
    setStage("year");
    setPopoverOpen(false);
  };

  const handlePrevYears = () => setYearOffset((prev) => prev - yearsInRange);
  const handleNextYears = () => setYearOffset((prev) => prev + yearsInRange);

  const displayText = date ? format(date, "PPP") : placeholder;

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={false}>
      <PopoverTrigger  asChild>
        <button
          className={cn(
            "dark:bg-[var(--border)]/50 bg-[var(--background)] flex rounded-md gap-2 py-2 item-center text-sm px-3 text-[var(--foreground)] border border-[var(--border)] text-left w-full justify-start",
            !date && " text-[var(--muted-foreground)]"
          )}
          onClick={() => setStage("year")}
        >
          <CalendarIcon className="mt-0.5 h-4 w-4 current-fill" />
          {displayText}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 bg-popover shadow-xl z-[9999]">
        {/* --- SIMPLE CALENDAR MODE --- */}
        {simpleCalendar ? (
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setPopoverOpen(false);
            }}
            disabled={(d) =>
              (minDate && d < minDate) || (maxDate && d > maxDate)
            }
            month={viewDate}
            onMonthChange={(m) => setViewDate(m)}
            initialFocus
          />
        ) : (
          <>
            {/* YEAR PICKER */}
            {stage === "year" && (
              <div className="p-2 rounded-lg bg-popover min-w-[200px]">
                <div className="flex justify-between mb-3">
                  <button className={"border-button cursor-pointer px-2 py-1 rounded-md"} size="sm" onClick={handlePrevYears}>
                    <span>{"<<"}</span>
                  </button>
                  <span className="font-medium">Select Year</span>
                  <button className={"border-button px-2 py-1 cursor-pointer rounded-md"} size="sm"  onClick={handleNextYears}>
                   <span>{">>"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {generateYears().map((y) => (
                    <Button
                      key={y.value}
                      size="sm"
                      className="border-button"
                      disabled={y.disabled}
                      onClick={() => !y.disabled && handleYearSelect(y.value)}
                    >
                      {y.value}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* MONTH PICKER */}
            {stage === "month" && (
              <div className="">
              <h1 className="text-[var(--foreground)] rounded-t-lg font-medium text-center pt-2 ">Months</h1>
              <div className="p-4  rounded-b-lg  grid grid-cols-3 gap-2">
                {months.map((m, idx) => (
                  <Button
                    key={m}
                    size="sm"
                    className="border-button"
                    onClick={() => handleMonthSelect(idx)}
                  >
                    {m}
                  </Button>
                ))}
              </div>
              </div>
            )}

            {/* DAY PICKER */}
            {stage === "day" && (
              <div  className="">
                <div className="flex justify-between items-center  p-2 border-b border-[var(--border)]">
                  <span className="font-medium">{`${months[selectedMonth]} ${selectedYear}`}</span>
                  <Button size="sm" className={"border-button"} onClick={() => setStage("month")}>
                    Back
                  </Button>
                </div>
                <Calendar
                
                  mode="single"
                  selected={date}
                  onSelect={handleDaySelect}
                  disabled={(d) =>
                    (minDate && d < minDate) || (maxDate && d > maxDate)
                  }
                  onMonthChange={(m) => setViewDate(m)}
                  month={viewDate}
                  initialFocus
                />
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
