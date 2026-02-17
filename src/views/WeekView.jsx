import React, { useState } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isSameDay,
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
import "../components/WeekCalendar.css";

const WeekView = ({
  events = [],
  currentDate,
  setCurrentDate,
  onDateChange,
  onViewChange,
  loading,
}) => {
  const currentTime = useCurrentTime();
  const [selectedEvent, setSelectedEvent] = useState(null);

  const weekStart = startOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = getCalendarHours();

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = subWeeks(currentDate, 1);
    setCurrentDate(newDate);
    onDateChange(newDate, subWeeks(weekStart, 1), subWeeks(weekEnd, 1));
  };

  const handleNext = () => {
    const newDate = addWeeks(currentDate, 1);
    setCurrentDate(newDate);
    onDateChange(newDate, addWeeks(weekStart, 1), addWeeks(weekEnd, 1));
  };

  const handleDateChange = (newDate) => {
    if (newDate) {
      setCurrentDate(newDate);
      const start = startOfWeek(newDate, { locale: fr, weekStartsOn: 1 });
      const end = endOfWeek(newDate, { locale: fr, weekStartsOn: 1 });
      onDateChange(newDate, start, end);
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
  const isToday = (day) => isSameDay(day, new Date());

  const getWeekNumber = () => {
    const start = startOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
    const startOfYear = new Date(start.getFullYear(), 0, 1);
    const days = Math.floor((start - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + 1) / 7);
  };

  // Header configuration
  const headerTitle = format(currentDate, "MMMM yyyy", { locale: fr });
  const headerSubtitle = (
    <>
      Week {getWeekNumber()}
      <p className="week-range">
        {format(weekStart, "d MMM yyyy", { locale: fr })} –{" "}
        {format(weekEnd, "d MMM yyyy", { locale: fr })}
      </p>
    </>
  );

  return (
    <BaseCalendarLayout
      view="week"
      onViewChange={onViewChange}
      currentDate={currentDate}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onDateChange={handleDateChange}
      headerTitle={headerTitle}
      headerSubtitle={headerSubtitle}
      selectedEvent={selectedEvent}
      onCloseModal={handleCloseModal}
      className="week-calendar"
    >
      {/* Calendar Grid */}
      <div className="calendar-grid-container">
        {/* Time column */}
        <div className="time-column">
          <div className="time-header"></div>
          {hours.map((hour) => (
            <div key={hour} className="time-slot">
              <span className="time-label">{formatHour(hour)}</span>
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

          {/* Day columns with events */}
          <div className="day-columns">
            {/* Time grid background */}
            <div className="time-grid">
              {hours.map((hour) =>
                weekDays.map((day, dayIndex) => (
                  <div
                    key={`${hour}-${dayIndex}`}
                    className="grid-cell"
                    style={{
                      gridColumn: dayIndex + 1,
                      gridRow: hour - CALENDAR_CONFIG.HOUR_START + 1,
                    }}
                  />
                )),
              )}
            </div>

            {/* Events */}
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(events, day);
              const showIndicator = shouldShowTimeIndicator(
                currentTime,
                isToday(day),
              );

              return (
                <div key={dayIndex} className="day-column">
                  {/* Current time indicator */}
                  {showIndicator && (
                    <div
                      className="current-time-line"
                      style={{
                        top: `${getCurrentTimePosition(currentTime, CALENDAR_CONFIG.HOUR_HEIGHT_WEEK)}px`,
                      }}
                    >
                      <div className="time-dot"></div>
                    </div>
                  )}

                  {/* Events */}
                  {dayEvents.map((event) => {
                    const position = getEventPosition(
                      event,
                      CALENDAR_CONFIG.HOUR_HEIGHT_WEEK,
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
              );
            })}
          </div>
        </div>
      </div>
    </BaseCalendarLayout>
  );
};

export default WeekView;
