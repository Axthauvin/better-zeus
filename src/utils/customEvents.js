export const CUSTOM_EVENTS_STORAGE_KEY = "better-zeus-custom-events";

// Distinctive yellow color that does not clash with standard Zeus course types
export const DEFAULT_CUSTOM_EVENT_COLOR = "#EAB308";

/**
 * Retrieve all custom events from localStorage.
 * Converts start and end ISO strings back to Date objects.
 * @returns {Array} Array of custom event objects
 */
export function getCustomEvents() {
  try {
    const raw = localStorage.getItem(CUSTOM_EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      ...item,
      start: new Date(item.start),
      end: new Date(item.end),
      isCustom: true,
    }));
  } catch (error) {
    console.error("Failed to load custom events from localStorage:", error);
    return [];
  }
}

/**
 * Persist custom events array to localStorage.
 * @param {Array} events
 */
function persistCustomEvents(events) {
  try {
    const serialized = events.map((event) => ({
      ...event,
      start:
        event.start instanceof Date ? event.start.toISOString() : event.start,
      end: event.end instanceof Date ? event.end.toISOString() : event.end,
      isCustom: true,
    }));
    localStorage.setItem(CUSTOM_EVENTS_STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error("Failed to persist custom events to localStorage:", error);
  }
}

/**
 * Save or update a custom event.
 * @param {Object} eventData
 * @returns {Object} Created event object
 */
export function saveCustomEvent(eventData) {
  const currentEvents = getCustomEvents();
  const id =
    eventData.id ||
    `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newEvent = {
    id,
    title: (eventData.title || "Événement personnalisé").trim(),
    start: new Date(eventData.start),
    end: new Date(eventData.end),
    color: eventData.color || DEFAULT_CUSTOM_EVENT_COLOR,
    location: (eventData.location || "").trim(),
    teacher: (eventData.teacher || "").trim(),
    type: (eventData.type || "Personnalisé").trim(),
    description: (eventData.description || "").trim(),
    isOnline: !!eventData.isOnline,
    onlineUrl: (eventData.onlineUrl || "").trim(),
    isCustom: true,
    groups: eventData.groups || [],
    rooms: eventData.location ? [{ name: eventData.location }] : [],
  };

  const existingIndex = currentEvents.findIndex((e) => e.id === id);
  let updatedEvents;
  if (existingIndex >= 0) {
    updatedEvents = [...currentEvents];
    updatedEvents[existingIndex] = newEvent;
  } else {
    updatedEvents = [...currentEvents, newEvent];
  }

  persistCustomEvents(updatedEvents);
  return newEvent;
}

/**
 * Delete a custom event by ID from localStorage.
 * @param {string|number} eventId
 * @returns {Array} Updated array of custom events
 */
export function deleteCustomEvent(eventId) {
  const currentEvents = getCustomEvents();
  const filteredEvents = currentEvents.filter(
    (e) => String(e.id) !== String(eventId),
  );
  persistCustomEvents(filteredEvents);
  return filteredEvents;
}
