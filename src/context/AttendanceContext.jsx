import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { fetchEventsInChunks, transformApiDataToEvents } from "../api";
import { differenceInMinutes } from "date-fns";

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

  const [ignoredCourseList, setIgnoredCourseList] = useState(() => {
    try {
      const saved = localStorage.getItem("better-zeus-ignored-courses");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [nonCountableCourseList, setNonCountableCourseList] = useState(() => {
    try {
      const saved = localStorage.getItem("better-zeus-non-countable-courses");
      return saved
        ? JSON.parse(saved)
        : [{ title: "férié" }, { title: "vacances" }, { title: "partiel" }];
    } catch (e) {
      return [{ title: "férié" }, { title: "vacances" }, { title: "partiel" }];
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
      "better-zeus-ignored-courses",
      JSON.stringify(ignoredCourseList),
    );
  }, [ignoredCourseList]);

  useEffect(() => {
    localStorage.setItem(
      "better-zeus-non-countable-courses",
      JSON.stringify(nonCountableCourseList),
    );
  }, [nonCountableCourseList]);

  useEffect(() => {
    localStorage.setItem(
      "better-zeus-attendance-threshold",
      String(attendanceThreshold),
    );
  }, [attendanceThreshold]);

  const [presenceGroupId, setPresenceGroupId] = useState(() => {
    return localStorage.getItem("better-zeus-presence-group-id") || "";
  });

  const [semesterStartDate, setSemesterStartDate] = useState(() => {
    return localStorage.getItem("better-zeus-semester-start-date") || "";
  });

  const [lastPresenceRefresh, setLastPresenceRefresh] = useState(() => {
    return localStorage.getItem("better-zeus-presence-last-refresh") || "";
  });

  const [presenceStats, setPresenceStats] = useState(() => {
    try {
      const saved = localStorage.getItem("better-zeus-presence-stats");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isRefreshingPresence, setIsRefreshingPresence] = useState(false);

  useEffect(() => {
    localStorage.setItem("better-zeus-presence-group-id", presenceGroupId);
  }, [presenceGroupId]);

  useEffect(() => {
    localStorage.setItem("better-zeus-semester-start-date", semesterStartDate);
  }, [semesterStartDate]);

  useEffect(() => {
    localStorage.setItem(
      "better-zeus-presence-last-refresh",
      lastPresenceRefresh,
    );
  }, [lastPresenceRefresh]);

  useEffect(() => {
    localStorage.setItem(
      "better-zeus-presence-stats",
      JSON.stringify(presenceStats),
    );
  }, [presenceStats]);

  const normalizeCourseTitle = (title) =>
    String(title || "")
      .trim()
      .toLowerCase();

  const getCourseObject = (event) => {
    if (!event || typeof event !== "object") return null;
    const title = normalizeCourseTitle(event.title);
    const type = String(event.type || "").trim();
    if (!title) return null;
    return { title, type };
  };

  const isCourseInList = (list, courseObj, matchTitleOnly = false) => {
    if (!courseObj) return false;
    return list.some((item) => {
      // If the saved item has no type (fallback), it matches any type.
      // We also do a substring match for generic items like 'férié' to catch 'jour férié'.
      if (!item.type || matchTitleOnly) {
        return (
          courseObj.title === item.title || courseObj.title.includes(item.title)
        );
      }
      return item.title === courseObj.title && item.type === courseObj.type;
    });
  };

  const removeCourseFromList = (list, courseObj, matchTitleOnly = false) => {
    if (!courseObj) return list;
    return list.filter((item) => {
      if (matchTitleOnly || !item.type) {
        return item.title !== courseObj.title;
      }
      const isExactMatch =
        item.title === courseObj.title && item.type === courseObj.type;
      return !isExactMatch;
    });
  };

  const toggleMissedEvent = (eventOrId) => {
    const eventId =
      typeof eventOrId === "object" && eventOrId !== null
        ? eventOrId.id
        : eventOrId;
    const courseObj = getCourseObject(eventOrId);

    setMissedEvents((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });

    // A course cannot be both nonCountable/ignored and missed
    if (courseObj) {
      setIgnoredCourseList((prev) =>
        removeCourseFromList(prev, courseObj, false),
      );
      setNonCountableCourseList((prev) =>
        removeCourseFromList(prev, courseObj, false),
      );
    }
  };

  const toggleIgnoredEvent = (eventOrId) => {
    const eventId =
      typeof eventOrId === "object" && eventOrId !== null
        ? eventOrId.id
        : eventOrId;
    const courseObj = getCourseObject(eventOrId);

    if (courseObj) {
      const titleOnlyObj = { title: courseObj.title };
      const isBecomingIgnored = !isCourseInList(
        ignoredCourseList,
        titleOnlyObj,
        true,
      );
      setIgnoredCourseList((prev) => {
        const filtered = removeCourseFromList(prev, titleOnlyObj, true);
        if (!isBecomingIgnored) {
          return filtered; // It was in the list, so we uncheck it
        }
        return [...filtered, titleOnlyObj]; // Save without type so it matches all variants
      });
      if (isBecomingIgnored) {
        setNonCountableCourseList((prev) => {
          if (!isCourseInList(prev, titleOnlyObj, true))
            return [...prev, titleOnlyObj];
          return prev;
        });
      }
    }

    // An ignored course is excluded, not marked missed
    setMissedEvents((prev) => prev.filter((id) => id !== eventId));
  };

  const toggleNonCountableEvent = (eventOrId) => {
    const eventId =
      typeof eventOrId === "object" && eventOrId !== null
        ? eventOrId.id
        : eventOrId;
    const courseObj = getCourseObject(eventOrId);

    if (courseObj) {
      const isBecomingCountable = isCourseInList(
        nonCountableCourseList,
        courseObj,
        false,
      );

      setNonCountableCourseList((prev) => {
        const filtered = removeCourseFromList(prev, courseObj, false);
        if (isBecomingCountable) {
          return filtered; // Turn off
        }
        return [...filtered, courseObj]; // Turn on, saving specific type
      });

      if (isBecomingCountable) {
        setIgnoredCourseList((prev) =>
          removeCourseFromList(prev, courseObj, false),
        );
      }
    }

    setMissedEvents((prev) => prev.filter((id) => id !== eventId));
  };

  const isIgnoredEvent = (event) => {
    return isCourseInList(ignoredCourseList, getCourseObject(event));
  };

  const isNonCountableEvent = (event) => {
    return isCourseInList(nonCountableCourseList, getCourseObject(event));
  };

  const isEventMissed = (eventId) => missedEvents.includes(eventId);
  const isEventIgnored = (eventOrId) => isIgnoredEvent(eventOrId);

  const calculateAttendanceRate = (visibleEvents) => {
    if (!visibleEvents || visibleEvents.length === 0) return 100;

    const eligibleEvents = visibleEvents.filter(
      (ev) => !isNonCountableEvent(ev),
    );

    if (eligibleEvents.length === 0) return 100;

    const totalCount = eligibleEvents.length;
    const missedCount = visibleEvents
      .filter((ev) => missedEvents.includes(ev.id))
      .filter((ev) => !isNonCountableEvent(ev)).length;
    return Math.round(((totalCount - missedCount) / totalCount) * 100);
  };

  const getAttendanceBreakdown = (visibleEvents) => {
    if (!visibleEvents || visibleEvents.length === 0) {
      return { total: 0, ignored: 0, missed: 0, counted: 0 };
    }

    // We keep the object key 'ignored' to avoid breaking UI, but it now represents non-countable events
    const ignoredCount = visibleEvents.filter((ev) =>
      isNonCountableEvent(ev),
    ).length;

    const counted = visibleEvents.length - ignoredCount;
    const missed = visibleEvents.filter(
      (ev) => missedEvents.includes(ev.id) && !isNonCountableEvent(ev),
    ).length;

    return {
      total: visibleEvents.length,
      ignored: ignoredCount,
      missed,
      counted,
    };
  };

  const refreshPresenceStats = async () => {
    if (!presenceGroupId || !semesterStartDate) return;

    setIsRefreshingPresence(true);
    try {
      const start = new Date(semesterStartDate);
      const end = new Date(); // To today

      const rawEvents = await fetchEventsInChunks(
        [presenceGroupId],
        start,
        end,
      );
      const events = transformApiDataToEvents(rawEvents);

      const eligibleEvents = events.filter((ev) => !isNonCountableEvent(ev));

      let totalMinutes = 0;
      let absentMinutes = 0;

      eligibleEvents.forEach((event) => {
        const duration = differenceInMinutes(event.end, event.start);
        totalMinutes += duration;

        if (missedEvents.includes(event.id)) {
          absentMinutes += duration;
        }
      });

      const totalHours = totalMinutes / 60;
      const absentHours = absentMinutes / 60;
      const attendedHours = totalHours - absentHours;
      const percentage =
        totalHours > 0 ? (attendedHours / totalHours) * 100 : 100;

      const newStats = {
        totalHours: Math.round(totalHours * 100) / 100,
        absentHours: Math.round(absentHours * 100) / 100,
        attendedHours: Math.round(attendedHours * 100) / 100,
        percentage: Math.round(percentage * 10) / 10,
      };

      setPresenceStats(newStats);
      setLastPresenceRefresh(new Date().toISOString());
    } catch (error) {
      console.error("Failed to refresh presence stats:", error);
    } finally {
      setIsRefreshingPresence(false);
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        missedEvents,
        setMissedEvents,
        ignoredCourseList,
        setIgnoredCourseList,
        attendanceThreshold,
        setAttendanceThreshold,
        presenceGroupId,
        setPresenceGroupId,
        semesterStartDate,
        setSemesterStartDate,
        lastPresenceRefresh,
        presenceStats,
        isRefreshingPresence,
        refreshPresenceStats,
        toggleMissedEvent,
        toggleIgnoredEvent,
        toggleNonCountableEvent,
        isEventMissed,
        isEventIgnored,
        isNonCountableEvent,
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
