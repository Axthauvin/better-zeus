import React, { useState, useEffect, useRef } from "react";
import { Database, Download, Upload, Trash2 } from "lucide-react";
import "./DataMenu.css";

const DataMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("better-zeus-")) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `better-zeus-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith("better-zeus-")) {
            localStorage.setItem(key, value);
          }
        }
        alert("Données importées avec succès ! L'application va se recharger.");
        window.location.reload();
      } catch (error) {
        alert("Erreur lors de l'importation des données.");
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // reset
    setIsOpen(false);
  };

  const handleClear = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes les données de l'extension ?")) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("better-zeus-")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      alert("Données supprimées. L'application va se recharger.");
      window.location.reload();
    }
    setIsOpen(false);
  };

  return (
    <div className="data-menu-container" ref={menuRef}>
      <button
        className={`btn-icon btn-data ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Gestion des données"
        aria-label="Ouvrir la gestion des données"
      >
        <Database size={18} />
      </button>

      {isOpen && (
        <div className="data-dropdown">
          <div className="data-menu-header">
            <h3>Gestion des données</h3>
            <Database size={18} className="header-data-icon" />
          </div>

          <div className="data-actions-section">
            <button className="btn-data-action" onClick={handleExport}>
              <Download size={16} />
              Exporter les données
            </button>
            
            <button 
              className="btn-data-action" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              Importer des données
            </button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImport}
            />

            <div className="data-divider"></div>

            <button className="btn-data-action danger" onClick={handleClear}>
              <Trash2 size={16} />
              Effacer les données
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataMenu;
