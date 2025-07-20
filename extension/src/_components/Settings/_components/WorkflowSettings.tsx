"use client";

import React, { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import useStorage from "../../../hooks/useStorage";
import { useAuth } from "../../../hooks/useAuth";
import Switch from "./Switch";

export const WorkflowSettings: React.FC = () => {
  const { isAuthenticated } = useAuth();

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
