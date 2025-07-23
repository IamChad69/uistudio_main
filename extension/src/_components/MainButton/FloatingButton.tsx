import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Tooltip } from "../Ui/Tooltip";
import LogoIcon from "../../assets/icons/logo-icon.svg";
import { AuthModal } from "../Modals/AuthModal";
import { useAuth } from "../../hooks/useAuth";
import SettingsModal from "../Modals/SettingsModal";
import AiChat from "../AiChat/AiChat";
import { isProUser } from "../../utils/status";
import {
  getCurrentPageInfo,
  checkBookmarkStatus,
  toggleBookmark,
  closeExtension,
  handleInspectionToggle,
  handleExtractionToggle,
  applyButtonHoverEffect,
  browserAPI as floatingButtonBrowserAPI,
} from "../../actions/FloatingButtonAction";


interface FloatingButtonProps {
  onStartScraping: () => void;
  onStartContextScraping: () => void;
  onStopScraping: () => void;
  isScrapingActive: boolean;
  onToggleSettings?: () => void;
  onStartInspection?: () => void;
  onStopInspection?: () => void;
  isInspectionActive?: boolean;
  onStartAssetExtraction?: () => void;
  onStartColorPicker?: () => void;
  onClose?: () => void;
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
  onStopInspection,
  isInspectionActive,
  onStartAssetExtraction,
  onStartColorPicker,
  onClose,
}: FloatingButtonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPageBookmarked, setIsPageBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [chatButtonPosition, setChatButtonPosition] = useState({ x: 0, y: 0 });
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

  // Use the useAuth hook for authentication state
  const { isAuthenticated, user } = useAuth();

  // Get pro status using the utility function
  const isPro = user ? isProUser(user) : false;

  // Get current page information and check bookmark status
  useEffect(() => {
    const fetchPageInfo = async () => {
      const pageInfo = await getCurrentPageInfo();
      if (pageInfo) {
        setCurrentUrl(pageInfo.url);
        setCurrentTitle(pageInfo.title);

        // Check if the page is already bookmarked
        const isBookmarked = await checkBookmarkStatus(pageInfo.url, user);
        setIsPageBookmarked(isBookmarked);
      }
    };

    fetchPageInfo();

    // Listen for tab updates to refresh bookmark status
    const handleTabUpdate = async (
      tabId: number,
      changeInfo?: any,
      tab?: any
    ) => {
      if (changeInfo?.url && tab?.active) {
        setCurrentUrl(changeInfo.url);
        setCurrentTitle(tab.title || "Untitled Page");

        // Check bookmark status for the new URL
        const isBookmarked = await checkBookmarkStatus(changeInfo.url, user);
        setIsPageBookmarked(isBookmarked);
      }
    };

    // Add tab update listener
    floatingButtonBrowserAPI.tabs.onUpdated.addListener(handleTabUpdate);

    // Cleanup listener on unmount
    return () => {
      floatingButtonBrowserAPI.tabs.onUpdated.removeListener(handleTabUpdate);
    };
  }, [user]); // Add user as dependency to re-check bookmark status when user changes

  // Function to apply hover effect to an icon button
  const handleButtonHover = (element: HTMLElement, isHovering: boolean) => {
    applyButtonHoverEffect(element, isHovering);
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

      setChatButtonPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      console.log("Button position:", rect);
    }
  };

  // Update chat position when the button is dragged or when chat opens
  useEffect(() => {
    if (isAiChatOpen) {
      updateChatPosition();
    }
  }, [isDragging, isAiChatOpen]);

  // Update position when chat opens
  useEffect(() => {
    if (isAiChatOpen) {
      // Small delay to ensure refs are available
      setTimeout(() => {
        updateChatPosition();
      }, 0);
    }
  }, [isAiChatOpen]);

  // Handle the end of dragging - update chat position
  const handleDragEnd = () => {
    setIsDragging(false);
    if (isAiChatOpen) {
      updateChatPosition();
    }
  };

  // Update handleToggleExtraction to track extractions
  const handleToggleExtraction = async (event: React.MouseEvent) => {
    handleExtractionToggle(isScrapingActive, onStartScraping, onStopScraping);
  };

  // Handle inspect button click
  const handleInspect = (event: React.MouseEvent) => {
    handleInspectionToggle(
      isInspectionActive || false,
      onStartInspection,
      onStopInspection
    );
  };

  // Handle close button click
  const handleClose = () => {
    closeExtension(
      Boolean(isScrapingActive),
      onStopScraping,
      onClose || (() => {})
    );
  };

  // Handle AiChat close
  const handleAiChatClose = () => {
    setIsAiChatOpen(false);
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    setIsBookmarkLoading(true);
    try {
      const result = await toggleBookmark(
        currentUrl,
        currentTitle,
        isPageBookmarked,
        isAuthenticated,
        user
      );

      if (result.success) {
        setIsPageBookmarked(result.isBookmarked);
      } else if (result.error) {
        // Show error message to user (you can implement a toast notification here)
        console.warn("Bookmark error:", result.error);
        // Optionally show a notification to upgrade to Pro
        alert(
          "Bookmark feature requires Pro subscription. Please upgrade to use this feature."
        );
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsBookmarkLoading(false);
    }
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
                      onClick={onStartAssetExtraction}
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
                  text={
                    !isAuthenticated || !isPro
                      ? "Pro feature - Upgrade required"
                      : isBookmarkLoading
                        ? "Loading..."
                        : isPageBookmarked
                          ? "Remove bookmark"
                          : "Bookmark page"
                  }
                  position="left"
                  showHoverEffect={false}
                >
                  <div style={spacedItemStyle}>
                    <button
                      style={{
                        ...styles.iconButton,
                        opacity:
                          isBookmarkLoading || !isAuthenticated || !isPro
                            ? 0.6
                            : 1,
                        cursor:
                          isBookmarkLoading || !isAuthenticated || !isPro
                            ? "not-allowed"
                            : "pointer",
                      }}
                      aria-label={
                        !isAuthenticated || !isPro
                          ? "Pro feature - Upgrade required"
                          : isBookmarkLoading
                            ? "Loading..."
                            : isPageBookmarked
                              ? "Remove bookmark"
                              : "Bookmark page"
                      }
                      onClick={
                        !isAuthenticated || !isPro
                          ? undefined
                          : handleBookmarkToggle
                      }
                      disabled={isBookmarkLoading || !isAuthenticated || !isPro}
                      onMouseOver={(e) =>
                        !isBookmarkLoading &&
                        isAuthenticated &&
                        isPro &&
                        handleButtonHover(e.currentTarget, true)
                      }
                      onMouseOut={(e) =>
                        !isBookmarkLoading &&
                        isAuthenticated &&
                        isPro &&
                        handleButtonHover(e.currentTarget, false)
                      }
                      onFocus={(e) =>
                        !isBookmarkLoading &&
                        isAuthenticated &&
                        isPro &&
                        handleButtonHover(e.currentTarget, true)
                      }
                      onBlur={(e) =>
                        !isBookmarkLoading &&
                        isAuthenticated &&
                        isPro &&
                        handleButtonHover(e.currentTarget, false)
                      }
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
                onClick={() => setIsAiChatOpen(!isAiChatOpen)}
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
                onClick={handleToggleExtraction}
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
                  text={
                    isAuthenticated
                      ? isPro
                        ? "Pro User"
                        : "Premium User"
                      : "Sign In"
                  }
                  position="left"
                  showHoverEffect={false}
                >
                  <div style={spacedItemStyle}>
                    <button
                      style={styles.iconButton}
                      aria-label={
                        isAuthenticated
                          ? isPro
                            ? "Pro User"
                            : "Premium User"
                          : "Sign In"
                      }
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
                    onClick={handleClose}
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
      />
      <SettingsModal
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        buttonPosition={buttonPosition}
      />
      {isAiChatOpen && (
        <AiChat
          onClose={handleAiChatClose}
          position={chatButtonPosition}
          open={isAiChatOpen}
          onCodeContextScraping={handleCodeContextScraping}
        />
      )}
    </div>
  );
}

export default FloatingButton;
