export class AssetExtractor {
  private styleElement: HTMLStyleElement | null = null;
  private _isExtractionActive = false;
  private modal: HTMLDivElement | null = null;
  private assets: { filename: string; url: string; type: string }[] = [];

  constructor() {
    this.addAssetExtractorStyles();
  }

  private addAssetExtractorStyles() {
    if (this.styleElement) {
      return;
    }

    this.styleElement = document.createElement("style");
    document.head.appendChild(this.styleElement);

    const style = this.styleElement;
    style.textContent = `
      .asset-extractor {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: transparent;
        z-index: 2147483647;
        display: none;
        align-items: flex-start;
        justify-content: flex-end;
        padding: 60px 20px;
        box-sizing: border-box;
      }

      .asset-extractor-content {
        background: linear-gradient(145deg, #0a0a0a 0%, #111111 100%);
        width: 240px;
        max-height: calc(100vh - 120px);
        color: white;
        border-radius: 16px;
        box-shadow: 
          0 20px 25px -5px rgba(0, 0, 0, 0.4),
          0 10px 10px -5px rgba(0, 0, 0, 0.2),
          0 0 0 1px rgba(255, 255, 255, 0.05);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.08);
        animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .assets-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .assets-header h2 {
        font-size: 16px;
        margin: 0;
        font-weight: 600;
        color: #ffffff;
        letter-spacing: -0.01em;
        background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .asset-close-button {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.7);
        border: none;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        border-radius: 8px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .asset-close-button:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        transform: scale(1.05);
      }

      .asset-scroll-container {
        overflow: auto;
        max-height: calc(400px - 60px);
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
      }

      .asset-scroll-container::-webkit-scrollbar {
        width: 6px;
      }

      .asset-scroll-container::-webkit-scrollbar-track {
        background: transparent;
      }

      .asset-scroll-container::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
      }

      .asset-scroll-container::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .asset-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        padding: 16px;
      }

      .asset-item {
        border-radius: 12px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        aspect-ratio: 1/1;
        border: 1px solid rgba(255, 255, 255, 0.08);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .asset-item:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .asset-preview {
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .asset-preview img,
      .asset-preview svg {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .download-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        z-index: 10;
        box-shadow: 
          0 4px 12px rgba(0, 0, 0, 0.3),
          0 2px 4px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(8px);
      }

      .download-icon:hover {
        background: #ffffff;
        transform: translate(-50%, -50%) scale(1.1);
        box-shadow: 
          0 6px 16px rgba(0, 0, 0, 0.4),
          0 4px 8px rgba(0, 0, 0, 0.3);
      }

      .download-icon svg {
        width: 18px;
        height: 18px;
      }

      .asset-item:hover .download-icon {
        opacity: 1;
      }

      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;
  }

  public showAssets(
    assets: { filename: string; url: string; type?: string }[]
  ) {
    let assetExtractor = document.getElementById("assetExtractor");

    if (!assetExtractor) {
      assetExtractor = document.createElement("div");
      assetExtractor.id = "assetExtractor";
      assetExtractor.className = "asset-extractor";

      const content = document.createElement("div");
      content.className = "asset-extractor-content";
      assetExtractor.appendChild(content);

      document.body.appendChild(assetExtractor);
    }

    const content = assetExtractor.querySelector(
      ".asset-extractor-content"
    ) as HTMLDivElement;
    content.innerHTML = ""; // Clear existing content

    // Add header (outside scroll area)
    const header = document.createElement("div");
    header.className = "assets-header";

    const title = document.createElement("h2");
    title.textContent = "Assets";

    const closeButton = document.createElement("button");
    closeButton.className = "asset-close-button";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = () => this.hideAssets();

    header.appendChild(title);
    header.appendChild(closeButton);
    content.appendChild(header);

    // Create scroll container
    const scrollContainer = document.createElement("div");
    scrollContainer.className = "asset-scroll-container";
    content.appendChild(scrollContainer);

    // Add grid inside scroll container
    const grid = document.createElement("div");
    grid.className = "asset-grid";
    scrollContainer.appendChild(grid);

    this.renderAssets(assets, grid);

    assetExtractor.style.display = "flex";

    // Add ESC key handler
    const escKeyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.hideAssets();
        document.removeEventListener("keydown", escKeyHandler);
      }
    };
    document.addEventListener("keydown", escKeyHandler);
  }

  private renderAssets(
    assets: { filename: string; url: string; type?: string }[],
    grid: HTMLDivElement
  ) {
    assets.forEach((asset) => {
      const assetItem = document.createElement("div");
      assetItem.className = "asset-item";

      const assetPreview = document.createElement("div");
      assetPreview.className = "asset-preview";

      let element: HTMLImageElement | SVGSVGElement;

      if (asset.url.toLowerCase().endsWith(".svg")) {
        element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        fetch(asset.url)
          .then((response) => response.text())
          .then((svgData) => {
            element.innerHTML = svgData;
            assetPreview.appendChild(element);
          });
      } else {
        element = document.createElement("img");
        (element as HTMLImageElement).src = asset.url;
        element.onload = () => {
          assetPreview.appendChild(element);
        };
        element.onerror = () => {
          console.error("Error loading image:", asset.url);
          assetPreview.textContent = "Error loading image";
          assetPreview.style.color = "red";
        };
      }

      const img = element as HTMLImageElement;
      img.style.objectFit = "cover";
      img.style.width = "100%";
      img.style.height = "100%";

      // Add download icon
      const downloadIcon = document.createElement("div");
      downloadIcon.className = "download-icon";
      downloadIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      `;
      downloadIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        this.downloadAsset(asset);
      });

      assetItem.appendChild(assetPreview);
      assetItem.appendChild(downloadIcon);

      grid.appendChild(assetItem);
    });
  }

  private downloadAsset(asset: {
    filename: string;
    url: string;
    type?: string;
  }): void {
    const link = document.createElement("a");
    link.href = asset.url;
    link.download = asset.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Start the asset extraction process
   */
  public startExtraction(): void {
    this._isExtractionActive = true;

    // Extract assets from the page
    const assets = this.extractAssets();

    // Show the assets
    this.showAssets(assets);
  }

  /**
   * Check if extraction is currently active
   */
  public isExtractionActive(): boolean {
    return this._isExtractionActive;
  }

  /**
   * Extract assets from the current page
   */
  private extractAssets(): { filename: string; url: string; type: string }[] {
    const assets: { filename: string; url: string; type: string }[] = [];

    // Extract images
    document.querySelectorAll("img").forEach((img) => {
      if (img.src) {
        const url = img.src;
        const filename = this.getFilenameFromUrl(url);
        assets.push({
          filename,
          url,
          type: "img",
        });
      }
    });

    // Extract SVGs
    document.querySelectorAll("svg").forEach((svg) => {
      // Create a blob URL for the SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
      const filename = "svg-element.svg";
      assets.push({
        filename,
        url,
        type: "svg",
      });
    });

    // Extract background images
    document.querySelectorAll("*").forEach((el) => {
      const style = window.getComputedStyle(el);
      const backgroundImage = style.backgroundImage;

      if (backgroundImage && backgroundImage !== "none") {
        // Extract URL from the background-image CSS
        const urlMatch = /url\(['"]?(.*?)['"]?\)/i.exec(backgroundImage);
        if (urlMatch && urlMatch[1]) {
          const url = urlMatch[1];
          const filename = this.getFilenameFromUrl(url);
          assets.push({
            filename,
            url,
            type: "background",
          });
        }
      }
    });

    return assets;
  }

  /**
   * Extract filename from URL
   */
  private getFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const segments = pathname.split("/");
      const lastSegment = segments[segments.length - 1];

      // If there's a filename with extension
      if (lastSegment.includes(".")) {
        return lastSegment;
      }

      // Otherwise use the URL pathname
      return pathname.replace(/\//g, "-").slice(0, 30) || "asset";
    } catch (e) {
      // For data URLs and other non-standard URLs
      if (url.startsWith("data:")) {
        const mimeMatch = url.match(/data:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "unknown";
        return `data-${mime.replace("/", "-")}.${mime.split("/")[1] || "txt"}`;
      }
      return "asset";
    }
  }

  // Add this method to override the existing hideAssets to handle the _isExtractionActive state
  public hideAssets(): void {
    this._isExtractionActive = false;
    const assetExtractor = document.getElementById("assetExtractor");
    if (assetExtractor) {
      assetExtractor.style.display = "none";
    }
  }
}
