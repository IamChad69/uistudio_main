"use client";

import React, { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import useStorage from "../../../hooks/useStorage";
import { useAuth } from "../../../hooks/useAuth";
import Switch from "./Switch";
import { Framework } from "../../../types";
import useFramework from "../../../hooks/useFramework";

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
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={iconStyle}
            fill="currentColor"
          >
            <path d="M11.996 1C5.61 1 2.605 4.072 1.7 6.202c-2.268 5.328 1.994 12.44 2.602 13.36.874 1.33 6.436 5.744 11.12 2.645 1.73-1.143 2.768-3.067 2.207-6.24-.302-1.707-1.105-2.256-1.325-2.256h-.004c-.79.463-1.013 2.508-1.648 3.14-.866.86-3.097 1.338-5.62-.43l-.003-.013C7.992 15.46 7.116 13.9 7.4 12.17c.323-1.92 2.483-2.355 3.046-2.234 1.342.295 3.056 2.095 1.368 4.448 3.873 1.43 8.153-1.313 8.153-4.495C19.962 4.68 13.76.877 11.996 1zm-5.3 10.49c-.02 2.07 1.163 4.347 3.035 6.423A31.406 31.406 0 0010.065 19c-.827-.85-3.112-3.364-3.367-7.28-.066-1.084.08-1.958.333-2.677-1.214-.32-1.853.073-2.453.69-.547.564-1.162 1.743-1.036 2.777.085.714.544 1.652 1.466 2.423.107.09.214.176.314.26.016.012.036.02.052.032l.026.022.02.012c.07.05.138.1.208.148a8.89 8.89 0 01.613.387c.035-.067.064-.14.108-.2.376-.504.99-1.088 1.755-1.103.887-.02 1.46.67 1.493 1.08.025.31-.14.767-1.12.767-.83 0-1.605-.61-2.188-1.2-.04-.03-.08-.06-.115-.09-.205-.15-.402-.307-.583-.47-1.25-.91-2.13-1.954-2.628-3.1-.57-1.21-.69-2.483-.326-3.796.447-1.607 1.408-2.744 2.683-3.166.88-.292 1.724-.222 2.52.215.78.425 1.502 1.188 2.158 2.283.16.267.304.54.44.81.165.334.315.67.472 1.01.324.494.657.967 1.008 1.387.446.537.92.986 1.464 1.258.366.186.778.294 1.22.294.097 0 .196-.005.3-.015 1.1-.093 2.04-.888 2.463-2.076.178-.504.5-1.003.9-1.468.5-.584 1.116-1.096 1.792-1.362.467-.176.964-.262 1.486-.262.166 0 .336.01.506.025.62.063 1.21.26 1.746.558.358.2.703.454 1.015.763.518.512.937 1.17 1.143 1.978.13.52.173 1.117.128 1.733-.126 1.677-1.005 3.445-2.45 4.946-1.45 1.502-3.35 2.618-5.575 3.153-.9.217-1.827.325-2.756.325-2.308 0-4.62-.718-6.57-2.173.092-.122.174-.25.253-.38.75-1.226 1.938-1.85 3.112-1.83 1.222.02 2.322.662 3.11 1.833 1.162-1.004 1.467-2.45.732-3.586-.642-.99-1.838-1.32-2.69-.95-.844.366-1.467 1.37-1.124 2.658-1.764 1.033-3.723.687-4.606-.858-1.05-1.832.13-3.756 1.65-4.532.8-.41 1.68-.57 2.534-.516.916.063 1.765.34 2.53.793 1.082.642 1.992 1.61 2.767 2.943l.007-.005c.348.6.658 1.25.93 1.935.115.295.217.596.312.903 3.26-1.04 4.76-3.155 4.948-4.48.205-1.445-.564-2.65-1.272-3.37-.805-.82-1.892-1.342-3.094-1.487C19.444 3.346 17.616 3.8 16.32 4.714c-1.107.786-1.912 1.85-2.27 3.062-.278-.326-.586-.637-.944-.92-1.203-.95-2.722-1.6-4.295-1.774-.913-.098-1.828-.044-2.724.168-1.198.284-2.263.927-3.077 1.866-.52.6-.93 1.31-1.163 2.06-.062.2-.113.41-.154.62-.046.23-.08.47-.098.71-.019.257-.025.52-.012.777-1.154-1.394-1.87-3.284-1.803-5.368.065-2.14 1.334-4.028 3.122-4.89.847-.408 1.777-.617 2.766-.617.644 0 1.317.088 2.01.264 1.674.424 3.508 1.346 5.408 2.707.83.596 1.67 1.28 2.512 2.046l.088.078-.088.078c-.842.767-1.68 1.45-2.511 2.046C10.76 9.223 8.926 10.145 7.25 10.57a9.303 9.303 0 01-2.01.264 6.98 6.98 0 01-2.766-.618c-.28-.136-.536-.294-.775-.464z" />
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

  // Check user's plan status

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

  // Handle framework selection
  const handleFrameworkChange = (framework: Framework) => {
    const selectedFrameworkObj = FRAMEWORKS.find((f) => f.id === framework);
    if (selectedFrameworkObj && !selectedFrameworkObj.comingSoon) {
      console.log("Changing framework to:", framework);
      setSelectedFramework(framework);
    }
  };

  const getFrameworkButtonStyle = (framework: FrameworkType) => {
    const baseStyle = {
      padding: "0.5rem",
      borderRadius: "0.375rem",
      fontSize: "0.75rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
      cursor: framework.comingSoon ? "not-allowed" : "pointer",
    };

    if (selectedFramework === framework.id) {
      return {
        ...baseStyle,
        backgroundColor: "#9333ea", // purple-600
        color: "white",
      };
    } else if (framework.comingSoon) {
      return {
        ...baseStyle,
        backgroundColor: "#3f3f46", // zinc-700
        color: "#71717a", // zinc-500
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: "#3f3f46", // zinc-700
        color: "#d4d4d8", // zinc-300
      };
    }
  };
  // Styles
  const containerStyle = {
    marginTop: "1rem",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  };

  const sectionStyle = {
    marginBottom: "1rem",
  };

  const headingStyle = {
    fontSize: "1rem",
    fontWeight: 500,
    color: "white",
    marginBottom: "0.5rem",
  };

  const cardStyle = {
    backgroundColor: "#27272a", // zinc-800
    borderRadius: "0.5rem",
    overflow: "hidden",
  };

  const cardSectionStyle = {
    padding: "0.75rem",
  };

  const frameworkGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.5rem",
  };

  const dividerStyle = {
    borderTop: "1px solid #3f3f46", // border-zinc-700
    margin: "0.75rem 0",
  };

  const settingRowStyle = {
    padding: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #3f3f46", // border-zinc-700
  };

  const firstSettingRowStyle = {
    ...settingRowStyle,
    borderTop: "none",
  };

  const settingLabelStyle = {
    flex: 1,
  };

  const settingTitleStyle = {
    color: "#d4d4d8", // zinc-300
    fontSize: "0.75rem",
  };

  const settingDescriptionStyle = {
    color: "#71717a", // zinc-500
    fontSize: "0.75rem",
  };

  const premiumFeatureStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  };

  const premiumBadgeStyle = {
    marginLeft: "0.25rem",
    fontSize: "0.625rem",
    padding: "0 0.25rem",
    backgroundColor: "rgba(245, 158, 11, 0.2)", // amber-500/20
    color: "#fbbf24", // amber-400
    borderRadius: "0.125rem",
    display: "inline-flex",
    alignItems: "center",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Framework Selection */}
        <div style={cardSectionStyle}>
          <h4
            style={{
              ...settingTitleStyle,
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          >
            Target Framework
          </h4>
          <div style={frameworkGridStyle}>
            {FRAMEWORKS.map((framework) => (
              <button
                key={framework.id}
                onClick={() => handleFrameworkChange(framework.id)}
                disabled={framework.comingSoon}
                style={getFrameworkButtonStyle(framework)}
              >
                <FrameworkIcon framework={framework} />
                {framework.isPremium && (
                  <span style={premiumBadgeStyle}>
                    <Crown size={12} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Automation Settings */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Automation</h3>
        <div style={cardStyle}>
          {/* Auto Save Settings */}
          <div style={firstSettingRowStyle}>
            <div style={settingLabelStyle}>
              <div style={premiumFeatureStyle}>
                <span style={settingTitleStyle}>Auto-save results</span>
                {!isAuthenticated && (
                  <span style={premiumBadgeStyle}>
                    <Crown size={12} />
                  </span>
                )}
              </div>
              <p style={settingDescriptionStyle}>
                {isAuthenticated
                  ? "Save results automatically after scraping"
                  : "Upgrade to enable auto-save feature"}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Switch
                id="auto-save-switch"
                checked={isAuthenticated && autoSaveResults}
                onChange={(value: boolean) => {
                  if (isAuthenticated) {
                    console.log("Setting autoSaveResults to:", value);
                    setAutoSaveResults(value);
                  }
                }}
                disabled={!isAuthenticated}
                aria-label="Auto-save toggle"
              />
            </div>
          </div>

          {/* Create as component Settings */}
          <div style={settingRowStyle}>
            <div style={settingLabelStyle}>
              <span style={settingTitleStyle}>Create as component</span>
              <p style={settingDescriptionStyle}>
                Add a component wrapper to your copied codes
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Switch
                id="create-component-switch"
                checked={createComponents}
                onChange={(value: boolean) => {
                  console.log("Setting createComponents to:", value);
                  setCreateComponents(value);
                }}
                aria-label="Create component toggle"
              />
            </div>
          </div>

          {/* Create as template Settings */}
          <div style={settingRowStyle}>
            <div style={settingLabelStyle}>
              <div style={premiumFeatureStyle}>
                <span style={settingTitleStyle}>Create as template</span>
                {!isAuthenticated && (
                  <span style={premiumBadgeStyle}>
                    <Crown size={12} />
                  </span>
                )}
              </div>
              <p style={settingDescriptionStyle}>
                {isAuthenticated
                  ? "Add a component wrapper to your copied codes"
                  : "Upgrade to enable template creation"}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Switch
                id="create-template-switch"
                checked={isAuthenticated && createAsTemplate}
                onChange={(value: boolean) => {
                  if (isAuthenticated) {
                    console.log("Setting createAsTemplate to:", value);
                    setCreateAsTemplate(value);
                  }
                }}
                disabled={!isAuthenticated}
                aria-label="Create template toggle"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSettings;
