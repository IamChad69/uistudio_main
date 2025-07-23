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
 * Formats component code for copying to clipboard
 */
export function formatComponentForCopy(
  componentCode: string,
  componentName: string
): string {
  // Remove any imports that reference @/ (since these won't work in a standalone context)
  const cleanedCode = componentCode
    .split("\n")
    .filter((line) => {
      // Keep lines that don't import from @/ paths
      if (line.trim().startsWith("import") && line.includes("@/")) {
        return false;
      }
      return true;
    })
    .join("\n");

  return `// ${componentName}.tsx
${cleanedCode}`;
}
