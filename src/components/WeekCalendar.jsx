import React, { useState, useEffect } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isSameDay,
  setHours,
  setMinutes,
} from "date-fns";
import { fr } from "date-fns/locale";
import EventModal from "./EventModal";
import EventCard from "./EventCard";
import "./WeekCalendar.css";
import { MyDayPicker } from "./DayPicker";

const WeekCalendar = ({
  events = [],
  onDateChange = () => {},
  onViewChange = () => {},
  currentDate,
  setCurrentDate = () => {},
  loading,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const weekStart = startOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const uniqueEvents = Array.from(new Set(events.map((e) => e.id))).map((id) =>
    events.find((e) => e.id === id),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const previousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
    onDateChange(
      subWeeks(currentDate, 1),
      subWeeks(weekStart, 1),
      subWeeks(weekEnd, 1),
    );
  };

  const nextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
    onDateChange(
      addWeeks(currentDate, 1),
      addWeeks(weekStart, 1),
      addWeeks(weekEnd, 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    const today = new Date();
    const startOfToday = setHours(setMinutes(today, 0), 0);
    const endOfToday = setHours(setMinutes(today, 59), 23);
    onDateChange(today, startOfToday, endOfToday);
  };

  const getEventsForDay = (day) => {
    return uniqueEvents.filter((event) => isSameDay(event.start, day));
  };

  const getEventPosition = (event) => {
    const startHour = event.start.getHours();
    const startMinute = event.start.getMinutes();
    const endHour = event.end.getHours();
    const endMinute = event.end.getMinutes();

    const top = (startHour + startMinute / 60) * 40; // 40px per hour
    const duration =
      (endHour + endMinute / 60 - (startHour + startMinute / 60)) * 40;

    return { top, height: duration };
  };

  const getCurrentTimePosition = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    return (hour + minute / 60) * 40;
  };

  const isToday = (day) => isSameDay(day, new Date());

  const getWeekNumber = () => {
    const start = startOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
    const startOfYear = new Date(start.getFullYear(), 0, 1);
    const days = Math.floor((start - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + 1) / 7);
  };

  // Générer des couleurs pastelles avec bordures pour les événements
  const getEventStyle = (event) => {
    const colorMap = {
      "#7C3AED": {
        bg: "rgba(124, 58, 237, 0.12)",
        border: "#7C3AED",
        text: "#5B21B6",
      },
      "#3B82F6": {
        bg: "rgba(59, 130, 246, 0.12)",
        border: "#3B82F6",
        text: "#1E40AF",
      },
      "#F97316": {
        bg: "rgba(249, 115, 22, 0.12)",
        border: "#F97316",
        text: "#C2410C",
      },
      "#8B5CF6": {
        bg: "rgba(139, 92, 246, 0.12)",
        border: "#8B5CF6",
        text: "#6D28D9",
      },
      "#6366F1": {
        bg: "rgba(99, 102, 241, 0.12)",
        border: "#6366F1",
        text: "#4338CA",
      },
      "#10B981": {
        bg: "rgba(16, 185, 129, 0.12)",
        border: "#10B981",
        text: "#047857",
      },
      "#EF4444": {
        bg: "rgba(239, 68, 68, 0.12)",
        border: "#EF4444",
        text: "#B91C1C",
      },
      "#EC4899": {
        bg: "rgba(236, 72, 153, 0.12)",
        border: "#EC4899",
        text: "#BE185D",
      },
      "#F59E0B": {
        bg: "rgba(245, 158, 11, 0.12)",
        border: "#F59E0B",
        text: "#D97706",
      },
      "#14B8A6": {
        bg: "rgba(20, 184, 166, 0.12)",
        border: "#14B8A6",
        text: "#0F766E",
      },
    };

    const style = colorMap[event.color] || {
      bg: "rgba(124, 58, 237, 0.12)",
      border: "#7C3AED",
      text: "#5B21B6",
    };
    return style;
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleDatePickerChange = (newDate) => {
    if (newDate) {
      setCurrentDate(newDate);
      const start = startOfWeek(newDate, { locale: fr, weekStartsOn: 1 });
      const end = endOfWeek(newDate, { locale: fr, weekStartsOn: 1 });
      onDateChange(newDate, start, end);
    }
  };

  return (
    <div className="week-calendar">
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-header-left">
          <div className="calendar-date-info">
            <div className="calendar-month-day">
              <span className="month-label">
                {format(currentDate, "MMM", { locale: fr }).toUpperCase()}.
              </span>
              <span className="day-number">{format(currentDate, "d")}</span>
            </div>
            <div className="calendar-title-info">
              <h2>{format(currentDate, "MMMM yyyy", { locale: fr })}</h2>
              <p>Week {getWeekNumber()}</p>
              <p className="week-range">
                {format(weekStart, "d MMM yyyy", { locale: fr })} –{" "}
                {format(weekEnd, "d MMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>
        </div>

        <div className="calendar-header-right">
          <div className="calendar-nav">
            <button
              className="btn-icon"
              onClick={previousWeek}
              aria-label="Semaine précédente"
            >
              <ChevronLeftIcon />
            </button>
            {/* <button className="btn-today" onClick={goToToday}>
              Today
            </button> */}
            <MyDayPicker
              value={currentDate}
              onChange={handleDatePickerChange}
              locale={fr}
              mode="week"
            />
            <button
              className="btn-icon"
              onClick={nextWeek}
              aria-label="Semaine suivante"
            >
              <ChevronRightIcon />
            </button>
          </div>

          <div className="view-dropdown">
            <button className="btn-view">
              Week view
              <ChevronDownIcon />
            </button>
            <div className="view-menu">
              <button onClick={() => onViewChange("week")} className="active">
                Week view
              </button>
              <button onClick={() => onViewChange("day")}>Day view</button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid-container">
        {/* Time column */}
        <div className="time-column">
          <div className="time-header"></div>
          {hours.map((hour) => (
            <div key={hour} className="time-slot">
              {hour > 0 && (
                <span className="time-label">
                  {hour === 12
                    ? "12 PM"
                    : hour > 12
                      ? `${hour - 12} PM`
                      : `${hour} AM`}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Days columns */}
        <div className="days-grid">
          {/* Day headers */}
          <div className="day-headers">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`day-header ${isToday(day) ? "today" : ""}`}
              >
                <span className="day-name">
                  {format(day, "EEE", { locale: fr })}{" "}
                  {!isToday(day) && format(day, "d")}
                </span>
                {isToday(day) && (
                  <span className="today-badge">{format(day, "d")}</span>
                )}
              </div>
            ))}
          </div>

          {/* Hour grid */}
          <div className="hour-grid">
            {hours.map((hour) => (
              <div key={hour} className="hour-row">
                {weekDays.map((day, dayIndex) => (
                  <div key={dayIndex} className="hour-cell"></div>
                ))}
              </div>
            ))}

            {/* Current time indicator */}
            {weekDays.some((day) => isToday(day)) && (
              <div
                className="current-time-indicator"
                style={{ top: `${getCurrentTimePosition()}px` }}
              >
                <div className="current-time-dot"></div>
                <div className="current-time-line"></div>
              </div>
            )}

            {/* Events */}
            <div className="events-container">
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                return (
                  <div
                    key={dayIndex}
                    className="day-events"
                    style={{ left: `${dayIndex * (100 / 7)}%` }}
                  >
                    {dayEvents.map((event) => {
                      const { top, height } = getEventPosition(event);
                      const eventStyle = getEventStyle(event);
                      return (
                        <EventCard
                          key={event.id}
                          event={event}
                          eventStyle={{
                            top: `${top}px`,
                            height: `${height}px`,
                            backgroundColor: eventStyle.bg,
                            borderLeftColor: eventStyle.border,
                            color: eventStyle.text,
                          }}
                          onClick={() => handleEventClick(event)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={handleCloseModal} />
      )}
    </div>
  );
};

// Simple icon components
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M12.5 15L7.5 10L12.5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 5V15M5 10H15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default WeekCalendar;
