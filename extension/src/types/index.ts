// src/interfaces.ts

export interface ColorValue {
  rgb: string;
  hex: string;
}

export interface FontMetrics {
  ascent: number;
  descent: number;
  baseline: number;
  xHeight: number;
  capHeight: number;
}

export interface FontInfo {
  elementType: string;
  id: string;
  className: string;
  cssClasses: string[];
  fontFamily: string;
  renderedFont: string; // The first font in the family string, cleaned
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  lineHeight: string;
  color: ColorValue;
  backgroundColor: ColorValue;
  textAlign: string;
  letterSpacing: string;
  textTransform: string;
  textDecoration: string;
  isWebSafe: boolean;
  fontMetrics: FontMetrics;
  textContent: string;
  textLength: number;
  wordCount: number;
  lineCount: number;
  isSystemFont: boolean;
  hasCustomFont: boolean;
  fontLoading: "loaded" | "loading" | "unknown"; // Added font loading status
}

export interface CapturedData {
  html: string;
  css: string;
  cssImages: string[];
  htmlImages: string[];
  dimensions: string;
  url: string;
}

export interface ExtractorResult {
  rules: string[];
  images: string[];
}

export interface ImageExtractorResult {
  htmlImages: string[];
  cssImages: string[];
}

export interface CaptureButtonProps {
  onCapture: () => Promise<CapturedData>;
  onBookmark?: () => void;
  onSettings?: () => void;
  isAuthenticated?: boolean;
}

/**
 * Interface for color picker UI elements
 */
export interface ColorPickerUI {
  container: HTMLDivElement;
  magnifier: HTMLDivElement;
  colorValue: HTMLDivElement;
  preview?: HTMLDivElement;
}

export type Framework = "react" | "vue" | "svelte" | "html";

export interface StorageData {
  // ... existing storage interface properties ...
  preferredFramework?: Framework;
  formatterOptions?: FormatterOptions;
  isComponent?: boolean;
}

export interface FormatterOptions {
  componentName?: string;
  typescript?: boolean;
  styleFormat?: "inline" | "styled-components" | "css-modules";
  isComponent?: boolean;
}

export interface FormatResult {
  code: string;
  language: string;
  framework: Framework;
}

export interface CreateBookmarkInput {
  url: string;
  screenshot: string;
}

export interface BookmarkResponse {
  id: string;
  url: string;
  screenshot: string;
  createdAt: string;
}

export interface BookmarkError {
  message: string;
  code: string;
}
