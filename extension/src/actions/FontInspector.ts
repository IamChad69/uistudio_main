// src/fontInspector.ts

import { ColorValue, FontMetrics, FontInfo, Framework } from "../types"; // Import Framework
import { convertToTailwind } from "../utils/tailwindConverter"; // Import the existing Tailwind converter

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
 * Formats color values (RGB to HEX, and handles other CSS color formats).
 * @param colorValue - The color string (e.g., "rgb(255, 0, 0)", "#FF0000", "oklch(...)").
 * @returns An object containing both RGB and HEX representations, or the original value if unparsable to HEX.
 */
export function formatColorValue(colorValue: string): ColorValue {
  // Debug logging
  // console.log("formatColorValue input:", colorValue);

  if (!colorValue || colorValue === "initial" || colorValue === "inherit") {
    return { rgb: "transparent", hex: "#000000" };
  }

  // Handle named colors first for efficiency and common cases
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
    transparent: "rgba(0,0,0,0)",
  };

  const lowerCaseColorValue = colorValue.toLowerCase();
  if (namedColors[lowerCaseColorValue]) {
    const hexValue =
      namedColors[lowerCaseColorValue] === "rgba(0,0,0,0)"
        ? "#000000" // Transparent usually maps to black hex if needed
        : namedColors[lowerCaseColorValue];
    return { rgb: colorValue, hex: hexValue.toUpperCase() };
  }

  if (colorValue.startsWith("#")) {
    return { hex: colorValue, rgb: colorValue };
  }

  // Handle rgba() format
  if (colorValue.startsWith("rgba(")) {
    const rgbaMatch = colorValue.match(
      /rgba?\((\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?)\)/
    );
    if (rgbaMatch && rgbaMatch[1]) {
      const parts = rgbaMatch[1].split(",").map((p) => p.trim());
      const r = Number.parseInt(parts[0]);
      const g = Number.parseInt(parts[1]);
      const b = Number.parseInt(parts[2]);
      const a = parts.length > 3 ? Number.parseFloat(parts[3]) : 1;

      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        const hex =
          a === 1
            ? `#${r.toString(16).padStart(2, "0")}${g
                .toString(16)
                .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
            : colorValue; // If alpha, return rgba string for hex property as well
        return { rgb: colorValue, hex: hex.toUpperCase() };
      }
    }
  }

  // Handle rgb() format
  if (colorValue.startsWith("rgb(")) {
    const rgbMatch = colorValue.match(
      /rgb?\((\s*\d+\s*,\s*\d+\s*,\s*\d+\s*)\)/
    );
    if (rgbMatch && rgbMatch[1]) {
      const parts = rgbMatch[1].split(",").map((p) => p.trim());
      const r = Number.parseInt(parts[0]);
      const g = Number.parseInt(parts[1]);
      const b = Number.parseInt(parts[2]);

      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        const hex = `#${r.toString(16).padStart(2, "0")}${g
          .toString(16)
          .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        return { rgb: colorValue, hex: hex.toUpperCase() };
      }
    }
  }

  // Handle newer CSS color formats (e.g., hsl, oklch, lab) without converting to hex for now.
  // The UI can display these directly.
  if (
    colorValue.startsWith("hsl(") ||
    colorValue.startsWith("hsla(") ||
    colorValue.startsWith("oklch(") ||
    colorValue.startsWith("lab(")
  ) {
    return { rgb: colorValue, hex: colorValue }; // Return original value for both
  }

  // If we can't parse it, return the original value for both rgb and hex.
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
  const lineHeightStr = computedStyle.lineHeight;
  let lineHeight = Number.parseFloat(lineHeightStr);
  const elementHeight = element.offsetHeight;
  let lineCount = 1;

  // Attempt to parse line-height correctly (can be 'normal' or unitless)
  if (isNaN(lineHeight) || lineHeight <= 0) {
    const fontSize = Number.parseFloat(computedStyle.fontSize);
    lineHeight = fontSize * 1.2; // Common fallback for 'normal'
  }

  if (elementHeight > 0 && text.length > 0) {
    lineCount = Math.max(1, Math.round(elementHeight / lineHeight));
  } else if (text.length > 0) {
    // Fallback for 'normal' line-height or zero height if element doesn't render directly
    const tempDiv = document.createElement("div");
    tempDiv.style.whiteSpace = "pre-wrap"; // Important for line counting
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    tempDiv.style.width = computedStyle.width;
    tempDiv.style.fontFamily = computedStyle.fontFamily;
    tempDiv.style.fontSize = computedStyle.fontSize;
    tempDiv.style.lineHeight = computedStyle.lineHeight; // Inherit computed line-height
    tempDiv.textContent = text;
    document.body.appendChild(tempDiv);
    if (tempDiv.offsetHeight > 0 && lineHeight > 0) {
      lineCount = Math.max(1, Math.round(tempDiv.offsetHeight / lineHeight));
    } else {
      // Fallback for very short or non-visible lines
      lineCount = text.split("\n").length;
    }
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
  const elementClassName = element.className || ""; // Ensure className is always a string
  const cssClasses = Array.from(element.classList);

  // Debug computed styles (keep these if useful for your debugging)
  // console.log("Computed color:", computedStyle.color);
  // console.log("Computed backgroundColor:", computedStyle.backgroundColor);
  // console.log("Element style color:", element.style.color);
  // console.log("Element style backgroundColor:", element.style.backgroundColor);

  const fontMetrics = getFontMetrics(fontFamily, computedStyle.fontSize);
  const textAnalysis = analyzeTextContent(element);
  const fontType = analyzeFontType(fontFamily);

  return {
    elementType: element.tagName.toLowerCase(),
    id: element.id,
    className: elementClassName, // Use the safely handled className
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
 * Converts various CSS properties from FontInfo into Tailwind CSS classes and/or inline styles.
 * @param fontInfo - The FontInfo object.
 * @param framework - The target framework for the output (e.g., "react" for JSX className).
 * @returns An object containing `tailwindClasses` (string) and `inlineStyles` (string).
 */
export function cssToTailwind(
  fontInfo: FontInfo,
  framework: Framework = "react"
): { tailwindClasses: string; inlineStyles: string } {
  // Convert FontInfo to a style map that the existing tailwindConverter can handle
  const styleMap: Record<string, string> = {
    color: fontInfo.color.hex,
    backgroundColor: fontInfo.backgroundColor.hex,
    fontSize: fontInfo.fontSize,
    fontFamily: fontInfo.fontFamily,
    fontWeight: fontInfo.fontWeight,
    fontStyle: fontInfo.fontStyle,
    textAlign: fontInfo.textAlign,
    textTransform: fontInfo.textTransform,
    textDecoration: fontInfo.textDecoration,
    lineHeight: fontInfo.lineHeight,
    letterSpacing: fontInfo.letterSpacing,
  };

  // Use the existing tailwindConverter to get the classes
  const tailwindClasses = convertToTailwind(styleMap);

  // For any properties that couldn't be converted to Tailwind classes,
  // we'll keep them as inline styles
  const inlineStyles: string[] = [];

  // Check if any custom fonts need to be kept as inline styles
  if (!fontInfo.isWebSafe && !fontInfo.isSystemFont) {
    inlineStyles.push(`font-family: ${fontInfo.fontFamily};`);
  }

  // Add any other properties that might not have been converted
  if (
    fontInfo.textDecoration !== "none" &&
    !tailwindClasses.includes("underline") &&
    !tailwindClasses.includes("line-through")
  ) {
    inlineStyles.push(`text-decoration: ${fontInfo.textDecoration};`);
  }

  return {
    tailwindClasses,
    inlineStyles: inlineStyles.join(" "),
  };
}

/**
 * Generates an enhanced code snippet (JSX with Tailwind or CSS properties).
 *
 * @param fontInfo - The FontInfo object.
 * @param outputType - The desired output format ("tailwind-jsx" or "css").
 * @returns A formatted code string.
 *
 * @example
 * // Generate CSS output
 * const cssOutput = generateCodeSnippet(fontInfo, "css");
 *
 * // Generate Tailwind JSX output
 * const jsxOutput = generateCodeSnippet(fontInfo, "tailwind-jsx");
 *
 * // The output type can be determined by user preferences:
 * const preferredFramework = await FontInspector.getPreferredFramework();
 * const outputType = preferredFramework === "react" ? "tailwind-jsx" : "css";
 * const snippet = generateCodeSnippet(fontInfo, outputType);
 */
export function generateCodeSnippet(
  fontInfo: FontInfo,
  outputType: "tailwind-jsx" | "css" = "css" // Default to CSS for now
): string {
  if (outputType === "css") {
    // Existing CSS properties generation
    const cssProperties = [
      `font-family: ${fontInfo.fontFamily};`,
      `font-size: ${fontInfo.fontSize};`,
      `font-weight: ${fontInfo.fontWeight};`,
      `color: ${fontInfo.color.hex};`,
    ];

    // Add other relevant properties if they are not default
    if (fontInfo.fontStyle !== "normal") {
      cssProperties.push(`font-style: ${fontInfo.fontStyle};`);
    }
    if (fontInfo.lineHeight !== "normal") {
      cssProperties.push(`line-height: ${fontInfo.lineHeight};`);
    }
    if (
      fontInfo.backgroundColor.hex !== "#000000" &&
      fontInfo.backgroundColor.rgb !== "transparent"
    ) {
      cssProperties.push(`background-color: ${fontInfo.backgroundColor.rgb};`);
    }
    if (fontInfo.textAlign !== "start") {
      // 'start' is common default, adjust as needed
      cssProperties.push(`text-align: ${fontInfo.textAlign};`);
    }
    if (fontInfo.letterSpacing !== "normal") {
      cssProperties.push(`letter-spacing: ${fontInfo.letterSpacing};`);
    }
    if (fontInfo.textTransform !== "none") {
      cssProperties.push(`text-transform: ${fontInfo.textTransform};`);
    }
    if (fontInfo.textDecoration !== "none solid rgb(0, 0, 0)") {
      // Default can be complex
      cssProperties.push(`text-decoration: ${fontInfo.textDecoration};`);
    }

    // Include element info for context, ensuring className is handled gracefully
    const classAttr = fontInfo.className
      ? ` class="${fontInfo.className}"`
      : "";
    const idAttr = fontInfo.id ? ` id="${fontInfo.id}"` : "";

    // Sort CSS properties for consistent output
    cssProperties.sort();

    return `/* Element: <${fontInfo.elementType}${idAttr}${classAttr}>
*/
${cssProperties.join("\n")}`;
  } else if (outputType === "tailwind-jsx") {
    const { tailwindClasses, inlineStyles } = cssToTailwind(fontInfo);

    let elementString = `<${fontInfo.elementType}`;

    // Add ID if present
    if (fontInfo.id) {
      elementString += ` id="${fontInfo.id}"`;
    }

    // Add original CSS classes if present
    if (fontInfo.cssClasses && fontInfo.cssClasses.length > 0) {
      elementString += ` data-original-classes="${fontInfo.cssClasses.join(" ")}"`; // Store original for reference
    }

    // Add Tailwind classes
    if (tailwindClasses) {
      // Preserve existing className if any, or overwrite for simplicity
      // For merging existing classes, you'd need the original element's classes.
      elementString += ` className="${tailwindClasses}"`;
    }

    // Add inline styles if any remaining
    if (inlineStyles) {
      // In JSX, inline styles are objects. We need to convert "prop: value;" to { prop: "value" }
      const styleObject = inlineStyles
        .split(";")
        .filter((style) => style.trim())
        .reduce((acc: { [key: string]: string }, style: string) => {
          const [prop, value] = style.split(":").map((s: string) => s.trim());
          if (prop && value) {
            // Convert kebab-case to camelCase for JSX style objects
            const camelCaseProp = prop.replace(/-./g, (x: string) =>
              x[1].toUpperCase()
            );
            acc[camelCaseProp] = value.replace(/;$/, ""); // Remove trailing semicolon
          }
          return acc;
        }, {});

      if (Object.keys(styleObject).length > 0) {
        elementString += ` style={${JSON.stringify(styleObject)}}`;
      }
    }

    elementString += `>${fontInfo.textContent ? fontInfo.textContent : ""}</${fontInfo.elementType}>`;

    return elementString;
  }

  return ""; // Fallback
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
    this.clickListener = async (e: MouseEvent) => await this.handleClick(e);
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
    // The FontTooltip should have a class like 'uiscraper-font-tooltip'
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
      !element.id?.includes("uiscraper") && // Avoid internal UI elements by ID
      !element.closest(".uiscraper-font-tooltip") // Avoid internal UI elements by class
    ) {
      const fontInfo = extractFontInfo(element);
      const targetRect = element.getBoundingClientRect();

      // Calculate line reader position and size
      const computedStyle = window.getComputedStyle(element);
      const text = element.textContent?.trim() || "";
      const fontSize = Number.parseFloat(computedStyle.fontSize);
      let lineHeight = Number.parseFloat(computedStyle.lineHeight);
      if (isNaN(lineHeight) || computedStyle.lineHeight === "normal") {
        lineHeight = Math.ceil(fontSize * 1.2); // Common 'normal' line-height factor
      }
      if (lineHeight <= 0) {
        // Ensure lineHeight is positive to prevent division by zero
        lineHeight = fontSize || 16; // Fallback to font size or a default if still zero
      }

      const relativeY = e.clientY - targetRect.top;
      const lineNumber = Math.max(
        0,
        Math.min(Math.floor(relativeY / lineHeight), fontInfo.lineCount - 1)
      );
      const lineY = targetRect.top + lineNumber * lineHeight;

      const lines = text.split("\n");
      const currentLine = lines[lineNumber]?.trim() || "";

      let lineWidth = targetRect.width;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx && currentLine) {
        ctx.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
        const textMetrics = ctx.measureText(currentLine);
        lineWidth = Math.min(textMetrics.width + 8, targetRect.width); // Add padding, cap at element width
      } else if (currentLine) {
        // Fallback if canvas is not available, estimate width
        lineWidth = Math.min(
          currentLine.length * (fontSize * 0.6), // Rough estimation
          targetRect.width
        );
      } else {
        lineWidth = 0; // No text on line, no width
      }
      // Ensure minimum width for visibility if desired
      lineWidth = Math.max(lineWidth, 5); // Example: ensure at least 5px width

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
   * Handles click event to copy all CSS properties or Tailwind JSX.
   * @param e - The MouseEvent.
   */
  private async handleClick(e: MouseEvent): Promise<void> {
    if (!this.isActive) return;

    const targetElement = e.target as HTMLElement;

    // Check if the click originated from a copyable property value within the tooltip
    // Assuming .property-value is a class on clickable elements inside your tooltip
    if (targetElement.closest(".property-value")) {
      // Let the tooltip's internal click handler manage this copy
      return;
    }

    e.preventDefault(); // Prevent default click action (e.g., navigating links, text selection)
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

      // Try to get preferred framework from storage, default to CSS
      let outputType: "tailwind-jsx" | "css" = "css";

      try {
        // Check if we can access chrome.storage
        if (typeof chrome !== "undefined" && chrome.storage) {
          const result = await chrome.storage.local.get(["preferredFramework"]);
          const preferredFramework = result.preferredFramework as Framework;

          // If user prefers React, use Tailwind JSX output
          if (preferredFramework === "react") {
            outputType = "tailwind-jsx";
          }
        }
      } catch (error) {
        console.warn("Could not get preferred framework from storage:", error);
        // Fallback to CSS output
      }

      const codeSnippet = generateCodeSnippet(fontInfo, outputType);

      copyToClipboard(codeSnippet).then((success) => {
        if (success) {
          console.log(
            `${outputType === "tailwind-jsx" ? "Tailwind JSX" : "CSS"} properties copied to clipboard`
          );
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

  /**
   * Gets the preferred framework from storage.
   * @returns Promise that resolves to the preferred framework or null if not set.
   */
  public static async getPreferredFramework(): Promise<Framework | null> {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get(["preferredFramework"]);
        return (result.preferredFramework as Framework) || null;
      }
    } catch (error) {
      console.warn("Could not get preferred framework from storage:", error);
    }
    return null;
  }

  /**
   * Sets the preferred framework in storage.
   * @param framework - The framework to set as preferred.
   */
  public static async setPreferredFramework(
    framework: Framework
  ): Promise<void> {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        await chrome.storage.local.set({ preferredFramework: framework });
      }
    } catch (error) {
      console.warn("Could not set preferred framework in storage:", error);
    }
  }
}
