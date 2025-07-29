// src/FontInspectorUI.tsx
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FontInfo } from "../../types"; // Assuming interfaces.ts and fontInspector.ts for utilities
import {
  FontInspector,
  copyToClipboard,
  generateCodeSnippet,
} from "../../actions/FontInspector"; // Import the core logic
import { convertToTailwind } from "../../utils/tailwindConverter"; // Import the existing Tailwind converter

// Constants (can be moved to a shared constants file if needed)
const FONT_INFO_TOOLTIP_ID = "uiscraper-font-tooltip";
const TOOLTIP_CLASS = "uiscraper-font-tooltip";
const FONT_INSPECTOR_STYLE_ID = "uiscraper-font-inspector-styles";
const LINE_READER_ID = "uiscraper-line-reader";
const LINE_READER_BG = "rgba(0, 89, 255, 0.15)";
const TOOLTIP_OFFSET_X = 10;
const TOOLTIP_OFFSET_Y = 10;

/**
 * Adds CSS styles for the font inspector.
 * This should be called once when the inspector UI is mounted.
 */
function addFontInspectorStyles(): void {
  if (document.getElementById(FONT_INSPECTOR_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = FONT_INSPECTOR_STYLE_ID;
  style.textContent = `
    #${FONT_INFO_TOOLTIP_ID} {
      position: fixed;
      background-color: #18181b;
      color: #ffffff;
      padding: 12px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 12px;
      z-index: 2147483647;
      pointer-events: none; /* Crucial: allows mouse events to pass through */
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
      max-width: 320px;
      min-width: 260px;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-sizing: border-box; /* Include padding and border in width/height */
    }

    #${LINE_READER_ID} {
      position: fixed;
      background: ${LINE_READER_BG};
      pointer-events: none;
      z-index: 2147483646;
      transition: all 0.15s ease-out;
      box-shadow: 0 0 0 1px rgba(0, 89, 255, 0.2);
      border-radius: 2px;
      opacity: 1; /* Always visible when active */
    }

    .tooltip-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tooltip-icon {
      width: 16px;
      height: 16px;
      color: #94a3b8;
      flex-shrink: 0;
    }

    .tooltip-icon svg {
      width: 100%;
      height: 100%;
    }

    .tooltip-title {
      font-weight: 600;
      font-size: 12px;
      color: #ffffff;
    }

    .font-property {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      align-items: center; /* Vertically align items */
    }

    .font-property:last-child {
      border-bottom: none;
    }

    .property-name {
      color: #94a3b8;
      font-weight: 500;
      font-size: 11px;
      flex-shrink: 0;
    }

    .property-value {
      color: #ffffff;
      font-weight: 600;
      font-size: 11px;
      text-align: right;
      cursor: pointer;
      user-select: all;
      flex-grow: 1; /* Allow value to take up remaining space */
      word-break: break-all; /* Break long words */
      white-space: normal; /* Allow wrapping */
      transition: background 0.15s ease-in-out, color 0.15s ease-in-out;
    }

    .color-preview {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 6px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      vertical-align: middle;
      flex-shrink: 0;
    }

    .click-to-copy {
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
      margin-top: 8px;
      font-style: italic;
    }

    .copy-success-message {
      display: flex;
      flex-direction: column; /* Stack items vertically */
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 16px; /* Increased padding */
      font-size: 12px; /* Slightly larger font */
      color: #10b981;
      text-align: center;
      min-height: 100px; /* Ensure minimum height for good display */
      box-sizing: border-box;
    }

    .copy-success-message svg {
      width: 20px; /* Larger icon */
      height: 20px;
      stroke: #10b981;
      margin-bottom: 4px; /* Space between icon and text */
    }

    .font-status {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .font-status.web-safe {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .font-status.custom {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .font-status.system {
      background: rgba(168, 85, 247, 0.2);
      color: #a855f7;
    }

    .text-preview {
      background: rgba(255, 255, 255, 0.05);
      padding: 6px 8px;
      border-radius: 4px;
      margin: 8px 0 4px; /* Adjust margin */
      font-size: 10px;
      line-height: 1.4; /* Slightly increased line height for readability */
      max-height: 60px;
      overflow: hidden;
      border-left: 3px solid rgba(0, 89, 255, 0.5);
      font-family: monospace; /* Use monospace for code-like text preview */
      white-space: pre-wrap; /* Preserve whitespace and wrap */
      word-break: break-all; /* Break long words */
    }
  `;
  document.head.appendChild(style);
}

/**
 * Removes font inspector styles.
 * This should be called when the inspector UI is unmounted.
 */
function removeFontInspectorStyles(): void {
  const styleElement = document.getElementById(FONT_INSPECTOR_STYLE_ID);
  if (styleElement) {
    styleElement.remove();
  }
}

// --- UI Components ---

interface FontTooltipProps {
  fontInfo: FontInfo;
  x: number;
  y: number;
  onCopyAllCss: (fontInfo: FontInfo) => void;
  showSuccessMessage: boolean;
}

const FontTooltip: React.FC<FontTooltipProps> = ({
  fontInfo,
  x,
  y,
  onCopyAllCss,
  showSuccessMessage,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [localShowSuccess, setLocalShowSuccess] = useState(showSuccessMessage);

  useEffect(() => {
    setLocalShowSuccess(showSuccessMessage);
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setLocalShowSuccess(false);
      }, 700); // Shorter duration for local message
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  useEffect(() => {
    if (tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;

      let leftPosition = x + TOOLTIP_OFFSET_X;
      let topPosition = y + TOOLTIP_OFFSET_Y;

      // Adjust position to ensure tooltip stays within viewport
      if (leftPosition + tooltipWidth > viewportWidth) {
        leftPosition = x - tooltipWidth - TOOLTIP_OFFSET_X;
      }
      if (topPosition + tooltipHeight > viewportHeight) {
        topPosition = y - tooltipHeight - TOOLTIP_OFFSET_Y;
      }

      tooltip.style.left = `${leftPosition}px`;
      tooltip.style.top = `${topPosition}px`;
      tooltip.style.opacity = "1";
      tooltip.style.transform = "scale(1)";
    }
  }, [x, y, fontInfo, localShowSuccess]); // Recalculate position if content changes

  const handlePropertyValueClick = async (
    e: React.MouseEvent<HTMLSpanElement>,
    propertyName: string,
    value: string
  ) => {
    e.stopPropagation(); // Prevent propagation to the document click handler

    const success = await copyToClipboard(value);

    if (success) {
      const target = e.target as HTMLSpanElement;
      target.style.background = "rgba(16, 185, 129, 0.2)";
      target.style.color = "#10b981";

      setTimeout(() => {
        target.style.background = ""; // Reset background
        target.style.color = ""; // Reset color
      }, 500);
    }
  };

  const fontStatusClass = fontInfo.isWebSafe
    ? "web-safe"
    : fontInfo.isSystemFont
      ? "system"
      : "custom";

  const fontStatusText = fontInfo.isWebSafe
    ? "Web Safe"
    : fontInfo.isSystemFont
      ? "System"
      : "Custom";

  return ReactDOM.createPortal(
    <div
      id={FONT_INFO_TOOLTIP_ID}
      className={TOOLTIP_CLASS}
      ref={tooltipRef}
      style={{ opacity: 0, transform: "scale(0.95)" }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks on tooltip from closing inspector
    >
      {localShowSuccess ? (
        <div className="copy-success-message">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
          CSS properties copied!
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>
            (Inspector closing)
          </div>
        </div>
      ) : (
        <>
          <div className="tooltip-header">
            <div className="tooltip-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7V4h16v3"></path>
                <path d="M9 20h6"></path>
                <path d="M12 4v16"></path>
              </svg>
            </div>
            <div className="tooltip-title">Font Inspector</div>
          </div>

          <div className="font-property">
            <span className="property-name">Font</span>
            <span
              className="property-value"
              onClick={(e) =>
                handlePropertyValueClick(e, "font", fontInfo.fontFamily)
              }
            >
              {fontInfo.renderedFont}
            </span>
          </div>
          <div className="font-property">
            <span className="property-name">Size</span>
            <span
              className="property-value"
              onClick={(e) =>
                handlePropertyValueClick(e, "size", fontInfo.fontSize)
              }
            >
              {fontInfo.fontSize}
            </span>
          </div>
          <div className="font-property">
            <span className="property-name">Weight</span>
            <span
              className="property-value"
              onClick={(e) =>
                handlePropertyValueClick(e, "weight", fontInfo.fontWeight)
              }
            >
              {fontInfo.fontWeight}
            </span>
          </div>
          <div className="font-property">
            <span className="property-name">Color</span>
            <span
              className="property-value"
              onClick={(e) =>
                handlePropertyValueClick(e, "color", fontInfo.color.hex)
              }
            >
              <span
                className="color-preview"
                style={{ backgroundColor: fontInfo.color.hex }}
              ></span>
              {fontInfo.color.hex}
            </span>
          </div>
          <div className="font-property">
            <span className="property-name">Element</span>
            <span
              className="property-value"
              onClick={(e) =>
                handlePropertyValueClick(e, "element", fontInfo.elementType)
              }
            >
              &lt;{fontInfo.elementType}&gt;
            </span>
          </div>
          {fontInfo.className && (
            <div className="font-property">
              <span className="property-name">Classes</span>
              <span
                className="property-value"
                onClick={(e) =>
                  handlePropertyValueClick(e, "classes", fontInfo.className)
                }
              >
                .{fontInfo.className.split(" ").join(".")}
              </span>
            </div>
          )}

          {fontInfo.textContent.length > 0 && (
            <div className="text-preview">
              {fontInfo.textContent.length > 150
                ? fontInfo.textContent.substring(0, 150) + "..."
                : fontInfo.textContent}
            </div>
          )}

          <div
            className="click-to-copy"
            onClick={(e) => {
              e.stopPropagation();
              onCopyAllCss(fontInfo);
            }}
            style={{ pointerEvents: "all" }} // Make this clickable
          >
            Click any value to copy or click element to copy all CSS
          </div>
        </>
      )}
    </div>,
    document.body // Portal to body
  );
};

interface LineReaderProps {
  top: number;
  left: number;
  width: number;
  height: number;
  visible: boolean;
}

const LineReader: React.FC<LineReaderProps> = ({
  top,
  left,
  width,
  height,
  visible,
}) => {
  return ReactDOM.createPortal(
    <div
      id={LINE_READER_ID}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        opacity: visible ? 1 : 0, // Control visibility via opacity
      }}
    />,
    document.body
  );
};

interface FontInspectorUIProps {
  initialActive?: boolean;
}

export const FontInspectorUI: React.FC<FontInspectorUIProps> = ({
  initialActive = false,
}) => {
  const [isActive, setIsActive] = useState(initialActive);

  // Sync with external state changes
  useEffect(() => {
    setIsActive(initialActive);
    // If inspection is being turned off externally, stop the inspector
    if (!initialActive && inspectorRef.current?.isInspectionActive()) {
      inspectorRef.current.stopInspection();
    }
  }, [initialActive]);
  const [fontInfo, setFontInfo] = useState<FontInfo | null>(null);
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [lineReaderRect, setLineReaderRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [showCopySuccessMessage, setShowCopySuccessMessage] = useState(false);

  const inspectorRef = useRef<FontInspector | null>(null);

  // Initialize and clean up inspector core logic
  useEffect(() => {
    addFontInspectorStyles();

    // Initialize FontInspector once
    inspectorRef.current = new FontInspector({
      onFontInfoUpdate: (info, targetRect, lineRect, mouseEvent) => {
        setFontInfo(info);
        if (info && mouseEvent) {
          setTooltipX(mouseEvent.clientX);
          setTooltipY(mouseEvent.clientY);
        }
        setLineReaderRect(lineRect);
      },
      onCopySuccess: () => {
        setShowCopySuccessMessage(true);
      },
      onDeactivate: () => {
        setIsActive(false); // Propagate deactivation back to UI state
        setFontInfo(null);
        setLineReaderRect(null);
        setShowCopySuccessMessage(false);
      },
    });

    if (isActive) {
      inspectorRef.current.startInspection();
    }

    return () => {
      // Cleanup
      if (inspectorRef.current?.isInspectionActive()) {
        inspectorRef.current.stopInspection();
      }
      removeFontInspectorStyles();
    };
  }, []); // Empty dependency array means this runs once on mount/unmount

  // Handle toggling inspection mode
  useEffect(() => {
    if (isActive) {
      inspectorRef.current?.startInspection();
    } else {
      inspectorRef.current?.stopInspection();
    }
  }, [isActive]);

  const handleCopyAllCss = async (info: FontInfo) => {
    try {
      // Try to get preferred framework from storage
      let outputType: "tailwind-jsx" | "css" = "css";

      try {
        const preferredFramework = await FontInspector.getPreferredFramework();
        if (preferredFramework === "react") {
          outputType = "tailwind-jsx";
        }
      } catch (error) {
        console.warn(
          "Could not get preferred framework, defaulting to CSS:",
          error
        );
      }

      const codeSnippet = generateCodeSnippet(info, outputType);

      const success = await copyToClipboard(codeSnippet);
      if (success) {
        setShowCopySuccessMessage(true);
        setTimeout(() => {
          inspectorRef.current?.stopInspection(); // Deactivate inspector
        }, 800);
      }
    } catch (error) {
      console.error("Error copying code snippet:", error);
    }
  };

  // Don't render anything when not active - let FloatingButton handle activation
  if (!isActive) {
    return null;
  }

  return (
    <>
      {fontInfo && (
        <FontTooltip
          fontInfo={fontInfo}
          x={tooltipX}
          y={tooltipY}
          onCopyAllCss={handleCopyAllCss}
          showSuccessMessage={showCopySuccessMessage}
        />
      )}
      {lineReaderRect && (
        <LineReader
          top={lineReaderRect.top}
          left={lineReaderRect.left}
          width={lineReaderRect.width}
          height={lineReaderRect.height}
          visible={true}
        />
      )}
    </>
  );
};
