// src/guards/ForwardGuard.jsx
import { Navigate } from "react-router-dom";

export const ForwardGuard = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};
