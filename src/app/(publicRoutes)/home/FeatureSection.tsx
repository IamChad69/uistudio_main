"use client";

import { useState } from "react";
import { ImagePlus, Type, Pipette, BookmarkPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import MainButton from "./MainButton";
import FeatureCards from "./FeatureCards";

interface Feature {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  tag: string;
  description: string;
  imageSrc: string;
}

const features: Feature[] = [
  {
    id: "assets",
    title: "Asset Downloader",
    icon: ImagePlus,
    color: "from-purple-500 to-pink-500",
    tag: "Download website assets in seconds",
    description:
      "Extract deeply embedded assets like background images and icons without digging through source code. Perfect for redesigns, UI inspiration, and reuse across projects. One click to download, tag, and save.",
    imageSrc: "/asset_downloader.png",
  },
  {
    id: "typography",
    title: "Font Extractor",
    icon: Type,
    color: "from-blue-500 to-cyan-500",
    tag: "Instantly detect and copy font styles from any website.",
    description:
      "Built with modern technologies for type safety and utility-first styling. Enjoy better developer experience with IntelliSense, autocomplete, and compile-time error checking.",
    imageSrc: "/assets/images/font-extractor.png",
  },
  {
    id: "colors",
    title: "Color Picker",
    icon: Pipette,
    color: "from-green-500 to-emerald-500",
    tag: "Extract Website Colors Instantly — HEX, RGB, HSL & More",
    description:
      "Advanced color picking tool that works on any website. Extract colors, create palettes, and maintain a history of your selections with support for multiple color formats.",
    imageSrc: "/assets/images/color-picker.png",
  },
  {
    id: "bookmarks",
    title: "Bookmark Pages",
    icon: BookmarkPlus,
    color: "from-orange-500 to-red-500",
    tag: "Save & Organize Your Design Inspiration.",
    description:
      "Save and organize your favorite pages with powerful bookmark management. Sync across devices, create folders, and search through your collection effortlessly.",
    imageSrc: "/assets/images/bookmark-pages.png",
  },
];

export default function FeatureSection() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  const handleFeatureSelect = (feature: (typeof features)[0]) => {
    setActiveFeature(feature);
  };

  return (
    <section className="w-full py-16 md:py-24">
      <div className="w-full">
        <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center md:space-y-8 mb-16">
          <h2 className="text-4xl font-medium lg:text-5xl tracking-tight">
            UI Design Tools for the modern developer
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Personalised UI design tools. All using your design system. Create
            custom components and add to your code base.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center max-w-7xl mx-auto">
          
          <FeatureCards activeFeature={activeFeature}  />
          <div className="lg:order-2 mb-8 lg:mb-0">
            <MainButton
              features={features}
              activeFeatureId={activeFeature.id}
              onFeatureSelect={handleFeatureSelect}
            />
          </div>
        </div>
      </div>
    </section>
  );
}