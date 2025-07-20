"use client";
import React from "react";
import { useState } from "react";
import {
  X,
  Settings,
  Bell,
  Palette,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import ProfileSettings from "./_components/ProfileSettings";
import AppearanceSettings from "./_components/AppearanceSettings";

// Modal positioning constants
const MODAL_WIDTH = 360; // Must match the CSS width in styles.modal
const MODAL_MAX_HEIGHT = 600;
const MODAL_MIN_MARGIN = 20;
const MODAL_VERTICAL_OFFSET = 200;
const MODAL_HEIGHT_BUFFER = 40;
const BUTTON_OFFSET = 20;

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  buttonPosition?: { x: number; y: number };
}

const TABS = [
  { label: "Profile", icon: User },
  { label: "Notifications", icon: Bell },
  { label: "Appearance", icon: Palette },
  { label: "Account", icon: Settings },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  buttonPosition,
}) => {
  const [activeTab, setActiveTab] = useState<number>(-1); // Start with no tab open

  if (!open) return null;

  // Calculate position relative to the button with overflow protection
  const getModalPosition = () => {
    if (!buttonPosition) {
      return {
        right: `${MODAL_MIN_MARGIN}px`,
        bottom: `${MODAL_MIN_MARGIN}px`,
      };
    }

    // Check if window is defined for SSR support
    if (typeof window === "undefined") {
      return {
        right: `${MODAL_MIN_MARGIN}px`,
        bottom: `${MODAL_MIN_MARGIN}px`,
      };
    }

    // Calculate available space
    const modalHeight = Math.min(
      MODAL_MAX_HEIGHT,
      window.innerHeight - MODAL_HEIGHT_BUFFER
    );
    const availableHeight = window.innerHeight - MODAL_HEIGHT_BUFFER;

    // Position the modal to the left of the button
    let right = window.innerWidth - buttonPosition.x + BUTTON_OFFSET;
    let bottom = window.innerHeight - buttonPosition.y - MODAL_VERTICAL_OFFSET;

    // Ensure modal doesn't go off-screen horizontally
    if (right < MODAL_MIN_MARGIN) right = MODAL_MIN_MARGIN;
    if (right + MODAL_WIDTH > window.innerWidth - MODAL_MIN_MARGIN) {
      right = window.innerWidth - MODAL_WIDTH - MODAL_MIN_MARGIN;
    }

    // Ensure modal doesn't go off-screen vertically
    if (bottom < MODAL_MIN_MARGIN) bottom = MODAL_MIN_MARGIN;
    if (bottom + modalHeight > availableHeight) {
      bottom = availableHeight - modalHeight;
    }

    return {
      right: `${right}px`,
      bottom: `${bottom}px`,
    };
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{
          ...styles.modal,
          ...getModalPosition(),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* Header Section */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            {activeTab >= 0 && activeTab < TABS.length
              ? TABS[activeTab].label
              : "Settings"}
          </h2>
        </div>

        {/* Settings Navigation */}
        <div style={styles.settingsNav}>
          {TABS.map((tab, idx) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === idx;
            return (
              <div key={tab.label} style={styles.accordionItem}>
                <button
                  style={{
                    ...styles.navItem,
                    ...(isActive ? styles.activeNavItem : {}),
                  }}
                  onClick={() => setActiveTab(isActive ? -1 : idx)}
                >
                  <div style={styles.navItemLeft}>
                    <IconComponent size={18} />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    style={{
                      ...styles.navArrow,
                      transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>
                {/* Accordion Content */}
                {isActive && (
                  <div style={styles.accordionContent}>
                    {(() => {
                      const TAB_COMPONENTS = {
                        Profile: ProfileSettings,
                        Appearance: AppearanceSettings,
                        Notifications: () => (
                          <div style={styles.placeholder}>
                            Notifications settings placeholder
                          </div>
                        ),
                        Account: () => (
                          <div style={styles.placeholder}>
                            Account settings placeholder
                          </div>
                        ),
                      };

                      const Component =
                        TAB_COMPONENTS[
                          tab.label as keyof typeof TAB_COMPONENTS
                        ];
                      return Component ? <Component /> : null;
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.actionItem}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.3)",
    zIndex: 2147483646,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: "20px",
  },
  modal: {
    background: "#000000",
    borderRadius: "12px",
    width: `${MODAL_WIDTH}px`,
    maxHeight: `calc(100vh - ${MODAL_HEIGHT_BUFFER}px)`,
    overflowY: "auto" as const,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column" as const,
    position: "relative" as const,
    border: "1px solid rgba(255, 255, 255, 0.15)",
    scrollbarWidth: "thin" as const,
    scrollbarColor: "#23272f transparent" as const,
  },
  closeBtn: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "6px",
    zIndex: 2,
    transition: "background 0.2s",
  },
  header: {
    padding: "16px 16px 12px 16px",
    borderBottom: "1px solid #23272f",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerTitle: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    margin: 0,
    marginBottom: "8px",
  },
  settingsNav: {
    padding: "4px 0",
  },
  accordionItem: {
    borderBottom: "1px solid #23272f",
  },
  accordionContent: {
    padding: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    maxHeight: "300px",
    overflowY: "auto" as const,
    scrollbarWidth: "thin" as const,
    scrollbarColor: "#23272f transparent" as const,
  },
  navItem: {
    width: "100%",
    background: "none",
    border: "none",
    color: "#bdbdbd",
    padding: "12px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "background 0.2s, color 0.2s",
    fontSize: "14px",
  },
  activeNavItem: {
    background: "rgba(65, 105, 225, 0.1)",
    color: "#4169e1",
  },
  navItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  navArrow: {
    opacity: 0.5,
  },
  placeholder: {
    color: "#bdbdbd",
    fontSize: "12px",
    textAlign: "center" as const,
    padding: "20px 12px",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    borderTop: "1px solid #23272f",
    padding: "12px 16px",
    gap: "8px",
  },
  actionItem: {
    width: "100%",
    background: "none",
    border: "none",
    color: "#bdbdbd",
    padding: "12px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    transition: "background 0.2s, color 0.2s",
  },
};

export default SettingsModal;
