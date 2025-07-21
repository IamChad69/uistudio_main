import { useMemo } from "react";

import useStorage from "./useStorage";
import { convertHtmlToJsx, transformToReact } from "../utils";
import { transformToHTML } from "../utils";
import { Framework } from "../types";

interface FrameworkHookResult {
  selectedFramework: Framework;
  setSelectedFramework: (framework: Framework) => void;
  transformHTML: (html: string, componentName?: string) => string;
  createComponentWrapper: (html: string, componentName?: string) => string;
}

/**
 * Hook for handling framework-specific transformations and component generation
 * @returns Object containing framework utilities and transformers
 */
export function useFramework(): FrameworkHookResult {
  // Storage for the selected framework
  const [selectedFramework, setSelectedFramework] = useStorage<Framework>(
    "selected_framework",
    "html",
    "local"
  );

  // Get create as component setting
  const [createAsComponent] = useStorage<boolean>(
    "create_as_component",
    true,
    "local"
  );

  /**
   * Converts HTML content to a framework-specific component
   */
  const createComponentWrapper = useMemo(
    () =>
      (html: string, componentName = "ScrapedComponent"): string => {
        switch (selectedFramework) {
          case "react":
            return transformToReact(html, componentName, true);
          case "vue":
            return `<template>
${html
  .split("\n")
  .map((line) => `  ${line}`)
  .join("\n")}
</template>

<script>
export default {
  name: '${componentName}'
}
</script>

<style scoped>
/* Add your styles here */
</style>`;

          case "svelte":
            return `<script>
  // Add your component logic here
</script>

${html}

<style>
  /* Add your styles here */
</style>`;

          case "html":
          default:
            return transformToHTML(html, componentName, true);
        }
      },
    [selectedFramework]
  );

  /**
   * Transform HTML based on the selected framework and settings
   */
  const transformHTML = useMemo(
    () =>
      (html: string, componentName?: string): string => {
        const processedHtml =
          selectedFramework === "react" ? convertHtmlToJsx(html) : html;

        if (createAsComponent) {
          return createComponentWrapper(processedHtml, componentName);
        }

        if (selectedFramework === "react") {
          return transformToReact(
            processedHtml,
            componentName || "ScrapedComponent",
            false
          );
        }

        if (selectedFramework === "html") {
          return transformToHTML(
            processedHtml,
            componentName || "ScrapedComponent",
            false
          );
        }

        return processedHtml;
      },
    [createAsComponent, createComponentWrapper, selectedFramework]
  );

  return {
    selectedFramework,
    setSelectedFramework,
    transformHTML,
    createComponentWrapper,
  };
}

export default useFramework;
