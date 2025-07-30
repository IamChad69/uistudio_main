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
    <div className="flex-1 lg:order-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFeature.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className=" rounded-2xl shadow-2xl border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${activeFeature.color}`}
              >
                <activeFeature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {activeFeature.title}
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {activeFeature.description}
            </p>
          </div>

          {/* Video Demo Section */}
          <div className="p-6">
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden group">
              <VideoPlayer src={activeFeature.videoUrl || ""} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                <Play className="w-4 h-4" />
                Watch Demo
              </button>
              {activeFeature.demoUrl && (
                <a
                  href={activeFeature.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Try Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="p-6 bg-white/5">
            <h4 className="text-lg font-semibold text-white mb-4">
              Key Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getFeatureHighlights(activeFeature.id).map(
                (highlight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">{highlight}</span>
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
