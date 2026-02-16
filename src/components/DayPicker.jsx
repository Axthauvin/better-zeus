import React, { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "./DayPicker.css";
import { Calendar } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  format,
  subDays,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
} from "date-fns";

export const enTranslations = {
  Today: "Today",
  Tomorrow: "Tomorrow",
  "This week": "This week",
  "Next week": "Next week",
  Next: "Next",
  Previous: "Previous",
};

export const frTranslations = {
  Today: "Aujourd'hui",
  Tomorrow: "Demain",
  "This week": "Cette semaine",
  "Next week": "La semaine prochaine",
  Next: "Suivant",
  Previous: "Précédent",
};

function translate(label, localeCode) {
  if (localeCode === "fr") {
    return frTranslations[label] || label;
  }
  return enTranslations[label] || label;
}

export function MyDayPicker({ value, onChange, locale, mode = "single" }) {
  const [opened, setOpened] = useState(false);
  const [hoveredWeek, setHoveredWeek] = useState(null);

  const DayModePresets = [
    {
      label: translate("Today", locale.code),
      getValue: () => new Date(),
    },
    {
      label: translate("Tomorrow", locale.code),
      getValue: () => subDays(new Date(), -1),
    },
  ];

  const WeekModePresets = [
    {
      label: translate("This week", locale.code),
      getValue: () => startOfWeek(new Date(), { locale, weekStartsOn: 1 }),
    },
    {
      label: translate("Next week", locale.code),
      getValue: () =>
        startOfWeek(subWeeks(new Date(), -1), { locale, weekStartsOn: 1 }),
    },
  ];

  const presets = mode === "week" ? WeekModePresets : DayModePresets;

  const handlePresetClick = (preset) => {
    const date = preset.getValue();
    onChange(date);
    setOpened(false);
  };

  const handleSelect = (date) => {
    if (date) {
      onChange(date);
      setOpened(false);
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
    if (!date) return null;
    const weekStart = startOfWeek(date, { locale, weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { locale, weekStartsOn: 1 });
    return { from: weekStart, to: weekEnd };
  };

  const formatDisplayDate = () => {
    if (mode === "week" && value) {
      const weekRange = getWeekRange(value);
      return `${format(weekRange.from, "d MMM", { locale })} - ${format(weekRange.to, "d MMM yyyy", { locale })}`;
    }
    return value ? format(value, "d MMMM yyyy", { locale }) : "Select date";
  };

  const selectedWeek = mode === "week" && value ? getWeekRange(value) : null;

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
    <div className="day-picker-container">
      <button onClick={() => setOpened(!opened)} className="btn-select-event">
        <Calendar className="calendar-icon" />
        {formatDisplayDate()}
      </button>

      {opened && (
        <>
          <div className="day-picker-overlay" onClick={() => setOpened(false)}>
            <div
              className="day-picker-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="day-picker-content">
                {/* Presets à gauche */}
                <div className="day-picker-presets">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      className="preset-button"
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Calendrier à droite */}
                <div className="day-picker-calendar">
                  <DayPicker
                    mode={"single"}
                    selected={mode === "week" ? undefined : value}
                    onSelect={handleSelect}
                    locale={locale}
                    weekStartsOn={1}
                    showOutsideDays
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    onDayMouseEnter={handleDayMouseEnter}
                    onDayMouseLeave={handleDayMouseLeave}
                    numberOfMonths={1}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
