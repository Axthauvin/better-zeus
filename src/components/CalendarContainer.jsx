import React, { useState, useEffect } from "react";
import GroupSelector from "./GroupSelector";
import {
  fetchTimeTable,
  transformApiDataToEvents,
  getSavedGroups,
  saveSelectedGroups,
  getSavedView,
  saveView,
} from "../api";
import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import { fr } from "date-fns/locale";
import BaseCalendarLayout from "../views/BaseCalendarLayout";
import WeekView from "../views/WeekView";
import DayView from "../views/DayView";

const CalendarContainer = () => {
  const [view, setView] = useState(getSavedView());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroups, setSelectedGroups] = useState(getSavedGroups() || []);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("better-zeus-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    localStorage.setItem("better-zeus-theme", theme);
  }, [theme]);

  const handleArrowKeyDown = (e) => {
    console.log("Key pressed:", e.key);
    let newDate;
    if (e.key === "ArrowLeft") {
      newDate = subWeeks(currentDate, 1);
    } else if (e.key === "ArrowRight") {
      newDate = addWeeks(currentDate, 1);
    }
    if (newDate) {
      setCurrentDate(newDate);
      const start = startOfWeek(newDate, { locale: fr, weekStartsOn: 1 });
      const end = endOfWeek(newDate, { locale: fr, weekStartsOn: 1 });
      loadEvents(start, end, selectedGroups);
    }
  };

  // Fetch events from API
  const loadEvents = async (startDate, endDate, groups) => {
    try {
      setLoading(true);
      setError(null);

      // If no groups selected, clear events
      if (!groups || groups.length === 0) {
        console.log("No groups selected");
        setEvents([]);
        setLoading(false);
        return;
      }

      const apiData = await fetchTimeTable(groups, startDate, endDate);
      const transformedEvents = transformApiDataToEvents(apiData);
      setEvents(transformedEvents);
    } catch (err) {
      console.error("Error loading events:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load events when selectedGroups or currentDate changes
  useEffect(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    loadEvents(startOfWeek, endOfWeek, selectedGroups);
  }, [selectedGroups]);

  const handleViewChange = (newView) => {
    setView(newView);
    saveView(newView);

    // Recalculate date range based on the new view
    let startDate, endDate;
    if (newView === "week") {
      startDate = startOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
    } else {
      startDate = startOfDay(currentDate);
      endDate = endOfDay(currentDate);
    }

    // Reload events with the new date range
    loadEvents(startDate, endDate, selectedGroups);
  };

  const handleDateChange = (newDate, startDate, endDate) => {
    setCurrentDate(newDate);
    loadEvents(startDate, endDate, selectedGroups);
  };

  const handleGroupsChange = (newSelectedGroups) => {
    setSelectedGroups(newSelectedGroups);
    // Sauvegarder les groupes sélectionnés dans le localStorage
    saveSelectedGroups(newSelectedGroups);
    // Le useEffect se chargera de recharger les événements
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const availableRooms = Array.from(
    new Set(
      events
        .flatMap((event) => event.rooms || [])
        .map((room) => room?.name)
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, "fr"));

  const filteredEvents = events.filter((event) => {
    const roomMatch =
      selectedRooms.length === 0 ||
      event.rooms?.some((room) => selectedRooms.includes(room.name));

    if (!roomMatch) {
      return false;
    }

    if (!eventSearchQuery.trim()) {
      return true;
    }

    const query = eventSearchQuery.trim().toLowerCase();
    const searchableFields = [
      event.title,
      event.location,
      event.teacher,
      event.type,
      ...(event.groups || []),
      ...(event.rooms || []).map((room) => room?.name || ""),
    ];

    return searchableFields.some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query),
    );
  });

  if (loading && events.length === 0) {
    return (
      <div
        className="week-calendar"
        style={{ padding: "40px", textAlign: "center" }}
      >
        <p>Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", height: "100%" }}
      onKeyDown={handleArrowKeyDown}
      tabIndex={0}
      data-theme={theme}
    >
      <GroupSelector
        selectedGroups={selectedGroups}
        onGroupsChange={handleGroupsChange}
        availableRooms={availableRooms}
        selectedRooms={selectedRooms}
        onRoomsChange={setSelectedRooms}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {view === "week" ? (
          <WeekView
            events={filteredEvents}
            onViewChange={handleViewChange}
            onDateChange={handleDateChange}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            loading={loading}
            onToggleTheme={handleToggleTheme}
            theme={theme}
            eventSearchQuery={eventSearchQuery}
            onEventSearchQueryChange={setEventSearchQuery}
          />
        ) : (
          <DayView
            events={filteredEvents}
            onViewChange={handleViewChange}
            onDateChange={handleDateChange}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            loading={loading}
            onToggleTheme={handleToggleTheme}
            theme={theme}
            eventSearchQuery={eventSearchQuery}
            onEventSearchQueryChange={setEventSearchQuery}
          />
        )}

        {error && (
          <div
            style={{
              padding: "12px",
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: "8px",
              margin: "16px 24px",
              color: "#991B1B",
              fontSize: "13px",
            }}
          >
            Erreur API : {error}. Affichage des données de test.
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarContainer;
