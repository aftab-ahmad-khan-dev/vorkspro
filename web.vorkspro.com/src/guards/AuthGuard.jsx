// src/guards/AuthGuard.jsx
import { Navigate } from "react-router-dom";

export const AuthGuard = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
