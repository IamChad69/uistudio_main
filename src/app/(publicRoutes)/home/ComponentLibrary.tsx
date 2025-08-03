// components/SectionWithMockup.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, MoveRight } from "lucide-react";

interface ComponentLibraryProps {}
export const subFeatures = [
  "Custom components",
  "Prompt to UI",
  "Copy to clipboard",
];
const ComponentLibrary: React.FC<ComponentLibraryProps> = ({}) => {
  return (
    <section className="py-16 md:py-24">
      {/* Heading Section */}
      <div className="relative z-10 mx-auto max-w-xl mb-16 space-y-4 text-center md:space-y-8">
        <h2 className="text-4xl font-medium lg:text-5xl tracking-tight">
          Build your own UI Library
        </h2>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Build your own organized library of components. Save, categorize, and
          tag your favorite elements for quick access and reuse across projects.
        </p>
      </div>

      <div className="flex flex-col bg-light-5 border border-border rounded-2xl overflow-hidden">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6 flex flex-col gap-4 items-start justify-center p-8 md:p-12 lg:p-16">
            <span className="text-sm text-muted-foreground uppercase tracking-wider">
              UI Library
            </span>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium">
                Your personal <br />
                <span className="text-muted-foreground">UI Library</span>
              </h2>

              <p className="text-lg leading-relaxed text-muted-foreground">
                Organize and reuse your favorite elements across projects.
              </p>
            </div>

            {/* Sub Features List */}
            <div className="space-y-3">
              {subFeatures.map((feature) => (
                <div className="flex items-center gap-3" key={feature}>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-row gap-4 mt-2">
              <Link
                href="/"
                className="gap-4 flex items-center text-sm text-muted-foreground hover:text-primary"
              >
                Start Building
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column - Video Demo */}
          <div className="bg-muted overflow-hidden shadow-lg">
            <video
              autoPlay={true}
              loop={true}
              muted={true}
              className="w-full h-full object-cover aspect-video opacity-80 dark:opacity-90"
              src="https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXuuKXk5BO3qEX8zmS5D6YGluptwTFgoeNhHbK"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComponentLibrary;
