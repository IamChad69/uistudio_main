"use client";
import { Fragment } from "@/generated/prisma";
import { useCurrentTheme } from "@/hooks/use-current-theme";
import { useEffect, useState } from "react";

interface FragmentWebProps {
  data: Fragment;
  fragmentKey?: number;
}

const FragmentWeb = ({ data, fragmentKey = 0 }: FragmentWebProps) => {
  const [iframeKey, setIframeKey] = useState(fragmentKey);
  const currentTheme = useCurrentTheme();

  // Update iframe when theme changes or fragmentKey changes
  useEffect(() => {
    setIframeKey(fragmentKey);
  }, [fragmentKey]);

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

  return (
    <div className="flex flex-col w-full flex-1 h-full">
      {/* iframe for preview */}

      <iframe
        key={iframeKey}
        src={getSandboxUrlWithTheme(data?.sandboxUrl || "", currentTheme)}
        className="w-full h-full"
        loading="lazy"
        sandbox="allow-scripts allow-forms allow-same-origin"
      />
    </div>
  );
};

export default FragmentWeb;
