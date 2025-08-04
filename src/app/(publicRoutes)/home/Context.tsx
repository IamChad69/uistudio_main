// components/SectionWithMockup.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { VideoPlayer } from "@/components/VideoPlayer/VideoPlayer";

interface SectionWithMockupProps {}

const SectionWithMockup: React.FC<SectionWithMockupProps> = ({}) => {
  return (
    <section className="py-16 md:py-24">
      {/* Heading Section */}
      <div className="relative z-10 mx-auto max-w-xl mb-16 space-y-4 text-center md:space-y-8">
        <h2 className="text-4xl font-medium lg:text-5xl tracking-tight">
          AI that understands what you see
        </h2>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Highlight any element directly from a webpage to instantly extract its
          HTML and CSS. Our smart extraction tool ensures clean, production ready
          code extraction every time.
        </p>
      </div>

      <div className="flex flex-col h-full bg-light-5 border border-border rounded-2xl overflow-hidden">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6 flex flex-col gap-4 items-start justify-center p-8 md:p-12 lg:p-16">
            <div className="space-y-4">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                Extension
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium">
                Your context aware{" "}
                <span className="text-muted-foreground">Assistant</span>
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Our extension works with every app site on your computer with no
                setup necessary. Ui Components are a click away.
              </p>
            </div>
            <div className="border border-border rounded-full p-2 gap-2 group">
              <Link href="/" className="flex items-center justify-center gap-2">
                <span className="text-sm px-2">Add to Chrome</span>
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg"
                  alt="Chrome"
                  width={38}
                  height={38}
                  className="p-1 rounded-full hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors duration-200"
                />
              </Link>
            </div>
          </div>

          {/* Right Column - Video Demo */}
          <div className="bg-muted overflow-hidden shadow-lg h-full">
            <VideoPlayer 
              className="w-full h-full object-cover lg:aspect-auto aspect-video"
              src="https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXuuKXk5BO3qEX8zmS5D6YGluptwTFgoeNhHbK" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionWithMockup;
