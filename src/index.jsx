import React from "react";
import { createRoot } from "react-dom/client";
import CalendarContainer from "./components/CalendarContainer";
import LoginView from "./views/LoginView";
import { AttendanceProvider } from "./context/AttendanceContext";

// Show loading state immediately
showLoadingState();

// Wait for the page to load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function showLoadingState() {
  const loader = document.createElement("div");
  loader.id = "better-zeus-loader";
  loader.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="text-align: center;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation: spin 1s linear infinite;">
          <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" fill="#1a1a1a"/>
        </svg>
        <p style="
          margin-top: 16px;
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        ">Loading Better Zeus...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(loader);
}

function hideLoadingState() {
  const loader = document.getElementById("better-zeus-loader");
  if (loader) {
    loader.remove();
  }
}

function init() {
  setTimeout(() => {
    console.log("Better Zeus: Initializing");

    const isHomePage =
      window.location.href.includes("/home") ||
      window.location.href.includes("officeConnect");
    const isLoginPage =
      !isHomePage &&
      (window.location.pathname === "/login" ||
        window.location.pathname.includes("login"));

    console.log("On page", window.location.href);

    // Show login view on login page
    if (isLoginPage) {
      console.log("Better Zeus: Showing login view");
      showLoginView();
      return;
    }

    // Show calendar on home page
    if (isHomePage) {
      console.log("Better Zeus: Showing calendar");
      showCalendar();
      return;
    }

    console.log("Better Zeus: Not on login or home page");
    hideLoadingState();
  }, 20);
}

function showLoginView() {
  // Hide loading state
  hideLoadingState();

  // Create container for our login view
  const container = document.createElement("div");
  container.id = "better-zeus-login";

  // Append to body
  document.body.appendChild(container);

  // Hide the original Zeus content
  const zeusRoot = document.querySelector("zeus-root");
  if (zeusRoot) zeusRoot.style.display = "none";

  const mainContent = document.querySelector("main");
  if (mainContent) mainContent.style.display = "none";

  // Render the login view
  const root = createRoot(container);
  root.render(<LoginView />);
}

function showCalendar() {
  // Wait until we're actually redirected to the home page
  if (!window.location.href.includes("/home")) {
    setTimeout(showCalendar, 50);
    return;
  }

  // Hide loading state
  hideLoadingState();

  // Create container for our calendar
  const container = document.createElement("div");
  container.id = "better-zeus-calendar";

  const body = document.body;
  const previousBodyOverflow = body.style.overflow;

  // Insert at the beginning of the main content
  if (body.firstChild) {
    body.insertBefore(container, body.firstChild);
  } else {
    body.appendChild(container);
  }

  // Ensure the container fills the viewport and prevents body scrolling
  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100vh",
    zIndex: "9999",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  });

  // Lock body scroll while the calendar overlay is shown
  body.style.overflow = "hidden";

  // Restore body overflow when the page is unloaded
  function restoreBodyOverflow() {
    body.style.overflow = previousBodyOverflow;
    window.removeEventListener("beforeunload", restoreBodyOverflow);
  }
  window.addEventListener("beforeunload", restoreBodyOverflow);

  /* Hide Zeus root element if present */
  const zeusRoot = document.querySelector("zeus-root");
  if (zeusRoot) zeusRoot.style.display = "none";

  // Render the React app
  const root = createRoot(container);
  root.render(
    <AttendanceProvider>
      <CalendarContainer />
    </AttendanceProvider>,
  );
}
