/**
 * Element Highlighter Utility
 * Handles highlighting DOM elements during scraping
 */

// Class names for highlighted elements
const HIGHLIGHT_CLASS = 'uiscraper-highlight';
const PARENT_HIGHLIGHT_CLASS = 'uiscraper-parent-highlight';

// Style ID for the injected stylesheet
const STYLE_ID = 'uiscraper-styles';

// ID for the extract tooltip
const TOOLTIP_ID = 'uiscraper-extract-tooltip';

// Default highlight settings
let HIGHLIGHT_COLOR = '#6A78FC'; // Default to Avocado Alien
let HIGHLIGHT_COLOR_RGBA = 'rgba(106, 120, 252, 0.05)';
let PARENT_HIGHLIGHT_COLOR = '#6A78FC';
let BORDER_STYLE = 'solid';

// Load user preferences
function loadHighlightPreferences(): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.sync.get(['highlightColor', 'borderStyle'], result => {
      if (result.highlightColor) {
        HIGHLIGHT_COLOR = result.highlightColor;
        // Convert hex to rgba with 0.05 opacity
        const r = parseInt(result.highlightColor.slice(1, 3), 16);
        const g = parseInt(result.highlightColor.slice(3, 5), 16);
        const b = parseInt(result.highlightColor.slice(5, 7), 16);
        HIGHLIGHT_COLOR_RGBA = `rgba(${r}, ${g}, ${b}, 0.05)`;
        PARENT_HIGHLIGHT_COLOR = result.highlightColor;
      }

      if (result.borderStyle) {
        BORDER_STYLE = result.borderStyle;
      }

      resolve();
    });
  });
}

// Listen for settings changes
function setupSettingsListener(): void {
  window.addEventListener('uiscraper:settings-changed', (e: Event) => {
    const detail = (e as CustomEvent).detail;

    if (detail.highlightColor) {
      HIGHLIGHT_COLOR = detail.highlightColor;
      // Convert hex to rgba with 0.05 opacity
      const r = parseInt(detail.highlightColor.slice(1, 3), 16);
      const g = parseInt(detail.highlightColor.slice(3, 5), 16);
      const b = parseInt(detail.highlightColor.slice(5, 7), 16);
      HIGHLIGHT_COLOR_RGBA = `rgba(${r}, ${g}, ${b}, 0.05)`;
      PARENT_HIGHLIGHT_COLOR = detail.highlightColor;
    }

    if (detail.borderStyle) {
      BORDER_STYLE = detail.borderStyle;
    }

    // Update styles if already active
    if (document.getElementById(STYLE_ID)) {
      removeHighlightStyles();
      addHighlightStyles();
    }
  });
}

/**
 * Add CSS styles for element highlighting
 */
export async function addHighlightStyles(): Promise<void> {
  // Load user preferences first
  await loadHighlightPreferences();

  // Setup listener for settings changes
  setupSettingsListener();

  // If styles already exist, don't add again
  if (document.getElementById(STYLE_ID)) return;

  const outlineStyle =
    BORDER_STYLE === 'browser'
      ? `box-shadow: 0 0 0 1px ${HIGHLIGHT_COLOR} !important;`
      : `outline: 1px ${BORDER_STYLE} ${HIGHLIGHT_COLOR} !important;`;

  const parentOutlineStyle =
    BORDER_STYLE === 'browser'
      ? `box-shadow: 0 0 0 1px ${PARENT_HIGHLIGHT_COLOR} !important;`
      : `outline: 1px ${BORDER_STYLE === 'solid' ? 'dashed' : BORDER_STYLE} ${PARENT_HIGHLIGHT_COLOR} !important;`;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      ${outlineStyle}
      outline-offset: 1px !important;
      background-color: ${HIGHLIGHT_COLOR_RGBA} !important;
      cursor: crosshair !important;
      position: relative !important;
      z-index: 10 !important;
      transition: outline 0.15s ease-in-out, background-color 0.15s ease-in-out !important;
    }
    
    .${PARENT_HIGHLIGHT_CLASS} {
      ${parentOutlineStyle}
      outline-offset: 2px !important;
      position: relative !important;
      z-index: 5 !important;
      transition: outline 0.15s ease-in-out !important;
      opacity: 0.7 !important;
    }

    #${TOOLTIP_ID} {
      position: fixed;
      background-color: ${HIGHLIGHT_COLOR};
      color: white;
      padding: 6px 16px;
      border-radius: 50px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      z-index: 2147483647;
      pointer-events: none;
      transform: translate(10px, 10px);
      user-select: none;
      transition: opacity 0.2s ease-in-out;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Remove highlight styles
 */
export function removeHighlightStyles(): void {
  const styleElement = document.getElementById(STYLE_ID);
  if (styleElement) {
    styleElement.remove();
  }
}

/**
 * Create extract tooltip that follows the cursor
 */
export function createExtractTooltip(): void {
  // Remove any existing tooltip
  removeExtractTooltip();

  // Create the tooltip element
  const tooltip = document.createElement('div');
  tooltip.id = TOOLTIP_ID;
  tooltip.textContent = 'extract';
  tooltip.style.opacity = '1';

  // Add to the document
  document.body.appendChild(tooltip);

  // Listen for mouse movement to follow cursor
  document.addEventListener('mousemove', updateTooltipPosition);
}

/**
 * Update tooltip position to follow cursor
 */
function updateTooltipPosition(e: MouseEvent): void {
  const tooltip = document.getElementById(TOOLTIP_ID);
  if (tooltip) {
    tooltip.style.left = `${e.clientX}px`;
    tooltip.style.top = `${e.clientY}px`;
  }
}

/**
 * Remove extract tooltip
 */
export function removeExtractTooltip(): void {
  const tooltip = document.getElementById(TOOLTIP_ID);
  if (tooltip) {
    document.removeEventListener('mousemove', updateTooltipPosition);
    tooltip.remove();
  }
}

/**
 * Highlight a specific element
 */
export function highlightElement(element: HTMLElement): void {
  // Clear any existing highlights first to prevent flashing
  removeAllHighlights();

  // Apply new highlights
  element.classList.add(HIGHLIGHT_CLASS);

  // Highlight parent element if it exists and is not the body or html
  const parent = element.parentElement;
  if (parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML') {
    parent.classList.add(PARENT_HIGHLIGHT_CLASS);
  }
}

/**
 * Remove highlight from an element
 */
export function removeHighlight(element: HTMLElement): void {
  element.classList.remove(HIGHLIGHT_CLASS);

  // Remove parent highlight
  const parent = element.parentElement;
  if (parent) {
    parent.classList.remove(PARENT_HIGHLIGHT_CLASS);
  }
}

/**
 * Remove all highlights from the document
 */
export function removeAllHighlights(): void {
  // Remove all primary highlights
  const highlightedElements = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
  highlightedElements.forEach(element => {
    element.classList.remove(HIGHLIGHT_CLASS);
  });

  // Remove all parent highlights
  const parentHighlightedElements = document.querySelectorAll(`.${PARENT_HIGHLIGHT_CLASS}`);
  parentHighlightedElements.forEach(element => {
    element.classList.remove(PARENT_HIGHLIGHT_CLASS);
  });
}
