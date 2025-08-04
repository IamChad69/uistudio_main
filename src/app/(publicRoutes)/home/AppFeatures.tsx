// components/SectionWithMockup.tsx
"use client";

import React from "react";
import Image from "next/image";

interface Feature {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
}

interface FeatureListProps {
  features: Feature[];
  className?: string;
}

interface FeatureItemProps {
  feature: Feature;
  index: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature, index }) => {
  const isImageLeft = feature.imagePosition === "left";
  const isEvenIndex = index % 2 === 0;
  const defaultImagePosition = isEvenIndex ? "right" : "left";
  const finalImagePosition = feature.imagePosition || defaultImagePosition;
  const isImageOnLeft = finalImagePosition === "left";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-center">
      {/* Content Section */}
      <div
        className={`p-8 md:p-12 lg:p-16 space-y-4 flex flex-col justify-center ${
          isImageOnLeft ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <h2 className="text-3xl md:text-4xl font-medium">
          {feature.title}
        </h2>
        <p className="text-base md:text-lg leading-relaxed text-white/60">
          {feature.description}
        </p>
      </div>

      {/* Image/Video Section */}
      <div
        className={`overflow-hidden h-full shadow-lg ${
          isImageOnLeft ? "lg:order-1" : "lg:order-2"
        }`}
      >
        {feature.imageUrl.endsWith(".mp4") ||
        feature.imageUrl.includes("video") ? (
          <video
            autoPlay={true}
            loop={true}
            muted={true}
            className="w-full h-full object-cover opacity-80 dark:opacity-90"
            src={feature.imageUrl}
          />
        ) : (
          <Image
            src={feature.imageUrl}
            alt={feature.imageAlt || feature.title}
            width={600}
            height={400}
            className="w-full h-full object-cover opacity-80 dark:opacity-90"
          />
        )}
      </div>
    </div>
  );
};

const FeatureList: React.FC<FeatureListProps> = ({
  features,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 rounded-2xl border border-border w-full">
        {features.map((feature, index) => (
          <FeatureItem key={feature.id} feature={feature} index={index} />
        ))}
      </div>
    </div>
  );
};

interface AppFeaturesProps {}

const AppFeatures: React.FC<AppFeaturesProps> = ({}) => {
  const features: Feature[] = [
    {
      id: "Assets",
      title: "Download website assets in seconds ",
      description:
        "Extract deeply embedded assets like background images and icons without digging through source code. Perfect for redesigns, UI inspiration, and reuse across projects. One click to download, tag, and save.",
      imageUrl: "/zoom.png",
      imagePosition: "right",
    },
    {
      id: "Font",
      title: "Instantly detect and copy font styles from any website.",
      description:
        "Identify font families, sizes, weights, colors, spacing, and more by right-clicking on any text. Copy or edit font styles inline. Great for designers, typographers, and developers who want pixel-perfect typography control.",
      imageUrl: "/font.png",
      imagePosition: "left",
    },
    {
      id: "Colors",
      title: "Extract Website Colors Instantly — HEX, RGB, HSL & More",
      description:
        "Use our Eyedropper tool to hover, click, and grab HEX, RGB, or HSL codes instantly. Zoom into exact pixels, store color history, and generate stunning gradients and palettes with CSS export. Ideal for designers, developers, and creatives working with web colors.",
      imageUrl: "/colors.png",
      imagePosition: "right",
    },
  ];

  return (
    <section className="py-8 md:py-12">
      {/* Heading Section */}
      <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center md:space-y-8 mb-16">
        <h2 className="text-4xl font-medium lg:text-5xl tracking-tight">
          Discover Dev Tools
        </h2>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Use UiScraper with powerful dev tools—crafted to streamline your
          workflow.
        </p>
      </div>

      <FeatureList features={features} />
    </section>
  );
};

export default AppFeatures;
