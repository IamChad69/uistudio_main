// components/SectionWithMockup.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, MoveRight } from "lucide-react";

interface ComponentLibraryProps {}

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({}) => {
  return (
    <section className="py-16">
      {/* Heading Section */}
      <div className="text-center mb-16  ">
        <h2 className="font-aeonik font-medium text-center leading-tight text-3xl sm:text-4xl md:text-4xl lg:text-5xl">
          Build your own UI Library
        </h2>
        <p className="font-aeonik text-center mt-8 font-normal text-md sm:text-lg lg:text-xl  whitespace-pre-line text-landing-textGray max-w-3xl w-[80%] text-muted-foreground md:max-w-2xl mx-auto">
          Build your own organized library of components. Save, categorize, and
          tag your favorite elements for quick access and reuse across projects.
        </p>
      </div>
      <div className="flex flex-col lg:flex-row bg-light-5 border border-border border-light-10 rounded-2xl overflow-hidden">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
          {/* Left Column - Text Content */}
          <div className="space-y-6 flex flex-col gap-2 items-start justify-center p-8 py-16 xl:p-16 xl:pr-32 h-full">
            <div className="space-y-4">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                UI Library
              </span>
              <h2 className="text-4xl md:text-5xl font-bold ">
                Your personal{" "}
                <span className="text-muted-foreground">UI Library</span>
              </h2>

              <p className="text-lg text-muted-foreground max-w-md">
                Organize and reuse your favorite elements across projects.
              </p>
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

export default ComponentLibrary;
