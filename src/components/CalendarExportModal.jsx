import React, { useEffect, useState } from "react";
import { Check, Copy, Calendar, Loader2, X } from "lucide-react";
import { buildCalendarExportLink, fetchCalendarExportToken } from "../api";
import "./EventModal.css";
import "./CalendarExportModal.css";

const CalendarExportModal = ({ selectedGroups = [], onClose }) => {
  const [exportToken, setExportToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedGroupId, setCopiedGroupId] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadToken = async () => {
      setLoading(true);
      setError("");

      if (selectedGroups.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const token = await fetchCalendarExportToken();
        if (isActive) {
          setExportToken(token);
        }
      } catch (err) {
        if (isActive) {
          setError(
            err?.message ||
              "Impossible de générer les liens de calendrier pour le moment.",
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadToken();

    return () => {
      isActive = false;
    };
  }, [selectedGroups]);

  useEffect(() => {
    if (!copiedGroupId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopiedGroupId(null);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copiedGroupId]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleCopy = async (text, groupId) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = text;
        temporaryInput.setAttribute("readonly", "true");
        temporaryInput.style.position = "absolute";
        temporaryInput.style.left = "-9999px";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        document.execCommand("copy");
        document.body.removeChild(temporaryInput);
      }

      setCopiedGroupId(groupId);
    } catch (copyError) {
      setError(
        copyError?.message ||
          "Impossible de copier automatiquement le lien, sélectionne-le manuellement.",
      );
    }
  };

  const renderContent = () => {
    if (selectedGroups.length === 0) {
      return (
        <div className="calendar-export-empty">
          <Calendar size={20} />
          <p>Sélectionne au moins un groupe pour générer un lien iCal.</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="calendar-export-state">
          <Loader2 className="calendar-export-spinner" size={20} />
          <p>Récupération du token de synchronisation...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="calendar-export-state calendar-export-error">
          <p>{error}</p>
        </div>
      );
    }

    return (
      <div className="calendar-export-list">
        {selectedGroups.map((group) => {
          const link = buildCalendarExportLink(group.id, exportToken);
          const isCopied = copiedGroupId === group.id;

          return (
            <div className="calendar-export-card" key={group.id}>
              <div className="calendar-export-card-header">
                <div>
                  <p className="calendar-export-group-name">{group.name}</p>
                  <p className="calendar-export-group-id">Groupe {group.id}</p>
                </div>
                <button
                  className="calendar-export-copy"
                  onClick={() => handleCopy(link, group.id)}
                  type="button"
                >
                  {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{isCopied ? "Copié" : "Copier"}</span>
                </button>
              </div>
              <input
                className="calendar-export-link"
                readOnly
                value={link}
                onFocus={(event) => event.currentTarget.select()}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="event-modal-overlay" onClick={handleOverlayClick}>
      <div className="event-modal calendar-export-modal">
        <div className="event-modal-header">
          <div className="event-modal-title-section">
            <Calendar size={20} className="calendar-export-title-icon" />
            <h2 className="event-modal-title">Exporter le calendrier</h2>
          </div>
          <button
            className="event-modal-close"
            onClick={onClose}
            aria-label="Fermer"
            type="button"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="event-modal-body">
          <p className="calendar-export-description">
            Chaque groupe sélectionné reçoit un lien iCal distinct à importer
            dans Google Calendar, Apple Calendar ou Outlook.
          </p>
          {renderContent()}
        </div>

        <div className="event-modal-footer">
          <button
            className="btn-modal-secondary"
            onClick={onClose}
            type="button"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarExportModal;
