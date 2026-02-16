import React, { useState, useEffect } from "react";
import {
  format,
  addDays,
  subDays,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import EventModal from "./EventModal";
import EventCard from "./EventCard";
import "./DayCalendar.css";
import { MyDayPicker } from "./DayPicker";

const DayCalendar = ({
  events = [],
  onViewChange,
  onDateChange,
  currentDate: propCurrentDate,
  loading,
}) => {
  const [currentDate, setCurrentDate] = useState(propCurrentDate || new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const startsAt = 6;
  const endsAt = 22;
  const hours = Array.from(
    { length: endsAt - startsAt + 1 },
    (_, i) => i + startsAt,
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (propCurrentDate) {
      setCurrentDate(propCurrentDate);
    }
  }, [propCurrentDate]);

  useEffect(() => {
    // Notify parent of date range change
    if (onDateChange) {
      const start = startOfDay(currentDate);
      const end = endOfDay(currentDate);
      onDateChange(currentDate, start, end);
    }
  }, [currentDate]);

  const previousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const nextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = () => {
    return events.filter((event) => {
      if (!isSameDay(event.start, currentDate)) return false;
      const eventStartHour = event.start.getHours();
      return eventStartHour >= startsAt;
    });
  };

  const getEventPosition = (event) => {
    const startHour = event.start.getHours();
    const startMinute = event.start.getMinutes();
    const endHour = event.end.getHours();
    const endMinute = event.end.getMinutes();

    const top = (startHour - startsAt + startMinute / 60) * 50; // 50px per hour for day view
    const duration =
      (endHour + endMinute / 60 - (startHour + startMinute / 60)) * 50;

    return { top, height: duration };
  };

  const getCurrentTimePosition = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    return (hour - startsAt + minute / 60) * 50;
  };

  const isToday = () => isSameDay(currentDate, new Date());

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
      const start = startOfDay(newDate);
      const end = endOfDay(newDate);
      if (onDateChange) {
        onDateChange(newDate, start, end);
      }
    }
  };

  const dayEvents = getEventsForDay();

  return (
    <div className="day-calendar">
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
              <h2>{format(currentDate, "EEEE d MMMM yyyy", { locale: fr })}</h2>
              {isToday() && <p className="today-label">Aujourd'hui</p>}
            </div>
          </div>
        </div>

        <div className="calendar-header-right">
          <div className="calendar-nav">
            <button
              className="btn-icon"
              onClick={previousDay}
              aria-label="Jour précédent"
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
              mode="single"
            />
            <button
              className="btn-icon"
              onClick={nextDay}
              aria-label="Jour suivant"
            >
              <ChevronRightIcon />
            </button>
          </div>

          <div className="view-dropdown">
            <button className="btn-view">
              Day view
              <ChevronDownIcon />
            </button>
            <div className="view-menu">
              <button
                onClick={() => onViewChange && onViewChange("day")}
                className="active"
              >
                Day view
              </button>
              <button onClick={() => onViewChange && onViewChange("week")}>
                Week view
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="day-calendar-grid-container">
        {/* Time column */}
        <div className="time-column">
          <div className="time-header"></div>
          {hours.map((hour) => (
            <div key={hour} className="time-slot-day">
              <span className="time-label">
                {hour === 12
                  ? "12 PM"
                  : hour > 12
                    ? `${hour - 12} PM`
                    : `${hour} AM`}
              </span>
            </div>
          ))}
        </div>

        {/* Day column */}
        <div className="day-grid">
          {/* Hour grid */}
          <div className="hour-grid-day">
            {hours.map((hour) => (
              <div key={hour} className="hour-row-day"></div>
            ))}

            {/* Current time indicator */}
            {isToday() &&
              currentTime.getHours() >= startsAt &&
              currentTime.getHours() <= endsAt && (
                <div
                  className="current-time-indicator"
                  style={{ top: `${getCurrentTimePosition()}px` }}
                >
                  <div className="current-time-dot"></div>
                  <div className="current-time-line"></div>
                </div>
              )}

            {/* Events */}
            <div className="events-container-day">
              {dayEvents.length === 0 ? (
                <div className="no-events-day">
                  <p>Aucun événement prévu ce jour</p>
                </div>
              ) : (
                dayEvents.map((event) => {
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
                })
              )}
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

// Icons
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

export default DayCalendar;
