import React, { useState } from "react";

function ProfilePicture({
  name = "",
  profilePicture = "",
  size = 48,
  textColor = "#000",
  className = "", // <-- NEW PROP (safe & optional)
}) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName) => {
    if (!fullName) return "";
    const words = fullName.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--border)",
    textTransform: "uppercase",
    color: "var(--foreground)",
    fontWeight: "600",
    fontSize: size * 0.4,
    userSelect: "none",
  };

  return (
    <div style={containerStyle} className={className}>
      {profilePicture && !imageError ? (
        <img
          src={profilePicture}
          alt={name}
          onError={() => setImageError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default ProfilePicture;
