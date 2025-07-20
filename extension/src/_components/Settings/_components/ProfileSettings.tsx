import React from "react";
import { useAuth } from "../../../hooks/useAuth";

const ProfileSettings: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div style={styles.container}>
        <div style={styles.notAuthenticated}>
          Please sign in to view your profile
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.profileSection}>
        <div style={styles.avatarContainer}>
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.name}'s profile`}
              style={styles.avatar}
            />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div style={styles.userInfo}>
          <h2 style={styles.name}>{user.name}</h2>
          <p style={styles.email}>{user.email}</p>
        </div>
      </div>
      {/* Compact Credits Section */}
      <div style={styles.creditsSection}>
        <div style={styles.creditsHeader}>
          <span style={styles.creditsTitle}>Credits Used</span>
          <button style={styles.manageBtn}>Manage</button>
        </div>
        <div style={styles.creditsInfo}>
          <div style={styles.planInfo}>Plan: 0/5</div>
          <div style={styles.creditsUsed}>0 of your daily credits used</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "8px",
  },
  notAuthenticated: {
    color: "#a1a1aa",
    textAlign: "center" as const,
    padding: "8px",
    fontSize: "10px",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  avatarContainer: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    overflow: "hidden",
    backgroundColor: "#2A2B2C",
  },
  avatar: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366F1",
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  name: {
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 2px 0",
  },
  email: {
    color: "#a1a1aa",
    fontSize: "10px",
    margin: "0",
  },
  upgradeBtn: {
    background: "#4169e1", // Match FloatingButton blue color
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px", // Larger padding
    fontSize: "12px", // Larger text
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "background 0.2s",
  },
  creditsSection: {
    padding: "12px 16px", // Increased padding
    borderBottom: "1px solid #23272f", // Match FloatingButton divider color
  },
  creditsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px", // Increased margin
  },
  creditsTitle: {
    color: "#fff",
    fontSize: "14px", // Larger text
    fontWeight: "500",
  },
  manageBtn: {
    background: "none",
    border: "none",
    color: "#4169e1", // Match FloatingButton blue color
    fontSize: "12px", // Larger text
    cursor: "pointer",
    textDecoration: "underline",
  },
  creditsInfo: {
    color: "#bdbdbd", // Match FloatingButton text color
    fontSize: "12px", // Larger text
  },
  planInfo: {
    marginBottom: "4px",
  },
  creditsUsed: {
    fontSize: "11px", // Larger text
  },
};

export default ProfileSettings;
