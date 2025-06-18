import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const RootComponent = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("chat-app-login-user-data");
    return stored ? JSON.parse(stored) : null;
  });

  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/signup" element={<SignupPage setUser={setUser} />} />
        <Route
          path="/tracker"
          element={
            token ? (
              <App user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
