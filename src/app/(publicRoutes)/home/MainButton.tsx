"use client";

import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, memo } from "react";

interface Feature {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  tag: string;
  description: string;
  imageSrc: string;
}

interface MainButtonProps {
  features: Feature[];
  activeFeatureId: string;
  onFeatureSelect: (feature: Feature) => void;
}

const MainButton = memo(function MainButton({
  features,
  activeFeatureId,
  onFeatureSelect,
}: MainButtonProps) {
  const handleFeatureClick = useCallback(
    (feature: Feature) => {
      onFeatureSelect(feature);
    },
    [onFeatureSelect]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, feature: Feature) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleFeatureClick(feature);
      }
    },
    [handleFeatureClick]
  );

  return (
    <div className="lg:order-2 flex justify-center lg:justify-start flex-row lg:flex-col gap-4">
      {/* Main Features Pill */}
      <div
        className="bg-black rounded-full shadow-2xl border border-white/15 lg:w-12 h-12 lg:h-auto w-auto max-w-xs lg:max-w-none overflow-hidden"
        role="tablist"
        aria-label="Feature navigation"
      >
        <div className="flex flex-row lg:flex-col h-full items-center">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = activeFeatureId === feature.id;
            
            return (
              <div key={feature.id} className="flex items-center h-full lg:h-auto lg:flex-col lg:w-full">
                {/* Button container with consistent sizing */}
                <div className="h-full flex items-center justify-center px-3 lg:px-0 lg:py-4">
                  <button
                    onClick={() => handleFeatureClick(feature)}
                    onKeyDown={(e) => handleKeyDown(e, feature)}
                    className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer  ${
                      isActive
                        ? "bg-white/10 text-white shadow-lg"
                        : "text-white/60 hover:text-gray-300 hover:bg-white/20"
                    }`}
                    role="tab"
                    {...(isActive ? { "aria-selected": "true" } : { "aria-selected": "false" })}
                    aria-label={`${feature.title} feature`}
                    tabIndex={0}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Separator line */}
                {index < features.length - 1 && (
                  <div
                    className="border-l border-white/10 h-5 lg:border-l-0 lg:border-t lg:border-white/10 lg:w-8 lg:h-px lg:mx-auto"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Pill */}
      <motion.div
        className="bg-black text-white rounded-full flex flex-row lg:flex-col items-center justify-between lg:w-12 lg:h-auto w-24 h-12 shadow-2xl cursor-pointer border border-white/15 overflow-hidden"
        style={{
          boxShadow:
            "0 0 15px 2px rgba(64, 93, 174, 0.6), 0 0 5px 0px rgba(64, 93, 174, 0.8)",
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        role="button"
        tabIndex={0}
        aria-label="Main action button"
      >
        <div className="flex items-center justify-center h-full lg:h-auto w-8 lg:w-full lg:py-2">
          <button
            className="w-6 h-6 flex items-center justify-center text-white  rounded-full"
            aria-label="Magic wand action"
          >
            <Wand2 size={14} color="#4169e1" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-1" aria-hidden="true">
          <div className="flex flex-row lg:flex-col gap-1">
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          </div>
          <div className="flex flex-row lg:flex-col gap-1">
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          </div>
          <div className="flex flex-row lg:flex-col gap-1">
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          </div>
        </div>

        <div className="flex items-center justify-center h-full lg:h-auto w-8 lg:w-full lg:py-2">
          <button
            className="w-6 h-6 flex items-center justify-center bg-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="UiScraper logo"
          >
            <Image
              src="/UiScraperLogo-dark.png"
              alt="UiScraper logo"
              width={20}
              height={20}
              className="rotate-45"
              aria-hidden="true"
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
});

export default MainButton;
