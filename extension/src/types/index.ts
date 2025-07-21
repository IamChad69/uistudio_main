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

export type Framework = 'react' | 'vue' | 'svelte' | 'html';

export interface StorageData {
  // ... existing storage interface properties ...
  preferredFramework?: Framework;
  formatterOptions?: FormatterOptions;
  isComponent?: boolean;
}

export interface FormatterOptions {
  componentName?: string;
  typescript?: boolean;
  styleFormat?: 'inline' | 'styled-components' | 'css-modules';
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
