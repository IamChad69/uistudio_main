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
import { Sun, Moon, CrownIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { UserControl } from "../user-control";
import { useAuth } from "@clerk/nextjs";
import { Button } from "../ui/button";

const Sidebar = () => {
  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro" });
  const pathname = usePathname;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show theme UI after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-screen sticky top-0 py-2 px-2 sm:px-6 border bg-background border-border flex flex-col items-center justify-start gap-4">
      <>
        <Link href="/">
          <Image
            src="/UiScraperLogo-light.png"
            alt="logo"
            width={24}
            height={24}
            className="rotate-45 "
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
                    className={`flex items-center gap-2 cursor-pointer rounded-lg p-1.5 ${
                      pathname().includes(item.link)
                        ? "bg-accent border border-border rounded-md"
                        : ""
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
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

        {/* Theme toggle button */}
        <div className="flex flex-col items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={
                mounted && theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="flex items-center justify-center w-8 h-8 border border-border rounded-md hover:bg-muted p-1 transition-colors"
            >
              {mounted && theme === "dark" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          )}
          {hasProAccess && (
            <div className="ml-auto flex items-center gap-x-2">
              {!hasProAccess && (
                <Button asChild variant={"tertiary"} size="sm">
                  <Link href="/pricing">
                    <CrownIcon />
                    <span>Upgrade</span>
                  </Link>
                </Button>
              )}
              <UserControl showName={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
