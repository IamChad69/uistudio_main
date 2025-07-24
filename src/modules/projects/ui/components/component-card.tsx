import React, { useState } from "react";
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

  const handleCopyComponent = async () => {
    if (
      !fragment.files ||
      (typeof fragment.files === "object" &&
        fragment.files !== null &&
        Object.keys(fragment.files).length === 0)
    ) {
      toast.error("No component files available");
      return;
    }

    // Check clipboard API availability
    if (!navigator.clipboard) {
      toast.error("Clipboard not supported in this browser");
      return;
    }

    try {
      let files: { [path: string]: string };

      if (typeof fragment.files === "object" && fragment.files !== null) {
        files = fragment.files as { [path: string]: string };
      } else if (typeof fragment.files === "string") {
        try {
          files = JSON.parse(fragment.files);
        } catch (parseError) {
          throw new Error("Invalid JSON format in fragment files");
        }
      } else {
        throw new Error("Unsupported fragment files format");
      }

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
      <div className="p-0 flex-1 relative h-[400px] rounded-md overflow-hidden bg-white border border-border">
        <div className="absolute inset-0 ">
          <iframe
            src={fragment.sandboxUrl}
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
