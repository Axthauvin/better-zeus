const API_BASE_URL =
  "https://zeus.ionis-it.com/api/reservation/filter/displayable";

function getAuth() {
  const token = localStorage.getItem("ZEUS-AUTH");
  if (!token) {
    throw new Error("No auth token found");
  }

  // Decode the token to get the user ID
  const authenticated = JSON.parse(token);
  if (!authenticated || !authenticated.isAuthenticated) {
    throw new Error("User is not authenticated");
  }

  return authenticated.token;
}

export async function fetchTimeTable(
  groupsId = [],
  startDate = new Date(),
  endDate = new Date(new Date().setDate(startDate.getDate() + 7)),
) {
  if (groupsId.length === 0) {
    console.warn("No groups provided, fetching timetable for all groups");
    return [];
  }

  try {
    const authToken = getAuth();

    if (!authToken) {
      throw new Error("No auth token available");
    }
    console.log("Fetching timetable with auth token:", authToken);

    // Make parallel requests for each group
    const requests = groupsId.map((groupId) => {
      const params = new URLSearchParams({
        groups: groupId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      console.log(`${API_BASE_URL}?${params.toString()}`);

      return fetch(`${API_BASE_URL}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    });

    const responses = await Promise.all(requests);

    const allData = await Promise.all(
      responses.map((response) => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      }),
    );

    return allData.flat();
  } catch (error) {
    console.error("Error fetching timetable:", error);

    throw error;
  }
}

function getColorForEventType(type) {
  const typeColors = {
    "CourseType.Lecture": "#7C3AED",
    "CourseType.Practice": "#3B82F6",
    "CourseType.Conference": "#14B8A6",
    "CourseType.Workshop": "#10B981",
    "CourseType.TD": "#EC4899",
    "CourseType.Permanence": "#F59E0B",
    "CourseType.Exam": "#EF4444",
  };

  return typeColors[type] || "#7C3AED";
}

// Transform API data to calendar events
export function transformApiDataToEvents(apiData) {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map((item, index) => ({
    id: item.idReservation || item.id || index,
    title: item.name || item.title || "Sans titre",
    start: new Date(item.startDate || item.start),
    end: new Date(item.endDate || item.end),
    color: getColorForEventType(item.typeName),
    description: item.description || "",
    location: item.rooms && item.rooms.length > 0 ? item.rooms[0].name : "",
    teacher:
      item.teachers && item.teachers.length > 0
        ? item.teachers.map((t) => t.name).join(", ")
        : "",
    type: item.typeName || "",
    groups: item.groups ? item.groups.map((g) => g.name) : [],
    rooms: item.rooms || [],
  }));
}

// Generate random color for events
function getRandomColor() {
  const colors = [
    "#7C3AED",
    "#3B82F6",
    "#F97316",
    "#8B5CF6",
    "#6366F1",
    "#10B981",
    "#EF4444",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get user groups from localStorage or default
export function getUserGroups() {
  try {
    const groupsData = localStorage.getItem("ZEUS-groupHierarchy");

    if (!groupsData) throw new Error("No group data");

    // The idea is to gather all objects in value
    // each object will have a value group, and an id : id is group id
    // go fetch all the tree

    let groups = JSON.parse(groupsData);
    let allGroups = [];

    function traverse(group, path = "") {
      allGroups.push({ ...group, path });
      if (group.children && Array.isArray(group.children)) {
        group.children.forEach((child) =>
          traverse(
            child,
            group.name !== "0"
              ? path
                ? `${path}/${group.name}`
                : group.name
              : path,
          ),
        );
      }
    }

    groups.values.forEach(traverse);

    console.log("All groups extracted:", allGroups);

    return allGroups;
  } catch (error) {
    console.error("Error getting user groups:", error);
  }

  // Return empty array if no groups found
  return [];
}

export function getGroup(groupId) {
  const groups = getUserGroups();
  return groups.find((group) => group.id === groupId);
}

export function getGroupName(groupId) {
  const group = getGroup(groupId);
  return group ? group.name : "Unknown Group";
}

export function getSavedGroups() {
  const savedGroup = localStorage.getItem("better-zeus-saved-group");
  return savedGroup ? JSON.parse(savedGroup) : null;
}

export function saveSelectedGroups(groups) {
  localStorage.setItem("better-zeus-saved-group", JSON.stringify(groups));
}

export function getSavedView() {
  const savedView = localStorage.getItem("better-zeus-calendar-view");
  return savedView || "week";
}

export function saveView(view) {
  localStorage.setItem("better-zeus-calendar-view", view);
}
