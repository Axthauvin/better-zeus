import React, { useState } from "react";
import {
  format,
  addDays,
  subDays,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import BaseCalendarLayout from "./BaseCalendarLayout";
import EventCard from "../components/EventCard";
import { useCurrentTime } from "../hooks/useCurrentTime";
import {
  getEventStyle,
  getEventPosition,
  getCurrentTimePosition,
  getEventsForDay,
  getCalendarHours,
  shouldShowTimeIndicator,
  formatHour,
} from "../utils/calendarHelpers";
import { CALENDAR_CONFIG } from "../utils/calendarConstants";
import "../components/DayCalendar.css";

const DayView = ({
  events = [],
  currentDate,
  setCurrentDate,
  onDateChange,
  onViewChange,
  loading,
}) => {
  const currentTime = useCurrentTime();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const hours = getCalendarHours();

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = subDays(currentDate, 1);
    setCurrentDate(newDate);
    onDateChange(newDate, startOfDay(newDate), endOfDay(newDate));
  };

  const handleNext = () => {
    const newDate = addDays(currentDate, 1);
    setCurrentDate(newDate);
    onDateChange(newDate, startOfDay(newDate), endOfDay(newDate));
  };

  const handleDateChange = (newDate) => {
    if (newDate) {
      setCurrentDate(newDate);
      onDateChange(newDate, startOfDay(newDate), endOfDay(newDate));
    }
  };

  // Event handlers
  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  // Helper functions
  const isToday = () => isSameDay(currentDate, new Date());
  const dayEvents = getEventsForDay(events, currentDate);
  const showIndicator = shouldShowTimeIndicator(currentTime, isToday());

  // Header configuration
  const headerTitle = format(currentDate, "EEEE d MMMM yyyy", { locale: fr });

  return (
    <BaseCalendarLayout
      view="day"
      onViewChange={onViewChange}
      currentDate={currentDate}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onDateChange={handleDateChange}
      headerTitle={headerTitle}
      selectedEvent={selectedEvent}
      onCloseModal={handleCloseModal}
      className="day-calendar"
    >
      {/* Calendar Grid */}
      <div className="calendar-grid-container">
        {/* Time column */}
        <div className="time-column">
          {hours.map((hour) => (
            <div key={hour} className="time-slot">
              <span className="time-label">{formatHour(hour)}</span>
            </div>
          ))}
        </div>

        {/* Day column */}
        <div className="day-content">
          <div className="day-grid">
            {/* Time grid background */}
            <div className="time-grid">
              {hours.map((hour) => (
                <div key={hour} className="grid-cell" />
              ))}
            </div>

            {/* Events container */}
            <div className="events-container">
              {/* Current time indicator */}
              {showIndicator && (
                <div
                  className="current-time-line"
                  style={{
                    top: `${getCurrentTimePosition(currentTime, CALENDAR_CONFIG.HOUR_HEIGHT_DAY)}px`,
                  }}
                >
                  <div className="time-dot"></div>
                </div>
              )}

              {/* Events */}
              {dayEvents.map((event) => {
                const position = getEventPosition(
                  event,
                  CALENDAR_CONFIG.HOUR_HEIGHT_DAY,
                );
                const eventStyle = getEventStyle(event);

                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    style={position}
                    colorStyle={eventStyle}
                    onClick={() => handleEventClick(event)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </BaseCalendarLayout>
  );
};

export default DayView;
