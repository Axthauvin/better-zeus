import { isSameDay } from "date-fns";
import {
  CALENDAR_CONFIG,
  EVENT_COLOR_MAP,
  DEFAULT_EVENT_STYLE,
} from "./calendarConstants";

/**
 * Get event style based on event color
 */
export const getEventStyle = (event) => {
  return EVENT_COLOR_MAP[event.color] || DEFAULT_EVENT_STYLE;
};

/**
 * Calculate event position and height based on start/end times
 */
export const getEventPosition = (event, hourHeight) => {
  const { HOUR_START } = CALENDAR_CONFIG;
  const startHour = event.start.getHours();
  const startMinute = event.start.getMinutes();
  const endHour = event.end.getHours();
  const endMinute = event.end.getMinutes();

  const top = (startHour - HOUR_START + startMinute / 60) * hourHeight;
  const duration =
    (endHour + endMinute / 60 - (startHour + startMinute / 60)) * hourHeight;

  return { top, height: duration };
};

/**
 * Get current time position on the calendar
 */
export const getCurrentTimePosition = (currentTime, hourHeight) => {
  const { HOUR_START } = CALENDAR_CONFIG;
  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();
  return (hour - HOUR_START + minute / 60) * hourHeight;
};

/**
 * Filter events for a specific day that are within the calendar hours
 */
export const getEventsForDay = (events, day) => {
  const { HOUR_START } = CALENDAR_CONFIG;
  // Remove duplicates based on event ID
  const uniqueEvents = Array.from(new Set(events.map((e) => e.id))).map((id) =>
    events.find((e) => e.id === id),
  );

  return uniqueEvents.filter((event) => {
    const isEventOnDay = isSameDay(event.start, day);
    const eventStartHour = event.start.getHours();
    return isEventOnDay && eventStartHour >= HOUR_START;
  });
};

/**
 * Generate array of hours for the calendar
 */
export const getCalendarHours = () => {
  const { HOUR_START, HOUR_END } = CALENDAR_CONFIG;
  return Array.from(
    { length: HOUR_END - HOUR_START + 1 },
    (_, i) => i + HOUR_START,
  );
};

/**
 * Check if the current time should show the time indicator
 */
export const shouldShowTimeIndicator = (currentTime, isToday) => {
  const { HOUR_START, HOUR_END } = CALENDAR_CONFIG;
  return (
    isToday &&
    currentTime.getHours() >= HOUR_START &&
    currentTime.getHours() <= HOUR_END
  );
};

/**
 * Format hour for display (academic format)
 */
export const formatHour = (hour) => {
  return `${hour}:00`;
};
