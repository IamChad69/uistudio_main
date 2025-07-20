import { useState, useEffect } from "react";
import { getAuthToken } from "../actions/auth";
import config from "../config/environment";
import browser from "webextension-polyfill";

interface UsageData {
  remainingPoints: number;
  usedPoints: number;
  totalPoints: number;
  msBeforeNext: number;
  plan: string;
  resetTime: string;
  planName?: string; // For display purposes
}

interface UsageState {
  usage: UsageData | null;
  loading: boolean;
  error: string | null;
  lastFetched?: number;
}

export const useUsage = () => {
  const [state, setState] = useState<UsageState>({
    usage: null,
    loading: true,
    error: null,
  });

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const getCachedUsage = async (): Promise<
    (UsageData & { timestamp: number }) | null
  > => {
    try {
      const result = await browser.storage.local.get("usageData");
      const cachedData = result.usageData as
        | (UsageData & { timestamp: number })
        | undefined;

      if (cachedData && cachedData.timestamp) {
        const age = Date.now() - cachedData.timestamp;
        if (age < CACHE_DURATION) {
          console.log("🔍 Using cached usage data (age:", age, "ms)");
          return cachedData;
        }
      }
      return null;
    } catch (error) {
      console.error("🔍 Error getting cached usage:", error);
      return null;
    }
  };

  const setCachedUsage = async (usage: UsageData): Promise<void> => {
    try {
      const dataToCache = {
        ...usage,
        timestamp: Date.now(),
      };
      await browser.storage.local.set({ usageData: dataToCache });
      console.log("🔍 Cached usage data");
    } catch (error) {
      console.error("🔍 Error caching usage:", error);
    }
  };

  const clearCachedUsage = async (): Promise<void> => {
    try {
      await browser.storage.local.remove("usageData");
      console.log("🔍 Cleared cached usage data");
    } catch (error) {
      console.error("🔍 Error clearing cached usage:", error);
    }
  };

  const fetchUsage = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Try to get cached data first
      const cachedUsage = await getCachedUsage();
      if (cachedUsage) {
        setState({
          usage: cachedUsage,
          loading: false,
          error: null,
          lastFetched: cachedUsage.timestamp,
        });
        return;
      }

      const token = await getAuthToken();
      if (!token) {
        setState({
          usage: null,
          loading: false,
          error: "No authentication token found",
        });
        return;
      }

      const apiUrl = `${config.API_URL}/extension/usage`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "omit",
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 200 && data.usage) {
        // Cache the usage data
        await setCachedUsage(data.usage);

        setState({
          usage: data.usage,
          loading: false,
          error: null,
          lastFetched: Date.now(),
        });
      } else {
        throw new Error(data.error || "Failed to fetch usage data");
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
      setState({
        usage: null,
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch usage data",
      });
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const refreshUsage = () => {
    fetchUsage();
  };

  const forceRefresh = async () => {
    await clearCachedUsage();
    await fetchUsage();
  };

  return {
    ...state,
    refreshUsage,
    forceRefresh,
    clearCachedUsage,
  };
};
