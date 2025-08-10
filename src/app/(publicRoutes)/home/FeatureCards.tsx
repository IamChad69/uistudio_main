"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

interface Feature {
  id: string;
  title: string;
  icon: LucideIcon;
  tag: string;
  description: string;
  imageSrc: string;
  
}

interface FeatureCardsProps {
  activeFeature: Feature;
}

export default function FeatureCards({ activeFeature }: FeatureCardsProps) {
  return (
    <div className="flex-1 max-w-5xl mx-auto lg:order-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFeature.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-sm rounded-2xl shadow-2xl border border-border  overflow-hidden bg-card text-card-foreground dark:bg-opacity-90"
        >
          <div className="flex flex-col bg-muted md:flex-row">
            {/* Left side - Image */}
            <div className={`md:w-1/2 relative min-h-[500px] p-4 overflow-hidden`}>
              {activeFeature.imageSrc ? (
                <div className="relative h-full w-full rounded-2xl  overflow-hidden">
                  <Image 
                    src={activeFeature.imageSrc} 
                    alt={activeFeature.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className={`p-8 rounded-full bg-gradient-to-br  shadow-lg`}>
                    <activeFeature.icon className="w-16 h-16 text-white" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Right side - Content */}
            <div className="md:w-1/2 p-8 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center gap-4 ">
                <activeFeature.icon className="w-6 h-6" />
                <h3 className="text-2xl font-bold">
                  {activeFeature.title}
                </h3>
              </div>
              <h4 className="text-muted-foreground font-medium uppercase tracking-wider">
                {activeFeature.tag}
              </h4>
              <p className="leading-relaxed text-muted-foreground mb-8">
                {activeFeature.description}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


