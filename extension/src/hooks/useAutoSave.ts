import { useCallback } from "react";
import { autoSaveManager } from "../utils/autoSave";
import { logger } from "../utils/logger";

interface UseAutoSaveReturn {
  triggerAutoSave: (scrapedCode: string, context?: string) => Promise<boolean>;
  storePendingCode: (code: string) => Promise<void>;
  isAutoSaveEnabled: () => boolean;
}

export const useAutoSave = (): UseAutoSaveReturn => {
  const triggerAutoSave = useCallback(
    async (scrapedCode: string, context?: string): Promise<boolean> => {
      try {
        logger.info("Triggering auto-save from hook...");
        return await autoSaveManager.triggerAutoSave({
          scrapedCode,
          context,
        });
      } catch (error) {
        logger.error("Error triggering auto-save from hook:", error);
        return false;
      }
    },
    []
  );

  const storePendingCode = useCallback(async (code: string): Promise<void> => {
    try {
      await autoSaveManager.storePendingCode(code);
    } catch (error) {
      logger.error("Error storing pending code from hook:", error);
    }
  }, []);

  const isAutoSaveEnabled = useCallback((): boolean => {
    try {
      return autoSaveManager.isAutoSaveEnabled();
    } catch (error) {
      logger.error("Error checking auto-save state from hook:", error);
      return false;
    }
  }, []);

  return {
    triggerAutoSave,
    storePendingCode,
    isAutoSaveEnabled,
  };
};
