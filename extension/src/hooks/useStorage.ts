import { useState, useEffect } from "react";

type StorageType = "local" | "sync";

/**
 * Custom hook for managing browser extension storage
 * @param key The storage key
 * @param initialValue Default value if the key doesn't exist in storage
 * @param storageType The type of storage to use (local or sync)
 * @returns [storedValue, setValue] tuple similar to useState
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
  storageType: StorageType = "local"
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Check if we're in a browser context and if the chrome API is available
  const isBrowser = typeof window !== "undefined";
  const hasStorageApi =
    isBrowser && typeof chrome !== "undefined" && chrome.storage;

  useEffect(() => {
    if (!hasStorageApi) return;

    // Get from storage by key
    const storage =
      storageType === "local" ? chrome.storage.local : chrome.storage.sync;

    // Function to get stored value
    const loadValue = async () => {
      try {
        const result = await storage.get([key]);
        // If the key exists in storage, update state
        if (result[key] !== undefined) {
          setStoredValue(result[key]);
        }
      } catch (error) {
        console.error(`Error loading value for key "${key}":`, error);
      }
    };

    // Load the initial value
    loadValue();

    // Set up a listener for storage changes
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === storageType && changes[key]) {
        setStoredValue(changes[key].newValue);
      }
    };

    // Add listener
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Clean up listener on unmount
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [key, storageType, hasStorageApi]);

  // Function to save to storage and update state
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function to match useState API
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to storage if browser APIs are available
      if (hasStorageApi) {
        const storage =
          storageType === "local" ? chrome.storage.local : chrome.storage.sync;
        storage.set({ [key]: valueToStore });
      }
    } catch (error) {
      console.error(`Error saving value for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useStorage;
