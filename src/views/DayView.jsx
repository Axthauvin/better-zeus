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
  getEventLayouts,
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
  eventSearchQuery,
  onEventSearchQueryChange,
  theme,
  onToggleTheme,
}) => {
  const currentTime = useCurrentTime();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const scrollRef = React.useRef(null);

  // Scroll to default hour (configurable, defaults to 6am) on mount
  React.useEffect(() => {
    if (scrollRef.current) {
      const { HOUR_HEIGHT, DEFAULT_SCROLL_HOUR } = CALENDAR_CONFIG;
      const initialScrollHour =
        typeof DEFAULT_SCROLL_HOUR === "number" ? DEFAULT_SCROLL_HOUR : 6;
      scrollRef.current.scrollTop = initialScrollHour * HOUR_HEIGHT;
    }
  }, []);

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

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange(today, startOfDay(today), endOfDay(today));
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
      className="day-calendar"
    >
      {/* Calendar Grid */}
      <div className="day-calendar-grid-container" ref={scrollRef}>
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
        <div className="day-grid">
          {/* Day headers */}
          <div className="day-headers" style={{ gridTemplateColumns: "none" }}>
            <div
              className={`day-header ${isToday(currentDate) ? "today" : ""}`}
            >
              <span className="day-name">
                {format(currentDate, "EEE", { locale: fr })}{" "}
                {!isToday(currentDate) && format(currentDate, "d")}
              </span>
              {isToday(currentDate) && (
                <span className="today-badge">{format(currentDate, "d")}</span>
              )}
            </div>
          </div>

          {/* Hour grid */}
          <div className="hour-grid-day">
            {hours.map((hour) => (
              <div key={hour} className="hour-row-day"></div>
            ))}
          </div>

          {/* Events container */}
          <div className="events-container">
            {/* Current time indicator */}
            {showIndicator && (
              <div
                className="current-time-indicator"
                style={{
                  top: `${getCurrentTimePosition(currentTime, CALENDAR_CONFIG.HOUR_HEIGHT)}px`,
                }}
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
                getEventLayouts(dayEvents, CALENDAR_CONFIG.HOUR_HEIGHT).map(
                  ({ event, top, height, left, width }) => {
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
                  },
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseCalendarLayout>
  );
};

export default DayView;
