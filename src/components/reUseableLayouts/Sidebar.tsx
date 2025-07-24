"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { SidebarData } from "@/lib/data";
import { HelpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeSwitcher } from "./theme-swticher";

const Sidebar = () => {
  const pathname = usePathname;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show theme UI after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-screen sticky top-0 py-3 px-2 sm:px-6  bg-background  flex flex-col items-center justify-start gap-4">
      <>
        <Link href="/">
          <Image
            src={
              mounted && theme === "dark"
                ? "/UiScraperLogo-light.png"
                : "/UiScraperLogo-dark.png"
            }
            alt="logo"
            width={24}
            height={24}
            className="rotate-45"
          />
        </Link>
        <Separator className="w-full" />
      </>

      <div className="w-full h-full justify-between items-center flex flex-col">
        <div className="w-full h-fit flex flex-col gap-4 items-center justify-center ">
          {SidebarData.map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.link}
                    className={`flex items-center gap-2 cursor-pointer rounded-lg p-1.5 transition-all duration-200 hover:bg-accent hover:border hover:border-border hover:rounded-md ${
                      pathname().includes(item.link)
                        ? "bg-accent border border-border rounded-md"
                        : ""
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-opacity duration-200 ${
                        pathname().includes(item.link) ? "" : "opacity-80"
                      }`}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="text-sm">{item.title}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Theme switcher */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <ThemeSwitcher />
          <HelpCircle className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
