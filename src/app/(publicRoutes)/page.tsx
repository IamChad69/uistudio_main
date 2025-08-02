import React from "react";
import SectionWithMockup from "./home/Context";
import { Metadata } from "next";
import { BasicLayout } from "@/components/Layouts/LandingLayout/LandingLayout";

import PricingSection from "./home/PricingSection";
import { HeroSection } from "./home/HeroSections";
import { FAQSection } from "./home/FAQSection";
import { Header } from "./home/NavBar";
import AppFeatures from "./home/AppFeatures";
import ComponentLibrary from "./home/ComponentLibrary";
import FeatureSection from "./home/FeatureSection";
import UiSandbox from "./home/UiSandbox.tsx";
import { Browser } from "./home/Browser";
import { FeatureTiles } from "./home/Features4";

export const metadata: Metadata = {
  title: "UiScraper",
  description: "UiScraper",
};

export default function HomePage() {
  return (
    <BasicLayout>
      {" "}
      <Header />
      <div className="min-h-screen mx-auto max-w-7xl px-2 lg:px-12">
        <HeroSection />
        <SectionWithMockup />
        <FeatureSection />
        <UiSandbox />
        <ComponentLibrary />
        <Browser />
        <AppFeatures />
        <FeatureTiles />
        <PricingSection />
        <FAQSection />
      </div>
    </BasicLayout>
  );
}
