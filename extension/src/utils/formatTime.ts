/**
 * Formats milliseconds into a human-readable duration string
 * @param msBeforeNext - milliseconds until next reset
 * @returns formatted string like "2 days, 5 hours" or "3 hours, 30 minutes"
 */
export const formatTimeUntilReset = (msBeforeNext: number): string => {
  if (msBeforeNext <= 0) {
    return "Resets now";
  }

  const seconds = Math.floor(msBeforeNext / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""}, ${hours % 24} hour${hours % 24 !== 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}, ${minutes % 60} minute${minutes % 60 !== 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }
};
