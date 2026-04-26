import React, { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import BaseCalendarLayout from "./BaseCalendarLayout";
import { getEventsForDay, getEventStyle } from "../utils/calendarHelpers";
import "../components/MonthCalendar.css";
import { useAttendance } from "../context/AttendanceContext";

const MonthView = ({
  events = [],
  exportEvents = [],
  currentDate,
  setCurrentDate,
  onDateChange,
  onViewChange,
  loading,
  eventSearchQuery,
  onEventSearchQueryChange,
  theme,
  onToggleTheme,
  onToggleSidebar,
}) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { isEventMissed, isEventIgnored } = useAttendance();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // We want to span from the first Monday of the first week of the month
  // to the last Sunday of the last week of the month
  const startDate = startOfWeek(monthStart, { locale: fr, weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { locale: fr, weekStartsOn: 1 });

  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    onDateChange(
      newDate,
      startOfWeek(startOfMonth(newDate), { locale: fr, weekStartsOn: 1 }),
      endOfWeek(endOfMonth(newDate), { locale: fr, weekStartsOn: 1 }),
    );
  };

  const handleNext = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    onDateChange(
      newDate,
      startOfWeek(startOfMonth(newDate), { locale: fr, weekStartsOn: 1 }),
      endOfWeek(endOfMonth(newDate), { locale: fr, weekStartsOn: 1 }),
    );
  };

  const handleDateChange = (newDate) => {
    if (newDate) {
      setCurrentDate(newDate);
      onDateChange(
        newDate,
        startOfWeek(startOfMonth(newDate), { locale: fr, weekStartsOn: 1 }),
        endOfWeek(endOfMonth(newDate), { locale: fr, weekStartsOn: 1 }),
      );
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange(
      today,
      startOfWeek(startOfMonth(today), { locale: fr, weekStartsOn: 1 }),
      endOfWeek(endOfMonth(today), { locale: fr, weekStartsOn: 1 }),
    );
  };

  const handleEventClick = (event, e) => {
    if (e) e.stopPropagation();
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const isToday = (day) => isSameDay(day, new Date());

  const headerTitle = format(currentDate, "MMMM yyyy", { locale: fr });

  // Create an array of 7 days just for the headers (Mon-Sun)
  const weekDayHeaders = eachDayOfInterval({
    start: startOfWeek(currentDate, { locale: fr, weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { locale: fr, weekStartsOn: 1 }),
  });

  return (
    <BaseCalendarLayout
      view="month"
      onViewChange={onViewChange}
      currentDate={currentDate}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onToday={handleToday}
      onDateChange={handleDateChange}
      headerTitle={headerTitle}
      events={events}
      selectedEvent={selectedEvent}
      onCloseModal={handleCloseModal}
      eventSearchQuery={eventSearchQuery}
      onEventSearchQueryChange={onEventSearchQueryChange}
      theme={theme}
      onToggleTheme={onToggleTheme}
      onToggleSidebar={onToggleSidebar}
      exportEvents={exportEvents}
      className="month-calendar"
    >
      <div className="month-calendar-grid-container">
        {/* Days of week header row */}
        <div className="month-day-headers">
          {weekDayHeaders.map((day, i) => (
            <div key={i} className="month-day-header">
              {format(day, "EEEE", { locale: fr })}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="month-grid">
          {monthDays.map((day, i) => {
            const dayEvents = getEventsForDay(events, day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const today = isToday(day);

            return (
              <div
                key={i}
                className={`month-cell ${isCurrentMonth ? "" : "out-of-month"} ${today ? "today-cell" : ""}`}
              >
                <div className="month-cell-header">
                  <span className={`month-day-number ${today ? "today" : ""}`}>
                    {format(day, "d")}
                  </span>
                </div>

                <div className="month-cell-events">
                  {dayEvents.map((event) => {
                    const style = getEventStyle(event, theme);
                    const missed = isEventMissed(event.id);
                    const ignored = isEventIgnored(event);
                    return (
                      <div
                        key={event.id}
                        className={`month-event ${missed ? "missed" : ""} ${ignored ? "ignored" : ""}`}
                        style={{
                          backgroundColor: style.bg,
                          borderLeftColor: style.border,
                          color: style.text,
                        }}
                        onClick={(e) => handleEventClick(event, e)}
                        title={event.title}
                      >
                        <span
                          className="month-event-time"
                          style={{
                            textDecoration: missed ? "line-through" : "none",
                            fontStyle: ignored ? "italic" : "normal",
                            opacity: ignored ? 0.4 : missed ? 0.6 : 1,
                          }}
                        >
                          {format(event.start, "HH:mm")}
                        </span>
                        <span
                          className="month-event-title"
                          style={{
                            textDecoration: missed ? "line-through" : "none",
                            fontStyle: ignored ? "italic" : "normal",
                            opacity: ignored ? 0.4 : missed ? 0.6 : 1,
                          }}
                        >
                          {event.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BaseCalendarLayout>
  );
};

export default MonthView;
