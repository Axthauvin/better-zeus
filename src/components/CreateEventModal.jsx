import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  X,
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  AlignLeft,
  Video,
  ChevronDown,
} from "lucide-react";
import { DEFAULT_CUSTOM_EVENT_COLOR } from "../utils/customEvents";
import "./CreateEventModal.css";

const CreateEventModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialDate = new Date(),
  initialStartTime,
  initialEndTime,
}) => {
  const modalRef = useRef(null);
  const titleInputRef = useRef(null);

  const getInitialDateStr = () => {
    try {
      const d = initialDate instanceof Date ? initialDate : new Date();
      return format(d, "yyyy-MM-dd");
    } catch {
      return format(new Date(), "yyyy-MM-dd");
    }
  };

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(getInitialDateStr());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [location, setLocation] = useState("");
  const [teacher, setTeacher] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [onlineUrl, setOnlineUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDate(getInitialDateStr());
      setTitle("");
      setLocation("");
      setTeacher("");
      setIsOnline(false);
      setOnlineUrl("");
      setDescription("");
      setError("");
      setShowMoreOptions(false);

      if (initialStartTime && initialEndTime) {
        setStartTime(initialStartTime);
        setEndTime(initialEndTime);
      } else {
        const now = new Date();
        const currentHour = now.getHours();
        const nextHour = (currentHour + 1) % 24;
        const startHStr = String(nextHour).padStart(2, "0") + ":00";
        const endHStr = String((nextHour + 1) % 24).padStart(2, "0") + ":00";
        setStartTime(startHStr);
        setEndTime(endHStr);
      }

      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialDate, initialStartTime, initialEndTime]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Veuillez saisir un titre pour l'événement.");
      titleInputRef.current?.focus();
      return;
    }

    if (!date) {
      setError("Veuillez sélectionner une date.");
      return;
    }

    // Build Date objects
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const [year, month, day] = date.split("-").map(Number);
    const startDate = new Date(year, month - 1, day, startH, startM);
    const endDate = new Date(year, month - 1, day, endH, endM);

    if (endDate <= startDate) {
      setError("L'heure de fin doit être postérieure à l'heure de début.");
      return;
    }

    const eventPayload = {
      title: title.trim(),
      start: startDate,
      end: endDate,
      color: DEFAULT_CUSTOM_EVENT_COLOR,
      location: location.trim(),
      teacher: teacher.trim(),
      type: "Personnel",
      description: description.trim(),
      isOnline,
      onlineUrl: isOnline ? onlineUrl.trim() : "",
      isCustom: true,
    };

    onSubmit(eventPayload);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="create-event-overlay" onClick={handleOverlayClick}>
      <div className="create-event-modal" ref={modalRef}>
        <div className="create-event-header">
          <div className="create-event-header-info">
            <div className="create-event-icon-badge">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="create-event-title">Nouvel événement</h2>
              <p className="create-event-subtitle">
                Ajouter un événement personnalisé à votre planning
              </p>
            </div>
          </div>
          <button
            type="button"
            className="create-event-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="create-event-body">
            {error && <div className="create-event-error">{error}</div>}

            {/* Titre */}
            <div className="form-group">
              <label htmlFor="custom-event-title" className="form-label">
                Titre
              </label>
              <input
                id="custom-event-title"
                ref={titleInputRef}
                type="text"
                className="form-input form-input-title"
                placeholder="ex: Révision Maths, Projet Info, Rendez-vous..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Date et Horaires */}
            <div className="form-row form-row-2">
              <div className="form-group">
                <label htmlFor="custom-event-date" className="form-label">
                  <Calendar size={14} /> Date
                </label>
                <input
                  id="custom-event-date"
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={14} /> Horaires
                </label>
                <div className="time-inputs-container">
                  <input
                    type="time"
                    className="form-input time-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                  <span className="time-separator">à</span>
                  <input
                    type="time"
                    className="form-input time-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bouton pour dérouler les options supplémentaires */}
            <button
              type="button"
              className="more-options-toggle-btn"
              onClick={() => setShowMoreOptions((prev) => !prev)}
            >
              <span>
                {showMoreOptions
                  ? "Masquer les détails"
                  : "Plus d'options (salle, intervenant, description...)"}
              </span>
              <ChevronDown
                size={16}
                className={`toggle-chevron ${showMoreOptions ? "open" : ""}`}
              />
            </button>

            {/* Section déroulante : Salle, Intervenant, En ligne, Description */}
            {showMoreOptions && (
              <div className="more-options-section">
                <div className="form-row form-row-2">
                  <div className="form-group">
                    <label htmlFor="custom-event-location" className="form-label">
                      <MapPin size={14} /> Salle / Lieu
                    </label>
                    <input
                      id="custom-event-location"
                      type="text"
                      className="form-input"
                      placeholder="ex: Salle 301, BU..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="custom-event-teacher" className="form-label">
                      <User size={14} /> Intervenant / Responsable
                    </label>
                    <input
                      id="custom-event-teacher"
                      type="text"
                      className="form-input"
                      placeholder="ex: M. Dupont..."
                      value={teacher}
                      onChange={(e) => setTeacher(e.target.value)}
                    />
                  </div>
                </div>

                {/* Option En ligne */}
                <div className="form-group online-toggle-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isOnline}
                      onChange={(e) => setIsOnline(e.target.checked)}
                    />
                    <span className="checkbox-text">
                      <Video size={16} /> Événement / Réunion en ligne
                    </span>
                  </label>
                </div>

                {isOnline && (
                  <div className="form-group">
                    <label htmlFor="custom-event-url" className="form-label">
                      Lien de la réunion / visio
                    </label>
                    <input
                      id="custom-event-url"
                      type="url"
                      className="form-input"
                      placeholder="https://meet.google.com/... ou Teams / Zoom"
                      value={onlineUrl}
                      onChange={(e) => setOnlineUrl(e.target.value)}
                    />
                  </div>
                )}

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="custom-event-description" className="form-label">
                    <AlignLeft size={14} /> Description / Notes
                  </label>
                  <textarea
                    id="custom-event-description"
                    className="form-textarea"
                    rows={2}
                    placeholder="Détails, ordre du jour, notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="create-event-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Annuler
            </button>
            <button type="submit" className="btn-modal-submit">
              <Plus size={16} />
              Ajouter l'événement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
