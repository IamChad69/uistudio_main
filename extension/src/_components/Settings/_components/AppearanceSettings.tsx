import React, { useState, useEffect } from "react";

// Define color presets and border styles
export const colorPresets = [
  { name: "Avocado Alien", value: "#6A78FC" },
  { name: "Rainbow Candy", value: "#9C27B0" },
  { name: "Honeydew Punch", value: "#009688" },
  { name: "Electric Blue", value: "#2196F3" },
  { name: "Sunset Orange", value: "#FF5722" },
  { name: "Emerald Green", value: "#4CAF50" },
] as const;

export const borderStyles = [
  { name: "Solid", value: "solid" },
  { name: "Dashed", value: "dashed" },
  { name: "Dotted", value: "dotted" },
  { name: "Browser", value: "browser" },
] as const;

// Define shortcuts
export const shortcuts = [
  {
    key: "ALT+C",
    action: "Start scraping",
    description: "Toggle scraping mode on the current page",
  },
] as const;

// Helper function to get border style CSS
const getBorderStyle = (style: string) => {
  switch (style) {
    case "solid":
      return "2px solid";
    case "dashed":
      return "2px dashed";
    case "dotted":
      return "2px dotted";
    case "browser":
      return "2px solid";
    default:
      return "2px solid";
  }
};

// Save settings to storage
const saveSettings = (settings: {
  highlightColor: string;
  borderStyle?: string;
}) => {
  chrome.storage.sync.set(settings, () => {
    // Dispatch event to notify content scripts about the change
    window.dispatchEvent(
      new CustomEvent("uiscraper:settings-changed", { detail: settings })
    );
  });
};

export const AppearanceSettings: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<string>(
    colorPresets[0].value
  );
  const [selectedBorderStyle, setSelectedBorderStyle] = useState<string>(
    borderStyles[0].value
  );

  // Load saved settings on component mount
  useEffect(() => {
    chrome.storage.sync.get(["highlightColor", "borderStyle"], (result) => {
      if (result.highlightColor) {
        setSelectedColor(result.highlightColor);
      }
      if (result.borderStyle) {
        setSelectedBorderStyle(result.borderStyle);
      }
    });
  }, []);

  // Handle color selection
  const handleColorSelect = (colorValue: string) => {
    setSelectedColor(colorValue);
    saveSettings({
      highlightColor: colorValue,
      borderStyle: selectedBorderStyle,
    });
  };

  // Handle border style selection
  const handleBorderStyleSelect = (borderStyle: string) => {
    setSelectedBorderStyle(borderStyle);
    saveSettings({ highlightColor: selectedColor, borderStyle });
  };

  return (
    <div style={styles.container}>
      {/* Accent Color Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Highlight Color</h3>
        <p style={styles.sectionDescription}>
          Choose the color used for highlighting elements during scraping
        </p>
        <div style={styles.optionsContainer}>
          <div style={styles.colorGrid}>
            {colorPresets.map((preset) => (
              <ColorOption
                key={preset.value}
                color={preset.value}
                selected={selectedColor === preset.value}
                onClick={() => handleColorSelect(preset.value)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider}></div>

      {/* Border Style Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Border Style</h3>
        <p style={styles.sectionDescription}>
          Choose how element borders appear when highlighted
        </p>
        <div style={styles.optionsContainer}>
          <select
            value={selectedBorderStyle}
            onChange={(e) => handleBorderStyleSelect(e.target.value)}
            style={styles.dropdown}
          >
            {borderStyles.map((style) => (
              <option key={style.value} value={style.value}>
                {style.name}
              </option>
            ))}
          </select>
          <div style={styles.previewContainer}>
            <div style={styles.previewLabel}>Preview:</div>
            <div style={styles.linePreview}>
              <div
                style={{
                  ...styles.previewLine,
                  border: getBorderStyle(selectedBorderStyle),
                  borderColor: selectedColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider}></div>

      {/* Shortcuts Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Shortcuts</h3>
        <p style={styles.sectionDescription}>
          Keyboard shortcuts to help you work faster
        </p>
        <div style={styles.shortcutsContainer}>
          {shortcuts.map((shortcut) => (
            <ShortcutItem
              key={shortcut.key}
              keyCombo={shortcut.key}
              action={shortcut.action}
              description={shortcut.description}
            />
          ))}
        </div>
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
    padding: "12px",
    border: "1px solid #23272f",
  },
  colorGrid: {
    display: "flex",
    flexDirection: "row" as const,
    gap: "8px",
    justifyContent: "space-between",
  },
  borderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
  },
  divider: {
    borderTop: "1px solid #23272f",
    marginTop: "16px",
    marginBottom: "16px",
  },
  shortcutsContainer: {
    marginTop: "8px",
  },
  dropdown: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #23272f",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    fontSize: "12px",
    marginBottom: "12px",
  },
  previewContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  previewLabel: {
    color: "#bdbdbd",
    fontSize: "11px",
    fontWeight: "500",
  },
  linePreview: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  previewLine: {
    width: "60px",
    height: "2px",
    borderRadius: "1px",
  },
};

interface ColorOptionProps {
  color: string;
  selected?: boolean;
  onClick: () => void;
}

const ColorOption: React.FC<ColorOptionProps> = ({
  color,
  selected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        ...colorOptionStyles.container,
        ...(selected ? colorOptionStyles.selected : {}),
      }}
    >
      <div
        style={{
          ...colorOptionStyles.colorSwatch,
          backgroundColor: color,
        }}
      />
    </button>
  );
};

const colorOptionStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #23272f",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: "60px",
    flex: "1",
  },
  selected: {
    borderColor: "#4169e1",
    backgroundColor: "rgba(65, 105, 225, 0.1)",
  },
  colorSwatch: {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: "#fff",
    fontSize: "11px",
    fontWeight: "500",
    marginBottom: "2px",
  },
  description: {
    color: "#bdbdbd",
    fontSize: "9px",
  },
};

interface ShortcutItemProps {
  keyCombo: string;
  action: string;
  description: string;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({
  keyCombo,
  action,
  description,
}) => {
  return (
    <div style={shortcutItemStyles.container}>
      <div style={shortcutItemStyles.keyCombo}>{keyCombo}</div>
      <div style={shortcutItemStyles.content}>
        <div style={shortcutItemStyles.action}>{action}</div>
        <div style={shortcutItemStyles.description}>{description}</div>
      </div>
    </div>
  );
};

const shortcutItemStyles = {
  container: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "8px",
    borderRadius: "6px",
    backgroundColor: "#1a1a1a",
    border: "1px solid #23272f",
  },
  keyCombo: {
    backgroundColor: "#2a2a2a",
    color: "#bdbdbd",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "500",
    fontFamily: "monospace",
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  action: {
    color: "#fff",
    fontSize: "11px",
    fontWeight: "500",
    marginBottom: "2px",
  },
  description: {
    color: "#bdbdbd",
    fontSize: "9px",
    lineHeight: "1.3",
  },
};

export default AppearanceSettings;
