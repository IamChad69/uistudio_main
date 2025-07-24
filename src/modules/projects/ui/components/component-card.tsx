import React, { useState, useEffect } from "react";
import { Fragment } from "@/generated/prisma";
import Link from "next/link";
import {
  EyeIcon,
  CodeIcon,
  Check,
  CopyIcon,
  CopyCheckIcon,
} from "lucide-react";
import { extractMainComponent, formatComponentForCopy } from "@/lib/utils";
import { toast } from "sonner";
import { useCurrentTheme } from "@/hooks/use-current-theme";

interface ComponentCardProps {
  fragment: Fragment & {
    message: {
      projectId: string;
      project: {
        name: string;
      };
    };
  };
}

const ComponentCard: React.FC<ComponentCardProps> = ({ fragment }) => {
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const currentTheme = useCurrentTheme();

  // Update iframe when theme changes
  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [currentTheme]);

  // Create sandbox URL with theme parameter
  const getSandboxUrlWithTheme = (
    baseUrl: string,
    theme: string | undefined
  ) => {
    try {
      const url = new URL(baseUrl);
      if (theme) {
        url.searchParams.set("theme", theme);
      }
      return url.toString();
    } catch (error) {
      // If URL parsing fails, return the original URL
      return baseUrl;
    }
  };

  const handleCopyComponent = async () => {
    if (!fragment.files) {
      toast.error("No component files available");
      return;
    }

    try {
      // Parse files if they're stored as a string
      const files =
        typeof fragment.files === "object"
          ? (fragment.files as { [path: string]: string })
          : (JSON.parse(String(fragment.files)) as { [path: string]: string });

      const mainComponent = extractMainComponent(files);

      if (!mainComponent) {
        toast.error("No main component found");
        return;
      }

      const formattedCode = formatComponentForCopy(
        mainComponent.componentCode,
        mainComponent.componentName
      );

      await navigator.clipboard.writeText(formattedCode);
      setCopied(true);
      toast.success(`Copied ${mainComponent.componentName}.tsx to clipboard`);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error copying component:", error);
      toast.error("Failed to copy component");
    }
  };

  return (
    <div className="group relative w-full">
      <div className="p-0 flex-1 relative h-[400px] rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-200">
        <div className="absolute inset-0 ">
          <iframe
            key={iframeKey}
            src={getSandboxUrlWithTheme(fragment.sandboxUrl, currentTheme)}
            className="w-full h-full  "
            loading="lazy"
            sandbox="allow-scripts allow-forms allow-same-origin"
            style={{
              border: "none",
              overflow: "auto",
            }}
          />
        </div>
      </div>

      {/* Action Buttons Overlay - Only visible on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/projects/${fragment?.message?.projectId}`}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-400
                transition-colors text-shadow"
          >
            <EyeIcon className="w-3 h-3" />
            View
          </Link>
          <button
            onClick={handleCopyComponent}
            disabled={copied || !fragment.files}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-400
                transition-colors text-shadow"
          >
            {copied ? (
              <>
                <CopyCheckIcon className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <CopyIcon className="w-3 h-3" />
                Get code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponentCard;
