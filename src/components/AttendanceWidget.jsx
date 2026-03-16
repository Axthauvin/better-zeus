import React, { useState } from "react";
import { Settings, Percent } from "lucide-react";
import { useAttendance } from "../context/AttendanceContext";
import AttendanceSettingsModal from "./AttendanceSettingsModal";
import "./AttendanceWidget.css";

const AttendanceWidget = ({ events }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { calculateAttendanceRate, attendanceThreshold } = useAttendance();

  const currentRate = calculateAttendanceRate(events);
  const isPassing = currentRate >= attendanceThreshold;

  return (
    <div className="attendance-widget-container">
      <div
        className={`attendance-widget ${isPassing ? "passing" : "failing"}`}
        title={`Taux de validation: ${currentRate}% (Requis: ${attendanceThreshold}%)`}
      >
        <span className="attendance-rate">{currentRate}%</span>
        <button
          className="attendance-settings-btn"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Paramètres de présence"
        >
          <Settings size={14} />
        </button>
      </div>

      {isSettingsOpen && (
        <AttendanceSettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};

export default AttendanceWidget;
