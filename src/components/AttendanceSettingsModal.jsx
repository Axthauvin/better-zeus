import React, { useState } from "react";
import { X, Percent } from "lucide-react";
import { useAttendance } from "../context/AttendanceContext";
import "./EventModal.css"; // Reuse EventModal styles for consistency

const AttendanceSettingsModal = ({ onClose }) => {
  const { attendanceThreshold, setAttendanceThreshold } = useAttendance();
  const [inputValue, setInputValue] = useState(attendanceThreshold);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    let val = Number(inputValue);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 100) val = 100;
    setAttendanceThreshold(val);
    onClose();
  };

  return (
    <div
      className="event-modal-overlay"
      onClick={handleOverlayClick}
      style={{ zIndex: 1100 }}
    >
      <div className="event-modal">
        <div className="event-modal-header">
          <div className="event-modal-title-section">
            <h2 className="event-modal-title">Paramètres de validation</h2>
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
            <Percent size={18} className="event-info-icon" />
            <div className="event-info-content">
              <div className="event-info-label">
                Taux de validation requis (%)
              </div>
              <div className="event-info-value" style={{ marginTop: "8px" }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>
          </div>
          <div className="event-description">
            <p className="event-description-text">
              Définissez le pourcentage minimum de cours auxquels vous devez
              assister pour valider.
            </p>
          </div>
        </div>

        <div className="event-modal-footer">
          <button
            className="btn-modal-secondary"
            onClick={onClose}
            style={{ marginRight: "8px" }}
          >
            Annuler
          </button>
          <button
            className="btn-modal-primary"
            onClick={handleSave}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSettingsModal;
