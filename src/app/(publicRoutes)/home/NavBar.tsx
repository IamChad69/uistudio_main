"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";

const menuItems = [
  { name: "Features", href: "#link" },
  { name: "Solution", href: "#link" },
  { name: "Pricing", href: "#link" },
  { name: "About", href: "#link" },
];

export const Header = () => {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed group z-20 w-full"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-300",
            isScrolled &&
              "bg-background/50 max-w-6xl rounded-2xl border backdrop-blur-lg px-4 sm:px-6 lg:px-8"
          )}
        >
          <div className="relative flex items-center justify-between py-3 lg:py-4">
            <div className="flex items-center">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Image
                  src={"/UiScraperLogo-dark.png"}
                  alt="logo"
                  width={24}
                  height={24}
                  className="rotate-45"
                />
                <span className="text-xl md:text-2xl font-bold">UiScraper</span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-muted-foreground hover:text-accent-foreground text-sm duration-150"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <button
              onClick={() => setMenuState(!menuState)}
              aria-label={menuState == true ? "Close Menu" : "Open Menu"}
              className="relative z-20 block cursor-pointer p-2 lg:hidden ml-auto"
            >
              <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
              <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
            </button>

            <div className="hidden lg:block">
              <Button
                asChild
                size="sm"
                className="ml-4"
              >
                <Link href="#">
                  <span>Get Started</span>
                </Link>
              </Button>
            </div>

            {/* Mobile menu dropdown */}
            <div className={cn(
              "fixed inset-x-0 top-[72px] z-10 bg-background rounded-b-xl border-x border-b p-6 shadow-lg",
              menuState ? "block" : "hidden"
            )}>
              <nav className="mt-2 mb-6">
                <ul className="space-y-4">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150 text-base"
                        onClick={() => setMenuState(false)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              
              <div className="flex flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Link href="#">
                    <span>Login</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Link href="#">
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
