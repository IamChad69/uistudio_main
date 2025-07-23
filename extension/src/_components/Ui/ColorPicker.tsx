import React, { useState, useEffect, useRef, useCallback } from "react";

interface ColorPickerProps {
  isActive: boolean;
  onClose: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ isActive, onClose }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // Initial color might be transparent or a default grey for visual clarity
  const [currentColor, setCurrentColor] = useState<string>("#888888");
  const [displayColor, setDisplayColor] = useState<string>("#888888"); // Color shown in UI
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const magnifierRef = useRef<HTMLDivElement | null>(null);

  // Helper to convert RGB to HEX
  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  }, []);

  // Helper to convert RGB/RGBA string to HEX
  const convertToHex = useCallback(
    (color: string): string => {
      const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/;
      const match = color.match(rgbRegex);

      if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        // Ensure alpha is not 0 for transparency, although getComputedStyle usually gives opaque RGB
        return rgbToHex(r, g, b);
      }

      if (color.startsWith("#")) {
        // Handle shorthand hex like #FFF
        if (color.length === 4) {
          return (
            "#" +
            color[1] +
            color[1] +
            color[2] +
            color[2] +
            color[3] +
            color[3]
          ).toUpperCase();
        }
        return color.toUpperCase();
      }

      // If it's a named color or 'transparent', we might not be able to get a solid hex
      // For simplicity, return a default transparent color or black.
      // Ideally, you'd want a comprehensive named color to hex map.
      if (color === "transparent") {
        return "#FFFFFF00"; // Transparent White
      }
      return "#000000"; // Default to black if unknown
    },
    [rgbToHex]
  );

  // Sample color at a specific point - made useCallback for dependencies
  const sampleColorAtPoint = useCallback(
    (x: number, y: number) => {
      let sampledHexColor = "";
      try {
        const overlay = document.getElementById("colorpicker-overlay");

        // Temporarily hide our own UI elements
        if (overlay) overlay.style.pointerEvents = "none"; // Disable overlay interaction
        if (pickerRef.current) pickerRef.current.style.display = "none";
        if (magnifierRef.current) magnifierRef.current.style.display = "none";

        // Get element under cursor
        const element = document.elementFromPoint(x, y);

        // Restore our UI elements immediately
        if (overlay) overlay.style.pointerEvents = "auto"; // Re-enable overlay interaction
        if (pickerRef.current) pickerRef.current.style.display = "block";
        if (magnifierRef.current) magnifierRef.current.style.display = "block";

        if (!element) return;

        // Skip if it's our own UI element (after making them visible again)
        // This check might be redundant if the overlay is correctly handled, but good for safety.
        if (
          pickerRef.current?.contains(element as Node) ||
          magnifierRef.current === element
        ) {
          return;
        }

        const style = window.getComputedStyle(element);

        // Prioritize background color if it's opaque
        if (
          style.backgroundColor &&
          style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
          style.backgroundColor !== "transparent"
        ) {
          sampledHexColor = convertToHex(style.backgroundColor);
        }
        // Then try border color if a border exists and is visible
        else if (
          style.borderColor &&
          style.borderWidth &&
          style.borderWidth !== "0px" &&
          parseInt(style.borderWidth) > 0
        ) {
          sampledHexColor = convertToHex(style.borderColor);
        }
        // Finally try text color
        else if (style.color) {
          sampledHexColor = convertToHex(style.color);
        }

        // Try sampling from images if the element is an image
        if (element instanceof HTMLImageElement) {
          const rect = element.getBoundingClientRect();
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            canvas.width = 1;
            canvas.height = 1;

            const sourceX = x - rect.left;
            const sourceY = y - rect.top;

            const scaleX = element.naturalWidth / rect.width;
            const scaleY = element.naturalHeight / rect.height;

            try {
              ctx.drawImage(
                element,
                Math.floor(sourceX * scaleX),
                Math.floor(sourceY * scaleY),
                1,
                1,
                0,
                0,
                1,
                1
              );

              const pixelData = ctx.getImageData(0, 0, 1, 1).data;
              if (pixelData[3] > 0) {
                // If the pixel is not fully transparent
                sampledHexColor = rgbToHex(
                  pixelData[0],
                  pixelData[1],
                  pixelData[2]
                );
              }
            } catch (e) {
              console.warn(
                "Failed to sample image pixel (likely CORS or image not loaded):",
                e
              );
              // Fallback to computed style if image sampling fails
              if (sampledHexColor === "" && style.color) {
                sampledHexColor = convertToHex(style.color);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error sampling color:", error);
      } finally {
        if (sampledHexColor && sampledHexColor !== "#000000") {
          setCurrentColor(sampledHexColor);
          setDisplayColor(sampledHexColor);
        }
      }
    },
    [convertToHex, rgbToHex]
  );

  // Process color picker clicks (copying color) - made useCallback
  const processColorPickerClick = useCallback(
    async (x: number, y: number) => {
      // Re-sample the color at the click point just before copying
      // This ensures we have the most up-to-date color for the copy action.
      sampleColorAtPoint(x, y);

      // We'll use the 'currentColor' state which is updated by sampleColorAtPoint
      // Wait a tiny bit for the state to definitely update, or pass the color directly if possible
      await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay

      const colorToCopy = currentColor; // Use the state which should be updated now

      if (!colorToCopy || colorToCopy === "#000000") {
        onClose();
        return;
      }

      try {
        await navigator.clipboard.writeText(colorToCopy);
        console.log("Color copied via Clipboard API:", colorToCopy);
        //showColorNotification(`Color copied: ${colorToCopy}`);
      } catch (clipboardError) {
        console.error("Clipboard API failed, trying fallback:", clipboardError);

        try {
          const textArea = document.createElement("textarea");
          textArea.value = colorToCopy;
          textArea.style.position = "fixed";
          textArea.style.left = "0";
          textArea.style.top = "0";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const success = document.execCommand("copy");
          document.body.removeChild(textArea);

          if (success) {
            console.log("Color copied via execCommand fallback:", colorToCopy);
            //showColorNotification(`Color copied: ${colorToCopy}`);
          } else {
            throw new Error("execCommand copy failed");
          }
        } catch (fallbackError) {
          console.error("All copy methods failed:", fallbackError);
          //showColorNotification(`Failed to copy color: ${colorToCopy}`);
        }
      } finally {
        // Always close the picker after an attempt to copy
        onClose();
      }
    },
    [sampleColorAtPoint, currentColor, onClose] // currentColor is a dependency here
  );

  // Initialize the color picker and create overlay/magnifier
  useEffect(() => {
    if (!isActive) return;

    // Create magnifier (only once when active)
    let currentMagnifier = magnifierRef.current;
    if (!currentMagnifier) {
      currentMagnifier = document.createElement("div");
      currentMagnifier.style.position = "fixed";
      currentMagnifier.style.width = "24px";
      currentMagnifier.style.height = "24px";
      currentMagnifier.style.border = "2px solid white";
      currentMagnifier.style.borderRadius = "50%";
      currentMagnifier.style.pointerEvents = "none";
      currentMagnifier.style.zIndex = "2147483646";
      currentMagnifier.style.boxShadow = "0 0 4px rgba(0, 0, 0, 0.5)";
      currentMagnifier.style.background = displayColor; // Initialize with display color
      document.body.appendChild(currentMagnifier);
      magnifierRef.current = currentMagnifier;
    } else {
      currentMagnifier.style.display = "block"; // Ensure it's visible if already exists
    }

    // Create an overlay to capture clicks and prevent interaction with page elements
    let overlay = document.getElementById("colorpicker-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "colorpicker-overlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.zIndex = "2147483645"; // High but below magnifier and UI
      overlay.style.cursor = "crosshair";
      overlay.style.backgroundColor = "transparent"; // Make it invisible
      document.body.appendChild(overlay);
    } else {
      overlay.style.display = "block"; // Ensure it's visible if already exists
    }

    const handleOverlayClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      processColorPickerClick(e.clientX, e.clientY);
    };

    overlay.addEventListener("click", handleOverlayClick);

    // Change cursor for entire document
    document.body.style.cursor = "crosshair";

    return () => {
      // Cleanup
      if (magnifierRef.current) {
        magnifierRef.current.style.display = "none"; // Just hide it, don't remove if it's reused
      }

      const existingOverlay = document.getElementById("colorpicker-overlay");
      if (existingOverlay) {
        existingOverlay.removeEventListener("click", handleOverlayClick);
        existingOverlay.style.display = "none"; // Just hide it
      }

      // Reset cursor
      document.body.style.cursor = "default";
    };
  }, [isActive, processColorPickerClick, displayColor]); // Added displayColor as dependency

  // Handle mouse movement and color sampling
  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Update position for the color picker UI
      setPosition({
        x: e.clientX + 20,
        y: e.clientY + 20,
      });

      // Position the magnifier
      if (magnifierRef.current) {
        magnifierRef.current.style.top = `${e.clientY - 12}px`;
        magnifierRef.current.style.left = `${e.clientX - 12}px`;
      }

      // Sample color at cursor position for continuous feedback
      sampleColorAtPoint(e.clientX, e.clientY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Add event listeners to the document for full screen tracking
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);

    // Update magnifier background when displayColor changes
    if (magnifierRef.current) {
      magnifierRef.current.style.backgroundColor = displayColor;
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, onClose, sampleColorAtPoint, displayColor]); // displayColor is a dependency

  // Effect to update magnifier's background when displayColor changes
  useEffect(() => {
    if (magnifierRef.current) {
      magnifierRef.current.style.backgroundColor = displayColor;
    }
  }, [displayColor]);

  // Update displayColor when currentColor changes
  useEffect(() => {
    setDisplayColor(currentColor);
  }, [currentColor]);

  if (!isActive) return null;

  return (
    <div
      ref={pickerRef}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 2147483647,
        pointerEvents: "none", // Critical for allowing interaction with underlying elements
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          pointerEvents: "auto", // Allows interaction with the picker UI itself
          border: "1px solid rgba(0, 0, 0, 0.05)",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "10px",
          gap: "12px",
          maxWidth: "240px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            backgroundColor: displayColor, // Use displayColor here
            borderRadius: "4px",
            flexShrink: 0,
            border: "1px solid rgba(0, 0, 0, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              borderRadius: "2px",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              color: "#333",
              marginBottom: "4px",
            }}
          >
            {displayColor}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#777",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 6L18 9M18 9L15 12M18 9H10.5C8.01472 9 6 11.0147 6 13.5C6 15.9853 8.01472 18 10.5 18H15"
                stroke="#777"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Click to copy
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
