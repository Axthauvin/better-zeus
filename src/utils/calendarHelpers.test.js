/**
 * @jest-environment jsdom
 */
import { getEventStyle } from "./calendarHelpers.js";

describe("calendarHelpers - getEventStyle", () => {
  test("returns mapped color for predefined colors", () => {
    const event = { color: "#7C3AED" };
    const styleLight = getEventStyle(event, "light");
    expect(styleLight.border).toBe("#7C3AED");

    const styleDark = getEventStyle(event, "dark");
    expect(styleDark.text).toBe("#FFFFFF");
  });

  test("generates dynamic style for custom hex colors not in predefined map", () => {
    const event = { color: "#06B6D4" };
    const styleLight = getEventStyle(event, "light");
    expect(styleLight.border).toBe("#06B6D4");
    expect(styleLight.bg).toContain("rgba(6, 182, 212");

    const styleDark = getEventStyle(event, "dark");
    expect(styleDark.text).toBe("#FFFFFF");
    expect(styleDark.border).toBe("#06B6D4");
  });
});
