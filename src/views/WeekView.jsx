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
  getEventLayouts,
  getCurrentTimePosition,
  getEventsForDay,
  getCalendarHours,
  shouldShowTimeIndicator,
  formatHour,
} from "../utils/calendarHelpers";
import { CALENDAR_CONFIG } from "../utils/calendarConstants";
import "../components/WeekCalendar.css";

const INITIAL_SCROLL_HOUR = 6;

const WeekView = ({
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
  const currentTime = useCurrentTime();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const scrollRef = React.useRef(null);

  // Scroll to the initial hour on mount
  React.useEffect(() => {
    if (scrollRef.current) {
      const { HOUR_HEIGHT } = CALENDAR_CONFIG;
      scrollRef.current.scrollTop = INITIAL_SCROLL_HOUR * HOUR_HEIGHT;
    }
  }, []);

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

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange(
      today,
      startOfWeek(today, { locale: fr, weekStartsOn: 1 }),
      endOfWeek(today, { locale: fr, weekStartsOn: 1 }),
    );
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
  const todayIndex = weekDays.findIndex((day) => isToday(day));

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
      onToday={handleToday}
      onDateChange={handleDateChange}
      headerTitle={headerTitle}
      headerSubtitle={headerSubtitle}
      events={events}
      selectedEvent={selectedEvent}
      onCloseModal={handleCloseModal}
      eventSearchQuery={eventSearchQuery}
      onEventSearchQueryChange={onEventSearchQueryChange}
      theme={theme}
      onToggleTheme={onToggleTheme}
      onToggleSidebar={onToggleSidebar}
      exportEvents={exportEvents}
      className="week-calendar"
    >
      {/* Calendar Grid */}
      <div className="calendar-grid-container" ref={scrollRef}>
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
          <div className="hour-grid">
            {hours.map((hour) => (
              <div key={hour} className="hour-row">
                {weekDays.map((day, dayIndex) => (
                  <div key={dayIndex} className="hour-cell"></div>
                ))}
              </div>
            ))}

            {/* Current time indicator */}
            {todayIndex >= 0 &&
              currentTime.getHours() >= CALENDAR_CONFIG.HOUR_START &&
              currentTime.getHours() <= CALENDAR_CONFIG.HOUR_END && (
                <div
                  className="current-time-indicator"
                  style={{
                    top: `${getCurrentTimePosition(currentTime, CALENDAR_CONFIG.HOUR_HEIGHT)}px`,
                    left: `${(todayIndex * 100) / 7}%`,
                    width: `${100 / 7}%`,
                    right: "auto",
                  }}
                >
                  <div className="current-time-dot"></div>
                  <div className="current-time-line"></div>
                </div>
              )}

            {/* Events */}
            <div className="events-container">
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(events, day);

                const endOfDay = new Date(
                  day.getFullYear(),
                  day.getMonth(),
                  day.getDate(),
                  23,
                  59,
                  59,
                );

                // clamp events  to the actual day range (in case of events spanning multiple days)
                const clampedEvents = dayEvents.map((event) => {
                  // start must be clamped to HOUR_START of the day
                  const eventStart =
                    event.start <
                    new Date(
                      day.getFullYear(),
                      day.getMonth(),
                      day.getDate(),
                      CALENDAR_CONFIG.HOUR_START,
                      0,
                      0,
                    )
                      ? new Date(
                          day.getFullYear(),
                          day.getMonth(),
                          day.getDate(),
                          CALENDAR_CONFIG.HOUR_START,
                          0,
                          0,
                        )
                      : event.start;
                  // end must be clamped to end of the day
                  const eventEnd = event.end > endOfDay ? endOfDay : event.end;
                  return { ...event, start: eventStart, end: eventEnd };
                });

                const eventLayouts = getEventLayouts(
                  clampedEvents,
                  CALENDAR_CONFIG.HOUR_HEIGHT,
                );
                return (
                  <div
                    key={dayIndex}
                    className="day-events"
                    style={{ left: `${dayIndex * (100 / 7)}%` }}
                  >
                    {eventLayouts.map(({ event, top, height, left, width }) => {
                      const eventStyle = getEventStyle(event, theme);
                      return (
                        <EventCard
                          key={event.id}
                          event={event}
                          eventStyle={{
                            top: `${top}px`,
                            height: `${height}px`,
                            left,
                            width,
                            right: "auto",
                            position: "absolute",
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
    </BaseCalendarLayout>
  );
};

export default WeekView;
