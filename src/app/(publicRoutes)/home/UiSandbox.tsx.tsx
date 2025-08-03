"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionWithMockupProps {}

export const subFeatures = [
  "Custom components",
  "Prompt to UI",
  "Copy to clipboard",
];

const SectionWithMockup: React.FC<SectionWithMockupProps> = ({}) => {
  return (
    <section className="py-16 md:py-24">
      {/* Heading Section */}
      <div className="mb-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center md:space-y-8">
          <h2 className="text-4xl font-medium lg:text-5xl tracking-tight">
            Customise, tweak & Deploy
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Our UiScraper integrates directly into your browser. No separate app
            needed. Just add the extension and go.
          </p>
        </div>
      </div>
      <div className="flex flex-col h-full bg-light-5 border border-border rounded-2xl overflow-hidden">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6 flex flex-col gap-4 items-start justify-center p-8 md:p-12 lg:p-16">
            <div className="space-y-4">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                Component Sandbox
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium">
                Customise <br />
                <span className="text-muted-foreground">Components</span>
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Our extension works with every app site on your computer with no
                setup necessary. Ui Components are a click away.
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

export default SectionWithMockup;
