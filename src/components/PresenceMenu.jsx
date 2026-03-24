import React, { useState, useEffect, useRef } from "react";
import {
  ClipboardCheck,
  RefreshCcw,
  ChevronDown,
  Calendar,
  Users,
  Clock,
  UserCheck,
  UserX,
  TrendingUp,
  Search,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAttendance } from "../context/AttendanceContext";
import { getUserGroups } from "../api";
import "./PresenceMenu.css";

const PresenceMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGroups, setShowGroups] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const {
    presenceGroupId,
    setPresenceGroupId,
    semesterStartDate,
    setSemesterStartDate,
    lastPresenceRefresh,
    presenceStats,
    isRefreshingPresence,
    refreshPresenceStats
  } = useAttendance();

  useEffect(() => {
    const rawGroups = getUserGroups();
    const formattedGroups = rawGroups
      .map(group => ({
        id: group.id || group.value?.id,
        name: String(group.name || group.value?.name || "Groupe sans nom"),
        path: String(group.path || ""),
      }))
      .filter(g => g.name !== "0" && g.id);

    formattedGroups.sort((a, b) => (a.path + a.name).localeCompare(b.path + b.name));
    setGroups(formattedGroups);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowGroups(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = async () => {
    if (!presenceGroupId || !semesterStartDate) {
      alert("Veuillez sélectionner une classe et une date de début.");
      return;
    }
    await refreshPresenceStats();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Jamais";
    return format(new Date(dateStr), "d MMMM HH:mm", { locale: fr });
  };

  return (
    <div className="presence-menu-container" ref={menuRef}>
      <button
        className={`btn-icon btn-presence ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Suivi de présence"
        aria-label="Ouvrir le suivi de présence"
      >
        <ClipboardCheck size={18} />
      </button>

      {isOpen && (
        <div className="presence-dropdown">
          <div className="presence-menu-header">
            <h3>Suivi de présence</h3>
            <TrendingUp size={18} className="header-trend-icon" />
          </div>

          <div className="presence-section">
            <label>
              <Users size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Ma Classe
            </label>
            <div className="presence-search-container" ref={searchRef}>
              <div
                className={`presence-search-trigger ${showGroups ? 'active' : ''}`}
                onClick={() => setShowGroups(!showGroups)}
              >
                <span>
                  {presenceGroupId
                    ? (groups.find(g => String(g.id) === String(presenceGroupId))?.name || "Classe sélectionnée")
                    : "Sélectionner une classe"
                  }
                </span>
                <ChevronDown size={14} className={`chevron-icon ${showGroups ? 'up' : ''}`} />
              </div>

              {showGroups && (
                <div className="presence-groups-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="presence-search-input-wrapper">
                    <Search size={14} className="search-icon" />
                    <input
                      autoFocus
                      type="text"
                      className="presence-search-input"
                      placeholder="Rechercher une classe..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="presence-groups-list">
                    {groups
                      .filter(g =>
                        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        g.path.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(group => (
                        <div
                          key={group.id}
                          className={`presence-group-item ${String(presenceGroupId) === String(group.id) ? 'selected' : ''}`}
                          onClick={() => {
                            setPresenceGroupId(group.id);
                            setShowGroups(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="group-item-content">
                            <span className="group-item-name">{group.name}</span>
                            {group.path && <span className="group-item-path">{group.path}</span>}
                          </div>
                          {String(presenceGroupId) === String(group.id) && <Check size={14} className="selected-check-icon" />}
                        </div>
                      ))
                    }
                    {groups.filter(g =>
                      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      g.path.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 && (
                        <div className="presence-no-results">Aucun résultat</div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="presence-section">
            <label>
              <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Début du semestre
            </label>
            <input
              type="date"
              className="presence-date-input"
              value={semesterStartDate}
              onChange={(e) => setSemesterStartDate(e.target.value)}
            />
          </div>

          {presenceStats && (
            <>
              <div className="presence-percentage-container">
                <span className="presence-percentage-value">{presenceStats.percentage}%</span>
                <span className="presence-percentage-label">Taux de présence</span>
              </div>

              <div className="presence-stats-grid">
                <div className="presence-stat-card">
                  <span className="presence-stat-value">{presenceStats.attendedHours}h</span>
                  <div className="presence-stat-label">
                    <UserCheck size={10} style={{ display: 'inline', marginRight: '2px' }} />
                    Assistées
                  </div>
                </div>
                <div className="presence-stat-card">
                  <span className="presence-stat-value">{presenceStats.absentHours}h</span>
                  <div className="presence-stat-label">
                    <UserX size={10} style={{ display: 'inline', marginRight: '2px' }} />
                    Absentes
                  </div>
                </div>
                <div className="presence-stat-card" style={{ gridColumn: 'span 2' }}>
                  <span className="presence-stat-value">{presenceStats.totalHours}h</span>
                  <div className="presence-stat-label">
                    <Clock size={10} style={{ display: 'inline', marginRight: '2px' }} />
                    Total des cours
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="presence-refresh-section">
            <button
              className="btn-presence-refresh"
              onClick={handleRefresh}
              disabled={isRefreshingPresence || !presenceGroupId || !semesterStartDate}
            >
              <RefreshCcw size={16} className={isRefreshingPresence ? "spinning" : ""} />
              {isRefreshingPresence ? "Mise à jour..." : "Synchroniser"}
            </button>
            <div className="refresh-time">
              Dernier refresh : {formatDate(lastPresenceRefresh)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresenceMenu;
