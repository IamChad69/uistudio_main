import React from "react";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import { useUsage } from "../hooks/useUsage";
import { useAuth } from "../hooks/useAuth";

interface UsageProps {
  className?: string;
}

export const Usage: React.FC<UsageProps> = ({ className = "" }) => {
  const { usage, loading, error } = useUsage();
  const { user } = useAuth();

  const resetTime = React.useMemo(() => {
    if (!usage?.msBeforeNext) return "unknown";

    try {
      return formatDuration(
        intervalToDuration({
          start: new Date(),
          end: new Date(Date.now() + usage.msBeforeNext),
        }),
        { format: ["months", "days", "hours"] }
      );
    } catch (error) {
      return "unknown";
    }
  }, [usage?.msBeforeNext]);

  const isProUser = user?.plan === "pro";

  if (loading) {
    return (
      <div className={`usage-container ${className}`} style={styles.container}>
        <div style={styles.loading}>Loading usage...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`usage-container ${className}`} style={styles.container}>
        <div style={styles.error}>Error loading usage: {error}</div>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className={`usage-container ${className}`} style={styles.container}>
        <div style={styles.noData}>No usage data available</div>
      </div>
    );
  }

  return (
    <div className={`usage-container ${className}`} style={styles.container}>
      <div style={styles.header}>
        <span style={styles.planLabel}>Plan</span>
        <span style={styles.usageText}>
          {usage.consumedPoints}/{usage.totalPoints}
        </span>
        <span style={styles.resetTime}>{resetTime}</span>
      </div>

      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${(usage.consumedPoints / usage.totalPoints) * 100}%`,
            }}
          />
        </div>
      </div>

      <div style={styles.footer}>
        <span style={styles.creditsText}>
          {usage.consumedPoints} of your daily credits used
        </span>
        <div style={styles.infoIcon}>i</div>
      </div>

      {!isProUser && (
        <div style={styles.upgradeContainer}>
          <button style={styles.upgradeButton}>
            <CrownIcon size={14} />
            <span>Upgrade</span>
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    padding: "12px",
    color: "#ffffff",
    fontSize: "12px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  planLabel: {
    fontWeight: "500",
    color: "#ffffff",
  },
  usageText: {
    fontWeight: "600",
    color: "#ffffff",
  },
  resetTime: {
    color: "#a0a0a0",
    fontSize: "11px",
  },
  progressContainer: {
    marginBottom: "8px",
  },
  progressBar: {
    width: "100%",
    height: "4px",
    backgroundColor: "#333333",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4169e1",
    transition: "width 0.3s ease",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditsText: {
    color: "#a0a0a0",
    fontSize: "11px",
  },
  infoIcon: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "#333333",
    color: "#a0a0a0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "bold",
  },
  upgradeContainer: {
    marginTop: "8px",
    display: "flex",
    justifyContent: "flex-end",
  },
  upgradeButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#4169e1",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "11px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  loading: {
    color: "#a0a0a0",
    textAlign: "center" as const,
  },
  error: {
    color: "#ff6b6b",
    textAlign: "center" as const,
  },
  noData: {
    color: "#a0a0a0",
    textAlign: "center" as const,
  },
};
