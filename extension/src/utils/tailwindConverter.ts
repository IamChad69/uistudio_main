/**
 * Utility functions to convert CSS styles to Tailwind CSS classes
 */

type StyleMap = Record<string, string>;

/**
 * Convert CSS styles to Tailwind CSS classes
 */
export function convertToTailwind(styles: StyleMap): string {
  // Initialize array to store Tailwind classes
  const tailwindClasses: string[] = [];

  // Width
  if (styles.width) {
    const widthValue = parseSize(styles.width);
    if (widthValue.unit === 'px') {
      tailwindClasses.push(`w-[${widthValue.value}px]`);
    } else if (widthValue.unit === '%') {
      if (widthValue.value === 100) tailwindClasses.push('w-full');
      else if (widthValue.value === 50) tailwindClasses.push('w-1/2');
      else if (widthValue.value === 25) tailwindClasses.push('w-1/4');
      else if (widthValue.value === 75) tailwindClasses.push('w-3/4');
      else if (widthValue.value === 33.33 || widthValue.value === 33.333)
        tailwindClasses.push('w-1/3');
      else if (widthValue.value === 66.66 || widthValue.value === 66.666)
        tailwindClasses.push('w-2/3');
      else tailwindClasses.push(`w-[${widthValue.value}%]`);
    } else if (widthValue.value === 'auto') {
      tailwindClasses.push('w-auto');
    } else {
      tailwindClasses.push(`w-[${styles.width}]`);
    }
  }

  // Height
  if (styles.height) {
    const heightValue = parseSize(styles.height);
    if (heightValue.unit === 'px') {
      tailwindClasses.push(`h-[${heightValue.value}px]`);
    } else if (heightValue.unit === '%') {
      if (heightValue.value === 100) tailwindClasses.push('h-full');
      else if (heightValue.value === 50) tailwindClasses.push('h-1/2');
      else tailwindClasses.push(`h-[${heightValue.value}%]`);
    } else if (heightValue.value === 'auto') {
      tailwindClasses.push('h-auto');
    } else {
      tailwindClasses.push(`h-[${styles.height}]`);
    }
  }

  // Text color
  if (styles.color) {
    const colorClass = getColorClass(styles.color, 'text');
    if (colorClass) tailwindClasses.push(colorClass);
    else tailwindClasses.push(`text-[${styles.color}]`);
  }

  // Background color
  if (styles.backgroundColor) {
    const bgColorClass = getColorClass(styles.backgroundColor, 'bg');
    if (bgColorClass) tailwindClasses.push(bgColorClass);
    else tailwindClasses.push(`bg-[${styles.backgroundColor}]`);
  }

  // Font size
  if (styles.fontSize) {
    const fontSizeClass = getFontSizeClass(styles.fontSize);
    if (fontSizeClass) tailwindClasses.push(fontSizeClass);
    else {
      const sizeValue = parseSize(styles.fontSize);
      tailwindClasses.push(`text-[${sizeValue.value}${sizeValue.unit}]`);
    }
  }

  // Font family
  if (styles.fontFamily) {
    const fontFamilyClass = getFontFamilyClass(styles.fontFamily);
    if (fontFamilyClass) tailwindClasses.push(fontFamilyClass);
    else tailwindClasses.push(`font-[${styles.fontFamily.replace(/['"]/g, '')}]`);
  }

  // Font weight
  if (styles.fontWeight) {
    const fontWeightClass = getFontWeightClass(styles.fontWeight);
    if (fontWeightClass) tailwindClasses.push(fontWeightClass);
    else tailwindClasses.push(`font-[${styles.fontWeight}]`);
  }

  // Padding
  if (styles.padding) {
    const paddingClasses = getPaddingClasses(styles.padding);
    tailwindClasses.push(...paddingClasses);
  }

  // Margin
  if (styles.margin) {
    const marginClasses = getMarginClasses(styles.margin);
    tailwindClasses.push(...marginClasses);
  }

  // Border
  if (styles.border) {
    const borderClasses = getBorderClasses(styles.border);
    tailwindClasses.push(...borderClasses);
  }

  // Display
  if (styles.display) {
    const displayClass = getDisplayClass(styles.display);
    if (displayClass) tailwindClasses.push(displayClass);
  }

  // Position
  if (styles.position) {
    const positionClass = getPositionClass(styles.position);
    if (positionClass) tailwindClasses.push(positionClass);
  }

  // Border radius
  if (styles.borderRadius) {
    const radiusClasses = getBorderRadiusClasses(styles.borderRadius);
    tailwindClasses.push(...radiusClasses);
  }

  // Remove duplicates and return
  return Array.from(new Set(tailwindClasses)).join(' ');
}

/**
 * Parse size values from CSS
 */
function parseSize(size: string): { value: number | string; unit: string } {
  // Handle 'auto' and other special values
  if (['auto', 'inherit', 'initial'].includes(size)) {
    return { value: size, unit: '' };
  }

  // Match numeric value and unit
  const match = size.match(/^([\d.]+)(\D*)$/);
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2] || 'px',
    };
  }
  return { value: size, unit: '' };
}

/**
 * Get color class based on color value
 */
function getColorClass(color: string, prefix: 'text' | 'bg' | 'border'): string | null {
  // Convert to lowercase for comparison
  const lowerColor = color.toLowerCase();

  // Common color mapping
  const colorMap: Record<string, string> = {
    '#ffffff': 'white',
    white: 'white',
    '#000000': 'black',
    black: 'black',
    transparent: 'transparent',
    '#f8fafc': 'slate-50',
    '#f1f5f9': 'slate-100',
    '#e2e8f0': 'slate-200',
    '#cbd5e1': 'slate-300',
    '#94a3b8': 'slate-400',
    '#64748b': 'slate-500',
    '#475569': 'slate-600',
    '#334155': 'slate-700',
    '#1e293b': 'slate-800',
    '#0f172a': 'slate-900',
    '#f9fafb': 'gray-50',
    '#f3f4f6': 'gray-100',
    '#e5e7eb': 'gray-200',
    '#d1d5db': 'gray-300',
    '#9ca3af': 'gray-400',
    '#6b7280': 'gray-500',
    '#4b5563': 'gray-600',
    '#374151': 'gray-700',
    '#1f2937': 'gray-800',
    '#111827': 'gray-900',
    '#fef2f2': 'red-50',
    '#fee2e2': 'red-100',
    '#fecaca': 'red-200',
    '#fca5a5': 'red-300',
    '#f87171': 'red-400',
    '#ef4444': 'red-500',
    '#dc2626': 'red-600',
    '#b91c1c': 'red-700',
    '#991b1b': 'red-800',
    '#7f1d1d': 'red-900',
    '#ecfeff': 'cyan-50',
    '#cffafe': 'cyan-100',
    '#a5f3fc': 'cyan-200',
    '#67e8f9': 'cyan-300',
    '#22d3ee': 'cyan-400',
    '#06b6d4': 'cyan-500',
    '#0891b2': 'cyan-600',
    '#0e7490': 'cyan-700',
    '#155e75': 'cyan-800',
    '#164e63': 'cyan-900',
    '#f0f9ff': 'blue-50',
    '#e0f2fe': 'blue-100',
    '#bae6fd': 'blue-200',
    '#7dd3fc': 'blue-300',
    '#38bdf8': 'blue-400',
    '#0ea5e9': 'blue-500',
    '#0284c7': 'blue-600',
    '#0369a1': 'blue-700',
    '#075985': 'blue-800',
    '#0c4a6e': 'blue-900',
    '#4f46e5': 'indigo-600',
  };

  // Check if we have an exact match
  if (colorMap[lowerColor]) {
    return `${prefix}-${colorMap[lowerColor]}`;
  }

  // Try to match RGB/RGBA colors
  const rgbMatch = lowerColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    const hex = `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
    if (colorMap[hex]) {
      return `${prefix}-${colorMap[hex]}`;
    }
  }

  return null;
}

/**
 * Get font size class
 */
function getFontSizeClass(fontSize: string): string | null {
  const sizeMap: Record<string, string> = {
    '0.75rem': 'text-xs',
    '0.875rem': 'text-sm',
    '1rem': 'text-base',
    '1.125rem': 'text-lg',
    '1.25rem': 'text-xl',
    '1.5rem': 'text-2xl',
    '1.875rem': 'text-3xl',
    '2.25rem': 'text-4xl',
    '3rem': 'text-5xl',
    '3.75rem': 'text-6xl',
    '4.5rem': 'text-7xl',
    '6rem': 'text-8xl',
    '8rem': 'text-9xl',
    '12px': 'text-xs',
    '14px': 'text-sm',
    '16px': 'text-base',
    '18px': 'text-lg',
    '20px': 'text-xl',
    '24px': 'text-2xl',
    '30px': 'text-3xl',
    '36px': 'text-4xl',
    '48px': 'text-5xl',
    '60px': 'text-6xl',
    '72px': 'text-7xl',
    '96px': 'text-8xl',
    '128px': 'text-9xl',
  };

  return sizeMap[fontSize] || null;
}

/**
 * Get font family class
 */
function getFontFamilyClass(fontFamily: string): string | null {
  const lowerFontFamily = fontFamily.toLowerCase();

  if (
    lowerFontFamily.includes('sans-serif') ||
    lowerFontFamily.includes('system-ui') ||
    lowerFontFamily.includes('arial')
  ) {
    return 'font-sans';
  } else if (lowerFontFamily.includes('serif') || lowerFontFamily.includes('times')) {
    return 'font-serif';
  } else if (
    lowerFontFamily.includes('monospace') ||
    lowerFontFamily.includes('console') ||
    lowerFontFamily.includes('courier')
  ) {
    return 'font-mono';
  }

  return null;
}

/**
 * Get font weight class
 */
function getFontWeightClass(fontWeight: string): string | null {
  const weightMap: Record<string, string> = {
    '100': 'font-thin',
    '200': 'font-extralight',
    '300': 'font-light',
    '400': 'font-normal',
    '500': 'font-medium',
    '600': 'font-semibold',
    '700': 'font-bold',
    '800': 'font-extrabold',
    '900': 'font-black',
    normal: 'font-normal',
    bold: 'font-bold',
  };

  return weightMap[fontWeight] || null;
}

/**
 * Get padding classes from padding shorthand
 */
function getPaddingClasses(padding: string): string[] {
  const classes: string[] = [];
  const values = padding.split(' ').map(v => v.trim());

  if (values.length === 1) {
    // Same padding on all sides
    const padValue = parseSize(values[0]);
    if (padValue.unit === 'px') {
      classes.push(`p-[${padValue.value}px]`);
    } else {
      classes.push(`p-[${values[0]}]`);
    }
  } else if (values.length === 2) {
    // Vertical and horizontal padding
    const padValueY = parseSize(values[0]);
    const padValueX = parseSize(values[1]);

    if (padValueY.unit === 'px') {
      classes.push(`py-[${padValueY.value}px]`);
    } else {
      classes.push(`py-[${values[0]}]`);
    }

    if (padValueX.unit === 'px') {
      classes.push(`px-[${padValueX.value}px]`);
    } else {
      classes.push(`px-[${values[1]}]`);
    }
  } else if (values.length === 4) {
    // Top, right, bottom, left padding
    const padValueTop = parseSize(values[0]);
    const padValueRight = parseSize(values[1]);
    const padValueBottom = parseSize(values[2]);
    const padValueLeft = parseSize(values[3]);

    if (padValueTop.unit === 'px') {
      classes.push(`pt-[${padValueTop.value}px]`);
    } else {
      classes.push(`pt-[${values[0]}]`);
    }

    if (padValueRight.unit === 'px') {
      classes.push(`pr-[${padValueRight.value}px]`);
    } else {
      classes.push(`pr-[${values[1]}]`);
    }

    if (padValueBottom.unit === 'px') {
      classes.push(`pb-[${padValueBottom.value}px]`);
    } else {
      classes.push(`pb-[${values[2]}]`);
    }

    if (padValueLeft.unit === 'px') {
      classes.push(`pl-[${padValueLeft.value}px]`);
    } else {
      classes.push(`pl-[${values[3]}]`);
    }
  }

  return classes;
}

/**
 * Get margin classes from margin shorthand
 */
function getMarginClasses(margin: string): string[] {
  const classes: string[] = [];
  const values = margin.split(' ').map(v => v.trim());

  if (values.length === 1) {
    // Same margin on all sides
    const marginValue = parseSize(values[0]);
    if (marginValue.value === 0 || marginValue.value === '0') {
      classes.push('m-0');
    } else if (marginValue.value === 'auto') {
      classes.push('m-auto');
    } else if (marginValue.unit === 'px') {
      classes.push(`m-[${marginValue.value}px]`);
    } else {
      classes.push(`m-[${values[0]}]`);
    }
  } else if (values.length === 2) {
    // Vertical and horizontal margin
    const marginValueY = parseSize(values[0]);
    const marginValueX = parseSize(values[1]);

    if (marginValueY.value === 0 || marginValueY.value === '0') {
      classes.push('my-0');
    } else if (marginValueY.value === 'auto') {
      classes.push('my-auto');
    } else if (marginValueY.unit === 'px') {
      classes.push(`my-[${marginValueY.value}px]`);
    } else {
      classes.push(`my-[${values[0]}]`);
    }

    if (marginValueX.value === 0 || marginValueX.value === '0') {
      classes.push('mx-0');
    } else if (marginValueX.value === 'auto') {
      classes.push('mx-auto');
    } else if (marginValueX.unit === 'px') {
      classes.push(`mx-[${marginValueX.value}px]`);
    } else {
      classes.push(`mx-[${values[1]}]`);
    }
  } else if (values.length === 4) {
    // Top, right, bottom, left margin
    const marginValueTop = parseSize(values[0]);
    const marginValueRight = parseSize(values[1]);
    const marginValueBottom = parseSize(values[2]);
    const marginValueLeft = parseSize(values[3]);

    if (marginValueTop.value === 0 || marginValueTop.value === '0') {
      classes.push('mt-0');
    } else if (marginValueTop.value === 'auto') {
      classes.push('mt-auto');
    } else if (marginValueTop.unit === 'px') {
      classes.push(`mt-[${marginValueTop.value}px]`);
    } else {
      classes.push(`mt-[${values[0]}]`);
    }

    if (marginValueRight.value === 0 || marginValueRight.value === '0') {
      classes.push('mr-0');
    } else if (marginValueRight.value === 'auto') {
      classes.push('mr-auto');
    } else if (marginValueRight.unit === 'px') {
      classes.push(`mr-[${marginValueRight.value}px]`);
    } else {
      classes.push(`mr-[${values[1]}]`);
    }

    if (marginValueBottom.value === 0 || marginValueBottom.value === '0') {
      classes.push('mb-0');
    } else if (marginValueBottom.value === 'auto') {
      classes.push('mb-auto');
    } else if (marginValueBottom.unit === 'px') {
      classes.push(`mb-[${marginValueBottom.value}px]`);
    } else {
      classes.push(`mb-[${values[2]}]`);
    }

    if (marginValueLeft.value === 0 || marginValueLeft.value === '0') {
      classes.push('ml-0');
    } else if (marginValueLeft.value === 'auto') {
      classes.push('ml-auto');
    } else if (marginValueLeft.unit === 'px') {
      classes.push(`ml-[${marginValueLeft.value}px]`);
    } else {
      classes.push(`ml-[${values[3]}]`);
    }
  }

  return classes;
}

/**
 * Get border classes from border shorthand
 */
function getBorderClasses(border: string): string[] {
  const classes: string[] = [];

  if (border === 'none') {
    return ['border-0'];
  }

  // Try to match the pattern width style color
  const parts = border.split(' ');

  // Default to border - add specific attributes if found
  classes.push('border');

  // Check width
  const widthMatch = parts.find(p => /^\d+(\.\d+)?(px|rem|em)$/.test(p));
  if (widthMatch) {
    const width = parseSize(widthMatch);
    if (width.value !== 1 || width.unit !== 'px') {
      classes.push(`border-[${width.value}${width.unit}]`);
    }
  }

  // Check color
  const colorCandidate = parts.find(
    p =>
      p.startsWith('#') ||
      p.startsWith('rgb') ||
      ['black', 'white', 'red', 'blue', 'green', 'yellow', 'gray'].includes(p)
  );
  if (colorCandidate) {
    const colorClass = getColorClass(colorCandidate, 'border');
    if (colorClass) {
      classes.push(colorClass);
    } else {
      classes.push(`border-[${colorCandidate}]`);
    }
  }

  return classes;
}

/**
 * Get display class
 */
function getDisplayClass(display: string): string | null {
  const displayMap: Record<string, string> = {
    block: 'block',
    'inline-block': 'inline-block',
    inline: 'inline',
    flex: 'flex',
    'inline-flex': 'inline-flex',
    table: 'table',
    'inline-table': 'inline-table',
    grid: 'grid',
    'inline-grid': 'inline-grid',
    hidden: 'hidden',
    none: 'hidden',
  };

  return displayMap[display] || null;
}

/**
 * Get position class
 */
function getPositionClass(position: string): string | null {
  const positionMap: Record<string, string> = {
    static: 'static',
    relative: 'relative',
    absolute: 'absolute',
    fixed: 'fixed',
    sticky: 'sticky',
  };

  return positionMap[position] || null;
}

/**
 * Get border radius classes
 */
function getBorderRadiusClasses(borderRadius: string): string[] {
  const radiusClasses: string[] = [];
  const values = borderRadius.split(' ').map(v => v.trim());

  if (values.length === 1) {
    const radiusValue = parseSize(values[0]);
    if (radiusValue.value === 0) {
      radiusClasses.push('rounded-none');
    } else if (radiusValue.unit === 'px' && radiusValue.value === 9999) {
      radiusClasses.push('rounded-full');
    } else if (radiusValue.unit === '%' && radiusValue.value === 50) {
      radiusClasses.push('rounded-full');
    } else if (radiusValue.unit === 'px') {
      if (radiusValue.value === 4) {
        radiusClasses.push('rounded');
      } else if (radiusValue.value === 2) {
        radiusClasses.push('rounded-sm');
      } else if (radiusValue.value === 8) {
        radiusClasses.push('rounded-lg');
      } else {
        radiusClasses.push(`rounded-[${radiusValue.value}px]`);
      }
    } else {
      radiusClasses.push(`rounded-[${values[0]}]`);
    }
  } else if (values.length === 4) {
    // Top-left, top-right, bottom-right, bottom-left
    const radiusValueTL = parseSize(values[0]);
    const radiusValueTR = parseSize(values[1]);
    const radiusValueBR = parseSize(values[2]);
    const radiusValueBL = parseSize(values[3]);

    if (radiusValueTL.unit === 'px') {
      radiusClasses.push(`rounded-tl-[${radiusValueTL.value}px]`);
    }
    if (radiusValueTR.unit === 'px') {
      radiusClasses.push(`rounded-tr-[${radiusValueTR.value}px]`);
    }
    if (radiusValueBR.unit === 'px') {
      radiusClasses.push(`rounded-br-[${radiusValueBR.value}px]`);
    }
    if (radiusValueBL.unit === 'px') {
      radiusClasses.push(`rounded-bl-[${radiusValueBL.value}px]`);
    }
  }

  return radiusClasses;
}
