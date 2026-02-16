import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "lucide-react";
import "./SimpleDatePicker.css";

const SimpleDatePicker = ({
  value,
  onChange,
  locale = fr,
  mode = "single",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const [hoveredWeek, setHoveredWeek] = useState(null);

  const handleSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      onChange(date);
      if (mode === "single") {
        setIsOpen(false);
      }
    }
  };

  const handleDayMouseEnter = (date) => {
    if (mode === "week") {
      const weekStart = startOfWeek(date, { locale, weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { locale, weekStartsOn: 1 });
      setHoveredWeek({ from: weekStart, to: weekEnd });
    }
  };

  const handleDayMouseLeave = () => {
    if (mode === "week") {
      setHoveredWeek(null);
    }
  };

  const isInWeekRange = (date, week) => {
    if (!week) return false;
    return date >= week.from && date <= week.to;
  };

  const getWeekRange = (date) => {
    const weekStart = startOfWeek(date, { locale, weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { locale, weekStartsOn: 1 });
    return { from: weekStart, to: weekEnd };
  };

  const selectedWeek = mode === "week" ? getWeekRange(selectedDate) : null;

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value);
    }
  }, [value]);

  const formatDisplayDate = () => {
    if (mode === "week" && selectedWeek) {
      return `${format(selectedWeek.from, "MMM d", { locale })} - ${format(selectedWeek.to, "MMM d, yyyy", { locale })}`;
    }
    return selectedDate
      ? format(selectedDate, "d MMMM yyyy", { locale })
      : "Select date";
  };

  const modifiers =
    mode === "week" && selectedWeek
      ? {
          selected: (date) => isInWeekRange(date, selectedWeek),
          hovered: (date) => isInWeekRange(date, hoveredWeek),
        }
      : {};

  const modifiersClassNames = {
    selected: "rdp-day_selected-week",
    hovered: "rdp-day_hovered-week",
  };

  return (
    <div className="simple-date-picker">
      <button className="date-picker-trigger" onClick={togglePicker}>
        <Calendar size={16} />
        {formatDisplayDate()}
      </button>

      {isOpen && (
        <>
          <div
            className="date-picker-overlay"
            onClick={() => setIsOpen(false)}
          />
          <div className="date-picker-popup">
            <DayPicker
              mode={mode === "week" ? "default" : "single"}
              selected={mode === "week" ? undefined : selectedDate}
              onSelect={handleSelect}
              locale={locale}
              weekStartsOn={1}
              showOutsideDays
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              onDayMouseEnter={handleDayMouseEnter}
              onDayMouseLeave={handleDayMouseLeave}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SimpleDatePicker;
