import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Crown, LogIn, UserPlus, ExternalLink } from "lucide-react";
import config from "../../config/environment";
import browser from "webextension-polyfill";
import { useAuth } from "../../hooks/useAuth";
import { isProUser } from "../../utils/status";
import { User } from "../../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: User) => void;
  onAuthStateChange?: (isAuthenticated: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onAuthStateChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Send message to background script to create tab
      const response = (await browser.runtime.sendMessage({
        action: "createAuthTab",
        url: `${config.APP_URL}/sign-in?redirect=extension`,
      })) as { success: boolean; error?: string; tabId?: number };

      if (!response.success) {
        throw new Error(response.error || "Failed to open authentication page");
      }

      // Listen for messages from the web app
      const handleMessage = async (message: any, sender: any) => {
        if (message?.type === "AUTH_TOKEN" && message?.token) {
          const success = await auth.handleWebAppAuth(message.token);
          if (success && onAuthSuccess) {
            const user = auth.user;
            if (user) {
              onAuthSuccess(user);
            }
          }

          // Notify parent components about auth state change
          if (onAuthStateChange) {
            onAuthStateChange(true);
          }

          // Close the auth tab via background script
          await browser.runtime.sendMessage({
            action: "closeTab",
            tabId: response.tabId,
          });
          onClose();
          browser.runtime.onMessageExternal.removeListener(handleMessage);
        }
      };

      browser.runtime.onMessageExternal.addListener(handleMessage);
    } catch (error) {
      console.error("Error opening auth page:", error);
      setError("Failed to open authentication page");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Send message to background script to create tab
      const response = (await browser.runtime.sendMessage({
        action: "createAuthTab",
        url: `${config.APP_URL}/sign-up?redirect=extension`,
      })) as { success: boolean; error?: string; tabId?: number };

      if (!response.success) {
        throw new Error(response.error || "Failed to open registration page");
      }

      // Listen for messages from the web app
      const handleMessage = async (message: any, sender: any) => {
        if (message?.type === "AUTH_TOKEN" && message?.token) {
          const success = await auth.handleWebAppAuth(message.token);
          if (success && onAuthSuccess) {
            const user = auth.user;
            if (user) {
              onAuthSuccess(user);
            }
          }

          // Notify parent components about auth state change
          if (onAuthStateChange) {
            onAuthStateChange(true);
          }

          // Close the auth tab via background script
          await browser.runtime.sendMessage({
            action: "closeTab",
            tabId: response.tabId,
          });
          onClose();
          browser.runtime.onMessageExternal.removeListener(handleMessage);
        }
      };

      browser.runtime.onMessageExternal.addListener(handleMessage);
    } catch (error) {
      console.error("Error opening auth page:", error);
      setError("Failed to open registration page");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await auth.logout();

      // Notify parent components about auth state change
      if (onAuthStateChange) {
        onAuthStateChange(false);
      }

      // Send message to background script to refresh extension state
      try {
        await browser.runtime.sendMessage({
          action: "refreshExtensionState",
        });
      } catch (error) {
        console.error("Error refreshing extension state:", error);
      }

      onClose();
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out");
    } finally {
      setIsLoading(false);
    }
  };

  const modalStyles = {
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2147483647,
    },
    modal: {
      backgroundColor: "#1a1a1a",
      borderRadius: "12px",
      padding: "24px",
      maxWidth: "400px",
      width: "90%",
      maxHeight: "80vh",
      overflow: "auto",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    title: {
      fontSize: "18px",
      fontWeight: "600",
      color: "white",
      margin: 0,
    },
    closeButton: {
      background: "transparent",
      border: "none",
      color: "#9ca3af",
      cursor: "pointer",
      padding: "4px",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      color: "#d1d5db",
      fontSize: "14px",
      lineHeight: "1.5",
      marginBottom: "20px",
    },
    buttonGroup: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px",
    },
    button: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "none",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    primaryButton: {
      backgroundColor: "#4169e1",
      color: "white",
    },
    secondaryButton: {
      backgroundColor: "transparent",
      color: "#4169e1",
      border: "1px solid #4169e1",
    },
    dangerButton: {
      backgroundColor: "#dc2626",
      color: "white",
    },
    userInfo: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "20px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    userHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "12px",
    },
    userAvatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "#4169e1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "16px",
      fontWeight: "600",
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: "16px",
      fontWeight: "600",
      color: "white",
      margin: "0 0 4px 0",
    },
    userEmail: {
      fontSize: "14px",
      color: "#9ca3af",
      margin: 0,
    },
    planBadge: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "12px",
      color: "#fbbf24",
      fontWeight: "500",
    },
    error: {
      backgroundColor: "rgba(220, 38, 38, 0.1)",
      border: "1px solid rgba(220, 38, 38, 0.3)",
      borderRadius: "6px",
      padding: "12px",
      marginBottom: "16px",
      color: "#fca5a5",
      fontSize: "14px",
    },
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <motion.div
        style={modalStyles.modal}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>
            {auth.isAuthenticated ? "Account" : "Sign In"}
          </h2>
          <button
            style={modalStyles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {error && <div style={modalStyles.error}>{error}</div>}

        {auth.isAuthenticated && auth.user ? (
          <>
            <div style={modalStyles.userInfo}>
              <div style={modalStyles.userHeader}>
                <div style={modalStyles.userAvatar}>
                  {auth.user.fullName?.charAt(0) ||
                    auth.user.firstName?.charAt(0) ||
                    auth.user.email?.charAt(0) ||
                    "U"}
                </div>
                <div style={modalStyles.userDetails}>
                  <p style={modalStyles.userName}>
                    {auth.user.fullName || "User"}
                  </p>
                  <p style={modalStyles.userEmail}>
                    {auth.user.email || "No email"}
                  </p>
                </div>
                <div style={modalStyles.planBadge}>
                  <Crown size={14} />
                  {auth.user ? (isProUser(auth.user) ? "pro" : "free") : "free"}
                </div>
              </div>
            </div>

            <div style={modalStyles.content}>
              You're signed in to uiScraper. Your data is synced across all your
              devices.
            </div>

            <div style={modalStyles.buttonGroup}>
              <button
                style={{
                  ...modalStyles.button,
                  ...modalStyles.secondaryButton,
                }}
                onClick={async () => {
                  try {
                    await browser.runtime.sendMessage({
                      action: "createAuthTab",
                      url: `${config.APP_URL}`,
                    });
                  } catch (error) {
                    console.error("Error opening web app:", error);
                  }
                }}
                disabled={isLoading}
              >
                <ExternalLink size={16} />
                Open Web App
              </button>
              <button
                style={{
                  ...modalStyles.button,
                  ...modalStyles.dangerButton,
                }}
                onClick={handleSignOut}
                disabled={isLoading}
              >
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={modalStyles.content}>
              Sign in to sync your data across devices and access premium
              features.
            </div>

            <div style={modalStyles.buttonGroup}>
              <button
                style={{
                  ...modalStyles.button,
                  ...modalStyles.primaryButton,
                }}
                onClick={handleSignIn}
                disabled={isLoading}
              >
                <LogIn size={16} />
                {isLoading ? "Opening..." : "Sign In"}
              </button>
              <button
                style={{
                  ...modalStyles.button,
                  ...modalStyles.secondaryButton,
                }}
                onClick={handleSignUp}
                disabled={isLoading}
              >
                <UserPlus size={16} />
                Create Account
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
