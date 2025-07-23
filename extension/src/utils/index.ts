export {
  addHighlightStyles,
  removeHighlightStyles,
  highlightElement,
  removeHighlight,
  removeAllHighlights,
  createExtractTooltip,
  removeExtractTooltip,
} from "./highlighter";

export { logger } from "./logger";

// Export HTML formatter utilities
export {
  processHTML as processHtmlFormat,
  extractElementHTML,
  transformToHTML,
  createHtmlRepresentation,
} from "./htmlFormatter";

// Export JSX formatter utilities
export {
  processHTML as processJsxFormat,
  convertHtmlToJsx,
  transformToReact,
} from "./jsxFormatter";

// Export notification utilities
export { showNotification, showClipboardNotification } from "./notification";

// Export clipboard utilities
export { copyToClipboard, formatComponentForCopy } from "./clipboard";
