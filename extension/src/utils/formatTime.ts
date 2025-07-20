/**
 * Formats the time remaining until reset in a human-readable format
 * @param msBeforeNext - Milliseconds before next reset
 * @returns Formatted time string
 */
export const formatResetTime = (msBeforeNext: number): string => {
  if (!msBeforeNext || msBeforeNext <= 0) {
    return "unknown";
  }

  try {
    const now = new Date();
    const resetDate = new Date(now.getTime() + msBeforeNext);
    const diffInMs = resetDate.getTime() - now.getTime();

    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return "soon";
    }
  } catch (error) {
    console.error("Error formatting reset time:", error);
    return "unknown";
  }
};
