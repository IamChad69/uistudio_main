import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import config from "../config/environment";
import { getAuthToken } from "../actions/auth";

interface UsageData {
  remainingPoints: number;
  msBeforeNext: number;
  totalPoints: number;
  consumedPoints: number;
}

interface UsageResponse {
  status: number;
  usage?: UsageData;
  error?: string;
}

interface CachedUsageData extends UsageData {
  timestamp: number;
  userId: string;
}

const USAGE_CACHE_KEY = "usage_data";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Store usage data in chrome.storage.local
const storeUsageData = async (
  usageData: UsageData,
  userId: string
): Promise<void> => {
  const cachedData: CachedUsageData = {
    ...usageData,
    timestamp: Date.now(),
    userId,
  };
  await chrome.storage.local.set({ [USAGE_CACHE_KEY]: cachedData });
};

// Get cached usage data
const getCachedUsageData = async (): Promise<CachedUsageData | null> => {
  const result = await chrome.storage.local.get(USAGE_CACHE_KEY);
  return result[USAGE_CACHE_KEY] || null;
};

// Check if cached data is still valid
const isCachedDataValid = (
  cachedData: CachedUsageData,
  userId: string
): boolean => {
  const now = Date.now();
  const isExpired = now - cachedData.timestamp > CACHE_DURATION;
  const isSameUser = cachedData.userId === userId;
  return !isExpired && isSameUser;
};

// Clear usage cache
const clearUsageCache = async (): Promise<void> => {
  await chrome.storage.local.remove(USAGE_CACHE_KEY);
};

export const useUsage = () => {
  const { user, isAuthenticated } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async (forceRefresh = false) => {
    if (!isAuthenticated || !user) {
      setUsage(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check for cached data first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedData = await getCachedUsageData();
        if (cachedData && isCachedDataValid(cachedData, user.id)) {
          console.log("🔍 Using cached usage data");
          setUsage({
            remainingPoints: cachedData.remainingPoints,
            msBeforeNext: cachedData.msBeforeNext,
            totalPoints: cachedData.totalPoints,
            consumedPoints: cachedData.consumedPoints,
          });
          setLoading(false);
          return;
        }
      }

      // Get the stored auth token
      const token = await getAuthToken();
      if (!token) {
        setError("No authentication token found");
        setUsage(null);
        return;
      }

      console.log("🔍 Fetching fresh usage data from server");
      const response = await fetch(
        `${config.APP_URL}/api/auth/extension/usage`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data: UsageResponse = await response.json();

      if (data.status === 200 && data.usage) {
        // Store the fresh data in cache
        await storeUsageData(data.usage, user.id);
        setUsage(data.usage);
      } else {
        setError(data.error || "Failed to fetch usage data");
        setUsage(null);
      }
    } catch (err) {
      console.error("Error fetching usage:", err);
      setError("Failed to fetch usage data");
      setUsage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [isAuthenticated, user]);

  const refreshUsage = () => {
    fetchUsage(true); // Force refresh
  };

  const clearCache = async () => {
    await clearUsageCache();
    setUsage(null);
  };

  return {
    usage,
    loading,
    error,
    refreshUsage,
    clearCache,
  };
};
