// src/fontInspector.ts

import { ColorValue, FontMetrics, FontInfo } from "../types"; // Assuming interfaces.ts

// Constants
const WEB_SAFE_FONTS = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Times",
  "Courier New",
  "Courier",
  "Verdana",
  "Georgia",
  "Palatino",
  "Garamond",
  "Bookman",
  "Comic Sans MS",
  "Trebuchet MS",
  "Impact",
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Oxygen",
  "Ubuntu",
  "Cantarell",
  "Open Sans",
];

/**
 * Formats color values (RGB to HEX).
 * @param colorValue - The color string (e.g., "rgb(255, 0, 0)" or "#FF0000").
 * @returns An object containing both RGB and HEX representations.
 */
export function formatColorValue(colorValue: string): ColorValue {
  // Debug logging
  console.log("formatColorValue input:", colorValue);

  if (!colorValue || colorValue === "initial" || colorValue === "inherit") {
    return { rgb: "transparent", hex: "#000000" };
  }

  if (colorValue.startsWith("#")) {
    return { hex: colorValue, rgb: colorValue };
  }

  // Handle rgba() format
  if (colorValue.startsWith("rgba(")) {
    const rgbaValues = colorValue.match(/[\d.]+/g);
    if (rgbaValues && rgbaValues.length >= 3) {
      const [r, g, b] = rgbaValues.map(Number.parseInt);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        const hex = `#${r.toString(16).padStart(2, "0")}${g
          .toString(16)
          .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        return { rgb: colorValue, hex: hex.toUpperCase() };
      }
    }
  }

  // Handle rgb() format
  if (colorValue.startsWith("rgb(")) {
    const rgbValues = colorValue.match(/\d+/g);
    if (rgbValues && rgbValues.length >= 3) {
      const [r, g, b] = rgbValues.map(Number.parseInt);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        const hex = `#${r.toString(16).padStart(2, "0")}${g
          .toString(16)
          .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        return { rgb: colorValue, hex: hex.toUpperCase() };
      }
    }
  }

  // Handle hsl() format
  if (colorValue.startsWith("hsl(")) {
    // For now, return the original value for HSL
    return { rgb: colorValue, hex: colorValue };
  }

  // Handle named colors
  const namedColors: { [key: string]: string } = {
    black: "#000000",
    white: "#FFFFFF",
    red: "#FF0000",
    green: "#008000",
    blue: "#0000FF",
    yellow: "#FFFF00",
    cyan: "#00FFFF",
    magenta: "#FF00FF",
    gray: "#808080",
    grey: "#808080",
    transparent: "#000000",
  };

  if (namedColors[colorValue.toLowerCase()]) {
    return { rgb: colorValue, hex: namedColors[colorValue.toLowerCase()] };
  }

  // If we can't parse it, return the original value
  console.warn("Could not parse color value:", colorValue);
  return { rgb: colorValue, hex: colorValue };
}

/**
 * Gets basic font metrics using a canvas.
 * Note: Actual bounding box metrics might be more accurate but vary.
 * This provides a reasonable approximation.
 * @param fontFamily - The font family string.
 * @param fontSize - The font size string (e.g., "16px").
 * @returns FontMetrics object.
 */
function getFontMetrics(fontFamily: string, fontSize: string): FontMetrics {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return {
      ascent: 0,
      descent: 0,
      baseline: 0,
      xHeight: 0,
      capHeight: 0,
    };
  }

  ctx.font = `${fontSize} ${fontFamily}`;

  const metrics = ctx.measureText("x"); // 'x' for xHeight, often a good proxy

  return {
    ascent: metrics.actualBoundingBoxAscent || 0,
    descent: metrics.actualBoundingBoxDescent || 0,
    baseline: metrics.fontBoundingBoxAscent || 0,
    xHeight: metrics.actualBoundingBoxAscent || 0, // Using ascent as a proxy
    capHeight: metrics.actualBoundingBoxAscent || 0, // Using ascent as a proxy
  };
}

/**
 * Analyzes the text content of an element.
 * @param element - The HTML element.
 * @returns Text analysis properties.
 */
function analyzeTextContent(element: HTMLElement): {
  textContent: string;
  textLength: number;
  wordCount: number;
  lineCount: number;
} {
  const text = element.textContent?.trim() || "";
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  // Count lines based on displayed height and computed line-height if possible
  const computedStyle = window.getComputedStyle(element);
  const lineHeight = Number.parseFloat(computedStyle.lineHeight);
  const elementHeight = element.offsetHeight;
  let lineCount = 1;

  if (
    !isNaN(lineHeight) &&
    lineHeight > 0 &&
    elementHeight > 0 &&
    text.length > 0
  ) {
    lineCount = Math.max(1, Math.round(elementHeight / lineHeight));
  } else if (text.length > 0) {
    // Fallback for 'normal' line-height or zero height
    const tempDiv = document.createElement("div");
    tempDiv.style.whiteSpace = "pre";
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    tempDiv.style.width = computedStyle.width;
    tempDiv.style.fontFamily = computedStyle.fontFamily;
    tempDiv.style.fontSize = computedStyle.fontSize;
    tempDiv.textContent = text;
    document.body.appendChild(tempDiv);
    lineCount = Math.max(1, Math.round(tempDiv.offsetHeight / lineHeight));
    document.body.removeChild(tempDiv);
  }

  return {
    textContent: text,
    textLength: text.length,
    wordCount: words.length,
    lineCount: lineCount,
  };
}

/**
 * Determines font type and loading status.
 * @param fontFamily - The CSS font-family string.
 * @returns Font type and loading status.
 */
function analyzeFontType(fontFamily: string): {
  isWebSafe: boolean;
  isSystemFont: boolean;
  hasCustomFont: boolean;
  fontLoading: "loaded" | "loading" | "unknown";
} {
  const firstFont = fontFamily.split(",")[0].trim().replace(/['"]/g, "");
  const isWebSafe = WEB_SAFE_FONTS.some((font) =>
    firstFont.toLowerCase().includes(font.toLowerCase())
  );
  const isSystemFont =
    firstFont.includes("system-ui") ||
    firstFont.includes("-apple-system") ||
    firstFont.includes("BlinkMacSystemFont") ||
    firstFont.includes("Segoe UI") ||
    firstFont.includes("Roboto") ||
    firstFont.includes("Oxygen") ||
    firstFont.includes("Ubuntu") ||
    firstFont.includes("Cantarell");
  const hasCustomFont = !isWebSafe && !isSystemFont;

  let fontLoading: "loaded" | "loading" | "unknown" = "loaded";
  if (hasCustomFont) {
    // This is a basic check and might not be fully accurate for all scenarios.
    // For robust font loading status, consider FontFaceObserver or similar.
    try {
      // document.fonts.check returns true if the font is loaded and available
      // or if it's a system font that doesn't need loading.
      // It returns false if it's a web font still loading or not found.
      const fontCheck = document.fonts.check(`12px "${firstFont}"`);
      fontLoading = fontCheck ? "loaded" : "loading";
    } catch (e) {
      console.warn("Error checking font loading status:", e);
      fontLoading = "unknown";
    }
  }

  return { isWebSafe, isSystemFont, hasCustomFont, fontLoading };
}

/**
 * Extracts comprehensive font information from an HTML element.
 * @param element - The HTML element to inspect.
 * @returns FontInfo object.
 */
export function extractFontInfo(element: HTMLElement): FontInfo {
  const computedStyle = window.getComputedStyle(element);
  const fontFamily = computedStyle.fontFamily;
  const firstFont = fontFamily.split(",")[0].trim().replace(/['"]/g, "");
  const cssClasses = Array.from(element.classList);

  // Debug computed styles
  console.log("Computed color:", computedStyle.color);
  console.log("Computed backgroundColor:", computedStyle.backgroundColor);
  console.log("Element style color:", element.style.color);
  console.log("Element style backgroundColor:", element.style.backgroundColor);

  const fontMetrics = getFontMetrics(fontFamily, computedStyle.fontSize);
  const textAnalysis = analyzeTextContent(element);
  const fontType = analyzeFontType(fontFamily);

  return {
    elementType: element.tagName.toLowerCase(),
    id: element.id,
    className: element.className,
    cssClasses,
    fontFamily,
    renderedFont: firstFont,
    fontSize: computedStyle.fontSize,
    fontWeight: computedStyle.fontWeight,
    fontStyle: computedStyle.fontStyle,
    lineHeight: computedStyle.lineHeight,
    color: formatColorValue(computedStyle.color),
    backgroundColor: formatColorValue(computedStyle.backgroundColor),
    textAlign: computedStyle.textAlign,
    letterSpacing: computedStyle.letterSpacing,
    textTransform: computedStyle.textTransform,
    textDecoration: computedStyle.textDecoration,
    ...fontType,
    fontMetrics,
    ...textAnalysis,
  };
}

/**
 * Copies a given value to the clipboard.
 * @param value - The string to copy.
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    } else {
      // Fallback for older browsers or specific environments
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error("Failed to copy value:", error);
    return false;
  }
}

/**
 * Generates an enhanced CSS properties string for copying.
 * @param fontInfo - The FontInfo object.
 * @returns A formatted CSS string.
 */
export function generateCssProperties(fontInfo: FontInfo): string {
  const cssProperties = [
    `font-family: ${fontInfo.fontFamily};`,
    `font-size: ${fontInfo.fontSize};`,
    `font-weight: ${fontInfo.fontWeight};`,
    `color: ${fontInfo.color.hex};`,
  ];

  // Include element info for context
  cssProperties.push(`\n/* Element: <${fontInfo.elementType}${
    fontInfo.id ? ` id="${fontInfo.id}"` : ""
  }${fontInfo.className ? ` class="${fontInfo.className}"` : ""}
*/`);

  return cssProperties.join("\n");
}

/**
 * Interface for callbacks to update the UI.
 */
interface FontInspectorCallbacks {
  onFontInfoUpdate: (
    fontInfo: FontInfo | null,
    targetRect: DOMRect | null,
    lineReaderRect: {
      top: number;
      left: number;
      width: number;
      height: number;
    } | null,
    mouseEvent: MouseEvent
  ) => void;
  onCopySuccess: () => void;
  onDeactivate: () => void;
}

/**
 * Font Inspector Core Logic Class
 * Manages event listeners and extracts font data, then dispatches to UI.
 */
export class FontInspector {
  private isActive = false;
  private callbacks: FontInspectorCallbacks;

  private mouseMoveListener: ((e: MouseEvent) => void) | null = null;
  private clickListener: ((e: MouseEvent) => void) | null = null;
  private keyListener: ((e: KeyboardEvent) => void) | null = null;

  constructor(callbacks: FontInspectorCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Starts font inspection mode.
   */
  public startInspection(): void {
    if (this.isActive) return;

    this.isActive = true;
    console.log("🔍 uiScraper: Font inspection mode activated");

    this.mouseMoveListener = (e: MouseEvent) => this.handleMouseMove(e);
    this.clickListener = (e: MouseEvent) => this.handleClick(e);
    this.keyListener = (e: KeyboardEvent) => this.handleKeyPress(e);

    document.addEventListener("mousemove", this.mouseMoveListener);
    document.addEventListener("click", this.clickListener, true); // Use capture phase for click
    document.addEventListener("keydown", this.keyListener);
  }

  /**
   * Stops font inspection mode.
   */
  public stopInspection(): void {
    if (!this.isActive) return;

    this.isActive = false;
    console.log("🔍 uiScraper: Font inspection mode deactivated");

    // Inform UI to hide everything
    this.callbacks.onFontInfoUpdate(null, null, null, new MouseEvent(""));
    this.callbacks.onDeactivate();

    if (this.mouseMoveListener) {
      document.removeEventListener("mousemove", this.mouseMoveListener);
      this.mouseMoveListener = null;
    }

    if (this.clickListener) {
      document.removeEventListener("click", this.clickListener, true);
      this.clickListener = null;
    }

    if (this.keyListener) {
      document.removeEventListener("keydown", this.keyListener);
      this.keyListener = null;
    }
  }

  /**
   * Handles mouse movement to extract and dispatch font information.
   * @param e - The MouseEvent.
   */
  private handleMouseMove(e: MouseEvent): void {
    const targetElement = e.target as HTMLElement;

    // Check if the target element or any of its ancestors are part of the inspector UI
    if (targetElement.closest(".uiscraper-font-tooltip")) {
      this.callbacks.onFontInfoUpdate(null, null, null, e); // Hide tooltip if hovering over itself
      return;
    }

    const element = document.elementFromPoint(
      e.clientX,
      e.clientY
    ) as HTMLElement;

    if (
      element &&
      !element.id?.includes("uiscraper") &&
      !element.closest(".uiscraper-font-tooltip")
    ) {
      // Prevent default text selection behavior when hovering over elements
      // This can interfere with tooltip display.
      // e.preventDefault(); // Might be too aggressive, better handled by pointer-events: none on tooltip
      // e.stopPropagation(); // Avoids propagating to underlying elements if not wanted

      const fontInfo = extractFontInfo(element);
      const targetRect = element.getBoundingClientRect();

      // Calculate line reader position and size
      const computedStyle = window.getComputedStyle(element);
      const text = element.textContent?.trim() || "";
      const fontSize = Number.parseInt(computedStyle.fontSize);
      let lineHeight = Number.parseFloat(computedStyle.lineHeight);
      if (isNaN(lineHeight) || computedStyle.lineHeight === "normal") {
        lineHeight = Math.ceil(fontSize * 1.2); // Common 'normal' line-height factor
      }

      const relativeY = e.clientY - targetRect.top;
      const lineNumber = Math.max(
        0,
        Math.min(Math.floor(relativeY / lineHeight), fontInfo.lineCount - 1)
      ); // Ensure line number is within bounds
      const lineY = targetRect.top + lineNumber * lineHeight;

      const lines = text.split("\n");
      const currentLine = lines[lineNumber]?.trim() || ""; // Trim line content

      let lineWidth = targetRect.width;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx && currentLine) {
        ctx.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
        const textMetrics = ctx.measureText(currentLine);
        lineWidth = Math.min(textMetrics.width + 8, targetRect.width); // Add padding
      } else if (currentLine) {
        // Fallback if canvas is not available or line is empty but element has width
        lineWidth = Math.min(
          currentLine.length * (fontSize * 0.6),
          targetRect.width
        );
      } else {
        lineWidth = 0; // No text on line, no width
      }

      const lineReaderRect = {
        top: lineY,
        left: targetRect.left,
        width: lineWidth,
        height: lineHeight,
      };

      this.callbacks.onFontInfoUpdate(fontInfo, targetRect, lineReaderRect, e);
    } else {
      // If hovering over empty space or an element that shouldn't trigger the inspector
      this.callbacks.onFontInfoUpdate(null, null, null, e);
    }
  }

  /**
   * Handles click event to copy all CSS properties.
   * @param e - The MouseEvent.
   */
  private handleClick(e: MouseEvent): void {
    if (!this.isActive) return;

    const targetElement = e.target as HTMLElement;

    // Check if the click originated from a copyable property value within the tooltip
    if (targetElement.closest(".property-value")) {
      // Let the tooltip's internal click handler manage this copy
      return;
    }

    e.preventDefault(); // Prevent default click action (e.g., navigating links)
    e.stopPropagation(); // Stop propagation to prevent parent elements from also reacting

    const element = document.elementFromPoint(
      e.clientX,
      e.clientY
    ) as HTMLElement;

    if (
      element &&
      !element.id?.includes("uiscraper") &&
      !element.closest(".uiscraper-font-tooltip")
    ) {
      const fontInfo = extractFontInfo(element);
      const allCssProperties = generateCssProperties(fontInfo);

      copyToClipboard(allCssProperties).then((success) => {
        if (success) {
          console.log("Font properties copied to clipboard");
          this.callbacks.onCopySuccess(); // Inform UI about success
          setTimeout(() => {
            this.stopInspection(); // Deactivate after a short delay
          }, 800);
        }
      });
    }
  }

  /**
   * Handles key press (Escape to exit).
   * @param e - The KeyboardEvent.
   */
  private handleKeyPress(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.stopInspection();
    }
  }

  /**
   * Returns the active state of the inspector.
   * @returns True if inspection is active, false otherwise.
   */
  public isInspectionActive(): boolean {
    return this.isActive;
  }
}
