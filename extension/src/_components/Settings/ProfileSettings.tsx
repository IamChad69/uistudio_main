import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useUsage } from "../../hooks/useUsage";
import { openCreditManagement } from "../../actions/usage";
import { isProUser } from "../../utils/status";
import { CrownIcon } from "lucide-react";

// Define common styles for reusability and clarity
const commonStyles = {
  container: {
    width: "100%",
    fontSize: "12px",
  },
  section: {
    marginBottom: "16px",
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
  textLight: {
    color: "#a1a1aa",
  },
  textWhite: {
    color: "#fff",
  },
  textBlue: {
    color: "#4169e1",
  },
  fontSizeXs: {
    fontSize: "10px",
  },
  fontSizeSm: {
    fontSize: "11px",
  },
  fontSizeMd: {
    fontSize: "12px",
  },
  fontSizeLg: {
    fontSize: "14px",
  },
  fontWeightNormal: {
    fontWeight: "normal" as const,
  },
  fontWeightMedium: {
    fontWeight: "500" as const,
  },
  fontWeightSemiBold: {
    fontWeight: "600" as const,
  },
  buttonBase: {
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "background 0.2s",
  },
};

const styles = {
  ...commonStyles,
  notAuthenticated: {
    ...commonStyles.textLight,
    textAlign: "center" as const,
    padding: "8px",
    ...commonStyles.fontSizeXs,
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
    ...commonStyles.fontSizeLg,
    ...commonStyles.fontWeightSemiBold,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    ...commonStyles.textWhite,
    ...commonStyles.fontSizeLg,
    ...commonStyles.fontWeightSemiBold,
    margin: "0 0 2px 0",
  },
  email: {
    ...commonStyles.textLight,
    ...commonStyles.fontSizeXs,
    margin: "0",
  },
  planInfo: {
    marginBottom: "4px",
  },
  planHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  planLabel: {
    ...commonStyles.textLight,
    ...commonStyles.fontSizeXs,
    ...commonStyles.fontWeightMedium,
  },
  planValue: {
    ...commonStyles.textWhite,
    ...commonStyles.fontSizeMd,
    ...commonStyles.fontWeightSemiBold,
  },
  crownIcon: {
    // Already defined as an element, consider styling its container if needed
    display: "inline-flex", // To align with text better
    verticalAlign: "middle", // To align with text better
    marginRight: "4px", // Small spacing from text
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
  upgradeInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  upgradeTitle: {
    ...commonStyles.textWhite,
    ...commonStyles.fontSizeLg,
    ...commonStyles.fontWeightSemiBold,
  },
  upgradeButton: {
    ...commonStyles.buttonBase,
    background: "#6b46c1",
    color: "#fff",
    padding: "8px 16px",
    ...commonStyles.fontSizeMd,
    ...commonStyles.fontWeightSemiBold,
    "&:hover": {
      background: "#5a3a9a", // Slightly darker on hover
    },
  },
  creditsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  creditsLabel: {
    ...commonStyles.textWhite,
    ...commonStyles.fontSizeMd,
    ...commonStyles.fontWeightMedium,
  },
  manageBtn: {
    background: "none",
    border: "none",
    ...commonStyles.textBlue,
    ...commonStyles.fontSizeMd,
    cursor: "pointer",
    textDecoration: "underline",
  },
  creditsInfo: {
    ...commonStyles.textLight,
    ...commonStyles.fontSizeMd,
  },
  creditsUsed: {
    ...commonStyles.fontSizeSm,
  },
  loadingText: {
    ...commonStyles.textLight,
    ...commonStyles.fontSizeSm,
    fontStyle: "italic",
  },
  errorText: {
    color: "#ef4444", // Tailwind red-500
    ...commonStyles.fontSizeSm,
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
    backgroundColor: "#4169e1", // Match FloatingButton blue color
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
};

const ProfileSettings: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { usage, loading: usageLoading, error: usageError } = useUsage();

  // Get plan info using the status utility function
  const hasProAccess = user ? isProUser(user) : false;

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
                {hasProAccess ? (
                  <>
                    <span style={styles.crownIcon}>
                      <CrownIcon size={16} />
                    </span>
                    Pro Plan
                  </>
                ) : (
                  "Free Plan"
                )}
              </span>
            </div>
            {!hasProAccess && (
              <div style={styles.upgradePrompt}>
                <div style={styles.upgradeInfo}>
                  <span style={styles.crownIcon}>
                    <CrownIcon size={16} />
                  </span>
                  <span style={styles.upgradeTitle}>Turn Pro</span>
                </div>
                <button
                  style={styles.upgradeButton}
                  onClick={() => {
                    openCreditManagement().catch(console.error);
                  }}
                  aria-label="Upgrade to Pro Plan"
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
                  aria-label="Manage credits"
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
                      aria-valuenow={usage.usedPoints}
                      aria-valuemax={usage.totalPoints}
                      aria-valuemin={0}
                      role="progressbar"
                    />
                  </div>
                </div>
                <div style={styles.creditsUsed}>
                  {usage.usedPoints} of your monthly credits used
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

export default ProfileSettings;
