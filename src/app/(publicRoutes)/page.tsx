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
import RealCostSection from "./home/RealCostSection";
import UiSandbox from "./home/UiSandbox.tsx";
import { Browser } from "./home/Browser";
import { FeatureTiles } from "./home/Features4";
import Testimonials from "./home/Testimonials";
import Howto from "./home/Howto";

export const metadata: Metadata = {
  title: "UiScraper",
  description: "UiScraper",
};

export default function HomePage() {
  return (
    <BasicLayout>
      {" "}
      <Header />
      <div className="min-h-screen mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <Howto />
        <SectionWithMockup />
        <RealCostSection />
        <FeatureSection />
        <UiSandbox />
        <ComponentLibrary />
        <Browser />
        <AppFeatures />
        <FeatureTiles />
        <PricingSection />
        <Testimonials />
        <FAQSection />
      </div>
    </BasicLayout>
  );
}
