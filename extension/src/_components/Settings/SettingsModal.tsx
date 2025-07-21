"use client";
import React from "react";
import { useState } from "react";
import { X, Settings, Palette, User, LogOut, ChevronRight } from "lucide-react";
import ProfileSettings from "./_components/ProfileSettings";
import AppearanceSettings from "./_components/AppearanceSettings";
import WorkflowSettings from "./_components/WorkflowSettings";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  buttonPosition?: { x: number; y: number };
}

const TABS = [
  { label: "Profile", icon: User },
  { label: "Appearance", icon: Palette },
  { label: "Workflows", icon: Settings },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  buttonPosition,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0); // Start with Profile tab open

  if (!open) return null;

  // Calculate position relative to the button with overflow protection
  const getModalPosition = () => {
    if (!buttonPosition) {
      return {
        right: "20px",
        bottom: "20px",
      };
    }

    // Calculate available space
    const modalWidth = 380;
    const modalHeight = Math.min(600, window.innerHeight - 40);
    const availableHeight = window.innerHeight - 40;

    // Position the modal to the left of the button
    let right = window.innerWidth - buttonPosition.x + 20;
    let bottom = window.innerHeight - buttonPosition.y - 200;

    // Ensure modal doesn't go off-screen horizontally
    if (right < 20) right = 20;
    if (right + modalWidth > window.innerWidth - 20) {
      right = window.innerWidth - modalWidth - 20;
    }

    // Ensure modal doesn't go off-screen vertically
    if (bottom < 20) bottom = 20;
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
          <X size={16} />
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
                      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </button>
                {/* Accordion Content */}
                {isActive && (
                  <div style={styles.accordionContent}>
                    {idx === 0 && <ProfileSettings />}
                    {idx === 1 && <AppearanceSettings />}
                    {idx === 2 && <WorkflowSettings />}
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
    zIndex: 2147483646,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: "20px",
    pointerEvents: "auto" as const,
    animation: "fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    // Prevent pointer events from passing through the overlay
    WebkitTapHighlightColor: "transparent",
  },
  modal: {
    background: "linear-gradient(145deg, #0a0a0a 0%, #111111 100%)",
    borderRadius: "16px",
    width: "380px",
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto" as const,
    boxShadow: `
      0 20px 25px -5px rgba(0, 0, 0, 0.4),
      0 10px 10px -5px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.05)
    `,
    display: "flex",
    flexDirection: "column" as const,
    position: "relative" as const,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    scrollbarWidth: "thin" as const,
    scrollbarColor: "rgba(255, 255, 255, 0.2) transparent" as const,
    animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  closeBtn: {
    position: "absolute" as const,
    top: 16,
    right: 16,
    background: "rgba(255, 255, 255, 0.08)",
    border: "none",
    color: "rgba(255, 255, 255, 0.7)",
    cursor: "pointer",
    padding: "10px",
    borderRadius: "10px",
    zIndex: 2,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    padding: "24px 24px 16px 24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: 600,
    margin: 0,
    letterSpacing: "-0.01em",
    background:
      "linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  settingsNav: {
    padding: "8px 0",
    flex: 1,
  },
  accordionItem: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  accordionContent: {
    padding: "20px 24px",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    maxHeight: "320px",
    overflowY: "auto" as const,
    scrollbarWidth: "thin" as const,
    scrollbarColor: "rgba(255, 255, 255, 0.2) transparent" as const,
    animation: "expandDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  navItem: {
    width: "100%",
    background: "none",
    border: "none",
    color: "rgba(255, 255, 255, 0.7)",
    padding: "16px 24px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "15px",
    fontWeight: 500,
    position: "relative" as const,
  },
  activeNavItem: {
    background:
      "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
    color: "#a78bfa",
    borderLeft: "3px solid #8b5cf6",
  },
  navItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  navArrow: {
    opacity: 0.6,
    color: "rgba(255, 255, 255, 0.5)",
  },
  placeholder: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "13px",
    textAlign: "center" as const,
    padding: "24px 16px",
    fontStyle: "italic",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "16px 24px",
    gap: "8px",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)",
    borderBottomLeftRadius: "16px",
    borderBottomRightRadius: "16px",
  },
  actionItem: {
    width: "100%",
    background: "none",
    border: "none",
    color: "rgba(255, 255, 255, 0.7)",
    padding: "14px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    fontSize: "15px",
    fontWeight: 500,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    borderRadius: "10px",
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes expandDown {
    from { 
      opacity: 0;
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
    }
    to { 
      opacity: 1;
      max-height: 320px;
      padding-top: 20px;
      padding-bottom: 20px;
    }
  }
  
  /* Enhanced hover effects */
  button:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    color: rgba(255, 255, 255, 0.9) !important;
    transform: translateY(-1px);
  }
  
  /* Close button hover */
  button[aria-label="Close"]:hover {
    background: rgba(239, 68, 68, 0.2) !important;
    color: #ef4444 !important;
    transform: scale(1.05);
  }
  
  /* Action item hover */
  button:last-child:hover {
    background: rgba(239, 68, 68, 0.1) !important;
    color: #fca5a5 !important;
  }
  
  /* Custom scrollbar */
  *::-webkit-scrollbar {
    width: 6px;
  }
  
  *::-webkit-scrollbar-track {
    background: transparent;
  }
  
  *::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  
  *::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

if (!document.head.querySelector("style[data-settings-modal]")) {
  styleSheet.setAttribute("data-settings-modal", "true");
  document.head.appendChild(styleSheet);
}

export default SettingsModal;
