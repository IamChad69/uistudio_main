/**
 * JSX Formatter Utility
 * Handles JSX-specific formatting and transformations
 */

/**
 * Process HTML to JSX format
 * Converts HTML to JSX-compatible format
 */
export function processHTML(html: string): string {
  return convertHtmlToJsx(html);
}

/**
 * Convert HTML to JSX format
 * Handles specific conversions needed for React compatibility
 */
export function convertHtmlToJsx(html: string): string {
  // Replace class= with className=
  let jsx = html.replace(/class=/g, 'className=');

  // Convert inline event handlers to camelCase
  jsx = jsx.replace(/on([a-z]+)=/gi, (match, event) => {
    return `on${event.charAt(0).toUpperCase() + event.slice(1)}=`;
  });

  // Convert for= to htmlFor= for labels
  jsx = jsx.replace(/for=/g, 'htmlFor=');

  // Convert SVG attributes
  jsx = jsx.replace(/xlink:href=/g, 'xlinkHref=');
  jsx = jsx.replace(/stroke-width=/g, 'strokeWidth=');
  jsx = jsx.replace(/stroke-linecap=/g, 'strokeLinecap=');
  jsx = jsx.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  jsx = jsx.replace(/fill-rule=/g, 'fillRule=');
  jsx = jsx.replace(/clip-rule=/g, 'clipRule=');
  jsx = jsx.replace(/fill-opacity=/g, 'fillOpacity=');
  jsx = jsx.replace(/stroke-opacity=/g, 'strokeOpacity=');
  jsx = jsx.replace(/stroke-dasharray=/g, 'strokeDasharray=');
  jsx = jsx.replace(/stroke-dashoffset=/g, 'strokeDashoffset=');
  jsx = jsx.replace(/stroke-miterlimit=/g, 'strokeMiterlimit=');

  // Fix self-closing tags (void elements) for JSX
  const voidElements = [
    'img',
    'input',
    'br',
    'hr',
    'area',
    'base',
    'col',
    'embed',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ];
  voidElements.forEach(tag => {
    // Match tag with any attributes and no closing slash
    const openTagRegex = new RegExp(`<${tag}([^>]*[^/])>`, 'g');
    // Replace with self-closing format
    jsx = jsx.replace(openTagRegex, `<${tag}$1 />`);

    // Also handle the case where tag had no attributes
    const emptyTagRegex = new RegExp(`<${tag}>`, 'g');
    jsx = jsx.replace(emptyTagRegex, `<${tag} />`);
  });

  // Convert inline style attributes from string to object notation
  jsx = jsx.replace(/style="([^"]*)"/g, (match, styleString: string) => {
    const styleObject = styleString
      .split(';')
      .filter(Boolean)
      .map((style: string) => {
        const [property, value] = style.split(':').map((s: string) => s.trim());
        if (!property) return null;

        // Convert kebab-case to camelCase
        const camelCaseProp = property.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase());

        return `${camelCaseProp}: "${value}"`;
      })
      .filter(Boolean)
      .join(', ');

    return `style={{ ${styleObject} }}`;
  });

  return jsx;
}

/**
 * Transform HTML to a React component
 * @param html The HTML to transform
 * @param componentName The name of the component
 * @param asComponent Whether to wrap as a component or not
 * @returns The transformed JSX
 */
export function transformToReact(
  html: string,
  componentName: string = 'ScrapedComponent',
  asComponent: boolean = true
): string {
  // Clean component name - ensure it's PascalCase and valid
  const cleanComponentName = componentName
    .replace(/[^\w\s]/g, '')
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[a-z]/, c => c.toUpperCase());

  // Convert HTML to JSX
  const jsx = convertHtmlToJsx(html);

  if (asComponent) {
    // Return as a React component
    return `import React from 'react';

export default function ${cleanComponentName}() {
  return (
    <>
      ${jsx}
    </>
  );
}`;
  } else {
    // Return just the JSX without a component wrapper
    return jsx;
  }
}
