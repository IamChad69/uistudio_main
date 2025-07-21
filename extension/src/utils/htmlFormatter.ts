/**
 * HTML Formatter Utility
 * Handles HTML-specific formatting and transformations
 */

/**
 * Process HTML - cleaning and normalizing
 * @param html The HTML to process
 * @returns The processed HTML
 */
export function processHTML(html: string): string {
  // Clean up whitespace
  let processed = html.trim();

  // Normalize line endings
  processed = processed.replace(/\r\n/g, '\n');

  // Remove extra spaces between tags
  processed = processed.replace(/>\s+</g, '>\n<');

  return processed;
}

/**
 * Extract just the element HTML from a full representation
 * @param html The HTML to extract from
 * @returns The extracted HTML
 */
export function extractElementHTML(html: string): string {
  // If the HTML is already just an element, return it
  if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
    return html;
  }

  // Extract the body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    return bodyMatch[1].trim();
  }

  // If no body tag, return the original
  return html;
}

/**
 * Transform HTML to a component
 * @param html The HTML to transform
 * @param componentName The name of the component
 * @param asComponent Whether to wrap as a component or just return the HTML
 * @returns The transformed HTML
 */
export function transformToHTML(
  html: string,
  componentName: string = 'ScrapedComponent',
  asComponent: boolean = true
): string {
  // Process the HTML
  const processedHtml = processHTML(html);

  if (asComponent) {
    // Return as a component
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName}</title>
  <style>
    /* Add your styles here */
  </style>
</head>
<body>
${processedHtml
  .split('\n')
  .map(line => `  ${line}`)
  .join('\n')}
</body>
</html>`;
  } else {
    // Just return the processed HTML
    return processedHtml;
  }
}

/**
 * Create a representation of element data
 * @param elementData The element data to represent
 * @returns The HTML representation
 */
export function createHtmlRepresentation(elementData: Record<string, unknown>): string {
  // Extract the HTML from the element data
  const html = (elementData.outerHtml as string) || '';

  // Process the HTML
  return processHTML(html);
}
