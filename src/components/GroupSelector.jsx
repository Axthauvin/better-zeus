import React, { useState, useEffect } from "react";
import { getUserGroups } from "../api";
import "./GroupSelector.css";
import { Search, Trash, Plus } from "lucide-react";
import { Check } from "lucide-react";

const GroupSelector = ({ selectedGroups, onGroupsChange }) => {
  const [allGroups, setAllGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les groupes au montage du composant
    const loadGroups = () => {
      try {
        setLoading(true);
        const groups = getUserGroups();
        console.log("Groupes récupérés:", groups);
        // Transformer les groupes pour avoir un format uniforme
        const formattedGroups = groups.map((group) => ({
          id: group.id || group.value?.id,
          name: group.name || group.value?.name || "Groupe sans nom",
          path: group.path || "",
        }));
        setAllGroups(formattedGroups);
      } catch (error) {
        console.error("Erreur lors du chargement des groupes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  // Filtrer les groupes selon la recherche
  const filteredGroups = allGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Séparer les groupes sélectionnés et non sélectionnés
  const selectedGroupsData = allGroups.filter((group) =>
    selectedGroups.includes(group.id),
  );

  const unselectedFilteredGroups = filteredGroups.filter(
    (group) => !selectedGroups.includes(group.id),
  );

  // Gérer la sélection/désélection d'un groupe
  const handleGroupToggle = (groupId) => {
    const isSelected = selectedGroups.includes(groupId);
    let newSelectedGroups;

    if (isSelected) {
      // Désélectionner le groupe
      newSelectedGroups = selectedGroups.filter((id) => id !== groupId);
    } else {
      // Sélectionner le groupe
      newSelectedGroups = [...selectedGroups, groupId];
    }

    console.log("Groupes sélectionnés après toggle:", newSelectedGroups);

    onGroupsChange(newSelectedGroups);
  };

  // Sélectionner/désélectionner tous les groupes filtrés
  const handleSelectAll = () => {
    const allFilteredIds = filteredGroups.map((g) => g.id);
    const allSelected = allFilteredIds.every((id) =>
      selectedGroups.includes(id),
    );

    if (allSelected) {
      // Désélectionner tous les groupes filtrés
      const newSelectedGroups = selectedGroups.filter(
        (id) => !allFilteredIds.includes(id),
      );
      onGroupsChange(newSelectedGroups);
    } else {
      // Sélectionner tous les groupes filtrés
      const newSelectedGroups = [
        ...new Set([...selectedGroups, ...allFilteredIds]),
      ];
      onGroupsChange(newSelectedGroups);
    }
  };

  if (loading) {
    return (
      <div className="group-selector">
        <div className="group-selector-header">
          <h3>Zeus</h3>
        </div>
        <div className="group-selector-loading">
          <p>Chargement des groupes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group-selector">
      <div className="group-selector-header">
        <div className="header-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="70%"
            height="70%"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M9.31994 13.2814H12.4099V20.4814C12.4099 21.5414 13.7299 22.0414 14.4299 21.2414L21.9999 12.6414C22.6599 11.8914 22.1299 10.7214 21.1299 10.7214H18.0399V3.52143C18.0399 2.46143 16.7199 1.96143 16.0199 2.76143L8.44994 11.3614C7.79994 12.1114 8.32994 13.2814 9.31994 13.2814Z"
              fill="#292D32"
            />
            <path
              d="M8.5 4.75H1.5C1.09 4.75 0.75 4.41 0.75 4C0.75 3.59 1.09 3.25 1.5 3.25H8.5C8.91 3.25 9.25 3.59 9.25 4C9.25 4.41 8.91 4.75 8.5 4.75Z"
              fill="#292D32"
            />
            <path
              d="M7.5 20.75H1.5C1.09 20.75 0.75 20.41 0.75 20C0.75 19.59 1.09 19.25 1.5 19.25H7.5C7.91 19.25 8.25 19.59 8.25 20C8.25 20.41 7.91 20.75 7.5 20.75Z"
              fill="#292D32"
            />
            <path
              d="M4.5 12.75H1.5C1.09 12.75 0.75 12.41 0.75 12C0.75 11.59 1.09 11.25 1.5 11.25H4.5C4.91 11.25 5.25 11.59 5.25 12C5.25 12.41 4.91 12.75 4.5 12.75Z"
              fill="#292D32"
            />
          </svg>
        </div>
        <div className="header-content">
          <h3>Zeus</h3>
          {selectedGroups.length > 0 && (
            <span className="group-count">{selectedGroups.length}</span>
          )}
        </div>
      </div>

      <div className="group-search">
        <div className="search-wrapper">
          <Search className="search-icon" size={16} strokeWidth={2} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="group-search-input"
          />
        </div>
      </div>

      <div className="group-content">
        {selectedGroupsData.length > 0 && (
          <div className="selected-section">
            <div className="section-header">
              <span className="section-title">Sélectionnés</span>
              <button
                className="clear-all-btn"
                onClick={() => onGroupsChange([])}
                title="Tout désélectionner"
              >
                Effacer tout
              </button>
            </div>
            <div className="selected-groups">
              {selectedGroupsData.map((group) => (
                <div key={group.id} className="selected-group-item">
                  <Check color="#7f56d9" size={16} />
                  <span className="group-name">{group.name}</span>
                  <button
                    className="remove-btn"
                    onClick={() => handleGroupToggle(group.id)}
                    title="Retirer"
                  >
                    <Trash size={16} color="#667085" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="all-groups-section">
          <div className="section-header">
            <span className="section-title">Tous les groupes</span>
            {/* {unselectedFilteredGroups.length > 0 && (
              <button className="select-all-btn" onClick={handleSelectAll}>
                Tout sélectionner
              </button>
            )} */}
          </div>
          <div className="group-list">
            {unselectedFilteredGroups.length === 0 &&
            searchQuery === "" &&
            selectedGroups.length === allGroups.length ? (
              <div className="no-groups">
                <p>Tous les groupes sont sélectionnés</p>
              </div>
            ) : unselectedFilteredGroups.length === 0 ? (
              <div className="no-groups">
                <p>Aucun groupe trouvé</p>
              </div>
            ) : (
              unselectedFilteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="group-item"
                  onClick={() => handleGroupToggle(group.id)}
                >
                  <div className="group-info">
                    <span className="group-name">{group.name}</span>
                    {group.path && (
                      <span className="group-path">{group.path}</span>
                    )}
                  </div>
                  <button className="add-btn" title="Ajouter">
                    <Plus size={16} strokeWidth={2} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSelector;
