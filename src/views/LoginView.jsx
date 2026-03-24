import React, { useState, useEffect } from "react";
import "./LoginView.css";

const LoginView = () => {
  const [welcomeTitle, setWelcomeTitle] = useState("Welcome Back");
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(
    "Sign in to continue to Better Zeus",
  );
  const [officeButton, setOfficeButton] = useState(null);

  useEffect(() => {
    // Find the text of the title on the page
    // as Zeus is slow (we are faster), we have to try to get the text multiple time
    // (thats why this code looks BAD)

    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }

      const h1 = document.querySelector("h1");
      const h3 = document.querySelector("h3");

      if (h1 && h1.textContent) {
        setWelcomeTitle(h1.textContent);
      }

      if (h3 && h3.textContent) {
        setWelcomeSubtitle(h3.textContent);
      }

      attempts++;
    }, 50);

    // Find the Office 365 login button
    const findOfficeButton = () => {
      const buttons = document.querySelectorAll("button, a");
      console.log(buttons);
      for (const btn of buttons) {
        const imgInside = btn.querySelector("img");
        if (imgInside.src.includes("office")) return btn;
      }
      return null;
    };

    const button = findOfficeButton();
    if (button) {
      setOfficeButton(button);
    }
  }, []);

  const handleOfficeLogin = () => {
    if (officeButton) {
      officeButton.click();
    }
  };

  return (
    <div className="login-view">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-container">
            <svg
              class="logo-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="50%"
              height="50%"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M9.31994 13.2814H12.4099V20.4814C12.4099 21.5414 13.7299 22.0414 14.4299 21.2414L21.9999 12.6414C22.6599 11.8914 22.1299 10.7214 21.1299 10.7214H18.0399V3.52143C18.0399 2.46143 16.7199 1.96143 16.0199 2.76143L8.44994 11.3614C7.79994 12.1114 8.32994 13.2814 9.31994 13.2814Z"
                fill="currentColor"
              />
              <path
                d="M8.5 4.75H1.5C1.09 4.75 0.75 4.41 0.75 4C0.75 3.59 1.09 3.25 1.5 3.25H8.5C8.91 3.25 9.25 3.59 9.25 4C9.25 4.41 8.91 4.75 8.5 4.75Z"
                fill="currentColor"
              />
              <path
                d="M7.5 20.75H1.5C1.09 20.75 0.75 20.41 0.75 20C0.75 19.59 1.09 19.25 1.5 19.25H7.5C7.91 19.25 8.25 19.59 8.25 20C8.25 20.41 7.91 20.75 7.5 20.75Z"
                fill="currentColor"
              />
              <path
                d="M4.5 12.75H1.5C1.09 12.75 0.75 12.41 0.75 12C0.75 11.59 1.09 11.25 1.5 11.25H4.5C4.91 11.25 5.25 11.59 5.25 12C5.25 12.41 4.91 12.75 4.5 12.75Z"
                fill="currentColor"
              />
            </svg>
            <span className="logo-text">Better Zeus</span>
          </div>
        </div>

        <div className="login-content">
          <h1 className="login-title">{welcomeTitle}</h1>
          <p className="login-subtitle">{welcomeSubtitle}</p>

          <button className="office-login-button" onClick={handleOfficeLogin}>
            <svg
              className="microsoft-icon"
              viewBox="0 0 23 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0H11V11H0V0Z" fill="#F25022" />
              <path d="M12 0H23V11H12V0Z" fill="#7FBA00" />
              <path d="M0 12H11V23H0V12Z" fill="#00A4EF" />
              <path d="M12 12H23V23H12V12Z" fill="#FFB900" />
            </svg>
            Sign in with Office 365
          </button>

          <div className="login-footer">
            <p className="footer-text">Enhanced calendar experience for Zeus</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
