/**
 * @jest-environment jsdom
 */
import {
  getCustomEvents,
  saveCustomEvent,
  deleteCustomEvent,
  CUSTOM_EVENTS_STORAGE_KEY,
} from "./customEvents.js";

describe("customEvents utility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("getCustomEvents returns empty array when nothing is stored", () => {
    expect(getCustomEvents()).toEqual([]);
  });

  test("saveCustomEvent saves event in localStorage and returns event object", () => {
    const start = new Date("2026-09-20T09:00:00.000Z");
    const end = new Date("2026-09-20T10:30:00.000Z");

    const saved = saveCustomEvent({
      title: "Réunion Projet",
      start,
      end,
      color: "#8B5CF6",
      location: "Salle 102",
      type: "Projet",
      description: "Préparation de la soutenance",
    });

    expect(saved.id).toBeDefined();
    expect(saved.title).toBe("Réunion Projet");
    expect(saved.isCustom).toBe(true);
    expect(saved.start).toEqual(start);
    expect(saved.end).toEqual(end);
    expect(saved.location).toBe("Salle 102");
    expect(saved.rooms).toEqual([{ name: "Salle 102" }]);

    const stored = getCustomEvents();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(saved.id);
    expect(stored[0].title).toBe("Réunion Projet");
    expect(stored[0].start instanceof Date).toBe(true);
    expect(stored[0].end instanceof Date).toBe(true);
  });

  test("saveCustomEvent updates an existing event when id is provided", () => {
    const saved = saveCustomEvent({
      title: "Initial Title",
      start: new Date("2026-09-20T09:00:00.000Z"),
      end: new Date("2026-09-20T10:00:00.000Z"),
    });

    saveCustomEvent({
      id: saved.id,
      title: "Updated Title",
      start: new Date("2026-09-20T10:00:00.000Z"),
      end: new Date("2026-09-20T11:00:00.000Z"),
    });

    const events = getCustomEvents();
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Updated Title");
  });

  test("deleteCustomEvent removes event by id", () => {
    const event1 = saveCustomEvent({
      title: "Event 1",
      start: new Date("2026-09-20T09:00:00.000Z"),
      end: new Date("2026-09-20T10:00:00.000Z"),
    });

    const event2 = saveCustomEvent({
      title: "Event 2",
      start: new Date("2026-09-20T11:00:00.000Z"),
      end: new Date("2026-09-20T12:00:00.000Z"),
    });

    expect(getCustomEvents()).toHaveLength(2);

    deleteCustomEvent(event1.id);

    const remaining = getCustomEvents();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(event2.id);
  });
});
