"use client";

import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

interface Feature {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
  videoUrl?: string;
  demoUrl?: string;
}

interface MainButtonProps {
  features: Feature[];
  activeFeatureId: string;
  onFeatureSelect: (feature: Feature) => void;
}

export default function MainButton({
  features,
  activeFeatureId,
  onFeatureSelect,
}: MainButtonProps) {
  return (
    <div className="lg:order-2 flex justify-center lg:justify-start flex-row lg:flex-col gap-4">
      {/* Main Features Pill */}
      <div
        className="bg-black rounded-full p-3 shadow-2xl border border-white/15 lg:h-fit lg:w-12 h-12 w-auto max-w-xs lg:max-w-none"
        style={{
          boxShadow:
            "0 0 15px 2px rgba(64, 93, 174, 0.6), 0 0 5px 0px rgba(64, 93, 174, 0.8)",
        }}
      >
        <div className="flex flex-row lg:flex-col gap-2 h-full lg:h-auto items-center lg:items-stretch">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = activeFeatureId === feature.id;

            return (
              <div key={feature.id} className="flex items-center lg:block">
                <motion.button
                  onClick={() => onFeatureSelect(feature)}
                  className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 group mx-auto ${
                    isActive
                      ? "bg-white text-black shadow-lg"
                      : "text-white hover:text-gray-300 hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Icon className="w-6 h-6" />

                  {/* Tooltip */}
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none lg:block hidden">
                    <div className="bg-slate-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      {feature.title}
                      <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-800" />
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-full border-2 border-gray-300"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </motion.button>

                {/* Separator line */}
                {index < features.length - 1 && (
                  <div className="w-px lg:w-full h-8 lg:h-px bg-gray-700 mx-2 lg:mx-2 my-0 lg:my-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Pill */}
      <motion.div
        className="bg-black text-white rounded-full flex flex-row lg:flex-col items-center justify-between lg:w-12 lg:h-24 w-24 h-12 shadow-2xl cursor-pointer border border-white/15 p-3 gap-0"
        style={{
          boxShadow:
            "0 0 15px 2px rgba(64, 93, 174, 0.6), 0 0 5px 0px rgba(64, 93, 174, 0.8)",
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button className="w-6 h-6 flex items-center justify-center text-white">
          <Wand2 size={16} color="#4169e1" />
        </button>

        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-1">
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          </div>
        </div>

        <button className="w-6 h-6 flex items-center justify-center bg-transparent rounded-full">
          <Image
            src={"/UiScraperLogo-dark.png"}
            alt="logo"
            width={24}
            height={24}
            className="rotate-45"
          />
        </button>
      </motion.div>
    </div>
  );
}
