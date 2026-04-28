import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MyDayPicker } from "../components/DayPicker";
import { Search, Sun, Moon, Menu, Github } from "lucide-react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "../components/CalendarIcons";
import EventModal from "../components/EventModal";
import PresenceMenu from "../components/PresenceMenu";
import DataMenu from "../components/DataMenu";

/**
 * BaseCalendarLayout - Shared layout component for calendar views
 * Provides common header, navigation, and view switching
 */
const BaseCalendarLayout = ({
  view = "week",
  onViewChange,
  currentDate,
  onPrevious,
  onNext,
  onToday,
  onDateChange,
  headerTitle,
  headerSubtitle,
  monthDay,
  eventSearchQuery = "",
  onEventSearchQueryChange = () => { },
  theme = "light",
  onToggleTheme = () => { },
  onToggleSidebar = () => { },
  exportEvents = [],
  selectedEvent,
  onCloseModal,
  children,
  className = "",
}) => {
  return (
    <div className={`calendar-view ${className}`}>
      <div className="calendar-header">
        <div className="calendar-header-main">
          <div className="calendar-header-left">
            <div className="calendar-date-info">
              <div className="calendar-month-day">
                <span className="month-label">
                  {format(currentDate, "MMM", { locale: fr }).toUpperCase()}
                </span>
                <span className="day-number">
                  {monthDay || format(currentDate, "d")}
                </span>
              </div>
              <div className="calendar-title-info">
                <h2>{headerTitle}</h2>
                {headerSubtitle && <p>{headerSubtitle}</p>}
              </div>
            </div>
          </div>

          <div className="calendar-header-right">
            <button
              className="btn-icon btn-sidebar-toggle"
              onClick={onToggleSidebar}
              aria-label="Ouvrir le menu"
              title="Menu"
            >
              <Menu size={18} />
            </button>
            <PresenceMenu />
            <DataMenu exportEvents={exportEvents} />
            <a
              className="btn-icon btn-github"
              href="https://github.com/Axthauvin/better-zeus"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ouvrir le depot GitHub"
              title="GitHub"
            >
              <Github size={18} />
            </a>
            <button
              className="btn-icon btn-theme"
              onClick={onToggleTheme}
              aria-label={
                theme === "dark"
                  ? "Activer le theme clair"
                  : "Activer le theme sombre"
              }
              title={theme === "dark" ? "Theme clair" : "Theme sombre"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <div className="calendar-toolbar">
          <div className="calendar-nav">
            <button
              className="btn-icon"
              onClick={onPrevious}
              aria-label="Precedent"
            >
              <ChevronLeftIcon />
            </button>
            <button className="btn-today" onClick={onToday}>
              Aujourd'hui
            </button>
            <MyDayPicker
              value={currentDate}
              onChange={onDateChange}
              locale={fr}
              mode={view}
            />
            <button className="btn-icon" onClick={onNext} aria-label="Suivant">
              <ChevronRightIcon />
            </button>
          </div>

          <div className="view-dropdown">
            <button className="btn-view">
              {view === "month" ? "Mois" : view === "week" ? "Semaine" : "Jour"}
              <ChevronDownIcon />
            </button>
            <div className="view-menu">
              <button
                onClick={() => onViewChange("month")}
                className={view === "month" ? "active" : ""}
              >
                Mois
              </button>
              <button
                onClick={() => onViewChange("week")}
                className={view === "week" ? "active" : ""}
              >
                Semaine
              </button>
              <button
                onClick={() => onViewChange("day")}
                className={view === "day" ? "active" : ""}
              >
                Jour
              </button>
            </div>
          </div>

          <div className="calendar-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Rechercher un cours, prof, salle..."
              value={eventSearchQuery}
              onChange={(e) => onEventSearchQueryChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {children}

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={onCloseModal} />
      )}
    </div>
  );
};

export default BaseCalendarLayout;
