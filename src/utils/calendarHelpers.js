import { isSameDay } from "date-fns";
import {
  CALENDAR_CONFIG,
  EVENT_COLOR_MAP,
  DEFAULT_EVENT_STYLE,
} from "./calendarConstants.js";

/**
 * Get event style based on event color
 */
export const getEventStyle = (event, theme = "light") => {
  const style = EVENT_COLOR_MAP[event.color] || DEFAULT_EVENT_STYLE;
  if (theme === "dark") {
    return {
      ...style,
      // More opaque background in dark mode for better separation
      bg: style.bg.replace("0.12", "0.2"),
      // Always white/light text in dark mode for contrast
      text: "#FFFFFF",
    };
  }
  return style;
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
 * Calculate event layouts including positioning for overlapping events
 */
export const getEventLayouts = (events, hourHeight) => {
  if (!events || events.length === 0) return [];

  // Sort events by start time, then end time descending
  const sortedEvents = [...events].sort((a, b) => {
    if (a.start.getTime() === b.start.getTime()) {
      return b.end.getTime() - a.end.getTime();
    }
    return a.start.getTime() - b.start.getTime();
  });

  const layouts = [];
  let columns = [];
  let lastEventEnding = null;

  const packEvents = () => {
    const numColumns = columns.length;
    columns.forEach((col, colIndex) => {
      col.forEach((item) => {
        layouts.push({
          event: item.event,
          top: item.top,
          height: item.height,
          left:
            numColumns > 1
              ? `calc(${(colIndex / numColumns) * 100}% + 2px)`
              : "4px",
          width:
            numColumns > 1
              ? `calc(${(1 / numColumns) * 100}% - 6px)`
              : "calc(100% - 8px)",
        });
      });
    });
  };

  sortedEvents.forEach((event) => {
    const { top, height } = getEventPosition(event, hourHeight);
    const bottom = top + height;

    if (lastEventEnding !== null && top >= lastEventEnding) {
      packEvents();
      columns = [];
      lastEventEnding = null;
    }

    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const lastEventInCol = col[col.length - 1];
      if (lastEventInCol.bottom <= top) {
        col.push({ event, top, bottom, height });
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([{ event, top, bottom, height }]);
    }

    if (lastEventEnding === null || bottom > lastEventEnding) {
      lastEventEnding = bottom;
    }
  });

  if (columns.length > 0) {
    packEvents();
  }

  return layouts;
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
  // Remove duplicates based on event ID (events on differents day can have same id, but in this case we want to keep them both)
  const uniqueEvents = Array.from(new Set(events.map((e) => e.id))).map((id) =>
    events.find((e) => e.id === id),
  );

  // const uniqueEvents = events;

  return uniqueEvents.filter((event) => {
    // Check if event occurs on the given day and starts within calendar hours
    const isEventOnDay =
      event.start <=
        new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          23,
          59,
          59,
        ) &&
      event.end >=
        new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
    return isEventOnDay;
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

/**
 * Format enum to display string (e.g. "CourseType.Lecture" => "Lecture")
 */

export function eventTypeDisplay(type) {
  return type.replace("CourseType.", "");
}
