"use client";

import { useState } from "react";
import { ImagePlus, Type, Pipette, Bookmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import MainButton from "./MainButton";
import FeatureCards from "./FeatureCards";

interface Feature {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
  videoUrl?: string;
  demoUrl?: string;
}

const features: Feature[] = [
  {
    id: "assets",
    title: "Ready-to-Use UI Blocks",
    icon: ImagePlus,
    color: "from-purple-500 to-pink-500",
    description:
      "Browse through our extensive collection of pre-built UI blocks designed with shadcn/ui. Each block is carefully crafted to be responsive, accessible, and easily customizable. Simply copy and paste the code into your project.",
    videoUrl: "/demos/ui-blocks-demo.mp4",
    demoUrl: "https://demo.uiscraper.com/ui-blocks",
  },
  {
    id: "typography",
    title: "Tailwind CSS & TypeScript",
    icon: Type,
    color: "from-blue-500 to-cyan-500",
    description:
      "Built with modern technologies for type safety and utility-first styling. Enjoy better developer experience with IntelliSense, autocomplete, and compile-time error checking.",
    videoUrl: "/demos/typescript-demo.mp4",
    demoUrl: "https://demo.uiscraper.com/typescript",
  },
  {
    id: "colors",
    title: "Color Picker",
    icon: Pipette,
    color: "from-green-500 to-emerald-500",
    description:
      "Advanced color picking tool that works on any website. Extract colors, create palettes, and maintain a history of your selections with support for multiple color formats.",
    videoUrl: "/demos/color-picker-demo.mp4",
    demoUrl: "https://demo.uiscraper.com/color-picker",
  },
  {
    id: "bookmarks",
    title: "Bookmark Pages",
    icon: Bookmark,
    color: "from-orange-500 to-red-500",
    description:
      "Save and organize your favorite pages with powerful bookmark management. Sync across devices, create folders, and search through your collection effortlessly.",
    videoUrl: "/demos/bookmarks-demo.mp4",
    demoUrl: "https://demo.uiscraper.com/bookmarks",
  },
];

export default function FeatureSection() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  const handleFeatureSelect = (feature: (typeof features)[0]) => {
    setActiveFeature(feature);
  };

  return (
    <section className="w-full py-16 md:py-24 ">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Explore Our Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Navigate through different features using the buttons on the right
            to explore detailed information and video demos.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-6xl mx-auto">
          <FeatureCards activeFeature={activeFeature} />
          <MainButton
            features={features}
            activeFeatureId={activeFeature.id}
            onFeatureSelect={handleFeatureSelect}
          />
        </div>
      </div>
    </section>
  );
}
