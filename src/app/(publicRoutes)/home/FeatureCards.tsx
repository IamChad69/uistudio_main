"use client";

import { VideoPlayer } from "@/components/VideoPlayer/VideoPlayer";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
  videoUrl?: string;
  demoUrl?: string;
}

interface FeatureCardsProps {
  activeFeature: Feature;
}

export default function FeatureCards({ activeFeature }: FeatureCardsProps) {
  return (
    <div className="flex-1 max-w-3xl mx-auto lg:order-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFeature.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-sm rounded-2xl shadow-2xl border  overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 ">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`p-4 rounded-xl ${activeFeature.color} shadow-lg`}
              >
                <activeFeature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">
                {activeFeature.title}
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              {activeFeature.description}
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="p-8 bg-white/5 border-t border-gray-800">
            <h4 className="text-xl font-semibold text-white mb-6">
              Key Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFeatureHighlights(activeFeature.id).map(
                (highlight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
                    <span className="text-base">{highlight}</span>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Helper function to get feature highlights based on feature ID
function getFeatureHighlights(featureId: string): string[] {
  const highlights: { [key: string]: string[] } = {
    assets: [
      "50+ pre-built components",
      "Responsive design",
      "Accessibility compliant",
      "Easy customization",
    ],
    typography: [
      "TypeScript support",
      "Tailwind CSS integration",
      "IntelliSense support",
      "Compile-time checking",
    ],
    colors: [
      "Multiple color formats",
      "Color palette saving",
      "Works on any website",
      "Color history tracking",
    ],
    bookmarks: [
      "Unlimited bookmarks",
      "Cross-device sync",
      "Folder organization",
      "Advanced search",
    ],
  };

  return (
    highlights[featureId] || [
      "Feature highlights",
      "Coming soon",
      "Stay tuned",
      "More details",
    ]
  );
}
