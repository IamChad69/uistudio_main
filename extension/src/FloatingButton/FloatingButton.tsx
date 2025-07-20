import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import browser from "webextension-polyfill";
import {
  Pause,
  Settings,
  X,
  Pipette,
  BookmarkPlus,
  BookMarked,
  ImagePlus,
  Type,
  User as UserIcon,
  Wand2,
  Crown,
} from "lucide-react";
import { Tooltip } from "../_components/Tooltip";
import LogoIcon from "../assets/icons/logo-icon.svg";
import { AuthModal } from "../_components/AuthModal";
import { useAuth } from "../hooks/useAuth";
import SettingsModal from "../_components/Settings/SettingsModal";

// Custom upgrade tooltip component that shows as a chat bubble with upgrade button
interface UpgradeTooltipProps {
  onUpgrade: () => void;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UpgradeTooltip: React.FC<UpgradeTooltipProps> = ({
  onUpgrade,
  position = "left",
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [show, setShow] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Position calculations
  const getPosition = () => {
    switch (position) {
      case "top":
        return {
          bottom: "100%",
          left: "50%",
          transform: "translateX(-70%) translateY(-32px)",
        };
      case "bottom":
        return {
          top: "100%",
          left: "50%",
          transform: "translateX(-70%) translateY(24px)",
        };
      case "right":
        return {
          left: "100%",
          top: "50%",
          transform: "translateY(-50%) translateX(24px)",
        };
      case "left":
      default:
        return {
          right: "100%",
          top: "50%",
          transform: "translateY(-50%) translateX(-24px)",
        };
    }
  };

  // Get arrow position
  const getArrowPosition = () => {
    switch (position) {
      case "top":
        return {
          bottom: "-5px",
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        };
      case "bottom":
        return {
          top: "-5px",
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        };
      case "right":
        return {
          left: "-5px",
          top: "50%",
          transform: "translateY(-50%) rotate(45deg)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        };
      case "left":
      default:
        return {
          right: "-5px",
          top: "50%",
          transform: "translateY(-50%) rotate(45deg)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        };
    }
  };

  // Handle hover effects
  const handleMouseEnter = () => {
    setIsVisible(true);
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  };

  const handleMouseLeave = () => {
    setShow(false);
    setTimeout(() => setIsVisible(false), 200);
  };

  const tooltipStyles = {
    container: {
      position: "relative" as const,
      display: "inline-block",
    },
    tooltip: {
      position: "absolute" as const,
      zIndex: 2147483647,
      backgroundColor: "#000000",
      color: "#adb5bd",
      padding: "8px 10px",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: 400,
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
      maxWidth: "220px",
      width: "max-content",
      textAlign: "left" as const,
      border: "1px solid rgba(255, 255, 255, 0.1)",
      opacity: show ? 1 : 0,
      visibility: isVisible ? ("visible" as const) : ("hidden" as const),
      transition: "opacity 0.2s ease, transform 0.2s ease",
      ...getPosition(),
    },
    arrow: {
      position: "absolute" as const,
      width: "8px",
      height: "8px",
      backgroundColor: "#000000",
      ...getArrowPosition(),
    },
    message: {
      marginBottom: "8px",
      lineHeight: "1.3",
      whiteSpace: "nowrap" as const,
    },
    button: {
      backgroundColor: "transparent",
      color: "#6366F1",
      border: "1px solid #6366F1",
      borderRadius: "4px",
      padding: "4px 8px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
  };

  return (
    <div
      style={tooltipStyles.container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div ref={tooltipRef} style={tooltipStyles.tooltip}>
          <div style={tooltipStyles.arrow} />
          <div style={tooltipStyles.message}>
            Weekly extraction limit reached.
          </div>
          <button
            style={tooltipStyles.button}
            onClick={(e) => {
              e.stopPropagation();
              onUpgrade();
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#3158d2";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#4169e1";
            }}
          >
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
};

type TabQueryInfo = {
  active?: boolean;
  currentWindow?: boolean;
  [key: string]: unknown;
};

type TabChangeCallback = (
  tabId: number,
  changeInfo?: browser.Tabs.OnUpdatedChangeInfoType,
  tab?: browser.Tabs.Tab
) => void;

type TabActivatedCallback = (activeInfo: {
  tabId: number;
  windowId: number;
}) => void;

// Browser API utility for safe API access with better fallbacks
const browserAPI = {
  tabs: {
    query: async (queryInfo: TabQueryInfo) => {
      try {
        // First try using the browser.tabs API
        if (browser?.tabs?.query) {
          return await browser.tabs.query(queryInfo);
        }

        // If running in content script, we can't access tabs API
        // Fallback to using window.location for the current page
        console.log(
          "Browser tabs.query API not available, using window.location fallback"
        );

        // Create a mock tab object using the current page's window.location
        if (window?.location?.href) {
          return [
            {
              url: window.location.href,
              title: document.title || "Untitled Page",
              id: -1,
              active: true,
              index: 0,
              highlighted: true,
              pinned: false,
              windowId: -1,
            },
          ];
        }

        console.warn("Unable to get URL from window.location");
        return [];
      } catch (error) {
        console.error("Error accessing tabs.query API:", error);
        // Return minimal mock data in case of error
        if (window?.location?.href) {
          return [
            {
              url: window.location.href,
              title: document.title || "Untitled Page",
            },
          ];
        }
        return [];
      }
    },
    onUpdated: {
      addListener: (callback: TabChangeCallback) => {
        try {
          if (browser?.tabs?.onUpdated?.addListener) {
            browser.tabs.onUpdated.addListener(callback);
            return true;
          }
          // Quiet warning - this is expected in content scripts
          console.debug(
            "Browser tabs.onUpdated API not available - skipping listener"
          );
          return false;
        } catch (error) {
          console.error("Error adding tabs.onUpdated listener:", error);
          return false;
        }
      },
      removeListener: (callback: TabChangeCallback) => {
        try {
          if (browser?.tabs?.onUpdated?.removeListener) {
            browser.tabs.onUpdated.removeListener(callback);
            return true;
          }
          // No need to log warning during cleanup
          return false;
        } catch (error) {
          console.error("Error removing tabs.onUpdated listener:", error);
          return false;
        }
      },
    },
    onActivated: {
      addListener: (callback: TabActivatedCallback) => {
        try {
          if (browser?.tabs?.onActivated?.addListener) {
            browser.tabs.onActivated.addListener(callback);
            return true;
          }
          // Quiet warning - this is expected in content scripts
          console.debug(
            "Browser tabs.onActivated API not available - skipping listener"
          );
          return false;
        } catch (error) {
          console.error("Error adding tabs.onActivated listener:", error);
          return false;
        }
      },
      removeListener: (callback: TabActivatedCallback) => {
        try {
          if (browser?.tabs?.onActivated?.removeListener) {
            browser.tabs.onActivated.removeListener(callback);
            return true;
          }
          // No need to log warning during cleanup
          return false;
        } catch (error) {
          console.error("Error removing tabs.onActivated listener:", error);
          return false;
        }
      },
    },
  },
  runtime: {
    sendMessage: async (message: unknown) => {
      try {
        if (browser?.runtime?.sendMessage) {
          return await browser.runtime.sendMessage(message);
        }
        console.warn("Browser runtime.sendMessage API not available");
        return null;
      } catch (error) {
        console.error("Error sending runtime message:", error);
        return null;
      }
    },
  },
};

interface FloatingButtonProps {
  onStartScraping: () => void;
  onStartContextScraping: () => void;
  onStopScraping: () => void;
  isScrapingActive: boolean;
  onToggleSettings?: () => void;
  onStartInspection?: () => void;
  onStartAssetExtraction?: () => void;
  onStartColorPicker?: () => void;
  onClose?: () => void;
}

// Extended User interface that includes subscription
interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  profileImage: string;
  subscription?: {
    plan: {
      name: string;
      extractionLimit: number;
    };
  };
}

// Define all styles as constants to keep the JSX clean
const styles = {
  container: {
    position: "fixed" as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    pointerEvents: "none" as const,
    overflow: "hidden",
  },
  motionDiv: {
    position: "absolute" as const,
    pointerEvents: "auto" as const,
    zIndex: 2147483647,
  },
  columnContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
  },
  contentsWrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  menuPanel: {
    backgroundColor: "#000000",
    borderRadius: "9999px",
    padding: "0.75rem 0",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: "48px",
    boxShadow: "0 0 8px 1px rgba(0, 0, 0, 0.2)",
    margin: "0.3rem 0",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  mainButton: {
    backgroundColor: "#000000",
    color: "white",
    borderRadius: "9999px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "space-between",
    width: "48px",
    height: "90px",
    boxShadow:
      "0 0 15px 2px rgba(64, 93, 174, 0.6), 0 0 5px 0px rgba(64, 93, 174, 0.8)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    margin: "0.3rem 0",
    padding: "12px 0",
    gap: 0,
    border: "1px solid rgba(255, 255, 255, 0.15)",
  },
  mainButtonIconWrapper: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "24px",
    marginTop: "6px",
    marginBottom: "2px",
    position: "relative" as const,
  },
  mainButtonIcon: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    fontSize: "18px",
    padding: 0,
    margin: 0,
    outline: "none",
    borderRadius: "50%",
    transition: "color 0.2s, background 0.2s",
  },
  mainButtonLabel: {
    color: "#bdbdbd",
    fontSize: "16px",
    marginLeft: "2px",
    fontWeight: 400,
    letterSpacing: "0.02em",
    userSelect: "none" as const,
  },
  mainButtonOff: {
    color: "#bdbdbd",
    fontSize: "15px",
    fontWeight: 400,
    marginTop: "2px",
    marginBottom: "4px",
    userSelect: "none" as const,
  },
  iconButton: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    margin: "0 auto",
    transition: "all 0.2s",
    borderRadius: "50%",
  },
  divider: {
    width: "60%",
    height: "1px",
    backgroundColor: "#23272f",
    margin: "0.1rem auto",
  },
  mainButtonGripRow: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    height: "14px",
    margin: "4px 0",
  },
  mainButtonGripCol: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
  },
  mainButtonDot: {
    width: "3px",
    height: "3px",
    borderRadius: "100%",
    background: "#6b7280",
    opacity: 1,
  },
  logoWrapper: {
    position: "absolute" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
  },
  logoImage: {
    width: "20px",
    height: "20px",
    rotate: "45deg",
    color: "#4169e1",
    filter: "brightness(0) invert(1)",
    objectFit: "contain" as const,
  },
};

// Minimal spacing between items
const spacedItemStyle = {
  marginBottom: "0.2rem",
  marginTop: "0.2rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  padding: "0.1rem 0",
};

function FloatingButton({
  onStartScraping,
  onStartContextScraping,
  onStopScraping,
  isScrapingActive,
  onStartInspection,
  onStartAssetExtraction,
  onStartColorPicker,
  onClose,
}: FloatingButtonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPageBookmarked, setIsPageBookmarked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [authStateChanged, setAuthStateChanged] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<
    | {
        x: number;
        y: number;
      }
    | undefined
  >(undefined);
  const constraintsRef = useRef(null);
  const starButtonRef = useRef<HTMLButtonElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, user, loading, checkAuth } = useAuth();

  // Handle auth state changes
  useEffect(() => {
    if (authStateChanged) {
      // Refresh auth state
      checkAuth();
      setAuthStateChanged(false);
    }
  }, [authStateChanged, checkAuth]);

  // Function to apply hover effect to an icon button
  const handleButtonHover = (element: HTMLElement, isHovering: boolean) => {
    element.style.color = isHovering ? "rgba(255, 255, 255, 0.9)" : "white";
    element.style.backgroundColor = isHovering
      ? "rgba(255, 255, 255, 0.12)"
      : "transparent";
  };

  const handleToggleSettings = () => {
    if (buttonContainerRef.current) {
      const rect = buttonContainerRef.current.getBoundingClientRect();
      setButtonPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    setIsSettingsModalOpen((open) => !open);
  };

  // Handle auth button click
  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  // Function to update the chat position based on button position
  const updateChatPosition = () => {
    if (starButtonRef.current && buttonContainerRef.current) {
      const rect = starButtonRef.current.getBoundingClientRect();
      const mainButtonRect = buttonContainerRef.current
        .querySelector('[role="group"]')
        ?.getBoundingClientRect();

      console.log("Button position:", rect);
    }
  };

  // Update chat position when the button is dragged
  useEffect(() => {
    if (isAiChatOpen) {
      updateChatPosition();
    }
  }, [isDragging, isAiChatOpen]);

  // Handle the end of dragging - update chat position
  const handleDragEnd = () => {
    setIsDragging(false);
    if (isAiChatOpen) {
      updateChatPosition();
    }
  };

  // Handle extraction toggle
  const handleToggleExtraction = async (event: React.MouseEvent) => {
    if (isScrapingActive) {
      onStopScraping();
      return;
    }

    // Start scraping (limit checks are now handled by the UI conditionals)
    onStartScraping();
  };

  // Handle inspect button click
  const handleInspect = (event: React.MouseEvent) => {
    console.log("FloatingButton: Inspect button clicked");

    if (onStartInspection) {
      console.log("FloatingButton: Starting UI inspection");
      onStartInspection();
    } else {
      console.warn("FloatingButton: Inspection function not provided");
    }
  };

  // Handle close button click
  const handleClose = () => {
    console.log("FloatingButton: Close button clicked");

    // Stop scraping if it's active when closing
    if (isScrapingActive) {
      onStopScraping();
    }

    try {
      // Send message to background script to handle extension closing
      // Use our wrapped browserAPI for better error handling
      browserAPI.runtime.sendMessage({ action: "closeExtension" });

      // Call the onClose prop if provided
      if (onClose) {
        onClose();
      } else {
        console.warn("FloatingButton: Close handler not provided");

        // Fallback to hiding the component if onClose not provided
        // This uses direct DOM manipulation as a last resort
        const extensionRoot = document.getElementById("uiScraper-root");
        if (extensionRoot) {
          extensionRoot.style.display = "none";
        }
      }
    } catch (error) {
      console.error("Error closing extension:", error);
      // showNotification("Failed to close extension", "error");
    }
  };

  // Handle AiChat close
  const handleAiChatClose = () => {
    setIsAiChatOpen(false);
  };

  // Handle code context scraping
  const handleCodeContextScraping = () => {
    console.log("FloatingButton: Starting code context scraping from AiChat");
    // Use the context scraping method instead of regular scraping
    onStartContextScraping();
  };

  return (
    <div style={styles.container} ref={constraintsRef}>
      <motion.div
        style={styles.motionDiv}
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onDrag={updateChatPosition}
        initial={{ right: 20, bottom: 20 }}
        animate={{ scale: isDragging ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
        onHoverStart={() => !isDragging && setIsExpanded(true)}
        onHoverEnd={() => !isDragging && setIsExpanded(false)}
      >
        <div style={styles.columnContainer} ref={buttonContainerRef}>
          {/* Top menu */}
          <div style={styles.contentsWrapper}>
            {isExpanded && (
              <motion.div
                style={styles.menuPanel}
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: 20, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Tooltip text="Assets" position="left" showHoverEffect={false}>
                  <div style={spacedItemStyle}>
                    <button
                      style={styles.iconButton}
                      aria-label="Assets"
                      //onClick={handleAssetExtraction}
                      onMouseOver={(e) =>
                        handleButtonHover(e.currentTarget, true)
                      }
                      onMouseOut={(e) =>
                        handleButtonHover(e.currentTarget, false)
                      }
                      onFocus={(e) => handleButtonHover(e.currentTarget, true)}
                      onBlur={(e) => handleButtonHover(e.currentTarget, false)}
                    >
                      <ImagePlus size={16} />
                    </button>
                  </div>
                </Tooltip>

                <div style={styles.divider}></div>

                <Tooltip
                  text="Font Inspector"
                  position="left"
                  showHoverEffect={false}
                >
                  <div style={spacedItemStyle}>
                    <button
                      style={styles.iconButton}
                      aria-label="Font Inspector"
                      onClick={handleInspect}
                      onMouseOver={(e) =>
                        handleButtonHover(e.currentTarget, true)
                      }
                      onMouseOut={(e) =>
                        handleButtonHover(e.currentTarget, false)
                      }
                      onFocus={(e) => handleButtonHover(e.currentTarget, true)}
                      onBlur={(e) => handleButtonHover(e.currentTarget, false)}
                    >
                      <Type size={16} />
                    </button>
                  </div>
                </Tooltip>
                <div style={styles.divider}></div>

                <Tooltip
                  text="Color Picker"
                  position="left"
                  showHoverEffect={false}
                >
                  <div style={spacedItemStyle}>
                    <button
                      style={styles.iconButton}
                      aria-label="Color Picker"
                      onMouseOver={(e) =>
                        handleButtonHover(e.currentTarget, true)
                      }
                      onMouseOut={(e) =>
                        handleButtonHover(e.currentTarget, false)
                      }
                      //onClick={handleColorPicker}
                      onFocus={(e) => handleButtonHover(e.currentTarget, true)}
                      onBlur={(e) => handleButtonHover(e.currentTarget, false)}
                    >
                      <Pipette size={16} />
                    </button>
                  </div>
                </Tooltip>
                <div style={styles.divider}></div>

                <Tooltip
                  text={isPageBookmarked ? "Remove bookmark" : "Bookmark page"}
                  position="left"
                  showHoverEffect={false}
                >
                  <div style={spacedItemStyle}>
                    <button
                      style={styles.iconButton}
                      aria-label={
                        isPageBookmarked ? "Remove bookmark" : "Bookmark page"
                      }
                      //onClick={handleBookmarkToggle}
                      onMouseOver={(e) =>
                        handleButtonHover(e.currentTarget, true)
                      }
                      onMouseOut={(e) =>
                        handleButtonHover(e.currentTarget, false)
                      }
                      onFocus={(e) => handleButtonHover(e.currentTarget, true)}
                      onBlur={(e) => handleButtonHover(e.currentTarget, false)}
                    >
                      {isPageBookmarked ? (
                        <BookMarked size={18} />
                      ) : (
                        <BookmarkPlus size={18} />
                      )}
                    </button>
                  </div>
                </Tooltip>
              </motion.div>
            )}
          </div>

          {/* Main button: compact pill with two icon buttons */}
          <motion.div
            style={{ ...styles.mainButton }}
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{ scale: 0.98 }}
            role="group"
            aria-label="Main actions"
          >
            <Tooltip
              text="Ui Assistant"
              position="left"
              showHoverEffect={false}
            >
              <button
                ref={starButtonRef}
                style={styles.mainButtonIcon}
                aria-label="Ui Assistant"
                tabIndex={0}
                //onClick={handleToggleAiChat}
                onMouseOver={(e) => handleButtonHover(e.currentTarget, true)}
                onMouseOut={(e) => handleButtonHover(e.currentTarget, false)}
                onFocus={(e) => handleButtonHover(e.currentTarget, true)}
                onBlur={(e) => handleButtonHover(e.currentTarget, false)}
              >
                <Wand2 size={16} color="#4169e1" />
              </button>
            </Tooltip>
            <div style={styles.mainButtonGripRow}>
              {[0, 1, 2].map((col) => (
                <div key={col} style={styles.mainButtonGripCol}>
                  <span style={styles.mainButtonDot}></span>
                  <span style={styles.mainButtonDot}></span>
                </div>
              ))}
            </div>

            <Tooltip
              text={!isScrapingActive ? "Start extraction" : ""}
              position="left"
              showHoverEffect={false}
            >
              <button
                style={{
                  ...styles.mainButtonIcon,
                  backgroundColor: "transparent",
                  borderRadius: "50%",
                  padding: "3px",
                }}
                //onClick={handleToggleExtraction}
                role="button"
                aria-label={
                  isScrapingActive ? "Pause extraction" : "Start extraction"
                }
                tabIndex={0}
                onMouseOver={(e) => handleButtonHover(e.currentTarget, true)}
                onMouseOut={(e) => handleButtonHover(e.currentTarget, false)}
                onFocus={(e) => handleButtonHover(e.currentTarget, true)}
                onBlur={(e) => handleButtonHover(e.currentTarget, false)}
              >
                {isScrapingActive ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Pause size={24} />
                  </div>
                ) : (
                  <div style={styles.logoWrapper}>
                    <img src={LogoIcon} alt="Logo" style={styles.logoImage} />
                  </div>
                )}
              </button>
            </Tooltip>
          </motion.div>
          {/* Bottom menu */}
          <div style={styles.contentsWrapper}>
            {isExpanded && (
              <motion.div
                style={styles.menuPanel}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Tooltip
                  text="Settings"
                  position="left"
                  showHoverEffect={false}
                >
                  <div style={spacedItemStyle}>
                    <button
                      style={styles.iconButton}
                      aria-label="Settings"
                      onMouseOver={(e) =>
                        handleButtonHover(e.currentTarget, true)
                      }
                      onMouseOut={(e) =>
                        handleButtonHover(e.currentTarget, false)
                      }
                      onFocus={(e) => handleButtonHover(e.currentTarget, true)}
                      onBlur={(e) => handleButtonHover(e.currentTarget, false)}
                      onClick={handleToggleSettings}
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </Tooltip>

                <div style={styles.divider}></div>
                <Tooltip
                  text={"Sign In"}
                  position="left"
                  showHoverEffect={false}
                >
                  <div style={spacedItemStyle}>
                    <button
                      style={styles.iconButton}
                      aria-label={isAuthenticated ? "Premium User" : "Sign In"}
                      onClick={handleAuthClick}
                      onMouseOver={(e) =>
                        handleButtonHover(e.currentTarget, true)
                      }
                      onMouseOut={(e) =>
                        handleButtonHover(e.currentTarget, false)
                      }
                      onFocus={(e) => handleButtonHover(e.currentTarget, true)}
                      onBlur={(e) => handleButtonHover(e.currentTarget, false)}
                    >
                      {isAuthenticated ? (
                        <Crown size={18} />
                      ) : (
                        <UserIcon size={18} />
                      )}
                    </button>
                  </div>
                </Tooltip>

                <div style={styles.divider}></div>

                <div style={spacedItemStyle}>
                  <button
                    style={styles.iconButton}
                    aria-label="Close"
                    //onClick={handleClose}
                    onMouseOver={(e) =>
                      handleButtonHover(e.currentTarget, true)
                    }
                    onMouseOut={(e) =>
                      handleButtonHover(e.currentTarget, false)
                    }
                    onFocus={(e) => handleButtonHover(e.currentTarget, true)}
                    onBlur={(e) => handleButtonHover(e.currentTarget, false)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthStateChange={() => setAuthStateChanged(true)}
      />
      <SettingsModal
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        buttonPosition={buttonPosition}
      />
      {/* {isAiChatOpen && (
        Ai chat
      )} */}
    </div>
  );
}

export default FloatingButton;
