import React, { useState, useEffect } from "react";

// Define color presets and border styles
export const colorPresets = [
  { name: "Blue", value: "#4169E1" },
  { name: "Purple", value: "#9C27B0" },
  { name: "Teal", value: "#009688" },
  { name: "Light Blue", value: "#2196F3" },
  { name: "Orange", value: "#FF5722" },
] as const;

export const borderStyles = [
  { name: "Solid", value: "solid" },
  { name: "Dashed", value: "dashed" },
  { name: "Dotted", value: "dotted" },
  { name: "Double", value: "double" },
] as const;

// Define shortcuts
export const shortcuts = [
  {
    key: "ALT+C",
    action: "Start scraping",
    description: "Toggle scraping mode on the current page",
  },
] as const;

// Helper function to get border style CSS properties
// Returns an object with borderWidth and borderStyle
const getBorderStyleProperties = (style: string) => {
  let borderWidth = "2px";
  let borderStyleValue = "solid";

  switch (style) {
    case "solid":
      borderWidth = "2px";
      borderStyleValue = "solid";
      break;
    case "dashed":
      borderWidth = "2px";
      borderStyleValue = "dashed";
      break;
    case "dotted":
      borderWidth = "2px";
      borderStyleValue = "dotted";
      break;
    case "double":
      // Double borders typically need a thicker width to be visible
      borderWidth = "3px";
      borderStyleValue = "double";
      break;
    default:
      borderWidth = "2px";
      borderStyleValue = "solid";
  }
  return { borderWidth, borderStyle: borderStyleValue };
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

  // Get border properties for the preview line
  const { borderWidth, borderStyle } =
    getBorderStyleProperties(selectedBorderStyle);

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
                  borderWidth: borderWidth, // Fixed: Use individual properties
                  borderStyle: borderStyle, // Fixed: Use individual properties
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
    padding: "8px",
    border: "1px solid #23272f",
  },
  colorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "4px",
  },
  borderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "4px",
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
    cursor: "pointer",
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23bdbdbd' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    backgroundSize: "16px",
    paddingRight: "32px",
  },
  previewContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "8px",
  },
  previewLabel: {
    color: "#bdbdbd",
    fontSize: "11px",
    fontWeight: "500",
  },
  linePreview: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    minHeight: "20px",
  },
  previewLine: {
    width: "80px",
    height: "3px",
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...colorOptionStyles.container,
        // Fixed: Apply selected border properties directly
        ...(selected
          ? {
              borderWidth: colorOptionStyles.selected.borderWidth,
              borderStyle: colorOptionStyles.selected.borderStyle,
              borderColor: colorOptionStyles.selected.borderColor,
              backgroundColor: colorOptionStyles.selected.backgroundColor,
            }
          : {}),
        // Fixed: Apply hover border properties directly
        ...(isHovered && !selected
          ? {
              borderColor: "#666",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }
          : {}),
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
    justifyContent: "center",
    padding: "2px",
    borderRadius: "6px",
    borderWidth: "1px", // Fixed: Use individual properties
    borderStyle: "solid", // Fixed: Use individual properties
    borderColor: "#23272f", // Fixed: Use individual properties
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: "40px",
    height: "40px",
    flex: "1",
  },
  selected: {
    borderWidth: "1px", // Fixed: Use individual properties
    borderStyle: "solid", // Fixed: Use individual properties
    borderColor: "#4169e1", // Fixed: Use individual properties
    backgroundColor: "rgba(65, 105, 225, 0.1)",
  },
  colorSwatch: {
    width: "24px",
    height: "24px",
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
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({ keyCombo, action }) => {
  return (
    <div style={shortcutItemStyles.container}>
      <div style={shortcutItemStyles.keyCombo}>{keyCombo}</div>
      <div style={shortcutItemStyles.content}>
        <div style={shortcutItemStyles.action}>{action}</div>
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
