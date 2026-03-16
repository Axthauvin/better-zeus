import React, { createContext, useContext, useState, useEffect } from "react";

const AttendanceContext = createContext(null);

export const AttendanceProvider = ({ children }) => {
  const [missedEvents, setMissedEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("better-zeus-missed-events");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [ignoredEvents, setIgnoredEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("better-zeus-ignored-events");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [ignoredCourseTitles, setIgnoredCourseTitles] = useState(() => {
    try {
      const saved = localStorage.getItem("better-zeus-ignored-course-titles");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [attendanceThreshold, setAttendanceThreshold] = useState(() => {
    try {
      const saved = localStorage.getItem("better-zeus-attendance-threshold");
      return saved ? Number(saved) : 60;
    } catch (e) {
      return 60;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "better-zeus-missed-events",
      JSON.stringify(missedEvents),
    );
  }, [missedEvents]);

  useEffect(() => {
    localStorage.setItem(
      "better-zeus-ignored-events",
      JSON.stringify(ignoredEvents),
    );
  }, [ignoredEvents]);

  useEffect(() => {
    localStorage.setItem(
      "better-zeus-ignored-course-titles",
      JSON.stringify(ignoredCourseTitles),
    );
  }, [ignoredCourseTitles]);

  useEffect(() => {
    localStorage.setItem(
      "better-zeus-attendance-threshold",
      String(attendanceThreshold),
    );
  }, [attendanceThreshold]);

  const normalizeCourseTitle = (title) =>
    String(title || "")
      .trim()
      .toLowerCase();

  const toggleMissedEvent = (eventOrId) => {
    const eventId =
      typeof eventOrId === "object" && eventOrId !== null
        ? eventOrId.id
        : eventOrId;
    const eventTitle =
      typeof eventOrId === "object" && eventOrId !== null
        ? eventOrId.title
        : "";
    const normalizedTitle = normalizeCourseTitle(eventTitle);

    setMissedEvents((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });

    // A course cannot be both ignored and missed
    setIgnoredEvents((prev) => prev.filter((id) => id !== eventId));
    if (normalizedTitle) {
      setIgnoredCourseTitles((prev) =>
        prev.filter((title) => title !== normalizedTitle),
      );
    }
  };

  const toggleIgnoredEvent = (eventOrId) => {
    const eventId =
      typeof eventOrId === "object" && eventOrId !== null
        ? eventOrId.id
        : eventOrId;
    const eventTitle =
      typeof eventOrId === "object" && eventOrId !== null
        ? eventOrId.title
        : "";
    const normalizedTitle = normalizeCourseTitle(eventTitle);

    if (normalizedTitle) {
      setIgnoredCourseTitles((prev) => {
        if (prev.includes(normalizedTitle)) {
          return prev.filter((title) => title !== normalizedTitle);
        }
        return [...prev, normalizedTitle];
      });
    } else {
      setIgnoredEvents((prev) => {
        if (prev.includes(eventId)) {
          return prev.filter((id) => id !== eventId);
        }
        return [...prev, eventId];
      });
    }

    // An ignored course is excluded, not marked missed
    setMissedEvents((prev) => prev.filter((id) => id !== eventId));
  };

  const isIgnoredEvent = (event) => {
    const titleIgnored = ignoredCourseTitles.includes(
      normalizeCourseTitle(event?.title),
    );
    const idIgnored = ignoredEvents.includes(event?.id);
    return titleIgnored || idIgnored;
  };

  const isEventMissed = (eventId) => missedEvents.includes(eventId);
  const isEventIgnored = (eventOrId) => {
    if (typeof eventOrId === "object" && eventOrId !== null) {
      return isIgnoredEvent(eventOrId);
    }
    return ignoredEvents.includes(eventOrId);
  };

  const calculateAttendanceRate = (visibleEvents) => {
    if (!visibleEvents || visibleEvents.length === 0) return 100;

    const eligibleEvents = visibleEvents.filter((ev) => !isIgnoredEvent(ev));

    if (eligibleEvents.length === 0) return 100;

    const totalCount = eligibleEvents.length;
    const missedCount = visibleEvents
      .filter((ev) => missedEvents.includes(ev.id))
      .filter((ev) => !isIgnoredEvent(ev)).length;
    return Math.round(((totalCount - missedCount) / totalCount) * 100);
  };

  const getAttendanceBreakdown = (visibleEvents) => {
    if (!visibleEvents || visibleEvents.length === 0) {
      return { total: 0, ignored: 0, missed: 0, counted: 0 };
    }

    const ignored = visibleEvents.filter((ev) => isIgnoredEvent(ev)).length;

    const counted = visibleEvents.length - ignored;
    const missed = visibleEvents.filter(
      (ev) => missedEvents.includes(ev.id) && !isIgnoredEvent(ev),
    ).length;

    return { total: visibleEvents.length, ignored, missed, counted };
  };

  return (
    <AttendanceContext.Provider
      value={{
        missedEvents,
        setMissedEvents,
        ignoredEvents,
        setIgnoredEvents,
        ignoredCourseTitles,
        setIgnoredCourseTitles,
        attendanceThreshold,
        setAttendanceThreshold,
        toggleMissedEvent,
        toggleIgnoredEvent,
        isEventMissed,
        isEventIgnored,
        calculateAttendanceRate,
        getAttendanceBreakdown,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};
