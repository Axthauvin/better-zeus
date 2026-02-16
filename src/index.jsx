import React from "react";
import { createRoot } from "react-dom/client";
import CalendarContainer from "./components/CalendarContainer";

// Wait for the page to load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function init() {
  console.log("Better Zeus: Initializing calendar on zeus.ionis-it.com/home");

  // Create container for our calendar
  const container = document.createElement("div");
  container.id = "better-zeus-calendar";

  // Find a good place to inject the calendar
  const mainContent =
    document.querySelector("main") ||
    document.querySelector(".content") ||
    document.body;

  // Insert at the beginning of the main content
  if (mainContent.firstChild) {
    mainContent.insertBefore(container, mainContent.firstChild);
  } else {
    mainContent.appendChild(container);
  }

  // Render the React app
  const root = createRoot(container);
  root.render(<CalendarContainer />);
}
