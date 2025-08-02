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
    <section>
      {/* Heading Section */}
      <div className="text-center py-24">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Customise, tweak & Deploy
          </h2>
          <p className="text-white/60">
            Our UiScraper integrates directly into your browser. No separate app
            needed. Just add the extension and go.
          </p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row h-full bg-light-5 border border-border border-light-10 rounded-2xl overflow-hidden">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6 flex flex-col gap-2 items-start justify-center p-8 py-16 xl:p-16 xl:pr-32 h-full">
            <div className="space-y-4">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                Component Sandbox
              </span>
              <h2 className="text-4xl md:text-5xl font-bold ">
                Customise <br />
                <span className="text-muted-foreground">Components</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-md">
                Our extension works with every app site on your computer with no
                setup necessary. Ui Components are a click away.
              </p>
            </div>
            {/* Sub Features List */}
            <div className="space-y-3 ">
              {subFeatures.map((feature) => (
                <div className="flex items-center gap-3" key={feature}>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-row gap-4">
              <Link
                href="/"
                className="gap-4 flex items-center text-sm  text-muted-foreground hover:text-primary"
              >
                Start Building
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column - Video Demo */}
          <div className="bg-muted  overflow-hidden h-full shadow-lg">
            <video
              autoPlay={true}
              loop={true}
              muted={true}
              className="w-full h-full object-cover opacity-80 dark:opacity-90"
              src="https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXuuKXk5BO3qEX8zmS5D6YGluptwTFgoeNhHbK"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionWithMockup;
