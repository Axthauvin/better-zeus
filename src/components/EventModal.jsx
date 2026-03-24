import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  X,
  Clock,
  MapPin,
  User,
  Tag,
  Users,
   UserX,
   CheckCircle2,
   Video,
   ExternalLink,
 } from "lucide-react";
import { useAttendance } from "../context/AttendanceContext";
import "./EventModal.css";
import { eventTypeDisplay } from "../utils/calendarHelpers";
import { fetchReservationDetails } from "../api";

const EventModal = ({ event, onClose }) => {
  const {
    isEventMissed,
    isEventIgnored,
    toggleMissedEvent,
    toggleIgnoredEvent,
  } = useAttendance();

  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const getDetails = async () => {
      if (event && event.id) {
        setLoadingDetails(true);
        try {
          const data = await fetchReservationDetails(event.id);
          setDetails(data);
        } catch (error) {
          console.error("Failed to fetch event details:", error);
        } finally {
          setLoadingDetails(false);
        }
      }
    };

    getDetails();
  }, [event?.id]);

  if (!event) return null;

  const missed = isEventMissed(event.id);
  const ignored = isEventIgnored(event);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const duration = () => {
    const diff = event.end - event.start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  };

  return (
    <div className="event-modal-overlay" onClick={handleOverlayClick}>
      <div className="event-modal">
        <div className="event-modal-header">
          <div className="event-modal-title-section">
            <div
              className="event-color-indicator"
              style={{ backgroundColor: event.color }}
            ></div>
            <h2 className="event-modal-title">{event.title}</h2>
          </div>
          <button
            className="event-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="event-modal-body">
          <div className="event-info-item">
            <Clock size={18} className="event-info-icon" />
            <div className="event-info-content">
              <div className="event-info-label">Date et heure</div>
              <div className="event-info-value">
                {format(event.start, "EEEE d MMMM yyyy", { locale: fr })}
              </div>
              <div className="event-info-time">
                {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")} (
                {duration()})
              </div>
            </div>
          </div>

          {event.location && (
            <div className="event-info-item">
              <MapPin size={18} className="event-info-icon" />
              <div className="event-info-content">
                <div className="event-info-label">Lieu</div>
                <div className="event-info-value">{event.location}</div>
              </div>
            </div>
          )}

          {event.teacher && (
            <div className="event-info-item">
              <User size={18} className="event-info-icon" />
              <div className="event-info-content">
                <div className="event-info-label">Enseignant</div>
                <div className="event-info-value">{event.teacher}</div>
              </div>
            </div>
          )}

          {event.type && (
            <div className="event-info-item">
              <Tag size={18} className="event-info-icon" />
              <div className="event-info-content">
                <div className="event-info-label">Type</div>
                <div className="event-info-value">
                  {eventTypeDisplay(event.type)}
                </div>
              </div>
            </div>
          )}

          {details?.url && (
            <div className="event-info-item online-url">
              <Video size={18} className="event-info-icon" />
              <div className="event-info-content">
                <div className="event-info-label">Lien de connexion</div>
                <div className="event-info-value">
                  <a
                    href={details.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="online-link"
                  >
                    Rejoindre le cours <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {event.groups && event.groups.length > 0 && (
            <div className="event-info-item">
              <Users size={18} className="event-info-icon" />
              <div className="event-info-content">
                <div className="event-info-label">Groupes</div>
                <div className="event-info-value">
                  {event.groups.join(", ")}
                </div>
              </div>
            </div>
          )}

          {event.description && (
            <div className="event-description">
              <div className="event-info-label">Description</div>
              <p className="event-description-text">{event.description}</p>
            </div>
          )}

          <div className="attendance-actions">
            <button
              className={`attendance-action ${missed ? "active missed" : ""}`}
              onClick={() => toggleMissedEvent(event)}
            >
              <div className="attendance-action-main">
                {missed ? (
                  <UserX size={18} className="attendance-action-icon" />
                ) : (
                  <CheckCircle2 size={18} className="attendance-action-icon" />
                )}
                <span>{missed ? "Cours marqué absent" : "Marquer absent"}</span>
              </div>
              <span className="attendance-state-pill">
                {missed ? "Actif" : "Off"}
              </span>
            </button>

            <button
              className={`attendance-action ${ignored ? "active ignored" : ""}`}
              onClick={() => toggleIgnoredEvent(event)}
            >
              <div className="attendance-action-main">
                <CheckCircle2 size={18} className="attendance-action-icon" />
                <span>
                  {ignored
                    ? "Cours ignore (compensation)"
                    : "Ignorer ce cours (compensation)"}
                </span>
              </div>
              <span className="attendance-state-pill">
                {ignored ? "Actif" : "Off"}
              </span>
            </button>
          </div>
        </div>

        <div className="event-modal-footer">
          <button className="btn-modal-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
