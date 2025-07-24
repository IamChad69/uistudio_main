import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { type TreeItem } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a record of files to a tree structure.
 * @param files - Record of file paths to content
 * @returns Tree structure for TreeView component
 *
 * @example
 * Input: { "src/Button.tsx": "...", "README.md": "..." }
 * Output: [["src", ["Button.tsx"]], "README.md"]
 */
export function convertFilesToTreeItems(
  files: Record<string, string>
): TreeItem[] {
  // Define proper type for tree structure
  interface TreeNode {
    [key: string]: TreeNode | null;
  }

  // Build a tree structure first
  const tree: TreeNode = {};

  // Sort files to ensure consistent ordering
  const sortedPaths = Object.keys(files).sort();

  for (const filePath of sortedPaths) {
    const parts = filePath.split("/");
    let current = tree;

    // Navigate/create the tree structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as TreeNode;
    }

    // Add the file (leaf node)
    const fileName = parts[parts.length - 1];
    current[fileName] = null; // null indicates it's a file
  }

  // Convert tree structure to TreeItem format
  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node);

    if (entries.length === 0) {
      return name || "";
    }

    const children: TreeItem[] = [];

    for (const [key, value] of entries) {
      if (value === null) {
        // It's a file
        children.push(key);
      } else {
        // It's a folder
        const subTree = convertNode(value, key);
        if (Array.isArray(subTree)) {
          children.push([key, ...subTree]);
        } else {
          children.push([key, subTree]);
        }
      }
    }

    return name ? [name, ...children] : children;
  }

  const result = convertNode(tree);
  return Array.isArray(result) ? result : [result];
}

/**
 * Extracts the main component from fragment files
 * Excludes page.tsx, layout.tsx, and other framework files
 */
export function extractMainComponent(files: { [path: string]: string }): {
  componentName: string;
  componentCode: string;
  componentPath: string;
} | null {
  // Files to exclude from being considered as main components
  const excludedFiles = [
    "page.tsx",
    "layout.tsx",
    "globals.css",
    "tailwind.config.js",
    "next.config.js",
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "tsconfig.json",
    "postcss.config.js",
    "components.json",
    ".gitignore",
    "README.md",
  ];

  // Find the main component file
  const componentFiles = Object.entries(files).filter(([path, content]) => {
    // Exclude framework files
    if (excludedFiles.some((excluded) => path.includes(excluded))) {
      return false;
    }

    // Look for .tsx files that are likely components
    if (path.endsWith(".tsx") && !path.includes("node_modules")) {
      return true;
    }

    return false;
  });

  if (componentFiles.length === 0) {
    return null;
  }

  // Prioritize files that look like main components
  // First, look for files that are not page.tsx or layout.tsx
  const mainComponentFile =
    componentFiles.find(([path]) => {
      // Exclude page.tsx and layout.tsx explicitly
      if (path.endsWith("page.tsx") || path.endsWith("layout.tsx")) {
        return false;
      }
      // Prefer files that are directly in app/ or components/ directories
      if (path.startsWith("app/") && !path.includes("/")) {
        return true;
      }
      if (path.startsWith("components/")) {
        return true;
      }
      return false;
    }) || componentFiles[0];

  const [componentPath, componentCode] = mainComponentFile;

  // Extract component name from the file path
  const fileName =
    componentPath.split("/").pop()?.replace(".tsx", "") || "Component";

  return {
    componentName: fileName,
    componentCode,
    componentPath,
  };
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

  // Extract just the component function/JSX, removing page-level structure
  const lines = cleanedCode.split("\n");
  const componentStartIndex = lines.findIndex((line) => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith("export default function") ||
      trimmed.startsWith("export function") ||
      /^export\s+default\s+const\s+\w+\s*=/.test(trimmed) ||
      /^const\s+[A-Z]\w*\s*=\s*\(.*\)\s*=>/.test(trimmed)
    );
  });

  if (componentStartIndex !== -1) {
    const componentLines = lines.slice(componentStartIndex);
    return `// ${componentName}.tsx
${componentLines.join("\n")}`;
  }

  return `// ${componentName}.tsx
${cleanedCode}`;
}

/**
 * Generates a clean page structure that just imports and renders the component
 */
export function generatePageStructure(componentName: string): string {
  return `import { ${componentName} } from "./${componentName.toLowerCase()}"

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <${componentName} />
    </div>
  )
}`;
}
