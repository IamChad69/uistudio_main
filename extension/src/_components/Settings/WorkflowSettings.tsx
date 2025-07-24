"use client";

import React, { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import useStorage from "../../hooks/useStorage";
import { useAuth } from "../../hooks/useAuth";
import Switch from "../Ui/Switch";
import { Framework } from "../../types";
import useFramework from "../../hooks/useFramework";
import { autoSaveManager } from "../../utils/autoSave";

type FrameworkType = {
  id: Framework;
  name: string;
  icon: string;
  enabled: boolean;
  comingSoon?: boolean;
  isPremium?: boolean;
};

// Framework icons
const FrameworkIcon: React.FC<{ framework: FrameworkType }> = ({
  framework,
}) => {
  // Hard-coded SVG content based on framework type
  const renderSvgIcon = () => {
    const iconStyle = {
      width: "1rem",
      height: "1rem",
      marginRight: "0.375rem",
    };

    switch (framework.id) {
      case "html":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={iconStyle}
            fill="currentColor"
          >
            <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" />
          </svg>
        );
      case "react":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={iconStyle}
            fill="currentColor"
          >
            <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ width: "1rem", height: "1rem", marginRight: "0.375rem" }}>
        {renderSvgIcon()}
      </div>
      <span>{framework.name}</span>
    </div>
  );
};

const FRAMEWORKS: FrameworkType[] = [
  {
    id: "html",
    name: "HTML",
    icon: "html",
    enabled: true,
    comingSoon: false,
    isPremium: false,
  },
  {
    id: "react",
    name: "React",
    icon: "react",
    enabled: true,
    comingSoon: false,
    isPremium: false,
  },
];

export const WorkflowSettings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { selectedFramework, setSelectedFramework } = useFramework();

  // Store settings in storage
  const [autoSaveResults, setAutoSaveResults] = useStorage(
    "auto_save_results",
    true,
    "local"
  );
  const [createComponents, setCreateComponents] = useStorage(
    "create_components",
    true,
    "local"
  );
  const [createAsTemplate, setCreateAsTemplate] = useStorage(
    "create_as_template",
    true,
    "local"
  );

  // Auto-save functionality
  const handleAutoSaveToggle = async (value: boolean) => {
    if (isAuthenticated) {
      console.log("Setting autoSaveResults to:", value);
      setAutoSaveResults(value);

      // Update the auto-save manager
      await autoSaveManager.setAutoSaveEnabled(value);

      // If enabling auto-save, check for pending scraped code and save it
      if (value) {
        await handleAutoSavePendingResults();
      }
    }
  };

  const handleAutoSavePendingResults = async () => {
    try {
      // Get any pending scraped code from storage
      const pendingCode = await autoSaveManager.getPendingCode();
      if (!pendingCode) {
        console.log("No pending scraped code to auto-save");
        return;
      }

      console.log("Auto-saving pending scraped code...");

      // Use the auto-save manager to trigger the save
      const success = await autoSaveManager.triggerAutoSave({
        scrapedCode: pendingCode,
        context: "Auto-saved from extension",
      });

      if (success) {
        // Clear the pending scraped code after successful save
        await autoSaveManager.clearPendingCode();
        // Consider showing success notification to user
        console.log("Auto-save completed successfully");
      } else {
        throw new Error("Auto-save failed");
      }
    } catch (error) {
      console.error("Error during auto-save:", error);
      // Consider showing error notification to user
      // or updating UI state to indicate failure
    }
  };

  // Handle framework selection
  const handleFrameworkChange = (framework: Framework) => {
    const selectedFrameworkObj = FRAMEWORKS.find((f) => f.id === framework);
    if (selectedFrameworkObj && !selectedFrameworkObj.comingSoon) {
      console.log("Changing framework to:", framework);
      setSelectedFramework(framework);
    }
  };

  return (
    <div style={styles.container}>
      {/* Framework Selection Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Target Framework</h3>
        <p style={styles.sectionDescription}>
          Choose the framework for your generated code
        </p>
        <div style={styles.optionsContainer}>
          <div style={styles.frameworkGrid}>
            {FRAMEWORKS.map((framework) => (
              <FrameworkOption
                key={framework.id}
                framework={framework}
                selected={selectedFramework === framework.id}
                onClick={() => handleFrameworkChange(framework.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider}></div>

      {/* Automation Settings Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Automation</h3>
        <p style={styles.sectionDescription}>
          Configure how your scraping results are processed
        </p>
        <div style={styles.optionsContainer}>
          {/* Auto Save Settings */}
          <SettingItem
            title="Auto-save results"
            description={
              isAuthenticated
                ? "Save results automatically after scraping"
                : "Upgrade to enable auto-save feature"
            }
            isPremium={!isAuthenticated}
            checked={isAuthenticated && autoSaveResults}
            onChange={handleAutoSaveToggle}
            disabled={!isAuthenticated}
          />

          {/* Create as component Settings */}
          <SettingItem
            title="Create as component"
            description="Add a component wrapper to your copied codes"
            checked={createComponents}
            onChange={(value: boolean) => {
              console.log("Setting createComponents to:", value);
              setCreateComponents(value);
            }}
          />

          {/* Create as template Settings */}
          <SettingItem
            title="Create as template"
            description={
              isAuthenticated
                ? "Add a component wrapper to your copied codes"
                : "Upgrade to enable template creation"
            }
            isPremium={!isAuthenticated}
            checked={isAuthenticated && createAsTemplate}
            onChange={(value: boolean) => {
              if (isAuthenticated) {
                console.log("Setting createAsTemplate to:", value);
                setCreateAsTemplate(value);
              }
            }}
            disabled={!isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
};

interface FrameworkOptionProps {
  framework: FrameworkType;
  selected: boolean;
  onClick: () => void;
}

const FrameworkOption: React.FC<FrameworkOptionProps> = ({
  framework,
  selected,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={framework.comingSoon}
      style={{
        ...frameworkOptionStyles.container,
        ...(selected
          ? {
              borderWidth: frameworkOptionStyles.selected.borderWidth,
              borderStyle: frameworkOptionStyles.selected.borderStyle,
              borderColor: frameworkOptionStyles.selected.borderColor,
              backgroundColor: frameworkOptionStyles.selected.backgroundColor,
            }
          : {}),
        ...(isHovered && !selected && !framework.comingSoon
          ? {
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "#666",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }
          : {}),
        ...(framework.comingSoon
          ? {
              opacity: 0.5,
              cursor: "not-allowed",
            }
          : {}),
      }}
    >
      <FrameworkIcon framework={framework} />
      {framework.isPremium && (
        <span style={frameworkOptionStyles.premiumBadge}>
          <Crown size={12} />
        </span>
      )}
    </button>
  );
};

interface SettingItemProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  isPremium?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  checked,
  onChange,
  disabled = false,
  isPremium = false,
}) => {
  return (
    <div style={settingItemStyles.container}>
      <div style={settingItemStyles.content}>
        <div style={settingItemStyles.header}>
          <span style={settingItemStyles.title}>{title}</span>
          {isPremium && (
            <span style={settingItemStyles.premiumBadge}>
              <Crown size={12} />
            </span>
          )}
        </div>
        <p style={settingItemStyles.description}>{description}</p>
      </div>
      <div style={settingItemStyles.switch}>
        <Switch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-label={`${title} toggle`}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    fontSize: "12px",
  },
  section: {
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: "8px",
  },
  sectionDescription: {
    color: "#bdbdbd",
    fontSize: "11px",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  optionsContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: "8px",
    padding: "8px",
    border: "1px solid #23272f",
  },
  frameworkGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
  },
  divider: {
    borderTop: "1px solid #23272f",
    marginTop: "16px",
    marginBottom: "16px",
  },
};

const frameworkOptionStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "6px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#23272f",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "11px",
    color: "#fff",
    position: "relative" as const,
  },
  selected: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#4169e1",
    backgroundColor: "rgba(65, 105, 225, 0.1)",
  },
  premiumBadge: {
    marginLeft: "4px",
    fontSize: "10px",
    padding: "2px 4px",
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    color: "#fbbf24",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center",
  },
};

const settingItemStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px",
    borderBottom: "1px solid #23272f",
  },
  content: {
    flex: 1,
    marginRight: "12px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "4px",
  },
  title: {
    color: "#fff",
    fontSize: "11px",
    fontWeight: "500",
  },
  description: {
    color: "#bdbdbd",
    fontSize: "10px",
    lineHeight: "1.3",
    margin: 0,
  },
  premiumBadge: {
    marginLeft: "4px",
    fontSize: "10px",
    padding: "2px 4px",
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    color: "#fbbf24",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center",
  },
  switch: {
    flexShrink: 0,
  },
};

export default WorkflowSettings;
