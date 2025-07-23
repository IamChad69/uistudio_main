"use client";
import { Fragment } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { extractMainComponent, formatComponentForCopy } from "@/lib/utils";
import { toast } from "sonner";

interface FragmentWebProps {
  data: Fragment;
  fragmentKey?: number;
}

const FragmentWeb = ({ data, fragmentKey = 0 }: FragmentWebProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyComponent = async () => {
    if (!data.files) {
      toast.error("No component files available");
      return;
    }

    try {
      // Parse files if they're stored as a string
      const files =
        typeof data.files === "object"
          ? (data.files as { [path: string]: string })
          : (JSON.parse(String(data.files)) as { [path: string]: string });

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
    <div className="flex flex-col w-full h-full">
      {/* Header with copy button */}
      <div className="flex items-center justify-between p-3 border-b bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">{data.title}</h3>
          <span className="text-xs text-muted-foreground">
            Component Preview
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyComponent}
          disabled={copied || !data.files}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Component
            </>
          )}
        </Button>
      </div>

      {/* iframe for preview */}
      <div className="flex-1">
        <iframe
          key={fragmentKey}
          src={data?.sandboxUrl || ""}
          className="w-full h-full"
          loading="lazy"
          sandbox="allow-scripts allow-forms allow-same-origin"
        />
      </div>
    </div>
  );
};

export default FragmentWeb;
