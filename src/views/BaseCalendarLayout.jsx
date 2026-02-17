import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MyDayPicker } from "../components/DayPicker";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "../components/CalendarIcons";
import EventModal from "../components/EventModal";

/**
 * BaseCalendarLayout - Shared layout component for calendar views
 * Provides common header, navigation, and view switching
 */
const BaseCalendarLayout = ({
  // View configuration
  view = "week",
  onViewChange,

  // Date & Navigation
  currentDate,
  onPrevious,
  onNext,
  onDateChange,

  // Header display
  headerTitle,
  headerSubtitle,
  monthDay,

  // Modal
  selectedEvent,
  onCloseModal,

  // Children (calendar grid content)
  children,

  // Additional styling
  className = "",
}) => {
  return (
    <div className={`calendar-view ${className}`}>
      {/* Header */}
      <div className="calendar-header">
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
          <div className="calendar-nav">
            <button
              className="btn-icon"
              onClick={onPrevious}
              aria-label="Précédent"
            >
              <ChevronLeftIcon />
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
              {view === "week" ? "Week view" : "Day view"}
              <ChevronDownIcon />
            </button>
            <div className="view-menu">
              <button
                onClick={() => onViewChange("week")}
                className={view === "week" ? "active" : ""}
              >
                Week view
              </button>
              <button
                onClick={() => onViewChange("day")}
                className={view === "day" ? "active" : ""}
              >
                Day view
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid Content */}
      {children}

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={onCloseModal} />
      )}
    </div>
  );
};

export default BaseCalendarLayout;
