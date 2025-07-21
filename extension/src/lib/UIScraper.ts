import { createExtractTooltip } from "../utils/highlighter";
import {
  addHighlightStyles,
  removeHighlightStyles,
  highlightElement,
  removeHighlight,
  removeAllHighlights,
  removeExtractTooltip,
} from "../utils/highlighter";
import { convertToTailwind } from "../utils/tailwindConverter";
import { showClipboardNotification } from "../utils/notification";

import browser from "webextension-polyfill";
import { createHtmlRepresentation } from "../utils/htmlFormatter";

/**
 * Enhanced HTMLElement with iframe reference
 */
interface EnhancedHTMLElement extends HTMLElement {
  _parentIframe?: HTMLIFrameElement;
}

/**
 * UIScraper Class
 * Core functionality for element selection and data extraction
 */
export class UIScraper {
  private isActive = false;
  private highlightedElement: HTMLElement | null = null;
  private mouseMoveListener: ((e: MouseEvent) => void) | null = null;
  private clickListener: ((e: MouseEvent) => void) | null = null;
  private keyListener: ((e: KeyboardEvent) => void) | null = null;
  private removeFloatingButton: (() => void) | null = null;
  private onScraperStateChange?: (isActive: boolean) => void;
  // New: Set of external state change listeners
  private stateChangeListeners: Set<(isActive: boolean) => void> = new Set();

  constructor(
    onScraperStateChange?: (isActive: boolean) => void,
    initFloatingButton?: (
      onStartScraping: () => void,
      onStopScraping: () => void,
      isScrapingActive: boolean
    ) => () => void
  ) {
    this.onScraperStateChange = onScraperStateChange;

    // Add the constructor-provided callback to our listeners set if it exists
    if (onScraperStateChange) {
      this.stateChangeListeners.add(onScraperStateChange);
    }

    if (initFloatingButton) {
      this.removeFloatingButton = initFloatingButton(
        () => this.startScraping(),
        () => this.stopScraping(),
        this.isActive
      );
    }
  }

  /**
   * Add a state change listener to be notified when scraping starts/stops
   * @param listener Function to call with the new state (true=active, false=inactive)
   * @returns The listener function for convenience in removal
   */
  public onStateChange(
    listener: (isActive: boolean) => void
  ): (isActive: boolean) => void {
    this.stateChangeListeners.add(listener);
    return listener;
  }

  /**
   * Remove a previously added state change listener
   * @param listener The listener function to remove
   */
  public removeStateChangeListener(
    listener: (isActive: boolean) => void
  ): void {
    this.stateChangeListeners.delete(listener);
  }

  /**
   * Notify all registered listeners about a state change
   * @param isActive Current state of the scraper
   */
  private notifyStateChangeListeners(isActive: boolean): void {
    // Notify all registered listeners
    this.stateChangeListeners.forEach((listener) => {
      try {
        listener(isActive);
      } catch (error) {
        console.error("Error in UIScraper state change listener:", error);
      }
    });
  }

  /**
   * Returns current active state of the scraper
   */
  public getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Activate element selection mode
   */
  public startScraping(): void {
    if (this.isActive) return;

    this.isActive = true;
    console.log("🔍 uiScraper: Selection mode activated");

    // Create and add styles for highlighting
    addHighlightStyles();

    // Create extract tooltip
    createExtractTooltip();

    // Setup mouse move listener for element highlighting
    this.mouseMoveListener = (e: MouseEvent) => this.handleMouseMove(e);
    document.addEventListener("mousemove", this.mouseMoveListener);

    // Setup click listener for element selection
    this.clickListener = (e: MouseEvent) => this.handleClick(e);
    document.addEventListener("click", this.clickListener);

    // Setup key listener for cancellation (Escape key)
    this.keyListener = (e: KeyboardEvent) => this.handleKeyPress(e);
    document.addEventListener("keydown", this.keyListener);

    // Notify state change - use the new notification method
    this.notifyStateChangeListeners(this.isActive);
  }

  /**
   * Deactivate element selection mode
   */
  public stopScraping(): void {
    if (!this.isActive) return;

    this.isActive = false;
    console.log("🔍 uiScraper: Selection mode deactivated");

    // Remove all highlights
    removeAllHighlights();
    this.highlightedElement = null;

    // Remove extract tooltip
    removeExtractTooltip();

    // Remove event listeners
    if (this.mouseMoveListener) {
      document.removeEventListener("mousemove", this.mouseMoveListener);
    }

    if (this.clickListener) {
      document.removeEventListener("click", this.clickListener);
    }

    if (this.keyListener) {
      document.removeEventListener("keydown", this.keyListener);
    }

    // Remove highlight styles
    removeHighlightStyles();

    // Notify state change - use the new notification method
    this.notifyStateChangeListeners(this.isActive);
  }

  /**
   * Handle mouse movement to highlight elements
   */
  private handleMouseMove(e: MouseEvent): void {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    // Get element under cursor, checking iframes too
    const element = this.getElementFromPoint(e.clientX, e.clientY);
    if (element) {
      // Add highlight to current element (removeAllHighlights is called inside highlightElement utility)
      this.highlightElement(element as EnhancedHTMLElement);
    }
  }

  /**
   * Handle click to select an element
   */
  private handleClick(e: MouseEvent): void {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    if (this.highlightedElement) {
      // Extract and send data about the selected element
      const elementData = this.extractElementData(
        this.highlightedElement as EnhancedHTMLElement
      );
      console.log("🔍 uiScraper: Selected element data", elementData);

      // Copy element data to clipboard
      this.copyToClipboard(elementData);

      // Send data to background script
      browser.runtime.sendMessage({
        action: "elementSelected",
        data: elementData,
      });

      // Save as component
      this.saveAsComponent(elementData);

      // Stop scraping after selection
      this.stopScraping();
    }
  }

  /**
   * Handle key press events
   */
  private handleKeyPress(e: KeyboardEvent): void {
    // Cancel on Escape key
    if (e.key === "Escape") {
      this.stopScraping();
    }
  }

  /**
   * Highlight a specific element
   */
  private highlightElement(element: EnhancedHTMLElement): void {
    highlightElement(element);
    this.highlightedElement = element;
  }

  /**
   * Remove highlight from the current element
   */
  private removeHighlight(): void {
    if (this.highlightedElement) {
      removeHighlight(this.highlightedElement);
      this.highlightedElement = null;
    }
  }

  /**
   * Get element at coordinates, supporting iframe traversal
   */
  private getElementFromPoint(
    x: number,
    y: number
  ): EnhancedHTMLElement | null {
    // First try to get the element directly
    const element = document.elementFromPoint(x, y) as EnhancedHTMLElement;

    // If the element is an iframe, try to get the element inside the iframe
    if (element && element.tagName === "IFRAME") {
      try {
        const iframe = element as HTMLIFrameElement;

        // Get iframe position
        const rect = iframe.getBoundingClientRect();

        // Convert coordinates to iframe's coordinate system
        const iframeX = x - rect.left;
        const iframeY = y - rect.top;

        // Try to access content inside iframe - may fail due to same-origin policy
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;

        if (iframeDoc) {
          // Get element at position inside iframe
          const iframeElement = iframeDoc.elementFromPoint(
            iframeX,
            iframeY
          ) as EnhancedHTMLElement;

          if (iframeElement) {
            // Store reference to iframe for later extraction
            iframeElement._parentIframe = iframe;
            return iframeElement;
          }
        }
      } catch (error) {
        // If we can't access iframe content due to same-origin policy,
        // fall back to the iframe element itself
        console.log(
          "🔍 uiScraper: Cannot access iframe content due to same-origin policy"
        );
      }
    }

    return element;
  }

  /**
   * Extract relevant data from the selected element
   */
  private extractElementData(
    element: EnhancedHTMLElement
  ): Record<string, unknown> {
    // Check if this element is from an iframe
    const isFromIframe = element._parentIframe !== undefined;
    const parentIframe = element._parentIframe;

    // Get basic element properties
    const tagName = element.tagName.toLowerCase();
    const id = element.id;
    const classNames = element.className;
    const text = element.textContent?.trim() || "";

    // Get computed styles - use correct document context
    const elementDoc =
      isFromIframe && parentIframe
        ? parentIframe.contentDocument || parentIframe.contentWindow?.document
        : document;

    const computedStyle = elementDoc
      ? elementDoc.defaultView?.getComputedStyle(element)
      : window.getComputedStyle(element);

    const styles = computedStyle
      ? {
          width: computedStyle.width,
          height: computedStyle.height,
          color: computedStyle.color,
          backgroundColor: computedStyle.backgroundColor,
          fontSize: computedStyle.fontSize,
          fontFamily: computedStyle.fontFamily,
          padding: computedStyle.padding,
          margin: computedStyle.margin,
          border: computedStyle.border,
          display: computedStyle.display,
          position: computedStyle.position,
          borderRadius: computedStyle.borderRadius,
          fontWeight: computedStyle.fontWeight,
        }
      : {};

    // Apply special handling for buttons and button-like elements
    if (
      tagName === "button" ||
      (tagName === "a" &&
        computedStyle &&
        (computedStyle.display === "block" ||
          computedStyle.display === "flex" ||
          computedStyle.display === "inline-block"))
    ) {
      this.enhanceButtonStyles(element, computedStyle, styles);
    }

    // Improve font family by adding system font fallbacks
    this.enhanceFontFamily(styles);

    // Convert styles to Tailwind CSS classes
    const tailwindClasses = this.convertStylesToTailwind(styles);

    // Get element attributes
    const attributes: Record<string, string> = {};
    Array.from(element.attributes).forEach((attr) => {
      attributes[attr.name] = attr.value;
    });

    // Get XPath
    const xpath = this.getXPath(element, isFromIframe, parentIframe);

    // Get CSS selector
    const cssSelector = this.getCssSelector(
      element,
      isFromIframe,
      parentIframe
    );

    // Extract media queries and responsive styles - respecting iframe context
    const mediaQueries = this.extractMediaQueries(
      element,
      isFromIframe,
      parentIframe
    );

    // Clone the element for image processing to avoid modifying the original
    const clonedElement = element.cloneNode(true) as EnhancedHTMLElement;

    // Process image sources in the cloned element
    this.processImageSources(clonedElement, isFromIframe, parentIframe);

    return {
      tagName,
      id,
      classNames,
      text,
      attributes,
      styles,
      tailwindClasses,
      mediaQueries,
      xpath,
      cssSelector,
      innerHtml: clonedElement.innerHTML,
      outerHtml: clonedElement.outerHTML,
      isFromIframe,
      iframeSrc: isFromIframe && parentIframe ? parentIframe.src : undefined,
    };
  }

  /**
   * Process all image sources in an element to convert them to data URLs
   */
  private processImageSources(
    element: HTMLElement,
    isFromIframe = false,
    parentIframe?: HTMLIFrameElement
  ): void {
    // Process all img elements
    const images = element.querySelectorAll("img");

    images.forEach((img) => {
      const src = img.getAttribute("src");
      if (!src) return;

      // Skip images that are already data URLs
      if (src.startsWith("data:")) return;

      try {
        // Convert relative URLs to absolute URLs
        let absoluteUrl = this.resolveImageUrl(src, isFromIframe, parentIframe);

        // For relative paths that start with '/', use the origin as base
        if (src.startsWith("/")) {
          // Use appropriate base URL depending on context
          const baseUrl =
            isFromIframe && parentIframe && parentIframe.src
              ? new URL(parentIframe.src).origin
              : window.location.origin;

          // Create absolute URL
          absoluteUrl = `${baseUrl}${src}`;
        }

        // Replace the src with the absolute URL
        // This ensures that when the HTML is copied and viewed elsewhere,
        // the image links won't be broken and will point to the original source
        img.setAttribute("src", absoluteUrl);
      } catch (error) {
        console.error("🔍 uiScraper: Error processing image source", error);

        // If we can't resolve the URL, at least make it more visible in the output
        // by adding a comment attribute with the original path
        img.setAttribute("data-original-src", src);
      }
    });

    // Process background images in inline styles (just for common cases)
    const elementsWithBgStyle = element.querySelectorAll(
      '[style*="background"]'
    );
    elementsWithBgStyle.forEach((el) => {
      const style = (el as HTMLElement).style;
      const bgImage = style.backgroundImage;

      // Only process url() values
      if (bgImage && bgImage.includes("url(") && !bgImage.includes("data:")) {
        try {
          // Extract the URL from the background-image
          const urlMatch = /url\(['"]?([^'"()]+)['"]?\)/i.exec(bgImage);
          if (urlMatch && urlMatch[1]) {
            const imageUrl = urlMatch[1];

            // Resolve the URL
            const absoluteUrl = this.resolveImageUrl(
              imageUrl,
              isFromIframe,
              parentIframe
            );

            // Update the background-image property with the absolute URL
            style.backgroundImage = `url("${absoluteUrl}")`;
          }
        } catch (error) {
          console.error(
            "🔍 uiScraper: Error processing background image",
            error
          );
        }
      }
    });
  }

  /**
   * Resolve a relative image URL to an absolute URL
   */
  private resolveImageUrl(
    url: string,
    isFromIframe = false,
    parentIframe?: HTMLIFrameElement
  ): string {
    // If it's already an absolute URL, return it
    if (url.match(/^(https?:)?\/\//)) {
      return url;
    }

    try {
      // Handle different context for iframe content
      if (isFromIframe && parentIframe) {
        // For iframe content, resolve relative to the iframe's document
        const iframeDoc =
          parentIframe.contentDocument || parentIframe.contentWindow?.document;
        if (iframeDoc) {
          const iframeBase = new URL(iframeDoc.URL);
          return new URL(url, iframeBase).href;
        } else {
          // If we can't access the iframe document, try to resolve based on iframe src
          return new URL(url, new URL(parentIframe.src, window.location.href))
            .href;
        }
      } else {
        // For regular document, resolve relative to the current page
        return new URL(url, window.location.href).href;
      }
    } catch (error) {
      console.error("🔍 uiScraper: Error resolving image URL", error);
      return url; // Return the original URL if we can't resolve it
    }
  }

  /**
   * Generate XPath for an element
   */
  private getXPath(
    element: EnhancedHTMLElement,
    isFromIframe = false,
    parentIframe?: HTMLIFrameElement
  ): string {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    const paths: string[] = [];
    let current: Element | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling: Element | null = current;

      // Count matching siblings
      while (sibling) {
        if (
          sibling.nodeType === Node.ELEMENT_NODE &&
          sibling.nodeName === current.nodeName
        ) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }

      if (index > 1) {
        paths.unshift(`${current.nodeName.toLowerCase()}[${index}]`);
      } else {
        paths.unshift(current.nodeName.toLowerCase());
      }

      current = current.parentElement;
    }

    // Add iframe to path if element is inside an iframe
    if (isFromIframe && parentIframe) {
      // Get XPath of the iframe itself - cast to EnhancedHTMLElement to use our extended version
      const iframePath = this.getXPath(
        parentIframe as unknown as EnhancedHTMLElement
      );
      return `${iframePath}/html/${paths.join("/")}`;
    }

    return `/${paths.join("/")}`;
  }

  /**
   * Generate a CSS selector for the element
   */
  private getCssSelector(
    element: EnhancedHTMLElement,
    isFromIframe = false,
    parentIframe?: HTMLIFrameElement
  ): string {
    if (element.id) {
      return `#${element.id}`;
    }

    const parts: string[] = [];
    let current: Element | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.nodeName.toLowerCase();

      if (current.id) {
        selector = `#${current.id}`;
        parts.unshift(selector);
        break;
      } else if (current.className) {
        const classes = current.className.split(/\s+/).filter(Boolean);
        if (classes.length) {
          selector += `.${classes.join(".")}`;
        }
      }

      parts.unshift(selector);
      current = current.parentElement;
    }

    // Add iframe to selector if element is inside an iframe
    if (isFromIframe && parentIframe) {
      // Cast iframe to EnhancedHTMLElement to use our extended version
      const iframeSelector = this.getCssSelector(
        parentIframe as unknown as EnhancedHTMLElement
      );
      return `${iframeSelector} > iframe > ${parts.join(" > ")}`;
    }

    return parts.join(" > ");
  }

  /**
   * Extract media queries and their associated styles for the element
   */
  private extractMediaQueries(
    element: EnhancedHTMLElement,
    isFromIframe = false,
    parentIframe?: HTMLIFrameElement
  ): Record<string, Record<string, string>> {
    const mediaQueryMap: Record<string, Record<string, string>> = {};

    try {
      // Get the correct document context
      const doc =
        isFromIframe && parentIframe
          ? parentIframe.contentDocument || parentIframe.contentWindow?.document
          : document;

      if (!doc) return mediaQueryMap;

      // Get all styleSheets from the document
      const styleSheets = Array.from(doc.styleSheets);

      for (const sheet of styleSheets) {
        try {
          // Skip cross-origin stylesheets that can't be accessed due to CORS
          if (
            sheet.href &&
            new URL(sheet.href).origin !== window.location.origin
          ) {
            continue;
          }

          const cssRules = Array.from(sheet.cssRules || []);

          for (const rule of cssRules) {
            // Check for media query rules
            if (rule instanceof CSSMediaRule) {
              const mediaQueryText = rule.conditionText || rule.media.mediaText;
              const mediaRules = Array.from(rule.cssRules);

              // Check each rule inside the media query
              for (const mediaRule of mediaRules) {
                if (mediaRule instanceof CSSStyleRule) {
                  // Check if the rule applies to our element
                  const ruleSelector = mediaRule.selectorText;

                  if (
                    element.matches(ruleSelector) ||
                    this.checkSelectorAppliesInAncestry(element, ruleSelector)
                  ) {
                    // If this media query isn't in our map yet, add it
                    if (!mediaQueryMap[mediaQueryText]) {
                      mediaQueryMap[mediaQueryText] = {};
                    }

                    // Add all styles from this rule to our media query map
                    const style = mediaRule.style;
                    for (let i = 0; i < style.length; i++) {
                      const property = style[i];
                      mediaQueryMap[mediaQueryText][property] =
                        style.getPropertyValue(property);
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          // Silently continue if we can't access a stylesheet
          continue;
        }
      }
    } catch (error) {
      console.error("🔍 uiScraper: Error extracting media queries", error);
    }

    return mediaQueryMap;
  }

  /**
   * Check if a selector applies to an element or its ancestry
   */
  private checkSelectorAppliesInAncestry(
    element: EnhancedHTMLElement,
    selector: string
  ): boolean {
    const selectorParts = selector.split(/\s+/);
    const lastSelectorPart = selectorParts[selectorParts.length - 1];

    // If simple selector like ".class" or "#id", check if it matches directly
    if (selectorParts.length === 1) {
      return element.matches(selector);
    }

    // Check if the last part of the selector matches our element
    if (element.matches(lastSelectorPart)) {
      // Create a test element to check the full selector
      try {
        // If we can find any elements matching this selector, and our element is among them
        const matchingElements = Array.from(
          document.querySelectorAll(selector)
        );
        return matchingElements.includes(element);
      } catch (error) {
        // If the selector is invalid, skip it
        return false;
      }
    }

    return false;
  }

  /**
   * Copy element data to clipboard
   */
  private copyToClipboard(data: Record<string, unknown>): void {
    try {
      // Get the selected framework and auto-save setting
      browser.storage.local
        .get(["selected_framework", "auto_save", "create_as_component"])
        .then(async (result: Record<string, unknown>) => {
          const selectedFramework =
            (result.selected_framework as string) || "html";
          const createAsComponent = result.create_as_component !== false; // Default to true if not set

          // Get the HTML content
          const htmlContent = data.outerHtml as string;

          // Transform the HTML based on the selected framework
          let transformedContent = htmlContent;

          if (selectedFramework === "react") {
            // For React, convert to JSX
            const { convertHtmlToJsx, transformToReact } = await import(
              "../utils/jsxFormatter"
            );
            const jsx = convertHtmlToJsx(htmlContent);

            if (createAsComponent) {
              transformedContent = transformToReact(
                jsx,
                "ScrapedComponent",
                true
              );
            } else {
              transformedContent = jsx;
            }
          } else if (selectedFramework === "vue") {
            // For Vue, wrap in template
            transformedContent = `<template>
${htmlContent
  .split("\n")
  .map((line) => `  ${line}`)
  .join("\n")}
</template>

<script>
export default {
  name: 'ScrapedComponent'
}
</script>

<style scoped>
/* Add your styles here */
</style>`;
          } else if (selectedFramework === "svelte") {
            // For Svelte, wrap in script and style
            transformedContent = `<script>
  // Add your component logic here
</script>

${htmlContent}

<style>
  /* Add your styles here */
</style>`;
          }

          // Create an object to support more complex HTML structure in clipboard
          const clipboardItem = new ClipboardItem({
            "text/html": new Blob([transformedContent], { type: "text/html" }),
            "text/plain": new Blob([transformedContent], {
              type: "text/plain",
            }),
          });

          // Use clipboard API if available
          if (navigator.clipboard && navigator.clipboard.write) {
            navigator.clipboard
              .write([clipboardItem])
              .then(() => {
                console.log("🔍 uiScraper: Copied element to clipboard");
                showClipboardNotification(
                  `Element copied to clipboard as ${selectedFramework}!`
                );
              })
              .catch((error) => {
                console.error("🔍 uiScraper: Clipboard API failed", error);
                this.fallbackCopyToClipboard(transformedContent);
              });
          } else if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(transformedContent).catch(() => {
              this.fallbackCopyToClipboard(transformedContent);
            });
          } else {
            this.fallbackCopyToClipboard(transformedContent);
          }
        });
    } catch (error) {
      console.error("🔍 uiScraper: Failed to copy to clipboard", error);
    }
  }

  /**
   * Fallback method to copy text using execCommand
   */
  private fallbackCopyToClipboard(text: string): void {
    try {
      const textarea = document.createElement("textarea");
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      console.log("🔍 uiScraper: Copied element HTML to clipboard (fallback)");
      showClipboardNotification("Element HTML copied to clipboard!");
    } catch (error) {
      console.error("🔍 uiScraper: Fallback clipboard copy failed");
    }
  }

  /**
   * Create HTML representation of the element data
   */
  private createHtmlRepresentation(data: Record<string, unknown>): string {
    return createHtmlRepresentation(data);
  }

  /**
   * Convert camelCase to kebab-case for CSS properties
   */
  private camelToKebab(string: string): string {
    return string
      .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2")
      .toLowerCase();
  }

  /**
   * Escape HTML to safely display in pre tags
   */
  private escapeHtml(html: string): string {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Convert CSS styles to Tailwind CSS classes
   */
  private convertStylesToTailwind(
    styles: Record<string, string | undefined>
  ): string {
    // Filter out undefined values and convert to required type
    const validStyles: Record<string, string> = {};
    Object.entries(styles).forEach(([key, value]) => {
      if (value !== undefined) {
        validStyles[key] = value;
      }
    });

    return convertToTailwind(validStyles);
  }

  /**
   * Enhance styles specifically for buttons and button-like elements
   * @param element The button element
   * @param computedStyle The computed style of the element
   * @param styles The styles object to enhance
   */
  private enhanceButtonStyles(
    element: HTMLElement,
    computedStyle: CSSStyleDeclaration | undefined,
    styles: Record<string, string | undefined>
  ): void {
    if (!computedStyle) return;

    // Ensure background color is set for buttons (even if transparent)
    if (
      computedStyle.backgroundColor === "rgba(0, 0, 0, 0)" ||
      computedStyle.backgroundColor === "transparent"
    ) {
      styles.backgroundColor = "transparent";
    }

    // Extract border styles in more detail
    if (computedStyle.borderTopWidth !== "0px") {
      styles.borderTopWidth = computedStyle.borderTopWidth;
      styles.borderTopStyle = computedStyle.borderTopStyle;
      styles.borderTopColor = computedStyle.borderTopColor;
    }

    if (computedStyle.borderBottomWidth !== "0px") {
      styles.borderBottomWidth = computedStyle.borderBottomWidth;
      styles.borderBottomStyle = computedStyle.borderBottomStyle;
      styles.borderBottomColor = computedStyle.borderBottomColor;
    }

    if (computedStyle.borderLeftWidth !== "0px") {
      styles.borderLeftWidth = computedStyle.borderLeftWidth;
      styles.borderLeftStyle = computedStyle.borderLeftStyle;
      styles.borderLeftColor = computedStyle.borderLeftColor;
    }

    if (computedStyle.borderRightWidth !== "0px") {
      styles.borderRightWidth = computedStyle.borderRightWidth;
      styles.borderRightStyle = computedStyle.borderRightStyle;
      styles.borderRightColor = computedStyle.borderRightColor;
    }

    // Extract padding in more detail for buttons
    styles.paddingTop = computedStyle.paddingTop;
    styles.paddingBottom = computedStyle.paddingBottom;
    styles.paddingLeft = computedStyle.paddingLeft;
    styles.paddingRight = computedStyle.paddingRight;

    // Get box shadow
    if (computedStyle.boxShadow !== "none") {
      styles.boxShadow = computedStyle.boxShadow;
    }

    // Ensure position is set appropriately for buttons
    if (!styles.position || styles.position === "static") {
      styles.position = "relative";
    }

    // Get text alignment
    styles.textAlign = computedStyle.textAlign;

    // Get text decoration
    if (computedStyle.textDecoration !== "none") {
      styles.textDecoration = computedStyle.textDecoration;
    }
  }

  /**
   * Enhance font family by adding system font fallbacks
   * @param styles The styles object to enhance
   */
  private enhanceFontFamily(styles: Record<string, string | undefined>): void {
    if (styles.fontFamily) {
      const fontFaces = styles.fontFamily.split(",");
      const lastFont = fontFaces[fontFaces.length - 1].trim();
      if (lastFont !== "sans-serif") {
        fontFaces.push(
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        );
        styles.fontFamily = fontFaces.join(", ");
      }
    }
  }

  /**
   * Save the scraped element as a component
   * @param elementData The extracted element data
   */
  private async saveAsComponent(
    elementData: Record<string, unknown>
  ): Promise<void> {
    try {
      // Get the selected framework and auto-save setting
      const result = await browser.storage.local.get([
        "selected_framework",
        "auto_save",
      ]);
      const selectedFramework = (result.selected_framework as string) || "html";
      const autoSave = result.auto_save !== false; // Default to true if not set

      // If auto-save is disabled, don't save the component
      if (!autoSave) {
        console.log(
          "🔍 uiScraper: Auto-save is disabled, skipping component save"
        );
        return;
      }

      // Extract images from the element
      const htmlImages: string[] = [];
      const cssImages: string[] = [];

      // Process HTML images
      if (elementData.outerHtml) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = elementData.outerHtml as string;
        const images = tempDiv.querySelectorAll("img");
        images.forEach((img) => {
          const src = img.getAttribute("src");
          if (src && !src.startsWith("data:")) {
            htmlImages.push(src);
          }
        });
      }

      // Process CSS background images
      if (elementData.styles) {
        const styles = elementData.styles as Record<string, string>;
        Object.entries(styles).forEach(([key, value]) => {
          if (key.includes("background") && value.includes("url(")) {
            const urlMatch = /url\(['"]?([^'"()]+)['"]?\)/i.exec(value);
            if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith("data:")) {
              cssImages.push(urlMatch[1]);
            }
          }
        });
      }

      // Get dimensions
      const dimensions = elementData.styles
        ? `${(elementData.styles as Record<string, string>).width || "auto"} x ${(elementData.styles as Record<string, string>).height || "auto"}`
        : "auto x auto";

      // Prepare component data
      const componentData = {
        html: elementData.outerHtml as string,
        css: JSON.stringify(elementData.styles || {}),
        cssImages,
        htmlImages,
        dimensions,
        url: window.location.href,
        framework: selectedFramework, // Use the selected framework instead of hardcoding 'html'
      };

      // Save component using the existing service
      //const saveResult = await ComponentService.saveComponent(componentData);
      //console.log("🔍 uiScraper: Component saved successfully", saveResult);

      // Show notification
      showClipboardNotification(
        `Component saved successfully as ${selectedFramework}!`
      );
    } catch (error) {
      console.error("🔍 uiScraper: Failed to save component", error);
      showClipboardNotification("Failed to save component");
    }
  }
}
