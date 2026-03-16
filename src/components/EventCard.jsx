import React from "react";
import { format } from "date-fns";
import { useAttendance } from "../context/AttendanceContext";
import "./EventCard.css";

const EventCard = ({ event, eventStyle, onClick, compact = false }) => {
  const { isEventMissed, isEventIgnored } = useAttendance();
  const missed = isEventMissed(event.id);
  const ignored = isEventIgnored(event);
  const hasTitle = event.title && event.title.trim() !== "";
  const duration = (event.end - event.start) / (1000 * 60); // duration in minutes

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={`event-card ${compact ? "compact" : ""} ${!hasTitle ? "no-title" : ""} ${duration < 40 ? "small" : ""} ${missed ? "missed" : ""}`}
      style={{ ...eventStyle, opacity: ignored ? 0.4 : missed ? 0.6 : 1 }}
      onClick={handleClick}
    >
      <div
        className="event-card-content"
        style={{
          textDecoration: missed ? "line-through" : "none",
          fontStyle: ignored ? "italic" : "normal",
        }}
      >
        {/* Pour les très petits événements (<= 1h ), afficher seulement titre ou location */}
        {duration <= 60 ? (
          <>
            {hasTitle ? (
              <div className="event-card-title">{event.title}</div>
            ) : (
              <div className="event-card-title">
                {event.location
                  ? event.location.split(" ")[0]
                  : format(event.start, "HH:mm")}
              </div>
            )}
          </>
        ) : (
          /* Pour les événements plus longs, afficher toutes les infos */
          <>
            {hasTitle && <div className="event-card-title">{event.title}</div>}

            <div className="event-card-time">
              {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
            </div>

            {event.location && (
              <div className="event-card-location">{event.location}</div>
            )}

            {event.groups && event.groups.length > 0 && duration >= 60 && (
              <div className="event-card-groups">
                {event.groups.length <= 2
                  ? event.groups.join(", ")
                  : `${event.groups.slice(0, 2).join(", ")}...`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventCard;
