import React, { useState, useEffect } from "react";
import GroupSelector from "./GroupSelector";
import CalendarExportModal from "./CalendarExportModal";
import UpdateNotifier from "./UpdateNotifier";
import {
  fetchTimeTable,
  transformApiDataToEvents,
  getUserGroups,
  getSavedGroups,
  saveSelectedGroups,
  getEnabledGroups,
  saveEnabledGroups,
  getSavedView,
  saveView,
  fetchEventsInChunks,
} from "../api";
import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import BaseCalendarLayout from "../views/BaseCalendarLayout";
import WeekView from "../views/WeekView";
import DayView from "../views/DayView";
import MonthView from "../views/MonthView"; // <-- Added MonthView
import "./CalendarContainer.css";

const CalendarContainer = () => {
  const [view, setView] = useState(getSavedView());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroups, setSelectedGroups] = useState(getSavedGroups() || []);
  const [enabledGroups, setEnabledGroups] = useState(
    getEnabledGroups() || getSavedGroups() || [],
  );
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectionMode, setSelectionMode] = useState("groups");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [isCalendarExportOpen, setIsCalendarExportOpen] = useState(false);
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getHighestHierarchyGroup = () => {
    const groups = getUserGroups();
    const formattedGroups = groups.map((group) => ({
      id: group.id || group.value?.id,
      name: group.name || group.value?.name || "Groupe sans nom",
      path: group.path || "",
    }));

    const candidates = formattedGroups.filter(
      (group) => group.id && group.name !== "0",
    );

    if (candidates.length === 0) {
      return null;
    }

    const getHierarchyDepth = (groupPath) => {
      if (!groupPath || typeof groupPath !== "string") return 0;
      return groupPath.split("/").filter(Boolean).length;
    };

    return [...candidates].sort((a, b) => {
      const depthDiff = getHierarchyDepth(a.path) - getHierarchyDepth(b.path);
      if (depthDiff !== 0) {
        return depthDiff;
      }
      return String(a.name).localeCompare(String(b.name), "fr");
    })[0];
  };

  const rootGroup = getHighestHierarchyGroup();
  const activeGroups = React.useMemo(() => {
    return selectionMode === "rooms" && rootGroup
      ? [rootGroup.id]
      : enabledGroups;
  }, [selectionMode, enabledGroups, rootGroup?.id]);

  useEffect(() => {
    localStorage.setItem("better-zeus-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignorer si l'utilisateur tape dans un champ de recherche
      if (
        document.activeElement &&
        ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
      ) {
        return;
      }

      let newDate;
      if (e.key === "ArrowLeft") {
        newDate =
          view === "month"
            ? subMonths(currentDate, 1)
            : subWeeks(currentDate, 1);
      } else if (e.key === "ArrowRight") {
        newDate =
          view === "month"
            ? addMonths(currentDate, 1)
            : addWeeks(currentDate, 1);
      }

      if (newDate) {
        setCurrentDate(newDate);
        let start, end;
        if (view === "month") {
          start = startOfWeek(startOfMonth(newDate), {
            locale: fr,
            weekStartsOn: 1,
          });
          end = endOfWeek(endOfMonth(newDate), { locale: fr, weekStartsOn: 1 });
        } else if (view === "week") {
          start = startOfWeek(newDate, { locale: fr, weekStartsOn: 1 });
          end = endOfWeek(newDate, { locale: fr, weekStartsOn: 1 });
        } else {
          start = startOfDay(newDate);
          end = endOfDay(newDate);
        }
        loadEvents(start, end, activeGroups);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [currentDate, activeGroups]);

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

      const apiData = await fetchEventsInChunks(groups, startDate, endDate);
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
    let startDate, endDate;
    if (view === "month") {
      startDate = startOfWeek(startOfMonth(currentDate), {
        locale: fr,
        weekStartsOn: 1,
      });
      endDate = endOfWeek(endOfMonth(currentDate), {
        locale: fr,
        weekStartsOn: 1,
      });
    } else if (view === "week") {
      startDate = startOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
    } else {
      startDate = startOfDay(currentDate);
      endDate = endOfDay(currentDate);
    }
    loadEvents(startDate, endDate, activeGroups);
  }, [activeGroups]);

  const handleViewChange = (newView) => {
    setView(newView);
    saveView(newView);

    // Recalculate date range based on the new view
    let startDate, endDate;
    if (newView === "month") {
      startDate = startOfWeek(startOfMonth(currentDate), {
        locale: fr,
        weekStartsOn: 1,
      });
      endDate = endOfWeek(endOfMonth(currentDate), {
        locale: fr,
        weekStartsOn: 1,
      });
    } else if (newView === "week") {
      startDate = startOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
    } else {
      startDate = startOfDay(currentDate);
      endDate = endOfDay(currentDate);
    }

    // Reload events with the new date range
    loadEvents(startDate, endDate, activeGroups);
  };

  const handleDateChange = (newDate, startDate, endDate) => {
    setCurrentDate(newDate);
    loadEvents(startDate, endDate, activeGroups);
  };

  const handleGroupsChange = (newSelectedGroups) => {
    // Determine if any new groups were added to enable them by default
    const addedGroups = newSelectedGroups.filter(
      (id) => !selectedGroups.includes(id),
    );

    let newEnabledGroups = enabledGroups.filter((id) =>
      newSelectedGroups.includes(id),
    );

    if (addedGroups.length > 0) {
      newEnabledGroups = [...newEnabledGroups, ...addedGroups];
    }

    setSelectedGroups(newSelectedGroups);
    setEnabledGroups(newEnabledGroups);

    // Save to localStorage
    saveSelectedGroups(newSelectedGroups);
    saveEnabledGroups(newEnabledGroups);
  };

  const handleToggleGroupEnabled = (groupId) => {
    const isEnabled = enabledGroups.includes(groupId);
    const newEnabledGroups = isEnabled
      ? enabledGroups.filter((id) => id !== groupId)
      : [...enabledGroups, groupId];

    setEnabledGroups(newEnabledGroups);
    saveEnabledGroups(newEnabledGroups);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const selectedGroupsForExport = getUserGroups()
    .map((group) => ({
      id: group.id || group.value?.id,
      name: group.name || group.value?.name || "Groupe sans nom",
      path: group.path || "",
    }))
    .filter((group) => selectedGroups.includes(group.id));

  const handleSelectionModeChange = (newMode) => {
    setSelectionMode(newMode);
    // Clear events to prevent flickering when switching modes
    setEvents([]);
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
    const roomFilterEnabled = selectionMode === "rooms";
    const hasSelectedRoom = selectedRooms.length > 0;

    if (roomFilterEnabled && !hasSelectedRoom) {
      return false;
    }

    const roomMatch =
      !roomFilterEnabled ||
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

  return (
    <div
      className={`calendar-container ${isSidebarOpen ? "sidebar-open" : ""}`}
      data-theme={theme}
    >
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? "visible" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`sidebar-shell ${isSidebarOpen ? "open" : ""}`}>
        <GroupSelector
          selectionMode={selectionMode}
          selectedGroups={selectedGroups}
          enabledGroups={enabledGroups}
          onToggleGroupEnabled={handleToggleGroupEnabled}
          onGroupsChange={handleGroupsChange}
          availableRooms={availableRooms}
          selectedRooms={selectedRooms}
          onRoomsChange={setSelectedRooms}
          onSelectionModeChange={handleSelectionModeChange}
        />
      </aside>

      <div className="calendar-main">
        {view === "month" ? (
          <MonthView
            events={filteredEvents}
            exportEvents={filteredEvents}
            onViewChange={handleViewChange}
            onDateChange={handleDateChange}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            loading={loading}
            onToggleTheme={handleToggleTheme}
            theme={theme}
            eventSearchQuery={eventSearchQuery}
            onEventSearchQueryChange={setEventSearchQuery}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            onOpenCalendarExport={() => setIsCalendarExportOpen(true)}
          />
        ) : view === "week" ? (
          <WeekView
            events={filteredEvents}
            exportEvents={filteredEvents}
            onViewChange={handleViewChange}
            onDateChange={handleDateChange}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            loading={loading}
            onToggleTheme={handleToggleTheme}
            theme={theme}
            eventSearchQuery={eventSearchQuery}
            onEventSearchQueryChange={setEventSearchQuery}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            onOpenCalendarExport={() => setIsCalendarExportOpen(true)}
          />
        ) : (
          <DayView
            events={filteredEvents}
            exportEvents={filteredEvents}
            onViewChange={handleViewChange}
            onDateChange={handleDateChange}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            loading={loading}
            onToggleTheme={handleToggleTheme}
            theme={theme}
            eventSearchQuery={eventSearchQuery}
            onEventSearchQueryChange={setEventSearchQuery}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            onOpenCalendarExport={() => setIsCalendarExportOpen(true)}
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
            {error.includes("401")
              ? "Votre session a expiré. Veuillez raffraichir la page pour vous reconnecter."
              : `Erreur API : ${error}. Affichage des données de test.`}
          </div>
        )}
      </div>
      {isCalendarExportOpen && (
        <CalendarExportModal
          selectedGroups={selectedGroupsForExport}
          onClose={() => setIsCalendarExportOpen(false)}
        />
      )}
      <UpdateNotifier theme={theme} />
    </div>
  );
};

export default CalendarContainer;
