import React from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useUsage } from "../../../hooks/useUsage";
import { formatTimeUntilReset } from "../../../utils/formatTime";
import { openCreditManagement } from "../../../actions/usage";

const ProfileSettings: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    usage,
    loading: usageLoading,
    error: usageError,
    refreshUsage,
  } = useUsage();

  // Get plan info from auth (more reliable than usage API)
  const userPlan = user?.plan || "free";
  const hasProAccess = user?.hasProAccess || false;

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
      {/* Profile Section */}
      <div style={styles.section}>
        <div style={styles.optionsContainer}>
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
              <h4 style={styles.name}>{user.name}</h4>
              <p style={styles.email}>{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider}></div>

      {/* Plan Section */}
      <div style={styles.section}>
        <div style={styles.optionsContainer}>
          <div style={styles.planInfo}>
            <div style={styles.planHeader}>
              <span style={styles.planLabel}>Plan Type</span>
              <span style={styles.planValue}>
                {hasProAccess ? "Pro Plan" : "Free Plan"}
              </span>
            </div>
            {!hasProAccess && (
              <div style={styles.upgradePrompt}>
                <div style={styles.upgradeInfo}>
                  <span style={styles.crownIcon}>👑</span>
                  <span style={styles.upgradeTitle}>Turn Pro</span>
                </div>
                <button
                  style={styles.upgradeButton}
                  onClick={() => {
                    openCreditManagement().catch(console.error);
                  }}
                >
                  Upgrade
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider}></div>

      {/* Credits Section */}
      <div style={styles.section}>
        <div style={styles.optionsContainer}>
          {usageLoading ? (
            <div style={styles.loadingText}>Loading credits...</div>
          ) : usageError ? (
            <div style={styles.errorText}>Failed to load credits</div>
          ) : usage ? (
            <>
              <div style={styles.creditsHeader}>
                <span style={styles.creditsLabel}>Usage</span>
                <button
                  style={styles.manageBtn}
                  onClick={() => {
                    openCreditManagement().catch(console.error);
                  }}
                >
                  Manage
                </button>
              </div>
              <div style={styles.creditsInfo}>
                <div style={styles.planInfo}>
                  Plan: {usage.usedPoints}/{usage.totalPoints}
                </div>
                <div style={styles.progressBarContainer}>
                  <div style={styles.progressBarTrack}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${Math.min(100, (usage.usedPoints / usage.totalPoints) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div style={styles.creditsUsed}>
                  {usage.usedPoints} of your daily credits used
                </div>
              </div>
            </>
          ) : (
            <div style={styles.errorText}>No usage data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    fontSize: "12px",
  },
  section: {
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: "8px",
  },
  sectionDescription: {
    color: "#bdbdbd",
    fontSize: "11px",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  optionsContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    padding: "12px",
    border: "1px solid #23272f",
  },
  divider: {
    borderTop: "1px solid #23272f",
    marginTop: "16px",
    marginBottom: "16px",
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
    padding: "16px",
    backgroundColor: "#1a1a1a",
    borderTop: "1px solid #2a2a2a",
    marginTop: "8px",
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
  creditsLabel: {
    color: "#fff",
    fontSize: "12px",
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
  loadingText: {
    color: "#a1a1aa",
    fontSize: "11px",
    fontStyle: "italic",
  },
  errorText: {
    color: "#ef4444",
    fontSize: "11px",
    fontStyle: "italic",
  },
  planSection: {
    padding: "16px",
    backgroundColor: "#1a1a1a",
    borderTop: "1px solid #2a2a2a",
    marginTop: "8px",
  },
  planHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  planInfoContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2px",
  },
  planLabel: {
    color: "#a1a1aa",
    fontSize: "10px",
    fontWeight: "500",
  },
  planValue: {
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
  },
  upgradeButton: {
    background: "#6b46c1",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "background 0.2s",
  },
  crownIcon: {
    fontSize: "10px",
  },
  upgradeText: {
    color: "#a1a1aa",
    fontSize: "10px",
    fontStyle: "italic",
  },
  progressBarContainer: {
    margin: "8px 0",
  },
  progressBarTrack: {
    width: "100%",
    height: "8px",
    backgroundColor: "#3a3a3a",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4169e1",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  upgradeSection: {
    padding: "16px",
    backgroundColor: "#1a1a1a",
    borderTop: "1px solid #2a2a2a",
    marginTop: "8px",
  },
  upgradeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upgradeInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  upgradeTitle: {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
  },
  planTitle: {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
  },
  upgradePrompt: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "#2a2a2a",
    borderRadius: "6px",
  },
};

export default ProfileSettings;
